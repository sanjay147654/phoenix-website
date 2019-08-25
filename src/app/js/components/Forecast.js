import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Table, Modal, notification, Alert, Spin, Card } from 'antd';
import Head from './imports/Head';
import Side from './imports/Side';
import Loading from './imports/Loading';
import ForecastTrend from './imports/ForecastTrend';

import ReactImageZoom from 'react-image-zoom';
import Lightbox from 'react-image-lightbox';
// import 'react-image-lightbox/style.css';

const { Content } = Layout;
const Option = Select.Option;

const renderContent = (value, row, index) => {
	const obj = {
		children: value,
		props: {},
	};
	return obj;
};

const columns = [{
	title: 'Parameters',
	dataIndex: 'parameter',
	render: renderContent,
	className: 'bold',
}, {
	title: 'DAY-1 | 28 / 8',
	dataIndex: 'model1',
	width: 140,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-2 | 29 / 8',
	dataIndex: 'model2',
	width: 140,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-3 | 30 / 8',
	dataIndex: 'model3',
	width: 140,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-4 | 31 / 8',
	dataIndex: 'model4',
	width: 140,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-5 | 01 / 9',
	dataIndex: 'model5',
	width: 140,
	render: renderContent,
	align: 'center',
}];

const data = [{
	key: '1',
	parameter: 'Rainfall (mm)',
	model1: 1,
	model2: 0,
	model3: 0,
	model4: 0,
	model5: 13,
}, {
	key: '2',
	parameter: 'Max Temperature (deg C)',
	model1: 26,
	model2: 25,
	model3: 25,
	model4: 23,
	model5: 22,
}, {
	key: '3',
	parameter: 'Min Temperature (deg C)',
	model1: 19,
	model2: 19,
	model3: 19,
	model4: 19,
	model5: 18,
}, {
	key: '4',
	parameter: 'Total cloud cover (octa)',
	model1: 6,
	model2: 3,
	model3: 4,
	model4: 4,
	model5: 7,
}, {
	key: '5',
	parameter: 'Max Relative Humidity (%)',
	model1: 99,
	model2: 97,
	model3: 90,
	model4: 91,
	model5: 99,
}, {
	key: '6',
	parameter: 'Min Relative Humidity (%)',
	model1: 78,
	model2: 76,
	model3: 69,
	model4: 67,
	model5: 75,
}, {
	key: '7',
	parameter: 'Wind speed (kmph)',
	model1: 16,
	model2: 13,
	model3: 12,
	model4: 8,
	model5: 7,
}, {
	key: '8',
	parameter: 'Wind direction (deg)',
	model1: 156,
	model2: 202,
	model3: 283,
	model4: 261,
	model5: 195,
}];
/**
 * The main component of the forecast page.
 */
class Forecast extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * Thse state of the component.
		 * @type {Object}
		 * @property {string} category_slug slug of the category for usr in url.
		 * @property {string} content_slug slug of the content for usr in url.
		 * @property {string} group_tab used for tab switching.
		 */
		this.state = { 
			visible: false,
			imgPath: 'http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg',
			modal_title: '',
			category_slug: props.match.params.category_slug ? props.match.params.category_slug : '',
			content_slug: props.match.params.content_slug ? props.match.params.content_slug : '',
			group_tab: props.location.pathname && (props.location.pathname.search('/rainfall/') > -1) ? 'rainfall' : (props.location.pathname && (props.location.pathname.search('/temperature/') > -1) ? 'temperature' : (props.location.pathname && (props.location.pathname.search('/cloud-cover/') > -1) ? 'cloud-cover' : (props.location.pathname && (props.location.pathname.search('/humidity/') > -1) ? 'humidity' : (props.location.pathname && (props.location.pathname.search('/wind-speed/') > -1) ? 'wind-speed' : (props.location.pathname && (props.location.pathname.search('/wind-direction/') > -1) ? 'wind-direction' : 'rainfall'))))),
			unauthorised_access_chart: false,
			unauthorised_access_chart_msg: '',
			unauthorised_access_categories: false,
			unauthorised_access_categories_msg: ''
		}
	}
	/**
	 * This function sets the state to display the image in a modal.
	 * @param  {string} imgLink       image link
	 * @param  {string} title         image title
	 * @param  {string} category_slug slug to make the url.
	 * @param  {string} content_slug  slug to make the url
	 */
	showModal(imgLink, title, category_slug, content_slug) {

		this.setState({
			visible: true,
			imgPath: imgLink,
			modal_title: title,
			category_slug: category_slug,
			content_slug: content_slug,
			loading: true
		},() => {
			this.props.history.push('');
			this.props.history.push('/forecast/'+ this.state.group_tab + '/' + this.state.category_slug + '/' + this.state.content_slug);
		});
	}
	/**
	 * Predefined function of ReactJS. This is called before the component gets mounted.
	 */
	componentWillMount() {
		this.retriveData();
		this.retriveDataCategories();
	}
	/**
	 * This function calls the notification alert.
	 * @param  {String}	type
	 * @param  {String}	msg
	 * @return {void}
	 */
	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
			// duration: 120,
		});
	};
	/**
	 * This function gets the data from the API.
	 */
	retriveDataCategories() {
		let that = this;
		let response_status;
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/forecast/details', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			response_status = Response.status;
			return Response.json();
		}).then(function(json) {
			// response_status = 403;
			if (response_status == 403) {
				that.setState({
					unauthorised_access_chart: true,
					unauthorised_access_chart_msg: json.message
				});
			}
			else if (json.status === 'success') {
				that.setState({
					unauthorised_access_chart: false,
					categories: json.categories
				}, () => {
					console.log('data forecast categories', that.state.categories);
					that.showModalOnStart();
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					unauthorised_access_chart: false,
					alert: true
				});
				// showPopup('danger',json.message);
				// that.setState({loading_data: null});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
			that.setState({
				alert: true
			});
			// showPopup('danger','Unable to load data!');
			// that.setState({loading_data: null});
		});
	}

	/**
	 * This function gets the data from the API for displaying in the charts.
	 */
	retriveData() {
		let that = this;
		let response_status;
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/forecast/table', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			response_status = Response.status;
			return Response.json();
		}).then(function(json) {
			// response_status = 403;
			if (response_status == 403) {
				that.setState({
					unauthorised_access_categories: true,
					unauthorised_access_categories_msg: json.message
				});
			}
			else if (json.status === 'success') {
				let x_axis_labels = [];
				if (json.columns && json.columns.length) {
					json.columns.map((param) => {
						if (param.title != 'Parameters') {
							x_axis_labels.push(param.title);
						}
					});
				}
				that.setState({
					unauthorised_access_categories: false,
					issued_on: json.issued_on,
					footer: json.footer,
					columns: json.columns,
					data: json.data,
					title: json.title,
					x_axis_labels: x_axis_labels,
				}, () => {
					console.log('data forecast', that.state);
				});
			} else {
				that.openNotification('error', json.message);
				that.setState({
					unauthorised_access_categories: false
				});
				// showPopup('danger',json.message);
				// that.setState({loading_data: null});
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
			// showPopup('danger','Unable to load data!');
			// that.setState({loading_data: null});
		});
	}
	/**
	 * Predefined function of ReactJS. This is called just after the component gets mounted.
	 */
	componentDidMount() {
		document.title = 'Forecast - Flood Forecasting and Early Warning System for Kolkata City';
		
	}
	/**
	 * This function is called when the page is loaded and the modal is to be displayed
	 */
	showModalOnStart() {
		if (this.state.category_slug && this.state.content_slug && this.state.category_slug != '' && this.state.content_slug != '') {
			let img_link, title = '', category_slug, content_slug;
			//this.props.history.push('fore');
			if (this.state.categories && this.state.categories.length) {
				this.state.categories.map((cat) => {
					if (cat.slug == this.state.category_slug) {
						title = cat.name;
						category_slug = cat.slug;
						if (cat.contents && cat.contents.length) {
							cat.contents.map((content) => {
								if (content.slug == this.state.content_slug) {
									title = title + ' - ' + content.name;
									img_link = content.url;
									content_slug = content.slug;
								}
							});
						}
					}
				});
			}
			if (img_link != '' && title != '') {
				this.showModal(img_link, title, category_slug, content_slug);
			}
		}
	}
	/**
	 * This function hides the modal.
	 */
	hideModal() {
		this.setState({
			visible: false,
			/*imgPath: '',
			modal_title: ''*/
		}, () => {
			// this.props.history.push('');
			this.props.history.push('/forecast/' + this.state.group_tab + '/');
		});
	}

	/*onClose() {
		console.log('close clicked');
	}*/

	/*hideLoadAnim() {
		this.setState({ 
			loading: false 
		});
	}*/

	/**
	 * This function changes the tab for the 5 days prediction.
	 * @param  {string}  key    
	 * @param  {Boolean} update 
	 */
	changeTab(key, update = false) {
		console.log('in changeGroup',key);
		console.log('in changeGroup',update);
		let search = this.state.table_search;
		this.setState({
			group_tab: key
		}, () => {
			if (this.state.group_tab == 'rainfall') {
				this.props.history.push('/forecast/rainfall/' + this.props.history.location.search);
			} else if (this.state.group_tab == 'temperature') {
				this.props.history.push('/forecast/temperature/' + this.props.history.location.search);
			} else if (this.state.group_tab == 'cloud-cover') {
				this.props.history.push('/forecast/cloud-cover/' + this.props.history.location.search);
			} else if (this.state.group_tab == 'humidity') {
				this.props.history.push('/forecast/humidity/' + this.props.history.location.search);
			} else if (this.state.group_tab == 'wind-speed') {
				this.props.history.push('/forecast/wind-speed/' + this.props.history.location.search);
			} else if (this.state.group_tab == 'wind-direction') {
				this.props.history.push('/forecast/wind-direction/' + this.props.history.location.search);
			}
		});
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render () {
		return (
			<div id="forecast">
				<Side active_link="forecast" />
				<Head/>
				<Layout>
					<Layout>
						<Content className="contains">
							<div className="contain back-transparant">
								{(() => {
									if (this.state.columns && this.state.columns.length) {
										return <div className="white">
											<Row>
												<div className="float-l bold">{this.state.title}</div>
												<div className="float-r">{'ISSUED ON: ' + this.state.issued_on}</div>
											</Row>
											<Row className="rows">
												<div>
													<div role="tablist" className="station-tabs-bar">
														<div className="station-tabs-nav-scroll">
															<div className="station-tabs-nav station-tabs-nav-animated">
																<div>
																	<div role="tab" aria-disabled="false" aria-selected="true" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/rainfall/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('rainfall')}>Rainfall</div>
																	<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/temperature/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('temperature')}>Temperature</div>
																	<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/cloud-cover/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('cloud-cover')}>Cloud cover</div>
																	<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/humidity/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('humidity')}>Relative Humidity</div>
																	<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/wind-speed/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('wind-speed')}>Wind Speed</div>
																	<div role="tab" aria-disabled="false" aria-selected="false" className={'station-tabs station-tabs-tab' + (this.props.location.pathname && (this.props.location.pathname.search('/wind-direction/') > -1) ? ' station-tabs-tab-active' : '')} onClick={() => this.changeTab('wind-direction')}>Wind Direction</div>
																</div>
																	<div className="blank-border"></div>
															</div>
														</div>
													</div>
													<div className="station-view">
														<ForecastTrend chartType={this.state.group_tab} x_axis_labels={this.state.x_axis_labels} data={this.state.data}/>
														{/*(() => {
															if (this.props.location.pathname && (this.props.location.pathname.search('/cloud-cover/') > -1)) {
																console.log('render 2');
																return <ForecastTrend chartType={this.state.group_tab} data={this.state.data}/>;
															} else if (this.props.location.pathname && (this.props.location.pathname.search('/rainfall/') > -1)) {
																console.log('render 3');
																return <ForecastTrend chartType={this.state.group_tab} data={this.state.data}/>;
															} else if (this.props.location.pathname && (this.props.location.pathname.search('/temperature/') > -1)) {
																console.log('render 4');
																return <ForecastTrend chartType={this.state.group_tab} data={this.state.data}/>;
															} else if (this.props.location.pathname && (this.props.location.pathname.search('/humidity/') > -1)) {
																console.log('render 5');
																return <ForecastTrend chartType={this.state.group_tab} data={this.state.data}/>;
															}
														})()*/}
													</div>
												</div>
											</Row>
											<Row>
												<div className="float-l all-caps mar-top-45">{this.state.footer}</div>
											</Row>
										</div>;
									} else if (this.state.columns && this.state.columns.length == 0) {
										return <div className="white"><div className="no-data-text">No data available!</div></div>;
									} else if (this.state.unauthorised_access_chart) {
										return <div className="white">
											<div className="no-data-text">
												<Alert
													message="Access Denied"
													description={this.state.unauthorised_access_chart_msg}
													type="error"
												/>
											</div>
										</div>;
									} else {
										return <div className="white"><Loading is_inline={true} /></div>;
									}
								})()}
								{(() => {
									if (this.state.categories && this.state.categories.length) {
										return this.state.categories.map((category, index) => {
											return <Row className={'mar-top-45' + (index > 0 ? ' mar-bot-35' : '')}>
												<Row type="flex" justify="space-between">
													<Card title={category.name} bordered={false} className="card-grid-wrapper">
														{/*<div className='hed'>{category.name}</div>*/}
														{/*<Row type="flex" justify="space-between">*/}
															{(() => {
																if (category.contents && category.contents.length) {
																	return category.contents.map((content) => {
																		return <Card.Grid className="grid-style" onClick={() => this.showModal(content.url, category.name + ' - ' + content.name, category.slug, content.slug)}>
																			<div className="card-head hellip">{content.name}</div>
																			<div className="card-body">
																				<img  src={content.url} className="live-img"/>
																			</div>
																			{/*<Col span={5} className="center">
																				<img src={content.url} onClick={() => this.showModal(content.url, category.name + ' - ' + content.name, category.slug, content.slug)} className="live-img"/>
																				<div>{content.name}</div>
																			</Col>*/}
																			</Card.Grid>;
																	}).filter(Boolean);
																}
															})()}
														{/*</Row>*/}
													</Card>
												</Row>
											</Row>
										}).filter(Boolean);
									} else if (this.state.categories && this.state.categories.length == 0) {
										return <div className="white"><div className="no-data-text">No data available!</div></div>;
									} else if (this.state.unauthorised_access_categories) {
										return <div className="white">
											<div className="no-data-text">
												<Alert
													message="Access Denied"
													description={this.state.unauthorised_access_categories_msg}
													type="error"
												/>
											</div>
										</div>;
									} else {
										return <div className="white"><Loading is_inline={true} /></div>;
									}
								})()}
								
								{/*<Row className="mar-top-45 white mar-bot-35">
									<div className='hed'>Rainfall Forecast</div>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg", 'Rainfall Forecast - 3 Hour')} className="live-img"/>
											<div>3 Hour</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif", 'Rainfall Forecast - Tomorrow')} className="live-img"/>
											<div>Tomorrow</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif", 'Rainfall Forecast - Day 2')} className="live-img"/>
											<div>Day 2</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif", 'Rainfall Forecast - Day 3')} className="live-img"/>
											<div>Day 3</div>
										</Col>
									</Row>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif", 'Rainfall Forecast - Day 4')} className="live-img"/>
											<div>Day 4</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif", 'Rainfall Forecast - Day 5')} className="live-img"/>
											<div>Day 5</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif", 'Rainfall Forecast - Day 6')} className="live-img"/>
											<div>Day 6</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif", 'Rainfall Forecast - Day 7')} className="live-img"/>
											<div>Day 7</div>
										</Col>
									</Row>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif", 'Rainfall Forecast - Day 8')} className="live-img"/>
											<div>Day 8</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif", 'Rainfall Forecast - Day 9')} className="live-img"/>
											<div>Day 9</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif" onClick={() => this.showModal('http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif', 'Rainfall Forecast - Day 10')} className="live-img"/>
											<div>Day 10</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://www.monsoondata.org/wx2/kolkgfs.png" onClick={() => this.showModal('http://www.monsoondata.org/wx2/kolkgfs.png', 'Rainfall Forecast - Meteogram')} className="live-img"/>
											<div>Meteogram</div>
										</Col>
									</Row>
								</Row>*/}
								{/*<Row className="mar-top-45 white mar-bot-35">
									<div className='hed'>Temperature Forecast</div>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://www.monsoondata.org/wx2/ezindia4_day1.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/ezindia4_day1.png")} className="live-img"/>
											<div>East</div>
										</Col>
									</Row>
								</Row>*/}
							</div>
						</Content>
					</Layout>
				</Layout>
				{/*<Modal
					className="forecast-modal"
					title={this.state.modal_title}
					visible={this.state.visible}
					onCancel={() => this.hideModal()}
				>
					<Spin spinning={this.state.loading} size="large">*/}
						{/*<ReactImageZoom onClick={() => console.log('hiiii')} className="modal-img" width={472} offset={{"vertical":0,"horizontal":10}} zoomLensStyle="opacity: 0.5;background-color: gray;cursor: zoom-in;" zoomWidth={500} img={this.state.imgPath} />*/}
						{(() => {
							if (this.state.visible) {
								return <Lightbox
									mainSrc={this.state.imgPath}
									onCloseRequest={() => this.hideModal()}
									imageTitle={this.state.modal_title}
									// imagePadding={50}
								/>
							}
						})()}
						{/*<img src={this.state.imgPath} onLoad={() =>this.hideLoadAnim()} className="modal-img"/>*/}
						{/*<img src={this.state.imgPath} className="modal-img"/>*/}
					{/*</Spin>
				</Modal>*/}
			</div>
		);
	}
}

export default Forecast;