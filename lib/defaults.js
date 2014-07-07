
// define all of the defaults for Linz, these can be overriden
var defaults = module.exports = {

	// admin UI
	'admin path': '/admin',
	'admin title': 'Linz',
    'admin forgot password path': '/forgot-your-password',
    'admin password reset path': '/password-reset',
    'admin password pattern': '(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$',
    'admin password pattern help text': 'Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a special character (e.g. ! ~ *) and a number.',

	// models
	'load models': true,

    // configs
    'load configs': true,
    'configs collection name': 'linzconfigs',

	// user model and authentication
	'username key': 'username',
	'password key': 'password',

	// error logging and output
	'error log': console.log,

    'page size': 20,
    'page sizes': [20,50,100,200]

};
