
var Linz = require('./lib/linz'),
	application = require('./lib/application');

exports = module.exports = createLinz;

function createLinz() {

	var linz = new Linz();
	merge(linz, application);
	linz.init();
	return linz;

}

merge = function(a, b){
	if (a && b) {
		for (var key in b) {
			a[key] = b[key];
		}
	}
	return a;
};

// module.exports.Linz = require('./lib/linz');
module.exports.formtools = require('./lib/formtools/');
module.exports.formtools.extendTypes = require('./lib/formtools/extend-types');
module.exports.formtools.cellRenderers = require('./lib/formtools/renderers-cell');