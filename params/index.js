var fs = require('fs'),
	path = require('path'),
	files = fs.readdirSync(__dirname);

// load in each file within this directory and attach it to exports
files.forEach(function(file) {

	var name = path.basename(file, '.js');

	if (name === 'index') return;

	module.exports[name] = require('./' + name);

});
