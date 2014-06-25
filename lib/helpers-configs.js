var path = require('path'),
	fs = require('fs'),
	error = require('./errors'),
	debugConfigs = require('debug')('linz:configs');

exports.loadConfigs = function loadConfigs (dir) {

	debugConfigs('Loading configs from directory, %s', dir);

	var dir = path.resolve(process.cwd(), dir),
		files = [],
		configs = [];

    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        debugConfigs('Error: Unable to load configs from directory, %s', dir);
        error.log(e.stack + '\n');
        return configs;
    }

	files.forEach(function(file) {

		var name = path.basename(file, '.js');
		if (name === 'index') {
			return;
		}

		try {
			configs[name] = {
                schema: require(dir + '/' + name),
                modelName: 'config'
            };
		} catch (e) {
			debugConfigs('Error when loading config %s', name);
			return error.log(e.stack + '\n');
		}

		debugConfigs('Loaded config %s', name);

	});

	return configs;

};
