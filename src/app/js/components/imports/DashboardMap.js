import React from 'react';
import { Switch } from 'antd';
import _ from 'lodash';
import moment from 'moment-timezone';

let i;
let gMarkers = [];
let dash_info = [];
let marker_new = [];
let bounds, loc;
let mb, mib;
let ctaLayer1,
	ctaLayer2,
	ctaLayer3,
	ctaLayer4,
	ctaLayer5,
	ctaLayer6;



/**
 * This is the class used to set the map in Dashboard page.
 */
export default class DashboardMap extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * State of the component
		 * @type {Object}
		 * @param {Number} pump_station ID of pump station sub category.
		 * @param {String} rainfall_type Rainfall type.
		 * @param {Number} major_road_junction ID of major_road_junction.
		 * @param {Number} street_sub_house_front ID of street_sub_house_front.
		 * @param {Number} rainfall ID of rainfall.
		 * @param {Number} open_canal ID of open_canal.
		 * @param {Number} gated_canal ID of gated_canal.
		 * @param {Number} major_road_junction_water ID of major_road_junction_water.
		 * @param {Number} street_sub_house_front_water ID of street_sub_house_front_water.
		 * @param {Number} street_sub_house_front_water ID of street_sub_house_front_water.
		 */
		this.state = {
			pump_station: 4,
			pump_station_2: 12,
			rainfall_type: 'rainfall',
			major_road_junction: 1,
			street_sub_house_front: 2,
			rainfall: 11,
			open_canal: 5,
			gated_canal: 6,
			major_road_junction_water: 8,
			street_sub_house_front_water: 7,
			Bus: 9,
			traffic_map_view: props.traffic_map_view
		};
		/**
		 * Google map for the Dashboard
		 * @type {Object}
		 */
		console.log('console', this.props);
		this.maps = null;
		this.trafficLayer = null;
		/**
		 * Markers
		 */
		this.markerCluster = null;
		
	}

	/**
	 * Creates the tooltip in map.
	 * @param  {object} data DG data for tooltip creation.
	 * @return {string}      String of html for map tooltip.
	 */
	createMapTooltip(data) {
		// console.log('data map', data);
		let content = '<div class="pointer-details">';
		content += '<div class="client-name">'+data.name+'</div>';
		content += '<div class="address">Type: <span>' + this.props.sub_category_object[data.sub_category] + '</span></div>';
		/*if (data.address != '') {
			content += '<div class="address">Address: <span>' + data.address + '</span></div>';
		}
		content += '<div class="last-time">Last data received at: <span>' + ((data.last_data_send != 0) ? moment.unix(data.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never') + '</span></div>';
		if (data.parameters && data.parameters.length) {
			data.parameters.map((param, index) => {
				
			});*/
			// if (data.parameters[0].name !== 'Rainfall') {
			/*	content+= '<div class="table-container"><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>';
				
				data.parameters.map((param, index) => {
					if (param.name !== 'Rainfall' && param.name != 'Distance') {
						if (param.value !== 'NA') {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value param-'+ param.value +'">' + param.value + ' ' + param.unit + '</td></tr>';
						} else {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value">' + param.value + '</td></tr>';
						}
					}
				});
				if (data.rainfall_1 && Object.values(data.rainfall_1).length) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last hour</td><td class="param-value param-'+ data.rainfall_1.value +'">' + data.rainfall_1.value + ' ' + (data.rainfall_1.value != 'NA' ? data.rainfall_1.unit : '') + '</td></tr>';
				}
				if (data.rainfall_24 && Object.values(data.rainfall_24).length) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last 24 hours</td><td class="param-value param-'+ data.rainfall_24.value +'">' + data.rainfall_24.value + ' ' + (data.rainfall_24.value != 'NA' ? data.rainfall_24.unit : '') + '</td></tr>';
				}
				content += '</tbody></table></div>';*/
			// }
		// } 
		/*if ((data.show_trend == 1) || (data.show_trend == 0)) {
			content += '<div class="button-container"><button type="button" id="trend_button" class="btn btn-save" value="stations/' + data.id + '/24-hours-trend/' + (window.location.href.split('?').length == 2 ? '?' + window.location.href.split('?')[1] : '') + '">View 24 hours trend</button></div>';
		}*/
		content += '</div>';
		return content;
	}

	/**
	 * Predefined function of React.js. It configures and sets the map.
	 */
	componentDidMount() {
		// console.log('this.props.avg_lat', this.props.avg_lat);
		this.generateMap(this.state.traffic_map_view);
		console.log('in dashmap', this.maps);
		
	}

	generateMap(data) {
		if ((document.getElementById('mapView')) && (this.props.searched_list && this.props.searched_list.length) && this.props.avg_lat) {
			console.log('called now');
			this.maps = new google.maps.Map(document.getElementById('mapView'), {
				center: new google.maps.LatLng(this.props.avg_lat, this.props.avg_long),
				// disableDefaultUI: true,
				// mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				fullscreenControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoom: 12,
				styles:[{
					featureType:"poi",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				},
				{
					featureType:"transit",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				}]
			});

			this.toggleTrafficLayer(data);
			if(this.markerCluster === null){
				this.markerCluster = new MarkerClusterer(this.maps ,[] ,{
					maxZoom: 8,
					// gridSize: size,
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});			
			}

			// console.log('>>>>>  ',markerCluster);	
			this.categorizeStations();
			if (!document.getElementById('map_indices')) {
				console.log('in if map_indices');
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'map_indices');
				let centerControl = new this.CenterControl(centerControlDiv, this.maps, this);
				centerControlDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}
			if (!document.getElementById('traffic_toggle_btn')) {
				console.log('in if traffic_toggle_btn');
				let trafficDiv = document.createElement('div');
				trafficDiv.setAttribute('id', 'traffic_toggle_btn');
				let traffic = new this.trafficControlToggle(trafficDiv, this.maps, this);
				trafficDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(trafficDiv);
			}
		} else if ((document.getElementById('mapView')) && (this.props.searched_list && this.props.searched_list.length)) {
			console.log('called now 2');
			this.maps = new google.maps.Map(document.getElementById('mapView'), {
				center: new google.maps.LatLng(22.5726, 88.3639),
				// disableDefaultUI: true,
				// mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				fullscreenControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoom: 12,
				styles:[{
					featureType:"poi",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				},
				{
					featureType:"transit",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				}]
			});
			// console.log('>>>>>  ',markerCluster);
			this.toggleTrafficLayer(data);
			if(this.markerCluster === null){
				this.markerCluster = new MarkerClusterer(this.maps ,[] ,{
					maxZoom: 8,
					// gridSize: size,
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});
			}

			this.categorizeStations();
			if (!document.getElementById('map_indices')) {
				console.log('in else if map_indices');
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'map_indices');
				let centerControl = new this.CenterControl(centerControlDiv, this.maps, this);
				centerControlDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}
			if (!document.getElementById('traffic_toggle_btn')) {
				console.log('in if traffic_toggle_btn');
				let trafficDiv = document.createElement('div');
				trafficDiv.setAttribute('id', 'traffic_toggle_btn');
				let traffic = new this.trafficControlToggle(trafficDiv, this.maps, this);
				trafficDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(trafficDiv);
			}
		} else {
			console.log('called now 3');
			this.maps = new google.maps.Map(document.getElementById('mapView'), {
				center: new google.maps.LatLng(22.5726, 88.3639),
				// disableDefaultUI: true,
				// mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				fullscreenControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoom: 12,
				styles:[{
					featureType:"poi",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				},
				{
					featureType:"transit",
					elementType:"labels",
					stylers:[{
							visibility:"off"
					}]
				}]
			});
			this.toggleTrafficLayer(data);
			if (!document.getElementById('map_indices')) {
				console.log('in else map_indices');
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'map_indices');
				let centerControl = new this.CenterControl(centerControlDiv, this.maps, this);
				centerControlDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}
			if (!document.getElementById('traffic_toggle_btn')) {
				console.log('in if traffic_toggle_btn');
				let trafficDiv = document.createElement('div');
				trafficDiv.setAttribute('id', 'traffic_toggle_btn');
				let traffic = new this.trafficControlToggle(trafficDiv, this.maps, this);
				trafficDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(trafficDiv);
			}
		}
	}

	toggleTrafficLayer(data) {
		if (data) {
			if (!this.trafficLayer) {
				this.trafficLayer = new google.maps.TrafficLayer();
			}
			console.log('add to this maps');
			this.trafficLayer.setMap(this.maps);
			if (document.querySelector("#button_to_toggle_view") && this.state.traffic_map_view) {
				var data = document.getElementById("button_to_toggle_view");
				data.className += " active";
				// data.innerHTML = "Hide Traffic"
			}
		} else {
			console.log('removed from this maps');
			if (this.trafficLayer) {
				this.trafficLayer.setMap(null);
			}
		}
	}

	/**
	 * This function sets the design of the toggle button over the map for GIS Layers
	 * @param {HTML element} controlDiv The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	CenterControl(controlDiv, map, that) {
		// Set CSS for the control border.
		// let that = this;
		let controlUI = document.createElement('div');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		// controlUI.style.marginBottom = '22px';
		controlUI.style.marginTop = '10px';
		controlUI.style.marginRight = '10px';
		controlUI.style.textAlign = 'center';
		controlUI.title = 'Click to select additional layers';
		controlDiv.appendChild(controlUI);

		// Set CSS for the control interior.
		let controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		// controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		controlText.innerHTML = '<div class="layer-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 330 330" class="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg><span class="layer-text">Show Indices</span></div>';

		controlUI.appendChild(controlText);
		// console.log('show_layers', that.state.show_layers)
		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			that.props.showIndex();
		});
	}

		/**
	 * This function sets the design of the toggle button over the map for GIS Layers
	 * @param {HTML element} controlDiv The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	trafficControlToggle(trafficDiv, map, that) {
		// Set CSS for the control border.
		// let that = this;
		console.log('traffic_map_view_state', that.state.traffic_map_view);
		console.log('traffic_map_view_props', that.props.traffic_map_view);
		let controlUI = document.createElement('div');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		// controlUI.style.marginBottom = '22px';
		controlUI.style.marginTop = '10px';
		controlUI.style.marginRight = '10px';
		controlUI.style.textAlign = 'center';
		controlUI.title = 'Click to select additional layers';
		trafficDiv.appendChild(controlUI);

		// Set CSS for the control interior.
		let controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		// controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		controlText.innerHTML = '<div id="button_to_toggle_view" class="button-to-toggle-view"><span class="toggle-text">View Traffic</span><span id="toggle_svg">' + (that.props.traffic_map_view ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 298.67"><g data-name="Layer 2"><g data-name="Layer 1"><path fill="#00892e" d="M0 149.33c0 82.35 67 149.34 149.33 149.34h213.34c82.32 0 149.33-67 149.33-149.34S445 0 362.67 0H149.33C67 0 0 67 0 149.33z"/><path fill="#fafafa" d="M448 149.33A85.34 85.34 0 1 1 362.67 64 85.33 85.33 0 0 1 448 149.33z"/></g></g></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 298.67"><g data-name="Layer 2"><g data-name="Layer 1"><path fill="#a0a0a0" d="M362.67 0H149.33C67 0 0 67 0 149.33s67 149.34 149.33 149.34h213.34c82.32 0 149.33-67 149.33-149.34S445 0 362.67 0z"/><path fill="#fafafa" d="M149.33 64A85.34 85.34 0 1 1 64 149.33 85.33 85.33 0 0 1 149.33 64z"/></g></g></svg>') + '</span></div>';
		controlUI.appendChild(controlText);
		// console.log('show_layers', that.state.show_layers)
		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			that.onChangeSwitch(that.state.traffic_map_view)
			// that.props.showIndex();
		});
	}

	/**
	 * Pushes markers in an array for displaying in map.
	 * @param  {object} maps Google map.
	 * @param  {object} data DG data for marker creation.
	 */
	pushMarkers(maps, data) {
		// console.log('data marker', data);
		let dashboard_map_pointer = new google.maps.InfoWindow(),
			map_lat_long = new google.maps.LatLng(data.latitude, data.longitude);
			// console.log('map_lat_long', map_lat_long);
		let marker = new google.maps.Marker({
			position: map_lat_long,
			map: maps,
			title: data.name,
			icon: data.marker_icon,
			device_id: data.id,
			optimized: false
		});
		// console.log('marker', marker);

		gMarkers.push(marker);
		/*google.maps.event.addListener(marker, 'mouseover',() => {
			if(dash_info && dash_info.length) {
				dash_info[0].close();
			}
			
			dash_info[0] = new google.maps.InfoWindow();
			dash_info[0].setContent(this.createMapTooltip({
				name: data.name,
				status: data.status
			}));
			dash_info[0].open(maps, marker);
		});*/
		let that = this;
		// console.log('marker use',marker);
		google.maps.event.addListener(marker, 'click',(args, flag) => {
			if(dash_info && dash_info.length) {
				console.log('click marker1', dash_info);
				dash_info[0].close();
				console.log('click marker2', dash_info);
			}

			dash_info[0] = new google.maps.InfoWindow();
			dash_info[0].setContent(this.createMapTooltip(data));
			dash_info[0].open(maps, marker);
			// dash_info = [];

			this.props.callParent(data, args, flag);
			/*if (this.props.history.location.pathname.search('24-hours-trend') > -1) {
				let query = this.props.history.location.search;
				this.props.history.push('');
				this.props.history.push('stations/' + data.id + '/24-hours-trend/' + query);
				// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
			} else if (this.props.station_id == '' || this.props.station_id == null) {
				let query = this.props.history.location.search;
				this.props.history.push('');
				this.props.history.push(query);
				// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
			} else {
				let query = this.props.history.location.search;
				this.props.history.push('');
				this.props.history.push('stations/' + data.id + '/' + query);
				// this.props.queryCreate(this.props.cat_list, this.props.sub_cat_list);
			}*/

			

			/*if (document.getElementById('trend_button')) {
				document.getElementById('trend_button').addEventListener('click', () => {
					this.props.history.push(document.getElementById('trend_button').value);
				});
			}*/

			google.maps.event.addListener(dash_info[0],'closeclick',function(){
				// console.log(' >>>>>>>>>>>>> ',marker.device_id);
				that.setState({
					dash: null
				}, () => {
					console.log('dashhhhh', that.state.dash);
					that.props.showList();
				});
			});
			
			this.setState({
				dash: marker.device_id
			}/*, () => console.log('dashhhhh', this.state.dash)*/);

		});
	}

	/**
	 * This function is used to open the selected stations info window in the map from the station list's click.
	 * @param  {Object}
	 * @param  {Boolean}
	 * @return {void}
	 */
	handleClick(data, update) {
		console.log('click handle', data);
		let that = this;
		let maps = that.maps;
		if (update) {
			if (maps) {
				if(dash_info && dash_info.length) {
					console.log('click handle 1', dash_info);
					dash_info[0].close();
					console.log('click handle 2', dash_info);
					that.setDash();
				}
				if(marker_new && marker_new.length) {
					marker_new[0].setMap(null);
				}
				dash_info=[];
				marker_new=[];
				console.log('data',data);
				console.log('map:',maps);
				console.log('gMarkers:',gMarkers);
				dash_info[0] = new google.maps.InfoWindow();
				if(gMarkers && gMarkers.length) {
					gMarkers.map((point) => {
						console.log('point title', point.title);
						console.log('point name', data.name);
						if(point.title === data.name) {
							google.maps.event.trigger(point, 'click');
							marker_new.push(point);
							console.log('marker_new:',marker_new);
						}
					});
				}
				console.log('click marker_new', marker_new[0]);
				// marker_new[0].setMap(maps);
				// dash_info[0].setContent(that.createMapTooltip(data));
				// dash_info[0].open(maps, marker_new[0]);
				// console.log('click dash_info', dash_info[0]);

				google.maps.event.addListener(dash_info[0],'closeclick',function(){
					// console.log(' >>>>>>>>>>>>> ',marker.device_id);
					that.setState({
						dash: null
					}, () => {
						that.props.showList();
					});
				});
				that.setState({
					dash: marker_new[0].device_id
				}, () => {
					console.log('dashhhhh', that.state.dash);
				});
				for (i = 0; i < gMarkers.length; i++) {
					gMarkers[i].setMap(null);
				};
				for (i = 0; i < gMarkers.length; i++) {
					gMarkers[i].setMap(maps);
				}
			}
		}
		
	}

	/**
	 * THis function sets the value of dash to null.
	 */
	setDash() {
		this.setState({
			dash: null
		});
	}

	/**
	 * This function sets the value of dash to the selected station ID.
	 * @param  {Number}
	 * @return {void}
	 */
	dash(id) {
		this.setState({
			dash: id
		}, () => {
			this.categorizeStations();
		});
	}

	/**
	 * This function checks for the last data sent for the station and returns the online/offline.
	 * @param  {Object}
	 * @return {String}
	 */
	returnPumpStatus(station) {
		let status;
		if (station.sub_category != this.state.pump_station && station.sub_category != this.state.pump_station_2 && station.sub_category != this.state.rainfall && station.sub_category != this.state.major_road_junction && station.sub_category != this.state.street_sub_house_front && station.sub_category != this.state.street_sub_house_front_water) {
			if ((station.last_data_send != 0) && (station.last_data_send !== null) && (station.last_data_send != '') && (moment().unix() - station.last_data_send < 900)) {
				status = 'online';
			} else {
				status = 'offline';
			}
		} else if (station.sub_category == this.state.pump_station || station.sub_category == this.state.pump_station_2) {
			status = 'offline';
			if (station && Object.values(station).length) {
				if ((moment().unix() - station.last_data_send > 900) || (station.last_data_send == 0) || (station.last_data_send === null) || (station.last_data_send == '')) {
					status ='shutdown';
				} else {
					if (station.parameters && station.parameters.length) {
						station.parameters.map((param) => {
							if (param.name != 'Penstock Level' && param.name != 'Sump Level' && param.name != 'Rainfall' && param.name != 'Penstock' && param.name != 'Sump') {
								if (param.value == 'ON') {
									status = 'online';
								}
							}
						});
					}
				}
			}
		} else if (station.sub_category == this.state.rainfall) {
			status = 'online_no_rain';

			if (station.status == 'offline') {
				status = 'offline';
			} else {
				if (station.rainfall_1 && Object.keys(station.rainfall_1).length && !isNaN(station.rainfall_1.value) && station.rainfall_1.value > 0) {
					status = 'online_last_hour';
				} else if (station.rainfall_24 && Object.keys(station.rainfall_24).length && !isNaN(station.rainfall_24.value) && station.rainfall_24.value > 0) {
					status = 'online_last_24_hours';
				}
			}
		} else if (station.sub_category == this.state.major_road_junction || station.sub_category == this.state.street_sub_house_front || station.sub_category == this.state.street_sub_house_front_water) {
			if ((station.last_data_send != 0) && (station.last_data_send !== null) && (station.last_data_send != '') && (moment().unix() - station.last_data_send < 1800)) {
				status = 'online';
			} else {
				status = 'offline';
			}
		}
		return status;
	}

	/**
	 * Categorize the DG according to their status(online/offline) and add marker image accordingly.
	 */
	categorizeStations(update) {
		console.log('click categorize', update);
		var that = this;
		// console.log('categorizeStations', that);
		for (i = 0; i < gMarkers.length; i++) {
			gMarkers[i].setMap(null);
		};
		gMarkers=[];
		// console.log('this.markerCluster1', this.markerCluster);
		if (this.markerCluster !== null) {
			this.markerCluster.clearMarkers();
		}
		let station_data = [],
			online_count = 0,
			offline_count = 0,
			shutdown_count = 0,
			avg_lat = 0,avg_lng = 0,count = 0,
			list_station = [];
		// console.log('station_data:', that.props.searched_list);
		if(that.props.searched_list && that.props.searched_list.length) {
			list_station = that.props.searched_list.slice(0);
			list_station.map((data,index) => {
				avg_lat = avg_lat + data.latitude;
				avg_lng = avg_lng + data.longitude;
				count++;
				// console.log('data', data);
				station_data.push(data);
				data['marker_icon'] = new google.maps.MarkerImage(
						'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/map_markers/v1-0-3/'+ data.sub_category + '_' + this.returnPumpStatus(data) + (data.blinking_status ? '_blink.svg' : '.svg'),null,null,null,new google.maps.Size(26, 24)
				);
					this.pushMarkers(this.maps, data);
			});
			avg_lat = (avg_lat / count);
			avg_lng = (avg_lng / count);
			let center = new google.maps.LatLng(avg_lat, avg_lng);
			if (!update) {
				if (avg_lng == 0 && avg_lng == 0) {
					this.maps.panTo(center);
				} else {
					this.maps.panTo(new google.maps.LatLng(22.5726, 88.3639));
				}
			}
			
			/*if (this.state.dash && Object.values(this.state.dash).length) {
				this.state.dash.setContent(this.createMapTooltip(data));
				this.state.dash.open(maps, marker);
			}*/
			bounds  = new google.maps.LatLngBounds(new google.maps.LatLng(22.5726, 88.3639));

			for (i = 0; i < gMarkers.length; i++) {
				gMarkers[i].setMap(this.maps);

				loc = new google.maps.LatLng(gMarkers[i].position.lat(), gMarkers[i].position.lng());
				bounds.extend(loc);
				// console.log('gMarkers', gMarkers[i].device_id);
				if (this.state.dash == gMarkers[i].device_id) {
					// gMarkers[i].dispatchEvent('click');
					console.log('triggered', gMarkers[i]);
					google.maps.event.trigger(gMarkers[i], 'click', true, true);
				}
			}

			mb = this.maps.getDiv().getBoundingClientRect();
			console.log('mbbb', mb);
			console.log('mbbb b', bounds);
			mib = {
					top: mb.top + 30,
					right: mb.right - 10,
					bottom: mb.bottom - 30,
					left: mb.left + 10
			};

			if (!update) {
				this.maps.fitBounds(bounds);
				this.maps.panToBounds(bounds);
				if (avg_lng == 0 && avg_lng == 0) {
					this.maps.setCenter(new google.maps.LatLng(22.5726, 88.3639));
					this.maps.setZoom(8);
				} else {
					this.maps.setCenter(new google.maps.LatLng(avg_lat,avg_lng));
				}

			}

			// console.log('this.markerCluster2', this.markerCluster);
			if (this.markerCluster !== null) {
				this.markerCluster.addMarkers(gMarkers);
			}
			// console.log('this.markerCluster3', this.markerCluster);
		}
		that.setState({
			station_data: station_data,
			online_count: online_count,
			offline_count: offline_count,
			shutdown_count: shutdown_count
		}, () => {
			this.props.count(online_count, offline_count, shutdown_count);
		});
	}

	/**
	 * Predefined function used to compare between current and next props.
	 * @param  {Object} nextProps 
	 * @return {Boolean}           
	 */
	/*shouldComponentUpdate(nextProps) {
		// console.log('next',_.isEqual(nextProps.searched_list, this.props.searched_list));
		// console.log('next', nextProps.searched_list);
		// console.log('next', this.props.searched_list);
		if (_.isEqual(nextProps.searched_list, this.props.searched_list) && nextProps.avg_lat == this.props.avg_lat && nextProps.avg_long == this.props.avg_long) {
			return false;
		} else {
			this.categorizeStations();
			return true;
		}
	}*/

	onChangeSwitch(data) {
		this.toggleTrafficLayer(!data, true);
		this.setState({
			traffic_map_view: !this.state.traffic_map_view
		}, () => {
			if (document.getElementById("toggle_svg")) {
				let toggle_svg = document.getElementById("toggle_svg");
				console.log('toggle_svg', toggle_svg);
				if (this.state.traffic_map_view) {
					toggle_svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 298.67"><g data-name="Layer 2"><g data-name="Layer 1"><path fill="#00892e" d="M0 149.33c0 82.35 67 149.34 149.33 149.34h213.34c82.32 0 149.33-67 149.33-149.34S445 0 362.67 0H149.33C67 0 0 67 0 149.33z"/><path fill="#fafafa" d="M448 149.33A85.34 85.34 0 1 1 362.67 64 85.33 85.33 0 0 1 448 149.33z"/></g></g></svg>';
				} else {
					toggle_svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 298.67"><g data-name="Layer 2"><g data-name="Layer 1"><path fill="#a0a0a0" d="M362.67 0H149.33C67 0 0 67 0 149.33s67 149.34 149.33 149.34h213.34c82.32 0 149.33-67 149.33-149.34S445 0 362.67 0z"/><path fill="#fafafa" d="M149.33 64A85.34 85.34 0 1 1 64 149.33 85.33 85.33 0 0 1 149.33 64z"/></g></g></svg>';
				}
			}
			this.props.changeTrafficState(!data);
		});

		console.log('console', this.props);
	}

	/**
	 * This renders the main dashboard page with navigation bar.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		return <div>
		 {/*(() => {
		 	if (this.maps) {
				return <div className="button-to-toggle-view"><span className="toggle-text">View Traffic</span><span className="toggle-switch-btn"><Switch checked={this.state.traffic_map_view} size="small" onChange={() => this.onChangeSwitch(this.state.traffic_map_view)} /></span></div>;
		 	}
		 })()*/}
			<div className="full-height" id="mapView" />
		</div>;
	}
}
