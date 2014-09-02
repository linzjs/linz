var versions = require('mongoose-version'),
    linz = require('../../');

module.exports = function versionsPlugin (schema, options) {

    if (!options) {
        throw new Error('options is required');
    }

    if (!options.collection) {
        throw new Error('collection name is required');
    }

    options.mongoose = options.mongoose || linz.mongoose;
    options.strategy = 'collection';
    options.removeVersions = false;
    options.suppressVersionIncrement = false;

    options.settings = options.settings || {};
    options.settings.label = options.settings.label || 'History';
    options.settings.renderer = options.settings.renderer || linz.versions.renderers.overview;
    options.settings.cellRenderers = options.settings.cellRenderers || {};
    options.settings.cellRenderers.date = options.settings.cellRenderers.date || linz.versions.renderers.cellRenderers.date;
    options.settings.cellRenderers.reference = options.settings.cellRenderers.reference || linz.versions.renderers.cellRenderers.reference;
    options.settings.cellRenderers.referenceName = options.settings.cellRenderers.referenceName || linz.versions.renderers.cellRenderers.referenceName;

    schema.plugin(versions, options);

    schema.statics.getVersionsSettings = function (cb) {
        return cb(null, options.settings);
    };

};
