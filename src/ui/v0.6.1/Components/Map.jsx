import React from 'react';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Tooltip, Menu, DatePicker, notification } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

const google = window.google;

const TabPane = Tabs.TabPane;

const mapMenu = Menu.SubMenu;

const { RangePicker } = DatePicker;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const treeData = [{
	title: 'Air Quality',
	value: '0-0',
	key: '0-0',
	children: [{
		title: 'Major Road Junction',
		value: '0-0-0',
		key: '0-0-0',
	}, {
		title: 'Street / Shop / House Front',
		value: '0-0-1',
		key: '0-0-1',
	}],
}, {
	title: 'Flood',
	value: '0-1',
	key: '0-1',
	children: [{
		title: 'Pump Station',
		value: '0-1-0',
		key: '0-1-0',
	}, {
		title: 'Open Canal',
		value: '0-1-1',
		key: '0-1-1',
	}, {
		title: 'Gated Canal',
		value: '0-1-2',
		key: '0-1-2',
	}, {
		title: 'Street',
		value: '0-1-3',
		key: '0-1-3',
	}, {
		title: 'Rainfall',
		value: '0-1-4',
		key: '0-1-4',
	}],
}, {
	title: 'Vehicle Tracking',
	value: '0-2',
	key: '0-2',
	children: [{
		title: 'Bus',
		value: '0-2-0',
		key: '0-2-0',
	}],
}];

function callback(key) {
	console.log(key);
}


const { Content, Footer } = Layout;

const Option = Select.Option;

function handleChange(value) {
	console.log(`selected ${value}`);
}

function handleBlur() {
	console.log('blur');
}

function handleFocus() {
	console.log('focus');
}

export default class Map extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			visible: true,
			value: ['0-0-0'],
		};
		/**
		* This is used for bind the all stations data.
		* @type {object}
		*/
		this.map_view = false;
		this.myStyles = [
			{
				"featureType": "administrative",
				"elementType": "geometry",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "poi",
				"elementType": "labels",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "labels.icon",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "transit",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			}
		];
		this.locations= [
			{id:'1', name:'Bhubaneswar-1', lat:'20.2972', long:'85.8665'},
			{id:'2', name:'Bhubaneswar-2', lat:'20.3588', long:'85.8333'},
			{id:'3', name:'Bhubaneswar-3', lat:'20.2718', long:'85.8439'},
			{id:'4', name:'Bhubaneswar-4', lat:'20.2525', long:'85.8159'}
		];
	}

	mapView() {
		let that = this;
		that.map_view = true;
		let city_lat = 20.2972, city_long = 85.8665, zoom_lvl=10;

		var mapProp= {
			center:new google.maps.LatLng(parseFloat(city_lat), parseFloat(city_long)),
			zoom:parseInt(zoom_lvl),
			styles: that.myStyles
		};
		/**
		 * This is used for generating google map.
		 */
		if (document.getElementById('mapView')) {
			that.map=new google.maps.Map(document.getElementById('mapView'),mapProp);
		}

		console.log('mapProp', mapProp);
	}

	componentDidUpdate() {
		// let google;
		if(this.locations) {
			this.locations.map((point) => {
				var marker_lat_long = new google.maps.LatLng(point.lat, point.long);
				// console.log(point.lat, point.long);
				var marker_icon = '';
				if (point.connection_status === 'online') {
					if(point.aqi_range == 1) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-1.png';
					} else if(point.aqi_range == 2) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-2.png';
					} else if(point.aqi_range == 3) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-3.png';
					} else if(point.aqi_range == 4) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-4.png';
					} else if(point.aqi_range == 5) {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-5.png';
					} else {
						marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-6.png';
					}
				} else {
					marker_icon = 'https://static.aurassure.com/imgs/dashboard/location-status/new-marker/location-status-0.png';
				}

				var marker = new google.maps.Marker({
					position: marker_lat_long,
					map: this.map,
					title: point.name,
					icon: marker_icon
				});
				// console.log('marker_icon', marker);s
				let content = '', circle_class = '';
				let dashboard_map_pointer = new google.maps.InfoWindow();
				google.maps.event.addListener(marker, 'click',function() {
					if (point.connection_status =='online') {
						circle_class = 'online';
					} else {
						circle_class = 'offline';
					}

					content = '<div class="pointer-details">';
					content += '<div class="flex">';
					content += '<div class="circle center '+ circle_class +'"></div>';
					content += '<div class="qr-code">'+point.name+'</div>';
					content += '</div>';
					dashboard_map_pointer.setContent(content);
					dashboard_map_pointer.open(this.map, marker);
				})
				// google.maps.event.addListener(marker,'click',function() {
				// 	that.fetchStationData(point.id);
				// 	that.context.router.transitionTo('/stations/'+point.id);
				// });
			});
		}
	}

	componentDidMount() {
		if (this.refs.chart) {
			let chart = this.refs.chart.getChart();
			chart.series[0].addPoint({x: 10, y: 12});
		}
		if (document.getElementById('mapView')) {
			this.mapView();
		}
	}

	treeSelect (e) {
		console.log(e);
	}

	onChange = (value) => {
		console.log('onChange ', value);
		this.setState({ value });
	}

	render () {
		const { size } = this.state;
		const tProps = {
			treeData,
			value: this.state.value,
			onChange: this.onChange,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Pumping Station',
		};

		return (
			<div id="map">
				<Side active_link="dashboard" />
				<Head/>
				<Layout>
					<Layout>
						<Content className="contains">
							<div className="contain">
								<Row className="rows" className="top-0">
									<Col className="city-select" span={10}>
										<TreeSelect treeDefaultExpandAll onChange={this.treeSelect} {...tProps} style={{ width: 500 }} />
									</Col>
								</Row>
								<Row className="rows" type="flex" justify="space-around">
									<Col className="cols map-container" span={24}>
										<div className="full-height" id="mapView" />
									</Col>
								</Row>
							</div>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}