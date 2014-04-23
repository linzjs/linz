var path = require('path'),
	fs = require('fs'),
	debugModels = require('debug')('linz:models');

exports.loadModels = function loadModels (dir) {

	// add custom types to mongoose
	require('./formtools/extend-types')();

	var dir = path.resolve(process.cwd(), dir),
		files = fs.readdirSync(dir),
		models = [];

	files.forEach(function(file) {
		
		var name = path.basename(file, '.js');
		if (name === 'index')
			return;

		debugModels('Loaded model %s', name);

		models[name] = require(dir + '/' + name);

	});

	return models;

};