import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Table, Modal, Spin, Card } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

const { Content } = Layout;
const Option = Select.Option;

const TabPane = Tabs.TabPane;

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
        data: [3.9, 4.2, 5.7, 8.5, 11.9]
    }]
};

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
	dataIndex: 'day1',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-2 | 29 / 8',
	dataIndex: 'day2',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-3 | 30 / 8',
	dataIndex: 'day3',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-4 | 31 / 8',
	dataIndex: 'day4',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-5 | 01 / 9',
	dataIndex: 'day5',
	width: 150,
	render: renderContent,
	align: 'center',
}];

const data = [{
	key: '1',
	parameter: 'Rainfall (mm)',
	day1: 1,
	day2: 0,
	day3: 0,
	day4: 0,
	day5: 13,
}, {
	key: '2',
	parameter: 'Max Temperature (deg C)',
	day1: 26,
	day2: 25,
	day3: 25,
	day4: 23,
	day5: 22,
}, {
	key: '3',
	parameter: 'Min Temperature (deg C)',
	day1: 19,
	day2: 19,
	day3: 19,
	day4: 19,
	day5: 18,
}, {
	key: '4',
	parameter: 'Total cloud cover (octa)',
	day1: 6,
	day2: 3,
	day3: 4,
	day4: 4,
	day5: 7,
}, {
	key: '5',
	parameter: 'Max Relative Humidity (%)',
	day1: 99,
	day2: 97,
	day3: 90,
	day4: 91,
	day5: 99,
}, {
	key: '6',
	parameter: 'Min Relative Humidity (%)',
	day1: 78,
	day2: 76,
	day3: 69,
	day4: 67,
	day5: 75,
}, {
	key: '7',
	parameter: 'Wind speed (kmph)',
	day1: 16,
	day2: 13,
	day3: 12,
	day4: 8,
	day5: 7,
}, {
	key: '8',
	parameter: 'Wind direction (deg)',
	day1: 156,
	day2: 202,
	day3: 283,
	day4: 261,
	day5: 195,
}];

class Forecast extends React.Component {
	state = { 
		visible: false,
		imgPath: 'http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg', 
		loading: true
	}

	showModal(imgLink, headName1, headName2) {
		this.setState({
			visible: true,
			imgPath: imgLink,
			headerName1: headName1,
			headerName2: headName2,
			loading: true,
		});
	}

	hideModal() {
		this.setState({
			visible: false,
			imgPath: '',
		});
	}

	hideLoadAnim() {
    this.setState({ 
    	loading: false 
    });
  }

	render () {
		return (
			<div id="forecast">
				<Side active_link="forecast" />
				<Head/>
				<Layout>
					<Layout>
						<Content className="contains">
							<div className="contain back-transparant">
								<div className="white">
									<Row>
										<div className="float-l bold">5-Day (India Meterological Department)</div>
										<div className="float-r">ISSUED ON: 24-8-2018</div>
									</Row>
									<Row className="rows" type="flex" justify="space-around">
										{/*<Table columns={columns} dataSource={data} />*/}
										<Tabs type="card">
										    <TabPane tab="Rainfall" key="rainfall">
										    	<div className="chart-container">
													<ReactHighcharts config={graph1} ref="graph"></ReactHighcharts>
												</div>
										    </TabPane>
										    <TabPane tab="Temp" key="temp">
										    	<div className="chart-container">
													<ReactHighcharts config={graph2} ref="graph"></ReactHighcharts>
												</div>
										    </TabPane>
										    <TabPane tab="Cloud Cover" key="cloud">
										    	<div className="chart-container">
													<ReactHighcharts config={graph1} ref="graph"></ReactHighcharts>
												</div>
										    </TabPane>
										    <TabPane tab="Relative Humidity" key="humidity">
										    	<div className="chart-container">
													<ReactHighcharts config={graph2} ref="graph"></ReactHighcharts>
												</div>
										    </TabPane>
										</Tabs>
									</Row>
									<Row>
										<div className="float-l all-caps mar-top-45">nwp models base district level weather prediction (valid till 08:30 ist of the next 5 days)</div>
									</Row>
								</div>

								<Row className="mar-top-45">
									{/*<div className='hed'>Live Weather</div>*/}
									<Row type="flex" justify="space-between">
										<Card title="Live Weather" bordered={false}>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg")}>
										    	<div className="card-head">Infra Red</div>
										    	<div className="card-body">
													<img  src="http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg" className="live-img"/>
												</div>	
										    </Card.Grid>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg")}>
										    	<div className="card-head">Satellite</div>
										    	<div className="card-body">
													<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF")}>
										    	<div className="card-head">Colour Composite</div>
										    	<div className="card-body">
													<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg")}>
										    	<div className="card-head">Heat Map</div>
										    	<div className="card-body">
													<img src="http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://www.monsoondata.org/wx2/india4.00hr.png")}>
										    	<div className="card-head">Wind Direction</div>
										    	<div className="card-body">
													<img src="http://www.monsoondata.org/wx2/india4.00hr.png"className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style weather" onClick={() => this.showModal("http://www.monsoondata.org/wx2/ezindia4_day1.png")}>
										    	<div className="card-head">Temperature</div>
										    	<div className="card-body">
													<img src="http://www.monsoondata.org/wx2/ezindia4_day1.png" className="live-img"/>
												</div>
										    </Card.Grid>
										</Card>
									</Row>
								</Row>

								{/*<Row className="mar-top-45 white">
									<div className='hed'>Live Weather</div>
									<Row type="flex" justify="space-between">
										<div className="features">
											<div className="feature">
												<div>Infra Red</div>
												<img  src="http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Satellite</div>
												<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Colour Composite</div>
												<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Heat Map</div>
												<img src="http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Wind Direction</div>
												<img src="http://www.monsoondata.org/wx2/india4.00hr.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/india4.00hr.png")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Temperature</div>
												<img src="http://www.monsoondata.org/wx2/ezindia4_day1.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/ezindia4_day1.png")} className="live-img"/>
											</div>
										</div>
									</Row>
								</Row>*/}

								{/*<Row className="mar-top-45 white">
									<div className='hed'>Live Weather</div>
									<Row type="flex" justify="space-between">
										<Col span={3} offset={1} className="center">
											<div>Infra Red</div>
											<img src="http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Satellite</div>
											<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Colour Composite</div>
											<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Heat Map</div>
											<img src="http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Wind Direction</div>
											<img src="http://www.monsoondata.org/wx2/india4.00hr.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/india4.00hr.png")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Temperature</div>
											<img src="http://www.monsoondata.org/wx2/ezindia4_day1.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/ezindia4_day1.png")} className="live-img"/>
										</Col>
									</Row>
								</Row>*/}

								<Row className="mar-top-45 mar-bot-35">
									{/*<div className='hed'>Live Weather</div>*/}
									<Row type="flex" justify="space-between">
										<Card title="Rainfall Forecast" bordered={false}>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg")}>
										    	<div className="card-head">3 Hour</div>
										    	<div className="card-body">
													<img  src="http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg" className="live-img"/>
												</div>	
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif")}>
										    	<div className="card-head">Tomorrow</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif")}>
										    	<div className="card-head">Day 2</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif")}>
										    	<div className="card-head">Day 3</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif")}>
										    	<div className="card-head">Day 4</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif"className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif")}>
										    	<div className="card-head">Day 5</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif")}>
										    	<div className="card-head">Day 6</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif")}>
										    	<div className="card-head">Day 7</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif")}>
										    	<div className="card-head">Day 8</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif")}>
										    	<div className="card-head">Day 9</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif")}>
										    	<div className="card-head">Day 10</div>
										    	<div className="card-body">
													<img src="http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										    <Card.Grid className="grid-style rainfall" onClick={() => this.showModal("http://www.monsoondata.org/wx2/kolkgfs.png")}>
										    	<div className="card-head">Meteogram</div>
										    	<div className="card-body">
													<img src="http://www.monsoondata.org/wx2/kolkgfs.png" className="live-img"/>
												</div>
										    </Card.Grid>
										</Card>
									</Row>
								</Row>

								<Row className="mar-top-45 mar-bot-35">
									{/*<div className='hed'>Live Weather</div>*/}
									<Row type="flex" justify="space-between">
										<Card title="Doppler Rader Data" bordered={false}>
										    <Card.Grid className="grid-style doppler" onClick={() => this.showModal("http://www.imd.gov.in/section/dwr/img/sri_kol.gif")}>
										    	<div className="card-head">Surface Rainfall Intensity</div>
										    	<div className="card-body">
													<img  src="http://www.imd.gov.in/section/dwr/img/sri_kol.gif" className="live-img"/>
												</div>	
										    </Card.Grid>
										    <Card.Grid className="grid-style doppler" onClick={() => this.showModal("http://www.imd.gov.in/section/dwr/img/pac_kol.gif")}>
										    	<div className="card-head">Precipitation Accumulation (PAC) 24 hrs</div>
										    	<div className="card-body">
													<img src="http://www.imd.gov.in/section/dwr/img/pac_kol.gif" className="live-img"/>
												</div>
										    </Card.Grid>
										</Card>
									</Row>
								</Row>

								{/*<Row className="mar-top-45 white mar-bot-35">
									<div className='hed'>Rainfall Forecast</div>
									<Row type="flex" justify="space-between">
										<div className="features">
											<div className="feature">
												<div>3 Hour</div>
												<img src="http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Tomorrow</div>
												<img src="http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 2</div>
												<img src="http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 3</div>
												<img src="http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 4</div>
												<img src="http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 5</div>
												<img src="http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 6</div>
												<img src="http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 7</div>
												<img src="http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 8</div>
												<img src="http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 9</div>
												<img src="http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Day 10</div>
												<img src="http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif")} className="live-img"/>
											</div>
											<div className="feature">
												<div>Meteogram</div>
												<img src="http://www.monsoondata.org/wx2/kolkgfs.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/kolkgfs.png")} className="live-img"/>
											</div>
										</div>
									</Row>
								</Row>*/}

								{/*<Row className="mar-top-45 white mar-bot-35">
									<div className='hed'>Rainfall Forecast</div>
									<Row type="flex" justify="space-around">
										<Col span={3} offset={1} className="center">
											<div>3 Hour</div>
											<img src="http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Tomorrow</div>
											<img src="http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 2</div>
											<img src="http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 3</div>
											<img src="http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 4</div>
											<img src="http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 5</div>
											<img src="http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 6</div>
											<img src="http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 7</div>
											<img src="http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 8</div>
											<img src="http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 9</div>
											<img src="http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Day 10</div>
											<img src="http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif")} className="live-img"/>
										</Col>
										<Col span={3} offset={1} className="center">
											<div>Meteogram</div>
											<img src="http://www.monsoondata.org/wx2/kolkgfs.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/kolkgfs.png")} className="live-img"/>
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
				<Modal
					className="forecast-modal"
					title="Live Weather - Infra Red"
					visible={this.state.visible}
					onCancel={() =>this.hideModal()}
				>
					<Spin spinning={this.state.loading} size="large">
						<img src={this.state.imgPath} onLoad={() =>this.hideLoadAnim()} className="modal-img"/>
					</Spin>
				</Modal>
			</div>
		);
	}
}

export default Forecast;