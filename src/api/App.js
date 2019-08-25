//@flow

import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
const cors = require('cors');
import StationRouter from './router/StationRouter';
import DeviceRouter from './router/DeviceRouter';
import NotificationRouter from './router/NotificationRouter';

// var whitelist = ['*', 'http://example2.com']
const requestOptions = {
	origin: function (origin :String , callback) {
		callback(null, true)
	  },
	methods: ['OPTIONS','GET','POST'],
	credentials: true
  };

export default class App {

	express: express$Application;
	station: Station;
	device: DeviceRouter;
	notification: NotificationRouter;

	constructor() {

		this.express = express();
		this.station = new StationRouter();
		this.device = new DeviceRouter();
		this.notification = new NotificationRouter();
		this.middleware();
		this.routes();
	}

	middleware(): void {
		this.express.use(morgan('dev'));
		this.express.use(bodyParser.json());
		// this.express.use(bodyParser.urlencoded({extended: false}));
		this.express.use(cors(requestOptions));
	}

	routes(): void {
		this.express.use('/', this.station.router);
		this.express.use('/', this.device.router);
		this.express.use('/', this.notification.router);
	}
}