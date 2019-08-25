'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	_ = require('lodash'),
	semver = require('semver'),
	winston = require('winston'),
	// redis = require('redis'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

const appVersion = '0.1.0';
const appName = 'DatomsDeviceHistoricalDataProcessing';
const appNameWithVersion = appName + '-v' + appVersion;
const sqsQueueName = 'datoms-historical-data-processing-queue';
const paperTrailLogHost = 'logs7.papertrailapp.com';
const paperTrailLogPort = 27365;

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
	connectionLimit : 20,
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

const queryDb = async (sql, options) => {
	return new Promise((resolve,reject)=>{
		let query;
		if(options) {
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
		} else {
			query = dataDB.query(sql, (err, results) => {
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
		}
	});
};

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

const isValidJson = (jsonString) => {
	try {
		JSON.parse(jsonString);
	} catch (e) {
		return false;
	}
	return true;
};

const getProcessedDataForUltrasonicSensor = (paramConfig, currentValue, previousValue, previousRawValue, currentTime, lastDataUpdateTime, consecutiveDataPointsInterval) => {
	//set default surface height of ultrasonic sensor as 750 cm
	if(isNaN(parseFloat(paramConfig.surface_height))) {
		paramConfig.surface_height = 750;
	}
	currentValue = parseFloat(currentValue);
	let maxVariation = parseFloat(paramConfig.max_variation);

	/*
	* Validate Data:
	* current value is NaN or 2cm or above base height -> replace current value by base height
	*/
	if(isNaN(currentValue) || currentValue == 2 || currentValue > paramConfig.surface_height) {
		currentValue = paramConfig.surface_height;
	}

	/*
	* Apply Filter:
	* If filter is applied & max. variation is set
		* diff. from last valid value (the exact last data point if available -> within allowed time range) of sensor < max. allowed variation -> return current value
		* diff. from last valid value of sensor > max. allowed variation -> return last value
	* Else -> return current value
	*/
	if(
		paramConfig.apply_filter === true //filter should be applied
		&& !isNaN(maxVariation) //max. variation is set
		&& previousValue !== undefined //when the station has past data point to compare against
		&& lastDataUpdateTime !== undefined //the very previous data point is present
		&& currentTime - lastDataUpdateTime <= consecutiveDataPointsInterval // and the previous data point was within allowed range of consecutive data points interval, i.e. the point can be considered as the last data point of the station
		&& Math.abs(previousValue - currentValue) > maxVariation //value exceeds max. allowed variation
	) {
		return previousValue;
	} else {
		return currentValue;
	}
};

const calculateFromAverageData = (station, results) => {
	let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
		dataPointsOfStation = _.filter(results, {fms_id: station.id}),
		stationAvgData = {};

	parameters.map((param) => {
		if(param.type === 'rainfall') {
			stationAvgData[param.key] = {
				avg: 0,
				sum: 0,
				count: 0,
				unit: param.unit
			};
		} else {
			stationAvgData[param.key] = {
				avg: 0,
				sum: 0,
				count: 0,
				min: 9999,
				min_at: 0,
				max: -9999,
				max_at: 0,
				unit: param.unit
			};
		}
	});

	dataPointsOfStation.map((dataPoint) => {
		if (isValidJson(dataPoint.fms_hd_data)) {
			let avgData = JSON.parse(dataPoint.fms_hd_data);
			Object.keys(avgData).map((param) => {
				let configuredParamOfStation = _.find(parameters, {key: param});
				if(configuredParamOfStation !== undefined) {
					if(configuredParamOfStation.type === 'rainfall') {
						if (avgData[param] && !isNaN(parseFloat(avgData[param].avg))) {
							stationAvgData[param].avg += parseFloat(avgData[param].avg);
							stationAvgData[param].sum += parseFloat(avgData[param].sum);
							stationAvgData[param].count += avgData[param].count;
						}
					} else {
						stationAvgData[param].sum += avgData[param].sum;
						stationAvgData[param].count += avgData[param].count;
						if (avgData[param].min < stationAvgData[param].min) {
							stationAvgData[param].min = avgData[param].min;
							stationAvgData[param].min_at = avgData[param].min_at;
						}
						if (avgData[param].max > stationAvgData[param].max) {
							stationAvgData[param].max = avgData[param].max;
							stationAvgData[param].max_at = avgData[param].max_at;
						}
					}
				}
			});
		}
	});

	parameters.map((param) => {
		if (stationAvgData[param.key].count && param.type != 'pump_status') {
			if(param.type === 'rainfall') {
				stationAvgData[param.key].avg = (stationAvgData[param.key].avg).toFixed(3);
			} else {
				stationAvgData[param.key].avg = stationAvgData[param.key].sum / stationAvgData[param.key].count;
			}
		} else {
			delete stationAvgData[param.key];
		}
	});

	return stationAvgData;
};

const update5MinAvgDataOfStation = async (stationId, fromTime, finalTime) => {
	try {
		// console.log('update 15MinAvgData');
		let uptoTime = (fromTime + 300);

		// console.log('15 minutes stationId -> ', stationId);
		// console.log('15 minutes fromTime -> ', fromTime);
		// console.log('15 minutes uptoTime -> ', uptoTime);

		while(uptoTime <= finalTime) {
			let results = await queryDb('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations` WHERE `fms_id`=?', [stationId]);
			if(results.length) {
				// // console.log('results found for station');
				let allStations = results.map((result) => {
					return {id: result.fms_id, params: result.fms_param_list};
				});
				results = await queryDb('SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM `flood_monitoring_stations_raw_data` WHERE `fms_rd_time` > ? AND `fms_rd_time` <= ? ORDER BY `fms_rd_time` ASC', [fromTime, uptoTime]);
				if (results.length) {
					// console.log('results found for 15 min. data');
					// // console.log('results found for 15 min. data -> ', results);
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_5_min_data`(`fms_id`, `fms_fmd_time`, `fms_fmd_data`, `fms_fmd_is_historical`) VALUES ',
						dataUpdateRequired = false;
					let last_data_results = await queryDb('SELECT tbl.fms_id, tbl.fms_rd_data FROM flood_monitoring_stations_raw_data AS tbl INNER JOIN (SELECT fms_id, MAX(fms_rd_time) max_time FROM flood_monitoring_stations_raw_data WHERE fms_rd_time < ? GROUP BY fms_id) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_rd_time = max_tbl.max_time', [fromTime]);
					// // console.log('results found for last data query');
					last_data_results.map((res) => {
						lastDataResults[res.fms_id] = res.fms_rd_data;
					});
					// // console.log('lastDataResults -> ', lastDataResults);
					allStations.map((station) => {
						let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
							dataPointsOfStation = _.filter(results, {fms_id: station.id}),
							stationAvgData = {},
							lastDataPacket = (lastDataResults[station.id] && isValidJson(lastDataResults[station.id]) ? JSON.parse(lastDataResults[station.id]) : {}),
							paramLastValue = {};

						// // console.log('type of station.id -> ', typeof(station.id));
						// // console.log('type of station.id -> ', station.id);
						// // console.log('parameters -> ', parameters);
						// // console.log('lastDataResults[station.id] -> ', lastDataResults[station.id]);
						// // console.log('dataPointsOfStation -> ', dataPointsOfStation);
						// // console.log('isValidJson(lastDataResults[station.id].fms_rd_data) -> ', isValidJson(lastDataResults[station.id].fms_rd_data));

						parameters.map((param) => {
							if(param.type === 'rainfall') {
								stationAvgData[param.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									unit: param.unit
								};
								paramLastValue[param.key] = (lastDataPacket[param.key] > 0 ? lastDataPacket[param.key] : 0);
							} else {
								stationAvgData[param.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									min: 9999,
									min_at: 0,
									max: -9999,
									max_at: 0,
									unit: param.unit
								};
							}
						});
						dataPointsOfStation.map((dataPoint) => {
							if (isValidJson(dataPoint.fms_rd_data)) {
								let rawData = JSON.parse(dataPoint.fms_rd_data);
								Object.keys(rawData).map((param) => {
									let configuredParamOfStation = _.find(parameters, {key: param});
									if (configuredParamOfStation !== undefined && !isNaN(parseFloat(rawData[param]))) {
										let paramValue = parseFloat(rawData[param]);
										// // console.log('checking for station -> ', station.id);
										// // console.log('checking for param -> ', param);
										if(configuredParamOfStation.type === 'rainfall') {
											/*if (paramValue > paramLastValue[param]) {
												stationAvgData[param].avg += (paramValue - paramLastValue[param]);
											} else if (paramValue < paramLastValue[param]) {
												stationAvgData[param].avg += paramValue;
											}
											paramLastValue[param] = paramValue;*/
											stationAvgData[param].avg += paramValue;
											stationAvgData[param].count ++;
										} else {
											stationAvgData[param].sum += paramValue;
											stationAvgData[param].count ++;
											if (paramValue < stationAvgData[param].min) {
												stationAvgData[param].min = paramValue;
												stationAvgData[param].min_at = dataPoint.fms_rd_time;
											}
											if (paramValue > stationAvgData[param].max) {
												stationAvgData[param].max = paramValue;
												stationAvgData[param].max_at = dataPoint.fms_rd_time;
											}
										}
									}
								});
							}
						});
						parameters.map((param) => {
							if (stationAvgData[param.key].count && param.type != 'pump_status') {
								if(param.type === 'rainfall') {
									stationAvgData[param.key].sum = stationAvgData[param.key].avg.toFixed(3);
									stationAvgData[param.key].avg = stationAvgData[param.key].avg.toFixed(3);
								} else {
									stationAvgData[param.key].avg = stationAvgData[param.key].sum / stationAvgData[param.key].count;
								}
							} else {
								delete stationAvgData[param.key];
							}
						});
						if(Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ stationId +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\',1),';
							dataUpdateRequired = true;
						}
					});

					dataInsertSQL = dataInsertSQL.slice(0, -1);
					// // console.log('dataInsertSQL -> ', dataInsertSQL);
					if(dataUpdateRequired) {
						//delete old data points of the station
						await queryDb('DELETE FROM flood_monitoring_stations_5_min_data WHERE fms_id=? AND fms_fmd_time=?', [stationId, uptoTime]);
						await queryDb(dataInsertSQL);
					}
				}
			}

			fromTime = uptoTime;
			uptoTime = fromTime + 300;
		}
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while updating 5 minute avg. values of stations in DB'+ err
		});
		// console.log('Error in catch -> ', err);
	}
};

const update15MinAvgDataOfStation = async (stationId, fromTime, finalTime) => {
	try {
		// console.log('update 15MinAvgData');
		let uptoTime = (fromTime + 900);

		// console.log('15 minutes stationId -> ', stationId);
		// console.log('15 minutes fromTime -> ', fromTime);
		// console.log('15 minutes uptoTime -> ', uptoTime);

		while(uptoTime <= finalTime) {
			let results = await queryDb('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations` WHERE `fms_id`=?', [stationId]);
			if(results.length) {
				// // console.log('results found for station');
				let allStations = results.map((result) => {
					return {id: result.fms_id, params: result.fms_param_list};
				});
				results = await queryDb('SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM `flood_monitoring_stations_raw_data` WHERE `fms_rd_time` > ? AND `fms_rd_time` <= ? ORDER BY `fms_rd_time` ASC', [fromTime, uptoTime]);
				if (results.length) {
					// console.log('results found for 15 min. data');
					// // console.log('results found for 15 min. data -> ', results);
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_15_min_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`, `fms_hd_is_historical`) VALUES ',
						dataUpdateRequired = false;
					let last_data_results = await queryDb('SELECT tbl.fms_id, tbl.fms_rd_data FROM flood_monitoring_stations_raw_data AS tbl INNER JOIN (SELECT fms_id, MAX(fms_rd_time) max_time FROM flood_monitoring_stations_raw_data WHERE fms_rd_time < ? GROUP BY fms_id) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_rd_time = max_tbl.max_time', [fromTime]);
					// // console.log('results found for last data query');
					last_data_results.map((res) => {
						lastDataResults[res.fms_id] = res.fms_rd_data;
					});
					// // console.log('lastDataResults -> ', lastDataResults);
					allStations.map((station) => {
						let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
							dataPointsOfStation = _.filter(results, {fms_id: station.id}),
							stationAvgData = {},
							lastDataPacket = (lastDataResults[station.id] && isValidJson(lastDataResults[station.id]) ? JSON.parse(lastDataResults[station.id]) : {}),
							paramLastValue = {};

						// // console.log('type of station.id -> ', typeof(station.id));
						// // console.log('type of station.id -> ', station.id);
						// // console.log('parameters -> ', parameters);
						// // console.log('lastDataResults[station.id] -> ', lastDataResults[station.id]);
						// // console.log('dataPointsOfStation -> ', dataPointsOfStation);
						// // console.log('isValidJson(lastDataResults[station.id].fms_rd_data) -> ', isValidJson(lastDataResults[station.id].fms_rd_data));

						parameters.map((param) => {
							if(param.type === 'rainfall') {
								stationAvgData[param.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									unit: param.unit
								};
								paramLastValue[param.key] = (lastDataPacket[param.key] > 0 ? lastDataPacket[param.key] : 0);
							} else {
								stationAvgData[param.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									min: 9999,
									min_at: 0,
									max: -9999,
									max_at: 0,
									unit: param.unit
								};
							}
						});
						dataPointsOfStation.map((dataPoint) => {
							if (isValidJson(dataPoint.fms_rd_data)) {
								let rawData = JSON.parse(dataPoint.fms_rd_data);
								Object.keys(rawData).map((param) => {
									let configuredParamOfStation = _.find(parameters, {key: param});
									if (configuredParamOfStation !== undefined && !isNaN(parseFloat(rawData[param]))) {
										let paramValue = parseFloat(rawData[param]);
										// // console.log('checking for station -> ', station.id);
										// // console.log('checking for param -> ', param);
										if(configuredParamOfStation.type === 'rainfall') {
											/*if (paramValue > paramLastValue[param]) {
												stationAvgData[param].avg += (paramValue - paramLastValue[param]);
											} else if (paramValue < paramLastValue[param]) {
												stationAvgData[param].avg += paramValue;
											}
											paramLastValue[param] = paramValue;*/
											stationAvgData[param].avg += paramValue;
											stationAvgData[param].count ++;
										} else {
											stationAvgData[param].sum += paramValue;
											stationAvgData[param].count ++;
											if (paramValue < stationAvgData[param].min) {
												stationAvgData[param].min = paramValue;
												stationAvgData[param].min_at = dataPoint.fms_rd_time;
											}
											if (paramValue > stationAvgData[param].max) {
												stationAvgData[param].max = paramValue;
												stationAvgData[param].max_at = dataPoint.fms_rd_time;
											}
										}
									}
								});
							}
						});
						parameters.map((param) => {
							if (stationAvgData[param.key].count && param.type != 'pump_status') {
								if(param.type === 'rainfall') {
									stationAvgData[param.key].sum = stationAvgData[param.key].avg.toFixed(3);
									stationAvgData[param.key].avg = stationAvgData[param.key].avg.toFixed(3);
								} else {
									stationAvgData[param.key].avg = stationAvgData[param.key].sum / stationAvgData[param.key].count;
								}
							} else {
								delete stationAvgData[param.key];
							}
						});
						if(Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ stationId +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\',1),';
							dataUpdateRequired = true;
						}
					});

					dataInsertSQL = dataInsertSQL.slice(0, -1);
					// // console.log('dataInsertSQL -> ', dataInsertSQL);
					if(dataUpdateRequired) {
						//delete old data points of the station
						await queryDb('DELETE FROM flood_monitoring_stations_15_min_data WHERE fms_id=? AND fms_hd_time=?', [stationId, uptoTime]);
						await queryDb(dataInsertSQL);
					}
				}
			}

			fromTime = uptoTime;
			uptoTime = fromTime + 900;
		}
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while updating 15 minute avg. values of stations in DB'+ err
		});
		// console.log('Error in catch -> ', err);
	}
};

const updateHourlyAvgDataOfStation = async (stationId, fromTime, finalTime) => {
	try {
		// console.log('update HourlyAvgData');
		let uptoTime = (fromTime + 3600);

		// console.log('1 Hr stationId -> ', stationId);
		// console.log('1 Hr fromTime -> ', fromTime);
		// console.log('1 Hr uptoTime -> ', uptoTime);

		while(uptoTime <= finalTime) {
			let results = await queryDb('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations` WHERE `fms_id`=?', [stationId]);
			if(results.length) {
				let allStations = results.map((result) => {
					return {id: result.fms_id, params: result.fms_param_list};
				});
				results = await queryDb('SELECT `fms_id`, `fms_hd_time`, `fms_hd_data` FROM `flood_monitoring_stations_15_min_data` WHERE `fms_hd_time` > ? AND `fms_hd_time` <= ? ORDER BY `fms_hd_time` ASC', [fromTime, uptoTime]);
				if(results.length) {
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_hourly_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`, `fms_hd_is_historical`) VALUES ',
						dataUpdateRequired = false;
					allStations.map((station) => {
						let stationAvgData = calculateFromAverageData(station, results);
						if (Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\',1),';
							dataUpdateRequired = true;
						}
					});
					dataInsertSQL = dataInsertSQL.slice(0, -1);
					if(dataUpdateRequired) {
						//delete old data points of the station
						await queryDb('DELETE FROM flood_monitoring_stations_hourly_data WHERE fms_id=? AND fms_hd_time=?', [stationId, uptoTime]);
						await queryDb(dataInsertSQL);
					}
				}
			}

			fromTime = uptoTime;
			uptoTime = fromTime + 3600;
		}
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while updating 1 Hr. avg. values of stations in DB'+ err
		});
		// console.log('Error in catch -> ', err);
	}
};

const updateDailyAvgDataOfStation = async (stationId, fromTime, finalTime) => {
	try {
		// console.log('update DailyAvgData');
		let uptoTime = (fromTime + 86400);

		// console.log('1 Day stationId -> ', stationId);
		// console.log('1 Day fromTime -> ', fromTime);
		// console.log('1 Day uptoTime -> ', uptoTime);

		while(uptoTime <= finalTime) {
			let results = await queryDb('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations` WHERE `fms_id`=?', [stationId]);
			if(results.length) {
				let allStations = results.map((result) => {
					return {id: result.fms_id, params: result.fms_param_list};
				});
				results = await queryDb('SELECT `fms_id`, `fms_hd_time`, `fms_hd_data` FROM `flood_monitoring_stations_hourly_data` WHERE `fms_hd_time` > ? AND `fms_hd_time` <= ? ORDER BY `fms_hd_time` ASC', [fromTime, uptoTime]);
				if(results.length) {
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_daily_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`, `fms_hd_is_historical`) VALUES ',
						dataUpdateRequired = false;
					allStations.map((station) => {
						let stationAvgData = calculateFromAverageData(station, results);
						if (Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\',1),';
							dataUpdateRequired = true;
						}
					});
					dataInsertSQL = dataInsertSQL.slice(0, -1);
					if(dataUpdateRequired) {
						//delete old data points of the station
						await queryDb('DELETE FROM flood_monitoring_stations_daily_data WHERE fms_id=? AND fms_hd_time=?', [stationId, uptoTime]);
						await queryDb(dataInsertSQL);
					}
				}
			}

			fromTime = uptoTime;
			uptoTime = fromTime + 86400;
		}
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while updating 1 Day avg. values of stations in DB'+ err
		});
		// console.log('Error in catch -> ', err);
	}
};

const updateDataOfStation = async (dataPacket, stationDetails, fetchDataOfStationUptoTime) => {
	try {
		// console.log('Updating data of station -> ', JSON.stringify(stationDetails));
		let dataPacketFromDevice = dataPacket.data_packet,
			currentDataTime = moment.tz(dataPacketFromDevice.message.d +' '+ dataPacketFromDevice.message.t, 'DD-MM-YYYY HH:mm:ss', 'Asia/Kolkata').unix(),
			currentDataTimeMoment = moment.tz(dataPacketFromDevice.message.d +' '+ dataPacketFromDevice.message.t, 'DD-MM-YYYY HH:mm:ss', 'Asia/Kolkata'),
			fetchDataOfStationUptoTimeMoment = moment.unix(fetchDataOfStationUptoTime).tz('Asia/Kolkata'),
			currentServerTime = moment.tz('Asia/Kolkata').unix();

		// console.log('currentDataTime -> ', currentDataTime);
		// console.log('fetchDataOfStationUptoTime -> ', fetchDataOfStationUptoTime);

		//fetch data point of the station prior to this data point for comparision purpose
		let stationLastDataPointDBResults = await queryDb('SELECT fms_rd_time, fms_rd_data FROM flood_monitoring_stations_raw_data WHERE fms_id=? AND fms_rd_time<? ORDER BY fms_rd_time DESC LIMIT 1', [stationDetails.id, currentDataTime]);
		let stationLastUnporcessedDataPointDBResults = await queryDb('SELECT fms_upd_time, fms_upd_data FROM flood_monitoring_stations_unprocessed_data WHERE fms_id=? AND fms_upd_time<? ORDER BY fms_upd_time DESC LIMIT 1', [stationDetails.id, currentDataTime]);
		let stationLastDataTime = 0,
			stationLastDataPoint = {},
			stationLastUnprocessedDataPoint = {};
		if(
			stationLastDataPointDBResults.length
			&& isValidJson(stationLastDataPointDBResults[0].fms_rd_data)
			&& JSON.parse(stationLastDataPointDBResults[0].fms_rd_data)
		) {
			stationLastDataTime = stationLastDataPointDBResults[0].fms_rd_time;
			stationLastDataPoint = JSON.parse(stationLastDataPointDBResults[0].fms_rd_data);
		}
		if(
			stationLastUnporcessedDataPointDBResults.length
			&& isValidJson(stationLastUnporcessedDataPointDBResults[0].fms_upd_data)
		) {
			stationLastUnprocessedDataPoint = JSON.parse(stationLastUnporcessedDataPointDBResults[0].fms_upd_data);
		}
		// console.log('stationLastDataTime -> ', stationLastDataTime);
		// console.log('stationLastDataPoint -> ', stationLastDataPoint);

		//update data points as applicable for the specific station sub-category / type
		if(
			stationDetails.sub_cat_id == 1
			|| stationDetails.sub_cat_id == 2
			|| stationDetails.sub_cat_id == 7
		) {
			// console.log('street device found');
			// Major Road Junction
			// Street / Shop / House Front
			// Street
			// simply insert a data point for the station (for raw data) against the time at which the data point is received from the device
			// edit corresponding 15 min., 1 hr. & 1 day avg. data points if applicable

			//insert raw data for station
			let stationRawDataPacket = {},
				stationUnprocessedDataPacket = {};
			stationDetails.param_details.map((paramDetail) => {
				if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
					stationUnprocessedDataPacket[paramDetail.key] = dataPacketFromDevice.message.dp[paramDetail.key];
					if(['dust_pm_2_5', 'dust_pm_10', 'temperature', 'humidity', 'street_water_level'].indexOf(paramDetail.type) >= 0) {
						if(paramDetail.type === 'street_water_level') {
							stationRawDataPacket[paramDetail.key] = getProcessedDataForUltrasonicSensor(
								paramDetail,
								dataPacketFromDevice.message.dp[paramDetail.key],
								stationLastDataPoint[paramDetail.key],
								stationLastUnprocessedDataPoint[paramDetail.key],
								currentDataTime,
								stationLastDataTime,
								2100 /* 35 mins */
							);
						} else {
							stationRawDataPacket[paramDetail.key] = dataPacketFromDevice.message.dp[paramDetail.key];
						}
						//adjust temp. by -3 degree
						if(paramDetail.type === 'temperature' && stationRawDataPacket[paramDetail.key] > 3) {
							stationRawDataPacket[paramDetail.key] = (stationRawDataPacket[paramDetail.key] - 3).toFixed(2);
						}
					}
				}
			});
			// console.log('stationRawDataPacket -> ', stationRawDataPacket);
			await queryDb('INSERT INTO flood_monitoring_stations_raw_data(fms_id, fms_rd_time, fms_rd_data, fms_rd_is_historical) VALUES (?,?,?,1); INSERT INTO flood_monitoring_stations_unprocessed_data(fms_id, fms_upd_time, fms_upd_data, fms_upd_is_historical) VALUES (?,?,?,1)', [stationDetails.id, currentDataTime, JSON.stringify(stationRawDataPacket), stationDetails.id, currentDataTime, JSON.stringify(stationUnprocessedDataPacket)]);

			//make all param values float to calculate avg.
			Object.keys(stationRawDataPacket).map((param) => {
				stationRawDataPacket[param] = parseFloat(stationRawDataPacket[param]);
			});

			//update 15 min. avg. data if applicable
			let uptoTimeFor15MinsAvgData = currentDataTime + 900 - (currentDataTime % 900);
			if(uptoTimeFor15MinsAvgData < currentServerTime) {
				let station15MinAvgData = await queryDb('SELECT fms_hd_data FROM flood_monitoring_stations_15_min_data WHERE fms_id=? AND fms_hd_time=?', [stationDetails.id, uptoTimeFor15MinsAvgData]);
				let station15MinAvgDataPacket = {};
				// console.log('station15MinAvgData.length -> ', station15MinAvgData.length);
				if(station15MinAvgData.length) {
					station15MinAvgDataPacket = (isValidJson(station15MinAvgData[0].fms_hd_data) ? (JSON.parse(station15MinAvgData[0].fms_hd_data) ? JSON.parse(station15MinAvgData[0].fms_hd_data) : {}) : {});
					// console.log('station15MinAvgDataPacket -> ', station15MinAvgData[0].fms_hd_data);
					// console.log('station15MinAvgDataPacket -> ', station15MinAvgDataPacket);
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							if(station15MinAvgDataPacket[paramDetail.key] === undefined) {
								// console.log('undefined -> ', paramDetail.key);
								station15MinAvgDataPacket[paramDetail.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									min: 9999,
									min_at: 0,
									max: -9999,
									max_at: 0,
									unit: paramDetail.unit
								};
								// console.log('avg. data -> ', station15MinAvgDataPacket[paramDetail.key]);
							}
							station15MinAvgDataPacket[paramDetail.key].count ++;
							station15MinAvgDataPacket[paramDetail.key].sum += stationRawDataPacket[paramDetail.key];
							station15MinAvgDataPacket[paramDetail.key].avg = (station15MinAvgDataPacket[paramDetail.key].sum / station15MinAvgDataPacket[paramDetail.key].count);
							if(stationRawDataPacket[paramDetail.key] < station15MinAvgDataPacket[paramDetail.key].min) {
								station15MinAvgDataPacket[paramDetail.key].min = stationRawDataPacket[paramDetail.key];
								station15MinAvgDataPacket[paramDetail.key].min_at = currentDataTime;
							}
							if(stationRawDataPacket[paramDetail.key] > station15MinAvgDataPacket[paramDetail.key].max) {
								station15MinAvgDataPacket[paramDetail.key].max = stationRawDataPacket[paramDetail.key];
								station15MinAvgDataPacket[paramDetail.key].max_at = currentDataTime;
							}
						}
					});
					// console.log('station15MinAvgDataPacket -> ', station15MinAvgDataPacket);
					await queryDb('UPDATE flood_monitoring_stations_15_min_data SET fms_hd_data=?, fms_hd_is_historical=? WHERE fms_id=? AND fms_hd_time=?', [JSON.stringify(station15MinAvgDataPacket), 1, stationDetails.id, uptoTimeFor15MinsAvgData]);
				} else {
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							station15MinAvgDataPacket[paramDetail.key] = {
								avg: stationRawDataPacket[paramDetail.key],
								sum: stationRawDataPacket[paramDetail.key],
								count: 1,
								min: stationRawDataPacket[paramDetail.key],
								min_at: currentDataTime,
								max: stationRawDataPacket[paramDetail.key],
								max_at: currentDataTime,
								unit: paramDetail.unit
							};
						}
					});
					await queryDb('INSERT INTO flood_monitoring_stations_15_min_data(fms_id, fms_hd_time, fms_hd_data, fms_hd_is_historical) VALUES (?,?,?,1)', [stationDetails.id, uptoTimeFor15MinsAvgData, JSON.stringify(station15MinAvgDataPacket)]);
				}
			}

			//update 1 hr. avg. data if applicable
			let uptoTimeFor1HrAvgData = currentDataTimeMoment.minute() || currentDataTimeMoment.second() || currentDataTimeMoment.millisecond() ? currentDataTimeMoment.add(1, 'hour').startOf('hour') : currentDataTimeMoment.startOf('hour');
			uptoTimeFor1HrAvgData = uptoTimeFor1HrAvgData.unix();
			if(uptoTimeFor1HrAvgData < currentServerTime) {
				let station1HrAvgData = await queryDb('SELECT fms_hd_data FROM flood_monitoring_stations_hourly_data WHERE fms_id=? AND fms_hd_time=?', [stationDetails.id, uptoTimeFor1HrAvgData]);
				let station1HrAvgDataPacket = {};
				// console.log('station1HrAvgData.length -> ', station1HrAvgData.length);
				if(station1HrAvgData.length) {
					station1HrAvgDataPacket = (isValidJson(station1HrAvgData[0].fms_hd_data) ? (JSON.parse(station1HrAvgData[0].fms_hd_data) ? JSON.parse(station1HrAvgData[0].fms_hd_data) : {}) : {});
					// console.log('station1HrAvgDataPacket -> ', station1HrAvgData[0].fms_hd_data);
					// console.log('station1HrAvgDataPacket -> ', station1HrAvgDataPacket);
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							if(station1HrAvgDataPacket[paramDetail.key] === undefined) {
								// console.log('undefined -> ', paramDetail.key);
								station1HrAvgDataPacket[paramDetail.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									min: 9999,
									min_at: 0,
									max: -9999,
									max_at: 0,
									unit: paramDetail.unit
								};
								// console.log('avg. data -> ', station1HrAvgDataPacket[paramDetail.key]);
							}
							station1HrAvgDataPacket[paramDetail.key].count ++;
							station1HrAvgDataPacket[paramDetail.key].sum += stationRawDataPacket[paramDetail.key];
							station1HrAvgDataPacket[paramDetail.key].avg = (station1HrAvgDataPacket[paramDetail.key].sum / station1HrAvgDataPacket[paramDetail.key].count);
							if(stationRawDataPacket[paramDetail.key] < station1HrAvgDataPacket[paramDetail.key].min) {
								station1HrAvgDataPacket[paramDetail.key].min = stationRawDataPacket[paramDetail.key];
								station1HrAvgDataPacket[paramDetail.key].min_at = currentDataTime;
							}
							if(stationRawDataPacket[paramDetail.key] > station1HrAvgDataPacket[paramDetail.key].max) {
								station1HrAvgDataPacket[paramDetail.key].max = stationRawDataPacket[paramDetail.key];
								station1HrAvgDataPacket[paramDetail.key].max_at = currentDataTime;
							}
						}
					});
					// console.log('station1HrAvgDataPacket -> ', station1HrAvgDataPacket);
					await queryDb('UPDATE flood_monitoring_stations_hourly_data SET fms_hd_data=?, fms_hd_is_historical=? WHERE fms_id=? AND fms_hd_time=?', [JSON.stringify(station1HrAvgDataPacket), 1, stationDetails.id, uptoTimeFor1HrAvgData]);
				} else {
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							station1HrAvgDataPacket[paramDetail.key] = {
								avg: stationRawDataPacket[paramDetail.key],
								sum: stationRawDataPacket[paramDetail.key],
								count: 1,
								min: stationRawDataPacket[paramDetail.key],
								min_at: currentDataTime,
								max: stationRawDataPacket[paramDetail.key],
								max_at: currentDataTime,
								unit: paramDetail.unit
							};
						}
					});
					await queryDb('INSERT INTO flood_monitoring_stations_hourly_data(fms_id, fms_hd_time, fms_hd_data, fms_hd_is_historical) VALUES (?,?,?,1)', [stationDetails.id, uptoTimeFor1HrAvgData, JSON.stringify(station1HrAvgDataPacket)]);
				}
			}

			//update 1 day avg. data if applicable
			let uptoTimeFor1DayAvgData = currentDataTimeMoment.hours() || currentDataTimeMoment.minute() || currentDataTimeMoment.second() || currentDataTimeMoment.millisecond() ? currentDataTimeMoment.add(1, 'day').startOf('day') : currentDataTimeMoment.startOf('day');
			uptoTimeFor1DayAvgData = uptoTimeFor1DayAvgData.unix();
			if(uptoTimeFor1DayAvgData < currentServerTime) {
				let station1DayAvgData = await queryDb('SELECT fms_hd_data FROM flood_monitoring_stations_daily_data WHERE fms_id=? AND fms_hd_time=?', [stationDetails.id, uptoTimeFor1DayAvgData]);
				let station1DayAvgDataPacket = {};
				// console.log('station1DayAvgData.length -> ', station1DayAvgData.length);
				if(station1DayAvgData.length) {
					station1DayAvgDataPacket = (isValidJson(station1DayAvgData[0].fms_hd_data) ? (JSON.parse(station1DayAvgData[0].fms_hd_data) ? JSON.parse(station1DayAvgData[0].fms_hd_data) : {}) : {});
					// console.log('station1DayAvgDataPacket -> ', station1DayAvgData[0].fms_hd_data);
					// console.log('station1DayAvgDataPacket -> ', station1DayAvgDataPacket);
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							if(station1DayAvgDataPacket[paramDetail.key] === undefined) {
								// console.log('undefined -> ', paramDetail.key);
								station1DayAvgDataPacket[paramDetail.key] = {
									avg: 0,
									sum: 0,
									count: 0,
									min: 9999,
									min_at: 0,
									max: -9999,
									max_at: 0,
									unit: paramDetail.unit
								};
								// console.log('avg. data -> ', station1DayAvgDataPacket[paramDetail.key]);
							}
							station1DayAvgDataPacket[paramDetail.key].count ++;
							station1DayAvgDataPacket[paramDetail.key].sum += stationRawDataPacket[paramDetail.key];
							station1DayAvgDataPacket[paramDetail.key].avg = (station1DayAvgDataPacket[paramDetail.key].sum / station1DayAvgDataPacket[paramDetail.key].count);
							if(stationRawDataPacket[paramDetail.key] < station1DayAvgDataPacket[paramDetail.key].min) {
								station1DayAvgDataPacket[paramDetail.key].min = stationRawDataPacket[paramDetail.key];
								station1DayAvgDataPacket[paramDetail.key].min_at = currentDataTime;
							}
							if(stationRawDataPacket[paramDetail.key] > station1DayAvgDataPacket[paramDetail.key].max) {
								station1DayAvgDataPacket[paramDetail.key].max = stationRawDataPacket[paramDetail.key];
								station1DayAvgDataPacket[paramDetail.key].max_at = currentDataTime;
							}
						}
					});
					// console.log('station1DayAvgDataPacket -> ', station1DayAvgDataPacket);
					await queryDb('UPDATE flood_monitoring_stations_daily_data SET fms_hd_data=?, fms_hd_is_historical=? WHERE fms_id=? AND fms_hd_time=?', [JSON.stringify(station1DayAvgDataPacket), 1, stationDetails.id, uptoTimeFor1DayAvgData]);
				} else {
					stationDetails.param_details.map((paramDetail) => {
						if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
							station1DayAvgDataPacket[paramDetail.key] = {
								avg: stationRawDataPacket[paramDetail.key],
								sum: stationRawDataPacket[paramDetail.key],
								count: 1,
								min: stationRawDataPacket[paramDetail.key],
								min_at: currentDataTime,
								max: stationRawDataPacket[paramDetail.key],
								max_at: currentDataTime,
								unit: paramDetail.unit
							};
						}
					});
					await queryDb('INSERT INTO flood_monitoring_stations_daily_data(fms_id, fms_hd_time, fms_hd_data, fms_hd_is_historical) VALUES (?,?,?,1)', [stationDetails.id, uptoTimeFor1DayAvgData, JSON.stringify(station1DayAvgDataPacket)]);
				}
			}
		} else {
			// console.log('other than street stations found, per minute data to be inserted');
			//fetch the data points of the station between the data point time and next applicable time
			let rawDataPointsOfStationToUpdate = await queryDb('SELECT fms_rd_time, fms_rd_data FROM flood_monitoring_stations_raw_data WHERE fms_id=? AND fms_rd_time>? AND fms_rd_time<?', [stationDetails.id, currentDataTime, fetchDataOfStationUptoTime]);
			let unprocessedDataPointsOfStationToUpdate = await queryDb('SELECT fms_upd_time, fms_upd_data FROM flood_monitoring_stations_unprocessed_data WHERE fms_id=? AND fms_upd_time>? AND fms_upd_time<?', [stationDetails.id, currentDataTime, fetchDataOfStationUptoTime]);
			// console.log('rawDataPointsOfStationToUpdate -> ', JSON.stringify(rawDataPointsOfStationToUpdate));
			let currentStationDataTime = currentDataTime;
			while(currentStationDataTime <= (fetchDataOfStationUptoTime-60)) {
				let dataPointOfStation = _.find(rawDataPointsOfStationToUpdate, (o) => o.fms_rd_time >= currentStationDataTime && o.fms_rd_time <= (currentStationDataTime+60));
				let unprocessedDataPointOfStation = _.find(unprocessedDataPointsOfStationToUpdate, (o) => o.fms_upd_time >= currentStationDataTime && o.fms_upd_time <= (currentStationDataTime+60));
				// let dataPointOfStation = [];
				let currentDataTimeOfStation = currentStationDataTime,
					currentDataPacketOfStation = {},
					currentUnprocessedDataPacketOfStation = {};
				if(dataPointOfStation) {
					//data point of staion found - update it
					currentDataTimeOfStation = dataPointOfStation.fms_rd_time;
					currentDataPacketOfStation = (isValidJson(dataPointOfStation.fms_rd_data) ? (JSON.parse(dataPointOfStation.fms_rd_data) ? JSON.parse(dataPointOfStation.fms_rd_data) : {}) : {});
					currentUnprocessedDataPacketOfStation = (isValidJson(unprocessedDataPointOfStation.fms_upd_data) ? (JSON.parse(unprocessedDataPointOfStation.fms_upd_data) ? JSON.parse(unprocessedDataPointOfStation.fms_upd_data) : {}) : {});
				} else {
					//data point of station not found - insert it - nothing to do here
				}

				//prepare the current data packet of the station
				stationDetails.param_details.map((paramDetail) => {
					if(dataPacketFromDevice.message.dp[paramDetail.key] !== undefined) {
						currentUnprocessedDataPacketOfStation[paramDetail.key] = dataPacketFromDevice.message.dp[paramDetail.key];
						if(paramDetail.type === 'pump_status' && paramDetail.upper_limit && paramDetail.upper_limit !== '') {
							if(
								parseFloat(dataPacketFromDevice.message.dp[paramDetail.key]) > parseFloat(paramDetail.upper_limit)
							) {
								currentDataPacketOfStation[paramDetail.key] = 'ON';
							} else {
								currentDataPacketOfStation[paramDetail.key] = 'OFF';
							}
						} else if(paramDetail.type === 'sump_level') {
							currentDataPacketOfStation[paramDetail.key] = getProcessedDataForUltrasonicSensor(
								paramDetail,
								dataPacketFromDevice.message.dp[paramDetail.key],
								stationLastDataPoint[paramDetail.key],
								stationLastUnprocessedDataPoint[paramDetail.key],
								currentDataTimeOfStation,
								stationLastDataTime,
								300 /* 5 mins */
							);
						} else if(paramDetail.type === 'penstock_level') {
							currentDataPacketOfStation[paramDetail.key] = getProcessedDataForUltrasonicSensor(
								paramDetail,
								dataPacketFromDevice.message.dp[paramDetail.key],
								stationLastDataPoint[paramDetail.key],
								stationLastUnprocessedDataPoint[paramDetail.key],
								currentDataTimeOfStation,
								stationLastDataTime,
								300 /* 5 mins */
							);
						} else if(paramDetail.type === 'open_canal_water_level') {
							currentDataPacketOfStation[paramDetail.key] = getProcessedDataForUltrasonicSensor(
								paramDetail,
								dataPacketFromDevice.message.dp[paramDetail.key],
								stationLastDataPoint[paramDetail.key],
								stationLastUnprocessedDataPoint[paramDetail.key],
								currentDataTimeOfStation,
								stationLastDataTime,
								300 /* 5 mins */
							);
						} else if(paramDetail.type === 'rainfall') {
							let deviceFirmware = dataPacketFromDevice.message.dp.debug.fw_ver,
								deviceHasOldFirmWare = true;
							if(
								semver.valid(deviceFirmware)
								&& semver.gte(deviceFirmware, '3.2.0')
							) {
								deviceHasOldFirmWare = false;
							}
							let paramValue;
							if(deviceHasOldFirmWare) {
								let currentRainfallValue = parseFloat(dataPacketFromDevice.message.dp[paramDetail.key]),
									lastRainfallValue = parseFloat(stationLastUnprocessedDataPoint[paramDetail.key]);
								if(currentRainfallValue > lastRainfallValue) {
									paramValue = ((currentRainfallValue - lastRainfallValue) * 25.4).toFixed(4);
								} else if(currentRainfallValue < lastRainfallValue) {
									paramValue = (currentRainfallValue * 25.4).toFixed(4);
								} else {
									paramValue = 0;
								}
							} else {
								paramValue = (dataPacketFromDevice.message.dp[paramDetail.key] * 10).toFixed(4);
							}
							currentDataPacketOfStation[paramDetail.key] = paramValue;
						} else {
							currentDataPacketOfStation[paramDetail.key] = dataPacketFromDevice.message.dp[paramDetail.key];
						}
					}
				});
				// console.log('currentDataPacketOfStation -> ', currentDataPacketOfStation);

				//update / insert into DB
				if(dataPointOfStation) {
					//data point of staion found - update it
					await queryDb('UPDATE flood_monitoring_stations_raw_data SET fms_rd_data=?, fms_rd_is_historical=1 WHERE fms_id=? AND fms_rd_time=?; UPDATE flood_monitoring_stations_unprocessed_data SET fms_upd_data=?, fms_upd_is_historical=1 WHERE fms_id=? AND fms_upd_time=?', [JSON.stringify(currentDataPacketOfStation), stationDetails.id, currentDataTimeOfStation, JSON.stringify(currentUnprocessedDataPacketOfStation), stationDetails.id, currentDataTimeOfStation]);
					console.log('update data of station -> ', stationDetails.id);
					console.log('time -> ', currentDataTimeOfStation);
					console.log('data -> ', JSON.stringify(currentDataPacketOfStation));
				} else {
					//data point of station not found - insert it
					await queryDb('INSERT INTO flood_monitoring_stations_raw_data(fms_id, fms_rd_time, fms_rd_data, fms_rd_is_historical) VALUES (?,?,?,1); INSERT INTO flood_monitoring_stations_unprocessed_data(fms_id, fms_upd_time, fms_upd_data, fms_upd_is_historical) VALUES (?,?,?,1)', [stationDetails.id, currentDataTimeOfStation, JSON.stringify(currentDataPacketOfStation), stationDetails.id, currentDataTimeOfStation, JSON.stringify(currentUnprocessedDataPacketOfStation)]);

					//push into rawDataPointsOfStationToUpdate for use in further calculations
					rawDataPointsOfStationToUpdate.push({
						fms_rd_time: currentDataTimeOfStation,
						fms_rd_data: JSON.stringify(currentDataPacketOfStation)
					});
					console.log('insert data for station -> ', stationDetails.id);
					console.log('time -> ', currentDataTimeOfStation);
					console.log('data -> ', JSON.stringify(currentDataPacketOfStation));
				}

				//reset last data point of the station
				stationLastDataTime = currentDataTimeOfStation;
				stationLastDataPoint = currentDataPacketOfStation;
				stationLastUnprocessedDataPoint = currentUnprocessedDataPacketOfStation;

				currentStationDataTime += 60; //iterate for every minute
			}

			//if pump stations are present then update the status change log
			if(
				stationDetails.sub_cat_id == 4
				|| stationDetails.sub_cat_id == 12
			) {
				// console.log('Pump status data found');
				//delete all the old logs within the interval and insert new ones
				await queryDb('DELETE FROM flood_monitoring_stations_status_change_logs WHERE fms_id=? AND fms_scl_time>? AND fms_scl_time<?', [stationDetails.id, currentDataTime, fetchDataOfStationUptoTime]);
				//select next data point of station if available for comparision purpose
				let stationNextDataPoint = await queryDb('SELECT fms_rd_time, fms_rd_data FROM flood_monitoring_stations_raw_data WHERE fms_id=? AND fms_rd_time>? AND fms_rd_time<=? ORDER BY fms_rd_time ASC LIMIT 1', [stationDetails.id, fetchDataOfStationUptoTime, fetchDataOfStationUptoTime+60]);
				if(stationNextDataPoint.length) {
					rawDataPointsOfStationToUpdate.push({
						fms_rd_time: stationNextDataPoint[0].fms_rd_time,
						fms_rd_data: stationNextDataPoint[0].fms_rd_data
					});
				}
				let pumpStatusChangeSql = 'INSERT INTO flood_monitoring_stations_status_change_logs(fms_id, fms_pump_key, fms_scl_time, fms_scl_status, fms_scl_is_historical) VALUES ',
					pumpStatusChanged = false,
					stationPumpsLastStatus = {};
				stationDetails.param_details.map((paramDetail) => {
					if(paramDetail.type === 'pump_status') {
						stationPumpsLastStatus[paramDetail.key] = 9999;
					}
				});
				rawDataPointsOfStationToUpdate.map((dataPoint) => {
					let stationCurrentData = (isValidJson(dataPoint.fms_rd_data) ? (JSON.parse(dataPoint.fms_rd_data) ? JSON.parse(dataPoint.fms_rd_data) : {}) : {});
					stationDetails.param_details.map((paramDetail) => {
						if(paramDetail.type === 'pump_status') {
							let currentStatus = 2;
							if(stationCurrentData[paramDetail.key] === 'ON') {
								currentStatus = 1;
							} else if(stationCurrentData[paramDetail.key] === 'OFF') {
								currentStatus = 0;
							}
							if(stationPumpsLastStatus[paramDetail.key] !== currentStatus) {
								// console.log('Pump status changed in loop -> ', stationDetails.id +' pump -> '+ paramDetail.key +'time -> '+ dataPoint.fms_rd_time);
								pumpStatusChangeSql += '('+ stationDetails.id +',\''+ paramDetail.key +'\','+ dataPoint.fms_rd_time +','+ currentStatus +',1),';
								pumpStatusChanged = true;
							}
							stationPumpsLastStatus[paramDetail.key] = currentStatus;
						}
					});
				});
				//mark status as 2 (data not present) if no data found for the station within next 1 minute
				if(!stationNextDataPoint.length) {
					stationDetails.param_details.map((paramDetail) => {
						if(paramDetail.type === 'pump_status') {
							// console.log('Pump status changed in loop -> ', stationDetails.id +' pump -> '+ paramDetail.key +'time -> '+ (fetchDataOfStationUptoTime+60));
							pumpStatusChangeSql += '('+ stationDetails.id +',\''+ paramDetail.key +'\','+ (fetchDataOfStationUptoTime+60) +',2,1),';
							pumpStatusChanged = true;
						}
					});
				}
				if(pumpStatusChanged) {
					pumpStatusChangeSql = pumpStatusChangeSql.slice(0, -1);
					// console.log('Pump status change SQL -> ', pumpStatusChangeSql);
					await queryDb(pumpStatusChangeSql);
				}
			}

			//update 5 min. avg. data for required intervals if applicable
			if(stationDetails.sub_cat_id == 11) {
				let uptoTimeFor5MinsAvgDataForCurrentDataTime = currentDataTime + 300 - (currentDataTime % 300);
				if(uptoTimeFor5MinsAvgDataForCurrentDataTime < currentServerTime) {
					let uptoTimeFor5MinsAvgDataForFetchDataOfStationUptoTime = fetchDataOfStationUptoTime + 300 - (fetchDataOfStationUptoTime % 300);
					let uptoTimeFor5MinsAvgDataForCurrentServerTime = currentServerTime - (currentServerTime % 300);
					let finalUptoTimeFor5MinsAvgDataUpdate = uptoTimeFor5MinsAvgDataForFetchDataOfStationUptoTime;
					if(uptoTimeFor5MinsAvgDataForCurrentServerTime < uptoTimeFor5MinsAvgDataForFetchDataOfStationUptoTime) {
						finalUptoTimeFor5MinsAvgDataUpdate = uptoTimeFor5MinsAvgDataForCurrentServerTime;
					}
					await update5MinAvgDataOfStation(stationDetails.id, (uptoTimeFor5MinsAvgDataForCurrentDataTime-300), finalUptoTimeFor5MinsAvgDataUpdate);
				}
			}

			//update 15 min. avg. data for required intervals if applicable
			let uptoTimeFor15MinsAvgDataForCurrentDataTime = currentDataTime + 900 - (currentDataTime % 900);
			if(uptoTimeFor15MinsAvgDataForCurrentDataTime < currentServerTime) {
				await update15MinAvgDataOfStation(stationDetails.id, (uptoTimeFor15MinsAvgDataForCurrentDataTime-900), uptoTimeFor15MinsAvgDataForCurrentDataTime);
			}
			let uptoTimeFor15MinsAvgDataForFetchDataOfStationUptoTime = fetchDataOfStationUptoTime + 900 - (fetchDataOfStationUptoTime % 900);
			if(
				uptoTimeFor15MinsAvgDataForFetchDataOfStationUptoTime < currentServerTime
				&& uptoTimeFor15MinsAvgDataForFetchDataOfStationUptoTime !== uptoTimeFor15MinsAvgDataForCurrentDataTime
			) {
				await update15MinAvgDataOfStation(stationDetails.id, (uptoTimeFor15MinsAvgDataForFetchDataOfStationUptoTime-900), uptoTimeFor15MinsAvgDataForFetchDataOfStationUptoTime);
			}

			//update 1 hr. avg. data for required intervals if applicable
			let uptoTimeFor1HrAvgDataForCurrentDataTime = currentDataTimeMoment.minute() || currentDataTimeMoment.second() || currentDataTimeMoment.millisecond() ? currentDataTimeMoment.add(1, 'hour').startOf('hour') : currentDataTimeMoment.startOf('hour');
			uptoTimeFor1HrAvgDataForCurrentDataTime = uptoTimeFor1HrAvgDataForCurrentDataTime.tz('Asia/Kolkata').unix();
			if(uptoTimeFor1HrAvgDataForCurrentDataTime < currentServerTime) {
				await updateHourlyAvgDataOfStation(stationDetails.id, (uptoTimeFor1HrAvgDataForCurrentDataTime-3600), uptoTimeFor1HrAvgDataForCurrentDataTime);
			}
			let uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime = fetchDataOfStationUptoTimeMoment.minute() || fetchDataOfStationUptoTimeMoment.second() || fetchDataOfStationUptoTimeMoment.millisecond() ? fetchDataOfStationUptoTimeMoment.add(1, 'hour').startOf('hour') : fetchDataOfStationUptoTimeMoment.startOf('hour');
			uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime = uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime.tz('Asia/Kolkata').unix();
			if(
				uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime < currentServerTime
				&& uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime !== uptoTimeFor1HrAvgDataForCurrentDataTime
			) {
				await updateHourlyAvgDataOfStation(stationDetails.id, (uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime-3600), uptoTimeFor1HrAvgDataForFetchDataOfStationUptoTime);
			}

			//update 1 day avg. data for required intervals if applicable
			let uptoTimeFor1DayAvgDataForCurrentDataTime =  currentDataTimeMoment.hours() || currentDataTimeMoment.minute() || currentDataTimeMoment.second() || currentDataTimeMoment.millisecond() ? currentDataTimeMoment.add(1, 'day').startOf('day') : currentDataTimeMoment.startOf('day');
			uptoTimeFor1DayAvgDataForCurrentDataTime = uptoTimeFor1DayAvgDataForCurrentDataTime.tz('Asia/Kolkata').unix();
			if(uptoTimeFor1DayAvgDataForCurrentDataTime < currentServerTime) {
				await updateDailyAvgDataOfStation(stationDetails.id, (uptoTimeFor1DayAvgDataForCurrentDataTime-86400), uptoTimeFor1DayAvgDataForCurrentDataTime);
			}
			let uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime =  fetchDataOfStationUptoTimeMoment.hours() || fetchDataOfStationUptoTimeMoment.minute() || fetchDataOfStationUptoTimeMoment.second() || fetchDataOfStationUptoTimeMoment.millisecond() ? fetchDataOfStationUptoTimeMoment.add(1, 'day').startOf('day') : fetchDataOfStationUptoTimeMoment.startOf('day');
			uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime = uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime.tz('Asia/Kolkata').unix();
			if(
				uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime < currentServerTime
				&& uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime !== uptoTimeFor1DayAvgDataForCurrentDataTime
			) {
				await updateDailyAvgDataOfStation(stationDetails.id, (uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime-86400), uptoTimeFor1DayAvgDataForFetchDataOfStationUptoTime);
			}
		}
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while processing data -> '+ err
		});
		// console.log('error -> ', err);
	}
};

const processDeviceHistoricalData = async (dataPacket) => {
	try {
		// console.log('Processing data -> ', JSON.stringify(dataPacket));
		let currentServerTime = moment.tz('Asia/Kolkata').unix();
		//proceed only if valid data packet is received
		if(
			!dataPacket.device_id
			|| !dataPacket.data_receive_server_time
			|| !dataPacket.data_packet
			|| dataPacket.data_receive_server_time > currentServerTime //ensures the data point is not of wrongly captured future data
		) {
			putToAppLog({
				type: 'error',
				message: 'Wrong packet received for processing -> '+ JSON.stringify(dataPacket)
			});
			return;
		}
		//fetch all stations to check if the device is associated with any stations
		let allStations = await queryDb('SELECT fms_id, fms_sub_cat_id, fms_param_list FROM flood_monitoring_stations');
		let associatedStations = [];
		allStations.map((result) => {
			let stationParamDetails = (isValidJson(result.fms_param_list) ? (JSON.parse(result.fms_param_list) ? JSON.parse(result.fms_param_list) : []) : []);
			stationParamDetails.map((paramDetails) => {
				if(paramDetails.device_id == dataPacket.device_id) {
					if(_.find(associatedStations, {id: result.fms_id}) === undefined) {
						associatedStations.push({
							id: result.fms_id,
							sub_cat_id: result.fms_sub_cat_id,
							param_details: stationParamDetails
						});
					}
				}
			});
		});

		// console.log('associatedStations -> ', JSON.stringify(associatedStations));

		//proceed only if the device is associated with any stations
		if(associatedStations.length) {
			let dataPacketFromDevice = dataPacket.data_packet,
				currentDataTime = moment.tz(dataPacketFromDevice.message.d + ' ' + dataPacketFromDevice.message.t, 'DD-MM-YYYY HH:mm:ss', 'Asia/Kolkata').unix();
			//fetch the very next data point of the device (if any)
			//'deviceNextDataPoint' is calculated here instead of for each station in order to avoid multiple DB queries
			let deviceNextDataPoint = await queryDb('SELECT idata_time FROM iot_data WHERE idev_id=? AND idata_time>? ORDER BY idata_time ASC LIMIT 1', [dataPacket.device_id, currentDataTime]);
			let fetchDataOfStationUptoTime = currentDataTime + 900; //current data time + 15 minutes
			//ensure that the data point is not a very recent one so that it ends up creating new data points for the station in future
			if(fetchDataOfStationUptoTime > currentServerTime) {
				fetchDataOfStationUptoTime = currentServerTime;
			}
			if(deviceNextDataPoint.length) {
				if(
					!isNaN(deviceNextDataPoint[0].idata_time)
					&& deviceNextDataPoint[0].idata_time
					&& deviceNextDataPoint[0].idata_time < fetchDataOfStationUptoTime //ensure that the data point is not a very recent one so that it ends up creating new data points for the station in future
				) {
					fetchDataOfStationUptoTime = deviceNextDataPoint[0].idata_time;
				}
			}

			// console.log('fetchDataOfStationUptoTime -> ', fetchDataOfStationUptoTime);

			let stationDataUpdates = associatedStations.map(async (station) => {
				await updateDataOfStation(dataPacket, station, fetchDataOfStationUptoTime);
			});

			await Promise.all(stationDataUpdates);
		} else {
			putToAppLog({
				type: 'info',
				message: 'No associated station for data -> '+ JSON.stringify(dataPacket)
			});
		}

		/*return new Promise((resolve, reject) => {
		});*/
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error while processing data -> '+ err
		});
	}
};

//function to delete sqs message
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
	/*return new Promise((resolve, reject) => {
		// console.log('deleting message');
		setTimeout(() => {
			// console.log('deleted');
			resolve();
		}, 50);
	});*/
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
		await processDeviceHistoricalData(sqsMessageData);

		//delete SQS message
		await deleteSQSMsg(sqsMessagesRetrieved.Messages[0].ReceiptHandle);

		//fetch next message as required
		checkAndProcessNextMessageFromSQS();
	} else {
		// console.log('No messages found. Retrying after 30 secs ...');
		// timeout for 5 mins
		setTimeout(checkAndProcessNextMessageFromSQS, 300000);
	}
};

AWS.config = {
	region: "ap-south-1",
	apiVersions: '2012-11-05'
};
let sqs = new AWS.SQS();

let ec2InstanceId,
	winstonPapertrail,
	appLogger,
	sqsQueueUrl;

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

		sqsQueueUrl = await getSQSQueueUrl(sqsQueueName);

		//script initiated successfully
		putToAppLog({
			type: 'error',
			message: 'Datoms Device Historical Data Processing Script started',
			restart: true
		});

		checkAndProcessNextMessageFromSQS();
	} catch(err) {
		putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of main function -> '+ err
		});
	}
})();
