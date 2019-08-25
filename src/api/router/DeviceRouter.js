//@flow

import express from 'express';
const user_id = '1';
const authenticate = require('./../authenticate.js');
import moment from 'moment-timezone';
import Devices from './../controller/Devices';
// import ACL from '../../library/AccessControlListLibrary';
const config = require('../configs.js');
const ACL = config.libraryACL;


export default class DeviceRouter{
	router: express$Router;
	devices: Devices;

	constructor(){
		this.router = express.Router();
		this.devices = new Devices();
		this.routes();
	}

	accessForbidden(req,res){
		res.status(403).json({
			status: 'failure',
			message: 'You do not have access to this data'
		})
	}

	routes(){
		
		let self = this;

		/**
		* @api {get} /devices/list/:type_id Get the list of all the devices
		* @apiVersion 0.1.0
		* @apiName getDeviceList
		* @apiGroup Devices
		*
		* @apiParam {Number} [type_id] Id of the device type
		*		
		* @apiSuccess {Object[]} device_list List of all the devices.
		* @apiSuccess {Number} device_list.id Id of the devices.
		* @apiSuccess {String} device_list.qr_code QR Code of the devices.
		* @apiSuccess {Number} device_list.type Id of device type.
		* @apiSuccess {String} device_list.status Status of the device Online/Offline/Shutdown.
		* @apiSuccess {String} device_list.station_name Name of the station.
		* @apiSuccess {Number} device_list.online_parcent Parcentage of the time device online.
		* @apiSuccess {Object[]} recent_activities List of all the recent activities. List of last 25 activities
		* @apiSuccess {Number} recent_activities.id Id of the device.
		* @apiSuccess {String} recent_activities.status Status of device.
		* @apiSuccess {Number} recent_activities.timestamp Time of when the device status changed.
		* @apiSuccess {Object[]} device_type List of all the device types.
		* @apiSuccess {Number} device_type.id Id of the device type.
		* @apiSuccess {String} device_type.name Name of the device type.
		*
		* @apiSuccessExample Success-Response:
		*     HTTP/1.1 200 OK
		*       {
		*           "device_list":[
		*               {
		*                   "id": 1,
		*                   "qr_code": "qwerty",
		*                   "type": 1,
		*                   "status": "online",
		*                   "station_name": "Maniktala",
		*                   "online_parcent": 40
		*               },
		*               {
		*                   "id": 2,
		*                   "qr_code": "asdfgh",
		*                   "type": 2,
		*                   "status": "online",
		*                   "station_name": "Maniktala",
		*                   "online_parcent": 40
		*               }
		*           ],
		*           "recent_activities":[
		*               {
		*                   "id":1,
		*                   "status": "online",
		*                   "timestamp": 1535539126
		*                },
		*               {
		*                   "id":1,
		*                   "status": "offline",
		*                   "timestamp": 1535538126
		*                },
		*               {
		*                   "id":1,
		*                   "status": "online",
		*                   "timestamp": 1535537126
		*                },
		*               {
		*                   "id":1,
		*                   "status": "offline",
		*                   "timestamp": 1535535126
		*               }
		*           ],
		*           "device_types":[
		*               {
		*                   "id": 1,
		*                   "name": "A"
		*               },
		*               {
		*                   "id": 2,
		*                   "name": "A1"
		*               },
		*               {
		*                   "id": 3,
		*                   "name": "B"
		*               }
		*           ]
		*       }
		*
		* @apiError 404 If no device type exist
		* @apiErrorExample {json} Error 404 Response
		*     HTTP/1.1 404 Not Found
		*     {
		*		"status": "failure",
		*		"message":'No such device type exist'
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
		**/

		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/devices/list', authenticate,(req : express$Request,res : express$Response)=>{
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'ManageDevices:ViewDevices'
			};

			// let parent  = super;

			ACL.isActionPermitted(user_details).then((condition)=>{
				if(condition){
					self.devices.getDeviceList(req,res);            
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure',error:err.message,message: 'Something went wrong'});				
			})
		})

		self.router.get('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/devices/list/:type_id',authenticate,(req : express$Request,res : express$Response)=>{
			let user_details = {
				user_id: req.user.ui,
				client_id: req.params.client_id || 365,
				application_id: req.params.app_id || 19,
				action: 'ManageDevices:ViewDevices'
			};

			// let parent  = super;

			ACL.isActionPermitted(user_details).then((condition)=>{
				if(condition){
					self.devices.getDeviceList(req,res);            
				}else{
					// console.log('here');
					self.accessForbidden(req,res);
				}
			}).catch((err)=>{
				res.status(500).json({status: 'failure',error:err.message,message: 'Something went wrong'});				
			})
		})
	}
}