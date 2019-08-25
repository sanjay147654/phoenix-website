import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tag, Menu, Dropdown, Checkbox, Popconfirm, Tree, Modal } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';

const TabPane = Tabs.TabPane;

const { Option } = Select;

const TreeNode = Tree.TreeNode;

const confirm = Modal.confirm;

const CheckboxGroup = Checkbox.Group;

const Options1 = ['Rule-1', 'Rule-2', 'Rule-3', 'Rule-4'];
const Options2 = ['Rule-1', 'Rule-2'];
const Options3 = ['Rule-1', 'Rule-2', 'Rule-3', 'Rule-4', 'Rule-5', 'Rule-6'];


function showDelete() {
	confirm({
		title: 'Do you want to delete ?',
		content: '',
		onOk() {},
		onCancel() {},
	});
}

function showDeactive() {
	confirm({
		title: 'Do you want to deactive ?',
		content: '',
		onOk() {},
		onCancel() {},
	});
}

const userAction = (
	<Menu>
		<Menu.Item key="action-1">Edit</Menu.Item>
		<Menu.Item key="action-2" onClick={showDelete}>Delete</Menu.Item>
	</Menu>
);

const groupAction = (
	<Menu>
		<Menu.Item key="action-1">Edit</Menu.Item>
		<Menu.Item key="action-2" onClick={showDelete}>Delete</Menu.Item>
		<Menu.Item key="action-3" onClick={showDeactive}>Deactive</Menu.Item>
	</Menu>
);

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const dataUser = [{
	key: '1',
	name: 'Adsa sadasd',
	login: ['16:21, 03 Sep'],
	department: 'Pumping Station',
	contact: ['1234567890', 'abd@asd.com'],
	group: ['User Group-1', 'User Group-4']
}, {
	key: '2',
	name: 'Gerdf rarer',
	login: ['16:21, 03 Sep'],
	department: 'Street',
	contact: ['6452758675', 'abd@asd.com'],
	group: ['User Group-2']
}, {
	key: '3',
	name: 'Eksdy sjhfka',
	login: ['16:21, 03 Sep'],
	department: 'Flood',
	contact: ['4233526489', 'abd@asd.com'],
	group: ['User Group-3', 'User Group-4', 'User Group-8', 'User Group-9']
}, {
	key: '4',
	name: 'Bsdfdsf asewf',
	login: ['16:21, 03 Sep'],
	department: 'Pumping Station',
	contact: ['1243287565', 'abd@asd.com'],
	group: ['User Group-4']
}];

const dataUserGroup = [
	{
		key: '1',
		groupname: 'User Group-1',
		created: ['User-1'],
		username: ['User-1'],
		stationname: ['Station-3'],
		role: 'Admin'
	}, {
		key: '2',
		groupname: 'User Group-2',
		created: ['User-3'],
		username: ['User-1', 'User-2'],
		stationname: ['Station-1', 'Station Group-3'],
		role: 'Manager'
	}, {
		key: '3',
		groupname: 'User Group-3',
		created: ['User-2'],
		username: ['User-2', 'User-6', 'User-7', 'User-8'],
		stationname: ['Station Group-1'],
		role: 'Operator'
}, {
		key: '4',
		groupname: 'User Group-4',
		created: ['User-5'],
		username: ['User Group-1'],
		stationname: ['Station Group-3', 'Station-2', 'Station-3', 'Station Group-2'],
		role: 'Service'
}];

const { Content } = Layout;

const UserCreateForm = Form.create()(
	class extends React.Component {

		state = {
			value: [],
		}

		onChange = (value) => {
			this.setState({ value });
		}

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const tProps = {
				treeData: createData,
				value: this.state.value,
				onChange: this.onChange,
				treeCheckable: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user group',
			};
			return (
				<div id="create_form">
					<Drawer
						title="Add New User"
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
									<Form.Item label="Name *">
										{getFieldDecorator('name', {
											rules: [{ required: true, message: 'Please enter user name' }],
										})(<Input placeholder="Please enter user name" />)}
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100">
									<Form.Item label="Department *">
										{getFieldDecorator('department', {
											rules: [{ required: true, message: 'Please select a department' }],
										})(
											<Select showSearch placeholder="Please select a department">
												<Option value="transport">Transport</Option>
												<Option value="pumping">Pumping Station</Option>
												<Option value="taru">Taru</Option>
											</Select>
										)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="Email *">
										{getFieldDecorator('email', {
											rules: [{ required: true, message: 'Please enter mail id' }],
										})(<Input placeholder="Please enter Email id" />)}
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100">
									<Form.Item label="Contact No *">
										{getFieldDecorator('contact', {
											rules: [{ required: true, message: 'Please enter contact no.' }],
										})(<Input placeholder="Please enter contact no." />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="User Group">
										<TreeSelect showSearch treeDefaultExpandAll {...tProps} className="filter-icon" />
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

const UserGroupForm = Form.create()(
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
				treeData: userData,
				value: this.state.valueUser,
				onChange: this.onChangeUser,
				treeCheckable: true,
				showCheckedStrategy: SHOW_PARENT,
				searchPlaceholder: 'Please select user',
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
				<div id="group_form">
					<Drawer
						title="Create New User Group"
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
								<Col span={12} className="wid-100">
									<Form.Item label="Role">
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
									<Form.Item label="Description">
									 <Input.TextArea rows={4} placeholder="Please enter group description" />
									</Form.Item>
							</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Station / Station Group Name">
										{getFieldDecorator('stationName', {
											rules: [{ required: true, message: 'Please select station / station group' }],
										})(<TreeSelect showSearch treeDefaultExpandAll {...tProps1} className="filter-icon" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Users">
										{getFieldDecorator('users', {
											rules: [{ required: true, message: 'Please select user' }],
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

const treeData = [{
	title: 'Rule Group-1',
	key: '0-0',
	children: [{
		title: 'Rule-1',
		key: '0-0-0',
	}, {
		title: 'Rule-2',
		key: '0-0-1',
	}, {
		title: 'Rule-3',
		key: '0-0-2',
	}]
}, {
		title: 'Rule Group-2',
		key: '0-1',
		children: [{
		title: 'Rule-4',
		key: '0-1-0',
	}, {
		title: 'Rule-5',
		key: '0-1-1',
	}, {
		title: 'Rule-6',
		key: '0-1-2',
	}]
}];

const UserRoleForm = Form.create()(
	class extends React.Component {

	state = {
		autoExpandParent: true,
		checkedKeys: [],
		selectedKeys: [],
	}

	onCheck = (checkedKeys) => {
		console.log('onCheck', checkedKeys);
		this.setState({ checkedKeys });
	}

	onSelect = (selectedKeys, info) => {
		console.log('onSelect', info);
		this.setState({ selectedKeys });
	}

	renderTreeNodes = (data) => {
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
		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			return (
				<div id="role_form">
					<Drawer
						title="Add New Role"
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
										})(<Input placeholder="Please enter role name" />)}
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
							<Col span={24}>
								<Form.Item label="Description">
								 <Input.TextArea rows={4} placeholder="Please enter role description" />
								</Form.Item>
							</Col>
						 </Row>
							<Row gutter={16}>
								<Col span={24} className="wid-100">
									<Form.Item label="Access">
										<Checkbox>Select All</Checkbox>
										<Tree
											checkable
											defaultExpandAll={true}
											autoExpandParent={this.state.autoExpandParent}
											onCheck={this.onCheck}
											onSelect={this.onSelect}
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

const userFilter = [{
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
	}],
}, {
	title: 'Role',
	value: 'role',
	key: '0-1',
	children: [{
		title: 'Manager',
		value: 'manager',
		key: '0-1-0',
	}, {
		title: 'Admin',
		value: 'admin',
		key: '0-1-1',
	}, {
		title: 'Service',
		value: 'service',
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
	}],
}, {
	title: 'Role',
	value: 'role',
	key: '0-1',
	children: [{
		title: 'Manager',
		value: 'manager',
		key: '0-1-0',
	}, {
		title: 'Admin',
		value: 'admin',
		key: '0-1-1',
	}, {
		title: 'Service',
		value: 'service',
		key: '0-1-2',
	}],
}, {
	title: 'Department',
	value: 'department',
	key: '0-2',
	children: [{
		title: 'Taru',
		value: 'taru',
		key: '0-2-0',
	}, {
		title: 'Flood',
		value: 'flood',
		key: '0-2-1',
	}, {
		title: 'Street',
		value: 'street',
		key: '0-2-2',
	}],
}];

const userData = [{
	title: 'User-1',
	value: 'user-1',
	key: '0-0',
}, {
	title: 'User-2',
	value: 'user-2',
	key: '0-1',
}, {
	title: 'User-3',
	value: 'user-3',
	key: '0-2',
}, {
	title: 'User-4',
	value: 'user-4',
	key: '0-3',
}, {
	title: 'User-5',
	value: 'user-5',
	key: '0-4',
}];

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

const createData = [{
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

const roleData = [{
	title: 'Rule Group-1',
	key: '0-0',
	children: [{
		title: 'Rule-1',
		key: '0-0-0',
	}, {
		title: 'Rule-2',
		key: '0-0-1',
	}, {
		title: 'Rule-3',
		key: '0-0-2',
	}]
}, {
		title: 'Rule Group-2',
		key: '0-1',
		children: [{
		title: 'Rule-4',
		key: '0-1-0',
	}, {
		title: 'Rule-5',
		key: '0-1-1',
	}, {
		title: 'Rule-6',
		key: '0-1-2',
	}]
}];

const roleData1 = [{
	title: 'Rule Group-1',
	key: '0-0',
	children: [{
		title: 'Rule-1',
		key: '0-0-0',
	}, {
		title: 'Rule-2',
		key: '0-0-1',
	}, {
		title: 'Rule-3',
		key: '0-0-2',
	}]
}];

export default class User extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			visible: true,
			value: [],
			groupValue: [],
			roleValue: [],
			createValue: [],
			drawCreateVisible: false,
			drawGroupVisible: false,
			drawRoleVisible: false,
			autoExpandParent: true,
			checkedKeys: [],
			selectedKeys: [],
		};
	}

	onCheck = (checkedKeys) => {
		console.log('onCheck', checkedKeys);
		this.setState({ checkedKeys });
	}

	onSelect = (selectedKeys, info) => {
		console.log('onSelect', info);
		this.setState({ selectedKeys });
	}

	renderTreeNodes = (data) => {
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

	onChange = (value) => {
		this.setState({ value });
	}

	onChangeGroup = (groupValue) => {
		this.setState({ groupValue });
	}

	onChangeRole = (roleValue) => {
		this.setState({ roleValue });
	}

	onChangeCreate = (createValue) => {
		this.setState({ createValue });
	}

	showCreateModal = () => {
		this.setState({ drawCreateVisible: true });
	}

	showGroupModal = () => {
		this.setState({ drawGroupVisible: true });
	}

	showRoleModal = () => {
		this.setState({ drawRoleVisible: true });
	}

	handleCancel = () => {
		this.setState({ drawCreateVisible: false });
		this.setState({ drawGroupVisible: false });
		this.setState({ drawRoleVisible: false });
	}

	render () {

		 const userProps = {
			treeData: userFilter,
			value: this.state.value,
			onChange: this.onChange,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Please select filter',
		};

		const groupProps = {
			treeData: groupFilter,
			value: this.state.groupValue,
			onChange: this.onChangeGroup,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Please select filter',
		};

		const roleProps = {
			treeData: userFilter,
			value: this.state.roleValue,
			onChange: this.onChangeRole,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Please select filter',
		};

		const createUserProps = {
			treeData: createData,
			value: this.state.createValue,
			onChange: this.onChangeCreate,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Please select filter',
		};

		const columnsUser = [{
			title: 'Name',
			width: 120,
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.length - b.name.length,
		}, {
			title: 'Last Login',
			width: 100,
			dataIndex: 'login',
			key: 'login',
			sorter: (a, b) => a.login.length - b.login.length,
			render: login => (
				<span>
					{login.map(div => <div className="font-col" key={div}>{div}</div>)}
				</span>
			),
		}, {
			title: 'Department',
			width: 100,
			dataIndex: 'department',
			key: 'department',
			sorter: (a, b) => a.department.length - b.department.length,
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
			render: () => (
				<Dropdown overlay={userAction} trigger={['click']} placement="bottomLeft">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
				</Dropdown>
			),
		}];

		const columnsUserGroup = [{
			title: 'Group Name',
			width: 120,
			key: 'groupname',
			dataIndex: 'groupname',
			sorter: (a, b) => a.groupname.length - b.groupname.length,
		}, {
			title: 'Created By',
			width: 120,
			key: 'created',
			dataIndex: 'created',
			sorter: (a, b) => a.created.length - b.created.length,
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
			render: description => (
				<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
				</Popconfirm>
			),
		}, {
			title: 'Role',
			width: 100,
			key: 'role',
			dataIndex: 'role',
			sorter: (a, b) => a.role.length - b.role.length,
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
			render: stationname => (
				<span>
					{stationname.map(tag => <Tag key={tag}>{tag}</Tag>)}
				</span>
			),
		}, {
			title: 'Action',
			dataIndex: 'action',
			width: 80,
			key: 'action',
			align: 'center',
			render: () => (
				<Dropdown overlay={groupAction} trigger={['click']} placement="bottomLeft">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
				</Dropdown>
			),
		}];

		return (
			<div id="user">
				<Side active_link="user" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<Tabs type="card">
								<TabPane tab="Users" key="users">
									<div className="table-filter"><TreeSelect treeDefaultExpandAll {...userProps} className="filter-icon" /></div>
									<div className="table-search">
										<Input placeholder="Search User" prefix={<Icon type="search" />} />
									</div>
									<div className="add-btn"><Button type="primary" icon="plus" onClick={this.showCreateModal}>New User</Button></div>
									<Row>
										<div className="show-container">
											Showing 
											<span className="show-txt">4</span>
											out of
											<span className="show-txt">20</span>
										</div>
									</Row>
									<Row>
										<Table columns={columnsUser} dataSource={dataUser} onChange={this.handleChange} />
									</Row>
									<UserCreateForm 
										visible={this.state.drawCreateVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
								</TabPane>
								<TabPane tab="User Group" key="userGroup">
									<div className="table-filter"><TreeSelect treeDefaultExpandAll {...groupProps} className="filter-icon" /></div>
									<div className="table-search">
										<Input placeholder="Search User Group" prefix={<Icon type="search" />} />
									</div>
									<div className="add-btn"><Button type="primary" icon="plus" onClick={this.showGroupModal}>New Group</Button></div>
									<Row className="group-table">
										<Table columns={columnsUserGroup} dataSource={dataUserGroup} onChange={this.handleChange} />
									</Row>
									<UserGroupForm 
										visible={this.state.drawGroupVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
								</TabPane>
								<TabPane tab="Roles" key="roles">
									<div className="table-filter"><TreeSelect treeDefaultExpandAll {...roleProps} className="filter-icon" /></div>
									<div className="table-search">
										<Input placeholder="Search Role" prefix={<Icon type="search" />} />
									</div>
									<div className="add-btn"><Button type="primary" icon="plus" onClick={this.showRoleModal}>New Role</Button></div>
									<div className="features">
										<div className="feature">
											<Card 
												title="Role-1"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
														</Popconfirm>
														<Dropdown overlay={userAction} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
														</Dropdown>
													</div>
												}
												className="back-grey"
											>
												<div className="detail">
													<span className="tbl-txt">Created by User-1</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="role-name-container">
													<Tree
														defaultExpandAll={true}
														autoExpandParent={this.state.autoExpandParent}
														onCheck={this.onCheck}
														onSelect={this.onSelect}
													>
														{this.renderTreeNodes(roleData)}
													</Tree>
												</div>
											</Card>
										</div>
										<div className="feature">
											<Card 
												title="Role-2"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
														</Popconfirm>
														<Dropdown overlay={userAction} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
														</Dropdown>
													</div>
												}
												className="back-grey"
											>
												<div className="detail">
													<span className="tbl-txt">Created by User-4</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="role-name-container">
													<Tree
														defaultExpandAll={true}
														autoExpandParent={this.state.autoExpandParent}
														onCheck={this.onCheck}
														onSelect={this.onSelect}
													>
														{this.renderTreeNodes(roleData1)}
													</Tree>
												</div>
											</Card>
										</div>
										<div className="feature">
											<Card 
												title="Role-3"
												extra={
													<div>
														<Popconfirm className="info-msg" title="Group Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
														</Popconfirm>
														<Dropdown overlay={userAction} trigger={['click']} placement="bottomLeft">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
														</Dropdown>
													</div>
												}
												className="back-grey"
											>
												<div className="detail">
													<span className="tbl-txt">Created by User-2</span>
													<span className="date-txt">16:21, 03 Sep</span>
												</div>
												<div className="role-name-container">
													<Tree
														defaultExpandAll={true}
														autoExpandParent={this.state.autoExpandParent}
														onCheck={this.onCheck}
														onSelect={this.onSelect}
													>
														{this.renderTreeNodes(roleData)}
													</Tree>
												</div>
											</Card>
										</div>
									</div>
									<UserRoleForm 
										visible={this.state.drawRoleVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
								</TabPane>
							</Tabs>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}