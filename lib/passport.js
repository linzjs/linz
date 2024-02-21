var LocalStrategy = require('passport-local').Strategy,
    linz = require('../'),
    debugSession = require('debug')('linz:session');

// this file is used to provide the default funcitonality for Linz's authentication provided by Passport

// pass in a reference to passport, and this will configure it
module.exports = function(pp) {
    debugSession('Configuring passport');

    // register the serializerUser function
    pp.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // register the deserializerUser function
    pp.deserializeUser(async function(id, done) {
        try {
            const User = linz.mongoose.model(linz.get('user model'));
            const user = await User.findById(id).exec();

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    });

    // default the strategy to use
    pp.use(
        'linz-local',
        new LocalStrategy('linz-local', async function(
            username,
            password,
            done
        ) {
            const User = linz.mongoose.model(linz.get('user model'));
            const find = {};

            find[linz.get('username key')] = username;

            try {
                const user = await User.findOne(find).exec();

                if (!user) {
                    debugSession('Could not find user ' + username);
                    return done(null, false);
                }

                // check if a verifyPassword function is defined for user model
                if (!user.verifyPassword) {
                    debugSession('Verified credentials for ' + username);
                    return done(
                        new Error(
                            'A verifyPassword method was not defined in the user model ' +
                                linz.get('user model')
                        ),
                        false
                    );
                }

                user.verifyPassword(password, function(err, isMatch) {
                    if (err) {
                        return done(err);
                    }

                    if (isMatch) {
                        debugSession('Verified credentials for ' + username);
                        return done(null, user);
                    } else {
                        debugSession(
                            'Password did not match for user ' + username
                        );
                        return done(null, false, 'Invalid password');
                    }
                });
            } catch (err) {
                debugSession('Login error: ' + err);
                return done(err);
            }
        })
    );
};
