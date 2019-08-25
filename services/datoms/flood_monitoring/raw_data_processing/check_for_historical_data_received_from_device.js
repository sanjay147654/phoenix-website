'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	winston = require('winston'),
	// redis = require('redis'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

const appVersion = '0.1.0';
const appName = 'DatomsCheckForHistoricalDataReceivedFromDevice';
const appNameWithVersion = appName + '-v' + appVersion;
const sqsTriggerQueueName = 'datoms-historical-data-processing-trigger-queue';
const sqsDataQueueName = 'datoms-historical-data-processing-queue';
const paperTrailLogHost = 'logs7.papertrailapp.com';
const paperTrailLogPort = 50092;

require('winston-papertrail').Papertrail;

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
	connectionLimit : 5,
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

const getSQSQueueUrl = async (queName) => {
	let sqsQueue = {
		QueueName: queName
	};
	return new Promise((resolve, reject) => {
		sqs.createQueue(sqsQueue, (err, data) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error creating SQS Queue -> ', err
				});
				reject();
				process.exit();
			}
			//get queue url
			sqs.getQueueUrl(sqsQueue, (err, data) => {
				if (err) {
					putToAppLog({
						type: 'error',
						message: 'Error fetching SQS Queue url -> ', err
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

const isValidJson = (jsonString) => {
	try {
		JSON.parse(jsonString);
	} catch (e) {
		return false;
	}
	return true;
};

const checkHistoricalDataFromDevice = () => {
	let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 1800), //here 1800 is used instead of 3600, because all calculations are being made in IST (India/Kolkata)
		fromTime = uptoTime - 3600;
	// console.log('fetching data points');
	dataDB.query('SELECT idev_id, idrd_time, idrd_data FROM iot_device_raw_data WHERE idrd_time >=? AND idrd_time <=?', [parseInt(fromTime*1000), parseInt(uptoTime*1000)], (err, results) => {
		if(err) {
			putToAppLog({
				type: 'error',
				message: 'Error fetching raw data of last hour from DB -> ', err
			});
		}

		// console.log('received data points -> ', results.length);
		results.map((result) => {
			let dataPacket = (isValidJson(result.idrd_data) ? (JSON.parse(result.idrd_data) ? JSON.parse(result.idrd_data) : {}) : {});
			if(dataPacket.type === 'data' && dataPacket.message && dataPacket.message.h && dataPacket.message.h == 1) {
				//push to SQS
				// console.log('Found historical data');
				let messageDetails = {
					MessageBody: JSON.stringify({
						device_id: result.idev_id,
						data_receive_server_time: parseInt(result.idrd_time / 1000),
						data_packet: dataPacket
					}),
					QueueUrl: sqsDataQueueUrl
				};
				sqs.sendMessage(messageDetails, (err, data) => {
					if(err) {
						putToAppLog({
							type: 'error',
							message: 'Error pushing data packet to SQS. Data Packet -> '+ messageDetails +' -> Error -> ', err
						});
					}
				});
			}
		});
		// console.log('checked all data points');
	});
};

AWS.config = {
	region: "ap-south-1",
	apiVersions: '2012-11-05'
};
let sqs = new AWS.SQS();
let sqsTriggerQueue = {
	QueueName: sqsTriggerQueueName
};

let ec2InstanceId,
	winstonPapertrail,
	appLogger,
	sqsDataQueueUrl;

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

		sqsDataQueueUrl = await getSQSQueueUrl(sqsDataQueueName);

		sqs.createQueue(sqsTriggerQueue, (err, data) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error creating SQS Queue -> ', err
				});
				process.exit();
			}
			//get queue url
			sqs.getQueueUrl(sqsTriggerQueue, (err, data) => {
				if (err) {
					putToAppLog({
						type: 'error',
						message: 'Error fetching SQS Queue url -> ', err
					});
					process.exit();
				}
				//script initiated successfully
				putToAppLog({
					type: 'error',
					message: 'Datoms Flood Monitoring Avg. Data Processing Script started',
					restart: true
				});
				//get a message from queue
				let message_from_queue = {
					QueueUrl: data.QueueUrl,
					MaxNumberOfMessages: 1
				};
				// get messages
				let retriveSQSMessage = () => {
					sqs.receiveMessage(message_from_queue, (err, data) => {
						if(err) {
							putToAppLog({
								type: 'error',
								message: 'Error fetching SQS Queue url -> ', err
							});
							return;
						}
						//process any messages if found
						if(data.Messages && data.Messages.length) {
							//message received
							//function to delete sqs message
							let deleteSQSMsg = () => {
								//object for msg delete
								let msg_to_be_delete = {
									QueueUrl : message_from_queue.QueueUrl,
									ReceiptHandle : data.Messages[0].ReceiptHandle
								};
								// console.log('msg_to_be_delete', msg_to_be_delete);
								sqs.deleteMessage(msg_to_be_delete, (err, data) => {
									if (err) {
										// console.log('sqs_delete_msg_err', err);
								 	} else {
								 		// console.log('sqs_msg_deleted', data);
								 	}
								});
							};

							//process data
							let sqsMessageData = (isValidJson(data.Messages[0].Body) ? JSON.parse(data.Messages[0].Body) : {});

							//Demo SQS Message Format
							/*{
								"type": "15_min / hourly / daily"
							}*/

							checkHistoricalDataFromDevice();

							// delete SQS message
							deleteSQSMsg();
						}
						//fetch next message as required
						if(data.Messages && data.Messages.length) {
							retriveSQSMessage();
						} else {
							// timeout for 5 minutes
							setTimeout(retriveSQSMessage, 300000);
						}
					});
				};
				retriveSQSMessage();
			});
		});
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of main function -> ', err
		});
	}
})();
