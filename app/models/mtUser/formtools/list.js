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
            exclusions: '_id',
            label: 'Choose fields to export',
            dateFormat: 'DD MMM YYYY',
        },
    ],
};
