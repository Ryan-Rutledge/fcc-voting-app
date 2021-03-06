'use strict';

var fs = require('fs');
var sqlite3 = require('sqlite3')
var db = new sqlite3.Database(process.env.DB_NAME);

var query = {};
query.get = {
	user: db.prepare('SELECT * FROM users WHERE id=?;'),
	poll: db.prepare('SELECT * FROM polls WHERE id=?;'),
	vote: db.prepare("SELECT v.id AS 'id', t.name AS 'term' FROM votes v, terms t WHERE v.term_id=t.id AND t.poll_id=? AND v.identifier=?;"),
	everypoll: db.prepare('SELECT * FROM polls ORDER BY name;'),
	userPolls: db.prepare('SELECT * FROM polls WHERE user_id=? ORDER BY name;'),
	pollTerms: db.prepare('SELECT * FROM terms WHERE poll_id=? ORDER BY name;'),
	pollVotes: db.prepare("SELECT t.name AS 'term', COUNT(v.id) AS 'count' FROM votes v, (SELECT * FROM terms WHERE poll_id in (SELECT id FROM polls WHERE id=?)) t WHERE v.term_id = t.id GROUP BY term_id;"),
	termVotes: db.prepare('SELECT * FROM votes WHERE term_id=?;')
};
query.set = {
	user: db.prepare('INSERT INTO users(id, name) VALUES(?, ?);'),
	poll: db.prepare('INSERT INTO polls(user_id, name) VALUES(?, ?);'),
	term: db.prepare('INSERT INTO terms(poll_id, name) VALUES(?, ?);'),
	vote: db.prepare('INSERT INTO votes(term_id, identifier) VALUES(?, ?);')
}
query.del = {
	poll: db.prepare('DELETE FROM polls WHERE id=?'),
}

function handle(cb) {
	return function(err, results) {
		if (err) console.error(err);
		if (cb) cb.call(this, results);
	}
}

function getUser(user_id, cb) {
	query.get.user.get(user_id, handle(cb));
}

function setUser(user_id, name, cb) {
	query.set.user.run(user_id, name,
		handle(function() {
			cb(this.lastID);
		})
	);
}

function findOrCreateUser(user_id, name, cb) {
	query.get.user.get(user_id, handle(function(user) {
		if (user) return cb(user);

		setUser(user_id, name, function(user_id) {
			getUser(user_id, cb);
		});
	}))
}

function getPoll(poll_id, cb) {
	query.get.poll.get(poll_id, handle(cb))
}

function getEveryPoll(cb) {
	query.get.everypoll.all(handle(cb));
}

function getVote(poll_id, identifier, cb) {
	query.get.vote.get(poll_id, identifier, handle(cb))
}

function getUserPolls(user_id, cb) {
	query.get.userPolls.all(user_id, handle(cb));
}

function getPollTerms(poll_id, cb) {
	query.get.pollTerms.all(poll_id, handle(cb));
}

function getTermVotes(term_id, cb) {
	query.get.termVotes.all(term_id, handle(cb));
}

function getPollVotes(poll_id, cb) {
	query.get.pollVotes.all(poll_id, handle(cb));
}

function setPollTerm(poll_id, name, cb) {
	query.set.term.run(poll_id, name, handle(function() {
		cb(this.lastID);
	}));
}

function setTermVote(term_id, id, cb) {
	query.set.vote.run(term_id, id, handle(function() {
		cb(this.lastID);
	}));
}

function createPoll(user_id, name, terms, cb) {
	query.set.poll.run(user_id, name,
		handle(function(poll_id) {
			var poll_id = this.lastID;

			for (let i = terms.length - 1; i >= 0; i--) {
				setPollTerm(poll_id, terms[i], function() {
					if (i === 0) return cb(poll_id);
				});
			}
		})
	);
}

function deletePoll(poll_id, cb) {
	query.del.poll.run(poll_id, handle(cb));
}

module.exports = {
	findOrCreateUser: findOrCreateUser,
	get: {
		poll: getPoll,
		user: getUser,
		vote: getVote,
		everyPoll: getEveryPoll,
		userPolls: getUserPolls,
		pollTerms: getPollTerms,
		termVotes: getTermVotes,
		pollVotes: getPollVotes
	},
	set: {
		poll: createPoll,
		pollTerm: setPollTerm,
		termVote: setTermVote
	},
	del: {
		poll: deletePoll,
	}
};
