var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

exports.login = new LocalStrategy(function (username, password, done) {

	if (username === 'deglutenous' && password === 'Deglutenous') {

		return done(null, { username: 'deglutenous', id: 'deglutenous' });

	}

	return done(null, false, { message: 'No-op implementation.' });

});

exports.setupPassport = function (pp) {

	passport.serializeUser(function (user, done) {

		done(null, user.id);

	});

	passport.deserializeUser(function (id, done) {

		done(null, { id: id });

	});

};