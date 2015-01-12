var should = require('should'),
    linz = require('../linz');

linz.init({
    'mongo': 'mongodb://127.0.0.1/mongoose-versions-test',
    'user model': 'user',
    'load models': false,
    'load configs': false
});

// setup a basic user model
var UserSchema = new linz.mongoose.Schema({
    username: String,
    password: String,
    email: String
});

UserSchema.virtual('hasAdminAccess').get(function () {
    return true;
});

var User = linz.mongoose.model('UserVersions', UserSchema);

// setup easy references
var mongoose = linz.mongoose,
    versions = linz.versions,
    async = require('async');

describe('versions', function () {

    describe('extends the schema', function () {

        var TestSchema = new mongoose.Schema({ label: String });

        it('should throw error if options is not provided', function () {
            should(function () {
                TestSchema.plugin(versions.plugin);
            }).throw('options is required');

        });

        it('should throw error if options.collection is not provided', function () {
            should(function () {
                TestSchema.plugin(versions.plugin, {});
            }).throw('collection name is required');
        });

    })

    describe('sets versions options', function () {

        describe('defaults', function () {

            var versionsSetting,
                TestSchema = new mongoose.Schema({ label: String });

            before(function (done) {

                TestSchema.plugin(versions.plugin, {
                    collection: 'testschema_versions'
                });

                TestModel = mongoose.model('TestModel', TestSchema);

                TestModel.getVersionsSettings(function (err, settings) {
                    if (err) {
                        done(err);
                    }
                    versionsSetting = settings;
                    return done(null);
                });

            });

            it('label defaults to "History"', function () {
                versionsSetting.should.be.ok;
                versionsSetting.label.should.equal('History');
            });

            it('default cell renderers', function () {
                versionsSetting.should.be.ok;
                versionsSetting.cellRenderers.should.have.properties({
                    date: linz.versions.renderers.cellRenderers.timestamp,
                    reference: linz.versions.renderers.cellRenderers.reference,
                    referenceName:linz.versions.renderers.cellRenderers.referenceName
                })
            });

            it('default renderer', function () {
                versionsSetting.should.be.ok;
                versionsSetting.renderer.should.be.exactly(linz.versions.renderers.overview);
            })

        });

        describe('overwrites', function () {

            var versionsSetting,
                TestSchema1 = new mongoose.Schema({ label: String }),
                dateRenderer = function (cb) {
                    return cb(null, 'date');
                }
                referenceRenderer = function (cb) {
                    return cb(null, 'reference');
                }
                referenceNameRenderer = function (cb) {
                    return cb(null, 'referenceName');
                }
                versionsRenderer = function (cb) {
                    return cb(null, 'body');
                };

            before(function (done) {

                TestSchema1.plugin(versions.plugin, {
                    collection: 'testschema1_versions',
                    settings: {
                        label: 'Test',
                        cellRenderers: {
                            date: dateRenderer,
                            reference: referenceRenderer,
                            referenceName: referenceNameRenderer
                        },
                        renderer: versionsRenderer
                    }
                });

                TestModel1 = mongoose.model('TestModel1', TestSchema1);

                TestModel1.getVersionsSettings(function (err, settings) {
                    if (err) {
                        done(err);
                    }
                    versionsSetting = settings;
                    return done(null);
                });

            });

            it('label', function () {
                versionsSetting.should.be.ok;
                versionsSetting.label.should.equal('Test');
            });

            it('renderer', function () {
                versionsSetting.should.be.ok;
                versionsSetting.renderer.should.exactly(versionsRenderer);
            });

            it('cell renderer - date', function () {
                versionsSetting.should.be.ok;
                versionsSetting.cellRenderers.date.should.exactly(dateRenderer);
            });

            it('cell renderer - reference', function () {
                versionsSetting.should.be.ok;
                versionsSetting.cellRenderers.reference.should.exactly(referenceRenderer);
            });

            it('cell renderer - referenceName', function () {
                versionsSetting.should.be.ok;
                versionsSetting.cellRenderers.referenceName.should.exactly(referenceNameRenderer);
            });

        });

    });

});
