global.should = require('should');
global.linz = require('../../../');

linz.init({
	'mongo': 'mongodb://127.0.0.1/mongoose-formtools-test',
	'user model': 'user',
	'load models': false
});

// setup a basic user model
var UserSchema = new linz.mongoose.Schema({
	username: String,
	password: String,
	email: String
});

UserSchema.methods.toLabel = function () {
    return this.username;
};

UserSchema.virtual('hasAdminAccess').get(function () {
    return true;
});

var User = linz.mongoose.model('User', UserSchema);

User.label = 'Users';
User.singular = 'User';