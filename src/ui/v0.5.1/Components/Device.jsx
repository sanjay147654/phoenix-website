import React from 'react';
import { Layout, Row, Col, Button, Icon, Table, Input, Tabs, Tooltip, Card } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

HighchartsMore(ReactHighcharts.Highcharts);
HighchartsSolidGauge(ReactHighcharts.Highcharts);

const TabPane = Tabs.TabPane;
const status_txt = <span>Power On</span>;
const health_txt = <span>Health Ok</span>;

const config = {
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
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	},
	 plotOptions: {
		pie: {
			allowPointSelect: true,
			cursor: 'pointer',
			dataLabels: {
					enabled: false
			},
			showInLegend: true
		}
	},
		series: [{
				name: 'Brands',
				colorByPoint: true,
				data: [{
						name: '>90%',
						y: 61.41,
						sliced: true,
						selected: true
				}, {
						name: '90-60%',
						y: 11.84
				}, {
						name: '<60%',
						y: 10.85
				}, {
						name: '0%',
						y: 4.67
				}]
		}]
};

const data = [{
	key: '1',
	qr: 'qr234742',
	name: 'Station one',
	type: 'B',
	date: '18:15, 07 Sep'
}, {
	key: '2',
	qr: 'qr234452',
	name: 'Station two',
	type: 'A',
	date: '18:05, 07 Sep'
}, {
	key: '3',
	qr: 'qr234752',
	name: 'Station three',
	type: 'A1',
	date: '18:55, 07 Sep'
}, {
	key: '4',
	qr: 'qr237742',
	name: 'Station four',
	type: 'C',
	date: '18:15, 07 Sep'
}, {
	key: '5',
	qr: 'qr234792',
	name: 'Station five',
	type: 'D',
	date: '18:15, 07 Sep'
}, {
	key: '6',
	qr: 'qr234782',
	name: 'Station six',
	type: 'B',
	date: '18:15, 07 Sep'
}, {
	key: '7',
	qr: 'qr234747',
	name: 'Station seven',
	type: 'E',
	date: '17:15, 07 Sep'
}, {
	key: '8',
	qr: 'qr214742',
	name: 'Station eight',
	type: 'F',
	date: '18:35, 07 Sep'
}];

const { Content } = Layout;

export default class Device extends React.Component {

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
			searchText: '',
			sortedInfo: null,
		};
	}

	handleSearch = (selectedKeys, confirm) => () => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	}

	handleChange = (sorter) => {
    this.setState({
      sortedInfo: sorter,
    });
  }

  setNameSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'name',
      },
    });
  }

	handleReset = clearFilters => () => {
		clearFilters();
		this.setState({ searchText: '' });
	}

	callback(key) {
		console.log(key);
	}

	checkValue(value, record){
		console.log('hiiii_record', record);
		console.log('hiiii_value', value);
		console.log('contains', record.qr[0].toLowerCase().includes(value.toLowerCase()));
		if (record.qr && record.qr.length) {
			if (record.qr[0].toLowerCase().includes(value.toLowerCase()) || record.qr[1].toLowerCase().includes(value.toLowerCase())) {
				return true;
			}
		}
	}

	render () {
		let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
		const columns = [{
			title: 'Status',
			width: 80,
			key: 'status',
			align: 'center',
			render: () => (
				<Tooltip placement="top" title={status_txt}>
					<img src="http://127.0.0.1:8080/power_on.svg" className="status-img" />
				</Tooltip>
			),
		}, {
			title: 'QR Code',
			width: 180,
			dataIndex: 'qr',
			key: 'qr',
		}, {
			title: 'Name',
			width: 200,
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
		},
		 /*{
			title: 'QR Code',
			dataIndex: 'qr',
			width: 150,
			key: 'qr',
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div className="custom-filter-dropdown">
					<Input
						ref={ele => this.searchInput = ele}
						placeholder="Search type"
						value={selectedKeys[0]}
						onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={this.handleSearch(selectedKeys, confirm)}
					/>
					<Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>Search</Button>
					<Button onClick={this.handleReset(clearFilters)}>Reset</Button>
				</div>
			),
			filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
			onFilter: (value, record) => this.checkValue(value, record),
			onFilterDropdownVisibleChange: (visible) => {
				if (visible) {
					setTimeout(() => {
						this.searchInput.focus();
					});
				}
			},
			render: (text) => {
				const { searchText } = this.state;
				console.log('de_data', text);
				return searchText ? (
					<div>
						<div>
							{text[0].split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
								fragment.toLowerCase() === searchText.toLowerCase()
									? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
							))}
						</div>
						<div>
							{text[1].split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
								fragment.toLowerCase() === searchText.toLowerCase()
									? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
							))}
						</div>
					</div>
				) : <div><div>{text[0]}</div><div>{text[1]}</div></div>;
			},
		},*/ {
			title: 'Type',
			width: 80,
			dataIndex: 'type',
			key: 'type',
			filters: [{
				text: 'All',
				value: 'all',
			}, {
				text: 'A',
				value: 'A',
			},{
				text: 'A1',
				value: 'A1',
			}, {
				text: 'B',
				value: 'B',
			}, {
				text: 'C',
				value: 'C',
			}, {
				text: 'D',
				value: 'D',
			}, {
				text: 'E',
				value: 'E',
			}, {
				text: 'F',
				value: 'F',
			}],
			onFilter: (value, record) => record.type.indexOf(value) === 0,
		}, {
			title: 'Last Data Received',
			dataIndex: 'date',
			width: 150,
			key: 'date'
		}, {
			title: 'Health',
			dataIndex: 'health',
			width: 80,
			key: 'health',
			align: 'center',
			render: () => (
				<Tooltip placement="top" title={health_txt}>
					<img src="http://127.0.0.1:8080/tick.svg" className="status-img" />
				</Tooltip>
			),
		}];

		return (
			<div id="device">
				<Side active_link="device" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<div className="tab-container">
								<Tabs onChange={this.callback} type="card">
									<TabPane tab="All" key="all"></TabPane>
									<TabPane tab="A" key="a"></TabPane>
									<TabPane tab="A1" key="a1"></TabPane>
									<TabPane tab="B" key="b"></TabPane>
									<TabPane tab="C" key="c"></TabPane>
									<TabPane tab="D" key="d"></TabPane>
									<TabPane tab="E" key="e"></TabPane>
									<TabPane tab="F" key="f"></TabPane>
									<TabPane tab="G" key="g"></TabPane>
								</Tabs>
							</div>
							<Row type="flex" justify="space-around" className="device-details">
								<Col span={7} className="width-100">
									<div className="pie-text">Total Number of Devices -
										<span className="online-device"> 66</span>
										<span> </span>
										(<span className="success">54 </span>/<span className="danger"> 12</span>)
									</div>	
									<ReactHighcharts config={config} ref="chart"></ReactHighcharts>
								</Col>
								<Col span={5} className="pie-details">
									<Card 
									title="Offline Devices" 
									className="back-grey"
									extra={
										<div className="count">
											24
										</div>
									}>
										<div className="device-name-container">
											<div className="device-names">Device-1</div>
											<div className="device-names">Device-2</div>
											<div className="device-names">Device-3</div>
											<div className="device-names">Device-4</div>
											<div className="device-names">Device-5</div>
											<div className="device-names">Device-6</div>
											<div className="device-names">Device-7</div>
											<div className="device-names">Device-8</div>
											<div className="device-names">Device-9</div>
											<div className="device-names">Device-10</div>
											<div className="device-names">Device-11</div>
											<div className="device-names">Device-12</div>
											<div className="device-names">Device-13</div>
											<div className="device-names">Device-14</div>
											<div className="device-names">Device-15</div>
										</div>
									</Card>
								</Col>
								<Col span={8} className="activity-details">
									<Card title="Recent Activities" className="back-grey">
										<div className="activity-container">
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-1</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-2</Col>
												<Col span={4} className="danger">Offline</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-3</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-4</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-5</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-6</Col>
												<Col span={4} className="danger">Offline</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-7</Col>
												<Col span={4} className="danger">Offline</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-8</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-9</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-10</Col>
												<Col span={4} className="success">Online</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
											<Row type="flex" justify="space-between" className="activities">
												<Col span={6}>Device-11</Col>
												<Col span={4} className="danger">Offline</Col>
												<Col span={8}>11:50, 31 Aug</Col>
											</Row>
										</div>
									</Card>
								</Col>
							</Row>
						</Content>
					</Layout>
				
					<Layout className="table-contain">
						<Content>
							{/*<Row type="flex" justify="space-around" className="filter-contain" align="middle">
								<Col span={1} className="center">
									<Icon type="filter" className="grid" />
								</Col>
								<Col span={23}>
									<span className="filters mar-left-15">All Device</span>
									<span className="filters">Online</span>
									<span className="filters">Offline</span>
								</Col>
							</Row>*/}
							{/*<div className="table-head">All Devices</div>*/}
							<div className="table-search">
								<Input placeholder="Search by Station Name or Device QR Code" prefix={<Icon type="search" />} />
							</div>
							<Row>
								<Table columns={columns} dataSource={data} onChange={this.handleChange} />
							</Row>
						</Content>	
					</Layout>
				</Layout>
			</div>
		);
	}
}