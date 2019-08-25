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

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let userFilter = [
	{
		title: 'Status',
		value: 2,
		key: '0-0',
		children: [
			{
				title: 'Active',
				value: 1,
				key: '1',
			},{
				title: 'Inactive',
				value: 0,
				key: '2',
			}
		]
	}
];

let createData = [];

let dataUser = [];
/**
 * Component for the slider to add/edit user.
 */
const UserCreateForm = Form.create()(
	class extends React.Component {
		/**
		 * This is the Constructor for Dashboard page used to set the default task while page loads.
		 * @param  {Object} props This will import the attributes passed from its Parent Class.
		 */
		constructor(props) {
			super(props);
			/**
			 * State of the component.
			 * @type {Object}
			 * @property {Number} client_id Stores the client ID.
			 * @property {Number} application_id Stores the Application ID.
			 * @property {Boolean} edit_user Whether to edit a user.
			 * @property {Boolean} add_user Whether to add a new user.
			 * @property {string} selected_user_id ID of the selected user.
			 * @property {string} selected_user_first_name first name of the selected user.
			 * @property {string} selected_user_last_name last name of the selected user.
			 * @property {string} selected_user_department department of the selected user.
			 * @property {string} selected_user_email email id of the selected user.
			 * @property {string} selected_user_phone phone number of the selected user.
			 * @property {Array} selected_user_group Groups the user is alloted to.
			 * @property {string} selected_user_status Status of the selected user.
			 * @property {string} selected_user_designation designation of the selected user.
			 */
			this.state = {
				value: [],
				client_id: props.client_id,
				application_id: props.application_id,
				add_user: props.add_user,
				edit_user: props.edit_user,
				selected_user_id: props.selected_user_id,
				selected_user_first_name: props.selected_user_first_name,
				selected_user_last_name: props.selected_user_last_name,
				selected_user_department: props.selected_user_department,
				selected_user_email: props.selected_user_email,
				selected_user_phone: props.selected_user_phone,
				selected_user_group: props.selected_user_group && props.selected_user_group.length ? props.selected_user_group : [],
				selected_user_status: props.selected_user_status,
				selected_user_designation: props.selected_user_designation,
				unauthorised_access: false,
				unauthorised_access_msg: ''
			}
		}
		

		/*onChange(value) {
			this.setState({ value });
		}*/
		/**
		 * This function sets the user groups for the user.
		 * @param  {Array} value Array of user group IDs.
		 */
		changeUserGroup(value) {
			this.setState({
				selected_user_group: value
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
		 * This function sets the name, department etc to the state.
		 * @param  {Object} e   Event
		 * @param  {string} key String to be checked
		 */
		handleChange(e, key){
			if (key == 'first_name') {
				this.setState({
					selected_user_first_name: e.target.value
				});
			} else if (key == 'last_name') {
				this.setState({
					selected_user_last_name: e.target.value
				});
			} else if (key == 'department') {
				this.setState({
					selected_user_department: e.target.value
				});
			} else if (key == 'email') {
				this.setState({
					selected_user_email: e.target.value
				});
			} else if (key == 'phone_no') {
				this.setState({
					selected_user_phone: e.target.value
				});
			} else if (key == 'designation') {
				this.setState({
					selected_user_designation: e.target.value
				});
			}
		}
		/**
		 * This function call the API to add a new user.
		 */
		handleSubmitAdd() {
			console.log('handleSubmitAdd');
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id +  '/users/new', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					// application_id: that.state.application_id,
					first_name: that.state.selected_user_first_name,
					last_name: that.state.selected_user_last_name,
					department: that.state.selected_user_department,
					email_id: that.state.selected_user_email,
					phone_number: that.state.selected_user_phone,
					user_groups: that.state.selected_user_group,
					designation: that.state.selected_user_designation
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
					that.props.addEditCallback('add', json.user_id, that.state.selected_user_first_name, that.state.selected_user_last_name, that.state.selected_user_department, that.state.selected_user_email, that.state.selected_user_phone, that.state.selected_user_group, that.state.selected_user_designation);
					that.openNotification('success', 'User added successfully');
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
		 * This function call the API to edit an users.
		 */
		handleSubmitEdit() {
			let that = this;
			let response_status;
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/' + that.state.selected_user_id + '/edit', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					// application_id: that.state.application_id,
					first_name: that.state.selected_user_first_name,
					last_name: that.state.selected_user_last_name,
					department: that.state.selected_user_department,
					email_id: that.state.selected_user_email,
					phone_number: that.state.selected_user_phone,
					user_groups: that.state.selected_user_group,
					status: that.state.selected_user_status,
					designation: that.state.selected_user_designation
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
					that.props.addEditCallback('edit', that.state.selected_user_id, that.state.selected_user_first_name, that.state.selected_user_last_name, that.state.selected_user_department, that.state.selected_user_email, that.state.selected_user_phone, that.state.selected_user_group, that.state.selected_user_designation);
					that.openNotification('success', 'User details updated successfully');
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
				treeData: createData,
				value: this.state.selected_user_group,
				onChange: (value) => this.changeUserGroup(value),
				treeCheckable: true,
				treeNodeFilterProp: 'title',
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user group',
			};
			return (
				<div id="create_form">
					<Drawer
						title={this.state.add_user ? 'Add New User' : (this.state.edit_user ? 'Edit User' : 'Add New User')}
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
									<Form.Item label="First Name *">
										{getFieldDecorator('fname', {
											rules: [{ required: true, message: 'First name' }],
											initialValue: this.state.selected_user_first_name,
											onChange: (e) => this.handleChange(e, 'first_name')
										})(<Input placeholder="Please enter first name" />)}
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100">
									<Form.Item label="Last Name">
										{getFieldDecorator('lname', {
											rules: [{ required: false, message: 'Last name' }],
											initialValue: this.state.selected_user_last_name,
											onChange: (e) => this.handleChange(e, 'last_name')
										})(<Input placeholder="Please enter last name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="Department">
										{getFieldDecorator('department', {
											rules: [{ required: false, message: 'Please enter department' }],
											initialValue: this.state.selected_user_department,
											onChange: (e) => this.handleChange(e, 'department')
										})(<Input placeholder="Please enter department" />
											/*<Select showSearch placeholder="Please select a department">
												<Option value="transport">Transport</Option>
												<Option value="pumping">Pumping Station</Option>
												<Option value="taru">Taru</Option>
											</Select>*/
										)}
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100">
									<Form.Item label="Designation">
										{getFieldDecorator('designation', {
											rules: [{ required: false, message: 'Please enter designation' }],
											initialValue: this.state.selected_user_designation,
											onChange: (e) => this.handleChange(e, 'designation')
										})(<Input placeholder="Please enter designation" />
										)}
									</Form.Item>
								</Col>
								
								
							</Row>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="Email *">
										{getFieldDecorator('email', {
											rules: [{ required: true, message: 'Please enter mail id' }],
											initialValue: this.state.selected_user_email,
											onChange: (e) => this.handleChange(e, 'email')
										})(<Input placeholder="Please enter Email id" />)}
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100">
									<Form.Item label="Contact No *">
										{getFieldDecorator('contact', {
											rules: [{ required: true, message: 'Please enter contact no.' }],
											initialValue: this.state.selected_user_phone,
											onChange: (e) => this.handleChange(e, 'phone_no')
										})(<Input placeholder="Please enter contact no." />)}
									</Form.Item>
								</Col>
								
								{/*<Col span={12}>
									<Form.Item label="Station Assign">
										{getFieldDecorator('role', {
											rules: [{ required: true, message: 'Please select a role' }],
										})(
											<Select placeholder="Please select a role">
												<Option value="manager">Manager</Option>
												<Option value="asstManager">Asst. Manager</Option>
												<Option value="admin">Admin</Option>
											</Select>
										)}
									</Form.Item>
								</Col>*/}
							</Row>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="User Group">
										<TreeSelect showSearch treeDefaultExpandAll {...tProps} className="filter-icon" />
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
								disabled={(!this.state.selected_user_first_name || this.state.selected_user_first_name =='' || !this.state.selected_user_email || this.state.selected_user_email =='' || !this.state.selected_user_phone || this.state.selected_user_phone =='') ? true : false}
								onClick={() => {
								if (this.state.add_user) {
									this.handleSubmitAdd();
								} else if (this.state.edit_user) {
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
/**
 * Main component for the Users page.
 */
export default class UsersPage extends React.Component {
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
		 * @property {Boolean} edit_user Whether to edit a user.
		 * @property {Boolean} add_user Whether to add a new user.
		 * @property {Boolean} delete_user Whether to delete a new user.
		 * @property {string} table_search Stores the value to be searched in the table.
		 * @property {Array} status_filter Stores the values to be filtereed for in the table.
		 */
		this.state = {
			client_id: 365,
			application_id: 19,
			edit_user: false,
			add_user: false,
			delete_user: false,
			set_status_user: false,
			drawCreateVisible: false,
			user_id: '',
			table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			status_filter: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.status ? JSON.parse(this.parsed_search.status) : [],
			unauthorised_access: false,
			unauthorised_access_msg: ''
		};
	}
	/**
	 * Predefined function of ReactJS. Called after the component is mounted.
	 * @return {void} 
	 */	
	componentDidMount() {
		document.title = 'Settings - Users - Flood Forecasting and Early Warning System for Kolkata City';
		this.fetchData();
	}
	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('componentDidUpdate user');
		this.parsed_search = queryString.parse(this.props.location.search);
		if (this.props.match.params.user_id && this.props.match.params.user_id !== '' && ((this.props.match.params.user_id != prevProps.match.params.user_id) || (this.props.match.params.user_id != this.state.user_id)) && this.state.user_list && this.state.user_list.length && this.props.history.location.pathname.search('/edit') > -1) {
			console.log('componentDidUpdate user edit');
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.user_id) {
						c++;
						this.setState({
							user_id: this.props.match.params.user_id,
							drawCreateVisible: true,
							edit_user: true,
							add_user: false,
							delete_user: false,
							set_status_user: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/users/' + this.props.history.location.search);
				}
			}
		} /*else if (this.props.history.location && (this.props.history.location.pathname != prevProps.history.location.pathname) && this.props.history.location.pathname.search(/add/) > 1) {
			this.setState({
				drawCreateVisible: true,
				add_user: true,
				edit_user: false
			});
		}*/ else if (this.props.match.params.user_id && this.props.match.params.user_id !== '' && ((this.props.match.params.user_id != prevProps.match.params.user_id) || (this.props.match.params.user_id != this.state.user_id)) && this.state.user_list && this.state.user_list.length && this.props.history.location.pathname.search('/delete') > -1) {
			console.log('componentDidUpdate user delete');
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					console.log('componentDidUpdate user delete if', st);
					if (st.id == this.props.match.params.user_id) {
						console.log('componentDidUpdate user delete if');
						c++;
						this.setState({
							user_id: this.props.match.params.user_id,
							delete_user: true,
							set_status_user: false,
							edit_user: false,
							add_user: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/users/' + this.props.history.location.search);
				}
			}
		} else if (this.props.match.params.user_id && this.props.match.params.user_id !== '' && ((this.props.match.params.user_id != prevProps.match.params.user_id) || (this.props.match.params.user_id != this.state.user_id)) && this.state.user_list && this.state.user_list.length && this.props.history.location.pathname.search('/set-status') > -1) {
			console.log('componentDidUpdate user status');
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					console.log('componentDidUpdate user status if', st);
					if (st.id == this.props.match.params.user_id) {
						console.log('componentDidUpdate user status if');
						c++;
						this.setState({
							user_id: this.props.match.params.user_id,
							set_status_user:true,
							delete_user: false,
							edit_user: false,
							add_user: false
						});
					}
				});
				if (c == 0) {
					this.props.history.push('/settings/users/' + this.props.history.location.search);
				}
			}
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/settings/users') {
			console.log('componentDidUpdate user last');
			this.setState({
				edit_user: false,
				add_user: false,
				delete_user: false,
				set_status_user: false,
				drawCreateVisible: false,
				user_id: '',
				table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			}, () => {
				this.queryCreate();
			});
		}
	}
	/**
	 * Function used to get the user list for the page.
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
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/list', {
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
				
				let treeData = [];
				let access_list_options = {};
				let access_options = {};
				let access_options_keys = {};
				let sub_access_options = {};
				let sub_access_options_keys = {};
				/*if (json.access_list && Object.values(json.access_list).length) {
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
				}*/
				createData = [];
				if (json.user_group_list && json.user_group_list.length) {
					json.user_group_list.map((gr) => {
						createData.push({
							'title': gr.name,
							'value': gr.id,
							'key': gr.id,
						});
					});
				}

				if (that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ) {
						let user_id = that.props.match.params.user_id;
						if (json.user_list && json.user_list.length) {
							json.user_list.map((st_gr) => {
								if (st_gr.id == user_id) {
									that.editGroup(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ) {
						let user_id = that.props.match.params.user_id;
						if (json.user_list && json.user_list.length) {
							json.user_list.map((st_gr) => {
								if (st_gr.id == user_id) {
									that.showDeleteConfirm(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/set-status') > -1 ) {
						let user_id = that.props.match.params.user_id;
						if (json.user_list && json.user_list.length) {
							json.user_list.map((st_gr) => {
								if (st_gr.id == user_id) {
									that.showStatusConfirm(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/add') > -1) {
						that.addNewGroup();
					}

					let roles_list_object = {};
					let groupFilter = [];
					/*if (json.roles_list && json.roles_list.length) {
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
					}*/

					let groupValue = [];
					/*if (that.state.status_filter && that.state.status_filter.length) {
						that.state.status_filter.map((role) => {
							groupValue.push(role);
						});
					}*/

					let station_list_object = {};
					/*if (json.station_list && json.station_list.length) {
						json.station_list.map((st) => {
							if (!station_list_object[st.id]) {
								station_list_object[st.id] = st.name;
							} else {
								station_list_object[st.id] = st.name;
							}
						});
					}*/

				let station_group_list_object = {};
				/*if (json.station_group_list && json.station_group_list.length) {
					json.station_group_list.map((st) => {
						if (!station_group_list_object[st.id]) {
							station_group_list_object[st.id] = st.name;
						} else {
							station_group_list_object[st.id] = st.name;
						}
					});
				}*/
				
				let user_group_object = {};
				if (json.user_group_list && json.user_group_list.length) {
					json.user_group_list.map((st) => {
						if (!user_group_object[st.id]) {
							user_group_object[st.id] = st.name;
						} else {
							user_group_object[st.id] = st.name;
						}
					});
				}

				dataUser = [];
				if (json.user_list && json.user_list.length) {
					json.user_list.map((user) => {
						let temp_users = [];
						if (user.user_groups && user.user_groups.length) {
							user.user_groups.map((user_gr_id) => {
								temp_users.push(user_group_object[user_gr_id]);
							});
						}
						/*let temp_station = [];
						let temp_station_group = [];
						if (user.stations && user.stations.length) {
							user.stations.map((st) => {
								temp_station.push(station_list_object[st]);
							});
						}
						if (user.station_group && user.station_group.length) {
							user.station_group.map((st) => {
								temp_station_group.push(station_group_list_object[st]);
							});
						}*/
						let last_login = !isNaN(user.user_last_login) && user.user_last_login >= 0 ? moment.unix(user.user_last_login).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never';
						dataUser.push({
							'key': user.id,
							'name': user.first_name + ' ' + user.last_name,
							'login': [last_login],
							'department': user.department,
							'designation_department': [user.designation, user.department],
							'contact': [user.phone_number, user.email_id],
							'group': temp_users,
							'id': user.id,
							'first_name': user.first_name,
							'last_name': user.last_name,
							'designation': user.designation,
							'email_id': user.email_id,
							'phone_number': user.phone_number,
							'status': user.status,
							'user_groups': user.user_groups,
							'user_last_login': user.user_last_login
						});
					});
				}

				let stationData = [];
				/*if (json.station_list && json.station_list.length) {
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
				}*/

				/*if (json.station_group_list && json.station_group_list.length) {
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
				}*/

				let userData = [];
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
					user_list: json.user_list,
					groupValue: groupValue,
					roles_list: json.roles_list,
					roles_list_object: roles_list_object,
					station_list_object: station_list_object,
					station_group_list_object: station_group_list_object,
					user_group_object: user_group_object,
					station_group_list: json.station_group_list,
					station_list: json.station_list,
					user_groups: json.user_groups,
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
					edit_user: that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ? true : false,
					add_user: that.props.history.location && that.props.history.location.pathname.search('/add') > -1 ? true : false,
					delete_user:  that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ? true : false,
					set_status_user:  that.props.history.location && that.props.history.location.pathname.search('/set-status') > -1 ? true : false,
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

	/*showCreateModal() {
		this.setState({ drawCreateVisible: true });
	}*/
	/**
	 * This function sets the delete confirmation popup.
	 * @param  {Object} role Role data.
	 */	
	showDeleteConfirm(user) {
		
		let that = this;
		that.props.history.push('/settings/users/' + user.id + '/delete/' + that.props.history.location.search);
		console.log('showDeleteConfirm', user);
		confirm({
			title: 'Do you want to delete ?',
			content: user.first_name + ' ' + user.last_name,
			onOk() {
				that.deleteGroup(user);
			},
			onCancel() {
				that.closeAddEditModal();
				that.props.history.push('/settings/users/' + that.props.history.location.search);
			}
		});
	}
	/**
	 * This function calls the API to delete the user.
	 * @param  {Object} user user data.
	 */
	deleteGroup(user) {
		let that = this;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/' + user.id + '/delete', {
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
	 * This function sets the user status change confirmation popup.
	 * @param  {Object} user user data.
	 */	
	showStatusConfirm(user) {
		
		let that = this;
		that.props.history.push('/settings/users/' + user.id + '/set-status/' + that.props.history.location.search);
		console.log('showStatusConfirm', user);
		confirm({
			title: 'Do you want to ' + (user.status == 1 ? 'deactivate' : 'activate') + ' ?',
			content: user.first_name + ' ' + user.last_name,
			onOk() {
				that.setStatusUser(user);
			},
			onCancel() {
				that.closeAddEditModal();
				that.props.history.push('/settings/users/' + that.props.history.location.search);
			}
		});
	}
	/**
	 * This function calls the API to change the status of the user.
	 * @param  {Object} user user data.
	 */
	setStatusUser(user) {
		let that = this;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/' + user.id + '/set_status', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				client_id: that.state.client_id,
				user_id: user.id,
				status: (user.status == 1 ? 0 : 1)
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			if (json.status === 'success') {
				that.fetchData();
				that.openNotification('success', json.message);
				that.closeAddEditModal();
				that.props.history.push('/settings/users/' + that.props.history.location.search);
			} else {
				that.openNotification('error', json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}
	/**
	 * This function opens the Slider to Add or Edit the user.
	 */
	addNewGroup() {
		this.props.history.push('/settings/users/add/' + this.props.history.location.search);
		this.setState({
			drawCreateVisible: true,
			add_user: true,
			edit_user: false,
			delete_user: false,
			set_status_user: false
		});
	}
	/**
	 * This function sets the current value of the selected user to be edited.
	 * @param  {Object} user 	Selected user.
	 */
	editGroup(user) {
		console.log('table 1', user);
		this.props.history.push('/settings/users/' + user.id + '/edit/' + this.props.history.location.search);
		
		this.setState({
			selected_user_id: user.id,
			selected_user_first_name: user.first_name,
			selected_user_last_name: user.last_name,
			selected_user_department: user.department,
			selected_user_email: user.email_id,
			selected_user_phone: user.phone_number,
			selected_user_group: user.user_groups,
			selected_user_status: user.status,
			selected_user_designation: user.designation
		});
	}
	/**
	 * This function is called from the child component to set the edited value in the main component.
	 * @param {string}  key          add or edit.
	 * @param {string}  user_id          user ID.
	 * @param {string}  selected_user_first_name   first name of the user.
	 * @param {string}  selected_user_last_name   last name of the user.
	 * @param {string}  selected_user_department   department of the user.
	 * @param {string}  selected_user_email   email of the user.
	 * @param {string}  selected_user_phone   phone number of the user.
	 * @param {Array}  selected_user_group   user group of the user.
	 * @param {string}  selected_user_designation   designation of the user.
	 */	
	addEditCallback(key, user_id, selected_user_first_name, selected_user_last_name, selected_user_department, selected_user_email, selected_user_phone, selected_user_group, selected_user_designation){
		let user_list = this.state.user_list.slice(0);
		if (key == 'add') {
			user_list.push({
				department: selected_user_department,
				designation: selected_user_designation,
				email_id: selected_user_email,
				first_name: selected_user_first_name,
				id: user_id,
				last_name: selected_user_last_name,
				phone_number: selected_user_phone,
				status: 1,
				user_groups: selected_user_group,
			});
		} else if (key == 'edit') {
			let edit_st = user_list[_.findIndex(user_list, ['id', user_id])];
			user_list[_.findIndex(user_list, ['id', user_id])] = {
				department: selected_user_department,
				designation: selected_user_designation,
				email_id: selected_user_email,
				first_name: selected_user_first_name,
				id: user_id,
				last_name: selected_user_last_name,
				phone_number: selected_user_phone,
				status: edit_st.status,
				user_groups: selected_user_group,
				user_last_login: edit_st.user_last_login
			}
		}
		this.setState({
			user_list: user_list
		},() => this.queryCreate());
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
	 * This function closes the slider and and sets the values to defaults.
	 */
	closeAddEditModal() {
		this.props.history.push('/settings/users/' + this.props.history.location.search);
		this.setState({
			user_id: '',
			drawCreateVisible: false,
			add_user: false,
			edit_user: false,
			delete_user: false,
			set_status_user: false,
			selected_user_id: null,
			selected_user_first_name: null,
			selected_user_last_name: null,
			selected_user_department: null,
			selected_user_email: null,
			selected_user_phone: null,
			selected_user_status: null,
			selected_user_designation: null,
			selected_user_group: [],
			unauthorised_access: false,
			unauthorised_access_msg: ''
		});
	}
	/**
	 * This funtion creates the query to be pushed in the url.
	 */
	queryCreate() {

		console.log('in queryCreate', this.props.history.location.pathname);
		let query_string = '?' + (this.state.status_filter && this.state.status_filter.length ? 'status=[' + this.state.status_filter + ']' : '' ) + (this.state.table_search  && this.state.table_search != '' ? (this.state.status_filter && this.state.status_filter.length ? '&search=' + this.state.table_search : 'search=' + this.state.table_search ) : '');
		
		console.log('queryCreate state', this.state);
		if (((this.state.user_id && this.state.user_id != '') || (this.props.match.params.user_id)) && this.state.edit_user) {
			console.log('queryCreate 1', this.state.user_id);
			this.props.history.push('/settings/users/' + this.props.match.params.user_id + '/edit/' + query_string);
		} else if (this.state.add_user) {
			console.log('queryCreate 2', this.state.user_id);
			this.props.history.push('/settings/users/add/' + query_string);
		} else if (((this.state.user_id && this.state.user_id != '') || (this.props.match.params.user_id)) && this.state.delete_user) {
			console.log('queryCreate 3', this.state.user_id);
			this.props.history.push('/settings/users/' + this.props.match.params.user_id + '/delete/' + query_string);
		} else if (((this.state.user_id && this.state.user_id != '') || (this.props.match.params.user_id)) && this.state.set_status_user) {
			console.log('queryCreate 4', this.state.user_id);
			this.props.history.push('/settings/users/' + this.props.match.params.user_id + '/set-status/' + query_string);
		} else {
			console.log('queryCreate 5', this.state.user_id);
			this.props.history.push('/settings/users/' + query_string);
		}
		

		let filtered_stations = [];
		if (this.state.user_list && this.state.user_list.length && (this.state.status_filter && this.state.status_filter.length)) {
			console.log('debug 1');
			this.state.user_list.map((user) => {
				let c = 0;
				this.state.status_filter.map((st) => {
					if (st != 2 && user.status == st) {
						console.log('in filter');
						c++;
					} else if (st == 2) {
						c++;
					}
				});
				if (c > 0) {
					filtered_stations.push(user);
				}
			});
		} else {
			console.log('debug 2');
			filtered_stations = this.state.user_list;
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
				let c = 0;
				if (this.state.table_search != '' && (cat.first_name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.last_name.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.department.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.designation.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.email_id.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))) || cat.phone_number.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase()))))) {
					c++;
					console.log('in setSearchList 1 function');
				}
				if (cat.user_groups && cat.user_groups.length) {
					cat.user_groups.map((st) => {
						if (this.state.user_group_object[st].toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
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
				if (value != '' && (cat.first_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.last_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.department.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.designation.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.email_id.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || cat.phone_number.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					c++;
				}
				if (cat.user_groups && cat.user_groups.length) {
					cat.user_groups.map((st) => {
						if (this.state.user_group_object[st].toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase())))) {
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
			searched_list.map((user) => {
				let temp_users = [];
				if (user.user_groups && user.user_groups.length) {
					user.user_groups.map((user_gr_id) => {
						temp_users.push(this.state.user_group_object[user_gr_id]);
					});
				}
				
				let last_login = !isNaN(user.user_last_login) && user.user_last_login >= 0 ? moment.unix(user.user_last_login).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never';
				sorted_list.push({
					'key': user.id,
					'name': user.first_name + ' ' + user.last_name,
					'login': [last_login],
					'department': user.department,
					'designation_department': [user.designation, user.department],
					'contact': [user.phone_number, user.email_id],
					'group': temp_users,
					'id': user.id,
					'first_name': user.first_name,
					'last_name': user.last_name,
					'designation': user.designation,
					'email_id': user.email_id,
					'phone_number': user.phone_number,
					'status': user.status,
					'user_groups': user.user_groups,
					'user_last_login': user.user_last_login
				});
			});
		}
		
		this.setState({
			sorted_list: sorted_list
		});
	}
	/**
	 * This function sets the changed status of the filter in the state.
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	onChangeStatus(value) {
		console.log('value', value);
		this.setState({
			status_filter: value
		}, () => this.queryCreate());
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		const userProps = {
			treeData: userFilter,
			value: this.state.status_filter,
			onChange: (value) => this.onChangeStatus(value),
			treeCheckable: true,
			// showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Filter by Status',
		};

		const columnsUser = [
			{
				title: 'Name',
				width: 120,
				dataIndex: 'name',
				key: 'name',
				sorter: (a, b) => {
					return (a.first_name && b.first_name && isNaN(a.first_name) && isNaN(b.first_name) && a.first_name.toLowerCase() !== b.first_name.toLowerCase() ? (((a.first_name.toLowerCase() + ' ' + (a.last_name && a.last_name != '' && isNaN(a.last_name) ? a.last_name.toLowerCase() : '')) < (b.first_name.toLowerCase() + ' ' + (b.last_name && b.last_name != '' && isNaN(b.last_name) ? b.last_name.toLowerCase() : ''))) ? -1 : 1) : 0);
				},
			}, {
				title: 'Last Login',
				width: 100,
				dataIndex: 'login',
				key: 'login',
				sorter: (a, b) => a.user_last_login - b.user_last_login,
				render: login => (
					<span>
						{login.map(div => <div className="font-col" key={div}>{div}</div>)}
					</span>
				),
			}, {
				title: 'Designation',
				width: 100,
				dataIndex: 'designation_department',
				key: 'designation_department',
				render: (desig) => (
					<span>
						{desig.map(div => <div key={div}>{div}</div>)}
					</span>
				)
				/*sorter: (a, b) => {
					if (a.department == '') {
						return 1;
					} else if (b.department == '') {
						return -1;
					} else {
						return (a.department && b.department && a.department != '' && b.department != '' && a.department.toLowerCase() !== b.department.toLowerCase() ? ((a.department.toLowerCase() < b.department.toLowerCase()) ? -1 : 1) : 0);
					}
				},*/
			}, {
				title: 'Contact',
				width: 100,
				dataIndex: 'contact',
				key: 'contact',
				render: contact => (
					<span>
						{contact.map(div => <div key={div}>{div}</div>)}
					</span>
				),
			}, {
				title: 'User Group',
				dataIndex: 'group',
				width: 200,
				key: 'group',
				render: group => (
					<span>
						{group.map(tag => <Tag key={tag}>{tag}</Tag>)}
					</span>
				),
			}, {
				title: 'Action',
				dataIndex: 'action',
				width: 50,
				key: 'action',
				align: 'center',
				render: (a, b, c) => (
					<Dropdown overlay={
					<Menu>
						<Menu.Item key="action-1" onClick={() => this.editGroup(b)}>Edit</Menu.Item>
						<Menu.Item key="action-2" onClick={() => this.showDeleteConfirm(b)}>Delete</Menu.Item>
						<Menu.Item key="action-3" onClick={() => this.showStatusConfirm(b)}>{(b.status == 1 ? 'Deactivate' : 'Activate')}</Menu.Item>
					</Menu>} trigger={['click']} placement="bottomLeft">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
					</Dropdown>
				),
			}
		];

		if (this.state.user_list) {
			return <div>
				<div className="table-filter"><TreeSelect treeDefaultExpandAll {...userProps} className="filter-icon" /></div>
				<div className="table-search">
					<Input defaultValue={this.state.table_search} onChange={(e) => this.setSearch(e.target.value)} placeholder="Search Users" prefix={<Icon type="search" />} />
				</div>
				<div className="add-btn"><Button type="primary" icon="plus" onClick={() => this.addNewGroup()}>Add New User</Button></div>
				<Row>
					<div className="show-container">
						Showing 
						<span className="show-txt">{this.state.sorted_list && this.state.sorted_list.length ? this.state.sorted_list.length : 0}</span>
						out of
						<span className="show-txt">{dataUser.length}</span>
					</div>
				</Row>
				<Row>
					<Table locale={{emptyText: 'No Users Found!' }} pagination={false} columns={columnsUser} dataSource={this.state.sorted_list} />
				</Row>
				{(() => {
					if (this.state.add_user || this.state.edit_user) {
						return <UserCreateForm 
							visible={this.state.drawCreateVisible}
							onCancel={() => this.closeAddEditModal()}
							addEditCallback={(key, user_id, first_name, last_name, department, email, phone, user_group, designation) => this.addEditCallback(key, user_id, first_name, last_name, department, email, phone, user_group, designation)}
							onCreate={this.handleCreate}
							add_user={this.state.add_user}
							edit_user={this.state.edit_user}
							client_id= {this.state.client_id}
							application_id= {this.state.application_id}
							add_user= {this.state.add_user}
							edit_user= {this.state.edit_user}
							selected_user_id= {this.state.selected_user_id}
							selected_user_first_name= {this.state.selected_user_first_name}
							selected_user_last_name= {this.state.selected_user_last_name}
							selected_user_department= {this.state.selected_user_department}
							selected_user_email= {this.state.selected_user_email}
							selected_user_phone= {this.state.selected_user_phone}
							selected_user_group= {this.state.selected_user_group}
							selected_user_status= {this.state.selected_user_status}
							selected_user_designation= {this.state.selected_user_designation}
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
			return <Loading is_inline={true} />
		}
	}
}