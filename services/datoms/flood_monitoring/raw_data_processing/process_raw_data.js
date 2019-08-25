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
	QueueName: 'datoms-flood-monitoring-raw-data-queue'
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
								/*{
									"device_id": 554,
									"application_id": 1,
									"location_id": 0,
									"time": 1530615824,
									"server_time": 1530615871,
									"data": {
										"p1":"0.80",
										"p2":"0.55",
										"p3":"0.00",
										"p4":"0.09",
										"p5":"0.00",
										"p6":"0.09",
										"p7":"0.03",
										"p8":"0.14",
										"debug": {
											"errno":"0",
											"errbyte1":"0",
											"errbyte2":"0",
											"rssi":"20",
											"prc":"0",
											"crc":"0",
											"wrc":"0"
										}
									},
									"debug_status": 0
								}*/

								//If the difference between the timestamp received from the device and the server time is more than 1 hr. past or more than 30 sec. future, then use the server time instead
								if(sqs_message_data.server_time - sqs_message_data.time > 3600 || sqs_message_data.time - sqs_message_data.server_time > 30) {
									sqs_message_data.time = sqs_message_data.server_time;
								}

								//select device type
								// data_db_connection_pool.query('SELECT idt_id, idev_configurations FROM iot_devices WHERE idev_id=?', [sqs_message_data.device_id], (err, results) => {
								// 	if(!err && results.length) {
								// 		let device_type_id = results[0].idt_id,
								// 			device_configurations = (is_valid_json(results[0].idev_configurations) ? JSON.parse(results[0].idev_configurations) : {});
								// 		if(device_type_id == 5) {
								// 			for(let param_key in sqs_message_data.data) {
								// 				if(sqs_message_data.data.hasOwnProperty(param_key)) {
								// 					if(
								// 						param_key !== 'debug' && 
								// 						device_configurations[param_key] && 
								// 						device_configurations[param_key]['upper_limit'] && 
								// 						device_configurations[param_key]['upper_limit'] !== ''
								// 					) {
								// 						if(
								// 							parseFloat(sqs_message_data.data[param_key]) > parseFloat(device_configurations[param_key]['upper_limit'])
								// 						) {
								// 							sqs_message_data.data[param_key] = 'ON';
								// 						} else {
								// 							sqs_message_data.data[param_key] = 'OFF';
								// 						}
								// 					}
								// 				}
								// 			}
								// 		}
								// 		//update data in iot_data table
								// 		data_db_connection_pool.query('UPDATE iot_data SET idata_data=? WHERE idev_id=? AND idata_time=?; UPDATE iot_devices SET last_data_receive_time=?, last_raw_data=? WHERE idev_id=?', [JSON.stringify(sqs_message_data.data), sqs_message_data.device_id, sqs_message_data.time, sqs_message_data.time, JSON.stringify(sqs_message_data.data), sqs_message_data.device_id], (err) => {

								// 		});
								// 		//insert data into Flood Monitoring data table and update in Flood Monitoring station table
								// 		/*data_db_connection_pool.query('INSERT INTO flood_monitoring_devices_raw_data (idev_id, fmd_rd_time, fmd_rd_data) VALUES (?, ?, ?); UPDATE flood_monitoring_stations SET fms_lst_data=?, fms_lst_dat_time=?, fms_lst_dat_srv_time=? WHERE idev_id=?', [sqs_message_data.device_id, sqs_message_data.time, JSON.stringify(sqs_message_data.data), JSON.stringify(sqs_message_data.data), sqs_message_data.time, sqs_message_data.time, sqs_message_data.device_id], (err) => {
								// 		});*/
								// 	}
								// });

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
