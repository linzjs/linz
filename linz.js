
var Linz = require('./lib/linz'),
	application = require('./lib/application'),
	utils = require('./lib/utils');

function createLinz(expressApp, models, options) {

	if (!expressApp) throw new Error('You must pass an express app to Linz.');

	models = models || {};
	options = options || {};

	var linz = new Linz(expressApp, models, options);
	utils.merge(linz, application);
	linz.init();
	return linz;

}

exports = module.exports = createLinz;
module.exports.formtools = require('./lib/formtools/');
module.exports.formtools.extendTypes = require('./lib/formtools/extend-types');
module.exports.formtools.cellRenderers = require('./lib/formtools/renderers-cell');