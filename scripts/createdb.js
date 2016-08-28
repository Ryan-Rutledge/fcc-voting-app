require('dotenv').config();

var fs = require('fs');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(process.env.DB_NAME);

fs.readFile('./db/createdb.sql', 'utf8', function(err, data) {
	if (err) return console.log(err);

	db.exec(data, function() {
		db.close();
	});
});
