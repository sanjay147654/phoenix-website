import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification, Tree, Checkbox, Alert } from 'antd';
// import './css/style.less';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
import moment from 'moment-timezone';
import _ from 'lodash';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Option } = Select;

const TreeNode = Tree.TreeNode;

const confirm = Modal.confirm;

const CheckboxGroup = Checkbox.Group;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let userFilter2 = [];
let userFilter3 = [];
let masterDisplay = [];
let userFilter = [];

let treeData = [];

const UserRoleForm = Form.create()(
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
			 * @property {string} master_access_string Stores the master access string.
			 * @property {Number} acl_version ACL version.
			 * @property {string} description description of the selected role.
			 * @property {string} name name of the selected role.
			 * @property {string} role_id role ID of the selected role.
			 * @property {Boolean} edit_role Whether to edit a role.
			 * @property {Boolean} add_role Whether to add_role a new role.
			 * @property {Object} access_options Stores the access list options.
			 * @property {[type]} master_access Stores if the role has master access.
			 * @property {Array} checkedKeys Stores the selected access.
			 */
			this.state = {
				client_id: props.client_id,
				application_id: props.application_id,
				master_access_string: props.master_access_string,
				acl_version: props.acl_version,
				description: props.selected_role_description,
				name: props.selected_role_name,
				role_id: props.selected_role_id,
				edit_role:props.edit_role,
				// access: props.selected_role_access,
				add_role: props.add_role,
				access_list_options: props.access_list_options,
				sub_access_options: props.sub_access_options,
				selected_created_by: props.selected_created_by,
				access_options: props.access_options,
				master_access: props.selected_role_master_access,
				autoExpandParent: true,
				checkedKeys: props.selected_role_checkedKeys && props.selected_role_checkedKeys.length ? props.selected_role_checkedKeys : [],
				selectedKeys: [],
			}
		}

		/**
		 * This function sets the access format.
		 */
		setAccessFormat() {
			let access = [];
			if (this.state.checkedKeys && this.state.checkedKeys.length) {
				this.state.checkedKeys.map((keys) => {
					if (isNaN(keys)) {
						access.push(keys);
					}
					/*if (keys.split('-').length == 2) {
						acc.push(keys);
					} else if (keys.split('-').length == 3) {
						sub_acc.push(keys);
					}*/
				});
			}
			console.log('setAccessFormat access', access);

			if (this.state.master_access) {
				return this.state.master_access_string;
			} else {
				return access;
			}
		}

		/**
		 * This function sets the selected keys.
		 */
		onCheck(checkedKeys, info) {
			console.log('onCheck', checkedKeys);
			console.log('onCheck info', info);
			this.setState({
				checkedKeys: checkedKeys
			});
		}

		/**
		 * This function call the API to add a new role.
		 */
		handleSubmitAdd() {
			let that = this;
			let response_status;
			let access = this.setAccessFormat();
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/roles/new', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					name: that.state.name,
					description: that.state.description,
					access: access,
					acl_version: that.state.acl_version
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
					that.props.addEditCallback('add',json.created_by, json.insert_id, json.created_on, that.state.description, json.is_deletable, that.state.name, access);
					that.openNotification('success', 'Role added successfully');
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
			let access = this.setAccessFormat();
			that.setState({
				loading: true
			});
			fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/roles/' + that.state.role_id + '/edit', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify({
					client_id: that.state.client_id,
					application_id: that.state.application_id,
					roles_id: that.state.role_id,
					name: that.state.name,
					description: that.state.description,
					access: access,
					acl_version: that.state.acl_version
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
					that.props.addEditCallback('edit',that.state.created_by, that.state.role_id, '0', that.state.description, 'flag', that.state.name, access);
					that.openNotification('success', 'Role updated successfully');
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
		 * This function is called to set the selected keys.
		 */
		onSelect(selectedKeys, info) {
			console.log('onSelect', selectedKeys);
			console.log('onSelect info', info);
			this.setState({
				selectedKeys: selectedKeys
			});
		}

		/**
		 * This function is called when the description or the name changes.
		 * @param  {Object} e   Event
		 * @param  {string} key role_name or role_desc.
		 */
		handleChange(e, key) {
			if (key == 'role_name') {
				this.setState({
					name: e.target.value
				});
			} else if (key == 'role_desc') {
				this.setState({
					description: e.target.value
				});
			}
		}

		/**
		 * This function toggles the master key selection.
		 * @param  {Object} e Event
		 */
		toggleMasterCheck(e) {
			if (e.target.checked) {
				this.setState({
					master_access: true
				});
			} else {
				this.setState({
					master_access: false
				});
			}
		}

		/**
		 * This function render the access list in tree view
		 * @param  {Array} data 
		 */
		renderTreeNodes(data) {
			return data.map((item) => {
				if (item.children) {
					return (
						<TreeNode title={item.title} key={item.key} dataRef={item}>
							{this.renderTreeNodes(item.children)}
						</TreeNode>
					);
				}
				return <TreeNode {...item} />;
			});
		}

		/**
		 * Predefined function to render in the page.
		 */
		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			return (
				<div id="role_form">
					<Drawer
						title={this.state.add_role ? 'Add New Role' : (this.state.edit_role ? 'Edit Role' : 'Add New Role') }
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
									<Form.Item label="Role Name">
										{getFieldDecorator('roleName', {
											rules: [{ required: true, message: 'Please enter role name' }],
											initialValue: this.state.name,
											onChange: (e) => this.handleChange(e, 'role_name')
										})(<Input placeholder="Please enter role name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
							<Col span={24}>
								<Form.Item label="Description">
								 <Input.TextArea onChange={(e) => this.handleChange(e, 'role_desc')} defaultValue={this.state.description} rows={4} placeholder="Please enter role description" />
								</Form.Item>
							</Col>
						 </Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Access">
										<Checkbox
											onChange={(e) => this.toggleMasterCheck(e)}
											defaultChecked={this.state.master_access}
											>Master Access</Checkbox>
										<Tree
											disabled={this.state.master_access}
											defaultCheckedKeys={this.state.checkedKeys}
											checkable
											selectable={false}
											defaultExpandAll={true}
											autoExpandParent={this.state.autoExpandParent}
											onCheck={(a,b) => this.onCheck(a,b)}
											onSelect={(a,b) => this.onSelect(a,b)}
										>
											{this.renderTreeNodes(treeData)}
										</Tree>
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
							<Button disabled={(!this.state.name || this.state.name =='' || (!this.state.master_access && (!this.state.checkedKeys || (this.state.checkedKeys && this.state.checkedKeys.length == 0)))) ? true : false} onClick={() => {
								if (this.state.add_role) {
									this.handleSubmitAdd();
								} else if (this.state.edit_role) {
									this.handleSubmitEdit();
								}}} loading={this.state.loading} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

let groupFilter = [];

/**
 * Main component for Roles Page.
 */
export default class RolesPage extends React.Component {
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
		 * @property {number} client_id Client ID.
		 * @property {Number} application_id Application ID.
		 * @property {string} master_access_string Master access string.
		 * @property {Boolean} drawRoleVisible Opens the Edit/Add slider.
		 * @property {Array} filter_list Array of filters.
		 * @property {string} table_search String to be searched.
		 */
		this.state= {
			client_id: 365,
			application_id: 19,
			master_access_string: '*',
			role_id: '',
			drawRoleVisible: false,
			filter_list: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.filter ? this.parsed_search.filter.split(',') : [],
			table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
		};
	}

	/**
	 * This function closes the Add/Edit slider.
	 */
	handleCancel() {
		this.setState({ drawRoleVisible: false });
	}

	/**
	 * Predefined function of ReactJS. Called after the component is mounted.
	 * @return {void} 
	 */
	componentDidMount() {
		document.title = 'Settings - Roles - Flood Forecasting and Early Warning System for Kolkata City';
		this.fetchData();
	}

	/**
	 * This function closes the slider and sets the sets the values to default.
	 */
	closeAddEditModal() {
		this.props.history.push('/settings/roles/' + this.props.history.location.search);
		this.setState({
			role_id: '',
			drawRoleVisible: false,
			add_role: false,
			edit_role: false,
			delete_role: false,
			selected_role_id: null,
			selected_role_name: null,
			selected_role_description: null,
			selected_role_access: {},
			selected_role_checkedKeys: [],
			selected_role_master_access: false,
			selected_created_by: null,
			unauthorised_access: false,
			unauthorised_access_msg: ''
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
	 * @param {Array}  access       Array of the access.
	 */
	addEditCallback(key, created_by, id, time, description, is_deletable, name, access) {
		let user_name = document.getElementById('user_name') ? document.getElementById('user_name').value : 'Username';

		let all_roles_list = this.state.all_roles_list.slice(0);
		console.log('all_roles_list', all_roles_list);
		console.log('all_roles_list', id);
		console.log('all_roles_list', all_roles_list[_.findIndex(all_roles_list, ['id', id])]);

		if (key == 'add') {
			all_roles_list.push({
				created_on: time,
				created_by: created_by,
				description: description,
				id: id,
				is_deletable: is_deletable,
				name: name,
				access: access
			});
		} else if (key == 'edit') {
			let edit_st = all_roles_list[_.findIndex(all_roles_list, ['id', id])];
			all_roles_list[_.findIndex(all_roles_list, ['id', id])] = {
				created_on: edit_st.created_on,
				created_by: created_by,
				description: description,
				id: id,
				is_deletable: edit_st.is_deletable,
				name: name,
				access: access
			}
		}
		this.setState({
			all_roles_list: all_roles_list
		},() => this.queryCreate());
	}

	/**
	 * This function opens the Slider to Add or Edit the role.
	 */
	addNewGroup() {
		this.props.history.push('/settings/roles/add/' + this.props.history.location.search);
		this.setState({
			drawRoleVisible: true,
			add_role: true,
		});
	}

	/**
	 * This function sets the current value of the selected role to be edited.
	 * @param  {Object} role                     Selected role.
	 */
	editRole(role, all_access_lists, access_options_keyss, access_list_optionss, sub_access_options_keyss) {
		this.props.history.push('/settings/roles/' + role.id + '/edit/' + this.props.history.location.search);
		/*console.log('all_access_lists', all_access_lists);
		let access_options_keys = access_options_keyss || this.state.access_options_keys,
			access_list_options = access_list_optionss || this.state.access_list_options,
			sub_access_options_keys = sub_access_options_keyss || this.state.sub_access_options_keys,
			all_access_list = all_access_lists || this.state.all_access_list;*/

		let checkedKeys = [];
		let master_access = false;
		if (role.access && Object.keys(role.access).length) {
			if (role.access.indexOf(this.state.master_access_string) > -1) {
				master_access = true;
			} else {
				checkedKeys = role.access;
			}
			/*Object.keys(role.access).map((rule) => {
				if (rule != this.state.master_access_string) {
					if (Object.keys(role.access[rule]).length == all_access_list[rule].length) {
						checkedKeys.push(access_options_keys[rule]);
						if (access_list_options && Object.values(access_list_options).length) {
							Object.keys(access_list_options).map((key) => {
								if (key == access_options_keys[rule] && Object.keys(access_list_options[key]).length) {
									Object.keys(access_list_options[key]).map((sub_key) => {
										checkedKeys.push(sub_key);
									});
								}
							});
						}
					} else {
						if (Object.keys(role.access[rule]).length) {
							Object.keys(role.access[rule]).map((sub_rule) => {
								checkedKeys.push(sub_access_options_keys[sub_rule]);
							});
						}
					}
				} else if (rule == this.state.master_access_string) {
					master_access = true;
				}
			});*/
		} /*else if (role.access.indexOf(this.state.master_access_string) > -1 role.access == this.state.master_access_string ) {
			master_access = true;
		}*/
		this.setState({
			selected_created_by: role.created_by,
			selected_role_id: role.id,
			selected_role_name: role.name,
			selected_role_description: role.description,
			selected_role_access: role.access,
			selected_role_checkedKeys: checkedKeys,
			selected_role_master_access: master_access
		});
	}

	/**
	 * Predefined function of ReactJS. it gets called after the component updates.
	 * @param {Object} prevProps Previous Props of the component.
	 * @param {Object} prevState Previous state of the component.
	 * @return {void} 
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('componentDidUpdate Roles page');
		this.parsed_search = queryString.parse(this.props.location.search);
		if (this.props.match.params.role_id && this.props.match.params.role_id !== '' && ((this.props.match.params.role_id != prevProps.match.params.role_id) || (this.props.match.params.role_id != this.state.role_id)) && this.state.all_access_list && Object.keys(this.state.all_access_list).length && this.props.history.location.pathname.search('/edit') > -1) {
			console.log('componentDidUpdate Roles page 1');
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.role_id) {
						c++;
						this.setState({
							role_id: this.props.match.params.role_id,
							drawRoleVisible: true,
							edit_role: true,
							add_role: false,
							delete_role: false
						});
					}
				});
				if (c == 0) {
					console.log('componentDidUpdate Roles page 1 1');
					this.props.history.push('/settings/roles/' + this.props.history.location.search);
				}
			}
		} else if (this.props.match.params.role_id && this.props.match.params.role_id !== '' && ((this.props.match.params.role_id != prevProps.match.params.role_id) || (this.props.match.params.role_id != this.state.role_id)) && this.state.all_roles_list && this.state.all_roles_list.length && this.props.history.location.pathname.search('/delete') > -1) {
			console.log('componentDidUpdate Roles page 2');
			if (this.state.searched_list && this.state.searched_list.length) {
				let c = 0;
				this.state.searched_list.map((st) => {
					if (st.id == this.props.match.params.role_id && st.is_deletable) {
						c++;
						this.setState({
							role_id: this.props.match.params.role_id,
							delete_role: true,
							edit_role: false,
							add_role: false
						});
					}
				});
				if (c == 0) {
					console.log('componentDidUpdate Roles page 2 2');
					this.props.history.push('/settings/roles/' + this.props.history.location.search);
				}
			}
		} else if (this.props.history.location.search == '' && this.props.history.location.pathname == '/settings/roles') {
			console.log('componentDidUpdate Roles page 3');
			this.setState({
				role_id: '',
				selected_role_id: null,
				selected_role_name: null,
				selected_role_description: null,
				selected_role_access: {},
				selected_role_checkedKeys: [],
				selected_role_master_access: false,
				drawRoleVisible: false,
				filter_list: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.filter ? this.parsed_search.filter.split(',') : [],
				table_search: this.parsed_search && Object.values(this.parsed_search).length && this.parsed_search.search ? this.parsed_search.search : '',
			}, () => {
				this.queryCreate();
				// this.defaultTreeValue();
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
	 * This function calls the API to get the category list.
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
				let sub_category_names = {};
				let category_list_object = {};
				if (json.category_list && json.category_list.length) {
					json.category_list.map((category) => {
						if (!category_list_object[category.id]) {
							category_list_object[category.id] = category.name;
						}
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								if (!sub_category_names[sub_cat.id]) {
									sub_category_names[sub_cat.id] = sub_cat.id;
								} else {
									sub_category_names[sub_cat.id] = sub_cat.id;
								}
								obj1.push({
									'title': sub_cat.name,
									'value': '0-' + category.id + '-' + sub_cat.id,
									'key': '0-' + category.id + '-' + sub_cat.id,
								});
							});
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
				that.setState({
					unauthorised_access: false,
					category_list: json.category_list,
					category_list_object: category_list_object,
					groupFilter: groupFilter,
					groupValue: value,
					sub_category_names: sub_category_names
				}, () => {
					console.log('groupFilter', that.state.groupFilter);
					that.fetchData();
					// that.updateDataInterval = setInterval(() => that.fetchData(true), 30000);
					// that.setSub();
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
					unauthorised_access: false,
				});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}

	/**
	 * This function calls the API to get the roles list.
	 * @param  {Boolean} update 
	 */
	fetchData(update) {
		let that = this;
		let response_status;
		
		if (that.state.category_list && that.state.category_list.length == 0) {
			that.retriveData();
		}
		// console.log("stations":that.state.stations_list);
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/roles/list', {
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
				console.log('response status code', response_status);
				// json.roles_list =[];
				if (!update) {
					that.setState({
						filtered_stations: json.station_list
					});
				}

				userFilter=[
				{
					'title': 'Master Access',
					'value': that.state.master_access_string,
					'key': that.state.master_access_string,
				}];
				userFilter2=[];
				treeData = [];
				let sub_access_object = {};
				let sub_access_name_object = {};
				let access_object = {};
				let access_list_options = {};
				let access_options = {};
				let access_options_keys = {};
				let sub_access_options = {};
				let sub_access_options_keys = {};
				if (json.access_list && Object.values(json.access_list).length && json.access_list.access_groups && json.access_list.access_groups.length) {

					json.access_list.access_groups.map((access, main_index) => {
						let temp = [];
						let temp2 = [];
						if (access.access_list && access.access_list.length) {
							access.access_list.map((sub_access) => {
								temp.push({
									title: sub_access.name,
									value: sub_access.key,
									key: sub_access.key,
								});
								temp2.push(sub_access.key);
								if (!sub_access_name_object[sub_access.key]) {
									sub_access_name_object[sub_access.key] = sub_access.name;
								} else {
									sub_access_name_object[sub_access.key] = sub_access.name;
								}

								if (!sub_access_object[sub_access.key]) {
									sub_access_object[sub_access.key] = access.group_name;
								} else {
									sub_access_object[sub_access.key] = access.group_name;
								}
							});

							userFilter.push({
								'title': access.group_name,
								'value': main_index,
								'key': main_index,
								'children': temp
							});
							masterDisplay.push({
								'title': access.group_name,
								'value': main_index,
								'key': main_index,
								'children': temp
							});
							treeData.push({
								'title': access.group_name,
								'value': main_index,
								'key': main_index,
								'children': temp
							});

							if (!access_object[access.group_name]) {
								access_object[access.group_name] = temp2;
							} else {
								access_object[access.group_name] = temp2;
							}
						}
					});
				}
				userFilter3 = userFilter.slice(0);
				let roleValue = [];
				roleValue = that.state.filter_list;

				if (that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ) {
						let role_id = that.props.match.params.role_id;
						if (json.roles_list && json.roles_list.length) {
							json.roles_list.map((st_gr) => {
								if (st_gr.id == role_id) {
									that.editRole(st_gr, json.access_list, access_options_keys, access_list_options, sub_access_options_keys);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ) {
						let role_id = that.props.match.params.role_id;
						if (json.roles_list && json.roles_list.length) {
							json.roles_list.map((st_gr) => {
								if (st_gr.id == role_id && st_gr.is_deletable) {
									that.showDeleteConfirm(st_gr);
								}
							});
						}
					}

					if (that.props.history.location && that.props.history.location.pathname.search('/add') > -1) {
						that.addNewGroup();
					}

				if (roleValue.includes(that.state.master_access_string)) {
					// userFilter = userFilter2;
					roleValue = [that.state.master_access_string];
				} else {
					// userFilter = userFilter3;
				}

				console.log('treeData', treeData);
				console.log('access_options', access_options);
				console.log('access_list_options', access_list_options);
				that.setState({
					unauthorised_access: false,
					acl_version: json.access_list.version,
					sub_access_object: sub_access_object,
					sub_access_name_object: sub_access_name_object,
					access_object: access_object,
					all_access_list: json.access_list,
					all_roles_list: json.roles_list,
					roleValue: roleValue,
					filter_list: roleValue,
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
					edit_role: that.props.history.location && that.props.history.location.pathname.search('/edit') > -1 ? true : false,
					add_role: that.props.history.location && that.props.history.location.pathname.search('/add') > -1 ? true : false,
					delete_role:  that.props.history.location && that.props.history.location.pathname.search('/delete') > -1 ? true : false,
					// filtered_stations: json.all_stations,
				},() => {
					/*if (that.state.roleValue.includes(that.state.master_access_string)) {
						userFilter = userFilter2;
						roleValue = [that.state.master_access_string];
					} else {
						userFilter = userFilter3;
					}*/

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
				that.setState({
					unauthorised_access: false
				});
				that.openNotification('error', json.message);
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
	 * This funtion creates the query to be pushed int he url.
	 */
	queryCreate() {
		// toaster.warning('Heyyyy', 'Alert');

		console.log('in queryCreate', this.props.history.location.pathname);
		let query_string = '?' + (this.state.filter_list && this.state.filter_list.length ? 'filter=' + this.state.filter_list : '' ) + (this.state.table_search  && this.state.table_search != '' ? (this.state.filter_list && this.state.filter_list.length ? '&search=' + this.state.table_search : 'search=' + this.state.table_search ) : '');
		
		console.log('queryCreate state', this.state);
		if (((this.state.role_id && this.state.role_id != '') || (this.props.match.params.role_id)) && this.state.edit_role) {
			console.log('queryCreate 1', this.state.role_id);
			this.props.history.push('/settings/roles/' + this.props.match.params.role_id + '/edit/' + query_string);
		} else if (this.state.add_role) {
			console.log('queryCreate 2', this.state.role_id);
			this.props.history.push('/settings/roles/add/' + query_string);
		} else if (((this.state.role_id && this.state.role_id != '') || (this.props.match.params.role_id)) && this.state.delete_role) {
			console.log('queryCreate 3', this.state.role_id);
			this.props.history.push('/settings/roles/' + this.props.match.params.role_id + '/delete/' + query_string);
		} else {
			console.log('queryCreate 4', this.state.role_id);
			this.props.history.push('/settings/roles/' + query_string);
		}

		
		let filtered_stations = [];
		if (this.state.all_roles_list && this.state.all_roles_list.length && this.state.filter_list && this.state.filter_list.length) {
			console.log('debug 1');
			this.state.all_roles_list.map((station) => {
				let c = 0;
				if (station.access == this.state.master_access_string) {
					c++;
				}
				else if (station.access && station.access instanceof Array && station.access.length) {
					station.access.map((st) => {
						this.state.filter_list.map((filter) => {
							if (st == filter) {
								console.log('in filter');
								c++;
							} /*else if (Object.keys(station.access[st]).length && st != this.state.master_access_string) {

								Object.keys(station.access[st]).map((sub_key) => {
									if (filter.split('-').length == 2 && sub_key == filter.split('-')[1]) {
										c++;
									}
								});
							}*/ else if (st == this.state.master_access_string) {
								/*if (this.state.sub_access_options && Object.values(this.state.sub_access_options).length) {
									Object.values(this.state.sub_access_options).map((sub) => {
										if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
											// console.log('catttt sub 1', sub);
											c++;
										}
									});
								}
								if (this.state.access_options && Object.values(this.state.access_options).length) {
									Object.values(this.state.access_options).map((sub) => {
										if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {

											c++;
										}
									});
								}*/
								c++;
							}
						});
					});
					/*if (c > 0) {
						filtered_stations.push(station);
					}*/
				}
				if (c > 0) {
					filtered_stations.push(station);
				}
			});
		} else if (this.state.filter_list.length == 0) {
			console.log('debug 2');
			filtered_stations = this.state.all_roles_list;
		}

		this.setState({
			filtered_stations: filtered_stations,
			// searched_list: filtered_stations
		}, () => this.setSearchedList());
		// this.setSearchedList();
	}

	/**
	 * This function sets the delete confirmation popup.
	 * @param  {Object} role Role data.
	 */
	showDeleteConfirm(role) {
		console.log('showDeleteConfirm', role);
		let that = this;
		that.props.history.push('/settings/roles/' + role.id + '/delete/' + that.props.history.location.search);
		confirm({
			title: 'Do you want to delete ?',
			content: role.name,
			onOk() {
				that.deleteGroup(role);
			},
			onCancel() {
				that.closeAddEditModal();
				that.props.history.push('/settings/roles/' + that.props.history.location.search);
			}
		});
	}

	/**
	 * This function calls the API to delete the role.
	 * @param  {Object} role ROle data.
	 */
	deleteGroup(role) {
		let that = this;
		let response_status;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/users/roles/' + role.id + '/delete', {
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
				that.setState({
					unauthorised_access: false,
				});
				that.fetchData();
				that.openNotification('success', json.message);
				that.closeAddEditModal();
			} else {
				that.setState({
					unauthorised_access: false,
				});
				that.openNotification('error', json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
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
				} else if (cat.access && Object.keys(cat.access).length) {
					let c = 0;
					Object.keys(cat.access).map((st) => {
						if (st.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						} else if (Object.keys(cat.access[st]).length && st != this.state.master_access_string) {
							Object.keys(cat.access[st]).map((sub_key) => {
								if (sub_key.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
									c++;
								}
							});
						} else if (st == this.state.master_access_string) {
							if (this.state.sub_access_options && Object.values(this.state.sub_access_options).length) {
								Object.values(this.state.sub_access_options).map((sub) => {
									if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
										c++;
									}
								});
							}
							if (this.state.access_options && Object.values(this.state.access_options).length) {
								Object.values(this.state.access_options).map((sub) => {
									if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
										c++;
									}
								});
							}
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
				} else if (cat.access && Object.keys(cat.access).length) {
					let c = 0;
					Object.keys(cat.access).map((st) => {
						
						if (st.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
							c++;
						} else if (Object.keys(cat.access[st]).length && st != this.state.master_access_string) {

							Object.keys(cat.access[st]).map((sub_key) => {
								if (sub_key.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
									c++;
								}
							});
						} else if (st == this.state.master_access_string) {
							if (this.state.sub_access_options && Object.values(this.state.sub_access_options).length) {
								Object.values(this.state.sub_access_options).map((sub) => {
									if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {
										// console.log('catttt sub 1', sub);
										c++;
									}
								});
							}
							if (this.state.access_options && Object.values(this.state.access_options).length) {
								Object.values(this.state.access_options).map((sub) => {
									if (sub.toLowerCase().includes(decodeURI(encodeURI(this.state.table_search.toLowerCase())))) {

										c++;
									}
								});
							}
						}
					});
					
					if (c>0) {
						searched_list.push(cat);
					}
					console.log('catttt sub 2', searched_list);
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
			this.queryCreate();
		});
	}

	/**
	 * This function renders the access data in tree fromt in the roles cards.
	 * @param  {Array} data tree data
	 */
	renderTreeNodes(data) {
		return data.map((item) => {
			if (item.children) {
				return (
					<TreeNode title={item.title} key={item.key} dataRef={item}>
						{this.renderTreeNodes(item.children)}
					</TreeNode>
				);
			}
			return <TreeNode {...item} />;
		});
	}

	/**
	 * This function sets the role selected.
	 */
	onChangeRole(roleValue, extra) {
		console.log('roleValue', roleValue);
		if (extra.triggerValue == this.state.master_access_string && roleValue.length) {
			roleValue = [this.state.master_access_string];
		} else if (extra.triggerValue != this.state.master_access_string) {
			if (roleValue.length && roleValue.indexOf(this.state.master_access_string) > -1) {
				roleValue.splice(roleValue.indexOf(this.state.master_access_string),1);
			}
		}
		this.setState({
			roleValue: roleValue,
			filter_list: roleValue
		}, () => {

			this.queryCreate()
		});
	}
	/**
	 * This function renders the page.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		const roleProps = {
			treeData: userFilter,
			value: this.state.roleValue,
			onChange: (value, a, extra) => this.onChangeRole(value,extra),
			treeCheckable: true,
			// showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Filter Roles by Access',
		};
		if (this.state.all_access_list && Object.keys(this.state.all_access_list).length) {
			return <div>
				<div className="table-filter"><TreeSelect treeDefaultExpandAll {...roleProps} className="filter-icon" /></div>
				<div className="table-search">
					<Input placeholder="Search by Role Name" prefix={<Icon type="search" />} defaultValue={this.state.table_search} onChange={(e) => this.setSearch(e.target.value)} />
				</div>
				<div className="add-btn"><Button type="primary" icon="plus" onClick={() => this.addNewGroup()}>Create New Role</Button></div>
				<div className="features">
				{(() => {
					if (this.state.searched_list && this.state.searched_list.length) {
						console.log('role list', this.state.searched_list);
						let roles_list = this.state.searched_list.map((roles) => {
							return <div className="feature">
								<Card 
									title={roles.name}
									extra={
										<div>
											<Popconfirm className="info-msg" title={roles.description} icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
											</Popconfirm>
											<Dropdown overlay={
												<Menu>
													<Menu.Item key="action-1" onClick={() => this.editRole(roles)}>Edit</Menu.Item>
													<Menu.Item key="action-2" onClick={() => this.showDeleteConfirm(roles)} disabled={!roles.is_deletable}>
														{(() => {
															if (roles.is_deletable) {
																return <span> Delete </span>;
															} else {
																return <Tooltip title="This role can not be deleted">
																	<span>Delete</span>
																</Tooltip>;
															}
														})()}
													</Menu.Item>
												</Menu>
											} trigger={['click']} placement="bottomLeft">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
											</Dropdown>
										</div>
									}
									className="back-grey"
								>
									<div className="detail">
										<span className="table-txt hellip">{'Created by ' + roles.created_by}</span>
										<span className="date-txt">{moment.unix(roles.created_on).tz("Asia/Kolkata").format('HH:mm, DD MMM')}</span>
									</div>
									{/*<div className="total-count">
										<span>{'Total no of stations: ' + (roles.access && roles.access.length ? roles.access.length : '0')}</span>
									</div>*/}
									<div className="role-name-container">
										<Tree
									defaultExpandAll={true}
									autoExpandParent={this.state.autoExpandParent}
									onCheck={this.onCheck}
									onSelect={this.onSelect}
									>
									{(() => {
										let role_obj = [];
										if (roles.access && !(roles.access instanceof Array)) {
											if (roles.access == this.state.master_access_string) {
											console.log('accesss', roles.access);
												role_obj = [];
												role_obj = [{
													'title': 'Full Access',
													'key': '*',
													'children': []
												}];
											}
										}
										else if (roles.access && roles.access.length) {
											/*if (roles.access.indexOf(this.state.master_access_string) > -1) {
												role_obj = [];
												role_obj = [{
													'title': 'Master Access',
													'key': '*',
													'children': []
												}];
											} else {*/
											if (this.state.access_object && Object.keys(this.state.access_object).length) {
													Object.keys(this.state.access_object).map((access_name) => {
														let c=0;
														let obj1 = [];
														roles.access.map((rule_name) => {
															if (this.state.access_object[access_name].indexOf(rule_name) > -1) {
																c++;
																obj1.push({
																	'title': this.state.sub_access_name_object[rule_name],
																	'key': rule_name,
																});
															}
														});
														if (c > 0) {
															role_obj.push({
																'title': access_name,
																'key': access_name,
																'children': obj1
															});
														}
													});
												}
											// }
											
											console.log('roleeeee', role_obj);
										}
											return this.renderTreeNodes(role_obj);
									})()}
									</Tree>
									</div>
								</Card>
							</div>
						}).filter(Boolean);
						return roles_list;
					} else {
						return <Row type="flex" justify="space-around" className="no-data-text-container">
							<div className="no-data-text">No roles found!</div>
						</Row>;
					}
				})()}
				</div>
				{(() => {
					if (this.state.edit_role || this.state.add_role) {
						return <UserRoleForm 
							visible={this.state.drawRoleVisible}
							onCancel={() => this.closeAddEditModal()}
							onCreate={() => this.handleCreate()}
							addEditCallback={(key,created_by, id, time, description, is_deletable, name, access) => this.addEditCallback(key,created_by, id, time, description, is_deletable, name, access)}
							client_id={this.state.client_id}
							application_id={this.state.application_id}
							master_access_string={this.state.master_access_string}
							acl_version={this.state.acl_version}
							add_role={this.state.add_role}
							edit_role={this.state.edit_role}
							access_list_options={this.state.access_list_options}
							access_options={this.state.access_options}
							sub_access_options={this.state.sub_access_options}
							selected_role_master_access={this.state.selected_role_master_access}
							selected_role_checkedKeys={this.state.selected_role_checkedKeys}
							selected_role_id={this.state.selected_role_id}
							selected_role_name={this.state.selected_role_name}
							selected_role_description={this.state.selected_role_description}
							selected_role_access={this.state.selected_role_access}
						/>
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