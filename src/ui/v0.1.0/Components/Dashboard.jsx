import React from 'react';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect } from 'antd';
import './dashboard.less';
import Head from './Head.jsx';
import Side from './Side.jsx';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

const google = window.google;

const TabPane = Tabs.TabPane;

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

HighchartsMore(ReactHighcharts.Highcharts);
HighchartsSolidGauge(ReactHighcharts.Highcharts);

const config = {
	chart: {
		type: 'column',
		height: 100,
		width: 250
	},
	plotOptions: {
		series: {
			pointPadding: 0,
			groupPadding: 0
		}				
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		title: {
			enabled: true,
			text: '',
			style: {
				fontWeight: 'normal'
			}
		},
		type: '',
		lineWidth: 0,
		minorGridLineWidth: 0,
		lineColor: 'transparent',
		labels: {
			enabled: false
		},
		minorTickLength: 0,
		tickLength: 0,
	},
	yAxis: {
		title: {
			text: ''
		},
		lineWidth: 0,
		minorGridLineWidth: 0,
		lineColor: 'transparent',
		labels: {
			enabled: false
		},
		minorTickLength: 0,
		tickLength: 0,
		gridLineColor: 'transparent'

	},
	xAxis: {
		title: {
			text: 'Past 24 hr Trend'
		},
		lineWidth: 0,
		minorGridLineWidth: 0,
		lineColor: 'transparent',
		labels: {
			enabled: false
		},
		minorTickLength: 0,
		tickLength: 0,
		gridLineColor: 'transparent'

	},
	legend: {
		enabled: false
	},
	tooltip: {
		pointFormat: '<span style="color:{point.color}">AQI <b>{point.y}</b> ({point.param})<br/></span>'
	},
					
	series: [{
		data: [67.0, 71.5, 106.4, 0.2, 144.0, 176.0, 0.6, 148.5, 216.4, 0.8, 0, 0, 219.4, 0.9, 120.8, 92.78, 0.9, 0.8, 0.1, 78.9, 92.0, 0.1, 56.9, 44.4]
	}]
};

const live_graph = {
	chart: {
		zoomType: 'x',
		height: 100,
		width: 800
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		type: 'datetime',
		text: 'Time'
	},
	yAxis: {
		title: {
			text: "cm"
		}
	},
	legend: {
		enabled: false
	},
	/*tooltip: {
		pointFormat: (this.state.current_param == 'rain' ? '<span style="color:{point.color}">' + ('Conc. ') + '<b>{point.y}</b> ' + unit + ' / ' + '<b>{point.y}</b> ' + 'mm' + '<br/>' : '<span style="color:{point.color}">' + (this.state.current_param === 'temperature' || this.state.current_param === 'humidity' || this.state.current_param === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b> ' + unit + '<br/>')
	},*/
	plotOptions: {
		area: {
			marker: {
				radius: 0
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},

	series: [{
		type: 'area',
		 data: [67.0, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.8, 95.6, 114.4, 219.4, 67.9, 120.8, 92.78, 87.9, 83.8, 111.1, 78.9, 92.0, 220.1, 56.9, 44.4]
	}]
};

const live_graph2 = {
	chart: {
		zoomType: 'x',
		height: 100,
		width: 695
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		type: 'datetime',
		text: 'Time'
	},
	yAxis: {
		title: {
			text: "cm"
		}
	},
	legend: {
		enabled: false
	},
	/*tooltip: {
		pointFormat: (this.state.current_param == 'rain' ? '<span style="color:{point.color}">' + ('Conc. ') + '<b>{point.y}</b> ' + unit + ' / ' + '<b>{point.y}</b> ' + 'mm' + '<br/>' : '<span style="color:{point.color}">' + (this.state.current_param === 'temperature' || this.state.current_param === 'humidity' || this.state.current_param === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b> ' + unit + '<br/>')
	},*/
	plotOptions: {
		area: {
			marker: {
				radius: 0
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},

	series: [{
		type: 'area',
		 data: [67.0, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.8, 95.6, 114.4, 219.4, 67.9, 120.8, 92.78, 87.9, 83.8, 111.1, 78.9, 92.0, 220.1, 56.9, 44.4]
	}]
};

const live_graph3 = {
	chart: {
		zoomType: 'x',
		height: 100,
		width: 695
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		type: 'datetime',
		text: 'Time'
	},
	yAxis: {
		title: {
			text: "cm"
		}
	},
	legend: {
		enabled: false
	},
	/*tooltip: {
		pointFormat: (this.state.current_param == 'rain' ? '<span style="color:{point.color}">' + ('Conc. ') + '<b>{point.y}</b> ' + unit + ' / ' + '<b>{point.y}</b> ' + 'mm' + '<br/>' : '<span style="color:{point.color}">' + (this.state.current_param === 'temperature' || this.state.current_param === 'humidity' || this.state.current_param === 'noise' ? 'Value ' : 'Conc. ') + '<b>{point.y}</b> ' + unit + '<br/>')
	},*/
	plotOptions: {
		area: {
			marker: {
				radius: 0
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},

	series: [{
		type: 'area',
		 data: []
	}]
};

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

/*const children = [];
for (let i = 1; i < 12; i++) {
	children.push(<Option key={'Device - ' + i}>{'Device - ' + i}</Option>);
}*/

class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			visible: true,
			rainfallVisible: false,
			pumpVisible: false,
			streetVisible: false,
			airqualityVisible: false,
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
			console.log('hii', mapProp);
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

	pumpShow (){
		this.setState({
			visible: false,
			pumpVisible: true,
		});
	};

	rainfallShow (){
		this.setState({
			visible: false,
			rainfallVisible: true,
		});
	};

	streetShow (){
		this.setState({
			visible: false,
			streetVisible: true,
		});
	};

	airShow (){
		this.setState({
			visible: false,
			airqualityVisible: true,
		});
	};

	showList (){
		this.setState({
			visible: true,
			pumpVisible: false,
			rainfallVisible: false,
			streetVisible: false,
			airqualityVisible: false,
		});
	};

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
			<div id="dashboard">
				<Side active_link="dashboard" />
				<Head/>
				<Layout>
					<Layout>
						<Content className="contains">
							{/*<Breadcrumb style={{ margin: '16px 0' }}>
								<Breadcrumb.Item>User</Breadcrumb.Item>
								<Breadcrumb.Item>Dashboard</Breadcrumb.Item>
							</Breadcrumb>*/}
							<div className="contain">
								<Row className="rows" className="top-0">
									<Col className="city-select" span={10}>
										<TreeSelect onChange={this.treeSelect} {...tProps} style={{ width: 500 }} />
										{/*<Select
										style={{ width: 400 }}
										placeholder="Pumping Station"
										onChange={handleChange}
										onFocus={handleFocus}
										onBlur={handleBlur}
										filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
										>
											<Option value="Pump Station-1">Pump Station-1</Option>
											<Option value="Pump Station-2">Pump Station-2</Option>
											<Option value="Pump Station-3">Pump Station-3</Option>
											<Option value="Pump Station-4">Pump Station-4</Option>
											<Option value="Pump Station-5">Pump Station-5</Option>
											<Option value="Pump Station-6">Pump Station-6</Option>
											<Option value="Pump Station-7">Pump Station-7</Option>
											<Option value="Pump Station-8">Pump Station-8</Option>
										</Select>*/}
									</Col>
								</Row>
								<Row className="rows" type="flex" justify="space-around">
									<Col className="cols map-container" span={16}>
										<div className="full-height" id="mapView" />
									</Col>
									{(() => {
										if (this.state.visible) {
											return <Col className="cols width-100 search" span={6}>
												<Select
												showSearch
												className="select-icon"
												placeholder="Search"
												onChange={handleChange}
												style={{ width: "100%" }}
												>
													<Option key="Pumping Station-1">Pumping Station-1</Option>
													<Option key="Pumping Station-2">Pumping Station-2</Option>
													<Option key="Pumping Station-3">Pumping Station-3</Option>
													<Option key="Pumping Station-4">Pumping Station-4</Option>
													<Option key="Pumping Station-5">Pumping Station-5</Option>
													<Option key="Pumping Station-6">Pumping Station-6</Option>
													<Option key="Pumping Station-7">Pumping Station-7</Option>
													<Option key="Pumping Station-8">Pumping Station-8</Option>
												</Select>
												<div className="device-details">
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Pumping Station-1</Col>
														<Col span={2} offset={2}><div className="danger-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.pumpShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Rainfall-1</Col>
														<Col span={2} offset={2}><div className="success-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.rainfallShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Street-1</Col>
														<Col span={2} offset={2}><div className="success-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.streetShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Airquality-1</Col>
														<Col span={2} offset={2}><div className="inactive-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.airShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Rainfall-2</Col>
														<Col span={2} offset={2}><div className="warning-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.rainfallShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Pumping Station-6</Col>
														<Col span={2} offset={2}><div className="danger-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.pumpShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Pumping Station-7</Col>
														<Col span={2} offset={2}><div className="inactive-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.pumpShow()}><Icon type="right" /></span></Col>
													</Row>
													<Row type="flex" justify="left" className="device-row">
														<Col span={14} offset={1} className="text-left">Pumping Station-8</Col>
														<Col span={2} offset={2}><div className="success-back dot"></div></Col>
														<Col span={1} offset={1}><span className="next-butn" onClick={() => this.pumpShow()}><Icon type="right" /></span></Col>
													</Row>
												</div>
											</Col>;
										}

										else if (this.state.pumpVisible) {
											return <Col className="cols width-100 back-grey" span={6}>
												<Row className="border-bot">
													<Col className="hed" span={17}>Pumping Station-1</Col>
													<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close-circle-o" /></span></Col>
												</Row>
												<Row className="status-contain">
													<div className="status-hed">
														<img src="http://127.0.0.1:8080/water_level.svg" className="status-img"/>
														Level Sensors
													</div>
													<Row type="flex" justify="space-around">
														<Col span={10}>
															<div className="status-value">833.90 cm</div>
															<div className="status-type">Sump</div>
														</Col>
														<Col span={10}>
															<div className="status-value">713.67 cm</div>
															<div className="status-type">Penstock</div>
														</Col>
													</Row>
												</Row>
												<Row className="status-contain no-border">
													<div className="status-hed">
														<img src="http://127.0.0.1:8080/pump.svg" className="status-img"/>
														Pump On/Off Status
														<div className="count">
															<span className="count-value success">2</span>
															<span>/14</span>
														</div>
													</div>
													<Row className="pump-names" type="flex" justify="space-around">
														<Col span={10} offset={2}>
															<Row type="flex" justify="left">
																<Col span={7}>P1 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P2 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P3 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7} className="success">P4 :</Col>
																<Col className="success" span={5} offset={2}>On</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P5 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P6 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P7 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
														</Col>
														<Col span={10}>
															<Row type="flex" justify="left">
																<Col span={7}>P1 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P2 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P3 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7} className="success">P4 :</Col>
																<Col className="success" span={5} offset={2}>On</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P5 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P6 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
															<Row type="flex" justify="left">
																<Col span={7}>P7 :</Col>
																<Col span={5} offset={2}>Off</Col>
															</Row>
														</Col>
													</Row>
													 <Button type="primary" className="more">More Details</Button>
												</Row>
											</Col>;
										}

										else if(this.state.rainfallVisible) {
											return <Col className="cols width-100 back-grey" span={6}>
												<Row className="border-bot">
													<Col className="hed" span={17}>Rainfall-1</Col>
													<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close-circle-o" /></span></Col>
												</Row>
												<Row className="status-contain">
													<div className="status-hed">
														<img src="http://127.0.0.1:8080/water_level.svg" className="status-img"/>
														Rainfall
													</div>
													<Row type="flex" justify="space-around">
														<Col span={10}>
															<div className="status-value">210.90 cm</div>
															<div className="status-type">Last Hour</div>
														</Col>
													</Row>
													<Row type="flex" justify="space-around mar-top-20">
														<Col span={10}>
															<div className="status-value">250.67 cm</div>
															<div className="status-type">Last 24 Hour</div>
														</Col>
													</Row>
												</Row>
												<Row className="status-contain no-border">
													<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
												</Row>
											</Col>;
										}

										else if(this.state.streetVisible) {
											return <Col className="cols width-100 back-grey" span={6}>
												<Row className="border-bot">
													<Col className="hed" span={17}>Street-1</Col>
													<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close-circle-o" /></span></Col>
												</Row>
												<Row className="status-contain mar-top-35">
													<Row type="flex" justify="space-around" align="middle">
														<Col span={10}>
															<img src="http://127.0.0.1:8080/street.svg" className="street-img"/>
														</Col>
														<Col span={9}>
															<div className="status-value">240 mm</div>
															<div className="status-type">Street Level</div>
														</Col>
													</Row>
												</Row>
												<Row className="status-contain no-border mar-top-20">
													<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
												</Row>
											</Col>;
										}

										else if(this.state.airqualityVisible) {
											return <Col className="cols width-100 back-grey airQuality" span={6}>
												<Row className="border-bot">
													<Col className="hed" span={17}>Airquality-1</Col>
													<Col className="close" span={2}><span className="close-butn" onClick={() => this.showList()}><Icon type="close-circle-o" /></span></Col>
												</Row>
												<Row className="status-contain">
													<div className="status-hed">
														<img src="http://127.0.0.1:8080/temp.svg" className="status-img"/>
														<span className="air-head">Temperature</span>
														<span className="symbol">32 °C</span>
													</div>
													<div className="status-hed">
														<img src="http://127.0.0.1:8080/humid.svg" className="status-img"/>
														<span className="air-head">Humidity</span>
														<span className="symbol">23 %</span>
													</div>
												</Row>
												<Row className="status-contain no-border">
													<div className="status-hed top-0">
														<img src="http://127.0.0.1:8080/dust.svg" className="status-img"/>
														<span className="air-head">Dust Parameters</span>
													</div>
													<Row type="flex" justify="space-around">
														<Col className="text-left mar-left-22" span={10}>PM <sub>1</sub></Col>
														<Col className="text-left" span={10}>32 °C</Col>
													</Row>
													<Row type="flex" justify="space-around">
														<Col className="text-left mar-left-22" span={10}>PM <sub>2.5</sub></Col>
														<Col className="text-left" span={10}>32 °C</Col>
													</Row>
													<Row type="flex" justify="space-around">
														<Col className="text-left mar-left-22" span={10}>PM <sub>10</sub></Col>
														<Col className="text-left" span={10}>32 °C</Col>
													</Row>
												</Row>
											</Col>;
										}
									})()}
								</Row>
							</div>
						</Content>
					</Layout>
				
					<Layout className="mobile-hide">
						<Content className="contains station-details">
							<div className='head'>Pumping Station-1</div>
							<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
								<Col span={24}>
									<Row className="back-transparant">
										<Col className="back-transparant">
											<Row className="white mar-bot-25">
												<div className="hed mar-20">24 hours trend for Sump</div>
												<div className="sump-graph">
													<ReactHighcharts config={live_graph} ref="chart"></ReactHighcharts>
												</div>
											</Row>
											<Row className="white">
												<div className="hed mar-20">24 hours trend for Pumps</div>
												<Row className="pump-graph">
													<Col className="pad-top-25 bold" span={3}>
														Pump-1
													</Col>
													<Col className="success pad-top-25" span={1}>
														ON
													</Col>
													<Col span={19}>
														<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
													</Col>
												</Row>
												<Row className="pump-graph">
													<Col className="pad-top-25 bold" span={3}>
														Pump-2
													</Col>
													<Col className="success pad-top-25" span={1}>
														ON
													</Col>
													<Col span={19}>
														<ReactHighcharts config={live_graph2} ref="chart"></ReactHighcharts>
													</Col>
												</Row>
												<Row className="pump-graph">
													<Col className="pad-top-25 bold" span={3}>
														Pump-3
													</Col>
													<Col className="danger pad-top-25" span={1}>
														OFF
													</Col>
													<Col span={19}>
														<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
													</Col>
												</Row>
												<Row className="pump-graph">
													<Col className="pad-top-25 bold" span={3}>
														Pump-4
													</Col>
													<Col className="danger pad-top-25" span={1}>
														OFF
													</Col>
													<Col span={19}>
														<ReactHighcharts config={live_graph3} ref="chart"></ReactHighcharts>
													</Col>
												</Row>
											</Row>
										</Col>
									</Row>
								</Col>
								{/*<Col className="white" span={7}>
									<Row>
										<div className="hed mar-20">Latest Events</div>
										<div className="center event-container">No latest events found.</div>
									</Row>
								</Col>*/}
							</Row>
						</Content>	
					</Layout>
				</Layout>
			</div>
		);
	}
}

export default Dashboard;