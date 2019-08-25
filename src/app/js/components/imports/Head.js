import React, { Component } from 'react';
// import './menu.less';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Badge, Drawer, Divider } from 'antd';

const { Header, Sider } = Layout;
const SubMenu = Menu.SubMenu;

const MenuItemGroup = Menu.ItemGroup;

export default class Head extends Component {
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
				<div>
					<Header className="header mobile-hidden1">
						<div className="logos mobile-hidden1">
							{/*<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##adb_logo.jpg" className="company-logo"/>
							<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##uccrtf.png" className="company-logo ucrtf"/>
							<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##taru_logo.jpg" className="company-logo taru"/>*/}
							<img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##lg.jpg" className="company-logo"/>
							<Divider type="vertical" />
							<span className="header-txt">Flood Forecasting and Early Warning System for Kolkata City</span>
						</div>
						<Menu
							onClick={this.handleClick}
							theme="light"
							mode="horizontal"
							style={{ lineHeight: '64px' }}
						>
							{/*<SubMenu title={<Link to="#"><Icon type="notification" />Notifications<Badge count={2}/></Link>}>
								<Menu.Item key="1">SO2 of CEMS - 1 above warning limit.</Menu.Item>
								<Menu.Item key="2">SO2 of CEMS - 1 above warning limit.</Menu.Item>
							</SubMenu>*/}
							{/*<Menu.Item key="1"><Link to="#"><Icon type="notification" />Notifications<Badge count={5}/></Link></Menu.Item>*/}
							<SubMenu className="title-remove" title={<Link to="#"><span className="user-icon">{user_name.charAt(0).toUpperCase()}</span>{user_name}</Link>}>
								<Menu.Item key="4"><a href="/change-password" target="_blank">Change Password</a></Menu.Item>
								<Menu.Item key="5"><a href="/logout"><Icon type="logout" />Logout</a></Menu.Item>
							</SubMenu>
						</Menu>
					</Header>
				</div>
				
				<div>
					<Header className="header mobile-show1">
						<Icon className="menu-icon" type="menu-unfold" onClick={() => this.showDrawer()} />
						<p className="hed-text">Aurassure</p>
						<Menu
							onClick={this.handleClick}
							theme="light"
							mode="horizontal"
							style={{ lineHeight: '64px' }}
						>
							{/*<SubMenu title={<Link to="#"><Icon type="notification" /><Badge dot/></Link>}>
								<Menu.Item key="1">SO2 of CEMS - 1 above warning limit.</Menu.Item>
								<Menu.Item key="2">SO2 of CEMS - 1 above warning limit.</Menu.Item>
							</SubMenu>*/}
							<SubMenu title={<Link to="#"><span className="user-icon">{user_name.charAt(0).toUpperCase()}</span></Link>}>
								<Menu.Item key="4" ><a href="/change-password" target="_blank">Change Password</a></Menu.Item>
								<Menu.Item className="pad-lr-0" key="5"><a href="/logout"><Icon type="logout" /></a>Logout</Menu.Item>
							</SubMenu>
						</Menu>
					</Header>
					<Drawer
						title=""
						placement="left"
						closable={false}
						onClose={() => this.onClose()}
						visible={this.state.visible}
					>
						<Sider
							collapsible
							onCollapse={(e) => this.onCollapse(e)} 
							style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: '11' }}
							>
							<div className="imgs">
								<Link to='/'><img src="##PR_STRING_REPLACE_IMAGE_BASE_PATH##aurassure_full_logo.svg" /></Link>
							</div>
							<Menu theme="dark" mode="inline">
								<Menu.Item key="dash" className={this.props.active_link == 'dashboard' ? 'ant-menu-item-selected' : ''}>
									<Link to='/'>
										<Icon type="layout" />
										<span>Real-time</span>
									</Link>
								</Menu.Item>
								<Menu.Item key="fore" className={this.props.active_link == 'forecast' ? 'ant-menu-item-selected' : ''}>
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
										<Icon type="line-chart" />
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
									<Menu.Item key="6" className={this.props.active_link == 'alert' ? 'ant-menu-item-selected' : ''}>
										<Link to='/alert' >
											<span>Alert</span>
										</Link>
									</Menu.Item>
								</SubMenu>
								{/*<SubMenu
									key="settings"
									title={<span><Icon type="setting" /><span>Settings</span></span>}
								>
									<Menu.Item key="4">User</Menu.Item>
									<Menu.Item key="5">Station</Menu.Item>
									<Menu.Item key="6">Alerts</Menu.Item>
								</SubMenu>*/}
								{/*<SubMenu
									key="user"
									title={<span><Icon type="user" /><span>{user_name}</span></span>}
								>*/}
									{/*<Menu.Item key="7">Profile</Menu.Item>*/}
									{/*<Menu.Item key="8"><a href="/change-password" target="_blank">Change Password</a></Menu.Item>
								</SubMenu>*/}
								{/*<Menu.Item key="6">
									<Icon type="question-circle-o" />
									<span>Help</span>
								</Menu.Item>*/}
							</Menu>
						</Sider>
					</Drawer>
				</div>
			</Layout>
		);
	}
}