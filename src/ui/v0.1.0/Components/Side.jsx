import React, { Component } from 'react';
import './menu.less';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Badge, Drawer } from 'antd';

const { Header, Sider } = Layout;
const SubMenu = Menu.SubMenu;

const MenuItemGroup = Menu.ItemGroup;

class Side extends Component {

	constructor(props) {
		super(props);
		this.state = {
			collapsed: true,
			visible: false,
		};
	}

	onCollapse = (collapsed) => {
		this.setState({ collapsed });
	};

	showDrawer = () => {
		this.setState({
			visible: true,
		});
	};

	onClose = () => {
		this.setState({
			visible: false,
		});
	};

	handleClick = (e) => {
		console.log('click ', e);
		this.setState({
			current: e.key,
		});
	}

	render() {
	return (
		<Layout>
			<Sider
				className="mobile-hidden1"
				collapsible
				onCollapse={this.onCollapse} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: '11' }}
			>
				<div className="imgs">
					<img src="http://127.0.0.1:8080/aurassure_full_logo.svg" />
				</div>
				<Menu theme="dark" mode="inline">
					<Menu.Item key="1" className={this.props.active_link == 'dashboard' ? 'ant-menu-item-selected' : ''}>
						<Link to='/'>
							<Icon type="layout" />
							<span>Dashboard</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="2" className={this.props.active_link == 'forecast' ? 'ant-menu-item-selected' : ''}>
						<Link to='/forecast' >
							<Icon type="file-text" />
							<span>Forecast</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Icon type="setting" />
						<span>Devices</span>
					</Menu.Item>
					<SubMenu
						key="sub1"
						title={<span><Icon type="user" /><span>User</span></span>}
					>
						<Menu.Item key="4">Profile</Menu.Item>
						<Menu.Item key="5">Change Password</Menu.Item>
					</SubMenu>
					<Menu.Item key="6">
						<Icon type="question-circle-o" />
						<span>Help</span>
					</Menu.Item>
				</Menu>
			</Sider>
		</Layout>
			
	);
	}
}

export default Side;