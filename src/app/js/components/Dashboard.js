import React from 'react';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input, Tooltip, Menu, DatePicker, notification, Alert, Switch } from 'antd';
import { Link } from 'react-router-dom';
import Head from './imports/Head';
import Side from './imports/Side';
import DashboardMap from './imports/DashboardMap';
import DashboardChart from './imports/DashboardChart';
import Loading from './imports/Loading';
import RainfallTrend from './imports/RainfallTrend';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import moment from 'moment-timezone';

const google = window.google;

const Search = Input.Search;

const TabPane = Tabs.TabPane;

const mapMenu = Menu.SubMenu;

const { RangePicker } = DatePicker;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let treeData = [];

function disabledDate(current) {
	// Can not select future dates
	return current && current >= moment().tz('Asia/Kolkata').endOf('day');
}

HighchartsMore(ReactHighcharts.Highcharts);
HighchartsSolidGauge(ReactHighcharts.Highcharts);

const { Content, Footer } = Layout;

const Option = Select.Option;
const queryString = require('query-string');
/*const children = [];
for (let i = 1; i < 12; i++) {
	children.push(<Option key={'Device - ' + i}>{'Device - ' + i}</Option>);
}*/

/**
 * Main component of Real-time page.
 */
export default class Dashboard extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * This stores the parsed data from the query string.
		 * @type {String}
		 */
		this.parsed = queryString.parse(props.location.search);
		console.log('console parsed', this.parsed);
		/**
		 * This stores the parsed from time from the query string.
		 * @type {String}
		 */
		this.from_time = this.parsed.from && this.parsed.upto ? this.parsed.from : null/* moment().tz('Asia/Kolkata').subtract('days', 7).format('DD-MM-YYYY')*/;
		/**
		 * This stores the parsed upto time from the query string.
		 * @type {String}
		 */
		this.upto_time = this.parsed.from && this.parsed.upto ? this.parsed.upto : null/*moment().tz('Asia/Kolkata').format('DD-MM-YYYY')*/;
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @property {Number} pump_station Stores the pump station subcategory id.
		* @property {Number} major_road_junction_air Stores the major_road_junction_air subcategory id.
		* @property {Number} street_sub_house_front_air Stores the street_sub_house_front_air subcategory id.
		* @property {Number} open_canal Stores the open_canal subcategory id.
		* @property {Number} gated_canal Stores the gated_canal subcategory id.
		* @property {Number} street_view_flood Stores the street_view_flood subcategory id.
		* @property {Number} rainfall_sub_id Stores the Rainfall subcategory id.
		* @property {String} penstock_type Stores the Penstock type.
		* @property {String} sump_type Stores the Sump type.
		* @property {Boolean} station_list_visible Stores the boolean value to open and close the station list in the page.
		* @property {Array} value Stores the subcategory/ category of the TreeSelect.
		* @property {Array} category_list Stores the category list from the API.
		* @property {String} station_id Stores the id of the selected station.
		* @property {Number} category_selected Stores the category selected.
		* @property {Array} sub_category_selected Stores the subcategory selected.
		* @property {String} search_station Stores the string to be searched.
		*/
		this.state = {
			show_index: false,
			child_dont_update: false,
			range_out_of_bounds: false,
			from_time: this.from_time/* && this.upto_time && (this.upto_time - this.from_time > 0) ? this.from_time : null*/,
			upto_time: this.upto_time/* && this.from_time && (this.upto_time - this.from_time > 0) ? this.upto_time : null*/,
			range_error: this.from_time && this.upto_time && (moment(this.upto_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix() - moment(this.from_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix() > 0) ? false : true,
			pump_station: 4,
			pump_station_2: 12,
			major_road_junction_air: 1,
			street_sub_house_front_air: 2,
			open_canal: 5,
			gated_canal: 6,
			street_view_flood: 7,
			rainfall_sub_id: 11,
			penstock_type: 'penstock_level',
			sump_type: 'sump_level',
			sump_type_graph: 'sump_graph',
			station_list_visible: true,
			value: [/*'0-0-0'*/],
			closed: true,
			category_list: [],
			station_id: '',
			category_selected: props.location.search ? (props.location.search.split('&')[0].split('=')[0].search('cat') != -1 && props.location.search.split('&')[1] && props.location.search.split('&')[1].search('subcat') != -1 && props.location.search.split('&')[0].split('=')[1] ? props.location.search.split('&')[0].split('=')[1] : 2) : 2,
			sub_category_selected: props.location.search ? (props.location.search.split('&')[0].search('subcat') != -1 ? [] : props.location.search.split('&')[1] && props.location.search.split('&')[1].search('subcat') != -1 ? JSON.parse(props.location.search.split('&')[1].split('=')[1]) : []) : [4],
			history: props.history,

			search_station: props.location.search ? (encodeURI(props.location.search.replace(/\\/g, "\\\\")).split('search').length === 2 ? decodeURI(props.location.search.split('search=')[1]/*.split('%20').join(' ')*/) : '') : '',
			unauthorised_access_list: false,
			unauthorised_access_list_msg: '',
			unauthorised_access_trend: false,
			unauthorised_access_trend_msg: '',
			view_mode: (window.innerWidth >= 1024) ? 'desktop' : 'mobile',
			traffic_map_view: (this.parsed.traffic == 1 ? true : false)
		};

		// console.log('category_selected', this.state.category_selected)
		/*if (this.state.station_id) {
			this.fetchStationData(this.state.station_id);
		}*/

		/**
		 * This sets the default refresh interval to null.
		 */
		this.updateDataInterval = null;
		// this.range_out_of_bounds = false;
	}

	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */

	componentDidUpdate(prevProps, prevState) {
		// console.log('component Updated', prevProps.location.search);
		if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((this.props.match.params.station_id != prevProps.match.params.station_id) || (this.props.match.params.station_id != this.state.station_id)) && this.state.all_stations && this.state.all_stations.length && this.props.history.location.pathname.search('24-hours-trend') > -1) {
			// console.log('in did update', this.props.history.location.pathname);

			if (this.state.all_stations && this.state.all_stations.length && this.state.searched_list) {
				this.state.all_stations.map((data) => {
					if (data.id == this.props.match.params.station_id) {
						if (this.state.sub_category_selected_display.indexOf(data.sub_category) > -1) {
							this.setState({
								station_id: this.props.match.params.station_id
							}, () => {

								if (this.child2) {
									this.child2.dash(this.props.match.params.station_id);
								}
								this.showStationDetails(this.props.match.params.station_id);
								// this.fetchStationData(this.props.match.params.station_id);
								console.log('before get24hourDataRange');
								if ((this.state.from_time === null && this.state.upto_time === null) || (this.state.from_time && this.state.upto_time && (moment(this.state.upto_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix() - moment(this.state.from_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix() > 0))) {
									console.log('after get24hourDataRange');
									this.get24hourDataRange(this.state.from_time, this.state.upto_time, this.props.match.params.station_id);
								}
							});
						} else {
							let query = this.props.history.location.search;
							//this.props.history.push('');
							this.props.history.push('/' + query);
						}
					}
				});
			}
			
		} 
		else if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((prevProps.match.params.station_id != this.props.match.params.station_id) || (this.state.station_id != this.props.match.params.station_id)) && this.state.all_stations && this.state.all_stations.length) {
			// console.log('in did update 1', this.props.history.location.pathname);

			if (this.state.all_stations && this.state.all_stations.length && this.state.searched_list) {
				this.state.all_stations.map((data) => {
					if (data.id == this.props.match.params.station_id) {
						if (this.state.sub_category_selected_display.indexOf(data.sub_category) > -1) {
							this.setState({
								station_id: this.props.match.params.station_id
							}, () => {
								if (this.child2) {
									// console.log('in update child2');
									this.child2.dash(this.props.match.params.station_id);
								}
								this.showStationDetails(this.state.station_id);
							});
						} else {
							let query = this.props.history.location.search;
							// this.props.history.push('');
							this.props.history.push('/' + query);
						}
					}
				});
			}
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/') {
			// console.log('component Updated 123');
			this.setState({
				value: [/*'0-0-0'*/],
				category_selected: this.props.location.search ? (this.props.location.search.split('&')[0].split('=')[0].search('cat') != -1 && this.props.location.search.split('&')[1] && this.props.location.search.split('&')[1].search('subcat') != -1 && this.props.location.search.split('&')[0].split('=')[1] ? this.props.location.search.split('&')[0].split('=')[1] : 2) : 2,
				sub_category_selected: this.props.location.search ? (this.props.location.search.split('&')[0].search('subcat') != -1 ? [] : this.props.location.search.split('&')[1] && this.props.location.search.split('&')[1].search('subcat') != -1 ? JSON.parse(this.props.location.search.split('&')[1].split('=')[1]) : []) : [4],
				station_id: '',
				search_station: this.props.location.search ? (encodeURI(this.props.location.search.replace(/\\/g, "\\\\")).split('search').length === 2 ? decodeURI(this.props.location.search.split('search=')[1]/*.split('%20').join(' ')*/) : '') : '',
			}, () => {
				// console.log('component Updated 1234');
				this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				// console.log('component Updated 12345');
				this.showList();
				this.defaultTreeValue();
				if (this.child2) {
					this.child2.setDash();
				}
			});
		}
	}

	/**
	 * Predefined function of ReactJS. Called before the component unmount.
	 * @return {void} 
	 */

	componentWillUnmount() {
		clearInterval(this.updateDataInterval);
		this.updateDataInterval = null;
	}

	/**
	 * Predefined function of ReactJS. Called after the component is mounted.
	 * @return {void} 
	 */

	componentDidMount() {
		document.title = 'Real-time - Flood Forecasting and Early Warning System for Kolkata City';
		// console.log('in mount');
		
		this.retriveData();
	}

	/**
	 * This function sets the view of the station details box.
	 * @param {Number} st_id Station ID of the station selected.
	 * @param {Boolean} update Sets the flag value to update the map through handleClick function or not.
	 */
	showStationDetails(st_id, update) {
		let option = {};
		if (this.state.all_stations && this.state.all_stations.length) {
			this.state.all_stations.map((station) => {
				if (station.id == st_id) {
					if(station.sub_category == this.state.pump_station || station.sub_category == this.state.pump_station_2) {
						let penstock_value = 'NA1',
							penstock_unit = 'NA',
							sump_value = 'NA1',
							sump_unit = 'NA',
							param_array = [],
							count_on = 0,
							count_off = 0;
						if (station.parameters && station.parameters.length) {
							station.parameters.map((param) => {
								if (param.type == 'penstock_level') {
									penstock_value = param.value;
									penstock_unit = param.unit;
								}
								if (param.type == 'sump_level') {
									sump_value = param.value;
									sump_unit = param.unit;
								}
								if (param.type == 'pump_status') {
									param_array.push(param);
								}
							});
						}
						if (param_array && param_array.length) {
							param_array.map((pump) => {
								if (pump.value == 'ON') {
									count_on++;
								} else if (pump.value == 'OFF') {
									count_off++;
								}
							});
						}
						option = <Col className="cols width-100 back-grey" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title={'Last Data Receive Time '/* + (station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never')*/}>
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							{(() => {
								if (((sump_value != 'NA') || (sump_value != 'NA1') || (penstock_value != 'NA1') || (penstock_value != 'NA'))) {
									return <Row className="status-contain">
										<div className="status-hed">
											<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##water_level.svg" className="status-img"/>
											Level Sensors
										</div>
										<Row type="flex" justify="space-around">
											<Col span={10}>
												<div className="status-value">{((sump_value == 'NA' ? 'Offline' : (sump_value == 'NA1' ? 'NA' : sump_value)) + ' ' + (sump_value != 'NA' && sump_value != 'NA1' ?  ' ' + sump_unit : ''))}</div>
												<div className="status-type">Sump</div>
											</Col>
											<Col span={10}>
												<div className="status-value">{((penstock_value == 'NA' ? 'Offline' : (penstock_value == 'NA1' ? 'NA' : penstock_value)) + ' ' + (penstock_value != 'NA' && penstock_value != 'NA1' ?  ' ' + penstock_unit : ''))}</div>
												<div className="status-type">Penstock</div>
											</Col>
										</Row>
									</Row>;
								}
							})()}
							<Row className={'status-contain no-border' + ((sump_value == 'NA' || sump_value == 'NA1') && (penstock_value == 'NA' || penstock_value == 'NA1') ? ' expand' : '')}>
								<div className="status-hed">
									<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##pump.svg" className="status-img"/>
									Pump On/Off Status
									<div className="count">
										<span className="count-value success">{count_on}</span>
										<span>{'/' + param_array.length}</span>
									</div>
								</div>
								<Row className={'pump-names' + ((sump_value == 'NA' || sump_value == 'NA1') && (penstock_value == 'NA' || penstock_value == 'NA1') ? ' expand-pump-view' : '')} type="flex" justify="space-around">
									<Col span={24}>
										{(() => {
											if (param_array && param_array.length) {
												// console.log('param_array', param_array);
												let display = param_array.map((pump) => {
													return <Row type="flex" justify="space-around" className="pumps">
														<Col span={12} align="right" className={(pump.value == 'ON' ? 'success' : '')}>{pump.name + ' :'}</Col>
														<Col span={10} align="left" className={(pump.value == 'ON' ? 'success' : '')} offset={2}>{pump.value == 'NA' ? 'Offline' : pump.value}</Col>
													</Row>;
												}).filter(Boolean);
												return display;
											}
										})()}
									</Col>
								</Row>
								 <Button type="primary" onClick={() => {
									// this.props.history.push('');
									this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
									this.setState({
										trend_trigger: true
									});
									// this.fetchStationData(this.state.station_id)
									this.get24hourDataRange(this.state.from_time, this.state.upto_time);
								 }} className="more">More Details</Button>
							</Row>
						</Col>;
						// console.log('in showStation', option);
						// console.log('in showStation', station);
					} else if (station.sub_category == this.state.major_road_junction_air || station.sub_category == this.state.street_sub_house_front_air) {
						let temperature_value = 'NA',
							temperature_unit,
							humidity_value = 'NA',
							humidity_unit,
							param_array = [];
						if (station.parameters && station.parameters.length) {
							// console.log('airqualityVisible 2');
							station.parameters.map((param) => {
								if (param.name == 'Temperature') {
									temperature_value = param.value;
									temperature_unit = param.unit;
								} else if (param.name == 'Humidity') {
									humidity_value = param.value;
									humidity_unit = param.unit;
								} else {
									param_array.push(param);
								}
							});
						}
						option = <Col className="cols width-100 back-grey airQuality" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title="Last Data Receive Time">
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							<Row className="status-contain">
								<div className="status-hed">
									<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##temp.svg" className="status-img"/>
									<span className="air-head">Temperature</span>
									<span className="symbol"><span className="bold">{temperature_value}</span><span>{(temperature_value != 'NA' ? ' ' + temperature_unit : '')}</span></span>
								</div>
								<div className="status-hed">
									<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##humid.svg" className="status-img"/>
									<span className="air-head">Humidity</span>
									<span className="symbol"><span className="bold">{humidity_value}</span><span>{(humidity_value != 'NA' ? ' ' + humidity_unit : '')}</span></span>
								</div>
							</Row>
							<Row className="status-contain no-border">
								<div className="status-hed">
									<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##dust.svg" className="status-img"/>
									<span className="air-head">Dust Parameters</span>
								</div>
								{(() => {
									if (param_array && param_array.length) {
										let optn = param_array.map((param) => {
											return <Row type="flex" justify="space-around">
												<Col className="text-left mar-left-26" span={10}><span dangerouslySetInnerHTML={{__html:param.name}}></span></Col>
												<Col className="text-left" span={10}>{param.value + ' ' + param.unit}</Col>
											</Row>;
										}).filter(Boolean);
										return optn;
									}
								})()}
								{/*<Row type="flex" justify="space-around">
									<Col className="text-left mar-left-22" span={10}>PM <sub>1</sub></Col>
									<Col className="text-left" span={10}>32 °C</Col>
								</Row>
								<Row type="flex" justify="space-around">
									<Col className="text-left mar-left-22" span={10}>PM <sub>2.5</sub></Col>
									<Col className="text-left" span={10}>32 °C</Col>
								</Row>
								<Row type="flex" justify="space-around">
									<Col className="text-left mar-left-22" span={10}>PM <sub>10</sub></Col>
									<Col className="text-left" span={10}>32 °C</Col>
								</Row>*/}
								<Button type="primary" onClick={() => {
										// this.props.history.push('');
										this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
										
										// this.fetchStationData(this.state.station_id)
										this.get24hourDataRange(this.state.from_time, this.state.upto_time);
									 }} className="more air-more">More Details</Button>
							</Row>
						</Col>;
					} else if (station.sub_category == this.state.street_view_flood) {
						let water_level_value = 'NA',
							water_level_unit;
						if (station.parameters && station.parameters.length) {
							station.parameters.map((param) => {
								if (param.name == 'Water Level') {
									water_level_value = param.value;
									water_level_unit = param.unit;
								}
							});
						}
						option = <Col className="cols width-100 back-grey" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title="Last Data Receive Time">
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							<Row className="status-contain mar-top-35">
								<Row type="flex" justify="space-around" align="middle">
									<Col span={10}>
										<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##street.svg" className="street-img"/>
									</Col>
									<Col span={9}>
										<div className="status-value">{water_level_value + (water_level_value != 'NA' ? ' ' + water_level_unit : '')}</div>
										<div className="status-type">Water Level</div>
									</Col>
								</Row>
								<Button type="primary" onClick={() => {
										// this.props.history.push('');
										this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
										
										// this.fetchStationData(this.state.station_id)
										this.get24hourDataRange(this.state.from_time, this.state.upto_time);
									 }} className="more">More Details</Button>
							</Row>
							{/*<Row className="status-contain no-border mar-top-20">
								<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
							</Row>*/}
						</Col>;
					} else if (station.sub_category == this.state.rainfall_sub_id) {
						let penstock_value = 'NA',
							penstock_unit = 'NA',
							sump_value = 'NA',
							sump_unit = 'NA',
							param_array = [],
							count_on = 0,
							count_off = 0;
						if (station.parameters && station.parameters.length) {
							station.parameters.map((param) => {
								if (param.name == 'Penstock Level') {
									penstock_value = param.value;
									penstock_unit = param.unit;
								}
								if (param.name == 'Sump Level') {
									sump_value = param.value;
									sump_unit = param.unit;
								}
								if (param.name != 'Penstock Level' && param.name != 'Sump Level' && param.name != 'Rainfall') {
									param_array.push(param);
								}
							});
						}
						if (param_array && param_array.length) {
							param_array.map((pump) => {
								if (pump.value == 'ON') {
									count_on++;
								} else if (pump.value == 'OFF') {
									count_off++;
								}
							});
						}
						option = <Col className="cols width-100 back-grey" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title="Last Data Receive Time">
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							<Row className="status-contain">
								<div className="status-hed">
									<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##water_level.svg" className="status-img"/>
									Rainfall
								</div>
								<Row type="flex" justify="space-around">
									<Col span={10}>
										<div className="status-value">{station.rainfall_1.value + (station.rainfall_1.value != 'NA' ?  ' ' + station.rainfall_1.unit : '')}</div>
										<div className="status-type">Last Hour</div>
									</Col>
								</Row>
								<Row type="flex" justify="space-around mar-top-20">
									<Col span={10}>
										<div className="status-value">{station.rainfall_24.value + (station.rainfall_24.value != 'NA' ?  ' ' + station.rainfall_24.unit : '')}</div>
										<div className="status-type">Last 24 Hour</div>
									</Col>
								</Row>
							</Row>
							{(() => {
								if (station.rainfall_24_trend && station.rainfall_24_trend.length) {
									return <RainfallTrend station_name={station.name} station_id={station.id} rainfall_24_trend={station.rainfall_24_trend} parameters={station.parameters}/>
								}
							})()}
							<Row className="status-contain mar-top-35">
								<Button type="primary" onClick={() => {
									// this.props.history.push('');
									this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
									
									// this.fetchStationData(this.state.station_id)
									this.get24hourDataRange(this.state.from_time, this.state.upto_time);
								 }} className="more">More Details</Button>
							</Row>
						</Col>;
					} else if (station.sub_category == this.state.open_canal) {
						let water_level_value = 'NA',
							water_level_unit;
						if (station.parameters && station.parameters.length) {
							station.parameters.map((param) => {
								if (param.name == 'Water Level') {
									water_level_value = param.value;
									water_level_unit = param.unit;
								}
							});
						}
						option = <Col className="cols width-100 back-grey" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title="Last Data Receive Time">
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							<Row className="status-contain mar-top-35">
								<Row type="flex" justify="space-around" align="middle">
									<Col span={10}>
										<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##street.svg" className="street-img"/>
									</Col>
									<Col span={9}>
										<div className="status-value">{water_level_value + (water_level_value != 'NA' ?  ' ' + water_level_unit : '')}</div>
										<div className="status-type">Water Level</div>
									</Col>
								</Row>
								<Button type="primary" onClick={() => {
										// this.props.history.push('');
										this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
										
										// this.fetchStationData(this.state.station_id)
										this.get24hourDataRange(this.state.from_time, this.state.upto_time);
									 }} className="more">More Details</Button>
							</Row>
							{/*<Row className="status-contain no-border mar-top-20">
								<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
							</Row>*/}
						</Col>;
					} else if (station.sub_category == this.state.gated_canal) {
						let water_level_value = [];
						if (station.parameters && station.parameters.length) {
							station.parameters.map((param) => {
								water_level_value.push(param);
							});
						}
						option =  <Col className="cols width-100 back-grey" span={6}>
							<Row className="border-bot">
								<Col className="hed" span={17}>{station.name}</Col>
								<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close" /></span></Col>
							</Row>
							<div className="mar-top-10 time mar-left-auto">
								<Tooltip title="Last Data Receive Time">
									<div className="center mar-top-10 mar-left-auto">
										<span><img src={'##PR_STRING_REPLACE_IMAGE_BASE_PATH##' + (station.last_data_send && ((moment().unix() - station.last_data_send) < 900) ? 'clock_green.png' : 'clock_red.png')} className="clock-img"/></span>
										{station.last_data_send && station.last_data_send !== 0 ? moment.unix(station.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never'}
									</div>
								</Tooltip>
							</div>
							<Row className="status-contain mar-top-35">
								<Row type="flex" justify="space-around" align="middle">
									<Col span={10}>
										<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##street.svg" className="gated-img"/>
									</Col>
									<Col span={9}>
									{(() => {
										if (water_level_value && water_level_value.length) {
											let display = water_level_value.map((level,index) => {
												return <Row type="flex" justify="middle" className={'center' + (index > 0 ? ' mar-top-10' : '')}>
													<Col span={24}>
														<div className="status-value">{level.value + (level.value != 'NA' && level.value != null ? ' ' + level.unit : '')}</div>
														<div className="status-type">{level.name}</div>
													</Col>
												</Row>;
											}).filter(Boolean);
											return display;
										}
									})()}
										{/*<Row type="flex" justify="middle" className="center">
											<Col span={24}>
												<div className="status-value">240 mm</div>
												<div className="status-type">Water Level-1</div>
											</Col>
										</Row>
										<Row type="flex" justify="middle" className="center mar-top-10">
											<Col span={24}>
												<div className="status-value">240 mm</div>
												<div className="status-type">Water Level-2</div>
											</Col>
										</Row>*/}
									</Col>
								</Row>
								<Button type="primary" onClick={() => {
										// this.props.history.push('');
										this.props.history.push('/stations/' + this.state.station_id + '/24-hours-trend/');
										
										// this.fetchStationData(this.state.station_id)
										this.get24hourDataRange(this.state.from_time, this.state.upto_time);
									 }} className="more">More Details</Button>
							</Row>
							{/*<Row className="status-contain no-border mar-top-20">
								<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
							</Row>*/}
						</Col>;
					}

					if (this.child2 && update) {
						this.child2.handleClick(station, update);
					}
				}
			});

			this.setState({
				station_id: st_id,
				station_details: option,
				station_list_visible: false
			});
		}
	}

	
	
	/**
	 * Closes the Station details box and 24 hour trend box.
	 * @param  {flag}
	 * @return {void}
	 */
	showList (flag = false){
		// this.props.history.push('');
		if (!flag) {
			this.props.history.push('/' + this.props.history.location.search);
			this.setState({
				station_list_visible: true,
				station_details: {},
				show_trend: false,
				from_time: null,
				upto_time: null,
				station_id: null,
				details: {}
				},() => {
					if (this.child2) {
						this.child2.setDash();
					}
					this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
			});
		} else {
			// console.log('this.state.station_details', this.state.station_details);
			let sub_cat;
			if (this.state.searched_list && this.state.searched_list.length && this.state.station_id) {
				this.state.searched_list.map((station) => {
					if (this.state.station_id == station.id) {
						sub_cat = station.sub_category;
					}
				});
			}
			if (this.state.sub_category_selected_display.indexOf(sub_cat) == -1) {
				this.setState({
					station_list_visible: true,
					station_details: {},
					show_trend: false,
					from_time: null,
					upto_time: null,
					station_id: null,
					details: {}
					},() => {
						if (this.child2) {
							this.child2.setDash();
						}
						this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				});
			}
				
		}
		
	};

	/**
	 * Called for on change of TreeSelect.
	 */

	onChange(value) {
		// console.log('onChange ', value);
		this.setState({ value });
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
									'value': '0-' + category.id + '-' + sub_cat.id,
									'key': '0-' + category.id + '-' + sub_cat.id,
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
				if (that.state.category_selected && that.state.category_selected && that.state.sub_category_selected && that.state.sub_category_selected.length == 0) {
					value.push('0-' + that.state.category_selected);
				} else if (that.state.sub_category_selected && that.state.sub_category_selected.length) {
					that.state.sub_category_selected.map((node) => {
						value.push('0-' + that.state.category_selected + '-' + node);
					});
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
					value: value,
					sub_category_object: sub_category_object
				}, () => {
					// console.log('treeData', that.state.treeData);
					that.fetchData();
					that.updateDataInterval = setInterval(() => that.fetchData(true), 30000);
					that.setSub();
					let category_show = [];
					if (that.state.category_list && that.state.category_list.length) {
						if (that.state.sub_category_selected && that.state.sub_category_selected.length) {
							that.state.category_list.map((cat_list_val,index) => {
								cat_list_val.sub_category.map((sub_cat_list) => {
									that.state.sub_category_selected.map((sub_cat) => {
										// console.log('heya', sub_cat_list.id);
										// console.log('heya sub_cat', sub_cat);
										if (sub_cat_list.id == sub_cat) {
											category_show[index] = true;
										} else {
											category_show[index] = false;
										}
									});
								});
							});
						} else {
							for(let i=0; i< Object.keys(that.state.category_list).length; i++) {
								category_show.push(false);
							}
						}
						let display_selected_cat = that.state.display_selected_cat;
						that.state.category_list.map((cat) => {
							if (cat.id == that.state.category_selected) {
								display_selected_cat = cat.name;
							}
						});
						that.setState({
							category_show: category_show,
							display_selected_cat: display_selected_cat
						});
					}
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
	 * This function sets the value of TreeSelect to its default value.
	 */

	defaultTreeValue() {
		let value = [];
		/*if (treeData && treeData.length) {
			value.push(treeData[0].children[0].value);
		}*/
		if (this.state.category_selected && this.state.category_selected && this.state.sub_category_selected && this.state.sub_category_selected.length == 0) {
			value.push('0-' + this.state.category_selected);
		} else if (this.state.sub_category_selected && this.state.sub_category_selected.length) {
			this.state.sub_category_selected.map((node) => {
				value.push('0-' + this.state.category_selected + '-' + node);
			});
		}
		this.setState({
			value: value
		});
	}

	/**
	 * Function used to get the data for the dashboard page.
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
				let avg_lat = 0, avg_long = 0, count = 0;
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						count++
						avg_lat = avg_lat + parseFloat(station.latitude);
						avg_long = avg_long + parseFloat(station.longitude);
					});
				}
				avg_lat = avg_lat/count;
				avg_long = avg_long/count;
				let new_station_list = [];
				/*if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						if ((station.last_data_send != 0) && (station.last_data_send !== null) && (station.last_data_send != '') && (moment().unix() - station.last_data_send < 900)) {
							new_station_list.push(station);
						}
					});
				}*/

				let new_search_list = [];
				let station_name_list = {};
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						new_search_list.push({name: station.name,
							id: station.id});

						if (!station_name_list[station.id]) {
							station_name_list[station.id] = station.name;
						} else {
							station_name_list[station.id] = station.name;
						}
					});
				}

				if (!update) {
					that.setState({
						filtered_stations: json.station_list //new_station_list
					});
				}
				
				that.setState({
					unauthorised_access_list: false,
					station_name_list: station_name_list,
					all_stations: json.station_list, //new_station_list,
					//searched_list: json.station_list,
					device_info: json.device_info,
					event_log: json.event_log,
					new_search_list: new_search_list,
					// filtered_stations: json.all_stations,
					avg_lat: avg_lat != NaN ? avg_lat : 20.5937,
					avg_long: avg_long != NaN ? avg_long : 78.9629
				},() => {

					if (true) {
						that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display, update);
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
	 * This function gets the details from the API of a particular station.
	 * @param  {Number} id ID of the station
	 * @return {void}    
	 */
	fetchStationData(id = null, from_time = null, upto_time = null) {
		this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
		// console.log('oooooooooo', id);
		let that = this;
		let response_status;
		if (id) {
			that.setState({
				show_trend: true,
				loading_trend_data: true,
				details: {},
				pump_current_status: {},
				// child_dont_update: false,
			},() => {
				if (document.getElementById('dashboard_chart_loading')) {
					that.smoothScroll(document.getElementById('dashboard_chart_loading'));
				}
			});
			fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/'+ id +'/details', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from_time: from_time,
					upto_time: upto_time
				}),
				credentials: 'include'
			}).then(function(Response) {
				response_status = Response.status;
				return Response.json();
			}).then(function(json) {
				console.log('Station Details:', json);
				// response_status = 403;
				if (response_status == 403) {
					that.setState({
						unauthorised_access_trend: true,
						unauthorised_access_trend_msg: json.message,
						loading_trend_data: false,
					});
				}
				else if (json.status === 'success') {
					let pump_current_status = {};
					if (json.details && Object.values(json.details).length) {
						// console.log('debug 11');
						if (json.details.sub_category == that.state.pump_station || json.details.sub_category == that.state.pump_station_2) {
							// console.log('debug 12');
							if (that.state.all_stations && that.state.all_stations.length) {
								// console.log('debug 13');
								that.state.all_stations.map((station) => {
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
							}
						}
					}
					that.setState({
						unauthorised_access_trend: false,
						range_error: false,
						loading_trend_data: false,
						// child_dont_update: true,
						pump_current_status: pump_current_status,
						details: json.details,
					}, () => {
						/*if (that.state.details.sub_category == that.state.pump_station) {
							that.pumpShow(id);
						}*/
						// that.showStationDetails(id);
						if (document.getElementById('24hr_trend')) {
							that.smoothScroll(document.getElementById('24hr_trend'));
						}
					});
				} else {
					that.openNotification('error', json.message);
					that.setState({
						unauthorised_access_trend: false,
						range_error: false,
						loading_trend_data: false,
						// child_dont_update: false,
					});
					// showPopup('danger',json.message);
					// that.setState({loading_data: null});
				}
			}).catch(function(ex) {
				console.log('parsing failed', ex);
				that.setState({
					range_error: false,
					loading_trend_data: false,
					// child_dont_update: false,
				});
				that.openNotification('error', 'Unable to load data!');
				// showPopup('danger','Unable to load data!');
				// that.setState({loading_data: null});
			});
		}
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


	changeTrafficState(val) {
		this.setState({
			traffic_map_view: val
		}, () => {
			this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display)
		});
	}

	/**
	 * This function creates the query and pushes it to the history.      
	 *
	 * IF cat has length OR sub_cat has length
	 * 	IF cat.length equals to category_list.length
	 * 		IF url is equal to 'stations/:station_id/24-hours-trend/' push the url 'stations/:station_id/24-hours-trend/'
	 * 		ELSE push the history.location.pathname.
	 * 	ELSE push the query string created.
	 * ELSE push query string.
	 * @param  {Array} cat     Category array.
	 * @param  {Array} sub_cat Sub-category array.
	 * @return {void} 
	 */
	queryCreate(cat, sub_cat, update) {
		// toaster.warning('Heyyyy', 'Alert');
		let timestamp_url = '';
		// console.log('in queryCreate', this.props.history.location.pathname);

		if (this.state.from_time && this.state.upto_time) {
			timestamp_url = '&from=' + this.state.from_time + '&upto=' + this.state.upto_time;
		}

		let query_string = '?cat=' + cat + '&subcat=[' + this.state.sub_category_selected + ']' + '&traffic=' + (this.state.traffic_map_view ? 1 : 0) + timestamp_url;
		// console.log('query 1',query_string);
		// console.log('in else if st', this.state.station_id);
		
		if ((cat && cat != null) || (sub_cat && sub_cat.length)) {
			// console.log('category in query', this.state.category_list);
			// console.log('category in query', cat);
			if ((this.props.history.location && Object.values(this.props.history.location).length && this.props.history.location.pathname == ('stations/' + this.props.match.params.station_id + '/24-hours-trend/'))) {
				this.props.history.push('stations/' + this.props.match.params.station_id + '/24-hours-trend/' + query_string);
				/*if ((this.props.history.location && Object.values(this.props.history.location).length && this.props.history.location.pathname == ('stations/' + this.props.match.params.station_id + '/24-hours-trend/'))) {
					this.props.history.push('stations/' + this.props.match.params.station_id + '/24-hours-trend/' + query_string);
				} else if ((this.props.history.location && Object.values(this.props.history.location).length && this.props.history.location.pathname == ('stations/' + this.props.match.params.station_id + '/'))) {
					this.props.history.push('stations/' + this.props.match.params.station_id + '/');
				} else if (this.state.station_id == '' || this.state.station_id == null) {
					console.log('in else if st 1', this.state.station_id);
					this.props.history.push(query_string);
				} else {
					console.log('in else if st 2', this.props.history.location.pathname);
					this.props.history.push(this.props.history.location.pathname + query_string);
				}*/
			} else {
				// console.log('in else if st 3', this.state.station_id);
				this.props.history.push(query_string);
			}
		} else /*if(this.props.history.location && Object.values(this.props.history.location).length && this.props.history.location.pathname == ('stations/' + this.props.match.params.station_id + '/24-hours-trend/')) {
			if ((cat && cat.length) || (sub_cat && sub_cat.length)) {
				this.props.history.push(query_string);
			}
		} else */{
			// console.log('in else st 7', query_string);
				this.props.history.push(query_string);
		}

		if (this.state.search_station != '') {
			// console.log('in else st 8', query_string);
			this.props.history.push(query_string + (query_string == '' ? '?search=' : '&search=') + this.state.search_station);
		}

		if (this.state.search_station == '') {
			let filtered_stations = [];
			if (this.state.all_stations && this.state.all_stations.length && (sub_cat && sub_cat.length)) {
				// console.log('debug 1');
				this.state.all_stations.map((station) => {
					sub_cat.map((sub_cat_id) => {
						if (station.sub_category == sub_cat_id) {
							filtered_stations.push(station);
						}
					});
				});
			} else if (cat && this.state.category_list && (cat.length == this.state.category_list.length)) {
				// console.log('debug 2');
				filtered_stations = this.state.all_stations;
			}

			this.setState({
				filtered_stations: filtered_stations,
				searched_list: filtered_stations
			}, () => {
				this.setSearchedList(update);
				if (this.child2) {
					// console.log('update for map', update);
					this.child2.categorizeStations(update);
				}
			});
		} else {
			let id = '',
				name='';
			/*if (this.state.new_search_list && this.state.new_search_list.length) {
				this.state.new_search_list.map((st) => {
					if (st.name == this.state.search_station) {
						name=st.name;
						id=st.id;
					}
				});*/
				/*let filtered_stations = [];
				if (this.state.all_stations && this.state.all_stations.length) {
					this.state.all_stations.map((station) => {
						if (station.id == id) {
							filtered_stations.push(station);
						}
					});
				}*/
				// if (name != '' && id != '') {
					let filtered_stations = [];
					if (this.state.all_stations && this.state.all_stations.length && (sub_cat && sub_cat.length)) {
						// console.log('debug 1');
						this.state.all_stations.map((station) => {
							sub_cat.map((sub_cat_id) => {
								if (station.sub_category == sub_cat_id) {
									filtered_stations.push(station);
								}
							});
						});
					} else if (cat && this.state.category_list && (cat.length == this.state.category_list.length)) {
						
						filtered_stations = this.state.all_stations;
					}
					this.setState({
						filtered_stations: filtered_stations
					}, () => {
						// console.log('debug 2', this.state.filtered_stations);
						this.setSearchedList(update);
						if (this.child2) {
							this.child2.categorizeStations(update);
						}
					});
				// }
			// }
		}
	}

	/**
	 * This function sets the date and time in the state.
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
			that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display);
		});
		// that.get24hourDataRange(dateStrings[0], dateStrings[1]);
	}
	/**
	 * This function is called when the OK button is clicked after selecting date and time.
	 */
	callAPI(a,b,c) {
		// console.log('ok a',a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"));
		// console.log('ok b',b);
		// console.log('ok c',c);
		this.setState({
			child_dont_update: false,
		});
		this.get24hourDataRange(a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), a[1].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), null, true);
	}
	/**
	 * This function check if the dange selected is correct to the requirement.
	 * @param  {string} from_time from time
	 * @param  {string} upto_time from time
	 * @param  {Number} id        ID of the station
	 * @param  {Boolean} update    Update or not
	 * @return {void}           
	 */
	get24hourDataRange(from_time, upto_time, id, update) {
		let that = this;
		if (!that.state.show_trend || update) {
			if (from_time && upto_time) {
				// console.log('get24hourDataRange_from_time', from_time);
				// console.log('get24hourDataRange_upto_time', upto_time);
				let start_time = "00:00";
				let end_time = moment().tz('Asia/Kolkata').format("HH:mm");
				let now = moment().tz('Asia/Kolkata').format("DD-MM-YYYY");
				// console.log('now', now);
				if (upto_time == now) {
					end_time = moment().tz('Asia/Kolkata').format("HH:mm");
				} else {
					end_time = "23:59";
				}
				
				// from_time = moment(start_time + ', ' + from_time , "HH:mm, DD-MM-YYYY").tz('Asia/Kolkata').unix();
				// upto_time = moment(end_time + ', ' + upto_time , "HH:mm, DD-MM-YYYY").tz('Asia/Kolkata').unix();
				from_time = moment(from_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix();
				upto_time = moment(upto_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata').unix();
				// console.log('get24hourDataRange_from_time', from_time);
				// console.log('from_time',from_time);
				// console.log('upto_time', upto_time);
				if (upto_time - from_time <= 604800) {
					that.fetchStationData(id ? id : that.state.station_id, from_time, upto_time);
					// that.range_out_of_bounds = false;
					that.setState({
						range_out_of_bounds: false
					});
				} else {
					// that.range_out_of_bounds = true;
					that.setState({
						// from_time: null,
						// upto_time: null,
						range_out_of_bounds: true,
						show_trend: false,
						details: {},
						pump_current_status: {},
					}, () => {
						//that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display);
						//that.openNotification('error', 'Date Range cannot exceed 7 days!');
					});
				}
			} else {
				that.fetchStationData(id ? id : that.state.station_id);
			}
		} else {
			if (document.getElementById('24hr_trend')) {
				that.smoothScroll(document.getElementById('24hr_trend'));
				that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display);
			}
		}

	}
	/**
	 * This function sets the UI for the range selector.
	 */
	rangeSelector() {
		// console.log('this.range_out_of_bounds', this.state.range_out_of_bounds);
		return <div className='station-name-date'>
			<div className='head station-title hellip'>{this.state.details && this.state.details.name ? this.state.details.name : (this.state.station_name_list && Object.keys(this.state.station_name_list).length ? this.state.station_name_list[this.props.match.params.station_id] : '')}</div>
			<div className='date-range-container'>
				<div className="range-warning">{/*this.state.range_out_of_bounds ? 
					'Date Range cannot exceed 7 days!' : ''
				*/}
				</div>
				<div className="from-time-picker">
					<RangePicker
						className="calendar-icon"
						allowClear={false}
						format="DD-MM-YYYY HH:mm"
						showTime={{ 
							format: 'HH:mm',
							// defaultValue: [moment('00:00:00', 'HH:mm'), moment('23:59:59', 'HH:mm')],
						}}
						placeholder={['From', 'To']}
						disabledDate={disabledDate}
						value= {[this.state.from_time ? moment(this.state.from_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata') : '', this.state.upto_time ? moment(this.state.upto_time, "DD-MM-YYYY HH:mm").tz('Asia/Kolkata') : '']}
						onChange={(a,b) => this.dateTimeChange(a,b)}
						onOk={(a,b,c) => this.callAPI(a,b,c)}
					/>
				</div>
			</div>
		</div>
	}

	/**
	 * This function sets the sub category to be displayed.
	 */

	setSub() {
		// console.log('called constructor setSub');
		let sub_category_selected_display = [],
			category_selected = this.state.category_selected;
		if ((this.state.category_selected && this.state.category_selected != null) || (this.state.sub_category_selected && this.state.sub_category_selected.length)) {
			if (this.state.category_selected && this.state.category_selected != null && this.state.sub_category_selected && this.state.sub_category_selected.length == 0) {
				this.state.category_list.map((op) => {
					if (this.state.category_selected == op.id) {
						op.sub_category.map((sub_op) => {
							if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
								sub_category_selected_display.push(sub_op.id);
							}
						});
					}
				});
				if (this.state.sub_category_selected && this.state.sub_category_selected.length) {
					this.state.sub_category_selected.map((sub_id) => {
						if (sub_category_selected_display.indexOf(sub_id) === -1) {
							sub_category_selected_display.push(sub_id);
						}
					});
				}
			}
			if (this.state.sub_category_selected && this.state.sub_category_selected.length) {
				this.state.sub_category_selected.map((data) => {
					if (sub_category_selected_display.indexOf(data) === -1) {
						sub_category_selected_display.push(data);
					}
					
				});
			}
		} else {
			if (this.props.location.search == '?cat=[]&subcat=[]') {

			} else {
				if (this.state.category_list && this.state.category_list.length) {
					this.state.category_list.map((op) => {
						op.sub_category.map((sub_op) => {
							if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
								sub_category_selected_display.push(sub_op.id);
							}
						});
						// this.setCategory(true, op.id);
						if (category_selected != op.id) {
							category_selected = op.id;
						}
					});
				}
			}
		}
		this.setState({
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected,
		});
	}

	/**
	 * This function gets called when any selection is made in the TreeSelect.
	 * This callc the function to set the category/ subcategory selected.
	 */

	treeSelect (val, label, extra) {
		// console.log('treeSelect', val);
		// console.log('treeSelect', label);
		// console.log('treeSelect', extra);

		let value = this.state.value,
			sub_cat = this.state.sub_category_selected_display;
		if (extra.triggerValue.split('-').length == 2) {
			value = [];
			value.push(extra.triggerValue);
			let category_id = extra.triggerValue.split('-')[1];
			/*this.props.history.push('');
			if (this.state.search_station != '') {
				this.props.history.push(this.props.location.search);
			}
			this.setState({
				station_id: ''
			});*/
			this.setCategory(parseInt(category_id));
		} else if (extra.triggerValue.split('-').length == 3) {
			let status = false;
			let category_id = extra.triggerValue.split('-')[1];
			let sub_category_id = extra.triggerValue.split('-')[2];
			if (sub_cat && sub_cat.length) {
				if (sub_cat.indexOf(parseInt(sub_category_id)) == -1) {
					status = true;
					
				}
			} else {
				status = true;
			}
			value = [];
			if (val.length) {
				val.map((v) => {
					if (v.split('-').length == 3) {
						if (v.split('-')[1] == extra.triggerValue.split('-')[1]) {
							value.push(v);
						}
					} else if (v.split('-').length == 2) {
						if (v.split('-')[1] == extra.triggerValue.split('-')[1]) {
							value.push(v);
						}
					}
				});
			}/* else {
				value = val;
			}*/
			/*this.props.history.push('');
			if (this.state.search_station != '') {
				this.props.history.push(this.props.location.search);
			}
			this.setState({
				station_id: ''
			});*/
			this.setSubCategory(status, parseInt(category_id), parseInt(sub_category_id));
		}
		this.setState({
			value: value,
			// station_id: ''
		},() => {
			/*this.props.history.push('');
			if (this.state.search_station != '') {
				this.props.history.push(this.props.location.search);
			}*/
			this.showList(true);
		});
	}

	/**
	 * This function sets the URL when a map marker is clicked.
	 */

	callParent(data, arg, flag = false) {
		// console.log('callParent data', data);
		// console.log('callParent arg', arg);
		// console.log('callParent flag', flag);
		if (this.props.history.location.pathname.search('24-hours-trend') > -1 && flag) {
			// console.log('callParent flag if', flag);
			// console.log('callParent flag if', this.props.history.location.pathname);
			let query = this.props.history.location.search;
			//this.props.history.push('');
			this.props.history.push('/stations/' + data.id + '/24-hours-trend/' + query);
			// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
		}/* else if (this.state.station_id == '' || this.state.station_id == null) {
			let query = this.props.history.location.search;
			this.props.history.push('');
			this.props.history.push(query);
			// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
		}*/ else {
			let query = this.props.history.location.search;
			if (this.state.sub_category_selected_display.indexOf(data.sub_category) > -1) {
				// console.log('callParent flag else if', flag);
				// console.log('callParent flag else if', this.props.history.location.pathname);
				//this.props.history.push('');
				this.props.history.push('/stations/' + data.id + '/' + query);
			} else {
				// console.log('callParent flag else', flag);
				// console.log('callParent flag else', this.props.history.location.pathname);
				//this.props.history.push('');
				this.props.history.push(query);
			}
			this.setState({
				show_trend: false,
				from_time: null,
				upto_time: null
			});
			// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
		}
	}

	/**
	 * This function sets the category selected.
	 * @param {Number}
	 */
	setCategory(id) {
		// console.log('category cat', id);
		let category_selected = this.state.category_selected,
		display_selected_cat = this.state.display_selected_cat,
			sub_category_selected_display = category_selected != id ? [] : this.state.sub_category_selected_display,
			sub_category_selected = category_selected != id ? [] : this.state.sub_category_selected;
		category_selected = id;
		this.state.category_list.map((op) => {
			if (op.id == id) {
				display_selected_cat = op.name;
				op.sub_category.map((sub_op) => {
					if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
						sub_category_selected_display.push(sub_op.id);
					}
					if (sub_category_selected.indexOf(sub_op.id) !== -1) {
						sub_category_selected.splice(sub_category_selected.indexOf(sub_op.id), 1);
					}
				});
			}
		});
		
		this.setState({
			sub_category_selected: sub_category_selected,
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected,
			// search_station: '',
			display_selected_cat: display_selected_cat
		},() => this.queryCreate(category_selected, sub_category_selected_display));
	}

	/**
	 * This function sets the subcategory selected.
	 * @param {Boolean}
	 * @param {Number}
	 * @param {Number}
	 */
	setSubCategory(status, id, sub_id) {
		// console.log('category sub_cat status', status);
		// console.log('category sub_cat', sub_id);
		// console.log('category sub_cat cat', id);
		let display_selected_cat = this.state.display_selected_cat;
		let category_selected = this.state.category_selected,
			sub_category_selected_display = category_selected != id ? [] : this.state.sub_category_selected_display,
			sub_category_selected = category_selected != id ? [] : this.state.sub_category_selected;
		if (status === true && sub_category_selected_display.indexOf(sub_id) === -1) {
			sub_category_selected_display.push(sub_id);
			category_selected = id;
			if (sub_category_selected.indexOf(sub_id) === -1) {
				sub_category_selected.push(sub_id);
			}
			let sub_count = 0;
			this.state.category_list.map((op) => {
				if (op.id === id) {
					display_selected_cat = op.name;
					op.sub_category.map((sub_op) => {
						if (sub_category_selected_display.indexOf(sub_op.id) !== -1) {
							sub_count++;
						}
					});
					if (sub_count === op.sub_category.length && category_selected == id) {
						//category_selected = id;
						op.sub_category.map((sub_op) => {
							if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
								sub_category_selected_display.push(sub_op.id);
							}
							if (sub_category_selected.indexOf(sub_op.id) !== -1) {
								sub_category_selected.splice(sub_category_selected.indexOf(sub_op.id), 1);
							}
						});
					}
				}
			});
		} else if (status === false && sub_category_selected_display.indexOf(sub_id) !== -1) {
			if (sub_category_selected_display.indexOf(sub_id) !== -1) {
				sub_category_selected_display.splice(sub_category_selected_display.indexOf(sub_id), 1);
			}
			if (sub_category_selected.indexOf(sub_id) !== -1) {
				sub_category_selected.splice(sub_category_selected.indexOf(sub_id), 1);
			}
			let sub_count = 0;
			this.state.category_list.map((op) => {
				if (op.id === id) {
					display_selected_cat = op.name;
					op.sub_category.map((sub_op) => {
						if (sub_category_selected_display.indexOf(sub_op.id) !== -1) {
							sub_count++;
						}
					});
					if (sub_count !== op.sub_category.length && category_selected == id) {
						// category_selected.splice(category_selected.indexOf(id), 1);
						// op.sub_category.map((sub_op) => {
						// 	if (sub_category_selected.indexOf(sub_op.id) === -1 && sub_op.id !== sub_id) {
						// 		sub_category_selected.push(sub_op.id);
						// 	}
						// });
						sub_category_selected = sub_category_selected_display.slice(0);
					}
				}
			});
		}
		// console.log('category sub_cat cat', category_selected);
		// console.log('category sub_cat subcat', sub_category_selected);
		// console.log('category sub_cat disp', sub_category_selected_display);
		
		this.setState({
			sub_category_selected: sub_category_selected,
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected,
			// search_station: '',
			display_selected_cat: display_selected_cat
		},() => this.queryCreate(category_selected, sub_category_selected_display));
	}

	/**
	 * This function sets the count of the status of the stations.
	 * @param  {Number} on   Number of online devices.
	 * @param  {Number} off  Number of offline devices.
	 * @param  {Number} shut Number of shutdown devices.
	 * @return {void}
	 */
	count(on, off, shut) {
		this.setState({
			online_count: on,
			offline_count: off,
			shutdown_count: shut,
		});
	}

	/**
	 * This function sets the string to be searched.
	 * @param {String}
	 */
	setSearch(value) {
		// console.log('in setSearch function', value);
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && value) {
			this.state.filtered_stations.map((cat,index) => {
				if (value != '' && cat.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
					searched_list.push(cat);
				}
			});
		} else if (value == '') {
			searched_list = this.state.filtered_stations.slice(0);
		}
		this.setState({
			search_station: decodeURI(encodeURI(value)),
			searched_list: searched_list
		},() => {
			// console.log('searched_list 22', this.state.searched_list);
			if (this.child2) {
				this.child2.categorizeStations();
			}
			this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
		});
	}

	/**
	 * This function sets the list of stations tot be displayed in the map and station list.
	 * @param {Boolean}
	 */
	setSearchedList(update) {
		// console.log('in setSearchList function');
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && this.state.search_station != null && this.state.search_station != '' && this.state.search_station != undefined) {
			this.state.filtered_stations.map((cat,index) => {
				if (this.state.search_station != '' && cat.name.toLowerCase().includes(decodeURI(encodeURI(this.state.search_station.toLowerCase())))) {
					searched_list.push(cat);
					// console.log('in setSearchList 1 function');
				}
			});
		} else if (!this.state.search_station) {
			searched_list = this.state.filtered_stations.slice(0);
		}
		this.setState({
			searched_list: searched_list
		}, () => {
			// console.log('debug 3', this.state.searched_list);
			if (this.child2) {
				this.child2.categorizeStations(update);
			}
		});
	}

	/**
	 * This function checks the status of the pump station and returns the class accordingly to show the color in the station list.
	 * @param  {Object}
	 * @return {String}
	 */
	returnPumpStatus(station) {
		if (station.sub_category == this.state.pump_station || station.sub_category == this.state.pump_station_2) {
			let status = ' warning-back';
			if (station && Object.values(station).length) {
				if ((moment().unix() - station.last_data_send > 900) || (station.last_data_send == 0) || (station.last_data_send === null) || (station.last_data_send == '')) {
					status =' danger-back';
				} else {
					if (station.parameters && station.parameters.length) {
						station.parameters.map((param) => {
							if (param.name != 'Penstock Level' && param.name != 'Sump Level' && param.name != 'Rainfall' && param.name != 'Penstock' && param.name != 'Sump') {
								if (param.value == 'ON') {
									status = ' success-back';
								}
							}
						});
					}
				}
			}
			return status;
		} else if (station.sub_category == this.state.rainfall_sub_id) {
			let status = ' warning-back';
			if (station.status == 'offline') {
				status = ' danger-back';
			} else {
				if (station.rainfall_1 && Object.keys(station.rainfall_1).length && !isNaN(station.rainfall_1.value) && station.rainfall_1.value > 0) {
					status = ' rainfall-dark-blue';
				} else if (station.rainfall_24 && Object.keys(station.rainfall_24).length && !isNaN(station.rainfall_24.value) && station.rainfall_24.value > 0) {
					status = ' rainfall-light-blue';
				}
			}
			return status;
		} else if (station.sub_category == this.state.major_road_junction_air || station.sub_category == this.state.street_sub_house_front_air || station.sub_category == this.state.street_view_flood) {
			if (moment().unix() - station.last_data_send < 1800) {
				return ' success-back';
			} else {
				return ' danger-back';
			}
		}
	}

	/**
	 * 
	 * @return {void}
	 */
	toggleClosed() {
		this.setState({
			closed: this.state.closed,
		});
	}
	/**
	 * This function sets the scroll to the index.
	 */
	showIndex() {
		if (document.getElementById('label_container')) {
			this.smoothScroll(document.getElementById('label_container'));
		}
	}

	toggleIndex() {
		this.setState({
			show_index: !this.state.show_index
		});
	}

	/*openNotification(type) {
		notification[type]({
			message: 'Notification Title',
			description: 'This is the content of the notification. This is the content of the notification.',
			placement: 'bottomLeft',
		});
	}*/

	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render () {
		const { size } = this.state;
			const tProps = {
				treeData,
				value: this.state.value,
				// onChange: (e) => this.onChange(e),
				treeCheckable: true,
				treeDefaultExpandAll: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Choose Station Category to View',
			};

		return (
			<div id="dashboard">
				<Side active_link="dashboard" />
				<Head/>
				<Layout>
					{(() => {
						if (this.state.all_stations && this.state.all_stations.length) {
							return <Layout>
								<Content className="contains">
									{/*<Breadcrumb style={{ margin: '16px 0' }}>
										<Breadcrumb.Item>User</Breadcrumb.Item>
										<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
									</Breadcrumb>*/}
									<div className="contain">
										<Row className="rows" className="top-0">
											<Col className="city-select" span={10}>
												<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} {...tProps} style={{ width: 500 }} />
											</Col>
											<Col xs={24} sm={24} md={24} lg={13} xl={13} className="link-to-go-slide-show">
												<Link to={'/slide-show'} >
													<span className="link-to-go-slide-show-inside">Go to Slide Show</span>
												</Link>
											</Col>
										</Row>
										<Row className="rows" type="flex" justify="space-around">
											<Col className="cols map-container" span={16}>
												{(() => {
													if (this.state.all_stations && this.state.all_stations.length && this.state.searched_list) {
														return <DashboardMap changeTrafficState={(val) => this.changeTrafficState(val)} traffic_map_view={this.state.traffic_map_view} showIndex={() => this.showIndex()} sub_category_object={this.state.sub_category_object} callParent={(data, arg, flag) => this.callParent(data, arg, flag)} station_id={this.state.station_id} kml_layer_toggle={this.state.kml_layer_toggle} kml_layer_array={this.state.kml_layer_array} handleTrend={() => this.handleTrend()} trend_trigger={this.state.trend_trigger} history={this.props.history} searched_list={this.state.searched_list} cat_list={this.state.category_selected} sub_cat_list={this.state.sub_category_selected_display} queryCreate={(cat, subcat) => this.queryCreate(cat, subcat)} avg_lat={this.state.avg_lat} avg_long={this.state.avg_long} ref={(child2) => { this.child2 = child2; }} showList={() => this.showList()} callChild={(title) => this.callChild(title)} count={(on, off, shut) => this.count(on, off, shut)} />;
													}
													{/*<div className="full-height" id="mapView" />*/}
												})()}
											</Col>
											{(() => {
												if (this.state.view_mode === 'mobile') {
													return <Button type="primary" onClick={() => this.toggleIndex()} className="show-index-btn">{(this.state.show_index ? 'Hide legends' : 'Show legends')}</Button>;
												}
											})()}
											{(() => {
												if (this.state.view_mode === 'mobile' && this.state.show_index) {
													return <Row className="rows" id="label_container" className="label-container-mobile">
														<div className="label-wrapper">
															<div className="label-heading index">
																Index:
															</div>
															<div className="label-content">
																<div className="online-label">Online</div>
																<div className="offline-label">Offline</div>
															</div>
														</div>
														<div className="label-wrapper">
															<div className="label-heading index">
																For Pump Stations:
															</div>
															<div className="label-content">
																<div className="pump-online-no-pump">
																	No Pump is ON
																</div>
																<div className="pump-online-pump">
																	Atleast 1 Pump is ON
																</div>
																<div className="pump-offline">
																	Station Offline
																</div>
															</div>
														</div>
														<div className="label-wrapper">
															<div className="label-heading index">
																For Rainfall Stations:
															</div>
															<div className="label-content">
																<div className="rain-online-1hr">
																	Rainfall within last 1 hour
																</div>
																<div className="rain-online-24hrs">
																	Rainfall within within last 24 hours
																</div>
																<div className="rain-online-no-rain">
																	No rainfall within within last 24 hours
																</div>
																<div className="rain-offline">
																	Station Offline
																</div>
															</div>
														</div>
													</Row>;
												}
											})()}
												{(() => {
													if (this.state.station_list_visible) {
														return <Col className="cols width-100 search" span={6}>
															<Search
																className="select-icon"
																placeholder="Search by Station Name"
																value={decodeURI(this.state.search_station)}
																onChange={(e) => this.setSearch(e.target.value)}
															/>
															{/*<Select
															showSearch
															className="select-icon"
															placeholder="Search"
															onChange={(e) => this.handleChange(e)}
															style={{ width: "100%" }}
															>
																<Option key="Pumping Station-1">Pumping Station-1</Option>
																<Option key="Pumping Station-2">Pumping Station-2</Option>
																<Option key="Pumping Station-3">Pumping Station-3</Option>
																<Option key="Pumping Station-4">Pumping Station-4</Option>
																<Option key="Pumping Station-5">Pumping Station-5</Option>
																<Option key="Pumping Station-6">Pumping Station-6</Option>
																<Option key="Pumping Station-7">Pumping Station-7</Option>
																<Option key="Pumping Station-8">Pumping Station-8</Option>
															</Select>*/}
															<div className="device-details">
																{(() => {
																	if (this.state.searched_list && this.state.searched_list.length) {
																		let opt = this.state.searched_list.map((station, index) => {
																			return <Row type="flex" justify="left" className="device-row" onClick={() => {
																						// console.log('in did update 3', this.props.history.location.pathname);
																						let query = this.props.history.location.search;
																						// this.props.history.push('');
																						this.props.history.push('/stations/' + station.id + '/' + query);
																						this.showStationDetails(station.id, true);
																				}}>
																				<Col span={14} offset={1} className="text-left">{station.name}</Col>
																				<Col span={2} offset={2}><div className={'dot' + (station.sub_category != this.state.pump_station && station.sub_category != this.state.pump_station_2 && station.sub_category != this.state.rainfall_sub_id && station.sub_category != this.state.major_road_junction_air && station.sub_category != this.state.street_sub_house_front_air && station.sub_category != this.state.street_view_flood ? (moment().unix() - station.last_data_send < 900 ? ' success-back' : ' danger-back') : this.returnPumpStatus(station))}></div></Col>
																				<Col span={1} offset={1}><span className="next-butn" ><Icon type="right" /></span></Col>
																			</Row>;
																		}).filter(Boolean);
																		return opt;
																	} else if (this.state.all_stations && this.state.all_stations.length && this.state.searched_list && this.state.searched_list.length == 0) {
																		return <Row type="flex" justify="left" className="device-row no-station">
																			No stations found!
																		</Row>;
																	}
																})()}
															</div>
														</Col>;
													} else if (this.state.station_details && Object.keys(this.state.station_details).length) {
														return this.state.station_details;
													}
													
												})()}
										</Row>
										{(() => {
											if (this.state.view_mode === 'desktop') {
												return <Row className="rows" id="label_container" type="flex" justify="start">
													<div className="label-wrapper">
														<div className="label-heading index">
															Index:
														</div>
														<div className="label-content">
															<div className="online-label">Online</div>
															<div className="offline-label">Offline</div>
														</div>
													</div>
													<div className="label-wrapper">
														<div className="label-heading index">
															For Pump Stations:
														</div>
														<div className="label-content">
															<div className="pump-online-no-pump">
																No Pump is ON
															</div>
															<div className="pump-online-pump">
																Atleast 1 Pump is ON
															</div>
															<div className="pump-offline">
																Station Offline
															</div>
														</div>
													</div>
													<div className="label-wrapper">
														<div className="label-heading index">
															For Rainfall Stations:
														</div>
														<div className="label-content">
															<div className="rain-online-1hr">
																Rainfall within last 1 hour
															</div>
															<div className="rain-online-24hrs">
																Rainfall within within last 24 hours
															</div>
															<div className="rain-online-no-rain">
																No rainfall within within last 24 hours
															</div>
															<div className="rain-offline">
																Station Offline
															</div>
														</div>
													</div>
												</Row>;
											}
										})()}
										
									</div>
								</Content>
							</Layout>;
						} else if (this.state.all_stations && this.state.all_stations.length == 0) {
							return <Layout>
								<Content className="contains">
									{/*<Breadcrumb style={{ margin: '16px 0' }}>
										<Breadcrumb.Item>User</Breadcrumb.Item>
										<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
									</Breadcrumb>*/}
									<div className="contain">
										<Row className="rows" className="top-0">
											<Col className="city-select" span={10}>
												<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} {...tProps} style={{ width: 500 }} />
											</Col>
										</Row>
										<Row type="flex" justify="space-around" className="device-details">
											<div className="no-data-text">No device found</div>
										</Row>
									</div>
								</Content>
							</Layout>;
						} else if (this.state.unauthorised_access_list) {
							return <Layout>
								<Content className="contains">
									{/*<Breadcrumb style={{ margin: '16px 0' }}>
										<Breadcrumb.Item>User</Breadcrumb.Item>
										<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
									</Breadcrumb>*/}
									<div className="contain">
										<Row type="flex" justify="space-around" className="device-details">
											<div className="no-data-text">
												<Alert
													message="Access Denied"
													description={this.state.unauthorised_access_list_msg}
													type="error"
												/>
											</div>
										</Row>
									</div>
								</Content>
							</Layout>;
						} else {
							return <Layout>
								<Content className="contains">
									<Loading />
								</Content>
							</Layout>;
						}
					})()}
					
					{(() => {
						if (this.state.all_stations && this.state.all_stations.length && this.state.show_trend) {
							if (!this.state.range_error && this.state.details && Object.values(this.state.details).length) {
								if (this.state.details.sub_category == this.state.pump_station || this.state.details.sub_category == this.state.pump_station_2 || this.state.details.sub_category == this.state.street_sub_house_front_air || this.state.details.sub_category == this.state.major_road_junction_air || this.state.details.sub_category == this.state.gated_canal || this.state.details.sub_category == this.state.open_canal || this.state.details.sub_category == this.state.street_view_flood|| this.state.details.sub_category == this.state.rainfall_sub_id) {
									return <Content className="contains station-details">
										{(() => {
											return this.rangeSelector();
										})()}
										<DashboardChart {...this.state} get24hourDataRange={(from_time, upto_time) => this.get24hourDataRange(from_time, upto_time)} url_search={this.props.location.search} rangeSelector={() => this.rangeSelector()} />
									</Content>;
								}
							} else if (!this.state.loading_trend_data && this.state.range_error) {
								return <Content className="contains station-details">
									{(() => {
										return this.rangeSelector();
									})()}
									<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
										<Row className="white error-message">
											<div className="no-data-text">From Date must be less than Upto Date</div>
										</Row>
									</Row>
								</Content>;
							} else if (this.state.unauthorised_access_trend) {
								// console.log('this.state.unauthorised_access_trend', this.state.unauthorised_access_trend);
								return <Layout className="mobile-hide" id="24hr_trend">
									<Content className="contains station-details">
										<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
											<Row className="white error-message">
												<Alert
													message="Access Denied"
													description={this.state.unauthorised_access_trend_msg}
													type="error"
												/>
											</Row>
										</Row>
									</Content>;
								</Layout>;
										
							} else {
								return <Layout className="mobile-hide" id="dashboard_chart_loading">
									<Content className="contains station-details">
										<Loading is_inline={true} />
									</Content>
								</Layout>;
							}
						} else if (this.state.all_stations && this.state.all_stations.length && this.state.range_error && this.state.from_time && this.state.upto_time) {
							return <Content className="contains station-details">
								{(() => {
									return this.rangeSelector();
								})()}
								<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">From Date must be less than Upto Date</div>
									</Row>
								</Row>
							</Content>;
						} else if (this.state.all_stations && this.state.all_stations.length && this.state.range_out_of_bounds) {
							return <Content className="contains station-details">
								{(() => {
									return this.rangeSelector();
								})()}
								<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">Date Range cannot exceed 7 days!</div>
									</Row>
								</Row>
							</Content>;
						}
					})()}
					
				</Layout>
			</div>
		);
	}
}