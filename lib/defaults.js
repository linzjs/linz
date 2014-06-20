
// define all of the defaults for Linz, these can be overriden
var defaults = module.exports = {

	// admin UI
	'admin path': '/admin',
	'admin title': 'Linz',

	// models
	'load models': true,

    // configs
    'load configs': true,
    'configs collection name': 'linzconfig',

	// user model and authentication
	'username key': 'username',
	'password key': 'password',

	// error logging and output
	'error log': console.log

};
