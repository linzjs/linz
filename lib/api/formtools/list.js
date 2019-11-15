var linz = require('../../../'),
    async = require('async'),
    dedupe = require('dedupe');

/**
 * Get toolbar items from list settings and execute render method (if available) for each item to obtain the HTML markup
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

    linz.api.model.list(req, modelName, function (err, list) {

        if (err) {
            return cb(err);
        }

        if (!list.toolbarItems.length) {
            return cb(null);
        }

        async.each(list.toolbarItems, function (item, itemDone) {

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
            return cb(itemErr, list.toolbarItems);
        });

    });

}

/**
 * Get list filter settings and execute render method to obtain the HTML markup
 * @param {String}   req       A HTTP request object.
 * @param {String}   modelName Name of model
 * @param {Function} cb        Callback function
 * @return {Object} or undefined
 * @api public
 */
function renderFilters (req, modelName, cb) {

    if (!req) {
        throw new Error('req is required.');
    }

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    linz.api.model.list(req, modelName, function (err, list) {

        if (err) {
            return cb(err);
        }

        if (!Object.keys(list.filters).length) {
            return cb(null);
        }

        async.each(Object.keys(list.filters), function (fieldName, filtersDone) {

            // call the filter renderer and update the content with the result
            list.filters[fieldName].filter.renderer(fieldName, function (filterErr, result) {

                if (filterErr) {
                    return filtersDone(filterErr);
                }

                list.filters[fieldName].formControls = result;

                return filtersDone(null);

            });

        }, function (filterErr) {

            return cb(filterErr, list.filters);

        });

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
function renderSearchFilters(req, fieldNames, data, modelName, cb) {

    if (!req) {
        throw new Error('req is required.');
    }

    if (!Array.isArray(fieldNames) || !fieldNames.length) {
        throw new Error('fieldNames is required and must be of type Array and cannot be empty.');
    }

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    if (!(!Object.is(data, null) && !Array.isArray(data) && data === Object(data))) {
        throw new Error('data is required and must be of type Object.');
    }

    // Sort fieldNames (to make MongoDB queries more predictable, and therefore easier to create indexes for), remove duplicates, and remove anything that doesn't have associated data.
    fieldNames = dedupe(fieldNames.sort().filter(fieldName => Object.keys(data).indexOf(fieldName) >= 0));

    linz.api.model.list(req, modelName, function (err, list) {

        if (err) {
            return cb(err);
        }

        if (!Object.keys(list.filters).length) {
            return cb(null);
        }

        var model = linz.api.model.get(modelName),
            dataKeys = Object.keys(data),
            filters = {};

        async.each(fieldNames, function (fieldName, filtersDone) {

            if (!dataKeys.includes(fieldName)) {
                return filtersDone(null);
            }

            // call the filter renderer and update the content with the result
            list.filters[fieldName].filter.filter(fieldName, data, function (filterErr, result) {

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

/**
 * Get active filters from form post data
 * @param {Array}   selectedFilters An array of selected filter field names
 * @param {Object}   data            Form data
 * @param {String}   modelName       Name of model
 * @param {Function} cb              Callback function
 * @return {Object} or undefined
 * @api public
 */
function getActiveFilters (req, selectedFilters, data, modelName, cb) {

    if (!req) {
        throw new Error('req is required.');
    }

    if (!selectedFilters || !Array.isArray(selectedFilters) || !selectedFilters.length) {
        throw new Error('selectedFilters is required and must be of type Array and cannot be empty.');
    }

    if (typeof modelName !== 'string' || !modelName.length) {
        throw new Error('modelName is required and must be of type String and cannot be empty.');
    }

    if (!(!Object.is(data, null) && !Array.isArray(data) && data === Object(data))) {
        throw new Error('data is required and must be of type Object.');
    }

    linz.api.model.list(req, modelName, function (err, list) {

        if (err) {
            return cb(err);
        }

        if (!Object.keys(list.filters).length) {
            return cb(null);
        }

        var activeFilters = {};

        async.each(selectedFilters, function (fieldName, filtersDone) {

            // call the filter binder to render active filter form controls with form value added
            list.filters[fieldName].filter.bind(fieldName, data, function (filterErr, result) {

                if (filterErr) {
                    return filtersDone(filterErr);
                }

                activeFilters[fieldName] = {
                    label: list.filters[fieldName].label,
                    controls: result
                }

                return filtersDone(null);

            });

        }, function (filterErr) {

            return cb(filterErr, activeFilters);

        });

    });

}

/**
 * Get the current list filters from a post request.
 * @param {Object} req HTTP request object.
 * @returns {Promise} Resolves with the query object.
 */
const getListFilters = (req) => new Promise((resolve, reject) => {

    const filters = JSON.parse(req.body.filters);

    if (!filters.selectedFilters) {
        return resolve({});
    }

    const Model = req.linz.model;

    Model.getList(req, (err, list) => {

        if (err) {
            return reject(err);
        }

        let filterObj = {};

        Promise.all(filters.selectedFilters.split(',').map((fieldName) => new Promise((resolveSelectedFilters, rejectSelectedFilters) => {

            // Call the filter renderer and update the content with the result
            list.filters[fieldName].filter.filter(fieldName, filters, (err, result) => {

                if (err) {
                    return rejectSelectedFilters(err);
                }

                filterObj = Model.addSearchFilter(filterObj, result);

                return resolveSelectedFilters();

            });

        })))
            .then(() => {

                // Consolidate filters into query.
                if (Object.keys(filterObj).length) {
                    filterObj = Model.setFiltersAsQuery(filterObj);
                }

                return resolve(filterObj);

            })
            .catch(reject);

    });

});

/**
 * Get the current search filters from a post request.
 * @param {Object} req HTTP request object.
 * @param {Object} currentFilters The query object.
 * @returns {Promise} Resolves with the updates query object.
 */
const getSearchFilters = (req, currentFilters = {}) => new Promise((resolve, reject) => {

    const filters = JSON.parse(req.body.filters);

    if (!filters.search || !filters.search.length) {
        return resolve(currentFilters);
    }

    if (!currentFilters.$and) {
        currentFilters.$and = [];
    }

    req.linz.model.getList(req, (err, list) => {

        if (err) {
            return reject(err);
        }

        Promise.all(list.search.map((field) => new Promise((resolveSearchFilters, rejectSearchFilters) => {

            linz.api.model.titleField(req.linz.model.modelName, field, (searchFilterErr, titleField) => {

                if (searchFilterErr) {
                    return rejectSearchFilters(searchFilterErr);
                }

                return resolveSearchFilters(linz.api.query.fieldRegexp(titleField, filters.search));

            });

        })))
            .then(($or) => {

                currentFilters.$and.push({ $or });

                return resolve(currentFilters);

            })
            .catch(reject);

    });

});

/**
 * Get the current Id filters from a post request.
 * @param {Object} req HTTP request object.
 * @param {Object} currentFilters The query object.
 * @returns {Promise} Resolves with the updates query object.
 */
const getIdFilters = (req, currentFilters = {}) => new Promise((resolve) => {

    const { selectedIds } = req.body;

    if (!selectedIds || !selectedIds.length) {
        return resolve(currentFilters);
    }

    currentFilters = currentFilters || { '$and': [] };
    currentFilters.$and = currentFilters.$and || [];

    // Compile ids into ObjectId type.
    const ids = selectedIds.split(',').map((id) => new linz.mongoose.Types.ObjectId(id));

    // Let's add selected Ids to the filters.
    currentFilters.$and.push({ _id: { $in: ids } });

    return resolve(currentFilters);

});

/**
 * Get the current list, search, and selectId filters from a post request.
 * @param {Object} req HTTP request object.
 * @returns {Promise} Resolves with the query object.
 */
const getFilters = (req = {}) => new Promise((resolve, reject) => {

    if (!req.body || !req.body.filters || !req.body.filters.length) {
        return resolve({});
    }

    getListFilters(req)
        .then((filters) => getSearchFilters(req, filters))
        .then((filters) => getIdFilters(req, filters))
        .then(resolve)
        .catch(reject);

});

module.exports = {
    getActiveFilters,
    getFilters,
    renderFilters,
    renderSearchFilters,
    renderToolbarItems,
}
