var mongoose = require.main.require('mongoose'),
	util = require('util');

// Text type
var Text = function Text (path, options) {
    Text.super_.call(this, path, options);
};

var extendTypes = function (debug) {
	
	debug = (debug == undefined) ? false : true;

	// extend types with Text
	util.inherits(Text, mongoose.Schema.Types.String);
	mongoose.Types.Text = String;
	mongoose.Schema.Types.Text = Text;

	if (debug) console.info('mongoose-formtools: Added type Text to mongoose.');

}

module.exports = extendTypes;