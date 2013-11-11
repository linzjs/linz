var moment = require('moment');

var stringRenderer = module.exports.stringRenderer = function (string, record, model) {
	return string;
};

var dateRenderer = module.exports.dateRenderer = function (date, record, model, dateFormat) {
	dateFormat = dateFormat || 'ddd DD/MM/YYYY';
	return moment(date).format(dateFormat);
};

var linkRenderer = module.exports.linkRenderer = function (val, record, model) {
	return '<a href="/admin/' + model + '/' + record.id + '/overview">' + val + '</a>';
};

var arrayRenderer = module.exports.arrayRenderer = function (val, record, model) {
	var s = '';
	for (var i = 0; i < val.length; i++) {
		s += val[i].toString() + ((i < val.length-1) ? ',<br>' : '');
	}
	return s;
};

var defaultRenderer = module.exports.defaultRenderer = function (val, record, model) {

	// some basic logic to determine type, and then provide good default output
	if (typeof val === 'string') return stringRenderer(val, record, model);

	if (Array.isArray(val)) return arrayRenderer(val, record, model);

	if (val instanceof Date) return dateRenderer(val, record, model);

	return val;

};