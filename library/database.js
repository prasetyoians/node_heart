let mysql = require('mysql');

let connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	pass : '',
	database : 'ceks',
});

connection.connect(function(error){
	if (!!error) {
		console.log("gagal");
	}else{
		console.log('berhasil konek');
	}
})

module.exports = connection;