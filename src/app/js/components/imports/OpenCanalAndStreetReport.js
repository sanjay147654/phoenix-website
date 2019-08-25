import React from 'react';
import moment from 'moment-timezone';
import DateTime from 'react-datetime';
import _ from 'lodash';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input, Tooltip, Menu, DatePicker, notification, Alert } from 'antd';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import { Scrollbars } from 'react-custom-scrollbars';

let temp_arr_child = ['avg', 'min', 'max'];
/**
 * Component for Open Canal and street under Flood category report.
 */
export default class OpenCanalAndStreetReport extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		console.log('OpenCanal 1 constructor', this.props.common_iterator);
		/**
		 * This is the state of the component.
		 * @type {Object}
		 */
		this.state = {
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
			data_new = {},
			data_new_arr = [],
			timestamp = [],
			series = [],
			yaxis_text_array = [],
			sump_graph_name = '',
			sump_graph_unit = '',
			yaxis_text;
		this.unit_array = [];
		if (details && Object.values(details).length && details.parameters && details.parameters.length) {
			details.parameters.map((data) => {
				if (data.data && data.data.length) {
					data.data.map((runhour, index) => {
						data_new_arr.push([runhour.time*1000, (isNaN(runhour.value) ? null : parseFloat(parseFloat(runhour.value).toFixed(2)))]);
					});
				}
			});
		}
		yaxis_text = '';
		if (key == 'series') {
			series = data_new_arr;
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
			data_sump = [],
			data_new = {},
			data_new_arr = [],
			timestamp = [],
			series = [],
			yaxis_text_array = [],
			sump_graph_name = '',
			sump_graph_unit = '',
			yaxis_text;
		this.unit_array = [];
		console.log('details', details);
		if (details && Object.values(details).length && details.parameters && details.parameters.length) {
			details.parameters.map((data) => {
				if (data.data && data.data.length) {
					data.data.map((runhour, index) => {
						if (data_new[data.name]) {
							if (!data_new[data.name].averages) {
								data_new[data.name].averages = [];
								data_new[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
							} else {
								data_new[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
							}
							if (!data_new[data.name].ranges) {
								data_new[data.name].ranges = [];
								data_new[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
							} else {
								data_new[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
							}
							/*data_new[data.name].push(
								[runhour.time*1000, parseFloat(runhour)]
							);*/
						} else {
							data_new[data.name] = {};
							if (!data_new[data.name].averages) {
								data_new[data.name].averages = [];
								data_new[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
							} else {
								data_new[data.name].averages.push([runhour.time*1000, (isNaN(runhour.avg) || (runhour.avg === null) ? null : parseFloat(parseFloat(runhour.avg).toFixed(2)))]);
							}
							if (!data_new[data.name].ranges) {
								data_new[data.name].ranges = [];
								data_new[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
							} else {
								data_new[data.name].ranges.push([runhour.time*1000, (isNaN(runhour.min) || (runhour.min === null) ? null : parseFloat(parseFloat(runhour.min).toFixed(2))), (isNaN(runhour.max) || (runhour.max === null) ? null : parseFloat(parseFloat(runhour.max).toFixed(2)))]);
							}
						}
						// data_new_arr.push([runhour.time*1000, parseFloat(runhour.value)]);
					});
					this.unit_array.push(data.unit);
				}
			});
		}
		yaxis_text = '';
		if (key == 'series') {
			series = data_new;
			console.log('data_new', series);
			return series;
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
									let data_new = this.setDataAvg('series', this.props.stations_graph_data[this.props.props_index]);
									let timestamp = this.setDataAvg('timestamp', this.props.stations_graph_data[this.props.props_index]);
									let yaxis_text = this.setDataAvg('yaxis_text', this.props.stations_graph_data[this.props.props_index]);
									console.log('data_new this.props.stations_graph_data', this.props.stations_graph_data);
									console.log('data_new this.props.stations_graph_data', this.props.props_index);
									let config = [],
										property = this.props.stations_graph_data[this.props.props_index];
									let chart_type = 'area';
									// console.log('data_new', data_new);
									if(data_new && Object.keys(data_new).length){
										Object.keys(data_new).map((point, index)=>{
											console.log('series point', data_new[point].averages);
											let options = {
												chart:{
													backgroundColor: '#FFFFFF',
													// type: 'area',
													height: 220,
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
														text: (this.unit_array && this.unit_array[index] ? this.unit_array[index] : '')
														/*(point == 'Humidity' ? ' %' : (point == 'PM<sub>2.5</sub>' ? ' ppm' : (point == 'PM<sub>10</sub>' ? ' ppm' : ' °C')))*/
													}
												},
												tooltip: {
													crosshairs: true,
													shared: true,
													valueSuffix: (this.unit_array && this.unit_array[index] ? ' ' + this.unit_array[index] : '')
													/*formatter: function () {
														return '<b>' + Math.trunc(this.y) + ' ' + (point == 'Humidity' ? ' %' : (point == 'PM<sub>2.5</sub>' ? ' ppm' : (point == 'PM<sub>10</sub>' ? ' ppm' : ' °C')))  + '</b> on <b>' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH:mm, DD MMM') + '</b>';
													},
													borderRadius: 1,*/
													/*pointFormat: point + ': <b>{point.y}' + (this.unit_array && this.unit_array[index] ? (' ' + this.unit_array[index]) : '') + '</b>',*/
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
												/*plotOptions: {
													column: {
														borderWidth: 0,
														groupPadding: 0,
														pointPadding: 0.2,
														maxPointWidth: 40,
														minPointLength: 1
													},
													area: {
														marker: {
															radius: 0
														},
														lineWidth: 1,
														states: {
															hover: {
																lineWidth: 1
															}
														},
														threshold: null
													}
												},*/
												series: [{
													name: 'Average',
													data: data_new[point].averages,
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
													data: data_new[point].ranges,
													type: "arearange",
													lineWidth: 0,
													linkedTo: ':previous',
													color: this.graph_colors[index],
													fillOpacity: 0.3,
													zIndex: 0
												}]
												/*[{
													color: this.graph_colors[index],
													data: data_new[point],
													showInLegend: false,
													fillColor: this.graph_fill_color[index],
													lineColor: this.graph_colors[index]
												}]*/
											};
											config.push(options);
										});
									}

									if (config && config.length) {
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											{(() => {
												let chart_config = config.map((point,index)=>{
													// console.log('point', point);
													return <Col span={24}>
														<Row className="back-transparant">
															<Col className="back-transparant">
																<Row className={'box-shadow-style white' + (index > 0 ? ' mar-top-35' : '')}>
																	<Row className="pump-graph no-border" type="flex" justify="space-between">
																		<Col span={24}>
																			<div className="center bold" dangerouslySetInnerHTML={{__html:this.props.stations_graph_data[this.props.props_index].parameters[index].name}}>
																				{/*<sub>2.5</sub>*/}
																			</div>
																			<ReactHighcharts config={point} ref="chart"></ReactHighcharts>
																		</Col>
																		{/*<Col span={5}>
																			<Row type="flex" justify="center" className="border-bot center">
																				<Col span={12}>
																					<div>
																						<span className="graph-avg-value">{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value != null ? this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value : 'NA'}</span>{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value != null && this.props.stations_graph_data[this.props.props_index].parameters[index].avg_value != 'NA' ? (' ' + this.props.stations_graph_data[this.props.props_index].parameters[index].unit): ''}
																					</div>
																					<div className="value-name">Average</div>
																				</Col>
																			</Row>
																			<Row type="flex" justify="center" className="border-bot center">
																				<Col span={12}>
																					<div>
																						<span className="graph-avg-value">{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].min_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].min_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].min_value != null ? this.props.stations_graph_data[this.props.props_index].parameters[index].min_value : 'NA'}</span>{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].min_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].min_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].min_value != null && this.props.stations_graph_data[this.props.props_index].parameters[index].min_value != 'NA' ? (' ' + this.props.stations_graph_data[this.props.props_index].parameters[index].unit): ''}
																					</div>
																					<div>{moment.unix(this.props.stations_graph_data[this.props.props_index].parameters[index].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																					<div className="value-name">Minimum</div>
																				</Col>
																			</Row>
																			<Row type="flex" justify="center" className="border-bot center">
																				<Col span={12}>
																					<div>
																						<span className="graph-avg-value">{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].max_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].max_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].max_value != null ? this.props.stations_graph_data[this.props.props_index].parameters[index].max_value : 'NA'}</span>{(!isNaN(this.props.stations_graph_data[this.props.props_index].parameters[index].max_value) && this.props.stations_graph_data[this.props.props_index].parameters[index].max_value >= 0) && this.props.stations_graph_data[this.props.props_index].parameters[index].max_value != null && this.props.stations_graph_data[this.props.props_index].parameters[index].max_value != 'NA' ? (' ' + this.props.stations_graph_data[this.props.props_index].parameters[index].unit): ''}
																					</div>
																					<div>{moment.unix(this.props.stations_graph_data[this.props.props_index].parameters[index].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																					<div className="value-name">Maximum</div>
																				</Col>
																			</Row>
																		</Col>*/}
																	</Row>
																</Row>
															</Col>
														</Row>
													</Col>;
												});
												return chart_config;
											})()}
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

									if (data_new && data_new.length) {
										let total_data = 0;
										let y_axis_config = {};
										data_new.map((arr) => {
											if (arr[1] && arr[1] != null && !isNaN(arr[1])) {
												total_data = total_data + arr[1];
											}
										});
										if (total_data > 0) {
											y_axis_config = {
												title: {
													text: this.props.stations_graph_data[this.props.props_index].parameters[0].unit
												}
											};
										} else {
											y_axis_config = {
												title: {
													text: this.props.stations_graph_data[this.props.props_index].parameters[0].unit
												},
												min: 0,
												max: 1,
												showLastLabel: false
											};
										}
										let options = {
											chart:{
												backgroundColor: '#FFFFFF',
												type: chart_type,
												height: 220,
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
											yAxis: y_axis_config,
											tooltip: {
												/*formatter: function () {
													return '<b>' + property.parameters[0].name + '</b>: <b>' + this.y + ' ' + property.parameters[0].unit + '</b> on <b>' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH:mm, DD MMM') + '</b>';
												},*/
												pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>',
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
												color: this.graph_colors[0],
												data: data_new,
												showInLegend: false,
												fillColor: this.graph_fill_color[0],
												lineColor: this.graph_colors[0]
											}]
										};
										return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Col span={24}>
												<Row className="back-transparant">
													<Col className="back-transparant">
														<Row className="box-shadow-style white">
															<Row className="pump-graph no-border" type="flex" justify="space-between">
																<Col span={24}>
																	<div className="center bold" dangerouslySetInnerHTML={{__html:this.props.stations_graph_data[this.props.props_index].parameters[0].name}}>
																		{/*<sub>2.5</sub>*/}
																	</div>
																	<ReactHighcharts config={options} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
														</Row>
													</Col>
												</Row>
											</Col>{/*<Col className="white" span={7}>
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
										
										return <div>
											<div className="hed center">{''}</div>
											<div className="report-table-container archive-table-container">
												<div className="table-wrapper">
													<table className="table table-bordered">
														<thead className="thead">
															<tr>
																<th className="text-center">Time</th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" colSpan={3/*(group.data && Object.values(group.data).length ? Object.values(group.data).length : 1)*/}>{group.name} (<span dangerouslySetInnerHTML={{__html: group.unit}}></span>)</th>;
																		});
																		return th_group_name;
																	}
																})()}
																{/*(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" >{group.name}  (<span dangerouslySetInnerHTML={{__html: group.unit}}></span>)</th>;
																		});
																		return th_group_name;
																	}
																})()*/}
															</tr>
															<tr>
																<th className="text-center"></th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			if (group.data) {
																				return temp_arr_child.map((child_heading) => {
																					return <th className="text-center" >{(child_heading.charAt(0).toUpperCase() + child_heading.substring(1)).toString()}</th>;
																				});
																			}


																			/*if (group.data && Object.keys(group.data).length) {
																				return Object.keys(group.data).map((child_heading) => {
																				
																				return <th className="text-center" >{(child_heading.charAt(0).toUpperCase() + child_heading.substring(1)).toString()}</th>;
																				});
																			}*/
																		});
																		return th_group_name;
																	}
																})()}
															</tr>
														</thead>
														<tbody>
															{(() => {
																return this.props.stations_grid_data[this.props.props_index].table_data.map((tbl_data) => {
																	if (tbl_data && Object.keys(tbl_data).length) {
																		console.log('Major 2', 'child_heading');
																		// let table_data_view = Object(tbl_data).map((view_tbl_body) => {
																			return <tr>
																				<td>{moment.unix(tbl_data.time[0]).tz("Asia/Kolkata").format('HH:mm, DD MMM') + ' - ' + moment.unix(tbl_data.time[1] + 1).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</td>
																				{/*(() => {
																					if (tbl_data.parameters && tbl_data.parameters.length) {
																						return tbl_data.parameters.map((st, index) => {
																							return <td key={index}>{st.value}</td>;
																						});
																					}
																				})()*/}
																				{(() => {
																					if (tbl_data.parameters && tbl_data.parameters.length) {
																						return tbl_data.parameters.map((st) => {
																							if (st.data) {
																								return temp_arr_child.map((body_data, index) => {
																									return <td key={index}>{(st.data && Object.keys(st.data).length ? (isNaN(st.data[body_data]) || (st.data[body_data] === null) ? '-' : parseFloat(st.data[body_data]).toFixed(2)) : '-')}</td>;
																								});
																							}
																							/*if (st.data && Object.keys(st.data).length) {
																								return Object.values(st.data).map((body_data, index) => {
																									return <td key={index}>{body_data}</td>;
																								});
																							}*/
																						});
																					}
																				})()}
																			</tr>;
																		// });
																		// return table_data_view;
																	}
																}).filter(Boolean);
															})()}
														</tbody>
													</table>
												</div>
											</div>
										</div>;
										
									}
								} else if (this.props.stations_grid_data && this.props.stations_grid_data.length && this.props.gridVisible && this.props.data_type == 'raw') {
									if (this.props.stations_grid_data[this.props.props_index].table_data && this.props.stations_grid_data[this.props.props_index].table_data.length) {
										
										return <div>
											<div className="hed center">{''}</div>
											<div className="report-table-container archive-table-container">
												<div className="table-wrapper">
													<table className="table table-bordered">
														<thead className="thead">
															<tr>
																<th className="text-center">Time</th>
																{(() => {
																	if (this.props.stations_grid_data[this.props.props_index].table_data[0] && Object.keys(this.props.stations_grid_data[this.props.props_index].table_data[0]).length && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters && this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.length) {
																		let th_group_name = this.props.stations_grid_data[this.props.props_index].table_data[0].parameters.map((group, index_group) => {
																			return <th className="text-center" >{group.name} (<span dangerouslySetInnerHTML={{__html: group.unit}}></span>)</th>;
																		});
																		return th_group_name;
																	}
																})()}
															</tr>
														</thead>
														<tbody>
															{(() => {
																return this.props.stations_grid_data[this.props.props_index].table_data.map((tbl_data) => {
																	if (tbl_data && Object.keys(tbl_data).length) {
																		// let table_data_view = Object(tbl_data).map((view_tbl_body) => {
																			return <tr>
																				<td>{moment.unix(tbl_data.time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</td>
																				{(() => {
																					if (tbl_data.parameters && tbl_data.parameters.length) {
																						return tbl_data.parameters.map((st, index) => {
																							return <td key={index}>{st.value ? (isNaN(st.value) || (st.value === null) ? '-' : parseFloat(st.value).toFixed(2)) : '-'}</td>;
																						});
																					}
																				})()}
																			</tr>;
																		// });
																		// return table_data_view;
																	}
																}).filter(Boolean);
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