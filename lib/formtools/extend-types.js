var linz = require('../../'),
    util = require('util'),
    debug = require('debug')('linz:formtools');

// Text type
var Text = function Text(path, options) {
    Text.super_.call(this, path, options);
};

// Password type
var Password = function Password(path, options) {
    Password.super_.call(this, path, options);
};

// Email type
var Email = function Email(path, options) {
    Email.super_.call(this, path, options);
};

// Tel type
var Tel = function Tel(path, options) {
    Tel.super_.call(this, path, options);
};

// URL type
var URL = function URL(path, options) {
    URL.super_.call(this, path, options);
};

// Digit type
var Digit = function Digit(path, options) {
    Digit.super_.call(this, path, options);
};

var extendTypes = (module.exports = function extendTypes() {
    // extend types with Text
    util.inherits(Text, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.Text = String;
    linz.mongoose.Schema.Types.Text = Text;
    debug("Added type 'Text' to mongoose");

    // extend types with Password
    util.inherits(Password, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.Password = String;
    linz.mongoose.Schema.Types.Password = Password;
    debug("Added type 'Password' to mongoose");

    // extend types with Email
    util.inherits(Email, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.Email = String;
    linz.mongoose.Schema.Types.Email = Email;
    debug("Added type 'Email' to mongoose");

    // extend types with Tel
    util.inherits(Tel, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.Tel = String;
    linz.mongoose.Schema.Types.Tel = Tel;
    debug("Added type 'Tel' to mongoose");

    // extend types with URL
    util.inherits(URL, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.URL = String;
    linz.mongoose.Schema.Types.URL = URL;
    debug("Added type 'URL' to mongoose");

    // extend types with Digit
    util.inherits(Digit, linz.mongoose.Schema.Types.String);
    linz.mongoose.Types.Digit = String;
    linz.mongoose.Schema.Types.Digit = Digit;
    debug("Added type 'Digit' to mongoose");
});
