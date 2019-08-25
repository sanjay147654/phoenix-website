import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown, List, Tag, Checkbox, Radio } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';

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

function showDelete() {
  confirm({
    title: 'Do you want to delete ?',
    content: '',
    onOk() {},
    onCancel() {},
  });
}

const actionMenu = (
  <Menu>
  	<Menu.Item key="action-1">Edit</Menu.Item>
    <Menu.Item key="action-2" onClick={showDelete}>Delete</Menu.Item>
  </Menu>
);

const stationData = [{
  title: 'Stations',
  value: 'stations',
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
  title: 'Station Groups',
  value: 'stationgroups',
  key: '0-1',
  children: [{
    title: 'Station Group-1',
    value: 'stationgroup-1',
    key: '0-1-0',
  }, {
    title: 'Station Group-2',
    value: 'stationgroup-2',
    key: '0-1-1',
  }, {
    title: 'Station Group-3',
    value: 'stationgroup-3',
    key: '0-1-2',
  }],
}];

const AlertForm = Form.create()(
	class extends React.Component {

		constructor(props) {
	    super(props);

	    this.state = {
	      stationValue: [],
	    };
	  }

	  onChange = (value) => {
	    this.setState({ value });
	  }

	  onChangeStation = (valueStation) => {
	    this.setState({ valueStation });
	  }

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const tProps = {
	      treeData: stationData,
	      value: this.valueStation,
	      onChange: this.onChangeStation,
	      treeCheckable: true,
	      showCheckedStrategy: SHOW_PARENT,
	      searchPlaceholder: 'Please select station / station group',
	    };

	    const stationProps = {
	      treeData: stationData,
	      value: this.state.stationValue,
	      onChange: this.onChange,
	      treeCheckable: true,
	      showCheckedStrategy: SHOW_PARENT,
	      searchPlaceholder: 'Please select station',
	    };
			
			return (
				<div id="alert_form">
          <Drawer
						title="Assign Alert"
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
									<Form.Item label="with role">
										{getFieldDecorator('role', {
											rules: [{ required: true, message: 'Please select role' }],
										})(
											<Select showSearch placeholder="Please select role">
												<Option value="role-1">Role-1</Option>
												<Option value="role-2">Role-2</Option>
												<Option value="role-3">Role-3</Option>
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
	              <Col span={24}>
	               	<Form.Item label="and stations">
										{getFieldDecorator('stations', {
											rules: [{ required: true, message: 'Please select station' }],
										})(
											<TreeSelect dropdownStyle={{ maxHeight: 300, overflow: 'auto' }} treeDefaultExpandAll {...stationProps} className="filter-icon" />
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

const CreateTemplateForm = Form.create()(
	class extends React.Component {
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
										})(<Input placeholder="Please enter template name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
	              <Col span={24}>
	                <Form.Item label="Template">
	                 <Input.TextArea rows={4} placeholder="Please enter template" />
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

const userGroupData = [{
  title: 'User Group-1',
  value: 'usergroup-1',
  key: '0-0',
}, {
  title: 'User Group-2',
  value: 'usergroup-2',
  key: '0-1',
}, {
  title: 'User Group-3',
  value: 'usergroup-3',
  key: '0-2',
}, {
  title: 'User Group-4',
  value: 'usergroup-4',
  key: '0-3',
}, {
  title: 'User Group-5',
  value: 'usergroup-5',
  key: '0-4',
}];

const SendTemplateForm = Form.create()(
	class extends React.Component {

		state = {
	    valueUser: [],
	    valueStation: [],
	  }

	  onChangeUser = (valueUser) => {
	    this.setState({ valueUser });
	  }

	  onChangeStation = (valueStation) => {
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

/*const sentData = [
	{
	  key: '0',
	  date: '16:03, 14 Oct',
	  message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
	}, {
	  key: '1',
	  date: '16:08, 14 Oct',
	  message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
	}, {
	  key: '2',
	  date: '16:13, 14 Oct',
	  message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
	}, {
	  key: '3',
	  date: '16:23, 14 Oct',
	  message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
	}, {
	  key: '4',
	  date: '16:33, 14 Oct',
	  message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
	}];

const UserListForm = Form.create()(
	class extends React.Component {

		constructor(props) {
	    super(props);

	    this.state = {
	      userListDrawer: false,
	    };
	  }

		 showUserListDrawer = () => {
	    this.setState({
	      userListDrawer: true,
	    });
	  };

	  onUserListDrawerClose = () => {
	    this.setState({
	      userListDrawer: false,
	    });
	  };

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const columns = [{
	      title: 'Date',
	      dataIndex: 'date',
	      width: 150,
	      sorter: (a, b) => a.date.length - b.date.length,
	    }, {
	      title: 'Message',
	      dataIndex: 'message',
	    }, {
	      title: 'User List',
	      dataIndex: 'userlist',
	      width: 120,
	      align: 'center',
	      render: () => (
	        <Icon type="team" theme="outlined" className="click users-icon" onClick={this.showUserListDrawer} />
	      ),
	    }];

			return (
				<div id="sent_list">
					<Drawer
						title="Template-1 Sent List"
						width={920}
						placement="right"
						visible={visible}
						onClose={onCancel}
						style={{
							height: 'calc(100% - 55px)',
							overflow: 'auto',
							paddingBottom: 53,
						}}
					>
						<Row gutter={16}>
              <Col span={24}>
               <Table columns={columns} dataSource={sentData} onChange={this.handleChange} />
              </Col>
         	 	</Row>
         	 	<Drawer
	            title="Users List"
	            width={420}
	            closable={true}
	            onClose={this.onUserListDrawerClose}
	            visible={this.state.userListDrawer}
	          >
	            <List
					      header=''
					      footer=''
					      bordered
					      dataSource={userList}
					      renderItem={item => (<List.Item>{item}</List.Item>)}
					    />
	          </Drawer>
					</Drawer>
				</div>
			);
		}
	}
);*/

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

function SentListTable() {
  const expandedRowRender = () => {
  	const columns = [
	    { title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
	    { title: 'Users', dataIndex: 'users', key: 'users' },
	  ];

	  const data = [];
	  let i = 0;
	  for (i = 0; i < 5; i++) {
	  	let count = i+1;
	    data.push({
	      key: i,
	      slno: count,
	      users: 'User-' + count,
	    });
	  }
    
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    );
  };

  const columns = [{
      title: 'Date',
      dataIndex: 'date',
      width: 150,
      sorter: (a, b) => a.date.length - b.date.length,
    }, {
      title: 'Message',
      dataIndex: 'message',
    }];

  const data = [];
  for (let i = 0; i < 5; ++i) {
    data.push({
      key: i,
      date: '16:33, 14 Oct',
      message: 'The rainfall over last 24 hours is XXX and last one hour is YYY mm. Reported at hh:mm. Please take necessary precautions.',
    });
  }

  return (
    <Table
      className="components-table-demo-nested"
      columns={columns}
      expandedRowRender={expandedRowRender}
      dataSource={data}
    />
  );
}

function AlertTable() {
  const expandedRowRender = () => {
  	const columns = [
	    { title: 'Sl. No.', dataIndex: 'slno', key: 'slno' },
	    { title: 'Users', dataIndex: 'users', key: 'users' },
	  ];

	  const data = [];
	  let i = 0;
	  for (i = 0; i < 5; i++) {
	  	let count = i+1;
	    data.push({
	      key: i,
	      slno: count,
	      users: 'User-' + count,
	    });
	  }
    
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    );
  };

  const columns = [{
    title: 'User with',
    dataIndex: 'role',
    width: 200,
    sorter: (a, b) => a.role.length - b.role.length,
  }, {
    title: 'Station / Station Group',
    dataIndex: 'station',
    render: group => (
			<span>
				{group.map(tag => <Tag key={tag}>{tag}</Tag>)}
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
    render: () => (
      <Switch size="small" defaultChecked />
    ),
  }, {
    title: 'Action',
    dataIndex: 'action',
    width: 80,
    align: 'center',
    render: () => (
      <Dropdown overlay={actionMenu} trigger={['click']} placement="bottomLeft">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
			</Dropdown>
    ),
  }];

  const data = [];
  let i = 0;
  for (i = 0; i < 5; i++) {
  	let count = i+1;
    data.push({
      key: i,
      role: 'Role-' + count,
      station: ['Station-1', 'Station Group-2'],
      count: '5'
    });
  }

  return (
    <Table
      className="components-table-demo-nested"
      columns={columns}
      expandedRowRender={expandedRowRender}
      dataSource={data}
    />
  );
}


export default class Alert extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			autoTabVisible: true,
			manualTabVisible: true,
			drawAlertVisible: false,
			drawSendTemplateVisible: false,
			drawCreateTemplateVisible: false,
			groupValue: [],
			drawGroupVisible: false,
		};
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

	showSendDrawer = () => {
		this.setState({ drawSendTemplateVisible: true });
	}

	showCreateTemplateDrawer = () => {
		this.setState({ drawCreateTemplateVisible: true });
	}

	onChangeGroup = (groupValue) => {
		this.setState({ groupValue });
	}

	stopDefault (e) {}

	handleCancel = () => {
		this.setState({ 
			drawAlertVisible: false,
			drawCreateTemplateVisible: false,
			drawSendTemplateVisible: false,
		});
	}

	render () {
		const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			onChange: this.onChangeGroup,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Filter',
		};

		return (
			<div id="alert">
				<Side active_link="alert" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<Tabs type="card">
								<TabPane tab="Automatic" key="automatic">
									{(() => {
										if (this.state.autoTabVisible) {
											return <div> 
												<div className="table-search auto-tab-search">
													<Input placeholder="Search" prefix={<Icon type="search" />} />
												</div>
												<Card title="" bordered={false}>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name click" span={4} onClick={() => this.templateDetailsShow()}>
											    			Alert-1
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
															  </Popconfirm>
															  <span>
															  	<span>10 </span>Stations
															  	<Divider className="divider" type="vertical" />
															  	<span>20 </span>Users
															  </span>
											    		</Col>
											    		<Col className="text-r" span="4">
											    			<Switch size="small" defaultChecked onChange={(e) => this.stopDefault(e)}/>
											    		</Col>
											    	</Row>
											    </Card.Grid>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name click" span={4} onClick={() => this.templateDetailsShow()}>
											    			Alert-2
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
															  </Popconfirm>
															  <span>
															  	<span>15 </span>Stations
															  	<Divider className="divider" type="vertical" />
															  	<span>15 </span>Users
															  </span>
											    		</Col>
											    		<Col className="text-r" span="4">
											    			<Switch size="small" defaultChecked />
											    		</Col>
											    	</Row>
											    </Card.Grid>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name click" span={4} onClick={() => this.templateDetailsShow()}>
											    			Alert-3
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
															  </Popconfirm>
															  <span>
															  	<span>10 </span>Stations
															  	<Divider className="divider" type="vertical" />
															  	<span>23 </span>Users
															  </span>
											    		</Col>
											    		<Col className="text-r" span="4">
											    			<Switch size="small" defaultChecked />
											    		</Col>
											    	</Row>
											    </Card.Grid>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name click" span={4} onClick={() => this.templateDetailsShow()}>
											    			Alert-4
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
															  </Popconfirm>
															  <span>
															  	<span>15 </span>Stations
															  	<Divider className="divider" type="vertical" />
															  	<span>30 </span>Users
															  </span>
											    		</Col>
											    		<Col className="text-r" span="4">
											    			<Switch size="small" defaultChecked />
											    		</Col>
											    	</Row>
											    </Card.Grid>
											  </Card>
											</div>
										}
										else {
											return <div className="automatic">
												<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
												<div className="table-search">
													<Input placeholder="Search" prefix={<Icon type="search" />} />
												</div>
												<div className="add-btn"><Button type="primary" icon="arrow-left" onClick={() => this.showAutoTemplate()}>Back to Template</Button></div>
												<Row>
													<div className="show-container">
														<span>Alert-1 Details</span>
														<div className="add-btn pad-bot-15"><Button type="primary" icon="plus" onClick={() => this.showAlertDrawer()}>Assign New Users</Button></div>
													</div>
												</Row>
												<Row>
													<AlertTable />
												</Row>
												<AlertForm 
													visible={this.state.drawAlertVisible}
													onCancel={this.handleCancel}
													onCreate={this.handleCreate}
												/>
											</div>;
										}
									})()}
								</TabPane>

								<TabPane tab="Mannual" key="mannual">
									{/*<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>*/}
									{(() => {
										if (this.state.manualTabVisible) {
											return <div> 
												<div className="table-search width-search-100">
													<Input placeholder="Search Template" prefix={<Icon type="search" />} />
												</div>
												<div className="add-btn">
												<span className="view-all" onClick={() => this.sentListShow()}>View all Alert List</span>
												<Button type="primary" icon="plus" onClick={this.showCreateTemplateDrawer}>Add new template</Button></div>
												<Card title="" bordered={false}>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name" span={5}>
											    			Template-1
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<span className="user-list" onClick={() => this.sentListShow()}>Sent List</span>
											    		</Col>
											    		<Col className="text-r" span={3}>
											    			<Icon type="double-right" theme="outlined" className="click arrow" onClick={this.showSendDrawer} />
											    		</Col>
											    	</Row>
											    </Card.Grid>
											    <Card.Grid className="grid-style">
											    	<Row type="flex" justify="space-between">
											    		<Col className="alert-name" span={5}>
											    			Template-2
											    		</Col>
											    		<Col className="text-c" span={10}>
											    			<span className="user-list" onClick={() => this.sentListShow()}>Sent List</span>
											    		</Col>
											    		<Col className="text-r" span={3}>
											    			<Icon type="double-right" theme="outlined" className="click arrow" onClick={this.showSendDrawer} />
											    		</Col>
											    	</Row>
											    </Card.Grid>
											  </Card>
											  <CreateTemplateForm 
													visible={this.state.drawCreateTemplateVisible}
													onCancel={this.handleCancel}
													onCreate={this.handleCreate}
												/>
												<SendTemplateForm
													visible={this.state.drawSendTemplateVisible}
													onCancel={this.handleCancel}
													onCreate={this.handleCreate}									
												/>
											</div>;
										}

										else {
											return <div>
												<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
												<div className="table-search">
													<Input placeholder="Search" prefix={<Icon type="search" />} />
												</div>
												<div className="add-btn"><Button type="primary" icon="arrow-left" onClick={() => this.showManualTemplate()}>Back to Template</Button></div>
												<Row>
													<div className="show-container">
														Template-1 Details
													</div>
												</Row>
												<Row>
													<SentListTable />
												</Row>
											</div>;
										}
									})()}
								</TabPane>
							</Tabs>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}