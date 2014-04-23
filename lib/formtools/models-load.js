var path = require('path'),
	fs = require('fs'),
	debugModels = require('debug')('linz:models');

// add custom types to mongoose
require('./extend-types')(true);

module.exports = function (dir) {

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