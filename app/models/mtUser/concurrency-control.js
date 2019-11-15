'use strict';

const linz = require('linz');

module.exports = {
    modifiedByProperty: 'modifiedBy',
    modifiedByCellRenderer: (val, record, fieldName, model, callback) => callback(null, val),
    settings: {
        exclusions: ['_id', 'dateCreated', 'dateModified', 'createdBy']
    }
};
