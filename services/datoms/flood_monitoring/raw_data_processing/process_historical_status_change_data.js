'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	_ = require('lodash'),
	winston = require('winston'),
	// redis = require('redis'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

const appVersion = '0.1.0';
const appName = 'FloodMonitoringAvgDataPastProcessing';
const appNameWithVersion = appName + '-v' + appVersion;
const sqsQueueName = 'datoms-flood-monitoring-avg-data-process-queue';
const paperTrailLogHost = 'logs7.papertrailapp.com';
const paperTrailLogPort = 50092;
const timestamps = [1544812200, 1546626600];
// const timestamps = [1530556200, 1530642600];
// const timestamps = [1546626600, 1546713000];

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

/*const redis_client = redis.createClient({
	host: 'redis-13441.c11.us-east-1-3.ec2.cloud.redislabs.com',
	port: 13441,
	password: 'ixjMWFLmwP20eifuFGDGlQxQ79qEW5sc'
});
redis_client.on('error', (err) => {
	putToAppLog({
		type: 'error',
		message: 'Error in Redis Client -> ' + err
	});
});*/

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

const isValidJson = (jsonString) => {
	try {
		JSON.parse(jsonString);
	} catch (e) {
		return false;
	}
	return true;
};

const processStatusChangeData = (fromTime = timestamps[0], finalTime = timestamps[1]) => {
	console.log('processStatusChangeData');
	/*let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 900),
		fromTime = uptoTime - 900;*/
	fromTime = (fromTime - (fromTime % 1800));
	let uptoTime = (fromTime + 86400);

	console.log('fromTime -> ', fromTime);
	console.log('uptoTime -> ', uptoTime);

	if (uptoTime <= finalTime) {
		dataDB.query('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations`', (err, results) => {
			if (err) {
				putToAppLog({
					type: 'error',
					message: 'Error fetching all station IDs from DB',
					err
				});
				return;
			}
			if (results.length) {
				// console.log('results found for station');
				let allStations = results.map((result) => {
					return {id: result.fms_id, params: result.fms_param_list};
				});
				dataDB.query('SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM `flood_monitoring_stations_raw_data` WHERE `fms_rd_time` > ? AND `fms_rd_time` <= ? ORDER BY `fms_rd_time` ASC', [fromTime, uptoTime], (err, results) => {
					if (err) {
						putToAppLog({
							type: 'error',
							message: 'Error fetching last 15 min. data of the stations from DB',
							err
						});
						return;
					}
					if (results.length) {
						// console.log('results found for data');
						let lastDataResults = {},
							lastDataCaptureTime = {};
						dataDB.query('SELECT tbl.fms_id, tbl.fms_rd_time, tbl.fms_rd_data FROM flood_monitoring_stations_raw_data AS tbl INNER JOIN (SELECT fms_id, MAX(fms_rd_time) max_time FROM flood_monitoring_stations_raw_data WHERE fms_rd_time < ? GROUP BY fms_id) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_rd_time = max_tbl.max_time', [fromTime], (err, last_data_results) => {
							if(err) {
								putToAppLog({
									type: 'error',
									message: 'Error fetching prior to 15 min. data point of the stations from DB',
									err
								});
								return;
							}

							// console.log('results found for last data query');
							last_data_results.map((res) => {
								lastDataResults[res.fms_id] = res.fms_rd_data;
								lastDataCaptureTime[res.fms_id] = res.fms_rd_time;
							});
							// console.log('lastDataResults -> ', lastDataResults);


							allStations.map((station) => {
								let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
									dataPointsOfStation = _.filter(results, {fms_id: station.id}),
									lastDataPacket = (lastDataResults[station.id] && isValidJson(lastDataResults[station.id]) ? JSON.parse(lastDataResults[station.id]) : {}),
									lastDataTime = lastDataCaptureTime[station.id],
									lastParamsStatus = {},
									pumpStatusChangeSql = 'INSERT INTO flood_monitoring_stations_status_change_logs(fms_id, fms_pump_key, fms_scl_time, fms_scl_status) VALUES ',
									pumpStatusChanged = false;

								parameters.map((param) => {
									if(param.type === 'pump_status') {
										let currentStatus = 2;
										if(lastDataPacket[param.key] === 'ON') {
											currentStatus = 1;
										} else if(lastDataPacket[param.key] === 'OFF') {
											currentStatus = 0;
										}
										lastParamsStatus[param.key] = currentStatus;
									}
								});

								// console.log('station_id -> ', station.id);
								// console.log('lastDataTime -> ', lastDataTime);
								// console.log('lastParamsStatus -> ', lastParamsStatus);

								dataPointsOfStation.map((dataPoint) => {
									if (isValidJson(dataPoint.fms_rd_data)) {
										let rawData = JSON.parse(dataPoint.fms_rd_data);
										parameters.map((param) => {
											if(param.type === 'pump_status') {
												if(
													lastDataTime !== undefined 
													&& dataPoint.fms_rd_time - lastDataTime > 900
												) {
													// console.log('dataPoint.fms_rd_time -> ', dataPoint.fms_rd_time);
													// console.log('lastDataTime -> ', lastDataTime);
													// console.log('changing inside 1st loop');
													// console.log('station_id -> ', station.id);
													// console.log('time -> ', dataPoint.fms_rd_time);
													// console.log('new status -> ', 2);
													pumpStatusChangeSql += '('+ station.id +',\''+ param.key +'\','+ (lastDataTime + 60) +',2),';
													pumpStatusChanged = true;

													lastParamsStatus[param.key] = 2;
												}

												let currentStatus = 2;
												if(rawData[param.key] === 'ON') {
													currentStatus = 1;
												} else if(rawData[param.key] === 'OFF') {
													currentStatus = 0;
												}
												if(lastParamsStatus[param.key] !== currentStatus) {
													// console.log('changing inside 2nd loop');
													// console.log('station_id -> ', station.id);
													// console.log('time -> ', dataPoint.fms_rd_time);
													// console.log('new status -> ', currentStatus);
													pumpStatusChangeSql += '('+ station.id +',\''+ param.key +'\','+ dataPoint.fms_rd_time +','+ currentStatus +'),';
													pumpStatusChanged = true;
												}

												lastParamsStatus[param.key] = currentStatus;
											}
										});
										lastDataTime = dataPoint.fms_rd_time;
									}
								});

								if(pumpStatusChanged) {
									pumpStatusChangeSql = pumpStatusChangeSql.slice(0, -1);
									// console.log('pumpStatusChangeSql -> ', pumpStatusChangeSql);
									dataDB.query(pumpStatusChangeSql, (err) => {
										if (err) {
											putToAppLog({
												type: 'error',
												message: 'Error while inserting 15 min. avg. data to DB',
												err
											});
										}
									});
								}
							});
						});
					} else {
						// console.log('no results found for station');
					}
				});
			} else {
				// console.log('no results found for station');
			}
		});
		setTimeout(() => {
			processStatusChangeData(uptoTime);
		}, 30000);
	}
};

let ec2InstanceId,
	winstonPapertrail,
	appLogger;

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

		processStatusChangeData();
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of main function -> ', err
		});
	}
})();
