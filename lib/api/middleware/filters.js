'use strict';

const linz = require('linz');

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

            linz.api.model.titleField(linz.api.middleware.getModelFromRequest(req), field, (searchFilterErr, titleField) => {

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

module.exports = { getFilters };
