var router = require('express').Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var findOrCreateUser = require('../controller').findOrCreateUser;

passport.use(
	new GoogleStrategy({
		clientID: process.env.GOOGLE_ID,
		clientSecret: process.env.GOOGLE_SECRET,
		callbackURL: process.env.HOST_NAME + '/auth/google/callback'
	},
	function(token, tokenSecret, profile, done) {
		findOrCreateUser(profile.id, profile.name.givenName || profile.displayName, function(user) {
			return done(null, user);
		});
	})
);

router.get('/google',
	passport.authenticate('google', { scope: ['openid'] })
);

router.get('/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/'
	})
);

module.exports = router
