var app = require('express')();
var session = require('express-session');
var passport = require('passport');
//var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

// Middleware
app.set('view engine', 'pug');

app.use(session({
	secret: process.env.COOKIE_SECRET,
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// Routes
app.use('/', require('./routes/router'));

// Start server
app.listen(PORT, function() {
	console.log('Listening on port', PORT);
});
