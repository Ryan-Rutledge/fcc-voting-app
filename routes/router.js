var router = require('express').Router();
var controller = require('../controller');

router.use('/auth', require('./auth'));
router.use('/polls', require('./polls'));

router.get(['/', '/index', '/index.html'], function(req, res) {
	if (req.user)
		controller.get.userPolls(req.user.id, function(polls) {
			console.log(polls);
			res.render('dashboard', { polls: polls });
		});
	else
		res.redirect('/polls');
});

module.exports = router
