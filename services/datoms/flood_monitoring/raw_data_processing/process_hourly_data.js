'use strict';

const moment = require('moment-timezone'),
	mysql = require('mysql'),
	AWS = require('aws-sdk'),
	http = require('http'),
	dbAccess = require('/home/ec2-user/lib/db_access/db_access.js');

const data_db_connection_pool = mysql.createPool({
	connectionLimit : 10,
	host     		: dbAccess.data_db.host,
	user     		: dbAccess.data_db.user,
	password 		: dbAccess.data_db.password,
	database 		: dbAccess.data_db.database,
	multipleStatements: true
});

const is_valid_json = (json_string) => {
	try {
		JSON.parse(json_string);
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
// console.log('aws', AWS.config);

//create the queue if not exists
let sqs_queue = {
	QueueName: 'datoms-flood-monitoring-hourly-data-process-queue'
};

sqs.createQueue(sqs_queue, (err, data) => {
	// console.log('sqs_queue', data);
	if (err) {
		// console.log('sqs_queue_err', err);
	} else {
		//get queue url
		sqs.getQueueUrl(sqs_queue, (err, data) => {
			if (err) {
				// console.log('sqs_queue_url_err', err);
			} else {
				// console.log('sqs_queue_url', data);
				//get a message from queue
				let message_from_queue = {
					QueueUrl: data.QueueUrl,
					MaxNumberOfMessages: 1
				};
				// get messages
				let retriveSQSMessage = () => {
					sqs.receiveMessage(message_from_queue, (err, data) => {
						if (err) {
							// console.log('sqs_receive_msg_err', err);
						} else {
							if (data.Messages && data.Messages.length) {
								//message received
								//function to delete sqs message
								let delete_sqs_msg = () => {
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
								let sqs_message_data = JSON.parse(data.Messages[0].Body);

								//Demo SQS Message Format
								/*{ "ok": 1 }*/

								// finalize time limits
								let from_time = moment.tz(
									moment.unix(moment.tz('Asia/Kolkata').unix()-3600).tz('Asia/Kolkata').format('DD-MM-YYYY HH:00:01'),
									'DD-MM-YYYY HH:mm:ss', 'Asia/Kolkata').unix(),
									upto_time = from_time + 3599;

								// get all flood monitoring stations
								data_db_connection_pool.query('SELECT fms_id, fms_param_list FROM flood_monitoring_stations', [], (err, results) => {
									if(!err && results.length) {
										results.map((result) => {
											let station_id = result.fms_id;
											let station_param_list = (is_valid_json(result.fms_param_list) ? JSON.parse(result.fms_param_list) : []);
											let rainfall_data_key = null;
											station_param_list.map((station_param) => {
												if(station_param.type === 'rainfall') {
													rainfall_data_key = station_param.key;
												}
											});
											if(rainfall_data_key !== null) {
												data_db_connection_pool.query('SELECT fms_rd_data FROM flood_monitoring_stations_raw_data WHERE fms_id=? AND fms_rd_time>? AND fms_rd_time<=?', [station_id, from_time, upto_time], (err, results) => {
													if(!err && results.length) {
														/*get the last data point of the station before from time*/
														data_db_connection_pool.query('SELECT fms_rd_data FROM flood_monitoring_stations_raw_data WHERE fms_id=? AND fms_rd_time<=? ORDER BY fms_rd_time DESC LIMIT 1', [station_id, from_time], (err, last_data_results) => {
															if(!err) {
																let last_rainfall_val = 0;
																if(last_data_results.length) {
																	let last_data_packet = (is_valid_json(last_data_results[0].fms_rd_data) ? JSON.parse(last_data_results[0].fms_rd_data) : {});
																	if(last_data_packet[rainfall_data_key]) {
																		last_rainfall_val = last_data_packet[rainfall_data_key];
																	}
																}
																let station_hourly_data = {};
																station_hourly_data[rainfall_data_key] = {},
																station_hourly_data[rainfall_data_key]['avg'] = 0;
																results.map((data_result) => {
																	data_result = (is_valid_json(data_result.fms_rd_data) ? JSON.parse(data_result.fms_rd_data) : {});
																	if(data_result[rainfall_data_key]) {
																		if(data_result[rainfall_data_key] > last_rainfall_val) {
																			station_hourly_data[rainfall_data_key]['avg'] += (data_result[rainfall_data_key] - last_rainfall_val);
																		} else if(data_result[rainfall_data_key] < last_rainfall_val) {
																			station_hourly_data[rainfall_data_key]['avg'] += data_result[rainfall_data_key];
																		}

																		last_rainfall_val = data_result[rainfall_data_key];
																	}
																});

																station_hourly_data[rainfall_data_key]['avg'] = ((station_hourly_data[rainfall_data_key]['avg'] - 0) * 25.4).toFixed(2);

																/*update hourly data in DB*/
																data_db_connection_pool.query('INSERT INTO flood_monitoring_stations_hourly_data(fms_id, fms_hd_time, fms_hd_data) VALUES (?,?,?)', [station_id, upto_time, JSON.stringify(station_hourly_data)], (err) => {
																});
															}
														});
													}
												});
											}
										});
									}
								});

								// delete SQS message
								delete_sqs_msg();
							}
						}
						if (data.Messages && data.Messages.length) {
							retriveSQSMessage();
						} else {
							// console.log('time', 'timeout_for_1_second');
							setTimeout(retriveSQSMessage, 1000);
						}
					});
				};
				retriveSQSMessage();
			}
		});
	}
});
