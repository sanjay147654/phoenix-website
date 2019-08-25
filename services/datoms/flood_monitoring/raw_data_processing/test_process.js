'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	kafka = require('node-rdkafka'),
	_ = require('lodash'),
	semver = require('semver'),
	redis = require('redis'),
	http = require('http'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js'),
	kafkaAccess = require('/home/ec2-user/lib/kafka_access/kafka_access.js');

const kafkaProducer = new kafka.Producer({
	'metadata.broker.list': kafkaAccess.production_cluster.brokers,
	'dr_cb': true
});
kafkaProducer.on('delivery-report', (err, report) => {
	if(err) {
		console.log('Error in kafka producer -> '+ JSON.stringify(err));
		/*putToAppLog({
			type: 'error',
			message: 'Error in kafka producer -> '+ JSON.stringify(err)
		});*/
	}
});
kafkaProducer.setPollInterval(100);
const prepareKafkaProducer = () => {
	return new Promise((resolve, reject) => {
		kafkaProducer.connect();
		kafkaProducer.on('ready', () => {
			resolve();
		}).on('event.error', (err) => {
			console.log('Error in kafka producer -> '+ JSON.stringify(err));
			/*putToAppLog({
				type: 'error',
				message: 'Error in kafka producer -> '+ JSON.stringify(err)
			});*/
			reject();
		});
	});
};
//function to push to Device raw message in Kafka
const pushToRulesEngineEvaluationStreamInKafka = (message) => {
	try {
		kafkaProducer.produce(
			'rules-engine-stream',
			null,
			new Buffer(JSON.stringify(message)),
			null,
			Date.now()
		);
	} catch (err) {
		console.log('Error in kafka producer -> '+ JSON.stringify(err));
		/*putToAppLog({
			type: 'error',
			message: 'Error in kafka producer -> '+ JSON.stringify(err)
		});*/
	}
};

const data_db_connection_pool = mysql.createPool({
	connectionLimit : 10,
	host     		: dbAccess.data_db.host,
	user     		: dbAccess.data_db.user,
	password 		: dbAccess.data_db.password,
	database 		: dbAccess.data_db.database,
	multipleStatements: true
});

const redisClient = redis.createClient({
	host: 'redis-13441.c11.us-east-1-3.ec2.cloud.redislabs.com',
	port: 13441,
	password: 'ixjMWFLmwP20eifuFGDGlQxQ79qEW5sc'
});
redisClient.on('error', (err) => {
	console.log('Error in Redis Client -> ', err);
});

let redisClientForFiltering = redis.createClient({
	host: 'redis-13250.c8.us-east-1-3.ec2.cloud.redislabs.com',
	port: 13250,
	password: 'mMPpUy0Io98J1uYrPnaY5zpCsaOQJj3N'
});
redisClientForFiltering.on('error', (err) => {
	console.log('Error in Redis Client -> ', err);
});

const is_valid_json = (json_string) => {
	try {
		JSON.parse(json_string);
	} catch (e) {
		return false;
	}
	return true;
};

const getValidJSON = (jsonString, defaultValue = {}) => {
	if(is_valid_json(jsonString) && JSON.parse(jsonString)) {
		return JSON.parse(jsonString);
	} else {
		return defaultValue;
	}
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

const getFilteredDataForPenstockSump = async (stationId, parameter, latestValue, current_time) => {
	return new Promise(async (resolve,reject) => {
		let latestData = await getRedisData('flood-monitoring:st-'+ stationId +':'+ parameter +':short');
		latestData = getValidJSON(latestData, []);
		let filteringPossible = true;
		latestData.map((dataPoint) => {
			if(dataPoint === '-') {
				filteringPossible = false;
			}
		});
		if(!filteringPossible) {
			resolve(latestValue);
		}
		latestData.push(latestValue);
		let penstockSumpDataFilterApiResponse = '',
			requestBody = JSON.stringify({
				station_id: stationId,
				values: latestData,
				parameter: parameter
			});
		let penstockSumpDataFilterApiRequest = http.request({
			hostname: '172.31.22.162',
			port: 8000,
			path: '/snippets/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': requestBody.length
			},
			timeout: 10000
		}, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				// console.log('chunk -> ', chunk);
				penstockSumpDataFilterApiResponse += chunk;
			});
			res.on('end', () => {
				// console.log('station:'+ stationId +' -> filtered -> '+ penstockSumpDataFilterApiResponse);
				resolve(penstockSumpDataFilterApiResponse);
				// if(latestValue !== parseFloat(penstockSumpDataFilterApiResponse)) {
					data_db_connection_pool.query('INSERT INTO flood_monitoring_temp_filter(fms_id, real_value, replaced_value, posted_data, time, parameter) VALUES (?,?,?,?,?,?)', [stationId, latestValue, penstockSumpDataFilterApiResponse, requestBody, current_time, parameter]);
				// }
			});
		});
		penstockSumpDataFilterApiRequest.on('error', (e) => {
			console.error(`problem while fetching data from PenstockSumpFilterAPI: ${e.message}`);
			resolve(latestValue);
		});
		penstockSumpDataFilterApiRequest.on('timeout', () => {
			penstockSumpDataFilterApiRequest.abort();
			resolve(latestValue);
		});
		// write data to request body
		penstockSumpDataFilterApiRequest.write(requestBody);
		penstockSumpDataFilterApiRequest.end();
	});
};

const getRedisData = async (key) => {
	return new Promise((resolve,reject) => {
		redisClientForFiltering.get(key, (err, data) => {
			if(err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

const updateDataInRedis = async (stationId, parameter, latestValue) => {
	let redisShortKey = 'flood-monitoring:st-'+ stationId +':'+ parameter +':short',
		redisLongKey = 'flood-monitoring:st-'+ stationId +':'+ parameter;
	redisClientForFiltering.mget([redisShortKey, redisLongKey], (err, data) => {
		if(err) {
			return;
		} else {
			let shortData = getValidJSON(data[0], []),
				longData = getValidJSON(data[1], []);
			if(shortData.length >= 5) {
				shortData.shift();
			}
			shortData.push(latestValue);
			if(shortData.length >= 1440) {
				longData.shift();
			}
			longData.push(latestValue);
			redisClientForFiltering.set(redisShortKey, JSON.stringify(shortData), redis.print);
			redisClientForFiltering.set(redisLongKey, JSON.stringify(longData), redis.print);
		}
	});
};

const main = (async () => {
	try {
		//prepare Kafka Producer
		await prepareKafkaProducer();

		setInterval(() => {
			let current_time = moment.tz('Asia/Kolkata').unix();
			/*get all the flood monitoring stations*/
			data_db_connection_pool.query('SELECT fms_id, fms_param_list, fms_lst_unprocessed_data, fms_lst_data, fms_params_last_updated_data, fms_params_last_update_time, fms_params_last_status FROM flood_monitoring_stations WHERE fms_sub_cat_id=4', (err, results) => {
				if(err) {
					console.log('DB query error -> ', err);
					return;
				}
				let pumpStatusChangeSql = 'INSERT INTO flood_monitoring_stations_status_change_logs(fms_id, fms_pump_key, fms_scl_time, fms_scl_status) VALUES ',
					pumpStatusChanged = false;
				let all_stations = results,
					source_device_ids = [];
				all_stations.map((result) => {
					let station_param_details = (is_valid_json(result.fms_param_list) ? JSON.parse(result.fms_param_list) : []);
					station_param_details.map((param_detail) => {
						if(!isNaN(parseInt(param_detail.device_id))) {
							source_device_ids.push(param_detail.device_id);
						}
					});
				});
				let sql = 'SELECT idev_id, last_raw_data, last_data_receive_time, last_data_time FROM iot_devices WHERE idev_id IN ('+ source_device_ids.join(',') +')';
				data_db_connection_pool.query(sql, (err, results) => {
					if(!err && results.length) {
						all_stations.map(async (result) => {
							let station_raw_data = {},
								station_params_current_status = {},
								station_param_details = (is_valid_json(result.fms_param_list) ? JSON.parse(result.fms_param_list) : []),
								station_params_last_value = (is_valid_json(result.fms_lst_data) ? JSON.parse(result.fms_lst_data) : {}),
								station_params_last_unprocessed_value = (is_valid_json(result.fms_lst_unprocessed_data) ? JSON.parse(result.fms_lst_unprocessed_data) : {}),
								station_params_last_update_time = (is_valid_json(result.fms_params_last_update_time) ? JSON.parse(result.fms_params_last_update_time) : {}),
								station_params_last_updated_data = (is_valid_json(result.fms_params_last_updated_data) ? JSON.parse(result.fms_params_last_updated_data) : {}),
								station_params_last_status = (is_valid_json(result.fms_params_last_status) ? JSON.parse(result.fms_params_last_status) : {}),
								station_id = result.fms_id;
							await Promise.all(results.map(async (result) => {
								/*if data is received within 15 mins - changed from 2 mins to 15 mins to address (Issue #49)*/
								let lastDeviceDataRecordTime = result.last_data_receive_time;
								if(result.last_data_time != 0 && moment.unix(result.last_data_time).tz('Asia/Kolkata').year() > 2015) {
									lastDeviceDataRecordTime = result.last_data_time;
								}
								if(current_time - lastDeviceDataRecordTime <= 900) {
									let device_raw_data = (is_valid_json(result.last_raw_data) ? JSON.parse(result.last_raw_data) : {});
									await Promise.all(station_param_details.map(async (param_detail) => {
										if(param_detail.device_id == result.idev_id && device_raw_data[param_detail.key] !== undefined) {
											let param_value;
											if(['dust_pm_2_5', 'dust_pm_10', 'temperature', 'humidity', 'street_water_level'].indexOf(param_detail.type) >= 0) {
												if(
													station_params_last_update_time[param_detail.key] === undefined
													 || (station_params_last_update_time[param_detail.key] != lastDeviceDataRecordTime) /*this is to ensure that each raw data point from the deivce is logged only once against the station*/
												) {
													if(param_detail.type === 'street_water_level') {
														param_value = getProcessedDataForUltrasonicSensor(
															param_detail,
															device_raw_data[param_detail.key],
															station_params_last_updated_data[param_detail.key],
															station_params_last_unprocessed_value[param_detail.key],
															current_time,
															station_params_last_update_time[param_detail.key],
															2100 /* 35 mins */
														);
													} else {
														param_value = device_raw_data[param_detail.key];
													}
													//adjust temp. by -3 degree
													if(param_detail.type === 'temperature' && param_value > 3) {
														param_value = (param_value - 3).toFixed(2);
													}
												}
											} else if(param_detail.type === 'pump_status' && param_detail.upper_limit && param_detail.upper_limit !== '') {
												if(
													parseFloat(device_raw_data[param_detail.key]) > parseFloat(param_detail.upper_limit)
												) {
													param_value = 'ON';
												} else {
													param_value = 'OFF';
												}
												/*//consider as a valid point only if non-zero value received, but don't add to the above if-clause as doing so will make the invalid data go to the else condition at the end which is not intended as it will make the station status value shown as zero
												if(device_raw_data[param_detail.key] != 0) {
													if(
														parseFloat(device_raw_data[param_detail.key]) > parseFloat(param_detail.upper_limit)
													) {
														param_value = 'ON';
													} else {
														param_value = 'OFF';
													}
												} else {
													// console.log('putting old value for station -> ', result.idev_id);
													param_value = station_params_last_value[param_detail.key];
												}*/
											} else if(param_detail.type === 'sump_level') {
												await getFilteredDataForPenstockSump(station_id, 'sump', parseFloat(device_raw_data[param_detail.key]), current_time);
												console.log('station:'+ station_id +':sump -> ', param_value);
												param_value = getProcessedDataForUltrasonicSensor(
													param_detail,
													device_raw_data[param_detail.key],
													station_params_last_updated_data[param_detail.key],
													station_params_last_unprocessed_value[param_detail.key],
													current_time,
													station_params_last_update_time[param_detail.key],
													300 /* 5 mins */
												);
											} else if(param_detail.type === 'penstock_level') {
												await getFilteredDataForPenstockSump(station_id, 'penstock', parseFloat(device_raw_data[param_detail.key]), current_time);
												console.log('station:'+ station_id +':sump -> ', param_value);
												param_value = getProcessedDataForUltrasonicSensor(
													param_detail,
													device_raw_data[param_detail.key],
													station_params_last_updated_data[param_detail.key],
													station_params_last_unprocessed_value[param_detail.key],
													current_time,
													station_params_last_update_time[param_detail.key],
													300 /* 5 mins */
												);
											} else if(param_detail.type === 'open_canal_water_level') {
												param_value = getProcessedDataForUltrasonicSensor(
													param_detail,
													device_raw_data[param_detail.key],
													station_params_last_updated_data[param_detail.key],
													station_params_last_unprocessed_value[param_detail.key],
													current_time,
													station_params_last_update_time[param_detail.key],
													300 /* 5 mins */
												);
											} else if(param_detail.type === 'rainfall') {
												let deviceFirmware = device_raw_data.debug.fw_ver,
													deviceHasOldFirmWare = true;
												if(
													semver.valid(deviceFirmware)
													&& semver.gte(deviceFirmware, '3.2.0')
												) {
													deviceHasOldFirmWare = false;
												}
												if(deviceHasOldFirmWare) {
													let currentRainfallValue = parseFloat(device_raw_data[param_detail.key]),
														lastRainfallValue = parseFloat(station_params_last_unprocessed_value[param_detail.key]);
													if(currentRainfallValue > lastRainfallValue) {
														param_value = ((currentRainfallValue - lastRainfallValue) * 25.4).toFixed(4);
													} else if(currentRainfallValue < lastRainfallValue) {
														param_value = (currentRainfallValue * 25.4).toFixed(4);
													} else {
														param_value = 0;
													}
												} else {
													param_value = (device_raw_data[param_detail.key] * 10).toFixed(4);
												}
											} else {
												param_value = device_raw_data[param_detail.key];
											}
											if(param_value !== undefined) {
												//update station data
												station_raw_data[param_detail.key] = param_value;
												station_params_last_updated_data[param_detail.key] = param_value;
												//update last data update time of the parameter
												station_params_last_update_time[param_detail.key] = lastDeviceDataRecordTime;
												//update station unprocessed data
												station_params_last_unprocessed_value[param_detail.key] = device_raw_data[param_detail.key];
											}
										}
									}));
								}
							}));

							//mark pump status data as unavailable as required
							station_param_details.map((param_detail) => {
								if(param_detail.type === 'pump_status') {
									let current_status = 2;
									if(station_raw_data[param_detail.key] === 'ON') {
										current_status = 1;
									} else if(station_raw_data[param_detail.key] === 'OFF') {
										current_status = 0;
									}
									station_params_current_status[param_detail.key] = current_status;
									if(station_params_last_status[param_detail.key] !== current_status) {
										console.log('Pump status changed in loop -> ', station_id +' pump -> '+ param_detail.key +'time -> '+ current_time);
										pumpStatusChangeSql += '('+ station_id +',\''+ param_detail.key +'\','+ current_time +','+ current_status +'),';
										pumpStatusChanged = true;
									}
								} else if(
									param_detail.type === 'penstock_level'
									|| param_detail.type === 'sump_level'
								) {
									let currentValue = '-';
									if(station_raw_data[param_detail.key] !== undefined) {
										currentValue = parseFloat(station_params_last_unprocessed_value[param_detail.key]);
									}
									updateDataInRedis(station_id, (param_detail.type === 'penstock_level' ? 'penstock' : 'sump'), currentValue);
								}
							});
							//update station status if applicable - it is done outside the following query because if we put that in the below query then the status will not be updated when the station is offline
							if(!_.isEqual(station_params_current_status, station_params_last_status)) {
								/*data_db_connection_pool.query('UPDATE flood_monitoring_stations SET fms_params_last_status=? WHERE fms_id=?', [JSON.stringify(station_params_current_status), station_id], (err) => {
									if(err) {
										console.log('error -> ', err);
									}
								});*/
							}

							/*update raw data of stations if data received from at least one of the devices*/
							if(Object.keys(station_raw_data).length !== 0) {
								console.log('station_id -> ', station_id);
								console.log('time -> ', current_time);
								console.log('data -> ', JSON.stringify(station_raw_data));
								/*data_db_connection_pool.query('INSERT INTO flood_monitoring_stations_raw_data(fms_id, fms_rd_time, fms_rd_data) VALUES (?,?,?); INSERT INTO flood_monitoring_stations_unprocessed_data(fms_id, fms_upd_time, fms_upd_data) VALUES (?,?,?); UPDATE flood_monitoring_stations SET fms_lst_dat_time=?, fms_lst_dat_srv_time=?, fms_params_last_update_time=?, fms_lst_data=?, fms_lst_unprocessed_data=?, fms_params_last_updated_data=? WHERE fms_id=?', [station_id, current_time, JSON.stringify(station_raw_data), station_id, current_time, JSON.stringify(station_params_last_unprocessed_value), current_time, current_time, JSON.stringify(station_params_last_update_time), JSON.stringify(station_raw_data), JSON.stringify(station_params_last_unprocessed_value), JSON.stringify(station_params_last_updated_data), station_id], (err) => {
									if(err) {
										console.log('error -> ', err);
									}
								});*/

								//push data point to Rules Engine Stream for further processing
								/*pushToRulesEngineEvaluationStreamInKafka({
									app_id: 19,
									station_id: station_id,
									time: current_time,
									data: station_raw_data
								});*/

								//push data temporarily to Trinity for Chennai Integration
								/*if([227, 229, 232].includes(station_id)) {
									let generatedDataPacketOfStation = {
										token: 'Vp2DHiHwprMmrgJ9xc1CfvnMe4nxtRlGspVNyKqEwJnzFX4WLtUDGknAkByq232c',
										station_id: station_id,
										ct_id: 32,
										time: current_time,
										data: station_raw_data,
										aqi: 0,
										data_is_historical: 0
									};
									redisClient.publish('station-raw-data-channel', JSON.stringify(generatedDataPacketOfStation));
								}*/

							}
						});

						//update pump status change in DB
						if(pumpStatusChanged) {
							pumpStatusChangeSql = pumpStatusChangeSql.slice(0, -1);
							// console.log('Pump status change SQL -> ', pumpStatusChangeSql);
							/*data_db_connection_pool.query(pumpStatusChangeSql, (err) => {
								if(err) {
									console.log('Error while updating pump status in DB -> ', err);
								}
							});*/
						} else {
							// console.log('Error changing pump status');
						}
					}
				});
			});
		}, 60000);
	} catch(err) {
		console.log('Error caught inside catch of main function -> ', err);
		/*putToAppLog({
			type: 'error',
			message: 'Error caught inside catch of main function -> ', err
		});*/
	}
})();
