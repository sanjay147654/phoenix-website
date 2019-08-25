// @flow

import express from 'express';
const config = require('../configs.js');
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
import pdf from 'html-pdf';
// import highcharts from 'highcharts-export-server';
import Controller from './Controller';
// const curl = new (require('curl-request'))();
// import http from 'http';
import request from 'request';

export default class Devices extends Controller{
	constructor(){
		super();       
	};

	async getDeviceList(req: express$Request,res: express$Response){
		let device_type = req.params.type_id;
		let current_time = parseInt(moment.tz("Asia/Kolkata").format('X'));
		let device_details_query, all_device_type_query = "SELECT idt_id, idt_name, idprtcl_id FROM phoenzbi_data.iot_device_types WHERE idt_name IN ('A','A1','B','C','D','E','F')";
		let station_name_query = "SELECT fms_id, fms_name, idev_id FROM phoenzbi_data.flood_monitoring_stations";
		
		
		if(device_type){
			device_details_query = "SELECT idev_id, idev_qr_code, last_data_receive_time, iot_device_types.idt_id,idt_name, serv_id FROM phoenzbi_data.iot_devices INNER JOIN phoenzbi_data.iot_device_types ON iot_devices.idt_id = iot_device_types.idt_id WHERE industry_id = 365 AND serv_id = 19 AND iot_devices.idt_id = ?";
		}else {
			device_details_query = "SELECT idev_id, idev_qr_code, last_data_receive_time, iot_device_types.idt_id,idt_name, serv_id FROM phoenzbi_data.iot_devices INNER JOIN phoenzbi_data.iot_device_types ON iot_devices.idt_id = iot_device_types.idt_id WHERE industry_id = 365 AND serv_id = 19";
		}

		try{

			let device_details = [];

			let device_types = await super.queryDb(all_device_type_query);

			let device_types_list = device_types.map((type)=>{
				return {
					id: type.idt_id,
					name: type.idt_name
				}
			});
			
			if(device_type){
				// console.log("Device Type", device_type);
				// console.log("List ", device_types_list)
				let type = _.find(device_types_list,{id: parseInt(device_type)});
				
				if(!type){
					res.status(404).json({
						status: 'failure',
						message: 'No such device types found'
					})
					return;
				}
			}

			// console.log("device_details_query", device_details_query);

			if(device_type){
				device_details = await super.queryDb(device_details_query, [device_type]);
			}else{
				device_details = await super.queryDb(device_details_query);
			}

			let stations_list = await super.queryDb(station_name_query);

			let device_ids = [];

			let device_details_response = {};
			
			device_details.map((device)=>{
				if(device_ids.indexOf(device.idev_id) == -1){
					device_ids.push(device.idev_id);
				}
				device_details_response[device.idev_id] = {
					"id": device.idev_id,
					"qr_code": device.idev_qr_code,
					"type": device.idt_id,
					"status": super.getStatus(0,device.last_data_receive_time),
					"last_data_time": device.last_data_receive_time,
					"station_name": "",
					"online_percent": 0
				}
			});

			let device_ids_option = "( 0 )";
			

			if(device_ids.length){
				device_ids_option = "( "+ device_ids.toString() +" )";
			}


			let device_status_query = "SELECT * FROM phoenzbi_data.iot_device_connectivity_status_history WHERE idev_id IN "+device_ids_option+" AND idcsh_time > ?";
			let device_last_status_query = "SELECT iot_device_connectivity_status_history.idev_id, iot_device_connectivity_status_history.idcsh_time, idcsh_status FROM phoenzbi_data.iot_device_connectivity_status_history INNER JOIN ( SELECT idev_id , MAX(idcsh_time) as idcsh_time FROM phoenzbi_data.iot_device_connectivity_status_history WHERE idcsh_time < ? AND idev_id IN "+device_ids_option+" GROUP BY idev_id ) as max_table ON  iot_device_connectivity_status_history.idev_id = max_table.idev_id AND iot_device_connectivity_status_history.idcsh_time = max_table.idcsh_time";
			let recent_activity_query = "SELECT DISTINCT * FROM phoenzbi_data.iot_device_connectivity_status_history WHERE idev_id IN "+device_ids_option+" ORDER BY `iot_device_connectivity_status_history`.`idcsh_time` DESC LIMIT 25";

			let recent_activity = await super.queryDb(recent_activity_query);

			let device_status_log = await super.queryDb(device_status_query,[(current_time - 86400)]);

			let device_last_status = await super.queryDb(device_last_status_query, [(current_time - 86400)]);

			let response = {};
			
			// response["recent_activity"] = recent_activity;
			// response["device_status_log"] = device_status_log;
			// response["device_last_status"] = device_last_status;
			// response["device_types_list"] = device_types_list;
			// response["station_list"] = stations_list;
			
			device_ids.map((id)=>{
				
				let last_status = _.findLast(device_last_status,{idev_id: id});
				let status_list = [];

				if(last_status){
					last_status = last_status.idcsh_status;
				}

				let status_change_list = []; 
				device_status_log.map((device)=>{
					if(device.idev_id == id){
						let obj = {
							time: device.idcsh_time,
							status: device.idcsh_status
						};
						// obj[device.idcsh_time] = device.idcsh_status;
						status_change_list.push(obj);
					}
				});
				let online_time = super.getRhValue(last_status,status_change_list,(current_time - 86400),current_time);

				if (id == 2) {
					console.log('online_time >', online_time);
				}

				let online_percent = isNaN(online_time) ? 'NA' : parseFloat((online_time / 86400) * 100).toFixed(2);

				device_details_response[id.toString()].online_percent = online_percent;
				
			})

			stations_list.map((station)=>{
				let device_id = [];
				if(!isNaN(station.idev_id)){
					device_id.push(station.idev_id);
				}else if(super.isValidJson(station.idev_id)){
					device_id = JSON.parse(station.idev_id);
				}

				device_id.map((id)=>{
					if(device_ids.indexOf(parseInt(id)) != -1){
						device_details_response[id.toString()].station_name = station.fms_name;
					}
				})
			})

			response["device_list"] = Object.keys(device_details_response).map((device_id)=>{
				return device_details_response[device_id]
			});

			response["recent_activities"] = recent_activity.map((activity)=>{
				return {
					id: activity.idev_id,
					status: ((activity.idcsh_status == 1)? "online": "offline"),
					timestamp: activity.idcsh_time
				}
			});

			response["device_types"] = device_types_list;

			// response["device_details_response"] = device_details_response;
			
			response["status"] = "success";
			

			res.json(response);


		}catch(err){
			res.status(500).json({status: 'failure',error: err.message,message: 'Something went wrong'});
			return;			
		}

	};

}