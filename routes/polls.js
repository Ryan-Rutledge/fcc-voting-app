var router = require('express').Router();

router.get('/', function(req, res) {
	res.send('List of currently open polls');
});

router.post('/', function(req, res) {
	res.send('Creating new poll');
});

router.get('/:id(\\d+)', function(req, res) {
	res.send('Poll with id ' + req.params.id);
});

router.post('/:pid(\\d+)/vote/:vid(\\d+)', function(req, res) {
	res.send('Creating vote ' + req.params.vid + ' for poll ' + req.params.pid);
});

module.exports = router
