var path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	linz = require('../');

exports.linz = function () {

	return function (req, res, next) {

		// handy references to anything linz
		req.linz = linz;

		// the linz views directory for admin views
		req.linz.views = path.resolve(__dirname, '..', 'views');

		next();

	};

};

exports.login = new LocalStrategy(function (username, password, done) {

	if (username === 'deglutenous' && password === '10oct2012') {

		return done(null, { username: 'deglutenous' });

	}

	return done(null, false, { message: 'No-op implementation.' });

});