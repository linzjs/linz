var moment = require('moment'),
    linz = require('../../');

var dateRenderer = module.exports.date = function dateRenderer(date, record, fieldName, model, callback) {
    return callback(null, moment(date).format('ddd DD/MM/YYYY'));
};

var linkRenderer = module.exports.overviewLink = function overviewLinkRenderer(val, record, fieldName, model, callback) {
	return callback(null, '<a href="' + linz.get('admin path') + '/' + model + '/' + record._id + '/overview">' + val + '</a>');
};

var arrayRenderer = module.exports.array = function arrayRenderer(val, record, fieldName, model, callback) {
	var s = '';
	for (var i = 0; i < val.length; i++) {
		s += val[i].toString() + ((i < val.length-1) ? ',<br>' : '');
	}
	return callback(null, s);
};

var booleanRenderer = module.exports.boolean = function booleanRenderer(val, record, fieldName, model, callback) {
    return callback(null, val ? "Yes" : "No");
}

var referenceRenderer = module.exports.reference = function referenceRenderer (val, record, fieldName, model, callback) {

    if (linz.mongoose.models[linz.mongoose.model(model).schema.tree[fieldName].ref].findForReference) {
        return linz.mongoose.models[linz.mongoose.model(model).schema.tree[fieldName].ref].findForReference(val,callback);
    }

    linz.mongoose.models[linz.mongoose.model(model).schema.tree[fieldName].ref].findById(val, function (err, doc) {
        return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));
    });

}

var urlRenderer = module.exports.url = function urlRenderer(val, record, fieldName, model, callback) {
    var url = val,
        regex = new RegExp(/^http/i);

    if (url.match(regex) === null) {
        url = 'http://' + url;
    }

    return callback(null, '<a href="' + url + '" target="_blank">' + val + '</a>');
};

var defaultRenderer = module.exports.default = function defaultRenderer(val, record, fieldName, model, callback) {

    if (Array.isArray(val)) {
        return arrayRenderer(val, record, fieldName, model, callback);
    }

	if (val instanceof Date) {
        return dateRenderer(val, record, fieldName, model, callback);
    }

    if ( typeof val === 'boolean') {
        return booleanRenderer(val, record, fieldName, model, callback);
    }

    // check if val is a url
    var regex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
    if ( typeof val === 'string' && val.match(regex)) {
        return urlRenderer(val, record, fieldName, model, callback);
    }

    // check if field is a reference document
    if (linz.mongoose.model(model).schema.tree[fieldName] && linz.mongoose.model(model).schema.tree[fieldName].ref) {

        return referenceRenderer(val, record, fieldName, model, callback);

    }

	return callback(null, val);

};
