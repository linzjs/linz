'use strict';

const linz = require('linz');

module.exports = {
    body: [
        {
            fields: [
                {
                    fieldName: 'boolean',
                    renderer: linz.formtools.cellRenderers.boolean,
                },
            ],
            label: 'Boolean',
        },
        {
            fields: [
                {
                    fieldName: 'checkboxes',
                    renderer: linz.formtools.cellRenderers.array,
                },
            ],
            label: 'Checkboxes',
        },
        {
            fields: [
                {
                    fieldName: 'checkboxesWithAddition',
                    renderer: linz.formtools.cellRenderers.array,
                },
            ],
            label: 'CheckboxesWithAddition',
        },
        {
            fields: [
                {
                    fieldName: 'ckeditor',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Ckeditor',
        },
        {
            fields: [
                {
                    fieldName: 'date',
                    renderer: linz.formtools.cellRenderers.date,
                },
            ],
            label: 'Date',
        },
        {
            fields: [
                {
                    fieldName: 'digit',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Digit',
        },
        // {
        //     fields: [
        //         {
        //             fieldName: 'documents',
        //             renderer: linz.formtools.cellRenderers.documentarray,
        //         },
        //     ],
        //     label: 'Documents',
        // },
        {
            fields: [
                {
                    fieldName: 'email',
                    renderer: linz.formtools.cellRenderers.email,
                },
            ],
            label: 'Email',
        },
        {
            fields: [
                {
                    fieldName: 'hidden',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Hidden',
        },
        {
            fields: [
                {
                    fieldName: 'multipleSelect',
                    renderer: linz.formtools.cellRenderers.array,
                },
            ],
            label: 'MultipleSelect',
        },
        {
            fields: [
                {
                    fieldName: 'number',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Number',
        },
        {
            fields: [
                {
                    fieldName: 'password',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Password',
        },
        {
            fields: [
                {
                    fieldName: 'radios',
                    renderer: linz.formtools.cellRenderers.boolean,
                },
            ],
            label: 'Radios',
        },
        {
            fields: [
                {
                    fieldName: 'select',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Select',
        },
        {
            fields: [
                {
                    fieldName: 'tel',
                    renderer: linz.formtools.cellRenderers.tel,
                },
            ],
            label: 'Tel',
        },
        {
            fields: [
                {
                    fieldName: 'textArea',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'textArea',
        },
        {
            fields: [
                {
                    fieldName: 'text',
                    renderer: linz.formtools.cellRenderers.text,
                },
            ],
            label: 'Text',
        },
        {
            fields: [
                {
                    fieldName: 'title',
                    renderer: linz.formtools.cellRenderers.overviewLink,
                },
            ],
            label: 'Title',
        },
        {
            fields: [
                {
                    fieldName: 'url',
                    renderer: linz.formtools.cellRenderers.url,
                },
            ],
            label: 'Url',
        },
    ],
};
