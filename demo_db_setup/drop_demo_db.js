var mysql = require('mysql');

var dropDb = function (){	
	var self = this;
	var con = mysql.createConnection({
		'host': 'localhost',
		'user': 'root',
		'password': ''
	});

	con.query("DROP DATABASE IF EXISTS kolkata_flood_monitoring", function (err, result) {
		if (err) throw err;
		// console.log("Droped!");
		con.end();
	});
	
	con.on('end',function(){
		process.exit();		
		
	});
}

dropDb();