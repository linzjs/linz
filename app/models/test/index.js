'use strict';

const linz = require('linz');
const testSchema = require('./schema');

testSchema.plugin(linz.formtools.plugins.document, require('./formtools'));

module.exports = linz.mongoose.model('test', testSchema);
