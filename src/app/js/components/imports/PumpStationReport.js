import React from 'react';
import moment from 'moment-timezone';
import DateTime from 'react-datetime';
import _ from 'lodash';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input, Tooltip, Menu, DatePicker, notification, Alert } from 'antd';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import { Scrollbars } from 'react-custom-scrollbars';

let temp_sump_child = ['avg', 'min', 'max'];

let temp_pump_child = ['rh', 'activities'];

/**
 * Component for Open Canal and street under Flood category report.
 */
export default class PumpStationReport extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		console.log('PumpStation 1 constructor', this.props.common_iterator);
		/**
		 * This is the state of the component.
		 * @type {Object}
		 * @property {string} rainfall_type stores the type for rainfall.
		 * @property {string} sump_type_graph stores the type for sump.
		 * @property {string} penstock_type_graph stores the type for penstock.
		 * @property {string} pump_type stores the type for pumps.
		 */
		this.state = {
			rainfall_type: 'rainfall',
			sump_type_graph: 'sump_level',
			penstock_type_graph: 'penstock_level',
			pump_type: 'pump_status'
		};
		/**
		 * Stores the unit of the parameters
		 * @type {Array}
		 */
		this.unit_array = [];
		/**
		 * Array of colors.
		 * @type {Array}
		 */
		this.err_msg = false;
		/**
		 * Array of colors.
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
			'#ee3352'
		];
		/**
		 * Stores the type of the pump.
		 * @type {Array}
		 */
		this.type_configure= [];
		/**
		 * Array of colors for fill in graph.
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
			'rgba(238, 51, 82, 0.05)'
		];
	}

	/**
	 * Predefined function of React.js
	 */
	componentDidMount() {
		let that = this;
		let pump_current_status = {};
		if (that.props.stations_graph_data && that.props.stations_graph_data.length) {
			let station_temp_id = [];
			that.props.stations_graph_data.map((st) => {
				station_temp_id.push(st.id);
			});
			if (station_temp_id.length) {
				station_temp_id.map((id) => {
					that.props.all_stations_fms.map((station) => {
						if (station.id == id) {
							// console.log('debug 14');
							if (station.parameters && station.parameters.length) {
								// console.log('debug 15');
								station.parameters.map((param) => {
									if (param.name != 'Penstock' && param.name != 'Penstock Level' && param.name != 'Sump' && param.name != 'Sump Level' && param.name != 'Rainfall') {
										// console.log('debug 16', param);
										if (!pump_current_status[param.name]) {
											pump_current_status[param.name] = param.value;
											// console.log('debug 17', pump_current_status);
										} else {
											pump_current_status[param.name] = param.value;
											// console.log('debug 18', pump_current_status);
										}
									}
								});
							}
						}
					});
				});
			}
		}
		that.setState({
			pump_current_status: pump_current_status
		}, () => console.log('Major 122', that.state.pump_current_status));
	}
	/**
	 * Predefined function used to compare between current and next props.
	 * @param  {Object} nextProps 
	 * @return {Boolean}           
	 */
	shouldComponentUpdate(nextProps) {
		if ((nextProps.stations_graph_data && nextProps.stations_graph_data.length && this.props.stations_graph_data && this.props.stations_graph_data.length && !_.isEqual(nextProps.stations_graph_data,this.props.stations_graph_data)) || (nextProps.stations_grid_data && nextProps.stations_grid_data.length && this.props.stations_grid_data && this.props.stations_grid_data.length && !_.isEqual(nextProps.stations_grid_data,this.props.stations_grid_data)) || (nextProps.common_iterator && nextProps.common_iterator.length && this.props.common_iterator && this.props.common_iterator.length && !_.isEqual(nextProps.common_iterator,this.props.common_iterator)) || this.props.gridVisible != nextProps.gridVisible) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * This function sets the  Raw data for the chart.
	 * @param {string} key It stores the type whose data is to be sent.
	 * @param {Object} details It has the Current object whose chart is to be created.
	 */
	setData(key, details) {
		let data_rain = [],
			data_sump = [],
			data_penstock = [],
			data_new = {},
			data_new_arr = [],
			timestamp = [],
			series = [],
			yaxis_text_array = [],
			sump_graph_name = '',
			penstock_graph_name = '',
			penstock_graph_unit = '',
			sump_graph_unit = '',
			yaxis_text;
		this.unit_array = [];
		if (details && Object.values(details).length && details.parameters && details.parameters.length) {
			details.parameters.map((data) => {
				if (data.data && data.data.length) {
					if (!data.type || (data.type && data.type == this.state.pump_type)) {
						// console.log('type_configure', data.values);
						if (isNaN(data.data[data.data.length - 1]['value'])) {
							this.type_configure.push('configured');
						} else {
							this.type_configure.push('unconfigured');
						}
					}
					if (data.type == this.state.pump_type) {
						data.data.map((runhour, index) => {
							if (data_new[data.name]) {
								data_new[data.name].push({x: runhour.time*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))) });
							} else {
								data_new[data.name] = [];
								data_new[data.name].push({x: runhour.time*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))) });
							}
						});
					} else if (data.type == this.state.rainfall_type) {
						data.data.map((runhour, index) => {
							data_rain.push([runhour.time*1000, (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))]);
						});
						yaxis_text = data.unit;
					} else if (data.type == this.state.sump_type_graph) {
						// console.log('data sump', data);
						data.data.map((runhour, index) => {
							data_sump.push([runhour.time*1000, (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))]);
						});
						sump_graph_name = data.name;
						sump_graph_unit = data.unit;
					} else if (data.type == this.state.penstock_type_graph) {
						// console.log('data sump', data);
						data.data.map((runhour, index) => {
							data_penstock.push([runhour.time*1000, (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))]);
						});
						penstock_graph_name = data.name;
						penstock_graph_unit = data.unit;
					}
				}
			});
		}
		yaxis_text = '';
		if (key == 'series') {
			series = {
				'data_new': data_new,
				'data_rain': [{
					'name': 'Rainfall',
					'data': data_rain,
					'color': this.graph_colors[0],
					fillColor: this.graph_fill_color[0],
					lineColor: this.graph_colors[0]
				}],
				'data_sump': [{
					'name': sump_graph_name,
					'data': data_sump,
					'color': this.graph_colors[3],
					fillColor: this.graph_fill_color[3],
					lineColor: this.graph_colors[3],
					'unit' : sump_graph_unit
				}],
				'data_penstock': [{
					'name': penstock_graph_name,
					'data': data_penstock,
					'color': this.graph_colors[4],
					fillColor: this.graph_fill_color[4],
					lineColor: this.graph_colors[4],
					'unit' : penstock_graph_unit
				}]
			};
			console.log('series', series);
			return series;
		}
	}
	/**
	 * This function sets the  Average data for the chart.
	 * @param {string} key It stores the type whose data is to be sent.
	 * @param {Object} details It has the Current object whose chart is to be created.
	 */
	setDataAvg(key, details) {
		let data_rain = [],
			data_sump = {},
			data_penstock = {},
			data_new = {},
			data_new_arr = [],
			timestamp = [],
			series = [],
			yaxis_text_array = [],
			sump_graph_name = '',
			penstock_graph_name = '',
			penstock_graph_unit = '',
			sump_graph_unit = '',
			yaxis_text;
		this.unit_array = [];
		// let counter = 0;
		// let temp_arr = [];
		console.log('details', details);
		if (details && Object.values(details).length && details.parameters && details.parameters.length) {
			details.parameters.map((data) => {
				let counter = 0;
				let temp_arr = [];
				if (data.data && data.data.length) {
					if (!data.type || (data.type && data.type == this.state.pump_type)) {
						// console.log('type_configure', data.values);
						if (isNaN(data.data[data.data.length - 1]['rh'])) {
							this.type_configure.push('configured');
						} else {
							this.type_configure.push('unconfigured');
						}
					}
					if (data.type == this.state.pump_type) {
						console.log('data_type_of_avg', data.data);
						data.data.map((runhour, index) => {
							if (runhour && Object.values(runhour).length && !isNaN(runhour.rh)) {
								if (runhour.rh === null || runhour.rh === undefined) {
									temp_arr.push([runhour.time*1000, null]);
								} else {
									temp_arr.push([runhour.time*1000, parseFloat(parseFloat(runhour.rh/3600).toFixed(2))]);
								}
							} else if (runhour && Object.values(runhour).length && isNaN(runhour.rh)) {
								temp_arr.push([runhour.time*1000, null]);
							}
							counter++;
							if (this.props.avg_time && this.props.avg_time == 3600 && counter % 24 == 0 || data.data.length == counter) {
								if (data_new[data.name]) {
									data_new[data.name].push(temp_arr);
								} else {
									data_new[data.name] = [];
									data_new[data.name].push(temp_arr);
								}
								// data_new_arr.push(temp_arr);
								temp_arr= [];
							} else if (this.props.avg_time && this.props.avg_time == 900 && counter % 48 == 0 || data.data.length == counter) {
								if (data_new[data.name]) {
									data_new[data.name].push(temp_arr);
								} else {
									data_new[data.name] = [];
									data_new[data.name].push(temp_arr);
								}
								// data_new_arr.push(temp_arr);
								temp_arr= [];
							} else if (this.props.avg_time && this.props.avg_time == 86400 && counter % 31 == 0 || data.data.length == counter) {
								if (data_new[data.name]) {
									data_new[data.name].push(temp_arr);
								} else {
									data_new[data.name] = [];
									data_new[data.name].push(temp_arr);
								}
								// data_new_arr.push(temp_arr);
								temp_arr= [];
							}
							/*if (data_new[data.name]) {
								data_new[data.name].push([runhour.time*1000, parseFloat(runhour.rh)]);
							} else {
								data_new[data.name] = [];
								data_new[data.name].push([runhour.time*1000, parseFloat(runhour.rh)]);
							}*/
							/*if (data_new[data.name]) {
								data_new[data.name].push({x: runhour.time*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : parseFloat(runhour.value)), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : parseFloat(runhour.value)) });
							} else {
								data_new[data.name] = [];
								data_new[data.name].push({x: runhour.time*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : parseFloat(runhour.value)), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : parseFloat(runhour.value)) });
							}*/
						});

					} else if (data.type == this.state.rainfall_type) {
						data.data.map((runhour, index) => {
							data_rain.push([runhour.time*1000, (isNaN(runhour.value) || (runhour.value === null) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))]);
						});
						yaxis_text = data.unit;
					} else if (data.type == this.state.sump_type_graph) {
						// console.log('data sump', data);
						data.data.map((runhour, index) => {
							if (runhour && Object.keys(runhour).length) {
								if (data_sump[data.name]) {
									if (!data_sump[data.name].averages) {
										data_sump[data.name].averages = [];
										data_sump[data.name].averages.push([runhour.time*1000, ((runhour.avg || runhour.avg == 0) && !isNaN(runhour.avg) && (runhour.avg !== null) ? parseFloat(runhour.avg.toFixed(2)) : null)]);
									} else {
										data_sump[data.name].averages.push([runhour.time*1000, ((runhour.avg || runhour.avg == 0) && !isNaN(runhour.avg) && (runhour.avg !== null) ? parseFloat(runhour.avg.toFixed(2)) : null)]);
									}
									if (!data_sump[data.name].ranges) {
										data_sump[data.name].ranges = [];
										data_sump[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									} else {
										data_sump[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									}
									/*data_sump[data.name].push(
										[runhour.time*1000, parseFloat(runhour)]
									);*/
								} else {
									data_sump[data.name] = {};
									if (!data_sump[data.name].averages) {
										data_sump[data.name].averages = [];
										data_sump[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
									} else {
										data_sump[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
									}
									if (!data_sump[data.name].ranges) {
										data_sump[data.name].ranges = [];
										data_sump[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
									} else {
										data_sump[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
									}
								}
							}
							// data_sump.push([runhour.time*1000, parseFloat(runhour.value)]);
						});
						sump_graph_name = data.name;
						sump_graph_unit = data.unit;
					} else if (data.type == this.state.penstock_type_graph) {
						console.log('data penstock', data);
						data.data.map((runhour, index) => {
							// console.log('penstock data', data);
							if (runhour && Object.keys(runhour).length) {
								if (data_penstock[data.name]) {
									if (!data_penstock[data.name].averages) {
										data_penstock[data.name].averages = [];
										data_penstock[data.name].averages.push([runhour.time*1000, ((runhour.avg || runhour.avg == 0) && !isNaN(runhour.avg) && (runhour.avg !== null) ? parseFloat(runhour.avg.toFixed(2)) : null)]);
									} else {
										data_penstock[data.name].averages.push([runhour.time*1000, ((runhour.avg || runhour.avg == 0) && !isNaN(runhour.avg) && (runhour.avg !== null) ? parseFloat(runhour.avg.toFixed(2)) : null)]);
									}
									if (!data_penstock[data.name].ranges) {
										data_penstock[data.name].ranges = [];
										data_penstock[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									} else {
										data_penstock[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									}
									/*data_penstock[data.name].push(
										[runhour.time*1000, parseFloat(runhour)]
									);*/
								} else {
									data_penstock[data.name] = {};
									if (!data_penstock[data.name].averages) {
										data_penstock[data.name].averages = [];
										data_penstock[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
									} else {
										data_penstock[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
									}
									if (!data_penstock[data.name].ranges) {
										data_penstock[data.name].ranges = [];
										data_penstock[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									} else {
										data_penstock[data.name].ranges.push([runhour.time*1000, ((runhour.min || runhour.min == 0)  && !isNaN(runhour.min) && (runhour.min !== null)? parseFloat(runhour.min.toFixed(2)) : null), ((runhour.max || runhour.max == 0)  && !isNaN(runhour.max) && (runhour.max !== null)? parseFloat(runhour.max.toFixed(2)) : null)]);
									}
								}
							}
							// data_sump.push([runhour.time*1000, parseFloat(runhour.value)]);
						});
						penstock_graph_name = data.name;
						penstock_graph_unit = data.unit;
					}
				}
			});
		}
		yaxis_text = '';
		if (key == 'series') {
			series = {
				'data_new': data_new,
				/*'data_rain': [{
					'name': 'Rainfall',
					'data': data_rain,
					'color': this.graph_colors[0],
					fillColor: this.graph_fill_color[0],
					lineColor: this.graph_colors[0]
				}],*/
				'data_sump': [{
					'name': sump_graph_name,
					'data': data_sump,
					'color': this.graph_colors[3],
					fillColor: this.graph_fill_color[3],
					lineColor: this.graph_colors[3],
					'unit' : sump_graph_unit
				}],
				'data_penstock': [{
					'name': penstock_graph_name,
					'data': data_penstock,
					'color': this.graph_colors[4],
					fillColor: this.graph_fill_color[4],
					lineColor: this.graph_colors[4],
					'unit' : penstock_graph_unit
				}]
			};
			console.log('series', series);
			return series;
		}
	}
	/**
	 * This function converts the seconds into Hrs and Mins.
	 * @param  {Number} time Seconds
	 * @return {String}      Hours and mins
	 */
	timeFormat(time) {
		let hours = Math.trunc(time/3600),
			mins = Math.trunc((time%3600)/60),
			total = (hours ? hours + ' Hr ' : '') + (mins ? mins + ' Min' : '');
			if (total == '') {
				return '0 Min'
			} else {
				return total;
			}
	}
	/**
	 * This renders the main dashboard page with navigation bar.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		ReactHighcharts.Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});
		return <div id="report_view_container" className="report-view-container">
			{(() => {
				// for(let i = 0; i <= this.props.length_of_data; i++) {
				// return this.props.common_iterator.map((t, i) => {
					if (this.props.stations_grid_data && this.props.stations_grid_data.length && this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data.length) {
						return <div className="contain">
							{/*<div className="heading">{(this.props.stations_grid_data && this.props.stations_grid_data.length ? this.props.station_name_list[this.props.stations_grid_data[this.props.props_index].id] : '')}</div>*/}
							{(() => {
								if (this.props.stations_graph_data && this.props.stations_graph_data.length && !this.props.gridVisible && this.props.data_type == 'avg') {
									let chart_rh_ceil = this.props.avg_time;
									console.log('chart_rh_ceil', chart_rh_ceil);
									let data_new = this.setDataAvg('series', this.props.stations_graph_data[this.props.props_index]);
									let timestamp = this.setDataAvg('timestamp', this.props.stations_graph_data[this.props.props_index]);
									let yaxis_text = this.setDataAvg('yaxis_text', this.props.stations_graph_data[this.props.props_index]);

									let config = [],
										property = this.props.stations_graph_data[this.props.props_index];
									let chart_type = 'column';

									let type_configure = this.type_configure;
									let name_pump = [],
										status_pump = [];
									// console.log('type_configure', type_configure);
									if(data_new && Object.keys(data_new).length && data_new.data_new && Object.keys(data_new.data_new).length){
										// console.log('data sump', data_new);
										Object.keys(data_new.data_new).map((point_new, index)=>{
											name_pump.push(point_new);
											console.log('series name', point_new);

											if (this.state.pump_current_status && Object.keys(this.state.pump_current_status).length) {
												Object.keys(this.state.pump_current_status).map((pump_status) => {
													if (pump_status == point_new) {
														status_pump.push(this.state.pump_current_status[pump_status]);
													}
												});
											}
											
											// console.log('status_pump', status_pump);
											let config2 = [];
											if (data_new.data_new[point_new] && data_new.data_new[point_new].length) {
												data_new.data_new[point_new].map((data_point) => {
													console.log('series data', data_point);
													let options = {
														chart:{
															backgroundColor: '#FFFFFF',
															type: chart_type,
															height: 150,
															zoomType: 'x',
														},
														title: {
															text: ''
														},
														xAxis: {
															type: 'datetime',
															// categories: timestamp,
															title: {
																text: '',
																align: 'middle'
															}
														},
														yAxis: {
															title: {
																text: ''
															},
															ceiling: chart_rh_ceil/3600,
															floor: 0,
															// labels: {
															// 	enabled: false
															// },
															tickPositioner: function () {
																let positions = [];
																if (chart_rh_ceil == 3600) {
																	positions = [0,0.5,1];
																} else if (chart_rh_ceil == 900) {
																	positions = [0,0.1,0.25];
																} else if (chart_rh_ceil == 86400) {
																	positions = [0,12,24];
																}
																return positions;
															},
															labels: {
																formatter: function () {
																	let label = this.value;
																	let label_formated = '<span>' + (label == 0 ? '0 min' : ((Math.trunc(label) != '0' ? Math.trunc(label) + ''+ ' Hr  ' : '') + (Math.trunc(((label*3600)%3600)/60) != '0' ? Math.trunc(((label*3600)%3600)/60) + ' Min ' : '') + (chart_rh_ceil && chart_rh_ceil == 900 && Math.trunc(((label*3600)%3600)%60) != '0' ? Math.trunc(((label*3600)%3600)%60) + ' sec ' : ''))) + '</span>';
																	return label_formated;
																}
															}
														},
														tooltip: {
															/*formatter: function () {
																return 'Status : <b>' + (this.y == this.state.Major_Road_Junction ? 'ON' : 'OFF')  + '</b> on <b>' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH:mm, DD MMM') + '</b>';
															},
															borderRadius: 1,*/
															/*pointFormat: point_new + ': <span class="param-{point.val}"><b>{point.val}</b></span>',
															
															useHTML: true*/
															formatter: function () {
																return '<span class="tooltip-date">' + moment.unix((this.x/1000)).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm')/* + ' - ' + (chart_rh_ceil && chart_rh_ceil == 900 ? moment.unix(((this.x + 900000)/1000)).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') : (chart_rh_ceil && chart_rh_ceil == 3600 ? moment.unix(((this.x + 3600000)/1000)).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') : (chart_rh_ceil && chart_rh_ceil == 86400 ? moment.unix(((this.x + 86400000)/1000)).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') : '')))*/ + '</span><br/>Run Hours : <b>' + (this.y != 0 ? (Math.trunc(this.y) != '0' ? Math.trunc(this.y) + '</b>'+ '</b> Hr <b> ' : '') + (Math.trunc(((this.y*3600)%3600)/60) != '0' ? Math.trunc(((this.y*3600)%3600)/60) + '</b> Min <br>' : '') + (chart_rh_ceil && chart_rh_ceil == 900 && Math.trunc(((this.y*3600)%3600)%60) != '0' ? Math.trunc(((this.y*3600)%3600)%60) + '</b> sec <br>' : '') : (chart_rh_ceil && chart_rh_ceil == 3600 ? '0 Hr' : (chart_rh_ceil && chart_rh_ceil == 900 ? '0 Min' : (chart_rh_ceil && chart_rh_ceil == 86400 ? '0 Hr' : ''))));
															},
															useHTML: true,
															/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>',*/
																	borderRadius: 1,
														},
														legend: {
															enabled: false
														},
														credits: {
															enabled: false
														},
														exporting: {
															enabled: false
														},
														plotOptions: {
															column: {
																pointWidth: 30,
																pointPadding: 0.0,
																dataLabels: {
																	allowOverlap: false,
																	enabled: false,
																	crop: false,
																	overflow: 'none'
																},
																states: {
																	hover: {
																		enabled: false
																	}
																},
																series: {
																	groupPadding: 0
																}
															}
														},
														series: [{
															// type: 'area',
															color: this.graph_colors[index],
															data: data_point,
															fillColor: this.graph_fill_color[index],
															lineColor: this.graph_colors[index],
															// step: 'left'
														}]
													};
													// console.log('options', options);
													config2.push(options);
												});
											}
											config.push(config2);
										});
									}
									let chart_config_pump = [];
									if (config && config.length && this.err_msg == false) {

										chart_config_pump = config.map((point,index)=>{
											console.log('point ' + index, point);
											return <Row className="box-shadow-style pump-graph">
												<Row>
													<Col className="pad-top-25 pad-left-25 bold" span={24}>
														{name_pump[index]}
													</Col>
												</Row>
												{(() => {
													if (point && point.length) {
														return point.map((configuration, i) => {
															console.log('point configuration ' + i, configuration);
															return <Row className="margin-top-20">
																<Col span={24}>
																	<ReactHighcharts config={configuration} ref="chart"></ReactHighcharts>
																</Col>
															</Row>;
														});
													}
												})()}
											</Row>;
										});
									} else {
										chart_config_pump = <div className="no-data-text">No Data Found!</div>;
									}
									if (this.props.stations_graph_data[this.props.props_index] && Object.values(this.props.stations_graph_data[this.props.props_index]).length && this.props.stations_graph_data[this.props.props_index].parameters && this.props.stations_graph_data[this.props.props_index].parameters.length) {
										// console.log('penstock_value', this.props.penstock_value);
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Col span={24}>
												<Row className="back-transparant">
													<Col className="back-transparant">
														{(() => {
															console.log('data data 22',data_new['data_sump'][0]);
															if (data_new['data_sump'][0]['data'] && Object.values(data_new['data_sump'][0]['data']).length) {

																return <Row className="box-shadow-style white mar-bot-25">
																	<div className="hed mar-20">Sump</div>
																	<div className="sump-graph">
																	{(() => {
																		if (data_new['data_sump'][0]['data'] && Object.values(data_new['data_sump'][0]['data']).length) {
																			// console.log('rain sump', data_new['data_sump'][0]['data']);
																			let config =[];
																			Object.values(data_new['data_sump'][0]['data']).map((data_point, index) => {
																				// console.log('data_point', data_point);
																				let total_data = 0;
																				let y_axis_config = {};
																				data_point.averages.map((arr) => {
																					if (arr[1] && arr[1] != null && !isNaN(arr[1])) {
																						total_data = total_data + arr[1];
																					}
																				});
																				if (total_data > 0) {
																					y_axis_config = {
																						title: {
																							text: data_new['data_sump'][0]['unit']
																						}
																					};
																				} else {
																					y_axis_config = {
																						title: {
																							text: data_new['data_sump'][0]['unit']
																						},
																						min: 0,
																						max: 1,
																						showLastLabel: false
																					};
																				}
																				let options = {
																					chart: {
																						backgroundColor: '#FFFFFF',
																						// type: 'area',
																						height: 200,
																						zoomType: 'x',
																					},
																					title: {
																						text: ''
																					},
																					xAxis: {
																						type: 'datetime',
																						// categories: timestamp,
																						title: {
																							text: '',
																							align: 'middle'
																						},
																						tickmarkPlacement: 'on'
																					},
																					yAxis: y_axis_config,
																					tooltip: {
																						crosshairs: true,
																						shared: true,
																						valueSuffix: (' ' + data_new['data_sump'][0]['unit'])
																						/*formatter: function () {
																							return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_sump'][0]['name'] + ': <b>' + this.y + ' ' + data_new['data_sump'][0]['unit'] + '</b>';
																						},
																						useHTML: true*/
																						/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>'*/
																					},
																					legend: {
																						enabled: false
																					},
																					credits: {
																						enabled: false
																					},
																					exporting: {
																						enabled: false
																					},
																					plotOptions: {
																						area: {
																							marker: {
																								radius: 2
																							},
																							lineWidth: 1,
																							states: {
																								hover: {
																									lineWidth: 1
																								}
																							},
																							turboThreshold: 0
																						}
																					},
																					series: [{
																						name: 'Average',
																						data: data_point.averages,
																						zIndex: 1,
																						color: this.graph_colors[index],
																						marker: {
																							radius: 0,
																							fillColor: this.graph_fill_color[index],
																							lineWidth: 2,
																							lineColor: this.graph_colors[index]
																						}
																					}, {
																						name: 'Min - Max Range',
																						data: data_point.ranges,
																						type: "arearange",
																						lineWidth: 0,
																						linkedTo: ':previous',
																						color: this.graph_colors[index],
																						fillOpacity: 0.3,
																						zIndex: 0
																					}]
																					//data_new['data_sump'],
																						
																				};
																				config.push(options);
																			});
																			if (config && config.length) {
																				let chart = config.map((point,index)=>{
																					// console.log('point', point);
																					return <ReactHighcharts config={point} ref="chart"></ReactHighcharts>;
																				});
																				return chart;
																			}/* else {
																				return <div className="graph-container-rain">
																					<div className="graph-rain">
																						<div className="no-data-text">No 24 Hour Data Found!</div>;
																					</div>
																				</div>;
																			}*/
																		} else {
																			return <div className="no-data-text">No Data Found!</div>
																		}
																	})()}
																		{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
																	</div>
																</Row>;
															}
														})()}
														{(() => {
															console.log('data data 22',data_new['data_penstock'][0]);
															if (data_new['data_penstock'][0]['data'] && Object.values(data_new['data_penstock'][0]['data']).length) {

																return <Row className="box-shadow-style white mar-bot-25">
																	<div className="hed mar-20">Penstock</div>
																	<div className="sump-graph">
																	{(() => {
																		if (data_new['data_penstock'][0]['data'] && Object.values(data_new['data_penstock'][0]['data']).length) {
																			// console.log('rain sump', data_new['data_penstock'][0]['data']);
																			let config =[];
																			Object.values(data_new['data_penstock'][0]['data']).map((data_point, index) => {
																				console.log('data_point', data_point);
																				let total_data = 0;
																				let y_axis_config = {};
																				data_point.averages.map((arr) => {
																					if (arr[1] && arr[1] != null && !isNaN(arr[1])) {
																						total_data = total_data + arr[1];
																					}
																				});
																				if (total_data > 0) {
																					y_axis_config = {
																						title: {
																							text: (' ' + data_new['data_penstock'][0]['unit'])
																						}
																					};
																				} else {
																					y_axis_config = {
																						title: {
																							text: (' ' + data_new['data_penstock'][0]['unit'])
																						},
																						min: 0,
																						max: 1,
																						showLastLabel: false
																					};
																				}
																				let options = {
																					chart: {
																						backgroundColor: '#FFFFFF',
																						// type: 'area',
																						height: 200,
																						zoomType: 'x',
																					},
																					title: {
																						text: ''
																					},
																					xAxis: {
																						type: 'datetime',
																						// categories: timestamp,
																						title: {
																							text: '',
																							align: 'middle'
																						},
																						tickmarkPlacement: 'on'
																					},
																					yAxis: y_axis_config,
																					tooltip: {
																						crosshairs: true,
																						shared: true,
																						valueSuffix: (' ' + data_new['data_penstock'][0]['unit'])
																						/*formatter: function () {
																							return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_penstock'][0]['name'] + ': <b>' + this.y + ' ' + data_new['data_penstock'][0]['unit'] + '</b>';
																						},
																						useHTML: true*/
																						/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>'*/
																					},
																					legend: {
																						enabled: false
																					},
																					credits: {
																						enabled: false
																					},
																					exporting: {
																						enabled: false
																					},
																					plotOptions: {
																						area: {
																							marker: {
																								radius: 2
																							},
																							lineWidth: 1,
																							states: {
																								hover: {
																									lineWidth: 1
																								}
																							},
																							turboThreshold: 0
																						}
																					},
																					series: [{
																						name: 'Average',
																						data: data_point.averages,
																						zIndex: 1,
																						color: this.graph_colors[index],
																						marker: {
																							radius: 0,
																							fillColor: this.graph_fill_color[index],
																							lineWidth: 2,
																							lineColor: this.graph_colors[index]
																						}
																					}, {
																						name: 'Min - Max Range',
																						data: data_point.ranges,
																						type: "arearange",
																						lineWidth: 0,
																						linkedTo: ':previous',
																						color: this.graph_colors[index],
																						fillOpacity: 0.3,
																						zIndex: 0
																					}]
																					//data_new['data_penstock'],
																						
																				};
																				config.push(options);
																			});
																			if (config && config.length) {
																				let chart = config.map((point,index)=>{
																					// console.log('point', point);
																					return <ReactHighcharts config={point} ref="chart"></ReactHighcharts>;
																				});
																				return chart;
																			}/* else {
																				return <div className="graph-container-rain">
																					<div className="graph-rain">
																						<div className="no-data-text">No 24 Hour Data Found!</div>;
																					</div>
																				</div>;
																			}*/
																		} else {
																			return <div className="no-data-text">No Data Found!</div>
																		}
																	})()}
																		{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
																	</div>
																</Row>;
															}
														})()}
														<Row className="white">
															<div className="hed mar-20">Pumps</div>
															{(() => {
																// console.log('chart_config_pump', chart_config_pump);
																return chart_config_pump;
																/*if (chart_config_pump && chart_config_pump.length) {
																	chart_config_pump.map((chart_details,index) => {
																		return <Row className="pump-graph">
																			<Col className="pad-top-25 bold" span={3}>
																				name_pump[index]
																			</Col>
																			<Col className="success pad-top-25" span={1}>
																				ON
																			</Col>
																			<Col span={19}>
																				<ReactHighcharts config={chart_details} ref="chart"></ReactHighcharts>
																			</Col>
																		</Row>;
																	});
																}*/
															})()}
															{/*<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-1
																</Col>
																<Col className="success pad-top-25" span={1}>
																	ON
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-2
																</Col>
																<Col className="success pad-top-25" span={1}>
																	ON
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-3
																</Col>
																<Col className="danger pad-top-25" span={1}>
																	OFF
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-4
																</Col>
																<Col className="danger pad-top-25" span={1}>
																	OFF
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
																</Col>
															</Row>*/}
														</Row>
													</Col>
												</Row>
											</Col>
											{/*<Col className="white" span={7}>
												<Row>
													<div className="hed mar-20">Latest Events</div>
													<div className="center event-container">No latest events found.</div>
												</Row>
											</Col>*/}
										</Row>;
									} else if (this.err_msg == true) {
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Row className="white error-message">
												<div className="no-data-text">Station Not Configured!</div>
											</Row>
										</Row>;
									}
								} else if (this.props.stations_graph_data && this.props.stations_graph_data.length && !this.props.gridVisible && this.props.data_type == 'raw') {
									let data_new = this.setData('series', this.props.stations_graph_data[this.props.props_index]);
									let timestamp = this.setData('timestamp', this.props.stations_graph_data[this.props.props_index]);
									let yaxis_text = this.setData('yaxis_text', this.props.stations_graph_data[this.props.props_index]);

									let config = [],
										property = this.props.stations_graph_data[this.props.props_index];
									let chart_type = 'area';

									let type_configure = this.type_configure;
									let name_pump = [],
										status_pump = [];
									// console.log('type_configure', type_configure);
									if(data_new && Object.keys(data_new).length && data_new.data_new && Object.keys(data_new.data_new).length){
										// console.log('data sump', data_new);
										Object.keys(data_new.data_new).map((point_new, index)=>{
											name_pump.push(point_new);
											console.log('data_new.data_new', data_new['data_new'][point_new]);

											if (this.state.pump_current_status && Object.keys(this.state.pump_current_status).length) {
												Object.keys(this.state.pump_current_status).map((pump_status) => {
													if (pump_status == point_new) {
														status_pump.push(this.state.pump_current_status[pump_status]);
													}
												});
											}
											
											// console.log('status_pump', status_pump);
											let options = {
												chart:{
													backgroundColor: '#FFFFFF',
													type: chart_type,
													height: 150,
													zoomType: 'x',
												},
												title: {
													text: ''
												},
												xAxis: {
													type: 'datetime',
													// categories: timestamp,
													title: {
														text: '',
														align: 'middle'
													}
												},
												yAxis: {
													title: {
														text: ''
													},
													gridLineWidth: 0,
													minorGridLineWidth: 0,
													floor: 0,
													tickPositions: type_configure[index] == 'configured' ? [0, 1] : undefined,
													labels: {
														formatter: function () {
															let label = this.value;
															// console.log(this.value)
															// this.axis.defaultLabelFormatter.call(this);
															if (type_configure[index] == 'configured') {
																if (label == 0) {
																	return '<span style="fill: red;">' + 'OFF' + '</span>';
																} else if (label == 1) {
																	return '<span style="fill: green;">' + 'ON' + '</span>';
																} 
															} else if (type_configure[index] == 'unconfigured') {
																return label;
															}
															// Use thousands separator for four-digit numbers too
															/*if (/^[0-9]{4}$/.test(label)) {
																	return Highcharts.numberFormat(this.value, 0);
															}*/
															// return label;
														}
													}
												},
												tooltip: {
													/*formatter: function () {
														return 'Status : <b>' + (this.y == this.state.Major_Road_Junction ? 'ON' : 'OFF')  + '</b> on <b>' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH:mm, DD MMM') + '</b>';
													},
													borderRadius: 1,*/
													pointFormat: point_new + ': <span class="param-{point.val}"><b>{point.val}</b></span>',
													
													useHTML: true
												},
												legend: {
													enabled: false
												},
												credits: {
													enabled: false
												},
												exporting: {
													enabled: false
												},
												plotOptions: {
													area: {
														marker: {
															radius: 2
														},
														lineWidth: 1,
														states: {
															hover: {
																lineWidth: 1
															}
														},
														turboThreshold: 0
													}
												},
												series: [{
													type: 'area',
													color: this.graph_colors[index],
													data: data_new['data_new'][point_new],
													fillColor: this.graph_fill_color[index],
													lineColor: this.graph_colors[index],
													step: 'left'
												}]
											};
											// console.log('options', options);
											config.push(options);
										});
									}
									let chart_config_pump = [];
									if (config && config.length && this.err_msg == false) {

										chart_config_pump = config.map((point,index)=>{
											// console.log('point', point);
											return <Row className="box-shadow-style pump-graph">
												<Row>
													<Col className="pad-top-25 pad-left-25 bold" span={24}>
														{name_pump[index]}
													</Col>
												</Row>
												<Row className="margin-top-20">
													<Col span={24}>
														<ReactHighcharts config={point} ref="chart"></ReactHighcharts>
													</Col>
												</Row>
											</Row>;
										});
									} else {
										chart_config_pump = <div className="no-data-text">No Data Found!</div>;
									}
									if (this.props.stations_graph_data[this.props.props_index] && Object.values(this.props.stations_graph_data[this.props.props_index]).length && this.props.stations_graph_data[this.props.props_index].parameters && this.props.stations_graph_data[this.props.props_index].parameters.length) {
										// console.log('penstock_value', this.props.penstock_value);
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Col span={24}>
												<Row className="back-transparant">
													<Col className="back-transparant">
														{(() => {
															if (data_new['data_sump'][0]['data'] && data_new['data_sump'][0]['data'].length) {
																return <Row className="box-shadow-style white mar-bot-25">
																	<div className="hed mar-20">Sump</div>
																	<div className="sump-graph">
																	{(() => {
																		if (data_new['data_sump'][0]['data'] && data_new['data_sump'][0]['data'].length) {
																			// console.log('rain sump', data_new['data_sump'][0]['data']);
																			let config =[];
																			let total_data = 0;
																			let y_axis_config = {};
																			data_new['data_sump'][0]['data'].map((arr) => {
																				if (arr[1] && arr[1] != null && !isNaN(arr[1])) {
																					total_data = total_data + arr[1];
																				}
																			});
																			if (total_data > 0) {
																				y_axis_config = {
																					title: {
																						text: data_new['data_sump'][0]['unit']
																					}
																				};
																			} else {
																				y_axis_config = {
																					title: {
																						text: data_new['data_sump'][0]['unit']
																					},
																					min: 0,
																					max: 1,
																					showLastLabel: false
																				};
																			}
																			let options = {
																				chart: {
																					backgroundColor: '#FFFFFF',
																					type: 'area',
																					height: 200,
																					zoomType: 'x',
																				},
																				title: {
																					text: ''
																				},
																				xAxis: {
																					type: 'datetime',
																					// categories: timestamp,
																					title: {
																						text: '',
																						align: 'middle'
																					},
																					tickmarkPlacement: 'on'
																				},
																				yAxis: y_axis_config,
																				tooltip: {
																					formatter: function () {
																						return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_sump'][0]['name'] + ': <b>' + this.y + ' ' + data_new['data_sump'][0]['unit'] + '</b>';
																					},
																					useHTML: true
																					/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>'*/
																				},
																				legend: {
																					enabled: false
																				},
																				credits: {
																					enabled: false
																				},
																				exporting: {
																					enabled: false
																				},
																				plotOptions: {
																					area: {
																						marker: {
																							radius: 2
																						},
																						lineWidth: 1,
																						states: {
																							hover: {
																								lineWidth: 1
																							}
																						},
																						turboThreshold: 0
																					}
																				},
																				series: data_new['data_sump'],
																					
																			};
																			config.push(options);
																			if (config && config.length) {
																				let chart = config.map((point,index)=>{
																					// console.log('point', point);
																					return <ReactHighcharts config={point} ref="chart"></ReactHighcharts>;
																				});
																				return chart;
																			}/* else {
																				return <div className="graph-container-rain">
																					<div className="graph-rain">
																						<div className="no-data-text">No 24 Hour Data Found!</div>;
																					</div>
																				</div>;
																			}*/
																		} else {
																			return <div className="no-data-text">No Data Found!</div>
																		}
																	})()}
																		{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
																	</div>
																</Row>;
															}
														})()}
														{(() => {
															if (data_new['data_penstock'][0]['data'] && data_new['data_penstock'][0]['data'].length) {
																return <Row className="box-shadow-style white mar-bot-25">
																	<div className="hed mar-20">Penstock</div>
																	<div className="sump-graph">
																	{(() => {
																		if (data_new['data_penstock'][0]['data'] && data_new['data_penstock'][0]['data'].length) {
																			// console.log('penstock data_sum', data_new['data_penstock'][0]['data']);
																			let config =[];
																			let total_data = 0;
																			let y_axis_config = {};
																			data_new['data_penstock'][0]['data'].map((arr) => {
																				if (arr[1] && arr[1] != null && !isNaN(arr[1])) {
																					total_data = total_data + arr[1];
																				}
																			});
																			if (total_data > 0) {
																				y_axis_config = {
																					title: {
																						text: data_new['data_penstock'][0]['unit']
																					}
																				};
																			} else {
																				y_axis_config = {
																					title: {
																						text: data_new['data_penstock'][0]['unit']
																					},
																					min: 0,
																					max: 1,
																					showLastLabel: false
																				};
																			}
																			let options = {
																				chart: {
																					backgroundColor: '#FFFFFF',
																					type: 'area',
																					height: 200,
																					zoomType: 'x',
																				},
																				title: {
																					text: ''
																				},
																				xAxis: {
																					type: 'datetime',
																					// categories: timestamp,
																					title: {
																						text: '',
																						align: 'middle'
																					},
																					tickmarkPlacement: 'on'
																				},
																				yAxis: y_axis_config,
																				tooltip: {
																					formatter: function () {
																						return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_penstock'][0]['name'] + ': <b>' + this.y + ' ' + data_new['data_penstock'][0]['unit'] + '</b>';
																					},
																					useHTML: true
																					/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>'*/
																				},
																				legend: {
																					enabled: false
																				},
																				credits: {
																					enabled: false
																				},
																				exporting: {
																					enabled: false
																				},
																				plotOptions: {
																					area: {
																						marker: {
																							radius: 2
																						},
																						lineWidth: 1,
																						states: {
																							hover: {
																								lineWidth: 1
																							}
																						},
																						turboThreshold: 0
																					}
																				},
																				series: data_new['data_penstock'],
																					
																			};
																			config.push(options);
																			if (config && config.length) {
																				let chart = config.map((point,index)=>{
																					// console.log('point', point);
																					return <ReactHighcharts config={point} ref="chart"></ReactHighcharts>;
																				});
																				return chart;
																			}/* else {
																				return <div className="graph-container-rain">
																					<div className="graph-rain">
																						<div className="no-data-text">No 24 Hour Data Found!</div>;
																					</div>
																				</div>;
																			}*/
																		} else {
																			return <div className="no-data-text">No Data Found!</div>
																		}
																	})()}
																		{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
																	</div>
																</Row>;
															}
														})()}
														<Row className="white">
															<div className="hed mar-20">Pumps</div>
															{(() => {
																// console.log('chart_config_pump', chart_config_pump);
																return chart_config_pump;
																/*if (chart_config_pump && chart_config_pump.length) {
																	chart_config_pump.map((chart_details,index) => {
																		return <Row className="pump-graph">
																			<Col className="pad-top-25 bold" span={3}>
																				name_pump[index]
																			</Col>
																			<Col className="success pad-top-25" span={1}>
																				ON
																			</Col>
																			<Col span={19}>
																				<ReactHighcharts config={chart_details} ref="chart"></ReactHighcharts>
																			</Col>
																		</Row>;
																	});
																}*/
															})()}
															{/*<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-1
																</Col>
																<Col className="success pad-top-25" span={1}>
																	ON
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-2
																</Col>
																<Col className="success pad-top-25" span={1}>
																	ON
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-3
																</Col>
																<Col className="danger pad-top-25" span={1}>
																	OFF
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row className="pump-graph">
																<Col className="pad-top-25 bold" span={3}>
																	Pump-4
																</Col>
																<Col className="danger pad-top-25" span={1}>
																	OFF
																</Col>
																<Col span={19}>
																	<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
																</Col>
															</Row>*/}
														</Row>
													</Col>
												</Row>
											</Col>
											{/*<Col className="white" span={7}>
												<Row>
													<div className="hed mar-20">Latest Events</div>
													<div className="center event-container">No latest events found.</div>
												</Row>
											</Col>*/}
										</Row>;
									} else if (this.err_msg == true) {
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Row className="white error-message">
												<div className="no-data-text">Station Not Configured!</div>
											</Row>
										</Row>;
									}
								}
							})()}
							{(() => {
								if (this.props.stations_grid_data && this.props.stations_grid_data.length && this.props.gridVisible && this.props.data_type == 'avg') {
									if (this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data.length) {
										let is_sump = 0,
											sump_name = '';
										let penstock_name = '',
											is_penstock = 0;
										let body_table = this.props.stations_grid_data[this.props.props_index].table_data.map((tbl_data) => {
											let count_pump_data = 0;
											let count_pump_activities = 0;
											if (tbl_data && Object.keys(tbl_data).length) {
												if (tbl_data.parameters && tbl_data.parameters.length) {
													let count = 0;
													tbl_data.parameters.map((st,index) => {
														if (/*st.data && Object.keys(st.data).length && */st.type == this.state.pump_type) {
															count++;
														}
													});
													count_pump_data = count;
													tbl_data.parameters.map((st,index) => {
														if (st.activities && st.activities.length && st.type == this.state.pump_type) {
																let count2 = st.activities.length;
																count_pump_activities = st.activities.length;
														}
													});
												}
												// let table_data_view = Object(tbl_data).map((view_tbl_body) => {
												// console.log('count_pump_data', count_pump_data);
												// console.log('count_pump_data', tbl_data);
												if (tbl_data.parameters && tbl_data.parameters.length) {
													return <tr>
														<td>{moment.unix(tbl_data.time[0]).tz("Asia/Kolkata").format('HH:mm, DD MMM') + ' - ' + moment.unix(tbl_data.time[1] + 1).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</td>
														{(() => {
															if (tbl_data.parameters && tbl_data.parameters.length) {
																return tbl_data.parameters.map((st,index) => {
																	if (/*st.data && Object.keys(st.data).length && */st.type == this.state.pump_type) {
																		return temp_pump_child.map((child_key) => {
																			if (child_key == 'rh') {
																				return <td key={index}>{this.timeFormat(st.rh)}</td>
																			} else if (child_key == 'activities') {
																				return <td>
																					<ul className="padding-left-5 width-170">
																						{(() => {
																							if (st.activities && st.activities.length && st.type == this.state.pump_type) {
																										return st.activities.map((alert) => {
																											return <li>
																												<div className="list-alignment"><span className={'list ' + ((alert.status == 1) ? 'dev-on ' : 'dev-off ')}>
																												{(alert.status == 1 || alert.status == 0) ? (((alert.status == 1) ? 'Started at ' : 'Stopped at ') + moment.unix(alert.time).tz("Asia/Kolkata").format('HH:mm')) : ''}
																											</span></div></li>;
																										});
																							} else if (st.type == this.state.pump_type) {
																								return <li>
																									<div>
																										<span>-</span>
																									</div>
																								</li>;
																							}
																						})()}
																					</ul>
																				</td>
																			}
																		});
																		/*return Object.values(st.data).map((body_data, index) => {
																			return <td key={index}>{body_data}</td>;
																		});*/
																	} else if (st.type == this.state.sump_type_graph || st.type == this.state.penstock_type_graph) {
																		if (st.data) {
																			return temp_sump_child.map((body_data, index) => {
																				return <td key={index}>{(st.data && Object.keys(st.data).length ? (!isNaN(st.data[body_data]) ? parseFloat(st.data[body_data]).toFixed(2) : '-') : '-')}</td>;
																			});
																		}
																	}
																});
															}
														})()}
													</tr>;
													// });
													// return table_data_view;
												}
											}
										}).filter(Boolean);
										
										return <div>
											<div className="report-table-container archive-table-container border-left-style">
												<div className="table-wrapper">
													<table className="table table-bordered">
														<thead className="thead">
															<tr>
																<th className="text-center  time-average">Time</th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" colSpan={group.type == this.state.pump_type ? 2 : 3}>{group.name + (group.type != this.state.pump_type ? ' (' : '')}  <span dangerouslySetInnerHTML={{__html: group.unit}}></span>{(group.type != this.state.pump_type ? ')' : '')}</th>;
																		});
																		return th_group_name;
																	}
																})()}
																{/*<th className="text-center">Pump</th>
																<th className="text-center">Run Hour</th>
																<th className="text-center">Activity</th>*/}
																{/*(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" colSpan={Object.values(group.data).length}>{group.name}  (<span dangerouslySetInnerHTML={{__html: group.unit}}></span>)</th>;
																		});
																		return th_group_name;
																	}
																})()*/}
															</tr>
															<tr>
																<th></th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			if (group.type == this.state.pump_type) {
																				return temp_pump_child.map((child_heading) => {
																					return <th className="text-center" >{(child_heading != 'rh' ? child_heading.charAt(0).toUpperCase() + child_heading.substring(1) : 'RH').toString()}</th>;
																				});
																			} else if (group.type == this.state.penstock_type_graph || group.type == this.state.sump_type_graph) {
																				return temp_sump_child.map((child_heading) => {
																					return <th className="text-center" >{(child_heading.charAt(0).toUpperCase() + child_heading.substring(1)).toString()}</th>;
																				});
																			}
																		});
																		return th_group_name;
																	}
																})()}
															</tr>
														</thead>
														<tbody>
															{(() => {
																return body_table;
															})()}
														</tbody>
													</table>
												</div>
											</div>
										</div>;
										
									}
								} else if (this.props.stations_grid_data && this.props.stations_grid_data.length && this.props.gridVisible && this.props.data_type == 'raw') {
									if (this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data.length) {
										let is_sump = 0,
											sump_name = '';
										let sump_unit = '';
										let penstock_name,
											penstock_unit,
											is_penstock = 0;
										let body_table = this.props.stations_grid_data[this.props.props_index].table_data.map((tbl_data) => {
											if (tbl_data && Object.keys(tbl_data).length) {
												
												// let table_data_view = Object(tbl_data).map((view_tbl_body) => {
													return <tr>
														<td>{moment.unix(tbl_data.time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</td>
														{(() => {
															if (tbl_data.parameters && tbl_data.parameters.length) {
																return tbl_data.parameters.map((st,index) => {
																	if (/*st.data && Object.keys(st.data).length && */st.type == this.state.pump_type || st.type == this.state.sump_type_graph || st.type == this.state.penstock_type_graph) {
																		return <td key={index}>{st.value ? (!isNaN(st.value) && (st.value !== null) ? parseFloat(st.value).toFixed(2) : (st.value == 'NA' ? '-' : st.value)) : '-'}</td>
																		/*return Object.values(st.data).map((body_data, index) => {
																			return <td key={index}>{body_data}</td>;
																		});*/
																	}
																});
															}
														})()}	
													</tr>;
												// });
												// return table_data_view;
											}
										}).filter(Boolean);
										return <div>
											{/*(() => {
												if ((is_sump > 0) || (is_penstock > 0)) {
													return <div>
														<div className="hed center">{'Table for ' + (is_sump > 0 ? 'and ' + sump_name : '') + (is_penstock > 0 ? ' and ' + penstock_name : '')}</div>
														<div className="report-table-container archive-table-container">
															<div className="table-wrapper">
																<table className="table table-bordered">
																	<thead className="thead">
																		<tr>
																			<th className="text-center">Time</th>
																			{(() => {
																				if (is_sump > 0) {
																					return <th className="text-center">{sump_name + '(' + sump_unit + ')'}</th>;
																				}
																			})()}
																			
																			{(() => {
																				if (is_penstock > 0) {
																					return <th className="text-center">{penstock_name + '(' + penstock_unit + ')'}</th>;
																				}
																			})()}
																		</tr>
																	</thead>
																	<tbody>
																		{(() => {
																			return sump_table;
																		})()}
																	</tbody>
																</table>
															</div>
														</div>
													</div>;
												}
											})()*/}
											
											{/*<div className="hed center pad-top-25">{'Table for ' + 'Pump Status'}</div>*/}
											<div className="report-table-container archive-table-container border-left-style">
												<div className="table-wrapper">
													<table className="table table-bordered">
														<thead className="thead">
															<tr>
																<th className="text-center">Time</th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		return this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((st, index) => {
																			// if (tbl_data.parameters && tbl_data.parameters.length) {
																				// return tbl_data.parameters.map((st,index) => {
																					if (/*st.data && Object.keys(st.data).length && */st.type == this.state.pump_type || st.type == this.state.sump_type_graph || st.type == this.state.penstock_type_graph) {
																						return <th key={index}>{st.name}</th>
																						/*return Object.values(st.data).map((body_data, index) => {
																							return <td key={index}>{body_data}</td>;
																						});*/
																					}
																				// });
																			// }
																		});
																	}
																})()}
																{/*<th className="text-center">Status</th>*/}
																{/*(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" colSpan={Object.values(group.data).length}>{group.name}  (<span dangerouslySetInnerHTML={{__html: group.unit}}></span>)</th>;
																		});
																		return th_group_name;
																	}
																})()*/}
															</tr>
															<tr>
																<th className="text-center">HH:mm, DD MMM</th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		return this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((st, index) => {
																			// if (tbl_data.parameters && tbl_data.parameters.length) {
																				// return tbl_data.parameters.map((st,index) => {
																					if (/*st.data && Object.keys(st.data).length && */st.type == this.state.pump_type) {
																						return <th key={index}>Status</th>
																						/*return Object.values(st.data).map((body_data, index) => {
																							return <td key={index}>{body_data}</td>;
																						});*/
																					} else if (/*st.data && Object.keys(st.data).length && */st.type == this.state.sump_type_graph || st.type == this.state.penstock_type_graph) {
																						return <th key={index}>{st.unit}</th>
																						/*return Object.values(st.data).map((body_data, index) => {
																							return <td key={index}>{body_data}</td>;
																						});*/
																					}
																				// });
																			// }
																		});
																	}
																})()}
															</tr>
														</thead>
														<tbody>
															{(() => {
																return body_table;
															})()}
														</tbody>
													</table>
												</div>
											</div>
										</div>;
										
									}
								}
							})()}
						</div>;
					}else {
						return <div className="contain">
							{/*<div className="heading">{(this.props.stations_grid_data && this.props.stations_grid_data.length ? this.props.station_name_list[this.props.stations_grid_data[this.props.props_index].id] : '')}</div>*/}
								<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available between {moment.unix(this.props.from_time_report).tz("Asia/Kolkata").format('HH:mm, DD MMM') + ' and ' + moment.unix(this.props.upto_time_report  + 1).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
									</Row>
								</Row>
						</div>;
					}
				// });
				// }
			})()}
		</div>
	}
}