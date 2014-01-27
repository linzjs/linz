var path = require('path'),
	fs = require('fs'),
	extendTypes = require('./extend-types');

// add custom types, so that when we load the models,
// mongoose doesn't complain about not know the type
extendTypes(true);

module.exports = function (dir) {

	var dir = path.resolve(process.cwd(), dir),
		files = fs.readdirSync(dir),
		models = [];

	files.forEach(function(file) {
		
		var name = path.basename(file, '.js');
		if (name === 'index')
			return;

		models[name] = require(dir + '/' + name);

	});

	return models;

};