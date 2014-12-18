var linz = require('../'),
    async = require('async'),
    moment = require('moment');

var modelExportHelpers = function modelExportHelpers (req, res) {

    var getRecordData = function getRecordData (fields, record) {

        var orderedRecord = {};

        // order field names in the selected order
        fields.forEach(function (fieldName) {
            orderedRecord[fieldName] = prettifyData(fieldName, record[fieldName]);
        });

        return linz.utils.json2CSV(orderedRecord);

    };

    var prettifyData = function prettifyData (fieldName, val) {

        if (val === undefined || val === '' || val === null) {
            return val;
        }

        if (typeof val === 'number') {
            return val;
        }

        var Model = linz.get('models')[req.body.modelName];

        if (Model.schema.tree[fieldName].ref) {
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

        if (typeof val === 'boolean' || 'true,false,yes,no'.indexOf(val) >=0 ) {
            return (linz.utils.asBoolean(val) ? 'Yes' : 'No')
        }

        return val;

    };

    return {

        mongooseToCSV: function mongooseToCSV (fields, form) {

            var count = 0;

            return function (doc) {

                var str = '',
                    record = doc.toObject({virtuals: true }),
                    columnNames = fields.join();

                if (count !== 0) {
                    return getRecordData(fields, record);
                }

                var arr = [];

                // get field labels
                fields.forEach(function (fieldName) {
                    arr.push(form[fieldName].label);
                });

                str = arr.join() + '\n';

                count++;

                return str + getRecordData(fields, record);

            }

        },

        getFilters: function getFilters (cb) {

            if (!req.body.modelQuery.length) {
                return cb(null, {});
            }

            var Model = linz.get('models')[req.body.modelName],
                form = JSON.parse(req.body.modelQuery);

            // check if there are any filters in the form post
            if (!form.selectedFilters) {
                return cb(null, {});
            }

            async.waterfall([

                function (callback) {

                    Model.getGrid(function (err, grid) {

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
                db  = linz.mongoose.connection.db;

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

            var Model = linz.get('models')[req.body.modelName];

            Model.getForm(function (err, form) {
                return cb(err, filters, form)
            });

        },

        getGrid: function getGrid (filters, form, cb) {

            var Model = linz.get('models')[req.body.modelName];
            Model.getGrid( function (err, grid) {
                return cb(err, filters, form, grid);
            });

        }

    }

}


module.exports = {

    get: function (req, res, next) {

        req.linz.model = linz.get('models')[req.params.model];

        req.linz.model.getGrid(function (err, grid) {

            if (err) {
                return next(err);
            }

            req.linz.model.grid = grid;
            req.linz.model.grid.export.fields = {};

            req.linz.model.getForm( function (formErr, form){

                if (formErr) {
                    return next(formErr);
                }

                var excludedFieldNames = grid.export.exclusions.concat(',__v').split(','),
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
                    req.linz.model.grid.export.fields[fieldLabels[label]] = label;
                });

                return next(null);

            });

        });

    },

    post: function (req, res, next) {

        var Model = linz.get('models')[req.body.modelName];

        // check if there is custom export function for model
        if (Model.export) {
            return Model.export(req, res, next);
        }

        // since a custom export function is not defined for model, use local export function
        var asyncFn = [],
            helpers = modelExportHelpers(req, res),
            test = 'test';

        asyncFn.push(helpers.getFilters);
        asyncFn.push(helpers.addIdFilters);
        asyncFn.push(helpers.getForm);
        asyncFn.push(helpers.getGrid);

        async.waterfall(asyncFn, function (err, filters, form, grid) {

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
            if (grid.export.exclusions.indexOf('_id') >= 0) {
                filterFieldNames.push('-_id');
            }

            filterFieldNames = filterFieldNames.concat(fields);

            // serve .csv file
            res.setHeader('Content-disposition', 'attachment; filename=' + Model.formtools.model.plural + '-' + moment(Date.now()).format('l').replace(/\//g, '.', 'g') + '.csv');
            res.writeHead(200, { 'Content-Type': 'text/csv' });

            // pipe data to response stream
            Model.find( filters, filterFieldNames.join(' ') ).populate( refFieldNames.join(' '), '-_id -__v -dateCreated -dateModified -createdBy -modifiedBy' ).stream({ transform: helpers.mongooseToCSV(fields, form) }).pipe(res);

        });

    }
}
