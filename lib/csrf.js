'use strict';

const csurf = require('csurf');
const linz = require('../');

const csrf = csurf(linz.get('csrf options'));

module.exports = csrf;
