const mysql = require('mysql');
const config = require('./configs.js');
const pjson = require('./package.json');
let env = require('dotenv').config();
process.env = ((env && env.parsed)? env.parsed : {});


var test_authenticate = (req : express$Request, res : express$Response, done) => {
    req.user = {
		"un":"Admin",
		"user_email_id":"admin@phoenixrobotix.com",
		"ui":"1",
		"ut":"manager",
		"oi":"1",
		"org_name":"Phoenix Robotix",
		"hp":"//datoms.phoenixrobotix.com/enterprise/phoenix-robotix/dg-monitoring/",
		"is_admin":"1"
	};
  return done();
}

/* var authenticate = (req : express$Request, res : express$Response, done)=>{
	var msg = 'Unauthorized Access!';
	var isCookie = false;
	var token = '';
	console.log('req.headers["auth-token"] > ',req.headers["auth-token"]);
	try{
		if(req.headers["auth-token"]){
			isCookie = false;
			token = req.headers["auth-token"];
		}else{
			isCookie = true;
			var cookie = req.headers.cookie.split('; ');
			var session = '';
			cookie.map((item) => {
				if (item.split('=')[0] == 'PHPSESSID') {
					session = item.split('=')[1];
				}
			});
		}
	}catch(err){
		res.status(401).send(JSON.stringify({
			status: 'error',
			message: msg,
			error:err.message
		}));
		return;
	}
	
	// console.log('Session:', session);
	if(isCookie){

		let connection = mysql.createConnection(config);
		connection.query({
			sql: 'SELECT * FROM `' + (pjson.deploy_at == 'phoenixrobotix' ? 'phoenzbi_services' : 'aurassure_db') + '`.`usr_sessions` WHERE `usrs_session_id`=? AND `usrs_logout_time`=?',
			values: [session, 0],
			timeout: 30000
		}, (con_err, con_result, con_fields) => {
			// And done with the connection.
			connection.end();
			// Handle error after the release.
			if (con_err) {
				res.status(500).json({
					status:'failure',
					error:con_err.message,
					message:"Something went wrong"
				});
				return;
			}
			// console.log(session, con_result);
			if (con_result && con_result.length && con_result[0] && session == con_result[0].usrs_session_id) {
				var user_data = JSON.parse(con_result[0].usrs_session_data);
				// console.log('Result Session:', user_data);
				// getData(user_data);
				req.user = user_data;
				done();
			} else {
				console.log(msg);
				res.status(401).send(JSON.stringify({
					status: 'error',
					message: msg
				}));
				return;
			}
		});

	}else{

		if(token == 'Xb5eHUVv2Rly7d7FEEjchI6Cg9J6yinuxzAPNWKfebF9qks8e0JhwvAEa02VufPg' ){

			req.user = {
				"un":"",
				"user_email_id":"",
				"ui":"",
				"ut":"",
				"oi":"",
				"org_name":"",
				"is_admin":""
			};
			done();			

		}else{
			res.status(401).send(JSON.stringify({
				status: 'error',
				message: msg
			}));
			return;			
		}



	}
	
}
 */
var authenticate = (req : express$Request, res : express$Response, done)=>{
	var msg = 'Unauthorized Access!';
	try{
		var session = '';
		
		if(req.headers['source'] && req.headers['source'] == 'app' ){
			if(req.headers["auth_token"]){
				session = req.headers["auth_token"];
			}else{
				res.status(401).send(JSON.stringify({
					status: 'error',
					message: msg,
					error: 'auth_token not found'
				}));
				return;
			}
		}else{
			var cookie = req.headers.cookie.split('; ');
			cookie.map((item) => {
				if (item.split('=')[0] == 'PHPSESSID') {
					session = item.split('=')[1];
				}
			});
		}

	}catch(err){
		res.status(401).send(JSON.stringify({
			status: 'error',
			message: msg,
			error: err.message
		}));
		return;
	}
	
	// console.log('Session:', session);
	let connection = config.dbConnection;
	let application_id = 19;

	if(req.body.application_id){
		application_id = req.body.application_id;
	}

	if(req.params.application_id){
		application_id = req.params.application_id;
	}

	connection.query('SELECT serv_name FROM phoenzbi_services.services_tbl WHERE serv_id = ' + application_id, function(result , err){
		
		let sql = 'SELECT * FROM `' + (pjson.deploy_at == 'phoenixrobotix' ? 'phoenzbi_services' : 'aurassure_db') + '`.`usr_sessions` WHERE `usrs_session_id`=? AND `usrs_logout_time`=?' 
		
		if(application_id != 19){
			sql = 'SELECT * FROM phoenzbi_services.usr_sessions WHERE usrs_session_id =? AND usrs_logout_time=? '
		}

		connection.query({
			sql: sql,
			values: [session, 0],
			timeout: 30000
		}, (con_err, con_result, con_fields) => {
			// And done with the connection.
			// connection.end();
			// Handle error after the release.
			if (con_err) {
				res.status(500).json({
					status:'failure',
					error:con_err.message,
					message:"Something went wrong"
				});
				return;
			}
			// console.log(session, con_result);
			if (con_result && con_result.length && con_result[0] && session == con_result[0].usrs_session_id) {
				var user_data = JSON.parse(con_result[0].usrs_session_data);
				// console.log('Result Session:', user_data);
				// getData(user_data);
				req.user = user_data;
				done();
			} else {
				console.log(msg);
				res.status(401).send(JSON.stringify({
					status: 'error',
					// sql: sql,
					// session: session,
					message: msg
				}));
				return;
			}
		});
	})

}

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
	module.exports = test_authenticate;
} else if (process.env.NODE_ENV === 'production' && process.env.BUILD_MODE === 'stage') { 
	module.exports = authenticate;
} else if (process.env.NODE_ENV === 'production') { 
	module.exports = authenticate;
}