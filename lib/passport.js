var LocalStrategy = require('passport-local').Strategy,
	linz = require('../'),
	debugSession = require('debug')('linz:session');

// this file is used to provide the default funcitonality for Linz's authentication provided by Passport

// pass in a reference to passport, and this will configure it
module.exports = function (pp) {

    debugSession('Configuring passport');

	// register the serializerUser function
	pp.serializeUser(function (user, done) {

		done(null, user.id);

	});

	// register the deserializerUser function
	pp.deserializeUser(function (id, done) {

		var users = linz.mongoose.model(linz.get('user model'));

		users.findById(id).exec(done);

	});

	// default the strategy to use
	pp.use('linz-local', new LocalStrategy('linz-local', function (username, password, done) {

		var users = linz.mongoose.model(linz.get('user model')),
			find = {};

		find[linz.get('username key')] = username;


	    users.findOne(find).exec(function (err, user) {

			if (err) {
				debugSession('Login error: ' + err);
				return done(err);
			}

			if (!user) {
				debugSession('Could not find user ' + username);
				return done(null, false);
			}

	        // check if a verifyPassword function is defined for user model
	        if (!user.verifyPassword){

	            debugSession('Verified credentials for ' + username);
	            return done(new Error('A verifyPassword method was not defined in the user model ' + linz.get('user model')), false);

	        }

	        user.verifyPassword(password, function(err, isMatch) {

	            if (err) {
	                return done(err);
	            }

	            if(isMatch) {

	                debugSession('Verified credentials for ' + username);
	                return done(null, user);

	            } else {

	                debugSession('Password did not match for user ' + username);
	                return done(null, false, 'Invalid password');

	            }

	        });

		});

	}));

};
