import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown, List, Tag, Checkbox, Radio } from 'antd';
import Head from './Head';
import Side from './Side';
import Loading from './Loading';
import moment from 'moment-timezone';
const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Content } = Layout;

const { Option } = Select;

const FormItem = Form.Item;

const CheckboxGroup = Checkbox.Group;

const confirm = Modal.confirm;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const options = [
	{ label: 'Email', value: 'emails' },
	{ label: 'Web App', value: 'webapp' },
];

const SendTemplateForm = Form.create()(
	class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				valueUser: [],
				valueStation: [],
			};
		}

		onChangeUser(valueUser) {
			this.setState({ valueUser });
		}

		onChangeStation(valueStation) {
			this.setState({ valueStation });
		}

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const tProps = {
				treeData: userGroupData,
				value: this.state.valueUser,
				onChange: this.onChangeUser,
				treeCheckable: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user group',
			};

			const tProps1 = {
				treeData: stationData,
				value: this.state.valueStation,
				onChange: this.onChangeStation,
				treeCheckable: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select station / station group',
			};
			return (
				<div id="send_drawer">
					<Drawer
						title="Template-1"
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
									<Form.Item label="">
										<span>Some text</span>
										{getFieldDecorator('text1', {
											rules: [{ required: true, message: 'Please enter' }],
										})(<Input placeholder="Please enter" className="input-box" />)}
									
										<span>Some text</span>
										{getFieldDecorator('text2', {
											rules: [{ required: true, message: 'Please enter' }],
										})(<Input placeholder="Please enter" className="input-box" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={23}>
									<Form.Item label="" className="draw-formItem">
										<Radio className="radio-draw">User groups</Radio>
										{getFieldDecorator('usergroup', {
											rules: [{ required: true, message: 'Please select user group' }],
										})(
											<TreeSelect showSearch treeDefaultExpandAll {...tProps} className="draw-select" />
										)}
									</Form.Item>
								</Col>
						 </Row>
						 <Row gutter={16} className="top-section">
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
						 </Row>
						 <Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Notify by" className="draw-formItem">
										{getFieldDecorator('notify', {
											rules: [{ required: true, message: 'Please select an option' }],
										})(
											<CheckboxGroup options={options} defaultValue={['emails']} />
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
							<Button onClick={onCancel} type="primary">Send</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

const SentListTable = class extends React.Component {
	constructor(props) {
		super(props);
		this.tableValue(props.template_details);
	}

	tableValue(template_details) {
		this.columns = [
			{
				title: 'Date',
				dataIndex: 'date',
				width: 180,
				sorter: (a, b) => a.date.length - b.date.length,
			}, {
				title: 'Message',
				dataIndex: 'message',
				width: 550,
			}, {
				title: 'Sent By',
				dataIndex: 'sent_by',
			}, {
				title: 'User Count',
				dataIndex: 'user_count',
			}
		];

		const columns = [
			{ title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
			{ title: 'Users', dataIndex: 'users', key: 'users' },
		];
		console.log('template_details', template_details);
		if (template_details && template_details.sent_list && template_details.sent_list.length) {
			this.table_data = [];
			this.table_user_data = [];
			let template_name = template_details.name;
			template_details.sent_list.map((list, ind) => {
				this.table_user_data[ind] = [];
				if (list.time != null && list.time > 0) {
					let send_by = _.find(this.props.users_list, { 'id': list.send_by }).name;
					if (list.users && list.users.length) {
						let count = 0;
						list.users.map((usr, i) => {
							if (_.some(this.props.users_list, { 'id': usr })) {
								count++;
								let user_name = _.find(this.props.users_list, { 'id': usr }).name,
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
						date: moment.unix(list.time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
						message: list.message,
						sent_by: send_by,
						user_count: list.users ? list.users.length : 0,
						data: this.table_user_data[ind]
					})
				}
			});
		}
	}

	expandedRowRender(data) {
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
		// console.log('into shouldComponentUpdate');
		// console.log('table previous props', this.props);
		// console.log('table current props', nextProps);
		if (!_.isEqual(this.props.searched_alerts_details, nextProps.searched_alerts_details)) {
			// console.log('into shouldComponentUpdate check');
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
				// expandedRowRender={record => <p style={{ margin: 0 }}>{record.data}</p>}
				expandedRowRender={record => this.expandedRowRender(record.data)}
				dataSource={this.table_data}
				pagination={false}
			/>
		);
	}
}

const AllSentListTable = class extends React.Component {
	constructor(props) {
		super(props);
		this.tableValue(props.all_templates);
		console.log('AllSentListTable_all_templates', props.all_templates);
	}

	tableValue(template_details) {
		this.columns = [
			{
				title: 'Date',
				dataIndex: 'date',
				width: 180,
				sorter: (a, b) => a.date.length - b.date.length,
			}, {
				title: 'Template name',
				dataIndex: 'template_name',
			}, {
				title: 'Message',
				dataIndex: 'message',
				width: 550,
			}, {
				title: 'Sent By',
				dataIndex: 'sent_by',
			}, {
				title: 'User Count',
				dataIndex: 'user_count',
			}
		];

		const columns = [
			{ title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
			{ title: 'Users', dataIndex: 'users', key: 'users' },
		];
		console.log('AllSentListTable_template_details', template_details);
		if (template_details && template_details.length) {
			this.table_data = [];
			this.table_user_data = [];
			template_details.map((template, index) => {
				let template_name = template.name;
				if (template.sent_list && template.sent_list.length) {
					template.sent_list.map((list, inde) => {
						this.table_user_data[inde] = [];
						let send_by = _.find(this.props.users_list, { 'id': list.send_by }).name;
						if (list.users && list.users.length) {
							let count = 0;
							list.users.map((usr, i) => {
								if (_.some(this.props.users_list, { 'id': usr })) {
									count++;
									let user_name = _.find(this.props.users_list, { 'id': usr }).name,
										data = {
											key: i+1,
											slno: count,
											users: user_name,
										};
									this.table_user_data[inde].push(data);
								}
							});
						}
						this.table_data.push({
							date: moment.unix(list.time).tz("Asia/Kolkata").format('HH:mm, DD MMM'),
							template_name: template_name,
							message: list.message,
							sent_by: send_by,
							user_count: list.users ? list.users.length : 0,
							data: this.table_user_data[inde]
						})
						// console.log('AllSentListTable_table_user_data', this.table_user_data);
					});
				}
			});
		}
	}

	expandedRowRender(data) {
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
		console.log('AllSentListTable_into shouldComponentUpdate');
		console.log('AllSentListTable_table previous props', this.props);
		console.log('AllSentListTable_table current props', nextProps);
		if (!_.isEqual(this.props.all_templates, nextProps.all_templates)) {
			console.log('AllSentListTable_into shouldComponentUpdate check');
			this.tableValue(nextProps.all_templates);
			return true;
		} else {
			console.log('AllSentListTable_not_updated');
			return false;
		}
	}

	render() {
		console.log('AllSentListTable_table props', this.props);
		return (
			<Table
				className="components-table-demo-nested"
				columns={this.columns}
				// expandedRowRender={record => <p style={{ margin: 0 }}>{record.data}</p>}
				expandedRowRender={record => this.expandedRowRender(record.data)}
				dataSource={this.table_data}
				pagination={false}
			/>
		);
	}
}

export default class ManualSentList extends React.Component {
	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		let parsed = queryString.parse(props.location.search);
		// console.log('parsed', parsed);
		this.search = '';
		this.query_string = '';
		this.parseURL(parsed);
		let template_id = parsed['template-id'] ? JSON.parse(parsed['template-id']) : [];
		let initial_template_value = [];
		// if (parsed.search && parsed.search != '') {
		// 	this.search = parsed.search;
		// }
		// if (parsed.template-id && parsed.template-id != '') {
		// 	this.query_string = '?template-id=' + parsed.template-id;
		// }
		if (template_id && template_id.length) {
			if (template_id.length !== props.all_template_id) {
				initial_template_value = [];
				template_id.map((temp_id) => {
					if (initial_template_value.includes('0-0-' + temp_id) === false) initial_template_value.push('0-0-' + temp_id);
				});
			} else {
				// if (this.props.all_template_id && this.props.all_template_id.length) {
				// 	initial_template_value = ['0-0'];
				// }
			}
		} else {
			/*if (this.props.all_template_id && this.props.all_template_id.length) {
				initial_template_value = ['0-0'];
			}*/
			
		}
		this.state = {
			client_id: 365,
			application_id: 19,
			manual_template_sent_list_search: this.search,
			autoTabVisible: true,
			manualTabVisible: true,
			drawAlertVisible: false,
			drawSendTemplateVisible: false,
			drawCreateTemplateVisible: false,
			groupValue: initial_template_value,
			drawGroupVisible: false,
		};
		// console.log('hello_hii', this.state.groupValue);
		// console.log('hello_hii_11', this.props.groupFilter);
		if (!parsed['template-id']) {
			// console.log('all');
			this.getAllSentListOfManualAlert();
		}
		if (parsed['template-id'] && parsed['template-id'] != '') {
			// console.log('single');
			this.getSentListOfManualAlert(parsed['template-id']);
		}
	}

	parseURL(parsed) {
		if (parsed.search && parsed.search != '') {
			this.search = parsed.search;
		}
		if (parsed['template-id'] && parsed['template-id'] != '') {
			this.query_string = '?template-id=' + parsed['template-id'];
		}
	}

	sentListShow (){
		this.setState({
			manualTabVisible: false,
		});
	};

	showManualTemplate () {
		this.props.clearSearchState();
		this.props.history.push('/settings/alerts/manual/templates/list/');
		document.title = 'Settings - Manual Alert Templates - Flood Forecasting and Early Warning System for Kolkata City';
	};

	showSendDrawer() {
		this.setState({ drawSendTemplateVisible: true });
	}

	showCreateTemplateDrawer() {
		this.setState({ drawCreateTemplateVisible: true });
	}

	onTreeSelect(val, label, extra) {
		// console.log('val', val);
		// console.log('label', label);
		// console.log('extra', extra);
		let that = this;
		let value = that.state.value,
			sub_cat = that.state.sub_category_selected_display;
		if (extra.triggerValue.split('-').length == 2 && extra.triggerValue.split('-')[1] != 21) {
			value = val;
			let category_id = extra.triggerValue.split('-')[1];
		} else if (extra.triggerValue.split('-').length == 3 && extra.triggerValue.split('-')[2] <30) {
			let status = false;
			let category_id = extra.triggerValue.split('-')[1];
			let sub_category_id = extra.triggerValue.split('-')[2];
			value = val;
		}
		// console.log('hello_hii_2', this.state.groupValue);
		// console.log('hello_hii_12', this.props.groupFilter);
		that.setState({
			groupValue: value,
			// station_id: ''
		},() => {
			// console.log('hello_hii_3', this.state.groupValue);
			// console.log('hello_hii_4', this.props.groupFilter);
			if (this.state.groupValue && this.state.groupValue.length) {
				let group_array = [];
				this.state.groupValue.map((group, ind) => {
					let id = group.split('-');
					if (id && id.length == 3) {
						if (group_array.includes(id[2]) === false) group_array.push(parseInt(id[2]));
						// console.log('group', group);
						this.modifyURL('template-id', group_array);
						// this.props.history.push('/settings/alerts/manual/templates/sent-list/');
					} else {
						if (id && id.length == 2) {
							group_array = this.props.all_template_id;
							this.modifyURL('template-id', group_array);
							// this.props.history.push('/settings/alerts/manual/templates/sent-list/');
						}
					}
				});
				this.getSentListOfManualAlert(JSON.stringify(group_array));
				// console.log('group_array', group_array);
			} else {
				this.getAllSentListOfManualAlert();
				this.modifyURL('template-id', []);
			}
			/*that.props.history.push('');
			if (that.state.search_station != '') {
				that.props.history.push(that.props.location.search);
			}*/
			// that.showList();
			// console.log('groupValue', this.state.groupValue);
			// console.log('hello_hii_4', this.state.groupValue);
			// console.log('hello_hii_14', this.props.groupFilter);
		});
	}

	modifyURL(key, value) {
		// console.log('value', value);
		if (key == 'template-id' && value.length && value.length !== this.props.all_template_id.length) {
			if (this.state.manual_template_sent_list_search && this.state.manual_template_sent_list_search != '') {
				this.props.history.push('/settings/alerts/manual/templates/sent-list/' + '?template-id=' + JSON.stringify(value) + '&search=' + this.state.manual_template_sent_list_search);
			} else {
				this.props.history.push('/settings/alerts/manual/templates/sent-list/' + '?template-id=' + JSON.stringify(value));
			}
			this.query_string = '?template-id=' + JSON.stringify(value);
		} else {
			if (this.state.manual_template_sent_list_search && this.state.manual_template_sent_list_search != '') {
				this.props.history.push('/settings/alerts/manual/templates/sent-list/' + '?search=' + this.state.manual_template_sent_list_search);
			} else {
				this.props.history.push('/settings/alerts/manual/templates/sent-list/');
			}
			this.query_string = '';
		}
	}

	onChangeGroup(groupValue) {
		// this.setState({ groupValue });
	}

	stopDefault (e) {}

	handleCancel() {
		this.setState({ 
			drawAlertVisible: false,
			drawCreateTemplateVisible: false,
			drawSendTemplateVisible: false,
		});
	}

	getSentListOfManualAlert(template_id) {
		// console.log('template_id', template_id ? JSON.parse(template_id): '' );
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/manual/templates/sent_list/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify({
				template_ids: JSON.parse(template_id)
			})
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Manual Template Details', json);
			if (json.status === 'success') {
				that.setState({
					template_details: json.template_details,
					users_list: json.users_list
				}, () => {that.searchTemplateSentList(that.state.manual_template_sent_list_search)});
				console.log('manual_template_sent_list_search' , that.state.manual_template_sent_list_search);
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

	getAllSentListOfManualAlert() {
		let that = this;
		that.setState({
			loading: true
		});
		fetch('##PR_STRING_REPLACE_USERS_API_BASE_PATH##/clients/' + that.state.client_id + '/applications/' + that.state.application_id + '/alerts/manual/templates/sent_list/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include',
			// body: JSON.stringify({
			// 	template_ids: [1]
			// })
		}).then(function(Response) {
			return Response.json();
		}).then(function(json) {
			console.log('Manual Template Details', json);
			if (json.status === 'success') {
				that.setState({
					template_details: json.template_details,
					users_list: json.users_list
				}, () => {that.searchTemplateSentList(that.state.manual_template_sent_list_search)});
				console.log('manual_template_sent_list_search' , that.state.manual_template_sent_list_search);
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

	searchTemplateSentList(value) {
		console.log('in search Template list function', value);
		let searched_templates_sent_list = [];
		let query_string = this.query_string;
		// console.log('query_string', query_string);
		// console.log('manual_template_sent_list_search', this.state.manual_template_sent_list_search);
		if (value == '') {
			query_string= this.query_string;
		} else {
			if (!this.props.location.search.includes('template-id')) {
				query_string += '?search=' + value;
			} else {
				query_string += '&search=' + value;
			}
		}
		// console.log('enterd template_details', this.state.template_details);
		// console.log('enterd sent_list', this.state.template_details.sent_list);
		if (this.state.template_details && this.state.template_details.length && value) {
			this.state.template_details.map((temp,index) => {
				// console.log('enterd if');
				// console.log('send_by', send_by);
				if (temp.sent_list && temp.sent_list.length) {
					temp.sent_list.map((sent, ind) => {
						let send_by = _.find(this.state.users_list, { 'id': sent.send_by }).name;
						let user_names = '';
						if (sent.users && sent.users.length) {
							sent.users.map((usr, i) => {
								user_names += _.find(this.state.users_list, { 'id': usr }).name;
								// if (value != '' && (temp.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || send_by.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || sent.message.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || user_name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) )) {
								// 	searched_templates_sent_list.push(temp);
								// }
							});
						}
						if (value != '' && (temp.name.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || send_by.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || sent.message.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) || user_names.toLowerCase().includes(decodeURI(encodeURI(value.toLowerCase()))) )) {
							searched_templates_sent_list.push(temp);
						}

					});
				}
			});
		} else if (this.state.template_details && this.state.template_details.length && value == '') {
			searched_templates_sent_list = this.state.template_details.slice(0);
			// console.log('enterd else if');
		}
		this.setState({
			manual_template_sent_list_search: decodeURI(encodeURI(value)),
			searched_templates_sent_list: searched_templates_sent_list
		},() => {
			console.log('before push');
			this.props.history.push('/settings/alerts/manual/templates/sent-list/' + query_string);
			console.log('searched_templates_sent_list', this.state.searched_templates_sent_list);
		});
	}

	componentDidMount() {
		document.title = 'Settings - Manual Alert Templates - Sent List - Flood Forecasting and Early Warning System for Kolkata City';
		let parsed = queryString.parse(this.props.location.search);
		console.log('parsed', parsed);
		this.parseURL(parsed);
		// this.searchTemplateSentList(this.state.manual_template_sent_list_search)
	}

	render () {
		const groupProps = {
			treeData: this.props.groupFilter,
			value: this.state.groupValue,
			/*onChange: this.onChangeGroup,*/
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Filter',
		};

		return (
			<div className="manual">
				{(() => {
					if (this.props.groupFilter) {
						return <div>
							<div className="table-filter"><TreeSelect onChange={(val, label, extra) => {this.onTreeSelect(val, label, extra)}} treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
							<div className="table-search">
								<Input placeholder="Search by Message, Sender, User names" prefix={<Icon type="search" />} value={this.state.manual_template_sent_list_search} onChange={(e) => this.searchTemplateSentList(e.target.value)} />
							</div>
							<div className="add-btn"><Button type="primary" icon="arrow-left" onClick={() => this.showManualTemplate()}>Back to Template</Button></div>
							{(() => {
								if (this.state.searched_templates_sent_list && this.state.searched_templates_sent_list.length) {
									if (this.state.groupValue && this.state.groupValue.length == 1 && !this.state.groupValue.includes('0-0')) {
										let template_list = this.state.searched_templates_sent_list.map((template, ind) => {
											return <div>
												<Row>
													<div className="show-container">{template.name}</div>
												</Row>
												<Row>
													<SentListTable
														template_details= {template}
														users_list={this.state.users_list}
													/>
												</Row>
											</div>;
										});
										return template_list;
									} else {
										// let templates_array = [];
										// let templates_list = this.state.searched_templates_sent_list.map((template, ind) => {
										// 	templates_array.push(template);
										// });
										return <Row>
											<AllSentListTable
												all_templates= {this.state.searched_templates_sent_list}
												users_list={this.state.users_list}
											/>
										</Row>;
									}
								} else if (this.state.manual_template_sent_list_search && this.state.manual_template_sent_list_search != null && this.state.manual_template_sent_list_search != '' && this.state.searched_templates_sent_list && this.state.searched_templates_sent_list.length == 0 && this.state.template_details && this.state.template_details.length > 0) {
									return <div className="no-data-text">No Sent List For Template Found.</div>;
								} else if (this.state.template_details && this.state.template_details.length === 0) {
									return <div className="no-data-text">No Sent List For Template Available.</div>;
								} else {
									return <Loading  is_inline={true} />;
								}
							})()}
						</div>;
					}
				})()}
			</div>
		);
	}
}