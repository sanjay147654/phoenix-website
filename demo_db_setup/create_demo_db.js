var mysql = require('mysql');
var fs = require('fs');
var readline = require('readline');
var moment  = require('moment-timezone');
var config_json = {
	phoenzbi_data: './demo_db_setup/phoenzbi_data.sql',
	phoenzbi_services: './demo_db_setup/phoenzbi_services.sql'
};
var no_of_db=(Object.keys(config_json).length - 1);

var importDb = function (database,file_link){
	console.log(database,file_link);
	var con = mysql.createConnection({
			host: '127.0.0.1',
			database: database,
			user: 'root',
			password: ''
		}),
		query='';

	var rl = readline.createInterface({
		input: fs.createReadStream(file_link),
		terminal: false
	});

	rl.on('line', function(chunk){
		query += chunk.toString('ascii');
		if( ! /\/\*|\*\//.exec(query)){
			if(/;/.exec(query)){
				// console.log(query);
				con.query(query, function(err, sets, fields){
					if(err) console.log(err);
				});
				query = '';
			}
		}else{
			query = '';
		}
	});

	rl.on('close', function(){
		con.end();
	});

	con.on('end',function(){
		if(no_of_db <= 0){
			process.exit(0);
			// dummyDataPush();	
		}else{
			no_of_db--;
		}
	});
}
var checkDropDb = function (){	
	var self = this;
	var con = mysql.createConnection({
		'host': '127.0.0.1',
		'user': 'root',
		'password': ''
	});

	console.log('here -->',config_json);

	Object.keys(config_json).map((database)=>{
		if(fs.existsSync(config_json[database])){
			con.query('DROP DATABASE IF EXISTS '+database, function (err){
				if (err) throw err;
				con.query('CREATE DATABASE '+database,function(err){
					if (err) throw err;
					importDb(database,config_json[database]);
				});
			});
		}
	});

};

checkDropDb();