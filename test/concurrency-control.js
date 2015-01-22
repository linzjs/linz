var should = require('should'),
    linz = require('../linz');

linz.init({
    'mongo': 'mongodb://127.0.0.1/mongoose-concurrency-control-test',
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

var User = linz.mongoose.model('ConcurrencyTestUser', UserSchema);

// setup easy references
var mongoose = linz.mongoose,
    concurrencyControl = linz.concurrencyControl,
    async = require('async');

describe('concurrency control', function () {

    var modifiedByProperty = 'modifiedBy',
        modifiedByCellRenderer = function () {},
        exclusions = ['createdBy'];

    describe('extends the schema', function () {

        var TestSchema = new mongoose.Schema({ label: String });

        it('should throw error if options is not provided', function () {
            should(function () {
                TestSchema.plugin(concurrencyControl.plugin);
            }).throw('options is required');

        });

        it('should throw error if options.modifiedByProperty is not provided', function () {
            should(function () {
                TestSchema.plugin(concurrencyControl.plugin, {});
            }).throw('options.modifiedByProperty is required');
        });

        it('should throw error if options.modifiedByCellRenderer is not provided', function () {
            should(function () {
                TestSchema.plugin(concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty
                });
            }).throw('options.modifiedByCellRenderer is required');
        });

        it('should throw error if options.modifiedByProperty is not defined in the provided schema', function () {
            should(function () {
                TestSchema.plugin(concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer
                });
            }).throw('settings.modifiedByProperty "' + modifiedByProperty + '" has been provided, but it is not defined in your schema.');
        });

    })

    describe('sets versions options', function () {

        describe('defaults', function () {

            var ccSettings,
                TestModel,
                TestSchema = new mongoose.Schema({ modifiedBy: String });

            before(function (done) {

                TestSchema.plugin(concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer
                });

                TestModel = mongoose.model('TestModel', TestSchema);

                TestModel.getConcurrencyControlOptions(function (err, settings) {
                    if (err) {
                        return done(err);
                    }
                    ccSettings = settings;
                    return done(null);
                });

            });

            it('options.settings.exclusions should defaults to ["_id","dateCreated","dateModified"]', function () {
                ccSettings.should.exist;
                ccSettings.settings.should.exist;
                ccSettings.settings.exclusions.should.exist;
                ccSettings.settings.exclusions[0].should.equal('_id');
                ccSettings.settings.exclusions[1].should.equal('dateCreated');
                ccSettings.settings.exclusions[2].should.equal('dateModified');
            });

        });

        describe('overwrites', function () {

            var ccSettings,
                TestModel,
                TestSchema = new mongoose.Schema({ modifiedBy: String });

            before(function (done) {

                TestSchema.plugin(concurrencyControl.plugin, {
                    modifiedByProperty: modifiedByProperty,
                    modifiedByCellRenderer: modifiedByCellRenderer,
                    settings: {
                        exclusions: exclusions
                    }
                });

                TestModel = mongoose.model('TestModel1', TestSchema);

                TestModel.getConcurrencyControlOptions(function (err, settings) {
                    if (err) {
                        return done(err);
                    }
                    ccSettings = settings;
                    return done(null);
                });

            });

            it('should overwrite options.settings.exclusions if provided', function () {
                ccSettings.should.exist;
                ccSettings.settings.should.exist;
                ccSettings.settings.exclusions.should.exist;
                ccSettings.settings.exclusions.should.have.length(1);
                ccSettings.settings.exclusions[0].should.equal('createdBy');
            });

        });

    });

});
