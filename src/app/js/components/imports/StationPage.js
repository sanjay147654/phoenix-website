import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification, Alert } from 'antd';
// import './css/style.less';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
// import StationGroup from './StationGroup';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Option } = Select;

const confirm = Modal.confirm;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_PARENT1 = TreeSelect.SHOW_PARENT;

const { Content } = Layout;

/**
 * Component for setting limit to a station.
 */
const SetLimitForm = Form.create()(
	class extends React.Component {
		/**
		 * This is the Constructor for Dashboard page used to set the default task while page loads.
		 * @param  {Object} props This will import the attributes passed from its Parent Class.
		 */
		constructor(props) {
			super(props);
			let thresholds_list = [];
			let unit;
			if (props.all_stations && props.all_stations.length && props.station_id && props.station_id != '') {
				props.all_stations.map((station) => {
					if (station.id == this.props.station_id) {
						if (station.parameters && station.parameters.length) {
							return station.parameters.map((param) => {
								if (param.type == 'sump_level') {
									thresholds_list.push({
										'param_key': param.name,
										'threshold': param.threshold
									});
									unit= param.unit
								}
							});
						}
					}
				})
			}
			/**
			 * State of the component.
			 * @type {Object}
			 * @property {Array} thresholds_list	Stores the list of threshold.
			 * @property {string} unit Stores the unit.
			 */
			this.state={
				thresholds_list: thresholds_list,
				unit: unit,
				unauthorised_access: false,
				unauthorised_access_msg: ''
			};
		}

		/**
		 * This function sets the threshold list.
		 */
		handleChange(e, name){
			let thresholds_list = this.state.thresholds_list && Object.values(this.state.thresholds_list).length ? this.state.thresholds_list : [];
			if (_.findIndex(thresholds_list, ['param_key', name]) > -1) {
				thresholds_list[_.findIndex(thresholds_list, ['param_key', name])] = {
					param_key: name,
					threshold: {
						'limit' : e.target.value
					}
				}
			} else {
				thresholds_list.push({
					param_key: name,
					threshold: {
						'limit' : e.target.value
					}
				});
			}
			/*if (!thresholds_list[name]) {
				thresholds_list[name] = {
					'limit': e.target.value
				}
			} else {
				thresholds_list[name] = {
					'limit': e.target.value
				}
			}*/
			this.setState({
				thresholds_list: thresholds_list
			}, () => console.log('setLimitForm', this.state.thresholds_list));
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
		 * This function calls the API to set the threshold limit for the station.
		 */
		handleSubmit() {
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/' + that.props.station_id + '/set_threshold', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					id: that.props.station_id,
					threshold_list: that.state.thresholds_list
				})
			}).then(function(Response) {
				response_status = Response.status;
				return Response.json();
			}).then(function(json) {
				// response_status = 403;
				if (response_status == 403) {
					that.setState({
						unauthorised_access: true,
						loading: false,
						unauthorised_access_msg: json.message
					});
				}
				else if (json.status === 'success') {
					that.setState({
						unauthorised_access: false,
						loading: false
					});
					that.openNotification('success', 'Limit Updated');
					that.props.onCancel();
					that.props.fetchData();
				} else {
					that.setState({
						unauthorised_access: false,
						loading: false
					});
					that.openNotification('error', json.message);
				}
			}).catch(function(ex) {
				console.log('parsing failed', ex);
				that.setState({
					loading: false
				});
				that.openNotification('error', 'Unable to load data!');
			});
		}
		/**
		 * Predefined function to render in the page.
		 */
		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			return (
				<div id="set_limit">
					<Drawer
						title="Set Limit"
						width={720}
						placement="right"
						visible={visible}
						onClose={onCancel}
						maskClosable={false}
						style={{
							height: 'calc(100% - 55px)',
							overflow: 'auto',
							paddingBottom: 53,
						}}
					>
						<Form layout="vertical" hideRequiredMark>
							{(() => {
								if (this.props.all_stations && this.props.all_stations.length && this.props.station_id && this.props.station_id != '') {
									let count = 0;
									let sump_limit = this.props.all_stations.map((station) => {
										if (station.id == this.props.station_id) {
											if (station.parameters && station.parameters.length) {
												return station.parameters.map((param) => {
													if (param.type == 'sump_level') {
														count++;
														return <Row gutter={16}>
															<Col span={12}>
																<Form.Item label="Parameters">
																	<Input className="font-color" defaultValue={param.name} disabled={true} />
																</Form.Item>
															</Col>
															<Col span={12}>
																<Form.Item id="limit" label="Limit">
																	{getFieldDecorator('limit', {
																		rules: [{ required: true, message: 'Please enter limit'}],
																		initialValue: param.threshold.limit,
																		onChange: (e) => this.handleChange(e, param.name)
																	})(<Input placeholder="Please enter limit" addonAfter={param.unit} />)}
																</Form.Item>
															</Col>
														</Row>
													}
												}).filter(Boolean);
											}
										}
									}).filter(Boolean);
									if (count > 0) {
										return sump_limit;
									} else {
										return <div className="text-center">
											Alert feature is not available!
										</div>;
									}
								}
							})()}
						</Form>
						<div
							style={{
								position: 'absolute',
								bottom: 0,
								width: '100%',
								borderTop: '1px solid #e8e8e8',
								padding: '10px 16px',
								textAlign: 'right',
								left: 0,
								background: '#fff',
								borderRadius: '0 0 4px 4px',
							}}
						>
							{(() => {
								if (this.state.unauthorised_access) {
									console.log('this.state.unauthorised_access', this.state.unauthorised_access);
									return <div style={{'padding-bottom': '10px'}}>
										<Row type="flex" justify="center" className="no-data-text-container" style={{textAlign: 'center'}}>
											<div className="no-data-text">
												<Alert
													message="Access Denied"
													description={this.state.unauthorised_access_msg}
													type="error"
												/>
											</div>
										</Row>
									</div>;
								}
								
							})()}
							<Button
								style={{
									marginRight: 8,
								}}
								onClick={onCancel}
							>
								Cancel
							</Button>
							{(() => {
								if (this.props.all_stations && this.props.all_stations.length && this.props.station_id && this.props.station_id != '') {
									let count = 0;
									let sump_limit = this.props.all_stations.map((station) => {
										if (station.id == this.props.station_id) {
											if (station.parameters && station.parameters.length) {
												return station.parameters.map((param) => {
													if (param.type == 'sump_level') {
														count++;
													}
												}).filter(Boolean);
											}
										}
									}).filter(Boolean);
									if (count > 0) {
										return <Button onClick={() => this.handleSubmit()} loading={this.state.loading} type="primary">Submit</Button>;
									}
								}
							})()}
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

let stationFilter = [];
/**
 * Main component for Station page.
 */
export default class StationPage extends React.Component {
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
		console.log('parsed', this.parsed);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @property {Array} category_selected Stores the category selected.
		* @property {Array} sub_category_selected Stores the sub-category selected.
		* @property {string} table_search Stores the value to be searched in the table.
		* @property {string} station_group_toggle stores the value for taggle of tabs.
		*/
		this.state = {
			visible: true,
			stationValue: [],
			groupValue: [],
			drawGroupVisible: false,
			setLimitVisible: false,
			modalVisible: false,
			station_id: '',
			sort_station_name: '',
			category_selected: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.cat ? JSON.parse(this.parsed_search.cat) : [2],
			
			sub_category_selected: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.subcat ? JSON.parse(this.parsed_search.subcat) : [],
			
			table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			station_group_toggle: props.location.pathname && (props.location.pathname.search('/stations/') > -1) ? 'station' : (props.location.pathname && (props.location.pathname.search('/station-groups/') > -1) ? 'stationGroup' : 'station'),
			unauthorised_access: false,
			unauthorised_access_msg: ''
		};
		/**
		 * This stores the interval function to call the API after a fixed interval.
		 */
		this.updateDataInterval = null;
	}
	/**
	 * This function sets the currently selected station value.
	 */
	onChangeStation(stationValue) {
		this.setState({ stationValue });
	}

	/*onChangeGroup(groupValue) {
		this.setState({ groupValue });
	}*/

	/*showGroupModal() {
		this.setState({ drawGroupVisible: true });
	}*/

	/**
	 * Predefined function of ReactJS. This is called just after the component is mounted.
	 */
	componentDidMount() {
		document.title = 'Settings - Station - Flood Forecasting and Early Warning System for Kolkata City';
		this.retriveData();
		console.log('Station Page Mounted');
	}
	/**
	 * Predefined function of ReactJS. This is called just before the component is unmounted.
	 */
	componentWillUnmount() {
			console.log('StationPage Unmounted');
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
			if (response_status == 403) {
				that.setState({
					unauthorised_access: true,
					unauthorised_access_msg: json.message
				});
			}
			else if (json.status === 'success') {
				console.log('category_list:', json.category_list);
				stationFilter = [];
				let category_list_object = {};
				let sub_category_list_object = {};
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
						if (!category_list_object[category.id]) {
							category_list_object[category.id] = category.name;
						}
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								if (!sub_category_list_object[sub_cat.id]) {
									sub_category_list_object[sub_cat.id] = sub_cat.name;
								} else {
									sub_category_list_object[sub_cat.id] = sub_cat.name;
								}
								obj1.push({
									'title': sub_cat.name,
									'value': '0-' + category.id + '-' + sub_cat.id,
									'key': '0-' + category.id + '-' + sub_cat.id,
								});
							});
						}
						stationFilter.push({
							title: category.name,
							value: '0-' +  category.id,
							key: '0-' +  category.id,
							children: obj1
						});
					});
				}
				let value = [];
				if (that.state.category_selected && that.state.category_selected.length) {
					that.state.category_selected.map((cat) => {
						value.push('0-' + cat);
					});
				} 
				if (that.state.sub_category_selected && that.state.sub_category_selected.length) {
					let tree_node_data = [];
					that.state.sub_category_selected.map((node) => {
						if (stationFilter && stationFilter.length) {
							stationFilter.map((tree) => {
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
				that.setState({
					unauthorised_access: false,
					category_list: category_list,
					category_list_object: category_list_object,
					sub_category_list_object: sub_category_list_object,
					stationFilter: stationFilter,
					stationValue: value
				}, () => {
					console.log('stationFilter', that.state.stationFilter);
					that.fetchData();
					// that.updateDataInterval = setInterval(() => that.fetchData(true), 30000);
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
					unauthorised_access: false
				});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}
	/**
	 * Function used to get the station data for the stations page.
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
				that.setState({
					unauthorised_access: true,
					unauthorised_access_msg: json.message
				});
			}
			else if (json.status === 'success') {
				
				if (!update) {
					that.setState({
						filtered_stations: json.station_list
					});
				}
				let new_search_list = [];
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station) => {
						new_search_list.push({name: station.name,
							id: station.id});
					});
				}
				let station_list = [];
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station, index) => {
						station_list.push(
							{
								key: station.id,
								serial: index,
								name: station.name,
								category: that.state.category_list_object[station.category],
								sub_category: that.state.sub_category_list_object[station.sub_category],
							}
						);
					});
				}
				that.setState({
					unauthorised_access: false,
					all_stations: json.station_list,
					station_list: station_list,
					//searched_list: json.station_list,
					device_info: json.device_info,
					event_log: json.event_log,
					new_search_list: new_search_list,
					// filtered_stations: json.all_stations,
				},() => {

					if (true) {
						that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display, update);
					}
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					unauthorised_access: false
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
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('componentDidUpdate Station page');
		this.parsed_search = queryString.parse(this.props.location.search);
		if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((this.props.match.params.station_id != prevProps.match.params.station_id) || (this.props.match.params.station_id != this.state.station_id)) && this.state.all_stations && this.state.all_stations.length && this.props.history.location.pathname.search('/limit') > -1) {
			this.setState({
				station_id: this.props.match.params.station_id,
				setLimitVisible: true
			});
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/settings/stations/') {
			
			this.setState({
				visible: true,
				stationValue: [],
				groupValue: [],
				drawGroupVisible: false,
				setLimitVisible: false,
				modalVisible: false,
				station_id: '',
				sort_station_name: '',
				category_selected: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.cat ? JSON.parse(this.parsed_search.cat) : [2],
				sub_category_selected: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.subcat ? JSON.parse(this.parsed_search.subcat) : [],
				table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
				station_group_toggle: this.props.location.pathname && (this.props.location.pathname.search('/stations/') > -1) ? 'station' : (this.props.location.pathname && (this.props.location.pathname.search('/station-groups/') > -1) ? 'stationGroup' : 'station')
			}, () => {
				this.setSub();
				this.defaultTreeValue();
				this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
			});
		}
	}
	/**
	 * This function sets the value of TreeSelect to its default value.
	 */
	defaultTreeValue() {
		let value = [];
		if (this.state.category_selected && this.state.category_selected.length) {
			this.state.category_selected.map((cat) => {
				value.push('0-' + cat);
			});
		} 
		if (this.state.sub_category_selected && this.state.sub_category_selected.length) {
			let tree_node_data = [];
			this.state.sub_category_selected.map((node) => {
				if (stationFilter && stationFilter.length) {
					stationFilter.map((tree) => {
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
		this.setState({
			stationValue: value
		});
	}
	/**
	 * This function creates the query and pushes it to the history.
	 * @return {void} 
	 */
	queryCreate(cat, sub_cat) {
		// toaster.warning('Heyyyy', 'Alert');

		console.log('in queryCreate', this.props.history.location.pathname);
		let query_string = '?cat=[' + cat + ']&subcat=[' + this.state.sub_category_selected + ']' + (this.state.sort_station_name ? '&name=' + this.state.sort_station_name : '') + (this.state.sort_category ? '&category=' + this.state.sort_category : '') + (this.state.table_search  && this.state.table_search != '' ? '&search=' + this.state.table_search : '');
		
		console.log('queryCreate', this.state.station_id);
		if ((this.state.station_id && this.state.station_id != '') || (this.props.match.params.station_id)) {
			console.log('queryCreate if', this.state.station_id);
			this.props.history.push('/settings/stations/' + this.props.match.params.station_id + '/limit/' + query_string);
		} else {
			console.log('queryCreate else', this.state.station_id);
			this.props.history.push('/settings/stations/' + query_string);
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
			// searched_list: filtered_stations
		}, () => this.setSearchedList());
	}
	/**
	 * This function sets the list of stations tot be displayed in the map and station list.
	 * @param {Boolean}
	 */
	setSearchedList() {
		console.log('in setSearchList function');
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && this.state.table_search != null && this.state.table_search != '' && this.state.table_search != undefined) {
			this.state.filtered_stations.map((cat,index) => {
				if (this.state.table_search != '' && (cat.name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || this.state.sub_category_list_object[cat.sub_category].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))))) {
					searched_list.push(cat);
					console.log('in setSearchList 1 function');
				}
			});
		} else if (!this.state.table_search) {
			searched_list = this.state.filtered_stations.slice(0);
		}
		this.setState({
			searched_list: searched_list
		}, () => {
			this.sortStation();
		});
	}
	/**
	 * This function sets the string to be searched.
	 * @param {String}
	 */
	setSearch(value) {
		console.log('in setSearch function', value);
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && value) {
			this.state.filtered_stations.map((cat,index) => {
				if (value != '' && (cat.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || this.state.sub_category_list_object[cat.sub_category].toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					searched_list.push(cat);
				}
			});
		} else if (value == '') {
			searched_list = this.state.filtered_stations.slice(0);
		}
		this.setState({
			table_search: decodeURI(encodeURI(value)),
			searched_list: searched_list
		},() => {
			console.log('searched_list 22', this.state.searched_list);
			this.sortStation();
			this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
		});
	}
	/**
	 * This function sets the list to be displayed in the table.
	 */
	sortStation() {
		let searched_list = this.state.searched_list && this.state.searched_list.length ? this.state.searched_list.slice(0) : [];
		if (this.state.sort_station_name) {
			if (this.state.sort_station_name == 'asc') {
				searched_list = searched_list.sort((a, b) => {
					return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
				});
			} else if (this.state.sort_station_name == 'desc') {
				searched_list = searched_list.sort((a, b) => {
					return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
				});
			}
		}
		if (this.state.sort_category) {
			if (this.state.sort_category == 'asc') {
				searched_list = searched_list.sort((a, b) => {
					return (this.state.category_list_object[a.category].toLowerCase() < this.state.category_list_object[b.category].toLowerCase()) ? -1 : 1;
				});
			} else if (this.state.sort_category == 'desc') {
				searched_list = searched_list.sort((a, b) => {
					return (this.state.category_list_object[a.category].toLowerCase() > this.state.category_list_object[b.category].toLowerCase()) ? 1 : -1;
				});
			}
		}

		let sorted_list = [];
		if (searched_list.length) {
			searched_list.map((station, index) => {
				sorted_list.push(
					{
						key: station.id,
						serial: index+1,
						name: station.name,
						category: this.state.category_list_object[station.category],
						sub_category: this.state.sub_category_list_object[station.sub_category],
					}
				);
			});
		}
		this.setState({
			sorted_list: sorted_list
		});
	}
	/**
	 * This function gets called when any selection is made in the TreeSelect.
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
			stationValue: value,
			// station_id: ''
		},() => {
			/*that.props.history.push('');
			if (that.state.search_station != '') {
				that.props.history.push(that.props.location.search);
			}*/
			// that.showList();
		});
	}
	/**
	 * This function sets the category selected.
	 * @param {Boolean} status
	 * @param {Number} id
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
	 * This function sets the url to open the limit setting modal.
	 */
	showLimitModal(text, record, index) {
		// this.setState({ setLimitVisible: true });
		this.props.history.push('/settings/stations/' + record.key + '/limit/' + this.props.history.location.search);
	}
	/**
	 * This function closes the limit setting modal.
	 */
	/*handleCancel() {
		this.setState({
			drawGroupVisible: false,
			setLimitVisible: false
		});
	}*/
	/**
	 * This function opens the limit setting modal.
	 */
	/*setModalVisible(modalVisible) {
	this.setState({ modalVisible });
	}*/
	/**
	 * This function closes the limit setting modal.
	 */
	closeLimitModal() {
		this.props.history.push('/settings/stations/' + this.props.history.location.search);
		this.setState({
			station_id: '',
			setLimitVisible: false,
			unauthorised_access: false,
			unauthorised_access_msg: ''
		});
	}

	/*changeGroup(key, update = false) {
		console.log('in changeGroup',key);
		console.log('in changeGroup',update);
		let search = this.state.table_search;
		this.setState({
			station_group_toggle: key,
			table_search: update ? '' : search
		}, () => {
			if (this.state.station_group_toggle == 'stationGroup') {
				this.props.history.push('/settings/station-groups/' + this.props.history.location.search);	
			} else if (this.state.station_group_toggle == 'station') {
				this.props.history.push('/settings/stations/' + this.props.history.location.search);
			}
		});
	}
*/
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		const stationProps = {
			treeData: stationFilter,
			value: this.state.stationValue,
			// onChange: this.onChangeStation,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Filter by Category or Sub-category',
		};

		/*const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			onChange: this.onChangeGroup,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT1,
			searchPlaceholder: 'Select Filter',
		};*/

		const columns = [{
			title: 'Sl. No.',
			width: 80,
			key: 'serial',
			dataIndex: 'serial',
			align: 'center'
		}, {
			title: 'Station Name',
			width: 200,
			dataIndex: 'name',
			key: 'name',
			sorter: (a,b,sortOrder) => {
				console.log('sorter name', sortOrder);
				return (a.name.toLowerCase() !== b.name.toLowerCase() ? ((a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1) : 0);
			},
		}, {
			title: 'Type',
			width: 150,
			dataIndex: 'sub_category',
			key: 'sub_category',
			sorter: (a,b,sortOrder) => {
				return (a.sub_category.toLowerCase() !== b.sub_category.toLowerCase() ? ((a.sub_category.toLowerCase() < b.sub_category.toLowerCase()) ? -1 : 1) : 0);
			},
		}, {
			title: 'Set Limit',
			dataIndex: 'limit',
			width: 80,
			key: 'limit',
			align: 'center',
			render: (text, record, index) => (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" className="limit-img" onClick={() => this.showLimitModal(text, record, index)}><path d="M51.2 21h-5c-.8 0-1.5-.4-1.8-1.2s-.2-1.5.4-2.1l3.6-3.6a2.8 2.8 0 0 0 0-4l-4.6-4.5c-1-1-2.9-1-4 0l-3.5 3.6c-.6.6-1.4.7-2.1.4-.8-.3-1.2-1-1.2-1.8v-5C33 1.2 31.8 0 30.2 0h-6.4A2.8 2.8 0 0 0 21 2.8v5c0 .8-.4 1.5-1.2 1.8-.7.3-1.5.2-2.1-.4L14 5.6c-1-1-2.9-1-4 0l-4.5 4.6a2.8 2.8 0 0 0 0 4l3.6 3.5c.6.6.7 1.4.4 2.1S8.6 21 7.8 21h-5A2.8 2.8 0 0 0 0 23.8v6.4C0 31.8 1.2 33 2.8 33h5c.8 0 1.5.4 1.8 1.2s.2 1.5-.4 2.1L5.6 40a2.8 2.8 0 0 0 0 4l4.6 4.5c1 1 2.9 1 4 0l3.5-3.6c.6-.6 1.4-.7 2.1-.4.8.3 1.2 1 1.2 1.8v5c0 1.6 1.2 2.8 2.8 2.8h6.4c1.6 0 2.8-1.2 2.8-2.8v-5c0-.8.4-1.5 1.2-1.8.7-.3 1.5-.2 2.1.4l3.6 3.6c1 1 2.9 1 4 0l4.5-4.6a2.8 2.8 0 0 0 0-4l-3.6-3.5c-.6-.6-.7-1.4-.4-2.1s1-1.2 1.8-1.2h5c1.6 0 2.8-1.2 2.8-2.8v-6.4c0-1.6-1.2-2.8-2.8-2.8zm.8 9.2c0 .4-.4.8-.8.8h-5c-1.7 0-3 1-3.7 2.4-.6 1.5-.3 3.2.9 4.3l3.6 3.6c.3.3.3.8 0 1.1L42.4 47c-.3.3-.8.3-1.1 0l-3.6-3.6a3.9 3.9 0 0 0-4.3-.9c-1.5.6-2.4 2-2.4 3.7v5c0 .4-.4.8-.8.8h-6.4a.8.8 0 0 1-.8-.8v-5c0-1.7-1-3-2.4-3.7a3.9 3.9 0 0 0-4.3.9L12.7 47c-.3.3-.8.3-1.1 0L7 42.4a.8.8 0 0 1 0-1.1l3.6-3.6a3.9 3.9 0 0 0 .9-4.3c-.6-1.5-2-2.4-3.7-2.4h-5a.8.8 0 0 1-.8-.8v-6.4c0-.4.4-.8.8-.8h5c1.7 0 3-1 3.7-2.4.6-1.5.3-3.2-.9-4.3L7 12.7a.8.8 0 0 1 0-1.1L11.6 7c.3-.3.8-.3 1.1 0l3.6 3.6a3.9 3.9 0 0 0 4.3.9c1.5-.6 2.4-2 2.4-3.7v-5c0-.4.4-.8.8-.8h6.4c.4 0 .8.4.8.8v5c0 1.7 1 3 2.4 3.7 1.5.6 3.2.3 4.3-.9L41.3 7c.3-.3.8-.3 1.1 0l4.6 4.6c.3.3.3.8 0 1.1l-3.6 3.6a3.9 3.9 0 0 0-.9 4.3c.6 1.5 2 2.4 3.7 2.4h5c.4 0 .8.4.8.8v6.4z"/><path d="M27 18a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/></svg>
			),
		}];
		if (this.state.all_stations && this.state.all_stations.length) {
			return <div>
				<div className="table-filter"><TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} treeDefaultExpandAll {...stationProps} className="filter-icon" /></div>
				<div className="table-search">
					<Input placeholder="Search Station by Name or Sub-category" prefix={<Icon type="search" />} value={this.state.table_search} onChange={(e) => this.setSearch(e.target.value)}/>
				</div>
				<Row>
					<Table locale={{emptyText: 'No Stations Found!' }} columns={columns} dataSource={this.state.sorted_list} pagination={false}/>
				</Row>
				<SetLimitForm 
					visible={this.state.setLimitVisible}
					onCancel={() => this.closeLimitModal()}
					onCreate={() => this.handleCreate()}
					fetchData={() => this.fetchData()}
					station_id={this.state.station_id}
					all_stations={this.state.all_stations}
				/>
			</div>;
		} else if (this.state.unauthorised_access) {
			return <Row type="flex" justify="space-around" className="no-data-text-container">
				<div className="no-data-text">
					<Alert
						message="Access Denied"
						description={this.state.unauthorised_access_msg}
						type="error"
					/>
				</div>
			</Row>;
		} else {
			return <Loading is_inline={true} />;
		}
	}
}

