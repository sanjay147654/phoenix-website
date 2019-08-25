import React from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Layout, Row, Col, Button, Select, Divider, Icon, Tabs, TreeSelect, Tooltip, Menu, DatePicker, notification } from 'antd';
import Maps from 'ol/Map.js';
import View from 'ol/View.js';
import KML from 'ol/format/KML.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import VectorSource from 'ol/source/Vector.js';
import XYZSource from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';
import Loading from './Loading';
import ImageLayer from 'ol/layer/Image.js';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import Feature from 'ol/Feature.js';
import Overlay from 'ol/Overlay.js';
import {toLonLat} from 'ol/proj.js';
import {toStringHDMS} from 'ol/coordinate.js';
import TileJSON from 'ol/source/TileJSON.js';
import {bbox} from 'ol/loadingstrategy';
import {all} from 'ol/loadingstrategy';
import OSM from 'ol/source/OSM.js';
import {defaults as defaultControls, FullScreen, Control} from 'ol/control.js';
import {inherits} from 'ol/util.js';
import Stamen from 'ol/source/Stamen.js';
// import TileLayer from 'ol/layer/Tile';
// import {
// 	interaction, layer, custom, control, //name spaces
// 	Interactions, Overlays, Controls,     //group
// 	Map, Layers, Overlay, Util    //objects
// } from "react-openlayers";

let i;
let chicago = {lat: 41.85, lng: -87.65};
let gMarkers = [];
let gMarkers2 = [];
let dash_info = [];
let dash_info2 = [];
let marker_new = [];
let marker_new2 = [];
let bounds, loc;
let mb, mib;
let popup;
let ctaLayer1,
	ctaLayer2,
	ctaLayer3,
	ctaLayer4,
	ctaLayer5,
	ctaLayer6;
let vectorLayer_A_Water,
	vectorLayer_A_INDIA_KOLKATA,
	vectorLayer_Borough_Boundary,
	vectorLayer_L_Water,
	vectorLayer_P_Water,
	vectorLayer_Ward_Boundary,
	StaticImage_Surge5m,
	StaticImage_100mm,
	StaticImage_200mm,
	StaticImage_300mm,
	StaticImage_400mm,
	StaticImage_Surge3m,
	vsource_A_INDIA_KOLKATA;
let optionMenu,
	optionMenuControl,
	marker_ol,
	callAxios;

let layers_raster = [],
	styles = [];
let url = 'https://raw.githubusercontent.com/bimalendu04/KML_temp/master/Surge5m.kmz';

let layers = [];

/**
 * Define a namespace for the application.
 */
window.app = {};
let win_app = window.app;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

/**
 * This is the class used to set the map in Dashboard page.
 */
export default class MapViewMap extends React.Component {
	/**
	 * This is the Constructor for Dashboard page used to set the default task while page loads.
	 * @param  {Object} props This will import the attributes passed from its Parent Class.
	 */
	constructor(props) {
		super(props);
		/**
		 * State of the component
		 * @type {Object}
		 * @property {string} map_type Stores the map type.
		 * @property {Number} loaded Stores the kml file loaded size in bytes.
		 * @property {Number} total Stores the kml file total size in bytes.
		 * @property {string} pump_station Stores the id of the Pump station type subcategory.
		 * @property {string} pump_station_2 Stores the id of the Pump station with sump type subcategory.
		 * @property {string} major_road_junction Stores the id of the Major road junction type subcategory.
		 * @property {string} street_sub_house_front Stores the id of the Street sub house front type subcategory.
		 * @property {string} rainfall Stores the id of the Rainfall type subcategory.
		 * @property {string} open_canal Stores the id of the Open Canal type subcategory.
		 * @property {string} gated_canal Stores the id of the Gated Canal type subcategory.
		 * @property {string} street_sub_house_front_water Stores the id of the Street-Flood type subcategory.
		 * @property {string} Bus Stores the id of the Bus type subcategory.
		 * @property {array} layer_array Stores GIS layers array.
		 * @property {Boolean} show_layers Stores the flag to decide whether to show the kml layer selection menu or not.
		 */
		this.state = {
			map_type: 'AerialWithLabels',
			loaded: null,
			total: null,
			layer_name: null,
			initial_marker: false,
			kml_layer_toggle: 2,
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
			layer_array: [],
			kml_id: props.kml_id,
			show_layers: false
		};
		/**
		 * This stores the xhr @requireduest for the kml file.
		 */
		this.xhr = null;
		/**
		 * This stores the boolean value to set the position of the marker or not.
		 * @type {Boolean}
		 */
		this.pos = false;
		/**
		 * This stores the loaded file size of the xhr request.
		 * @type {Number}
		 */
		this.loaded = null;
		/**
		 * This stores the total file size of the file to be downloaded by xhr request.
		 * @type {Number}
		 */
		this.total = null;
		/**
		 * Google map for the Dashboard
		 * @type {Object}
		 */

		this.maps = null;
		this.mapLayer = null;
		this.listenerKey = null;
		/**
		 * Markers
		 */
		this.markerCluster = null;
		
	}

	/**
	 * Creates the tooltip in map.
	 * @param  {object} data data for tooltip creation.
	 * @return {string}      String of html for map tooltip.
	 */
	createMapTooltip(data) {
		// console.log('data map', data);
		let content = '<div class="pointer-details">';
		content += '<div class="client-name">'+data.name+'</div>';
		content += '<div class="address">Type: <span>' + this.props.sub_category_object[data.sub_category] + '</span></div>';
		/*if (data.address != '') {
			content += '<div class="address">Address: <span>' + data.address + '</span></div>';
		}*/
		content += '<div class="last-time">Last data received at: <span>' + ((data.last_data_send != 0) ? moment.unix(data.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never') + '</span></div>';
		if (data.parameters && data.parameters.length) {
			data.parameters.map((param, index) => {
				
			});
			if (true) {
				content+= '<div class="table-container"><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>';
				
				data.parameters.map((param, index) => {
					if (param.type !== 'rainfall' && param.name != 'Distance') {
						if (param.value !== 'NA') {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value param-'+ param.value +'">' + param.value + ' ' + param.unit + '</td></tr>';
						} else {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value">' + param.value + '</td></tr>';
						}
					}
				});
				if (data.rainfall_1 && Object.values(data.rainfall_1).length && data.sub_category == this.state.rainfall) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last hour</td><td class="param-value param-'+ data.rainfall_1.value +'">' + data.rainfall_1.value + ' ' + (data.rainfall_1.value != 'NA' ? data.rainfall_1.unit : '') + '</td></tr>';
				}
				if (data.rainfall_24 && Object.values(data.rainfall_24).length  && data.sub_category == this.state.rainfall) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last 24 hours</td><td class="param-value param-'+ data.rainfall_24.value +'">' + data.rainfall_24.value + ' ' + (data.rainfall_24.value != 'NA' ? data.rainfall_24.unit : '') + '</td></tr>';
				}
				content += '</tbody></table></div>';
			}
		} 
		/*if ((data.show_trend == 1) || (data.show_trend == 0)) {
			content += '<div class="button-container"><button type="button" id="trend_button" class="btn btn-save" value="stations/' + data.id + '/24-hours-trend/' + (window.location.href.split('?').length == 2 ? '?' + window.location.href.split('?')[1] : '') + '">View 24 hours trend</button></div>';
		}*/
		content += '</div>';
		return content;
	}

	/**
	 * Creates the tooltip in map for openlayers map.
	 * @param  {object} data Station data for tooltip creation.
	 * @return {string}      String of html for map tooltip.
	 */
	createMapTooltipOL(data) {
		console.log('data map', data);
		let content = '<div class="pointer-details">';
		content += '<div class="client-name">'+data.name+'</div>';
		content += '<div class="address">Type: <span>' + this.props.sub_category_object[data.sub_category] + '</span></div>';
		/*if (data.address != '') {
			content += '<div class="address">Address: <span>' + data.address + '</span></div>';
		}*/
		content += '<div class="last-time">Last data received at: <span>' + ((data.last_data_send != 0) ? moment.unix(data.last_data_send).tz("Asia/Kolkata").format('HH:mm, DD MMM') : 'Never') + '</span></div>';
		if (data.parameters && data.parameters.length) {
			data.parameters.map((param, index) => {
				
			});
			if (true) {
				content+= '<div class="table-container"><table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>';
				
				data.parameters.map((param, index) => {
					if (param.type !== 'rainfall' && param.name != 'Distance') {
						if (param.value !== 'NA') {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value param-'+ param.value +'">' + param.value + ' ' + param.unit + '</td></tr>';
						} else {
							content += '<tr class="parameter"><td class="param-name">' + param.name + '</td><td class="param-value">' + param.value + '</td></tr>';
						}
					}
				});
				if (data.rainfall_1 && Object.values(data.rainfall_1).length && data.sub_category == this.state.rainfall) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last hour</td><td class="param-value param-'+ data.rainfall_1.value +'">' + data.rainfall_1.value + ' ' + (data.rainfall_1.value != 'NA' ? data.rainfall_1.unit : '') + '</td></tr>';
				}
				if (data.rainfall_24 && Object.values(data.rainfall_24).length  && data.sub_category == this.state.rainfall) {
					content += '<tr class="parameter"><td class="param-name">Rainfall in last 24 hours</td><td class="param-value param-'+ data.rainfall_24.value +'">' + data.rainfall_24.value + ' ' + (data.rainfall_24.value != 'NA' ? data.rainfall_24.unit : '') + '</td></tr>';
				}
				content += '</tbody></table></div>';
			}
		} 
		/*if ((data.show_trend == 1) || (data.show_trend == 0)) {
			content += '<div class="button-container"><button type="button" id="trend_button" class="btn btn-save" value="stations/' + data.id + '/24-hours-trend/' + (window.location.href.split('?').length == 2 ? '?' + window.location.href.split('?')[1] : '') + '">View 24 hours trend</button></div>';
		}*/
		content += '</div>';
		return content;
	}

	/**
	 * Creates the tooltip in map for GIS Layers.
	 * @param  {object} data Station data for tooltip creation.
	 * @return {string}      String of html for map tooltip.
	 */
	createTooltipGIS(feature) {
		let content = '<p>' + (feature.get('description') ? feature.get('description') : '') + '<br/>' + feature.get('name') +'</p>';
		return content;
	}

	/**
	 * Predefined function of ReactJS.
	 * Called every time after the component updates
	 * @return {void}
	 */
	componentDidUpdate(prevProps) {
		console.log('did update');
		let that = this;
		/*if (document.getElementsByClassName('gm-control-active gm-fullscreen-control') && document.getElementsByClassName('gm-control-active gm-fullscreen-control').length) {
			console.log('screen');
			document.getElementsByClassName('gm-control-active gm-fullscreen-control')[0].addEventListener("click", function(e){
					that.toggleFullScreen();
				});
		}*/

		if (this.state.dash && document.getElementById('olmap')) {
			if (this.props.filtered_stations && this.props.filtered_stations.length && this.state.initial_marker) {
				this.props.filtered_stations.map((st) => {
					if (st.id == this.state.dash) {
						this.manualPopupMap(st);
						// this.dispatchClick();
					}
				});
			}
		}

		if (document.getElementById('olmap')) {
			if (this.props.filtered_stations && this.props.filtered_stations.length && this.state.dash) {
				let c = 0;
				this.props.filtered_stations.map((st) => {
					if (st.id == this.state.dash) {
						c++;
					}
				});
				if (c == 0) {
					console.log('update in map 11');
					popup.setPosition(undefined);
					// this.dispatchClick();
					this.props.history.push('/scenarios/' + this.props.history.location.search);
					this.pos = false;
				}
			} else if (this.props.filtered_stations && this.props.filtered_stations.length == 0 && this.state.dash) {
				this.props.history.push('/scenarios/' + this.props.history.location.search);
				popup.setPosition(undefined);
				this.setDash();
				console.log('update in map 12');
			}
		}
	}

	/*toggleFullScreen() {
		console.log('screen 2');
		google.maps.event.addListener( this.maps, 'bounds_changed', this.onBoundsChanged );
	}

	onBoundsChanged() {
		console.log('screen 3');
			if (document.getElementsByClassName( 'gm-style' )[0].clientHeight == window.innerHeight &&
			document.getElementsByClassName( 'gm-style' )[0].clientWidth  == window.innerWidth ) {
				console.log( 'FULL SCREEN' );
				document.getElementById('olmap').classList.add(' olmap-view');
			}
			else {
				 // var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				document.getElementById('olmap').classList.remove('olmap-view');
					console.log ('NOT FULL SCREEN');
			}
	}

	displayFeatureInfo(pixel, map) {
		console.log('centerrrrr', map);
		var features = [];
		map.forEachFeatureAtPixel(pixel, function(feature) {
			features.push(feature);
		});
		if (features.length > 0) {
			var info = [];
			var i, ii;
			for (i = 0, ii = features.length; i < ii; ++i) {
				info.push(features[i].get('name'));
			}
			document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
			map.getTarget().style.cursor = 'pointer';
		} else {
			document.getElementById('info').innerHTML = '&nbsp;';
			map.getTarget().style.cursor = '';
		}
	};*/

	/**
	 * Predefined function of React.js. It configures and sets the map.
	 */
	componentDidMount() {
		
		let that = this;
		// console.log('this.props.avg_lat', this.props.avg_lat);
		
		styles = [
			'RoadOnDemand',
			'AerialWithLabels'
		];

		layers_raster = [];
		let i;
		for (i = 0; i < styles.length; ++i) {
			layers_raster.push(new TileLayer({
				visible: false,
				preload: Infinity,
				source: new BingMaps({
					key: 'ApzXT2WNVPPVjHHoVBvSMZluohUIW61aFVycVENWtTy2mg73oxEC4-12O7RP1u_6',
					imagerySet: styles[i],
					// use maxZoom 19 to see stretched tiles instead of the BingMaps
					// "no photos at this zoom level" tiles
					maxZoom: 19
				})
			}));
		}

		if ((document.getElementById('olmap')) && (that.props.filtered_stations && that.props.filtered_stations.length) && that.props.avg_lat) {
			console.log('componentDidMount if', this.props.avg_long);
			// that.maps = new google.maps.Map(document.getElementById('mapView'), {
			// 	center: new google.maps.LatLng(that.props.avg_lat, that.props.avg_long),
			// 	// disableDefaultUI: true,
			// 	// mapTypeControl: false,
			// 	streetViewControl: false,
			// 	fullscreenControl: false,
			// 	fullscreenControlOptions: {
			// 		position: google.maps.ControlPosition.RIGHT_BOTTOM
			// 	},
			// 	zoomControl: true,
			// 	zoomControlOptions: {
			// 			position: google.maps.ControlPosition.RIGHT_BOTTOM
			// 	},
			// 	zoom: 12,
			// 	styles:[{
			// 		featureType:"poi",
			// 		elementType:"labels",
			// 		stylers:[{
			// 				visibility:"off"
			// 		}]
			// 	},
			// 	{
			// 		featureType:"transit",
			// 		elementType:"labels",
			// 		stylers:[{
			// 				visibility:"off"
			// 		}]
			// 	}],
			// 	disableDefaultUI: true,
			// 	keyboardShortcuts: false,
			// 	draggable: false,
			// 	disableDoubleClickZoom: true,
			// 	scrollwheel: false,
			// 	streetViewControl: false
			// });
			/*if(that.markerCluster === null){
				that.markerCluster = new MarkerClusterer(that.maps ,[] ,{
					maxZoom: 8,
					// gridSize: size,
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});			
			}*/
			// console.log('>>>>>  ',markerCluster);	
			// that.categorizeStations();
			/*if (!document.getElementById('gis_layers')) {
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'gis_layers');
				// let centerControl = new that.CenterControl(centerControlDiv, that.maps, that);
				// centerControlDiv.index = 1;
				// that.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}

			if (!document.getElementById('layer_menu')) {
				let optionMenu = document.createElement('div');
				optionMenu.setAttribute('id', 'layer_menu');
				// let optionMenuControl = new that.menuLayers(optionMenu, that.maps, that);
				// optionMenu.index = 2;
				
				// that.maps.controls[google.maps.ControlPosition.RIGHT_TOP].push(optionMenu);
				if (!that.state.show_layers) {
					optionMenu.style.display = "none";
				}
			}

			
			if (!document.getElementById('map_indices')) {
				let controlDiv = document.createElement('div');
				controlDiv.setAttribute('id', 'map_indices');
				let ControlIndex = new that.controlIndex(controlDiv, that.maps, that);
				controlDiv.index = 3;
				that.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
			}*/

			if (document.getElementById('olmap')) {
				/*if (document.getElementsByClassName('gm-control-active gm-fullscreen-control') && document.getElementsByClassName('gm-control-active gm-fullscreen-control').length) {
					console.log('screen');
					document.getElementsByClassName('gm-control-active gm-fullscreen-control')[0].addEventListener("click", function(e){
							that.toggleFullScreen();
						});
				}*/
				let view = new View({
					// make sure the view doesn't go beyond the 22 zoom levels of Google Maps
					projection: 'EPSG:3857',
					maxZoom: 21
				});
				/*view.on('change:center', function() {
					let center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
					that.maps.setCenter(new google.maps.LatLng(center[1], center[0]));
				});
				view.on('change:resolution', function() {
					that.maps.setZoom(view.getZoom());
				});*/

				/*let raster_stamen_base =new TileLayer({
					source: new Stamen({
						layer: 'terrain'
					})
				});

				let raster_stamen_label =new TileLayer({
					source: new Stamen({
						layer: 'terrain-labels'
					})
				});

				let raster_bing = new TileLayer({
					source: new BingMaps({
						imagerySet: 'RoadOnDemand',
						key: 'ApzXT2WNVPPVjHHoVBvSMZluohUIW61aFVycVENWtTy2mg73oxEC4-12O7RP1u_6'
					}),

				});

				let raster_topo = new ol.layer.Tile({
					title: 'OSM',
					type: 'base',
					visible: true,
					source: new ol.source.XYZ({
							url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
					})
				});

				let raster_osm =  new TileLayer({
					source: new OSM()
				});*/

				// layers.push(imageLayer);
				// layers.push(StaticImage_Surge5m);
				if (document.getElementById('olmap')) {
					let container = document.getElementById('popup');
					let content = document.getElementById('popup-content');
					let closer = document.getElementById('popup-closer');

					/*let overlay = new Overlay({
						element: container,
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						}
					});*/

					let element = document.getElementById('popup');

					popup = new Overlay({
						element: element,
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						},
						// positioning: 'bottom-center',
						// stopEvent: false,
						// offset: [0, -50]
					});

					closer.onclick = function() {
						this.pos = false;
						that.setState({
							dash: null
						}, () => {
							console.log('dashhhhh', that.state.dash);
							let search_string = that.props.history.location.search;
							that.props.history.push('/scenarios/' + that.props.history.location.search);
							popup.setPosition(undefined);
							this.pos = false;
							closer.blur();
						});
						return false;
					};

					let olMapDiv = document.getElementById('olmap');
					this.mapLayer = new ol.Map({
						controls: ol.control.defaults({
							attribution : true,
							zoom : true,
							rotate: false,
						}).extend([
							new ol.control.FullScreen(),
							// new win_app.custom_button()
						]),
						layers: layers_raster,
						loadTilesWhileInteracting: true,
						overlays: [popup],
						interactions: ol.interaction.defaults({
							altShiftDragRotate: false,
							dragPan: false,
							rotate: false
						}).extend([new ol.interaction.DragPan({kinetic: null})]),
						target: olMapDiv,
						view: view
					});

					
					if (!document.getElementById('gis_layers')) {
						let centerControlDiv = document.createElement('div');
						centerControlDiv.setAttribute('id', 'gis_layers');
						this.gisButton(centerControlDiv, this.mapLayer, this);
					}

					if (!document.getElementById('layer_menu')) {
						let optionMenu = document.createElement('div');
						optionMenu.setAttribute('id', 'layer_menu');
						if (!that.state.show_layers) {
							optionMenu.style.display = "none";
						}
						this.gisMenu(optionMenu, this.mapLayer, this);
					}

					if (!document.getElementById('map_indices')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_indices');
						this.indicesbutton(controlDiv, this.mapLayer, this);
					}

					if (!document.getElementById('map_type')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_type');
						this.mapTypeToggle(controlDiv, this.mapLayer, this);
					}
					
					this.toggleMap();
					
					view.setCenter(fromLonLat([this.props.avg_long, this.props.avg_lat]));
					view.setZoom(12);
					// console.log('olmap 11', document.getElementById('mapView'));
					// console.log('olmap map1', view.getZoom());
					// console.log('olmap map2', this.maps.getZoom());
					// olMapDiv.parentNode.removeChild(olMapDiv);
					// this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);

					/*this.mapLayer.on('singleclick', function(evt) {
						var coordinate = evt.coordinate;
						var hdms = toStringHDMS(toLonLat(coordinate));

						content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
								'</code>';
						overlay.setPosition(coordinate);
					});*/

					
					// this.mapLayer.addOverlay(popup);

					// display popup on click
					this.mapLayer.on('click', function(evt) {
						// console.log('forEachFeatureAtPixel', that.mapLayer);
						let feature = that.mapLayer.forEachFeatureAtPixel(evt.pixel,
							function(feature) {
								return feature;
							});
						if (feature) {
							var coordinate = evt.coordinate;
							let coordinates = feature.getGeometry().getCoordinates();
							console.log('feature', coordinate);
							content.innerHTML = feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations' ? that.createMapTooltipOL(feature.values_.data_marker) : that.createTooltipGIS(feature);
							if (feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations') {
								if (that.props.history.location.pathname) {
									console.log('click url', that.props.history.location.pathname);
									let url = that.props.history.location.pathname;
									let search_string = that.props.history.location.search;
									// that.props.history.push('/scenarios');
									that.props.history.push('/scenarios/stations/' + feature.values_.data_marker.id + '/' + search_string);
								}

								that.setState({
									dash: feature.values_.data_marker.id,
									popup_type: 'stations'
								}/*, () => console.log('dashhhhh', that.state.dash)*/);
							} else{

								that.setState({
									popup_type:'gis',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							}

							if (that.state.popup_type && that.state.popup_type == 'stations') {
								if (that.props.filtered_stations && that.props.filtered_stations.length) {
									that.props.filtered_stations.map((st) => {
										if (st == that.state.dash) {
											let coordinates = fromLonLat([st.longitude, st.latitude]);
										}
									});
								}
								popup.setPosition(coordinates);
							} else {
								popup.setPosition(coordinate);
								this.pos = true;
							}

							/*document.querySelector(element).popover({
								placement: 'top',
								html: true,
								content: feature.get('name')
							});
							element.popover('show');*/
						} else {
							popup.setPosition(undefined);
							that.setState({
									popup_type:'',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							this.pos = false;
							console.log('popup closed');
							this.pos = false;
							// element.popover('destroy');
						}

					});
					/*if (this.state.dash) {
						if (this.props.filtered_stations && this.props.filtered_stations.length) {
							this.props.filtered_stations.map((st) => {
								if (st.id == this.state.dash) {
									this.manualPopupMap(st);
									// this.dispatchClick();
								}
							});
						}
					}*/

					
				}
				/*that.maps = new google.maps.Map(document.getElementById('mapView'), {
					disableDefaultUI: true,
					keyboardShortcuts: false,
					draggable: false,
					disableDoubleClickZoom: true,
					scrollwheel: false,
					streetViewControl: false
				});*/

				/*let vector = new ol.layer.Vector({
						url: 'http://openlayers.org/en/v3.0.0/examples/data/geojson/countries.geojson',
						format: new ol.format.GeoJSON(),
					style: new ol.style.Style({
						fill: new ol.style.Fill({
							color: 'rgba(255, 255, 255, 0.6)'
						}),
						stroke: new ol.style.Stroke({
							color: '#319FD3',
							width: 1
						})
					})
				});*/

				/*let vector = new VectorLayer({
					source: new VectorSource({
						url: 'https://prstatic.phoenixrobotix.com/kmls/vector/A_INDIA_KOLKATA_LULC_CURRENT.kml', // https://openlayers.org/en/latest/examples/data/kml/2012-02-10.kml
						format: new KML()
					})
				});

				let xyz = new XYZSource({
					url: 'http://prstatic.phoenixrobotix.com/kmls/raster/strom-surge-innundation-map/Surge5m.kmz'
				})

				let tile_layer = new TileLayer({
					source: new XYZSource({
						url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
					})
				})

				let map = new Maps({
					layers: [vector],
					target: document.getElementById('mapView'),
					view: new View({
						center: fromLonLat([that.props.avg_long, that.props.avg_lat]),
						projection: 'EPSG:3857',
						zoom: 10
					})
				});

				map.on('pointermove', function(evt) {
					if (evt.dragging) {
						return;
					}
					let pixel = map.getEventPixel(evt.originalEvent);
					that.displayFeatureInfo(pixel, map);
				});

				map.on('click', function(evt) {
					that.displayFeatureInfo(evt.pixel, map);
				});*/

				/*new Map({
					target: 'mapView',
					layers: [
						new TileLayer({
							source: new XYZ({
								url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
							})
						})
					],
					view: new View({
						center: [0, 0],
						zoom: 2,
						maxZoom: 21
					})
				});*/
				that.categorizeStations();
			}

			
		} else if ((document.getElementById('mapView')) && (that.props.filtered_stations && this.props.filtered_stations.length)) {
			console.log('componentDidMount else if');
			/*this.maps = new google.maps.Map(document.getElementById('mapView'), {
				center: new google.maps.LatLng(22.5726, 88.3639),
				// disableDefaultUI: true,
				// mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				fullscreenControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoomControl: true,
				zoomControlOptions: {
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
				}],
				disableDefaultUI: true,
				keyboardShortcuts: false,
				draggable: false,
				disableDoubleClickZoom: true,
				scrollwheel: false,
				streetViewControl: false
			});
			// console.log('>>>>>  ',markerCluster);
			if(this.markerCluster === null){
				this.markerCluster = new MarkerClusterer(this.maps ,[] ,{
					maxZoom: 8,
					// gridSize: size,
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});
			}*/
			//this.categorizeStations();
			/*if (!document.getElementById('gis_layers')) {
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'gis_layers');
				let centerControl = new this.CenterControl(centerControlDiv, this.maps, this);
				centerControlDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}

			if (!document.getElementById('layer_menu')) {
				let optionMenu = document.createElement('div');
				optionMenu.setAttribute('id', 'layer_menu');
				let optionMenuControl = new this.menuLayers(optionMenu, this.maps, this);
				optionMenu.index = 2;
				this.maps.controls[google.maps.ControlPosition.RIGHT_TOP].push(optionMenu);
				if (!this.state.show_layers) {
					optionMenu.style.display = "none";
				}
			}

			
			if (!document.getElementById('map_indices')) {
				let controlDiv = document.createElement('div');
				controlDiv.setAttribute('id', 'map_indices');
				let ControlIndex = new this.controlIndex(controlDiv, this.maps, this);
				controlDiv.index = 3;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
			}*/

			if (document.getElementById('olmap')) {
				let view = new View({
					// make sure the view doesn't go beyond the 22 zoom levels of Google Maps
					projection: 'EPSG:3857',
					maxZoom: 21
				});
				view.on('change:center', function() {
					let center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
					that.maps.setCenter(new google.maps.LatLng(center[1], center[0]));
				});
				view.on('change:resolution', function() {
					that.maps.setZoom(view.getZoom());
				});

				let raster_osm =  new TileLayer({
					source: new OSM()
				});

				if (document.getElementById('olmap')) {
					let content = document.getElementById('popup-content');
					let closer = document.getElementById('popup-closer');
					let element = document.getElementById('popup');

					popup = new Overlay({
						element: element,
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						},
						// positioning: 'bottom-center',
						// stopEvent: false,
						// offset: [0, -50]
					});

					closer.onclick = function() {
						this.pos = false;
						that.setState({
							dash: null
						}, () => {
							console.log('dashhhhh', that.state.dash);
							let search_string = that.props.history.location.search;
							that.props.history.push('/scenarios/' + that.props.history.location.search);
							popup.setPosition(undefined);
							this.pos = false;
							closer.blur();
						});
						return false;
					};

					let olMapDiv = document.getElementById('olmap');
					this.mapLayer = new ol.Map({
						controls: ol.control.defaults({
							attribution : true,
							zoom : true,
							rotate: false,
						}).extend([
							new ol.control.FullScreen(),
							// new win_app.custom_button()
						]),
						layers: layers_raster,
						loadTilesWhileInteracting: true,
						overlays: [popup],
						interactions: ol.interaction.defaults({
							altShiftDragRotate: false,
							dragPan: false,
							rotate: false
						}).extend([new ol.interaction.DragPan({kinetic: null})]),
						target: olMapDiv,
						view: view
					});
					if (!document.getElementById('gis_layers')) {
						let centerControlDiv = document.createElement('div');
						centerControlDiv.setAttribute('id', 'gis_layers');
						this.gisButton(centerControlDiv, this.mapLayer, this);
					}

					if (!document.getElementById('layer_menu')) {
						let optionMenu = document.createElement('div');
						optionMenu.setAttribute('id', 'layer_menu');
						if (!that.state.show_layers) {
							optionMenu.style.display = "none";
						}
						this.gisMenu(optionMenu, this.mapLayer, this);
					}

					if (!document.getElementById('map_indices')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_indices');
						this.indicesbutton(controlDiv, this.mapLayer, this);
					}

					if (!document.getElementById('map_type')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_type');
						this.mapTypeToggle(controlDiv, this.mapLayer, this);
					}
					
					this.toggleMap();					
					
					view.setCenter(fromLonLat([88.3639, 22.5726]));
					view.setZoom(12);
					// console.log('olmap 11', document.getElementById('mapView'));
					// console.log('olmap map1', view.getZoom());
					// console.log('olmap map2', this.maps.getZoom());
					// olMapDiv.parentNode.removeChild(olMapDiv);
					// this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
					// this.mapLayer.addOverlay(popup);

					// display popup on click
					this.mapLayer.on('click', function(evt) {
						// console.log('forEachFeatureAtPixel', that.mapLayer);
						let feature = that.mapLayer.forEachFeatureAtPixel(evt.pixel,
							function(feature) {
								return feature;
							});
						if (feature) {
							var coordinate = evt.coordinate;
							let coordinates = feature.getGeometry().getCoordinates();
							console.log('feature', coordinate);
							content.innerHTML = feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations' ? that.createMapTooltipOL(feature.values_.data_marker) : that.createTooltipGIS(feature);
							if (feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations') {
								if (that.props.history.location.pathname) {
									console.log('click url', that.props.history.location.pathname);
									let url = that.props.history.location.pathname;
									let search_string = that.props.history.location.search;
									// that.props.history.push('/scenarios');
									that.props.history.push('/scenarios/stations/' + feature.values_.data_marker.id + '/' + search_string);
								}

								that.setState({
									dash: feature.values_.data_marker.id,
									popup_type: 'stations'
								}/*, () => console.log('dashhhhh', that.state.dash)*/);
							} else{

								that.setState({
									popup_type:'gis',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							}

							if (that.state.popup_type && that.state.popup_type == 'stations') {
								if (that.props.filtered_stations && that.props.filtered_stations.length) {
									that.props.filtered_stations.map((st) => {
										if (st == that.state.dash) {
											let coordinates = fromLonLat([st.longitude, st.latitude]);
										}
									});
								}
								popup.setPosition(coordinates);
							} else {
								popup.setPosition(coordinate);
								this.pos = true;
							}
							/*document.querySelector(element).popover({
								placement: 'top',
								html: true,
								content: feature.get('name')
							});
							element.popover('show');*/
						} else {
							popup.setPosition(undefined);
							that.setState({
									popup_type:'',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							this.pos = false;
							console.log('popup closed');
							this.pos = false;
							// element.popover('destroy');
						}

					});
				}
				that.categorizeStations();
			}

		} else {
			console.log('componentDidMount else');
			/*this.maps = new google.maps.Map(document.getElementById('mapView'), {
				center: new google.maps.LatLng(22.5726, 88.3639),
				// disableDefaultUI: true,
				// mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				fullscreenControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoomControl: true,
				zoomControlOptions: {
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
				}],
				disableDefaultUI: true,
				keyboardShortcuts: false,
				draggable: false,
				disableDoubleClickZoom: true,
				scrollwheel: false,
				streetViewControl: false
			});*/
			/*if (!document.getElementById('gis_layers')) {
				let centerControlDiv = document.createElement('div');
				centerControlDiv.setAttribute('id', 'gis_layers');
				let centerControl = new this.CenterControl(centerControlDiv, this.maps, this);
				centerControlDiv.index = 1;
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
			}

			if (!document.getElementById('layer_menu')) {
				let optionMenu = document.createElement('div');
				optionMenu.setAttribute('id', 'layer_menu');
				let optionMenuControl = new this.menuLayers(optionMenu, this.maps, this);
				optionMenu.index = 2;
				this.maps.controls[google.maps.ControlPosition.RIGHT_TOP].push(optionMenu);
				if (!this.state.show_layers) {
					optionMenu.style.display = "none";
				}
			}

			if (!document.getElementById('map_indices')) {
				let controlDiv = document.createElement('div');
				controlDiv.setAttribute('id', 'map_indices');
				let ControlIndex = new this.controlIndex(controlDiv, this.maps, this);
				this.maps.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
				controlDiv.index = 3;
				console.log('in dashmap', this.maps);
			}*/

			if (document.getElementById('olmap')) {
				console.log('componentDidMount else');
				let view = new View({
					// make sure the view doesn't go beyond the 22 zoom levels of Google Maps
					projection: 'EPSG:3857',
					maxZoom: 21
				});
				// view.on('change:center', function() {
				// 	let center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
				// 	that.maps.setCenter(new google.maps.LatLng(center[1], center[0]));
				// });
				// view.on('change:resolution', function() {
				// 	that.maps.setZoom(view.getZoom());
				// });

				let raster_osm =  new TileLayer({
					source: new OSM()
				});

				if (document.getElementById('olmap')) {
					let content = document.getElementById('popup-content');
					let closer = document.getElementById('popup-closer');
					let element = document.getElementById('popup');

					popup = new Overlay({
						element: element,
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						},
						// positioning: 'bottom-center',
						// stopEvent: false,
						// offset: [0, -50]
					});

					closer.onclick = function() {
						this.pos = false;
						that.setState({
							dash: null
						}, () => {
							console.log('dashhhhh', that.state.dash);
							let search_string = that.props.history.location.search;
							that.props.history.push('/scenarios/' + that.props.history.location.search);
							popup.setPosition(undefined);
							this.pos = false;
							closer.blur();
						});
						return false;
					};

					let olMapDiv = document.getElementById('olmap');
					this.mapLayer = new ol.Map({
						controls: ol.control.defaults({
							attribution : true,
							zoom : true,
							rotate: false,
						}).extend([
							new ol.control.FullScreen(),
							// new win_app.custom_button()
						]),
						layers: layers_raster,
						loadTilesWhileInteracting: true,
						overlays: [popup],
						interactions: ol.interaction.defaults({
							altShiftDragRotate: false,
							dragPan: false,
							rotate: false
						}).extend([new ol.interaction.DragPan({kinetic: null})]),
						target: olMapDiv,
						view: view
					});
					if (!document.getElementById('gis_layers')) {
						let centerControlDiv = document.createElement('div');
						centerControlDiv.setAttribute('id', 'gis_layers');
						this.gisButton(centerControlDiv, this.mapLayer, this);
					}

					if (!document.getElementById('layer_menu')) {
						let optionMenu = document.createElement('div');
						optionMenu.setAttribute('id', 'layer_menu');
						if (!that.state.show_layers) {
							optionMenu.style.display = "none";
						}
						this.gisMenu(optionMenu, this.mapLayer, this);
					}

					if (!document.getElementById('map_indices')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_indices');
						this.indicesbutton(controlDiv, this.mapLayer, this);
					}
					
					if (!document.getElementById('map_type')) {
						let controlDiv = document.createElement('div');
						controlDiv.setAttribute('id', 'map_type');
						this.mapTypeToggle(controlDiv, this.mapLayer, this);
					}
					
					this.toggleMap();
					
					view.setCenter(fromLonLat([88.3639, 22.5726]));
					view.setZoom(12);
					// console.log('olmap 11', document.getElementById('mapView'));
					// console.log('olmap map1', view.getZoom());
					// console.log('olmap map2', this.maps.getZoom());
					// olMapDiv.parentNode.removeChild(olMapDiv);
					// this.maps.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
					// this.mapLayer.addOverlay(popup);

					// display popup on click
					this.mapLayer.on('click', function(evt) {
						// console.log('forEachFeatureAtPixel', that.mapLayer);
						let feature = that.mapLayer.forEachFeatureAtPixel(evt.pixel,
							function(feature) {
								return feature;
							});
						if (feature) {
							var coordinate = evt.coordinate;
							let coordinates = feature.getGeometry().getCoordinates();
							console.log('feature', coordinate);
							content.innerHTML = feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations' ? that.createMapTooltipOL(feature.values_.data_marker) : that.createTooltipGIS(feature);
							if (feature && feature.values_ && feature.values_.data_marker && feature.values_.data_marker.popup_type == 'stations') {
								if (that.props.history.location.pathname) {
									console.log('click url', that.props.history.location.pathname);
									let url = that.props.history.location.pathname;
									let search_string = that.props.history.location.search;
									// that.props.history.push('/scenarios');
									that.props.history.push('/scenarios/stations/' + feature.values_.data_marker.id + '/' + search_string);
								}

								that.setState({
									dash: feature.values_.data_marker.id,
									popup_type: 'stations'
								}/*, () => console.log('dashhhhh', that.state.dash)*/);
							} else{

								that.setState({
									popup_type:'gis',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							}
							if (that.state.popup_type && that.state.popup_type == 'stations') {
								if (that.props.filtered_stations && that.props.filtered_stations.length) {
									that.props.filtered_stations.map((st) => {
										if (st == that.state.dash) {
											let coordinates = fromLonLat([st.longitude, st.latitude]);
										}
									});
								}
								popup.setPosition(coordinates);
							} else {
								popup.setPosition(coordinate);
								this.pos = true;
							}
							/*document.querySelector(element).popover({
								placement: 'top',
								html: true,
								content: feature.get('name')
							});
							element.popover('show');*/
						} else {
							popup.setPosition(undefined);
							that.setState({
									popup_type:'',
									dash: null
								}, () => that.props.history.push('/scenarios/' + that.props.history.location.search));
							this.pos = false;
							console.log('popup closed');
							// element.popover('destroy');
						}

					});
				}
				//that.categorizeStations();
			}
		}
		
	}

	/**
	 * This functions toggles between the map type to be displayed i.e. satellite view map or atreet map.
	 * @return {[type]} [description]
	 */
	toggleMap() {
		this.setState({
			map_type: this.state.map_type == 'RoadOnDemand' ? 'AerialWithLabels' : 'RoadOnDemand'
		},() => {

			if (document.getElementById('current_map_type')) {
				document.getElementById('current_map_type').innerHTML = (this.state.map_type == "RoadOnDemand" ? 'Show Satellite' : 'Show Street Map');
			}
			for (let i = 0; i < layers_raster.length; ++i) {
				layers_raster[i].setVisible(styles[i] === this.state.map_type);
				console.log('layers_raster', layers_raster);
			}
		})
	}

	/**
	 * This function sets the design of the toggle button over the map for GIS Layers
	 * @param {HTML element} controlDiv The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	gisButton(controlDiv, map, that) {

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
			controlUI.setAttribute('id', 'gis_button_wrapper');
			controlDiv.appendChild(controlUI);

			// Set CSS for the control interior.
			let controlText = document.createElement('div');
			controlText.style.color = 'rgb(25,25,25)';
			controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
			controlText.style.fontSize = '16px';
			// controlText.style.lineHeight = '38px';
			controlText.style.paddingLeft = '5px';
			controlText.style.paddingRight = '5px';
			controlText.innerHTML = '<div class="layer-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="20px" height="30px" viewBox="0 0 512.001 512.001"><path d="M512 256.001c0-10.821-6.012-20.551-15.694-25.398l-38.122-19.061 38.122-19.06a.014.014 0 0 1 .004-.002c9.68-4.845 15.692-14.576 15.692-25.397 0-10.819-6.013-20.55-15.694-25.397L281.09 34.08c-15.712-7.849-34.47-7.849-50.185.001L15.691 141.691C6.013 146.534 0 156.264 0 167.084c0 10.821 6.012 20.551 15.694 25.398l38.121 19.06-38.126 19.063C6.012 235.45 0 245.18 0 256.001s6.012 20.551 15.694 25.397l38.121 19.061-38.118 19.059C6.02 324.353.004 334.08 0 344.902c-.004 10.828 6.008 20.564 15.694 25.412l215.215 107.608c7.856 3.925 16.471 5.886 25.09 5.886s17.238-1.963 25.095-5.887l215.215-107.608c9.682-4.845 15.695-14.582 15.691-25.41-.004-10.822-6.02-20.549-15.694-25.381l-38.122-19.061 38.126-19.063c9.678-4.846 15.69-14.576 15.69-25.397zm-485.775-84.57c-2.339-1.171-2.687-3.226-2.687-4.346s.35-3.175 2.683-4.343L241.429 55.138a32.617 32.617 0 0 1 14.573-3.418 32.614 32.614 0 0 1 14.567 3.417L485.776 162.74c2.337 1.17 2.687 3.225 2.687 4.345s-.348 3.175-2.687 4.346L270.572 279.032c-9.125 4.558-20.019 4.558-29.139.001L26.225 171.431zm459.558 169.144c2.33 1.164 2.679 3.215 2.679 4.336.001 1.123-.348 3.182-2.683 4.35L270.571 456.865c-9.125 4.558-20.019 4.559-29.139.001L26.225 349.262c-2.339-1.171-2.688-3.229-2.687-4.352 0-1.119.348-3.171 2.683-4.337l53.912-26.956 150.776 75.387c7.856 3.925 16.471 5.886 25.089 5.886 8.619 0 17.238-1.963 25.095-5.887l150.772-75.386 53.918 26.958zm-.005-80.23L270.571 367.949c-9.125 4.558-20.019 4.559-29.139.001L26.225 260.347c-2.339-1.17-2.687-3.225-2.687-4.345 0-1.122.348-3.175 2.683-4.344l53.912-26.956 150.776 75.387c7.855 3.925 16.472 5.886 25.089 5.886 8.617 0 17.237-1.962 25.094-5.888l150.774-75.386 53.908 26.954c2.339 1.171 2.687 3.225 2.687 4.346.001 1.12-.348 3.175-2.683 4.344z"/></svg><span class="layer-text">GIS Layers</span></div>';

			controlUI.appendChild(controlText);
			// console.log('show_layers', that.state.show_layers)
			// Setup the click event listeners: simply set the map to Chicago.
			controlUI.addEventListener('click', function() {
				that.setState({
					show_layers: !that.state.show_layers
				}, () => {
					if (that.state.show_layers) {
						console.log('optionMenu 1');
						if (document.getElementById('layer_menu')) {
							document.getElementById('layer_menu').style.display = 'block';
						}
						/*let optionMenu = document.createElement('div');
						optionMenu.setAttribute('id', 'layer_menu');
						let optionMenuControl = that.menuLayers(optionMenu, that.maps, that);
						optionMenu.index = 2;
						that.maps.controls[google.maps.ControlPosition.RIGHT_TOP].push(optionMenu);*/
					} else if (!that.state.show_layers) {
						console.log('optionMenu 2');
						if (document.getElementById('layer_menu')) {
							document.getElementById('layer_menu').style.display = 'none';
						}
					}
				});
			}, false);

		/*var button = document.createElement('button');
			button.innerHTML = 'N';

			let that = this;
			var handleRotateNorth = function(e) {
					that.mapLayer.getView().setRotation(180);
					console.log('rotate');
			};

			button.addEventListener('click', handleRotateNorth, false);*/

			let element = document.createElement('div');
			element.className = 'gis-toggle-button ol-unselectable ol-control';
			element.setAttribute('id', 'gis_button_wrapper');
			element.appendChild(controlUI);

			let custom_button = new ol.control.Control({
					element: element
		});
		map.addControl(custom_button);
	}

	/**
	 * This function sets menu over the map for GIS Layers
	 * @param {HTML element} option The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	gisMenu(option, map, that) {
		console.log('optionMenu 3');

		let controlUI = document.createElement('div');
		controlUI.setAttribute("class", 'check-input-wrapper');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		controlUI.style.marginBottom = '22px';
		controlUI.style.marginRight = '10px';
		// controlUI.style.marginTop = '55px';
		controlUI.style.textAlign = 'left';
		controlUI.title = 'Click to select layers';
		option.appendChild(controlUI);

		// Set CSS for the control interior.
		
		if (that.props.treeData_layer && that.props.treeData_layer.length && that.props.treeData_layer[0].children && that.props.treeData_layer[0].children.length) {
			that.props.treeData_layer[0].children.map((tree_child, index) => {
				console.log('tree_child.title', (that.props.value_layer && that.props.value_layer.length && (that.props.value_layer.indexOf(tree_child.value) !== -1) ? true : false));
				let controlTextWrapper = document.createElement('div');
				controlTextWrapper.setAttribute("class", 'check-input');
				let controlText = document.createElement('INPUT');
				controlText.setAttribute("type", "checkbox");
				controlText.setAttribute("name", tree_child.title);
				controlText.setAttribute("id", tree_child.value);
				controlText.checked = (that.props.value_layer && that.props.value_layer.length && (that.props.value_layer.indexOf(tree_child.value) !== -1) ? true : false);
				controlText.addEventListener("click", function(e){
					that.setChange(tree_child.value, e.target.checked);
				});
				controlText.style.color = 'rgb(25,25,25)';
				controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
				controlText.style.fontSize = '16px';
				controlText.style.lineHeight = '38px';
				controlText.style.paddingLeft = '5px';
				controlText.style.paddingRight = '5px';
				// controlText.innerHTML = tree_child.title;
				controlUI.appendChild(controlTextWrapper);
				controlTextWrapper.appendChild(controlText);
				let title = document.createElement('label');
				title.setAttribute("for", tree_child.value);
				title.setAttribute("class", "hellip");
				title.innerHTML = tree_child.title;
				controlTextWrapper.appendChild(title);
				// controlTextWrapper.appendChild(document.createElement('br'));
			});
		}

		let element = document.createElement('div');
			element.className = 'gis-menu ol-unselectable ol-control';
			element.setAttribute('id', 'layer_menu');
			element.style.display = "none"
			element.appendChild(controlUI);

			let custom_button = new ol.control.Control({
					element: element
		});
		map.addControl(custom_button);
	}

	/**
	 * This function sets the design of the indices button over the map.
	 * @param {HTML element} controlDiv The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	indicesbutton(controlDiv, map, that) {
		// Set CSS for the control border.
		// let that = this;
		let controlUI = document.createElement('div');
		controlUI.setAttribute('id', 'indices_button_wrapper');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		// controlUI.style.marginBottom = '22px';
		controlUI.style.marginTop = '10px';
		controlUI.style.marginRight = '10px';
		controlUI.style.textAlign = 'center';
		controlUI.title = '';
		controlDiv.appendChild(controlUI);

		// Set CSS for the control interior.
		let controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		// controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		controlText.innerHTML = '<div class="layer-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg><span class="layer-text">Show Indices</span></div>';

		controlUI.appendChild(controlText);
		// console.log('show_layers', that.state.show_layers)
		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			that.props.showIndex();
		});

		let element = document.createElement('div');
			element.className = 'indices-button ol-unselectable ol-control';
			element.setAttribute('id', 'indices_button_wrapper');
			element.appendChild(controlUI);

			let custom_button = new ol.control.Control({
				element: element
			});
			map.addControl(custom_button);
	}

	/**
	 * This function sets the design of the toggle button to toggle between the satelite view or strret view of map.
	 * @param {HTML element} controlDiv The element created for the toggle button
	 * @param {[type]} map        The map component
	 * @param {[type]} that       The scope for the calling function.
	 */
	mapTypeToggle(controlDiv, map, that) {
		// Set CSS for the control border.
		// let that = this;
		let controlUI = document.createElement('div');
		controlUI.setAttribute('id', 'map_type_button_wrapper');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		// controlUI.style.marginBottom = '22px';
		controlUI.style.marginTop = '10px';
		controlUI.style.marginRight = '10px';
		controlUI.style.textAlign = 'center';
		controlUI.title = '';
		controlDiv.appendChild(controlUI);

		// Set CSS for the control interior.
		let controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		// controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		controlText.innerHTML = '<div class="map-type-container"><span class="layer-text-map-type" id="current_map_type"></span></div>';

		controlUI.appendChild(controlText);
		// console.log('show_layers', that.state.show_layers)
		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			that.toggleMap();
		});

		let element = document.createElement('div');
			element.className = 'map-type-button ol-unselectable ol-control';
			element.setAttribute('id', 'map_type_button_wrapper');
			element.appendChild(controlUI);

			let custom_button = new ol.control.Control({
				element: element
			});
			map.addControl(custom_button);
	}

	/*dispatchClick(){
		let closer = document.getElementById('popup-closer');
		if (closer) {
			closer.dispatchEvent(new Event('click'));
			console.log('click dispatched');
		}
	}*/

	/**
	 * This function creates a custom tooltip.
	 * @param  {Object} data The marker data or Layer data.
	 * @return {void}
	 */
	manualPopupMap(data) {
		console.log('manualPopupMap', data);
		let that = this;
		let content = document.getElementById('popup-content');
		let closer = document.getElementById('popup-closer');
		let element = document.getElementById('popup');

		popup = new Overlay({
			element: element,
			autoPan: true,
			autoPanAnimation: {
				duration: 250
			},
			// positioning: 'bottom-center',
			// stopEvent: false,
			// offset: [0, -50]
		});
		that.mapLayer.addOverlay(popup);
		closer.onclick = function() {
			this.pos = false;
			that.setState({
				dash: null
			}, () => {
				console.log('dashhhhh', that.state.dash);
				let search_string = that.props.history.location.search;
				that.props.history.push('/scenarios/' + that.props.history.location.search);
				popup.setPosition(undefined);
				this.pos = false;
				closer.blur();
			});
			return false;
		};
		let coordinates = fromLonLat([data.longitude, data.latitude]);
		content.innerHTML = that.createMapTooltipOL(data);
		console.log('feature', coordinates);
		
		popup.setPosition(coordinates);
		this.pos = true;
	}

	/**
	 * Pushes markers in an array for displaying in map.
	 * @param  {object} maps Google map.
	 * @param  {object} data DG data for marker creation.
	 */

	pushMarkersOL(maps, data) {

		let iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.transform([data.longitude, data.latitude], 'EPSG:4326', 'EPSG:3857')),
			name: data.name,
			data_marker: data
		});

		// let img = new Image(200, 100);
		// img.Height = 150;
		// img.Width = 200;
		// img.Stretch = Stretch.Fill;
		// img.src = data.marker_icon.url;

		let iconStyle = new ol.style.Style({
			image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 30],
				// height: 28,
				// width: 26,
				// size: new OpenLayers.Size(10, 10),
				// scale: 0.2,
				// size: [2000,3000],
				anchorOrigin: 'top-left',
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				// img: img,
				// imgSize: [100, 100],
				scale: 0.7,
				// crossOrigin: 'Access-Control-Allow-Origin',
				opacity: 1,
				src: data.marker_icon.url,
				// src: 'http://openlayers.org/en/v3.0.0/examples/data/icon.png',
				// src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjAiIHdpZHRo%0D%0APSIyMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxkZWZzPjxzdHlsZT4uY2xzLTJ7ZmlsbDojZmZm%0D%0AfTwvc3R5bGU+PC9kZWZzPjxwYXRoIGZpbGw9IiMxZWEzNGEiIGQ9Ik04My4yMiAzMC43N3Y0LjY2%0D%0AYzAgOC40NS01LjU3IDE3LTExIDI1LjU2bC0xIDEuNjVjLS45NSAxLjQ5LTEuODcgMy0yLjc2IDQu%0D%0ANDhsLS45MSAxLjU3Yy0uMi4zNS0uNC43LS41OSAxLS42MSAxLjE1LTIgMi4zOC0yLjY2IDMuNjEt%0D%0AMS4wNiAxLjg1LTIuMjggMy43OS0zLjM0IDUuNzItMy44MyA2LjU2LTcuODEgMTMuNDctMTEuOCAy%0D%0AMC4yNC01Ljk1LTkuNTEtMTEuOTYtMTkuMDctMTcuNzEtMjguNzdsLS45Mi0xLjU2TDMwIDY4Yy0x%0D%0ALjA2LTEuOC0yLjE4LTMuNjQtMy4zMi01LjQ3bC0yLjQ2LTRjLTQuMjQtNi45My04LjE4LTE0LTkt%0D%0AMjAuNzMtLjE0LS44LS4yMi0yLjM2LS4yMi0yLjU0VjMxQzE3LjI0IDEwLjM1IDMzLjcuMzMgNDgu%0D%0ANjcuMzMgNTkuODUuMzMgNzMuNjggNS43OCA4MCAyMWEyOS45NCAyOS45NCAwIDAgMSAxLjU5IDRj%0D%0ALjExLjIyIDEuNjMgNC41NCAxLjYzIDUuNzd6Ii8+PHBhdGggZD0iTTQxLjQgNjIuMjJhMiAyIDAg%0D%0AMCAxLTItMlYyNS4zOGwuMzktLjUzYy4wOC0uMTEgOC41MS0xMS4xNyAyNS4zMS0uODdhMiAyIDAg%0D%0AMSAxLTIuMSAzLjQxYy0xMS44MS03LjI0LTE4LjA4LTIuMi0xOS42My0uNnYzMy40NGEyIDIgMCAw%0D%0AIDEtMS45NyAxLjk5eiIgY2xhc3M9ImNscy0yIi8+PHBhdGggZD0iTTcyLjIyIDYxbC0xIDEuNjVh%0D%0ANi4zIDYuMyAwIDAgMS0yLjg2LTEuNzQgNCA0IDAgMCAwLTYuMTMgMCA1Ljc1IDUuNzUgMCAwIDEt%0D%0AOC41NyAwIDQgNCAwIDAgMC02LjEzIDAgNS43NCA1Ljc0IDAgMCAxLTguNTYgMCA0IDQgMCAwIDAt%0D%0ANi4xMyAwIDUuNzggNS43OCAwIDAgMS00LjI4IDEuOTEgNS42NiA1LjY2IDAgMCAxLTEuODYtLjNs%0D%0ALTIuNDYtNGE5LjQ1IDkuNDUgMCAwIDEgMS4yNyAxIDQgNCAwIDAgMCA2LjEyIDAgNS43MyA1Ljcz%0D%0AIDAgMCAxIDguNTcgMCA0IDQgMCAwIDAgNi4xMyAwIDUuNzIgNS43MiAwIDAgMSA4LjU2IDAgNCA0%0D%0AIDAgMCAwIDYuMTMgMCA1LjczIDUuNzMgMCAwIDEgOC41NyAwQTQuMTIgNC4xMiAwIDAgMCA3Mi4y%0D%0AMiA2MXpNNjguNDEgNjcuMTNsLS45MSAxLjU3YTMuNDEgMy40MSAwIDAgMC0yLjI2LS43NiA0IDQg%0D%0AMCAwIDAtMy4wNiAxLjQ0IDUuNzMgNS43MyAwIDAgMS04LjU3IDAgNCA0IDAgMCAwLTYuMTMgMCA1%0D%0ALjcyIDUuNzIgMCAwIDEtOC41NiAwbC0uMzItLjI4YS45LjkgMCAxIDEgMS4yMS0xLjM1bC4zNC4z%0D%0AMWE0IDQgMCAwIDAgNi4xMyAwIDUuNzIgNS43MiAwIDAgMSA4LjU2IDAgNCA0IDAgMCAwIDYuMTMg%0D%0AMCA1Ljc2IDUuNzYgMCAwIDEgNC4yOC0xLjkyIDUuMTcgNS4xNyAwIDAgMSAzLjE2Ljk5ek0zNy44%0D%0ANCA2Ny4zNmEuOS45IDAgMCAxLTEuMDguNjggNC4yMSA0LjIxIDAgMCAwLS45LS4wOSA0IDQgMCAw%0D%0AIDAtMy4wNiAxLjQ0IDkuNDIgOS40MiAwIDAgMS0xLjM2IDEuMWwtLjkyLTEuNTZhNy45MSA3Ljkx%0D%0AIDAgMCAwIDEtLjg2IDUuNzYgNS43NiAwIDAgMSA0LjI4LTEuOTIgNS44NCA1Ljg0IDAgMCAxIDEu%0D%0AMjkuMTQuOS45IDAgMCAxIC43NSAxLjA3ek02MS42NyAzMmMtMyAwLTYuNjktMi43OC02Ljg2LTIu%0D%0AOTFhLjUuNSAwIDAgMSAuNi0uOHM0LjI3IDMuMjEgNi44NiAyLjcxYTIgMiAwIDAgMCAxLjQzLTEg%0D%0ALjUuNSAwIDAgMSAuODYuNSAzIDMgMCAwIDEtMi4wOSAxLjUgNCA0IDAgMCAxLS44IDB6IiBjbGFz%0D%0Acz0iY2xzLTIiLz48L3N2Zz4=',
			})),
			zIndex: 25
		});
		console.log('data marker ol', iconStyle);

		iconFeature.setStyle(iconStyle);
		gMarkers2.push(iconFeature);

		
	}

	/**
	 * This function sets the dash state to null.
	 */
	setDash() {
		this.setState({
			dash: null
		});
	}

	/**
	 * This function sets the dash state to the id whose marker is to be displayed.
	 */
	dash(id) {
		this.setState({
			dash: id
		},() => {
			/*if (this.state.dash && document.getElementById('olmap')) {
				// console.log('this.state.dash', this.state.dash);
				if (this.props.filtered_stations && this.props.filtered_stations.length) {
					this.props.filtered_stations.map((st) => {
						if (st.id == this.state.dash) {
							this.manualPopupMap(st);
							// this.dispatchClick();
						}
					});
				}
			}*/
			this.categorizeStations();
		});
	}

	/**
	 * This function returns the status of the station from the last data received time and current time difference.
	 * @param  {Object} station Data of th estation.
	 * @return {string}         
	 */
	returnPumpStatus(station) {
		let status;
		if (station.sub_category != this.state.pump_station && station.sub_category != this.state.pump_station_2 && station.sub_category != this.state.rainfall) {
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
		} else if (station.sub_category == this.state.pump_station || station.sub_category == this.state.street_sub_house_front || station.sub_category == this.state.street_sub_house_front_water) {
			if ((station.last_data_send != 0) && (station.last_data_send !== null) && (station.last_data_send != '') && (moment().unix() - station.last_data_send < 1800)) {
				status = 'online';
			} else {
				status = 'offline';
			}
		}
		return status;
	}

	/**
	 * This function is called to dispatch a resize event.
	 */
	windowResize(){
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
			console.log('timeout');
		}, 3000);
	}

	/**
	 * Categorize the DG according to their status(online/offline) and add marker image accordingly.
	 */
	categorizeStations(update) {
		console.log('click categorize', this.mapLayer.getLayers());
		var that = this;
		// console.log('categorizeStations', that);
		for (i = 0; i < gMarkers.length; i++) {
			gMarkers[i].setMap(null);
		};
		if (marker_ol) {
			this.mapLayer.removeLayer(marker_ol);
		}
		gMarkers=[];
		gMarkers2 = [];
		console.log('this.markerCluster1', this.markerCluster);
		if (this.markerCluster !== null) {
			this.markerCluster.clearMarkers();
		}
		let station_data = [],
			online_count = 0,
			offline_count = 0,
			shutdown_count = 0,
			avg_lat = 0,avg_lng = 0,count = 0,
			list_station = [];
		// console.log('station_data:', that.props.filtered_stations);
		if(that.props.filtered_stations && that.props.filtered_stations.length) {
			list_station = that.props.filtered_stations.slice(0);
			list_station.map((data,index) => {
				avg_lat = avg_lat + data.latitude;
				avg_lng = avg_lng + data.longitude;
				count++;
				// console.log('data', data);
				station_data.push(data);
				data['marker_icon'] = new google.maps.MarkerImage(
						'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/map_markers/v1-0-3/'+ data.sub_category + '_' + this.returnPumpStatus(data) + (data.blinking_status ? '_blink.png' : '.png'),null,null,null,new google.maps.Size(26, 24)
				);
				data['popup_type'] = 'stations';
					// this.pushMarkers(this.maps, data);
					this.pushMarkersOL(this.maps, data);
			});
			avg_lat = (avg_lat / count);
			avg_lng = (avg_lng / count);
			/*let center = new google.maps.LatLng(avg_lat, avg_lng);
			if (!update) {
				if (avg_lng == 0 && avg_lng == 0) {
					this.maps.panTo(center);
				} else {
					this.maps.panTo(new google.maps.LatLng(22.5726, 88.3639));
				}
			}*/
			
			/*if (this.state.dash && Object.values(this.state.dash).length) {
				this.state.dash.setContent(this.createMapTooltip(data));
				this.state.dash.open(maps, marker);
			}*/
			/*bounds  = new google.maps.LatLngBounds(new google.maps.LatLng(22.5726, 88.3639));

			for (i = 0; i < gMarkers.length; i++) {
				//gMarkers[i].setMap(this.maps);

				loc = new google.maps.LatLng(gMarkers[i].position.lat(), gMarkers[i].position.lng());
				bounds.extend(loc);
				// console.log('gMarkers', gMarkers[i].device_id);
				if (this.state.dash == gMarkers[i].device_id) {
					// gMarkers[i].dispatchEvent('click');
					//google.maps.event.trigger(gMarkers[i], 'click');
				}
			}*/

			/*if (this.state.dash && document.getElementById('olmap')) {
				// console.log('this.state.dash', this.state.dash);
				if (this.props.filtered_stations && this.props.filtered_stations.length) {
					this.props.filtered_stations.map((st) => {
						if (st.id == this.state.dash) {
							this.manualPopupMap(st);
							// this.dispatchClick();
						}
					});
				}
			}*/

			/*mb = this.maps.getDiv().getBoundingClientRect();
			console.log('mbbb', mb);
			console.log('mbbb b', bounds);
			mib = {
					top: mb.top + 30,
					right: mb.right - 10,
					bottom: mb.bottom - 30,
					left: mb.left + 10
			};
*/
			console.log('gMarkers2', gMarkers2);
			let vectorSource = new ol.source.Vector({
				features: gMarkers2      //add an array of features
				//,style: iconStyle     //to set the style for all your features...
			});
			if (marker_ol) {
				this.mapLayer.removeLayer(marker_ol);
				popup.setPosition(undefined);
				this.pos = false;
			}

			marker_ol = new ol.layer.Vector({
					source: vectorSource
			});
			marker_ol.setZIndex(20);
			this.pos = true;
			this.mapLayer.addLayer(marker_ol);
			this.windowResize();
			console.log('pos 11', this.pos);
			if (!update && (!this.pos || !_.isEqual(this.state.filtered_stations, this.props.filtered_stations))) {
				console.log('pos 12', this.pos);
				setTimeout(() => {
					let extent = marker_ol.getSource().getExtent();
					this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
					console.log('extent changed of markers');
					this.setState({
						initial_marker: true
					});
					if (avg_lng == 0 && avg_lng == 0) {
						this.mapLayer.getView().setCenter(fromLonLat([88.3639, 22.5726]));
						this.mapLayer.getView().setZoom(8);
					} else {
						this.mapLayer.getView().setCenter(fromLonLat([avg_lng, avg_lat]));
					}
				}, 1000);
			}


			/*if (!update) {
				this.maps.fitBounds(bounds);
				this.maps.panToBounds(bounds);
				if (avg_lng == 0 && avg_lng == 0) {
					this.maps.setCenter(new google.maps.LatLng(22.5726, 88.3639));
					this.maps.setZoom(8);
				} else {
					this.maps.setCenter(new google.maps.LatLng(avg_lat,avg_lng));
				}
			}*/


			

			console.log('this.markerCluster2', this.markerCluster);
			if (this.markerCluster !== null) {
				this.markerCluster.addMarkers(gMarkers);
			}
			console.log('this.markerCluster3', this.markerCluster);
		}

		console.log('this.mapLayer in here 1',this.props.layer_array.indexOf('34'))
		if(!update) {
			if (this.props.layer_array) {
				console.log('layer', this.props.layer_array);
				this.setState({
					layer_array: this.props.layer_array
				}, () => {
					if (this.props.layer_array && this.props.layer_array.length) {

						/*let vector = new ol.layer.Vector({
							source: new ol.source.GeoJSON({
								url: 'http://openlayers.org/en/v3.0.0/examples/data/geojson/countries.geojson',
								projection: 'EPSG:3857'
							}),
							style: new ol.style.Style({
								fill: new ol.style.Fill({
									color: 'rgba(255, 255, 255, 0.6)'
								}),
								stroke: new ol.style.Stroke({
									color: '#319FD3',
									width: 1
								})
							})
						});*/
						if (vectorLayer_A_INDIA_KOLKATA && this.props.layer_array.indexOf('34') == -1) {
							// console.log('vectorLayer_A_INDIA_KOLKATA lay', this.props.layer_array);
							// if (this.mapLayer && this.mapLayer.getLayers() && this.mapLayer.getLayers().length) {
							// 	this.mapLayer.getLayers().forEach(function(el) {
							// 		if (el.get('name') == 'vectorLayer_A_INDIA_KOLKATA') {
							// 			console.log('this.mapLayer', el.get('name'));
							// 			this.mapLayer.removeLayer(el);
							// 		}
							// 	})
							// }
							// console.log('this.mapLayer in here 2');
							console.log('vector layer 4 in remove');
							this.mapLayer.removeLayer(vectorLayer_A_INDIA_KOLKATA);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
							console.log('vectorLayer_A_INDIA_KOLKATA', vectorLayer_A_INDIA_KOLKATA);
						}
						if (vectorLayer_A_Water && this.props.layer_array.indexOf('33') == -1) {
							this.mapLayer.removeLayer(vectorLayer_A_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (StaticImage_100mm && this.props.layer_array.indexOf('35') == -1) {
							this.mapLayer.removeLayer(StaticImage_100mm);
						}
						if (StaticImage_200mm && this.props.layer_array.indexOf('36') == -1) {
							this.mapLayer.removeLayer(StaticImage_200mm);
						}
						if (StaticImage_300mm && this.props.layer_array.indexOf('37') == -1) {
							this.mapLayer.removeLayer(StaticImage_300mm);
						}
						if (StaticImage_400mm && this.props.layer_array.indexOf('38') == -1) {
							this.mapLayer.removeLayer(StaticImage_400mm);
						}
						if (StaticImage_Surge3m && this.props.layer_array.indexOf('39') == -1) {
							this.mapLayer.removeLayer(StaticImage_Surge3m);
						}
						if (StaticImage_Surge5m && this.props.layer_array.indexOf('40') == -1) {
							this.mapLayer.removeLayer(StaticImage_Surge5m);
						}
						if (vectorLayer_Borough_Boundary && this.props.layer_array.indexOf('31') == -1) {
							this.mapLayer.removeLayer(vectorLayer_Borough_Boundary);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_L_Water && this.props.layer_array.indexOf('33') == -1) {
							this.mapLayer.removeLayer(vectorLayer_L_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_P_Water && this.props.layer_array.indexOf('33') == -1) {
							this.mapLayer.removeLayer(vectorLayer_P_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_Ward_Boundary && this.props.layer_array.indexOf('32') == -1) {
							this.mapLayer.removeLayer(vectorLayer_Ward_Boundary);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}

						layers = [];
						this.props.layer_array.map((layer) => {
							if (layer == 33) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'vectorLayer_A_Water') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let vsource_A_Water = new VectorSource({
										url: 'https://prstatic.phoenixrobotix.com/kmls/vector/A_Water%20Logging.kml', // A_Water Logging.kml
										projection: 'EPSG:3857',
										format: new KML()
									});
										vectorLayer_A_Water = new VectorLayer({
											source: vsource_A_Water
										});
										vectorLayer_A_Water.set('name', 'vectorLayer_A_Water');
										vectorLayer_A_Water.setZIndex(3);
										/*if (vsource_A_Water.getState() == 'ready') {
											console.log('yup ready');
										}*/
										let listenerKey1 = vsource_A_Water.on('change', function(e) {
											if (vsource_A_Water.getState() == 'ready') {
												let featureCount = vsource_A_Water.getFeatures().length;
												// and unregister the "change" listener 
												ol.Observable.unByKey(listenerKey1);
												// or vsource_A_Water.unByKey(listenerKey1) if
												// you don't use the current master branch
												// of ol3
											}
											// let extent = ol.extent.boundingExtent(coordinates);
											let extent = vectorLayer_A_Water.getSource().getExtent();
											//that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
											that.windowResize();
										});
									this.mapLayer.addLayer(vectorLayer_A_Water);
									layers.push(vectorLayer_A_Water);
									/*vectorLayer_A_Water = new google.maps.KmlLayer({
										url: 'https://bit.ly/2NmIKpt',
										map: this.maps
									});*/ // A_Water Logging.kml
								}
								let count = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'vectorLayer_L_Water') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										count++;
									}
								});
								if (count == 0) {
									let vsource_L_Water = new VectorSource({
										url: 'https://prstatic.phoenixrobotix.com/kmls/vector/L_Water%20Logging.kml', // L_Water Logging.kml
										projection: 'EPSG:3857',
										format: new KML()
									});
									vectorLayer_L_Water = new VectorLayer({
										source: vsource_L_Water
									});
									vectorLayer_L_Water.set('name', 'vectorLayer_L_Water');
									vectorLayer_L_Water.setZIndex(3);
									let listenerKey2 = vsource_L_Water.on('change', function(e) {
										if (vsource_L_Water.getState() == 'ready') {
											let featureCount = vsource_L_Water.getFeatures().length;
											// and unregister the "change" listener 
											ol.Observable.unByKey(listenerKey2);
											// or vsource_L_Water.unByKey(listenerKey2) if
											// you don't use the current master branch
											// of ol3
										}
										// let extent = ol.extent.boundingExtent(coordinates);
										let extent = vectorLayer_L_Water.getSource().getExtent();
										//that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
										that.windowResize();
									});
									this.mapLayer.addLayer(vectorLayer_L_Water);
									layers.push(vectorLayer_L_Water);
								}
								let count_vsource_P_Water = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'vectorLayer_P_Water') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										count_vsource_P_Water++;
									}
								});
								if (count_vsource_P_Water == 0) {
									let vsource_P_Water = new VectorSource({
										url: 'https://prstatic.phoenixrobotix.com/kmls/vector/P_Water%20Logging.kml', // P_Water Logging.kml
										projection: 'EPSG:3857',
										format: new KML(),
									});
									vectorLayer_P_Water = new VectorLayer({
										source: vsource_P_Water
									});
									vectorLayer_P_Water.set('name', 'vectorLayer_P_Water');
									vectorLayer_P_Water.setZIndex(3);
									let listenerKey3 = vsource_P_Water.on('change', function(e) {
											if (vsource_P_Water.getState() == 'ready') {
												let featureCount = vsource_P_Water.getFeatures().length;
												// and unregister the "change" listener 
												ol.Observable.unByKey(listenerKey3);
												// or vsource_P_Water.unByKey(listenerKey3) if
												// you don't use the current master branch
												// of ol3
											}
											// let extent = ol.extent.boundingExtent(coordinates);
											let extent = vectorLayer_P_Water.getSource().getExtent();
											that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
											that.windowResize();
										});
									this.mapLayer.addLayer(vectorLayer_P_Water);
									layers.push(vectorLayer_P_Water);
								}
							} else if (layer == 34) {
								console.log('vectorLayer_A_INDIA_KOLKATA', vectorLayer_A_INDIA_KOLKATA);
								console.log('vectorLayer_A_INDIA_KOLKATA map', this.mapLayer);
								if (vectorLayer_A_INDIA_KOLKATA) {
									//this.mapLayer.removeLayer(vectorLayer_A_INDIA_KOLKATA);
									// vectorLayer_A_INDIA_KOLKATA.setSource(null);
								}
								let c = 0;
								// if (this.mapLayer && this.mapLayer.getLayers() && this.mapLayer.getLayers().length) {
									this.mapLayer.getLayers().forEach(function(el) {
										if (el.get('name') == 'vectorLayer_A_INDIA_KOLKATA') {
											// console.log('vector layer 4', el.get('name'));
											// this.mapLayer.removeLayer(el);
											c++;
										}
									})
									console.log('vector layer 4', c);
								// }
								if (c == 0) {
									console.log('vector layer 41', c);
									console.log('callAxios 1', callAxios);
									this.callKMLBig();
								}
								
									// console.log();
							} else if (layer == 35) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_100mm') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_100mm = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/100mm-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_100mm.setZIndex(2);
									StaticImage_100mm.set('name', 'StaticImage_100mm');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_100mm);
									that.windowResize();
									layers.push(StaticImage_100mm);
								}
							} else if (layer == 36) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_200mm') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_200mm = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/200mm-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_200mm.setZIndex(2);
									StaticImage_200mm.set('name', 'StaticImage_200mm');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_200mm);
									that.windowResize();
									layers.push(StaticImage_200mm);
								}
							} else if (layer == 37) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_300mm') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_300mm = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/300mm-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_300mm.setZIndex(2);
									StaticImage_300mm.set('name', 'StaticImage_300mm');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_300mm);
									that.windowResize();
									layers.push(StaticImage_300mm);
								}
							} else if (layer == 38) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_400mm') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_400mm = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/400mm-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_400mm.setZIndex(2);
									StaticImage_400mm.set('name', 'StaticImage_400mm');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_400mm);
									that.windowResize();
									layers.push(StaticImage_400mm);
								}
							} else if (layer == 39) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_Surge3m') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_Surge3m = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/Surge3m-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_Surge3m.setZIndex(2);
									StaticImage_Surge3m.set('name', 'StaticImage_Surge3m');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_Surge3m);
									that.windowResize();
									layers.push(StaticImage_Surge3m);
								}
							} else if (layer == 40) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'StaticImage_Surge5m') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let extent = [9820542.102707833, 2563071.474196818, 9847340.35164866, 2591428.7360071917];
									// console.log('extenddd 1', fromLonLat([88.219430692017085, 22.428677156775823]));
									// console.log('extenddd 2', fromLonLat([88.460163458128946, 22.663944933872664]));
									let projection = new Projection({
										code: 'EPSG:4326',
										units: 'pixels',
										extent: extent
									});

									StaticImage_Surge5m = new ol.layer.Image({
										source: new ol.source.ImageStatic({
										url: 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/layers/Surge5m-IIF-2.png',
										projection: projection,
										imageExtent: extent,
										// resolution:1,
										// maxResolution: 2
										})
									});
									StaticImage_Surge5m.setZIndex(2);
									StaticImage_Surge5m.set('name', 'StaticImage_Surge5m');
									this.mapLayer.getView().fit(extent, this.mapLayer.getSize());
									this.mapLayer.addLayer(StaticImage_Surge5m);
									that.windowResize();
									layers.push(StaticImage_Surge5m);
								}
							} else if (layer == 31) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'vectorLayer_Borough_Boundary') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let vsource_Borough_Boundary = new VectorSource({
												url: 'https://prstatic.phoenixrobotix.com/kmls/vector/Borough%20Boundary.kml', // Borough Boundary.kml
												projection: 'EPSG:3857',
												format: new KML(),
											});
										vectorLayer_Borough_Boundary = new VectorLayer({
											source: vsource_Borough_Boundary
										});
										vectorLayer_Borough_Boundary.set('name', 'vectorLayer_Borough_Boundary');
										vectorLayer_Borough_Boundary.setZIndex(2);
										console.log('vsource_Borough_Boundary 1', vsource_Borough_Boundary.getFeatures().length);
										let listenerKey = vsource_Borough_Boundary.on('change', function(e) {
											if (vsource_Borough_Boundary.getState() == 'ready') {
												let featureCount = vsource_Borough_Boundary.getFeatures().length;
												console.log('vsource_Borough_Boundary 2', vsource_Borough_Boundary);
												// and unregister the "change" listener 
												ol.Observable.unByKey(listenerKey);
												// or vsource_Borough_Boundary.unByKey(listenerKey) if
												// you don't use the current master branch
												// of ol3
											}
											// let extent = ol.extent.boundingExtent(coordinates);
											let extent = vectorLayer_Borough_Boundary.getSource().getExtent();
											// console.log('response extent small', vectorLayer_Borough_Boundary.getSource().getProjection().getCode());
											that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
											that.windowResize();
										});
									this.mapLayer.addLayer(vectorLayer_Borough_Boundary);
									layers.push(vectorLayer_Borough_Boundary);
									console.log('olmap map1', vectorLayer_Borough_Boundary);
								}
							} /*else if (layer == 34) {
								if (vectorLayer_L_Water) {
									vectorLayer_L_Water.setSource(null);
								}
								vectorLayer_L_Water = new google.maps.KmlLayer({
									url: 'https://bit.ly/2oL1Rf5',
									map: this.maps
								}); // L_Water Logging.kml
							} else if (layer == 35) {
								if (vectorLayer_P_Water) {
									vectorLayer_P_Water.setSource(null);
								}
								vectorLayer_P_Water = new google.maps.KmlLayer({
									url: 'https://bit.ly/2No465I',
									map: this.maps
								}); // P_Water Logging.kml
							}*/ else if (layer == 32) {
								let c = 0;
								this.mapLayer.getLayers().forEach(function(el) {
									if (el.get('name') == 'vectorLayer_Ward_Boundary') {
										console.log('this.mapLayer 1', el.get('name'));
										// this.mapLayer.removeLayer(el);
										c++;
									}
								});
								if (c == 0) {
									let vsource_Ward_Boundary = new VectorSource({
											url: 'https://prstatic.phoenixrobotix.com/kmls/vector/Ward%20Boundary.kml', // Ward Boundary.kml
											projection: 'EPSG:3857',
											format: new KML()
										});
										vectorLayer_Ward_Boundary = new VectorLayer({
											source: vsource_Ward_Boundary
										});
										
										vectorLayer_Ward_Boundary.setZIndex(1);
										vectorLayer_Ward_Boundary.set('name', 'vectorLayer_Ward_Boundary');
										let listenerKey = vsource_Ward_Boundary.on('change', function(e) {
											if (vsource_Ward_Boundary.getState() == 'ready') {
												let featureCount = vsource_Ward_Boundary.getFeatures().length;
												console.log('vectorLayer_Ward_Boundary', featureCount);
												// and unregister the "change" listener 
												ol.Observable.unByKey(listenerKey);
												// or vsource_Ward_Boundary.unByKey(listenerKey) if
												// you don't use the current master branch
												// of ol3
											}
											// let extent = ol.extent.boundingExtent(coordinates);
											let extent = vectorLayer_Ward_Boundary.getSource().getExtent();
											console.log('vectorLayer_Ward_Boundary 66', extent);
											that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
											that.windowResize();
											// console.log('vectorLayer_Ward_Boundary', extent);
										});
									layers.push(vectorLayer_Ward_Boundary);
									
									this.mapLayer.addLayer(vectorLayer_Ward_Boundary);
								}
							}
						});
						
					} else {
						/*if (ctaLayer1) {
							ctaLayer1.setMap(null);
						}
						if (ctaLayer2) {
							ctaLayer2.setMap(null);
						}
						if (ctaLayer3) {
							ctaLayer3.setMap(null);
						}
						if (ctaLayer4) {
							ctaLayer4.setMap(null);
						}
						if (ctaLayer5) {
							ctaLayer5.setMap(null);
						}
						if (ctaLayer6) {
							ctaLayer6.setMap(null);
						}*/
						if (vectorLayer_A_Water) {
							this.mapLayer.removeLayer(vectorLayer_A_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_A_INDIA_KOLKATA) {
							// console.log('vectorLayer_A_INDIA_KOLKATA lay', this.props.layer_array);
							this.mapLayer.removeLayer(vectorLayer_A_INDIA_KOLKATA);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (StaticImage_100mm) {
							this.mapLayer.removeLayer(StaticImage_100mm);
						}
						if (StaticImage_200mm) {
							this.mapLayer.removeLayer(StaticImage_200mm);
						}
						if (StaticImage_300mm) {
							this.mapLayer.removeLayer(StaticImage_300mm);
						}
						if (StaticImage_400mm) {
							this.mapLayer.removeLayer(StaticImage_400mm);
						}
						if (StaticImage_Surge3m) {
							this.mapLayer.removeLayer(StaticImage_Surge3m);
						}
						if (StaticImage_Surge5m) {
							this.mapLayer.removeLayer(StaticImage_Surge5m);
						}
						if (vectorLayer_Borough_Boundary) {
							this.mapLayer.removeLayer(vectorLayer_Borough_Boundary);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_L_Water) {
							this.mapLayer.removeLayer(vectorLayer_L_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_P_Water) {
							this.mapLayer.removeLayer(vectorLayer_P_Water);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
						if (vectorLayer_Ward_Boundary) {
							this.mapLayer.removeLayer(vectorLayer_Ward_Boundary);
							// this.dispatchClick();
							popup.setPosition(undefined);
							this.pos = false;
						}
					}

					// https://bit.ly/2wNDEJd -> A_INDIA_KOLKATA_LULC_CURRENT.kml
					// https://bit.ly/2wQUzdW -> Borough Boundary.kml
					// https://bit.ly/2oL1Rf5 -> L_Water Logging.kml
					// https://bit.ly/2No465I -> P_Water Logging.kml
					// https://bit.ly/2M57uh6 -> Ward Boundary.kml
					
				});
			}
		}
		

		// console.log('hello',gMarkers);
		that.setState({
			filtered_stations: this.props.filtered_stations,
			station_data: station_data,
			online_count: online_count,
			offline_count: offline_count,
			shutdown_count: shutdown_count
		});
	}

	/**
	 * This function call the loader function to load the KML file for big file size.
	 * @return {[type]} [description]
	 */
	async callKMLBig() {
		console.log('callKMLBig');
		let vsource_A_INDIA_KOLKATA = new VectorSource({
			// url: 'https://prstatic.phoenixrobotix.com/kmls/vector/A_INDIA_KOLKATA_LULC_CURRENT.kml', // A_INDIA_KOLKATA_LULC_CURRENT.kml
			format: new KML(),
			loader: function(extent, resolution, projection) {
				let proj = projection.getCode();
				let url = 'https://prstatic.phoenixrobotix.com/kmls/vector/A_INDIA_KOLKATA_LULC_CURRENT.kml';

				console.log('loader func extent', extent);
				console.log('loader func resolution', resolution);
				console.log('loader func projection', projection);
				

				if (that.xhr) {
					
				} else {
					that.xhr = new XMLHttpRequest();
					that.xhr.open('GET', url);
					var onError = function() {
						vsource_A_INDIA_KOLKATA.removeLoadedExtent(extent);
						that.cancelRequest();
					}
					that.xhr.onerror = onError;
					that.xhr.onprogress = function (event) {
						that.showProgress(event.loaded, event.total);
						event.loaded;
						// console.log('xhr load loaded', event.loaded);
						// console.log('xhr load total', event.total);
						event.total;
					};
					that.xhr.onload = function(e) {
							console.log('response.status', e);
						if (e.srcElement && e.srcElement.status == 200 && e.loaded && e.total && e.loaded == e.total) {
							console.log('response.status parsed', vsource_A_INDIA_KOLKATA.getFormat());
							let feature = vsource_A_INDIA_KOLKATA.getFormat().readFeatures(e.srcElement.responseXML, {featureProjection: projection});
							vsource_A_INDIA_KOLKATA.addFeatures(feature);
						} else if (e) {
							onError();
						}
					}
					that.xhr.send();
				}
			},
			strategy: all,
			projection: 'EPSG:3857',
			// format: new KML()
		});

		vectorLayer_A_INDIA_KOLKATA = new VectorLayer({
			source: vsource_A_INDIA_KOLKATA
		});
		vectorLayer_A_INDIA_KOLKATA.set('name', 'vectorLayer_A_INDIA_KOLKATA');
		vectorLayer_A_INDIA_KOLKATA.setZIndex(5);
		// this.mapLayer.addLayer(vectorLayer_A_INDIA_KOLKATA);
		let that = this;
		that.setState({
			readyOK: true,
			layer_name: 'A_INDIA_KOLKATA_LULC_CURRENT'
		}/*,() => that.props.setLoadingKML(that.state.readyOK)*/);


		that.listenerKey = vsource_A_INDIA_KOLKATA.on('change', function(e) {
			if (vsource_A_INDIA_KOLKATA.getState() == 'ready') {
				console.log('response.status listener', vsource_A_INDIA_KOLKATA);
				that.setState({
					readyOK: false,
					total: null,
					loaded: null,
					layer_name: null
				},() => {
					// that.props.setLoadingKML(that.state.readyOK);
					// that.xhr = null;
					//this.mapLayer.addLayer(vectorLayer_A_INDIA_KOLKATA);
				});
				// hide loading icon
				// ...
				// and unregister the "change" listener 
				ol.Observable.unByKey(that.listenerKey);
				// or vsource_A_INDIA_KOLKATA.unByKey(listenerKey) if
				// you don't use the current master branch
				// of ol3
			}
				let extent = ol.proj.transformExtent(vectorLayer_A_INDIA_KOLKATA.getSource().getExtent(), 'EPSG:4326', 'EPSG:3857');
				// let extent = vectorLayer_A_INDIA_KOLKATA.getSource().getExtent();
				// console.log('response extent big', vectorLayer_A_INDIA_KOLKATA.getSource().getProjection().getCode());
				// that.mapLayer.getView().fit(extent, that.mapLayer.getSize());
				// that.windowResize();
		});
		/*console.log('yup ready water 22', that.listenerKey);
		if (vsource_A_INDIA_KOLKATA.getState() == 'ready') {
			console.log('yup ready water');
		}*/
		this.mapLayer.addLayer(vectorLayer_A_INDIA_KOLKATA);
		layers.push(vectorLayer_A_INDIA_KOLKATA);
	}

	/**
	 * This function shows the progressbar for the loading of kml file.
	 * @param  {Number} loaded Loaded file in KB.
	 * @param  {Number} total  Total file size in KB.
	 */
	showProgress(loaded, total) {
		this.setState({
			loaded : loaded,
			total : total
		});
		if (document.getElementById("myBar")) {
			let elem = document.getElementById("myBar");
			elem.style.width = ((loaded/total) * 100) + '%';
		}
	}

	/**
	 * This function cancel the downloading of the KML file.
	 */
	cancelRequest() {
		if (this.xhr) {
		console.log('cancelRequest');
			this.xhr.abort();
			this.setState({
				readyOK: false,
				loaded : null,
				total : null
			},() => {
				// this.props.setLoadingKML(this.state.readyOK);
				this.setChange('0-21-34', false);
				document.getElementById('0-21-34').checked = false;
			});
		}
		this.xhr = null;
	}

	/**
	 * This function selects/ deselects the GIS layers.
	 * @param {[type]} value        Triggered value.
	 * @param {[type]} check_status true for checked, false for uncheck.
	 */
	setChange(value, check_status) {
		if (value == '0-21-34' && !check_status) {
			this.xhr = null;
		}
			console.log('setChange 1', value);
			let triggerValue = value;
			let checked = check_status;
			let value_layer = this.props.value_layer && this.props.value_layer.length ? this.props.value_layer : [];
			console.log('setChange 2', value_layer);
			if (value_layer.includes(value)) {
				value_layer.splice(value_layer.indexOf(value), 1);
			} else {
				value_layer.push(value);
			}
			this.props.treeSelectLayer(value_layer, [], {triggerValue, checked});
		}

	/**
	 * Predefined function used to compare between current and next props.
	 * @param  {Object} nextProps 
	 * @return {Boolean}           
	 */
	/*shouldComponentUpdate(nextProps) {
		// console.log('next',_.isEqual(nextProps.filtered_stations, this.props.filtered_stations));
		// console.log('next', nextProps.filtered_stations);
		// console.log('next', this.props.filtered_stations);
		if (_.isEqual(nextProps.filtered_stations, this.props.filtered_stations) && nextProps.avg_lat == this.props.avg_lat && nextProps.avg_long == this.props.avg_long) {
			return false;
		} else {
			this.categorizeStations();
			return true;
		}
	}*/

	/**
	 * This renders the main dashboard page with navigation bar.
	 * @return {object}   Returns value in Object format.
	 */
	render() {
		const {treeData_layer, value_layer} = this.props;
		const tProps2 = {
			treeData: treeData_layer,
			value: value_layer,
			// onChange: this.onChange,
			treeCheckable: true,
			showCheckedStrategy: SHOW_PARENT,
			searchPlaceholder: 'Select Layers',
			// dropdownMatchSelectWidth: true
		};
		return <div id="map" >
			<div className="loader-wrapper full-height">

				{(() => {
					if (this.state.readyOK) {
						return <div className="load-progress">
							<div id="progress"></div>
							<div id="myProgress">
								<div id="myBar"></div>
							</div>
							<div className="load-data">
								{'Loading ' + this.state.layer_name + ' - ' + (this.state.loaded/ 1048576).toFixed(2) + 'MB / ' + (this.state.total/ 1048576).toFixed(2) + ' MB (' + (this.state.loaded && this.state.total ? ((this.state.loaded/this.state.total) * 100).toFixed(2) : '0' ) + ' % )'}
							</div>
							<br/>
							<button className="cancel-load" onClick={() => this.cancelRequest()}>Cancel</button>
							{/*<Loading is_inline={true} />;*/}
						</div>
					}else {}
				})()}
			</div>
			{/*<div className="full-height" id="mapView"></div>*/}
			<div className="full-height" id ="olmap">
				<div id="popup" className={'ol-popup' + (this.state.popup_type && this.state.popup_type == 'gis' ? ' gis-popup' : '')}>
					<a href={window.location.href} id="popup-closer" className="ol-popup-closer"></a>
					<div id="popup-content"></div>
				</div>
			</div>
			{/*(() => {
				if (this.state.show_layers) {
					return <div className="layers-view" id="layers_view">
						<TreeSelect onChange={(value, label, extra) => this.props.treeSelectLayer(value, label, extra)} treeDefaultExpandAll  {...tProps2} style={{ width: '100%' }} />
					</div>;
				}
			})()*/}
		</div>;
	}
}
