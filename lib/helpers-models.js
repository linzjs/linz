var path = require('path'),
	fs = require('fs'),
	error = require('./errors'),
	debugModels = require('debug')('linz:models');

exports.loadModels = function loadModels (dir) {

	// add custom types to mongoose
	require('./formtools/extend-types')();

	debugModels('Loading models from directory, %s', dir);

	var dir = path.resolve(process.cwd(), dir),
		files = fs.readdirSync(dir),
		models = [];

	files.forEach(function(file) {
		
		var name = path.basename(file, '.js');
		if (name === 'index') {
			return;
		}

		try {
			models[name] = require(dir + '/' + name);
		} catch (e) {
			debugModels('Error when loading model %s', name);
			return error.log(e.stack + '\n');
		}

		debugModels('Loaded model %s', name);

	});

	return models;

};