'use strict';

const linz = require('linz');
const moment = require('moment');

module.exports = {
    name: {
        fieldset: 'Details',
        helpText: 'The users full name.',
    },
    email: {
        fieldset: 'Details',
    },
    alternativeEmails: {
        fieldset: 'Details',
        helpText: 'Add some alternative emails',
        widget: linz.formtools.widgets.documents({
            setLabel: function setLabel (doc) {

                doc.label = doc.email + ' (' + doc.type + ')';

                return doc;

            },
        }),
        transpose: {
            'export': (val) => Promise.resolve(val.map(({ email }) => email).join(',')),
        },
    },
    org: {
        fieldset: 'Details',
    },
    birthday: {
        fieldset: 'Details',
        transpose: { 'export': (val) => Promise.resolve(moment(val).format('D MMMM YYYY')) },
        widget: linz.formtools.widgets.date({ 'data-linz-date-format': 'DD/MM/YYYY hh:mm a' }),
    },
    customOffset: {
        fieldset: 'Details',
        widget: linz.formtools.widgets.date({
            'data-linz-date-format': 'DD/MM/YYYY hh:mm a',
            'data-utc-offset': '-03:30',
        }),
    },
    username: {
        fieldset: 'Access',
    },
    password: {
        fieldset: 'Access',
        widget: linz.formtools.widgets.password(),
    },
    bAdmin: {
        fieldset: 'Access',
        helpText: 'This controls if the user has access to admin.',
    },
};
