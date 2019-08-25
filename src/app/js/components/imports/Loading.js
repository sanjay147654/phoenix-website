import React from 'react';
/** 
 * Loading class
 */
export default class Loading extends React.Component  {
	/**
     * This renders the loading svg.
     * @return {object}   Returns value in Object format.
     */
	render(){
		return(<div className={(this.props.is_inline ? 'inline-loading' : 'loading') + (this.props.className ? ' ' + this.props.className : '')}>
			<svg className="loading-spinner" width={this.props.width ? this.props.width : '30'} height={this.props.height ? this.props.height : '30'} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="path" fill="none" strokeWidth={6} strokeLinecap="round" cx={33} cy={33} r={30} />
			</svg>
		</div>);
	}
}