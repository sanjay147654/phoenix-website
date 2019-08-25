import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown, List, Tag, Checkbox, Radio, notification, Alert } from 'antd';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
import moment from 'moment-timezone';
import _ from 'lodash';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Content } = Layout;

const { Option } = Select;

const FormItem = Form.Item;

const CheckboxGroup = Checkbox.Group;

const confirm = Modal.confirm;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

let stationData = [];

const AlertForm = Form.create()(
	class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				stationValue: '',
				role_name: ''
			};
		}

		onChange(value) {
			this.setState({ value });
		}

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const stationProps = {
				treeData: stationData,
				value: this.props.stationValue,
				// onChange: this.onChangeStation,
				treeCheckable: false,
				// multiple: false,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select station / station group',
			};
			
			return (
				<div id="alert_form">
					<Drawer
						title= {(this.props.pathName.search('/edit/') > -1) ? 'Modify Alert' : 'Assign Alert'}
						width={720}
						placement="right"
						visible={visible}
						onClose={onCancel}
						style={{
							height: 'calc(100% - 55px)',
							overflow: 'auto',
							paddingBottom: 53,
						}}
					>
						<Form layout="vertical" hideRequiredMark>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="with Role">
										{getFieldDecorator('role', {
											rules: [{ required: true, message: 'Please select role' }],
											initialValue: this.props.role_name
										})(
											<Select onChange={(e) => {this.props.changeRole(e)}} showSearch placeholder="Please select role">
												{(() => {
													if (this.props.roles_list && this.props.roles_list.length) {
														let role_option = this.props.roles_list.map((role, ind) => {
															return <Option value={role.name}>{role.name}</Option>
														});
														return role_option; 
													}
												})()}
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24}>
									<Form.Item label="and Stations / Station Group">
										{getFieldDecorator('stations', {
											rules: [{ required: true, message: 'Please select station' }],
											initialValue: this.props.stationValue
										})(
											<TreeSelect onChange={(e) => {this.props.treeChange(e)}} dropdownStyle={{ maxHeight: 300, overflow: 'auto' }} treeDefaultExpandAll {...stationProps} className="filter-icon" />
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
							{(() => {
								if (this.props.pathName.search('/edit/') > -1) {
									return <Button onClick={this.props.onEdit} type="primary">Save</Button>;
								} else {
									return <Button onClick={this.props.onSubmit} type="primary">Submit</Button>;
								}
							})()}
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

const AlertTable = class extends React.Component {
	constructor(props) {
		super(props);
		this.tableValue(props.searched_alerts_details);
	}

	tableValue(searched_alerts_details) {
		this.columns = [
			{
				title: 'User with',
				dataIndex: 'role',
				width: 200,
				sorter: (a, b) => a.role.length - b.role.length,
			}, {
				title: 'Station / Station Group',
				dataIndex: 'station',
				render: station => (
					<span>
					{(() => {
						return station.map((name) => {
							let st = name.split('_');
							if (st[0] == 'station') {
								return <Tag className="antd-custom-tag-color-stn" key={st[1]}>{st[1]}</Tag>;
							}
							if (st[0] == 'group') {
								return <Tag className="antd-custom-tag-color-group" key={st[1]}>{st[1]}</Tag>;
							}
						});
					})()}	
						{/*station.map(stn => <Tag className="antd-custom-tag-color-stn" key={stn}>{stn}</Tag>)*/}
					</span>
				),
			}, {
				title: 'User Count',
				dataIndex: 'count',
				width: 120,
				align: 'center',
			}, {
				title: 'Status',
				dataIndex: 'status',
				width: 80,
				align: 'center',
				render: (a,b) => (
					<Switch size="small" onChange={() => this.props.changeStatus(b)} checked={b.status}/>
				),
			}, {
				title: 'Action',
				dataIndex: 'action',
				width: 80,
				align: 'center',
				render: (a, b, c) => (
					<Dropdown overlay={<Menu>
							<Menu.Item key="action-1" onClick={() => this.props.editAlertRole(b.id)}>Edit</Menu.Item>
							<Menu.Item key="action-2" onClick={() => this.props.showDeleteConfirm(b)}>Delete</Menu.Item>
						</Menu>} trigger={['click']} placement="bottomLeft">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
					</Dropdown>
				),
			}
		];

		const columns = [
			{ title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
			{ title: 'Users', dataIndex: 'users', key: 'users' },
		];
		if (searched_alerts_details && searched_alerts_details.length) {
			this.table_data = [];
			this.table_user_data = [];
			searched_alerts_details.map((rule, ind) => {
				this.table_user_data[ind] = [];
				if (rule.id != null && rule.role_id != null && rule.status != null) {
					let role_name = _.find(this.props.roles_list, { 'id': rule.role_id }).name;
					let station_name = rule.station > 0 && rule.station != null ? _.find(this.props.station_list, { 'id': rule.station }).name : null;
					let station_group_name = rule.station_groups > 0 && rule.station_groups != null ? _.find(this.props.station_group_list, { 'id': rule.station_groups }).name : null;
					let station_tags = [];
					if (station_name && station_name != null) {
						station_name = 'station_'+ station_name;
						station_tags.push(station_name);
					}
					if (station_group_name && station_group_name != null) {
						station_group_name = 'group_'+ station_group_name;
						station_tags.push(station_group_name);
						// station_tags.push({color: 'blue'});
					}
					if (rule.users && rule.users.length) {
						let count = 0;
						rule.users.map((usr, i) => {
							if (_.some(this.props.user_list, { 'id': usr })) {
								count++;
								let user_name = _.find(this.props.user_list, { 'id': usr }).name,
									data = {
										key: i+1,
										slno: count,
										users: user_name,
									};
								this.table_user_data[ind].push(data);
							}
						});
					}
					this.table_data.push({
						id: rule.id,
						key: ind,
						role: role_name,
						station: station_tags,
						station_id: rule.station,
						station_group_id: rule.station_groups,
						count: rule.users ? rule.users.length : 0,
						status: rule.status == 1 ? true : false,
						data: this.table_user_data[ind]
					})
				}
			});
		}
	}

	check(val) {
		console.log('check', val);
	}

	expandedRowRender(data) {
		console.log('this.table_user_data[ind]', data);
		const columns = [
			{ title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
			{ title: 'Users', dataIndex: 'users', key: 'users' },
		];

		return (
			<Table
				columns={columns}
				dataSource={data}
				pagination={false}
			/>
		);
	};

	shouldComponentUpdate(nextProps) {
		console.log('into shouldComponentUpdate');
		console.log('table previous props', this.props);
		console.log('table current props', nextProps);
		if (!_.isEqual(this.props.searched_alerts_details, nextProps.searched_alerts_details)) {
			console.log('into shouldComponentUpdate check');
			this.tableValue(nextProps.searched_alerts_details);
			return true;
		} else {
			return false;
		}
	}

	render() {
		console.log('table props', this.props);
		return (
			<Table
				className="components-table-demo-nested"
				columns={this.columns}
				expandedRowRender={record => this.expandedRowRender(record.data)}
				dataSource={this.table_data}
				pagination={false}
			/>
		);
	}
}

export default class AutomaticAlertsDetails extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.search = '';
		if (props.location && props.location.search != '') {
			this.search = props.location.search.split('=');
			console.log('search', this.search)
		}
		this.state = {
			client_id: 365,
			application_id: 19,
			alert_id: props.match.params && props.match.params.alert_id ? props.match.params.alert_id : '',
			rule_id: props.match.params && props.match.params.rule_id ? props.match.params.rule_id : '',
			alert_detail_search: this.search && this.search.length ? this.search[1] : '',
			autoTabVisible: true,
			manualTabVisible: true,
			drawSendTemplateVisible: false,
			drawCreateTemplateVisible: false,
			groupValue: [],
			drawGroupVisible: false,
			searched_alerts_details: [],
		};
		this.getDetailsOfAutomatedAlert();
	}

	sentListShow (){
		this.setState({
			manualTabVisible: false,
		});
	};

	templateDetailsShow (){
		this.setState({
			autoTabVisible: false,
		});
	};

	showDeleteConfirm(rule) {
		document.title = 'Settings - Automatic Alerts - Delete Rule - Flood Forecasting and Early Warning System for Kolkata City';
		console.log('showDeleteConfirm', rule);
		let that = this;
		confirm({
			title: 'Do you want to delete ?',
			content: rule.role,
			onOk() {
				that.deleteRule(rule);
				document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
			},
			onCancel() {
				that.closeAddEditModal();
				document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
			}
		});
	}

	closeAddEditModal() {
		this.setState({
			role_id: '',
			drawRoleVisible: false
		});
	}

	deleteRule(rule) {
		let that = this;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + that.state.alert_id + '/rules/' + rule.id + '/delete', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			if (json.status === 'success') {
				that.getDetailsOfAutomatedAlert();
				that.openNotification('success', json.message);
			} else {
				that.openNotification('error', json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});
	}

	showAutoTemplate () {
		this.setState({
			autoTabVisible: true,
		})
	};

	backToTemplateList(type) {
		document.title = 'Settings - Automatic Alerts - Flood Forecasting and Early Warning System for Kolkata City';
		this.props.history.push('/settings/alerts/automatic/list');
	}

	showManualTemplate () {
		this.setState({
			manualTabVisible: true,
		})
	};

	showAlertDrawer () {
		this.handleCancel();
		this.props.history.push('/settings/alerts/automatic/'+ this.state.alert_id + '/rule-add/');
		document.title = 'Settings - Automatic Alerts - Assign Alert Rule - Flood Forecasting and Early Warning System for Kolkata City';
	}

	showCreateTemplateDrawer() {
		this.setState({ drawCreateTemplateVisible: true });
	}

	onChangeGroup(groupValue) {
		this.setState({ groupValue });
	}

	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};

	handleCancel() {
		document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
		this.setState({
			role_name: '',
			stationValue: '',
			rule_id: ''
		});
		this.props.history.push('/settings/alerts/automatic/'+ this.state.alert_id + '/details/');
		this.setState({
			drawCreateTemplateVisible: false,
			drawSendTemplateVisible: false,
		});
	}

	changeRole(value) {
		console.log('value', value);
		// this.setState({role_id: value});
		this.setState({role_name: value});
	}

	treeChange(value) {
		console.log('treeValue', value);
		let values = value.split('-'), stn_data= '', stn_grp_data= '';
		if (values[1] == 0) {
			stn_data = values[2];
		}
		if (values[1] == 1) {
			stn_grp_data = values[2];
		}
		this.setState({station_data: stn_data , station_group_data: stn_grp_data, stationValue: value})
		// console.log('treeChange', values);
		// console.log('stn_data', stn_data);
		// console.log('stationValue', value);
		// console.log('stn_grp_data', stn_grp_data);
	}

	getDetailsOfAutomatedAlert() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + that.state.alert_id + '/details', {
			method: 'GET',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated Alert Details', json);
			if (json.status === 'success') {
				stationData = [];
				if (json.station_list && json.station_list.length) {
					let stn_lst = [];
					json.station_list.map((st) => {
						stn_lst.push({
							title: st.name,
							value: '0-0-' + st.id,
							key: '0-0-' + st.id
						});
					});
					stationData.push({
						'title': 'Stations',
						'value': '0-0',
						'key': '0-0',
						'children': stn_lst
					});
				}

				if (json.station_group_list && json.station_group_list.length) {
					let stn_grp = [];
					json.station_group_list.map((st_grp) => {
						stn_grp.push({
							title: st_grp.name,
							value: '0-1-' + st_grp.id,
							key: '0-1-' + st_grp.id
						});
					});
					stationData.push({
						'title': 'Station groups',
						'value': '0-1',
						'key': '0-1',
						'children': stn_grp
					});
				}
				that.setState({
					alert_details: json.alert_details,
					station_group_list: json.station_group_list,
					station_list: json.station_list,
					user_list: json.user_list,
					roles_list: json.roles_list,
				}, () => {that.searchDetails(that.state.alert_detail_search)});
				console.log('stationData', stationData);
				console.log('alert_detail_search' , that.state.alert_detail_search);
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

	searchDetails(value) {
		console.log('in searchDetails function', value);
		let searched_alerts_details = [];
		let query_string = '';
		if (value == '') {
			query_string= '';
		} else {
			query_string= '?search=' + value;
		}
		if (this.state.alert_details && this.state.alert_details.rules && this.state.alert_details.rules.length && value) {
			this.state.alert_details.rules.map((rule,index) => {
				let role_name = _.find(this.state.roles_list, { 'id': rule.role_id }).name;
				let station_name = rule.station > 0 && rule.station != null ? _.find(this.state.station_list, { 'id': rule.station }).name : '';
				let station_group_name = rule.station_groups > 0 && rule.station_groups != null ? _.find(this.state.station_group_list, { 'id': rule.station_groups }).name : '';
				let station_status = rule.status == 1 ? 'on' : 'off';
				let user_names = '';
				if (rule.users && rule.users.length) {
					rule.users.map((usr, i) => {
						user_names += _.find(this.state.user_list, { 'id': usr }).name;
					});
				}
				if (value != '' && (role_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || station_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || station_group_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || station_status.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || user_names.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					searched_alerts_details.push(rule);
				}
			});
		} else if (this.state.alert_details && this.state.alert_details.rules && this.state.alert_details.rules.length && value == '') {
			searched_alerts_details = this.state.alert_details.rules.slice(0);
		}
		this.setState({
			alert_detail_search: decodeURI(encodeURI(value)),
			searched_alerts_details: searched_alerts_details
		},() => {
			if (this.props.location.pathname && ( (this.props.location.pathname.search('/rule-add/') < 0) && (this.props.location.pathname.search('/edit/') < 0))) {
				this.props.history.push('/settings/alerts/automatic/' + this.state.alert_id +'/details/' + query_string);
			}
			if (this.state.rule_id) {
				this.editAlertRole(this.state.rule_id);
			}
			console.log('searched_alerts_details', this.state.searched_alerts_details);
		});
	}

	componentDidMount() {
		document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
		this.searchDetails(this.state.alert_detail_search);
	}

	addNewRule() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + that.state.alert_id + '/rules/new', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				role_id: _.find(that.state.roles_list, {'name': that.state.role_name}).id,
				stations: that.state.station_data,
				station_groups: that.state.station_group_data
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated Alert Details', json);
			if (json.status === 'success') {
				that.setState({
					loading: false,
				}, () => {
					that.getDetailsOfAutomatedAlert();
					that.props.history.push('/settings/alerts/automatic/' + that.state.alert_id +'/details/');
					document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
				});
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

	editAlertRole(value) {
		if (this.state.searched_alerts_details && this.state.searched_alerts_details.length) {
			console.log('edit_value', value);
			let stationValue = '',role_name='',rule_id='';
			let data = _.find(this.state.searched_alerts_details, {id: parseInt(value)});
			console.log('datus', data);
			console.log('datu1', this.state.searched_alerts_details);
			if (data.station > 0) {
				stationValue= '0-0-' + data.station
			}
			if (data.station_groups > 0) {
				stationValue= '0-1-' + data.station_groups
			}
			role_name = _.find(this.state.roles_list, {id: data.role_id}).name;
			rule_id = value;
			this.setState({
				role_name: role_name,
				stationValue: stationValue,
				rule_id: rule_id
			});
			this.props.history.push('/settings/alerts/automatic/' + this.state.alert_id +'/rule/' + rule_id + '/edit/');
			document.title = 'Settings - Automatic Alerts - Modify Alert Rule - Flood Forecasting and Early Warning System for Kolkata City';
			// console.log('aaaaaa', value);
		}
	}

	editRule() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + that.state.alert_id + '/rules/' + this.state.rule_id + '/edit/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				role_id: _.find(that.state.roles_list, {'name': that.state.role_name}).id,
				stations: that.state.station_data,
				station_groups: that.state.station_group_data
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated Alert Details', json);
			if (json.status === 'success') {
				that.setState({
					loading: false,
					rule_id: null,
				}, () => {
					that.props.history.push('/settings/alerts/automatic/' + that.state.alert_id +'/details/');
					that.getDetailsOfAutomatedAlert();
					document.title = 'Settings - Automatic Alerts - Details - Flood Forecasting and Early Warning System for Kolkata City';
				});
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

	changeStatus(value) {
		console.log('value', value.id);
		console.log('value', value.status);
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + that.state.alert_id + '/rules/' + value.id + '/set_status/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				status: value.status ? 0 : 1,
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated Alert Details', json);
			if (json.status === 'success') {
				that.setState({
					loading: false,
				}, () => {
					// that.props.history.push('/settings/alerts/automatic/' + that.state.alert_id +'/details/');
					that.getDetailsOfAutomatedAlert();
				});
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

	render () {
		return (
			<div className="automatic">
				{/*<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>*/}
				{(() => {
					if (this.state.alert_details) {
						return <div>
							<div className="table-search">
								<Input placeholder="Search by User with, Station / Station Group, Status(on/off)" prefix={<Icon type="search" />} value={this.state.alert_detail_search} onChange={(e) => this.searchDetails(e.target.value)} />
							</div>
							<div className="add-btn"><Button type="primary" icon="arrow-left" onClick={() => this.backToTemplateList()}>Back to Template</Button></div>
							<Row>
								<div className="show-container">
									<span>{this.state.alert_details.name}</span>
									<div className="add-btn pad-bot-15"><Button type="primary" icon="plus" onClick={() => this.showAlertDrawer()}>Assign New Users</Button></div>
								</div>
							</Row>
							<Row>
								{(() => {
									if (this.state.searched_alerts_details && this.state.searched_alerts_details.length ) {
										return <AlertTable
											editAlertRole ={(e) => {this.editAlertRole(e)}}
											searched_alerts_details={this.state.searched_alerts_details}
											user_list={this.state.user_list}
											station_group_list= {this.state.station_group_list}
											station_list= {this.state.station_list}
											roles_list={this.state.roles_list}
											showDeleteConfirm={(e) => this.showDeleteConfirm(e)}
											changeStatus={(e) => this.changeStatus(e)}
										/>;

									} else if (this.state.alert_detail_search && this.state.alert_detail_search != null && this.state.alert_detail_search != '' && this.state.searched_alerts_details && this.state.searched_alerts_details.length == 0 && this.state.alert_details && this.state.alert_details.rules && this.state.alert_details.rules.length > 0) {
										return <div className="no-data-text">No Alert Roles Found.</div>;
									} else if (this.state.alert_details.rules && this.state.alert_details.rules.length === 0) {
										return <div className="no-data-text">No Alert Roles Available.</div>;
									} else {
										return <Loading  is_inline={true} />;
									}
								})()}
							</Row>
							{(() => {
								if (this.props.location.pathname && (this.props.location.pathname.search('/rule-add/') > -1) || (this.props.location.pathname.search('/edit/') > -1)) {
									return <AlertForm 
										visible={true}
										pathName={this.props.location.pathname}
										stationValue= {this.state.stationValue}
										role_name= {this.state.role_name}
										station_list={this.state.station_list}
										station_group_list={this.state.station_group_list}
										user_list={this.state.user_list}
										roles_list={this.state.roles_list}
										changeRole={(e) => this.changeRole(e)}
										treeChange={(e) => this.treeChange(e)}
										onCancel={() => {this.handleCancel()}}
										onEdit={() => {this.editRule()}}
										onSubmit={() => {this.addNewRule()}}
									/>;
								}
							})()}
						</div>;
					}
				})()}
			</div>
		);
	}
}