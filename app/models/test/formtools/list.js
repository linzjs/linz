'use strict';

const linz = require('linz');

const list = [
    {
        label: 'label1',
        value: 'value1',
    },
    {
        label: 'label2',
        value: 'value2',
    },
    {
        label: 'xss',
        value: `" /><script>alert('xss')</script><br class="`,
    },
];

module.exports = {
    fields: {
        title: { renderer: linz.formtools.cellRenderers.overviewLink },
        boolean: true,
        checkboxes: true,
        checkboxesWithAddition: true,
        ckeditor: true,
        date: true,
        digit: true,
        documents: true,
        email: true,
        hidden: true,
        multipleSelect: true,
        number: true,
        password: true,
        radios: true,
        select: true,
        tel: true,
        textArea: true,
        text: true,
        url: true,
    },
    filters: {
        username: { filter: linz.formtools.filters.text },
        boolean: { filter: linz.formtools.filters.boolean },
        checkboxes: { filter: linz.formtools.filters.list(list, true) },
        checkboxesWithAddition: {
            filter: linz.formtools.filters.list(list, true),
        },
        ckeditor: { filter: linz.formtools.filters.text },
        date: { filter: linz.formtools.filters.date() },
        digit: { filter: linz.formtools.filters.text },
        documents: { filter: linz.formtools.filters.text },
        email: { filter: linz.formtools.filters.text },
        hidden: { filter: linz.formtools.filters.text },
        multipleSelect: { filter: linz.formtools.filters.list(list, true) },
        number: { filter: linz.formtools.filters.number },
        password: { filter: linz.formtools.filters.text },
        radios: { filter: linz.formtools.filters.text },
        select: { filter: linz.formtools.filters.list(list, false) },
        tel: { filter: linz.formtools.filters.text },
        textArea: { filter: linz.formtools.filters.fulltext },
        text: { filter: linz.formtools.filters.text },
        url: { filter: linz.formtools.filters.text },
    },
    export: [
        {
            dateFormat: 'DD MMM YYYY',
            label: 'Choose fields to export',
        },
    ],
};
