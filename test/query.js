/* eslint-env mocha */

var expect = require('chai').expect,
    should = require('should'),
    linz = require('../linz');

let QuerySchema,
    QueryModel;

describe('Linz has a query api', function () {

    // Wait for the database
    before(function (done) {

        // Setup a test schema.
        QuerySchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
        });

        QuerySchema.methods.toLabel = function () {
            return this.username;
        };

        QuerySchema.virtual('hasAdminAccess').get(function () {
            return true;
        });

        // add the plugin
        QuerySchema.plugin(linz.formtools.plugins.document, {
            labels: {
                username: 'Username',
                password: 'Password',
                email: 'Email',
            },
            list: {
                fields: {
                    title: 'Label',
                    email: true,
                    username: true,
                },
                sortBy: ['username', 'email'],
            },
            model: {
                title: 'username'
            },
            form: {
                username: {
                    fieldset: 'Fieldset'
                },
                password: {
                    visible: false,
                    disabled: true
                },
                email: {
                    fieldset: 'Fieldset',
                }
            },
            overview: {
                canEdit: false,
                canDelete: false,
                viewAll: false,
                body: function bodyRenderer (record, callback) {
                    return callback('body content');
                }
            },
            permissions: {
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canExport: false,
                canList: false,
                canView: false,
                canViewRaw: false
            }
        });

        QueryModel = linz.mongoose.model('queryModel', QuerySchema);

        // Set manually as we're not loading via file.
        linz.set('models', {
            queryModel: QueryModel
        });

        return done();

    });

	describe('which has a field function', function () {

        const queryFor = { $in: ['user', 'name'] };

        it('that will throw unless provided a model', function () {

            should(function () {
                linz.api.query.field();
            }).throw('You must pass the modelName argument');

        });

        it('that will throw unless provided a field', function () {

            should(function () {
                linz.api.query.field('model');
            }).throw('You must pass the field argument');

        });

        it('that will throw unless provided a queryFor parameter', function () {

            should(function () {
                linz.api.query.field('queryModel', 'username');
            }).throw('You must pass the queryFor argument');

        });

        it('that will throw unless provided a valid model', function () {

            should(function () {
                linz.api.query.field('queryModell', 'username', queryFor);
            }).throw('The queryModell model could not be found');

        });

        it('that will throw unless provided a valid field', function () {

            should(function () {
                linz.api.query.field('queryModel', 'usernamee', queryFor);
            }).throw('The usernamee field could not be found in queryModel');

        });

        it('that will return a Linz formatted field query', function () {

            expect(linz.api.query.field('queryModel', 'username', queryFor)).to.eql({
                $or: [ { username: { $in: ['user', 'name'] } } ]
            });

        });

    });

    describe('which has a stringToRegexp function', function () {

        it('will return a regex', function () {

            const re = linz.api.query.stringToRegexp('multiple');

            expect(re).to.be.instanceOf(RegExp);
            expect(re.toString()).to.equal('/multiple/gi');

        });

        it('will return a regex with multiple OR conditions', function () {

            const re = linz.api.query.stringToRegexp('multiple keywords');

            expect(re).to.be.instanceOf(RegExp);
            expect(re.toString()).to.equal('/multiple|keywords/gi');

        });

        it('will escape special characters', function () {

            const re = linz.api.query.stringToRegexp('multiple/ keywords?');

            expect(re).to.be.instanceOf(RegExp);
            expect(re.toString()).to.equal('/multiple\\/|keywords\\?/gi');

        });

        it('will remove non-word characters', function () {

            const re = linz.api.query.stringToRegexp('multiple/ keywords? + .');

            expect(re).to.be.instanceOf(RegExp);
            expect(re.toString()).to.equal('/multiple\\/|keywords\\?/gi');

        });

        it('will allow overriding the regex flags', function () {

            const re = linz.api.query.stringToRegexp('multiple', 'g');

            expect(re).to.be.instanceOf(RegExp);
            expect(re.toString()).to.equal('/multiple/g');

        });

    });

    describe('which has a regexp function', function () {

        it('will return a regex query', function () {

            const re = linz.api.query.regexp('multiple keywords');

            expect(re).to.eql({ $regex: /multiple|keywords/gi });

        });

        it('will allow overriding the regex querflags', function () {

            const re = linz.api.query.regexp('multiple keywords', 'g');

            expect(re).to.eql({ $regex: /multiple|keywords/g });

        });

    });

    describe('which has a fieldRegexp function', function () {

        it('will return a regex query', function () {

            const re = linz.api.query.fieldRegexp('username', 'multiple keywords');

            expect(re).to.eql({ username: { $regex: /multiple|keywords/gi } });

        });

        it('will allow overriding the regex querflags', function () {

            const re = linz.api.query.fieldRegexp('username', 'multiple keywords', 'g');

            expect(re).to.eql({ username: { $regex: /multiple|keywords/g } });

        });

    });

    describe('can use field and fieldRegexp functions together', function () {

        it('will return a regex query', function () {

            const re = linz.api.query.field('queryModel', 'username', linz.api.query.fieldRegexp('username', 'multiple keywords'));

            expect(re).to.eql({ $or: [ { username: { $regex: /multiple|keywords/gi } } ] });

        });

        it('will allow overriding the regex querflags', function () {

            const re = linz.api.query.field('queryModel', 'username', linz.api.query.fieldRegexp('username', 'multiple keywords', 'g'));

            expect(re).to.eql({ $or: [ { username: { $regex: /multiple|keywords/g } } ] });

        });

    });

});
