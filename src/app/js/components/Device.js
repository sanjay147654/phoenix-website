import React from 'react';
import ReactDOM from 'react-dom';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Tooltip, Card, notification, Select, TreeSelect, Popover, Alert } from 'antd';
// import './device.less';
import Head from './imports/Head';
import Side from './imports/Side';
import Loading from './imports/Loading';
import DeviceChart from './imports/DeviceChart';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import moment from 'moment-timezone';
import ReactTooltip from 'react-tooltip';

const queryString = require('query-string');

HighchartsMore(ReactHighcharts.Highcharts);
HighchartsSolidGauge(ReactHighcharts.Highcharts);

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const Option = Select.Option;

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const sync_text = <span>In Sync</span>;
const qr_code = 'qr234567';
const device_name = 'Device-1';

const config = {
	chart: {
		renderTo: 'container',
		type: 'pie',
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false,
		height: 285,
		width: 285
	},
	title: {
		text: ''
	},
	tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	},
	 plotOptions: {
				pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
								enabled: false
						},
						showInLegend: true
				}
		},
		series: [{
				name: 'Brands',
				colorByPoint: true,
				data: [{
						name: '>90%',
						y: 61.41,
						sliced: true,
						selected: true
				}, {
						name: '90-60%',
						y: 11.84
				}, {
						name: '<60%',
						y: 10.85
				}, {
						name: '0%',
						y: 4.67
				}]
		}]
};
let typeFilter = [/*{
	title: 'All',
	value: 'all',
	key: '0-0',
	children: [{
		title: 'A',
		value: 'a',
		key: '0-0-0',
	}, {
		title: 'A1',
		value: 'a1',
		key: '0-0-1',
	},{
		title: 'B',
		value: 'b',
		key: '0-0-2',
	},{
		title: 'C',
		value: 'c',
		key: '0-0-3',
	},{
		title: 'D',
		value: 'd',
		key: '0-0-4',
	},{
		title: 'E',
		value: 'e',
		key: '0-0-5',
	},{
		title: 'F',
		value: 'f',
		key: '0-0-6',
	},{
		title: 'G',
		value: 'g',
		key: '0-0-7',
	}],
}*/];

const data = [];

const { Content } = Layout;

const percent_status = [
	{
		title: 'Online Percentage (Any)',
		value: '0-0',
		key: '0-0',
		children: [
			{
				title: '% Online : >90',
				value: '0-0-0',
				key: '0-0-0',
			},{
				title: '% Online : 90-60',
				value: '0-0-1',
				key: '0-0-1',
			},{
				title: '% Online : <60',
				value: '0-0-2',
				key: '0-0-2',
			},{
				title: '% Online : 0',
				value: '0-0-3',
				key: '0-0-3',
			}
		]
	},
	{
		title: 'Status (Any)',
		value: '0-1',
		key: '0-1',
		children: [
			{
				title: 'Online',
				value: '0-1-0',
				key: '0-1-0'
			},
			{
				title: 'Offline',
				value: '0-1-1',
				key: '0-1-1'
			}
		]
	}
];

/**
 * Main class for Devices page.
 */
export default class Device extends React.Component {
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
		this.parsed_search = queryString.parse(this.props.location.search);
		console.log('this.parsed_search', this.parsed_search);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @param {Boolean} visible 
		* @param {String} searchText Used to store the string to be searched.
		* @param {String} type_id Stores the type ID of the Type selected.
		* @param {String} table_search Used to store the string to be searched.
		* @param {Array} filter_type Used to store the filter type of device.
		* @param {string} selectStatus Used to store the device status for filtering.
		* @param {Object} type_desc Stores the device type and details.
		*/
		if (this.parsed_search) {
			this.status_percent_value = [];
			if (this.parsed_search.percent && JSON.parse(this.parsed_search.percent).length) {
				JSON.parse(this.parsed_search.percent).map((sts, i) => {
					this.status_percent_value.push('0-0-' + sts);
				});
			}/* else if (!this.parsed_search.percent) {
				this.status_percent_value.push('0-0');
			}*/

			if (this.parsed_search.status && JSON.parse(this.parsed_search.status).length) {
				JSON.parse(this.parsed_search.status).map((sts, i) => {
					this.status_percent_value.push('0-1-' + sts);
				});
			} /*else if (!this.parsed_search.status) {
				this.status_percent_value.push('0-1');
			}*/
		}
		this.state = {
			visible: true,
			searchText: '',
			type_id: props.match.params.type_id ? props.match.params.type_id : '0',

			table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			filter_type: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.type ? JSON.parse(this.parsed_search.type) : [],
			selected_percent: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.percent ? JSON.parse(this.parsed_search.percent) : [],
			typeValue: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.type ? JSON.parse(this.parsed_search.type) : [],
			selectStatus: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.status ? JSON.parse(this.parsed_search.status) : [],
			stprValue: this.status_percent_value && this.status_percent_value.length ? this.status_percent_value : [],
			type_desc: {
				'A' : 'Measures Penstock & Sump Water Levels at Pump Stations',
				'A1' : 'Measures Penstock & Sump Water Levels with Rainfall at Pump Stations',
				'B' : 'Monitors Running Status of Pumps at Pump Stations',
				'C' : 'Measures Water Level of Open Canals',
				'D' : 'Measures Water Level of Gated Canals',
				'E' : 'Measures Road Inundation Level with Dust, Temperature & Humidity at Major Road Junctions',
				'F' : 'Measures Road Inundation Level with Dust, Temperature & Humidity at Streets / Shop Fronts / House Fronts',
			},
			unauthorised_access: false,
			unauthorised_access_msg: '',
			reset_btn: false,
			filtered_type_data: null,
			view_filter_box: false
		};

		console.log('table_search', this.state.table_search);

		/**
		 * This sets the default refresh interval to null.
		 */
		this.updateDataInterval = null;
	}

	/**
	 * This function sets the selected percent in state and updated the URL.
	 * @param {String}
	 */
	setSelected(key) {
		let key_data = [], status_percent_value = [];
		key_data.push(key);
		if (key_data && key_data.length) {
			key_data.map((sts, i) => {
				status_percent_value.push('0-0-' + sts);
			});
		}
		this.setState({
			selected_percent: key_data,
			stprValue: status_percent_value && status_percent_value.length ? status_percent_value : [],
		},() => {
			// this.setDeviceData();
			// let query = this.props.history.location.pathname;
			this.queryCreate();
			// this.props.history.push('');
			/*this.props.history.push(this.state.type_id && this.state.type_id != 0 ? '/devices/type/' + this.state.type_id + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : '') : '/devices' + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : ''));*/

		});
	}

	/**
	 * This function filters the devices according to the selected online percent.
	 */
	setDeviceData() {
		let device_list = this.state.device_list.slice(0);
		let filtered_device_list = [];
		if (device_list && device_list.length) {
			device_list.map((device) => {
				if (this.state.selected_percent == '>90%') {
					if (device.online_percent > 90) {
						filtered_device_list.push(device);
					}
				} else if (this.state.selected_percent == '<60%') {
					if (device.online_percent < 60 && device.online_percent > 0) {
						filtered_device_list.push(device);
					}
				} else if (this.state.selected_percent == '90-60%') {
					if (device.online_percent >= 60 && device.online_percent <= 90) {
						filtered_device_list.push(device);
					}
				} else {
					if (device.online_percent == 0) {
						filtered_device_list.push(device);
					}
				}
			});
		}
		this.setState({
			filtered_device_list: filtered_device_list
		});
	}

	/**
	 * Predefined function of ReactJS.
	 * Called after the component mounts.
	 * @return {void}
	 */
	componentDidMount() {
		document.title = 'Devices - Flood Forecasting and Early Warning System for Kolkata City';
		this.retrieveData(this.state.type_id);
		this.updateDataInterval = setInterval(() => this.retrieveData(this.state.type_id), 60000);
		window.react_container.addEventListener('click', (event) => {console.log('closeFilterBox', event); this.closeFilterBox(event)});
		// this.props.history.push('');
			/*this.props.history.push(this.state.type_id && this.state.type_id != 0 ? '/devices/type/' + this.state.type_id + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : '') : '/devices' + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : ''));*/
	}

	/**
	 * Predefined function of ReactJS.
	 * Called every time after the component updates
	 * @param  {Object}
	 * @param  {Object}
	 * @return {void}
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('State prev', prevProps);
		console.log('State this', this.props);
		let parsed = queryString.parse(this.props.history.location.search);
		console.log('this.parsed_search update', parsed);
		if (((prevProps.location.pathname != this.props.location.pathname) || (prevProps.location.search != this.props.location.search)) && this.props.history.location.search == '' && this.props.history.location.pathname == '/devices') {
			console.log('component Updated', this.props.match.params.type_id);
			if (this.props.match.params.type_id) {
				this.callback(this.props.match.params.type_id, true);
			} else {
				this.callback('0', true);
			}
			this.queryCreate();
			/*this.props.history.push(this.state.type_id && this.state.type_id != 0 ? '/devices/type/' + this.state.type_id + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : '') : '/devices' + (this.state.selected_percent && this.state.selected_percent != '0%' ?'/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : ''));*/
		}
	}

	closeFilterBox(e) {
		const calenderModule = ReactDOM.findDOMNode(this.refs.filter_select);
		console.log('closing view_filter_box', this.refs.filter_select);
		if (calenderModule && !calenderModule.contains(event.target) && this.state.view_filter_box) {
			this.setState({
				view_filter_box: !this.state.view_filter_box
			});
		}
	}

	/**
	 * Predefined function of ReactJS.
	 * called before the component unmounts.
	 * @return {void}
	 */
	componentWillUnmount() {
		clearInterval(this.updateDataInterval);
		this.updateDataInterval = null;
		window.react_container.removeEventListener('click', (event) => {console.log('closeFilterBox', event); this.closeFilterBox(event)});
	}

	/**
	 * This function gets the devices under the selected device type. if none is selected, it retrieves all the devices.
	 * @param  {String}
	 * @param  {Boolean}
	 * @return {void}
	 */
	retrieveData(type, flag = false) {
		let that = this;
		let response_status;
		if (flag) {
			that.setState({
				loaded_data: false
			});
		}
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/devices/list' + (type && type != 0 ? '/' + type : ''), {
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
					unauthorised_access: true,
					unauthorised_access_msg: json.message
				});
			}
			else if (json.status === 'success') {
				let station_list = {};
				let device_type_object = {};
				let data_list = [];
				let online_count = 0,
					offline_count = 0,
					child = [];
				let device_list_id = [];
				if (json.device_types && json.device_types.length) {
					json.device_types.map((dev) => {
						device_list_id.push(dev.id);
						if (!device_type_object[dev.id]) {
							device_type_object[dev.id] = dev.name;
						} else {
							device_type_object[dev.id] = dev.name;
						}
						child.push({
							'title': dev.name,
							'value': dev.id,
							'key': dev.id
						});
					});
				}

				typeFilter = [{
					title: 'All',
					value: '0',
					key: '0',
					children: child
				}];

				/*let new_station_list = [];
				if (json.device_list && json.device_list.length) {
					json.device_list.map((station) => {
						if (station.status == 'online') {
							new_station_list.push(station);
						}
					});
				}*/
				if (json.device_list && json.device_list.length) {
					json.device_list.map((station) => {
						if (!station_list[station.id]) {
							station_list[station.id] = {};
							station_list[station.id] = {
								'qr_code': station.qr_code,
								'station_name': station.station_name
							};
						} else {
							station_list[station.id] = {
								'qr_code': station.qr_code,
								'station_name': station.station_name
							};
						}
						if (station.status == 'online') {
							online_count++;
						} else if (station.status == 'offline') {
							offline_count++;
						}
					});

					
					json.device_list.map((station,index) => {
						data_list.push({
							key: index+1,
							id: station.id,
							qr: station.qr_code,
							station: station.station_name,
							type: device_type_object[station.type],
							active: station.status.charAt(0).toUpperCase() + station.status.slice(1),
							health: 'ok',
							date: moment.unix(station.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
							timestamp: station.last_data_time,
							percent: station.online_percent,
						});
					});
				}

				/*if (new_station_list.length) {
					new_station_list.map((station,index) => {
						data_list.push({
							key: index+1,
							id: station.id,
							qr: station.qr_code,
							station: station.station_name,
							type: device_type_object[station.type],
							active: station.status.charAt(0).toUpperCase() + station.status.slice(1),
							health: 'ok',
							date: moment.unix(station.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
							timestamp: station.last_data_time,
							percent: station.online_percent,
						});
						if (station.status == 'online') {
							online_count++;
						} else if (station.status == 'offline') {
							offline_count++;
						}
					});
				}*/
				
				that.setState({
					unauthorised_access: false,
					loaded_data: true,
					error_API: false,
					device_list_id: device_list_id,
					error_API_msg: '',
					device_list: json.device_list, // new_station_list, //, for showing only online devices
					recent_activities: json.recent_activities,
					device_types: json.device_types,
					station_list: station_list,
					data_list: data_list,
					// table_data: table_data,
					device_type_object: device_type_object,
					online_count: online_count,
					offline_count: offline_count
				}, () => {
					console.log('data devices', that.state);
					console.log('ppppp filter', that.state.filter_type);
					console.log('ppppp status', that.state.selectStatus);
					console.log('ppppp search', that.state.table_search);
					that.queryCreate();
					that.setDeviceData();
				});
			} else {
				that.openNotification('error', json.message);
				let device_types = [];
				that.setState({
					unauthorised_access: false,
					loaded_data: true,
					error_API: true,
					error_API_msg: json.message,
					device_types: json.device_types,
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
	 * This function is used to search. Ant Design.
	 */
	handleSearch(selectedKeys, confirm) {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	}

	/**
	 * THis function sets the filtered list for tables according to the searched text.
	 * @param {String}
	 */
	setSearch(text) {
		let table_data = [],
			data_list = this.state.data_list.slice(0);
		let query = this.props.history.location.pathname;
		if (this.state.filtered_list && this.state.filtered_list.length && text != '') {
			this.state.filtered_list.map((st, index) => {
				if (text != '' && (st.station_name.toLowerCase().includes(decodeURI(encodeURI(text.toLowerCase()))) || st.qr_code.toLowerCase().includes(decodeURI(encodeURI(text.toLowerCase()))))) {
					table_data.push({
						key: index+1,
						id: st.id,
						qr: st.qr_code,
						station: st.station_name,
						type: this.state.device_type_object[st.type],
						active: st.status.charAt(0).toUpperCase() + st.status.slice(1),
						health: 'ok',
						date: moment.unix(st.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
						timestamp: st.last_data_time,
						percent: st.online_percent,
					});
				}
			});
		} else if (text == '') {
			table_data = this.state.filtered_data_list;
		}
		this.setState({
			table_data: table_data,
			table_search: decodeURI(encodeURI(text))
		}, () => {
			// this.props.history.push('');
			// this.props.history.push(query + (this.state.table_search != '' ? '?search=' + this.state.table_search : ''));
			this.queryCreate();
		});
	}

	clearSearchValue() {
		this.setState({
			table_search: ''
		}, () => {
			this.queryCreate();
		});
	}

	/**
	 * This function calls the notification alert.
	 * @param  {String}	type
	 * @param  {String}	msg
	 * @return {void}
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
	 * This function resets the filters. Ant Design.
	 */
	handleReset(clearFilters) {
		clearFilters();
		this.setState({ searchText: '' });
	}

	/**
	 * This function sets the type id in state.
	 * @param  {String}
	 * @param  {Boolean}
	 * @return {void}
	 */
	callback(key, update = false) {
		console.log('in callback',key);
		console.log('in callback',update);
		let search = this.state.table_search;
		let value = this.state.filter_type;
		if (key != '0') {
			value = [];
		}
		this.setState({
			type_id: key,
			table_search: update ? '' : search,
			filter_type: value,
			typeValue: value
		}, () => {
			this.queryCreate();
			// this.props.history.push('');
			/*this.props.history.push(this.state.type_id && this.state.type_id != 0 ? '/devices/type/' + this.state.type_id + (this.state.selected_percent && this.state.selected_percent != '0%' ? '/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : '') : '/devices' + (this.state.selected_percent && this.state.selected_percent != '0%' ? '/' + this.state.selected_percent.replace('%','') : '') + (this.state.table_search != '' ? '?search=' + this.state.table_search : ''));*/
			/*this.props.history.push(this.state.type_id && this.state.type_id != 0 ? 'devices/type/' + this.state.type_id : 'devices');*/
			this.retrieveData(this.state.type_id, true);
		});
	}

	/**
	 * Used in frontend designing.
	 */
	checkValue(value, record){
		console.log('hiiii_record', record);
		console.log('hiiii_value', value);
		console.log('contains', record.qr[0].toLowerCase().includes(value.toLowerCase()));
		if (record.qr && record.qr.length) {
			if (record.qr[0].toLowerCase().includes(value.toLowerCase()) || record.qr[1].toLowerCase().includes(value.toLowerCase())) {
				return true;
			}
		}
	}
	/**
	 * This function sets the filter in state to filter the table.
	 * @param {string} val offline, online or any.
	 */
	setSelect(val) {
		console.log('select', val);

		this.setState({
			selectStatus: val
		}, () => this.queryCreate());
	}
	/**
	 * This function sets the type filter value in the state to filter the table.
	 * @param  {Array} value Device Type
	 */
	onChangeType(value) {
		console.log('onChangeType', value);
		if (value.includes('0')) {
			value = this.state.device_list_id;
		}
		
		console.log('onChangeType', value);
		this.setState({
			typeValue: value,
			filter_type: value
		}, () => this.queryCreate());
	}

	onChangeStatusPercentage(val, label, extra) {
		console.log('treeSelect', val);
		console.log('treeSelect', label);
		console.log('treeSelect', extra);
		let percent_value = [], status_value = [], value = [];
		if (val.length) {
			val.map((v) => {
				if (v.split('-').length == 3) {
					if (v.split('-')[1] == 0) {
						percent_value.push(v.split('-')[2]);
					}
					if (v.split('-')[1] == 1) {
						status_value.push(v.split('-')[2]);
					}
				} else if (v.split('-').length == 2) {
					if (v.split('-')[1] == 0) {
						percent_value.push();
					}
					if (v.split('-')[1] == 1) {
						status_value.push();
					}
				}
			});
		}
		console.log('onChangePercent', percent_value);
		console.log('onChangeStatus', status_value);
		console.log('onChangeStatusPercent', value);
		this.setState({
			stprValue: val,
			selected_percent: percent_value,
			selectStatus: status_value
		}, () => this.queryCreate());
	}
	/**
	 * This function creates the query and pushes it to the history.
	 */
	queryCreate() {
		let temp_device_list = this.state.device_list.slice(0);
		console.log('ppppp filter', this.state.filter_type);
		console.log('ppppp status', this.state.selectStatus);
		console.log('ppppp search', this.state.table_search);
		this.props.history.push(this.state.type_id && this.state.type_id != 0 ? '/devices/type/' + this.state.type_id /*+ (this.state.selected_percent && this.state.selected_percent != '0%' ? '/' + this.state.selected_percent.replace('%','') : '') + */ + (this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0' ? '?type=[' + this.state.filter_type + ']' : '') 
			+ (this.state.selectStatus && this.state.selectStatus.length && this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0' ? '&status=[' + this.state.selectStatus + ']' : (this.state.selectStatus.length ? '?status=[' + this.state.selectStatus + ']' : ''))
			+ (this.state.selected_percent && this.state.selected_percent.length && this.state.selectStatus && this.state.selectStatus.length || ((this.state.selected_percent && this.state.selected_percent.length) && (this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0')) ? '&percent=[' + this.state.selected_percent + ']' : (this.state.selected_percent.length ? '?percent=[' + this.state.selected_percent + ']' : '')) 
			+ (this.state.table_search != '' && ((this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0') || (this.state.selectStatus && this.state.selectStatus.length) || (this.state.selected_percent && this.state.selected_percent.length)) ? '&search=' + this.state.table_search : (this.state.table_search != '' ? '?search=' + this.state.table_search : '')) 

			: 

			'/devices/' /*+ (this.state.selected_percent && this.state.selected_percent != '0%' ? '/' + this.state.selected_percent.replace('%','') : '') + */ + (this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0' ? '?type=[' + this.state.filter_type + ']' : '') 

			+ (this.state.selectStatus && this.state.selectStatus.length && this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0' ? '&status=[' + this.state.selectStatus + ']' : (this.state.selectStatus.length ? '?status=[' + this.state.selectStatus + ']' : ''))

			+ (this.state.selected_percent && this.state.selected_percent.length && this.state.selectStatus && this.state.selectStatus.length || ((this.state.selected_percent && this.state.selected_percent.length) && (this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0')) ? '&percent=[' + this.state.selected_percent + ']' : (this.state.selected_percent.length ? '?percent=[' + this.state.selected_percent + ']' : ''))

			+ (this.state.table_search != '' && ((this.state.filter_type && this.state.filter_type.length && this.state.filter_type[0] != '0') || (this.state.selectStatus && this.state.selectStatus.length) || (this.state.selected_percent && this.state.selected_percent.length)) ? '&search=' + this.state.table_search : (this.state.table_search != '' ? '?search=' + this.state.table_search : '')));

		let filtered_list = [];
		if (this.state.filter_type && this.state.filter_type.length) {
			if (temp_device_list && temp_device_list.length) {
				temp_device_list.map((device_type) => {
					if (device_type.type && device_type.type != '' && this.state.filter_type.includes(device_type.type)) {
						filtered_list.push(device_type);
					}
				});
			}
		} else if (this.state.filter_type && this.state.filter_type.length == 0) {
			filtered_list = temp_device_list;
		}
		let condition='';
		if (this.state.selected_percent && this.state.selected_percent.length) {
			let filtered_list_temp = [];
			this.state.selected_percent.map((percnt, pind) => {
				temp_device_list.map((data, index) => {
					if (percnt == 0) {
						condition = data.online_percent > 90;
					} else if (percnt == 1) {
						condition = data.online_percent > 60 && data.online_percent <= 90;
					} else if (percnt == 2) {
						condition = data.online_percent > 0 && data.online_percent <= 60;
					} else if (percnt == 3) {
						condition = data.online_percent == 0;
					}
					console.log('condition', condition);
					if (_.some(temp_device_list, data) && condition) {
						filtered_list_temp.push(data);
					}
				});
			});
			filtered_list = filtered_list_temp;
		}

		if (this.state.selectStatus && this.state.selectStatus.length) {
			let status = '';
			if (this.state.selectStatus.includes('0') && this.state.selectStatus.includes('1')) {
				status = 'any';
			} else if (this.state.selectStatus.includes('0')) {
				status = 'online';
				filtered_list = _.filter(filtered_list, ['status', status]);
			} else if (this.state.selectStatus.includes('1')) {
				status = 'offline';
				filtered_list = _.filter(filtered_list, ['status', status]);
			}
		}

		let filtered_data_list = [];
		if (filtered_list.length) {
			filtered_list.map((station,index) => {
				filtered_data_list.push({
					key: index+1,
					id: station.id,
					qr: station.qr_code,
					station: station.station_name,
					type: this.state.device_type_object[station.type],
					active: station.status.charAt(0).toUpperCase() + station.status.slice(1),
					health: 'ok',
					date: moment.unix(station.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
					timestamp: station.last_data_time,
					percent: station.online_percent,
				});
			});

		}

		console.log('abc2');

		this.setState({
			filtered_list: filtered_list,
			filtered_data_list: filtered_data_list
		}, () => this.searchedList());
	}
	/**
	 * This function searched for the entered string in the table data.
	 */
	searchedList() {
		let table_data =[];
		let condition='', filtered_type_data='';
		if (this.state.filtered_list && this.state.filtered_list.length && this.state.table_search != '') {
			this.state.filtered_list.map((st, index) => {
				if (this.state.table_search != '' && (st.station_name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || st.qr_code.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))))) {
					table_data.push({
						key: index+1,
						id: st.id,
						qr: st.qr_code,
						station: st.station_name,
						type: this.state.device_type_object[st.type],
						active: st.status.charAt(0).toUpperCase() + st.status.slice(1),
						health: 'ok',
						date: moment.unix(st.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
						timestamp: st.last_data_time,
						percent: st.online_percent,
					});
				}
			});
		} else if (this.state.table_search == '') {
			table_data = this.state.filtered_data_list;
		}

		console.log('abc3');

		this.setState({
			table_data: table_data
		},() => {
			console.log('this.state.table_data', this.state.table_data);
			// this.graphClickFilter('', false);
		});
	}

	graphClickFilter(value, reset=false) {
		let table_data =[];
		let condition='', filtered_type_data='';
		if (this.state.filtered_list && this.state.filtered_list.length) {
			if (value) {
				this.state.filtered_list.map((st, index) => {
					if (value == '90') {
						condition = st.online_percent > 90;
						filtered_type_data = '>90%';
					} else if (value == '90-60') {
						condition = st.online_percent > 60 && st.online_percent <= 90;
						filtered_type_data = '>90-60%';
					} else if (value == '60') {
						condition = st.online_percent > 0 && st.online_percent <= 60;
						filtered_type_data = '<60%';
					} else if (value == '0') {
						condition = st.online_percent == 0;
						filtered_type_data = '0';
					}
					console.log('condition', condition);
					if (reset) {
						table_data.push({
							key: index+1,
							id: st.id,
							qr: st.qr_code,
							station: st.station_name,
							type: this.state.device_type_object[st.type],
							active: st.status.charAt(0).toUpperCase() + st.status.slice(1),
							health: 'ok',
							date: moment.unix(st.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
							timestamp: st.last_data_time,
							percent: st.online_percent,
						});
						// filtered_list.push(st);
					} else {
						if (condition) {
							table_data.push({
								key: index+1,
								id: st.id,
								qr: st.qr_code,
								station: st.station_name,
								type: this.state.device_type_object[st.type],
								active: st.status.charAt(0).toUpperCase() + st.status.slice(1),
								health: 'ok',
								date: moment.unix(st.last_data_time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
								timestamp: st.last_data_time,
								percent: st.online_percent,
							});
							// filtered_list.push(st);
						}
					}
				});
			}
		}

		if (reset) {
			this.setState({reset_btn: false});
		}

		this.setState({
			table_data: table_data,
			temp_table_data: table_data,
			current_filter_value: value,
			filtered_type_data: filtered_type_data,
			reset_btn: true
		});
	}

	changeFilterOption() {
		setTimeout(() => this.setState({view_filter_box: !this.state.view_filter_box}), 60);
		// this.setState({view_filter_box: !this.state.view_filter_box});
	}

	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render () {
		const typeProps = {
			treeData: typeFilter,
			value: this.state.typeValue,
			// onChange: (value) => this.onChangeType(value),
			disabled: this.state.type_id != '0',
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Type',
		};
		const statusPercentProps = {
			treeData: percent_status,
			value: this.state.stprValue,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Status',
		};
		const columns = [
			{
				title: <span><span style={{ 'vertical-align': 'middle' }}>Status</span><Popover content={
						<div>
							<div>
								<img src="https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/online_icon_circle.svg" className="status-img-label" style={{ 'width': '15px', 'vertical-align': 'middle' }} />
								<span className="label-text" style={{ 'vertical-align': 'middle' }}> Online</span>
							</div>
							<div>
								<img src="https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/offline_icon_circle.svg" className="status-img-label" style={{ 'width': '15px', 'vertical-align': 'middle' }} />
								<span className="label-text" style={{ 'vertical-align': 'middle' }}> Offline</span>
							</div>
						</div>
					}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg></Popover></span>,
				width: 80,
				key: 'active',
				align: 'center',
				render: (a,b) => (
					<Tooltip placement="top" title={b.active}>
						<img src={b.active == 'Online' ? 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/online_icon_circle.svg' : 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/offline_icon_circle.svg'} className="status-img" />
					</Tooltip>
				),
			}, {
				title: 'QR Code',
				dataIndex: 'qr',
				width: 150,
				key: 'qr',
				sorter: (a, b) => {
					return (a.qr && b.qr && a.qr != '' && b.qr != '' && a.qr.toLowerCase() !== b.qr.toLowerCase() ? ((a.qr.toLowerCase() < b.qr.toLowerCase()) ? -1 : 1) : 0);
				},
				/*render: (arr) => (
					<div>
						<div>{arr[0]}</div>
						<div>{arr[1] || ''}</div>
					</div>
				),*/
				/*filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div className="custom-filter-dropdown">
						<Input
							ref={ele => this.searchInput = ele}
							placeholder="Search type"
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
						/>
						<Button type="primary" onClick={() => this.handleSearch(selectedKeys, confirm)}>Search</Button>
						<Button onClick={() => this.handleReset(clearFilters)}>Reset</Button>
					</div>
				),
				filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
				onFilter: (value, record) => this.checkValue(value, record),
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) {
						setTimeout(() => {
							this.searchInput.focus();
						});
					}
				},
				render: (text) => {
					const { searchText } = this.state;
					console.log('de_data', text);
					return searchText ? (
						<div>
							<div>
								{text[0].split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
									fragment.toLowerCase() === searchText.toLowerCase()
										? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
								))}
							</div>
							<div>
								{text[1].split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
									fragment.toLowerCase() === searchText.toLowerCase()
										? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
								))}
							</div>
						</div>
					) : <div><div>{text[0]}</div><div>{text[1]}</div></div>;
				},*/
			}, {
				title: 'Name',
				width: 200,
				dataIndex: 'station',
				key: 'station',
				sorter: (a, b) => {
					if (a.station == '') {
						return 1;
					} else if (b.station == '') {
						return -1;
					} else {
						return (a.station && b.station && a.station != '' && b.station != '' && a.station.toLowerCase() !== b.station.toLowerCase() ? ((a.station.toLowerCase() < b.station.toLowerCase()) ? -1 : 1) : 0);
					}
				},
				/*filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div className="custom-filter-dropdown">
						<Input
							ref={ele => this.searchInput = ele}
							placeholder="Search type"
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={this.handleSearch(selectedKeys, confirm)}
						/>
						<Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>Search</Button>
						<Button onClick={this.handleReset(clearFilters)}>Reset</Button>
					</div>
				),
				filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
				onFilter: (value, record) => record.station.toLowerCase().includes(value.toLowerCase()),
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) {
						setTimeout(() => {
							this.searchInput.focus();
						});
					}
				},
				render: (text) => {
					const { searchText } = this.state;
					return searchText ? (
						<span>
							{text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
								fragment.toLowerCase() === searchText.toLowerCase()
									? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
							))}
						</span>
					) : text;
				},*/
			}, {
				title: 'Type',
				width: 100,
				dataIndex: 'type',
				key: 'type',
				sorter: (a, b) => {
					return (a.type && b.type && a.type != '' && b.type != '' && a.type.toLowerCase() !== b.type.toLowerCase() ? ((a.type.toLowerCase() < b.type.toLowerCase()) ? -1 : 1) : 0);
				},
				/*filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div className="custom-filter-dropdown">
						<Input
							ref={ele => this.searchInput = ele}
							placeholder="Search type"
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
						/>
						<Button type="primary" onClick={() => this.handleSearch(selectedKeys, confirm)}>Search</Button>
						<Button onClick={() => this.handleReset(clearFilters)}>Reset</Button>
					</div>
				),
				filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
				onFilter: (value, record) => record.type.toLowerCase().includes(value.toLowerCase()),
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) {
						setTimeout(() => {
							this.searchInput.focus();
						});
					}
				},
				render: (text) => {
					const { searchText } = this.state;
					return searchText ? (
						<span>
							{text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
								fragment.toLowerCase() === searchText.toLowerCase()
									? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
							))}
						</span>
					) : text;
				},*/
			},
			{
				title: 'Last Data Received',
				dataIndex: 'date',
				width: 150,
				key: 'date',
				sorter: (a, b) => a.timestamp - b.timestamp,
			},
			{
				title: 'Online %',
				dataIndex: 'percent',
				width: 100,
				align: 'center',
				key: 'percent',
				sorter: (a, b) => a.percent - b.percent,
			},
			 /*{
				title: 'Active',
				dataIndex: 'active',
				width: 100,
				key: 'active',
			}, {
				title: 'Sync',
				width: 100,
				key: 'sync',
				render: () => (
					<Tooltip placement="top" title={sync_text}>
						<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##sync_green.svg" />
					</Tooltip>
				),
			}, {
				title: 'Health',
				dataIndex: 'health',
				width: 100,
				key: 'health',
				render: () => (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448.8 448.8" width="16"><path fill="#18BC9C" d="M142.8 324l-107-107.2L0 252.4l142.8 143 306-306-35.7-36"/></svg>
					)
			}*/
		];
	
		return (
			<div id="device">
				<Side active_link="device" />
				<Head/>
				{(() => {
					if (this.state.device_list /*&& this.state.device_list.length*/ && this.state.filtered_device_list && this.state.loaded_data) {
						let filtered_device = [];
						return <Layout className="contains">
							<Layout>

								<Content className="contain">
									<div className="tab-container">
										<div role="tablist" className="station-tabs-bar">
											<div className="station-tabs-nav-scroll">
												<div className="station-tabs-nav station-tabs-nav-animated">
													<div>
														<div data-tip="All devices" role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.state.type_id && this.state.type_id == '0' ? ' station-tabs-tab-active' : '')} onClick={() => this.callback('0')}>All</div>
														{(() => {
															if (this.state.device_types && this.state.device_types.length) {
																return this.state.device_types.map((device, index) => {
																	return <div data-tip={this.state.type_desc[device.name]} role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.state.type_id && this.state.type_id == device.id ? ' station-tabs-tab-active' : '')} onClick={() => this.callback(device.id)}>{device.name}</div>
																}).filter(Boolean);
															}
														})()}
														{/*<div role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/stations/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('station')}>Station</div>
														<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/station-groups/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('stationGroup')}>Station Group</div>*/}
													</div>
													<div className="blank-border"></div>
												</div>
												<ReactTooltip effect="solid" />
											</div>
										</div>
										{/*<Tabs activeKey={this.state.type_id} onChange={(e) => this.callback(e)} type="card">
											<TabPane tab="All" key="0"></TabPane>
											{(() => {
												if (this.state.device_types && this.state.device_types.length) {
													return this.state.device_types.map((device, index) => {
														return <TabPane tab={device.name} key={device.id}></TabPane>
													}).filter(Boolean);
												}
											})()}
										</Tabs>*/}
									</div>
									<Row type="flex" justify="space-around" className="device-details">
										<Col span={7} className="width-100">
											<div className="pie-text">Total Number of Devices -
												<span className="online-device">{' ' +this.state.device_list.length}</span>
												<span> </span>
												(<span className="success">{this.state.online_count + ' '}</span>/<span className="danger">{' ' + this.state.offline_count}</span>)
											</div>
											{(() => {
												if (this.state.device_list && this.state.device_list) {
													return <DeviceChart graphClickFilter={(val, reset) => {this.graphClickFilter(val, reset)}} selected_percent={this.state.selected_percent} setSelected={(key) => this.setSelected(key)} device_list={this.state.device_list} />;
												}
											})()}
											{/*<ReactHighcharts config={config} ref="chart"></ReactHighcharts>*/}
										</Col>
										{/*(() => {
											if (this.state.filtered_device_list && this.state.filtered_device_list.length) {
												filtered_device = this.state.filtered_device_list.map((device, index) => {
													return <div className="device-names">{(device.station_name != '' ? device.station_name : device.qr_code) + ' - ' + device.online_percent + '%'}</div>
												}).filter(Boolean);
											}
										})()*/}
										{/*<Col span={6} className="pie-details">
											<Card 
											title={(this.state.selected_percent == '>90%' ? '>90% Online' : (this.state.selected_percent == '90-60%' ? '90-60% Online' : (this.state.selected_percent == '<60%' ? '<60% Online' : 'Offline Devices')))} 
											className="back-grey"
											extra={
												<div className="count">
													{filtered_device.length}
												</div>
											}>
												<div className="device-name-container">
													{(() => {
														if (filtered_device && filtered_device.length) {
															return filtered_device;
														} else {
															return <div className="center-text">No Device Found</div>;
														}
													})()}
													{<div className="device-names">Device-1</div>
													<div className="device-names">Device-2</div>
													<div className="device-names">Device-3</div>
													<div className="device-names">Device-4</div>
													<div className="device-names">Device-5</div>
													<div className="device-names">Device-6</div>
													<div className="device-names">Device-7</div>
													<div className="device-names">Device-8</div>
													<div className="device-names">Device-9</div>
													<div className="device-names">Device-10</div>
													<div className="device-names">Device-11</div>
													<div className="device-names">Device-12</div>
													<div className="device-names">Device-13</div>
													<div className="device-names">Device-14</div>
													<div className="device-names">Device-15</div>}
												</div>
											</Card>
										</Col>*/}
										<Col span={8} className="activity-details">
											<Card title="Recent Activities" className="back-grey">
												<div className="activity-container">
												{(() => {
													if (this.state.recent_activities && this.state.recent_activities.length && this.state.station_list && Object.values(this.state.station_list).length) {
														return this.state.recent_activities.map((device) => {
															return <Row type="flex" justify="space-between" className="activities">
																<Col span={10}>{this.state.station_list[device.id].station_name != '' ? this.state.station_list[device.id].station_name : this.state.station_list[device.id].qr_code}</Col>
																<Col span={4} className={device.status == 'online' ? 'success' : 'danger'}>{device.status.charAt(0).toUpperCase() + device.status.slice(1)}</Col>
																<Col span={8}>{moment.unix(device.timestamp).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</Col>
															</Row>;
														}).filter(Boolean);
													}
												})()}
													{/*<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-1</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-2</Col>
														<Col span={4} className="danger">Offline</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-3</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-4</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-5</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-6</Col>
														<Col span={4} className="danger">Offline</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-7</Col>
														<Col span={4} className="danger">Offline</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-8</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-9</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-10</Col>
														<Col span={4} className="success">Online</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>
													<Row type="flex" justify="space-between" className="activities">
														<Col span={6}>Device-11</Col>
														<Col span={4} className="danger">Offline</Col>
														<Col span={8}>11:50, 31 Aug</Col>
													</Row>*/}
												</div>
											</Card>
										</Col>
										<Col span={7} className="type-details">
											<Card 
											title="Device Type Info" 
											className="back-grey"
											>
												<div className="device-name-container">
													{(() => {
														if (this.state.type_desc && Object.keys(this.state.type_desc).length) {
															return Object.keys(this.state.type_desc).map((type) => {
																return <div className="description"><div className="type-name">{type + ' : '}</div><div className="type-description">{this.state.type_desc[type]}</div></div>;
															});
														}
													})()}
													{/*<div>Details of Device type A</div>
													<div>Details of Device type A1</div>
													<div>Details of Device type B</div>
													<div>Details of Device type C</div>
													<div>Details of Device type D</div>
													<div>Details of Device type E</div>
													<div>Details of Device type F</div>
													<div>Details of Device type G</div>*/}
												</div>
											</Card>
										</Col>
									</Row>
								</Content>
							</Layout>
						
							<Layout className="table-contain">
								<Content>
									{/*<Row type="flex" justify="space-around" className="filter-contain" align="middle">
										<Col span={1} className="center">
											<Icon type="filter" className="grid" />
										</Col>
										<Col span={23}>
											<span className="filters mar-left-15">All Device</span>
											<span className="filters">Online</span>
											<span className="filters">Offline</span>
										</Col>
									</Row>*/}
									{/*<span className="filter-icon-main" onClick={() => {this.changeFilterOption()}}>
										<Tooltip title="Click to apply filter">
											<Icon type="filter" theme={'filled'} />
										</Tooltip>
									</span>*/}
									{(() => {
										if (this.state.view_filter_box) {
											return <div  ref={'filter_select'} className={'filter-select-wrapper' + (this.state.view_filter_box ? ' open' : '')}>
												<div className="triangle-icon"></div>
												<div className="filter-inner-wraper">
													<div className="filter-tab">
														<div className="filter-title">Status</div>
														<div className="filter-options">
															{/*<Select
																showSearch
																placeholder="Status"
																optionFilterProp="children"
																defaultValue={this.state.selectStatus}
																filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
																onChange={(val) => this.setSelect(val)}
															>
																<Option value="any">Any</Option>
																<Option value="online">Online</Option>
																<Option value="offline">Offline</Option>
															</Select>*/}
															<TreeSelect treeDefaultExpandAll onChange={(value, label, extra) => this.onChangeStatusPercentage(value, label, extra)} showSearch {...statusPercentProps} className="filter-icon" />
														</div>
													</div>
													<div className="filter-tab">
														<div className="filter-title">Type</div>
														<div className="filter-options">
															<TreeSelect treeDefaultExpandAll onChange={(value) => this.onChangeType(value)} showSearch {...typeProps} className="filter-icon" />
														</div>
													</div>
												</div>
											</div>;
										}
									})()}
									{/*<div className="table-head table-head-inline">{this.state.type_id == 0 ? 'All Devices' : ('Type ' + (this.state.device_type_object[this.state.type_id]) + ' Devices')}</div>*/}
									<div className="table-filter"><TreeSelect treeDefaultExpandAll dropdownClassName="small-font-size" onChange={(value, label, extra) => this.onChangeStatusPercentage(value, label, extra)} showSearch {...statusPercentProps} className="filter-icon filter-display" /></div>
									<div className="table-filter"><TreeSelect treeDefaultExpandAll dropdownClassName="small-font-size" onChange={(value) => this.onChangeType(value)} showSearch {...typeProps} className="filter-icon filter-display" /></div>
									<div className="table-search">
										<Input className={'filter-search-display' + (this.state.table_search ? ' active-search' : '')} placeholder="Search" prefix={<Icon type="search" />} value={decodeURI(this.state.table_search)}
										onChange={(e) => this.setSearch(e.target.value)} suffix={this.state.table_search ? <Icon className="close-icon" type="close" onClick={() => {this.clearSearchValue()}} /> : ''} />
									</div>
									{(() => {
										if ((this.state.stprValue && this.state.stprValue.length) || (this.state.typeValue && this.state.typeValue.length)) {
											return <div className="section-filter-wrapper">
												{(() => {
													if (this.state.stprValue && this.state.stprValue.length) {
														return <TreeSelect treeDefaultExpandAll onChange={(value, label, extra) => this.onChangeStatusPercentage(value, label, extra)} dropdownClassName="status-dropdown" showSearch {...statusPercentProps} className="select-filter online-status" />;
													}
												})()}
												{(() => {
													if (this.state.typeValue && this.state.typeValue.length) {
														return <TreeSelect treeDefaultExpandAll onChange={(value) => this.onChangeType(value)} dropdownClassName="status-dropdown" showSearch {...typeProps} className="select-filter device-type" />;
													}
												})()}
											</div>;
										}
									})()}
									{(() => {
										if (this.state.table_data && this.state.table_data.length) {
											if (this.state.table_data.length == this.state.device_list.length) {
												return <div className={'device-count-wrapper' + ((this.state.stprValue && this.state.stprValue.length) || (this.state.typeValue && this.state.typeValue.length) ? '' : ' active-view')}>
													Total devices <span className="count-total">{this.state.device_list.length}</span>
												</div>;
											} else {
												return <div className={'device-count-wrapper' + ((this.state.stprValue && this.state.stprValue.length) || (this.state.typeValue && this.state.typeValue.length) ? '' : ' active-view')}>
													Showing <span className="count-display">{this.state.table_data.length}</span> of <span className="count-total">{this.state.device_list.length}</span>
												</div>;
											}
										}
									})()}
									
									{/*<Search
										className="select-icon search-input"
										placeholder="Search by Station Name or Device QR Code"
										value={decodeURI(this.state.table_search)}
										onChange={(e) => this.setSearch(e.target.value)}
										className="table-search"
									/>*/}
									<Row>
										<Table locale={{emptyText: 'No Devices Found!' }} columns={columns} pagination={true} dataSource={this.state.table_data} />
									</Row>
								</Content>	
							</Layout>
						</Layout>;
					} else if (this.state.device_list && this.state.device_list.length == 0 && this.state.loaded_data) {
						return <Layout className="contains">
							<Layout>

								<Content className="contain">
									<div className="tab-container">
										<Tabs activeKey={this.state.type_id} onChange={(e) => this.callback(e)} type="card">
											<TabPane tab="All" key="0"></TabPane>
											{(() => {
												if (this.state.device_types && this.state.device_types.length) {
													return this.state.device_types.map((device, index) => {
														return <TabPane tab={device.name} key={device.id}></TabPane>
													}).filter(Boolean);
												}
											})()}
											{/*<TabPane tab="A" key="a"></TabPane>
											<TabPane tab="A1" key="a1"></TabPane>
											<TabPane tab="B" key="b"></TabPane>
											<TabPane tab="C" key="c"></TabPane>
											<TabPane tab="D" key="d"></TabPane>
											<TabPane tab="E" key="e"></TabPane>
											<TabPane tab="F" key="f"></TabPane>
											<TabPane tab="G" key="g"></TabPane>*/}
										</Tabs>
									</div>
									<Row type="flex" justify="space-around" className="device-details">
										<div className="no-data-text">No Devices Found!</div>
									</Row>
								</Content>
							</Layout>
						</Layout>;
					} else if (this.state.error_API && this.state.loaded_data) {
						return <Layout className="contains">
							<Layout>

								<Content className="contain">
									<div className="tab-container">
										<Tabs activeKey={this.state.type_id} onChange={(e) => this.callback(e)} type="card">
											<TabPane tab="All" key="0"></TabPane>
											{(() => {
												if (this.state.device_types && this.state.device_types.length) {
													return this.state.device_types.map((device, index) => {
														return <TabPane tab={device.name} key={device.id}></TabPane>
													}).filter(Boolean);
												}
											})()}
											{/*<TabPane tab="A" key="a"></TabPane>
											<TabPane tab="A1" key="a1"></TabPane>
											<TabPane tab="B" key="b"></TabPane>
											<TabPane tab="C" key="c"></TabPane>
											<TabPane tab="D" key="d"></TabPane>
											<TabPane tab="E" key="e"></TabPane>
											<TabPane tab="F" key="f"></TabPane>
											<TabPane tab="G" key="g"></TabPane>*/}
										</Tabs>
									</div>
									<Row type="flex" justify="space-around" className="device-details">
										<div className="no-data-text">{this.state.error_API_msg}</div>
									</Row>
								</Content>
							</Layout>
						</Layout>;
					} else if (this.state.unauthorised_access) {
						return <Layout className="contains">
							<Layout>

								<Content className="contain">
									<div className="tab-container">
										<Tabs activeKey={this.state.type_id} onChange={(e) => this.callback(e)} type="card">
											<TabPane tab="All" key="0"></TabPane>
											{(() => {
												if (this.state.device_types && this.state.device_types.length) {
													return this.state.device_types.map((device, index) => {
														return <TabPane tab={device.name} key={device.id}></TabPane>
													}).filter(Boolean);
												}
											})()}
											{/*<TabPane tab="A" key="a"></TabPane>
											<TabPane tab="A1" key="a1"></TabPane>
											<TabPane tab="B" key="b"></TabPane>
											<TabPane tab="C" key="c"></TabPane>
											<TabPane tab="D" key="d"></TabPane>
											<TabPane tab="E" key="e"></TabPane>
											<TabPane tab="F" key="f"></TabPane>
											<TabPane tab="G" key="g"></TabPane>*/}
										</Tabs>
									</div>
									<Row type="flex" justify="space-around" className="device-details">
										<div className="no-data-text">
											<Alert
												message="Access Denied"
												description={this.state.unauthorised_access_msg}
												type="error"
											/>
										</div>
									</Row>
								</Content>
							</Layout>
						</Layout>;
					} else {
						return <Layout className="contains">
							<Loading inline={true}/>
						</Layout>;
					}
				})()}
			</div>
		);
		
	}
}