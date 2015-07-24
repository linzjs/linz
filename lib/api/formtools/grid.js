var linz = require('../../../'),
    async = require('async'),
    clone = require('clone');

/**
 * Get toolbar items from grid settings and execute render method (if available) for each item to obtain the HTML markup
 * @param {Object}   req       Request object
 * @param {Object}   res       Response object
 * @param {String}   modelName Name of model
 * @param {Function} cb        Callback function
 * @return {Array} or undefined
 * @api public
 */
function renderToolbarItems (req, res, modelName, cb) {

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    var model = linz.api.model.get(modelName),
        settings = model.linz.formtools.grid;

    if (!settings.toolbarItems.length) {
        return cb(null);
    }

    async.each(settings.toolbarItems, function (item, itemDone) {

        if (!item.renderer) {
            return itemDone(new Error('Renderer function is missing for toolbar item: ' + require('util').inspect(item) + '. Check your \'' + modelName + '\' model for more details.'));
        }

        // this is a custom action, let's execute the function to get the HTML markup
        item.renderer(req, res, function (itemErr, html) {

            if (itemErr) {
                return itemDone(itemErr);
            }

            item.html = html;

            return itemDone(null);
        });

    }, function (itemErr) {
        return cb(itemErr, settings.toolbarItems);
    });

}

/**
 * Get grid filter settings and execute render method to obtain the HTML markup
 * @param {String}   modelName Name of model
 * @param {Function} cb        Callback function
 * @return {Object} or undefined
 * @api public
 */
function renderFilters (modelName, cb) {

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    var model = linz.api.model.get(modelName),
        settings = model.linz.formtools.grid;

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

}

/**
 * Get search filters as a mongodb query
 * @param {Array}   fieldNames Field names
 * @param {Object}   data       Form data
 * @param {String}   modelName  Name of model
 * @param {Function} cb         Callback function
 * @return {Object} or undefined
 * @api public
 */
function renderSearchFilters(fieldNames, data, modelName, cb) {

    if (!Array.isArray(fieldNames) || !fieldNames.length) {
        throw new Error('fieldNames is required and must be of type Array and cannot be empty.');
    }

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    if (!(data instanceof Object && !Array.isArray(data))) {
        throw new Error('data is required and must be of type Object.');
    }

    var filters = {},
        model = linz.api.model.get(modelName),
        settings = model.linz.formtools.grid;

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

}

/**
 * Get active filters from form post data
 * @param {Array}   selectedFilters An array of selected filter field names
 * @param {Object}   data            Form data
 * @param {String}   modelName       Name of model
 * @param {Function} cb              Callback function
 * @return {Object} or undefined
 * @api public
 */
function getActiveFilters (selectedFilters, data, modelName, cb) {

    if (!selectedFilters || !Array.isArray(selectedFilters) || !selectedFilters.length) {
        throw new Error('selectedFilters is required and must be of type Array and cannot be empty.');
    }

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    if (!(data instanceof Object && !Array.isArray(data))) {
        throw new Error('data is required and must be of type Object.');
    }

    var model = linz.api.model.get(modelName),
        activeFilters = {},
        settings = model.linz.formtools.grid;

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

}

module.exports = {
    renderToolbarItems: renderToolbarItems,
    renderFilters: renderFilters,
    renderSearchFilters: renderSearchFilters,
    getActiveFilters: getActiveFilters
}
