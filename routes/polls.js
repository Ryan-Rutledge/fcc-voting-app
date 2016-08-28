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
	if (req.body.name) {
		// Filter terms
		var terms = (req.body.terms || [])
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
		if (!poll) return res.render('404');

		// Get poll owner
		controller.get.user(poll.user_id, function(user) {
			poll.user = user;
			// Get poll terms
			controller.get.pollTerms(poll.id, function(terms) {
				poll.terms = terms;
				// Check if the user has already voted in this poll
				controller.get.vote(poll.id, req.identifier, function(vote) {
					poll.vote = vote || {};
					res.render('poll', { poll: poll });
				})
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
	var redirect_url = '/polls/' + req.params.id;

	if (!req.body.vote) return res.redirect(redirect_url);

	// Check if that user has already voted
	controller.get.vote(parseInt(req.params.id), req.identifier, function(vote) {
		if (vote !== undefined) return res.redirect(redirect_url);

		// Add vote to poll
		controller.set.termVote(req.body.vote, req.identifier, function() {
			return res.redirect(redirect_url);
		});
	});

});

module.exports = router
