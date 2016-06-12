'use strict';

var fs = require('fs');
var sqlite3 = require('sqlite3')
var db = new sqlite3.Database(process.env.DB_NAME);

var query = {};
query.get = {
	poll: db.prepare('SELECT * FROM polls WHERE id=?;'),
	user: db.prepare('SELECT * from users WHERE id=?;'),
	everypoll: db.prepare('SELECT * FROM polls;'),
	userPolls: db.prepare('SELECT * FROM polls WHERE user_id=?;'),
	pollTerms: db.prepare('SELECT * FROM terms WHERE poll_id=?;'),
	pollVotes: db.prepare('SELECT * FROM votes WHERE term_id in (SELECT id FROM terms WHERE poll_id=?);'),
	termVotes: db.prepare('SELECT * FROM votes WHERE term_id=?;'),
	lastID: db.prepare('SELECT last_insert_rowid() as id;')
};
query.set = {
	user: db.prepare('INSERT INTO users(id, name) VALUES(?, ?);'),
	poll: db.prepare('INSERT INTO polls(user_id, name) VALUES(?, ?);'),
	term: db.prepare('INSERT INTO terms(poll_id, name) VALUES(?, ?);'),
	vote: db.prepare('INSERT INTO votes(term_id, user_id, ip_address) VALUES(?, ?, ?);'),
}

function handle(cb, index) {
	return function(err, results) {
		if (err) console.error(err);
		cb(index ? (results && results[index]):index);
	}
}

function getLastID(cb) {
	return function(id) {
		query.get.lastID.run(handle(cb));
	}
}

function findOrCreateUser(user_id, name, cb) {
	query.get.user.run(user_id, handle(function(users) {
		if (users && users[0]) return cb(users[0]);
		
		query.set.user.run(user_id, name, handle(function() {
			cb({ id: user_id, name: name });
		}));
	}))
}

function getPoll(cb) {
	query.get.poll.run(handle(cb, 0))
}

function getEveryPoll(cb) {
	query.get.everypoll.run(handle(cb));
}

function getUserPolls(user_id, cb) {
	query.get.userPolls.run(user_id, handle(cb));
}

function getPollTerms(poll_id, cb) {
	query.get.pollTerms.run(poll_id, handle(cb));
}

function getTermVotes(term_id, cb) {
	query.get.termVotes.run(term_id, handle(cb));
}

function getPollVotes(poll_id, cb) {
	query.get.pollVotes.run(poll_id, handle(cb));
}

function setPollTerm(poll_id, name, cb) {
	query.set.term.run(poll_id, name, handle(getLastID(cb)));
}

function setTermVote(term_id, cb) {
	query.set.vote.run(term_id, name, handle(getLastID(cb)));
}

function createPoll(user_id, name, cb) {
	query.set.poll.run(user_id, name, handle(
		getLastID(function(poll_id) {
			for (let i = terms.length - 1; i >= 0; i--) {
				setPollTerm(poll_id, function() {
					if (i === 0) return cb(poll_id);
				});
			}
		})
	));
}

module.export = {
	findOrCreateUser: findOrCreateUser,
	get: {
		poll: getPoll,
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
	}
};
