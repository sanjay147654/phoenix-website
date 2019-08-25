'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	fs = require('fs'),
	_ = require('lodash'),
	createCsvWriter = require('csv-writer').createObjectCsvWriter,
	ftp = require('ftp'),
	winston = require('winston'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

require('winston-papertrail').Papertrail;

const appVersion = '0.1.0';
const appName = 'FloodMonitoringDataPushToINRMFtp';
const appNameWithVersion = appName + '-v' + appVersion;
const paperTrailLogHost = 'logs7.papertrailapp.com';
const paperTrailLogPort = 50092;
const sqsQueueName = 'datoms-flood-monitoring-data-push-to-inrm';
const ftpHost = 'inrm.co.in';
const ftpUserName = 'kflooddata';
const ftpPassword = 'kFlood@87a';

//initialize the console logger
let winstonConsole = new winston.transports.Console({
	level: 'silly',
	stderrLevels: ['error', 'warn'],
	colorize: true
});
let consoleLogger = new winston.Logger({
	transports: [
		winstonConsole
	]
});

/*
 * {
 * 		type: 'Winston error levels -> error, warn, info, verbose, debug, silly', (Default: 'info')
 * 		message: 'Error message', (Required -> nothing is logged if not specified)
 * 		includeTimestamp: true / false, (Default: true)
 * 		restart: true / false (true denotes script restart)
 * }
 */
const putToAppLog = (logData) => {
	//check for required variables
	if(logData.message === undefined) {
		putToAppLog({
			type: 'warn',
			message: 'Invalid message received to put to App Log -> message -> '+ JSON.stringify(logData)
		});
		return;
	}

	//set deafult values for parameters
	if(logData.type === undefined) {
		logData.type = 'info';
	}
	if(logData.includeTimestamp === undefined) {
		logData.includeTimestamp = true;
	}

	//add timestamp to message if required in GMT+5:30 format
	if(logData.includeTimestamp) {
		logData.message = 'At ' + moment.tz('Asia/Kolkata').format('HH:mm:ss, DD MMM YYYY') + ' -> ' + logData.message;
	}

	//log to papertrail
	appLogger.log(logData.type, logData.message);

	//log error messages to MySQL
	if(logData.type === 'error' || logData.type === 'warn') {
		dataDB.query('INSERT INTO iot_server_application_error_log(isael_application, isael_server_id, isael_time, isael_err_type, isael_details) VALUES (?,?,?,?,?)', [appNameWithVersion, ec2InstanceId, moment.tz('Asia/Kolkata').valueOf(), (logData.restart ? 'restart' : logData.type), logData.message], (err) => {
			if(err) {
				consoleLogger.log('error', 'Error while putting App Log to DB -> Log Data -> '+ JSON.stringify(logData) +' -> Error -> '+ JSON.stringify(err));
			}
		});
	}
};

const dataDB = mysql.createPool({
	connectionLimit : 40,
	host     		: dbAccess.data_db.host,
	user     		: dbAccess.data_db.user,
	password 		: dbAccess.data_db.password,
	database 		: dbAccess.data_db.database,
	multipleStatements: true
});
dataDB.on('error', (err) => {
	putToAppLog({
		type: 'error',
		message: 'Error in MySQL connection pool -> '+ JSON.stringify(err)
	});
});

const ec2Metadata  = new AWS.MetadataService();
const getEC2InstanceId = () => {
	return new Promise((resolve, reject) => {
		ec2Metadata.request('/latest/meta-data/instance-id', (err, data) => {
			if(!err) {
				resolve(data);
			} else {
				consoleLogger.log('error', 'Error fetching EC2 instance ID -> ', JSON.stringify(err));
				reject();
				process.exit();
			}
		});
	});
};

const queryDb = async (sql, options) => {
	if(options === undefined) {
		options = [];
	}
	return new Promise((resolve, reject) => {
		let query;
		query = dataDB.query(sql, options, (err, results) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error fetching station details from DB, Query -> '+ query.sql +' -> Error -> '+ err
				});
				// console.log('Error fetching station details from DB, Query -> '+ query.sql);
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
};

const getSQSQueueUrl = async (queueName) => {
	let sqsQueue = {
		QueueName: queueName
	};
	return new Promise((resolve, reject) => {
		sqs.createQueue(sqsQueue, (err, data) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error creating SQS Queue -> '+ err
				});
				reject();
				process.exit();
			}
			//get queue url
			sqs.getQueueUrl(sqsQueue, (err, data) => {
				if (err) {
					putToAppLog({
						type: 'error',
						message: 'Error fetching SQS Queue url -> '+ err
					});
					reject();
					process.exit();
				} else {
					resolve(data.QueueUrl);
				}
			});
		});
	});
};

let retrieveSQSMessage = async (queueUrl, maxNumberOfMessagesToFetch) => {
	let sqsMessageRetrieveOptions = {
		QueueUrl: queueUrl,
		MaxNumberOfMessages: maxNumberOfMessagesToFetch
	};
	return new Promise((resolve, reject) => {
		sqs.receiveMessage(sqsMessageRetrieveOptions, (err, data) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error fetching message from SQS -> '+ err
				});
				reject();
			} else {
				resolve(data);
			}
		});
	});
};

const deleteSQSMsg = async (dataReceiptHandle) => {
	// console.log('deleting message');
	//object for msg delete
	let messageToDelete = {
		QueueUrl : sqsQueueUrl,
		ReceiptHandle : dataReceiptHandle
	};
	return new Promise((resolve, reject) => {
		sqs.deleteMessage(messageToDelete, (err, data) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

const isValidJson = (jsonString) => {
	try {
		JSON.parse(jsonString);
	} catch (e) {
		return false;
	}
	return true;
};

const getValidJSON = (jsonString, defaultValue = {}) => {
	if(isValidJson(jsonString) && JSON.parse(jsonString)) {
		return JSON.parse(jsonString);
	} else {
		return defaultValue;
	}
};

const getRandomValue = (min, max) => {
	return Math.random() * (max - min) + min;
};

const uploadFileToFtp = async (localFileName, remoteFileName) => {
	return new Promise((resolve, reject) => {
		let ftpClient = new ftp();
		ftpClient.on('ready', () => {
			ftpClient.put(localFileName, remoteFileName, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
				ftpClient.end();
				fs.unlink(localFileName, (err) => {});
			});
		});
		// connect to ftp
		ftpClient.connect({
			host: ftpHost,
			secure: true,
			user: ftpUserName,
			password: ftpPassword,
			secureOptions: { rejectUnauthorized: false}
		});
	});
}

AWS.config = {
	region: "ap-south-1",
	apiVersions: '2012-11-05'
};
let sqs = new AWS.SQS();

let ec2InstanceId,
	winstonPapertrail,
	appLogger,
	sqsQueueUrl;

const pushDataToINRMFtp = async (receivedData) => {
	try {
		let stations = await queryDb('SELECT fms_id, fms_name, fms_sub_cat_id FROM flood_monitoring_stations WHERE clep_id=365 AND fms_sub_cat_id IN (11)');
		let currentMoment = moment.tz('Asia/Kolkata'),
			fromTime,
			uptoTime
			/*fromTime = 1560504600,
			uptoTime = 1560573000*/;
		if(currentMoment.hours() === 10) {
			fromTime = moment(currentMoment).subtract(1, 'day').set({'hour': 15, 'minute': 0, 'second': 0, 'millisecond': 0}).unix();
			uptoTime = moment(currentMoment).set({'hour': 10, 'minute': 0, 'second': 0, 'millisecond': 0}).unix();
		} else {
			fromTime = moment(currentMoment).set({'hour': 10, 'minute': 0, 'second': 0, 'millisecond': 0}).unix();
			uptoTime = moment(currentMoment).set({'hour': 15, 'minute': 0, 'second': 0, 'millisecond': 0}).unix();
		}
		/*putToAppLog({
			type: 'info',
			message: 'stations count -> '+ stations.length
		});*/
		let dataOfStations = await queryDb('SELECT fms_id, fms_hd_time, fms_hd_data FROM flood_monitoring_stations_15_min_data WHERE fms_hd_time > ? AND fms_hd_time <= ?', [fromTime, uptoTime]);
		/*putToAppLog({
			type: 'info',
			message: 'dataOfStations count -> '+ dataOfStations.length
		});*/
		stations.map((station) => {
			let stationId = station.fms_id,
				stationName = station.fms_name;
			let dataPointsOfStation = _.filter(dataOfStations, { 'fms_id': stationId });
			/*putToAppLog({
				type: 'info',
				message: 'dataPointsOfStation count -> '+ dataPointsOfStation.length
			});*/
			let fileName = stationName +'_'+ moment.unix(uptoTime).tz('Asia/Kolkata').format('DDMMMYYYY_HHmm') +'.csv',
				localFileName = './files/'+ fileName;
			/*putToAppLog({
				type: 'info',
				message: 'localFileName -> '+ localFileName
			});*/
			if(station.fms_sub_cat_id == 11) {
				/*putToAppLog({
					type: 'info',
					message: 'inside rainfall'
				});*/
				let csvWriter = createCsvWriter({
					path: localFileName,
					header: [
						{id: 'station_name', title: 'Station_Name'},
						{id: 'date', title: 'Date'},
						{id: 'time', title: 'Time'},
						{id: 'rainfall', title: 'Rainfall_mm'}
					]
				});
				let csvData = [];
				dataPointsOfStation.map((dataPoint) => {
					let avgData = getValidJSON(dataPoint.fms_hd_data);
					csvData.push({
						station_name: stationName,
						date: moment.unix(dataPoint.fms_hd_time).tz('Asia/Kolkata').format('DDMMMYYYY'),
						time: moment.unix(dataPoint.fms_hd_time).tz('Asia/Kolkata').format('HH:mm'),
						rainfall: (avgData.rain !== undefined && !isNaN(avgData.rain.avg) ? avgData.rain.avg : 0)
					});
				});
				/*putToAppLog({
					type: 'info',
					message: 'csvData count -> '+ csvData.length
				});*/
				csvWriter.writeRecords(csvData)
				.then(async () => {
					/*putToAppLog({
						type: 'info',
						message: 'file successfully written to local disk.'
					});*/
					await uploadFileToFtp(localFileName, '/Rainfall/'+ fileName);
					// await uploadFileToFtp(localFileName, '/Canal/'+ fileName);
				});
			}
		});
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of pushDataToINRMFtp function -> '+ err
		});
	}
};

const checkAndProcessNextMessageFromSQS = async () => {
	// console.log('checking for next message from SQS');
	// get messages
	let sqsMessagesRetrieved = await retrieveSQSMessage(sqsQueueUrl, 1);
	//process any messages if found
	if(sqsMessagesRetrieved.Messages && sqsMessagesRetrieved.Messages.length) {
		//message received
		let sqsMessageData = (isValidJson(sqsMessagesRetrieved.Messages[0].Body) ? JSON.parse(sqsMessagesRetrieved.Messages[0].Body) : {});

		//process data
		console.log('processing message from SQS');
		console.log('sqsMessageData -> ', sqsMessageData);
		await pushDataToINRMFtp(sqsMessageData);

		//delete SQS message
		await deleteSQSMsg(sqsMessagesRetrieved.Messages[0].ReceiptHandle);

		//fetch next message as required
		checkAndProcessNextMessageFromSQS();
	} else {
		// console.log('No messages found. Retrying after 1 min. ...');
		setTimeout(checkAndProcessNextMessageFromSQS, 60000);
	}
};

const main = (async () => {
	try {
		//get ec2InstanceId
		ec2InstanceId = await getEC2InstanceId();

		//initialize Winston Papertrail logger
		//requires ec2InstanceId
		winstonPapertrail = new winston.transports.Papertrail({
			host: paperTrailLogHost,
			port: paperTrailLogPort,
			hostname: ec2InstanceId,
			program: appNameWithVersion,
			colorize: true
		});
		appLogger = new winston.Logger({
			transports: [
				winstonPapertrail
			]
		});

		//receive messages from SQS
		sqsQueueUrl = await getSQSQueueUrl(sqsQueueName);
		checkAndProcessNextMessageFromSQS();
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of main function -> '+ err
		});
	}
})();
