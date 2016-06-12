DROP TABLE IF EXISTS users;
CREATE TABLE users(
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	username TEXT
);

DROP TABLE IF EXISTS polls;
CREATE TABLE polls(
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	user_id NOT NULL REFERENCES users(id),
	name TEXT
);

DROP TABLE IF EXISTS terms;
CREATE TABLE terms(
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	poll_id NOT NULL REFERENCES polls(id),
	name TEXT
);

DROP TABLE IF EXISTS votes;
CREATE TABLE votes(
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	user_id REFERENCES users(id),
	ip_address TEXT,
	term_id REFERENCES polls(id)
);