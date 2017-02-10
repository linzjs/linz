var linz = require('../'),
    async = require('async'),
    moment = require('moment');

var modelExportHelpers = function modelExportHelpers (req, res) {

    var prettifyData = function prettifyData (fieldName, val) {

        if (val === undefined || val === '' || val === null) {
            return val;
        }

        if (typeof val === 'number') {
            return val;
        }

        var Model = req.linz.model;

        if (fieldName && Model.schema.tree[fieldName].ref) {
            return val.title;
        }

        if (Array.isArray(val)) {

            if (val.length === 0) {
                return '';
            }

            var strArr = [];

            val.forEach(function (obj) {

                if (typeof obj === 'object') {

                    var arr = [];

                    // tostring embedded object
                    Object.keys(obj).forEach(function (key) {

                        if (key === '_id' || key === 'id' || key === 'dateModified' || key === 'dateCreated' || obj[key] === '' || obj[key] === undefined) {
                            return;
                        }

                        return arr.push(key + ': ' + obj[key].toString());

                    });

                    return strArr.push(arr.join(', '));

                }

                return strArr.push(obj.toString());

            });

            return strArr.join(', ');

        }

        if (typeof val === 'boolean' || 'true,false,yes,no'.indexOf(val) >= 0 ) {
            return (linz.utils.asBoolean(val) ? 'Yes' : 'No');
        }

        if (typeof val === 'object') {

            if (!fieldName || !Model.linz.formtools.form[fieldName].exportTransform) {
                return val;
            }

            return Model.linz.formtools.form[fieldName].exportTransform(val);

        }

        return val;

    };

    // The job of this function is to recursively loop through an object (including nested object)
    // and return a simple object with key:value, where value is not an object.
    // i.e Object being returned will not contain any nested object within it.
    // Example: getData({ k1: v1, k2: { k2-k1: k2-k1-v1, k2-k2: k2-k2-v2 }, k3: v3 }) will return following:
    // { k1: v1, k2-k1: k2-k1-v1, k2-k2: k2-k2-v2, k3: v3 }
    var getData = function (obj) {

        let keyVal = {};

        function recur(data) {

            Object.keys(data).forEach(function(key) {

                // key here is not a form field, so we pass '' to "fieldName" parameter of prettifyData
                let val = prettifyData('', data[key]);

                if (typeof val === 'object' && Object.keys(val).length) {
                    return recur(val);
                }

                keyVal[key] = val;

            });

            return keyVal;

        }

        return recur(obj);

    };

    // This function first, orders the fields of the record in the order in which user has selected them to be exported to CSV,
    // and then returns the record data into CSV format.
    // It will also return Headers with record data in CSV format, if value of 1 is provided as recordIndex parameter.
    var getRecordData = function getRecordData (fields, record, form, recordIndex) {

        let orderedRecord = {};

        // order field names in the selected order
        fields.forEach(function (fieldName) {

            let val = prettifyData(fieldName, record[fieldName]);

            if (!val || typeof val !== 'object') {

                orderedRecord[fieldName] = val;

                return;

            }

            // val is an object, iterate through object to add each key and its value (including embedded) to orderedRecord
            let data = getData(val);

            Object.keys(data).forEach(function(key) {
                orderedRecord[key] = data[key];
            });

        });

        // pass form to json2CSV method to add headers only when json2CSV is called first time
        if (recordIndex === 1) {
            return linz.utils.json2CSV(orderedRecord, form);
        }

        return linz.utils.json2CSV(orderedRecord);

    };

    return {

        mongooseToCSV: function mongooseToCSV (fields, form) {

            var count = 0;

            return function (doc) {

                // count is used by getRecordData to return headers together with record data in CSV format when count is 1
                count++;

                var record = doc.toObject({virtuals: true });

                return getRecordData(fields, record, form, count);

            };

        },

        getFilters: function getFilters (cb) {

            if (!req.body.filters.length) {
                return cb(null, {});
            }

            var Model = req.linz.model,
                form = JSON.parse(req.body.filters);

            // check if there are any filters in the form post
            if (!form.selectedFilters) {
                return cb(null, {});
            }

            async.waterfall([

                function (callback) {

                    Model.getGrid(req.user, function (err, grid) {

                        if (err) {
                            return cb(err);
                        }

                        return callback(null, grid);

                    });
                },

                function (grid, callback) {

                    var filters = {};

                    async.each(form.selectedFilters.split(','), function (fieldName, filtersDone) {

                        // call the filter renderer and update the content with the result
                        grid.filters[fieldName].filter.filter(fieldName, form, function (err, result) {

                            if (err) {
                                return filtersDone(err);
                            }

                            filters = Model.addSearchFilter(filters, result);

                            return filtersDone(null);

                        });

                    }, function (err) {

                        if (err) {
                            return cb(err);
                        }

                        // consolidate filters into query
                        if (Object.keys(filters).length) {
                            filters = Model.setFiltersAsQuery(filters);
                        }

                        return cb(err, filters);

                    });

                }

            ]);

        },

        addIdFilters: function addIdFilters (filters, cb) {

            if (!req.body.selectedIds.length) {
                return cb(null, filters);
            }

            filters = filters || { '$and': [] };
            filters['$and'] = filters['$and'] || [];

            var ids = [],
                db = linz.mongoose.connection.db;

            // compile ids into ObjectId type
            req.body.selectedIds.split(',').forEach(function (id) {
                ids.push(new db.bsonLib.ObjectID(id));
            });

            // let's add selected Ids to the filters
            filters['$and'].push({
                _id: { $in: ids}
            });

            return cb(null, filters);

        },

        getForm: function getForm(filters, cb) {

            req.linz.model.getForm(req.user, function (err, form) {
                return cb(err, filters, form);
            });

        },

        getGrid: function getGrid (filters, form, cb) {

            req.linz.model.getGrid(req.user, function (err, grid) {
                return cb(err, filters, form, grid);
            });

        }

    };

};

// this will retrieve the export object, using Linz's default export handler amongst custom export handlers
// this is based on the knowledge that only Linz's default export handler can have an `action` of `export`
// `exports` should be model.grid.export
var getExport = function (exports) {

    var exp = undefined;

    // retrieve the export object
    exports.forEach(function (_export) {

        // Linz's default export function is called export
        if (_export.action && _export.action === 'export') {
            exp = _export;
        }

    });

    // if the export object could not be found, throw an error
    if (!exp) {
        throw new Error('The export was using Linz default export method, yet the model\'s grid.export object could not be found.');
    }

    return exp;

};

module.exports = {

    get: function (req, res, next) {

        req.linz.model.getGrid(req.user, function (err, grid) {

            if (err) {
                return next(err);
            }

            // attach our grid object to the model
            req.linz.model.grid = grid;

            // retrieve the export object
            req.linz.export = getExport(grid.export);
            req.linz.export.fields = {};

            // retrieve the form to provide a list of fields to choose from
            req.linz.model.getForm(req.user, function (formErr, form){

                if (formErr) {
                    return next(formErr);
                }

                var excludedFieldNames = req.linz.export.exclusions.concat(',__v').split(','),
                    fieldLabels = {};

                // get a list of field names
                req.linz.model.schema.eachPath(function (pathname, schemaType) {

                    if (excludedFieldNames.indexOf(pathname) >= 0) {
                        // exit if current field name is one of the exclusion fields
                        return;
                    }

                    // get a list of fields by the label ready for sorting
                    fieldLabels[form[pathname].label] = pathname;

                });

                // sort fields by label
                var sortedFieldsByLabel = Object.keys(fieldLabels).sort();

                // iterate through sorted label and re-constructs in the order of labels
                sortedFieldsByLabel.forEach(function (label) {
                    req.linz.export.fields[fieldLabels[label]] = label;
                });

                return next(null);

            });

        });

    },

    post: function (req, res, next) {

        var Model = req.linz.model;

        // since a custom export function is not defined for model, use local export function
        var asyncFn = [],
            helpers = modelExportHelpers(req, res);

        asyncFn.push(helpers.getFilters);
        asyncFn.push(helpers.addIdFilters);
        asyncFn.push(helpers.getForm);
        asyncFn.push(helpers.getGrid);

        // get the actual export object
        asyncFn.push(function (filters, form, grid, callback) {

            // retrieve the export
            var _export = getExport(grid.export);
            _export.fields = {};

            return callback(null, filters, form, grid, _export);

        });

        async.waterfall(asyncFn, function (err, filters, form, grid, exportObj) {

            if (err) {
                return next(err);
            }

            var fields = req.body.selectedFields.split(','),
                refFieldNames = [],
                filterFieldNames = [];

            fields.forEach(function (fieldName, index, arr) {

                // remove any property that doesn't exist in the model
                if (!Model.schema.tree[fieldName]) {
                    return arr.splice(index, 1);
                }

                // check if there any ref fields selected to be exported
                if(!Model.schema.tree[fieldName].ref) {
                    return;
                }

                return refFieldNames.push(fieldName);

            });

            // check if _id is excluded
            if (exportObj.exclusions.indexOf('_id') >= 0) {
                filterFieldNames.push('-_id');
            }

            filterFieldNames = filterFieldNames.concat(fields);

            // serve .csv file
            res.setHeader('Content-disposition', 'attachment; filename=' + Model.linz.formtools.model.plural + '-' + moment(Date.now()).format('l').replace(/\//g, '.', 'g') + '.csv');
            res.writeHead(200, { 'Content-Type': 'text/csv' });

            // pipe data to response stream
            Model.find( filters, filterFieldNames.join(' ') ).populate( refFieldNames.join(' '), '-_id -__v -dateCreated -dateModified -createdBy -modifiedBy' ).stream({ transform: helpers.mongooseToCSV(fields, form) }).pipe(res);

        });

    }
};
