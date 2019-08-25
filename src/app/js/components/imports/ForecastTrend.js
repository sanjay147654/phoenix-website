import React from 'react';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import Loading from './Loading';
	/**
	 * Chart component of Devices page.
	 */
export default class ForecastTrend extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @param {Object} data_chart Stores the data for the chart.
		* @param {string} chartType Used to store the chart type.
		* @param {Array} device_list Used to store the device list.
		*/
		this.state = {
			chartType: props.chartType,
			data_chart: props.data,
			device_list: [],
		};
		
		/**
		 * Chart configuration
		 * @type {Object}
		 */
		this.config = null;

		/**
		 * Array of colors.
		 * @type {Array}
		 */
		this.graph_colors = [
			'#43429a',
			'#07adb1',
			'#a44a9c',
			'#f4801f',
			'#c14040',
			'#6fccdd',
			'#61c3ab',
			'#56bc7b',
			'#e2da3e',
			'#41ce00',
			'#aa4728',
			'#b3d23c',
			'#a0632a',
			'#7156a3',
			'#3d577f',
			'#ee3352'
		];

		/**
		 * Array of colors for fill in graph.
		 * @type {Array}
		 */
		this.graph_fill_color = [
			'rgba(67, 66, 154, 0.05)',
			'rgba(7, 173, 177, 0.05)',
			'rgba(164, 74, 156, 0.05)',
			'rgba(244, 128, 31, 0.05)',
			'rgba(193, 64, 64, 0.05)',
			'rgba(111, 204, 221, 0.05)',
			'rgba(97, 195, 171, 0.05)',
			'rgba(86, 188, 123, 0.05)',
			'rgba(226, 218, 62, 0.05)',
			'rgba(65, 206, 0, 0.05)',
			'rgba(170, 71, 40, 0.05)',
			'rgba(179, 210, 60, 0.05)',
			'rgba(160, 99, 42, 0.05)',
			'rgba(113, 86, 163, 0.05)',
			'rgba(61, 87, 127, 0.05)',
			'rgba(238, 51, 82, 0.05)'
		];
	}

	/**
	 * Predefined function of ReactJS.
	 * Called after the component mounts.
	 * @return {void}
	 */
	componentDidMount() {
		
	}

	/**
	 * Predefined function of ReactJS.
	 * Called every time after the component updates
	 * @return {void}
	 */
	componentDidUpdate(prevProps,prevState) {
		if (this.props.chartType != prevProps.chartType) {
			this.setState({
				chartType: this.props.chartType,
				data_chart: this.props.data
			});
		}
	}

	/**
	 * This function sends the slected segment to the parent component.
	 * @param  {Object}
	 * @return {void}
	 */
	callBack(e) {
		console.log('pie e', e.name);
		this.props.setSelected(e.name);
	}

	/**
	 * This functions pushes the latest data to the pie chart.
	 * @param {Object}
	 */
	/*setData(value){
		if (this.child) {
			let chart = this.child.getChart();
			console.log(value);
			chart.series[0].update({
				data: value
			});
		}
	}*/

	/**
	 * Predefined function that decides whether to update the component or not.
	 * @param  {Object}
	 * @return {Boolean}
	 */
	/*shouldComponentUpdate(nextProps) {
		if ((nextProps.device_list && this.state.device_list && !_.isEqual(this.state.device_list, nextProps.device_list))) {
			return true;
		} else {
			return false;
		}
	}*/

	/**
	 * This function returns the type of highchart to be created.
	 */

	chartType() {
		if (this.state.chartType == 'rainfall') {
			return 'column';
		} else {
			return 'area';
		}
	}

	/**
	 * This function returns the series for the chart to be created.
	 */
	seriesType() {
		if (this.state.chartType == 'rainfall') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('rainfall')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			return [{
				'showInLegend': false, 
				'name': 'Rainfall',
				'data': data,
			}];
		} else if (this.state.chartType == 'temperature') {
			let data_max = [];
			let data_min = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('max temperature')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data_max.push(parseFloat(param[param_key]));
							}
						});
					} else if (param.parameter.toLowerCase().includes('min temperature')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data_min.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			let i = 0,
				data = [];
			for (i = 0; i< data_max.length; i ++) {
				data.push([data_min[i], data_max[i]]);
			}
			return [{
					name: 'Min - Max Range',
					data: data,
					type: "arearange",
					color: this.graph_colors[1],
					fillColor: this.graph_fill_color[1],
					lineColor: this.graph_colors[1],
					/*color: this.graph_colors[1],
					fillOpacity: 0.3,*/
			}/*, {
					name: 'Min',
					data: data_min,
					color: this.graph_colors[1],
					fillColor: this.graph_fill_color[1],
					lineColor: this.graph_colors[1]
			}*/];
		} else if (this.state.chartType == 'humidity') {
			let data_max = [];
			let data_min = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('max relative humidity')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data_max.push(parseFloat(param[param_key]));
							}
						});
					} else if (param.parameter.toLowerCase().includes('min relative humidity')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data_min.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			let i = 0,
				data = [];
			for (i = 0; i< data_max.length; i ++) {
				data.push([data_min[i], data_max[i]]);
			}
			return [{
					name: 'Min - Max Range',
					data: data,
					type: "arearange",
					color: this.graph_colors[1],
					fillColor: this.graph_fill_color[1],
					lineColor: this.graph_colors[1],
					// color: this.graph_colors[1],
					// fillOpacity: 0.8,
			}/*, {
					name: 'Min',
					data: data_min,
					color: this.graph_colors[3],
					fillColor: this.graph_fill_color[3],
					lineColor: this.graph_colors[3]
			}*/];
		}
		 else if (this.state.chartType == 'cloud-cover') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('total cloud cover')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			return [{
				'showInLegend': false, 
				'name': 'Cloud Cover',
				'data': data,
				color: this.graph_colors[0],
				fillColor: this.graph_fill_color[0],
				lineColor: this.graph_colors[0]
			}];
		} else if (this.state.chartType == 'wind-speed') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('wind speed')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			return [{
				'showInLegend': false, 
				'name': 'Wind Speed',
				'data': data,
				color: this.graph_colors[0],
				fillColor: this.graph_fill_color[0],
				lineColor: this.graph_colors[0]
			}];
		} else if (this.state.chartType == 'wind-direction') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('wind direction')) {
						Object.keys(param).map((param_key) => {
							if (param_key != 'key' && param_key != 'parameter') {
								data.push(parseFloat(param[param_key]));
							}
						});
					}
				});
			}
			return [{
				'showInLegend': false, 
				'name': 'Wind Direction',
				'data': data,
				color: this.graph_colors[0],
				fillColor: this.graph_fill_color[0],
				lineColor: this.graph_colors[0]
			}];
		}
	}

	/**
	 * This function returns the title of chart to be created.
	 */
	chartTitle() {
		if (this.state.chartType == 'rainfall') {
			let data;
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('rainfall')) {
						data = param.parameter;
					}
				});
			}
			return data;
		} else if (this.state.chartType == 'temperature') {
			
			return 'Max & Min Temperature';
		} else if (this.state.chartType == 'humidity') {
			
			return 'Max & Min Relative Humidity'
		}
		 else if (this.state.chartType == 'cloud-cover') {
			let data;
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('total cloud cover')) {
						data= param.parameter;
					}
				});
			}
			return data;
		} else if (this.state.chartType == 'wind-speed') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('wind speed')) {
						data = param.parameter;
					}
				});
			}
			return data;
		} else if (this.state.chartType == 'wind-direction') {
			let data = [];
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('wind direction')) {
						data = param.parameter;
					}
				});
			}
			return data;
		}
	}

	/**
	 * This function returns the unit to be diplayed in the chart.
	 */
	unitText() {
		if (this.state.chartType == 'rainfall') {
			
			return 'mm';
		} else if (this.state.chartType == 'temperature') {
			
			return 'deg C';
		} else if (this.state.chartType == 'humidity') {
			
			return '%'
		}
		 else if (this.state.chartType == 'cloud-cover') {
			let data;
			if (this.state.data_chart && this.state.data_chart.length) {
				this.state.data_chart.map((param) => {
					
					if (param.parameter.toLowerCase().includes('total cloud cover')) {
						data= 'okta';
					}
				});
			}
			return data;
		} else if (this.state.chartType == 'wind-speed') {
			
			return 'kmph';
		} else if (this.state.chartType == 'wind-direction') {
			
			return 'deg';
		}
	}

	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		let graph_data;
		let chart_type = this.chartType();
		let series_type = this.seriesType();
		let chart_title = this.chartTitle();
		let yAxis_text = this.unitText();
		let x_axis_labels = this.props.x_axis_labels;
		this.config = {
			chart: {
				type: chart_type,
				height: 400,
				// width: 250
			},
			title: {
					text: ''
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
				},
				area: {
					marker: {
						radius: 2
					},
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				}, 
				arearange: {
					marker: {
						radius: 2
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
			xAxis: {
				categories: x_axis_labels
			},
			yAxis: {
				title: {
						text: yAxis_text
				},
				labels: {
						enabled: true
				}
			},
			credits: {
				enabled: false
			},
			tooltip: {
				/*formatter: function () {
					return '<span class="tooltip-rainfall">' + (moment.unix(this.x/1000).tz("Asia/Kolkata").format('DD') == moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('DD') ? moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('HH'): moment.unix((this.x/1000) - 3600).tz("Asia/Kolkata").format('dddd, MMM DD, HH') + ' - ' + moment.unix(this.x/1000).tz("Asia/Kolkata").format('dddd, MMM DD, HH')) + '</span><br/>' + property[0].name + ': <b>' + this.y + ' ' + property[0].unit + '</b>';
				},
				useHTML: true*/
				valueSuffix: ' ' + yAxis_text,
				crosshairs: true,
				shared: true
			},
					
			series: series_type
		}
		return <div className="chart-container">
			{(() => {
				if (series_type && series_type.length && this.state.data_chart && this.state.data_chart.length) {
					console.log('series_type', series_type);
					return <ReactHighcharts config={this.config} ref={(child) => { this.child = child; }} />;
				} else {
					return <Loading is_inline={true} />;
				}
			})()}
		</div>;
	}
}