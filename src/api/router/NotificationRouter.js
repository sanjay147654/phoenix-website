//@flow

import express from 'express';
const user_id = '1';
const authenticate = require('./../authenticate.js');
import moment from 'moment-timezone';
import Notification from '../controller/Notification';


export default class NotificationRouter{
	router : express$Router;
	notification: Notification;
	constructor(){
		this.router = express.Router();
		this.notification = new Notification();
		this.routes();
	};

	routes(){
		
		let self = this;

		/**
		 * @api {post} /notifications/list Get list of notifications
		 * @apiVersion 1.0.0
		 * @apiName getNotificationsList
		 * @apiGroup Stations
		 *
		 * @apiHeader {string} [source] It is used to mentioned the source of the api originated from. Options are app -> Native applications, web or undefined for Web application 
         * @apiHeader {string} [source_app_id] Id of the Native application the requests are made
         * @apiHeader {string} [source_app_version] Version of the Native application
		 * @apiHeader {string} [auth-token] Authtoken send from the application. Only for Native application.
		 * 
		 * @apiParam {Number} [from_time] Listing notifications for a time interval. This is time when interval starts. If not provided then latest 20 notification will be shown.
		 * @apiParam {Number} [upto_time] Listing notifications for a time interval. This is time when interval ends. If not provided then latest 20 notification will be shown.
		 * 
		 * @apiSuccess {Object[]} notifications List of all the notifications.
		 * @apiSuccess {Number} notifications.id Id of the notification.
		 * @apiSuccess {String} notifications.notification Message of the notifications.
		 * @apiSuccess {Number} notifications.timestamp Timestamp of the notifications.
		 * @apiSuccess {String} [notifications.status] Status of the notifications. 1 -> seen, 0 -> not seen yet. It will come only in case of webapp
		 * @apiSuccess {String} status Status of the query.
		 *
		 * @apiSuccessExample Success-Response:
		 *     HTTP/1.1 200 OK
		 *		{
		 *			notifications: [
		 *				{
		 *					"id": 1,
		 *					"message": "Parameter is more than a value",
		 *					"event_details":{},
		 *					"station":"Demo Stations 1",
		 *					"timestamp": 1539846268,
		 *					"seen": 1
		 *				}
		 *			],
		 *			status: "success"
		 *		}
		 *
		 * @apiError 400 If only from time or upto time given or a invalid interval is given
		 * @apiErrorExample {json} Error 400 Response
		 *     HTTP/1.1 400 Not Found
		 *     {
		 *		"status": "failure",
		 *		"message":'Invalid time intervals'
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

		self.router.post('/-/api/flood-monitoring/v1.2.0/clients/:client_id/applications/:app_id/notifications/list',authenticate,(req : express$Request,res : express$Response)=>{
			self.notification.getNotificationsList(req, res);
		});
	}
}
	