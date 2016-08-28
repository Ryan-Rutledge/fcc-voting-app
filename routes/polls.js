var router = require('express').Router();
var controller = require('../controller');
var loggedIn = require('../access_control').loggedIn;

router.get('/', function(req, res) {
	controller.get.everyPoll(function(polls) {
		res.render('polls', { polls: polls || [] });
	});
});

router.get('/new', loggedIn, function(req, res) {
	res.render('createPoll');
});

router.post('/', loggedIn, function(req, res) {
	// If input is valid
	if (
		req.body.name && (
			req.body.term1 ||
			req.body.term2 ||
			req.body.term3 ||
			req.body.term4 ||
			req.body.term5
		)
	) {

		// Filter terms
		var terms = [
			req.body.term1,
			req.body.term2,
			req.body.term3,
			req.body.term4,
			req.body.term5
		]
			.filter(function(term) { return !!term; })
			.map(function(term) { return term.trim(); });

		controller.set.poll(req.user.id, req.body.name, terms,
			function(poll_id) {
				res.redirect('/polls/' + poll_id);
			}
		);
	}
	else {
		res.sendStatus(403);
	}
});

router.get('/:id(\\d+)', function(req, res) {
	// Get poll
	controller.get.poll(req.params.id, function(poll) {
		console.log(poll);
		if (!poll) return res.render('404');

		// Get poll owner
		controller.get.user(poll.user_id, function(user) {
			poll.user = user;
			// Get poll terms
			controller.get.pollTerms(poll.id, function(terms) {
				console.log(terms);
				poll.terms = terms;
				res.render('poll', { poll: poll });
			});
		});
	});
});

router.get('/:id(\\d+)/votes', function(req, res) {
	controller.get.pollVotes(req.params.id, function(votes) {
		res.json(votes || []);
	});
});

router.post('/:id(\\d+)/votes', function(req, res) {
	if (!req.body.vote) res.redirect('/polls/' + req.params.id);

	controller.set.termVote(req.body.vote, req.identifier, function() {
		res.redirect('/polls/' + req.params.id);
	});
});

module.exports = router
