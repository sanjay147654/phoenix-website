import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Table, Modal, Spin } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsSolidGauge from 'highcharts-solid-gauge';

const { Content } = Layout;
const Option = Select.Option;


const bar_graph = {
	chart: {
        type: 'bar',
        height: 500
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: ['Rainfall(mm)', 'Max. Temp.(°C)', 'Min Temp.(°C)', 'Total cloud cover(octa)', 'Max. relative humidity(%)', 'Min. relative humidity(%)', 'Wind speed(kmph)', 'Wind direction(°)'],
        title: {
            text: null
        },
        labels: {
		  style: {
		    fontWeight: 'bold'
		  }
		}
    },
    yAxis: {
        min: 0,
        title: {
            text: '',
            align: 'high'
        },
        labels: {
            overflow: 'justify'
        }
    },
    tooltip: {
        valueSuffix: ''
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: false
            }
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: ('#FFFFFF'),
        shadow: true,
        itemStyle: {
            fontWeight: 'normal'
        }
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Day-1',
        data: [1, 33, 26, 3, 99, 79, 15, 135]
    }, {
        name: 'Day-2',
        data: [5, 31, 25, 5, 99, 79, 11, 158]
    }, {
        name: 'Day-3',
        data: [0, 32, 25, 5, 99, 78, 12, 167]
    }, {
        name: 'Day-4',
        data: [1, 32, 25, 5, 98, 76, 14, 204]
    }, {
        name: 'Day-5',
        data: [14, 29, 24, 7, 99, 80, 6, 246]
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
	dataIndex: 'model1',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-2 | 29 / 8',
	dataIndex: 'model2',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-3 | 30 / 8',
	dataIndex: 'model3',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-4 | 31 / 8',
	dataIndex: 'model4',
	width: 150,
	render: renderContent,
	align: 'center',
}, {
	title: 'DAY-5 | 01 / 9',
	dataIndex: 'model5',
	width: 150,
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
										<div className="chart-container">
											<ReactHighcharts config={bar_graph} ref="bar_graph"></ReactHighcharts>
										</div>
									</Row>
									<Row>
										<div className="float-l all-caps mar-top-45">nwp models base district level weather prediction (valid till 08:30 ist of the next 5 days)</div>
									</Row>
								</div>

								<Row className="mar-top-45 white">
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
								</Row>

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

								<Row className="mar-top-45 white mar-bot-35">
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
								</Row>

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