// @flow
'use strict'

import * as http from 'http';
import debug from 'debug';
import App from './App';
let env = require('dotenv').config();
process.env = ((env && env.parsed)? env.parsed : {});
// ErrnoError interface for use in onError
declare interface ErrnoError extends Error {
	errno?: number;
	code?: string;
	path?: string;
	syscall?: string;
}

console.log('process.env', process.env);

// const logger = debug('flow-api:startup');
const app: App = new App();
const DEFAULT_PORT: number = 9091/* 46000 */;
const port: string | number = normalizePort(process.env.PORT);
const server: http.Server = http.createServer(app.express);

module.exports = server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: any): number | string {
	// console.log(process.env);
	// console.log('val ---->',val);
	let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;

	if (port && isNaN(port)) return port;
	else if (port >= 0) return port;
	else return DEFAULT_PORT;
}

function onError(error: ErrnoError): void {
	if (error.syscall !== 'listen') throw error;
	let bind: string = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port.toString()}`;

	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening(): void {
	let addr: {port:number,family:string,address:string} = server.address();
	let bind: string = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
	// logger(`Listening on ${bind}`);
	console.log("The server is running on http://localhost:"+addr.port);
}