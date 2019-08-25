//@flow

import express from 'express';
const user_id = '1';
const authenticate = require('./../authenticate.js');
import moment from 'moment-timezone';
import Stations from '../controller/Stations';
const config = require('../configs.js');
const ACL = config.libraryACL;


// console.log(authenticate);

export default class StationRouter{
	router : express$Router;
	stations : Stations;

	constructor(){
		this.router = express.Router();
		this.stations = new Stations();
		this.routes();
	};
	
	accessForbidden(req,res){
		res.status(403).json({
			status: 'failure',
			message: 'You do not have access to this data'
		})
	}

	routes(){

		let self = this;

		/**
	 	* @api {get} /stations/list Get the List of all Stations accessable by the user
		* @apiVersion 0.1.0
		* @apiName getStationList
		* @apiGroup Stations
		*
		* @apiSuccess {Object[]} event_log List of All the Events.
		* @apiSuccess {Number} event_log.station_id ID of the station.
		* @apiSuccess {String} event_log.station_name Name of the station.
		* @apiSuccess {Number} event_log.time Timestamp wher the Event occured.
		* @apiSuccess {String} event_log.message Message in the Events.
		* @apiSuccess {Object[]} device_info List of All the Device info.
		* @apiSuccess {String} device_info.type Type of the Device.
		* @apiSuccess {Number} device_info.total_devices Total number of devices of the type.
		* @apiSuccess {Number} device_info.running_devices Number of devices running.
		* @apiSuccess {Object[]} station_list List of All the Stations.
		* @apiSuccess {Number} station_list.id Id of the Station.
		* @apiSuccess {String} station_list.name Name of the Station.
		* @apiSuccess {Number} station_list.last_data_send Timestamp of the Station.
		* @apiSuccess {Number} station_list.latitude latitude of the Station.		
		* @apiSuccess {Number} station_list.longitude longitude of the Station.		
		* @apiSuccess {String} station_list.category category of the Station.		
		* @apiSuccess {String} station_list.sub_category sub-category of the Station.
		* @apiSuccess {String} station_list.show_trend Flags to see if the station shows 24 hour data or not 1-> show 0-> don't show.		
		* @apiSuccess {String} [station_list.bliking_status] Flags to see if the station have some alerts 1-> yes , 0-> no. Not applicable to all stations	
		* @apiSuccess {Object[]} station_list.parameters parameter details for the Station.		
		* @apiSuccess {String} station_list.parameters.name Name of the parameter.		
		* @apiSuccess {Number} station_list.parameters.value value of the parameter.		
		* @apiSuccess {String} station_list.parameters.units unit of the parameter.		
		* @apiSuccess {String} station_list.address address of the Station.		
		* @apiSuccess {String} station_list.status status of the Station.
		* @apiSuccess {String} status Status of the query.
		*
		* @apiSuccessExample Success-Response:
		*     HTTP/1.1 200 OK
		*		{
		*			event_log: [
		*				{
		*				"station_id": 4,
		*				"station_name": "Demo Station 4",
		*				"time": "1532457000",
		*				"message": "penstock exceeds limit"
		*				},
		*				...
		*			],
		*			device_info: [
		*				{
		*					type: 'A',
		*					total_devices: 3,
		*					running_devices: 1,
		*				},
		*				...
		*			]
		*			"station_list": [
		*				{
		*					"id": 1,
		*					"name": "Demo Station 1",
		*					"last_data_send": "1528816871",
		*					"latitude": "22.9748782",
		*					"longitude": "88.4086758",
		*					"category": "environment",
		*					"sub_category": "critical",
		*					"show_trend": 1,
		*					"parameters": [
		*						{
		*							name:'CO',
		*							value:25,
		*							unit:'ppm'
		*						}
		*						...
		*					],
		*					"address": "Kalyani, West Bengal",
		*					"status": "online"
		*				},
		*				...
		*			],
		*			"status": "success"
		*		}
		*
		* @apiError 404 If no station list exist
		* @apiErrorExample {json} Error 404 Response
		*     HTTP/1.1 404 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No Stations found'
		*     } 
		* 
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response 
		*     HTTP/1.1 500 Internal Server Error
		*     {
		*		"status": "failure"
		*		"message": "Something went wrong"
		*		"error":"error message"
		*     }
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*		HTTP/1.1 401 Unauthorized
		*
		*/

		/**
	 	* @api {get} /stations/list Get the List of all Stations accessable by the user
		* @apiVersion 1.0.0
		* @apiName getStationList
		* @apiGroup Stations
		*
		* @apiSuccess {Object[]} event_log List of All the Events.
		* @apiSuccess {Number} event_log.station_id ID of the station.
		* @apiSuccess {String} event_log.station_name Name of the station.
		* @apiSuccess {Number} event_log.time Timestamp wher the Event occured.
		* @apiSuccess {String} event_log.message Message in the Events.
		* @apiSuccess {Object[]} device_info List of All the Device info.
		* @apiSuccess {String} device_info.type Type of the Device.
		* @apiSuccess {Number} device_info.total_devices Total number of devices of the type.
		* @apiSuccess {Number} device_info.running_devices Number of devices running.
		* @apiSuccess {Object[]} station_list List of All the Stations.
		* @apiSuccess {Number} station_list.id Id of the Station.
		* @apiSuccess {String} station_list.name Name of the Station.
		* @apiSuccess {Number} station_list.last_data_send Timestamp of the Station.
		* @apiSuccess {Number} station_list.latitude latitude of the Station.		
		* @apiSuccess {Number} station_list.longitude longitude of the Station.		
		* @apiSuccess {String} station_list.category category of the Station.		
		* @apiSuccess {String} station_list.sub_category sub-category of the Station.
		* @apiSuccess {String} station_list.show_trend Flags to see if the station shows 24 hour data or not 1-> show 0-> don't show.		
		* @apiSuccess {String} [station_list.bliking_status] Flags to see if the station have some alerts 1-> yes , 0-> no. Not applicable to all stations	
		* @apiSuccess {Object[]} station_list.parameters parameter details for the Station.		
		* @apiSuccess {String} station_list.parameters.name Name of the parameter.		
		* @apiSuccess {Number} station_list.parameters.value value of the parameter.		
		* @apiSuccess {String} station_list.parameters.units unit of the parameter.		
		* @apiSuccess {Object} station_list.parameters.threshold threshold of the parameter.		
		* @apiSuccess {String} station_list.address address of the Station.		
		* @apiSuccess {String} station_list.status status of the Station.
		* @apiSuccess {String} status Status of the query.
		*
		* @apiSuccessExample Success-Response:
		*     HTTP/1.1 200 OK
		*		{
		*			event_log: [
		*				{
		*				"station_id": 4,
		*				"station_name": "Demo Station 4",
		*				"time": "1532457000",
		*				"message": "penstock exceeds limit"
		*				},
		*				...
		*			],
		*			device_info: [
		*				{
		*					type: 'A',
		*					total_devices: 3,
		*					running_devices: 1,
		*				},
		*				...
		*			]
		*			"station_list": [
		*				{
		*					"id": 1,
		*					"name": "Demo Station 1",
		*					"last_data_send": "1528816871",
		*					"latitude": "22.9748782",
		*					"longitude": "88.4086758",
		*					"category": "environment",
		*					"sub_category": "critical",
		*					"show_trend": 1,
		*					"parameters": [
		*						{
		*							name:'CO',
		*							value:25,
		*							unit:'ppm',
		*							threshold: {
		*								min: 20,
		*								max: 80
		*							},
		*						}
		*						...
		*					],
		*					"address": "Kalyani, West Bengal",
		*					"status": "online"
		*				},
		*				...
		*			],
		*			"status": "success"
		*		}
		*
		* @apiError 404 If no station list exist
		* @apiErrorExample {json} Error 404 Response
		*     HTTP/1.1 404 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No Stations found'
		*     } 
		* 
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response 
		*     HTTP/1.1 500 Internal Server Error
		*     {
		*		"status": "failure"
		*		"message": "Something went wrong"
		*		"error":"error message"
		*     }
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*		HTTP/1.1 401 Unauthorized
		*
		*/

		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/list',authenticate,(req : express$Request,res : express$Response)=>{
			self.stations.getStationList(req, res);
		});

		/**
		* @api {get} /stations/options Get the List of categories and parameters 
		* @apiVersion 0.1.0
		* @apiName getStationOptions
		* @apiGroup Stations
		*
		* @apiSuccess {Object[]} category_list List of All the categories.
		* @apiSuccess {Number} category_list.id Id of the categories.
		* @apiSuccess {String} category_list.name Name of the categories.
		* @apiSuccess {Object[]} category_list.sub_category All subcategories under the category.
		* @apiSuccess {Number} category_list.sub_category.id  Id of the subcategory.
		* @apiSuccess {String} category_list.sub_category.name Name of the subcategory.
		* @apiSuccess {Object[]} parameter_list List of All the Stations.
		* @apiSuccess {Number} parameter_list.id Id of the parameter.
		* @apiSuccess {String} parameter_list.name Name of the parameter.
		* @apiSuccess {String} status Status of the query.
		*
		* @apiSuccessExample Success-Response:
		*     HTTP/1.1 200 OK
		*		{
		*			category_list:[
		*				{
		*					id:1,
		*					name:'environment',
		*					sub_category:[
		*						{
		*							id:1,
		*							name:'critical'
		*						},
		*						...
		*					]
		*				},
		*				...
		*			],
		*			parameter_list:[
		*				{
		*					id:1,
		*					name:'BOD'
		*				},
		*				...
		*			]		
		*			"status": "success"
		*		}
		*
		* @apiError 404 If no station list exist
		* @apiErrorExample {json} Error 404 Response
		*     HTTP/1.1 404 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No Stations found'
		*     } 
		* 
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response 
		*     HTTP/1.1 500 Internal Server Error
		*     {
		*		"status": "failure"
		*		"message": "Something went wrong"
		*		"error":"error message"
		*     }
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*		HTTP/1.1 401 Unauthorized
		*
		*/

		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/options',authenticate,(req : express$Request,res : express$Response)=>{
			self.stations.getStationOptions(req,res);			
		});

		/**
	 	* @api {post} /stations/:id/details Get details of the station 
		* @apiVersion 0.1.0
		* @apiName getStationDetails
		* @apiGroup Stations
		*
		* @apiParam {Number} from_time From Time for the Station Data.
		* @apiParam {Number} upto_time Upto Time for the Station Data.
		*
		* @apiSuccess {Object} details Details of the station.
		* @apiSuccess {Number} details.id The ID of the Staion.
		* @apiSuccess {String} details.name The name of the station.
		* @apiSuccess {Object[]} details.parameters List of all the parameters for the station.
		* @apiSuccess {String} details.parameters.name Name of the parameter.
		* @apiSuccess {Number} [details.parameters.max_value] Max value of parameter.
		* @apiSuccess {Number} [details.parameters.min_value] Min value of the parameter.
		* @apiSuccess {Number} [details.parameters.max_value_time] Time at which maximum value of the parameter.
		* @apiSuccess {Number} [details.parameters.min_value_time] Time at which minimum value of the parameter.
		* @apiSuccess {Object[]} details.parameters.values List of all the values for this station.
		* @apiSuccess {Number} details.parameters.values.timestamp Time when the value is collected.
		* @apiSuccess {Number} [details.parameters.values.value] Value of the parameter.
		* @apiSuccess {Number} [details.parameters.values.min] Minimum value of the parameter for hourly date parameter.
		* @apiSuccess {Number} [details.parameters.values.max] Maximum value of the parameter for hourly date parameter.
		* @apiSuccess {Number} [details.parameters.values.avg] Average value of the parameter for hourly date parameter.
		* @apiSuccess {Number} [details.parameters.values.min_at] Time at which minimum value of the parameter for hourly date parameter.
		* @apiSuccess {Number} [details.parameters.values.max_at] Time at which maximum value of the parameter for hourly date parameter.
		* @apiSuccess {String} details.parameters.unit Unit of the parameter.
		* @apiSuccess {String} status Status of the query.
		*
		* @apiSuccessExample Success-Response:
		*     HTTP/1.1 200 OK
		*		{
		*			"details":{
		*				"id":1,
		*				"name":"Demo Station 1",
		*				"category":1,
		*				"sub_category":1,
		*				"parameters":[
		*					{
		*						"name":"CO",
		*						"max_value": 12150,
		*						"max_value_time": 1529346644,
		*						"min_value": 12150,
		*						"min_value_time": 1529346644,
		*						"values":[
		*							{
		*								"timestamp":1529325585,
		*								"value":12
		*							},
		*							{
		*								"timestamp":1529324585,
		*								"value":12
		*							},
		*							...
		*						],
		*						"unit":"ppm"
		*					},
		*					...
		*				]
		*			},
		*			"status":"success"
		*		}
		*
		* @apiError 400 If no station id is given
		* @apiErrorExample {json} Error 400 Response
		*     HTTP/1.1 400 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No Station ID is provided'
		*     }
		*
		* @apiError 404 If station ID does not exist
		* @apiErrorExample {json} Error 404 Response
		*     HTTP/1.1 404 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No such Station found'
		*     }
		* 
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response
		*     HTTP/1.1 500 Internal Server Error
		*     {
		*		"status": "failure"
		*		"message": "Something went wrong"
		*		"error":"error message"
		*     }
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*		HTTP/1.1 401 Unauthorized
		*
		*/
		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/details',authenticate,(req : express$Request,res : express$Response)=>{
			// self.stations.getStationDetails(req,res);
			res.status(400).json({status:'failure',message:'No Station ID is provided'});
		});

		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/:id/details',authenticate,(req : express$Request,res : express$Response)=>{
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				station_id: req.params.id,
				action: 'AccessData:HistoricalData'
			};

			ACL.isStationActionsPermitted(user_details).then((condition)=>{
				if(condition){
					self.stations.getStationDetails(req,res);	
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure', error:err.message, message: 'Something went wrong'});
			})
			// res.json({message:'We are connected'});
		});

		/**
		 * @api {post} /stations/:id/set_threshold Set threshold for a station
		 * @apiVersion 1.0.0
		 * @apiName setStationThreshold
		 * @apiGroup Stations
		 * 
		 * @apiParam {Number} id Id of the station
		 * @apiParam {Object[]} thresholds_list List of all the thresholds
		 * @apiParam {String} thresholds_list.param_key Key of the parameter of for whome the threshold object is for
		 * @apiParam {Object} thresholds_list.threshold Threshold Object
		 * 
		 * @apiSuccess {String} status Status of the API call
		 * 
		 * @apiSuccessExample Success-Response:
		 *     HTTP/1.1 200 OK
		 * 		{
		 * 			"status": "success"
		 * 		} 
		 * 
		 * @apiError 400 If no station id is given
		 * @apiErrorExample {json} Error 400 Response
		 *     HTTP/1.1 400 Not Found
		 *     {
		 *		"status": "failure",
		 *		"message":'No Station ID is provided'
		 *     }
		 *
		 * @apiError 404 If station ID does not exist
		 * @apiErrorExample {json} Error 404 Response
		 *     HTTP/1.1 404 Not Found
		 *     {
		 *		"status": "failure",
		 *		"message":'No Stations found'
		 *     }
		 * 
		 * @apiError 500 If failure occurs in case of the server 
		 * @apiErrorExample Error 500 Response
		 *     HTTP/1.1 500 Internal Server Error
		 *     {
		 *		"status": "failure"
		 *		"message": "Something went wrong"
		 *		"error":"error message"
		 *     }
		 * 
		 * @apiError 401 Unauthenticated if the user is not logged in
		 * @apiErrorExample Error 401 Response
		 *		HTTP/1.1 401 Unauthorized 
		 * 
		 */
		
		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/set_threshold',authenticate,(req : express$Request,res : express$Response)=>{
			res.status(400).json({status:'failure',message:'No Station ID is provided'});			
		})
		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/:id/set_threshold',authenticate,(req : express$Request,res : express$Response)=>{
			
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				station_id: req.params.id,
				action: 'ConfigureStations:SetAlertThresholds'
			};

			// let parent  = super;

			ACL.isStationActionsPermitted(user_details).then((condition)=>{
				if(condition){
					self.stations.setStationThreshold(req,res);
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure',error:err.message,message: 'Something went wrong'});				
			})
		})
		
		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/forecast/table',authenticate,(req : express$Request,res : express$Response)=>{
			
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'AdvancedAnalytics:Forecasting'
			};

			// let parent  = super;

			ACL.isActionPermitted(user_details).then((condition)=>{
				if(condition){
					self.stations.getForecastTableData(req,res);	
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure',error:err.message,message: 'Something went wrong'});
			})
		});
		
		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/forecast/details',authenticate,(req : express$Request,res : express$Response)=>{
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'AdvancedAnalytics:Forecasting'
			};

			// let parent  = super;

			ACL.isActionPermitted(user_details).then((condition)=>{
				if(condition){
					self.stations.getForecastDetails(req,res);				
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure',error:err.message,message: 'Something went wrong'});				
			})
		});

		/**
		* @api {post} /stations/get_report Get the Report of Selected Stations
		* @apiVersion 0.1.0
		* @apiName getStationReport
		* @apiGroup Stations
		*
		* @apiParam {Number} sub_category ID of the Selected Sub-Category.
		* @apiParam {Number[]} stations IDs of the Selected Stations.
		* @apiParam {Number} from_time Timestamp of the date to start generating reports.
		* @apiParam {Number} upto_time Timestamp of the date upto which reports being generated.
		* @apiParam {String} data_type Whether the data required is Raw or Average.
		* @apiParam {Number} avg_data_time Time duration for which the Average Report is being generated.
		* @apiParam {String[]} view_data_format Whether the data format required is Grid or Graph or Both.
		*
		* @apiSuccess {Object[]} [stations_data] Array Table Data of Stations.
		* @apiSuccess {Number} stations_data.id Station Id for Table.
		* @apiSuccess {Object[]} stations_data.table_data Station data for Table.
		* @apiSuccess {Number/Number[]} stations_data.table_data.time Timestamp for Raw Data or From & Upto Timestamps in Array for Average Data of Parameters Table.
		* @apiSuccess {Object[]} stations_data.table_data.parameters Parameters Data for Table.
		* @apiSuccess {String} stations_data.table_data.parameters.name Parameter Name.
		* @apiSuccess {String} stations_data.table_data.parameters.unit Parameter Unit.
		* @apiSuccess {String} stations_data.table_data.parameters.type Parameter Type.
		* @apiSuccess {String} [stations_data.table_data.parameters.rh] Run Hour of Pump.
		* @apiSuccess {Object[]} [stations_data.table_data.parameters.activities] Activities of Pump.
		* @apiSuccess {Number} stations_data.table_data.parameters.activities.time Activity Timestamp.
		* @apiSuccess {Number} stations_data.table_data.parameters.activities.status Activity Status (0:Off, 1:ON).
		* @apiSuccess {Number} [stations_data.table_data.parameters.status] Pump Status for Raw Value.
		* @apiSuccess {Number} [stations_data.table_data.parameters.value] Parameter Raw Value.
		* @apiSuccess {Object[]} [stations_data.table_data.parameters.data] Parameter Average Values.
		* @apiSuccess {Number} stations_data.table_data.parameters.data.avg Parameter Average Value.
		* @apiSuccess {Number} stations_data.table_data.parameters.data.min Parameter Minimum Value.
		* @apiSuccess {Number} stations_data.table_data.parameters.data.max Parameter Maximum Value.
		* @apiSuccess {String} status Status of the query.
		*
		* @apiSuccessExample Success-Response:
		*	HTTP/1.1 200 OK
		*	{
		*		stations_data: [
		*			{
		*				id: 1,
		*				table_data: [
		*					{ // Raw Data of Parameters in a particular time
		*						time: 1234567890,
		*						parameters: [
		*							{
		*								name: 'PM 2.5',
		*								unit: 'ug/m3',
		*								type: 'dust_pm_2_5',
		*								value: 123
		*							},
		*							...
		*						]
		*					},
		*					OR
		*					{ // Average Data of Parameters for a particular time period
		*						time: [1234567890, 1234567890],
		*						parameters: [
		*							{
		*								name: 'PM 2.5',
		*								unit: 'ug/m3',
		*								type: 'dust_pm_2_5',
		*								data: {
		*									avg: 123,
		*									min: 101,
		*									max: 130
		*								}
		*							},
		*							...
		*						]
		*					},
		*					OR
		*					{ // Average Data of Pumps for a particular time period
		*						time: [1234567890, 1234567890],
		*						parameters: [
		*							{
		*								name: 'Pump 1',
		*								type: 'pump_status',
		*								rh: 123,
		*								activities: [
		*									{
		*										time: 1234567890,
		*										status: ON
		*									},
		*									...
		*								]
		*							},
		*							...
		*						]
		*					},
		*					...
		*				]
		*			},
		*			...
		*		],
		*		status: 'success'
		*	}
		* 
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response 
		*	HTTP/1.1 500 Internal Server Error
		*	{
		*		status: 'failure'
		*		message: 'Something went wrong!'
		*		error: 'error message'
		*	}
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*	HTTP/1.1 401 Unauthorized
		*
		* @apiError 404 If API doesn't exists
		* @apiErrorExample {json} Error 404 Response
		*	HTTP/1.1 404 Not Found
		*
		*/
		
		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/get_report', authenticate, (req : express$Request, res : express$Response) => {
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'AdvancedAnalytics:Forecasting'
			};

			self.stations.getStationReport(req, res);

			// let parent  = super;

			/*ACL.isActionPermitted(user_details).then((condition) => {
				if(condition){
					self.stations.getStationReport(req, res);
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure', error:err.message, message: 'Something wrong'});
			})*/
		});

		/**
		* @api {get} /stations/download_report Download report in CSV format
		* @apiVersion 0.1.0
		* @apiName downloadStationsReport
		* @apiGroup Stations
		*
		* @apiParam {Number} sub_category ID of the Selected Sub-Category.
		* @apiParam {Number[]} stations IDs of the Selected Stations.
		* @apiParam {Number} from_time Timestamp of the date to start generating reports.
		* @apiParam {Number} upto_time Timestamp of the date upto which reports being generated.
		* @apiParam {String} data_type Whether the data required is Raw or Average.
		* @apiParam {Number} avg_data_time Time duration for which the Average Report is being generated.
		* @apiParam {String[]} view_data_format Whether the data format required is Grid or Graph or Both.
		*
		* @apiError 500 If failure occurs in case of the server 
		* @apiErrorExample Error 500 Response 
		*	HTTP/1.1 500 Internal Server Error
		*	{
		*		status: 'failure'
		*		message: 'Something went wrong!'
		*		error: 'error message'
		*	}
		*
		* @apiError 400 If the request query is not provided  
		* @apiErrorExample {json} Error 400 Response
		*	HTTP/1.1 400 Bad Request
		*	{
		*		status: 'failure',
		*		message: 'Request is invalid!'
		*	}
		* 
		* @apiError 401 Unauthenticated if the user is not logged in
		* @apiErrorExample Error 401 Response
		*	HTTP/1.1 401 Unauthorized
		*
		* @apiError 404 If API doesn't exists
		* @apiErrorExample {json} Error 404 Response
		*	HTTP/1.1 404 Not Found
		*
		*/

		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/stations/download_report',authenticate,(req : express$Request, res : express$Response)=>{
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'AdvancedAnalytics:Forecasting'
			};

			self.stations.downloadStationReport(req, res);

			/*ACL.isActionPermitted(user_details).then((condition) => {
				if(condition){
					console.log('method 1 called')
					self.stations.downloadStationReport(req, res);
				}else{
					console.log('method 2 called')
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				console.log('method 3 called')
				res.status(500).json({status: 'failure', error:err.message, message: 'Something went wrong'});
			})*/
		});

	}
}