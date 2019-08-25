import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification, Tree, Checkbox, Tag, Alert } from 'antd';
// import './css/style.less';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
import moment from 'moment-timezone';
import _ from 'lodash';

const queryString = require('query-string');

const confirm = Modal.confirm;

function showDelete() {
	confirm({
		title: 'Do you want to delete ?',
		content: '',
		onOk() {},
		onCancel() {},
	});
}

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let userData = [];

let stationData = [];
/**
 * Component for slider to add/edit user group.
 */
const UserGroupForm = Form.create()(
	class extends React.Component {
			/**
			 * This is the Constructor for Dashboard page used to set the default task while page loads.
			 * @param  {Object} props This will import the attributes passed from its Parent Class.
			 */
			constructor(props) {
				super(props);
				/**
				 * initial state of the component.
				 * @type {Object}
				 * @property {Number} client_id Stores the client ID.
				 * @property {Number} application_id Stores the Application ID.
				 *  @property {Boolean} edit_group Whether to edit a group.
				 * @property {Boolean} add_group Whether to add a new group.
				 *  @property {string} description description of the selected user group.
				 * @property {string} name name of the selected user group.
				 * @property {string} selected_group_id ID of the selected user group.
				 * @property {string} selected_created_by Stores the name of the person who created the group.
				 * @property {string} selected_group_role Stores the selected role id of the user group.
				 * @property {Array} selected_group_stations Stores the selected stations under the user group.
				 * @property {Array} selected_group_role Stores the selected selected station groups under the user group.
				 */
				this.state = {
					client_id: props.client_id,
					application_id: props.application_id,
					valueUser: [],
					valueStation: [],
					roles_list: props.roles_list,
					add_group: props.add_group,
					edit_group: props.edit_group,
					selected_group_id: props.selected_group_id,
					selected_created_by: props.selected_created_by,
					name: props.selected_group_name,
					description: props.selected_group_description,
					selected_group_role: props.selected_group_role,
					selected_group_stations: props.selected_group_stations,
					selected_group_station_groups: props.selected_group_station_groups,
					selected_group_users: props.selected_group_users,
					station_group_list_object: props.station_group_list_object,
					station_list_object: props.station_list_object,
					valueStation: props.valueStation,
					valueUser: props.valueUser,
					unauthorised_access: false,
					unauthorised_access_msg: ''
				}
				console.log('UserGroupForm', this.state);
			}
			/**
			 * This function sets the user in the state.
			 */
		onChangeUser(value) {
			console.log('valueUser', value);
			this.setState({
				valueUser: value
			});
		}
		/**
		 * This function sets the the station in the state.
		 */
		onChangeStation(value) {
			console.log('valueStation', value);
			this.setState({valueStation: value});
		}
		/**
		 * This function sets the name and description of the group.
		 * @param  {Object} e   Event
		 * @param  {string} key group_name or group_desc
		 * @return {void}     
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
		 * This function sets the selected role for the user group.
		 */
		handleSelect(value, option) {
			console.log('handleSelect value', value);
			console.log('handleSelect option', option);
			this.setState({
				selected_group_role: value
			});
		}
		/**
		 * Sets the data in the required format for station or station group.
		 * @param {string} key station or station group
		 */
		setDataFormat(key) {
			let arr = [];
			console.log('arr 3', this.state.valueStation);
			if (key == 'stations') {
				if (this.state.valueStation && this.state.valueStation.length) {
					this.state.valueStation.map((id) => {
						if (id.split('-').length == 2 && id.split('-')[1] == '0') {
							Object.keys(this.state.station_list_object).map((key) => {
								arr.push(key);
							});
						}
						if (id.split('-').length == 3 && id.split('-')[1] == '0') {
							arr.push(id.split('-')[2]);
						}
					});
				}
			} else if (key == 'station_groups') {
				if (this.state.valueStation && this.state.valueStation.length) {
					this.state.valueStation.map((id) => {
						console.log('arr 1', id);
						if (id.split('-').length == 2 && id.split('-')[1] == '1') {
							Object.keys(this.state.station_group_list_object).map((key) => {
								arr.push(key);
							});
						}
						if (id.split('-').length == 3 && id.split('-')[1] == '1') {
							arr.push(id.split('-')[2]);
						}
						console.log('arr 1', id);
					});
				}
			}
			return arr;
		}
		/**
		 * This function call the API to add a new user group.
		 */
		handleSubmitAdd() {
			console.log('handleSubmitAdd');
			let station = this.setDataFormat('stations');
			let station_groups = this.setDataFormat('station_groups');
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/groups/new', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					name: that.state.name,
					description: that.state.description,
					role_id: that.state.selected_group_role,
					users: that.state.valueUser,
					stations: station,
					station_groups: station_groups
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
					that.props.addEditCallback('add', json.created_by, json.insert_id, json.created_at, that.state.description, json.is_deletable, that.state.name, that.state.valueUser, station, station_groups, that.state.selected_group_role);
					that.openNotification('success', 'User Group added successfully');
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
		 * This function call the API to edit an user group.
		 */
		handleSubmitEdit() {
			let that = this;
			let response_status;
			let station = this.setDataFormat('stations');
			let station_groups = this.setDataFormat('station_groups');
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/groups/' + that.state.selected_group_id + '/edit', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					name: that.state.name,
					description: that.state.description,
					role_id: that.state.selected_group_role,
					users: that.state.valueUser,
					stations: station,
					station_groups: station_groups
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
					that.props.addEditCallback('edit', that.state.selected_created_by, that.state.selected_group_id, '0', that.state.description, 'flag', that.state.name,  that.state.valueUser, station, station_groups, that.state.selected_group_role);
					that.openNotification('success', 'User Group updated successfully');
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
			const tProps = {
				treeData: userData,
				// value: this.state.valueUser,
				// onChange: (value) => this.onChangeUser(value),
				treeCheckable: true,
				treeNodeFilterProp: 'title',
				dropdownStyle: {
					'maxHeight': '200px',
				},
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user',
			};
			const tProps1 = {
				treeData: stationData,
				value: this.state.valueStation,
				// onChange: (value) => this.onChangeStation(value),
				treeCheckable: true,
				treeNodeFilterProp: 'title',
				dropdownStyle: {
					'maxHeight': '200px',
				},
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select station / station group',
			};
			return (
				<div id="group_form">
					<Drawer
						title={this.state.add_group ? 'Create New User Group' : (this.state.edit_group ? 'Edit User Group' : 'Create New User Group')}
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
								<Col span={12} className="wid-100">
									<Form.Item label="Role">
										{getFieldDecorator('role', {
											rules: [{ required: true, message: 'Please select role' }],
											initialValue: this.state.selected_group_role,
											onChange: (value, option) => this.handleSelect(value, option)
										})(
											<Select showSearch defaultActiveFirstOption={false} placeholder="Please select role" >
											{(() => {
												if (this.state.roles_list && this.state.roles_list.length) {
													return this.state.roles_list.map((role) => {
														return <Option value={role.id}>{role.name}</Option>;
													});
												}
											})()}
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="Description">
									 <Input.TextArea defaultValue={this.state.description} onChange={(e) => this.handleChange(e, 'group_desc')} rows={4} placeholder="Please enter group description" />
									</Form.Item>
							</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Station / Station Group Name">
										{getFieldDecorator('stationName', {
											rules: [{ required: true, message: 'Please select station / station group' }],
											initialValue: this.state.valueStation,
											setFieldsValue: this.state.valueStation,
											onChange: (value) => this.onChangeStation(value),
										})(<TreeSelect showSearch treeDefaultExpandAll {...tProps1} className="filter-icon" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Users">
										{getFieldDecorator('users', {
											rules: [{ required: true, message: 'Please select user' }],
											initialValue: this.state.valueUser,
											onChange: (value) => this.onChangeUser(value),
										})(
											<TreeSelect showSearch treeDefaultExpandAll {...tProps} className="filter-icon" />
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
							<Button
								disabled={(!this.state.name || this.state.name =='' || !this.state.valueStation || (this.state.valueStation && this.state.valueStation.length == 0) || !this.state.valueUser || (this.state.valueUser && this.state.valueUser.length == 0) || !this.state.selected_group_role ||  this.state.selected_group_role =='') ? true : false}
								 onClick={() => {
								if (this.state.add_group) {
									this.handleSubmitAdd();
								} else if (this.state.edit_group) {
									this.handleSubmitEdit();
								}}}
								loading={this.state.loading}
								 type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

let dataUserGroup = [];

let groupFilter = [];
/**
 * Main component of user group page.
 */
export default class UserGroupsPage extends React.Component {
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
		 * State of the component.
		 * @type {Object}
		 * @property {Number} client_id Stores the client ID.
		 * @property {Number} application_id Stores the Application ID.
		 * @property {Boolean} edit_group Whether to edit a group.
		 * @property {Boolean} add_group Whether to add a new group.
		 * @property {Boolean} delete_group Whether to delete a new group.
		 * @property {string} table_search Stores the value to be searched in the table.
		 * @property {Array} filter_role Stores the roles to be filtered for in the table.
		 */
		
		this.state= {
			client_id: 365,
			application_id: 19,
			edit_group: false,
			add_group: false,
			delete_group: false,
			drawGroupVisible: false,
			group_id: '',
			table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			filter_role: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.role ? JSON.parse(this.parsed_search.role) : [],
			unauthorised_access: false,
			unauthorised_access_msg: ''
		};
	}

	/**
	 * Predefined function of ReactJS. Called after the component is mounted.
	 * @return {void} 
	 */	
	componentDidMount() {
		document.title = 'Settings - User Groups - Flood Forecasting and Early Warning System for Kolkata City';
		this.fetchData();
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
		if (this.props.match.params.group_id && this.props.match.params.group_id !== '' && ((this.props.match.params.group_id != prevProps.match.params.group_id) || (this.props.match.params.group_id != this.state.group_id)) && this.state.users_list && this.state.users_list.length && this.props.history.location.pathname.search('/edit') > -1) {
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.group_id) {
						c++;
						this.setState({
							group_id: this.props.match.params.group_id,
							drawGroupVisible: true,
							edit_group: true,
							add_group: false,
							delete_group: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/user-groups/' + this.props.history.location.search);
				}
			}
		} /*else if (this.props.history.location && (this.props.history.location.pathname != prevProps.history.location.pathname) && this.props.history.location.pathname.search(/add/) > 1) {
			this.setState({
				drawGroupVisible: true,
				add_group: true,
				edit_group: false
			});
		}*/ else if (this.props.match.params.group_id && this.props.match.params.group_id !== '' && ((this.props.match.params.group_id != prevProps.match.params.group_id) || (this.props.match.params.group_id != this.state.group_id)) && this.state.users_list && this.state.users_list.length && this.props.history.location.pathname.search('/delete') > -1) {
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.group_id && st.is_deletable) {
						c++;
						this.setState({
							group_id: this.props.match.params.group_id,
							delete_group: true,
							edit_group: false,
							add_group: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/user-groups/' + this.props.history.location.search);
				}
			}
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/settings/user-groups') {
			this.setState({
				edit_group: false,
				add_group: false,
				delete_group: false,
				drawGroupVisible: false,
				group_id: '',
				table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
				filter_role: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.role ? JSON.parse(this.parsed_search.role) : [],
			}, () => {
				this.queryCreate();
				// this.defaultTreeValue();
			});
		}
	}
	/**
	 * Function used to get the user group list for the page.
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
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/groups/list', {
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
					unauthorised_access_msg: ''
				});
			}
			else if (json.status === 'success') {
				
				let treeData = [];
				let access_list_options = {};
				let access_options = {};
				let access_options_keys = {};
				let sub_access_options = {};
				let sub_access_options_keys = {};
				if (json.access_list && Object.values(json.access_list).length) {
					Object.keys(json.access_list).map((access, main_index) => {
						let temp = [];
						let temp2 = {};
						if (json.access_list[access] instanceof Array && json.access_list[access].length) {
							json.access_list[access].map((sub_access, index) => {
								temp.push({
									'title': sub_access,
									'key': '0-' + (main_index+1) + '-' + (index+1)
								});
								if (!temp2['0-' + (main_index+1) + '-' + (index+1)]) {
									temp2['0-' + (main_index+1) + '-' + (index+1)] = sub_access;
								} else {
									temp2['0-' + (main_index+1) + '-' + (index+1)] = sub_access;
								}
								if (!sub_access_options['0-' + (main_index+1) + '-' + (index+1)]) {
									sub_access_options['0-' + (main_index+1) + '-' + (index+1)] = sub_access;
								} else {
									sub_access_options['0-' + (main_index+1) + '-' + (index+1)] = sub_access;
								}
								if (!sub_access_options_keys[sub_access]) {
									sub_access_options_keys[sub_access] = '0-' + (main_index+1) + '-' + (index+1);
								} else {
									sub_access_options_keys[sub_access] = '0-' + (main_index+1) + '-' + (index+1);
								}
							});
						}
						if (access != 'master_access') {
							treeData.push({
								'title': access,
								'key': '0-' + (main_index+1),
								'children': temp
							});
							if (!access_list_options['0-' + (main_index+1)]) {
								access_list_options['0-' + (main_index+1)] = temp2;
							} else {
								access_list_options['0-' + (main_index+1)] = temp2;
							}
							if (!access_options['0-' + (main_index+1)]) {
								access_options['0-' + (main_index+1)] = access;
							} else {
								access_options['0-' + (main_index+1)] = access;
							}
							if (!access_options_keys[access]) {
								access_options_keys[access] = '0-' + (main_index+1);
							} else {
								access_options_keys[access] = '0-' + (main_index+1);
							}
						}
					});
				}

				if (that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ) {
						let group_id = that.props.match.params.group_id;
						if (json.user_groups && json.user_groups.length) {
							json.user_groups.map((st_gr) => {
								if (st_gr.id == group_id) {
									that.editGroup(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ) {
						let group_id = that.props.match.params.group_id;
						if (json.user_groups && json.user_groups.length) {
							json.user_groups.map((st_gr) => {
								if (st_gr.id == group_id && st_gr.is_deletable) {
									that.showDeleteConfirm(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/add') > -1) {
						that.addNewGroup();
					}

					let roles_list_object = {};
					groupFilter = [];
					if (json.roles_list && json.roles_list.length) {
						json.roles_list.map((roles) => {
							groupFilter.push({
								title: roles.name,
								value: roles.id,
								key: roles.id
							});
							if (!roles_list_object[roles.id]) {
								roles_list_object[roles.id] = roles.name;
							} else {
								roles_list_object[roles.id] = roles.name;
							}
						});
					}

					let groupValue = [];
					if (that.state.filter_role && that.state.filter_role.length) {
						that.state.filter_role.map((role) => {
							groupValue.push(role);
						});
					}

					let station_list_object = {};
					if (json.station_list && json.station_list.length) {
						json.station_list.map((st) => {
							if (!station_list_object[st.id]) {
								station_list_object[st.id] = st.name;
							} else {
								station_list_object[st.id] = st.name;
							}
						});
					}

				let station_group_list_object = {};
				if (json.station_group_list && json.station_group_list.length) {
					json.station_group_list.map((st) => {
						if (!station_group_list_object[st.id]) {
							station_group_list_object[st.id] = st.name;
						} else {
							station_group_list_object[st.id] = st.name;
						}
					});
				}
				
				let users_list_object = {};
				if (json.users_list && json.users_list.length) {
					json.users_list.map((st) => {
						if (!users_list_object[st.id]) {
							users_list_object[st.id] = st.name;
						} else {
							users_list_object[st.id] = st.name;
						}
					});
				}

				dataUserGroup = [];
				if (json.user_groups && json.user_groups.length) {
					json.user_groups.map((user_gr) => {
						let temp_users = [];
						if (user_gr.users && user_gr.users.length) {
							user_gr.users.map((user_id) => {
								temp_users.push(users_list_object[user_id]);
							});
						}
						let temp_station = [];
						let temp_station_group = [];
						if (user_gr.stations && user_gr.stations.length) {
							user_gr.stations.map((st) => {
								temp_station.push(station_list_object[st]);
							});
						}
						if (user_gr.station_group && user_gr.station_group.length) {
							user_gr.station_group.map((st) => {
								temp_station_group.push(station_group_list_object[st]);
							});
						}
						dataUserGroup.push({
							'key': user_gr.id,
							'groupname': user_gr.name,
							'created': [user_gr.created_by],
							'username': temp_users,
							'stationname': temp_station,
							'stationgroupname': temp_station_group,
							'role': roles_list_object[user_gr.role_id],
							'description': user_gr.description,
							'id': user_gr.id,
							'name': user_gr.name,
							'role_id': user_gr.role_id,
							'users': user_gr.users,
							stations: user_gr.stations,
							station_group: user_gr.station_group,
							'created_by': user_gr.created_by,
							'created_at': user_gr.created_at,
							'is_deletable': user_gr.is_deletable
						});
					});
				}

				stationData = [];
				if (json.station_list && json.station_list.length) {
					let obj1 = [];
					json.station_list.map((st) => {
						obj1.push({
							title: st.name,
							value: '0-0-' + st.id,
							key: '0-0-' + st.id
						});
					});
					stationData.push({
						'title': 'Stations',
						'value': '0-0',
						'key': '0-0',
						'children': obj1
					});
				}

				if (json.station_group_list && json.station_group_list.length) {
					let obj1 = [];
					json.station_group_list.map((st) => {
						obj1.push({
							title: st.name,
							value: '0-1-' + st.id,
							key: '0-1-' + st.id
						});
					});
					stationData.push({
						'title': 'Station groups',
						'value': '0-1',
						'key': '0-1',
						'children': obj1
					});
				}

				userData = [];
				if (json.users_list && json.users_list.length) {
					json.users_list.map((user) => {
						userData.push({
							'title': user.name,
							'value': user.id,
							'key': user.id,
						});
					});
				}
				console.log('stationData', stationData);
				console.log('access_options', access_options);
				console.log('access_list_options', access_list_options);
				that.setState({
					unauthorised_access: false,
					groupValue: groupValue,
					roles_list: json.roles_list,
					roles_list_object: roles_list_object,
					station_list_object: station_list_object,
					station_group_list_object: station_group_list_object,
					users_list_object: users_list_object,
					station_group_list: json.station_group_list,
					station_list: json.station_list,
					user_groups: json.user_groups,
					users_list: json.users_list,
					all_access_list: json.access_list,
					treeData: treeData,
					access_list_options: access_list_options,
					access_options: access_options,
					sub_access_options: sub_access_options,
					access_options_keys: access_options_keys,
					sub_access_options_keys: sub_access_options_keys,
					// station_list: station_list,
					//searched_list: json.station_list,
					// device_info: json.device_info,
					// event_log: json.event_log,
					// new_search_list: new_search_list,
					// station_list_object: station_list_object,
					// station_list_tree: station_list_tree,
					// station_subcat_object: station_subcat_object,
					edit_group: that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ? true : false,
					add_group: that.props.history.location && that.props.history.location.pathname.search('/add') > -1 ? true : false,
					delete_group:  that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ? true : false,
					// filtered_stations: json.all_stations,
				},() => {
					

					if (true) {
						that.queryCreate();
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
					unauthorised_access: false,
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
	 * This function sets the delete confirmation popup.
	 * @param  {Object} role user group data.
	 */	
	showDeleteConfirm(role) {
		
		let that = this;
		that.props.history.push('/settings/user-groups/' + role.id + '/delete/' + that.props.history.location.search);
		console.log('showDeleteConfirm', role);
		confirm({
			title: 'Do you want to delete ?',
			content: role.name,
			onOk() {
				that.deleteGroup(role);
			},
			onCancel() {
				that.closeAddEditModal();
				that.props.history.push('/settings/user-groups/' + that.props.history.location.search);
			}
		});
	}
	/**
	 * This function calls the API to delete the user group.
	 * @param  {Object} role user group data.
	 */
	deleteGroup(role) {
		let that = this;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/groups/' + role.id + '/delete', {
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
	 * This function opens the Slider to Add or Edit the user group.
	 */
	addNewGroup() {
		this.props.history.push('/settings/user-groups/add/' + this.props.history.location.search);
		this.setState({
			drawGroupVisible: true,
			add_group: true,
			edit_group: false,
			delete_group: false
		});
	}
	/**
	 * This function sets the current value of the selected user group to be edited.
	 * @param  {Object} group 	Selected use group.
	 */
	editGroup(group) {
		console.log('table 1', group);
		this.props.history.push('/settings/user-groups/' + group.id + '/edit/' + this.props.history.location.search);
		let valueStation = [];
		let valueUser = [];

		if (group.stations && group.stations.length) {
			group.stations.map((id) => {
				valueStation.push('0-0-' + id);
			});
		}
		if (group.station_groups && group.station_groups.length) {
			group.station_groups.map((id) => {
				valueStation.push('0-1-' + id);
			});
		}
		if (group.users && group.users.length) {
			valueUser = group.users.slice(0);
		}
		console.log('UserGroupForm 1', valueStation);
		this.setState({
			selected_created_by: group.created_by,
			selected_group_id: group.id,
			selected_group_name: group.name,
			selected_group_description: group.description,
			selected_group_role: group.role_id,
			selected_group_stations: group.stations,
			selected_group_station_groups: group.station_groups,
			selected_group_users: group.users,
			valueStation: valueStation,
			valueUser: valueUser
		});
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
	 * @param {Array}  user_list     users list.
	 * @param {Array}  stations      stations.
	 * @param {Array}  station_groups     station_groups.
	 * @param {Number}  role_id       Role selected for that group.
	 */	
	addEditCallback(key, created_by, id, time, description, is_deletable, name, user_list, stations, station_groups, role_id) {
		let user_name = document.getElementById('user_name') ? document.getElementById('user_name').value : 'Username';

		let user_groups = this.state.user_groups.slice(0);
		if (key == 'add') {
			user_groups.push({
				created_at: time,
				created_by: created_by,
				description: description,
				id: id,
				is_deletable: is_deletable,
				name: name,
				stations: stations,
				role_id: role_id,
				users: user_list,
				station_groups: station_groups
			});
		} else if (key == 'edit') {
			let edit_st = user_groups[_.findIndex(user_groups, ['id', id])];
			user_groups[_.findIndex(user_groups, ['id', id])] = {
				created_at: edit_st.created_at,
				created_by: created_by,
				description: description,
				id: id,
				is_deletable: edit_st.is_deletable,
				name: name,
				stations: stations,
				role_id: role_id,
				users: user_list,
				station_groups: station_groups
			}
		}
		this.setState({
			user_groups: user_groups
		},() => this.queryCreate());
	}
	/**
	 * This function closes the slider and and sets the values to defaults.
	 */
	closeAddEditModal() {
		this.props.history.push('/settings/user-groups/' + this.props.history.location.search);
		this.setState({
			group_id: '',
			drawGroupVisible: false,
			add_group: false,
			edit_group: false,
			delete_group: false,
			selected_group_id: null,
			selected_group_name: null,
			selected_group_description: null,
			selected_group_role: null,
			selected_group_stations: [],
			selected_group_station_groups: [],
			selected_created_by: null,
			selected_group_users: [],
			valueUser: [],
			valueStation: [],
			unauthorised_access: false,
			unauthorised_access_msg: ''
		});
	}
	/**
	 * This funtion creates the query to be pushed in the url.
	 */
	queryCreate() {
		// toaster.warning('Heyyyy', 'Alert');

		console.log('in queryCreate', this.props.history.location.pathname);
		let query_string = '?' + (this.state.filter_role && this.state.filter_role.length ? 'role=[' + this.state.filter_role + ']' : '' ) + (this.state.table_search  && this.state.table_search != '' ? (this.state.filter_role && this.state.filter_role.length ? '&search=' + this.state.table_search : 'search=' + this.state.table_search ) : '');
		
		console.log('queryCreate state', this.state);
		if (((this.state.group_id && this.state.group_id != '') || (this.props.match.params.group_id)) && this.state.edit_group) {
			console.log('queryCreate 1', this.state.group_id);
			this.props.history.push('/settings/user-groups/' + this.props.match.params.group_id + '/edit/' + query_string);
		} else if (this.state.add_group) {
			console.log('queryCreate 2', this.state.group_id);
			this.props.history.push('/settings/user-groups/add/' + query_string);
		} else if (((this.state.group_id && this.state.group_id != '') || (this.props.match.params.group_id)) && this.state.delete_group) {
			console.log('queryCreate 3', this.state.group_id);
			this.props.history.push('/settings/user-groups/' + this.props.match.params.group_id + '/delete/' + query_string);
		} else {
			console.log('queryCreate 4', this.state.group_id);
			this.props.history.push('/settings/user-groups/' + query_string);
		}
		

		let filtered_stations = [];
		if (this.state.user_groups && this.state.user_groups.length && (this.state.filter_role && this.state.filter_role.length)) {
			console.log('debug 1');
			this.state.user_groups.map((user) => {
				let c = 0;
				this.state.filter_role.map((role) => {
					if (user.role_id == role) {
						console.log('in filter');
						c++;
					}
				});
				if (c > 0) {
					filtered_stations.push(user);
				}
			});
		} else {
			console.log('debug 2');
			filtered_stations = this.state.user_groups;
		}

		this.setState({
			filtered_stations: filtered_stations,
			// searched_list: filtered_stations
		}, () => this.setSearchedList());



		// this.setSearchedList();
	}
	/**
	 * This function searched for the entered string in the table data.
	 */
	setSearchedList() {
		console.log('in setSearchList function');
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && this.state.table_search != null && this.state.table_search != '' && this.state.table_search != undefined) {
			this.state.filtered_stations.map((cat,index) => {
				let c = 0;
				if (this.state.table_search != '' && (cat.name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.created_by.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))))) {
					c++;
					console.log('in setSearchList 1 function');
				}
				if (cat.users && cat.users.length) {
					cat.users.map((st) => {
						if (this.state.users_list_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (cat.stations && cat.stations.length) {
					cat.stations.map((st) => {
						if (this.state.station_list_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (cat.station_groups && cat.station_groups.length) {
					cat.station_groups.map((st) => {
						if (this.state.station_group_list_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (c>0) {
					searched_list.push(cat);
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
	 * This function searched for the entered string in the table data.
	 * @property {string} value Entenred keyword in searchbar.
	 */
	setSearch(value) {
		console.log('in setSearch function', value);
		let searched_list = [];
		if (this.state.filtered_stations && this.state.filtered_stations.length && value) {
			this.state.filtered_stations.map((cat,index) => {
				let c = 0;
				if (value != '' && (cat.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.created_by.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					c++;
				}
				if (cat.users && cat.users.length) {
					cat.users.map((st) => {
						if (this.state.users_list_object[st].toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (cat.stations && cat.stations.length) {
					cat.stations.map((st) => {
						if (this.state.station_list_object[st].toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (cat.station_groups && cat.station_groups.length) {
					cat.station_groups.map((st) => {
						if (this.state.station_group_list_object[st].toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
							c++;
						}
					});
					
				}
				if (c>0) {
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
			this.queryCreate();
		});
	}
	/**
	 * This function sets the list to be displayed in the table.
	 */
	sortStation() {
		let searched_list = this.state.searched_list && this.state.searched_list.length ? this.state.searched_list.slice(0) : [];

		let sorted_list = [];
		if (searched_list && searched_list.length) {
			searched_list.map((user_gr) => {
				let temp_users = [];
				if (user_gr.users && user_gr.users.length) {
					user_gr.users.map((user_id) => {
						temp_users.push(this.state.users_list_object[user_id]);
					});
				}
				let temp_station = [];
				let temp_station_group = [];
				if (user_gr.stations && user_gr.stations.length) {
					user_gr.stations.map((st) => {
						temp_station.push(this.state.station_list_object[st]);
					});
				}
				if (user_gr.station_groups && user_gr.station_groups.length) {
					user_gr.station_groups.map((st) => {
						temp_station_group.push(this.state.station_group_list_object[st]);
					});
				}
				sorted_list.push({
					'key': user_gr.id,
					'groupname': user_gr.name,
					'created': [user_gr.created_by],
					'username': temp_users,
					'stationname': temp_station,
					'stationgroupname': temp_station_group,
					'role': this.state.roles_list_object[user_gr.role_id],
					'description': user_gr.description,
					'id': user_gr.id,
					'name': user_gr.name,
					'role_id': user_gr.role_id,
					'users': user_gr.users,
					stations: user_gr.stations,
					// station_group: user_gr.station_groups,
					station_groups: user_gr.station_groups,
					'created_by': user_gr.created_by,
					'created_at': user_gr.created_at,
					'is_deletable': user_gr.is_deletable
				});
			});
		}
		
		this.setState({
			sorted_list: sorted_list
		});
	}
	/**
	 * This station sets the group selected.
	 */
	onChangeGroup(value) {
		this.setState({
			groupValue: value,
			filter_role: value
		}, () => this.queryCreate());
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {

		const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			onChange: (value) => this.onChangeGroup(value),
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			placeholder: 'Please select filter',
		};

		const columnsUserGroup = [{
			title: 'Group Name',
			width: 120,
			key: 'groupname',
			dataIndex: 'groupname',
			sorter: (a,b,sortOrder) => {
				return (a.groupname.toLowerCase() !== b.groupname.toLowerCase() ? ((a.groupname.toLowerCase() < b.groupname.toLowerCase()) ? -1 : 1) : 0);
				// this.tableSorter('category', sortOrder);
			},
		}, {
			title: 'Created By',
			width: 120,
			key: 'created',
			dataIndex: 'created',
			sorter: (a,b,sortOrder) => {
				return (a.created.toLowerCase() !== b.created.toLowerCase() ? ((a.created.toLowerCase() < b.created.toLowerCase()) ? -1 : 1) : 0);
				// this.tableSorter('created', sortOrder);
			},
			render: created => (
				<span>
					{created.map(div => <div className="font-col" key={div}>{div}</div>)}
				</span>
			),
		}, {
			title: 'Description',
			width: 90,
			key: 'description',
			dataIndex: 'description',
			align: 'center',
			render: (description) => (
				<Popconfirm className="info-msg" title={description} icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
				</Popconfirm>
			),
		}, {
			title: 'Role',
			width: 100,
			key: 'role',
			dataIndex: 'role',
			sorter: (a,b,sortOrder) => {
				return (a.role.toLowerCase() !== b.role.toLowerCase() ? ((a.role.toLowerCase() < b.role.toLowerCase()) ? -1 : 1) : 0);
				// this.tableSorter('category', sortOrder);
			},
		}, {
			title: 'User Name',
			width: 200,
			dataIndex: 'username',
			key: 'username',
			render: username => (
				<span>
					{username.map(tag => <Tag key={tag}>{tag}</Tag>)}
				</span>
			),
		}, {
			title: 'Station / Station Group Name',
			width: 200,
			dataIndex: 'stationname',
			key: 'stationname',
			render: (stationname, group) => (
				<div>
					<span>
						{stationname.slice(0,2).map(tag => <Tag className="antd-custom-tag-color-stn" key={tag}>{tag}</Tag>)}
						
					</span>
					<span>
						{stationname.length > 2 ? <Tag className="antd-custom-tag-color-stn" key="station_more">{'+ ' + (stationname.length - 2) + ' more'}</Tag> : ''}
					</span>
					<span>
						{group.stationgroupname.slice(0,2).map(tag => <Tag className="antd-custom-tag-color-group" key={tag}>{tag}</Tag>)}
					</span>
					<span>
						{group.stationgroupname.length > 2 ? <Tag className="antd-custom-tag-color-group" key="station_more">{'+ ' + (group.stationgroupname.length - 2) + ' more'}</Tag> : ''}
					</span>
				</div>
			),
		}, {
			title: 'Action',
			dataIndex: 'action',
			width: 80,
			key: 'action',
			align: 'center',
			render: (a, b, c) => (
				<Dropdown overlay={
					<Menu>
						<Menu.Item key="action-1" onClick={() => this.editGroup(b)}>Edit</Menu.Item>
						<Menu.Item key="action-2" onClick={() => this.showDeleteConfirm(b)} disabled={!b.is_deletable}>
							{(() => {
								if (b.is_deletable) {
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
			),
		}];
		if (this.state.users_list && this.state.users_list.length) {
			return <div>
				<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
				<div className="table-search">
					<Input placeholder="Search User Group" defaultValue={this.state.table_search} onChange={(e) => this.setSearch(e.target.value)} prefix={<Icon type="search" />} />
				</div>
				<div className="add-btn"><Button type="primary" icon="plus" onClick={() => this.addNewGroup()}>Create New Group</Button></div>
				<Row className="group-table">
					<Table locale={{emptyText: 'No User Groups Found!' }} pagination={false} columns={columnsUserGroup} dataSource={this.state.sorted_list} />
				</Row>
				{(() => {
					if (this.state.edit_group || this.state.add_group) {
						return <UserGroupForm 
							visible={this.state.drawGroupVisible}
							onCancel={() => this.closeAddEditModal()}
							onCreate={() => this.handleCreate()}
							client_id={this.state.client_id}
							application_id={this.state.application_id}
							roles_list={this.state.roles_list}
							station_list_object={this.state.station_list_object}
							station_group_list_object={this.state.station_group_list_object}
							add_group={this.state.add_group}
							edit_group={this.state.edit_group}
							selected_group_id={this.state.selected_group_id}
							selected_group_name={this.state.selected_group_name}
							selected_group_description={this.state.selected_group_description}
							selected_group_role={this.state.selected_group_role}
							selected_group_stations={this.state.selected_group_stations}
							selected_group_station_groups={this.state.selected_group_station_groups}
							selected_group_users={this.state.selected_group_users}
							selected_created_by={this.state.selected_created_by}
							valueStation={this.state.valueStation}
							valueUser={this.state.valueUser}
							addEditCallback={(key, created_by, id, time, description, is_deletable, name, user_list, stations, station_groups, role_id) => this.addEditCallback(key, created_by, id, time, description, is_deletable, name, user_list, stations, station_groups, role_id)}
						/>;
					}
				})()}
				
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