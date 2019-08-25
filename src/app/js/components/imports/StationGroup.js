import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification, Alert } from 'antd';
// import './css/style.less';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
import _ from 'lodash';
// import StationGroup from './StationGroup';
import moment from 'moment-timezone';
// import queryString from 'query-string';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Option } = Select;

const confirm = Modal.confirm;

let groupFilter = [];

const StationGroupForm = Form.create()(
	class extends React.Component {
		/**
		 * This is the Constructor for Dashboard page used to set the default task while page loads.
		 * @param  {Object} props This will import the attributes passed from its Parent Class.
		 */
		constructor(props) {
			super(props);
			/**
			 * State of the component
			 * @type {Object}
			 * @property {string} client_id Stores the client ID.
			 * @property {string} application_id Stores the Application ID.
			 * @property {Array} station_list_tree STores the station list tree.
			 * @property {Array} station_list_tree_new STores the station list tree.
			 * @property {Array} all_station_groups Stores the station groups list for table view.
			 * @property {string} description description of the selected group.
			 * @property {string} name name of the selected group.
			 * @property {string} selected_group_id group ID of the selected group.
			 * @property {Boolean} edit_group Whether to edit a group.
			 * @property {Boolean} add_group Whether to add_group a new group.
			 */
			this.state = {
				client_id: props.client_id,
				application_id: props.application_id,
				stationValue: [],
				station_list_tree: props.station_list_tree,
				station_list_tree_new: props.station_list_tree,
				all_station_groups: props.all_station_groups,
				description: props.selected_group_description,
				name: props.selected_group_name,
				selected_group_id: props.selected_group_id,
				selected_created_by: props.selected_created_by,
				stationValue: props.selected_group_stations && props.selected_group_stations.length ? props.selected_group_stations : [],
				edit_group: props.edit_group,
				add_group: props.add_group,
				search_tree: '',
				unauthorised_access: false,
				unauthorised_access_msg: ''
			}
			console.log('StationGroupForm', this.state);
		}

		/**
		 * This function sets the stations selected to be stored in the station group.
		 */
		treeSelectChange(value, key, ext) {
			console.log('StationGroupForm 21', value);
			console.log('StationGroupForm 22', key);
			console.log('StationGroupForm 23', ext);
			this.setState({
				stationValue: value
			});
		}

		/**
		 * This function is called when the description or the name changes.
		 * @param  {Object} e   Event
		 * @param  {string} key role_name or role_desc.
		 */		
		handleChange(e, key) {
			if (key == 'group_name') {
				this.setState({
					name: e.target.value
				});
			} else if (key == 'group_desc') {
				this.setState({
					description: e.target.value
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
		 * This function call the API to add a new role.
		 */
		handleSubmitAdd() {
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/stations/groups/new', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					name: that.state.name,
					description: that.state.description,
					station_list: that.state.stationValue
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
					that.props.addEditCallback('add',json.created_by, json.insert_id, json.created_at, that.state.description, json.is_deletable, that.state.name, that.state.stationValue);
					that.openNotification('success', 'Station Group added successfully');
					that.props.onCancel();
					// that.props.fetchData();
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
		 * This function call the API to edit the role.
		 */
		handleSubmitEdit() {
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/stations/groups/' + that.state.selected_group_id + '/edit', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					group_id: that.state.selected_group_id,
					name: that.state.name,
					description: that.state.description,
					station_list: that.state.stationValue
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
					that.props.addEditCallback('edit',that.state.selected_created_by, that.state.selected_group_id, '0', that.state.description, 'flag', that.state.name, that.state.stationValue);
					that.openNotification('success', 'Station Group updated successfully');
					that.props.onCancel();
					// that.props.fetchData();
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
			const stationProps = {
				treeData: this.state.station_list_tree,
				value: this.state.stationValue,
				// onChange: this.onChange,
				treeCheckable: true,
				// showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select station',
				//showSearch: false,
				// allowClear: true,
				// filterTreeNode: true,
				treeNodeFilterProp: 'title',
				dropdownStyle: {
					'maxHeight': '200px',
				},
				// searchValue: this.state.search_tree,
				// onSearch: (e) => this.searchTree(e)
			};
			console.log('childddddd', stationProps);
			return (
				<div id="group_form">
					<Drawer
						title={this.state.add_group ? 'Add New Station Group' : (this.state.edit_group ? 'Edit Station Group' : 'Add New Station Group')}
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
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="Group Name">
										{getFieldDecorator('groupName', {
											rules: [{ required: true, message: 'Please enter group name' }],
											initialValue: this.state.name,
											onChange: (e) => this.handleChange(e, 'group_name')
										})(<Input placeholder="Please enter group name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
								<Form.Item label="Description">
								 <Input.TextArea rows={4} onChange={(e) => this.handleChange(e, 'group_desc')} defaultValue={this.state.description} placeholder="Please enter group description" />
								</Form.Item>
								</Col>
						 </Row>
						 <Row gutter={16}>
							<Col span={24}>
								<Form.Item label="Stations">
									{getFieldDecorator('stations', {
										rules: [{ required: true, message: 'Please select station' }],
										initialValue: this.state.stationValue,
										setFieldsValue: this.state.stationValue
									})(
										<TreeSelect onChange={(value, key, ext) => this.treeSelectChange(value, key, ext)} dropdownStyle={{ maxHeight: 200, overflow: 'auto' }} treeDefaultExpandAll {...stationProps} className="filter-icon" />
									)}
								</Form.Item>
							</Col>
						 </Row>
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
							<Button disabled={(!this.state.name || this.state.name =='' || !this.state.stationValue || (this.state.stationValue && this.state.stationValue.length == 0)) ? true : false} onClick={() => {
								if (this.state.add_group) {
									this.handleSubmitAdd();
								} else if (this.state.edit_group) {
									this.handleSubmitEdit();
								}
							}} loading={this.state.loading} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_PARENT1 = TreeSelect.SHOW_PARENT;
/**
 * Main  component of the station group page.
 */
export default class StationGroup extends React.Component {
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
		console.log('parsed', this.parsed_search);
		/**
		 * State of the component.
		 * @type {Object}
		 * @property {Number} client_id Stores the client ID.
		 * @property {Number} application_id Stores the Application ID.
		 *  @property {Boolean} edit_group Whether to edit a group.
		 * @property {Boolean} add_group Whether to add a new group.
		 * @property {Boolean} delete_group Whether to delete a new group.
		 * @property {Array} category_selected Stores the category selected.
		 * @property {Array} sub_category_selected Stores the sub-category selected.
		 * @property {string} table_search Stores the value to be searched in the table.
		 */
		this.state= {
			client_id: 365,
			application_id: 19,
			edit_group: false,
			add_group: false,
			delete_group: false,
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
			tree_search: '',
			unauthorised_access: false,
			unauthorised_access_msg: ''
		};
		console.log('station group constructor', this.state);
		this.updateDataInterval = null;
	}


	/*onChangeGroup(groupValue) {
		this.setState({ groupValue });
	}*/

	/**
	 * This function sets the delete confirmation popup.
	 * @param  {Object} role Role data.
	 */	
	showDeleteConfirm(station_group) {
		console.log('showDeleteConfirm', station_group);
		let that = this;
		that.props.history.push('/settings/station-groups/' + station_group.id + '/delete/' + that.props.history.location.search);
		confirm({
			title: 'Do you want to delete ?',
			content: station_group.name,
			onOk() {
				that.deleteGroup(station_group);
			},
			onCancel() {
				that.props.history.push('/settings/station-groups/' + that.props.history.location.search);
			}
		});
	}
	/**
	 * This function calls the API to delete the role.
	 * @param  {Object} role ROle data.
	 */
	deleteGroup(station_group) {
		let that = this;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/stations/groups/' + station_group.id + '/delete', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			if (json.status === 'success') {
				that.fetchData();
				that.openNotification('success', json.message);
				that.closeAddEditModal();
			} else {
				that.openNotification('error', json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}

	/**
	 * This function sets the state to open the slider to Add/Edit station group.
	 */
	showGroupModal() {
		this.setState({ drawGroupVisible: true });
	}

	/**
	 * This function sets the state to close the Slider.
	 */
	handleCancel() {
		this.setState({
			drawGroupVisible: false,
			setLimitVisible: false
		});
	}

	/**
	 * Predefined function of ReactJS. Called after the component is mounted.
	 * @return {void} 
	 */	
	componentDidMount() {
		document.title = 'Settings - Station Groups - Flood Forecasting and Early Warning System for Kolkata City';
		this.retrieveData();
		console.log('Station Group Mounted');
	}
	/**
	 * Predefined function of ReactJS. Called just before the component is unmounted.
	 * @return {void} 
	 */
	componentWillUnmount() {
		// if (this.updateDataInterval != null) {
			// clearInterval(this.updateDataInterval);
			// this.updateDataInterval = null;
			console.log('StationGroup Unmounted');
		// }
	}

	/**
	 * This function is called from the child component to set the edited value in the main component.
	 * @param {string}  key          add or edit.
	 * @param {string}  created_by   created by.
	 * @param {Number}  id           ID of the role.
	 * @param {Number}  time         Timestamp.
	 * @param {String}  description  Description of the role.
	 * @param {Boolean} is_deletable If the role is deletable.
	 * @param {String}  name         Name of the role.
	 * @param {Array}  station_list       Array of the station_list.
	 */	
	addEditCallback(key,created_by, id, time, description, is_deletable, name, station_list) {
		let user_name = document.getElementById('user_name') ? document.getElementById('user_name').value : 'Username';

		let all_station_groups = this.state.all_station_groups.slice(0);
		if (key == 'add') {
			all_station_groups.push({
				created_at: time,
				created_by: created_by,
				description: description,
				id: id,
				is_deletable: is_deletable,
				name: name,
				station_list: station_list
			});
		} else if (key == 'edit') {
			let edit_st = all_station_groups[_.findIndex(all_station_groups, ['id', id])];
			all_station_groups[_.findIndex(all_station_groups, ['id', id])] = {
				created_at: edit_st.created_at,
				created_by: edit_st.created_by,
				description: description,
				id: id,
				is_deletable: edit_st.is_deletable,
				name: name,
				station_list: station_list
			}
		}
		this.setState({
			all_station_groups: all_station_groups
		},() => this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display));
	}

	/**
	 * This function sets the current value of the selected role to be edited.
	 * @param  {Object} station 	Selected station group.
	 */
	editGroup(station) {
		this.props.history.push('/settings/station-groups/' + station.id + '/edit/' + this.props.history.location.search);
		this.setState({
			selected_group_id: station.id,
			selected_group_name: station.name,
			selected_group_description: station.description,
			selected_group_stations: station.station_list,
			selected_created_by: station.created_by
		});
	}
	/**
	 * This function opens the Slider to Add or Edit the station group.
	 */
	addNewGroup() {
		this.props.history.push('/settings/station-groups/add/' + this.props.history.location.search);
		this.setState({
			drawGroupVisible: true,
			add_group: true,
			edit_group: false
		});
	}

	/*	changeGroup(key, update = false) {
		console.log('in changeGroup',key);
		console.log('in changeGroup',update);
		let search = this.state.table_search;
		this.setState({
			station_group_toggle: key,
			table_search: update ? '' : search
		}, () => {
			this.props.history.push('/settings/station-groups/' + this.props.history.location.search);
		});
	}*/
	/**
	 * This function closes the slider and and sets the values to defaults.
	 */
	closeAddEditModal() {
		this.props.history.push('/settings/station-groups/' + this.props.history.location.search);
		this.setState({
			station_id: '',
			setLimitVisible: false,
			drawGroupVisible: false,
			selected_group_name: null,
			selected_group_stations: null,
			selected_group_description: null,
			selected_group_id: null,
			selected_created_by: null,
			edit_group: false,
			add_group: false,
			delete_group: false,
			unauthorised_access: false,
			unauthorised_access_msg: ''
		});
	}
	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('componentDidUpdate station group');
		this.parsed_search = queryString.parse(this.props.location.search);
		if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((this.props.match.params.station_id != prevProps.match.params.station_id) || (this.props.match.params.station_id != this.state.station_id)) && this.state.all_stations && this.state.all_stations.length && this.props.history.location.pathname.search('/edit') > -1) {
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.station_id) {
						c++;
						this.setState({
							station_id: this.props.match.params.station_id,
							drawGroupVisible: true,
							edit_group: true,
							add_group: false,
							delete_group: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/station-groups/' + this.props.history.location.search);
				}
			}
		} /*else if (this.props.history.location && (this.props.history.location.pathname != prevProps.history.location.pathname) && this.props.history.location.pathname.search(/add/) > 1) {
			this.setState({
				drawGroupVisible: true,
				add_group: true,
				edit_group: false
			});
		}*/ else if (this.props.match.params.station_id && this.props.match.params.station_id !== '' && ((this.props.match.params.station_id != prevProps.match.params.station_id) || (this.props.match.params.station_id != this.state.station_id)) && this.state.all_stations && this.state.all_stations.length && this.props.history.location.pathname.search('/delete') > -1) {
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.station_id && st.is_deletable) {
						c++;
						this.setState({
							station_id: this.props.match.params.station_id,
							delete_group: true,
							edit_group: false,
							add_group: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/station-groups/' + this.props.history.location.search);
				}
			}
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/settings/station-groups') {
			this.setState({
				visible: true,
				edit_group: false,
				delete_group: false,
				selected_group_name: null,
				selected_group_description: null,
				selected_group_stations: null,
				selected_group_id: null,
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
			}, () => {
				this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
				this.defaultTreeValue();
			});
		}
	}

	/**
	 * THis function sets the treevalue to default.
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
				if (groupFilter && groupFilter.length) {groupFilter
					groupFilter.map((tree) => {
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
			groupValue: value
		});
	}
	/**
	 * This funtion creates the query to be pushed in the url.
	 */
	queryCreate(cat, sub_cat) {
		// toaster.warning('Heyyyy', 'Alert');

		console.log('in queryCreate', this.props.history.location.pathname);
		let query_string = '?cat=[' + cat + ']&subcat=[' + this.state.sub_category_selected + ']' + (this.state.table_search  && this.state.table_search != '' ? '&search=' + this.state.table_search : '');
		
		
		if (((this.state.station_id && this.state.station_id != '') || (this.props.match.params.station_id)) && this.state.edit_group) {
			console.log('queryCreate 1', this.state.station_id);
			this.props.history.push('/settings/station-groups/' + this.props.match.params.station_id + '/edit/' + query_string);
		} else if (this.state.add_group) {
			console.log('queryCreate 2', this.state.station_id);
			this.props.history.push('/settings/station-groups/add/' + query_string);
		} else if (((this.state.station_id && this.state.station_id != '') || (this.props.match.params.station_id)) && this.state.delete_group) {
			console.log('queryCreate 3', this.state.station_id);
			this.props.history.push('/settings/station-groups/' + this.props.match.params.station_id + '/delete/' + query_string);
		} else {
			console.log('queryCreate 4', this.state.station_id);
			this.props.history.push('/settings/station-groups/' + query_string);
		}

		
		let filtered_stations = [];
		if (this.state.all_station_groups && this.state.all_station_groups.length && (sub_cat && sub_cat.length)) {
			console.log('debug 1');
			this.state.all_station_groups.map((station) => {
				let c = 0;
				if (station.station_list && station.station_list.length) {
					station.station_list.map((st) => {
						sub_cat.map((sub_cat_id) => {
							if (this.state.station_subcat_object[st] == this.state.sub_category_ids[sub_cat_id]) {
								console.log('in filter');
								c++;
							}
						});
					});
					if (c > 0) {
						filtered_stations.push(station);
					}
				}
			});
		} else if (cat && this.state.category_list && (cat.length == this.state.category_list.length)) {
			console.log('debug 2');
			filtered_stations = this.state.all_station_groups;
		}

		this.setState({
			filtered_stations: filtered_stations,
			// searched_list: filtered_stations
		}, () => this.setSearchedList());
	}
	/**
	 * This function searched for the entered string in the table data.
	 */
	setSearchedList() {
		console.log('in setSearchList function');
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && this.state.table_search != null && this.state.table_search != '' && this.state.table_search != undefined) {
			this.state.filtered_stations.map((cat,index) => {
				if (this.state.table_search != '' && cat.name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
					searched_list.push(cat);
					console.log('in setSearchList 1 function');
				} else if (cat.station_list && cat.station_list.length) {
					let c = 0;
					cat.station_list.map((st) => {
						if (this.state.station_list_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						}
					});
					if (c>0) {
						searched_list.push(cat);
					}
				}
			});
		} else if (!this.state.table_search) {
			searched_list = this.state.filtered_stations.slice(0);
		}
		this.setState({
			searched_list: searched_list
		}, () => {
			// this.sortStation();
		});
	}
	/**
	 * This function searched for the entered string in the table data.
	 * @property {string} value Entenred keyword in searchbar.
	 */
	setSearch(value) {
		console.log('in setSearch function', value);
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && value) {
			this.state.filtered_stations.map((cat,index) => {
				if (value != '' && cat.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
					searched_list.push(cat);
				} else if (cat.station_list && cat.station_list.length) {
					let c = 0;
					cat.station_list.map((st) => {
						if (this.state.station_list_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						}
					});
					if (c>0) {
						searched_list.push(cat);
					}
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
			// this.sortStation();
			this.queryCreate(this.state.category_selected, this.state.sub_category_selected_display);
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
			groupValue: value,
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
	 * This function is used to retrieve the category list.
	 * @return {void}    
	 */
	retrieveData() {
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
				groupFilter = [];
				let sub_category_ids = {};
				let sub_category_name = {};
				let category_list_object = {};
				let category_id_object = {};
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
						let obj2 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								if (!sub_category_ids[sub_cat.id]) {
									sub_category_ids[sub_cat.id] = sub_cat.id;
								} else {
									sub_category_ids[sub_cat.id] = sub_cat.id;
								}
								if (!sub_category_name[sub_cat.id]) {
									sub_category_name[sub_cat.id] = sub_cat.name;
								} else {
									sub_category_name[sub_cat.id] = sub_cat.name;
								}
								
								obj1.push({
									'title': sub_cat.name,
									'value': '0-' + category.id + '-' + sub_cat.id,
									'key': '0-' + category.id + '-' + sub_cat.id,
								});
								obj2.push(sub_cat.id);
							});
							if (!category_id_object[category.id]) {
								category_id_object[category.id] = obj2;
							} else {
								category_id_object[category.id] = obj2;
							}
						}
						groupFilter.push({
							title: category.name,
							value: '0-' +  category.id,
							key: '0-' +  category.id,
							children: obj1
						});
					});
				}
				let value = [];
				/*if (groupFilter && groupFilter.length) {
					value.push(groupFilter[0].children[0].value);
				}*/
				if (that.state.category_selected && that.state.category_selected.length) {
					that.state.category_selected.map((cat) => {
						value.push('0-' + cat);
					});
				} 
				if (that.state.sub_category_selected && that.state.sub_category_selected.length) {
					let tree_node_data = [];
					that.state.sub_category_selected.map((node) => {
						if (groupFilter && groupFilter.length) {
							groupFilter.map((tree) => {
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
					groupFilter: groupFilter,
					groupValue: value,
					sub_category_ids: sub_category_ids,
					sub_category_name: sub_category_name,
					category_id_object: category_id_object
				}, () => {
					console.log('groupFilter', that.state.groupFilter);
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
					unauthorised_access: true
				});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}
	/**
	 * Function used to get the station group list for the page.
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
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/stations/groups/list', {
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
				let station_list_object = {};
				let station_list_tree = [];
				let station_subcat_object = {};
				let sub_category_name_object = {};
				if (that.state.sub_category_name && Object.keys(that.state.sub_category_name).length) {
					Object.keys(that.state.sub_category_name).map((sub_cat) => {
						let temp = [];
						if (json.station_list && json.station_list.length) {
							json.station_list.map((station) => {
								new_search_list.push({name: station.name,
									id: station.id});
								station_list_tree.push({
									title: station.name,
									value: station.id,
									key: station.id,
								});
								if (!station_list_object[station.id]) {
									station_list_object[station.id] = station.name;
								} else {
									station_list_object[station.id] = station.name;
								}
								if (!station_subcat_object[station.id]) {
									station_subcat_object[station.id] = station.sub_category;
								} else {
									station_subcat_object[station.id] = station.sub_category;
								}
								if (sub_cat == station.sub_category) {
									temp.push(station.id);
								}
							});
						}
						if (!sub_category_name_object[sub_cat]) {
							sub_category_name_object[sub_cat] = temp;
						} else {
							sub_category_name_object[sub_cat] = temp;
						}
					});
				}

				let station_list_options = [];
				console.log('sub_category_name_object',sub_category_name_object);
				if (that.state.category_id_object && Object.keys(that.state.category_id_object).length) {
					Object.keys(that.state.category_id_object).map((cat) => {
						let temp_sub = [];
						if (sub_category_name_object && Object.keys(sub_category_name_object).length) {
							Object.keys(sub_category_name_object).map((access_name) => {
								if (that.state.category_id_object[cat].indexOf(parseInt(access_name)) > -1) {
									let c=0;
									let obj1 = [];
									json.station_list.map((station) => {
										if (sub_category_name_object[access_name].indexOf(station.id) > -1) {
											c++;
											obj1.push({
												'title': station.name,
												'key': station.id,
												'value': station.id
											});
										}
									});
									if (c > 0) {
										temp_sub.push({
											'title': that.state.sub_category_name[access_name],
											'key': cat + '-' + access_name,
											'value': cat + '-' + access_name,
											'children': obj1
										});
									}
								}
							});
						}
						station_list_options.push({
							'title': that.state.category_list_object[cat],
							'key': '0-' + cat,
							'value': '0-' + cat,
							'children': temp_sub
						});
					});
				}

				console.log('sub_category_name_object',station_list_options);
				/*let station_list = [];
				if (json.station_list && json.station_list.length) {
					json.station_list.map((station, index) => {
						station_list.push(
							{
								key: station.id,
								serial: index,
								name: station.name,
								category: that.state.category_list_object[station.category]
							}
						);
					});
				}*/

				if (that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ) {
					let station_id = that.props.match.params.station_id;
					if (json.station_groups && json.station_groups.length) {
						json.station_groups.map((st_gr) => {
							if (st_gr.id == station_id) {
								that.editGroup(st_gr);
							}
						});
					}
				}

				if (that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ) {
					let station_id = that.props.match.params.station_id;
					if (json.station_groups && json.station_groups.length) {
						json.station_groups.map((st_gr) => {
							if (st_gr.id == station_id && st_gr.is_deletable) {
								that.showDeleteConfirm(st_gr);
							}
						});
					}
				}

				if (that.props.history.location && that.props.history.location.pathname.search('/add') > -1) {
					that.addNewGroup();
				}

				that.setState({
					unauthorised_access: false,
					all_stations: json.station_list,
					all_station_groups: json.station_groups,
					// station_list: station_list,
					//searched_list: json.station_list,
					device_info: json.device_info,
					event_log: json.event_log,
					new_search_list: new_search_list,
					station_list_object: station_list_object,
					station_list_tree: station_list_options,
					station_subcat_object: station_subcat_object,
					edit_group: that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ? true : false,
					add_group: that.props.history.location && that.props.history.location.pathname.search('/add') > -1 ? true : false,
					delete_group:  that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ? true : false,
					// filtered_stations: json.all_stations,
				},() => {

					if (true) {
						that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display, update);
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
	 * THis function is to console the searched keyword.
	 */
	treeSearch(e) {
		console.log('tree search', e);
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			searchValue: this.state.tree_search,
			onSearch: (e) => this.treeSearch(e),
			// onChange: this.onChangeGroup,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT1,
			searchPlaceholder: 'Filter by Category or Sub-category',
		};
		if (this.state.all_stations && this.state.all_stations.length) {
			return <div>
				<div className="table-filter"><TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
				<div className="table-search">
					<Input placeholder="Search by Station Group Name or Station Name " defaultValue={this.state.table_search} prefix={<Icon type="search" />} onChange={(e) => this.setSearch(e.target.value)} />
				</div>
				<div className="add-btn"><Button type="primary" icon="plus" onClick={() => this.addNewGroup()}>Create New Group</Button></div>
				<div className="features">
					{(() => {
						if (this.state.searched_list && this.state.searched_list.length) {
							let station_group_list = this.state.searched_list.map((station_group) => {
								return <div className="feature">
									<Card 
										title={station_group.name}
										extra={
											<div>
												<Popconfirm className="info-msg" title={station_group.description && station_group.description != '' ? station_group.description : '-'} icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
												</Popconfirm>
												<Dropdown overlay={<Menu>
														<Menu.Item key="action-1" onClick={() => this.editGroup(station_group)}>Edit</Menu.Item>
														<Menu.Item key="action-2" onClick={() => this.showDeleteConfirm(station_group)} disabled={!station_group.is_deletable} >
														{(() => {
															if (station_group.is_deletable) {
																return <span> Delete </span>;
															} else {
																return <Tooltip title="This group can not be deleted">
																	<span>Delete</span>
																</Tooltip>;
															}
														})()}
															</Menu.Item>
													</Menu>} trigger={['click']} placement="bottomLeft">
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
											</Dropdown>
											</div>
									}
										className="back-grey"
									>
										<div className="detail">
											<span className="table-txt hellip">{'Created by ' + station_group.created_by}</span>
											<span className="date-txt">{moment.unix(station_group.created_at).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</span>
										</div>
										<div className="total-count">
											<span>{'Total no of stations: ' + (station_group.station_list && station_group.station_list.length ? station_group.station_list.length : '0')}</span>
										</div>
										<div className="station-name-container">
											{(() => {
												if (station_group.station_list && station_group.station_list.length) {
													let station_list = station_group.station_list.map((station) => {
														return <div className="station-names">{this.state.station_list_object[station]}</div>
													}).filter(Boolean);
													return station_list;
												} else {
													return <div className="text-center">No stations found</div>;
												}
											})()}
										</div>
									</Card>
								</div>;
							}).filter(Boolean);
							return station_group_list;
						} else {
							return <Row type="flex" justify="space-around" className="no-data-text-container">
								<div className="no-data-text">No station groups found!</div>
							</Row>;
						}
					})()}
				</div>
				{(() => {
					if (this.state.edit_group || this.state.add_group) {
						return <StationGroupForm 
							visible={this.state.drawGroupVisible}
							onCancel={() => this.closeAddEditModal()}
							onCreate={() => this.handleCreate()}
							addEditCallback={(key,created_by, id, time, description, is_deletable, name, station_list) => this.addEditCallback(key,created_by, id, time, description, is_deletable, name, station_list)}
							all_stations={this.state.all_stations}
							station_list_tree={this.state.station_list_tree}
							application_id={this.state.application_id}
							client_id={this.state.client_id}
							selected_group_name={this.state.selected_group_name}
							selected_group_stations={this.state.selected_group_stations}
							selected_group_description={this.state.selected_group_description}
							selected_group_id={this.state.selected_group_id}
							add_group={this.state.add_group}
							edit_group={this.state.edit_group}
						/>;
					}
				})()}
				
				<Modal
					title="Station Group-1"
					centered
					visible={this.state.modalVisible}
					onOk={() => this.setModalVisible(false)}
					onCancel={() => this.setModalVisible(false)}
				>
					<p>Group Description..........</p>
				</Modal>
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