'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	_ = require('lodash'),
	winston = require('winston'),
	// redis = require('redis'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

const appVersion = '0.1.0';
const appName = 'FloodMonitoringAvgDataProcessing';
const appNameWithVersion = appName + '-v' + appVersion;
const sqsQueueName = 'datoms-flood-monitoring-avg-data-process-queue';
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

AWS.config = {
	region: "ap-south-1",
	apiVersions: '2012-11-05'
};
let sqs = new AWS.SQS();
let sqs_queue = {
	QueueName: sqsQueueName
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

const process5MinAvgData = () => {
	// console.log('process15MinAvgData');
	let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 300),
		fromTime = uptoTime - 300;

	// console.log('fromTime -> ', fromTime);
	// console.log('uptoTime -> ', uptoTime);

	dataDB.query('SELECT `fms_id`, `fms_param_list` FROM `flood_monitoring_stations` WHERE fms_sub_cat_id=11', (err, results) => {
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
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_5_min_data`(`fms_id`, `fms_fmd_time`, `fms_fmd_data`) VALUES ';
					dataDB.query('SELECT tbl.fms_id, tbl.fms_rd_data FROM flood_monitoring_stations_raw_data AS tbl INNER JOIN (SELECT fms_id, MAX(fms_rd_time) max_time FROM flood_monitoring_stations_raw_data WHERE fms_rd_time < ? GROUP BY fms_id) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_rd_time = max_tbl.max_time', [fromTime], (err, last_data_results) => {
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
						});
						// console.log('lastDataResults -> ', lastDataResults);


						allStations.map((station) => {
							let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
								dataPointsOfStation = _.filter(results, {fms_id: station.id}),
								stationAvgData = {},
								lastDataPacket = (lastDataResults[station.id] && isValidJson(lastDataResults[station.id]) ? JSON.parse(lastDataResults[station.id]) : {}),
								paramLastValue = {};

							// console.log('type of station.id -> ', typeof(station.id));
							// console.log('lastDataResults[station.id] -> ', lastDataResults[station.id]);
							// console.log('isValidJson(lastDataResults[station.id].fms_rd_data) -> ', isValidJson(lastDataResults[station.id].fms_rd_data));

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

							if (Object.keys(stationAvgData).length) {
								dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\'),';
								//push to station avg. data channel in Redis
								let station_avg_data_packet = {
									token: 'Vp2DHiHwprMmrgJ9xc1CfvnMe4nxtRlGspVNyKqEwJnzFX4WLtUDGknAkByq232c',
									station_id: station.id,
									time: uptoTime,
									data: stationAvgData
								};
								// redis_client.publish('station-5-min-avg-data-channel', JSON.stringify(station_avg_data_packet));
							}
						});

						dataInsertSQL = dataInsertSQL.slice(0, -1);
						// console.log('dataInsertSQL -> ', dataInsertSQL);
						dataDB.query(dataInsertSQL, (err) => {
							if (err) {
								putToAppLog({
									type: 'error',
									message: 'Error while inserting 15 min. avg. data to DB',
									err
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
};

const process15MinAvgData = () => {
	// console.log('process15MinAvgData');
	let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 900),
		fromTime = uptoTime - 900;

	// console.log('fromTime -> ', fromTime);
	// console.log('uptoTime -> ', uptoTime);

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
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_15_min_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`) VALUES ';
					dataDB.query('SELECT tbl.fms_id, tbl.fms_rd_data FROM flood_monitoring_stations_raw_data AS tbl INNER JOIN (SELECT fms_id, MAX(fms_rd_time) max_time FROM flood_monitoring_stations_raw_data WHERE fms_rd_time < ? GROUP BY fms_id) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_rd_time = max_tbl.max_time', [fromTime], (err, last_data_results) => {
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
						});
						// console.log('lastDataResults -> ', lastDataResults);


						allStations.map((station) => {
							let parameters = (isValidJson(station.params) ? JSON.parse(station.params) : []),
								dataPointsOfStation = _.filter(results, {fms_id: station.id}),
								stationAvgData = {},
								lastDataPacket = (lastDataResults[station.id] && isValidJson(lastDataResults[station.id]) ? JSON.parse(lastDataResults[station.id]) : {}),
								paramLastValue = {};

							// console.log('type of station.id -> ', typeof(station.id));
							// console.log('lastDataResults[station.id] -> ', lastDataResults[station.id]);
							// console.log('isValidJson(lastDataResults[station.id].fms_rd_data) -> ', isValidJson(lastDataResults[station.id].fms_rd_data));

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

							if (Object.keys(stationAvgData).length) {
								dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\'),';
								//push to station avg. data channel in Redis
								let station_avg_data_packet = {
									token: 'Vp2DHiHwprMmrgJ9xc1CfvnMe4nxtRlGspVNyKqEwJnzFX4WLtUDGknAkByq232c',
									station_id: station.id,
									time: uptoTime,
									data: stationAvgData
								};
								// redis_client.publish('station-15-min-avg-data-channel', JSON.stringify(station_avg_data_packet));
							}
						});

						dataInsertSQL = dataInsertSQL.slice(0, -1);
						// console.log('dataInsertSQL -> ', dataInsertSQL);
						dataDB.query(dataInsertSQL, (err) => {
							if (err) {
								putToAppLog({
									type: 'error',
									message: 'Error while inserting 15 min. avg. data to DB',
									err
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
};

const processHourlyAvgData = () => {
	let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 1800), //here 1800 is used instead of 3600, because all calculations are being made in IST (India/Kolkata)
		fromTime = uptoTime - 3600;

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
			let allStations = results.map((result) => {
				return {id: result.fms_id, params: result.fms_param_list};
			});
			dataDB.query('SELECT `fms_id`, `fms_hd_time`, `fms_hd_data` FROM `flood_monitoring_stations_15_min_data` WHERE `fms_hd_time` > ? AND `fms_hd_time` <= ? ORDER BY `fms_hd_time` ASC', [fromTime, uptoTime], (err, results) => {
				if (err) {
					putToAppLog({
						type: 'error',
						message: 'Error fetching last hour data of the stations from DB',
						err
					});
					return;
				}
				if (results.length) {
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_hourly_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`) VALUES ';
					allStations.map((station) => {
						let stationAvgData = calculateFromAverageData(station, results);
						if (Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\'),';
							//push to station avg. data channel in Redis
							let station_avg_data_packet = {
								token: 'Vp2DHiHwprMmrgJ9xc1CfvnMe4nxtRlGspVNyKqEwJnzFX4WLtUDGknAkByq232c',
								station_id: station.id,
								time: uptoTime,
								data: stationAvgData
							};
							// redis_client.publish('station-1-hr-avg-data-channel', JSON.stringify(station_avg_data_packet));
						}
					});
					dataInsertSQL = dataInsertSQL.slice(0, -1);
					dataDB.query(dataInsertSQL, (err) => {
						if (err) {
							putToAppLog({
								type: 'error',
								message: 'Error while inserting hourly avg. data to DB',
								err
							});
						}
					});
				}
			});
		}
	});
};

const processDailyAvgData = () => {
	let currentTime = moment.tz('Asia/Kolkata').unix(),
		uptoTime = currentTime - (currentTime % 1800), //here 1800 is used instead of 3600, because all calculations are being made in IST (India/Kolkata)
		fromTime = uptoTime - 86400;

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
			let allStations = results.map((result) => {
				return {id: result.fms_id, params: result.fms_param_list};
			});
			dataDB.query('SELECT `fms_id`, `fms_hd_time`, `fms_hd_data` FROM `flood_monitoring_stations_hourly_data` WHERE `fms_hd_time` > ? AND `fms_hd_time` <= ? ORDER BY `fms_hd_time` ASC', [fromTime, uptoTime], (err, results) => {
				if (err) {
					putToAppLog({
						type: 'error',
						message: 'Error fetching last day data of the stations from DB',
						err
					});
					return;
				}
				if (results.length) {
					let lastDataResults = {};
					let dataInsertSQL = 'INSERT INTO `flood_monitoring_stations_daily_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`) VALUES ';
					allStations.map((station) => {
						let stationAvgData = calculateFromAverageData(station, results);
						if (Object.keys(stationAvgData).length) {
							dataInsertSQL += '('+ station.id +','+ uptoTime +',\''+ JSON.stringify(stationAvgData) +'\'),';
							//push to station avg. data channel in Redis
							let station_avg_data_packet = {
								token: 'Vp2DHiHwprMmrgJ9xc1CfvnMe4nxtRlGspVNyKqEwJnzFX4WLtUDGknAkByq232c',
								station_id: station.id,
								time: uptoTime,
								data: stationAvgData
							};
							// redis_client.publish('station-1-day-avg-data-channel', JSON.stringify(station_avg_data_packet));
						}
					});
					dataInsertSQL = dataInsertSQL.slice(0, -1);
					dataDB.query(dataInsertSQL, (err) => {
						if (err) {
							putToAppLog({
								type: 'error',
								message: 'Error while inserting daily avg. data to DB',
								err
							});
						}
					});
				}
			});
		}
	});
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

		sqs.createQueue(sqs_queue, (err, data) => {
			if(err) {
				putToAppLog({
					type: 'error',
					message: 'Error creating SQS Queue -> ', err
				});
				process.exit();
			}
			//get queue url
			sqs.getQueueUrl(sqs_queue, (err, data) => {
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

							if(sqsMessageData.type === '5_min') {
								process5MinAvgData();
							} else if(sqsMessageData.type === '15_min') {
								process15MinAvgData();
							} else if(sqsMessageData.type === 'hourly') {
								processHourlyAvgData();
							} else if(sqsMessageData.type === 'daily') {
								processDailyAvgData();
							}

							// delete SQS message
							deleteSQSMsg();
						}
						//fetch next message as required
						if(data.Messages && data.Messages.length) {
							retriveSQSMessage();
						} else {
							// timeout for 30 sec.
							setTimeout(retriveSQSMessage, 30000);
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
