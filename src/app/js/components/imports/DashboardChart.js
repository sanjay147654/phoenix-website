import React from 'react';
import moment from 'moment-timezone';
import _ from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input, DatePicker } from 'antd';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

const { RangePicker } = DatePicker;

let map = null,
	marker = null,
	marker1 = null,
	infowindow = null,
	infowindow1 = null,
	vehiclePath = null,
	trafficLayer = null,
	transitLayer = null,
	vehicle_details = '',
	vehicleRouteCoordinates = [];

const { Content, Footer } = Layout;



/**
 * This is the component for creating chart in Dashboard
 */
export default class DashboardChart extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		
		/**
		 * State of the component.
		 * @type {Object}
		 * @param {String} rainfall_type Stores the type of the Rainfall.
		 * @param {String} sump_type_graph Stores the sump type.
		 * @param {String} penstock_type_graph Stores the penstock type.
		 * @param {Number} Major_Road_Junction Stores the ID for the Major Road Junction subcategory.
		 * @param {Number} Street_Sub_House_Front Stores the ID for the Street Sub House Front subcategory.
		 * @param {Number} Rainfall Stores the ID for the Rainfall subcategory.
		 * @param {Number} Open_Canal Stores the ID for the Open Canal subcategory.
		 * @param {Number} Gated_Canal Stores the ID for the Gated Canal subcategory.
		 * @param {Number} Street_Sub_House_Front_water Stores the ID for the Street Sub House Front water subcategory.
		 * @param {Number} Bus Stores the ID for the Bus subcategory.
		 * @param {Number} Pump_Station_Status Stores the ID for the Pump Station Status subcategory.
		 */
		this.state = {
			rainfall_type: 'rainfall',
			sump_type_graph: 'sump_level',
			penstock_type_graph: 'penstock_level',
			Major_Road_Junction: 1,
			Street_Sub_House_Front: 2,
			Rainfall: 3,
			// Pump_Station: 4,
			Open_Canal: 5,
			Gated_Canal: 6,
			// Major_Road_Junction_water: 7,
			Street_Sub_House_Front_water: 7,
			Bus: 9,
			Pump_Station_Status: 4,
			rainfall_sub_id: 11,
			pump_station_2: 12
		};
		
		
		/**
		 * Chart configuration
		 * @type {Object}
		 */
		this.config = null;
		/**
		 * Stores the unit of the parameters
		 * @type {Array}
		 */
		this.unit_array = [];
		/**
		 * Stores the type of the pump.
		 * @type {Array}
		 */
		this.type_configure = [];
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
		// console.log('this.props: ', this.props);
	}
	/**
	 * This function sets the type of the chart.
	 * @param {string} key          it has the type which is to be set
	 * @param {Number} sub_category ID of the subcategory
	 */
	setType(key, sub_category) {
		if (key === 'type') {
			if (sub_category == this.state.Major_Road_Junction || sub_category == this.state.Pump_Station || sub_category == this.state.Open_Canal || sub_category == this.state.Gated_Canal || sub_category == this.state.Major_Road_Junction_water || sub_category == this.state.Street_Sub_House_Front_water || sub_category == this.state.Pump_Station_Status || sub_category == this.state.pump_station_2 || sub_category == this.state.rainfall_sub_id) {
				let a = 'area';
				// console.log('ser type', a);
				return a;
			} else if (sub_category == this.state.Rainfall) {
				let a = 'column';
				// console.log('ser type', a);
				return a;
			} else if (sub_category == this.state.Street_Sub_House_Front) {
				let a = 'line';
				// console.log('ser type', a);
				return a;
			}
		}
	}

	/**
	 * This function sets the datas for the charts or Map.
	 * @param {string} key It stores the type whose data is to be sent.
	 */
	setData(key) {
		// console.log('graph key', key);
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
			sump_graph_unit = '',
			penstock_graph_unit = '',
			yaxis_text;
		this.type_configure = [];
		if (this.props.details && Object.values(this.props.details).length && this.props.details.parameters && this.props.details.parameters.length) {
			this.err_msg = false;
			if (this.props.details.sub_category == this.state.Rainfall) {
				this.props.details.parameters.map((data) => {
					
					if (data.values && data.values.length) {
						data.values.map((runhour, index) => {
							data_rain.push([runhour.timestamp*1000, parseFloat(runhour.value)]);
						});
					}
				});
				yaxis_text = data.unit;
			} else if (this.props.details.sub_category == this.state.Major_Road_Junction || this.props.details.sub_category == this.state.Street_Sub_House_Front) {
				this.unit_array = [];
				this.props.details.parameters.map((data) => {
					if (data.values && data.values.length) {
						data.values.map((runhour, index) => {
							if (data_new[data.name]) {
								data_new[data.name].push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							} else {
								data_new[data.name] = [];
								data_new[data.name].push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							}
						});
						this.unit_array.push(data.unit);
					}
				});
				yaxis_text = '';
			} else if (this.props.details.sub_category == this.state.Pump_Station || this.props.details.sub_category == this.state.Gated_Canal) {
				this.props.details.parameters.map((data) => {
					
					if (data.values && data.values.length) {
						data.values.map((runhour, index) => {
							if (data_new[data.name]) {
								data_new[data.name].push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							} else {
								data_new[data.name] = [];
								data_new[data.name].push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							}
						});
					}
					yaxis_text_array.push(data.unit);
				});
			} else if (this.props.details.sub_category == this.state.Pump_Station_Status || this.props.details.sub_category == this.state.pump_station_2) {
				this.props.details.parameters.map((data) => {
				// console.log('this.state.rainfall_type', data.type);
					if (data.values && data.values.length) {
						if (!data.type || (data.type && data.type != this.state.rainfall_type && data.type != this.state.sump_type_graph && data.type != this.state.penstock_type_graph)) {
							// console.log('type_configure', data.values);
							if (isNaN(data.values[data.values.length - 1]['value'])) {
								this.type_configure.push('configured');
							} else {
								this.type_configure.push('unconfigured');
							}
						}
						if (data.type != this.state.rainfall_type && data.type != this.state.sump_type_graph && data.type != this.state.penstock_type_graph) {
							data.values.map((runhour, index) => {
								if (data_new[data.name]) {
									data_new[data.name].push({x: runhour.timestamp*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : parseFloat(runhour.value)), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : parseFloat(runhour.value)) });
								} else {
									data_new[data.name] = [];
									data_new[data.name].push({x: runhour.timestamp*1000, y: runhour.value == 'ON' ? 1 : (runhour.value == 'OFF' ? 0 : parseFloat(runhour.value)), val: runhour.value == 'ON' ? 'ON' : (runhour.value == 'OFF' ? 'OFF' : parseFloat(runhour.value)) });
								}
							});
						} else if (data.type == this.state.rainfall_type) {
							data.values.map((runhour, index) => {
								data_rain.push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							});
							yaxis_text = data.unit;
						} else if (data.type == this.state.sump_type_graph) {
							// console.log('data sump', data);
							data.values.map((runhour, index) => {
								data_sump.push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							});
							sump_graph_name = data.name;
							sump_graph_unit = data.unit;
						} else if (data.type == this.state.penstock_type_graph) {
							// console.log('data sump', data);
							data.values.map((runhour, index) => {
								data_penstock.push([runhour.timestamp*1000, parseFloat(runhour.value)]);
							});
							penstock_graph_name = data.name;
							penstock_graph_unit = data.unit;
						}
					}
				});
				// console.log('data_newwww', data_new);
				
			} else if (this.props.details.sub_category == this.state.Open_Canal || this.props.details.sub_category == this.state.Major_Road_Junction_water || this.props.details.sub_category == this.state.Street_Sub_House_Front_water|| this.props.details.sub_category == this.state.rainfall_sub_id) {
				this.props.details.parameters.map((data) => {
					if (data.values && data.values.length) {
						data.values.map((runhour, index) => {
							data_new_arr.push([runhour.timestamp*1000, parseFloat(runhour.value)]);
						});
					}
				});
				if (this.props.details.sub_category == this.state.rainfall_sub_id) {
					yaxis_text = this.props.details.parameters[0].unit;
				} else {
					yaxis_text = 'm';
				}
			} if (key == 'series' && this.props.details.sub_category == this.state.Rainfall) {
				series = [
					{
						'name': 'Rainfall',
						'data': data_rain,
						'color': this.graph_colors[0],
						fillColor: this.graph_fill_color[0],
						lineColor: this.graph_colors[0]
					}
				];
				return series;
			} else if (key == 'series' && (this.props.details.sub_category == this.state.Major_Road_Junction || this.props.details.sub_category == this.state.Street_Sub_House_Front)) {
				series = data_new;
				return series;
			} else if (key == 'series' && ((this.props.details.sub_category == this.state.Pump_Station_Status) || (this.props.details.sub_category == this.state.pump_station_2))) {
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
				return series;
			} else if (key == 'series' && (this.props.details.sub_category == this.state.Pump_Station)) {
				series = [
					{	
						'color': this.graph_colors[0],
						'name': 'Penstock',
						'data': data_new['Penstock'],
						fillColor: this.graph_fill_color[0],
						lineColor: this.graph_colors[0]
					}, {
						'color': this.graph_colors[1],
						'name': 'Sump',
						'data': data_new['Sump'],
						fillColor: this.graph_fill_color[1],
						lineColor: this.graph_colors[1]
					}
				];
				return series;
			} else if (key == 'series' && (this.props.details.sub_category == this.state.Open_Canal || this.props.details.sub_category == this.state.Major_Road_Junction_water || this.props.details.sub_category == this.state.Street_Sub_House_Front_water|| this.props.details.sub_category == this.state.rainfall_sub_id)) {
				series = data_new_arr;
				return series;
			} else if (key == 'series' && (this.props.details.sub_category == this.state.Gated_Canal)) {
				let temp_name = [];
				if (data_new && Object.values(data_new).length) {
					Object.keys(data_new).map((name_level,index) => {
						temp_name.push(name_level);
						series.push({
							'color': this.graph_colors[index],
							'name': name_level,
							'data': data_new[name_level],
							fillColor: this.graph_fill_color[index],
							lineColor: this.graph_colors[index]
						})
					});

				}
				/*series = [
					{
						'color': this.graph_colors[0],
						'name': temp_name[0],
						'data': data_new[temp_name[0]],
						fillColor: this.graph_fill_color[0],
						lineColor: this.graph_colors[0]
					}, {
						'color': this.graph_colors[1],
						'name': temp_name[1],
						'data': data_new[temp_name[1]],
						fillColor: this.graph_fill_color[1],
						lineColor: this.graph_colors[1]
					}
				];*/
				return series;
			} else if (key == 'yaxis_text' && this.props.details.sub_category == this.state.Gated_Canal) {
				return yaxis_text_array;
			} else if (key == 'yaxis_text' && this.props.details.sub_category != this.state.Gated_Canal) {
				return yaxis_text;
			}
		} else {
			this.err_msg = true;
		}
	}

	/**
	 * Predefined function of React.js
	 * Here we are calling the function to initialise the map.
	 * @return {void} 
	 */
	componentDidMount() {
		
		if (document.getElementById('popup_map')) {
			console.log('this.props.details.parameters: ', this.props.details.parameters);
			if (this.props.details.parameters && this.props.details.parameters.length) {
				this.props.details.parameters.map((param) => {
					vehicleRouteCoordinates = [];
					if (param.name == 'Coordinate' && param.values && param.values.length) {
						param.values.map((data) => {
							vehicleRouteCoordinates.push({lat: data.value[0], lng: data.value[1]});
						});
						this.initMap();
					}
				});
			}
		}
	}

	/**
	 * This function sets the average lattitude and longitude.
	 * @param  {Array} coordinates Array of coordinates
	 * @return {Object}             Avrage lattitude and longitude.
	 */
	centerCoordinates(coordinates) {
		// console.log('cooooo', coordinates);
		let c = 0,
			lat = 0,
			lng = 0;
		coordinates.forEach((lat_lng) => {
			lat = lat + lat_lng.lat;
			lng = lng + lat_lng.lng;
			c++;
		});
		// console.log('cooooo', lat);
		// console.log('cooooo', lng);
		// console.log('cooooo', {lat: lat / c, lng: lng / c});
		return {lat: lat / c, lng: lng / c};
	}

	/**
	 * This function initialises the map.
	 * @return {void} 
	 */
	initMap() {
		// console.log('init: ', vehicleRouteCoordinates);
		let coordinates = {lat: vehicleRouteCoordinates[0][0], lng: vehicleRouteCoordinates[0][1]};
		//this.transitionProcess(coordinates);
		map = new google.maps.Map(document.getElementById('popup_map'), {
			zoom: 11,
			center: this.centerCoordinates(vehicleRouteCoordinates),
			styles: [{"stylers":[{"saturation":"32"},{"lightness":"-3"},{"visibility":"on"},{"weight":"1.18"}]},{"featureType":"landscape.man_made","stylers":[{"saturation":"-70"},{"lightness":"14"}]},{"featureType":"water","stylers":[{"saturation":"100"},{"lightness":"-14"}]},{"featureType":"water","elementType":"labels","stylers":[{"lightness":10}]}]
		});
		let content_start = '<div class="vehicle-marker">Started</div>';
		let content_stop = '<div class="vehicle-marker">Stopped</div>';
		infowindow1 = new google.maps.InfoWindow({
			content: content_start
		});
		infowindow = new google.maps.InfoWindow({
			content: content_stop
		});

		marker = new google.maps.Marker({
			position: vehicleRouteCoordinates.length ? vehicleRouteCoordinates[vehicleRouteCoordinates.length - 1] : null,
			map: map,
			title: 'Vehicle',
			icon: 'https://prstatic.phoenixrobotix.com/imgs/cems_admin_panel/markers/vendor/offline_marker.png'
		});

		marker1 = new google.maps.Marker({
			position: vehicleRouteCoordinates.length ? vehicleRouteCoordinates[0] : null,
			map: map,
			title: 'Vehicle',
			icon: 'https://prstatic.phoenixrobotix.com/imgs/cems_admin_panel/markers/vendor/online_marker.png'
		});


		marker.addListener('click', function() {
			infowindow.open(map, marker);
			infowindow1.close();
		});
		marker1.addListener('click', function() {
			infowindow1.open(map, marker1);
			infowindow.close();
		});

		vehiclePath = new google.maps.Polyline({
			path: vehicleRouteCoordinates.length ? vehicleRouteCoordinates : [],
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		vehiclePath.setMap(map);

		trafficLayer = new google.maps.TrafficLayer();
		trafficLayer.setMap(map);

		transitLayer = new google.maps.TransitLayer();
		transitLayer.setMap(map);
	}

	/**
	 * Predefined function used to compare between current and next props.
	 * @param  {Object} nextProps 
	 * @return {Boolean}           
	 */
	shouldComponentUpdate(nextProps) {
		if (((nextProps.details && nextProps.details.length && this.props.details && this.props.details.length && !_.isEqual(nextProps.details,this.props.details)) || this.props.range_out_of_bounds != nextProps.range_out_of_bounds)/* || nextProps.from_time != this.props.from_time || nextProps.upto_time != this.props.upto_time*/) {
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
		return <Layout className="mobile-hide" id="24hr_trend">
			{(() => {
				//console.log('graph_data', this.props.details);
				if (this.props.details && Object.values(this.props.details).length && this.props.details.parameters && this.props.details.parameters.length) {
					let data_new = {},
					data_new_new = {},
					timestamp = [],
					yaxis_text;
					// let graph_data=[];
					if (this.props.details.sub_category != this.state.Bus) {
						data_new = this.setData('series');
						timestamp = this.setData('timestamp');
						yaxis_text = this.setData('yaxis_text');
						// graph_data.push([1526790143 * 1000, 0]);
						// console.log('graph_data', data_new);
						// console.log('graph_data time', timestamp);
						let config = [],
						 property = this.props.details;
						let chart_type = this.setType('type', this.props.details.sub_category);
						if (this.props.details.sub_category == this.state.Rainfall || this.props.details.sub_category == this.state.Pump_Station || this.props.details.sub_category == this.state.Gated_Canal) {
							if ((this.props.details.sub_category == this.state.Rainfall && data_new[0].data && data_new[0].data.length) || ((this.props.details.sub_category == this.state.Pump_Station || this.props.details.sub_category == this.state.Gated_Canal) && ((data_new[0] && data_new[0].data && data_new[0].data.length)))) {
								let chart_value = {},
								 x_axis = {},
								 tooltip = {};
								if (this.props.details.sub_category == this.state.Rainfall) {
									chart_value = {
										backgroundColor: '#FFFFFF',
										type: chart_type,
										height: 300,
									};
									x_axis = {
										type: 'datetime',
										// categories: timestamp,
										title: {
											text: '',
											align: 'middle'
										},
										tickmarkPlacement: 'on'
									};
									tooltip = {
										formatter: function () {
											return '<span class="tooltip-rainfall">' + (moment.unix(this.x/1000).tz("Asia/Kolkata").format('DD') == moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('DD') ? moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH'): moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH')) + '</span><br/>' + property.parameters[0].name + ': <b>' + this.y.toFixed(2) + ' ' + property.parameters[0].unit + '</b>';
										},
										useHTML: true
										/*pointFormat: property.parameters[0].name + ': <b>{point.y} ' + property.parameters[0].unit + '</b>'*/
									};
								} else {
									chart_value = {
										backgroundColor: '#FFFFFF',
										type: chart_type,
										height: 280,
										zoomType: 'x',
									};
									x_axis = {
										type: 'datetime',
										// categories: timestamp,
										title: {
											text: '',
											align: 'middle'
										},
									};
									// console.log('data y', yaxis_text);
									tooltip = {
										pointFormat: '<span class="graph-tooltip-param-name-{series.name}"><b>{series.name}</b></span>: <b>{point.y}</b><br/>',
										valueSuffix: ' ' + yaxis_text[0],
										shared: true,
										crosshairs: true,
										useHTML: true
									};
								}
								let options = {
									chart: chart_value,
									title: {
										text: this.props.details.sub_category == this.state.Rainfall ? this.props.details.parameters[0].name : ''
									},
									xAxis: x_axis,
									yAxis: {
										title: {
											text: yaxis_text
										}
									},
									tooltip: tooltip,
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
											borderWidth: 0,
											groupPadding: 0,
											pointPadding: 0.2,
											maxPointWidth: 40,
											minPointLength: 1
										},
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
											threshold: null
										}
									},
									series: data_new,
										
								};
								config.push(options);
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									{(() => {
										if (config && config.length) {
											let chart_config = config.map((point,index)=>{
												// console.log('point', point);
													if (this.props.details.sub_category == this.state.Rainfall) {
														return <div className="details-container">
															<div className="param-value">{this.props.details.parameters[0].total}<span className="unit-param">{' ' + this.props.details.parameters[0].unit}</span></div>
															<div className="label-name">Total</div>
															{(() => {
																if (this.props.details.parameters[0].total != 0) {
																	return <div><div className="param-value">{this.props.details.parameters[0].min_value}<span className="unit-param">{' ' + this.props.details.parameters[0].unit}</span></div><div className="time-param">{(moment.unix(this.props.details.parameters[0].min_value_time - 3600).tz("Asia/Kolkata").format('DD') == moment.unix(this.props.details.parameters[0].min_value_time).tz("Asia/Kolkata").format('DD') ? moment.unix(this.props.details.parameters[0].min_value_time - 3600).tz("Asia/Kolkata").format('HH:mm') + ' - ' + moment.unix(this.props.details.parameters[0].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM') : moment.unix(this.props.details.parameters[0].min_value_time - 3600).tz("Asia/Kolkata").format('HH:mm, DD MMM') + ' - ' +moment.unix(this.props.details.parameters[0].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'))}</div>
																		<div className="label-name">Minimum</div>
																		<div className="param-value">{this.props.details.parameters[0].max_value}<span className="unit-param">{' ' + this.props.details.parameters[0].unit}</span></div><div className="time-param">{(moment.unix(this.props.details.parameters[0].max_value_time - 3600).tz("Asia/Kolkata").format('DD') == moment.unix(this.props.details.parameters[0].max_value_time).tz("Asia/Kolkata").format('DD') ? moment.unix(this.props.details.parameters[0].max_value_time - 3600).tz("Asia/Kolkata").format('HH:mm') + ' - ' + moment.unix(this.props.details.parameters[0].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM') : moment.unix(this.props.details.parameters[0].max_value_time - 3600).tz("Asia/Kolkata").format('HH:mm, DD MMM') + ' - ' + moment.unix(this.props.details.parameters[0].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'))}</div>
																		<div className="label-name">Maximum</div>
																	</div>
																}
															})()}
															
														</div>;
													} else if (this.props.details.sub_category == this.state.Pump_Station || this.props.details.sub_category == this.state.Gated_Canal) {
														return <Col span={24}>
															<Row className="back-transparant">
																<Col className="back-transparant">
																	<Row className="white">
																		<Row className="pump-graph no-border" type="flex" justify="space-between">
																			<Col span={18}>
																				<div className="center bold" dangerouslySetInnerHTML={{__html:this.props.details.parameters[index].name}}>
																					{/*<sub>2.5</sub>*/}
																				</div>
																				<ReactHighcharts config={point} ref="chart"></ReactHighcharts>
																			</Col>
																			<Col span={5}>
																				<Row type="flex" justify="center" className="border-bot center">
																					<Col span={12}>
																						<div>
																							<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[index].min_value) && this.props.details.parameters[index].min_value >= 0) && this.props.details.parameters[index].min_value != null ? this.props.details.parameters[index].min_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[index].min_value) && this.props.details.parameters[index].min_value >= 0) && this.props.details.parameters[index].min_value != null && this.props.details.parameters[index].min_value != 'NA' ? (' ' + this.props.details.parameters[index].unit): ''}
																						</div>
																						<div>{moment.unix(this.props.details.parameters[index].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																						<div className="value-name">Minimum</div>
																					</Col>
																				</Row>
																				<Row type="flex" justify="center" className="border-bot center">
																					<Col span={12}>
																						<div>
																							<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[index].max_value) && this.props.details.parameters[index].max_value >= 0) && this.props.details.parameters[index].max_value != null ? this.props.details.parameters[index].max_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[index].max_value) && this.props.details.parameters[index].max_value >= 0) && this.props.details.parameters[index].max_value != null && this.props.details.parameters[index].max_value != 'NA' ? (' ' + this.props.details.parameters[index].unit): ''}
																						</div>
																						<div>{moment.unix(this.props.details.parameters[index].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																						<div className="value-name">Maximum</div>
																					</Col>
																				</Row>
																			</Col>
																		</Row>
																	</Row>
																</Col>
															</Row>
														</Col>;
													}
												{/*<Col className="white" span={7}>
													<Row>
														<div className="hed mar-20">Latest Events</div>
														<div className="center event-container">No latest events found.</div>
													</Row>
												</Col>*/}
											});
											return chart_config;
										}		
									})()}
								</Row>;
							} else if (this.err_msg == true) {
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">Station Not Configured!</div>
									</Row>
								</Row>;
							} else {
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
									</Row>
								</Row>;
							}
						} else if (this.props.details.sub_category == this.state.Major_Road_Junction || this.props.details.sub_category == this.state.Street_Sub_House_Front) {
							if(data_new && Object.keys(data_new).length){
								Object.keys(data_new).map((point, index)=>{
									let options = {
										chart:{
											backgroundColor: '#FFFFFF',
											type: 'area',
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
											/*formatter: function () {
												return '<b>' + Math.trunc(this.y) + ' ' + (point == 'Humidity' ? ' %' : (point == 'PM<sub>2.5</sub>' ? ' ppm' : (point == 'PM<sub>10</sub>' ? ' ppm' : ' °C')))  + '</b> on <b>' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH:mm, DD MMM') + '</b>';
											},
											borderRadius: 1,*/
											pointFormat: point + ': <b>{point.y}' + (this.unit_array && this.unit_array[index] ? (' ' + this.unit_array[index]) : '') + '</b>',
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
										},
										series: [{
											color: this.graph_colors[index],
											data: data_new[point],
											showInLegend: false,
											fillColor: this.graph_fill_color[index],
											lineColor: this.graph_colors[index]
										}]
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
														<Row className={'white' + (index > 0 ? ' mar-top-35' : '')}>
															<Row className="pump-graph no-border">
																<Col span={24}>
																	<div className="center bold" dangerouslySetInnerHTML={{__html:this.props.details.parameters[index].name}}>
																		{/*<sub>2.5</sub>*/}
																	</div>
																	<ReactHighcharts config={point} ref="chart"></ReactHighcharts>
																</Col>
															</Row>
															<Row type="flex" justify="center" className="center pad-bot">
																<Col span={5}>
																	<div className="value-name">Average</div>
																	<div>
																		<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[index].avg_value) && this.props.details.parameters[index].avg_value >= 0) && this.props.details.parameters[index].avg_value != null ? this.props.details.parameters[index].avg_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[index].avg_value) && this.props.details.parameters[index].avg_value >= 0) && this.props.details.parameters[index].avg_value != null && this.props.details.parameters[index].avg_value != 'NA' ? (' ' + this.props.details.parameters[index].unit): ''}
																	</div>
																</Col>
																<Col span={5}>
																	<div className="value-name">Minimum</div>
																	<div>
																		<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[index].min_value) && this.props.details.parameters[index].min_value >= 0) && this.props.details.parameters[index].min_value != null ? this.props.details.parameters[index].min_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[index].min_value) && this.props.details.parameters[index].min_value >= 0) && this.props.details.parameters[index].min_value != null && this.props.details.parameters[index].min_value != 'NA' ? (' ' + this.props.details.parameters[index].unit): ''}
																	</div>
																	<div>{moment.unix(this.props.details.parameters[index].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																</Col>
																<Col span={5}>
																	<div className="value-name">Maximum</div>
																	<div>
																		<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[index].max_value) && this.props.details.parameters[index].max_value >= 0) && this.props.details.parameters[index].max_value != null ? this.props.details.parameters[index].max_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[index].max_value) && this.props.details.parameters[index].max_value >= 0) && this.props.details.parameters[index].max_value != null && this.props.details.parameters[index].max_value != 'NA' ? (' ' + this.props.details.parameters[index].unit): ''}
																	</div>
																	<div>{moment.unix(this.props.details.parameters[index].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																</Col>
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
							else {
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
									</Row>
								</Row>;
							}
						} else if (this.props.details.sub_category == this.state.Pump_Station_Status || this.props.details.sub_category == this.state.pump_station_2) {
							let type_configure = this.type_configure;
							let name_pump = [],
								status_pump = [];
							// console.log('type_configure', type_configure);
							if(data_new && Object.keys(data_new).length && data_new.data_new && Object.keys(data_new.data_new).length){
								// console.log('data sump', data_new);
								Object.keys(data_new.data_new).map((point_new, index)=>{
									name_pump.push(point_new);
									if (this.props.pump_current_status && Object.keys(this.props.pump_current_status).length) {
										Object.keys(this.props.pump_current_status).map((pump_status) => {
											if (pump_status == point_new) {
												status_pump.push(this.props.pump_current_status[pump_status]);
											}
										});
									}
									// console.log('status_pump', status_pump);
									let options = {
										chart:{
											backgroundColor: '#FFFFFF',
											type: chart_type,
											height: 100,
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
											labels: {
												formatter: function () {
													let label = this.value;
													// console.log(this.value)
													// this.axis.defaultLabelFormatter.call(this);
													if (type_configure[index] == 'configured') {
														if (label == 0) {
															return '<span style="fill: red;">' + 'OFF' + '</span>';
														} else if (label == 1.2) {
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
									return <Row className="pump-graph">
										<Row className="margin-bottom-30 mar-20">
											<Col className="bold" span={2}>
												{name_pump[index]}
											</Col>
											<Col className={(status_pump[index] == 'ON' ? ' success' : (status_pump[index] == 'OFF' ? ' danger' : ''))} span={1}>
												{status_pump[index]}
											</Col>
										</Row>
										<Row className="pad-left-25">
											<Col>
												<ReactHighcharts config={point} ref="chart"></ReactHighcharts>
											</Col>
										</Row>
									</Row>;
								});
							} else {
								chart_config_pump = <div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>;
							}
							if (this.props.details && Object.values(this.props.details).length && this.props.details.parameters && this.props.details.parameters.length) {
								// console.log('penstock_value', this.props.penstock_value);
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Col span={24}>
										<Row className="back-transparant">
											<Col className="back-transparant">
												{(() => {
													if (data_new['data_sump'][0]['data'] && data_new['data_sump'][0]['data'].length) {
														return <Row className="white mar-bot-25">
															<div className="hed mar-20">{this.props.from_time && this.props.upto_time ? 'Trend for Sump between ' + this.props.from_time + ' to ' + this.props.upto_time : '24 hours trend for Sump'}</div>
															<div className="sump-graph">
															{(() => {
																if (data_new['data_sump'][0]['data'] && data_new['data_sump'][0]['data'].length) {
																	// console.log('rain sump', data_new['data_sump'][0]['data']);
																	let config =[];
																	let options = {
																		chart: {
																			backgroundColor: '#FFFFFF',
																			type: 'area',
																			height: 100,
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
																		yAxis: {
																			title: {
																				text: data_new['data_sump'][0]['unit']
																			}
																		},
																		tooltip: {
																			formatter: function () {
																				return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_sump'][0]['name'] + ': <b>' + this.y.toFixed(2) + ' ' + data_new['data_sump'][0]['unit'] + '</b>';
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
																				<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>;
																			</div>
																		</div>;
																	}*/
																} else {
																	return <div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
																}
															})()}
																{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
															</div>
														</Row>;
													}
												})()}
												{(() => {
													if (data_new['data_penstock'][0]['data'] && data_new['data_penstock'][0]['data'].length) {
														return <Row className="white mar-bot-25">
															<div className="hed mar-20">{this.props.from_time && this.props.upto_time ? 'Trend for Penstock between ' + this.props.from_time + ' to ' + this.props.upto_time : '24 hours trend for Penstock'}</div>
															<div className="sump-graph">
															{(() => {
																if (data_new['data_penstock'][0]['data'] && data_new['data_penstock'][0]['data'].length) {
																	// console.log('rain sump', data_new['data_sump'][0]['data']);
																	let config =[];
																	let options = {
																		chart: {
																			backgroundColor: '#FFFFFF',
																			type: 'area',
																			height: 100,
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
																		yAxis: {
																			title: {
																				text: data_new['data_penstock'][0]['unit']
																			}
																		},
																		tooltip: {
																			formatter: function () {
																				return '<span class="tooltip-rainfall">' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH:mm') + '</span><br/>' + data_new['data_penstock'][0]['name'] + ': <b>' + this.y.toFixed(2) + ' ' + data_new['data_penstock'][0]['unit'] + '</b>';
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
																				<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>;
																			</div>
																		</div>;
																	}*/
																} else {
																	return <div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
																}
															})()}
																{/*<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>*/}
															</div>
														</Row>;
													}
												})()}
												<Row className="white">
													<div className="hed mar-20">{this.props.from_time && this.props.upto_time ? 'Trend for Pumps between ' + this.props.from_time + ' to ' + this.props.upto_time : '24 hours trend for Pumps'}</div>
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
							else {
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
									</Row>
								</Row>;
							}
						} else if (this.props.details.sub_category == this.state.Open_Canal || this.props.details.sub_category == this.state.Major_Road_Junction_water || this.props.details.sub_category == this.state.Street_Sub_House_Front_water|| this.props.details.sub_category == this.state.rainfall_sub_id) {
							if (data_new && data_new.length) {
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
									yAxis: {
										title: {
											text: this.props.details.parameters[0].unit
										}
									},
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
												<Row className="white">
													<Row className="pump-graph no-border" type="flex" justify="space-between">
														<Col span={18}>
															<div className="center bold" dangerouslySetInnerHTML={{__html:this.props.details.parameters[0].name}}>
																{/*<sub>2.5</sub>*/}
															</div>
															<ReactHighcharts config={options} ref="chart"></ReactHighcharts>
														</Col>
														{(() => {
															if (this.props.details.sub_category == this.state.rainfall_sub_id) {
																let total = 0,
																	min = parseFloat(this.props.details.parameters[0].values[0].value),
																	max = parseFloat(this.props.details.parameters[0].values[0].value),
																	min_at = this.props.details.parameters[0].values[0].timestamp,
																	max_at = this.props.details.parameters[0].values[0].timestamp;
																	this.props.details.parameters[0].values.map((rain_data) => {
																		// console.log('data check min', min);
																		// console.log('data check min timestamp', min_at);
																		// console.log('data check max', max);
																		// console.log('data check max timestamp', min_at);
																		// console.log('data check latest', parseFloat(rain_data.value));
																		// console.log('data check max', max);
																		// console.log('data check timestamp', rain_data.timestamp);
																		total = total + parseFloat(rain_data.value);
																		min_at = (parseFloat(rain_data.value) < min ? rain_data.timestamp : min_at);
																		min = (parseFloat(rain_data.value) < min ? parseFloat(rain_data.value) : min);
																		max_at = (parseFloat(rain_data.value) > max ? rain_data.timestamp : max_at);
																		max = (parseFloat(rain_data.value) > max ? parseFloat(rain_data.value) : max);
																	});
																return <Col span={5}>
																	<Row type="flex" justify="center" className="border-bot center">
																		<Col span={12}>
																			<div>
																				<span className="graph-avg-value">{(!isNaN(total)) && total !== null ? total.toFixed(2) : 'NA'}</span>{(!isNaN(total)) && total != null && total != 'NA' ? (' ' + this.props.details.parameters[0].unit): ''}
																			</div>
																			<div className="value-name">Total</div>
																		</Col>
																	</Row>
																	<Row type="flex" justify="center" className="border-bot center">
																		<Col span={12}>
																			<div>
																				<span className="graph-avg-value">{(!isNaN(min)) && min !== null ? min.toFixed(2) : 'NA'}</span>{(!isNaN(min)) && min != null && min != 'NA' ? (' ' + this.props.details.parameters[0].unit): ''}
																			</div>
																			<div>{moment.unix(min_at).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																			<div className="value-name">Minimum</div>
																		</Col>
																	</Row>
																	<Row type="flex" justify="center" className="border-bot center">
																		<Col span={12}>
																			<div>
																				<span className="graph-avg-value">{(!isNaN(max)) && max !== null ? max.toFixed(2) : 'NA'}</span>{(!isNaN(max)) && max != null && max != 'NA' ? (' ' + this.props.details.parameters[0].unit): ''}
																			</div>
																			<div>{moment.unix(max_at).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																			<div className="value-name">Maximum</div>
																		</Col>
																	</Row>
																</Col>;
															} else {
																return <Col span={5}>
																	<Row type="flex" justify="center" className="border-bot center">
																		<Col span={12}>
																			<div>
																				<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[0].min_value) && this.props.details.parameters[0].min_value >= 0) && this.props.details.parameters[0].min_value != null ? this.props.details.parameters[0].min_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[0].min_value) && this.props.details.parameters[0].min_value >= 0) && this.props.details.parameters[0].min_value != null && this.props.details.parameters[0].min_value != 'NA' ? (' ' + this.props.details.parameters[0].unit): ''}
																			</div>
																			<div>{moment.unix(this.props.details.parameters[0].min_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																			<div className="value-name">Minimum</div>
																		</Col>
																	</Row>
																	<Row type="flex" justify="center" className="border-bot center">
																		<Col span={12}>
																			<div>
																				<span className="graph-avg-value">{(!isNaN(this.props.details.parameters[0].max_value) && this.props.details.parameters[0].max_value >= 0) && this.props.details.parameters[0].max_value != null ? this.props.details.parameters[0].max_value : 'NA'}</span>{(!isNaN(this.props.details.parameters[0].max_value) && this.props.details.parameters[0].max_value >= 0) && this.props.details.parameters[0].max_value != null && this.props.details.parameters[0].max_value != 'NA' ? (' ' + this.props.details.parameters[0].unit): ''}
																			</div>
																			<div>{moment.unix(this.props.details.parameters[0].max_value_time).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</div>
																			<div className="value-name">Maximum</div>
																		</Col>
																	</Row>
																</Col>;

															}
														})()}
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
							} else {
								return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
									</Row>
								</Row>;
							}
						}
					} else {
						return <div id="popup_map"></div>
					}
				} else if (this.props.details === null) {
					return <Loading />;
				} else {
					if (this.props.details && Object.values(this.props.details).length && (!this.props.details.parameters || (this.props.details.parameters && this.props.details.parameters.length == 0))) {

						return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
							<Row className="white error-message">
								<div className="no-data-text">No data available {this.props.from_time && this.props.upto_time ? 'between ' + this.props.from_time + ' to ' + this.props.upto_time : 'for last 24 hours!'}</div>
							</Row>
						</Row>;
					} else {
						return <Row className="contain top-0 back-transparant" type="flex" justify="space-around">
							<Row className="white error-message">
								<div className="no-data-text">Station not configured!</div>
							</Row>
						</Row>;
					}
				}
			})()}
		</Layout>;
	}
}