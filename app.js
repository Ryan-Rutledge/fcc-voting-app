var app = require('express')();
//var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

// Middleware
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// Routes
app.use('/', require('./routes/router'));

// Start server
app.listen(PORT, function() {
	console.log('Listening on port', PORT);
});
