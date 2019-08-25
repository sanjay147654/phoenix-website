import React from 'react';
// import NavLink from './NavLink';
import { Link } from 'react-router-dom';
import { Layout, Row, Col, Spin} from 'antd';
import Head from './imports/Head';
import Side from './imports/Side';
import Loading from './imports/Loading';

/**
 * Component for the error page.
 */
export default class FloodModel3rdParty extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
	}
	/**
	 * Predefined function of ReactJS.
	 */
	componentDidMount() {
		document.title = 'Flood Model - Flood Forecasting and Early Warning System for Kolkata City';
	}

	removeLoder() {
		if (document.getElementById('spinner')) {
			document.getElementById('spinner').style.display='none';
		}
	}

	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		return(
			<div id="flood_model_3rd_party">
				<Side active_link="flood-model"/>
				<Head  active_link="flood-model"/>
				<Layout>
					{/*<div className="full-page-container">
						<iframe src="https://inrm.co.in/applications/adb_kmc/index.html"></iframe>
					</div>*/}
					<div id="spinner" className="full-page-container">
						<Loading />
					</div>
					<div className="full-page-container">
						<iframe src="https://inrm.co.in/applications/adb_kmc/index.html" onLoad={() => {this.removeLoder()}}></iframe>
					</div>
				</Layout>
			</div>
		);
	}
}
