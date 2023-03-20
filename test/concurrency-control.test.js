'use strict';

const linz = require('linz');

let UserSchema;

// Wait for the database
beforeAll((done) => {
    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/versions-test',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        },
    });

    linz.once('initialised', () => {
        linz.init({
            'mongo': 'mongodb://127.0.0.1/concurrency-control-test',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        });

        // setup a basic user model
        var UserSchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
        });

        UserSchema.virtual('hasAdminAccess').get(() => {
            return true;
        });

        return done();
    });
}, 10000);

afterAll((done) => linz.mongoose.connection.close(done));

describe('concurrency control', () => {
    const modifiedByProperty = 'modifiedBy';
    const modifiedByCellRenderer = () => {};
    const exclusions = ['createdBy'];

    describe('extends the schema', () => {
        let TestSchema;
        let TestSchema1;

        beforeAll(() => {
            TestSchema = new linz.mongoose.Schema({ label: String });
            TestSchema1 = new linz.mongoose.Schema({ modifiedBy: String });
        });

        test('should throw error if options is not provided', () => {
            expect(() => {
                TestSchema.plugin(linz.concurrencyControl.plugin);
            }).toThrow('options is required');
        });

        test('should throw error if options.modifiedByProperty is not provided', () => {
            expect(() => {
                TestSchema.plugin(linz.concurrencyControl.plugin, {});
            }).toThrow('options.modifiedByProperty is required');
        });

        test('should throw error if options.modifiedByCellRenderer is not provided', () => {
            expect(() => {
                TestSchema.plugin(linz.concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                });
            }).toThrow('options.modifiedByCellRenderer is required');
        });

        test('should throw error if options.modifiedByProperty is not defined in the provided schema', () => {
            expect(() => {
                TestSchema.plugin(linz.concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer,
                });
            }).toThrow(
                'settings.modifiedByProperty "' +
                    modifiedByProperty +
                    '" has been provided, but it is not defined in your schema.'
            );
        });

        test('should throw error if options.modifiedByProperty is included in the exclusions settings', () => {
            expect(() => {
                TestSchema1.plugin(linz.concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer,
                    settings: {
                        exclusions: [modifiedByProperty],
                    },
                });
            }).toThrow(
                'settings.modifiedByProperty "' +
                    modifiedByProperty +
                    '" is required and cannot be excluded.'
            );
        });
    });

    describe('sets versions options', () => {
        describe('defaults', () => {
            let ccSettings;
            let TestModel;
            let TestSchema;

            beforeAll((done) => {
                TestSchema = new linz.mongoose.Schema({ modifiedBy: String });

                TestSchema.plugin(linz.concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer,
                });

                TestModel = linz.mongoose.model('TestModel', TestSchema);

                TestModel.getConcurrencyControlOptions((err, settings) => {
                    ccSettings = settings;
                    return done(err);
                });
            });

            test('options.settings.exclusions should defaults to ["_id","dateCreated","dateModified"]', () => {
                expect(ccSettings).toBeTruthy();
                expect(ccSettings.settings).toBeTruthy();
                expect(ccSettings.settings.exclusions).toBeTruthy();
                expect(ccSettings.settings.exclusions[0]).toEqual('_id');
                expect(ccSettings.settings.exclusions[1]).toEqual(
                    'dateCreated'
                );
                expect(ccSettings.settings.exclusions[2]).toEqual(
                    'dateModified'
                );
            });
        });

        describe('overwrites', () => {
            let TestSchema;
            let ccSettings;
            let TestModel;

            beforeAll((done) => {
                TestSchema = new linz.mongoose.Schema({ modifiedBy: String });

                TestSchema.plugin(linz.concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer,
                    settings: {
                        exclusions: exclusions,
                    },
                });

                TestModel = linz.mongoose.model('TestModel1', TestSchema);

                TestModel.getConcurrencyControlOptions((err, settings) => {
                    ccSettings = settings;
                    return done(err);
                });
            });

            test('should overwrite options.settings.exclusions if provided', () => {
                expect(ccSettings).toBeTruthy();
                expect(ccSettings.settings).toBeTruthy();
                expect(ccSettings.settings.exclusions).toBeTruthy();
                expect(ccSettings.settings.exclusions).toHaveLength(1);
                expect(ccSettings.settings.exclusions[0]).toEqual('createdBy');
            });
        });
    });
});
