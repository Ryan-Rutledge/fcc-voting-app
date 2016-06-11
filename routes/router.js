var router = require('express').Router();

router.use('/polls', require('./polls'));

router.get(['/', '/index', '/index.html'], function(req, res) {
	res.send('Home Page');
});

router.get('/dashboard', function(req, res) {
	res.send('Personal dashboard');
});

module.exports = router
