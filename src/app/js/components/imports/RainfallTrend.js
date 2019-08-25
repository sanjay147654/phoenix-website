import React from 'react';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment-timezone';
import _ from 'lodash';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Input } from 'antd';
/**
 * CLass for the trend shown for Rainfall stations.
 */
export default class RainfallTrend extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * State of the component
		 * @type {Object}
		 * @param {Array} rainfall_24_trend Data for rainfall trend.
		 * @param {Array} parameters Paremeters of rainfall type station.
		 */
		this.state = {
			rainfall_24_trend: props.rainfall_24_trend,
			parameters: props.parameters
		};
		/**
		 * Chart configuration
		 * @type {Object}
		 */
		this.config = null;
	}

	/**
	 * Predefined function of ReactJS.
	 * This function checks if this component needs to be updated and returns accordingly.
	 * @param  {Object}
	 * @return {Boolean}
	 */
	shouldComponentUpdate(nextProps) {
		if ((nextProps.rainfall_24_trend && nextProps.rainfall_24_trend[nextProps.rainfall_24_trend.length - 1] && this.props.rainfall_24_trend && this.props.rainfall_24_trend[this.props.rainfall_24_trend.length - 1] && (nextProps.rainfall_24_trend[nextProps.rainfall_24_trend.length - 1].timestamp != this.props.rainfall_24_trend[this.props.rainfall_24_trend.length - 1].timestamp))|| (nextProps.rainfall_24_trend && nextProps.rainfall_24_trend[nextProps.rainfall_24_trend.length - 1] && this.props.rainfall_24_trend && this.props.rainfall_24_trend[this.props.rainfall_24_trend.length - 1] && (nextProps.rainfall_24_trend[nextProps.rainfall_24_trend.length - 1].value != this.props.rainfall_24_trend[this.props.rainfall_24_trend.length - 1].value)) || (nextProps.rainfall_24_trend && this.state.rainfall_24_trend && !_.isEqual(this.state.rainfall_24_trend, nextProps.rainfall_24_trend)) || (nextProps.station_name && this.props.station_name && nextProps.station_name != this.props.station_name) || (nextProps.station_id && this.props.station_id && nextProps.station_id != this.props.station_id)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * This renders the main dashboard page with navigation bar.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		ReactHighcharts.Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});

		return<Row className="status-contain no-border">
			{(() => {
				if (this.props.rainfall_24_trend && this.props.rainfall_24_trend.length && this.props.parameters && this.props.parameters.length) {
					let graph_data = [];
					let property = this.props.parameters;
					this.props.rainfall_24_trend.map((data,index) => {
						graph_data.push([data.timestamp*1000, parseFloat(data.value)]);
					});
					this.config = {
						chart: {
							type: 'column',
							height: 100,
							// width: 250
						},
						plotOptions: {
							series: {
								pointPadding: 0,
								groupPadding: 0
							},
							column: {
								borderWidth: 0,
								groupPadding: 0,
								pointPadding: 0.2,
								maxPointWidth: 30,
								minPointLength: 2
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
							}/*,
							lineWidth: 0,
							minorGridLineWidth: 0,
							lineColor: 'transparent',
							labels: {
								enabled: true
							},
							minorTickLength: 0,
							tickLength: 0,
							gridLineColor: 'transparent'*/

						},
						xAxis: {
							type: 'datetime',
							title: {
								text: 'Past 24 hr Trend'
							}/*,
							lineWidth: 0,
							minorGridLineWidth: 0,
							lineColor: 'transparent',
							labels: {
								enabled: true
							},
							minorTickLength: 0,
							tickLength: 0,
							gridLineColor: 'transparent'*/

						},
						legend: {
							enabled: false
						},
						tooltip: {
							formatter: function () {
								return '<span class="tooltip-rainfall">' + (moment.unix(this.x/1000).tz("Asia/Kolkata").format('DD') == moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('DD') ? moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH'): moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH')) + '</span><br/>' + property[0].name + ': <b>' + this.y.toFixed(2) + ' ' + property[0].unit + '</b>';
							},
							useHTML: true
							/*pointFormat: '<span style="color:{point.color}">AQI <b>{point.y}</b> ({point.param})<br/></span>'*/
						},
								
						series: [{
							name: 'Rainfall',
							data: graph_data
						}]
					}
					return <ReactHighcharts config={this.config} ref="chart"></ReactHighcharts>;
				}
			})()}
		</Row>;
	}
}

