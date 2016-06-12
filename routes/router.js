var router = require('express').Router();
var controller = require('../controller');

router.use('/auth', require('./auth'));
router.use('/polls', require('./polls'));

router.get(['/', '/index', '/index.html'], function(req, res) {
	console.log(req.user);
	res.render('../templates/index');
});

router.get('/dashboard', function(req, res) {
	res.send('Personal dashboard');
});

module.exports = router
