import React from 'react';
import DateTime from 'react-datetime';
import moment from 'moment-timezone';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import { Scrollbars } from 'react-custom-scrollbars';
// import NavLink from './NavLink';
// import Select from './imports/Select';
import Loading from './imports/Loading';
// import MultiSelect from './imports/MultiSelect';
import ReportsForm from './imports/ReportsForm';
import MajorRoadAndShopFrontReport from './imports/MajorRoadAndShopFrontReport';
import OpenCanalAndStreetReport from './imports/OpenCanalAndStreetReport';
import PumpStationReport from './imports/PumpStationReport';
import RainfallReport from './imports/RainfallReport';
import GatedCanalReport from './imports/GatedCanalReport';
import _ from 'lodash';
import Head from './imports/Head';
import Side from './imports/Side';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input, Tooltip, Menu, DatePicker, notification, Alert } from 'antd';

const queryString = require('query-string');

let treeData = [];

const { Content, Footer } = Layout;

// HighchartsMore(ReactHighcharts.Highcharts);

/**
 * This class is used to render the Archive Reports.
 */
export default class Reports extends React.Component {
	/**
	 * This is the Constructor for Dashboard Page use to set the default task while page load.
	 * @param  {Object} params This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * This stores the parsed data from the query string.
		 * @type {String}
		 */
		this.parsed = queryString.parse(props.location.search);
		console.log('this.parsed', this.parsed);
		/**
		 * This sets the initial state for this class.
		 * @type {Object}
		 * @property {Boolean} getting_report stores the boolean value that the dat is being loaded or not.
		 * @property {string} value stores the category selected id.
		 * @property {string} data_type stores the data_type selected.
		 * @property {string} rainfall_type stores the rainfall type.
		 * @property {string} sump_type_graph stores the SUMP type.
		 * @property {string} pump_status_type stores the Pump type.
		 * @property {string} penstock_type_graph stores the Penstock type.
		 */
		this.state = {
			getting_report: false,
			value: 1,
			data_type: 'raw',
			all_stations: null,
			stations_placeholder: 'Select Stations',
			rainfall_type: 'rainfall',
			sump_type_graph: 'sump_level',
			pump_status_type: 'pump_status',
			penstock_type_graph: 'penstock_level',
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
			common_iterator: []
		};
		console.log('Major 1 constructor', this.state.common_iterator);

		/**
		 * This is an array containing the color codes to use in graphs.
		 * @type {Array}
		 */
		this.graph_colors = [
			'#43429a',
			'#07adb1',
			'#a44a9c',
			'#f4801f',
			'#c14040',
			'#6fccdd',
			'#61c3ab',
			'#56bc7b',
			'#e2da3e',
			'#41ce00',
			'#aa4728',
			'#b3d23c',
			'#a0632a',
			'#7156a3',
			'#3d577f',
			'#ee3352',
			'#43429a',
			'#07adb1',
			'#a44a9c',
			'#f4801f',
			'#c14040',
			'#6fccdd',
			'#61c3ab',
			'#56bc7b'
		];

		/**
		 * This is an array containing the color codes to use in graph background.
		 * @type {Array}
		 */
		this.graph_fill_color = [
			'rgba(67, 66, 154, 0.05)',
			'rgba(7, 173, 177, 0.05)',
			'rgba(164, 74, 156, 0.05)',
			'rgba(244, 128, 31, 0.05)',
			'rgba(193, 64, 64, 0.05)',
			'rgba(111, 204, 221, 0.05)',
			'rgba(97, 195, 171, 0.05)',
			'rgba(86, 188, 123, 0.05)',
			'rgba(226, 218, 62, 0.05)',
			'rgba(65, 206, 0, 0.05)',
			'rgba(170, 71, 40, 0.05)',
			'rgba(179, 210, 60, 0.05)',
			'rgba(160, 99, 42, 0.05)',
			'rgba(113, 86, 163, 0.05)',
			'rgba(61, 87, 127, 0.05)',
			'rgba(238, 51, 82, 0.05)',
			'rgba(67, 66, 154, 0.05)',
			'rgba(7, 173, 177, 0.05)',
			'rgba(164, 74, 156, 0.05)',
			'rgba(244, 128, 31, 0.05)',
			'rgba(193, 64, 64, 0.05)',
			'rgba(111, 204, 221, 0.05)',
			'rgba(97, 195, 171, 0.05)',
			'rgba(86, 188, 123, 0.05)'
		];
	}

	/**
	 * This method is called right after when an instance of a component is being created and inserted into the DOM.
	 */
	componentDidMount() {
		document.title = 'Reports - Flood Forecasting and Early Warning System for Kolkata City';
		// console.log('in mount');
		
		this.retriveData();
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
				let new_search_list = [];
				let station_name_list = {};
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						if (station.sub_category == that.state.value) {
							new_search_list.push({
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
					all_stations: json.station_list,
					new_search_list: new_search_list,
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
	/**
	 * Function used to get the data for the report page.
	 * @param {Object} update 
	 * @return {void} 
	 */
	getReport(data) {
		let that = this;
		that.setState({
			avg_time_for_graph: data.avg_data_time,
			stations_graph_data: [],
			stations_grid_data: [],
			getting_report: true
		});
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/get_report', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(data)
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('All Stations Data', json);
			if (json.status === 'success') {
				let length_of_data = json.stations_data.length ? json.stations_data.length : 0;
				let temp = [];
				for(let i = 0; i< length_of_data; i++) {
					temp.push('a');
				}
				let stations_graph_data = that.state.data_type == 'avg' ? that.formatDataAvg(json.stations_data/*that.state.stations_data*/) : that.formatData(json.stations_data);
				let rain_summary_data = [];
				if (that.state.value == that.state.Rainfall && json.stations_data && json.stations_data.length) {
					json.stations_data.map((rain_data) => {
						rain_summary_data.push({
							name: rain_data.name,
							total_rainfall: rain_data.total_rainfall
						});
					});
				}
				that.setState({
					// stations_graph_data: json.stations_graph_data,
					rain_summary_data: rain_summary_data,
					stations_grid_data: data && data.view_data_format && data.view_data_format.length && (data.view_data_format.indexOf('grid') > -1) ? json.stations_data : null,
					station_name_grid_data: json.stations_data,
					stations_graph_data: data && data.view_data_format && data.view_data_format.length && (data.view_data_format.indexOf('graph') > -1) ? stations_graph_data : null,
					common_iterator: temp,
					sub_category_selected_child: that.state.value,
					getting_report: false,
					from_time_report: data.from_time,
					upto_time_report: data.upto_time
				},() => {
					if (document.getElementById('report_view_container')) {
						that.smoothScroll(document.getElementById('report_view_container'));
					}
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					getting_report: false
				});
			}
		}).catch((ex) => {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
			that.setState({
				getting_report: false
			});
		});
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
	 * This function scrolls the view.
	 */

	smoothScroll(target) {
		var scrollContainer = target;
		do { //find scroll container
			// console.log('scroll 1');
				scrollContainer = scrollContainer.parentNode;
				if (!scrollContainer) return;
				scrollContainer.scrollTop += 1;
		} while (scrollContainer.scrollTop == 0);
		// console.log('scroll 2');
		var targetY = 0;
		do { //find the top of target relatively to the container
			// console.log('scroll 3');
				if (target == scrollContainer) break;
				targetY += target.offsetTop;
		} while (target = target.offsetParent);
		
		// start scrolling
		this.scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
	}

	/**
	 * This function is used in the smoothScroll function.
	 */

	scroll(c, a, b, i) {
		//console.log('scroll 3');
		i++; if (i > 30) return;
		c.scrollTop = a + (b - a) / 30 * i;
		setTimeout(() => this.scroll(c, a, b, i), 20);
	}
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
		
		this.props.history.push('/archivereport/' + query);
	}
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
	 * This function gets called when category or subcategory selection is made in the TreeSelect.
	 */
	treeSelect(value, label, extra) {
		// console.log('value', value);
		// console.log('label', label);
		// console.log('extra', extra);
		let all_stations = this.state.all_stations.slice(0);
		if (!isNaN(extra.triggerValue) && extra.triggerValue && extra.checked) {
			let temp = [];
			if (all_stations && all_stations.length) {
				all_stations.map((st) => {
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
				new_search_list: temp
			},() => console.log('value', this.state.value));
		} else if (!isNaN(extra.triggerValue)) {
			this.setState({
				value: null,
				new_search_list: []
			},() => console.log('value', this.state.value));
		}
	}
	/**
	 * This function sets the selected data type in the state.
	 * @param {string} data_type 
	 */
	setDataType(data_type) {
		this.setState({
			data_type: data_type
		});
	}
	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 */
	componentDidUpdate() {
		// this.changeParamCheckedStatus();
		console.log('Report Page updated');
	}

	/**
	 * This renders entire class with navigation bar.
	 * @return {ReactElement} markup
	 */
	render() {
		ReactHighcharts.Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});
		return(
			<div id="archive_report" className="full-page-container archive-container">
				<Side active_link="reports" />
				<Head/>
				<div className="container-report archive-container">
					<Layout>
						{(() => {
							if (this.state.all_stations && this.state.all_stations.length) {
								return <Layout>
									<Content className="contains">
										{/*<Breadcrumb style={{ margin: '16px 0' }}>
											<Breadcrumb.Item>User</Breadcrumb.Item>
											<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
										</Breadcrumb>*/}
										<div>
											<Row className="rows" className="top-0">
												<ReportsForm getting_report={this.state.getting_report} treeData={treeData} data_type={this.state.data_type} value={this.state.value} station_list={this.state.new_search_list} treeSelect={(value, label, extra) => this.treeSelect(value, label, extra)} getReport={(data) => this.getReport(data)} setDataType={(data_type) => this.setDataType(data_type)}/>
											</Row>
										</div>
										{(() => {
											if (!this.state.getting_report && (this.state.stations_grid_data && this.state.stations_grid_data.length) || (this.state.stations_graph_data && this.state.stations_graph_data.length)) {
												if (this.state.sub_category_selected_child == this.state.Major_Road_Junction || this.state.sub_category_selected_child == this.state.Street_Sub_House_Front) {
													return <MajorRoadAndShopFrontReport from_time_report={this.state.from_time_report} upto_time_report={this.state.upto_time_report} station_name_grid_data={this.state.station_name_grid_data} data_type={this.state.data_type} stations_graph_data={this.state.stations_graph_data} stations_grid_data={this.state.stations_grid_data} common_iterator={this.state.common_iterator} station_name_list={this.state.station_name_list}/>
												} else if (this.state.sub_category_selected_child == this.state.Open_Canal || this.state.sub_category_selected_child == this.state.Street_Sub_House_Front_water) {
													return <OpenCanalAndStreetReport from_time_report={this.state.from_time_report} upto_time_report={this.state.upto_time_report} data_type={this.state.data_type} stations_graph_data={this.state.stations_graph_data} stations_grid_data={this.state.stations_grid_data} common_iterator={this.state.common_iterator} station_name_list={this.state.station_name_list}/>
												} else if (this.state.sub_category_selected_child == this.state.Rainfall) {
													return <RainfallReport rain_summary_data={this.state.rain_summary_data} from_time_report={this.state.from_time_report} upto_time_report={this.state.upto_time_report} avg_time={this.state.avg_time_for_graph} data_type={this.state.data_type} stations_graph_data={this.state.stations_graph_data} stations_grid_data={this.state.stations_grid_data} common_iterator={this.state.common_iterator} station_name_list={this.state.station_name_list}/>
												} else if (this.state.sub_category_selected_child == this.state.Pump_Station_Status || this.state.sub_category_selected_child == this.state.pump_station_2) {
													return <PumpStationReport from_time_report={this.state.from_time_report} upto_time_report={this.state.upto_time_report} avg_time={this.state.avg_time_for_graph} all_stations={this.state.all_stations} data_type={this.state.data_type} stations_graph_data={this.state.stations_graph_data} stations_grid_data={this.state.stations_grid_data} common_iterator={this.state.common_iterator} station_name_list={this.state.station_name_list}/>
												} else if (this.state.sub_category_selected_child == this.state.Gated_Canal) {
													return <GatedCanalReport from_time_report={this.state.from_time_report} upto_time_report={this.state.upto_time_report} all_stations={this.state.all_stations} data_type={this.state.data_type} stations_graph_data={this.state.stations_graph_data} stations_grid_data={this.state.stations_grid_data} common_iterator={this.state.common_iterator} station_name_list={this.state.station_name_list}/>
												}
											} else if (this.state.getting_report) {
												return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
													<Row className="white error-message">
														<Loading is_inline={true}/>
													</Row>
												</Row>;
											} else if (!this.state.getting_report && ((!this.state.stations_graph_data && this.state.stations_grid_data && this.state.stations_grid_data.length == 0) || (!this.state.stations_grid_data && this.state.stations_graph_data && this.state.stations_graph_data.length == 0) || (this.state.stations_grid_data && this.state.stations_grid_data.length == 0 && this.state.stations_graph_data && this.state.stations_graph_data.length == 0))) {
												return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
													<Row className="white error-message">
														<div className="no-data-text">No data available!</div>
													</Row>
												</Row>;
											}
										})()}
									</Content>
								</Layout>;
							}  else {
								return <Layout>
									<Content className="contains">
										<Loading />
									</Content>
								</Layout>;
							}
						})()}
					</Layout>
				</div>
			</div>
		);
	}
}

// Reports.contextTypes = {
// 	router: React.PropTypes.object
// };
