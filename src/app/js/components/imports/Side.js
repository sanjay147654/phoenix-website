import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Badge, Drawer } from 'antd';

const { Header, Sider } = Layout;
const SubMenu = Menu.SubMenu;

const MenuItemGroup = Menu.ItemGroup;

export default class Side extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collapsed: true,
			visible: false,
		};
	}

	onCollapse(collapsed) {
		this.setState({ collapsed });
	};

	showDrawer() {
		this.setState({
			visible: true,
		});
	};

	onClose() {
		this.setState({
			visible: false,
		});
	};

	handleClick(e) {
		console.log('click ', e);
		this.setState({
			current: e.key,
		});
	}

	render() {
		let user_name = document.getElementById('user_name') ? document.getElementById('user_name').value : 'Username';
		return (
			<Layout>
				<Sider
					className="mobile-hidden1"
					collapsible
					onCollapse={this.onCollapse} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: '11' }}
				>
					<div className="imgs">
						<Link to='/' ><img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##aurassure_full_logo.svg" /></Link>
					</div>
					<Menu defaultOpenKeys={this.props.active_link == 'user' || this.props.active_link == 'station' || this.props.active_link == 'alerts' ? ['settings'] : []} theme="dark" mode="inline">
						<Menu.Item key="1" className={this.props.active_link == 'dashboard' ? 'ant-menu-item-selected' : ''}>
							<Link to='/'>
								<Icon type="layout" />
								<span>Real-time</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="2" className={this.props.active_link == 'forecast' ? 'ant-menu-item-selected' : ''}>
							<Link to='/forecast/rainfall/' >
								<Icon type="file-text" />
								<span>Forecast</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="3" className={this.props.active_link == 'device' ? 'ant-menu-item-selected' : ''}>
							<Link to='/devices/' >
								<Icon type="pie-chart" />
								<span>Devices</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="scenarios" className={this.props.active_link == 'map' ? 'ant-menu-item-selected' : ''}>
							<Link to='/scenarios' >
								<Icon type="environment" />
								<span>Scenarios</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="slide-show" className={this.props.active_link == 'slide-show' ? 'ant-menu-item-selected' : ''}>
							<Link to='/slide-show' >
								<Icon type="play-circle" />
								<span>Slide Show</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="flood-model" className={this.props.active_link == 'flood-model' ? 'ant-menu-item-selected' : ''}>
							<Link to='/flood-model' >
								<Icon type="cloud" />
								<span>Flood Model</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="reports" className={this.props.active_link == 'archive' ? 'ant-menu-item-selected' : ''}>
							<Link to='/archive' >
								<Icon type="line-chart"/>
								<span>Reports</span>
							</Link>
						</Menu.Item>
						<SubMenu
							key="settings"
							title={<span><Icon type="setting" /><span>Settings</span></span>}
							>
							<Menu.Item key="4" className={this.props.active_link == 'user' ? 'ant-menu-item-selected' : ''}>
								<Link to='/settings/users/' >
									<span>User</span>
								</Link>
							</Menu.Item>
							<Menu.Item key="5" className={this.props.active_link == 'station' ? 'ant-menu-item-selected' : ''}>
								<Link to='/settings/stations/' >
									<span>Station</span>
								</Link>
							</Menu.Item>
							<Menu.Item key="6" className={this.props.active_link == 'alerts' ? 'ant-menu-item-selected' : ''}>
								<Link to='/settings/alerts/automatic/list' >
									<span>Alert</span>
								</Link>
							</Menu.Item>
						</SubMenu>
						{/*<SubMenu
							key="sub1"
							title={<span><Icon type="user" /><span>{user_name}</span></span>}
						>*/}
							{/*<Menu.Item key="4">Profile</Menu.Item>*/}
							{/*<Menu.Item key="5"><a href="/change-password" target="_blank">Change Password</a></Menu.Item>
						</SubMenu>*/}
						{/*<Menu.Item key="6">
							<Icon type="question-circle-o" />
							<span>Help</span>
						</Menu.Item>*/}
					</Menu>
				</Sider>
			</Layout>	
		);
	}
}