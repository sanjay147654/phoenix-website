import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Drawer, Radio, DatePicker, Checkbox, Form, Input, Table, notification, TreeSelect } from 'antd';
import Head from './imports/Head';
import Side from './imports/Side';
import ArchiveReports from './imports/ArchiveReports';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import moment from 'moment-timezone';
import Loading from './imports/Loading';
import ReactDataGrid from "react-data-grid";

const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const aqi = ['aqi1', 'aqi2', 'aqi3'];
const weather = ['weather1', 'weather2', 'weather3'];
const other = ['other1', 'other2', 'other3'];
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const plainoptions = [
	{ label: 'Apple', value: 'Apple' },
	{ label: 'Pear', value: 'Pear' },
	{ label: 'Orange', value: 'Orange' },
];

const columns = [
	{
	  name: 'TimeStamp',
	  key: 'time'
	},
	{
	  name: 'Temperature',
	  key: 'temperature'
	},
	{
	  name: 'Humidity',
	  key: 'humidity'
	},
	{
	  name: 'PM10',
	  key: 'pm10'
	},{
		name: 'PM2.5',
		key: 'pm25'
	}
];

const graph1 = {
	chart: {
			type: 'line',
			height: 400
		},
		boost: {
			useGPUTranslations: true
		},
		title: {
				text: ''
		},
		xAxis: {
				categories: ['DAY-1', 'DAY-2', 'DAY-3', 'DAY-4', 'DAY-5']
		},
		yAxis: {
				title: {
						text: ''
				},
				labels: {
						enabled: false
				}
		},
		plotOptions: {
				line: {
						dataLabels: {
								enabled: true
						},
						enableMouseTracking: true
				}
		},
		series: [{
			showInLegend: false, 
				name: '',
				data: [7.0, 6.9, 9.5, 7.5, 1.4]
		}]
};

const graph2 = {
	chart: {
			type: 'line',
			height: 400
		},
		boost: {
			useGPUTranslations: true
		},
		title: {
				text: ''
		},
		xAxis: {
				categories: ['DAY-1', 'DAY-2', 'DAY-3', 'DAY-4', 'DAY-5']
		},
		yAxis: {
				title: {
						text: ''
				},
				labels: {
						enabled: false
				}
		},
		plotOptions: {
				line: {
						dataLabels: {
								enabled: true
						},
						enableMouseTracking: true
				}
		},
		series: [{
				name: 'Max',
				data: [7.0, 6.9, 9.5, 11.5, 7.4]
		}, {
				name: 'Min',
				data: [3.9, 4.2, 5.7, 8.5, 4.9]
		}]
};

const city = [];
for (let i = 1; i < 12; i++) {
	city.push(<Option key={'City - ' + i}>{'City - ' + i}</Option>);
}

const device = [];
for (let i = 1; i < 12; i++) {
	device.push(<Option key={'Device - ' + i}>{'Device - ' + i}</Option>);
}

function handleChange(value) {}

function onChange(value, dateString) {
	console.log('Selected Time: ', value);
	console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
	console.log('onOk: ', value);
}

/*const deviceData = [{
	title: 'Device-1',
	value: 'device-1',
	key: '0-0',
}, {
	title: 'Device-2',
	value: 'device-2',
	key: '0-1',
}, {
	title: 'Device-3',
	value: 'device-3',
	key: '0-2',
}, {
	title: 'Device-4',
	value: 'device-4',
	key: '0-3',
}, {
	title: 'Device-5',
	value: 'device-5',
	key: '0-4',
}];*/

let treeData = [];

function disabledDate(current) {
	// Can not select future dates
	return current && current >= moment().tz('Asia/Kolkata').endOf('day');
}

class Archive extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			map_fms_to_aura: {
				'225': '301',
				'226': '302',
			},
			param_name_list: {
				'hourly_aqi': 'AQI',
				'wind_rose': 'Wind Rose',
				'pollution_rose': 'Pollution Rose'
			},
			hourly_aqi_type: 'hourly_aqi',
			wind_rose_type: 'wind_rose',
			pollution_rose_type: 'pollution_rose',
			rain_param_type: 'rain',
			avg_time: 3600,
			avg_data_time_aura: 1,
			Rainfall_type: 11,
			Major_Road_Junction: 1,
			Street_Sub_House_Front: 2,
			Rainfall: 11,
			// Pump_Station: 4,
			Open_Canal: 5,
			Gated_Canal: 6,
			// Major_Road_Junction_water: 7,
			Street_Sub_House_Front_water: 7,
			Bus: 9,
			Pump_Station_Status: 4,
			pump_station_2: 12,
			aura_infra: 13,
			rainfall_type: 'rainfall',
			sump_type_graph: 'sump_level',
			pump_status_type: 'pump_status',
			penstock_type_graph: 'penstock_level',
			data_type: 'raw',
			conversion_type: 'usepa',
			view_data_format: ['grid', 'graph'],
			data_type_check: true,
			value: 1,
			value1: 1,
			value2: 1,
			value3: 1,
			value4: 1,
			startValue: null,
			endValue: null,
			valueDevice: [],
			endOpen: false,
			drawDataVisible: false,
			city_list: [
				{
					id:1,
					name: 'Bhubaneswar'
				},{
					id:2,
					name: 'Chennai'
				},{
					id:3,
					name: 'Kolkata'
				}
			],
			stations_selected: [],
			stations_placeholder: 'Select Stations',
			city_placeholder: 'Select City',
			show_form: true,
			show_report: false,
			stations_raw_data : []
		};
		console.log('show in constructor');
		this.hourly_aqi = {
			'name': 'AQI',
			'key': 'hourly_aqi',
			'unit': ''
		};
		this.wind_rose = {
			'name': 'Wind Rose',
			'key': 'wind_rose',
			'unit': ''
		};
		this.pollution_rose = {
			'name': 'Pollution Rose',
			'key': 'pollution_rose',
			'unit': ''
		};
		this.pollutants = [
			{
				'name': 'PM<sub>2.5</sub>',
				'key': 'pm2.5',
				'unit': ''
			},
			{
				'name': 'PM<sub>10</sub>',
				'key': 'pm10',
				'unit': ''
			},
			{
				'name': 'CO',
				'key': 'co',
				'unit': ''
			},
			{
				'name': 'CO<sub>2</sub>',
				'key': 'co2',
				'unit': ''
			},
			{
				'name': 'NO<sub>2</sub>',
				'key': 'no2',
				'unit': ''
			},
			{
				'name': 'SO<sub>2</sub>',
				'key': 'so2',
				'unit': ''
			},
			{
				'name': 'NH<sub>3</sub>',
				'key': 'nh3',
				'unit': ''
			},
			{
				'name': 'O<sub>3</sub>',
				'key': 'o3',
				'unit': ''
			},
			{
				'name': 'NO',
				'key': 'no',
				'unit': ''
			},
			{
				'name': 'NO<sub>x</sub>',
				'key': 'nox',
				'unit': ''
			}
		];
		this.pollutants_name = {
			'pm2.5': 'PM<sub>2.5</sub>',
			'pm10': 'PM<sub>10</sub>',
			'co': 'CO',
			'co2': 'CO<sub>2</sub>',
			'no2': 'NO<sub>2</sub>',
			'so2': 'SO<sub>2</sub>',
			'nh3': 'NH<sub>3</sub>',
			'o3': 'O<sub>3</sub>',
			'no': 'NO',
			'nox': 'NO<sub>x</sub>',
			'hourly_aqi': 'AQI',
			'wind_rose': 'Wind Rose',
			'pollution_rose': 'Pollution Rose',
			'temperature': 'Temperature',
			'humidity': 'Humidity',
			'noise': 'Noise',
			'press': 'Pressure',
			'rain': 'Rainfall'
		};
		this.station_type = null;
		this.all_parameters_of_station = [];
	}

	mapFmsToAura(st_id) {
		return st_id;
	}

	componentDidMount() {
		document.title = 'Reports - Flood Forecasting and Early Warning System';
		// console.log('in mount');
		
		this.retriveData();
		// this.get_details_of_stations();
		// this.get_all_cities();
		let is_admin = false;
		if (document.getElementById('user_type') && document.getElementById('user_type').value == 'admin') {
			is_admin = true;
		}
		this.setState({
			is_admin: is_admin
		});
	}

	/**
	 * Predefined function of ReactJS.  It is called every time the component updates.
	 * @param  {Object} prevProps Previous Props
	 */
	componentDidUpdate(prevProps, prevState) {
		// console.log('componentDidUpdate 11', prevState.value);
		// console.log('componentDidUpdate 12', this.state.value);
		if (prevState.value != this.state.value && !this.state.child_updated) {
			this.setState({
				stations_selected:[],
				selected_parameters: [],
				checked_parameters: []
			});
			if (this.state.value == this.state.Rainfall_type) {
				// console.log('componentDidUpdate 2');
				this.handleDataTypeSelection({
					target: {
						value: 'avg'
					}
				});
			}
		}
	}

	setInParent(from_time,upto_time,avg_time,avg_data_time_aura,filtered_station_list_fms,stations_placeholder,stations_selected,all_stations_fms,value,data_type, params_selected, params_select_option, all_parameters_of_station, conversion_type) {
		this.all_parameters_of_station = all_parameters_of_station;
		this.setState({
			from_time: from_time,
			upto_time: upto_time,
			avg_time: avg_time,
			avg_data_time_aura: avg_data_time_aura,
			filtered_station_list_fms: filtered_station_list_fms,
			stations_selected: stations_selected,
			all_stations_fms: all_stations_fms,
			value: value,
			data_type: data_type,
			params_selected: params_selected,
			params_select_option: params_select_option,
			conversion_type: conversion_type,
			child_updated: true,
		}, () => {
			this.getReport();
		});
	}

	/**
	 * This function is used to retrieve the category list.
	 * @return {void}    
	 */
	retriveData() {
		let that = this;
		let response_status;
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/options', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			response_status = Response.status;
			return Response.json();
		}).then(function(json) {
			// response_status = 403;
			if (response_status == 403) {
				that.setState({
					unauthorised_access_list: true,
					unauthorised_access_list_msg: json.message
				});
			}
			else if (json.status === 'success') {
				// console.log('category_list:', json.category_list);
				treeData = [];
				let category_list_json = json.category_list;
				let category_list = [];

				if (category_list_json && category_list_json.length) {
					category_list_json.map((category) => {
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								if (sub_cat.id < 13) {
									obj1.push({
										'name': sub_cat.name,
										'id': sub_cat.id
									});
								}
							});
						}
						category_list.push({
							id: category.id,
							name: category.name,
							sub_category: obj1
						});
					});
				}
				if (category_list && category_list.length) {
					category_list.map((category) => {
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								obj1.push({
									'title': sub_cat.name,
									'value': sub_cat.id,
									'key': sub_cat.id,
								});
							});
						}
						treeData.push({
							title: category.name,
							value: '0-' +  category.id,
							key: '0-' +  category.id,
							children: obj1
						});
					});
				}
				let value = [];
				/*if (treeData && treeData.length) {
					value.push(treeData[0].children[0].value);
				}*/
				/*if (that.state.category_selected && that.state.category_selected && that.state.sub_category_selected && that.state.sub_category_selected.length == 0) {
					value.push('0-' + that.state.category_selected);
				} else*/ if (that.state.sub_category_selected) {
					value.push(that.state.sub_category_selected);
				}
				let sub_category_object = {};
				if (category_list && category_list.length) {
					category_list.map((cat) => {
						if (cat.sub_category && cat.sub_category.length) {
							cat.sub_category.map((sub) => {
								if (!sub_category_object[sub.id]) {
									sub_category_object[sub.id] = sub.name;
								} else {
									sub_category_object[sub.id] = sub.name;
								}
							})
						}
					});
				}
				that.setState({
					unauthorised_access_list: false,
					category_list: category_list,
					treeData: treeData,
					// value: value,
					sub_category_object: sub_category_object
				}, () => {
					// console.log('treeData', that.state.treeData);
					that.fetchData();
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					unauthorised_access_list: false,
				});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}

	/**
	 * Function used to get the data for the report form.
	 * @param {Boolean} update 
	 * @return {void} 
	 */
	fetchData(update) {
		let that = this;
		let response_status;
		if (that.state.category_list && that.state.category_list.length == 0) {
			that.retriveData();
		}
		// console.log("stations":that.state.stations_list);
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/list', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			response_status = Response.status;
			return Response.json();
		}).then(function(json) {
			// console.log('Dashboard:', json);
			// response_status = 403;
			if (response_status == 403) {
				that.setState({
					unauthorised_access_list: true,
					unauthorised_access_list_msg: json.message
				});
			}
			else if (json.status === 'success') {
				let filtered_station_list_fms = [];
				let station_name_list = {};
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						if (station.sub_category == that.state.value) {
							filtered_station_list_fms.push({
								id: station.id,
								name: station.name
							});
						}

						if (!station_name_list[station.id]) {
							station_name_list[station.id] = station.name;
						} else {
							station_name_list[station.id] = station.name;
						}
					});
				}
				
				that.setState({
					unauthorised_access_list: false,
					station_name_list: station_name_list,
					all_stations_fms: json.station_list,
					filtered_station_list_fms: filtered_station_list_fms,
				},() => {

					if (true) {
						//that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display, update);
						// console.log('avg_lat', avg_long);
					} 
					/*else {
						if (that.child2) {
							that.child2.categorizeStations(true);
						}
					}*/
					/*if (that.state.search_station != '' && !update) {
						that.setSearch(that.state.search_station);
					}*/
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					unauthorised_access_list: false
				});
				// showPopup('danger',json.message);
				// that.setState({loading_data: null});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
			// showPopup('danger','Unable to load data!');
			// that.setState({loading_data: null});
		});
	}

	get_all_cities() {
		let that = this;
		fetch('https://api.aurassure.com/smart_city_platform/city_specific/chennai/get_all_cities_for_archive.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			console.log('Response', Response);
			return Response.json();
		}).then(function(json) {
			console.log('All Cities', json);
			if (json.status === 'success') {
				that.setState({
					all_cities: json.cities,
					city_list: json.cities
				}, () => {
					that.getCities();
				});
			}
		}).catch(function(ex) {
			let json = {"status":"success","cities":[{"id":"11","name":"Rajkot"},{"id":"16","name":"Siliguri"},{"id":"19","name":"Coimbatore"},{"id":"20","name":"Udaipur"}]};
			if (json.status === 'success') {
				that.setState({
					all_cities: json.cities,
					city_list: json.cities
				}, () => {
					that.getCities();
				});
			}
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data'/*json.message*/);
		});
	}

	/**
	 * It calls the API to get the details of all stations & set into state.
	 */
	// get_details_of_stations() {
	// 	let that = this;
	// 	fetch('https://api.aurassure.com/smart_city_platform/city_specific/chennai/get_all_station_details_for_archive_page.php', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		credentials: 'include'
	// 	}).then(function(Response) {
	// 		return Response.json();
	// 	}).then(function(json) {
	// 		console.log('All Stations Data', json);
	// 		if (json.status === 'success') {
	// 			let all_stations_aura_names={};
	// 			if (json.stations && json.stations.length) {
	// 				json.stations.map((st) => {
	// 					if (!all_stations_aura_names[st.id]) {
	// 						all_stations_aura_names[st.id] = st.name;
	// 					} else {
	// 						all_stations_aura_names[st.id] = st.name;
	// 					}
	// 				});
	// 			}
	// 			that.setState({
	// 				all_stations_aura_names: all_stations_aura_names,
	// 				all_stations_aura: json.stations,
	// 				all_parameters: json.all_parameters
	// 			}, () => {
	// 				that.setStationList();
	// 			});
	// 		} else {
	// 			that.openNotification('error', json.message);
	// 		}
	// 	}).catch(function(ex) {
	// 		console.log('parsing failed get_all_station_details_for_archive_page', ex);
	// 		that.openNotification('error', 'Unable to load data'/*json.message*/);
	// 	});
	// }

	/**
	 * It calls the API to get the archive data of a station & set the values into state.
	 */
	// getArchiveDataOfStation(report_details) {
	// 	this.setState({
	// 		archive_data: null,
	// 		getting_report: true,
	// 	});
	// 	/**
	// 	 * It stores the required parameters.
	// 	 * @type {Array}
	// 	 */

	// 	let that = this;
	// 	let data_type;
	// 	if (report_details.data_type) {
	// 		data_type = 'raw_data';
	// 	} else {
	// 		data_type = 'avg_over_time';
	// 	}
	// 	fetch('https://api.aurassure.com/smart_city_platform/city_specific/chennai/get_archive_data_of_station.php', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		credentials: 'include',
	// 		body: JSON.stringify({
	// 			city_id: report_details.city_id,
	// 			station_id: report_details.station_ids,
	// 			parameters: report_details.parameters,
	// 			from_time: report_details.from_time,
	// 			upto_time: report_details.upto_time,
	// 			data_type: data_type,
	// 			duration: report_details.duration,
	// 			conversion_type: report_details.conversion_type
	// 		})
	// 	}).then(function(Response) {
	// 		return Response.json();
	// 	}).then(function(json) {
	// 		console.log('All Stations Data', json);
	// 		if (json.status === 'success') {
	// 			that.setState({
	// 				archive_data: {
	// 					param_values: json.param_values,
	// 					time_stamps: json.time_stamps,
	// 					city_data: json.city_data,
	// 					station_data: json.station_data,
	// 					station_summary: json.station_summary,
	// 					start_time: json.start_time,
	// 					duration: json.duration,
	// 					upto_time: json.upto_time,
	// 					station_parameters: json.required_params
	// 				},
	// 				// stations_selected:report_details.station_ids,
	// 				checked_parameters: report_details.parameters,
	// 				conversion_type: report_details.conversion_type,
	// 				station_parameters: report_details.station_parameters,
	// 				getting_report: false
	// 			});
	// 		} else {
	// 			that.openNotification('error', json.message);
	// 		}
	// 	}).catch(function(ex) {
	// 		console.log('parsing failed', ex);
	// 		that.openNotification('error', 'Unable to load data!');
	// 	});
	// }

	// getCities() {
	// 	let that = this,
	// 		all_cities_list = {};
	// 	if (that.state.all_cities && Object.keys(that.state.all_cities).length) {
	// 		that.state.all_cities.map((city, index) => {
	// 			console.log('key', index);
	// 			all_cities_list[city.id] = city.name;
	// 		});
	// 	}
	// 	console.log('city_lists', all_cities_list);
	// 	that.setState({
	// 		all_cities_list: all_cities_list
	// 	});
	// }

	// getCityValue(value) {
	// 	console.log('values city', value);
	// 	let that = this;
	// 	that.setState({
	// 		city_selected: value
	// 	});
	// }

	/**
	 * This function opens the notification in render.
	 */
	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};


	/**
	 * This function sets the liste of station being registered under the currently selected station types
	 */
	// setStationList(){
	// 	let that = this,
	// 		all_stations_list = {};
	// 	if (that.state.all_stations && Object.keys(that.state.all_stations).length) {
	// 		that.state.all_stations.map((station, index) => {
	// 			// console.log('key', index);
	// 			all_stations_list[station.id] = station.name;
	// 		});
	// 	}
	// 	console.log('station_lists', all_stations_list);
	// 	that.setState({
	// 		all_stations_list: all_stations_list
	// 	}, () => {
	// 		that.resetSelectedStations();
	// 	});
	// }

	/**
	 * This function resets the selected stations and checked parameters when ever a station type is unselected
	 * It removes the selected station and checked parametrs of the previously selected selected stations
	 */
	// resetSelectedStations(){
	// 	let that = this,
	// 		selected = [],
	// 		checked_parameters = [];
	// 	if (that.state.stations_selected) {
	// 		that.state.stations_selected.map((id) => {
	// 			that.state.all_stations_aura.map((station, index) => {
	// 				if(station.id == id && selected.indexOf(id) === -1) {
	// 					selected.push(id);
	// 				}
	// 			});
	// 		});
	// 	}

	// 	console.log('selected', selected);

	// 	if (that.state.selected_parameters) {
	// 		that.state.selected_parameters.map((id) => {
	// 			that.state.checked_parameters.map((check_id) => {
	// 				if(check_id == id && checked_parameters.indexOf(check_id) === -1)
	// 					checked_parameters.push(check_id);
	// 			});
	// 		});
	// 	}

	// 	that.setState({
	// 		stations_selected: selected,
	// 		checked_parameters: checked_parameters
	// 	});
	// }
	
	/**
	 * This function sets all the parameters in the exists in the currently selected stations 
	 */
	// setParamsIds(){
	// 	let that = this;
	// 	// console.log(station_ids);
	// 	let rain_box = document.getElementById('param_rain'),
	// 		aqi_box = document.getElementById('param_hourly_aqi'),
	// 		wind_box = document.getElementById('param_wind_rose'),
	// 		pollution_box = document.getElementById('param_pollution_rose');
	// 	let new_parameters = [];
	// 	if (!new_parameters.includes('hourly_aqi')) {
	// 		new_parameters.push('hourly_aqi');
	// 	}
	// 	this.state.all_stations_aura.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			if (_.some(station.parameters, {key: 'wspeed'}) && _.some(station.parameters, {key: 'wdir'})) {
	// 				if (!new_parameters.includes('wind_rose')) {
	// 					new_parameters.push('wind_rose');
	// 				}
	// 			}
	// 			if (_.some(station.parameters, {key: 'wdir'}) && (_.some(station.parameters, {key: 'pm2.5'}) || _.some(station.parameters, {key: 'pm10'}) || _.some(station.parameters, {key: 'no2'}) || _.some(station.parameters, {key: 'o3'}) || _.some(station.parameters, {key: 'co'}) || _.some(station.parameters, {key: 'so2'}))) {
	// 				if (!new_parameters.includes('pollution_rose')) {
	// 					new_parameters.push('pollution_rose');
	// 				}
	// 			}
	// 		}
	// 	});
	// 	that.state.all_stations_aura.map((station) => {
	// 		that.state.stations_selected.map((id) => {
	// 			if(station.id == id){
	// 				// console.log(id, station);
	// 				// console.log('looking here' + station.name);
	// 				station.parameters.map((params)=>{
	// 					// console.log('params', params);
	// 					if(new_parameters.indexOf(params.key) === -1){
	// 						// console.log('params_key', params.key);
	// 						new_parameters.push(params.key);
	// 					}
	// 				});
	// 			}
	// 		});
	// 	});

	// 	if (that.state.data_type_check && this.state.data_type == 'raw') {
	// 		console.log('entered into is_admin');
	// 		if (new_parameters.indexOf('hourly_aqi') !== -1) {
	// 			new_parameters.splice(new_parameters.indexOf('hourly_aqi'), 1);
	// 		}
	// 		if (new_parameters.indexOf('wind_rose') !== -1) {
	// 			new_parameters.splice(new_parameters.indexOf('wind_rose'), 1);
	// 		}
	// 		if (new_parameters.indexOf('pollution_rose') !== -1) {
	// 			new_parameters.splice(new_parameters.indexOf('pollution_rose'), 1);
	// 		}
	// 		if (!this.state.is_admin) {
	// 			if (new_parameters.indexOf('rain') !== -1) {
	// 				new_parameters.splice(new_parameters.indexOf('rain'), 1);
	// 			}
	// 		}
	// 	}

	// 	if(this.state.stations_selected.length === 0){
	// 		new_parameters = null;
	// 	}

	// 	console.log('selected new params',new_parameters);

	// 	this.setState({
	// 		selected_parameters: new_parameters,
	// 		checked_parameters: new_parameters
	// 	},()=>{
	// 		this.resetSelectedStations();
	// 		this.addSelectedParameters();
	// 	});
	// }

	/**
	 * This one sets and unsets the selected and unselected parameters respectively
	 * @param {Boolean} status 
	 * @param {String} id 
	 */
	// addSelectedParameters(status, key) {
	// 	let selected_parameters = this.state.checked_parameters, all_parameters_of_station = [];
	// 	let rain_box = document.getElementById('param_rain'),
	// 		aqi_box = document.getElementById('param_hourly_aqi'),
	// 		wind_box = document.getElementById('param_wind_rose'),
	// 		pollution_box = document.getElementById('param_pollution_rose');
	// 	console.log('status', status);
	// 	console.log('key', key);
	// 	if (status && selected_parameters && selected_parameters.indexOf(key) === -1) {
	// 		selected_parameters.push(key);
	// 	} else if (selected_parameters && selected_parameters.indexOf(key) !== -1) {
	// 		selected_parameters.splice(selected_parameters.indexOf(key), 1);
	// 	}

	// 	if (!(_.some(all_parameters_of_station, {key: 'hourly_aqi'}))) {
	// 		all_parameters_of_station.push(this.hourly_aqi);
	// 	}
	// 	this.state.all_stations_aura.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			if (_.some(station.parameters, {key: 'wspeed'}) && _.some(station.parameters, {key: 'wdir'})) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'wind_rose'}))) {
	// 					all_parameters_of_station.push(this.wind_rose);
	// 				}
	// 			}
	// 			if (_.some(station.parameters, {key: 'wdir'}) && (_.some(station.parameters, {key: 'pm2.5'}) || _.some(station.parameters, {key: 'pm10'}) || _.some(station.parameters, {key: 'no2'}) || _.some(station.parameters, {key: 'o3'}) || _.some(station.parameters, {key: 'co'}) || _.some(station.parameters, {key: 'so2'}))) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'pollution_rose'}))) {
	// 					all_parameters_of_station.push(this.pollution_rose);
	// 				}
	// 			}
	// 		}
	// 	});

	// 	this.state.all_stations_aura.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			station.parameters.map((params) => {
	// 				if (!(_.some(all_parameters_of_station, {key: params.key}))) {
	// 					all_parameters_of_station.push(params);
	// 				}
	// 			});
	// 		}
	// 	});
	// 	this.all_parameters_of_station = all_parameters_of_station;

	// 	let checked_all = false;
	// 	// console.log('all_parameters_of_station'+ all_parameters_of_station.length+ ' => ', all_parameters_of_station);
	// 	// console.log('selected_parameters' + selected_parameters.length + ' => ', selected_parameters);
	// 	if (selected_parameters && selected_parameters.length) {
	// 		if (this.state.is_admin) {
	// 			if (this.state.data_type_check && aqi_box && wind_box && pollution_box) {
	// 				// console.log('data_type_check ==> 1');
	// 				checked_all =  all_parameters_of_station.length-3 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check && aqi_box && wind_box) {
	// 				// console.log('data_type_check ==> 2');
	// 				checked_all =  all_parameters_of_station.length-2 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check && aqi_box ) {
	// 				// console.log('data_type_check ==> 3');
	// 				checked_all =  all_parameters_of_station.length-1 === selected_parameters.length ? true : false;
	// 			} else {
	// 				// console.log('data_type_check ==> 4');
	// 				checked_all =  all_parameters_of_station.length === selected_parameters.length ? true : false;
	// 			}
	// 		} else {
	// 			if (this.state.data_type_check && rain_box && aqi_box && wind_box && pollution_box) {
	// 				// console.log('data_type_check_else ==> 1');
	// 				checked_all = all_parameters_of_station.length-4 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check && rain_box && aqi_box && wind_box) {
	// 				// console.log('data_type_check_else ==> 2');
	// 				checked_all = all_parameters_of_station.length-3 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check && rain_box && aqi_box) {
	// 				// console.log('data_type_check_else ==> 3');
	// 				checked_all = all_parameters_of_station.length-2 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check && aqi_box) {
	// 				// console.log('data_type_check_else ==> 4');
	// 				checked_all = all_parameters_of_station.length-1 === selected_parameters.length ? true : false;
	// 			} else if (this.state.data_type_check) {
	// 				// console.log('data_type_check_else ==> 5');
	// 				checked_all = all_parameters_of_station.length === selected_parameters.length ? true : false;
	// 			} else {
	// 				checked_all = all_parameters_of_station.length === selected_parameters.length ? true : false;
	// 			}
	// 		}
	// 	}

	// 	this.setState({
	// 		checked_parameters: selected_parameters
	// 	}, () => {
	// 		console.log('checked parameters', this.state.checked_parameters);
	// 	});
	// 	// document.getElementById('all_params').checked = checked_all;
	// }

	/**
	 * Checks all parameters
	 */
	// checkAllParams(status) {
	// 	console.log('entered into checkAllParams', status);
	// 	let selected_parameters = [];
	// 	let all_parameters_of_station = [];
	// 	let rain_box = "rain", aqi_box = 'hourly_aqi', wind_box = 'wind_rose', pollution_box = 'pollution_rose';

	// 	all_parameters_of_station.push(this.hourly_aqi);
	// 	this.state.all_stations.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			if (_.some(station.parameters, {key: 'wspeed'}) && _.some(station.parameters, {key: 'wdir'})) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'wind_rose'}))) {
	// 					all_parameters_of_station.push(this.wind_rose);
	// 				}
	// 			}
	// 			if (_.some(station.parameters, {key: 'wdir'}) && (_.some(station.parameters, {key: 'pm2.5'}) || _.some(station.parameters, {key: 'pm10'}) || _.some(station.parameters, {key: 'no2'}) || _.some(station.parameters, {key: 'o3'}) || _.some(station.parameters, {key: 'co'}) || _.some(station.parameters, {key: 'so2'}))) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'pollution_rose'}))) {
	// 					all_parameters_of_station.push(this.pollution_rose);
	// 				}
	// 			}
	// 		}
	// 	});
	// 	this.state.all_stations.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			station.parameters.map((params) => {
	// 				if (!(_.some(all_parameters_of_station, {key: params.key}))) {
	// 					all_parameters_of_station.push(params);
	// 				}
	// 			});
	// 		}
	// 	});
	// 	if (this.state.data_type_check) {
	// 		all_parameters_of_station = all_parameters_of_station.filter(function(param){ 
	// 			return param.key != aqi_box; 
	// 		});
	// 		all_parameters_of_station = all_parameters_of_station.filter(function(param){ 
	// 			return param.key != wind_box; 
	// 		});
	// 		all_parameters_of_station = all_parameters_of_station.filter(function(param){ 
	// 			return param.key != pollution_box; 
	// 		});
	// 	}
	// 	if (!this.state.is_admin) {
	// 		if (this.state.data_type_check) {
	// 			all_parameters_of_station = all_parameters_of_station.filter(function(param){ 
	// 				return param.key != rain_box; 
	// 			});
	// 		}
	// 	}
	// 	console.log('all_parameters_of_station', all_parameters_of_station);
	// 	if (status) {
	// 		all_parameters_of_station.map((params)=>{
	// 			console.log('params', params);
	// 			if (status && selected_parameters.indexOf(params.key) === -1) {
	// 				selected_parameters.push(params.key);
	// 			} else if (selected_parameters.indexOf(params.key) !== -1) {
	// 				selected_parameters.splice(selected_parameters.indexOf(params.key), 1);
	// 			}
	// 			// selected_parameters.push(params.key);
	// 		});
	// 	} else {
	// 		selected_parameters = [];
	// 	}

	// 	all_parameters_of_station.map((parameter) => {
	// 		if (document.getElementById('param_'+ parameter.key)) {
	// 			document.getElementById('param_'+ parameter.key).checked = status ? true : false;
	// 		}
	// 	});

	// 	this.setState({checked_parameters: selected_parameters});
	// }

	// changeDataType(type) {
	// 	let selected_parameters = this.state.checked_parameters,
	// 		data_type_check = this.state.data_type_check;
	// 	let rain_box = document.getElementById('param_rain'),
	// 		aqi_box = document.getElementById('param_hourly_aqi'),
	// 		wind_box = document.getElementById('param_wind_rose'),
	// 		pollution_box = document.getElementById('param_pollution_rose');
	// 	if (type === 'raw_data') {
	// 		data_type_check = true;
	// 		this.enabled_raw_data = true;
	// 	} else {
	// 		data_type_check = false;
	// 		this.enabled_raw_data = true;
	// 		document.getElementById('data_type_error').innerHTML = null;
	// 	}
	// 	if (aqi_box) {
	// 		if (this.station_type == '2') {
	// 			document.getElementById('param_hourly_aqi').setAttribute("disabled", true);
	// 			if (selected_parameters.indexOf('hourly_aqi') !== -1) {
	// 				selected_parameters.splice(selected_parameters.indexOf('hourly_aqi'), 1);
	// 			}
	// 		} else {
	// 			if (data_type_check) {
	// 				document.getElementById('param_hourly_aqi').setAttribute("disabled", true);
	// 				if (selected_parameters.indexOf('hourly_aqi') !== -1) {
	// 					selected_parameters.splice(selected_parameters.indexOf('hourly_aqi'), 1);
	// 				}
	// 				// console.log('hiiif');
	// 			} else {
	// 				document.getElementById('param_hourly_aqi').removeAttribute("disabled");
	// 				// console.log('hiielse');
	// 			}
	// 		}
	// 	}
	// 	if (wind_box) {
	// 		if (this.station_type == '2') {
	// 			document.getElementById('param_wind_rose').setAttribute("disabled", true);
	// 			if (selected_parameters.indexOf('wind_rose') !== -1) {
	// 				selected_parameters.splice(selected_parameters.indexOf('wind_rose'), 1);
	// 			}
	// 		} else {
	// 			if (data_type_check) {
	// 				document.getElementById('param_wind_rose').setAttribute("disabled", true);
	// 				if (selected_parameters.indexOf('wind_rose') !== -1) {
	// 					selected_parameters.splice(selected_parameters.indexOf('wind_rose'), 1);
	// 				}
	// 				// console.log('hiiif');
	// 			} else {
	// 				document.getElementById('param_wind_rose').removeAttribute("disabled");
	// 				// console.log('hiielse');
	// 			}
	// 		}
	// 	}
	// 	if (pollution_box) {
	// 		if (this.station_type == '2') {
	// 			document.getElementById('param_pollution_rose').setAttribute("disabled", true);
	// 			if (selected_parameters.indexOf('pollution_rose') !== -1) {
	// 				selected_parameters.splice(selected_parameters.indexOf('pollution_rose'), 1);
	// 			}
	// 		} else {
	// 			if (data_type_check) {
	// 				document.getElementById('param_pollution_rose').setAttribute("disabled", true);
	// 				if (selected_parameters.indexOf('pollution_rose') !== -1) {
	// 					selected_parameters.splice(selected_parameters.indexOf('pollution_rose'), 1);
	// 				}
	// 				// console.log('hiiif');
	// 			} else {
	// 				document.getElementById('param_pollution_rose').removeAttribute("disabled");
	// 				// console.log('hiielse');
	// 			}
	// 		}
	// 	}
	// 	if (!this.state.is_admin && rain_box) {
	// 		if (rain_box && data_type_check) {
	// 			document.getElementById('param_rain').setAttribute("disabled", true);
	// 			if (selected_parameters.indexOf('rain') !== -1) {
	// 				selected_parameters.splice(selected_parameters.indexOf('rain'), 1);
	// 			}
	// 			// console.log('hiiif');
	// 		} else {
	// 			document.getElementById('param_rain').removeAttribute("disabled");
	// 			// console.log('hiielse');
	// 		}
	// 	} else {
	// 		if (rain_box) {
	// 			document.getElementById('param_rain').removeAttribute("disabled");
	// 		}
	// 		// console.log('disabled else');
	// 	}
	// 	this.setState({data_type_check : data_type_check}, () => {this.addSelectedParameters()});	
	// }

	/**
	 * This function creates the query and pushes it to the history.
	 */
	queryCreate(/*cat, sub_cat, update*/) {

		let query = '';

		/*query = 
			(this.state.sub_category_selected ? '?subcat=' + this.state.sub_category_selected : '') + 
			(this.state.stations_selected && this.state.stations_selected.length ? (this.state.sub_category_selected ? '&' : '?') : '')*/

		if (this.state.sub_category_selected) {
			query = query + '?subcat=' + this.state.sub_category_selected;
		}
		if (this.state.stations_selected && this.state.stations_selected.length) {
			if (this.state.sub_category_selected) {
				query = query + '&stations=' + this.state.stations_selected;
			} else {
				query = query + '?stations=' + this.state.stations_selected;
			}
		}
		if (this.state.from_time && this.state.upto_time) {
			if (this.state.sub_category_selected || (this.state.stations_selected && this.state.stations_selected.length)) {
				query = query + '&from=' + this.state.from_time + '&upto=' + this.state.upto_time;
			} else {
				query = query + '?from=' + this.state.from_time + '&upto=' + this.state.upto_time;
			}
		}
		if (this.state.data_type) {
			if (this.state.sub_category_selected || (this.state.stations_selected && this.state.stations_selected.length) || (this.state.from_time && this.state.upto_time)) {
				query = query + '&data_type=' + this.state.data_type;
			} else {
				query = query + '?data_type=' + this.state.data_type;
			}
		}
		if (this.state.data_type && this.state.data_type == 'avg' && this.state.avg_time) {
			if (this.state.sub_category_selected || (this.state.stations_selected && this.state.stations_selected.length) || (this.state.from_time && this.state.upto_time)) {
				query = query + '&avg_time=' + this.state.avg_time;
			}
		}
		if (this.state.view_data_format && this.state.view_data_format) {
			if (this.state.sub_category_selected || (this.state.stations_selected && this.state.stations_selected.length) || (this.state.from_time && this.state.upto_time) || (this.state.data_type) || (this.state.data_type && this.state.data_type == 'avg' && this.state.avg_time)) {
				query = query + '&view_data_format=' + this.state.view_data_format;
			} else {
				query = query + '?view_data_format=' + this.state.view_data_format;
			}
		}
		
		this.props.history.push('/archive/' + query);
	}

	disabledStartDate(startValue) {
		const endValue = this.state.endValue;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
	}

	onChangeDevice(valueDevice) {
		this.setState({ valueDevice });
	}

	showDataDrawer(data_to_be_posted) {
		console.log('showDataDrawer', data_to_be_posted);
		this.setState({
			// drawDataVisible: true
			show_form: false,
			show_report: true
		}, () => {
			if (this.state.value == this.state.aura_infra) {
				this.getArchiveDataOfStation(data_to_be_posted);
			} else {
				this.getReportFlood(data_to_be_posted);
			}
		});
	}

	/**
	 * Function used to get the data for the report page.
	 * @param {Object} update 
	 * @return {void} 
	 */
	getReportFlood(data) {
		let that = this;
		that.setState({
			avg_time_for_graph: data.avg_data_time,
			stations_graph_data: [],
			stations_grid_data: [],
			getting_report: true
		});

		var start,time_taken;

		start = Date.now();

		fetch('##PR_STRING_REPLACE_LOCAL_API_BASE_PATH##/stations/get_report', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(data)
		}).then(function(Response) {
			time_taken = Date.now() - start;
			console.warn('api time',time_taken/1000);
			return Response.json();
		}).then(function(json) {

			time_taken = Date.now() - start;

			console.warn('response time',time_taken/1000);

			start = Date.now();

			console.log('All Stations Data', json);
			if (json.status === 'success') {
				let total_rain_counter = 0;
				let length_of_data = json.stations_data.length ? json.stations_data.length : 0;
				let temp = [];

				for(let i = 0; i< length_of_data; i++) {
					temp.push('a');
				}

				var json_map_start = Date.now();

				//let stations_graph_data = that.state.data_type == 'avg' ? that.formatDataAvg(json.stations_data/*that.state.stations_data*/) : that.formatData(json.stations_data);
				
				var json_time = Date.now() - json_map_start;

				console.warn('json_map',json_time/1000)

				let rain_summary_data = [];
				if (that.state.value == that.state.Rainfall && json.stations_data && json.stations_data.length) {
					console.warn("status","entered")
					json.stations_data.map((rain_data) => {
						if (rain_data.total_rainfall > 0) {
							total_rain_counter++;
						}
						rain_summary_data.push({
							name: rain_data.name,
							total_rainfall: rain_data.total_rainfall
						});
					});
				}

				let sanjay_data = [];

				json.stations_data.map((data) => {

					sanjay_data.push(data.sanjay_data);

				});

				//console.warn('sanjay data',json.stations_data);

				//console.warn("stations data",json.stations_data)

				//console.warn("rain data",rain_summary_data);

				//console.log('stations_graph_data', stations_graph_data);
				//json_map_start = Date.now();
				that.setState({
					// stations_graph_data: json.stations_graph_data,
					stations_raw_data : sanjay_data,
					rain_summary_data: rain_summary_data,
					total_rain_counter: total_rain_counter,
					stations_grid_data: data && data.view_data_format && data.view_data_format.length && (data.view_data_format.indexOf('grid') > -1) ? json.stations_data : null,
					station_name_grid_data: json.stations_data,
					//stations_graph_data: data && data.view_data_format && data.view_data_format.length && (data.view_data_format.indexOf('graph') > -1) ? stations_graph_data : null,
					stations_graph_data : [],
				    common_iterator: temp,
					sub_category_selected_child: that.state.value,
					getting_report: false,
					from_time_report: data.from_time,
					upto_time_report: data.upto_time
				},() => {	
					if (that.child) {
						that.child.closeFromParent();
					}
					/*if (document.getElementById('report_view_container')) {
						that.smoothScroll(document.getElementById('report_view_container'));
					}*/
				});

				//json_time = Date.now()-json_map_start;

				//console.warn('set state time',json_time/1000)

				//time_taken = Date.now() - start;

				//console.warn('loading time',time_taken/1000)

			} else {
				that.openNotification('error', json.message);
				that.setState({
					getting_report: false
				},() => {		
					if (that.child) {
						that.child.closeFromParent();
					}
				});
			}
		}).catch((ex) => {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
			that.setState({
				getting_report: false
			}, () => {
				if (that.child) {
					that.child.closeFromParent();
				}
			});
		});
	}

	/**
	 * This function is called when the view button is clicked.
	 * This function calls another function to validate the data, and if it returns the values then the function for calling the API is called.
	 */
	getReport() {
		let data_to_be_posted = this.validateData();
		console.log('data_to_be_posted', data_to_be_posted);
		if(data_to_be_posted) {
			this.setState({
				show_form: true,
				show_report: false,
				child_updated: false
			}, () => {
				if (this.child) {
					this.child.closeFromParent();
				}
			});
			// this.props.getReport(data_to_be_posted);
			this.showDataDrawer(data_to_be_posted);
		}
	}

	/**
	 * This function validate the required data to be sent to API for viewing & download.
	 * @return {Boolean|Object} This will return either Boolean false value or the verified object of data for API.
	 */
	validateData() {
		let that = this;
		let required_params = [];
		let from_time = that.state.from_time ? moment(that.state.from_time, "DD-MM-YYYY").tz('Asia/Kolkata').unix() : null,
			upto_time = that.state.upto_time ? (that.state.upto_time == moment().tz('Asia/Kolkata').format('DD-MM-YYYY') ? moment().tz('Asia/Kolkata').unix() : moment(that.state.upto_time, "DD-MM-YYYY").tz('Asia/Kolkata').endOf('day').unix()) : null;
		let err_msg;
		let value;

		console.log('that.state.value', that.state.value);
		console.log('that.state.stations_selected', that.state.stations_selected);
		console.log('from_time', from_time);
		console.log('upto_time', upto_time);
		console.log('from_time - upto_time', from_time - upto_time);
		console.log('that.state.data_type', that.state.data_type);
		console.log('that.state.avg_time', that.state.avg_time);
		console.log('that.state.conversion_type', that.state.conversion_type);
		// console.log('that.state.view_data_format', that.state.view_data_format);
		if ((that.state.value && (that.state.stations_selected && that.state.stations_selected.length) && (from_time && upto_time && (upto_time - from_time > 0)) && that.state.data_type && that.state.avg_time && that.state.conversion_type/* && (that.state.view_data_format && that.state.view_data_format.length)*/)) {
			if ((that.state.data_type == 'raw' && (upto_time - from_time  <= 31536000) && that.state.value != that.state.aura_infra)) {
				value = {
					sub_category: that.state.value,
					stations: that.state.stations_selected,
					from_time: from_time,
					upto_time: upto_time,
					data_type: that.state.data_type,
					avg_data_time: that.state.data_type == 'avg' ? that.state.avg_time : null,
					view_data_format: that.state.view_data_format
				}
			} else if (that.state.data_type == 'avg' && that.state.value != that.state.aura_infra) {
				value = {
					sub_category: that.state.value,
					stations: that.state.stations_selected,
					from_time: from_time,
					upto_time: upto_time,
					data_type: that.state.data_type,
					avg_data_time: that.state.data_type == 'avg' ? that.state.avg_time : null,
					view_data_format: that.state.view_data_format
				}
			} else if (that.state.value == that.state.aura_infra) {
				console.log('show', that.all_parameters_of_station);
				that.all_parameters_of_station.map((parameter) => {
					console.log('render aura param', parameter);
					if(that.state.params_selected && that.state.params_selected.length && that.state.params_selected.indexOf(parameter.key) > -1) {
						if (that.state.conversion_type == 'naqi') {
							if (parameter.key == 'so2' || parameter.key == 'no2' || parameter.key == 'o3') {
								parameter.unit = 'μg / m<sup>3</sup>';
							} else if (parameter.key == 'co') {
								parameter.unit = 'mg / m<sup>3</sup>';
							}
							console.log('all_parameters_of_station naqi', parameter);
							required_params.push(parameter);
							// console.log('parameter_unit', that.required_params);
						} else {
							if (parameter.key == 'so2' || parameter.key == 'no2' || parameter.key == 'o3') {
								parameter.unit = 'ppb';
							} else if (parameter.key == 'co') {
								parameter.unit = 'ppm';
							}
							console.log('all_parameters_of_station usepa', parameter);
							required_params.push(parameter);
						}
					}
				});
				console.log('station_parameters', required_params);
				that.setState({station_parameters: required_params});
				value = {
					// sub_category: that.state.value,
					station_id: that.state.stations_selected,
					from_time: moment.unix(from_time).tz("Asia/Kolkata").format('DD-MM-YYYY'),
					upto_time: moment.unix(upto_time).tz("Asia/Kolkata").format('DD-MM-YYYY'),
					data_type: that.state.data_type == 'avg' ? 'avg_over_time' : (that.state.data_type == 'raw' ? 'raw_data' : 'avg_over_time'),
					duration: that.state.avg_data_time_aura,
					conversion_type: that.state.conversion_type,
					parameters: that.state.params_selected,
					station_parameters: required_params
					// view_data_format: that.state.view_data_format
				}
			} else {
				if (!that.state.value) {
					that.openNotification('error', 'Please Select a Sub-category')
				} else if (!that.state.stations_selected || (that.state.stations_selected && that.state.stations_selected.length == 0)) {
					that.openNotification('error', 'Please Select atleast one Station')
				} else if (!from_time || !upto_time) {
					that.openNotification('error', 'Please Select the From and Upto date')
				} else if ((from_time && upto_time && (from_time - upto_time > 0))) {
					that.openNotification('error', 'From time must be less than Upto time')
				} else if (!that.state.data_type) {
					that.openNotification('error', 'Please Select a Data Type');
				} else if (!that.state.avg_time) {
					that.openNotification('error', 'Please Select the Average Time');
				}/* else if (!that.state.view_data_format || (that.state.view_data_format && that.state.view_data_format.length == 0)) {
					that.openNotification('error', 'Please Select atleast one view data format');
				}*/ else if (that.state.data_type == 'raw' && (upto_time - from_time  >= 604800)) {
					that.openNotification('error', 'For Raw data, Date Range should not exceed 7 days');
				}
			}
		} else if (!that.state.value) {
			that.openNotification('error', 'Please Select a Sub-category')
		} else if (!that.state.stations_selected || (that.state.stations_selected && that.state.stations_selected.length == 0)) {
			that.openNotification('error', 'Please Select atleast one Station')
		} else if (!from_time || !upto_time) {
			that.openNotification('error', 'Please Select the From and Upto date')
		} else if ((from_time && upto_time && (from_time - upto_time > 0))) {
			that.openNotification('error', 'From time must be less than Upto time')
		} else if (!that.state.data_type) {
			that.openNotification('error', 'Please Select a Data Type');
		} else if (!that.state.avg_time) {
			that.openNotification('error', 'Please Select the Average Time');
		}/* else if (!that.state.view_data_format || (that.state.view_data_format && that.state.view_data_format.length == 0)) {
			that.openNotification('error', 'Please Select atleast one view data format');
		}*/ else if (that.state.data_type == 'raw' && (upto_time - from_time  >= 604800)) {
			that.openNotification('error', 'For Raw data, Date Range should not exceed 7 days');
		}

		return value;
	}

	serialize(obj) {
		let str = [];
		Object.keys(obj).map((key) => {
			if (key == 'stations' || key == 'view_data_format') {
				str.push(key + '=' + JSON.stringify(obj[key]));
			} else {
				str.push(key + '=' + obj[key]);
			}
		});
		return str.join("&");
	}

	downloadReportPrep() {
		let data_to_be_posted = this.validateData();
		console.log('downloadReportPrep', data_to_be_posted);
		console.log('data_to_be_posted', data_to_be_posted);
		if(data_to_be_posted) {
			if (this.state.value == this.state.aura_infra) {
				let data_type;
				if (data_to_be_posted.data_type) {
					data_type = 'raw_data';
				} else {
					data_type = 'avg_over_time';
				}
				let data_to_be_sent = {	
					city_id: data_to_be_posted.city_id,
					station_id: data_to_be_posted.station_ids,
					parameters: data_to_be_posted.parameters,
					from_time: data_to_be_posted.from_time,
					upto_time: data_to_be_posted.upto_time,
					data_type: data_type,
					duration: data_to_be_posted.duration,
					conversion_type: data_to_be_posted.conversion_type
				};
				// console.log('data_to_be_posted', data_to_be_posted);
				window.location = 'https://api.aurassure.com/smart_city_platform/city_specific/chennai/' + 'download_archive_data.php?d='+ JSON.stringify(data_to_be_sent);
			} else {
				let data_to_be_sent = {
					sub_category: data_to_be_posted['sub_category'],
					stations: data_to_be_posted['stations'],
					from_time: data_to_be_posted['from_time'],
					upto_time: data_to_be_posted['upto_time'],
					data_type: data_to_be_posted['data_type'],
					//avg_data_time: data_to_be_posted['avg_data_time'],
					view_data_format: data_to_be_posted['view_data_format']
				};
				if (data_to_be_posted.avg_data_time) {
					if (!data_to_be_sent.avg_data_time) {
						data_to_be_sent.avg_data_time = data_to_be_posted['avg_data_time'];
					} else {
						data_to_be_sent.avg_data_time = data_to_be_posted['avg_data_time'];
					}
				}
				// console.log('data_to_be_posted', data_to_be_posted);
				// window.location = '##PR_STRING_REPLACE_API_BASE_PATH##' + 'download_archive_data.php?d='+ JSON.stringify(data_to_be_sent);
				let download_str = this.serialize(data_to_be_sent);
				console.log('final query: ', download_str);
				this.setState({download_file: true});
				let download_window = window.open('##PR_STRING_REPLACE_LOCAL_API_BASE_PATH##/stations/download_report?' + download_str, '_blank');
				let that = this;
				let timer = setInterval(function() {
					if(download_window.closed) {
						clearInterval(timer);
						that.setState({download_file: false});
					}
				}, 500);
			}
		}
	}

	/**
	 * This function changes the average grid data to the required format for creating charts.
	 * @param  {Object} stations_grid_data grid data
	 * @return {Object}                    chart data
	 */
	formatDataAvg(stations_grid_data) {
		if (this.state.value == this.state.Major_Road_Junction || this.state.value == this.state.Street_Sub_House_Front) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;
								if (param.data && Object.keys(param.data).length) {
									data_temp = _.clone(param.data);
									console.log('data_temp', data_temp);
									if (!(data_temp instanceof Object)) {
										data_temp = {};
										data_temp = {
											avg: null,
											min: null,
											max: null
										};
									}
									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}
								}
								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		} else if (this.state.value == this.state.Open_Canal || this.state.value == this.state.Street_Sub_House_Front_water) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;
								if (param.data && Object.keys(param.data).length) {
									data_temp = _.clone(param.data);
									if (!(data_temp instanceof Object)) {
										data_temp = {};
										data_temp = {
											avg: null,
											min: null,
											max: null
										};
									}
									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}
								}
								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		} else if (this.state.value == this.state.Gated_Canal) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;
								if (param.data && Object.keys(param.data).length) {
									data_temp =  _.clone(param.data);
									if (!(data_temp instanceof Object)) {
										data_temp = {};
										data_temp = {
											avg: null,
											min: null,
											max: null
										};
									}
									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}
								}
								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		} else if (this.state.value == this.state.Rainfall) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;

								if (!data_temp.time) {
									data_temp.time = time;
								} else {
									data_temp.time = time;
								}

								if (!data_temp.value) {
									data_temp.value = param.value;
								} else {
									data_temp.value = param.value;
								}

								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		} else if (this.state.value == this.state.Pump_Station_Status || this.state.value == this.state.pump_station_2) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								if (param.type == this.state.sump_type_graph) {
									param_type = param.type;
									if (param.data && Object.keys(param.data).length) {
										data_temp =  _.clone(param.data);

										if (!data_temp.time) {
											data_temp.time = time;
										} else {
											data_temp.time = time;
										}
									}
									if (!parameters_data_temp[param_type]) {
										parameters_data_temp[param_type] = [];
										parameters_data_temp[param_type].push(data_temp);
									} else {
										parameters_data_temp[param_type].push(data_temp);
									}

									if (!param_object.name) {
										param_object.name = param.name;
									} else {
										param_object.name = param.name;
									}
									if (!param_object.unit) {
										param_object.unit = param.unit;
									} else {
										param_object.unit = param.unit;
									}
									if (!param_object.type) {
										param_object.type = param.type;
									} else {
										param_object.type = param.type;
									}
									if (!parameters_temp[param_type]) {
										parameters_temp[param_type] = {};
										parameters_temp[param_type] = param_object;
									} else {
										parameters_temp[param_type] = param_object;
									}
								} else if (param.type == this.state.penstock_type_graph) {
									param_type = param.type;
									if (param.data && Object.keys(param.data).length) {
										data_temp =  _.clone(param.data);
										if (!data_temp.time) {
											data_temp.time = time;
										} else {
											data_temp.time = time;
										}
									}
									if (!parameters_data_temp[param_type]) {
										parameters_data_temp[param_type] = [];
										parameters_data_temp[param_type].push(data_temp);
									} else {
										parameters_data_temp[param_type].push(data_temp);
									}

									if (!param_object.name) {
										param_object.name = param.name;
									} else {
										param_object.name = param.name;
									}
									if (!param_object.unit) {
										param_object.unit = param.unit;
									} else {
										param_object.unit = param.unit;
									}
									if (!param_object.type) {
										param_object.type = param.type;
									} else {
										param_object.type = param.type;
									}
									if (!parameters_temp[param_type]) {
										parameters_temp[param_type] = {};
										parameters_temp[param_type] = param_object;
									} else {
										parameters_temp[param_type] = param_object;
									}
								} else if (param.type == this.state.pump_status_type) {
									param_type = param.type + index;

									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}

									if (!data_temp.rh) {
										data_temp.rh = param.rh;
									} else {
										data_temp.rh = param.rh;
									}

									if (!parameters_data_temp[param_type]) {
										parameters_data_temp[param_type] = [];
										parameters_data_temp[param_type].push(data_temp);
									} else {
										parameters_data_temp[param_type].push(data_temp);
									}

									if (!param_object.name) {
										param_object.name = param.name;
									} else {
										param_object.name = param.name;
									}
									if (!param_object.unit) {
										param_object.unit = param.unit;
									} else {
										param_object.unit = param.unit;
									}
									if (!param_object.type) {
										param_object.type = param.type;
									} else {
										param_object.type = param.type;
									}
									if (!parameters_temp[param_type]) {
										parameters_temp[param_type] = {};
										parameters_temp[param_type] = param_object;
									} else {
										parameters_temp[param_type] = param_object;
									}
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		}
	}
	/**
	 * This function changes the raw grid data to the required format for creating charts.
	 * @param  {Object} stations_grid_data grid data
	 * @return {Object}                    chart data
	 */
	formatData(stations_grid_data) {
		if (this.state.value == this.state.Major_Road_Junction || this.state.value == this.state.Street_Sub_House_Front) {
			
			var start1 = Date.now();
			
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {

					var start2 = Date.now();

					var i=0;

					grid_data.table_data.map((table) => {

						i++;

						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {

							var start3 = Date.now();

							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;

								if (!data_temp.time) {
									data_temp.time = time;
								} else {
									data_temp.time = time;
								}

								if (!data_temp.value) {
									data_temp.value = param.value;
								} else {
									data_temp.value = param.value;
								}

								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});

							//console.warn("part 1 time",Date.now()-start3);

						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});

					//console.warn("table data time",(Date.now()-start2)/1000);

					//console.warn("i",i);

					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			start1 = Date.now();
			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			//console.warn("part 2 time",(Date.now()-start1)/1000);

			return final_array		
		} else if (this.state.value == this.state.Open_Canal || this.state.value == this.state.Street_Sub_House_Front_water) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;

								if (!data_temp.time) {
									data_temp.time = time;
								} else {
									data_temp.time = time;
								}

								if (!data_temp.value) {
									data_temp.value = param.value;
								} else {
									data_temp.value = param.value;
								}

								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		} else if (this.state.value == this.state.Gated_Canal) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								param_type = param.type;

								if (!data_temp.time) {
									data_temp.time = time;
								} else {
									data_temp.time = time;
								}

								if (!data_temp.value) {
									data_temp.value = param.value;
								} else {
									data_temp.value = param.value;
								}

								if (!parameters_data_temp[param_type]) {
									parameters_data_temp[param_type] = [];
									parameters_data_temp[param_type].push(data_temp);
								} else {
									parameters_data_temp[param_type].push(data_temp);
								}

								if (!param_object.name) {
									param_object.name = param.name;
								} else {
									param_object.name = param.name;
								}
								if (!param_object.unit) {
									param_object.unit = param.unit;
								} else {
									param_object.unit = param.unit;
								}
								if (!param_object.type) {
									param_object.type = param.type;
								} else {
									param_object.type = param.type;
								}
								if (!parameters_temp[param_type]) {
									parameters_temp[param_type] = {};
									parameters_temp[param_type] = param_object;
								} else {
									parameters_temp[param_type] = param_object;
								}
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		}  else if (this.state.value == this.state.Pump_Station_Status || this.state.value == this.state.pump_station_2) {
			let stations_graph_data = [];
			// let stations_data_temp = [];
			let stations_data_temp = {};
			let stations_parameters_temp = {};
			stations_grid_data.map((grid_data) => {
				console.log('param grid_data', grid_data);
				let parameters_data_temp = {};
				let parameters_temp = {};
				let param_type;
				if (grid_data.table_data && grid_data.table_data.length) {
					grid_data.table_data.map((table) => {
						console.log('param table', table);
						let time;
						let temp_array_parameters = []
						if (table.time && table.time instanceof Array) {
							time = table.time[table.time.length - 1];
						} else if (table.time) {
							time = table.time;
						}
						if (table.parameters && table.parameters.length) {
							table.parameters.map((param, index) => {
								let data_temp = {};
								let param_object = {};
								if (param.type == this.state.pump_status_type) {
									param_type = param.type + index;
									console.log('param_type', param_type)

									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}

									if (!data_temp.value) {
										data_temp.value = param.value;
									} else {
										data_temp.value = param.value;
									}

									if (!parameters_data_temp[param_type]) {
										parameters_data_temp[param_type] = [];
										parameters_data_temp[param_type].push(data_temp);
									} else {
										parameters_data_temp[param_type].push(data_temp);
									}

									if (!param_object.name) {
										param_object.name = param.name;
									} else {
										param_object.name = param.name;
									}
									if (!param_object.unit) {
										param_object.unit = param.unit;
									} else {
										param_object.unit = param.unit;
									}
									if (!param_object.type) {
										param_object.type = param.type;
									} else {
										param_object.type = param.type;
									}
									if (!parameters_temp[param_type]) {
										parameters_temp[param_type] = {};
										parameters_temp[param_type] = param_object;
									} else {
										parameters_temp[param_type] = param_object;
									}
								} else {
									param_type = param.type;

									if (!data_temp.time) {
										data_temp.time = time;
									} else {
										data_temp.time = time;
									}

									if (!data_temp.value) {
										data_temp.value = param.value;
									} else {
										data_temp.value = param.value;
									}

									if (!parameters_data_temp[param_type]) {
										parameters_data_temp[param_type] = [];
										parameters_data_temp[param_type].push(data_temp);
									} else {
										parameters_data_temp[param_type].push(data_temp);
									}

									if (!param_object.name) {
										param_object.name = param.name;
									} else {
										param_object.name = param.name;
									}
									if (!param_object.unit) {
										param_object.unit = param.unit;
									} else {
										param_object.unit = param.unit;
									}
									if (!param_object.type) {
										param_object.type = param.type;
									} else {
										param_object.type = param.type;
									}
									if (!parameters_temp[param_type]) {
										parameters_temp[param_type] = {};
										parameters_temp[param_type] = param_object;
									} else {
										parameters_temp[param_type] = param_object;
									}
								}
								
								//parameters_data_temp.push();
							});
						}
						console.log('parameters_data_temp', parameters_data_temp);
						console.log('parameters_temp', parameters_temp);
					});
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					} else {
						stations_data_temp[grid_data.id] = parameters_data_temp;
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					} else {
						stations_parameters_temp[grid_data.id] = parameters_temp;
					}
					
					// stations_data_temp.push(parameters_data_temp);
				} else {
					if (!stations_data_temp[grid_data.id]) {
						stations_data_temp[grid_data.id] = {};
					} else {
						stations_data_temp[grid_data.id] = {};
					}
					if (!stations_parameters_temp[grid_data.id]) {
						stations_parameters_temp[grid_data.id] = {};
					} else {
						stations_parameters_temp[grid_data.id] = {};
					}
				}
			console.log('stations_data_temp', stations_data_temp);
			console.log('stations_parameters_temp', stations_parameters_temp);
			});

			
			let final_array = [];
			if (stations_parameters_temp && Object.keys(stations_parameters_temp).length) {
				Object.keys(stations_parameters_temp).map((st_id) => {
					if (stations_data_temp && Object.keys(stations_data_temp).length) {
						Object.keys(stations_data_temp).map((id) => {
							if (id == st_id) {
								let new_array_temp = [];
								if (stations_data_temp[id] && Object.values(stations_data_temp[id]).length) {
									Object.keys(stations_data_temp[id]).map((type_key_data) => {
										if (stations_parameters_temp[id] && Object.values(stations_parameters_temp[id]).length) {
											Object.keys(stations_parameters_temp[id]).map((type_key_param) => {
												if (type_key_data == type_key_param) {
													let temp = stations_parameters_temp[id][type_key_param];
													if (!temp.data) {
														temp.data = stations_data_temp[id][type_key_data];
													} else {
														temp.data = stations_data_temp[id][type_key_data];
													}
													new_array_temp.push(temp);
												}
											});
										}
									});
								} else if (stations_data_temp[id]) {} {
									new_array_temp.push({});
								}
								console.log('new_array_temp', new_array_temp);
								final_array.push({
									"id": id,
									"parameters": new_array_temp
								});
							}
						});
					}
				});
			}
			console.log('final_array', final_array);

			return final_array		
		}
	}

	handleCancel() {
		this.setState({ drawDataVisible: false });
	}

	treeSelect(value, label, extra) {
		// console.log('value', value);
		// console.log('label', label);
		// console.log('extra', extra);
		let all_stations_fms = this.state.all_stations_fms.slice(0);
		if (!isNaN(extra.triggerValue) && extra.triggerValue && extra.checked) {
			let temp = [];
			if (all_stations_fms && all_stations_fms.length) {
				all_stations_fms.map((st) => {
					if (st.sub_category == extra.triggerValue) {
						temp.push({
							id: st.id,
							name: st.name
						});
					}
				});
			}
			this.setState({
				value: extra.triggerValue,
				filtered_station_list_fms: temp
			},() => console.log('value 1', this.state.value));
		} else if (!isNaN(extra.triggerValue)) {
			this.setState({
				value: null,
				filtered_station_list_fms: []
			},() => console.log('value 2', this.state.value));
		}
	}

	/**
	 * This function sets the Date selected from the date-time picker.
	 * @param  {Object} dates       
	 * @param  {Array} dateStrings araay of from and upto times.
	 */
	dateTimeChange(dates, dateStrings) {
		let that = this;
		// let from_time_unix = moment(dateStrings[0], "DD-MM-YYYY").tz('Asia/Kolkata').unix(),
		// 	upto_time_unix = moment(dateStrings[1], "DD-MM-YYYY").tz('Asia/Kolkata').unix();
		// console.log('From: ', dates[0], ', to: ', dates[1]);
		// console.log('From_string: ', dateStrings[0], ', to_string: ', dateStrings[1]);
		// console.log('From_Unix: ', from_time_unix, ', to_Unix: ', upto_time_unix);
		// console.log('this.parsed', this.parsed);
		// this.stringified = queryString.stringify(this.parsed, {sort: false});
		// location.search = this.stringified;
		//this.props.history.push('/?' + this.stringified);
		// console.log('location.search', this.stringified);
		that.setState({
			from_time: dateStrings[0],
			upto_time: dateStrings[1],
			child_dont_update: true,
			// from_time_unix: from_time_unix,
			// upto_time_unix: upto_time_unix,
		}, () => {
			// console.log('From_ok', that.state.from_time);
			// console.log('From_ok', that.state.upto_time);
			// that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display);
		});
		// that.get24hourDataRange(dateStrings[0], dateStrings[1]);
	}

	/**
	 * This function is called when the ok button is clivked on th edate time picker.
	 */
	callAPI(a,b,c) {
		// console.log('ok a',a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"));
		// console.log('ok b',b);
		// console.log('ok c',c);
		// this.setState({
		// 	child_dont_update: false,
		// });
		// this.get24hourDataRange(a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), a[1].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), null, true);
	}

	/**
	 * This function sets the avg time selected in the state.
	 * @param  {Number} event Seconds to be averaged.
	 */
	handleAverageTimeSelect(key, event) {
		// console.log('handleAverageTimeSelect key', key);
		// console.log('handleAverageTimeSelect event', event);
		if (key == 'flood') {
			this.setState({
				avg_time: event
			});
		} else if (key == 'aura') {
			this.setState({
				avg_data_time_aura: event
			});
		}
	}

	/**
	 * This function sets the data type.
	 * @param  {Object} e Event triggered.
	 */
	handleDataTypeSelection(e) {
		// console.log('handleDataTypeSelection', e);
		this.setState({
			data_type: e.target.value
		}/*, () => this.setParamID()*/);
	}

	handleCitySelect(e) {
		// console.log('handleCitySelect', e);
		this.setState({
			city_selected: e
		});
	}

	handleConversionType(e) {
		// console.log('handleConversionType', e);
		this.setState({
			conversion_type: e.target.value
		});
	}

	handleStationSelect(e) {
		console.log('handleStationSelect', e);
		this.setState({
			stations_selected: e
			// stations_selected: [176, 177, 266, 268]
		}/*, () => {
			if (this.state.value == this.state.aura_infra) {
				// this.setParamsIds();
				this.setParamID();
			}
		}*/);
	}

	// setParamID() {
	// 	let param_name_list = _.clone(this.state.param_name_list);
	// 	let params_selected = [],
	// 		params_select_option = [];
	// 	this.all_parameters_of_station = [];
	// 	this.all_parameters_of_station.push(this.hourly_aqi);
		
	// 	if (this.state.all_stations_aura && this.state.all_stations_aura.length) {
	// 		this.state.all_stations_aura.map((station_aura) => {
	// 			if (this.state.stations_selected && this.state.stations_selected.length) {
	// 				this.state.stations_selected.map((st_select) => {
	// 					if (this.mapFmsToAura(st_select) == station_aura.id) {
	// 						if (station_aura.parameters && station_aura.parameters.length) {
	// 							station_aura.parameters.map((param) => {
	// 								if (!_.some(this.all_parameters_of_station, param)) {
	// 									this.all_parameters_of_station.push(param);
	// 								}
	// 								if(!param_name_list[param.key]) {
	// 									param_name_list[param.key] = param.name;
	// 								} else {
	// 									param_name_list[param.key] = param.name;
	// 								}
	// 								if (params_selected.indexOf(param.key) == -1) {
	// 									if (this.state.data_type == 'avg') {
	// 										params_selected.push(param.key);
	// 										params_select_option.push(param.key);
	// 									} else {
	// 										if (this.state.is_admin) {
	// 											if (param.key != this.state.hourly_aqi_type && param.key != this.state.wind_rose_type && param.key != this.state.pollution_rose_type) {
	// 												params_selected.push(param.key);
	// 												params_select_option.push(param.key);
	// 											}
	// 										} else {
	// 											if (param.key != this.state.hourly_aqi_type && param.key != this.state.wind_rose_type && param.key != this.state.pollution_rose_type && param.key != this.state.rain_param_type) {
	// 												params_selected.push(param.key);
	// 												params_select_option.push(param.key);
	// 											}
	// 										}
	// 									}
	// 								}
	// 							});
	// 						} 
	// 					}
	// 				});
	// 			}
	// 			if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(parseInt(station_aura.id))) {
	// 				console.log('this.all_parameters_of_station1', this.all_parameters_of_station);
	// 			if (_.some(station_aura.parameters, {key: 'wspeed'}) && _.some(station_aura.parameters, {key: 'wdir'})) {
	// 				if (!(_.some(this.all_parameters_of_station, {key: 'wind_rose'}))) {
	// 					this.all_parameters_of_station.push(this.wind_rose);
	// 				}
	// 			}
	// 			if (_.some(station_aura.parameters, {key: 'wdir'}) && (_.some(station_aura.parameters, {key: 'pm2.5'}) || _.some(station_aura.parameters, {key: 'pm10'}) || _.some(station_aura.parameters, {key: 'no2'}) || _.some(station_aura.parameters, {key: 'o3'}) || _.some(station_aura.parameters, {key: 'co'}) || _.some(station_aura.parameters, {key: 'so2'}))) {
	// 				if (!(_.some(this.all_parameters_of_station, {key: 'pollution_rose'}))) {
	// 					this.all_parameters_of_station.push(this.pollution_rose);
	// 				}
	// 			}
	// 		}
	// 		});
	// 	}
		
	// 	if (this.state.data_type == 'avg') {
	// 		let arr_temp = ['wind_rose', 'hourly_aqi', 'pollution_rose'];
	// 		arr_temp.map((arr) => {
	// 			params_selected.push(arr);
	// 			params_select_option.push(arr);
	// 		});
	// 	}
	// 	let select_all_check = false;
	// 	if (params_selected && params_select_option && params_selected.length == params_select_option.length) {
	// 		select_all_check = true;
	// 	} else {
	// 		select_all_check = false;
	// 	}
	// 	// console.log('this.all_parameters_of_station', this.all_parameters_of_station);
	// 	this.setState({
	// 		params_selected: params_selected,
	// 		param_name_list: param_name_list,
	// 		params_select_option: params_select_option,
	// 		select_all_check: select_all_check
	// 	}/*, () => this.checkParam()*/);
	// }

	// selectAllParam(e, status) {
	// 	console.log('selectAllParam', e);
	// 	let param = [];
	// 	if (e.target.checked) {
	// 		param = this.state.params_select_option.slice(0);
	// 	}
	// 	this.setState({
	// 		select_all_check: e.target.checked,
	// 		params_selected: param
	// 	});
	// }

	// checkParam() {
	// 	let all_parameters_of_station = [];
	// 	this.state.all_stations_aura.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			if (_.some(station.parameters, {key: 'wspeed'}) && _.some(station.parameters, {key: 'wdir'})) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'wind_rose'}))) {
	// 					all_parameters_of_station.push(this.wind_rose);
	// 				}
	// 			}
	// 			if (_.some(station.parameters, {key: 'wdir'}) && (_.some(station.parameters, {key: 'pm2.5'}) || _.some(station.parameters, {key: 'pm10'}) || _.some(station.parameters, {key: 'no2'}) || _.some(station.parameters, {key: 'o3'}) || _.some(station.parameters, {key: 'co'}) || _.some(station.parameters, {key: 'so2'}))) {
	// 				if (!(_.some(all_parameters_of_station, {key: 'pollution_rose'}))) {
	// 					all_parameters_of_station.push(this.pollution_rose);
	// 				}
	// 			}
	// 		}
	// 	});
	// 	this.state.all_stations_aura.map((station) => {
	// 		if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
	// 			station.parameters.map((params) => {
	// 				if (!(_.some(all_parameters_of_station, {key: params.key}))) {
	// 					all_parameters_of_station.push(params);
	// 				}
	// 			});
	// 		}
	// 	});

	// 	this.setState({
	// 		all_parameters_of_station: all_parameters_of_station
	// 	},() => console.log('all_parameters_of_station', this.state.all_parameters_of_station));


	// 	/*if (this.state.params_selected && this.state.params_selected.length) {
	// 		this.state.params_selected.map((param) => {
	// 			if (true) {}
	// 		});
	// 	}*/
	// }

	// addSelectedParametersNew(e) {
	// 	console.log('addSelectedParametersNew', e);
	// 	let select_all_check = true;
	// 	if (e.length != this.state.params_select_option.length) {
	// 		select_all_check = false;
	// 	} else {
	// 		select_all_check = true;
	// 	}
	// 	this.setState({
	// 		select_all_check: select_all_check,
	// 		params_selected: e
	// 	});
	// }

	closeReport() {
		this.setState({
			show_report: false,
			show_form: true,
			value: 1,
			city_selected: null,
			stations_selected: [],
			selected_parameters: [],
			checked_parameters: [],
			data_type: 'raw',
			avg_time: 3600,
			from_time: null,
			upto_time: null
		},() => this.treeSelect([1, 2],["Major Road Junction", "Street / Shop / House Front"], {'triggerValue': 1}));
	}

	render () {
		const { startValue, endValue, endOpen } = this.state;
		/*const deviceProps = {
			treeData: deviceData,
			value: this.state.valueDevice,
			onChange: this.onChangeDevice,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Please select Device',
		};*/
		const tProps = {
			treeData: treeData,
			value: this.state.value,
			// onChange: (e) => this.onChange(e),
			treeCheckable: true,
			treeNodeFilterProp: 'title',
			placeholder: 'Please Select a station sub-category',
			treeDefaultExpandAll: true,
			showCheckedStrategy: SHOW_PARENT,
		};
		return (
			<div id="archive" className="mar-top-70">
				<Side active_link="archive" />
				<Head/>
				{(() => {
					if (this.state.show_form) {
						if (this.state.city_list && this.state.city_list.length && this.state.all_stations_fms && this.state.all_stations_fms.length) {
							return <Layout className="mar-top-72">
								<Content className="contains">
									<div className="head">Select your requirements</div>
									<Form layout="vertical" hideRequiredMark>
										<Row gutter={50}>
											{/*<Col span={12} className="wid-100">
												<Form.Item label="Select City">
													<Select defaultActiveFirstOption={true} placeholder={this.state.city_placeholder} filterOption={true} optionFilterProp="title" value={this.state.city_selected} style={{ width: '100%' }} onChange={(event) => this.handleCitySelect(event)}>
														{(() => {
															if (this.state.city_list && Object.values(this.state.city_list).length) {
																return this.state.city_list.map((station) => {
																	return <Option value={station.id} title={station.name}>{station.name}</Option>;
																});
															}
														})()}
													</Select>
												</Form.Item>
											</Col>*/}
											<Col span={12} className="wid-100">
												<Form.Item label="Select Sub-category">
													<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} {...tProps} style={{ width: '100%' }} />
												</Form.Item>
											</Col>
											<Col span={12} className="wid-100">
												<Form.Item label="Select Stations">
													<Select className={((this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra ? 'border-red' : '')} defaultActiveFirstOption={true} placeholder={this.state.stations_placeholder} filterOption={true} optionFilterProp="title" mode="multiple" value={this.state.stations_selected} style={{ width: '100%' }} onChange={(event) => this.handleStationSelect(event)}>
														{(() => {
															if (this.state.filtered_station_list_fms && Object.values(this.state.filtered_station_list_fms).length) {
																return this.state.filtered_station_list_fms.map((station) => {
																	return <Option value={station.id} title={station.name}>{station.name}</Option>;
																});
															}
														})()}
													</Select>
													{(() => {
														if ((this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra) {
															return <span className="color-red">Please Select only one station to view Raw data of Aurassure infra</span>;
														}
													})()}
												</Form.Item>
											</Col>
										</Row>
										<Row gutter={50}>
											<Col span={12} className="wid-100">
												<Form.Item label="Data Type">
													<RadioGroup onChange={(e) => this.handleDataTypeSelection(e)} value={this.state.data_type}>
														{/*<Radio value={1}>Summary</Radio>*/}
														<Radio value={'raw'} disabled={this.state.value == this.state.Rainfall_type}>Raw</Radio>
														<Radio value={'avg'}>Average</Radio>
													</RadioGroup>
													{(() => {
														if (this.state.value != this.state.aura_infra) {
															return <Select value={this.state.avg_time} style={{ width: 120 }} onChange={(event) => this.handleAverageTimeSelect('flood', event)} disabled={this.state.data_type == 'avg' ? false : true}>
															<Option value={900}>15 Minutes</Option>
															<Option value={3600}>1 Hour</Option>
															<Option value={86400}>24 Hours</Option>
														</Select>
														} else if (this.state.value == this.state.aura_infra) {
															return <Select value={this.state.avg_data_time_aura} style={{ width: 120 }} onChange={(event) => this.handleAverageTimeSelect('aura', event)} disabled={this.state.data_type == 'avg' ? false : true}>
															<Option value={1}>1 Hour</Option>
															<Option value={8}>8 Hours</Option>
															<Option value={24}>24 Hours</Option>
														</Select>
														}
													})()}
													
												</Form.Item>
											</Col>
											<Col span={12} className="wid-100 date-pick">
												<Form.Item label="Time Interval">
													<RangePicker
														className="calendar-icon"
														allowClear={false}
														format="DD-MM-YYYY"
														placeholder={['From', 'To']}
														disabledDate={disabledDate}
														value= {[this.state.from_time ? moment(this.state.from_time, "DD-MM-YYYY").tz('Asia/Kolkata') : '', this.state.upto_time ? moment(this.state.upto_time, "DD-MM-YYYY").tz('Asia/Kolkata') : '']}
														onChange={(a,b) => this.dateTimeChange(a,b)}
														onOk={(a,b,c) => this.callAPI(a,b,c)}
													/>
													{/*<DatePicker
														disabledDate={this.disabledStartDate}
														showTime
														format="YYYY-MM-DD HH:mm"
														value={startValue}
														placeholder="From Date "
														onChange={this.onStartChange}
														onOpenChange={this.handleStartOpenChange}
													/>
													<span className="separator"> - </span>
													<DatePicker
														disabledDate={this.disabledEndDate}
														showTime
														format="YYYY-MM-DD HH:mm"
														value={endValue}
														placeholder="To Date"
														onChange={this.onEndChange}
														open={endOpen}
														onOpenChange={this.handleEndOpenChange}
													/>*/}
												</Form.Item>
											</Col>
											{/*<Col span={12} className="wid-100">
												<Form.Item label="Select Device">
													<TreeSelect showSearch treeDefaultExpandAll {...deviceProps} />
												</Form.Item>
											</Col>*/}
										</Row>
										{(() => {
											if (this.state.value == this.state.aura_infra) {
												return <Row gutter={50}>
												{/*<Col span={12} className="wid-100">
													<Form.Item label="Data Type">
														<RadioGroup onChange={this.onChange1} value={this.state.value1}>
															<Radio value={1}>Summary</Radio>
															<Radio value={2}>Raw</Radio>
															<Radio value={3}>Average</Radio>
														</RadioGroup>
													</Form.Item>
												</Col>*/}
													{/*<Col span={12} className="wid-100">
														<Form.Item label="Parameters">
															{(() => {
																let parameters = [];
																if (this.state.city_selected != null) {
																	parameters = [];
																	return <div className="option-content">Can't choose parameter for city</div>;
																} else {
																	if (this.state.selected_parameters != null) {
																		console.log("selected parameters in render ",this.state.selected_parameters);
																		console.log("checked parameters in render ",this.state.checked_parameters);
																		if (this.state.stations_selected && this.state.stations_selected.length) {
																			parameters = [];
																			parameters.push(this.hourly_aqi);
																		}
																		this.state.all_stations_aura.map((station) => {
																			if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
																				if (_.some(station.parameters, {key: 'wspeed'}) && _.some(station.parameters, {key: 'wdir'})) {
																					if (!(_.some(parameters, {key: 'wind_rose'}))) {
																						parameters.push(this.wind_rose);
																					}
																				}
																				if (_.some(station.parameters, {key: 'wdir'}) && (_.some(station.parameters, {key: 'pm2.5'}) || _.some(station.parameters, {key: 'pm10'}) || _.some(station.parameters, {key: 'no2'}) || _.some(station.parameters, {key: 'o3'}) || _.some(station.parameters, {key: 'co'}) || _.some(station.parameters, {key: 'so2'}))) {
																					if (!(_.some(parameters, {key: 'pollution_rose'}))) {
																						parameters.push(this.pollution_rose);
																					}
																				}
																			}
																		});
																		if (this.state.all_stations_aura && this.state.all_stations_aura.length) {
																			this.state.all_stations_aura.map((station) => {
																				if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station.id)) {
																					station.parameters.map((param) => {
																						if (!(_.some(parameters, {key: param.key}))) {
																							parameters.push(param);
																						}
																						// console.log('param_key', param.key);
																					});
																					this.station_type = station.type;
																					console.log('station_type', this.station_type);
																				}
																			});
																		}
																		if (parameters && parameters.length) {
																			console.log('parameters', parameters);
																			let parameter_options = parameters.map((parameter, i) => {
																				if (parameter.key == 'hourly_aqi') {
																					if (this.station_type == '2') {
																						return null;
																					} else {
																						return (
																							<div className="option" key={i}>
																								<input type="checkbox" id={'param_hourly_aqi'} defaultChecked checked={this.state.checked_parameters.indexOf(parameter.key) >= 0} onChange={(e) =>this.addSelectedParameters(e.target.checked, parameter.key)} disabled={this.state.data_type_check ? true : false} />
																								<label htmlFor={'param_'+parameter.key} dangerouslySetInnerHTML={{__html: parameter.name}} />
																							</div>
																						);
																					}
																				} else if (parameter.key == 'wind_rose') {
																					if (this.station_type == '2') {
																						return null;
																					} else {
																						return (
																							<div className="option" key={i}>
																								<input type="checkbox" id={'param_wind_rose'} defaultChecked checked={this.state.checked_parameters.indexOf(parameter.key) >= 0} onChange={(e) =>this.addSelectedParameters(e.target.checked, parameter.key)} disabled={this.state.data_type_check ? true : false} />
																								<label htmlFor={'param_'+parameter.key} dangerouslySetInnerHTML={{__html: parameter.name}} />
																							</div>
																						);
																					}
																				} else if (parameter.key == 'pollution_rose') {
																					if (this.station_type == '2') {
																						return null;
																					} else {
																						return (
																							<div className="option" key={i}>
																								<input type="checkbox" id={'param_pollution_rose'} defaultChecked checked={this.state.checked_parameters.indexOf(parameter.key) >= 0} onChange={(e) =>this.addSelectedParameters(e.target.checked, parameter.key)} disabled={this.state.data_type_check ? true : false} />
																								<label htmlFor={'param_'+parameter.key} dangerouslySetInnerHTML={{__html: parameter.name}} />
																							</div>
																						);
																					}
																				} else {
																					return(
																						<div className="option" key={i}>
																							<input type="checkbox" id={'param_'+parameter.key} defaultChecked checked={this.state.checked_parameters.indexOf(parameter.key) >= 0} onChange={(e) =>this.addSelectedParameters(e.target.checked, parameter.key)} disabled={(this.state.is_admin ? false : (parameter.key == 'rain' && (this.state.is_admin || this.state.data_type_check) ? true : false))} />
																							<label htmlFor={'param_'+parameter.key} dangerouslySetInnerHTML={{__html: parameter.name}} />
																						</div>
																					);
																				}
																			});
																			return(
																				<div className="option-content">
																					{parameter_options.filter(Boolean)}
																				</div>
																			);
																		} else {
																			return <div className="option-content">
																				{'No data has been received from the device yet.'}
																			</div>;
																		}
																		
																		// let	params_list = this.state.selected_parameters.map((key) => {
																		// 	return <div className="option">
																		// 		<input type="checkbox" id={'param_'+key} checked={this.state.checked_parameters.indexOf(key) >= 0} onChange={(e) =>this.addSelectedParameters(e.target.checked, key)} />
																		// 		<label htmlFor={'param_'+key} dangerouslySetInnerHTML={{ __html: this.state.all_parameters[key].name }} />
																		// 	</div>;
																		// });
																		// return params_list;
																	} else{
																		return <div className="option-content">Select a station first</div>;
																	}
																}
															})()}
														</Form.Item>
													</Col>*/}
													<Col span={12} className="wid-100">
														<Form.Item label="Parameters">
															{/*<CheckboxGroup options={this.state.selected_parameters} defaultValue={this.state.checked_parameters} onChange={(e) => this.addSelectedParametersNew(e)} />*/}
															{(() => {
																if (this.state.stations_selected && this.state.stations_selected.length) {
																	return <Checkbox defaultChecked={this.state.select_all_check} checked={this.state.select_all_check} onChange={(e) => this.selectAllParam(e)}>Select All</Checkbox>
																}
															})()}
															{(() => {
																if (this.state.stations_selected && this.state.stations_selected.length) {
																	console.log('params_selected', this.state.params_selected);
																	return <CheckboxGroup style={{ width: '100%' }} value={this.state.params_selected}  defaultValue={this.state.params_selected} onChange={(e) => this.addSelectedParametersNew(e)}>
																		<Row>
																		{(() => {
																			if (this.state.params_select_option && this.state.params_select_option.length) {
																				return this.state.params_select_option.map((pollutants) => {
																					return <Col span={8}><Checkbox value={pollutants}><span dangerouslySetInnerHTML={{__html:this.state.param_name_list[pollutants]}}></span></Checkbox></Col>
																				});
																			}
																		})()}
																		</Row>
																	</CheckboxGroup>;
																} else {
																	return <span>Please Select a Station</span>
																}
															})()}
														</Form.Item>
													</Col>
													<Col span={12} className="wid-100">
														<Form.Item label="Conversion Type">
															<RadioGroup onChange={(e) => this.handleConversionType(e)} value={this.state.conversion_type}>
																<Radio value={'usepa'}>USEPA</Radio>
																<Radio value={'naqi'}>NAQI</Radio>
															</RadioGroup>
														</Form.Item>
													</Col>
												</Row>
											}
										})()}
										{/*<Row gutter={50}>
											<Col span={12} className="wid-100">
												<Form.Item label="Data Type">
													<RadioGroup onChange={this.onChange2} value={this.state.value2}>
														<Radio value={1}>Grid</Radio>
														<Radio value={2}>Raw</Radio>
													</RadioGroup>
												</Form.Item>
											</Col>
											<Col span={12} className="wid-100">
												<Form.Item label="Conversion Type">
													<RadioGroup onChange={this.onChange3} value={this.state.value3}>
														<Radio value={1}>USEPA</Radio>
														<Radio value={2}>NAQI</Radio>
													</RadioGroup>
												</Form.Item>
											</Col>
										</Row>
										<Row gutter={50}>
											<Col span={12} className="wid-100">
												<Form.Item label="Download Format">
													<RadioGroup onChange={this.onChange4} value={this.state.value4}>
														<Radio value={1}>Excel</Radio>
														<Radio value={2}>Pdf</Radio>
													</RadioGroup>
												</Form.Item>
											</Col>
										</Row>*/}
									</Form>
								</Content>
								<Content className="contain butn-contain">
									<Button className="button" type="primary" disabled={(this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra} loading={this.props.getting_report} onClick={() => this.getReport()}>Generate Report</Button>
									{/*<Button className="button" type="primary" icon="download" >Download</Button>*/}
								</Content>
							</Layout>;
						} else {
							return <Layout className="mar-top-72">
								<Content className="contains">
									<Loading is_inline={true} />
								</Content>
							</Layout>;
						}
					} else if (this.state.show_report) {

						console.warn("status","show report");

						//let final_data = ;

						//console.warn("final data",this.state.stations_grid_data);

						/*return (
							<ReactDataGrid
							  columns={columns}
							  //rowGetter={i => this.rowGetter(i,this.props.stations_grid_data,this.props.props_index)}
							  rowGetter = {i => this.state.stations_grid_data[i]}
							  rowsCount={this.state.stations_grid_data.length}
							  rowSelection={false}
							  minHeight={450}
							  //headerRowHeight={1}
							/>
						);*/

						return <ArchiveReports 
						{...this.state}
						downloadReportPrep={() => this.downloadReportPrep()}
							setInParent={(from_time,upto_time,avg_time,avg_data_time_aura,filtered_station_list_fms,stations_placeholder,stations_selected,all_stations_fms,value, data_type, params_selected,params_select_option, all_parameters_of_station, conversion_type) => this.setInParent(from_time,upto_time,avg_time,avg_data_time_aura,filtered_station_list_fms,stations_placeholder,stations_selected,all_stations_fms,value, data_type, params_selected,params_select_option, all_parameters_of_station, conversion_type)}
							treeSelect={(value, label, extra) => this.treeSelect(value, label, extra)}
							handleStationSelect={(value) => this.handleStationSelect(value)}
							handleAverageTimeSelect={(key, value) => this.handleAverageTimeSelect(key, value)}
							handleDataTypeSelection={(value) => this.handleDataTypeSelection(value)}
							dateTimeChange={(a,b) => this.dateTimeChange(a,b)}
							callAPI={(a,b,c) => this.callAPI(a,b,c)}
							getReport={() => this.getReport()}
							from_time={this.state.from_time}
							upto_time={this.state.upto_time}
							avg_time={this.state.avg_time}
							avg_data_time_aura={this.state.avg_data_time_aura}
							filtered_station_list_fms={this.state.filtered_station_list_fms}
							stations_placeholder={this.state.stations_placeholder}
							stations_selected={this.state.stations_selected}
							all_stations_fms={this.state.all_stations_fms}
							getting_report={this.state.getting_report}
							from_time_report={this.state.from_time_report}
							upto_time_report={this.state.upto_time_report}
							station_name_list={this.state.station_name_list}
							station_name_grid_data={this.state.station_name_grid_data}
							stations_graph_data={this.state.stations_graph_data}
							stations_grid_data={this.state.stations_grid_data}
							stations_raw_data={this.state.stations_raw_data}
							closeReport={() => this.closeReport()}
							data_type={this.state.data_type}
							sub_category_object={this.state.sub_category_object}
							treeData={treeData}
							value={this.state.value}
							history={this.props.history}
							visible={this.state.drawDataVisible}
							onCancel={this.handleCancel}
							onCreate={this.handleCancel}
							ref={(child) => { this.child = child; }}
							all_parameters_of_station={this.all_parameters_of_station}
						/>;
					}
				})()}
			</div>
		);
	}
}

export default Archive;