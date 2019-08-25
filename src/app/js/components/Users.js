import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification } from 'antd';
// import './css/style.less';
import Head from './imports/Head';
import Side from './imports/Side';
import Loading from './imports/Loading';
import RolesPage from './imports/RolesPage';
import UserGroupsPage from './imports/UserGroupsPage';
import StationPage from './imports/StationPage';
import UsersPage from './imports/UsersPage';

// import queryString from 'query-string';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Option } = Select;

const confirm = Modal.confirm;

const { Content } = Layout;
/**
 * Main component for the Users page.
 */
export default class Station extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * This stores the parsed data from the query string.
		 * @type {String}
		 */
		this.parsed_search = queryString.parse(this.props.location.search);
		console.log('parsed', this.parsed);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @property {string} tab_toggle used to store the value to toggle the tabs.
		*/
		this.state = {
			tab_toggle: props.location.pathname && (props.location.pathname.search('/users/') > -1) ? 'user' : (props.location.pathname && (props.location.pathname.search('/user-groups/') > -1) ? 'user_group' : (props.location.pathname && (props.location.pathname.search('/roles/') > -1) ? 'role' : 'user'))
		};
	}
	/**
	 * This function changes the toggles between the tabs.
	 */
	changeGroup(key, update = false) {
		console.log('in changeGroup',key);
		console.log('in changeGroup',update);
		let search = this.state.table_search;
		this.setState({
			tab_toggle: key,
			table_search: update ? '' : search
		}, () => {
			if (this.state.tab_toggle == 'user_group') {
				this.props.history.push('/settings/user-groups/');
			} else if (this.state.tab_toggle == 'user') {
				this.props.history.push('/settings/users/');
			} else if (this.state.tab_toggle == 'role') {
				this.props.history.push('/settings/roles/');
			}
		});
	}
	/**
	 * This renders entire class with navigation bar.
	 * @return {ReactElement} markup
	 */
	render () {

		return (
			<div id="user">
				<Side active_link="user" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<div>
								<div role="tablist" className="station-tabs-bar">
									<div className="station-tabs-nav-scroll">
										<div className="station-tabs-nav station-tabs-nav-animated">
											<div>
												<div role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/users/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('user')}>Users</div>
												<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/user-groups/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('user_group')}>User Group</div>
												<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/roles/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('role')}>Roles</div>
											</div>
												<div className="blank-border"></div>
										</div>
									</div>
								</div>
								<div className="station-view">
									{(() => {
										if (this.props.location.pathname && (this.props.location.pathname.search('/roles/') > -1)) {
											console.log('render 2');
											return <RolesPage  {...this.props}/>;
										} else if (this.props.location.pathname && (this.props.location.pathname.search('/user-groups/') > -1)) {
											console.log('render 3');
											return <UserGroupsPage  {...this.props}/>;
										} else if (this.props.location.pathname && (this.props.location.pathname.search('/users/') > -1)) {
											console.log('render 4');
											return <UsersPage  {...this.props}/>;
										}/* else {
											console.log('render 4');
											return <Loading iniline={true} />;
										}*/
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