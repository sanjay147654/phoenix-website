import React from 'react';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
	/**
	 * Chart component of Devices page.
	 */
export default class DeviceChart extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		* @param {Array} device_list Used to store the device list.
		*/
		this.state = {
			device_list: [],
		};
		
		/**
		 * Chart configuration
		 * @type {Object}
		 */
		this.config = null;
	}

	/**
	 * Predefined function of ReactJS.
	 * Called after the component mounts.
	 * @return {void}
	 */
	componentDidMount() {
		let device_90 = [],
			device_60_90 = [],
			device_60 = [],
			device_0 = [];
		if (this.props.device_list && this.props.device_list.length) {
			this.props.device_list.map((device) => {
				if (device.online_percent > 90) {
					device_90.push(device);
				} else if (device.online_percent >= 60 && device.online_percent <= 90) {
					device_60_90.push(device);
				} else if (device.online_percent < 60 && device.online_percent > 0) {
					device_60.push(device);
				} else {
					device_0.push(device);
				}
			});
			let device_90_percent,
				device_60_percent,
				device_60_90_percent,
				device_0_percent;

			device_90_percent = parseFloat(((device_90.length / this.props.device_list.length) * 100).toFixed(2));
			device_60_percent = parseFloat(((device_60.length / this.props.device_list.length) * 100).toFixed(2));
			device_60_90_percent = parseFloat(((device_60_90.length / this.props.device_list.length) * 100).toFixed(2));
			device_0_percent = parseFloat(((device_0.length / this.props.device_list.length) * 100).toFixed(2));

			console.log('device_90_length', device_90);
			console.log('device_60_length', device_60);
			console.log('device_60-90_length', device_60_90);
			console.log('device_0_length', device_0);
			console.log('device_length', this.props.device_list);

			this.setState({
				device_list: this.props.device_list,
				device_90: device_90,
				device_60_90: device_60_90,
				device_60: device_60,
				device_0: device_0,
				device_90_percent: device_90_percent,
				device_60_percent: device_60_percent,
				device_60_90_percent: device_60_90_percent,
				device_0_percent: device_0_percent,
			}, () => {
				console.log('percentage', this.state);
			});
		}
	}

	/**
	 * Predefined function of ReactJS.
	 * Called every time after the component updates
	 * @return {void}
	 */
	componentDidUpdate() {
		let device_90 = [],
			device_60_90 = [],
			device_60 = [],
			device_0 = [];
		if (this.props.device_list && this.props.device_list.length) {
			this.props.device_list.map((device) => {
				if (device.online_percent > 90) {
					device_90.push(device);
				} else if (device.online_percent >= 60 && device.online_percent <= 90) {
					device_60_90.push(device);
				} else if (device.online_percent < 60 && device.online_percent > 0) {
					device_60.push(device);
				} else {
					device_0.push(device);
				}
			});
			let device_90_percent,
				device_60_percent,
				device_60_90_percent,
				device_0_percent;

			device_90_percent = parseFloat(((device_90.length / this.props.device_list.length) * 100).toFixed(2));
			device_60_percent = parseFloat(((device_60.length / this.props.device_list.length) * 100).toFixed(2));
			device_60_90_percent = parseFloat(((device_60_90.length / this.props.device_list.length) * 100).toFixed(2));
			device_0_percent = parseFloat(((device_0.length / this.props.device_list.length) * 100).toFixed(2));
			let display_data = [{
					name: 'Devices Online >90%',
					y: device_90_percent,
					count: device_90.length,
					index: 0
					/*sliced: true,
					selected: true*/
				}, {
					name: 'Devices Online 90-60%',
					y: device_60_90_percent,
					count: device_60_90.length,
					index: 1
				}, {
					name: 'Devices Online <60%',
					y: device_60_percent,
					count: device_60.length,
					index: 2
				}, {
					name: 'Devices Online 0%',
					y: device_0_percent,
					count: device_0.length,
					index: 3
				}];
			this.setData(display_data);
			console.log('display_data', display_data);
		}
	}

	/**
	 * This function sends the slected segment to the parent component.
	 * @param  {Object}
	 * @return {void}
	 */
	callBack(e) {
		console.log('pie e', e);
		this.props.setSelected(e);
	}

	/**
	 * This functions pushes the latest data to the pie chart.
	 * @param {Object}
	 */
	setData(value){
		if (this.child) {
			let chart = this.child.getChart();
			console.log(value);
			chart.series[0].update({
				data: value
			});
		}
	}

	/**
	 * Predefined function that decides whether to update the component or not.
	 * @param  {Object}
	 * @return {Boolean}
	 */
	shouldComponentUpdate(nextProps) {
		if ((nextProps.device_list && this.state.device_list && !_.isEqual(this.state.device_list, nextProps.device_list))) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		let config = {
			chart: {
				renderTo: 'container',
				type: 'pie',
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				height: 285,
				width: 285
			},
			title: {
				text: ''
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.count})'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true
				},
			},
			series: [{
					name: 'Devices',
					colorByPoint: true,
					data: [{
							name: '>90%',
							y: this.state.device_90_percent,
							count: (this.state.device_90 ? this.state.device_90.length : 0),
							index: 0,
							sliced: (this.props.selected_percent == '>90%' ? true : false),
							selected: (this.props.selected_percent == '>90%' ? true : false)
					}, {
							name: '90-60%',
							y: this.state.device_60_90_percent,
							count: (this.state.device_60_90 ? this.state.device_60_90.length : 0),
							index: 1,
							sliced: (this.props.selected_percent == '90-60%' ? true : false),
							selected: (this.props.selected_percent == '90-60%' ? true : false)
					}, {
							name: '<60%',
							y: this.state.device_60_percent,
							count: (this.state.device_60 ? this.state.device_60.length : 0),
							index: 2,
							sliced: (this.props.selected_percent == '<60%' ? true : false),
							selected: (this.props.selected_percent == '<60%' ? true : false)
					}, {
							name: '0%',
							y: this.state.device_0_percent,
							count: (this.state.device_0 ? this.state.device_0.length : 0),
							index: 3,
							sliced: (this.props.selected_percent == '0%' ? true : false),
							selected: (this.props.selected_percent == '0%' ? true : false)
					}],
					point: {
					cursor: 'pointer',
						events: {
							click: (e) => {
								console.log('pie chart', e);
								this.callBack(e.point.index);
								// this.props.graphClickFilter(e.point.name.split(" ")[2].replace('>', '').replace('<', '').replace('%', ''), false);
							}
						}
					}
			}]
		};
		return <div>
			{(() => {
				if (this.state.device_list && this.state.device_list.length) {
					return <ReactHighcharts neverReflow={true} config={config} ref={(child) => { this.child = child; }} />;
				}
			})()}
		</div>;
	}
}