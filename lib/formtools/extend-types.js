var mongoose = require.main.require('mongoose'),
	util = require('util');

// Text type
var Text = function Text (path, options) {
    Text.super_.call(this, path, options);
};

// Datetime type
var Datetime = function Datetime (path, options) {
	Datetime.super_.call(this, path, options);
};

var extendTypes = function (debug) {
	
	debug = (debug === undefined) ? false : true;

	// extend types with Text
	util.inherits(Text, mongoose.Schema.Types.String);
	mongoose.Types.Text = String;
	mongoose.Schema.Types.Text = Text;
	if (debug) console.info('linz-formtools: Added type Text to mongoose.');

	// extend types with Datetime
	util.inherits(Datetime, mongoose.Schema.Types.Date);
	mongoose.Types.Datetime = Date;
	mongoose.Schema.Types.Datetime = Datetime;
	if (debug) console.info('linz-formtools: Added type Datetime to mongoose.');

};

module.exports = extendTypes;