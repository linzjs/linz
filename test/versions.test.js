'use strict';

const linz = require('../linz');

let UserSchema;

// Wait for the database
beforeAll((done) => {

    // Just in case the database connection takes a while.
    jest.setTimeout(10000);

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://localhost:27777/versions-test',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        // setup a basic user model
        var UserSchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String
        });

        UserSchema.virtual('hasAdminAccess').get(() => true);

        return done();

    });

});

afterAll((done) => linz.mongoose.connection.close(done));

describe('versions', () => {

    describe('extends the schema', () => {

        let TestSchema;

        beforeAll(() => {
            TestSchema = new linz.mongoose.Schema({ label: String });
        });

        test('should throw error if options is not provided', () => {
            expect(() => {
                TestSchema.plugin(linz.versions.plugin);
            }).toThrow('options is required');

        });

        test('should throw error if options.collection is not provided', () => {
            expect(() => {
                TestSchema.plugin(linz.versions.plugin, {});
            }).toThrow('collection name is required');
        });

    })

    describe('sets versions options', () => {

        describe('defaults', () => {

            let versionsSetting;
            let TestSchema;

            beforeAll((done) => {

                TestSchema = new linz.mongoose.Schema({ label: String });

                TestSchema.plugin(linz.versions.plugin, {
                    collection: 'testschema_versions'
                });

                let TestModelDefaults = linz.mongoose.model('TestModelDefaults', TestSchema);

                TestModelDefaults.getVersionsSettings((err, settings) => {

                    versionsSetting = settings;

                    return done(err);

                });

            });

            test('label defaults to "History"', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.label).toEqual('History');
            });

            test('default cell renderers', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.cellRenderers).toMatchObject({
                    date: linz.versions.renderers.cellRenderers.timestamp,
                    reference: linz.versions.renderers.cellRenderers.reference,
                    referenceName:linz.versions.renderers.cellRenderers.referenceName
                })
            });

            test('default renderer', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.renderer).toBe(linz.versions.renderers.overview);
            })

        });

        describe('overwrites', () => {

            let versionsSetting;
            let TestSchema1;
            let dateRenderer;
            let referenceRenderer;
            let referenceNameRenderer;
            let versionsRenderer;

            beforeAll((done) => {

                TestSchema1 = new linz.mongoose.Schema({ label: String });

                dateRenderer = (cb) => cb(null, 'date');

                referenceRenderer = (cb) => cb(null, 'reference');

                referenceNameRenderer = (cb) => cb(null, 'referenceName');

                versionsRenderer = (cb) => cb(null, 'body');

                TestSchema1.plugin(linz.versions.plugin, {
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

                let TestModelOverwrites = linz.mongoose.model('TestModelOverwrites', TestSchema1);

                TestModelOverwrites.getVersionsSettings((err, settings) => {

                    versionsSetting = settings;

                    return done(err);

                });

            });

            test('label', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.label).toEqual('Test');
            });

            test('renderer', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.renderer).toBe(versionsRenderer);
            });

            test('cell renderer - date', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.cellRenderers.date).toBe(dateRenderer);
            });

            test('cell renderer - reference', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.cellRenderers.reference).toBe(referenceRenderer);
            });

            test('cell renderer - referenceName', () => {
                expect(versionsSetting).toBeTruthy();
                expect(versionsSetting.cellRenderers.referenceName).toBe(referenceNameRenderer);
            });

        });

    });

});
