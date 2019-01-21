'use strict';

const array = require('./array');
const boolean = require('./boolean');
const date = require('./date');
const documentArray = require('./document-array');
const defaultRenderer = require('./default');
const email = require('./email');
const localDate = require('./local-date');
const overviewLink = require('./overview-link');
const tel = require('./tel');
const text = require('./text');
const reference = require('./reference');
const referenceName = require('./reference-name');
const referenceValue = require('./reference-value');
const url = require('./url');

module.exports = {
    array,
    boolean,
    date,
    default: defaultRenderer,
    documentarray: documentArray,
    email,
    localDate,
    overviewLink,
    tel,
    text,
    reference,
    referenceName,
    referenceValue,
    url,
};
