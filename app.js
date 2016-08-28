var express = require('express');
var app = express();
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

// Middleware
app.set('views', './templates');
app.set('view engine', 'pug');

app.use(session({
	secret: process.env.COOKIE_SECRET,
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Create global template variables
app.use(function(req, res, next) {
	if (req.user) req.app.locals.user = req.user;
	else req.app.locals.user = undefined;

	next();
});

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

// Create ids for unauthenticated users
app.use(function(req, res, next) {
	req.identifier = req.user ? req.user.id:(req.headers['x-forwarded-for'] || req.ip);
	next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/', require('./routes/router'));

app.use(function(req, res) {
	res.status(404).render('404');
});

// Start server
app.listen(PORT, function() {
	console.log('Listening on port', PORT);
});
