var fs = require('fs'),
    handlebars = require('handlebars');

var documents = fs.readFileSync(__dirname + '/documents.html', 'utf-8');

module.exports.documents = handlebars.compile(documents);
