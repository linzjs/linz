'use strict';

const linz = require('linz');

module.exports = {
    boolean: {
        fieldset: 'Boolean',
        helpText: 'The default Boolean widget.',
        widget: linz.formtools.widgets.boolean(),
    },
    checkboxes: {
        fieldset: 'Checkboxes',
        helpText: 'The default Checkboxes widget.',
        list: [
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
        ],
        widget: linz.formtools.widgets.checkboxes(),
    },
    checkboxesWithAddition: {
        fieldset: 'CheckboxesWithAddition',
        helpText: 'The default CheckboxesWithAddition widget.',
        widget: linz.formtools.widgets.checkboxesWithAddition(),
    },
    ckeditor: {
        fieldset: 'Ckeditor',
        helpText: 'The default Ckeditor widget.',
        widget: linz.formtools.widgets.ckeditor(),
    },
    date: {
        fieldset: 'Date',
        helpText: 'The default Date widget.',
        widget: linz.formtools.widgets.date(),
    },
    digit: {
        fieldset: 'Digit',
        helpText: 'The default Digit widget.',
        widget: linz.formtools.widgets.digit(),
    },
    documents: {
        fieldset: 'Documents',
        helpText: 'The default Documents widget.',
        widget: linz.formtools.widgets.documents(),
    },
    email: {
        fieldset: 'Email',
        helpText: 'The default Email widget.',
        widget: linz.formtools.widgets.email(),
    },
    hidden: {
        fieldset: 'Hidden',
        helpText: 'The default Hidden widget.',
        widget: linz.formtools.widgets.hidden({ value: 'hidden' }),
    },
    multipleSelect: {
        fieldset: 'MultipleSelect',
        helpText: 'The default MultipleSelect widget.',
        list: [
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
        ],
        widget: linz.formtools.widgets.multipleSelect(),
    },
    number: {
        fieldset: 'Number',
        helpText: 'The default Number widget.',
        widget: linz.formtools.widgets.number(),
    },
    password: {
        fieldset: 'Password',
        helpText: 'The default Password widget.',
        widget: linz.formtools.widgets.password(),
    },
    radios: {
        fieldset: 'Radios',
        helpText: 'The default Radios widget.',
        list: [
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
        ],
        widget: linz.formtools.widgets.radios(),
    },
    select: {
        fieldset: 'Select',
        helpText: 'The default Select widget.',
        list: [
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
        ],
        widget: linz.formtools.widgets.select(),
    },
    tel: {
        fieldset: 'Tel',
        helpText: 'The default Tel widget.',
        widget: linz.formtools.widgets.tel(),
    },
    textArea: {
        fieldset: 'TextArea',
        helpText: 'The default TextArea widget.',
        widget: linz.formtools.widgets.textarea(),
    },
    text: {
        fieldset: 'Text',
        helpText: 'The default Text widget.',
        widget: linz.formtools.widgets.text(),
    },
    title: {
        fieldset: 'Title',
        helpText: 'The default Title widget.',
        widget: linz.formtools.widgets.text(),
    },
    url: {
        fieldset: 'Url',
        helpText: 'The default Url widget.',
        widget: linz.formtools.widgets.url(),
    },
};
