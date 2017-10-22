'use strict';

const array = require('./array');
const boolean = require('./boolean');
const date = require('./date');
const datetime = require('./datetime');
const datetimeLocal = require('./datetime-local');
const documentArray = require('./document-array');
const defaultRenderer = require('./default');
const localDate = require('./local-date');
const overviewLink = require('./overview-link');
const text = require('./text');
const reference = require('./reference');
const referenceName = require('./reference-name');
const referenceValue = require('./reference-value');
const url = require('./url');

module.exports = {
    array,
    boolean,
    date,
    datetime,
    datetimeLocal,
    default: defaultRenderer,
    documentarray: documentArray,
    localDate,
    overviewLink,
    text,
    reference,
    referenceName,
    referenceValue,
    url,
};
