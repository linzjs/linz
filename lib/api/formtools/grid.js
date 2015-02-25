var linz = require('../../../');
    async = require('async'),
    clone = require('clone');

(function  () {

    function getSettings(modelName, cb) {

        if (!modelName || typeof(modelName) !== 'string' || !modelName.length) {
            throw new Error('modelName is required and must be of type string and cannot be emptied.');
        }

        var model = linz.get('models')[modelName];

        model.getGrid(function (err, settings) {

            if (err) {
                return cb(err);
            }

            return cb(err, clone(settings));

        });

    }

    function getToolbarItems (modelName, cb) {

        if (!modelName || typeof(modelName) !== 'string' || !modelName.length) {
            throw new Error('modelName is required and must be of type string and cannot be emptied.');
        }

        var model = linz.get('models')[modelName];

        async.waterfall([

            function (callback) {
                return getSettings(modelName, callback);
            }

        ], function (err, settings) {

            if (err) {
                return cb(err);
            }

            if (!settings.toolbarItems.length) {
                return cb(null);
            }

            async.each(settings.toolbarItems, function (item, itemDone) {

                if (!item.renderer) {
                    return itemDone(null);
                }

                // this is a custom action, let's execute the function to get the HTML markup
                item.renderer(function (itemErr, html) {

                    if (itemErr) {
                        return itemDone(itemErr);
                    }

                    item.html = html;

                    return itemDone(null);
                });

            }, function (itemErr) {
                return cb(itemErr, settings.toolbarItems);
            });

        });

    }

    function getFilters (modelName, cb) {

        if (!modelName || typeof(modelName) !== 'string' || !modelName.length) {
            throw new Error('modelName is required and must be of type string and cannot be emptied.');
        }

        var model = linz.get('models')[modelName];

        async.waterfall([

            function (callback) {
                return getSettings(modelName, callback);
            }

        ], function (err, settings) {

            if (err) {
                return cb(err);
            }

            if (!Object.keys(settings.filters).length) {
                return cb(null);
            }

            async.each(Object.keys(settings.filters), function (fieldName, filtersDone) {

                // call the filter renderer and update the content with the result
                settings.filters[fieldName].filter.renderer(fieldName, function (filterErr, result) {

                    if (filterErr) {
                        return filtersDone(filterErr);
                    }

                    settings.filters[fieldName].formControls = result;

                    return filtersDone(null);

                });

            }, function (filterErr) {

                return cb(filterErr, settings.filters);

            });

        });

    }

    function getSearchFilter(fieldNames, data, modelName, cb) {

        if (!fieldNames || !Array.isArray(fieldNames) || !fieldNames.length) {
            throw new Error('fieldNames is required and must be of type array and cannot be emptied.');
        }

        if (!modelName || typeof(modelName) !== 'string' || !modelName.length) {
            throw new Error('modelName is required and must be of type string and cannot be emptied.');
        }

        if (!data || typeof(data) !== 'object') {
            throw new Error('data is required and must be of type object.');
        }

        var filters = {},
            model = linz.get('models')[modelName];

        async.waterfall([

            function (callback) {
                return getSettings(modelName, callback);
            }

        ], function (err, settings) {

            if (err) {
                return cb(err);
            }

            if (!Object.keys(settings.filters).length) {
                return cb(null);
            }

            async.each(fieldNames, function (fieldName, filtersDone) {

                if (!data[fieldName]) {
                    return filtersDone(null);
                }

                // call the filter renderer and update the content with the result
                settings.filters[fieldName].filter.filter(fieldName, data, function (filterErr, result) {

                    if (filterErr) {
                        return filtersDone(filterErr);
                    }

                    filters = model.addSearchFilter(filters, result);

                    return filtersDone(null);

                });

            }, function (filterErr) {

                if (filterErr) {
                    return cb(filterErr);
                }

                // consolidate filters into query
                filters = model.setFiltersAsQuery(filters);

                return cb(filterErr, filters);
            });

        });

    }

    function getActiveFilters (selectedFilters, data, modelName, cb) {

        if (!selectedFilters || !Array.isArray(selectedFilters) || !selectedFilters.length) {
            throw new Error('selectedFilters is required and must be of type array and cannot be emptied.');
        }

        if (!modelName || typeof(modelName) !== 'string' || !modelName.length) {
            throw new Error('modelName is required and must be of type string and cannot be emptied.');
        }

        if (!data || typeof(data) !== 'object') {
            throw new Error('data is required and must be of type object.');
        }

        var model = linz.get('models')[modelName],
            activeFilters = {};

        async.waterfall([

            function (callback) {
                return getSettings(modelName, callback);
            }

        ], function (err, settings) {

            if (err) {
                return cb(err);
            }

            if (!Object.keys(settings.filters).length) {
                return cb(null);
            }

            async.each(selectedFilters, function (fieldName, filtersDone) {

                // call the filter binder to render active filter form controls with form value added
                settings.filters[fieldName].filter.bind(fieldName, data, function (filterErr, result) {

                    if (filterErr) {
                        return filtersDone(filterErr);
                    }

                    activeFilters[fieldName] = {
                        label: settings.filters[fieldName].label,
                        controls: result
                    }

                    return filtersDone(null);

                });

            }, function (filterErr) {

                return cb(filterErr, activeFilters);

            });

        });

    }

    module.exports = {
        getSettings: getSettings,
        getToolbarItems: getToolbarItems,
        getFilters: getFilters,
        getSearchFilter: getSearchFilter,
        getActiveFilters: getActiveFilters
    }

})();
