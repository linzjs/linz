var path = require('path'),
    fs = require('fs'),
    handlebars = require('handlebars');

var template = fs.readFileSync(__dirname + '/summary.html', 'utf-8');

module.exports.summary = handlebars.compile(template);
