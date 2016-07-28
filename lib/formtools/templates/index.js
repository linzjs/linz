var fs = require('fs'),
    handlebars = require('handlebars'),
    path = require('path');

var documents = fs.readFileSync(path.resolve(__dirname, 'documents.html'), 'utf-8');

module.exports.documents = handlebars.compile(documents);
