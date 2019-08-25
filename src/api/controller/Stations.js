// @flow

import express from 'express';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
import pdf from 'html-pdf';
import Controller from './Controller';
import http from 'http';
import request from 'request';
// import highcharts from 'highcharts-export-server';
// const curl = new (require('curl-request'))();
const highchart_port = (process.env.NODE_ENV === 'production') ? 40001 : 7801;
const config = require('../configs.js');
const ACL = config.libraryACL;


export default class Stations extends Controller{
	constructor(){
		super();
		this.database = 'phoenzbi_data';
	};

	getBlinkingStatus(parameter_details, parameter, station_sub_cat_id){
		if(station_sub_cat_id && [4, 10, 12].includes(parseInt(station_sub_cat_id))) {
			if(typeof(parameter_details) == 'string' && super.isValidJson(parameter_details)){
				parameter_details = JSON.parse(parameter_details)
			}else if(typeof(parameter_details) == 'string'){
				parameter_details = null;
			}

			let penstock_violation = false;
			let sump_violation = false;
			let pump_on = false;
			if(parameter_details){
				
				parameter_details.map((param)=>{
					let param_name = '';
					let threshold = {};
					let data = {};

					if(param.key == 'pstock'){
						param_name = param.name;
						threshold = param.threshold;
						data = _.find(parameter,{name: param_name});

						if(data && threshold && threshold instanceof Object){
							if(parseInt(data.value) < parseInt(threshold.min) ){
								penstock_violation = 'min';
							}else if(parseInt(data.value) > parseInt(threshold.max) ){
								penstock_violation = 'max';
							}

						}

					}else if(param.key == 'us_mb_1'){
						
						param_name = param.name;
						threshold = param.threshold;
						data = _.find(parameter,{name: param_name});

						if(data && threshold && threshold instanceof Object){
							if(parseInt(data.value) < parseInt(threshold.min) ){
								sump_violation = 'min';
							}else if(parseInt(data.value) > parseInt(threshold.max) ){
								sump_violation = 'max';
							}

						}

					}else if(param.key != 'rain'){

						param_name = param.name;
						data = _.find(parameter,{name: param_name});

						if(data && typeof(data.value) == 'string' && (data.value.toLowerCase() == 'on' || data.value.toLowerCase() == 'off') && !pump_on ){
							if(data.value.toLowerCase() == 'on'){
								pump_on = true;
							}
						}

					}
				})

				if(penstock_violation){
					return true;
				}else if(sump_violation && sump_violation == 'min' && pump_on){
					return true;
				}else if(sump_violation && sump_violation == 'max' && !pump_on){
					return true;
				}
			}

			return false;
		}
		return false;
	}

	getPumpStatus(parameter_details, station_sub_cat_id, station_status, last_data_receive_time){
		if(station_sub_cat_id && [4, 10, 12].includes(parseInt(station_sub_cat_id))) {
			if(typeof(parameter_details) == 'string' && super.isValidJson(parameter_details)){
				parameter_details = JSON.parse(parameter_details)
			}else if(typeof(parameter_details) == 'string'){
				parameter_details = null;
			}
			let pump_on = false;
			// console.log(' parameter_details > here ',parameter_details);
			if(parameter_details){
				parameter_details.map((data)=>{
					if(data && data.value && typeof(data.value) == 'string' && (data.value.toLowerCase() == 'on' || data.value.toLowerCase() == 'off') && !pump_on){
						if(data.value.toLowerCase() == 'on'){
							pump_on = true;
						}
					}
				});
				if ((parseInt(last_data_receive_time) + 900) < parseInt(moment.tz("Asia/Kolkata").format('X'))) {
					return 'shutdown';
				} else {
					if(pump_on){
						return 'online';
					}else{
						return 'offline';
					}
				}
			} else {
				return 'shutdown';
			}
		}
		return station_status;
	}

	createParameterCSV(station_data, data_type, from_time, upto_time, avg_data_time = 0) {
		let file_content = '';
		// let base_path = path.resolve('.');
		// let file_path = path.resolve(path.join(base_path,'demo_files','demo.csv'));
		
		if (station_data && station_data.length && data_type && from_time && upto_time) {
			let isData = false;
			let non_avg_min_max = ['rainfall', 'pump_status'];
			let time_duration = moment.unix(parseInt(from_time)).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY') + ' - ' + moment.unix(parseInt(upto_time)).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY');
			file_content += '\n';
			let report_title_prefix = '',
				report_type = ((data_type == 'raw') ? 'Raw' : ' Average');
			if (avg_data_time == 900) {
				report_title_prefix = '15 Min';
			} else if (avg_data_time == 3600) {
				report_title_prefix = 'Hourly';
			} else if (avg_data_time == 86400) {
				report_title_prefix = 'Daily';
			}
			file_content += '"' + report_title_prefix + report_type + ' Report for Flood Monitoring"\n';
			file_content += '"Duration: ' + time_duration + '"\n';
			// file_content += '"Data Type: ' + ((data_type == 'raw') ? 'Raw' : 'Average') + '"\n';
			file_content += '\n';
			
			if(station_data.length){
				if (data_type == 'avg' && station_data[0].total_rainfall) {
					file_content += '"Total Rainfall of Stations"\n';
					file_content += '"Station Name","Total Rainfall"\n';
					station_data.map((station) => {
						file_content += '"' + station.name + '","' + (station.total_rainfall || '-') + '"\n';
					});
					file_content += '\n';
				}
				station_data.map((station) => {
					// console.log('station', station);
					file_content += '"Station Name: ' + station.name + '"\n';
					file_content += '"Sub-Category: ' + station.sub_category + '"\n';
					if (station.table_data && station.table_data.length) {
						isData = true;
						let param_data = station.table_data[0].parameters;
						let data_point_structure = {};

						param_data.map((param) => {
							if (!data_point_structure[param.name]) {
								let unit = '';
								if (param.type == 'pump_status') {
									unit = data_type == 'avg' ? '' : 'Status';
								} else {
									unit = param.unit || '';
								}
								data_point_structure[param.name] = {name: param.name, type: param.type, unit: unit};
							}
						});

						// top label header
						file_content += '"Time",';
						Object.keys(data_point_structure).map((param) => {
							file_content += '"' + param + '",';
							if (data_type == 'avg' && !non_avg_min_max.includes(data_point_structure[param].type)) {
								file_content += ',,';
							} else if (data_type == 'avg' && data_point_structure[param].type == 'pump_status') {
								file_content += ',';
							}
						});
						file_content += '\n';

						// Units header
						if (data_type == 'avg') {
							file_content += '"HH:mm, DD MMM YYYY - HH:mm, DD MMM YYYY ",';
						} else {
							file_content += '"HH:mm, DD MMM YYYY ",';
						}
						Object.keys(data_point_structure).map((param) => {
							file_content += '"' + data_point_structure[param].unit + '",';
							if (data_type == 'avg' && !non_avg_min_max.includes(data_point_structure[param].type)) {
								file_content += ',,';
							} else if (data_type == 'avg' && data_point_structure[param].type == 'pump_status') {
								file_content += ',';
							}
						});
						file_content += '\n';

						if (data_type == 'avg') {
							file_content += ',';
							Object.keys(data_point_structure).map((param) => {
								if (!non_avg_min_max.includes(data_point_structure[param].type)) {
									file_content += '"Avg","Min","Max",';
								} else if (data_point_structure[param].type == 'pump_status') {
									file_content += '"RH","Activities",';
								} else {
									file_content += ',';
								}
							});
							file_content += '\n';
						}

						station.table_data.map((table) => {
							if(table.parameters.length){

								if (data_type == 'avg' && table.time && table.time.length) {
									file_content += '"' + moment.unix(parseInt(table.time[0])).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY ') + ' - ' + moment.unix(parseInt(table.time[1])).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY ') + '",';
								} else {
									file_content += '"' + moment.unix(parseInt(table.time)).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY ') + '",';
								}

								table.parameters.map((param_data) => {
									let has_values = false;

									Object.keys(data_point_structure).map((param) => {
										// console.log(data_point_structure[param], param_data);
										if(param_data.name == param){
											if (
												data_type == 'avg' &&
												data_point_structure[param].type == 'pump_status'
											) {
												let rh_hour = parseInt(param_data.rh / 3600);
												let rh_min = parseInt(parseInt(param_data.rh % 3600) / 60);
												file_content += '"' + (rh_hour ? rh_hour + ' hr' : '') + ' ' + (rh_min ? rh_min + ' min' : '') + (!rh_hour && !rh_min ? '0 min' : '') + '",';
												if (
													typeof(param_data.activities) != 'undefined' &&
													param_data.activities.length
												) {
													let activities = param_data.activities.map((act) => {
														let act_time = moment.unix(act.time).tz('Asia/Kolkata').format('HH:mm');
														if (act.status == 1) {
															return 'Started at ' + act_time;
														} else if (act.status == 0) {
															return 'Stopped at ' + act_time;
														}
													});
													file_content += '"' + activities.join('\n') + '",';
												} else {
													file_content += ',';
												}
											} else if (
												data_type == 'avg' &&
												data_point_structure[param].type != 'pump_status'
											) {
												if (typeof(param_data.data) == 'object' && Object.keys(param_data.data).length) {
													file_content += '"' + (param_data.data.avg).toFixed(2) + '","' + (param_data.data.min).toFixed(2) + '","' + (param_data.data.max).toFixed(2) + '",';
												} else if (typeof(param_data.data) == 'undefined' && param_data.value != null && !isNaN(param_data.value) && param_data.value >= 0) {
													file_content += '"' + parseFloat(param_data.value).toFixed(2) + '",';
												} else if (typeof(param_data.data) == 'undefined') {
													file_content += '"-",';
												} else {
													file_content += '"-","-","-",';
												}
											} else if (data_type == 'raw' && param_data.value != null && !isNaN(param_data.value) && param_data.value >= 0) {
												file_content += '"' + parseFloat(param_data.value).toFixed(2) + '",';
											} else if (data_type == 'raw' && data_point_structure[param].type == 'pump_status') {
												file_content += '"' + (param_data.value == 'NA' ? '-' : param_data.value) + '",';
											} else {
												file_content += '"-",';
											}
											has_values = true;
										}
									});

									if (!has_values && data_type == 'avg' && !non_avg_min_max.includes(param_data.type)) {
										file_content += '"NA","NA","NA",';
									} else if (!has_values) {
										file_content += '"NA",';
									}
								});
								file_content += '\n';
							}
						});
					}
					if(!isData){
						file_content += 'No Records Found! \n ';			
					}
					isData = false;
					file_content += '\n';
				});
			}else{
				file_content += '"No Records Found!"\n';
			}

			file_content += '"Report generated by Phoenix Robotix Pvt. Ltd. at ' + moment.tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY') + ' IST"\n';
		}
		// fs.writeFileSync(file_path,file_content);
		return file_content;
	};

	async getPumpStationDetails(device_id, parameter_list, from_time, upto_time){
		
		if(parameter_list && super.isValidJson(parameter_list)){
			let current_time = parseInt(moment.tz("Asia/Kolkata").format('X'));			
			
			try{
				let parameter_data = await super.queryDb('SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM '+ this.database +'.flood_monitoring_stations_raw_data WHERE fms_id = ? AND fms_rd_time > ?'+ (from_time && upto_time ? ' AND fms_rd_time < ?' : '') +' ORDER BY fms_rd_time ASC', from_time && upto_time ? [device_id, from_time, upto_time] : [device_id, ( current_time - 86400 )]);
				
				// console.log("parameter_data > ",parameter_data);

				let response_obj = [];
				let demo_obj = {};
				if(parameter_data.length){
					let parameter_data_list = parameter_data.map((param)=>{
						return {
							time: param.fms_rd_time,
							data: super.parseParameters(parameter_list, param.fms_rd_data)
						}
					});

					let last_update = null;

					parameter_data_list.map((param_data)=>{
						
						param_data.data.map((val)=>{
							
							if(!isNaN(val.value)){
								
								let name = val.name;

								let param_details = JSON.parse(parameter_list);
								let param = _.find(param_details,{name: name});

								if(param && param.threshold){
									if(!demo_obj[name]){
										demo_obj[name] = {
											name: name,
											value: val.value,
											values:[],
											type: param.type,
											threshold: param.threshold,
											unit: val.unit,
											warning: 0
										}
									}

									demo_obj[name].values.push({
										timestamp: param_data.time,
										type: (param.type)? param.type : '',
										value: val.value
									});

									if(parseInt(val.value) < parseInt(param.threshold.min) || parseInt(val.value) > parseInt(param.threshold.max)){
										demo_obj[name].warning = 1;
									}
								}else if(param.type != "pump_status" &&  param.type != "rainfall"){
									if(!demo_obj[name] || !demo_obj[name].values){
										demo_obj[name] = {
											name: name,
											type: (param.type)? param.type : '',
											value: val.value,
											values: [],
											unit: val.unit
										}
									}
									
									demo_obj[name].value = val.value;

									demo_obj[name].values.push({
										timestamp: param_data.time,
										type: (param.type)? param.type : '',
										value: val.value
									});
									
								}else if (param.type == "pump_status"){

									if(!demo_obj[name]){
										demo_obj[name] = {
											name: name,
											type: (param.type)? param.type : '',
											values: [],
											unit: val.unit
										}
									}
									demo_obj[name].values.push({
										timestamp: param_data.time,
										type: (param.type)? param.type : '',
										value: val.value
									});
								}

							}else if(val.value == "ON" || val.value == "OFF"){
								
								let name = val.name;

								let param_details = JSON.parse(parameter_list);
								let param = _.find(param_details,{name: name});

								if(param.type){
									if(!demo_obj[name]){
										demo_obj[name] = {
											name: name,
											type: param.type,
											unit: val.unit,
											values:[]
										}
									}
	
									demo_obj[name].values.push({
										timestamp: param_data.time,
										type: (param.type)? param.type : 'pump_status',
										value: val.value
									})
								}
							}
						})
					});
				}

				response_obj = Object.keys(demo_obj).map((key)=>{
					return demo_obj[key];
				})

				return response_obj;

				
	
			}catch(err){
				throw err
			}

		}else{
			return []
		}
	}

	async getRainfallData(station_id, parameter_list, from_time, upto_time){
		if (this.isValidJson(parameter_list)) {
			parameter_list = JSON.parse(parameter_list);
		} else {
			return null;
		}
		let rainfall_data_detail = _.find(parameter_list,{key:'rain'});
		let current_time = parseInt(moment.tz("Asia/Kolkata").format('X'));
		
		if(rainfall_data_detail){
			
			let rainfall_data_list = await super.queryDb('SELECT fms_id, fms_hd_time, fms_hd_data FROM '+ this.database +'.flood_monitoring_stations_hourly_data WHERE fms_id = ? AND fms_hd_time > ?'+ (from_time && upto_time ? ' AND fms_hd_time < ?' : '') +' ORDER BY fms_hd_time ASC', from_time && upto_time ? [station_id, from_time, upto_time] : [station_id, ( current_time - 86400 )]);

			// console.log('rainfall_data_list', rainfall_data_list);

			let last_24_hour = 'NA' , last_1_hour = 'NA',last_24_hour_trend = [];

			rainfall_data_list.map((rainfall)=>{
			// console.log('fms_hd_data', rainfall.fms_hd_data);
				if(super.isValidJson(rainfall.fms_hd_data)){
					
					let value_obj = JSON.parse(rainfall.fms_hd_data);
										
					if(!isNaN(value_obj.rain.avg)){
						let value = parseFloat(value_obj.rain.avg);
						if(isNaN(last_24_hour)){
							last_24_hour = 0;
						}
						last_24_hour_trend.push({
							value: value,
							timestamp: rainfall.fms_hd_time
						})
						last_24_hour += value;

						if( parseInt(rainfall.fms_hd_time) < current_time && parseInt(rainfall.fms_hd_time) > (current_time - 3600) ){
							if(isNaN(last_1_hour)){
								last_1_hour = 0;
							}
							last_1_hour = value;
						}
					}

				}
			});

			return {
				rainfall_24:{
					value: (!isNaN(last_24_hour))? last_24_hour.toFixed(2) : last_24_hour,
					unit: rainfall_data_detail.unit
				},
				rainfall_1:{
					value: (!isNaN(last_1_hour))? last_1_hour.toFixed(2) : last_1_hour,
					unit: rainfall_data_detail.unit
				},
				rainfall_24_trend: last_24_hour_trend,
				rainfall_name: rainfall_data_detail.name,
				rainfall_unit: rainfall_data_detail.unit,
				rainfall_type: (rainfall_data_detail.type) ? rainfall_data_detail.type : 'rainfall'
			}
		}else{
			return null;
		}
	}

	async getStationList(req : express$Request, res : express$Response){

		let self = this;

		let device_details_query = "SELECT idev_id, iot_devices.idt_id, idt_name, idev_is_shutdown, last_data_receive_time FROM "+this.database+".iot_devices INNER JOIN "+this.database+".iot_device_types ON iot_devices.idt_id = iot_device_types.idt_id WHERE idt_name IN ('A','A1','B','C','D','E','F')";

		let events_list_query = "SELECT fms_id,fmsn_time,fmsn_text FROM "+this.database+".flood_monitoring_stations_notification ORDER BY fmsn_time DESC LIMIT 20";
		
		let response_object = {
			device_info: [],
			event_log: [],
			station_list: [],
			status:'success'
		}

		try{

			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'AccessData:RealTime'
			};

			let accessable_stations = await ACL.getActionAccessableStations(user_details);

			console.log('accessable_stations >> ', accessable_stations);

			if(!accessable_stations.length){
				accessable_stations = [0];
			}

			let station_details_query = 'SELECT fms_id,fms_name, fms_lat, fms_long, fms_street, fms_city, fms_state, flood_monitoring_stations.idev_id, fms_country, fms_param_list, fms_lst_data, fms_lst_dat_srv_time, fms_lst_dat_time, fms_dev_status, fms_dev_status_last_updated, fms_status, fms_is_active, flood_monitoring_stations.fms_sub_cat_id, fms_sub_cat_name, fms_cat_id, fms_sub_cat_show_trend FROM '+this.database+'.flood_monitoring_stations LEFT JOIN '+this.database+'.flood_monitoring_station_sub_categories ON flood_monitoring_stations.fms_sub_cat_id = flood_monitoring_station_sub_categories.fms_sub_cat_id WHERE fms_id IN ('+accessable_stations.toString()+')';

			let station_details = await super.queryDb(station_details_query);
			let events_list = await super.queryDb(events_list_query);
			let device_id = [],device_details = [],device_info = {},station_name_list = {};
			// let device_info = await super.queryDb()

			response_object.station_list 
			for(let i = 0; i < station_details.length; i++){
				let details = station_details[i];
				let parameters = super.parseParameters(details.fms_param_list,details.fms_lst_data);
				parameters.map((param)=>{
					if(param.value instanceof Object && param.value.avg){
						param.value.total = param.value.avg;
						// console.log('parameter > ',parameters);
					}
				});
				
				let blinking_status = false;

				let all_devices = ((super.isValidJson(details.idev_id))? JSON.parse(details.idev_id) : []);
				
				let device_shutdown = 0;

				let rainfall_data = {}
				
				if(super.isValidJson(details.idev_id) && JSON.parse(details.idev_id) instanceof Array){
					all_devices.map((dev_id)=>{
						// console.log("> > > > >", dev_id);
					
						if(device_id.indexOf(dev_id) == -1){
							if(dev_id){
								device_id.push(dev_id);
							}
						}
					});

				}else if(details.idev_id && !isNaN(details.idev_id)){
					device_id.push(details.idev_id);
				}

				let station_status = super.getStatus(0, details.fms_lst_dat_srv_time);

				// console.log(" For stations "+details.fms_name+" is ", station_status);


				if(details.fms_sub_cat_id && [4, 10, 11, 12].includes(parseInt(details.fms_sub_cat_id))) {
					// console.log(' >  > >  > ', parameters);
					blinking_status = self.getBlinkingStatus(details.fms_param_list, parameters, details.fms_sub_cat_id);
					station_status = self.getPumpStatus(parameters, details.fms_sub_cat_id, station_status, details.fms_lst_dat_srv_time);
					if(station_status == 'shutdown'){
						blinking_status = false;
					}

					rainfall_data = await self.getRainfallData(details.fms_id ,details.fms_param_list);

					// console.log('rainfall_data>>>',rainfall_data)

					// if(rainfall_data){
					// 	parameters.rainfall_1 = rainfall_data.rainfall_1;
					// 	parameters.rainfall_24 = rainfall_data.rainfall_24;
					// }

				}

				station_name_list[details.fms_id] = details.fms_name;
				// device_id.push(details.idev_id);
				response_object.station_list.push({
					id: details.fms_id,
					name: details.fms_name,
					last_data_send: details.fms_lst_dat_srv_time,
					latitude: details.fms_lat,
					longitude: details.fms_long,
					category: details.fms_cat_id,
					sub_category: details.fms_sub_cat_id,
					rainfall_1: ((rainfall_data && rainfall_data.rainfall_1)? rainfall_data.rainfall_1 : undefined) ,
					rainfall_24: ((rainfall_data && rainfall_data.rainfall_24)? rainfall_data.rainfall_24 : undefined),
					rainfall_24_trend: ((rainfall_data && rainfall_data.rainfall_24_trend)? rainfall_data.rainfall_24_trend : undefined),
					parameters: parameters,
					blinking_status: blinking_status,
					show_trend:  details.fms_sub_cat_show_trend,
					address: ((details.fms_street)? details.fms_street+', ': '') + ((details.fms_city)? details.fms_city+', ': '') + ((details.fms_state)? details.fms_state+', ': '') + ((details.fms_country)? details.fms_country: ''),
					status: station_status
				});
			};

			if(device_id.length){
				// console.log("all_devices > >", device_id);
				device_details_query += ' AND idev_id IN ('+ device_id.filter(Boolean).toString() +')';
				// response_object.device_query = device_details_query;
				device_details = await super.queryDb(device_details_query);
			}

			device_details.map((device)=>{
				if(!device_info[device.idt_id]){
					device_info[device.idt_id] = {
						type: device.idt_name,
						total_devices: 0,
						running_devices: 0
					}
				}

				device_info[device.idt_id].total_devices += 1;
				let status = super.getStatus(device.idev_is_shutdown, device.last_data_receive_time);
				if(status == 'online'){
					device_info[device.idt_id].running_devices += 1;				
				}
			});

			response_object.device_info = Object.keys(device_info).map((key)=>{
				return device_info[key];
			});
			
			if(events_list.length){
				response_object.event_log = events_list.map((event)=>{
					let station_name = station_name_list[event.fms_id];
					if(station_name){
						return {
							station_id: event.fms_id,
							station_name: station_name,
							time: event.fmsn_time,
							message: event.fmsn_text
						};
					}
				}).filter(Boolean);
			}
			
		}catch(err){
			res.status(500).json({status: 'failure', error: err.message, /* query: device_details_query , */message: 'Something went wrong'});
			return;
		}

		res.json(response_object);
	}

	async getStationOptions(req : express$Request, res : express$Response){
		console.log(this.database);
		let query = 'SELECT flood_monitoring_station_categories.fms_cat_id, fms_cat_name, fms_sub_cat_name, fms_sub_cat_id FROM '+this.database+'.flood_monitoring_station_categories LEFT JOIN '+this.database+'.flood_monitoring_station_sub_categories ON flood_monitoring_station_categories.fms_cat_id = flood_monitoring_station_sub_categories.fms_cat_id';
		let response_obj={
			category_list:[],
			status:'success'
		};
		try{
			let category_list = await super.queryDb(query);
			let difference_object = {};
			category_list.map((category)=>{
				if(!difference_object[category.fms_cat_id]){
					difference_object[category.fms_cat_id] = {
						id:category.fms_cat_id,
						name:category.fms_cat_name,
						sub_category:[]
					};
				}
				if(category.fms_sub_cat_id){
					difference_object[category.fms_cat_id].sub_category.push({
						id:category.fms_sub_cat_id,
						name:category.fms_sub_cat_name
					});
				}
			})

			response_obj.category_list = Object.keys(difference_object).map((cat_id)=>{
				return difference_object[cat_id];
			});

			res.json(response_obj);

		}catch(err){
			res.status(500).json({status: 'failure',error: err.message,message: 'Something went wrong'});
			return;
		}
		// res.json({'message':'We are connected'});
	}

	async getStationDetails(req : express$Request, res : express$Response){
		let self = this, station_id = req.params.id, from_time = req.body.from_time, upto_time = req.body.upto_time;
		if(!isNaN(station_id)){
			let current_time = parseInt(moment.tz("Asia/Kolkata").format('X'));
			
			let station_details_query = "SELECT fms_id, flood_monitoring_stations.fms_sub_cat_id, fms_sub_cat_name, fms_cat_id , idev_id ,fms_name, fms_param_list, idev_id FROM "+ this.database +".flood_monitoring_stations INNER JOIN "+ this.database +".flood_monitoring_station_sub_categories ON flood_monitoring_stations.fms_sub_cat_id = flood_monitoring_station_sub_categories.fms_sub_cat_id WHERE fms_id = ?";

			let parameter_value_query = 'SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM '+ this.database +'.flood_monitoring_stations_raw_data WHERE fms_id = ? AND fms_rd_time > ?'+ (from_time && upto_time ? ' AND fms_rd_time < ?' : '') +' ORDER BY fms_rd_time ASC';
			
			
			let hourly_parameters = ['rain'];
			let no_min_max = ['lat','long','p_status','s_status','v_status'];
			let coordinates = ['lat','long']
			let environmental_keys = [];
			let no_min_max_parameter = [],coordinate_parameter = [],environmental_parameters = [];

			try{

				let station_details = await super.queryDb(station_details_query,[station_id]);

				if(station_details.length){

					let parameter_list = station_details[0].fms_param_list;
					let parameter_list_json = JSON.parse(parameter_list);
					let station_id = station_details[0].fms_id;
					let frm_id = station_details[0].idev_id;
					let station_sub_cat_id = station_details[0].fms_sub_cat_id;

					let station_devices = parameter_list_json.map((param)=>{
						if(param.device_id){
							return param.device_id;
						}
					}).filter(Boolean);

					if(station_devices.length){

						let device_type = await super.queryDb('SELECT `idt_name`, iot_devices.idev_id FROM '+ this.database +'.iot_device_types INNER JOIN '+ this.database +'.iot_devices ON iot_device_types.idt_id = iot_devices.idt_id WHERE idev_id IN ('+ station_devices.toString() +')');
		
						let all_device_types = {};
						device_type.map((dev_typ)=>{
							all_device_types[dev_typ.idev_id] = dev_typ.idt_name;
						});

						parameter_list_json.map((param)=>{
							if(param.device_id){
								if(all_device_types[param.device_id] == 'E' || all_device_types[param.device_id] == 'F'){
									environmental_keys.push(param.key);
								}
							}
						})
					}
					

					let response_obj = {
						details:{
							id:station_details[0].fms_id,
							name:station_details[0].fms_name,
							category:station_details[0].fms_cat_id,
							sub_category:station_details[0].fms_sub_cat_id,
							parameters:[],
						},
						event_log: [],
						status:'success'
					};

					if(station_sub_cat_id && [4, 10, 12].includes(parseInt(station_sub_cat_id))) {
						let special_parameter = await self.getPumpStationDetails(station_id, parameter_list, from_time, upto_time);

						let rainfall_data = await self.getRainfallData(station_id, parameter_list, from_time, upto_time);

						response_obj.details.rainfall_1 = {
							value: 'NA',
							unit: 'NA'
						};
						response_obj.details.rainfall_24 = {
							value: 'NA',
							unit: 'NA'
						};

						if(rainfall_data){
							response_obj.details.rainfall_1 = rainfall_data.rainfall_1;
							response_obj.details.rainfall_24 = rainfall_data.rainfall_24;
							special_parameter.push({
								name: rainfall_data.rainfall_name,
								unit: rainfall_data.rainfall_unit,
								type: rainfall_data.rainfall_type,
								values: rainfall_data.rainfall_24_trend
							})
						}
						
						response_obj.details.parameters = special_parameter;
					} else if(station_sub_cat_id && [11].includes(parseInt(station_sub_cat_id))) {
						response_obj.details.parameters.push({
							name: parameter_list_json[0].name,
							type: parameter_list_json[0].type,
							unit: parameter_list_json[0].unit,
							values: []
						});
						if(!from_time) {
							from_time = current_time - 86400;
						}
						if(!upto_time) {
							upto_time = current_time;
						}
						let rainfallData = await super.queryDb('SELECT fms_fmd_time, fms_fmd_data FROM flood_monitoring_stations_5_min_data WHERE fms_id=? AND fms_fmd_time>? AND fms_fmd_time<=? ORDER BY fms_fmd_time ASC', [station_details[0].fms_id, from_time, upto_time]);
						rainfallData.map((rainData) => {
							let rainfallValue = 0;
							if(super.isValidJson(rainData.fms_fmd_data)) {
								let rainfallParsedData = JSON.parse(rainData.fms_fmd_data);
								if(rainfallParsedData.rain && rainfallParsedData.rain.avg) {
									rainfallValue = rainfallParsedData.rain.avg;
								}
							}
							response_obj.details.parameters[0].values.push({
								timestamp: rainData.fms_fmd_time,
								type: 'rain',
								value: rainfallValue
							});
						});
					} else {
						if(super.isValidJson(parameter_list)){
							parameter_list = JSON.parse(parameter_list);
							let hourly_parameter_list = [];
							let isDone = false;
							if(parameter_list instanceof Array && parameter_list.length){
								response_obj.details.parameters = parameter_list.map((param)=>{
									if(hourly_parameters.indexOf(param.key) != -1){
										hourly_parameter_list.push(param.name);
									}
									if(no_min_max.indexOf(param.key) == -1){
										return {
											name:param.name,
											max_value:null,
											max_value_time:null,
											min_value:null,
											min_value_time:null,
											total:( (param.key == 'rain' )? 0 : undefined ),
											avg_value:( ( environmental_keys.indexOf(param.key) == -1 )? undefined : 0 ),
											values:[],
											unit: param.unit,
											type: ((param.type)? param.type : 'Unknown' )
										};
									}else if(no_min_max.indexOf(param.key) != -1 && coordinates.indexOf(param.key) == -1){
										no_min_max_parameter.push(param.name);
										return {
											name:param.name,
											values:[],
											unit:param.unit,
											type: ((param.unit)? param.unit : 'Unknown')
										}
									}else if(coordinates.indexOf(param.key) != -1){
										
										let index = coordinates.indexOf(param.key);
	
										coordinate_parameter[index] = param.name;
	
										if(!isDone){
											isDone = true;
											return {
												name:'Coordinate',
												values:[],
												unit:param.unit,
												type: ((param.type)? param.type : 'Unknown' )
											};
										}
									}
								}).filter(Boolean);
	
								let parameter_values = await super.queryDb(parameter_value_query, from_time && upto_time ? [station_id, from_time, upto_time] : [station_id,( current_time - 86400 )]);
	
								if(parameter_values.length){
									let parameter_value_list = parameter_values.map((value)=>{
										if(super.isValidJson(value.fms_rd_data)){
											return {
												timestamp:value.fms_rd_time,
												value: super.parseParameters(JSON.stringify(parameter_list),value.fms_rd_data)
											};
										}
									}).filter(Boolean);
	
	
									response_obj.details.parameters.map((param)=>{
										if(hourly_parameter_list.indexOf(param.name) == -1){
	
											param.values = parameter_value_list.map((value)=>{
												let no_of_value = 0;
												let parameter_value = _.find(value.value, {name:param.name})
												if(parameter_value && !isNaN(parameter_value.value)){
	
													console.log(" Demo Object ", param)
	
													if( !isNaN(parameter_value.value) && param.avg_value != undefined ){
														no_of_value++;
														param.avg_value = (((param.avg_value * (no_of_value - 1) ) + parseFloat(parameter_value.value)) / no_of_value);
													}
	
													if(param.max_value == null && !isNaN(parameter_value.value) ){
														param.max_value = parseFloat(parameter_value.value);
														param.max_value_time = value.timestamp;
													}else if(!isNaN(parameter_value.value) && parseFloat(parameter_value.value) > param.max_value ){
														param.max_value = parseFloat(parameter_value.value);
														param.max_value_time = value.timestamp;
													}
	
													if(param.min_value == null && !isNaN(parameter_value.value)){
														param.min_value = parseFloat(parameter_value.value);
														param.min_value_time = value.timestamp;
													}else if(!isNaN(parameter_value.value) && parseFloat(parameter_value.value) < param.min_value ){
														param.min_value = parseFloat(parameter_value.value);
														param.min_value_time = value.timestamp;
													}
	
													return {
														timestamp:value.timestamp,
														value:parameter_value.value
													}
												}else if(param.name == 'Coordinate'){
													let lat = _.find(value.value, {name:coordinate_parameter[0]});
													let long = _.find(value.value, {name:coordinate_parameter[1]});
	
	
													if(!isNaN(lat.value) && !isNaN(long.value)){
														return {
															timestamp:value.timestamp,
															value:[lat.value,long.value]
														}
													}
												}else{
													return {
														timestamp:value.timestamp,
														value:parameter_value.value
													}
												}
	
											}).filter(Boolean);
										}
	
									});
								}
	
	
								if(hourly_parameter_list.length){
									let hourly_parameter_data = await super.queryDb('SELECT fms_id, fms_hd_time, fms_hd_data FROM '+ this.database +'.flood_monitoring_devices_hourly_data WHERE fms_id = ? AND fms_hd_time > ? ORDER BY fms_hd_time ASC',[station_id, ( current_time - 86400 )]);
									
									
	
									let hourly_parameter_data_timeline = [];
									if(hourly_parameter_data.length){
										hourly_parameter_data_timeline = hourly_parameter_data.map((value)=>{
	
											return {
												timestamp:value.fms_hd_time,
												value:super.parseHourlyParameter(JSON.stringify(parameter_list),value.fms_hd_data,hourly_parameter_list)
											}
	
										});

										hourly_parameter_list.map((param_name)=>{
											let param = _.find(response_obj.details.parameters, {name:param_name});

											if(param){
	
												hourly_parameter_data_timeline.map((data)=>{
													let value = _.find(data.value, {name:param_name});
				
													if(!isNaN(value.value.avg)){
	
														let no_of_data = 0;
	
														if(!isNaN(value.value.avg)){
															no_of_data++;
															param.avg_value = (((param.avg_value * (no_of_data - 1) ) + parseFloat(value.value.avg)) / no_of_data);
														}
														
														if(!isNaN(param.total)){
															param.total = param.total + parseFloat(value.value.avg);
														}
	
														if(param.max_value == null && !isNaN(value.value.avg) ){
															param.max_value = parseFloat(value.value.avg);
															param.max_value_time = data.timestamp;
														}else if(!isNaN(value.value.avg) && parseFloat(value.value.avg) > param.max_value ){
															param.max_value = parseFloat(value.value.avg);
															param.max_value_time = data.timestamp;
														}
		
														if(param.min_value == null && !isNaN(value.value.avg)){
															param.min_value = parseFloat(value.value.avg);
															param.min_value_time = data.timestamp;
														}else if(!isNaN(value.value.avg) && parseFloat(value.value.avg) < param.min_value ){
															param.min_value = parseFloat(value.value.avg);
															param.min_value_time = data.timestamp;
														}
	
														param.values.push({
															timestamp:data.timestamp,
															value:value.value.avg
														})
	
													}
	
												});
											}
										});
									}
								}
							}
						}
					}

					let events_log = await super.queryDb("SELECT fms_id,fmsn_time,fmsn_text FROM "+this.database+".flood_monitoring_stations_notification WHERE fms_id = ? ORDER BY fmsn_time DESC LIMIT 20", [station_id] );
					
					if(events_log.length){
						response_obj.event_log = events_log.map((event)=>{
							return {
								station_id: event.fms_id,
								time: event.fmsn_time,
								message: event.fmsn_text
							};
						});
					}
					
					res.json(response_obj);

				}else{
					res.status(404).json({status:'failure',message:'No Stations found'});
					return;
				}
			}catch(err){
				res.status(500).json({status: 'failure',error: err.message,message: 'Something went wrong'});
				return;
			}
		}else{
			res.status(400).json({status:'failure',message:'No Station ID is provided'});
			return;
		}
	}

	async setStationThreshold(req : express$Request, res : express$Response){

		let station_id = req.params.id;
		let threshold_list = req.body.threshold_list;

		if(!isNaN(station_id) && threshold_list && threshold_list instanceof Array){
			try{
	
				let station_details = await super.queryDb("SELECT fms_id, fms_sub_cat_id, fms_param_list FROM "+ this.database +".flood_monitoring_stations WHERE fms_id = ?",[station_id]);
				if(station_details.length){
					let param_list = (super.isValidJson(station_details[0].fms_param_list))? JSON.parse(station_details[0].fms_param_list) : [];
	
					threshold_list.map((threshold)=>{
						if(threshold.threshold){
							let param = _.find(param_list,{name: threshold.param_key});
							console.log("param is",param);
							if(param){
								let index = param_list.indexOf(param);
								param["alert_thresholds"] = threshold.threshold;
								param_list[index] = param;
							}
						}
					});
					
					let isUpdated = await super.queryDb("UPDATE "+ this.database +".flood_monitoring_stations SET fms_param_list = '"+JSON.stringify(param_list)+"' WHERE fms_id = ?",[station_id]);
	
					if(isUpdated){
						res.json({status: 'success'});
					}else{
						res.status(500).json({status: 'failure',message: 'Something went wrong'});
						return;
				
					}
	
				}else{
					res.status(404).json({status: 'failure', message: "No such Station found" });
					return;
				}
	
			}catch(err){
				res.status(500).json({status: 'failure',error: err.message,message: 'Something went wrong'});
				return;
			}
		}else{
			res.status(400).json({
				"status": "failure",
				"message": "Please provide the required data"
			})
		}
	}

	async getForecastTableData(req : express$Request, res : express$Response) {
		const renderContent = (value, row, index) => {
			const obj = {
				children: value,
				props: {},
			};
			return obj;
		};

		const url = 'http://nwp.imd.gov.in/blf/blf_temp/block.php?dis=37KOLKATA';
		let response_obj = {status: 'failure'};
		await http.get(url, (url_res) => {
			const { statusCode } = url_res;

			if (statusCode !== 200) {
				let error = 'Request Failed. Status Code: ' + statusCode;
				console.error('Status Error:', error);
				response_obj.message = error;
				res.json(response_obj);
			}

			let rawData = '';
			url_res.setEncoding('utf8');
			url_res.on('data', (chunk) => { rawData += chunk; });
			url_res.on('end', () => {
				try {
					response_obj.status = 'success';
					rawData = rawData.replace(/<[^>]+>/g, '');
					rawData = rawData.trim().split('\n').map((row, index) => row.trim());
					rawData = rawData.filter(Boolean);
					response_obj.issued_on = rawData[4].split(':')[1].trim() || '';
					// response_obj.title = rawData[2].trim() || '';
					// response_obj.source = rawData[3].trim() || '';
					// response_obj.validity = rawData[5].trim() || '';
					response_obj.title = '5-Days Weather Prediction of Kolkata';
					response_obj.footer = 'Data Source: NWP Model Based District Level Weather Prediction by India Meteorological Department (Valid Till 08:30 IST Of The Next 5 Days)';
					// console.log('rawData[8]:', rawData[8].substring(0, 9));
					if (rawData[8] && rawData[8].substring(0, 10) == 'PARAMETERS') {
						response_obj.columns = [{
							title: 'Parameters',
							dataIndex: 'parameter',
							render: renderContent,
							className: 'bold'
						}];
						for (let i = 0, d = 0; i < 5; i++, d = d + 20) {
							let day = rawData[10].substring(d, (d + 5)).trim(),
								date = rawData[11].substring(d - (i ? 1 : 0), (d + 5 + (i ? 1 : 0))).trim();
							// console.log(i, d);
							// console.log('rawData[11]:', rawData[11].substring(d - (i ? 1 : 0), (d + 5 + (i ? 1 : 0))));
							response_obj.columns.push({
								title: day + ' | ' + date,
								dataIndex: 'model' + (i + 1),
								width: 150,
								render: renderContent,
								align: 'center'
							});
						}
						response_obj.data = [];
						for (let r = 13, i = 1; r <= 20 && i <= 8; r++, i++) {
							response_obj.data.push({
								key: i,
								parameter: rawData[r].substring(0, 30).trim(),
								model1: (rawData[r].substring(30, 50).trim() != -99) ? rawData[r].substring(30, 50).trim() : 'NA',
								model2: (rawData[r].substring(50, 70).trim() != -99) ? rawData[r].substring(50, 70).trim() : 'NA',
								model3: (rawData[r].substring(70, 90).trim() != -99) ? rawData[r].substring(70, 90).trim() : 'NA',
								model4: (rawData[r].substring(90, 110).trim() != -99) ? rawData[r].substring(90, 110).trim() : 'NA',
								model5: (rawData[r].substring(110, 130).trim() != -99) ? rawData[r].substring(110, 130).trim() : 'NA'
							});
						}
					}
					// console.log('Data:', rawData);
					// console.log('Data:', response_obj);
					res.json(response_obj);
				} catch (e) {
					console.error('Catch Error:', e.message);
					response_obj = {status: 'failure'};
					response_obj.message = e.message;
					res.json(response_obj);
				}
			});
		}).on('error', (e) => {
			console.error('Got Error:', e.message);
			response_obj.message = e.message;
			res.json(response_obj);
		});
	}

	async getForecastDetails(req : express$Request, res : express$Response) {
		let response_obj = {
			categories: [
				{
					name: 'Live Weather',
					slug: 'live-weather',
					contents: [
						{
							name: 'Infra Red',
							slug: 'infra-red',
							url: 'http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg'
						},
						{
							name: 'Satellite',
							slug: 'satellite',
							url: 'http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg'
						},
						{
							name: 'Colour Composite',
							slug: 'colour-composite',
							url: 'http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF'
						},
						{
							name: 'Heat Map',
							slug: 'heat-map',
							url: 'http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg'
						},
						{
							name: 'Wind Direction',
							slug: 'wind-direction',
							url: 'http://www.monsoondata.org/wx2/india4.00hr.png'
						},
						{
							name: 'Temperature',
							slug: 'temperature',
							url: 'http://www.monsoondata.org/wx2/ezindia4_day1.png'
						}
					]
				},
				{
					name: 'Rainfall Forecast',
					slug: 'rainfall-forecast',
					contents: [
						{
							name: '3 Hours',
							slug: '3-hours',
							url: 'http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg'
						},
						{
							name: 'Tomorrow',
							slug: 'tomorrow',
							url: 'http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif'
						},
						{
							name: '2 Days',
							slug: '2-days',
							url: 'http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif'
						},
						{
							name: '3 Days',
							slug: '3-days',
							url: 'http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif'
						},
						{
							name: '4 Days',
							slug: '4-days',
							url: 'http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif'
						},
						{
							name: '5 Days',
							slug: '5-days',
							url: 'http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif'
						},
						{
							name: '6 Days',
							slug: '6-days',
							url: 'http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif'
						},
						{
							name: '7 Days',
							slug: '7-days',
							url: 'http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif'
						},
						{
							name: '8 Days',
							slug: '8-days',
							url: 'http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif'
						},
						{
							name: '9 Days',
							slug: '9-days',
							url: 'http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif'
						},
						{
							name: '10 Days',
							slug: '10-days',
							url: 'http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif'
						},
						{
							name: 'Meteogram',
							slug: 'meteogram',
							url: 'http://www.monsoondata.org/wx2/kolkgfs.png'
						}
					]
				},
				{
					name: 'Doppler Radar Data',
					slug: 'doppler-radar-data',
					contents: [
						{
							name: 'Surface Rainfall Intensity',
							slug: 'surface-rainfall-intensity',
							url: 'http://www.imd.gov.in/section/dwr/img/sri_kol.gif'
						},
						{
							name: 'Precipitation Accumulation (PAC) 24 hrs',
							slug: 'precipitation-accumulation-pac-24-hrs',
							url: 'http://www.imd.gov.in/section/dwr/img/pac_kol.gif'
						}
					]
				}
			],
			status: 'success'
		};
		// console.log(JSON.stringify(response_obj));
		res.json(response_obj);
	}

	async getStationReport(req : express$Request, res : express$Response, pass = 1) {

		var start;
		var start1;

		start = Date.now();

		let self = this,
			current_time = parseInt(moment.tz('Asia/Kolkata').format('X')),
			station_ids = req.body.stations || [],
			sub_category = req.body.sub_category,
			from_time = req.body.from_time,
			upto_time = req.body.upto_time,
			data_type = req.body.data_type || 'raw',
			avg_data_time = req.body.avg_data_time || null,
			data_format = req.body.view_data_format || [],
			response_data = {status: 'success'};

		console.log('station_ids', station_ids.join());
		if(
			(station_ids && station_ids.length) &&
			(sub_category && !isNaN(sub_category)) &&
			(from_time && !isNaN(from_time)) &&
			(upto_time && !isNaN(upto_time)) &&
			(data_type && ['raw', 'avg'].includes(data_type)) &&
			(
				(data_type == 'avg' && avg_data_time && !isNaN(avg_data_time)) ||
				(data_type == 'raw')
			) &&
			(data_format && data_format.length)
		){

			let hourly_parameters = ['rain'],
				no_min_max = ['lat','long','p_status','s_status','v_status'],
				coordinates = ['lat','long'],
				environmental_keys = [],
				no_min_max_parameter = [],
				coordinate_parameter = [],
				environmental_parameters = [],
				avg_data_table = 'flood_monitoring_stations_15_min_data';
				if (avg_data_time == 3600) {
					avg_data_table = 'flood_monitoring_stations_hourly_data';
				} else if (avg_data_time == 86400) {
					avg_data_table = 'flood_monitoring_stations_daily_data';
				}

			try {

				console.log('stationids',station_ids)

				console.log('from',from_time)

				console.log('to',upto_time)

				let station_details_arr = await super.queryDb('SELECT `fms_id`, flood_monitoring_stations.fms_sub_cat_id, `fms_sub_cat_name`, `fms_cat_id` , `idev_id`, `fms_name`, `fms_param_list`, `idev_id` FROM `'+ this.database +'`.`flood_monitoring_stations` INNER JOIN `'+ this.database +'`.`flood_monitoring_station_sub_categories` ON flood_monitoring_stations.fms_sub_cat_id = flood_monitoring_station_sub_categories.fms_sub_cat_id WHERE `fms_id` IN (?)', [station_ids]);
				let raw_parameter_data = await super.queryDb('SELECT `fms_id`, `fms_rd_time`, `fms_rd_data` FROM `'+ this.database +'`.`flood_monitoring_stations_raw_data` WHERE `fms_id` IN (?) AND `fms_rd_time` >= ? AND `fms_rd_time` <= ? ORDER BY `fms_rd_time` ASC', [station_ids, from_time, upto_time]);
				let avg_parameter_data = await super.queryDb('SELECT `fms_id`, `fms_hd_time`, `fms_hd_data` FROM `'+ this.database +'`.`'+ avg_data_table +'` WHERE `fms_id` IN (?) AND `fms_hd_time` >= ? AND `fms_hd_time` <= ? ORDER BY `fms_hd_time` ASC', [station_ids, from_time, (upto_time + 1)]);
				//let pump_status_change_logs = await super.queryDb('SELECT `fms_id`, `fms_pump_key`, `fms_scl_time`, `fms_scl_status` FROM `'+ this.database +'`.`flood_monitoring_stations_status_change_logs` WHERE `fms_id` IN (?) AND `fms_scl_time` >= ? AND `fms_scl_time` <= ? ORDER BY `fms_scl_time` ASC', [station_ids, from_time, upto_time]);
				//let pump_previous_status = await super.queryDb('SELECT tbl.fms_id, tbl.fms_pump_key, tbl.fms_scl_time, tbl.fms_scl_status FROM ' + this.database + '.flood_monitoring_stations_status_change_logs AS tbl INNER JOIN (SELECT fms_id, MAX(fms_scl_time) max_time, fms_pump_key, fms_scl_status FROM ' + this.database + '.flood_monitoring_stations_status_change_logs WHERE fms_id IN (?) AND fms_scl_time < ? GROUP BY fms_id, fms_pump_key) AS max_tbl ON tbl.fms_id = max_tbl.fms_id AND tbl.fms_scl_time = max_tbl.max_time AND tbl.fms_pump_key=max_tbl.fms_pump_key', [station_ids, from_time]);
				//let pump_previous_status = await super.queryDb('SELECT `fms_id`, `fms_pump_key`, `fms_scl_time`, `fms_scl_status` FROM `'+ this.database +'`.`flood_monitoring_stations_status_change_logs` WHERE `fms_id` IN (?) AND `fms_scl_time` IN (SELECT MAX(`fms_scl_time`) as `fms_scl_time` FROM `'+ this.database +'`.`flood_monitoring_stations_status_change_logs` WHERE `fms_id` IN (?) AND `fms_scl_time` < ? GROUP BY `fms_id`, `fms_pump_key`) GROUP BY `fms_id`, `fms_pump_key`', [station_ids, station_ids, from_time]);

				//console.log('raw_parameter_data', raw_parameter_data);

				//console.log('avg_parameter_data', avg_parameter_data);
				//console.log('pump_previous_status', pump_previous_status);
				//console.log('pump_status_change_logs', pump_status_change_logs);

				station_details_arr = JSON.parse(JSON.stringify(station_details_arr));

				if (station_details_arr && station_details_arr.length) {
					
					response_data.stations_data = [];

					station_details_arr.map((station_details) => {
						// console.log('station_details', station_details);

						//start1 = Date.now();

						let parameter_list = station_details.fms_param_list;
						let parameter_list_json = JSON.parse(parameter_list);
						let station_id = station_details.fms_id;
						let station_name = station_details.fms_name;
						let station_subcat = station_details.fms_sub_cat_name;
						let frm_id = station_details.idev_id;
						let station_sub_cat_id = station_details.fms_sub_cat_id;
						let table_data = [];
						let sanjay_data = [];
						let temp_data = {};
						let total_rainfall = 0;
						let rainfall_unit = '';

						if (data_type === 'avg' && avg_data_time && parameter_list && avg_parameter_data && avg_parameter_data.length && ![4, 10, 12].includes(parseInt(station_sub_cat_id))) {
							for (let i = from_time; i <= upto_time && (i + avg_data_time) <= current_time; i += avg_data_time) {
								avg_parameter_data.map((avg_data) => {
									let avg_from_time = (avg_data.fms_hd_time - avg_data_time),
										param_data = super.parseParameters(parameter_list, avg_data.fms_hd_data),
										param_time = [avg_from_time, avg_data.fms_hd_time];
									if (avg_data.fms_id == station_id && avg_from_time == i && !temp_data[i]) {
										// console.log('parsed data', param_data);
										temp_data[i] = {
											time: param_time,
											parameters: Object.keys(param_data).map((key) => {
												let data = param_data[key];
												if ([11].includes(parseInt(station_sub_cat_id))) {
													data.value = data.value.avg;
													if (!isNaN(data.value) && station_sub_cat_id == 11) {
														rainfall_unit = data.unit;
														total_rainfall = (total_rainfall + parseFloat(data.value));
													}
												} else {
													data.data = data.value;
													data.value = undefined;
												}
												return data;
											})
										};
									}
								});
								if (temp_data[i] && temp_data[i].time[0] == i) {
									table_data.push(temp_data[i]);
								} else {
									let param_data = super.parseParameters(parameter_list, {});
									table_data.push({
										time: [i, (i + avg_data_time)],
										parameters: Object.keys(param_data).map((key) => {
											let data = param_data[key];
											if ([11].includes(parseInt(station_sub_cat_id))) {
												data.value = 'NA';
											} else {
												data.data = 'NA';
												data.value = undefined;
											}
											return data;
										})
									});
								}
								// console.log('temp_data', temp_data);
							}
						} else if (data_type === 'avg' && avg_data_time && parameter_list_json && parameter_list_json.length && [4, 10, 12].includes(parseInt(station_sub_cat_id))) {

							let prev_status = {};
							let prev_pump_status = {};
							if (pump_previous_status && pump_previous_status.length) {
								pump_previous_status.map((pump) => {
									if (pump.fms_id == station_id) {
										prev_status[pump.fms_pump_key] = pump.fms_scl_status;
										prev_pump_status[pump.fms_pump_key] = {
											time: pump.fms_scl_time,
											status: pump.fms_scl_status
										};
									}
								});
								// console.log('prev_pump_status', prev_pump_status);
							}

							for (let i = from_time; i <= upto_time && (i + avg_data_time) <= current_time; i = (i + avg_data_time)) {
								let param_list = [];
								parameter_list_json.map((param) => {
									let activities = pump_status_change_logs.map((pump) => {
										let this_date = moment.unix(pump.fms_scl_time).tz('Asia/Kolkata').format('DD-MM-YYYY'),
											today = moment.unix(current_time).tz('Asia/Kolkata').format('DD-MM-YYYY');
										if (
											pump.fms_id == station_id &&
											pump.fms_pump_key == param.key &&
											pump.fms_scl_time >= i &&
											pump.fms_scl_time < (i + avg_data_time) &&
											(
												(
													this_date === today &&
													pump.fms_scl_time <= current_time
												) || (
													this_date != today
												)
											)
										) {
											return {
												time: parseInt(pump.fms_scl_time),
												status: parseInt(pump.fms_scl_status)
											};
										}
									}).filter(Boolean);

									let level = {};
									if (param.type != 'pump_status' && avg_parameter_data && avg_parameter_data.length) {
										avg_parameter_data.map((avg_data) => {
											if (
												avg_data.fms_id == station_id &&
												avg_data.fms_hd_time == (i + avg_data_time)
											) {
												// console.log('avg_data', avg_data.fms_hd_data);
												let param_data = super.parseParameters(parameter_list, avg_data.fms_hd_data),
													param_time = [(avg_data.fms_hd_time - avg_data_time), avg_data.fms_hd_time];
												// console.log('parsed param_data', param_data);
												param_data.map((prm) => {
													if (prm.type == param.type) {
														level = prm.value;
													}
												});
											}
										});
									}

									param_list.push({
										name: param.name,
										type: param.type,
										rh: param.type == 'pump_status' ? super.getRhValue(prev_status[param.key], activities, i, (i + avg_data_time)) : undefined,
										activities: param.type == 'pump_status' ? activities : undefined,
										data: param.type != 'pump_status' ? level : undefined,
										unit: param.type != 'pump_status' ? param.unit : undefined
									});
									if (activities && activities.length) {
										prev_status[param.key] =  activities[(activities.length - 1)].status;
									}
								}).filter(Boolean);
								table_data.push({
									time: [i, (i + avg_data_time)],
									parameters: param_list
								});
							}
						} else if (data_type === 'raw' && ![11].includes(parseInt(station_sub_cat_id))) {
							
							/*table_data = raw_parameter_data.map((raw_data) => {
								if (raw_data.fms_id == station_id) {
									let param_data = super.parseParameters(parameter_list, raw_data.fms_rd_data);
									// console.log('parsed', param_data);

									sanjay_data.push(raw_data);

									return {
										time: raw_data.fms_rd_time,
										parameters: Object.keys(param_data).map((key) => param_data[key])
									};
								}
							}).filter(Boolean);*/

							//console.log(raw_parameter_data);

							for(var i=0;i<raw_parameter_data.length;i++){

								if(raw_parameter_data[i].fms_id == station_id){
	
									sanjay_data.push(raw_parameter_data[i]);
	
								}
	
							}
	
							table_data = sanjay_data;

						}

						response_data.stations_data.push({
							id: station_id,
							name: station_name,
							from_time: from_time,
							upto_time: upto_time,
							sub_category: station_subcat,
							total_rainfall: station_sub_cat_id == 11 ? ((rainfall_unit ? (total_rainfall.toFixed(2) + ' ') : '-') + rainfall_unit) : undefined,
							sanjay_data : sanjay_data,
							table_data
						});

						//console.log("start1",(Date.now()-start1)/1000);

					});

				} else {
					res.status(200).json({status: 'failure', message: 'No Stations found!'});
					return;
				}
			} catch(err) {
				console.log(err);
				res.status(500).json({status: 'failure', error: err.message, message: 'Something went wrong!'});
				return;
			}
		} else {
			res.status(400).json({status: 'failure', message: 'Invalid options are provided!'});
			return;
		}

		//console.log(JSON.stringify(response_data));

		// console.log(JSON.stringify(response_data.stations_data));

		if (pass) {
			res.json(response_data);
		} else {
			return response_data.stations_data;
		}

		console.log("time",(Date.now()-start)/1000);

	}

	async downloadStationReport(req : express$Request, res : express$Response) {

		let self = this;
		req.body = {
			stations: JSON.parse(req.query.stations),
			sub_category: parseInt(req.query.sub_category),
			from_time: parseInt(req.query.from_time),
			upto_time: parseInt(req.query.upto_time),
			data_type: req.query.data_type || 'raw',
			avg_data_time: parseInt(req.query.avg_data_time),
			view_data_format: JSON.parse(req.query.view_data_format)
		};
		// console.log('req', req.body);
		let time_duration = moment.unix(parseInt(req.query.from_time)).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY') + ' - ' + moment.unix(parseInt(req.query.upto_time)).tz('Asia/Kolkata').format('HH:mm, DD MMM YYYY');
		let stations_data = await self.getStationReport(req, res, 0);
		// console.log('stations_data', JSON.stringify(stations_data));
		let stations_data_csv = self.createParameterCSV(stations_data, req.query.data_type, req.query.from_time, req.query.upto_time, req.query.avg_data_time);

		res.attachment('Report for Flood Monitoring - ' + stations_data[0].sub_category + ' - ' + time_duration + '.csv');
		res.write(stations_data_csv);
		res.end();
	}
}