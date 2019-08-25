import React from 'react';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Tooltip, Menu, DatePicker, notification, Alert } from 'antd';
// import './map.less';
import Head from './imports/Head';
import Side from './imports/Side';
import MapViewMap from './imports/MapViewMap';
import Loading from './imports/Loading';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import moment from 'moment-timezone';


const google = window.google;

const TabPane = Tabs.TabPane;

const mapMenu = Menu.SubMenu;

const { RangePicker } = DatePicker;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let treeData_layer = [
/*{
	title: 'Layers',
	value: '0-21',
	key: '0-21',
	children: [
		{
			title: 'A_Water Logging',
			value: '0-21-31',
			key: '0-21-31',
		}, {
			title: 'A_INDIA_KOLKATA_LULC_CURREN',
			value: '0-21-32',
			key: '0-21-32',
		}, {
			title: 'Borough Boundary',
			value: '0-21-33',
			key: '0-21-33',
		}, {
			title: 'L_Water Logging',
			value: '0-21-34',
			key: '0-21-34',
		}, {
			title: 'P_Water Logging',
			value: '0-21-35',
			key: '0-21-35',
		}, {
			title: 'Ward Boundary',
			value: '0-21-36',
			key: '0-21-36',
		}
	]
}*/];
let treeData = [/*{
	title: 'Air Quality',
	value: '0-0',
	key: '0-0',
	children: [{
		title: 'Major Road Junction',
		value: '0-0-0',
		key: '0-0-0',
	}, {
		title: 'Street / Shop / House Front',
		value: '0-0-1',
		key: '0-0-1',
	}],
}, {
	title: 'Flood',
	value: '0-1',
	key: '0-1',
	children: [{
		title: 'Pump Station',
		value: '0-1-0',
		key: '0-1-0',
	}, {
		title: 'Open Canal',
		value: '0-1-1',
		key: '0-1-1',
	}, {
		title: 'Gated Canal',
		value: '0-1-2',
		key: '0-1-2',
	}, {
		title: 'Street',
		value: '0-1-3',
		key: '0-1-3',
	}, {
		title: 'Rainfall',
		value: '0-1-4',
		key: '0-1-4',
	}],
}, {
	title: 'Vehicle Tracking',
	value: '0-2',
	key: '0-2',
	children: [{
		title: 'Bus',
		value: '0-2-0',
		key: '0-2-0',
	}],
}*/];

function callback(key) {
	console.log(key);
}


const { Content, Footer } = Layout;

const Option = Select.Option;

function handleChange(value) {
	console.log(`selected ${value}`);
}

function handleBlur() {
	console.log('blur');
}

function handleFocus() {
	console.log('focus');
}
/**
 * Main component of the scenarios page.
 */
export default class MapView extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @property {Array} value stores the selected category or subcategory.
		* @property {Array} value_layer stores the selected layers.
		* @property {string} station_id stores the selected station id.
		* @property {Array} category_selected Stores the selected categories.
		* @property {Array} sub_category_selected Stores the selected sub-categories.
		* @property {Array} layer_array Stores the selected GIS layers.
		*/
		this.state = {
			visible: true,
			value: [/*'0-0-0'*/],
			value_layer: [],
			station_id: '',
			category_selected: props.location.search ? (props.location.search.split('&')[0].split('=')[0].search('cat') != -1 && props.location.search.split('&')[1] && props.location.search.split('&')[1].search('subcat') != -1 && props.location.search.split('&')[0].split('=')[1] ? JSON.parse(props.location.search.split('&')[0].split('=')[1]) : [2]) : [2],
			sub_category_selected: props.location.search ? (props.location.search.split('&')[0].search('subcat') != -1 ? [] : props.location.search.split('&')[1] && props.location.search.split('&')[1].search('subcat') != -1 ? JSON.parse(props.location.search.split('&')[1].split('=')[1]) : []) : [],
			layer_array: props.location.search ? (props.location.search.split('layers=').length == 2 ? JSON.parse(props.location.search.split('layers=')[1]).map(String) : []) : [],
			history: props.history,
			unauthorised_access: false,
			unauthorised_access_msg: ''
		};
		/**
		 * This is used to update the data by calling the API in fixed interval.
		 */
		this.updateDataInterval = null;

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
			console.log('response_status',response_status);
			if (response_status == 403) {
				that.setState({
					unauthorised_access: true,
					unauthorised_access_msg: json.message
				});
			}
			else if (json.status === 'success') {
				console.log('category_list:', json.category_list);
				treeData = [];
				treeData_layer = [];
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
				console.log('treeData_layer', treeData_layer);
				treeData_layer.push({
					title: 'Layers',
					value: '0-21',
					key: '0-21',
					children: [
						 {
							title: 'Borough Boundary',
							value: '0-21-31',
							key: '0-21-31',
						}, /*{
							title: 'L_Water Logging',
							value: '0-21-34',
							key: '0-21-34',
						}, {
							title: 'P_Water Logging',
							value: '0-21-35',
							key: '0-21-35',
						},*/ {
							title: 'Ward Boundary',
							value: '0-21-32',
							key: '0-21-32',
						}, {
							title: 'Water Logging',
							value: '0-21-33',
							key: '0-21-33',
						}, {
							title: 'A_INDIA_KOLKATA_LULC_CURRENT',
							value: '0-21-34',
							key: '0-21-34',
						}, {
							title: '100mm IIF 2',
							value: '0-21-35',
							key: '0-21-35',
						}, {
							title: '200mm IIF 2',
							value: '0-21-36',
							key: '0-21-36',
						}, {
							title: '300mm IIF 2',
							value: '0-21-37',
							key: '0-21-37',
						}, {
							title: '400mm IIF 2',
							value: '0-21-38',
							key: '0-21-38',
						}, {
							title: 'Surge3m IIF 2',
							value: '0-21-39',
							key: '0-21-39',
						}, {
							title: 'Surge5m IIF 2',
							value: '0-21-40',
							key: '0-21-40',
						}
					]
				});
				console.log('treeData_layer', treeData_layer);
				let value = [];
				let value_layer = [];
				/*if (treeData && treeData.length) {
					value.push(treeData[0].children[0].value);
				}*/
				if (that.state.category_selected && that.state.category_selected.length) {
					that.state.category_selected.map((cat) => {
						value.push('0-' + cat);
					});
				} 
				if (that.state.sub_category_selected && that.state.sub_category_selected.length) {
					let tree_node_data = [];
					that.state.sub_category_selected.map((node) => {
						if (treeData && treeData.length) {
							treeData.map((tree) => {
								if (tree.children && tree.children.length) {
									tree.children.map((tree_node) => {
										tree_node_data.push(tree_node.value);
									});
								}
							});
						}
						if (tree_node_data && tree_node_data.length) {
							tree_node_data.map((st) => {
								if (st.split('-')[2] == node) {
									value.push(st);
								}
							});
						}
					});
				}
				if (that.state.layer_array && that.state.layer_array.length) {
					that.state.layer_array.map((layer) => {
						value_layer.push('0-21-' + layer);
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
					unauthorised_access: false,
					category_list: category_list,
					treeData: treeData,
					sub_category_object: sub_category_object,
					treeData_layer: treeData_layer,
					value_layer: value_layer,
					value: value
				}, () => {
					console.log('treeData', that.state.treeData_layer);
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
				/*that.setState({
					unauthorised_access: false
				});*/
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}
	/**
	 * This function sets the value of TreeSelect to its default value.
	 */
	defaultValue() {
		let value = [];
		let value_layer = [];
		/*if (treeData && treeData.length) {
			value.push(treeData[0].children[0].value);
		}*/
		if (this.state.category_selected && this.state.category_selected.length) {
			this.state.category_selected.map((cat) => {
				value.push('0-' + cat);
			});
		} 
		if (this.state.sub_category_selected && this.state.sub_category_selected.length) {
			let tree_node_data = [];
			this.state.sub_category_selected.map((node) => {
				if (treeData && treeData.length) {
					treeData.map((tree) => {
						if (tree.children && tree.children.length) {
							tree.children.map((tree_node) => {
								tree_node_data.push(tree_node.value);
							});
						}
					});
				}
				if (tree_node_data && tree_node_data.length) {
					tree_node_data.map((st) => {
						if (st.split('-')[2] == node) {
							value.push(st);
						}
					});
				}
			});
		}
		if (this.state.layer_array && this.state.layer_array.length) {
			that.state.layer_array.map((layer) => {
				value_layer.push('0-21-' + layer);
			});
		}

		this.setState({
			value: value,
			value_layer: value_layer
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
			console.log('Dashboard:', json);
			// response_status = 403;
			if (response_status == 403) {
				console.log('response_status', response_status);
				that.setState({
					unauthorised_access: true,
					unauthorised_access_msg: json.message
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
				/*let new_station_list = [];
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						if ((station.last_data_send != 0) && (station.last_data_send !== null) && (station.last_data_send != '') && (moment().unix() - station.last_data_send < 900)) {
							new_station_list.push(station);
						}
					});
				}*/
				if (!update) {
					that.setState({
						filtered_stations: json.station_list //new_station_list
					});
				}
				let new_search_list = [];
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						new_search_list.push({name: station.name,
							id: station.id});
					});
				}
				that.setState({
					unauthorised_access: false,
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
						console.log('avg_lat', avg_long);
					}
				});
			} else {
				that.openNotification('error', json.message);
				// that.setState({
				// 	unauthorised_access: true
				// });
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
	 * This function creates the query and pushes it to the history.
	 */
	queryCreate(cat, sub_cat, update) {
		// toaster.warning('Heyyyy', 'Alert');

		console.log('in queryCreate 1', this.props.history.location.pathname);
		let query_string = '?cat=[' + cat + ']&subcat=[' + this.state.sub_category_selected + ']' + '&layers=[' + this.state.layer_array + ']';
		console.log('query 1',query_string);
		console.log('in queryCreate 1', this.state.station_id);
		
		if ((cat && cat.length) || (sub_cat && sub_cat.length)) {
			if ((this.props.history.location && Object.values(this.props.history.location).length && this.props.history.location.pathname == ('/scenarios/stations/' + this.props.match.params.station_id + '/'))) {
				console.log('in queryCreate 2', this.state.station_id);
				this.props.history.push('/scenarios/stations/' + this.props.match.params.station_id + '/' + query_string);
			} else {
				console.log('in queryCreate 3', this.state.station_id);
				this.props.history.push('/scenarios/' + query_string);
			}
		} else {
			console.log('in queryCreate 4', this.state.station_id);
			this.props.history.push('/scenarios/' + query_string);
		}

		
		let filtered_stations = [];
		if (this.state.all_stations && this.state.all_stations.length && (sub_cat && sub_cat.length)) {
			console.log('debug 1');
			this.state.all_stations.map((station) => {
				sub_cat.map((sub_cat_id) => {
					if (station.sub_category == sub_cat_id) {
						filtered_stations.push(station);
					}
				});
			});
		} else if (cat && this.state.category_list && (cat.length == this.state.category_list.length)) {
			console.log('debug 2');
			filtered_stations = this.state.all_stations;
		}

		this.setState({
			filtered_stations: filtered_stations,
			searched_list: filtered_stations
		}, () => {
			
			if (this.child2) {
				console.log('update for map', update);
				this.child2.categorizeStations(update);
			}
		});
	}
	/**
	 * This function sets the sub category to be displayed.
	 */
	setSub() {
		console.log('called constructor setSub');
		let sub_category_selected_display = [],
			category_selected = this.state.category_selected;
		if ((this.state.category_selected && this.state.category_selected.length) || (this.state.sub_category_selected && this.state.sub_category_selected.length)) {
			if (this.state.category_selected && this.state.category_selected.length) {
				this.state.category_selected.map((id) => {
					this.state.category_list.map((op) => {
						if (id == op.id) {
							op.sub_category.map((sub_op) => {
								if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
									sub_category_selected_display.push(sub_op.id);
								}
							});
						}
					});
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
			if (this.props.location.search == '?cat=[]&subcat=[]&layer=[]') {

			} else {
				/*if (this.state.category_list && this.state.category_list.length) {
					this.state.category_list.map((op) => {
						op.sub_category.map((sub_op) => {
							if (sub_category_selected_display.indexOf(sub_op.id) === -1) {
								sub_category_selected_display.push(sub_op.id);
							}
						});
						// this.setCategory(true, op.id);
						if (category_selected.indexOf(op.id) === -1) {
							category_selected.push(op.id);
						}
					});
				}*/
			}
		}
		this.setState({
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected
		});
	}
	/**
	 * This function gets called category or subcategory selection is made in the TreeSelect.
	 * This callc the function to set the category/ subcategory selected.
	 */
	treeSelect (val, label, extra) {
		console.log('treeSelect', val);
		console.log('treeSelect', label);
		console.log('treeSelect', extra);
		let that = this;
		let value = that.state.value,
			sub_cat = that.state.sub_category_selected_display;
		if (extra.triggerValue.split('-').length == 2 && extra.triggerValue.split('-')[1] != 21) {
			// value = [];
			// value.push(extra.triggerValue);
			value = val;
			let category_id = extra.triggerValue.split('-')[1];
			that.setCategory(extra.checked, parseInt(category_id));
		} else if (extra.triggerValue.split('-').length == 3 && extra.triggerValue.split('-')[2] <30) {
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
			value = val;
			// value = [];
			/*if (val.length) {
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
			}*//* else {
				value = val;
			}*/
			that.setSubCategory(extra.checked, parseInt(category_id), parseInt(sub_category_id));
		}
		that.setState({
			value: value,
			// station_id: ''
		},() => {
			/*that.props.history.push('');
			if (that.state.search_station != '') {
				that.props.history.push(that.props.location.search);
			}*/
			that.showList();
		});
	}
	/**
	 * This function gets called when layer selection is made in the TreeSelect.
	 */
	treeSelectLayer (val, label, extra) {
		console.log('treeSelect', val);
		console.log('treeSelect', label);
		console.log('treeSelect', extra);
		let that = this;
		let value_layer = that.state.value_layer;
		if (extra.triggerValue && extra.triggerValue.split('-').length == 2 && extra.triggerValue.split('-')[1] == 21) {
			value_layer = val;
			that.setLayer(extra.triggerValue.split('-')[1], extra.checked);
		} else if (extra.triggerValue && extra.triggerValue.split('-').length) {
			value_layer = val;
			that.setSubLayer(extra.triggerValue.split('-')[2], extra.checked);
		}
		that.setState({
			value_layer: value_layer,
			// station_id: ''
		},() => {
			/*that.props.history.push('');
			if (that.state.search_station != '') {
				that.props.history.push(that.props.location.search);
			}*/
			console.log('treeSelect 22', that.state.value_layer);
			that.showList();
		});
	}
	/**
	 * This function is called when an error is thrown.
	 */
	componentDidCatch(error, info) {
		console.log('error', error);
		console.log('info', info);
	}
	/**
	 * 
	 * @return {[type]} [description]
	 */
	showList() {
		// this.props.history.push('');
		
			console.log('this.state.station_details', this.state.station_details);
			let sub_cat;
			if (this.state.filtered_stations && this.state.filtered_stations.length && this.state.station_id) {
				this.state.filtered_stations.map((station) => {
					if (this.state.station_id == station.id) {
						sub_cat = station.sub_category;
					}
				});
			}
			if (this.state.sub_category_selected_display.indexOf(sub_cat) == -1) {
				this.setState({
					station_id: null
					},() => {
						if (this.child2) {
							this.child2.setDash();
						}
						this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				});
			}
		
	};
	/**
	 * This function sets the layer array.
	 * @param {Array} value  
	 */
	setLayer(value, status) {
		let layer_array = this.state.layer_array;
		let temp_tree = treeData_layer.slice(0);
		if (status == true) {
			if (temp_tree && temp_tree.length) {
				temp_tree.map((data) => {
					if (data.value == '0-21') {
						if (data.children && data.children.length) {
							layer_array = [];
							data.children.map((layer) => {
								layer_array.push(layer.value.split('-')[2]);
							});
						}
					}
				});
			}
		} else {
			layer_array = [];
		}
		this.setState({
			layer_array: layer_array
		}, () => this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display));
	}
	/**
	 * This function sets the sublayers in the array.
	 */
	setSubLayer(value, status) {
		let layer_array = this.state.layer_array;
		let temp_tree = treeData_layer.slice(0);
		if (temp_tree && temp_tree.length) {
			temp_tree.map((data) => {
				if (data.value == '0-21') {
					if (data.children && data.children.length) {
						data.children.map((layer) => {
							if (layer.value == ('0-21-' + value)) {
								if (status) {
									if (layer_array.indexOf(value) == -1) {
										layer_array.push(value);
									}
								} else {
									if (layer_array.indexOf(value) != -1) {
										layer_array.splice(layer_array.indexOf(value), 1);
									}
								}
							}
						});
					}
				}
			});
		}
		this.setState({
			layer_array : layer_array
		}, () => {
			this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
			console.log('treeSelect 23', this.state.layer_array);
		});
	}
	/**
	 * This function sets the category selected.
	 * @param {Number}
	 */
	setCategory(status, id) {
		let category_selected = this.state.category_selected,
			sub_category_selected_display = this.state.sub_category_selected_display,
			sub_category_selected = this.state.sub_category_selected;
		if (status === true && category_selected.indexOf(id) === -1) {
			category_selected.push(id);
			this.state.category_list.map((op) => {
				if (op.id === id) {
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
		} else if (!status && category_selected.indexOf(id) !== -1) {
			category_selected.splice(category_selected.indexOf(id), 1);
			this.state.category_list.map((op) => {
				if (op.id === id) {
					op.sub_category.map((sub_op) => {
						if (sub_category_selected_display.indexOf(sub_op.id) !== -1) {
							sub_category_selected_display.splice(sub_category_selected_display.indexOf(sub_op.id), 1);
						}
						if (sub_category_selected.indexOf(sub_op.id) !== -1) {
							sub_category_selected.splice(sub_category_selected.indexOf(sub_op.id), 1);
						}
					});
				}
			});
		}
		
		this.setState({
			sub_category_selected: sub_category_selected,
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected,
			// search_station: '',
			// display_selected_cat: display_selected_cat
		},() => this.queryCreate(category_selected, sub_category_selected_display));
	}
	/**
	 * This function sets the subcategory selected.
	 * @param {Boolean}
	 * @param {Number}
	 * @param {Number}
	 */
	setSubCategory(status, id, sub_id) {
		let category_selected = this.state.category_selected,
			sub_category_selected_display = this.state.sub_category_selected_display,
			sub_category_selected = this.state.sub_category_selected;
		if (status === true && sub_category_selected_display.indexOf(sub_id) === -1) {
			sub_category_selected_display.push(sub_id);
			if (sub_category_selected.indexOf(sub_id) === -1) {
				sub_category_selected.push(sub_id);
			}
			let sub_count = 0;
			this.state.category_list.map((op) => {
				if (op.id === id) {
					op.sub_category.map((sub_op) => {
						if (sub_category_selected_display.indexOf(sub_op.id) !== -1) {
							sub_count++;
						}
					});
					if (sub_count === op.sub_category.length && category_selected.indexOf(id) === -1) {
						category_selected.push(id);
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
		} else if (!status && sub_category_selected_display.indexOf(sub_id) !== -1) {
			if (sub_category_selected_display.indexOf(sub_id) !== -1) {
				sub_category_selected_display.splice(sub_category_selected_display.indexOf(sub_id), 1);
			}
			if (sub_category_selected.indexOf(sub_id) !== -1) {
				sub_category_selected.splice(sub_category_selected.indexOf(sub_id), 1);
			}
			let sub_count = 0;
			this.state.category_list.map((op) => {
				if (op.id === id) {
					op.sub_category.map((sub_op) => {
						if (sub_category_selected_display.indexOf(sub_op.id) !== -1) {
							sub_count++;
						}
					});
					if (sub_count !== op.sub_category.length && category_selected.indexOf(id) !== -1) {
						category_selected.splice(category_selected.indexOf(id), 1);
						op.sub_category.map((sub_op) => {
							if (sub_category_selected.indexOf(sub_op.id) === -1 && sub_op.id !== sub_id) {
								sub_category_selected.push(sub_op.id);
							}
						});
					}
				}
			});
		}
		
		this.setState({
			sub_category_selected: sub_category_selected,
			sub_category_selected_display: sub_category_selected_display,
			category_selected: category_selected,
			// search_station: '',
			// display_selected_cat: display_selected_cat
		},() => this.queryCreate(category_selected, sub_category_selected_display));
	}
	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */
	componentDidUpdate(prevProps, prevState) {
		// let google;
		/*if(this.locations) {
			this.locations.map((point) => {
				var marker_lat_long = new google.maps.LatLng(point.lat, point.long);
				// console.log(point.lat, point.long);
				var marker_icon = '';
				if (point.connection_status === 'online') {
					if(point.aqi_range == 1) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-1.png';
					} else if(point.aqi_range == 2) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-2.png';
					} else if(point.aqi_range == 3) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-3.png';
					} else if(point.aqi_range == 4) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-4.png';
					} else if(point.aqi_range == 5) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-5.png';
					} else {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-6.png';
					}
				} else {
					marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-0.png';
				}

				var marker = new google.maps.Marker({
					position: marker_lat_long,
					map: this.map,
					title: point.name,
					icon: marker_icon
				});
				// console.log('marker_icon', marker);s
				let content = '', circle_class = '';
				let dashboard_map_pointer = new google.maps.InfoWindow();
				google.maps.event.addListener(marker, 'click',function() {
					if (point.connection_status =='online') {
						circle_class = 'online';
					} else {
						circle_class = 'offline';
					}

					content = '<div class="pointer-details">';
					content += '<div class="flex">';
					content += '<div class="circle center '+ circle_class +'"></div>';
					content += '<div class="qr-code">'+point.name+'</div>';
					content += '</div>';
					dashboard_map_pointer.setContent(content);
					dashboard_map_pointer.open(this.map, marker);
				})
				// google.maps.event.addListener(marker,'click',function() {
				// 	that.fetchStationData(point.id);
				// 	that.context.router.transitionTo('/stations/'+point.id);
				// });
			});
		}*/

		if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((prevProps.match.params.station_id != this.props.match.params.station_id) || (this.state.station_id != this.props.match.params.station_id)) && this.state.all_stations && this.state.all_stations.length) {
			this.setState({
				station_id: this.props.match.params.station_id,
			}, () => {
				if (this.state.category_selected && this.state.sub_category_selected_display) {
					//this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				}
				if (this.child2) {
					this.child2.dash(this.state.station_id);
				}
			});
		} else if (prevProps.location.search != this.props.history.location.search && this.props.history.location.search == '' && this.props.history.location.pathname == '/scenarios') {
			this.setState({
				station_id: '',
				value: [],
				value_layer: [],
				category_selected: this.props.location.search ? (this.props.location.search.split('&')[0].split('=')[0].search('cat') != -1 && this.props.location.search.split('&')[1] && this.props.location.search.split('&')[1].search('subcat') != -1 && this.props.location.search.split('&')[0].split('=')[1] ? JSON.parse(this.props.location.search.split('&')[0].split('=')[1]) : [2]) : [2],
				sub_category_selected: this.props.location.search ? (this.props.location.search.split('&')[0].search('subcat') != -1 ? [] : this.props.location.search.split('&')[1] && this.props.location.search.split('&')[1].search('subcat') != -1 ? JSON.parse(this.props.location.search.split('&')[1].split('=')[1]) : []) : [],
				layer_array: this.props.location.search ? (this.props.location.search.split('layers=').length == 2 ? JSON.parse(this.props.location.search.split('layers=')[1]).map(String) : []) : [],
			}, ()=> {
				this.defaultValue();
				this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				if (this.child2) {
					this.child2.setDash();
				}
			});
		}
	}
	/**
	 * Predefined function of ReactJS. Called before the component unmounts.
	 * @return {void} 
	 */

	componentWillUnmount() {
		clearInterval(this.updateDataInterval);
		this.updateDataInterval = null;
	}
	/**
	 * Predefined function of ReactJS. Called after the component mounts.
	 * @return {void} 
	 */

	componentDidMount() {
		document.title = 'Scenarios - Flood Forecasting and Early Warning System for Kolkata City';
		if (this.refs.chart) {
			let chart = this.refs.chart.getChart();
			chart.series[0].addPoint({x: 10, y: 12});
		}
		if (document.getElementById('mapView')) {
			this.mapView();
		}
		this.retriveData();
	}

	/*treeSelect (e) {
		console.log(e);
	}*/

	onChange(value) {
		console.log('onChange ', value);
		this.setState({ value });
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
		console.log('scroll 3');
		i++; if (i > 30) return;
		c.scrollTop = a + (b - a) / 30 * i;
		setTimeout(() => this.scroll(c, a, b, i), 20);
	}
	/**
	 * This function scrolls to the index.
	 */
	showIndex() {
		if (document.getElementById('label_container')) {
			this.smoothScroll(document.getElementById('label_container'));
		}
	}
	/**
	 * This function show the loading during the KML file is being downloaded.
	 * @param {Boolean} flag 
	 */
	setLoadingKML(flag) {

		// let layer_array_temp = this.state.layer_array.slice(0);
		// if (layer_array_temp && layer_array_temp.length && layer_array_temp.indexOf('34') > -1) {
		// 	layer_array_temp.splice(layer_array_temp.indexOf('34'), 1);
		// }
		this.setState({
			// layer_array: layer_array_temp,
			loading_kml: flag
		}, () => console.log('yup changed', this.state.loading_kml));
	}
	/**
	 * This function resets the layer array.
	 * @return {[type]} [description]
	 */
	resetLayers() {
		let layer_array_temp = this.state.layer_array.slice(0);
		if (layer_array_temp && layer_array_temp.length && layer_array_temp.indexOf('34') > -1) {
			layer_array_temp.splice(layer_array_temp.indexOf('34'), 1);
		}
		this.setState({
			layer_array: layer_array_temp,
		});
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render () {
		const { size, treeData, treeData_layer, value, value_layer } = this.state;
		const tProps = {
			treeData: treeData,
			value: value,
			// onChange: this.onChange,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Categories or Sub-categories',
		};
		/*const tProps2 = {
			treeData: treeData_layer,
			value: value_layer,
			// onChange: this.onChange,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Layers',
		};*/


		return (
			<div id="map">
				<Side active_link="map" />
				<Head/>
				<Layout>
				{(() => {
					if (this.state.all_stations && this.state.all_stations.length) {
						return <Layout>
							<Content className="contains">
								<div className="contain">
									<Row className="rows" className="top-0">
										<Col className="city-select" span={12}>
											<label>Categories</label>
											<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} treeDefaultExpandAll {...tProps} style={{ width: '100%' }} />
										</Col>
										<Col span={12}>
											{(() => {
												if (this.state.loading_kml) {
													return <div className="loading-display">
														<Loading className='scenarios-kml' height="20" width="20" is_inline={true} />
														<span>Loading KML File</span>
													</div>
												}
											})()}
										</Col>
										{/*<Col className="city-select" offset={1} span={11}>
										<label>Layers</label>
											{(() => {
												if (this.state.treeData_layer && this.state.treeData_layer.length) {
													return <TreeSelect onChange={(value, label, extra) => this.treeSelectLayer(value, label, extra)} treeDefaultExpandAll {...tProps2} style={{ width: '100%' }} />;
												}
											})()}
										</Col>*/}
									</Row>
									<Row className="rows" type="flex" justify="space-around">
										<Col className="cols map-container" span={24}>
											{(() => {
												if (this.state.all_stations && this.state.all_stations.length) {
													return <MapViewMap resetLayers={() => this.resetLayers()} setLoadingKML={(flag) => this.setLoadingKML(flag)} showIndex={() => this.showIndex()} sub_category_object={this.state.sub_category_object} treeSelectLayer={(value, label, extra) => this.treeSelectLayer(value, label, extra)} value_layer={this.state.value_layer} treeData_layer={this.state.treeData_layer} layer_array={this.state.layer_array} history={this.props.history} filtered_stations={this.state.filtered_stations} cat_list={this.state.category_selected} sub_cat_list={this.state.sub_category_selected_display} queryCreate={(cat, subcat) => this.queryCreate(cat, subcat)} avg_lat={this.state.avg_lat} avg_long={this.state.avg_long} ref={(child2) => { this.child2 = child2; }}  callChild={(title) => this.callChild(title)} />;
												}
												{/*<div className="full-height" id="mapView" />*/}
											})()}
											
										</Col>
									</Row>
									<Row className="rows" id="label_container" type="flex" justify="start">
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
												For Pump Stations
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
												For Rainfall Stations
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
									</Row>
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
					} else if (this.state.unauthorised_access) {
						return <Layout>
							<Content className="contains">
								<div className="contain">
									<div className="no-data-text">
										<Alert
											message="Access Denied"
											description={this.state.unauthorised_access_msg}
											type="error"
										/>
									</div>
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
				</Layout>
			</div>
		);
	}
}