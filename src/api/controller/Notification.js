//@flow


import express from 'express';
import _ from 'lodash';
import moment from 'moment-timezone';
import Controller from './Controller';

export default class Notification extends Controller{

	constructor(){
		super();		
	}

	async getNotificationsList(req,res){
		let self = this,from_time,upto_time;
		let application_id = 19;
		let user_id= req.user.ui;
		let event_message_type = 4;
		if(req.headers['source'] && req.headers['source'] == 'app'){
			event_message_type = 3;
		}
		if(req.body.from_time && req.body.upto_time && parseInt(req.body.from_time) < parseInt(req.body.upto_time) ){
			from_time = parseInt(req.body.from_time);
			upto_time = parseInt(req.body.upto_time);
		}else if(req.body.from_time || req.body.upto_time){
			res.status(400).json({
				"status": 'failure',
				"message": 'Invalid time intervals'
			});
			return;
		}

		try{

			let notifications_query = 'SELECT events_table.event_id, fms_name,event_details, event_station_id, alert_sent_at, event_message, alert_status FROM phoenzbi_data.events_table INNER JOIN phoenzbi_data.generated_alerts ON events_table.event_id = generated_alerts.event_id LEFT JOIN phoenzbi_data.flood_monitoring_stations ON event_station_id = fms_id WHERE usr_id = ? AND alert_media = ? AND events_table.serv_id = '+application_id+' ORDER BY alert_sent_at DESC';

			let notification_list;

			if(from_time && upto_time){
				notification_list = await super.queryDb('SELECT events_table.event_id, fms_name,event_details, event_station_id,  alert_sent_at, event_message, alert_status FROM phoenzbi_data.events_table INNER JOIN phoenzbi_data.generated_alerts ON events_table.event_id = generated_alerts.event_id LEFT JOIN phoenzbi_data.flood_monitoring_stations ON event_station_id = fms_id WHERE usr_id = ? AND alert_media = ? AND serv_id = '+application_id+' AND event_generation_time BETWEEN ? AND ? ORDER BY alert_sent_at DESC LIMIT 20', [user_id, event_message_type, from_time, upto_time]);
			}else{
				notification_list = await super.queryDb(notifications_query , [user_id, event_message_type]);
			}

			if(event_message_type == 4){
				await super.queryDb('UPDATE phoenzbi_data.generated_alerts SET alert_status = 1 WHERE usr_id = ? AND alert_media = ?',[user_id, event_message_type]);
			}

			console.log('event_message_type >> ',event_message_type);
			console.log('notification_list >> ',notification_list);
			res.json({
				notifications: notification_list.map((notification)=>{
					return {
						"id": notification.event_id,
						"message": notification.event_message,
						"event_details": ((super.isValidJson(notification.event_details))?JSON.parse(notification.event_details) : {} ),
						"station": notification.fms_name,
						"timestamp": notification.alert_sent_at,
						"seen": ((event_message_type == 4)? ((notification.alert_status == 1)? 1 : 0) : undefined)
					}
				}),
				status: 'success'
			});

		}catch(err){
			res.set({'error': err.message}).status(500).json({status:  'failure',message: 'Something went wrong'});			
		}

	}

}
	