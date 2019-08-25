import React from 'react';
// import NavLink from './NavLink';
import { Link } from 'react-router-dom';
import Head from './imports/Head';
import Side from './imports/Side';

/**
 * Component for the error page.
 */
export default class Error404 extends React.Component {
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
		document.title = 'Error404 - Flood Forecasting and Early Warning System for Kolkata City';
	}
	/**
	 * Predefined function of ReactJS to render the component.
	 * @return {Object}
	 */
	render() {
		return(
			<div>
				<Side />
				<Head/>
				<div className="full-page-container">
					{/*<NavLink />*/}
					<div className="background">
						<center className="center-error">
							<div className="data-err-page">
								<div className="data-err-page-img">
									<svg xmlns="http://www.w3.org/2000/svg" width="66.137" height="66.137">
										<g fill="#5D5D5D"><path d="M33.067 66.136C14.834 66.136 0 51.302 0 33.068S14.834.001 33.067.001c18.234 0 33.07 14.834 33.07 33.067s-14.835 33.068-33.07 33.068zm0-62.135C17.039 4.001 4 17.04 4 33.068s13.039 29.067 29.067 29.067c16.029 0 29.07-13.039 29.07-29.067S49.096 4.001 33.067 4.001z"></path><circle cx="24.927" cy="24.825" r="4.334"></circle><circle cx="41.21" cy="24.825" r="4.334"></circle><path d="M20.613 47.246l-2.404-3.197c18.005-13.532 30.864.108 30.992.247l-2.943 2.709c-.427-.458-10.6-11.067-25.645.241z"></path>
										</g>
									</svg>
								</div>
								<div className="data-err-page-msg">{"Sorry, the page you were looking for wasn't found."}</div>
								<Link to={'/'}>
									<button type="button" className="err-btn redirect-home">Go To Home Page</button>
								</Link>
							</div>
						</center>
					</div>
				</div>
			</div>
		);
	}
}
