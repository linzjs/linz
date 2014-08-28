var fs = require('fs'),
    handlebars = require('handlebars'),
    linz = require('../../../');

var overview = fs.readFileSync(__dirname + '/overview.html', 'utf-8');

module.exports.overview = linz.hbs.compile(overview);
