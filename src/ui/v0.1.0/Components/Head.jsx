import React, { Component } from 'react';
import './menu.less';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Badge, Drawer, Divider } from 'antd';

const { Header, Sider } = Layout;
const SubMenu = Menu.SubMenu;

const MenuItemGroup = Menu.ItemGroup;

class Head extends Component {
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
			<div>
				<Header className="header mobile-hidden1">
					<div className="logos mobile-hidden1">
						<img src="http://127.0.0.1:8080/adb_logo.jpg" className="company-logo"/>
						<img src="http://127.0.0.1:8080/uccrtf.png" className="company-logo taru"/>
						<img src="http://127.0.0.1:8080/taru_logo.jpg" className="company-logo taru"/>
						<Divider type="vertical" />
						<span className="header-txt">KMC Flood Forecasting System</span>
					</div>
					<Menu
						onClick={this.handleClick}
						theme="light"
						mode="horizontal"
						style={{ lineHeight: '64px' }}
					>
						<SubMenu title={<Link to="#"><Icon type="notification" />Notifications<Badge count={2}/></Link>}>
							<Menu.Item key="1">SO2 of CEMS - 1 above warning limit.</Menu.Item>
							<Menu.Item key="2">SO2 of CEMS - 1 above warning limit.</Menu.Item>
						</SubMenu>
						{/*<Menu.Item key="1"><Link to="#"><Icon type="notification" />Notifications<Badge count={5}/></Link></Menu.Item>*/}
						<Menu.Item key="1"><Link to="#"><Icon type="logout" />Logout</Link></Menu.Item>
					</Menu>
				</Header>
			</div>
			
			<div>
				<Header className="header mobile-show1">
					<Icon className="menu-icon" type="menu-unfold" onClick={this.showDrawer} />
					<p className="hed-text">Aurassure</p>
					<Menu
						onClick={this.handleClick}
						theme="light"
						mode="horizontal"
						style={{ lineHeight: '64px' }}
					>
						<SubMenu title={<Link to="#"><Icon type="notification" /><Badge dot/></Link>}>
							<Menu.Item key="1">SO2 of CEMS - 1 above warning limit.</Menu.Item>
							<Menu.Item key="2">SO2 of CEMS - 1 above warning limit.</Menu.Item>
						</SubMenu>
						<Menu.Item className="pad-lr-0" key="1"><Link to="#"><Icon type="logout" /></Link></Menu.Item>
					</Menu>
				</Header>
				<Drawer
					title=""
					placement="left"
					closable={false}
					onClose={this.onClose}
					visible={this.state.visible}
				>
					<Sider
					collapsible
					onCollapse={this.onCollapse} 
					style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: '11' }}
					>
						<div className="imgs">
							<img src="http://127.0.0.1:8080/aurassure_full_logo.svg" />
						</div>
						<Menu theme="dark" mode="inline">
							<Menu.Item key="dash" className={this.props.active_link == 'dashboard' ? 'ant-menu-item-selected' : ''}>
								<Link to='/'>
									<Icon type="layout" />
									<span>Dashboard</span>
								</Link>
							</Menu.Item>
							<Menu.Item key="fore" className={this.props.active_link == 'forecast' ? 'ant-menu-item-selected' : ''}>
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
				</Drawer>
			</div>
		</Layout>
	);
	}
}

export default Head;