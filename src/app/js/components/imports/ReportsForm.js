import React from 'react';
import moment from 'moment-timezone';
import DateTime from 'react-datetime';
// import Select from './Select';
// import MultiSelect from './MultiSelect';
import _ from 'lodash';
import { Layout, Row, Col, Button, Select, Divider, Icon, Radio, Checkbox, Tabs, TreeSelect, Input, Tooltip, Menu, DatePicker, notification, Alert } from 'antd';

const SHOW_PARENT = TreeSelect.SHOW_CHILD;
const { Content, Footer } = Layout;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

const queryString = require('query-string');

let view_data_format_options = [
	{label: 'Grid', value: 'grid'},
	{label: 'Graph', value: 'graph'}
];
// let treeData = [];

function disabledDate(current) {
	// Can not select future dates
	return current && current >= moment().tz('Asia/Kolkata').endOf('day');
}
/**
 * Component for the form in reports page.
 */
export default class ReportsForm extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * the state of the component
		 * @type {object}
		 * @property {string} stations_placeholder placeholder for stations multiselect
		 * @property {object} all_stations_list list of all the stations
		 * @property {number} avg_time no of seconds of which, average to be done
		 * @property {array} view_data_format type in which the data to be shown 'grid' or 'graph'
		 * @property {array} stations_selected list of station selected.
		 * @property {string} from_time From Time.
		 * @property {string} upto_time Upto Time.
		 */
		this.state = {
			all_stations: null,
			Rainfall_type: 11,
			data_type: this.props.data_type,
			stations_selected: [],
			avg_time: 3600,
			view_data_format: ['grid', 'graph'],
			from_time: moment().tz('Asia/Kolkata').startOf('days').format('DD-MM-YYYY'),
			upto_time: moment().tz('Asia/Kolkata').format('DD-MM-YYYY'),
			stations_placeholder: 'Select Stations',
		};
		/**
		 * Tree properties
		 * @type {Object}
		 */
		this.treeData = props.treeData;
	}
/**
 * Predefined function of ReactJS.  It is called every time the component updates.
 * @param  {Object} prevProps Previous Props
 */
	componentDidUpdate(prevProps) {
		if (prevProps.value != this.props.value) {
			this.setState({
				stations_selected:[]
			});
			if (this.props.value == this.state.Rainfall_type) {
				this.handleDataTypeSelection({
					target: {
						value: 'avg'
					}
				})
			}
		}
	}

	/**
	 * This function validate the required data to be sent to API for viewing & download.
	 * @return {Boolean|Object} This will return either Boolean false value or the verified object of data for API.
	 */
	validateData() {
		let that = this;
		let required_params = [];
		let from_time = that.state.from_time ? moment(that.state.from_time, "DD-MM-YYYY").tz('Asia/Kolkata').unix() : null,
			upto_time = that.state.upto_time ? (that.state.upto_time == moment().tz('Asia/Kolkata').format('DD-MM-YYYY') ? moment().tz('Asia/Kolkata').unix() : moment(that.state.upto_time, "DD-MM-YYYY").tz('Asia/Kolkata').endOf('day').unix()) : null;
		let err_msg;
		let value;

		console.log('that.props.value', that.props.value);
		console.log('that.state.stations_selected', that.state.stations_selected);
		console.log('from_time', from_time);
		console.log('upto_time', upto_time);
		console.log('upto_time', from_time - upto_time);
		console.log('that.state.data_type', that.state.data_type);
		console.log('that.state.avg_time', that.state.avg_time);
		console.log('that.state.view_data_format', that.state.view_data_format);
		if ((that.props.value && (that.state.stations_selected && that.state.stations_selected.length) && (from_time && upto_time && (upto_time - from_time > 0)) && that.state.data_type && that.state.avg_time && (that.state.view_data_format && that.state.view_data_format.length))) {
			if ((that.state.data_type == 'raw' && (upto_time - from_time  <= 604800))) {
				value = {
					sub_category: that.props.value,
					stations: that.state.stations_selected,
					from_time: from_time,
					upto_time: upto_time,
					data_type: that.state.data_type,
					avg_data_time: that.state.data_type == 'avg' ? that.state.avg_time : null,
					view_data_format: that.state.view_data_format
				}
			} else if (that.state.data_type == 'avg') {
				value = {
					sub_category: that.props.value,
					stations: that.state.stations_selected,
					from_time: from_time,
					upto_time: upto_time,
					data_type: that.state.data_type,
					avg_data_time: that.state.data_type == 'avg' ? that.state.avg_time : null,
					view_data_format: that.state.view_data_format
				}
			} else {
				if (!that.props.value) {
					that.openNotification('error', 'Please Select a Sub-category')
				} else if (!that.state.stations_selected || (that.state.stations_selected && that.state.stations_selected.length == 0)) {
					that.openNotification('error', 'Please Select atleast one Station')
				} else if (!from_time || !upto_time) {
					that.openNotification('error', 'Please Select the From and Upto date')
				} else if ((from_time && upto_time && (from_time - upto_time > 0))) {
					that.openNotification('error', 'From time must be less than Upto time')
				} else if (!that.state.data_type) {
					that.openNotification('error', 'Please Select a Data Type');
				} else if (!that.state.avg_time) {
					that.openNotification('error', 'Please Select the Average Time');
				} else if (!that.state.view_data_format || (that.state.view_data_format && that.state.view_data_format.length == 0)) {
					that.openNotification('error', 'Please Select atleast one view data format');
				} else if (that.state.data_type == 'raw' && (upto_time - from_time  >= 604800)) {
					that.openNotification('error', 'For Raw data, Date Range should not exceed 7 days');
				}
			}
		} else if (!that.props.value) {
			that.openNotification('error', 'Please Select a Sub-category')
		} else if (!that.state.stations_selected || (that.state.stations_selected && that.state.stations_selected.length == 0)) {
			that.openNotification('error', 'Please Select atleast one Station')
		} else if (!from_time || !upto_time) {
			that.openNotification('error', 'Please Select the From and Upto date')
		} else if ((from_time && upto_time && (from_time - upto_time > 0))) {
			that.openNotification('error', 'From time must be less than Upto time')
		} else if (!that.state.data_type) {
			that.openNotification('error', 'Please Select a Data Type');
		} else if (!that.state.avg_time) {
			that.openNotification('error', 'Please Select the Average Time');
		} else if (!that.state.view_data_format || (that.state.view_data_format && that.state.view_data_format.length == 0)) {
			that.openNotification('error', 'Please Select atleast one view data format');
		} else if (that.state.data_type == 'raw' && (upto_time - from_time  >= 604800)) {
			that.openNotification('error', 'For Raw data, Date Range should not exceed 7 days');
		}

		return value;
	}

	/**
	 * This function opens the notification in render.
	 */
	openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};

	/**
	 * This function sets the station selected in the state.
	 * @param  {Array} event Array of atation Ids selected.
	 */
	handleStationSelect(event) {
		this.setState({
			stations_selected: event
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

	/**
	 * This function sets the data type.
	 * @param  {Object} e Event triggered.
	 */
	handleDataTypeSelection(e) {
		this.setState({
			data_type: e.target.value
		}, () => this.props.setDataType(this.state.data_type));
	}

	/**
	 * This function sets the view data format.
	 * @param  {Array} e Array of selected view.
	 */
	handleViewDataFormat(e) {
		this.setState({
			view_data_format: e
		});
	}

	/**
	 * This function sets the Date selected from the date-time picker.
	 * @param  {Object} dates       
	 * @param  {Array} dateStrings araay of from and upto times.
	 */
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
	 * This function is called when the view button is clicked.
	 * This function calls another function to validate the data, and if it returns the values then the function for calling the API is called.
	 */
	getReport() {
		let data_to_be_posted = this.validateData();
		console.log('data_to_be_posted', data_to_be_posted);
		if(data_to_be_posted) {
			this.props.getReport(data_to_be_posted);
		}
	}
	/**
	 * This function is called when the download button is clicked.
	 * This function calls another function to validate the data, and if it returns the values then the download is started.
	 */
	downloadReport() {
		let that = this;
		let data_to_be_posted = that.validateData();
		console.log('data_to_be_posted', data_to_be_posted);
		if(data_to_be_posted) {
			let data_to_be_sent = {
				sub_category: data_to_be_posted['sub_category'],
				stations: data_to_be_posted['stations'],
				from_time: data_to_be_posted['from_time'],
				upto_time: data_to_be_posted['upto_time'],
				data_type: data_to_be_posted['data_type'],
				//avg_data_time: data_to_be_posted['avg_data_time'],
				view_data_format: data_to_be_posted['view_data_format']
			};
			if (data_to_be_posted.avg_data_time) {
				if (!data_to_be_sent.avg_data_time) {
					data_to_be_sent.avg_data_time = data_to_be_posted['avg_data_time'];
				} else {
					data_to_be_sent.avg_data_time = data_to_be_posted['avg_data_time'];
				}
			}
			// console.log('data_to_be_posted', data_to_be_posted);
			// window.location = '##PR_STRING_REPLACE_API_BASE_PATH##' + 'download_archive_data.php?d='+ JSON.stringify(data_to_be_sent);
			let download_str = that.serialize(data_to_be_sent);
			console.log('final query: ', download_str);
			that.setState({download_file: true});
			let download_window = window.open('##PR_STRING_REPLACE_API_BASE_PATH##/stations/download_report?' + download_str, '_blank');
			let timer = setInterval(function() {
				if(download_window.closed) {
					clearInterval(timer);
					that.setState({download_file: false});
				}
			}, 500);
		}
	}
	/**
	 * This function creates the string to be passed in the url for downloading a report.
	 * @param  {Object} obj Object which is to be converted in a string.
	 */
	serialize(obj) {
		let str = [];
		Object.keys(obj).map((key) => {
			if (key == 'stations' || key == 'view_data_format') {
				str.push(key + '=' + JSON.stringify(obj[key]));
			} else {
				str.push(key + '=' + obj[key]);
			}
		});
		return str.join("&");
	}
	/**
	 * This renders the main dashboard page with navigation bar.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		const tProps = {
			treeData: this.treeData,
			value: this.props.value,
			// onChange: (e) => this.onChange(e),
			treeCheckable: true,
			treeNodeFilterProp: 'title',
			placeholder: 'Please Select a station sub-category',
			treeDefaultExpandAll: true,
			showCheckedStrategy: SHOW_PARENT,
		};
		return <div className="archive-form">
			<h3 className="archive-title">Select your requirements</h3>
			<div className="archive-options">
				<div className="option-row">
					<div className="option-label">Subcategories</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view" span={10}>
								<TreeSelect onChange={(value, label, extra) => this.props.treeSelect(value, label, extra)} {...tProps} style={{ width: '100%' }} />
							</Col>
						</div>
					</div>
				</div>
				<div className="option-row">
					<div className="option-label">Stations</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view" span={10}>
								<Select defaultActiveFirstOption={true} placeholder={this.state.stations_placeholder} filterOption={true} optionFilterProp="title" mode="multiple" value={this.state.stations_selected} style={{ width: '100%' }} onChange={(event) => this.handleStationSelect(event)}>
									{(() => {
										if (this.props.station_list && Object.values(this.props.station_list).length) {
											return this.props.station_list.map((station) => {
												return <Option value={station.id} title={station.name}>{station.name}</Option>;
											});
										}
									})()}
								</Select>
							</Col>
						</div>
					</div>
				</div>
				<div className="option-row">
					<div className="option-label">Time Interval</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view data-view-time-picker" span={10}>
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
							</Col>
						</div>
					</div>
				</div>
				<div className="option-row">
					<div className="option-label">Data Type</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view" span={10}>
								<RadioGroup onChange={(e) => this.handleDataTypeSelection(e)} value={this.state.data_type}>
									<Radio value={'raw'} disabled={this.props.value == this.state.Rainfall_type}>Raw</Radio>
									<Radio value={'avg'}>Average</Radio>
								</RadioGroup>
								<Select value={this.state.avg_time} style={{ width: 120 }} onChange={(event) => this.handleAverageTimeSelect(event)} disabled={this.state.data_type == 'avg' ? false : true}>
									<Option value={900}>15 Minutes</Option>
									<Option value={3600}>1 Hour</Option>
									<Option value={86400}>24 Hours</Option>
								</Select>
							</Col>
						</div>
					</div>
				</div>
				<div className="option-row">
					<div className="option-label">View Data Format</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view" span={10}>
								<CheckboxGroup options={view_data_format_options} value={this.state.view_data_format} onChange={(e) => this.handleViewDataFormat(e)} />
							</Col>
						</div>
					</div>
				</div>
				<div className="option-row">
					<div className="option-label">NB.:</div>
					<div className="option-content">
						<div className="data-source">
							<Col className="data-view" span={10}>
								<div className="note-content">
								Reports generated between 00:00 to 00:10 might not be accurate due pending server-side data processing during the period.
								</div>
							</Col>
						</div>
					</div>
				</div>
			</div>
			<div className="archive-btns">
				<Button type="primary" id="view_data_btn" className="btn btn-primary" onClick={() => this.getReport()} loading={this.props.getting_report ? true : false}  >View</Button>
				<Button id="download_data_btn" className="btn btn-success" loading={this.state.download_file ? true : false} onClick={() => this.downloadReport()} >Download</Button>
			</div>
			<div className="text-danger text-center" id="archive_error"></div>
		</div>;
	}
}

// ReportsForm.contextTypes = {
// 	router: React.PropTypes.object
// };