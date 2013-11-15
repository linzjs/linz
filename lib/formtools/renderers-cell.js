var moment = require('moment');

var stringRenderer = module.exports.stringRenderer = function (string, record, model, linz) {
	return string;
};

var dateRenderer = module.exports.dateRenderer = function (date, record, model, dateFormat, linz) {

	if (typeof dateFormat === 'object') {
		linz = dateFormat;
		dateFormat = undefined;
	}
	dateFormat = dateFormat || 'ddd DD/MM/YYYY';
	return moment(date).format(dateFormat);
};

var linkRenderer = module.exports.linkRenderer = function (val, record, model, linz) {
	return '<a href="' + linz.get('admin path') + '/' + model + '/' + record.id + '/overview">' + val + '</a>';
};

var arrayRenderer = module.exports.arrayRenderer = function (val, record, model, linz) {
	var s = '';
	for (var i = 0; i < val.length; i++) {
		s += val[i].toString() + ((i < val.length-1) ? ',<br>' : '');
	}
	return s;
};

var defaultRenderer = module.exports.defaultRenderer = function (val, record, model, linz) {

	// some basic logic to determine type, and then provide good default output
	if (typeof val === 'string') return stringRenderer(val, record, model, linz);

	if (Array.isArray(val)) return arrayRenderer(val, record, model, linz);

	if (val instanceof Date) return dateRenderer(val, record, model, null, linz);

	return val;

};