import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown, List, Tag, Checkbox, Radio, notification, Alert } from 'antd';
import Head from './imports/Head';
import Side from './imports/Side';
import moment from 'moment-timezone';
import Loading from './imports/Loading';
import ManualSentList from './imports/ManualSentList';
import reactStringReplace from 'react-string-replace';
const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Content } = Layout;

const { Option } = Select;

const FormItem = Form.Item;

const CheckboxGroup = Checkbox.Group;

const RadioGroup = Radio.Group;

const confirm = Modal.confirm;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const CreateTemplateForm = Form.create()(
	class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {};
		}

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			return (
				<div id="create_template">
					<Drawer
						title="Create Template"
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
									<Form.Item label="Template Name">
										{getFieldDecorator('templateName', {
											rules: [{ required: true, message: 'Please enter template name' }],
											onChange: (e,f) => this.props.addNewTemplateData(e.target.value, 'template_name')
										})(<Input placeholder="Please enter template name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="Template">
									 <Input.TextArea onChange={(e,f) => this.props.addNewTemplateData(e.target.value, 'template_msg')} rows={4} placeholder="Please enter template message" />
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
							<Button
								style={{
									marginRight: 8,
								}}
								onClick={onCancel}
							>
								Cancel
							</Button>
							<Button onClick={() => {this.props.addNewTemplate()}} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

var userGroupData = [];

const SendTemplateForm = Form.create()(
	class SendTemplateForm extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				valueUser: [],
				valueStation: [],
				template_data: _.find(this.props.searched_templates, { 'id': parseInt(props.template_id) }),
			};
			console.log('searched_templates_props.template_id', props.template_id);
			console.log('this.state.searched_templates', _.find(this.props.searched_templates, { 'id': parseInt(props.template_id) }));
		}

		onChangeUser(valueUser, key) {
			console.log('value-1', valueUser);
			console.log('key', key);
			if (key == 'user_role') {
				this.setState({ valueUser: [] });
				console.log('value1', valueUser);
			} else {
				this.setState({ valueUser });
				console.log('value2', valueUser);
			}
			console.log('value', valueUser);
		}

		changeUserRole(valueRole) {
			console.log('value', valueRole);
			this.setState({ valueRole });
		}

		changeRadioValue(value) {
			this.setState({radio_group: value});
			console.log('aaaaaaaaa', value);
		}

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const tProps = {
				treeData: userGroupData,
				/*value: this.state.valueUser,*/
				/*onChange: this.onChangeUser,*/
				treeCheckable: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user group',
			};

			return (
				<div id="send_drawer">
					<Drawer
						title={this.state.template_data.name}
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
							<Row gutter={16} className="top-section">
								<Col span={24} className="wid-100">
									{(() => {
										if (this.state.template_data.template && Object.keys(this.state.template_data.template).length) {
											let string_line = this.state.template_data.template.template.trim();
											// let string_line = this.state.template_data.template.template.trim().split(' ');
											// console.log('string_line', string_line);
											return <Form.Item label="">
												{(() => {
													console.log('string_line', string_line);
													let  reactString = reactStringReplace(string_line, /(@__@)/g, (match, i) => (
														<Input placeholder="Enter Value" className="input-box less-margin-input" maxlength="10" onChange={(e) =>{this.props.setThresholdValue(e.target.value, i)}}/>
													));
													console.log('string_line', reactString);
													return reactString;
												})()}
												{/*<span>Some text</span>
												{getFieldDecorator('text1', {
													rules: [{ required: true, message: 'Please enter value' }],
												})(<Input placeholder="Please enter" className="input-box" />)}
												<span>Some text</span>
												{getFieldDecorator('text2', {
													rules: [{ required: true, message: 'Please enter value' }],
												})(<Input placeholder="Please enter" className="input-box" />)}*/}
											</Form.Item>;
										}
									})()}
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={23}>
									<Form.Item label="" className="draw-formItem">
										<RadioGroup onChange={(e) => {this.props.changeRadioValue(e.target.value)}} name="radiogroup" value={this.props.radio_group}>
											<Radio value={1} className="radio-draw margin-top-mdm">User groups</Radio>
											{/*getFieldDecorator('usergroup', {
												rules: [{ required: false, message: 'Please select user group' }],
												initialValue: this.props.valueUser,
												value: this.props.valueUser
											})(
												<TreeSelect value={this.props.valueUser} onChange={(e) => {this.onChangeUser(e, 'user_group'); this.props.changeRadioValue(1); this.props.sentTemplateUserData(e, 'user_group')}} showSearch treeDefaultExpandAll {...tProps} className="draw-select" />
											)*/}
											<TreeSelect value={this.props.valueUser} onChange={(e) => {/*this.onChangeUser(e, 'user_group');*/ this.props.changeRadioValue(1); this.props.sentTemplateUserData(e, 'user_group')}} showSearch treeDefaultExpandAll {...tProps} className="draw-select" />
											<Radio value={2} className="radio-draw margin-top-bg">User with role</Radio>
											<Select value={this.props.valueRole} onChange={(e) => {/*this.onChangeUser(e, 'user_role'); */this.changeUserRole(e); this.props.changeRadioValue(2); this.props.sentTemplateUserData(e, 'user_role')}} showSearch placeholder="Please select role" className="draw-select">
												{(() => {
													if (this.props.roles_list && this.props.roles_list.length) {
														return this.props.roles_list.map((role, ind) => {
															return <Option value={role.name}>{role.name}</Option>
														});
													}
												})()}
											</Select>
										</RadioGroup>
									</Form.Item>
								</Col>
						 </Row>
						 {/*<Row gutter={16} className="top-section">
								<Col span={11}>
									<Form.Item label="" className="draw-formItem">
										<Radio className="radio-draw">User with role</Radio>
										{getFieldDecorator('role', {
											rules: [{ required: true, message: 'Please select role' }],
										})(
											<Select showSearch placeholder="Please select role" className="draw-select">
												<Option value="role-1">Role-1</Option>
												<Option value="role-2">Role-2</Option>
												<Option value="role-3">Role-3</Option>
											</Select>
										)}
									</Form.Item>
								</Col>
								<Col span={11} className="draw-select">
									<Form.Item label="and stations">
										{getFieldDecorator('stations', {
											rules: [{ required: true, message: 'Please select station' }],
										})(
											<TreeSelect dropdownStyle={{ maxHeight: 300, overflow: 'auto' }} treeDefaultExpandAll {...tProps1} className="filter-icon" />
										)}
									</Form.Item>
								</Col>
						 </Row>*/}
						 <Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Notify by" className="draw-formItem">
										{getFieldDecorator('notify', {
											rules: [{ required: true, message: 'Please select an option' }],
										})(
											<CheckboxGroup onChange={(e) => {this.props.changeAlertMediaValue(e)}} options={
												[
													{ label: 'Email', value: 'emails' },
													{ label: 'Web App', value: 'webapp' },
												]
											} defaultValue={['emails']} />
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
							<Button
								style={{
									marginRight: 8,
								}}
								onClick={onCancel}
							>
								Cancel
							</Button>
							<Button onClick={() => {this.props.sendTemplate()}} type="primary">Send</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

var groupFilter = [];

export default class ManualAlerts extends React.Component {
	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		let parsed = queryString.parse(props.location.search);
		this.search_list = parsed.search ? parsed.search : '';
		console.log('search', parsed);
		this.state = {
			client_id: 365,
			application_id: 19,
			template_id: props.match && props.match.params && props.match.params.template_id ? props.match.params.template_id : '',
			manual_template_search: this.search_list,
			autoTabVisible: true,
			manualTabVisible: true,
			drawAlertVisible: false,
			drawSendTemplateVisible: false,
			drawCreateTemplateVisible: false,
			groupValue: [],
			drawGroupVisible: false,
			radio_group: 1,
			valueRole: '',
			valueUser: []
		};
		this.param_thresholds= [];
		this.user_group_array= [];
		this.input_one_value= '';
		this.input_two_value= '';
		this.index_one = 0;
		this.index_two = 0;
		this.getManualTemplatesList();
	}

	sentListShow(id) {
		this.props.history.push('/settings/alerts/manual/templates/sent-list/?template-id=[' + id + ']');
		this.setState({
			template_id: id,
			autoTabVisible: false,
			manual_template_search: ''
		});

		// this.setState({
		// 	manualTabVisible: false,
		// });
	};

	allTemplateList() {
		this.props.history.push('/settings/alerts/manual/templates/sent-list/');
	}

	templateDetailsShow (){
		this.setState({
			autoTabVisible: false,
		});
	};

	showAutoTemplate () {
		this.setState({
			autoTabVisible: true,
		})
	};

	showManualTemplate () {
		this.setState({
			manualTabVisible: true,
		})
	};

	showAlertDrawer () {
		this.setState({ drawAlertVisible: true });
	}

	showSendDrawer(id) {
		document.title = 'Settings - Manual Alert Templates - Send Template - Flood Forecasting and Early Warning System for Kolkata City';
		this.props.history.push('/settings/alerts/manual/templates/' + id + '/send-alert/');
		this.setState({
			template_id: id,
			manual_template_search: ''
		});
		this.setState({ drawSendTemplateVisible: true });
	}

	showCreateTemplateDrawer() {
		document.title = 'Settings - Manual Alert Templates - Create Template - Flood Forecasting and Early Warning System for Kolkata City';
		this.props.history.push('/settings/alerts/manual/templates/new/');
		this.setState({ drawCreateTemplateVisible: true });
	}

	onChangeGroup(groupValue) {
		this.setState({ groupValue });
	}

	stopDefault (e) {}

	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};

	changeAlertType(type) {
		if (type == 'automatic') {
			this.props.history.push('/settings/alerts/automatic/list/');
		} else {
			this.props.history.push('/settings/alerts/manual/templates/list/');
		}
	}

	handleCancel() {
		document.title = 'Settings - Manual Alert Templates - Flood Forecasting and Early Warning System for Kolkata City';
		this.input_one_value = null;
		this.input_two_value = null;
		this.props.history.push('/settings/alerts/manual/templates/list/');
		this.setState({ 
			drawAlertVisible: false,
			drawCreateTemplateVisible: false,
			drawSendTemplateVisible: false,
		});
	}

	getManualTemplatesList() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/manual/templates/list', {
			method: 'GET',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated List', json);
			if (json.status === 'success') {
				groupFilter = [];
				let sub_category_names = {};
				let category_list_object = {};
				let all_template_id=[];
				if (json.template_list && json.template_list.length) {
					let template = [];
					json.template_list.map((temp) => {
						template.push({
							'title': temp.name,
							'value': '0-0-' + temp.id,
							'key': '0-0-' + temp.id,
						});
						all_template_id.push(temp.id);
					});
					groupFilter.push({
						title: 'Templates',
						value: '0-0',
						key: '0-0',
						children: template
					});
				}
				userGroupData = [];
				if (json.user_groups_list && json.user_groups_list.length) {
					json.user_groups_list.map((usrgrp) => {
						userGroupData.push({
							title: usrgrp.name,
							value: '0-' + usrgrp.id,
							key: '0-' + usrgrp.id
						});
					});
				}
				that.setState({
					template_list: json.template_list,
					user_groups_list: json.user_groups_list,
					roles_list: json.roles_list,
					stations_list: json.stations_list,
					station_groups_list: json.station_groups_list,
					groupFilter: groupFilter,
					all_template_id: all_template_id,
					loading: false
				}, () => {that.searchTemplates(that.state.manual_template_search)} );
			} else {
				that.setState({
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

	getUserGroupArray(user_group) {
		let user_group_array = [];
		// console.log('user_group1', user_group);
		if (user_group && user_group.length) {
			user_group.map((grp, ind) => {
				// console.log('user_group12', grp);
				let grp_id = grp.split('-');
				user_group_array.push(grp_id[1]);
			});
			this.setState({user_group_array: user_group_array});
		}
		console.log('user_group', user_group);
		// let grp_id = user_group.split('-');
		// console.log('grp_id', grp_id[1]);
		// this.user_group_array.push(parseInt(grp_id[1]));
		console.log('user_group2', user_group_array);
	}

	getRolesArray(role) {
		let roles_array = [];
		if (_.some(this.state.roles_list, { 'name': role})) {
			roles_array.push(_.find(this.state.roles_list, { 'name': role}).id);
		}
		this.setState({roles_array: roles_array});
	}

	sendTemplate() {
		let that = this;
		that.setState({
			loading: true
		});
		let user_group_array = [], roles_array = [];
		// console.log('user_group1', user_group);
		if (that.state.valueUser && that.state.valueUser.length) {
			that.state.valueUser.map((grp, ind) => {
				// console.log('user_group12', grp);
				let grp_id = grp.split('-');
				user_group_array.push(grp_id[1]);
			});
		}
		if (_.some(this.state.roles_list, { 'name': that.state.valueRole})) {
			roles_array.push(_.find(this.state.roles_list, { 'name': that.state.valueRole}).id);
		}
		// that.getUserGroupArray(that.state.valueUser);
		// that.getRolesArray(that.state.valueRole);
		if (that.input_one_value && that.input_one_value != null) {
			that.param_thresholds.push(that.input_one_value);
		}
		if (that.input_two_value && that.input_two_value != null) {
			that.param_thresholds.push(that.input_two_value);
		}
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/manual/templates/' + that.state.template_id + '/send_alert/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				parameters: that.param_thresholds,
				user_groups: user_group_array,
				roles: roles_array,
				media: that.state.sent_via_media,
				stations: [],
				station_groups: []
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated List', json);
			if (json.status === 'success') {
				that.setState({
					loading: false,
					valueRole: '',
					valueUser: []
				}, () => {
					that.input_one_value = null;
					that.input_two_value = null;
					that.param_thresholds = [];
					that.user_group_array= [];
					that.openNotification('success', 'Alert Send Successfully');
					that.getManualTemplatesList('');
					that.props.history.push('/settings/alerts/manual/templates/list/');
					document.title = 'Settings - Manual Alert Templates - Create Template - Flood Forecasting and Early Warning System for Kolkata City';
				});
			} else {
				that.setState({
					loading: false
				});
				that.param_thresholds = [];
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


	changeRadioValue(value) {
		this.setState({radio_group: value});
		console.log('radio_group_select', value);
	}

	changeAlertMediaValue(value, index) {
		console.log('input_values', value);
		this.setState({sent_via_media: value});
	}

	setThresholdValue(value, index) {
		console.log('input_values', value);
		console.log('input_index', index);
		if (index != null && index != undefined) {
			if (index == 1) {
				this.input_one_value = value;
			}
			if (index == 3)  {
				this.input_two_value = value;
			}
		}
		console.log('input_param_thresholds_one', this.input_one_value);
		console.log('input_param_thresholds_two', this.input_two_value);
	}

	sentTemplateUserData(value, key) {
		let valueUser = [];
		let valueRole = '';
		if (key == 'user_group') {
			valueUser= value;
			valueRole= '';
			this.setState({valueUser, valueRole});
		} else if (key == 'user_role') {
			valueUser= [];
			valueRole= value;
			this.setState({valueRole, valueUser});
		}
		console.log('data not received');
		console.log('data received_check', value);
	}

	clearSearchState() {
		this.setState({manual_template_search: ''});
		this.searchTemplates('');
	}

	addNewTemplate() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/manual/templates/new', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				name: that.state.template_name,
				template: {
					template: that.state.template_msg,
					var_restrictions: []
				}
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated List', json);
			if (json.status === 'success') {
				that.setState({
					loading: false,
				}, () => {
					that.getManualTemplatesList('');
					that.props.history.push('/settings/alerts/manual/templates/list/');
					document.title = 'Settings - Manual Alert Templates - Create Template - Flood Forecasting and Early Warning System for Kolkata City';
				} );
			} else {
				that.setState({
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

	searchTemplates(value) {
		console.log('in searchTemplate function', value);
		let searched_templates = [];
		let query_string = '';
		if (value == '') {
			query_string= '';
		} else {
			query_string= '?search=' + value;
		}
		if (this.state.template_list && this.state.template_list.length && value) {
			this.state.template_list.map((alert,index) => {
				if (value != '' && (alert.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					searched_templates.push(alert);
				}
			});
		} else if (this.state.template_list && this.state.template_list.length && value == '') {
			searched_templates = this.state.template_list.slice(0);
		}
		this.setState({
			manual_template_search: decodeURI(encodeURI(value)),
			searched_templates: searched_templates
		},() => {
			if ((this.props.location.pathname.search('/sent-list/') < 0) && (this.props.location.pathname.search('/send-alert/') < 0) && (this.props.location.pathname.search('/new/') < 0)) {
				this.props.history.push('/settings/alerts/manual/templates/list/' + query_string);
			}
			console.log('searched_templates', this.state.searched_templates);
		});
	}

	addNewTemplateData(val, key) {
		let template_name = '', template_msg = '';
		if (key == 'template_name') {
			template_name = val;
			this.setState({
				template_name: template_name
			});
		} else if (key == 'template_msg') {
			template_msg = val;
			this.setState({
				template_msg: template_msg
			});
		}
		console.log('alert_val', val);
		console.log('alert_foo', key);
	}

	componentDidMount() {
		document.title = 'Settings - Manual Alert Templates - Flood Forecasting and Early Warning System for Kolkata City';
		this.searchTemplates(this.state.manual_template_search)
	}

	render () {
		return (
			<div id="alert">
				<Side active_link="alerts" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<div>
								<div className="alerts-tabs-bar">
									<div className="alerts-tabs-nav-scroll">
										<div className="alerts-tabs-nav alerts-tabs-nav-animated">
											<div>
												<div role="tab" aria-disabled="false" aria-selected="true" className="alerts-tabs alerts-tabs-tab" onClick={() => this.changeAlertType('automatic')}>Automatic</div>
												<div role="tab" aria-disabled="false" aria-selected="false" className="alerts-tabs alerts-tabs-tab alerts-tabs-tab-active" onClick={() => this.changeAlertType('manual')}>Manual</div>
											</div>
												<div className="blank-border"></div>
										</div>
									</div>
								</div>
								<div className="station-view">
									{(() => {
										if (this.props.location.pathname && (this.props.location.pathname.search('/sent-list/') > -1)) {
											console.log('Manual Alerts Sent List');
											return <ManualSentList clearSearchState={() => this.clearSearchState()} {...this.props} {...this.state}/>;
										} else {
											console.log('Manual Alerts List');
											return <div> 
												<div className="table-search width-search-100">
													<Input placeholder="Search By Template name" prefix={<Icon type="search" />} value={this.state.manual_template_search} onChange={(e) => this.searchTemplates(e.target.value)}/>
												</div>
												<div className="add-btn">
												<span className="view-all" onClick={() => this.allTemplateList()}>View all Alert List</span>
												<Button type="primary" icon="plus" onClick={() => this.showCreateTemplateDrawer()}>Add new template</Button></div>
												{(() => {
													if (this.state.searched_templates && this.state.searched_templates.length) {
														return <Card title="" bordered={false}>
															{(() => {
																let templates = this.state.searched_templates.map((template, ind) => {
																	return <Card.Grid className="grid-style">
																		<Row type="flex" justify="space-between">
																			<Col className="alert-name" span={12}>{template.name}</Col>
																			<Col className="text-c" span={8}>
																				<span className="user-list" onClick={() => this.sentListShow(template.id)}>Sent List</span>
																			</Col>
																			<Col className="text-r" span={3}>
																				<Icon type="double-right" theme="outlined" className="click arrow" onClick={() => {this.showSendDrawer(template.id)}} />
																			</Col>
																		</Row>
																	</Card.Grid>;
																});
																return templates;
															})()}
															{/*<Card.Grid className="grid-style">
																<Row type="flex" justify="space-between">
																	<Col className="alert-name" span={5}>
																		Template-2
																	</Col>
																	<Col className="text-c" span={10}>
																		<span className="user-list" onClick={() => this.sentListShow()}>Sent List</span>
																	</Col>
																	<Col className="text-r" span={3}>
																		<Icon type="double-right" theme="outlined" className="click arrow" onClick={() => {this.showSendDrawer()}} />
																	</Col>
																</Row>
															</Card.Grid>*/}
														</Card>;
														// return <Loading  is_inline={true} />;
													} else if (this.state.manual_template_search && this.state.manual_template_search != null && this.state.manual_template_search != '' && this.state.searched_templates && this.state.searched_templates.length == 0 && this.state.template_list && this.state.template_list.length > 0) {
														return <div className="no-data-text">No Templates Found.</div>;
													} else if (this.state.template_list && this.state.template_list.length === 0) {
														return <div className="no-data-text">No Templates Available.</div>;
													} else {
														return <Loading  is_inline={true} />;
													}
												})()}
												{(() => {
													if (this.props.location.pathname && (this.props.location.pathname.search('/new/') > -1)) {
														return <CreateTemplateForm 
															visible={true}
															addNewTemplateData = {(e,f) => {this.addNewTemplateData(e,f)}}
															addNewTemplate = {() => {this.addNewTemplate()}}
															onCancel={() => this.handleCancel()}
														/>;
													}
												})()}
												{(() => {
													if (this.props.location.pathname && (this.props.location.pathname.search('/send-alert/') > -1) && this.state.searched_templates && this.state.searched_templates.length) {
														return <SendTemplateForm
															visible={true}
															valueUser={this.state.valueUser}
															setThresholdValue={(e,f,g)=>{this.setThresholdValue(e,f,g)}}
															changeAlertMediaValue={(e,f)=>{this.changeAlertMediaValue(e,f)}}
															/*onChangeUser={(e) => this.onChangeUser(e)}*/
															valueRole={this.state.valueRole}
															user_groups={this.props.user_groups}
															radio_group={this.state.radio_group}
															changeRadioValue={(e)=> this.changeRadioValue(e)}
															sentTemplateUserData={(e,f) => this.sentTemplateUserData(e,f)}
															roles_list={this.state.roles_list}
															template_id={this.state.template_id}
															sendTemplate={() => this.sendTemplate()}	
															searched_templates={this.state.searched_templates}
															onCancel={() => this.handleCancel()}									
														/>;
													}
												})()}
											</div>;
										}
									})()}
								</div>
							</div>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}