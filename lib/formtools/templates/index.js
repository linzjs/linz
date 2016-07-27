var handlebars = require('handlebars'),
    path = require('path');

var documents = path.resolve(__dirname, '/documents.html');

module.exports.documents = handlebars.compile(documents);
