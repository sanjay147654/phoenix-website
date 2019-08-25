import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown, List, Tag, Checkbox, Radio, notification, Alert } from 'antd';
import Head from './imports/Head';
import Side from './imports/Side';
import moment from 'moment-timezone';
import Loading from './imports/Loading';
import AutomaticAlertsDetails from './imports/AutomaticAlertsDetails';

const TabPane = Tabs.TabPane;

const { Content } = Layout;

const { Option } = Select;

const FormItem = Form.Item;

const CheckboxGroup = Checkbox.Group;

const confirm = Modal.confirm;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;


export default class AutomaticAlerts extends React.Component {

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
			alert_search: this.search && this.search.length ? this.search[1] : '',
			autoTabVisible: true,
			manualTabVisible: true,
			drawAlertVisible: false,
			drawSendTemplateVisible: false,
			drawCreateTemplateVisible: false,
			groupValue: [],
			drawGroupVisible: false,
			/*template_list: [
				{
					'id': 1,
					'name': 'Template 1',
					'description': 'This is a description-1',
					'station_count': 10,
					'user_count': 20,
					'status': 1
				},{
					'id': 2,
					'name': 'Template 2',
					'description': 'This is a description-2',
					'station_count': 12,
					'user_count': 22,
					'status': 0
				},{
					'id': 3,
					'name': 'Template 3',
					'description': 'This is a description-3',
					'station_count': 13,
					'user_count': 23,
					'status': 1
				},{
					'id': 4,
					'name': 'Template 4',
					'description': 'This is a description-4',
					'station_count': 14,
					'user_count': 24,
					'status': 1
				},{
					'id': 5,
					'name': 'Template 5',
					'description': 'This is a description-5',
					'station_count': 14,
					'user_count': 24,
					'status': 1
				},{
					'id': 6,
					'name': 'Template 6',
					'description': 'This is a description-6',
					'station_count': 16,
					'user_count': 26,
					'status': 1
				}
			]*/
		};
		this.getAutomatedAlertsList();
	}

	sentListShow (){
		this.setState({
			manualTabVisible: false,
		});
	};

	templateDetailsShow(id) {
		this.props.history.push('/settings/alerts/automatic/' + id + '/details/');
		this.setState({
			alert_id: id,
			autoTabVisible: false,
			alert_search: ''
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

	showSendDrawer() {
		this.setState({ drawSendTemplateVisible: true });
	}

	showCreateTemplateDrawer() {
		this.setState({ drawCreateTemplateVisible: true });
	}

	onChangeGroup(groupValue) {
		this.setState({ groupValue });
	}

	changeAlertType(type) {
		if (type == 'automatic') {
			this.props.history.push('/settings/alerts/automatic/list/');
		} else {
			this.props.history.push('/settings/alerts/manual/templates/list/');
		}
	}

	stopDefault (e) {}

	handleCancel() {
		this.setState({ 
			drawAlertVisible: false,
			drawCreateTemplateVisible: false,
			drawSendTemplateVisible: false,
		});
	}

	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};

	changeStatus(id, value) {
		let that = this;
		that.setState({
			btn_loading: true
		});
		let temp_data = that.state.template_list;
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/' + id + '/set_status', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				status: value ? 1 : 0,
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated List status', json);
			if (json.status === 'success') {
				if (_.some(temp_data, { 'id': id })) {
					let data = _.findIndex(that.state.template_list, { 'id': id });
					temp_data[data].status = value ? 1 : 0;
					that.setState({
						template_list: temp_data,
						loading_id: id,
						btn_loading: false
					});
				}
				that.openNotification('success', json.message);
			} else {
				that.setState({
					btn_loading: false
				});
				that.openNotification('error', json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.setState({
				btn_loading: false
			});
			that.openNotification('error', 'Unable to load data!');
		});
	}

	// changeStatus(id, value) {
	// 	let temp_data = this.state.template_list;
	// 	this.setState({btn_loading: true});
	// 	if (_.some(temp_data, { 'id': id })) {
	// 		let data = _.findIndex(this.state.template_list, { 'id': id });
	// 		temp_data[data].status = value ? 1 : 0;
	// 		this.setState({
	// 			template_list: temp_data,
	// 			loading_id: id,
	// 			btn_loading: true
	// 		});
	// 	}
	// 	console.log('aaa', value);

	// }

	getAutomatedAlertsList() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/automatic/list', {
			method: 'GET',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			// body: JSON.stringify({
			// 	id: that.props.station_id,
			// })
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Automated List', json);
			if (json.status === 'success') {
				that.setState({
					template_list: json.template_list,
					loading: false
				}, () => {that.searchAlert(that.state.alert_search)} );
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

	searchAlert(value) {
		console.log('in searchAlert function', value);
		let check_value = '%20';
		if (value.includes(check_value)) {
			let val = value.replace(check_value, ' ');
			value = val;
		}
		let searched_alerts = [];
		let query_string = '';
		if (value == '') {
			query_string= '';
		} else {
			query_string= '?search=' + value;
		}
		if (this.state.template_list && this.state.template_list.length && value) {
			this.state.template_list.map((alert,index) => {
				if (value != '' && (alert.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))))) {
					searched_alerts.push(alert);
				}
			});
		} else if (this.state.template_list && this.state.template_list.length && value == '') {
			searched_alerts = this.state.template_list.slice(0);
		}
		this.setState({
			alert_search: decodeURI(encodeURI(value)),
			searched_alerts: searched_alerts
		},() => {
			if (this.props.location.pathname && ((this.props.location.pathname.search('/details/') < 0) && (this.props.location.pathname.search('/rule-add/') < 0) && (this.props.location.pathname.search('/edit/') < 0))) {
				this.props.history.push('/settings/alerts/automatic/list/' + query_string);
			}
			console.log('searched_alerts', this.state.searched_alerts);
		});
	}

	componentDidMount() {
		document.title = 'Settings - Autometic Alerts - Flood Forecasting and Early Warning System for Kolkata City';
		this.searchAlert(this.state.alert_search);
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
												<div role="tab" aria-disabled="false" aria-selected="true" className="alerts-tabs alerts-tabs-tab alerts-tabs-tab-active" onClick={() => this.changeAlertType('automatic')}>Automatic</div>
												<div role="tab" aria-disabled="false" aria-selected="false" className="alerts-tabs alerts-tabs-tab" onClick={() => this.changeAlertType('manual')}>Manual</div>
											</div>
												<div className="blank-border"></div>
										</div>
									</div>
								</div>
								<div className="station-view">
									{(() => {
										if (this.props.location.pathname && ((this.props.location.pathname.search('/details/') > -1) || (this.props.location.pathname.search('/rule-add/') > -1) || (this.props.location.pathname.search('/edit/') > -1) )) {
											console.log('Autometic Alerts Details');
											return <AutomaticAlertsDetails  {...this.props} {...this.state}/>;
										} else {
											console.log('Autometic Alerts List');
											return <div> 
												<div className="table-search auto-tab-search">
													<Input placeholder="Search by Alert Name" prefix={<Icon type="search" />} value={this.state.alert_search} onChange={(e) => this.searchAlert(e.target.value)}/>
												</div>
												{(() => {
													if (this.state.searched_alerts && this.state.searched_alerts.length) {
														return <Card title="" bordered={false}>
															{(() => {
																let templates = this.state.searched_alerts.map((template, ind) => {
																	return <Card.Grid className="grid-style" key={ind}>
																		<Row type="flex" justify="space-between">
																			<Col className="alert-name click" span={4} onClick={() => this.templateDetailsShow(template.id)}>{template.name}</Col>
																			<Col className="text-c" span={10}>
																				<Popconfirm className="info-msg" title={template.description} icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
																					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
																				</Popconfirm>
																				<span>
																					<span>{template.station_count + ' '}</span>Stations
																					<Divider className="divider" type="vertical" />
																					<span>{template.user_count + ' '}</span>Users
																				</span>
																			</Col>
																			<Col className="text-r" span="4">
																				<Switch loading={/*this.state.btn_loading ? true : false*/ false} checked={template.status == 1 ? true : false} size="small" onChange={(e) => this.changeStatus(template.id, e)}/>
																			</Col>
																		</Row>
																	</Card.Grid>;
																});
																return templates;
															})()}
														</Card>;
													} else if (this.state.alert_search && this.state.alert_search != null && this.state.alert_search != '' && this.state.searched_alerts && this.state.searched_alerts.length == 0 && this.state.template_list && this.state.template_list.length > 0) {
														return <div className="no-data-text">Alerts Not Found.</div>;
													} else if (this.state.template_list && this.state.template_list.length === 0) {
														return <div className="no-data-text">No Alerts Available.</div>;
													} else {
														return <Loading  is_inline={true} />;
													}
												})()}
											</div>;
											// return <Loading iniline={true} />;
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