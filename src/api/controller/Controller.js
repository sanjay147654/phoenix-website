// @flow

import express from 'express';
const config = require('../configs.js');
const mysql = require('mysql');
import _ from 'lodash';
import moment from 'moment-timezone';
const AWS = require('aws-sdk'),
ses = new AWS.SES({
	apiVersion: 'latest',
	region: 'us-east-1'
});

export default class Controller{
	static dbConnection : mysql.createPool;
	database : string;

	constructor(){
		Controller.dbConnection = config.dbConnection;
		this.database = 'kolkata_flood_monitoring';
	}
	
	getStatus(idev_is_shutdown, last_data_receive_time){
		if(((parseInt(moment().tz('Asia/Kolkata').format('X')) - last_data_receive_time) < 900)){
			return 'online';
		}else if(idev_is_shutdown == 1){
			return 'shutdown'
		}else{
			return 'offline';
		}
	}

	isValidJson(json_string: string): boolean{
		try{
			JSON.parse(json_string);
		}catch(err){
			return false;
		}
		return true;
	}

	getRhValue(prevStatus: number, statusChanges: Array<{changedAt: number, status: number}>, fromTime: number, uptoTime: number): number{
		let latestState = 0,
		onlineFromTime = fromTime,
		onlineInterval = 0;
		if(prevStatus == 1) {
			latestState = 1;
		}
		//sort statusChanges by time
		// statusChanges = _.sortBy(statusChanges, ['changedAt']);
		statusChanges = _.orderBy(statusChanges, ['changedAt', 'status'], ['asc', 'desc']); //considers case when both online and offline rows present with same timestamp
		statusChanges.map((statusChange) => {
			if(latestState == 0 && statusChange.status == 1) {
				latestState = 1;
				onlineFromTime = statusChange.changedAt;
			} else if(latestState == 1 && statusChange.status == 0) {
				latestState = 0;
				onlineInterval += statusChange.changedAt - onlineFromTime;
			}
		});

		if(latestState == 1) {
			onlineInterval += uptoTime - onlineFromTime;
		}

		return onlineInterval;
	}

	parseHourlyParameter(parameter_list: string, data_object: string, hour_parameter_list: Array<String>){

		if(this.isValidJson(parameter_list)){
			parameter_list = JSON.parse(parameter_list);
		}
		else{
			return [];
		}

		if(this.isValidJson(data_object)){
			data_object = JSON.parse(data_object);
		}else{
			return [];
		}

		// console.log("parameter_list  >> ",parameter_list);
		// console.log("hour_parameter_list  >> ",hour_parameter_list);

		if(hour_parameter_list && hour_parameter_list.length){
			let response_array = [];
			hour_parameter_list.map((param_name)=>{
				
				let param_details = _.find(parameter_list, {name:param_name});
				// console.log("param_name  >> ",param_name);
				// console.log("param_details  >> ",param_details);
				if(param_details){
					if(data_object[param_details.key]){
						response_array.push({
							name:param_name,
							value:data_object[param_details.key],
							unit:param_details.unit
						});
					}else{
						response_array.push({
							name:param_name,
							value:'NA',
							unit:param_details.unit
						});
					}
				}
			});

			return response_array; 

		}else{
			return [];
		}
	}

	parseParameters(parameter_list: string, response_obj: string){

		if (parameter_list && this.isValidJson(parameter_list)) {
			parameter_list = JSON.parse(parameter_list);
		} else {
			return [];
		}

		if (this.isValidJson(response_obj)) {
			response_obj = JSON.parse(response_obj);
		} else {
			response_obj = {};
		}

		// console.log("parameter_list > ",parameter_list);
		// console.log("response_obj > ",response_obj);

		let response_array = parameter_list.map((param) => {
			if(response_obj[param.key] != undefined || response_obj[param.key] != null){
				return {
					name: param.name,
					value: response_obj[param.key],
					unit: param.unit,
					threshold: (param.alert_thresholds) ? param.alert_thresholds : {},
					type: param.type
				};
			} else {
				return {
					name:param.name,
					value:'NA',
					unit:param.unit,
					type: param.type
				}
			}
		});

		return response_array;
	}

	queryDb(query: string,options :? Object | Array<mixed>):Promise<*>{
		let self = this; 
		return new Promise((resolve,reject)=>{
			if(options){
				Controller.dbConnection.query(query,options,(err,result)=>{
					if(err) reject(err);
					else resolve(result);
				});
			}else{
				Controller.dbConnection.query(query,(err,result)=>{
					if(err) reject(err);
					else {
						resolve(result)
						// Controller.dbConnection.release();					
					};
				});
			}
		});
	}

	getRhValue(prevStatus: number, statusChanges: Array<{time: number, status: number}>, fromTime: number, uptoTime: number): number{

		// let total_rh = 0,pre_status = previous_status,last_time = 0,current_time = parseInt(moment().tz('Asia/Kolkata').format('X'));

		// console.log('kkkkkkk',pre_status);
		let latestState = 0,
			onlineFromTime = fromTime,
			onlineInterval = 0;
		if(prevStatus == 1) {
			latestState = 1;
		}
		if (statusChanges && statusChanges.length) {
			//sort statusChanges by time
			statusChanges = _.sortBy(statusChanges, ['time']);
			statusChanges.map((statusChange) => {
				//checking both latestState & statusChange.status simultaneously is not required, but has been done just to ensure no error
				if(latestState == 0 && statusChange.status == 1) {
					latestState = 1;
					onlineFromTime = statusChange.time;
				} else if(latestState == 1 && statusChange.status == 0) {
					latestState = 0;
					onlineInterval += statusChange.time - onlineFromTime;
				}
			});
		}
		//handle the case when the latestState is online
		if(latestState == 1) {
			onlineInterval += uptoTime - onlineFromTime;
		}

		return onlineInterval;
	}

}