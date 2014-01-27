var mongoose = require.main.require('mongoose'),
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

var extendTypes = function () {

	// extend types with Text
	util.inherits(Text, mongoose.Schema.Types.String);
	mongoose.Types.Text = String;
	mongoose.Schema.Types.Text = Text;
	debug('Added type \'Text\' to mongoose.');

	// extend types with Datetime
	util.inherits(Datetime, mongoose.Schema.Types.Date);
	mongoose.Types.Datetime = Date;
	mongoose.Schema.Types.Datetime = Datetime;
	debug('Added type \'Datetime\' to mongoose.');

};

module.exports = extendTypes;