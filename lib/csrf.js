'use strict';

const csurf = require('csurf');
const linz = require('../');

module.exports = () => csurf(linz.get('csrf options'));
