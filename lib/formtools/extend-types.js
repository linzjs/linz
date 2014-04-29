var linz = require('../../'),
	util = require('util'),
	debug = require('debug')('linz:formtools');

// Text type
var Text = function Text (path, options) {
    Text.super_.call(this, path, options);
};

// Datetime type
var Datetime = function Datetime (path, options) {
	Datetime.super_.call(this, path, options);
};

// Password type
var Password = function Password (path, options) {
	Password.super_.call(this, path, options);
};

var extendTypes = module.exports = function extendTypes () {

	// extend types with Text
	util.inherits(Text, linz.mongoose.Schema.Types.String);
	linz.mongoose.Types.Text = String;
	linz.mongoose.Schema.Types.Text = Text;
	debug('Added type \'Text\' to mongoose');

	// extend types with Datetime
	util.inherits(Datetime, linz.mongoose.Schema.Types.Date);
	linz.mongoose.Types.Datetime = Date;
	linz.mongoose.Schema.Types.Datetime = Datetime;
	debug('Added type \'Datetime\' to mongoose');

	// extend types with Password
	util.inherits(Password, linz.mongoose.Schema.Types.String);
	linz.mongoose.Types.Password = String;
	linz.mongoose.Schema.Types.Password = Password;
	debug('Added type \'Password\' to mongoose');

};