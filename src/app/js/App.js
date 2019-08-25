/* @flow */

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import * as React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Error404 from './components/Error404';
import Dashboard from './components/Dashboard';
import Forecast from './components/Forecast';
import Device from './components/Device';
import MapView from './components/MapView';
import Station from './components/Station';
import Users from './components/Users';
import Reports from './components/Reports';
import AutomaticAlerts from './components/AutomaticAlerts';
import ManualAlerts from './components/ManualAlerts';
import Archive from './components/Archive';
import FloodModel3rdParty from './components/FloodModel3rdParty';
import SlideShow from './components/SlideShow';
import MyCode from './components/MyCode';

// import Users from './components/Users';

const pjson = require('../../../package.json');

type Props = {};

type State = {};

export default class App extends React.Component<Props,State> {
	baseName: string ;
	constructor(): void {
		super();
		this.state = {};
		window.color_code= {
			color_1: '#00b050',
			color_2: '#92d050',
			color_3: '#ffff00',
			color_4: '#ff9900',
			color_5: '#ff0000',
			color_6: '#c00000'
		};
		this.baseName = '';
		if ('##PR_STRING_REPLACE_APP_BASE_PATH##' === 'stage') {
			this.baseName = '';
		} else if ('##PR_STRING_REPLACE_APP_BASE_PATH##' === 'deploy' && pjson.scripts.deploy_at == 'phoenixrobotix') {
			let client_slug = document.getElementById('client_slug');
			if (client_slug && typeof(client_slug.value) == 'string') {
				this.baseName = '/enterprise/' + client_slug.value + '/flood-monitoring/test/##PR_STRING_REPLACE_APP_VERSION_SLUG##';
			}
		}
	}

	componentDidMount() :void {
		let tout= null;
		if (!window.showPopup && document.getElementById('popup_alert') && document.getElementById('popup_alert_msg')) {
			window.showPopup = (type : string, message : string, timeout) => {
				if (!timeout) {timeout=5000;}
				let alert_msg = document.getElementById('popup_alert_msg');
				let popup_alert = document.getElementById('popup_alert');
				
				if(type != null && popup_alert){
					popup_alert.className = 'alert alert-'+type+' active';
				}
				if(message != null && alert_msg){
					alert_msg.innerHTML = message;
				}
				tout = setTimeout(() => {
					window.hidePopup();
				}, timeout);
				console.log('Message:',message);
			};
		}
		if (!window.hidePopup && document.getElementById('popup_alert')) {
			//let popup_alert = document.getElementById('popup_alert');
			window.hidePopup = () => {
				if(document.getElementById('popup_alert')){
					console.log('popup_alert', popup_alert);
					document.getElementById('popup_alert').className = 'alert';
					console.log('popup_alert', popup_alert);
				}
				if(tout != null){
					clearTimeout(tout);				
				}
			};
		}
	}

	render() {
		return <div className="App">
			<Router basename={this.baseName}>
				<Switch>
					<Route exact path='/' component={Dashboard}/>
					<Route exact path='/stations/:station_id/24-hours-trend/' component={Dashboard}/>
					<Route exact path='/stations/:station_id/' component={Dashboard}/>
					{/*<Route exact path='/users' component={Users}/>
					<Route exact path='/users/' component={Users}/>*/}
          			<Route exact path="/forecast" component={Forecast}/>
          			{/*<Route exact path="/reports/" component={Reports}/>*/}
          			<Route exact path="/archive/" component={Archive}/>
          			<Route exact path="/forecast/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/temperature/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/rainfall/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/cloud-cover/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/humidity/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/wind-speed/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/wind-direction/:category_slug/:content_slug" component={Forecast}/>
          			<Route exact path="/forecast/humidity/" component={Forecast}/>
          			<Route exact path="/forecast/rainfall/" component={Forecast}/>
          			<Route exact path="/forecast/cloud-cover/" component={Forecast}/>
          			<Route exact path="/forecast/temperature/" component={Forecast}/>
          			<Route exact path="/forecast/wind-speed/" component={Forecast}/>
          			<Route exact path="/forecast/wind-direction/" component={Forecast}/>
          			<Route exact path="/devices/" component={Device}/>
          			<Route exact path="/devices/type/:type_id" component={Device}/>
          			<Route exact path="/devices/:percent" component={Device}/>
          			<Route exact path="/devices/type/:type_id/:percent" component={Device}/>
          			<Route exact path="/scenarios" component={MapView}/>
          			{/*<Route exact path="/scenarios/stations/:station_id" component={MapView}/>*/}
          			<Route exact path="/scenarios/stations/:station_id/" component={MapView}/>
          			<Route exact path="/settings/stations/" component={Station}/>
          			<Route exact path="/settings/stations/:station_id/limit/" component={Station}/>
          			<Route exact path="/settings/station-groups/" component={Station}/>
          			<Route exact path="/settings/station-groups/add/" component={Station}/>
          			<Route exact path="/settings/station-groups/:station_id/edit/" component={Station}/>
          			<Route exact path="/settings/station-groups/:station_id/delete/" component={Station}/>
          			<Route exact path="/settings/roles/" component={Users}/>
          			<Route exact path="/settings/roles/:role_id/delete/" component={Users}/>
          			<Route exact path="/settings/roles/:role_id/edit/" component={Users}/>
          			<Route exact path="/settings/roles/add/" component={Users}/>
          			<Route exact path="/settings/user-groups/" component={Users}/>
          			<Route exact path="/settings/user-groups/add/" component={Users}/>
          			<Route exact path="/settings/user-groups/:group_id/edit/" component={Users}/>
          			<Route exact path="/settings/user-groups/:group_id/delete/" component={Users}/>
          			<Route exact path="/settings/users/" component={Users}/>
          			<Route exact path="/settings/users/add/" component={Users}/>
          			<Route exact path="/settings/users/:user_id/edit/" component={Users}/>
          			<Route exact path="/settings/users/:user_id/delete/" component={Users}/>
          			<Route exact path="/settings/users/:user_id/set-status/" component={Users}/>
          			<Route exact path="/settings/alerts/automatic/list" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/list/" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/details" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/details/" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/rule-add" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/rule-add/" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/rule/:rule_id/edit" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/automatic/:alert_id/rule/:rule_id/edit/" component={AutomaticAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/list" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/list/" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/sent-list" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/sent-list/" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/:template_id/send-alert" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/:template_id/send-alert/" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/new" component={ManualAlerts}/>
          			<Route exact path="/settings/alerts/manual/templates/new/" component={ManualAlerts}/>
          			<Route exact path="/slide-show" component={SlideShow}/>
          			<Route exact path="/slide-show/" component={SlideShow}/>
          			<Route exact path="/flood-model" component={FloodModel3rdParty}/>
          			<Route exact path="/flood-model/" component={FloodModel3rdParty}/>
					<Route component={Error404} />
				</Switch>
			</Router>
		</div>;
	}
}