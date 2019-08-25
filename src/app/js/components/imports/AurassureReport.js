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
 * Component for Air Quality report.
 */
export default class AurassureReport extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		console.log('Aurassure 1 constructor');
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
		 * flag to show error message.
		 * @type {Boolean}
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
	}

		convert_avg_value(param, value, conversion_type) {
		let convert_type = false;
		if (conversion_type == 'naqi') {
			convert_type = true;
		} else {
			convert_type = false;
		}
		// Conversion factors for parameters
		let conv_factors = {
			'so2': 2.6202863,
			'no2': 1.88161554,
			'co': 1.14560327,
			'o3': 1.96319018
		};

		if (convert_type) {
			switch (param) {
				case 'so2':
					return (parseFloat(value) * conv_factors['so2']);
					break;
				case 'no2':
					return (parseFloat(value) * conv_factors['no2']);
					break;
				case 'co':
					return (parseFloat(value) * conv_factors['co']);
					break;
				case 'o3':
					return (parseFloat(value) * conv_factors['o3']);
					break;
				default:
					return parseFloat(value);
					break;

			}
		} else {
			return parseFloat(value);
		}
	}

	/**
	 * Predefined function used to compare between current and next props.
	 * @param  {Object} nextProps 
	 * @return {Boolean}           
	 */
	shouldComponentUpdate(nextProps) {
		if ((nextProps.archive_data && Object.keys(nextProps.archive_data).length && this.props.archive_data && Object.keys(this.props.archive_data).length && this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length &&  !_.isEqual(nextProps.archive_data.station_data,this.props.archive_data.station_data)) || this.props.gridVisible != nextProps.gridVisible) {
			return true;
		} else {
			return false;
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
			<div className="contain">
			{(() => {
				if(this.props.archive_data !== undefined) {
					if(this.props.archive_data === null) {
						return(
							<center>
								<svg className="loading-spinner" width="30px" height="30px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="path" fill="none" strokeWidth={6} strokeLinecap="round" cx={33} cy={33} r={30} /></svg>
							</center>
						);
					} else if(this.props.archive_data.param_values && this.props.archive_data.param_values.length === 0) {
						return(
							<center>No data available within the selected period.</center>
						);
					} else {
						let custom_report = [];
						if (this.props.gridVisible && this.props.data_type == 'avg') {
							console.log('render aura', this.props.station_parameters);
							if (this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length) {
								if (this.props.archive_data.station_summary && Object.keys(this.props.archive_data.station_summary) && Object.keys(this.props.archive_data.station_summary).length) {
									console.log('AurassureReport render', this.props.archive_data.station_summary);
									let data_summary = <div className="container text-center"> 
										<div className='bold'>{'Summary Report'}</div>
										<div className="table-wrapper top-margin">
											<div className="report-table-container">
												{(() => {
													if (this.props.station_parameters && Object.keys(this.props.station_parameters).length) {
														return <table className="table table-bordered">
																<thead className="thead">
																	<tr>
																		{/*<th className="text-center"> Station </th>*/}
																		<th className="text-center"> Parameter </th>
																		<th className="text-center"> Avg </th>
																		<th className="text-center"> Min </th>
																		<th className="text-center"> Min at. </th>
																		<th className="text-center"> Max </th>
																		<th className="text-center"> Max at. </th>		
																	</tr>
																</thead>
																<tbody>
																	{(() => {
																		// let table_row = Object.keys(this.props.archive_data.station_summary).map((this.props.param_station_id) => {
																			if (this.props.archive_data.station_summary[this.props.param_station_id] && Object.keys(this.props.archive_data.station_summary[this.props.param_station_id]).length) {
																				let checked_parameters = JSON.parse(JSON.stringify(this.props.checked_parameters)), row_span_counter = 0;
																				if (checked_parameters && checked_parameters.includes('hourly_aqi')) {
																					checked_parameters.splice(checked_parameters.indexOf('hourly_aqi'), 1);
																				}
																				if (checked_parameters && checked_parameters.includes('wind_rose')) {
																					checked_parameters.splice(checked_parameters.indexOf('wind_rose'), 1);
																				}
																				if (checked_parameters && checked_parameters.includes('pollution_rose')) {
																					checked_parameters.splice(checked_parameters.indexOf('pollution_rose'), 1);
																				}
																				Object.keys(this.props.archive_data.station_summary[this.props.param_station_id]).map((par_nm) => {
																					if (checked_parameters.includes(par_nm)) {
																						row_span_counter++;
																					}
																				});
																				let round = '';
																				let temp_id = '';
																				let row_span = checked_parameters.map((param) => {
																					round = (param == 'co') ? 4 : 2;
																					if(this.props.archive_data.station_summary[this.props.param_station_id] && this.props.archive_data.station_summary[this.props.param_station_id][param] && this.props.archive_data.station_summary[this.props.param_station_id][param] != null && Object.keys(this.props.archive_data.station_summary[this.props.param_station_id][param]).length > 0){
																						return <tr>
																							{/*(() => {
																								if (this.props.param_station_id != temp_id) {
																									temp_id = this.props.param_station_id;
																									return <td className="align-middle" rowSpan={row_span_counter}>{this.props.all_stations_aura[_.findIndex(this.props.all_stations_aura, ['id', this.props.param_station_id])].name}</td>;
																								}
																							})()*/}
																							<td><span dangerouslySetInnerHTML={{__html:this.props.station_parameters[_.findIndex(this.props.station_parameters, ['key', param])].name}} /> (<span dangerouslySetInnerHTML={{__html:this.props.station_parameters[_.findIndex(this.props.station_parameters, ['key', param])].unit.replace('u03bcg', 'μg')}} />)</td>
																							<td> {(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].avg) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].avg != null && this.props.archive_data.station_summary[this.props.param_station_id][param].avg >= 0)? (this.convert_avg_value(param, this.props.archive_data.station_summary[this.props.param_station_id][param].avg, this.props.conversion_type).toFixed(round)):'NA'} </td>
																							<td> {(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].min) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].min != null && this.props.archive_data.station_summary[this.props.param_station_id][param].min >= 0 && this.props.archive_data.station_summary[this.props.param_station_id][param].min != 999999999)? (this.convert_avg_value(param, this.props.archive_data.station_summary[this.props.param_station_id][param].min, this.props.conversion_type).toFixed(round)) :'NA'} <br/> 
																							</td>
																							{(() => {
																								if (param == 'rain') {
																									if (Array.isArray(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time)) {
																										return <td>
																											{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time.length) ? moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time[0])).tz('Asia/Kolkata').format('HH:mm') + ' - ' + moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time[1])).tz('Asia/Kolkata').format('HH:mm DD MMM YYYY') : 'NA'}
																										</td>;
																									} else {
																										return <td>
																											{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time > 0)?moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time)).tz('Asia/Kolkata').format('HH:mm:ss, DD MMM YYYY'):'NA'}
																										</td>;
																									}
																								} else {
																									return <td>
																										{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].min_time > 0)?moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].min_time)).tz('Asia/Kolkata').format('HH:mm:ss, DD MMM YYYY'):'NA'}
																									</td>;
																								}
																							})()}
																							<td> {(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].max) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].max != null && this.props.archive_data.station_summary[this.props.param_station_id][param].max >= 0)?  (this.convert_avg_value(param, this.props.archive_data.station_summary[this.props.param_station_id][param].max, this.props.conversion_type).toFixed(round)) :'NA'} <br/> 
																							</td>
																							{(() => {
																								if (param == 'rain') {
																									if (Array.isArray(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time)) {
																										return <td>
																											{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time.length) ? moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time[0])).tz('Asia/Kolkata').format('HH:mm') + ' - ' + moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time[1])).tz('Asia/Kolkata').format('HH:mm DD MMM YYYY'):'NA'}
																										</td>;
																									} else {
																										return <td>
																											{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time > 0)?moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time)).tz('Asia/Kolkata').format('HH:mm:ss, DD MMM YYYY'):'NA'}
																										</td>;
																									}
																								} else {
																									return <td>
																										{(typeof(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time) != 'undefined' && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time != null && this.props.archive_data.station_summary[this.props.param_station_id][param].max_time > 0)?moment.unix(parseInt(this.props.archive_data.station_summary[this.props.param_station_id][param].max_time)).tz('Asia/Kolkata').format('HH:mm:ss, DD MMM YYYY'):'NA'}
																									</td>;
																								}
																							})()}
																						</tr>;
																					}
																				}).filter(Boolean);
																				return row_span;
																			} else {
																				return <tr>
																					<td colSpan="7">{'No Data to show for ' + this.props.all_stations_aura[_.findIndex(this.props.all_stations_aura, ['id', this.props.param_station_id])].name}</td>
																				</tr>;
																			}
																		// }).filter(Boolean);
																		// console.log(table_row);
																		// return table_row; 
																	})()}
																</tbody>
															</table>;
													} else {
														return <div className="error-msg-no-data">No Summary Data available for the time period.</div>;
													}
												})()}
											</div>
										</div>
									</div>;
									custom_report.push(<div>{data_summary}</div>);
								} else {
									custom_report.push(<div className="error-msg-no-data">{'No Summary data available at this time duration'}</div>);
								}
							}
						}

						if(!this.props.gridVisible && this.props.data_type == 'raw') {
							if (this.props.archive_data.param_values && Object.keys(this.props.archive_data.param_values).length) {
								let parameter_graphs = this.props.station_parameters.map((parameter, i) => {
									let line_chart_rain = [], counter= 0, temp_line_chart_data_rain= [], line_chart_data= [], archive_data_graph_config_rain = {}, graph_data= [];
									if (this.props.archive_data.time_stamps && this.props.archive_data.time_stamps.length) {
										line_chart_data = this.props.archive_data.time_stamps.map((time_stamp, data_point_index) => {
											if(this.props.archive_data.param_values[parameter.key][data_point_index]) {
												return([
													time_stamp * 1000,
													parseFloat(this.props.archive_data.param_values[parameter.key][data_point_index])
												]);
											}
										});
									}

									let archive_data_graph_configs = {
										chart: {
											zoomType: 'x',
											height: 400
										},
										title: {
											text: parameter.name
										},
										subtitle: {
											text: ''
										},
										xAxis: {
											type: 'datetime',
											title: {
												text: 'Time'
											}
										},
										yAxis: {
											title: {
												text: parameter.unit
											}
										},
										legend: {
											enabled: false
										},
										tooltip: {
											pointFormat: '<span style="color:{point.color}">' + (parameter.key === 'temperature' || parameter.key === 'humidity' || parameter.key === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b>' + parameter.unit + '<br/>'
										},
										plotOptions: {
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
										},

										series: [{
											type: 'area',
											color: this.graph_colors[i],
											fillColor: this.graph_fill_color[i],
											data: line_chart_data
										}]
									};
									return(
										<div className="archive-graph-container" key={i}>
											<ReactHighcharts config={archive_data_graph_configs} />
											{/* Graph rendering for rain and another types
											(() => {
												if (parameter.key == 'rain' && graph_data.length) {
													let rain_data_graph_config = graph_data.map((graph_config, ind) => {
														return <ReactHighcharts config={graph_config} />;
													});
													return rain_data_graph_config;
													// console.log('rain');
												} else {
													return <ReactHighcharts config={archive_data_graph_configs} />
												}
											})()*/}
											
											{/*<div className="outlier">
												<span className="text-outlier">Outlier Limit</span>
												<div className="onoffswitch">
													<input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={'outlier_limit' + i} defaultChecked={this.props.outlier_limit} onChange={() => this.setState({outlier_limit: !this.props.outlier_limit})} />
													<label className="onoffswitch-label" htmlFor={'outlier_limit' + i}>
														<span className="onoffswitch-inner"></span>
														<span className={'onoffswitch-switch' + (this.props.outlier_limit ? ' blue' : '')}></span>
													</label>
												</div>
												<span className="svg-setting">
													<svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 478.703 478.703" className="inactive-grey" onClick={(e) => this.setState({modal_view: true})}>
														<path d="M454.2 189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8 7.1-27.9-3.2-38.1l-29.8-29.8c-5.6-5.6-13-8.7-20.9-8.7-6.2 0-12.1 1.9-17.1 5.5l-27.8 19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5 0-26.8 10.4-29.2 24.7l-5.8 34c-11.2 3.5-22.1 8.1-32.5 13.7l-27.5-19.8c-5-3.6-11-5.5-17.2-5.5-7.9 0-15.4 3.1-20.9 8.7l-29.9 29.8c-10.2 10.2-11.6 26.3-3.2 38.1l20 28.1c-5.5 10.5-9.9 21.4-13.3 32.7l-33.2 5.6c-14.3 2.4-24.7 14.7-24.7 29.2v42.1c0 14.5 10.4 26.8 24.7 29.2l34 5.8c3.5 11.2 8.1 22.1 13.7 32.5l-19.7 27.4c-8.4 11.8-7.1 27.9 3.2 38.1l29.8 29.8c5.6 5.6 13 8.7 20.9 8.7 6.2 0 12.1-1.9 17.1-5.5l28.1-20c10.1 5.3 20.7 9.6 31.6 13l5.6 33.6c2.4 14.3 14.7 24.7 29.2 24.7h42.2c14.5 0 26.8-10.4 29.2-24.7l5.7-33.6c11.3-3.5 22.2-8 32.6-13.5l27.7 19.8c5 3.6 11 5.5 17.2 5.5 7.9 0 15.3-3.1 20.9-8.7l29.8-29.8c10.2-10.2 11.6-26.3 3.2-38.1l-19.8-27.8c5.5-10.5 10.1-21.4 13.5-32.6l33.6-5.6c14.3-2.4 24.7-14.7 24.7-29.2v-42.1c.2-14.5-10.2-26.8-24.5-29.2zm-2.3 71.3c0 1.3-.9 2.4-2.2 2.6l-42 7c-5.3.9-9.5 4.8-10.8 9.9-3.8 14.7-9.6 28.8-17.4 41.9-2.7 4.6-2.5 10.3.6 14.7l24.7 34.8c.7 1 .6 2.5-.3 3.4l-29.8 29.8c-.7.7-1.4.8-1.9.8-.6 0-1.1-.2-1.5-.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-.6-13.1 7.8-27.2 13.6-41.9 17.4-5.2 1.3-9.1 5.6-9.9 10.8l-7.1 42c-.2 1.3-1.3 2.2-2.6 2.2h-42.1c-1.3 0-2.4-.9-2.6-2.2l-7-42c-.9-5.3-4.8-9.5-9.9-10.8-14.3-3.7-28.1-9.4-41-16.8-2.1-1.2-4.5-1.8-6.8-1.8-2.7 0-5.5.8-7.8 2.5l-35 24.9c-.5.3-1 .5-1.5.5-.4 0-1.2-.1-1.9-.8l-29.8-29.8c-.9-.9-1-2.3-.3-3.4l24.6-34.5c3.1-4.4 3.3-10.2.6-14.8-7.8-13-13.8-27.1-17.6-41.8-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2c-1.3-.2-2.2-1.3-2.2-2.6v-42.1c0-1.3.9-2.4 2.2-2.6l41.7-7c5.3-.9 9.6-4.8 10.9-10 3.7-14.7 9.4-28.9 17.1-42 2.7-4.6 2.4-10.3-.7-14.6l-24.9-35c-.7-1-.6-2.5.3-3.4l29.8-29.8c.7-.7 1.4-.8 1.9-.8.6 0 1.1.2 1.5.5l34.5 24.6c4.4 3.1 10.2 3.3 14.8.6 13-7.8 27.1-13.8 41.8-17.6 5.1-1.4 9-5.6 9.9-10.8l7.2-42.3c.2-1.3 1.3-2.2 2.6-2.2h42.1c1.3 0 2.4.9 2.6 2.2l7 41.7c.9 5.3 4.8 9.6 10 10.9 15.1 3.8 29.5 9.7 42.9 17.6 4.6 2.7 10.3 2.5 14.7-.6l34.5-24.8c.5-.3 1-.5 1.5-.5.4 0 1.2.1 1.9.8l29.8 29.8c.9.9 1 2.3.3 3.4l-24.7 34.7c-3.1 4.3-3.3 10.1-.6 14.7 7.8 13.1 13.6 27.2 17.4 41.9 1.3 5.2 5.6 9.1 10.8 9.9l42 7.1c1.3.2 2.2 1.3 2.2 2.6v42.1h-.1z"></path>
														<path d="M239.4 136.001c-57 0-103.3 46.3-103.3 103.3s46.3 103.3 103.3 103.3 103.3-46.3 103.3-103.3-46.3-103.3-103.3-103.3zm0 179.6c-42.1 0-76.3-34.2-76.3-76.3s34.2-76.3 76.3-76.3 76.3 34.2 76.3 76.3-34.2 76.3-76.3 76.3z"></path>
													</svg>
												</span>
											</div>*/}
										</div>
									);
								});
								custom_report.push(
									<div>
										{parameter_graphs}
									</div>
								);
							} else {
								custom_report.push(<div className="error-msg-no-data">{'No Data available at this time duration'}</div>);
							}
						}

						if(this.props.gridVisible && this.props.data_type == 'raw') {
							if (this.props.archive_data.time_stamps && this.props.archive_data.time_stamps.length) {
								custom_report.push(
									<div className="archive-table-container">
										<table className="table table-stripped table-hover table-bordered">
											<thead>
												{(() => {
													if (this.props.station_parameters && this.props.station_parameters.length) {
														let parameters_to_be_shown = this.props.station_parameters.map((parameter, i) => {
															// console.log(parameter);
															return(
																<th dangerouslySetInnerHTML={{__html: parameter.name}} key={i}></th>
															);
														});
														return(
															<tr>
																<th>Date & Time</th>
																{parameters_to_be_shown}
															</tr>
														);
													}
												})()}
											</thead>
											{(() => {
												let archive_data_rows = [];
												if (this.props.station_parameters && this.props.station_parameters.length) {
													let parameter_units_to_be_shown = this.props.station_parameters.map((parameter, i) => {
														// console.log(parameter);
														return(
															<th dangerouslySetInnerHTML={{__html: parameter.unit}} key={i}></th>
														);
													});
													archive_data_rows.push(
														<tr>
															<th>dd mmm yyyy - hh:mm:ss</th>
															{parameter_units_to_be_shown}
														</tr>
													);
												}

												this.props.archive_data.time_stamps.map((time_stamp, i) => {
													if (this.props.station_parameters && this.props.station_parameters.length) {
														let param_values = this.props.station_parameters.map((parameter, j) => {
															return(
																<td key={j}>{this.props.archive_data.param_values[parameter.key][i]}</td>
															);
														});
														archive_data_rows.push(
															<tr key={i}>
																<td>{moment.unix(time_stamp).tz('Asia/Kolkata').format('DD MMM YYYY - HH:mm:ss')}</td>
																{param_values}
															</tr>
														);
													}
												});
												return(
													<tbody>
														{archive_data_rows}
													</tbody>
												);
											})()}
										</table>
									</div>
								);
							}
						}

						if (!this.state.gridVisible && this.props.data_type == 'avg') {
							if (this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length) {
								let count_aqi_scale = 0;
								// Object.keys(this.props.archive_data.station_data).map((this.props.param_station_id) => {
									let station_params = [];
									Object.keys(this.props.archive_data.station_data[this.props.param_station_id]).map((param) => {
										station_params.push(param);
									});

									if (station_params && station_params.includes('wind_rose')) {
										station_params.splice(station_params.indexOf('wind_rose'), 1);
									}
									if (station_params && station_params.includes('pollution_rose')) {
										station_params.splice(station_params.indexOf('pollution_rose'), 1);
									}

									if(!this.props.gridVisible && this.props.data_type == 'avg') {
										console.log('station_params', station_params);
										if (this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length && this.props.archive_data.station_data[this.props.param_station_id][station_params[0]] != null) {
												// console.log('inserted into condition'+ this.props.param_station_id + '==> ', this.props.archive_data.station_data[this.props.param_station_id]);
												let parameter_graphs = [];
												if (this.props.archive_data.station_data[this.props.param_station_id] && Object.keys(this.props.archive_data.station_data[this.props.param_station_id]).length) {
													let upto_time = this.props.archive_data.upto_time * 1000;
													// AQI variables
													let archive_data_graph_configs;
													let temp_line_chart_data_hourly_aqi = [], line_chart_hourly_aqi = [], archive_data_graph_config_hourly_aqi = {}, graph_data_hourly_aqi = [], aqi_counter = 0;
													// wind rose variables
													let wind_rose_value = '', wind_rose_graph_configs = {};
													// pollution rose variables
													let pollution_rose_graph_configs = {}, pollution_rose_data= [], pollution_data = [];
													// all parameter variables
													let temp_line_chart_data_rain = [], line_chart_rain= [], archive_data_graph_config_rain= {}, graph_data= [];
														let counter= 0;
													if (this.props.params_selected && this.props.params_selected.indexOf('hourly_aqi') > -1) {
														if (this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'] && this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'].length && this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][0] != null) {
															let time = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration).tz('Asia/Kolkata').format('X') * 1000;
															for (var i = 0; i < this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'].length; i++) {
																if (time > upto_time) {
																	time = upto_time;
																}

																if (_.some(this.props.station_parameters, {key: 'hourly_aqi'})) {
																	if (this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].avg === null) {
																		temp_line_chart_data_hourly_aqi.push([time , null, null]);
																	} else {
																		temp_line_chart_data_hourly_aqi.push([time, (Math.round(parseFloat(this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].avg) * 100) / 100), ((this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param == "" || this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param == null ) ? '-' : this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param.toUpperCase())]);
																	}
																	aqi_counter++;
																	if (aqi_counter % 24 == 0 || this.props.archive_data.station_data[this.props.param_station_id][this.props.station_parameters[0].key].length == aqi_counter) {
																		console.log('hiii', temp_line_chart_data_hourly_aqi);
																		line_chart_hourly_aqi.push(temp_line_chart_data_hourly_aqi);
																		temp_line_chart_data_hourly_aqi= [];
																	}
																}
																time += this.props.archive_data.duration*1000;
															}


															line_chart_hourly_aqi.map((aqi_value, ind) => {
																console.log('hii there', line_chart_hourly_aqi.length);
																let aqi_color = [];
																let color = window.color_code.color_1;
																aqi_value.map((val) => {
																	if(val[1] >= 401) {
																		color = window.color_code.color_6;
																	} else if(val[1] >= 301) {
																		color = window.color_code.color_5;
																	} else if(val[1] >= 201) {
																		color = window.color_code.color_4;
																	} else if(val[1] >= 101) {
																		color = window.color_code.color_3;
																	} else if(val[1] >= 51) {
																		color = window.color_code.color_2;
																	} else {
																		color = window.color_code.color_1;
																	}
																	aqi_color.push({
																		x: val[0],
																		y: val[1],
																		param: val[2],
																		color: color
																	});
																});
																archive_data_graph_config_hourly_aqi = {
																	chart: {
																		zoomType: 'x',
																		type: 'column'
																	},
																	title: {
																		text: ((ind == 0) ? 'AQI' : ''),
																		style: {
																			fontSize: '14px'
																		}
																	},
																	xAxis: {
																		type: 'datetime',
																		title: {
																			text: 'Time'
																		}
																	},
																	yAxis: {
																		title: {
																			text: 'AQI'
																		}
																	},
																	credits: {
																		enabled: false
																	},
																	legend: {
																		enabled: false
																	},
																	tooltip: {
																		pointFormat: '<span style="color:{point.color}">AQI <b>{point.y}</b> ({point.param})<br/></span>'
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
																		data: aqi_color
																	}]
																};
																graph_data_hourly_aqi.push(archive_data_graph_config_hourly_aqi);
															});
															if (count_aqi_scale == 0) {
																parameter_graphs.push(<div>
																	<div className="archive-aqi-container">
																		<div className="aqi-scale-title">AQI Scale</div>
																		<div className="colored-bar">
																			<div className="color-bar color-one"></div>
																			<div className="color-bar color-two"></div>
																			<div className="color-bar color-three"></div>
																			<div className="color-bar color-four"></div>
																			<div className="color-bar color-five"></div>
																			<div className="color-bar color-six"></div>
																		</div>
																		<div className="colored-index">
																			<div className="color-index first-index">0</div>
																			<div className="color-index second-index">50</div>
																			<div className="color-index third-index">100</div>
																			<div className="color-index fourth-index">200</div>
																			<div className="color-index fifth-index">300</div>
																			<div className="color-index sixth-index-archive">400</div>
																			<div className="color-index seventh-index-archive">500</div>
																		</div>
																		<div className="colored-index-text">
																			<div className="first-index-text">Good</div>
																			<div className="last-index-text">Severe</div>
																		</div>
																	</div>
																	{/*<div className="archive-graph-container">
																		{(() => {
																			if (graph_data_hourly_aqi && graph_data_hourly_aqi.length) {
																				let hourly_aqi_bar_graph = graph_data_hourly_aqi.map((graph_config) => {
																					return <ReactHighcharts config={graph_config} />
																				});
																				return hourly_aqi_bar_graph;
																			}
																		})()}
																	</div>*/}
																</div>);
															}
														}
													}

													if (this.props.params_selected && this.props.params_selected.indexOf('wind_rose') > -1) {
														console.log('wind_rose_value', this.props.param_station_id);
														console.log('wind_rose_value', this.props.station_parameters);
														console.log('wind_rose_value', this.props.archive_data.station_data[this.props.param_station_id]['wind_rose']);
														if (_.some(this.props.station_parameters, {key: 'wind_rose'})) {
															wind_rose_value = this.props.archive_data.station_data[this.props.param_station_id]['wind_rose'];
														}
														if (wind_rose_value != null && Object.keys(wind_rose_value).length) {
															wind_rose_graph_configs = {
																chart: {
																	polar: true,
																	type: 'column'
																},
																credits: {
																	enabled: false
																},
																exporting: {
																	enabled: false
																},
																title: {
																	text: 'Wind rose'
																},
																pane: {
																	size: '85%'
																},
																xAxis: {
																	tickmarkPlacement: 'on',
																	categories: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
																},
																yAxis: {
																	min: 0,
																	endOnTick: false,
																	showLastLabel: true,
																	title: {
																		text: 'Frequency (%)'
																	},
																	labels: {
																		formatter: function () {
																			return this.value + ' %';
																		}
																	},
																	reversedStacks: false
																},
																tooltip: {
																	valueSuffix: ' %'
																},
																plotOptions: {
																	series: {
																		stacking: 'normal',
																		shadow: false,
																		groupPadding: 0,
																		pointPlacement: 'on'
																	}
																},
																series: wind_rose_value
															}
															parameter_graphs.push(<div>
																<div className="archive-graph-container">
																	{(() => {
																		if (_.some(this.props.station_parameters, {key: 'wind_rose'})) {
																			return <ReactHighcharts config={wind_rose_graph_configs} />
																		}
																	})()}
																</div>
															</div>);
														}

													}
													if (this.props.params_selected && this.props.params_selected.indexOf('pollution_rose') > -1) {
														if (_.some(this.props.station_parameters, {key: 'pollution_rose'})) {
															pollution_data = this.props.archive_data.station_data[this.props.param_station_id]['pollution_rose'];
														}

														if (pollution_data != null && Object.keys(pollution_data).length) {
															Object.keys(this.pollutants).map((pollutant) => {
																if (pollution_data[this.pollutants[pollutant].key]) {
																	pollution_rose_graph_configs = {
																		chart: {
																			polar: true,
																			type: 'column'
																		},
																		credits: {
																			enabled: false
																		},
																		exporting: {
																			enabled: false
																		},
																		title: {
																			text: 'Pollution Rose Of ' + this.pollutants[pollutant].name,
																			useHTML: true
																		},
																		pane: {
																			size: '95%'
																		},
																		xAxis: {
																			tickmarkPlacement: 'on',
																			categories: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
																		},
																		legend: {
																			itemStyle: {
																				// font: '9pt Trebuchet MS, Verdana, sans-serif',
																				color: 'black'
																			},
																			itemHoverStyle:{
																				color: 'gray'
																			}
																		},
																		yAxis: {
																			min: 0,
																			endOnTick: false,
																			showLastLabel: true,
																			title: {
																				text: 'Frequency (%)'
																			},
																			labels: {
																				formatter: function () {
																					return this.value + ' %';
																				}
																			},
																			reversedStacks: false
																		},
																		tooltip: {
																			valueSuffix: ' %'
																		},
																		plotOptions: {
																			series: {
																				stacking: 'normal',
																				shadow: false,
																				groupPadding: 0,
																				pointPlacement: 'on'
																			}
																		},
																		series: pollution_data[this.pollutants[pollutant].key]
																	}
																	pollution_rose_data.push(pollution_rose_graph_configs);
																}
																// console.log('poll', this.pollutants[pollutant].name);
															});
															parameter_graphs.push(<div>
																{(() => {
																	if (pollution_rose_data && pollution_rose_data.length) {
																		let pollution_rose = pollution_rose_data.map((graph_config) => {
																			return <div className="archive-graph-container" id="rose_chart">
																				<ReactHighcharts config={graph_config} />
																			</div>;
																		});
																		return pollution_rose;
																	}
																})()}
															</div>);
														}
													}
													if (this.props.avg_data_time_aura) {
														let station_parameters = JSON.parse(JSON.stringify(this.props.station_parameters));
														// console.log('hello_chk', station_parameters);
														// console.log('hello_c', this.props.station_parameters);
														// if (station_parameters && _.some(station_parameters, {key: 'hourly_aqi'})) {
														// 	station_parameters.splice(_.findIndex(station_parameters, ['key', 'hourly_aqi']), 1);
														// }
														if (station_parameters && _.some(station_parameters, {key: 'wind_rose'})) {
															station_parameters.splice(_.findIndex(station_parameters, ['key', 'wind_rose']), 1);
														}
														if (station_parameters && _.some(station_parameters, {key: 'pollution_rose'})) {
															station_parameters.splice(_.findIndex(station_parameters, ['key', 'pollution_rose']), 1);
														}
														// console.log('hello_chk', station_parameters);
														// console.log('hello_c', this.props.station_parameters);
														station_parameters.map((parameter, j) => {
															console.log('aurassure_report', parameter);
															let ranges = [];
															let averages = [];
															let time = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration).tz('Asia/Kolkata').format('X') * 1000;
															if (_.some(station_parameters, {key: parameter.key})) {
																if (this.props.archive_data.station_data[this.props.param_station_id] && this.props.archive_data.station_data[this.props.param_station_id][parameter.key] && this.props.archive_data.station_data[this.props.param_station_id][parameter.key].length) {
																	for (var i = 0; i < this.props.archive_data.station_data[this.props.param_station_id][parameter.key].length; i++) {
																		if (time > upto_time) {
																			time = upto_time;
																		}
																		if (parameter.key == 'rain') {
																			// console.log('rainnnnn', this.props.archive_data.station_data[key]['rain']);
																			if (this.props.archive_data.station_data[this.props.param_station_id]['rain'][i]) {
																				if (this.props.archive_data.station_data[this.props.param_station_id]['rain'][i].avg === null) {
																					temp_line_chart_data_rain.push([time, null]);
																				} else {
																					temp_line_chart_data_rain.push([time, Math.round(parseFloat(this.props.archive_data.station_data[this.props.param_station_id]['rain'][i].avg) * 100) / 100]);
																				}
																			}
																			counter++;
																			if (counter % 24 == 0 || this.props.archive_data.station_data[this.props.param_station_id]['rain'].length == counter) {
																				line_chart_rain.push(temp_line_chart_data_rain);
																				temp_line_chart_data_rain= [];
																			}
																		} else {
																			let avg,
																				round = (parameter.key == 'co') ? 10000 : 100;
																				// console.log('paaarraaa', this.props.archive_data.station_data[this.props.param_station_id][parameter.key]);
																			if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i]) {
																				if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].avg === null) {
																					avg = null;
																				} else {
																					avg = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].avg * round) / round;
																				}
																				let min;
																				if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].min === null) {
																					min = null;
																				} else {
																					min = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].min * round) / round;
																				}
																				let max;
																				if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].max === null) {
																					max = null;
																				} else {
																					max = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].max * round) / round;
																				}
																				ranges.push([time, min, max]);
																				averages.push([time, avg]);
																			}
																		}
																		time += this.props.archive_data.duration*1000;
																	}

																	// console.log('hiii_this'+ averages + '==> ', ranges);

																	line_chart_rain.map((rain_value, ind) => {
																		archive_data_graph_config_rain = {
																			chart: {
																				zoomType: 'x',
																				type: 'column'
																			},
																			title: {
																				text: ((ind == 0) ? parameter.name : ''),
																				style: {
																					fontSize: '14px'
																				}
																			},
																			xAxis: {
																				type: 'datetime',
																				title: {
																					text: 'Time'
																				}
																			},
																			yAxis: {
																				title: {
																					text: parameter.unit
																				}
																			},
																			credits: {
																				enabled: false
																			},
																			legend: {
																				enabled: false
																			},
																			tooltip: {
																				pointFormat: '<span style="color:{point.color}">' + (parameter.key === 'temperature' || parameter.key === 'humidity' || parameter.key === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b>' + parameter.unit + '<br/>'
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
																				data: rain_value
																			}]
																		};
																		graph_data.push(archive_data_graph_config_rain);
																	});

																	archive_data_graph_configs = {
																		chart: {
																			zoomType: 'x',
																			height: 400
																		},
																		title: {
																			text: parameter.name ,
																			useHTML: true
																		},

																		xAxis: {
																			type: 'datetime'
																		},

																		yAxis: {
																			title: {
																				text: parameter.unit
																			}
																		},

																		tooltip: {
																			crosshairs: true,
																			shared: true,
																			valueSuffix: parameter.unit
																		},

																		series: [{
																			name: 'Average',
																			data: averages,
																			zIndex: 1,
																			color: this.graph_colors[j],
																			marker: {
																				radius: 0,
																				fillColor: this.graph_fill_color[j],
																				lineWidth: 2,
																				lineColor: this.graph_colors[j]
																			}
																		}, {
																			name: 'Min - Max Range',
																			data: ranges,
																			type: "arearange",
																			lineWidth: 0,
																			linkedTo: ':previous',
																			color: this.graph_colors[j],
																			fillOpacity: 0.3,
																			zIndex: 0
																		}]
																	};

																	parameter_graphs.push(<div>
																		<div className="archive-graph-container" key={j}>
																			{(() => {
																				if (parameter.key == 'hourly_aqi' && graph_data_hourly_aqi && graph_data_hourly_aqi.length) {
																					let hourly_aqi_bar_graph = graph_data_hourly_aqi.map((graph_config) => {
																						return <ReactHighcharts config={graph_config} />
																					});
																					return hourly_aqi_bar_graph;
																				}else if (parameter.key == 'rain' && graph_data.length) {
																					let rain_bar_graph = graph_data.map((graph_config) => {
																						return <ReactHighcharts config={graph_config} />
																					});
																					return rain_bar_graph;
																				} else {
																					return <ReactHighcharts config={archive_data_graph_configs} />
																				}
																			})()}
																			{/*<div className="outlier">
																				<span className="text-outlier">Outlier Limit</span>
																				<div className="onoffswitch">
																					<input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={'outlier_limit' + j} defaultChecked={this.props.outlier_limit} onChange={(e) => this.setState({outlier_limit: !this.props.outlier_limit})} />
																					<label className="onoffswitch-label" htmlFor={'outlier_limit' + j}>
																						<span className="onoffswitch-inner"></span>
																						<span className={'onoffswitch-switch'+ ' ' + j + ((this.props.outlier_limit) ? ' blue' : '')}></span>
																					</label>
																				</div>
																				<span className="svg-setting">
																					<svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 478.703 478.703" onClick={() => this.setState({modal_view: true})}>
																						<path fill="#2673B5" d="M454.2 189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8 7.1-27.9-3.2-38.1l-29.8-29.8c-5.6-5.6-13-8.7-20.9-8.7-6.2 0-12.1 1.9-17.1 5.5l-27.8 19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5 0-26.8 10.4-29.2 24.7l-5.8 34c-11.2 3.5-22.1 8.1-32.5 13.7l-27.5-19.8c-5-3.6-11-5.5-17.2-5.5-7.9 0-15.4 3.1-20.9 8.7l-29.9 29.8c-10.2 10.2-11.6 26.3-3.2 38.1l20 28.1c-5.5 10.5-9.9 21.4-13.3 32.7l-33.2 5.6c-14.3 2.4-24.7 14.7-24.7 29.2v42.1c0 14.5 10.4 26.8 24.7 29.2l34 5.8c3.5 11.2 8.1 22.1 13.7 32.5l-19.7 27.4c-8.4 11.8-7.1 27.9 3.2 38.1l29.8 29.8c5.6 5.6 13 8.7 20.9 8.7 6.2 0 12.1-1.9 17.1-5.5l28.1-20c10.1 5.3 20.7 9.6 31.6 13l5.6 33.6c2.4 14.3 14.7 24.7 29.2 24.7h42.2c14.5 0 26.8-10.4 29.2-24.7l5.7-33.6c11.3-3.5 22.2-8 32.6-13.5l27.7 19.8c5 3.6 11 5.5 17.2 5.5 7.9 0 15.3-3.1 20.9-8.7l29.8-29.8c10.2-10.2 11.6-26.3 3.2-38.1l-19.8-27.8c5.5-10.5 10.1-21.4 13.5-32.6l33.6-5.6c14.3-2.4 24.7-14.7 24.7-29.2v-42.1c.2-14.5-10.2-26.8-24.5-29.2zm-2.3 71.3c0 1.3-.9 2.4-2.2 2.6l-42 7c-5.3.9-9.5 4.8-10.8 9.9-3.8 14.7-9.6 28.8-17.4 41.9-2.7 4.6-2.5 10.3.6 14.7l24.7 34.8c.7 1 .6 2.5-.3 3.4l-29.8 29.8c-.7.7-1.4.8-1.9.8-.6 0-1.1-.2-1.5-.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-.6-13.1 7.8-27.2 13.6-41.9 17.4-5.2 1.3-9.1 5.6-9.9 10.8l-7.1 42c-.2 1.3-1.3 2.2-2.6 2.2h-42.1c-1.3 0-2.4-.9-2.6-2.2l-7-42c-.9-5.3-4.8-9.5-9.9-10.8-14.3-3.7-28.1-9.4-41-16.8-2.1-1.2-4.5-1.8-6.8-1.8-2.7 0-5.5.8-7.8 2.5l-35 24.9c-.5.3-1 .5-1.5.5-.4 0-1.2-.1-1.9-.8l-29.8-29.8c-.9-.9-1-2.3-.3-3.4l24.6-34.5c3.1-4.4 3.3-10.2.6-14.8-7.8-13-13.8-27.1-17.6-41.8-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2c-1.3-.2-2.2-1.3-2.2-2.6v-42.1c0-1.3.9-2.4 2.2-2.6l41.7-7c5.3-.9 9.6-4.8 10.9-10 3.7-14.7 9.4-28.9 17.1-42 2.7-4.6 2.4-10.3-.7-14.6l-24.9-35c-.7-1-.6-2.5.3-3.4l29.8-29.8c.7-.7 1.4-.8 1.9-.8.6 0 1.1.2 1.5.5l34.5 24.6c4.4 3.1 10.2 3.3 14.8.6 13-7.8 27.1-13.8 41.8-17.6 5.1-1.4 9-5.6 9.9-10.8l7.2-42.3c.2-1.3 1.3-2.2 2.6-2.2h42.1c1.3 0 2.4.9 2.6 2.2l7 41.7c.9 5.3 4.8 9.6 10 10.9 15.1 3.8 29.5 9.7 42.9 17.6 4.6 2.7 10.3 2.5 14.7-.6l34.5-24.8c.5-.3 1-.5 1.5-.5.4 0 1.2.1 1.9.8l29.8 29.8c.9.9 1 2.3.3 3.4l-24.7 34.7c-3.1 4.3-3.3 10.1-.6 14.7 7.8 13.1 13.6 27.2 17.4 41.9 1.3 5.2 5.6 9.1 10.8 9.9l42 7.1c1.3.2 2.2 1.3 2.2 2.6v42.1h-.1z"></path>
																						<path fill="#2673B5" d="M239.4 136.001c-57 0-103.3 46.3-103.3 103.3s46.3 103.3 103.3 103.3 103.3-46.3 103.3-103.3-46.3-103.3-103.3-103.3zm0 179.6c-42.1 0-76.3-34.2-76.3-76.3s34.2-76.3 76.3-76.3 76.3 34.2 76.3 76.3-34.2 76.3-76.3 76.3z"></path>
																					</svg>
																				</span>
																			</div>*/}
																		</div>
																	</div>)
																}
															}

														});
													}
												} else {
													parameter_graphs.push(<div className="error-msg-no-data">{'No data available for ' + this.props.all_stations_aura[_.findIndex(this.props.all_stations_aura, ['id', this.props.param_station_id])].name}</div>);
												}
												custom_report.push(
													<div>
														{parameter_graphs}
													</div>
												);
										} else {
											custom_report.push(<div className="error-msg-no-data">{'No Data available at this time duration'}</div>);
										}
									}
									
									if(this.props.gridVisible && this.props.data_type == 'avg') {
										if (this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length) {
											if (this.props.station_parameters && Object.keys(this.props.station_parameters).length && this.props.archive_data.station_data[this.props.param_station_id] && Object.keys(this.props.archive_data.station_data[this.props.param_station_id]).length) {
												// this.props.station_parameters = this.props.station_parameters.filter(function(param){ 
												// 	return param.key != 'wind_rose';
												// });
												// this.props.station_parameters = this.props.station_parameters.filter(function(param){ 
												// 	return param.key != 'pollution_rose';
												// });
												if (this.props.archive_data.station_data[this.props.param_station_id] && Object.keys(this.props.archive_data.station_data[this.props.param_station_id]).length && this.props.station_parameters && Object.keys(this.props.station_parameters).length && this.props.archive_data.station_data[this.props.param_station_id][station_params[0]] != null) {
													custom_report.push(
														<div className="archive-table-container">
															<table className="table table-stripped table-hover table-bordered">
																<thead>
																	{(() => {
																		// console.log('hiiiiiii', this.props.station_parameters);
																		let parameters_to_be_shown;
																		if (this.props.station_parameters) {
																			parameters_to_be_shown = this.props.station_parameters.map((parameter, i) => {
																				if (parameter.key == 'wind_rose') {
																					return null
																				} else if (parameter.key == 'pollution_rose') {
																					return null
																				} else {
																					// console.log(parameter);
																					return(
																						<th dangerouslySetInnerHTML={{__html: parameter.name}} key={i}></th>
																					);
																				}
																			});
																		}
																		return(
																			<tr>
																				<th>Date & Time</th>
																				{/*<th>Station</th>*/}
																				{parameters_to_be_shown}
																			</tr>
																		);
																	})()}
																</thead>
																{(() => {
																	let archive_data_rows = [], parameter_units_to_be_shown, table_avg_min_max;
																	if (this.props.station_parameters) {
																		parameter_units_to_be_shown = this.props.station_parameters.map((param, i) => {
																				if (param.key == 'wind_rose') {
																					return null
																				} else if (param.key == 'pollution_rose') {
																					return null
																				} else {
																					// console.log(parameter);
																					return(
																						<th dangerouslySetInnerHTML={{__html: param.unit}} key={i}></th>
																					);
																				}
																		});
																	}
																	if (this.props.station_parameters) {
																		table_avg_min_max = this.props.station_parameters.map((param_key, i) => {
																			if (param_key.key == 'hourly_aqi') {
																				return <td style={{padding: 0}} key={i}>
																					<div className="data-aqi">
																						<div>AQI</div>
																						<div>Major Pollutant</div>
																					</div>
																				</td>
																			} else if (param_key.key == 'wind_rose') {
																				return null
																			} else if (param_key.key == 'pollution_rose') {
																				return null
																			} else if (param_key.key == 'rain') {
																				return <td style={{padding: 0}} key={i}>
																					<div className="data-rain">
																						Aggregated
																					</div>
																				</td>
																			} else {
																				return <td style={{padding: 0}} key={i}>
																					<div className="data-avg-min-max">
																						<div>Avg.</div>
																						<div>Min.</div>
																						<div>Max.</div>
																					</div>
																				</td>
																			}
																		});
																	}

																	archive_data_rows.push(
																		<tr>
																			<th>hh:mm dd mm yyyy to hh:mm dd mm yyyy</th>
																			{/*<td>&nbsp;</td>*/}
																			{parameter_units_to_be_shown}
																		</tr>
																	);

																	archive_data_rows.push(
																		<tr>
																			{/*<td>&nbsp;</td>*/}
																			<td>&nbsp;</td>
																			{table_avg_min_max}
																		</tr>
																	);

																	if (this.props.avg_data_time_aura) {
																		let param_values;
																		/*if (this.props.archive_data.param_values.length !== ) {
																			console.log(this.props.archive_data.param_values.length);
																		}*/
																		if (this.props.station_parameters && Object.keys(this.props.station_parameters).length && this.props.archive_data.station_data[this.props.param_station_id][station_params[0]] && this.props.archive_data.station_data[this.props.param_station_id][station_params[0]].length) {
																			let from_time_grid, upto_time_grid, upto_time_state;
																			for (var i = 0; i < this.props.archive_data.station_data[this.props.param_station_id][station_params[0]].length; i++) {
																				from_time_grid = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration * i).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																				upto_time_grid = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration * (i + 1)).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																				upto_time_state = moment.unix(this.props.archive_data.upto_time).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																				// console.log('upto_time_grid1', this.props.archive_data.start_time + this.props.archive_data.duration);
																				if ((this.props.archive_data.start_time + this.props.archive_data.duration * (i + 1)) > this.props.archive_data.upto_time) {
																					upto_time_grid = upto_time_state;
																				}
																				// console.log('upto_time_grid', this.props.archive_data.upto_time);
																				param_values = this.props.station_parameters.map((parameter, j) => {
																					let responsible_param
																					if (this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi']) {
																						if (this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i]) {
																							if (this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param === "" || this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param === null) {
																								responsible_param = 'NA';
																							} else {
																								responsible_param = this.props.archive_data.station_data[this.props.param_station_id]['hourly_aqi'][i].param;
																							}
																						}
																					}
																					if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key]) {
																						let avg,
																							round = (parameter.key == 'co') ? 10000 : 100;
																						if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i]) {
																							if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].avg === null) {
																								avg = 'NA';
																							} else {
																								avg = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].avg * round) / round;
																							}
																							let min;
																							if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].min === null) {
																								min = 'NA';
																							} else {
																								min = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].min * round) / round;
																							}
																							let max;
																							if (this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].max === null) {
																								max = 'NA';
																							} else {
																								max = Math.round(this.props.archive_data.station_data[this.props.param_station_id][parameter.key][i].max * round) / round;
																							}
																							if (parameter.key == 'hourly_aqi') {
																								return <td key={j}>
																									<div className="data-aqi">
																										<div>{avg}</div>
																										<div>{responsible_param}</div>
																									</div>
																								</td>;
																							} else if (parameter.key == 'wind_rose') {
																								return null;
																							} else if (parameter.key == 'pollution_rose') {
																								return null;
																							} else if (parameter.key == 'rain') {
																								return <td key={j}>
																									<div className="data-rain">{avg}</div>
																								</td>;
																							} else {
																								return <td key={j}>
																									<div className="data-avg-min-max">
																										<div>{avg}</div>
																										<div>{min}</div>
																										<div>{max}</div>
																									</div>
																								</td>;
																							}
																						}
																					}
																				});

																				archive_data_rows.push(
																					<tr>
																						<td>{from_time_grid} to {upto_time_grid}</td>
																						{/*<td className="min-width-name">
																							{this.props.all_stations_aura[_.findIndex(this.props.all_stations_aura, ['id', this.props.param_station_id])].name}
																						</td>*/}
																						{param_values}
																					</tr>
																				);
																			}
																		}
																	}

																	return(
																		<tbody>
																			{archive_data_rows}
																		</tbody>
																	);
																})()}
															</table>
														</div>
													);
												}
											} else {
												custom_report.push(<div className="error-msg-no-data">{'No data available for ' + this.props.all_stations_aura[_.findIndex(this.props.all_stations_aura, ['id', this.props.param_station_id])].name}</div>);
											}
										}
									}
									count_aqi_scale++;
								// });
								} else if (this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length) {
								let station_params = [];
								Object.keys(this.props.archive_data.city_data).map((param) => {
									station_params.push(param);
								});

								if (station_params && station_params.includes('wind_rose')) {
									station_params.splice(station_params.indexOf('wind_rose'), 1);
								}
								if (station_params && station_params.includes('pollution_rose')) {
									station_params.splice(station_params.indexOf('pollution_rose'), 1);
								}

								if(!this.props.gridVisible && this.props.data_type == 'avg') {
									console.log('station_params', station_params);
									if (this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length && this.props.archive_data.city_data[station_params[0]] != null) {
											// console.log('inserted into condition'+ this.props.param_station_id + '==> ', this.props.archive_data.city_data);
											let parameter_graphs = [];
											if (this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length) {
												let upto_time = this.props.archive_data.upto_time * 1000;
												// AQI variables
												let archive_data_graph_configs;
												let temp_line_chart_data_hourly_aqi = [], line_chart_hourly_aqi = [], archive_data_graph_config_hourly_aqi = {}, graph_data_hourly_aqi = [], aqi_counter = 0;
												// wind rose variables
												let wind_rose_value = '', wind_rose_graph_configs = {};
												// pollution rose variables
												let pollution_rose_graph_configs = {}, pollution_rose_data= [], pollution_data = [];
												// all parameter variables
												let temp_line_chart_data_rain = [], line_chart_rain= [], archive_data_graph_config_rain= {}, graph_data= [];
													let counter= 0;
												if (this.props.archive_data.city_data['hourly_aqi'] && this.props.archive_data.city_data['hourly_aqi'].length && this.props.archive_data.city_data['hourly_aqi'][0] != null) {
													let time = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration).tz('Asia/Kolkata').format('X') * 1000;
													for (var i = 0; i < this.props.archive_data.city_data['hourly_aqi'].length; i++) {
														if (time > upto_time) {
															time = upto_time;
														}

														if (_.some(this.props.archive_data.station_parameters, {key: 'hourly_aqi'})) {
															if (this.props.archive_data.city_data['hourly_aqi'][i].avg === null) {
																temp_line_chart_data_hourly_aqi.push([time , null, null]);
															} else {
																temp_line_chart_data_hourly_aqi.push([time, (Math.round(parseFloat(this.props.archive_data.city_data['hourly_aqi'][i].avg) * 100) / 100), ((this.props.archive_data.city_data['hourly_aqi'][i].param == "" || this.props.archive_data.city_data['hourly_aqi'][i].param == null ) ? '-' : this.props.archive_data.city_data['hourly_aqi'][i].param.toUpperCase())]);
															}
															aqi_counter++;
															if (aqi_counter % 24 == 0 || this.props.archive_data.city_data[this.props.archive_data.station_parameters[0].key].length == aqi_counter) {
																console.log('hiii', temp_line_chart_data_hourly_aqi);
																line_chart_hourly_aqi.push(temp_line_chart_data_hourly_aqi);
																temp_line_chart_data_hourly_aqi= [];
															}
														}
														time += this.props.archive_data.duration*1000;
													}

													line_chart_hourly_aqi.map((aqi_value, ind) => {
														console.log('hii there', line_chart_hourly_aqi.length);
														let aqi_color = [];
														let color = window.color_code.color_1;
														aqi_value.map((val) => {
															if(val[1] >= 401) {
																color = window.color_code.color_6;
															} else if(val[1] >= 301) {
																color = window.color_code.color_5;
															} else if(val[1] >= 201) {
																color = window.color_code.color_4;
															} else if(val[1] >= 101) {
																color = window.color_code.color_3;
															} else if(val[1] >= 51) {
																color = window.color_code.color_2;
															} else {
																color = window.color_code.color_1;
															}
															aqi_color.push({
																x: val[0],
																y: val[1],
																param: val[2],
																color: color
															});
														});
														archive_data_graph_config_hourly_aqi = {
															chart: {
																zoomType: 'x',
																type: 'column'
															},
															title: {
																text: ((ind == 0) ? 'AQI' : ''),
																style: {
																	fontSize: '14px'
																}
															},
															xAxis: {
																type: 'datetime',
																title: {
																	text: 'Time'
																}
															},
															yAxis: {
																title: {
																	text: 'AQI'
																}
															},
															credits: {
																enabled: false
															},
															legend: {
																enabled: false
															},
															tooltip: {
																pointFormat: '<span style="color:{point.color}">AQI <b>{point.y}</b> ({point.param})<br/></span>'
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
																data: aqi_color
															}]
														};
														graph_data_hourly_aqi.push(archive_data_graph_config_hourly_aqi);
													});
													parameter_graphs.push(<div>
														<div className="archive-aqi-container">
															<div className="aqi-scale-title">AQI Scale</div>
															<div className="colored-bar">
																<div className="color-bar color-one"></div>
																<div className="color-bar color-two"></div>
																<div className="color-bar color-three"></div>
																<div className="color-bar color-four"></div>
																<div className="color-bar color-five"></div>
																<div className="color-bar color-six"></div>
															</div>
															<div className="colored-index">
																<div className="color-index first-index">0</div>
																<div className="color-index second-index">50</div>
																<div className="color-index third-index">100</div>
																<div className="color-index fourth-index">200</div>
																<div className="color-index fifth-index">300</div>
																<div className="color-index sixth-index-archive">400</div>
																<div className="color-index seventh-index-archive">500</div>
															</div>
															<div className="colored-index-text">
																<div className="first-index-text">Good</div>
																<div className="last-index-text">Severe</div>
															</div>
														</div>
													</div>);
												}
												
												if (this.props.params_selected && this.props.params_selected.indexOf('wind_rose') > -1) {
													if (_.some(this.props.archive_data.station_parameters, {key: 'wind_rose'})) {
														wind_rose_value = this.props.archive_data.city_data['wind_rose'];
													}
													if (wind_rose_value != null && Object.keys(wind_rose_value).length) {
														wind_rose_graph_configs = {
															chart: {
																polar: true,
																type: 'column'
															},
															credits: {
																enabled: false
															},
															exporting: {
																enabled: false
															},
															title: {
																text: 'Wind rose'
															},
															pane: {
																size: '85%'
															},
															xAxis: {
																tickmarkPlacement: 'on',
																categories: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
															},
															yAxis: {
																min: 0,
																endOnTick: false,
																showLastLabel: true,
																title: {
																	text: 'Frequency (%)'
																},
																labels: {
																	formatter: function () {
																		return this.value + ' %';
																	}
																},
																reversedStacks: false
															},
															tooltip: {
																valueSuffix: ' %'
															},
															plotOptions: {
																series: {
																	stacking: 'normal',
																	shadow: false,
																	groupPadding: 0,
																	pointPlacement: 'on'
																}
															},
															series: wind_rose_value
														}
														parameter_graphs.push(<div>
															<div className="archive-graph-container">
																{(() => {
																	if (_.some(this.props.archive_data.station_parameters, {key: 'wind_rose'})) {
																		return <ReactHighcharts config={wind_rose_graph_configs} />
																	}
																})()}
															</div>
														</div>);
													}

												}
												if (this.props.params_selected && this.props.params_selected.indexOf('pollution_rose') > -1) {
													if (_.some(this.props.archive_data.station_parameters, {key: 'pollution_rose'})) {
														pollution_data = this.props.archive_data.city_data['pollution_rose'];
													}

													if (pollution_data != null && Object.keys(pollution_data).length) {
														Object.keys(this.pollutants).map((pollutant) => {
															if (pollution_data[this.pollutants[pollutant].key]) {
																pollution_rose_graph_configs = {
																	chart: {
																		polar: true,
																		type: 'column'
																	},
																	credits: {
																		enabled: false
																	},
																	exporting: {
																		enabled: false
																	},
																	title: {
																		text: 'Pollution Rose Of ' + this.pollutants[pollutant].name,
																		useHTML: true
																	},
																	pane: {
																		size: '95%'
																	},
																	xAxis: {
																		tickmarkPlacement: 'on',
																		categories: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
																	},
																	legend: {
																		itemStyle: {
																			// font: '9pt Trebuchet MS, Verdana, sans-serif',
																			color: 'black'
																		},
																		itemHoverStyle:{
																			color: 'gray'
																		}
																	},
																	yAxis: {
																		min: 0,
																		endOnTick: false,
																		showLastLabel: true,
																		title: {
																			text: 'Frequency (%)'
																		},
																		labels: {
																			formatter: function () {
																				return this.value + ' %';
																			}
																		},
																		reversedStacks: false
																	},
																	tooltip: {
																		valueSuffix: ' %'
																	},
																	plotOptions: {
																		series: {
																			stacking: 'normal',
																			shadow: false,
																			groupPadding: 0,
																			pointPlacement: 'on'
																		}
																	},
																	series: pollution_data[this.pollutants[pollutant].key]
																}
																pollution_rose_data.push(pollution_rose_graph_configs);
															}
															// console.log('poll', this.pollutants[pollutant].name);
														});
														parameter_graphs.push(<div>
															{(() => {
																if (pollution_rose_data && pollution_rose_data.length) {
																	let pollution_rose = pollution_rose_data.map((graph_config) => {
																		return <div className="archive-graph-container" id="rose_chart">
																			<ReactHighcharts config={graph_config} />
																		</div>;
																	});
																	return pollution_rose;
																}
															})()}
														</div>);
													}
												}
												if (this.props.avg_data_time_aura) {
													let station_parameters = JSON.parse(JSON.stringify(this.props.archive_data.station_parameters));
													// console.log('hello_chk', station_parameters);
													// console.log('hello_c', this.props.archive_data.station_parameters);
													// if (station_parameters && _.some(station_parameters, {key: 'hourly_aqi'})) {
													// 	station_parameters.splice(_.findIndex(station_parameters, ['key', 'hourly_aqi']), 1);
													// }
													if (station_parameters && _.some(station_parameters, {key: 'wind_rose'})) {
														station_parameters.splice(_.findIndex(station_parameters, ['key', 'wind_rose']), 1);
													}
													if (station_parameters && _.some(station_parameters, {key: 'pollution_rose'})) {
														station_parameters.splice(_.findIndex(station_parameters, ['key', 'pollution_rose']), 1);
													}
													// console.log('hello_chk', station_parameters);
													// console.log('hello_c', this.props.archive_data.station_parameters);
													station_parameters.map((parameter, j) => {
														let ranges = [];
														let averages = [];
														let time = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration).tz('Asia/Kolkata').format('X') * 1000;
														if (_.some(station_parameters, {key: parameter.key})) {
															if (this.props.archive_data.city_data && this.props.archive_data.city_data[parameter.key] && this.props.archive_data.city_data[parameter.key].length) {
																for (var i = 0; i < this.props.archive_data.city_data[parameter.key].length; i++) {
																	if (time > upto_time) {
																		time = upto_time;
																	}
																	if (parameter.key == 'rain') {
																		// console.log('rainnnnn', this.props.archive_data.city_data[key]['rain']);
																		if (this.props.archive_data.city_data['rain'][i]) {
																			if (this.props.archive_data.city_data['rain'][i].avg === null) {
																				temp_line_chart_data_rain.push([time, null]);
																			} else {
																				temp_line_chart_data_rain.push([time, Math.round(parseFloat(this.props.archive_data.city_data['rain'][i].avg) * 100) / 100]);
																			}
																		}
																		counter++;
																		if (counter % 24 == 0 || this.props.archive_data.city_data['rain'].length == counter) {
																			line_chart_rain.push(temp_line_chart_data_rain);
																			temp_line_chart_data_rain= [];
																		}
																	} else {
																		let avg,
																			round = (parameter.key == 'co') ? 10000 : 100;
																			// console.log('paaarraaa', this.props.archive_data.city_data[parameter.key]);
																		if (this.props.archive_data.city_data[parameter.key][i]) {
																			if (this.props.archive_data.city_data[parameter.key][i].avg === null) {
																				avg = null;
																			} else {
																				avg = Math.round(this.props.archive_data.city_data[parameter.key][i].avg * round) / round;
																			}
																			let min;
																			if (this.props.archive_data.city_data[parameter.key][i].min === null) {
																				min = null;
																			} else {
																				min = Math.round(this.props.archive_data.city_data[parameter.key][i].min * round) / round;
																			}
																			let max;
																			if (this.props.archive_data.city_data[parameter.key][i].max === null) {
																				max = null;
																			} else {
																				max = Math.round(this.props.archive_data.city_data[parameter.key][i].max * round) / round;
																			}
																			ranges.push([time, min, max]);
																			averages.push([time, avg]);
																		}
																	}
																	time += this.props.archive_data.duration*1000;
																}

																// console.log('hiii_this'+ averages + '==> ', ranges);

																line_chart_rain.map((rain_value, ind) => {
																	archive_data_graph_config_rain = {
																		chart: {
																			zoomType: 'x',
																			type: 'column'
																		},
																		title: {
																			text: ((ind == 0) ? parameter.name : ''),
																			style: {
																				fontSize: '14px'
																			}
																		},
																		xAxis: {
																			type: 'datetime',
																			title: {
																				text: 'Time'
																			}
																		},
																		yAxis: {
																			title: {
																				text: parameter.unit
																			}
																		},
																		credits: {
																			enabled: false
																		},
																		legend: {
																			enabled: false
																		},
																		tooltip: {
																			pointFormat: '<span style="color:{point.color}">' + (parameter.key === 'temperature' || parameter.key === 'humidity' || parameter.key === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b>' + parameter.unit + '<br/>'
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
																			data: rain_value
																		}]
																	};
																	graph_data.push(archive_data_graph_config_rain);
																});

																archive_data_graph_configs = {
																	chart: {
																		zoomType: 'x',
																		height: 400
																	},
																	title: {
																		text: parameter.name,
																		useHTML: true
																	},

																	xAxis: {
																		type: 'datetime'
																	},

																	yAxis: {
																		title: {
																			text: parameter.unit
																		}
																	},

																	tooltip: {
																		crosshairs: true,
																		shared: true,
																		valueSuffix: parameter.unit
																	},

																	series: [{
																		name: 'Average',
																		data: averages,
																		zIndex: 1,
																		color: this.graph_colors[j],
																		marker: {
																			radius: 0,
																			fillColor: this.graph_fill_color[j],
																			lineWidth: 2,
																			lineColor: this.graph_colors[j]
																		}
																	}, {
																		name: 'Min - Max Range',
																		data: ranges,
																		type: "arearange",
																		lineWidth: 0,
																		linkedTo: ':previous',
																		color: this.graph_colors[j],
																		fillOpacity: 0.3,
																		zIndex: 0
																	}]
																};

																parameter_graphs.push(<div>
																	<div className="archive-graph-container" key={j}>
																		{(() => {
																			if (parameter.key == 'hourly_aqi' && graph_data_hourly_aqi && graph_data_hourly_aqi.length) {
																				let hourly_aqi_bar_graph = graph_data_hourly_aqi.map((graph_config) => {
																					return <ReactHighcharts config={graph_config} />
																				});
																				return hourly_aqi_bar_graph;
																			}else if (parameter.key == 'rain' && graph_data.length) {
																				let rain_bar_graph = graph_data.map((graph_config) => {
																					return <ReactHighcharts config={graph_config} />
																				});
																				return rain_bar_graph;
																			} else {
																				return <ReactHighcharts config={archive_data_graph_configs} />
																			}
																		})()}
																	</div>
																</div>)
															}
														}

													});
												}
											} else {
												parameter_graphs.push(<div className="error-msg-no-data">{'No data available for the city'}</div>);
											}
											custom_report.push(
												<div>
													{parameter_graphs}
												</div>
											);
									} else {
										custom_report.push(<div className="error-msg-no-data">{'No Data available at this time duration'}</div>);
									}
								}
								
								if(this.props.gridVisible && this.props.data_type == 'avg') {
									if (this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length) {
										if (this.props.archive_data.station_parameters && Object.keys(this.props.archive_data.station_parameters).length && this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length) {
											// this.props.archive_data.station_parameters = this.props.archive_data.station_parameters.filter(function(param){ 
											// 	return param.key != 'wind_rose';
											// });
											// this.props.archive_data.station_parameters = this.props.archive_data.station_parameters.filter(function(param){ 
											// 	return param.key != 'pollution_rose';
											// });
											if (this.props.archive_data.city_data && Object.keys(this.props.archive_data.city_data).length && this.props.archive_data.station_parameters && Object.keys(this.props.archive_data.station_parameters).length && this.props.archive_data.city_data[station_params[0]] != null) {
												custom_report.push(
													<div className="archive-table-container">
														<table className="table table-stripped table-hover table-bordered">
															<thead>
																{(() => {
																	// console.log('hiiiiiii', this.props.archive_data.station_parameters);
																	let parameters_to_be_shown;
																	if (this.props.archive_data.station_parameters) {
																		parameters_to_be_shown = this.props.archive_data.station_parameters.map((parameter, i) => {
																			if (parameter.key == 'wind_rose') {
																				return null
																			} else if (parameter.key == 'pollution_rose') {
																				return null
																			} else {
																				// console.log(parameter);
																				return(
																					<th dangerouslySetInnerHTML={{__html: parameter.name}} key={i}></th>
																				);
																			}
																		});
																	}
																	return(
																		<tr>
																			<th>Date & Time</th>
																			{parameters_to_be_shown}
																		</tr>
																	);
																})()}
															</thead>
															{(() => {
																let archive_data_rows = [], parameter_units_to_be_shown, table_avg_min_max;
																if (this.props.archive_data.station_parameters) {
																	parameter_units_to_be_shown = this.props.archive_data.station_parameters.map((param, i) => {
																			if (param.key == 'wind_rose') {
																				return null
																			} else if (param.key == 'pollution_rose') {
																				return null
																			} else {
																				// console.log(parameter);
																				return(
																					<th dangerouslySetInnerHTML={{__html: param.unit}} key={i}></th>
																				);
																			}
																	});
																}
																if (this.props.archive_data.station_parameters) {
																	table_avg_min_max = this.props.archive_data.station_parameters.map((param_key, i) => {
																		if (param_key.key == 'hourly_aqi') {
																			return <td style={{padding: 0}} key={i}>
																				<div className="data-aqi">
																					<div>AQI</div>
																					<div>Major Pollutant</div>
																				</div>
																			</td>
																		} else if (param_key.key == 'wind_rose') {
																			return null
																		} else if (param_key.key == 'pollution_rose') {
																			return null
																		} else if (param_key.key == 'rain') {
																			return <td style={{padding: 0}} key={i}>
																				<div className="data-rain">
																					Aggregated
																				</div>
																			</td>
																		} else {
																			return <td style={{padding: 0}} key={i}>
																				<div className="data-avg-min-max">
																					<div>Avg.</div>
																					<div>Min.</div>
																					<div>Max.</div>
																				</div>
																			</td>
																		}
																	});
																}

																archive_data_rows.push(
																	<tr>
																		<th>hh:mm dd mm yyyy to hh:mm dd mm yyyy</th>
																		{parameter_units_to_be_shown}
																	</tr>
																);

																archive_data_rows.push(
																	<tr>
																		<td>&nbsp;</td>
																		{table_avg_min_max}
																	</tr>
																);

																if (this.props.avg_data_time_aura) {
																	let param_values;
																	/*if (this.props.archive_data.param_values.length !== ) {
																		console.log(this.props.archive_data.param_values.length);
																	}*/
																	if (this.props.archive_data.station_parameters && Object.keys(this.props.archive_data.station_parameters).length && this.props.archive_data.city_data[station_params[0]] && this.props.archive_data.city_data[station_params[0]].length) {
																		let from_time_grid, upto_time_grid, upto_time_state;
																		for (var i = 0; i < this.props.archive_data.city_data[station_params[0]].length; i++) {
																			from_time_grid = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration * i).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																			upto_time_grid = moment.unix(this.props.archive_data.start_time + this.props.archive_data.duration * (i + 1)).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																			upto_time_state = moment.unix(this.props.archive_data.upto_time).tz('Asia/Kolkata').format('HH:mm - DD MMM YYYY');
																			// console.log('upto_time_grid1', this.props.archive_data.start_time + this.props.archive_data.duration);
																			if ((this.props.archive_data.start_time + this.props.archive_data.duration * (i + 1)) > this.props.archive_data.upto_time) {
																				upto_time_grid = upto_time_state;
																			}
																			// console.log('upto_time_grid', this.props.archive_data.upto_time);
																			param_values = this.props.archive_data.station_parameters.map((parameter, j) => {
																				let responsible_param
																				if (this.props.archive_data.city_data['hourly_aqi']) {
																					if (this.props.archive_data.city_data['hourly_aqi'][i]) {
																						if (this.props.archive_data.city_data['hourly_aqi'][i].param === "" || this.props.archive_data.city_data['hourly_aqi'][i].param === null) {
																							responsible_param = 'NA';
																						} else {
																							responsible_param = this.props.archive_data.city_data['hourly_aqi'][i].param;
																						}
																					}
																				}
																				if (this.props.archive_data.city_data[parameter.key]) {
																					let avg,
																						round = (parameter.key == 'co') ? 10000 : 100;
																					if (this.props.archive_data.city_data[parameter.key][i]) {
																						if (this.props.archive_data.city_data[parameter.key][i].avg === null) {
																							avg = 'NA';
																						} else {
																							avg = Math.round(this.props.archive_data.city_data[parameter.key][i].avg * round) / round;
																						}
																						let min;
																						if (this.props.archive_data.city_data[parameter.key][i].min === null) {
																							min = 'NA';
																						} else {
																							min = Math.round(this.props.archive_data.city_data[parameter.key][i].min * round) / round;
																						}
																						let max;
																						if (this.props.archive_data.city_data[parameter.key][i].max === null) {
																							max = 'NA';
																						} else {
																							max = Math.round(this.props.archive_data.city_data[parameter.key][i].max * round) / round;
																						}
																						if (parameter.key == 'hourly_aqi') {
																							return <td key={j}>
																								<div className="data-aqi">
																									<div>{avg}</div>
																									<div>{responsible_param}</div>
																								</div>
																							</td>;
																						} else if (parameter.key == 'wind_rose') {
																							return null;
																						} else if (parameter.key == 'pollution_rose') {
																							return null;
																						} else if (parameter.key == 'rain') {
																							return <td key={j}>
																								<div className="data-rain">{avg}</div>
																							</td>;
																						} else {
																							return <td key={j}>
																								<div className="data-avg-min-max">
																									<div>{avg}</div>
																									<div>{min}</div>
																									<div>{max}</div>
																								</div>
																							</td>;
																						}
																					}
																				}
																			});

																			archive_data_rows.push(
																				<tr>
																					<td>{from_time_grid} to {upto_time_grid}</td>
																					{param_values}
																				</tr>
																			);
																		}
																	}
																}

																return(
																	<tbody>
																		{archive_data_rows}
																	</tbody>
																);
															})()}
														</table>
													</div>
												);
											}
										} else {
											custom_report.push(<div className="error-msg-no-data">{'No data available for the city'}</div>);
										}
									}
								}
							} else {
								custom_report.push(<div className="error-msg-no-data">{'No Data available at this time duration'}</div>);
							}

						}

						return(
							<div>
								{custom_report}
							</div>
						);
					}
				}
			})()}
			
			</div>
		</div>
	}
}