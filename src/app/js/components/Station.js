import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Drawer, Form, Select, TreeSelect, Card, Tooltip, Menu, Dropdown, Modal, Popconfirm, notification } from 'antd';
// import './css/style.less';
import Head from './imports/Head';
import Side from './imports/Side';
import Loading from './imports/Loading';
import StationGroup from './imports/StationGroup';
import StationPage from './imports/StationPage';

// import queryString from 'query-string';

const queryString = require('query-string');

const TabPane = Tabs.TabPane;

const { Option } = Select;

const confirm = Modal.confirm;

const { Content } = Layout;
/**
 * Main component for the station page.
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
		* @property {string} station_group_toggle used to store the value to toggle the tabs.
		*/
		this.state = {
			station_group_toggle: props.location.pathname && (props.location.pathname.search('/stations/') > -1) ? 'station' : (props.location.pathname && (props.location.pathname.search('/station-groups/') > -1) ? 'stationGroup' : 'station')
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
			station_group_toggle: key,
			table_search: update ? '' : search
		}, () => {
			if (this.state.station_group_toggle == 'stationGroup') {
				this.props.history.push('/settings/station-groups/');	
			} else if (this.state.station_group_toggle == 'station') {
				this.props.history.push('/settings/stations/');
			}
		});
	}
	/**
	 * This renders entire class with navigation bar.
	 * @return {ReactElement} markup
	 */
	render () {

		return (
			<div id="station">
				<Side active_link="station" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<div>
								<div role="tablist" className="station-tabs-bar">
									<div className="station-tabs-nav-scroll">
										<div className="station-tabs-nav station-tabs-nav-animated">
											<div>
												<div role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/stations/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('station')}>Station</div>
												<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/station-groups/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeGroup('stationGroup')}>Station Group</div>
											</div>
												<div className="blank-border"></div>
										</div>
									</div>
								</div>
								<div className="station-view">
									{(() => {
										console.log('render 1');
										if (this.props.location.pathname && (this.props.location.pathname.search('/stations/') > -1)) {
											console.log('render 2');
											return <StationPage  {...this.props}/>;
										} else if (this.props.location.pathname && (this.props.location.pathname.search('/station-groups/') > -1)) {
											console.log('render 3');
											return <StationGroup  {...this.props}/>;
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