import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Drawer, Radio, DatePicker, Checkbox, Form, Input, Table, notification, TreeSelect, Modal} from 'antd';
import Head from './Head';
import Side from './Side';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';
import moment from 'moment-timezone';
import MajorRoadAndShopFrontReport from './MajorRoadAndShopFrontReport';
import OpenCanalAndStreetReport from './OpenCanalAndStreetReport';
import PumpStationReport from './PumpStationReport';
import RainfallReport from './RainfallReport';
import GatedCanalReport from './GatedCanalReport';
import AurassureReport from './AurassureReport';
import Loading from './Loading';

const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
const { Content } = Layout;
const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const aqi = ['aqi1', 'aqi2', 'aqi3'];
const weather = ['weather1', 'weather2', 'weather3'];
const other = ['other1', 'other2', 'other3'];
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

const graph1 = {
	chart: {
				type: 'line',
				height: 400
		},
		title: {
				text: ''
		},
		xAxis: {
				categories: ['DAY-1', 'DAY-2', 'DAY-3', 'DAY-4', 'DAY-5']
		},
		yAxis: {
				title: {
						text: ''
				},
				labels: {
						enabled: false
				}
		},
		plotOptions: {
				line: {
						dataLabels: {
								enabled: true
						},
						enableMouseTracking: true
				}
		},
		series: [{
			showInLegend: false, 
				name: '',
				data: [7.0, 6.9, 9.5, 7.5, 1.4]
		}]
};

const graph2 = {
	chart: {
				type: 'line',
				height: 400
		},
		title: {
				text: ''
		},
		xAxis: {
				categories: ['DAY-1', 'DAY-2', 'DAY-3', 'DAY-4', 'DAY-5']
		},
		yAxis: {
				title: {
						text: ''
				},
				labels: {
						enabled: false
				}
		},
		plotOptions: {
				line: {
						dataLabels: {
								enabled: true
						},
						enableMouseTracking: true
				}
		},
		series: [{
				name: 'Max',
				data: [7.0, 6.9, 9.5, 11.5, 7.4]
		}, {
				name: 'Min',
				data: [3.9, 4.2, 5.7, 8.5, 4.9]
		}]
};

const city = [];
for (let i = 1; i < 12; i++) {
	city.push(<Option key={'City - ' + i}>{'City - ' + i}</Option>);
}

const device = [];
for (let i = 1; i < 12; i++) {
	device.push(<Option key={'Device - ' + i}>{'Device - ' + i}</Option>);
}

function handleChange(value) {}

function onChange(value, dateString) {
	console.log('Selected Time: ', value);
	console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
	console.log('onOk: ', value);
}

const data = [
	{
		parameter: 'Temperature(°C)',
		avg: 29.24,
		min: 25.40,
		minat: '03:37, 27 Sep',
		max: 36.20,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'Humidity(%)',
		avg: 92.17,
		min: 62.40,
		minat: '03:37, 27 Sep',
		max: 99.20,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'SO2(ppb)',
		avg: 33.51,
		min: 6.82,
		minat: '03:37, 27 Sep',
		max: 75.31,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'NO2(ppb)',
		avg: 11.03,
		min: 2.37,
		minat: '03:37, 27 Sep',
		max: 19.02,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'NO(ppb)',
		avg: 25.99,
		min: 4.30,
		minat: '03:37, 27 Sep',
		max: 48.65,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'CO(ppm)',
		avg: 0.3937,
		min: 0.2840,
		minat: '03:37, 27 Sep',
		max: 0.6961,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'O2(% vol.)',
		avg: 20.90,
		min: 20.23,
		minat: '03:37, 27 Sep',
		max: 26.14,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'Noise(dB (A))',
		avg: 33.08,
		min: 28.17,
		minat: '03:37, 27 Sep',
		max: 74.11,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'PM1(μg / m3)',
		avg: 49.44,
		min: 32.00,
		minat: '03:37, 27 Sep',
		max: 209.00,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'PM2.5(μg / m3)',
		avg: 67.81,
		min: 46.00,
		minat: '03:37, 27 Sep',
		max: 258.00,
		maxat: '11:37, 27 Sep'
	}, {
		parameter: 'PM10(μg / m3)',
		avg: 83.06,
		min: 58.00,
		minat: '03:37, 27 Sep',
		max: 292.00,
		maxat: '11:37, 27 Sep'
	}];

const deviceData = [{
	title: 'Device-1',
	value: 'device-1',
	key: '0-0',
}, {
	title: 'Device-2',
	value: 'device-2',
	key: '0-1',
}, {
	title: 'Device-3',
	value: 'device-3',
	key: '0-2',
}, {
	title: 'Device-4',
	value: 'device-4',
	key: '0-3',
}, {
	title: 'Device-5',
	value: 'device-5',
	key: '0-4',
}];

// let treeData = [];

function disabledDate(current) {
	// Can not select future dates
	return current && current >= moment().tz('Asia/Kolkata').endOf('day');
}

class ArchiveReports extends React.Component {
	constructor(props) {
		super(props)
		this.handleCheckBox = this.handleCheckBox.bind(this)
		this.state = {
			view_mode_custom: (window.innerWidth >= 730) ? 'desk' : 'mob',
			gridVisible: true,
			loading: false,
			avg_time: 3600,
			aura_infra: 13,
			Rainfall_type: 11,
			Major_Road_Junction: 1,
			Street_Sub_House_Front: 2,
			Rainfall: 11,
			// Pump_Station: 4,
			Open_Canal: 5,
			Gated_Canal: 6,
			// Major_Road_Junction_water: 7,
			Street_Sub_House_Front_water: 7,
			Bus: 9,
			Pump_Station_Status: 4,
			pump_station_2: 12,
			data_type: props.data_type,
			average_data_name: {
				3600: 'Hourly Average Report',
				900: '15 Minutes Average Report',
				86400: 'Daily Average Report',
				1: 'Hourly Average Report',
				8: '8 Hours Average Report',
				24: 'Daily Average Report',
			},
			from_time: props.from_time,
			upto_time: props.upto_time,
			avg_time: props.avg_time,
			avg_data_time_aura: props.avg_data_time_aura,
			filtered_station_list_fms: props.filtered_station_list_fms,
			stations_placeholder: props.stations_placeholder,
			stations_selected: props.stations_selected,
			all_stations_fms: props.all_stations_fms,
			value: props.value,
			params_selected: props.params_selected,
			params_select_option: props.params_select_option,
			param_name_list: props.param_name_list,
			conversion_type: props.conversion_type,
			select_all_check: props.select_all_check
		};
		this.all_parameters_of_station = props.all_parameters_of_station;
	}

	componentDidUpdate(prevProps, prevState) {
	/*	if (this.state.value == this.state.Rainfall) {
			this.setState({
				checked: false
			});
		}*/
		if (prevState.value != this.state.value && this.state.custom_modal) {
			this.setState({
				stations_selected:[]
			});
			if (this.state.value == this.state.Rainfall_type) {
				// console.log('componentDidUpdate 2');
				this.handleDataTypeSelection({
					target: {
						value: 'avg'
					}
				});
			}
		}
	}

	handleCheckBox(e) {
		this.setState({
			gridVisible: !this.state.gridVisible
		})
	}

	openCustomise() {
		this.setState({
			custom_modal: true
		});
	}

	closeCustomise() {
		this.setState({
			stations_selected: this.props.stations_selected,
			custom_modal: false,
			from_time: this.props.from_time,
			upto_time: this.props.upto_time,
			data_type: this.props.data_type,
			avg_time: this.props.avg_time,
			avg_data_time_aura: this.props.avg_data_time_aura,
			filtered_station_list_fms: this.props.filtered_station_list_fms,
			stations_placeholder: this.props.stations_placeholder,
			all_stations_fms: this.props.all_stations_fms,
			value: this.props.value,
			params_selected: this.props.params_selected,
			params_select_option: this.props.params_select_option,
			param_name_list: this.props.param_name_list,
			conversion_type: this.props.conversion_type,
			select_all_check: this.props.select_all_check
		}, () => {
			console.log('closeCustomise', this.state.stations_selected);
		});
	}

	closeFromParent() {
		this.setState({
			custom_modal: false,
		});
	}

	/**
	 * This function sets the avg time selected in the state.
	 * @param  {Number} event Seconds to be averaged.
	 */
	handleAverageTimeSelect(event) {
		this.setState({
			avg_time: event
		});
	}

	treeSelect(value, label, extra) {
		// console.log('value', value);
		// console.log('label', label);
		// console.log('extra', extra);
		let all_stations_fms = this.state.all_stations_fms.slice(0);
		if (!isNaN(extra.triggerValue) && extra.triggerValue && extra.checked) {
			let temp = [];
			if (all_stations_fms && all_stations_fms.length) {
				all_stations_fms.map((st) => {
					if (st.sub_category == extra.triggerValue) {
						temp.push({
							id: st.id,
							name: st.name
						});
					}
				});
			}
			this.setState({
				value: extra.triggerValue,
				filtered_station_list_fms: temp
			},() => console.log('value 1', this.state.value));
		} else if (!isNaN(extra.triggerValue)) {
			this.setState({
				value: null,
				filtered_station_list_fms: []
			},() => console.log('value 2', this.state.value));
		}
	}

	handleStationSelect(e) {
		console.log('handleStationSelect', e);
		this.setState({
			stations_selected: e
		}, () => {
			if (this.state.value == this.state.aura_infra) {
				// this.setParamsIds();
				this.setParamID();
			}
		});
	}

	setParamID() {
		let param_name_list = _.clone(this.state.param_name_list);
		let params_selected = [],
			params_select_option = [];
		this.all_parameters_of_station = [];
		this.all_parameters_of_station.push(this.hourly_aqi);
		
		if (this.state.all_stations_aura && this.state.all_stations_aura.length) {
			this.state.all_stations_aura.map((station_aura) => {
				if (this.state.stations_selected && this.state.stations_selected.length) {
					this.state.stations_selected.map((st_select) => {
						if (this.mapFmsToAura(st_select) == station_aura.id) {
							if (station_aura.parameters && station_aura.parameters.length) {
								station_aura.parameters.map((param) => {
									if (!_.some(this.all_parameters_of_station, param)) {
										this.all_parameters_of_station.push(param);
									}
									if(!param_name_list[param.key]) {
										param_name_list[param.key] = param.name;
									} else {
										param_name_list[param.key] = param.name;
									}
									if (params_selected.indexOf(param.key) == -1) {
										if (this.state.data_type == 'avg') {
											params_selected.push(param.key);
											params_select_option.push(param.key);
										} else {
											if (this.state.is_admin) {
												if (param.key != this.state.hourly_aqi_type && param.key != this.state.wind_rose_type && param.key != this.state.pollution_rose_type) {
													params_selected.push(param.key);
													params_select_option.push(param.key);
												}
											} else {
												if (param.key != this.state.hourly_aqi_type && param.key != this.state.wind_rose_type && param.key != this.state.pollution_rose_type && param.key != this.state.rain_param_type) {
													params_selected.push(param.key);
													params_select_option.push(param.key);
												}
											}
										}
									}
								});
							} 
						}
					});
				}
				if(this.state.stations_selected && this.state.stations_selected.length && this.state.stations_selected.includes(station_aura.id)) {
				if (_.some(station_aura.parameters, {key: 'wspeed'}) && _.some(station_aura.parameters, {key: 'wdir'})) {
					if (!(_.some(this.all_parameters_of_station, {key: 'wind_rose'}))) {
						this.all_parameters_of_station.push(this.wind_rose);
					}
				}
				if (_.some(station_aura.parameters, {key: 'wdir'}) && (_.some(station_aura.parameters, {key: 'pm2.5'}) || _.some(station_aura.parameters, {key: 'pm10'}) || _.some(station_aura.parameters, {key: 'no2'}) || _.some(station_aura.parameters, {key: 'o3'}) || _.some(station_aura.parameters, {key: 'co'}) || _.some(station_aura.parameters, {key: 'so2'}))) {
					if (!(_.some(this.all_parameters_of_station, {key: 'pollution_rose'}))) {
						this.all_parameters_of_station.push(this.pollution_rose);
					}
				}
			}
			});
		}
		
		if (this.state.data_type == 'avg') {
			let arr_temp = ['wind_rose', 'hourly_aqi', 'pollution_rose'];
			arr_temp.map((arr) => {
				params_selected.push(arr);
				params_select_option.push(arr);
			});
		}
		let select_all_check = false;
		if (params_selected && params_select_option && params_selected.length == params_select_option.length) {
			select_all_check = true;
		} else {
			select_all_check = false;
		}
		console.log('this.all_parameters_of_station', this.all_parameters_of_station);
		this.setState({
			params_selected: params_selected,
			param_name_list: param_name_list,
			params_select_option: params_select_option,
			select_all_check: select_all_check
		}/*, () => this.checkParam()*/);
	}

	dateTimeChange(dates, dateStrings) {
		let that = this;
		// let from_time_unix = moment(dateStrings[0], "DD-MM-YYYY").tz('Asia/Kolkata').unix(),
		// 	upto_time_unix = moment(dateStrings[1], "DD-MM-YYYY").tz('Asia/Kolkata').unix();
		// console.log('From: ', dates[0], ', to: ', dates[1]);
		// console.log('From_string: ', dateStrings[0], ', to_string: ', dateStrings[1]);
		// console.log('From_Unix: ', from_time_unix, ', to_Unix: ', upto_time_unix);
		// console.log('this.parsed', this.parsed);
		// this.stringified = queryString.stringify(this.parsed, {sort: false});
		// location.search = this.stringified;
		//this.props.history.push('/?' + this.stringified);
		// console.log('location.search', this.stringified);
		that.setState({
			from_time: dateStrings[0],
			upto_time: dateStrings[1],
			child_dont_update: true,
			// from_time_unix: from_time_unix,
			// upto_time_unix: upto_time_unix,
		}, () => {
			// console.log('From_ok', that.state.from_time);
			// console.log('From_ok', that.state.upto_time);
			// that.queryCreate(that.state.category_selected, that.state.sub_category_selected_display);
		});
		// that.get24hourDataRange(dateStrings[0], dateStrings[1]);
	}

	/**
	 * This function is called when the ok button is clivked on th edate time picker.
	 */
	callAPI(a,b,c) {
		// console.log('ok a',a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"));
		// console.log('ok b',b);
		// console.log('ok c',c);
		// this.setState({
		// 	child_dont_update: false,
		// });
		// this.get24hourDataRange(a[0].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), a[1].tz('Asia/Kolkata').format("DD-MM-YYYY HH:mm"), null, true);
	}

	/**
	 * This function sets the avg time selected in the state.
	 * @param  {Number} event Seconds to be averaged.
	 */
	handleAverageTimeSelect(key, event) {
		// console.log('handleAverageTimeSelect key', key);
		// console.log('handleAverageTimeSelect event', event);
		if (key == 'flood') {
			this.setState({
				avg_time: event
			});
		} else if (key == 'aura') {
			this.setState({
				avg_data_time_aura: event
			});
		}
	}

	/**
	 * This function sets the data type.
	 * @param  {Object} e Event triggered.
	 */
	handleDataTypeSelection(e) {
		// console.log('handleDataTypeSelection', e);
		this.setState({
			data_type: e.target.value
		}/*, () => this.props.setDataType(this.state.data_type)*/);
	}

	handleCitySelect(e) {
		// console.log('handleCitySelect', e);
		this.setState({
			city_selected: e
		});
	}

	handleConversionType(e) {
		// console.log('handleConversionType', e);
		this.setState({
			conversion_type: e.target.value
		});
	}


	/**
	 * This function sets the data type.
	 * @param  {Object} e Event triggered.
	 */
	handleDataTypeSelection(e) {
		this.setState({
			data_type: e.target.value
		}/*, () => this.props.setDataType(this.state.data_type)*/);
	}

	handleSubmit() {
		this.props.setInParent(this.state.from_time,this.state.upto_time,this.state.avg_time,this.state.avg_data_time_aura,this.state.filtered_station_list_fms,this.state.stations_placeholder,this.state.stations_selected,this.state.all_stations_fms,this.state.value,this.state.data_type, this.state.params_selected, this.state.params_select_option, this.all_parameters_of_station, this.state.conversion_type);
	}

	selectAllParam(e, status) {
		console.log('selectAllParam', e);
		let param = [];
		if (e.target.checked) {
			param = this.state.params_select_option.slice(0);
		}
		this.setState({
			select_all_check: e.target.checked,
			params_selected: param
		});
	}

	addSelectedParametersNew(e) {
		console.log('addSelectedParametersNew', e);
		let select_all_check = true;
		if (e.length != this.state.params_select_option.length) {
			select_all_check = false;
		} else {
			select_all_check = true;
		}
		this.setState({
			params_selected: e,
			select_all_check: select_all_check
		});
	}

	render() {
		const { visible, onCancel, onCreate, form } = this.props;
		// const { getFieldDecorator } = form;

		const columns = [
			{
				title: 'Parameter',
				width: 120,
				key: 'parameter',
				dataIndex: 'parameter'
			}, {
				title: 'Avg',
				width: 80,
				dataIndex: 'avg',
				key: 'avg'
			}, {
				title: 'Min',
				width: 80,
				dataIndex: 'min',
				key: 'min'
			}, {
				title: 'Min at.',
				width: 100,
				dataIndex: 'minat',
				key: 'minat'
			}, {
				title: 'Max',
				width: 80,
				dataIndex: 'max',
				key: 'max'
			}, {
				title: 'Max at.',
				width: 100,
				dataIndex: 'maxat',
				key: 'maxat'
			}
		];

		const tProps = {
			treeData: this.props.treeData,
			value: this.state.value,
			// onChange: (e) => this.onChange(e),
			treeCheckable: true,
			treeNodeFilterProp: 'title',
			dropdownStyle: {
				'maxHeight': '200px',
			},
			placeholder: 'Please Select a station sub-category',
			treeDefaultExpandAll: true,
			showCheckedStrategy: SHOW_PARENT,
		};
		
		return (
			<div id="archive_report1">
				{/*<Drawer
					title="Archive Report"
					width={1000}
					placement="right"
					visible={visible}
					onClose={onCancel}
					maskClosable={true}
					style={{
						height: 'calc(100% - 55px)',
						overflow: 'auto',
						paddingBottom: 53,
					}}
				>*/}
			{/*<Layout className="mar-top-72">*/}
				<Content className="contains" id="archive_report">
					<div className="head head-modal">
					<span className="heading-modal">{(this.props.sub_category_object[this.props.value]) + ' ' + (this.props.data_type && this.props.data_type == 'avg' ? (this.state.average_data_name[this.props.avg_time]) : 'Raw Data') + ' between ' + moment.unix(moment(this.props.from_time, "DD-MM-YYYY").tz('Asia/Kolkata').unix()).tz("Asia/Kolkata").format('DD MMM YYYY') + ' to ' + moment.unix(moment(this.props.upto_time, "DD-MM-YYYY").tz('Asia/Kolkata').unix()).tz("Asia/Kolkata").format('DD MMM YYYY')}</span>
					<Col className="close"><span className="close-butn" onClick={() => this.props.closeReport()}><Icon type="close" /></span></Col>
					<span className="customise-button" onClick={() => this.openCustomise()}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 438.529 438.529"><path d="M436.25 181.438c-1.529-2.002-3.524-3.193-5.995-3.571l-52.249-7.992c-2.854-9.137-6.756-18.461-11.704-27.98 3.422-4.758 8.559-11.466 15.41-20.129 6.851-8.661 11.703-14.987 14.561-18.986 1.523-2.094 2.279-4.281 2.279-6.567 0-2.663-.66-4.755-1.998-6.28-6.848-9.708-22.552-25.885-47.106-48.536-2.275-1.903-4.661-2.854-7.132-2.854-2.857 0-5.14.855-6.854 2.567l-40.539 30.549c-7.806-3.999-16.371-7.52-25.693-10.565l-7.994-52.529c-.191-2.474-1.287-4.521-3.285-6.139C255.95.806 253.623 0 250.954 0h-63.38c-5.52 0-8.947 2.663-10.278 7.993-2.475 9.513-5.236 27.214-8.28 53.1a163.366 163.366 0 0 0-25.981 10.853l-39.399-30.549c-2.474-1.903-4.948-2.854-7.422-2.854-4.187 0-13.179 6.804-26.979 20.413-13.8 13.612-23.169 23.841-28.122 30.69-1.714 2.474-2.568 4.664-2.568 6.567 0 2.286.95 4.57 2.853 6.851 12.751 15.42 22.936 28.549 30.55 39.403-4.759 8.754-8.47 17.511-11.132 26.265l-53.105 7.992c-2.093.382-3.9 1.621-5.424 3.715C.76 182.531 0 184.722 0 187.002v63.383c0 2.478.76 4.709 2.284 6.708 1.524 1.998 3.521 3.195 5.996 3.572l52.25 7.71c2.663 9.325 6.564 18.743 11.704 28.257-3.424 4.761-8.563 11.468-15.415 20.129-6.851 8.665-11.709 14.989-14.561 18.986-1.525 2.102-2.285 4.285-2.285 6.57 0 2.471.666 4.658 1.997 6.561 7.423 10.284 23.125 26.272 47.109 47.969 2.095 2.094 4.475 3.138 7.137 3.138 2.857 0 5.236-.852 7.138-2.563l40.259-30.553c7.808 3.997 16.371 7.519 25.697 10.568l7.993 52.529c.193 2.471 1.287 4.518 3.283 6.14 1.997 1.622 4.331 2.423 6.995 2.423h63.38c5.53 0 8.952-2.662 10.287-7.994 2.471-9.514 5.229-27.213 8.274-53.098a163.044 163.044 0 0 0 25.981-10.855l39.402 30.84c2.663 1.712 5.141 2.563 7.42 2.563 4.186 0 13.131-6.752 26.833-20.27 13.709-13.511 23.13-23.79 28.264-30.837 1.711-1.902 2.569-4.09 2.569-6.561 0-2.478-.947-4.862-2.857-7.139-13.698-16.754-23.883-29.882-30.546-39.402 3.806-7.043 7.519-15.701 11.136-25.98l52.817-7.988c2.279-.383 4.189-1.622 5.708-3.716 1.523-2.098 2.279-4.288 2.279-6.571v-63.376c.005-2.474-.751-4.707-2.278-6.707zm-165.304 89.501c-14.271 14.277-31.497 21.416-51.676 21.416-20.177 0-37.401-7.139-51.678-21.416-14.272-14.271-21.411-31.498-21.411-51.673 0-20.177 7.135-37.401 21.411-51.678 14.277-14.272 31.504-21.411 51.678-21.411 20.179 0 37.406 7.139 51.676 21.411 14.274 14.277 21.413 31.501 21.413 51.678 0 20.175-7.138 37.403-21.413 51.673z" /></svg>
						<span className="customise-text" >Customise your report</span>
					</span>
					</div>
					<div className="mob-display">
						<span className="customise-button-mob" onClick={() => this.openCustomise()}>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 438.529 438.529"><path d="M436.25 181.438c-1.529-2.002-3.524-3.193-5.995-3.571l-52.249-7.992c-2.854-9.137-6.756-18.461-11.704-27.98 3.422-4.758 8.559-11.466 15.41-20.129 6.851-8.661 11.703-14.987 14.561-18.986 1.523-2.094 2.279-4.281 2.279-6.567 0-2.663-.66-4.755-1.998-6.28-6.848-9.708-22.552-25.885-47.106-48.536-2.275-1.903-4.661-2.854-7.132-2.854-2.857 0-5.14.855-6.854 2.567l-40.539 30.549c-7.806-3.999-16.371-7.52-25.693-10.565l-7.994-52.529c-.191-2.474-1.287-4.521-3.285-6.139C255.95.806 253.623 0 250.954 0h-63.38c-5.52 0-8.947 2.663-10.278 7.993-2.475 9.513-5.236 27.214-8.28 53.1a163.366 163.366 0 0 0-25.981 10.853l-39.399-30.549c-2.474-1.903-4.948-2.854-7.422-2.854-4.187 0-13.179 6.804-26.979 20.413-13.8 13.612-23.169 23.841-28.122 30.69-1.714 2.474-2.568 4.664-2.568 6.567 0 2.286.95 4.57 2.853 6.851 12.751 15.42 22.936 28.549 30.55 39.403-4.759 8.754-8.47 17.511-11.132 26.265l-53.105 7.992c-2.093.382-3.9 1.621-5.424 3.715C.76 182.531 0 184.722 0 187.002v63.383c0 2.478.76 4.709 2.284 6.708 1.524 1.998 3.521 3.195 5.996 3.572l52.25 7.71c2.663 9.325 6.564 18.743 11.704 28.257-3.424 4.761-8.563 11.468-15.415 20.129-6.851 8.665-11.709 14.989-14.561 18.986-1.525 2.102-2.285 4.285-2.285 6.57 0 2.471.666 4.658 1.997 6.561 7.423 10.284 23.125 26.272 47.109 47.969 2.095 2.094 4.475 3.138 7.137 3.138 2.857 0 5.236-.852 7.138-2.563l40.259-30.553c7.808 3.997 16.371 7.519 25.697 10.568l7.993 52.529c.193 2.471 1.287 4.518 3.283 6.14 1.997 1.622 4.331 2.423 6.995 2.423h63.38c5.53 0 8.952-2.662 10.287-7.994 2.471-9.514 5.229-27.213 8.274-53.098a163.044 163.044 0 0 0 25.981-10.855l39.402 30.84c2.663 1.712 5.141 2.563 7.42 2.563 4.186 0 13.131-6.752 26.833-20.27 13.709-13.511 23.13-23.79 28.264-30.837 1.711-1.902 2.569-4.09 2.569-6.561 0-2.478-.947-4.862-2.857-7.139-13.698-16.754-23.883-29.882-30.546-39.402 3.806-7.043 7.519-15.701 11.136-25.98l52.817-7.988c2.279-.383 4.189-1.622 5.708-3.716 1.523-2.098 2.279-4.288 2.279-6.571v-63.376c.005-2.474-.751-4.707-2.278-6.707zm-165.304 89.501c-14.271 14.277-31.497 21.416-51.676 21.416-20.177 0-37.401-7.139-51.678-21.416-14.272-14.271-21.411-31.498-21.411-51.673 0-20.177 7.135-37.401 21.411-51.678 14.277-14.272 31.504-21.411 51.678-21.411 20.179 0 37.406 7.139 51.676 21.411 14.274 14.277 21.413 31.501 21.413 51.678 0 20.175-7.138 37.403-21.413 51.673z" /></svg>
							<span className="customise-text" >Customise your report</span>
						</span>
					</div>

					{(() => {
						if (!this.props.getting_report && this.props.station_name_grid_data && this.props.station_name_grid_data.length && this.props.value != this.state.aura_infra) {
							return <Form layout="vertical" hideRequiredMark className="archive-report">

								<div className="download-button-wrapper">
									<div className="view-online">
										<span>Grid</span>
										<div className='wrapper'>
											<input type='checkbox' id='checkable1' onChange={() => this.handleCheckBox()} checked={!this.state.gridVisible} />
											<label htmlFor='checkable1'></label>
										</div>
										<span>Graph</span>
									</div>
									<Button className="download-button" onClick={() => this.props.downloadReportPrep(this.state.stations_selected)} type="primary" ><svg xmlns="http://www.w3.org/2000/svg" height={25} width={20} viewBox="0 0 512 512"><path fill="#fff" d="M498.966 339.946c-7.197 0-13.034 5.837-13.034 13.034v49.804c0 28.747-23.388 52.135-52.135 52.135H78.203c-28.747 0-52.135-23.388-52.135-52.135V352.98c0-7.197-5.835-13.034-13.034-13.034C5.835 339.946 0 345.782 0 352.98v49.804c0 43.121 35.082 78.203 78.203 78.203h355.594c43.121 0 78.203-35.082 78.203-78.203V352.98c0-7.198-5.835-13.034-13.034-13.034z"/><path fill="#fff" d="M419.833 391.3H92.167c-7.197 0-13.034 5.837-13.034 13.034s5.835 13.034 13.034 13.034h327.665c7.199 0 13.034-5.835 13.034-13.034 0-7.197-5.835-13.034-13.033-13.034zM387.919 207.93c-4.795-5.367-13.034-5.834-18.404-1.038l-100.482 89.765V44.048c0-7.197-5.835-13.034-13.034-13.034-7.197 0-13.034 5.835-13.034 13.034v252.609l-100.482-89.764c-5.367-4.796-13.607-4.328-18.404 1.038-4.794 5.369-4.331 13.609 1.037 18.404l109.174 97.527a32.496 32.496 0 0 0 21.708 8.292 32.517 32.517 0 0 0 21.708-8.289l109.174-97.53c5.37-4.798 5.834-13.038 1.039-18.405z"/></svg></Button>
								</div>
								<Tabs type="card" className="draw-tab">
								{(() => {
									if (this.props.station_name_grid_data && this.props.station_name_grid_data.length) {
										console.log('archive name', this.props.station_name_grid_data);
										console.log('archive graph', this.props.stations_graph_data);
										console.log('archive grid', this.props.stations_grid_data);
										return this.props.station_name_grid_data.map((station, index) => {
											return <TabPane tab={station.name} key={station.id}>
												<div className="download-button-wrapper-mob">
													<div className="view-online">
														<span>Grid</span>
														<div className='wrapper'>
															<input type='checkbox' id='checkable1' onChange={() => this.handleCheckBox()} checked={!this.state.gridVisible} />
															<label htmlFor='checkable1'></label>
														</div>
														<span>Graph</span>
													</div>
													<Button className="download-button" onClick={() => this.props.downloadReportPrep(this.state.stations_selected)} type="primary" ><svg xmlns="http://www.w3.org/2000/svg" height={25} width={20} viewBox="0 0 512 512"><path fill="#fff" d="M498.966 339.946c-7.197 0-13.034 5.837-13.034 13.034v49.804c0 28.747-23.388 52.135-52.135 52.135H78.203c-28.747 0-52.135-23.388-52.135-52.135V352.98c0-7.197-5.835-13.034-13.034-13.034C5.835 339.946 0 345.782 0 352.98v49.804c0 43.121 35.082 78.203 78.203 78.203h355.594c43.121 0 78.203-35.082 78.203-78.203V352.98c0-7.198-5.835-13.034-13.034-13.034z"/><path fill="#fff" d="M419.833 391.3H92.167c-7.197 0-13.034 5.837-13.034 13.034s5.835 13.034 13.034 13.034h327.665c7.199 0 13.034-5.835 13.034-13.034 0-7.197-5.835-13.034-13.033-13.034zM387.919 207.93c-4.795-5.367-13.034-5.834-18.404-1.038l-100.482 89.765V44.048c0-7.197-5.835-13.034-13.034-13.034-7.197 0-13.034 5.835-13.034 13.034v252.609l-100.482-89.764c-5.367-4.796-13.607-4.328-18.404 1.038-4.794 5.369-4.331 13.609 1.037 18.404l109.174 97.527a32.496 32.496 0 0 0 21.708 8.292 32.517 32.517 0 0 0 21.708-8.289l109.174-97.53c5.37-4.798 5.834-13.038 1.039-18.405z"/></svg></Button>
												</div>
												{(() => {
													if (this.props.value == this.state.Major_Road_Junction || this.props.value == this.state.Street_Sub_House_Front) {
														console.warn("street","report");	
														return <MajorRoadAndShopFrontReport avg_time={this.props.avg_time} props_index ={index} from_time_report={this.props.from_time_report} upto_time_report={this.props.upto_time_report} station_name_grid_data={this.props.station_name_grid_data} data_type={this.props.data_type} stations_graph_data={this.props.stations_graph_data} stations_grid_data={this.props.stations_grid_data} station_name_list={this.props.station_name_list} gridVisible={this.state.gridVisible} stations_raw_data={this.props.stations_raw_data}/>;
													} else if (this.props.value == this.state.Open_Canal || this.props.value == this.state.Street_Sub_House_Front_water) {
															return <OpenCanalAndStreetReport avg_time={this.props.avg_time} props_index ={index} from_time_report={this.props.from_time_report} upto_time_report={this.props.upto_time_report} station_name_grid_data={this.props.station_name_grid_data} data_type={this.props.data_type} stations_graph_data={this.props.stations_graph_data} stations_grid_data={this.props.stations_grid_data} station_name_list={this.props.station_name_list} gridVisible={this.state.gridVisible} />;
													} else if (this.props.value == this.state.Rainfall) {
															return <RainfallReport avg_time={this.props.avg_time} total_rain_counter={this.props.total_rain_counter} rain_summary_data={this.props.rain_summary_data} props_index ={index} from_time_report={this.props.from_time_report} upto_time_report={this.props.upto_time_report} station_name_grid_data={this.props.station_name_grid_data} data_type={this.props.data_type} stations_graph_data={this.props.stations_graph_data} stations_grid_data={this.props.stations_grid_data} station_name_list={this.props.station_name_list} gridVisible={this.state.gridVisible} />;
													} else if (this.props.value == this.state.Pump_Station_Status || this.props.value == this.state.pump_station_2) {
														    
															return <PumpStationReport avg_time={this.props.avg_time} all_stations_fms={this.props.all_stations_fms} props_index ={index} from_time_report={this.props.from_time_report} upto_time_report={this.props.upto_time_report} station_name_grid_data={this.props.station_name_grid_data} data_type={this.props.data_type} stations_graph_data={this.props.stations_graph_data} stations_grid_data={this.props.stations_grid_data} station_name_list={this.props.station_name_list} gridVisible={this.state.gridVisible} />;
													} else if (this.props.value == this.state.Gated_Canal) {
															return <GatedCanalReport avg_time={this.props.avg_time} props_index ={index} from_time_report={this.props.from_time_report} upto_time_report={this.props.upto_time_report} station_name_grid_data={this.props.station_name_grid_data} data_type={this.props.data_type} stations_graph_data={this.props.stations_graph_data} stations_grid_data={this.props.stations_grid_data} station_name_list={this.props.station_name_list} gridVisible={this.state.gridVisible} />;
													}
												})()}
											</TabPane>
										});
									}
								})()}
									{/*<TabPane tab="Device-1" key="device-1">
										{(() => {
											if (this.state.gridVisible) {
												return <div>
													<Table columns={columns} dataSource={data} scroll={{ y: 540 }} />
												</div>
											} else {
												return <div>
													<Row>
														<ReactHighcharts config={graph1} ref="graph"></ReactHighcharts>
													</Row>
													<Row>
														<ReactHighcharts config={graph2} ref="graph"></ReactHighcharts>
													</Row>
												</div>;
											}
										})()}
									</TabPane>
									<TabPane tab="Device-2" key="device-2">
										{(() => {
											if (this.state.gridVisible) {
												return <div>
													<Table columns={columns} dataSource={data} scroll={{ y: 540 }} />
												</div>
											} else {
												return <div>
													<Row>
														<ReactHighcharts config={graph2} ref="graph"></ReactHighcharts>
													</Row>
												</div>;
											}
										})()}
									</TabPane>*/}
									{/*<TabPane tab="Device-3" key="device-3">
										{(() => {
											if (this.state.gridVisible) {
												return <div>
													<Table columns={columns} dataSource={data} scroll={{ y: 540 }} />
												</div>
											} else {
												return <div>
													<Row>
														<ReactHighcharts config={graph1} ref="graph"></ReactHighcharts>
													</Row>
												</div>;
											}
										})()}
										<Tabs type="card">
											<TabPane tab="Grid" key="grid">
												<Table columns={columns} dataSource={data} />
											</TabPane>
											<TabPane tab="Graph" key="graph">
												<Row>
													<ReactHighcharts config={graph1} ref="graph"></ReactHighcharts>
												</Row>
											</TabPane>
										</Tabs>
									</TabPane>*/}
								</Tabs>
							</Form>;
						} else if (!this.props.getting_report && this.props.archive_data && Object.keys(this.props.archive_data).length && this.props.value == this.state.aura_infra) {
							return <Form layout="vertical" hideRequiredMark className="archive-report">
								{/*<div className="download-button">*/}
									<Button className="download-button view-online" onClick={() => this.props.downloadReportPrep(this.state.stations_selected)} type="primary" >Download CSV File</Button>
								{/*</div>*/}
								<div className="view-online">
									<span>Grid</span>
									<div className='wrapper'>
										<input type='checkbox' id='checkable1' disabled={this.state.value == this.state.Rainfall} onChange={() => this.handleCheckBox()} checked={!this.state.gridVisible} />
										<label htmlFor='checkable1'></label>
									</div>
									<span>Graph</span>
								</div>
								<Tabs type="card" className="draw-tab">
									{(() => {
										if (this.props.data_type == 'raw') {
												return <TabPane tab={this.props.all_stations_aura_names[this.props.stations_selected[0]]} key={this.props.stations_selected[0]}>
													<AurassureReport {...this.props} data_type={this.props.data_type} gridVisible={this.state.gridVisible} />
												</TabPane>;
										} else if (this.props.data_type == 'avg') {
											if (this.props.archive_data && Object.keys(this.props.archive_data).length && this.props.archive_data.station_data && Object.keys(this.props.archive_data.station_data).length) {
												return Object.keys(this.props.archive_data.station_data).map((station, index) => {
													console.log('average AurassureReport', this.props.all_stations_aura_names[station]);
													return <TabPane tab={this.props.all_stations_aura_names[station]} key={station}>
														<AurassureReport {...this.props} param_station_id={station} data_type={this.props.data_type} gridVisible={this.state.gridVisible} />
													</TabPane>;
												});
											}
										}
									})()}
								</Tabs>
							</Form>;
						} else if (this.props.getting_report) {
							return <Loading is_inline={true} />
						} else {
							return <div className="contain">
							{/*<div className="heading">{(this.props.stations_grid_data && this.props.stations_grid_data.length ? this.props.station_name_list[this.props.stations_grid_data[this.props.props_index].id] : '')}</div>*/}
								<Row className="contain top-0 back-transparant" type="flex" justify="space-around">
									<Row className="white error-message">
										<div className="no-data-text">No data available</div>
									</Row>
								</Row>
						</div>;
						}
					})()}
				</Content>
					{/*<div className="draw-btn-container">
						<Button
							style={{
								marginRight: 8,
							}}
							onClick={onCancel}
						>
							Cancel
						</Button>
						<Button onClick={onCancel} type="primary">Submit</Button>
					</div>*/}
				{/*</Drawer>*/}
				{(() => {
					if (this.state.custom_modal) {
						return <Modal
							className="modal-archive"
							visible={this.state.custom_modal}
							title="Customise your Report"
							onOk={() => this.handleOk()}
							onCancel={() => this.closeCustomise()}
							footer={[
							<Button key="back" onClick={() => this.closeCustomise()}>Close</Button>,
							<Button key="submit" type="primary" disabled={((this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra) || (!this.state.stations_selected) || (this.state.stations_selected && this.state.stations_selected.length == 0) || ((this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra && (!this.state.params_selected || (this.state.params_selected && this.state.params_selected.length == 0)))} loading={this.props.getting_report} onClick={() => this.handleSubmit()}>
								Submit
							</Button>,
							]}
						>
							<Form layout="vertical" hideRequiredMark>
								<Row gutter={50}>
									{/*<Col span={12} className="wid-100">
										<Form.Item label="Select City">
											<Select defaultActiveFirstOption={true} placeholder={this.state.city_placeholder} filterOption={true} optionFilterProp="title" value={this.state.city_selected} style={{ width: '100%' }} onChange={(event) => this.handleCitySelect(event)}>
												{(() => {
													if (this.state.city_list && Object.values(this.state.city_list).length) {
														return this.state.city_list.map((station) => {
															return <Option value={station.id} title={station.name}>{station.name}</Option>;
														});
													}
												})()}
											</Select>
										</Form.Item>
									</Col>*/}
									<Col span={12} className="wid-100">
										<Form.Item label="Select Sub-category">
											<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} {...tProps} style={{ width: '100%' }} />
										</Form.Item>
									</Col>
									<Col span={12} className="wid-100">
										<Form.Item label="Select Stations">
											<Select defaultActiveFirstOption={true} placeholder={this.state.stations_placeholder} filterOption={true} optionFilterProp="title" mode="multiple" value={this.state.stations_selected} style={{ width: '100%' }} onChange={(event) => this.handleStationSelect(event)}>
												{(() => {
													if (this.state.filtered_station_list_fms && Object.values(this.state.filtered_station_list_fms).length) {
														return this.state.filtered_station_list_fms.map((station) => {
															return <Option value={station.id} title={station.name}>{station.name}</Option>;
														});
													}
												})()}
											</Select>
											{(() => {
												if ((this.state.stations_selected && this.state.stations_selected.length > 1) && this.state.data_type == 'raw' && this.state.value == this.state.aura_infra) {
													return <span className="color-red">Please Select only one station to view Raw data of Aurassure infra</span>;
												}
											})()}
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={50}>
									<Col span={12} className="wid-100">
										<Form.Item label="Data Type">
											<RadioGroup onChange={(e) => this.handleDataTypeSelection(e)} value={this.state.data_type}>
												{/*<Radio value={1}>Summary</Radio>*/}
												<Radio value={'raw'} disabled={this.state.value == this.state.Rainfall_type}>Raw</Radio>
												<Radio value={'avg'}>Average</Radio>
											</RadioGroup>
											{(() => {
												if (this.state.value != this.state.aura_infra) {
													return <Select value={this.state.avg_time} style={{ width: 120 }} onChange={(event) => this.handleAverageTimeSelect('flood', event)} disabled={this.state.data_type == 'avg' ? false : true}>
													<Option value={900}>15 Minutes</Option>
													<Option value={3600}>1 Hour</Option>
													<Option value={86400}>24 Hours</Option>
												</Select>
												} else if (this.state.value == this.state.aura_infra) {
													return <Select value={this.state.avg_data_time_aura} style={{ width: 120 }} onChange={(event) => this.handleAverageTimeSelect('aura', event)} disabled={this.state.data_type == 'avg' ? false : true}>
													<Option value={1}>1 Hour</Option>
													<Option value={8}>8 Hours</Option>
													<Option value={24}>24 Hours</Option>
												</Select>
												}
											})()}
											
										</Form.Item>
									</Col>
									<Col span={12} className="wid-100 date-pick">
										<Form.Item label="Time Interval">
											<RangePicker
												className="calendar-icon"
												allowClear={false}
												format="DD-MM-YYYY"
												placeholder={['From', 'To']}
												disabledDate={disabledDate}
												value= {[this.state.from_time ? moment(this.state.from_time, "DD-MM-YYYY").tz('Asia/Kolkata') : '', this.state.upto_time ? moment(this.state.upto_time, "DD-MM-YYYY").tz('Asia/Kolkata') : '']}
												onChange={(a,b) => this.dateTimeChange(a,b)}
												onOk={(a,b,c) => this.callAPI(a,b,c)}
											/>
											{/*<DatePicker
												disabledDate={this.disabledStartDate}
												showTime
												format="YYYY-MM-DD HH:mm"
												value={startValue}
												placeholder="From Date "
												onChange={this.onStartChange}
												onOpenChange={this.handleStartOpenChange}
											/>
											<span className="separator"> - </span>
											<DatePicker
												disabledDate={this.disabledEndDate}
												showTime
												format="YYYY-MM-DD HH:mm"
												value={endValue}
												placeholder="To Date"
												onChange={this.onEndChange}
												open={endOpen}
												onOpenChange={this.handleEndOpenChange}
											/>*/}
										</Form.Item>
									</Col>
									{/*<Col span={12} className="wid-100">
										<Form.Item label="Select Device">
											<TreeSelect showSearch treeDefaultExpandAll {...deviceProps} />
										</Form.Item>
									</Col>*/}
								</Row>
								{(() => {
									if (this.state.value == this.state.aura_infra) {
										return <Row gutter={50}>
										{/*<Col span={12} className="wid-100">
											<Form.Item label="Data Type">
												<RadioGroup onChange={this.onChange1} value={this.state.value1}>
													<Radio value={1}>Summary</Radio>
													<Radio value={2}>Raw</Radio>
													<Radio value={3}>Average</Radio>
												</RadioGroup>
											</Form.Item>
										</Col>*/}
											<Col span={12} className="wid-100">
												<Form.Item label="Parameters">
													{/*<CheckboxGroup options={this.state.selected_parameters} defaultValue={this.state.checked_parameters} onChange={(e) => this.addSelectedParametersNew(e)} />*/}
													{(() => {
														if (this.state.stations_selected && this.state.stations_selected.length) {
															return <Checkbox defaultChecked={this.state.select_all_check} checked={this.state.select_all_check} onChange={(e) => this.selectAllParam(e)}>Select All</Checkbox>
														}
													})()}
													{(() => {
														if (this.state.stations_selected && this.state.stations_selected.length) {
															console.log('params_selected', this.state.params_selected);
															return <CheckboxGroup style={{ width: '100%' }} value={this.state.params_selected}  defaultValue={this.state.params_selected} onChange={(e) => this.addSelectedParametersNew(e)}>
																<Row>
																{(() => {
																	if (this.state.params_select_option && this.state.params_select_option.length) {
																		return this.state.params_select_option.map((pollutants) => {
																			return <Col span={12}><Checkbox value={pollutants}><span dangerouslySetInnerHTML={{__html:this.state.param_name_list[pollutants]}}></span></Checkbox></Col>
																		});
																	}
																})()}
																</Row>
															</CheckboxGroup>;
														} else {
															return <span>Please Select a Station</span>
														}
													})()}
												</Form.Item>
											</Col>
											<Col span={12} className="wid-100">
												<Form.Item label="Conversion Type">
													<RadioGroup onChange={(e) => this.handleConversionType(e)} value={this.state.conversion_type}>
														<Radio value={'usepa'}>USEPA</Radio>
														<Radio value={'naqi'}>NAQI</Radio>
													</RadioGroup>
												</Form.Item>
											</Col>
										</Row>
									}
								})()}
								{/*<Row gutter={50}>
									<Col span={12} className="wid-100">
										<Form.Item label="Data Type">
											<RadioGroup onChange={this.onChange2} value={this.state.value2}>
												<Radio value={1}>Grid</Radio>
												<Radio value={2}>Raw</Radio>
											</RadioGroup>
										</Form.Item>
									</Col>
									<Col span={12} className="wid-100">
										<Form.Item label="Conversion Type">
											<RadioGroup onChange={this.onChange3} value={this.state.value3}>
												<Radio value={1}>USEPA</Radio>
												<Radio value={2}>NAQI</Radio>
											</RadioGroup>
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={50}>
									<Col span={12} className="wid-100">
										<Form.Item label="Download Format">
											<RadioGroup onChange={this.onChange4} value={this.state.value4}>
												<Radio value={1}>Excel</Radio>
												<Radio value={2}>Pdf</Radio>
											</RadioGroup>
										</Form.Item>
									</Col>
								</Row>*/}
							</Form>
						</Modal>;
					}
				})()}
			</div>
		);
	}
}

export default ArchiveReports;
