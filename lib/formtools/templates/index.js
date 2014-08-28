var fs = require('fs'),
    handlebars = require('handlebars');

var documents = fs.readFileSync(__dirname + '/documents.html', 'utf-8'),
    overview = {};

overview.summary = fs.readFileSync(__dirname + '/overview/summary.html', 'utf-8');

module.exports.documents = handlebars.compile(documents);
module.exports.overview = {
    summary: handlebars.compile(overview.summary)
};
