'use strict';

const linz = require('linz');

module.exports = {
    body: [
        {
            fields: [
                {
                    fieldName: 'createdBy',
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
                {
                    fieldName: 'dateCreated',
                    renderer: linz.formtools.cellRenderers.dateRenderer
                },
                {
                    fieldName: 'modifiedBy',
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
                {
                    fieldName: 'dateModified',
                    renderer: linz.formtools.cellRenderers.dateRenderer
                },
            ],
            label: 'Metadata',
        },
        {
            fields: [
                {
                    fieldName: 'name',
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
                {
                    fieldName: 'email',
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
            ],
            label: 'Details',
        },
        [
            {
                fields: [
                    {
                        fieldName: 'name',
                        renderer: linz.formtools.cellRenderers.defaultRenderer
                    },
                ],
                label: 'Section 1',
            },
            {
                fields: [
                    {
                        fieldName: 'email',
                        renderer: linz.formtools.cellRenderers.defaultRenderer
                    },
                ],
                label: 'Section 2',
            },
        ],
        (req, res, record, model, cb) => cb(null, 'Custom HTML section'),
    ],
};
