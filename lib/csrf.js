'use strict';

const csurf = require('csurf');

module.exports = (linz) => csurf(linz.get('csrf options'));
