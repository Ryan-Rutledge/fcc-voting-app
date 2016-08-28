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
		if (!poll) return res.status(404).render('404');
		
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

router.get('/:id(\\d+)/delete', loggedIn, function(req, res) {
	// Get poll info
	controller.get.poll(req.params.id, function(poll) {
		// If logged in user is not the owner
		if (poll.user_id !== req.user.id) return res.redirect('/');

		controller.del.poll(req.params.id, function() {
			return res.redirect('/');
		});
		
	});

});

router.get('/:id(\\d+)/votes', function(req, res) {
	controller.get.pollVotes(req.params.id, function(votes) {
		res.json(votes || []);
	});
});

function vote(req, res, user_id, poll_id, term_id) {
	poll_id = parseInt(poll_id);
	term_id = parseInt(term_id);

	var redirect_url = '/polls/' + poll_id;

	if (!term_id) return res.redirect(redirect_url);

	// Check if that user has already voted
	controller.get.vote(poll_id, user_id, function(vote) {
		if (vote !== undefined) return res.redirect(redirect_url);

		// Add vote to poll
		controller.set.termVote(term_id, user_id, function() {
			return res.redirect(redirect_url);
		});
	});
}

router.post('/:id(\\d+)/votes', function(req, res) {
	vote(req, res, req.identifier, req.params.id, req.body.vote);
});

router.post('/:id(\\d+)/terms', loggedIn, function(req, res) {
	console.log(req.body.term);
	var redirect_url = '/polls/' + req.params.id;
	if (!req.body.term) return res.redirect(redirect_url);
	
	controller.set.pollTerm(parseInt(req.params.id), req.body.term, function(term_id) {
		vote(req, res, req.identifier, req.params.id, term_id);
	});
});

module.exports = router
