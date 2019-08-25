'use strict';

var moment = require('moment-timezone');
var mysql = require('mysql');
var random = require('randomatic');

let config = {
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'phoenzbi_data',
	port: 3306,
	connectionLimit: 10
};

let special_parameter = ['lat','long','temp','humidity','s_status','p_status','v_status','p1','p2','p3'];
let hourly_parameter = ['rain'];

let special_parameter_list = {
	lat:{
		lower:225337639,
		upper:227789899
	},
	long:{
		lower:883611273,
		upper:884552023
	},
	temp:{
		lower:8,
		upper:45
	},
	humidity:{
		lower:20,
		upper:98
	},
	v_status:{
		data_set:['ON','OFF']		
	},
	s_status:{
		data_set:['ON','OFF']
	},
	p_status:{
		data_set:['ON','OFF']		
	},
	p1:{
		data_set:['ON','OFF','ON','OFF','ON','OFF','ON','OFF','ON','OFF']		
	},
	p2:{
		data_set:['ON','OFF','ON','OFF','ON','OFF','ON','OFF','ON','OFF']		
	},
	p3:{
		data_set:['ON','OFF','ON','OFF','ON','OFF','ON','OFF','ON','OFF']		
	}
}

let db_pool = mysql.createPool(config);

let industry_id = 1;

let randomize_dg_list = [];

let opt_on_pogress = null;

let on_trigger = [];


var pushDeviceStatus = function(device_id, from_data){
	// iot_device_connectivity_status_history

	let device_ids = [];
	let current_time = parseInt(moment.tz('Asia/Kolkata').format('X'));

	if(!isNaN(device_id)){
		device_ids = [device_id];
	}else if(isValidJson(device_id) ){
		device_ids = JSON.parse(device_id);
	}
	// console.log('device_ids > ', device_ids);
	
	let start_time = from_data;
	let new_status = 0;

	while(start_time <= current_time){
		let random_time = getRandom(10, 7600);
		start_time = start_time + random_time;
		device_ids.map((dev_id)=>{
			queryDb('INSERT INTO iot_device_connectivity_status_history ( idev_id, idcsh_time, idcsh_status ) VALUES ( ? , ?, ?)',[ dev_id, start_time, new_status ]).then((err,result)=>{
				if(err) {
					console.log('Error is >>' , err);
				}
				else{
					let query;
					if(new_status){
						query = 'UPDATE iot_devices SET last_online_time = '+ start_time +' , last_data_receive_time = '+ start_time +' WHERE idev_id = '+ dev_id;
					}else{
						query = 'UPDATE iot_devices SET last_data_receive_time = '+ start_time +' WHERE idev_id = '+ dev_id;
					}
					queryDb(query);
				}
			});
		});
		if(new_status){
			new_status = 0;
		}else{
			new_status = 1;
		}
	}
}

function getRandomFloat(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return parseFloat(((Math.random() * (max - min)) + min).toFixed(2));
}

function getRandom(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return parseInt(Math.floor(Math.random() * (max - min)) + min);
}

let isValidJson = function(json_string){
	try{
		JSON.parse(json_string);
		return true;
	}catch(err){
		return false;
	}
}

let queryDb = function(query,options){
	let self = this; 
	return new Promise((resolve,reject)=>{
		if(options){
			db_pool.query(query,options,(err,result)=>{
				if(err) reject(err);
				else resolve(result);
			});
		}else{
			db_pool.query(query,(err,result)=>{
				if(err) {
					console.log(err.message);
					reject(err);
				}else {
					resolve(result);
					// Controller.dbConnection.release();					
				};
			});
		}
	});
};

var fillDemoData = function(id, parameter_list, added_at, device_ids){
	// console.log('device_ids >>>>>>>>> ', device_ids);
	
	pushDeviceStatus(device_ids, added_at);
	if(isValidJson(parameter_list)){
		parameter_list = JSON.parse(parameter_list);

		// console.log('Parameter List > ',parameter_list);

		let start_time = parseInt(added_at);

		let current_time = parseInt(moment.tz('Asia/Kolkata').format('X'));

		while(start_time < current_time){

			let parameter_object = {};
			
			parameter_list.map(function(parameter){

				if(hourly_parameter.indexOf(parameter.key) == -1){

					if( special_parameter.indexOf(parameter.key) == -1 ){

						parameter_object[parameter.key] = getRandom(0,300);

					}else{

						let data_limits = special_parameter_list[parameter.key];
						console.log(parameter.key, data_limits);
						if(data_limits && data_limits.upper && data_limits.lower){
						
							if(parameter.key == 'lat' || parameter.key == 'long'){
								let data =getRandom(data_limits.lower,data_limits.upper);						
								data = parseFloat( data / 10000000);
								parameter_object[parameter.key] = data;														
							}else{
								parameter_object[parameter.key] = getRandom(data_limits.lower,data_limits.upper);						
							}
						
						}else if(data_limits && data_limits.data_set){
							let index = getRandom(0,data_limits.data_set.length);
							parameter_object[parameter.key] = data_limits.data_set[index];
						}
					}
				}else{

					parameter_object.rain = {
						"min": 0,
						"max": 0,
						"avg": 0,
						"min_at": 0,
						"max_at": 0
					};

					parameter_object.rain.min = getRandom(0,10);
					parameter_object.rain.max = getRandom(10,20);
					parameter_object.rain.avg = getRandom(parameter_object.rain.min,parameter_object.rain.max);
					parameter_object.rain.min_at = getRandom((start_time - 3600),start_time);
					parameter_object.rain.max_at = getRandom((start_time - 3600),start_time);

				}

			});

			if(parameter_object.rain){
				let dummy = {
					rain: parameter_object.rain
				};
				queryDb('INSERT INTO `flood_monitoring_stations_hourly_data`(`fms_id`, `fms_hd_time`, `fms_hd_data`) VALUES (?,?,?)',[ id, start_time, JSON.stringify(dummy) ]).then((result)=>{
					// console.log('Inserted Rainfall Data for >> ', id);
				});
			}
			
			let data = JSON.parse(JSON.stringify(parameter_object));
			delete data.rain;
			queryDb('INSERT INTO `flood_monitoring_stations_raw_data`(`fms_id`, `fms_rd_time`, `fms_rd_data`) VALUES (?,?,?)',[ id, start_time, JSON.stringify(parameter_object) ]).then((err)=>{
				console.log('Inserted Raw Data for >> ', id);
			});
			
			queryDb('UPDATE iot_devices SET last_raw_data = ? , last_data_receive_time = ? WHERE idev_id = ?', [JSON.stringify(parameter_object), start_time, id]).then((result)=>{
				console.log('Update Device for >> ', id);
			});

			queryDb('UPDATE flood_monitoring_stations SET fms_lst_data = ? , fms_lst_dat_time = ? , fms_lst_dat_srv_time = ? WHERE  fms_id = ?',[ JSON.stringify(parameter_object), start_time, start_time, id ]).then((err)=>{
				console.log('Updated Parameter Data for >> ', id);				
			});

			start_time += 3600;
		}
	}
};


var demo_dg_dataFill = function(){
	try{
		let current_time = parseInt(moment.tz("Asia/Kolkata").format('X'));			
		
		queryDb('SELECT fms_id, fms_param_list, fms_added_at, idev_id FROM flood_monitoring_stations').then((result)=>{
			result.map((data)=>{
				fillDemoData(data.fms_id, data.fms_param_list, parseInt(current_time - 86400), data.idev_id);
			});
		}).catch((err)=>{
			console.log(err.message);
		});

	}catch(err){
		console.log(err.message);
	}
};

demo_dg_dataFill();
// historyDailyRHSegregation(5);