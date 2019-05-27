'use strict';

const linz = require('linz');

module.exports = {
    fields: {
        name: { renderer: linz.formtools.cellRenderers.overviewLink },
        username: true,
        email: false,
        bAdmin: true,
        org: { renderer: linz.formtools.cellRenderers.defaultRenderer },
    },
    filters: { username: { filter: linz.formtools.filters.text } },
    recordActions: [
        {
            action: 'edit-custom',
            disabled: false,
            label: 'Customised edit form',
        },
    ],
    export: [
        {
            columns: (columns) => {

                // Usually you would want to filter out the object field based on the key
               // For testing purposes it has been left in.
               const updatedColumns = columns.slice();

                return updatedColumns.concat([
                   {
                       key: 'objectField1',
                       header: 'Object Field 1',
                   },
                   {
                       key: 'objectField2',
                       header: 'Object Field 2',
                   },
                   {
                       key: 'objectField3',
                       header: 'Object Field 3',
                   },
               ]);

            },
            dateFormat: 'DD MMM YYYY',
            exclusions: '_id',
            label: 'Choose fields to export',
        },
    ],
};
