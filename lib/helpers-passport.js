var LocalStrategy = require('passport-local').Strategy,
	linz = require('../'),
	debugSession = require('debug')('linz:session');

exports.login = new LocalStrategy('linz-local', function (username, password, done) {

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
        if (user.verifyPassword){

            user.verifyPassword(password, function(err, isMatch) {

              if (err) return done(err);

              if(isMatch) {

                debugSession('Verified credentials for ' + username);
                return done(null, user);

              } else {

                debugSession('Password did not match for user ' + username);
                return done(null, false, { message: 'Invalid password' });

              }

            });

        } else if (!linz.get('verify password')(password, user[linz.get('password key')])) {

            /**
             * To manipulate how a session is modified, create a function called 'verify password'
             * on the Linz configuration object, and it will be executed with the form password and database password
             */

			debugSession('Password did not match for user ' + username);
			return done(null, false);

		}

		debugSession('Verified credentials for ' + username);
		return done(null, user);

	});

});

exports.setupPassport = function (pp) {

	pp.serializeUser(function (user, done) {

		done(null, user.id);

	});

	pp.deserializeUser(function (id, done) {

		var users = linz.mongoose.model(linz.get('user model'));

		users.findById(id).exec(done);

	});

};
