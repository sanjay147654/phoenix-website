import React from 'react';
import { Layout, Row, Col, Button, Select, Icon, Tabs, Table, Modal } from 'antd';
import './forecast.less';
import Head from './Head.jsx';
import Side from './Side.jsx';

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
		imgPath: 'http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg' 
	}

	showModal(imgLink) {
		this.setState({
			visible: true,
			imgPath: imgLink,
		});
	}

	hideModal = () => {
    this.setState({
      visible: false,
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
										<Table columns={columns} dataSource={data} />
									</Row>
									<Row>
										<div className="float-l all-caps mar-top-45">nwp models base district level weather prediction (valid till 08:30 ist of the next 5 days)</div>
									</Row>
								</div>

								<Row className="mar-top-45 white">
									<div className='hed'>Live Weather</div>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/imc/3Dasiasec_ir1.jpg")} className="live-img"/>
											<div>Infra Red</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/xxirm5bbm.jpg")} className="live-img"/>
											<div>Satellite</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF" onClick={() => this.showModal("http://tropic.ssec.wisc.edu/real-time/indian/images/irnm5.GIF")} className="live-img"/>
											<div>Colour Composite</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dasiasec_bt1.jpg")} className="live-img"/>
											<div>Heat Map</div>
										</Col>
									</Row>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://www.monsoondata.org/wx2/india4.00hr.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/india4.00hr.png")} className="live-img"/>
											<div>Wind Direction</div>
										</Col>
									</Row>
								</Row>
								<Row className="mar-top-45 white">
									<div className='hed'>Rainfall Forecast</div>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg" onClick={() => this.showModal("http://satellite.imd.gov.in/img/3Dhalfhr_qpe.jpg")} className="live-img"/>
											<div>3 Hour</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/24hGFS1534rain.gif")} className="live-img"/>
											<div>Tomorrow</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/48hGFS1534rain.gif")} className="live-img"/>
											<div>Day 2</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/72hGFS1534rain.gif")} className="live-img"/>
											<div>Day 3</div>
										</Col>
									</Row>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/96hGFS1534rain.gif")} className="live-img"/>
											<div>Day 4</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/120hGFS1534rain.gif")} className="live-img"/>
											<div>Day 5</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/144hGFS1534rain.gif")} className="live-img"/>
											<div>Day 6</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/168hGFS1534rain.gif")} className="live-img"/>
											<div>Day 7</div>
										</Col>
									</Row>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/192hGFS1534rain.gif")} className="live-img"/>
											<div>Day 8</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/216hGFS1534rain.gif")} className="live-img"/>
											<div>Day 9</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif" onClick={() => this.showModal("http://nwp.imd.gov.in/gfs/240hGFS1534rain.gif")} className="live-img"/>
											<div>Day 10</div>
										</Col>
										<Col span={5} className="center">
											<img src="http://www.monsoondata.org/wx2/kolkgfs.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/kolkgfs.png")} className="live-img"/>
											<div>Meteogram</div>
										</Col>
									</Row>
								</Row>
								<Row className="mar-top-45 white">
									<div className='hed'>Temperature Forecast</div>
									<Row type="flex" justify="space-between">
										<Col span={5} className="center">
											<img src="http://www.monsoondata.org/wx2/ezindia4_day1.png" onClick={() => this.showModal("http://www.monsoondata.org/wx2/ezindia4_day1.png")} className="live-img"/>
											<div>East</div>
										</Col>
									</Row>
								</Row>
							</div>
						</Content>
					</Layout>
				</Layout>
				<Modal
		          title=""
		          visible={this.state.visible}
		          onCancel={this.hideModal}
		        >
		          <img src={this.state.imgPath} className="modal-img"/>
		        </Modal>
			</div>
		);
	}
}

export default Forecast;