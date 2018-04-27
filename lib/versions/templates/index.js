var fs = require('fs'),
    linz = require('../../../'),
    overview = fs.readFileSync(__dirname + '/overview.html', 'utf-8'),
    compare = fs.readFileSync(__dirname + '/compare.html', 'utf-8');

module.exports.overview = linz.hbs.compile(overview);
module.exports.compare = linz.hbs.compile(compare);
