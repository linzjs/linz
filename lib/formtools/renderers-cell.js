var moment = require('moment'),
    linz = require('../../');

var dateRenderer = module.exports.date = function dateRenderer(date, record, model, callback) {
    return callback(null, moment(date).format('dd DD/MM/YYYY'));
};

var linkRenderer = module.exports.overviewLink = function overviewLinkRenderer(val, record, model, callback) {
	return callback(null, '<a href="' + linz.get('admin path') + '/' + model + '/' + record._id + '/overview">' + val + '</a>');
};

var arrayRenderer = module.exports.array = function arrayRenderer(val, record, model, callback) {
	var s = '';
	for (var i = 0; i < val.length; i++) {
		s += val[i].toString() + ((i < val.length-1) ? ',<br>' : '');
	}
	return callback(null, s);
};

var defaultRenderer = module.exports.default = function defaultRenderer(val, record, model, callback) {

    if (Array.isArray(val)) {
        return arrayRenderer(val, record, model, callback);
    }

	if (val instanceof Date) {
        return dateRenderer(val, record, model, callback);
    }

	return callback(null, val);

};
