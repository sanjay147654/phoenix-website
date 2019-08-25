import * as React from 'react';
import ReactDOM from 'react-dom';

import App from './App.js';
import registerServiceWorker from './registerServiceWorker';

import '../styles/style.styl';

let content = <App />;
if(window.ActiveXObject || 'ActiveXObject' in window){
	console.log('Internet Explorer Detected!');
	content = <div style={{display: 'flex', alignItems: 'center', backgroundColor: '#fafafa'}}>
		<center style={{display: 'table', margin: 'auto', padding: '40px 60px', backgroundColor: '#fff', borderRadius: 10, boxShadow: '1px 1px 2px 2px #ddd'}}>
			<div>
				<div style={{marginBottom: 20}}>
					<svg xmlns="http://www.w3.org/2000/svg" width="66.137" height="66.137">
						<g fill="#5D5D5D">
							<path d="M33.067 66.136C14.834 66.136 0 51.302 0 33.068S14.834.001 33.067.001c18.234 0 33.07 14.834 33.07 33.067s-14.835 33.068-33.07 33.068zm0-62.135C17.039 4.001 4 17.04 4 33.068s13.039 29.067 29.067 29.067c16.029 0 29.07-13.039 29.07-29.067S49.096 4.001 33.067 4.001z"></path>
							<circle cx="24.927" cy="24.825" r="4.334"></circle>
							<circle cx="41.21" cy="24.825" r="4.334"></circle>
							<path d="M20.613 47.246l-2.404-3.197c18.005-13.532 30.864.108 30.992.247l-2.943 2.709c-.427-.458-10.6-11.067-25.645.241z"></path>
						</g>
					</svg>
				</div>
				<div style={{color: '#5D5D5D', fontSize: 18, lineHeight: 1.5}}>Sorry! Your browser is not supported.</div>
				<div style={{color: '#5D5D5D', fontSize: 18, lineHeight: 1.5}}>For best experience use latest version of Google Chrome browser.</div>
			</div>
		</center>
	</div>;
}

ReactDOM.render(content, document.getElementById('react_container'));
registerServiceWorker();
