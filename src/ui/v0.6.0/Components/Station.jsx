import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';

const TabPane = Tabs.TabPane;

const { Option } = Select;

const confirm = Modal.confirm;

function showConfirm() {
  confirm({
    title: 'Do you want to delete ?',
    content: '',
    onOk() {},
    onCancel() {},
  });
}

const menu = (
  <Menu>
    <Menu.Item key="action-1">Edit</Menu.Item>
    <Menu.Item key="action-2">Delete</Menu.Item>
  </Menu>
);

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_PARENT1 = TreeSelect.SHOW_PARENT;

const data = [
	{
		key: '1',
		serial: '1',
		name: 'Station one',
		category: 'Flood Station'
	}, {
		key: '2',
		serial: '2',
		name: 'Station two',
		category: 'Pumping Station'
	}, {
		key: '3',
		serial: '3',
		name: 'Station three',
		category: 'Street'
}, {
		key: '4',
		serial: '4',
		name: 'Station four',
		category: 'Pollution Monitoring'
}];

const { Content } = Layout;

const SetLimitForm = Form.create()(
	class extends React.Component {
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
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Parameters">
										<Input className="font-color" defaultValue="Sump" disabled={true} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="Limit">
										{getFieldDecorator('limit', {
											rules: [{ required: true, message: 'Please enter limit' }],
										})(<Input placeholder="Please enter limit" addonAfter="Unit" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item>
										<Input className="font-color" defaultValue="Penstock" disabled={true} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item>
										{getFieldDecorator('limit', {
											rules: [{ required: true, message: 'Please enter limit' }],
										})(<Input placeholder="Please enter limit" addonAfter="Unit" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="">
										<Input className="font-color" defaultValue="Rainfall" disabled={true} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="">
										{getFieldDecorator('limit', {
											rules: [{ required: true, message: 'Please enter limit' }],
										})(<Input placeholder="Please enter limit" addonAfter="Unit" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="">
										<Input className="font-color" defaultValue="Parameter-4" disabled={true} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="">
										{getFieldDecorator('limit', {
											rules: [{ required: true, message: 'Please enter limit' }],
										})(<Input placeholder="Please enter limit" addonAfter="Unit" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="">
										<Input className="font-color" defaultValue="Parameter-5" disabled={true} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="">
										{getFieldDecorator('limit', {
											rules: [{ required: true, message: 'Please enter limit' }],
										})(<Input placeholder="Please enter limit" addonAfter="Unit" />)}
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
							<Button onClick={onCancel} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);


const StationGroupForm = Form.create()(
	class extends React.Component {

		state = {
	    stationValue: [],
	  }

	  onChange = (value) => {
	    this.setState({ value });
	  }

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const stationProps = {
	      treeData: stationData,
	      value: this.state.stationValue,
	      onChange: this.onChange,
	      treeCheckable: true,
	      showCheckedStrategy: SHOW_PARENT,
	      searchPlaceholder: 'Please select station',
	    };
			return (
				<div id="group_form">
					<Drawer
						title="Add New Station Group"
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
										})(<Input placeholder="Please enter group name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
	              <Col span={24}>
	                <Form.Item label="Description">
	                 <Input.TextArea rows={4} placeholder="Please enter group description" />
	                </Form.Item>
	              </Col>
           	 </Row>
           	 <Row gutter={16}>
              <Col span={24}>
									<Form.Item label="Stations">
										{getFieldDecorator('stations', {
											rules: [{ required: true, message: 'Please select station' }],
										})(
											<TreeSelect dropdownStyle={{ maxHeight: 200, overflow: 'auto' }} treeDefaultExpandAll {...stationProps} className="filter-icon" />
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
							<Button onClick={onCancel} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);

const stationData = [{
  title: 'Flood Monitoring',
  value: 'floodmonitoring',
  key: '0-0',
  children: [{
    title: 'Station-1',
    value: 'station-1',
    key: '0-0-0',
  }, {
    title: 'Station-2',
    value: 'station-2',
    key: '0-0-1',
  }, {
    title: 'Station-3',
    value: 'station-3',
    key: '0-0-2',
  }, {
    title: 'Station-4',
    value: 'station-4',
    key: '0-0-3',
  }],
}, {
  title: 'Street',
  value: 'street',
  key: '0-1',
   children: [{
    title: 'Station-5',
    value: 'station-5',
    key: '0-1-0',
  }, {
    title: 'Station-6',
    value: 'station-6',
    key: '0-1-1',
  }, {
    title: 'Station-7',
    value: 'station-7',
    key: '0-1-2',
  }, {
    title: 'Station-8',
    value: 'station-8',
    key: '0-1-3',
  }],
}, {
  title: 'Pollution Monitoring',
  value: 'pollutionmonitoring',
  key: '0-2',
   children: [{
    title: 'Station-9',
    value: 'station-9',
    key: '0-2-0',
  }, {
    title: 'Station-10',
    value: 'station-10',
    key: '0-2-1',
  }, {
    title: 'Station-11',
    value: 'station-11',
    key: '0-2-2',
  }, {
    title: 'Station-12',
    value: 'station-12',
    key: '0-2-3',
  }],
}];

const stationFilter = [{
	title: 'Status',
	value: 'status',
	key: '0-0',
	children: [{
		title: 'Active',
		value: 'active',
		key: '0-0-0',
	}, {
		title: 'Deactive',
		value: 'deactive',
		key: '0-0-1',
	}]
}, {
	title: 'Department',
	value: 'department',
	key: '0-1',
	children: [{
		title: 'Transport',
		value: 'transport',
		key: '0-1-0',
	}, {
		title: 'Pumping station',
		value: 'pumpingstation',
		key: '0-1-1',
	}, {
		title: 'Taru',
		value: 'taru',
		key: '0-1-2',
	}],
}];

const groupFilter = [{
		title: 'Status',
	value: 'status',
	key: '0-0',
	children: [{
		title: 'Active',
		value: 'active',
		key: '0-0-0',
	}, {
		title: 'Deactive',
		value: 'deactive',
		key: '0-0-1',
	}]
}, {
	title: 'Department',
	value: 'department',
	key: '0-1',
	children: [{
		title: 'Transport',
		value: 'transport',
		key: '0-1-0',
	}, {
		title: 'Pumping station',
		value: 'pumpingstation',
		key: '0-1-1',
	}, {
		title: 'Taru',
		value: 'taru',
		key: '0-1-2',
	}],
}, {
	title: 'Role',
	value: 'role',
	key: '0-2',
	children: [{
		title: 'Manager',
		value: 'manager',
		key: '0-2-0',
	}, {
		title: 'Asst Manager',
		value: 'asstmanager',
		key: '0-2-1',
	}, {
		title: 'Admin',
		value: 'admin',
		key: '0-2-2',
	}],
}];

export default class Station extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			visible: true,
			stationValue: [],
			groupValue: [],
			drawGroupVisible: false,
			setLimitVisible: false,
			modalVisible: false,
		};
	}

	onChangeStation = (stationValue) => {
		this.setState({ stationValue });
	}

	onChangeGroup = (groupValue) => {
		this.setState({ groupValue });
	}

	showGroupModal = () => {
		this.setState({ drawGroupVisible: true });
	}

	showLimitModal = () => {
		this.setState({ setLimitVisible: true });
	}

	handleCancel = () => {
		this.setState({ drawGroupVisible: false });
		this.setState({ setLimitVisible: false });
	}

	setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }

	render () {

		const grouptab = (
		  <Menu>
		    <Menu.Item key="action-1">Edit</Menu.Item>
		    <Menu.Item key="action-2" onClick={showConfirm}>Delete</Menu.Item>
		  </Menu>
		);

		const stationProps = {
			treeData: stationFilter,
			value: this.state.stationValue,
			onChange: this.onChangeStation,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Filter',
		};

		const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			onChange: this.onChangeGroup,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT1,
			searchPlaceholder: 'Select Filter',
		};

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
			sorter: (a, b) => a.name.length - b.name.length,
		}, {
			title: 'Category',
			width: 150,
			dataIndex: 'category',
			key: 'category',
			sorter: (c, d) => c.category.length - d.category.length,
		}, {
			title: 'Set Limit',
			dataIndex: 'limit',
			width: 80,
			key: 'limit',
			align: 'center',
			render: () => (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" className="limit-img" onClick={this.showLimitModal}><path d="M51.2 21h-5c-.8 0-1.5-.4-1.8-1.2s-.2-1.5.4-2.1l3.6-3.6a2.8 2.8 0 0 0 0-4l-4.6-4.5c-1-1-2.9-1-4 0l-3.5 3.6c-.6.6-1.4.7-2.1.4-.8-.3-1.2-1-1.2-1.8v-5C33 1.2 31.8 0 30.2 0h-6.4A2.8 2.8 0 0 0 21 2.8v5c0 .8-.4 1.5-1.2 1.8-.7.3-1.5.2-2.1-.4L14 5.6c-1-1-2.9-1-4 0l-4.5 4.6a2.8 2.8 0 0 0 0 4l3.6 3.5c.6.6.7 1.4.4 2.1S8.6 21 7.8 21h-5A2.8 2.8 0 0 0 0 23.8v6.4C0 31.8 1.2 33 2.8 33h5c.8 0 1.5.4 1.8 1.2s.2 1.5-.4 2.1L5.6 40a2.8 2.8 0 0 0 0 4l4.6 4.5c1 1 2.9 1 4 0l3.5-3.6c.6-.6 1.4-.7 2.1-.4.8.3 1.2 1 1.2 1.8v5c0 1.6 1.2 2.8 2.8 2.8h6.4c1.6 0 2.8-1.2 2.8-2.8v-5c0-.8.4-1.5 1.2-1.8.7-.3 1.5-.2 2.1.4l3.6 3.6c1 1 2.9 1 4 0l4.5-4.6a2.8 2.8 0 0 0 0-4l-3.6-3.5c-.6-.6-.7-1.4-.4-2.1s1-1.2 1.8-1.2h5c1.6 0 2.8-1.2 2.8-2.8v-6.4c0-1.6-1.2-2.8-2.8-2.8zm.8 9.2c0 .4-.4.8-.8.8h-5c-1.7 0-3 1-3.7 2.4-.6 1.5-.3 3.2.9 4.3l3.6 3.6c.3.3.3.8 0 1.1L42.4 47c-.3.3-.8.3-1.1 0l-3.6-3.6a3.9 3.9 0 0 0-4.3-.9c-1.5.6-2.4 2-2.4 3.7v5c0 .4-.4.8-.8.8h-6.4a.8.8 0 0 1-.8-.8v-5c0-1.7-1-3-2.4-3.7a3.9 3.9 0 0 0-4.3.9L12.7 47c-.3.3-.8.3-1.1 0L7 42.4a.8.8 0 0 1 0-1.1l3.6-3.6a3.9 3.9 0 0 0 .9-4.3c-.6-1.5-2-2.4-3.7-2.4h-5a.8.8 0 0 1-.8-.8v-6.4c0-.4.4-.8.8-.8h5c1.7 0 3-1 3.7-2.4.6-1.5.3-3.2-.9-4.3L7 12.7a.8.8 0 0 1 0-1.1L11.6 7c.3-.3.8-.3 1.1 0l3.6 3.6a3.9 3.9 0 0 0 4.3.9c1.5-.6 2.4-2 2.4-3.7v-5c0-.4.4-.8.8-.8h6.4c.4 0 .8.4.8.8v5c0 1.7 1 3 2.4 3.7 1.5.6 3.2.3 4.3-.9L41.3 7c.3-.3.8-.3 1.1 0l4.6 4.6c.3.3.3.8 0 1.1l-3.6 3.6a3.9 3.9 0 0 0-.9 4.3c.6 1.5 2 2.4 3.7 2.4h5c.4 0 .8.4.8.8v6.4z"/><path d="M27 18a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/></svg>
			),
		}/*, {
			title: 'Action',
			dataIndex: 'action',
			width: 80,
			key: 'action',
			align: 'center',
			render: () => (
				<Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
			   	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
			  </Dropdown>
			),
		}*/];

		return (
			<div id="station">
				<Side active_link="station" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<Tabs type="card">
								<TabPane tab="Station" key="station">
									<div className="table-filter"><TreeSelect treeDefaultExpandAll {...stationProps} className="filter-icon" /></div>
									<div className="table-search">
										<Input placeholder="Search Station / Category" prefix={<Icon type="search" />} />
									</div>
									<Row>
										<Table columns={columns} dataSource={data} onChange={this.handleChange} />
									</Row>
									<SetLimitForm 
										visible={this.state.setLimitVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
								</TabPane>
								<TabPane tab="Station Group" key="stationGroup">
									<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
									<div className="table-search">
										<Input placeholder="Search Station Group" prefix={<Icon type="search" />} />
									</div>
									<div className="add-btn"><Button type="primary" icon="plus" onClick={this.showGroupModal}>Create New Group</Button></div>
									<div className="features">
										<div className="feature">
											<Card 
												title="Station Group-1"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
													    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
													  </Popconfirm>
														<Dropdown overlay={grouptab} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
				  									</Dropdown>
													</div>
			  								}
												className="back-grey"
											>
												<div className="detail">
													<span className="table-txt">Created by User-1</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="station-name-container">
													<div className="station-names">Station-1</div>
													<div className="station-names">Station-2</div>
													<div className="station-names">Station-3</div>
													<div className="station-names">Station-4</div>
													<div className="station-names">Station-5</div>
													<div className="station-names">Station-6</div>
													<div className="station-names">Station-7</div>
													<div className="station-names">Station-8</div>
													<div className="station-names">Station-9</div>
													<div className="station-names">Station-10</div>
													<div className="station-names">Station-11</div>
													<div className="station-names">Station-12</div>
													<div className="station-names">Station-13</div>
													<div className="station-names">Station-14</div>
													<div className="station-names">Station-15</div>
												</div>
											</Card>
										</div>
										<div className="feature">
											<Card 
												title="Station Group-2"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
													    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
													  </Popconfirm>
														<Dropdown overlay={grouptab} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
				  									</Dropdown>
													</div>
			  								}
												className="back-grey"
											>
												<div className="detail">
													<span className="table-txt">Created by User-4</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="station-name-container">
													<div className="station-names">Station-1</div>
													<div className="station-names">Station-2</div>
													<div className="station-names">Station-3</div>
													<div className="station-names">Station-4</div>
													<div className="station-names">Station-5</div>
													<div className="station-names">Station-6</div>
													<div className="station-names">Station-7</div>
													<div className="station-names">Station-8</div>
													<div className="station-names">Station-9</div>
													<div className="station-names">Station-10</div>
													<div className="station-names">Station-11</div>
													<div className="station-names">Station-12</div>
													<div className="station-names">Station-13</div>
													<div className="station-names">Station-14</div>
													<div className="station-names">Station-15</div>
												</div>
											</Card>
										</div>
										<div className="feature">
											<Card 
												title="Station Group-3"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
													    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
													  </Popconfirm>
														<Dropdown overlay={grouptab} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
				  									</Dropdown>
													</div>
			  								}
												className="back-grey"
											>
												<div className="detail">
													<span className="table-txt">Created by User-2</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="station-name-container">
													<div className="station-names">Station-1</div>
													<div className="station-names">Station-2</div>
													<div className="station-names">Station-3</div>
													<div className="station-names">Station-4</div>
												</div>
											</Card>
										</div>
									</div>
									<StationGroupForm 
										visible={this.state.drawGroupVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
					        <Modal
					          title="Station Group-1"
					          centered
					          visible={this.state.modalVisible}
					          onOk={() => this.setModalVisible(false)}
					          onCancel={() => this.setModalVisible(false)}
					        >
					          <p>Group Description..........</p>
					        </Modal>
								</TabPane>
							</Tabs>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}