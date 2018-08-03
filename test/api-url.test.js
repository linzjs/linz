'use strict';

const linz = require('../linz');

let UserSchema;

// Wait for the database
beforeAll((done) => {

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://localhost:27777/api-url-test',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        }
    });

    linz.once('initialised', () => {

        // Setup the schema
        UserSchema = new linz.mongoose.Schema({ label: String });
        linz.mongoose.model('user', UserSchema);

        return done();

    });

}, 10000);

afterAll((done) => linz.mongoose.connection.close(done));

describe('Linz has a url api', () => {

    describe('has a getAdminLink method', () => {

        test('it should default to the admin path', () => {
            expect(linz.api.url.getAdminLink()).toBe('/admin');
        });

        describe('on models', () => {

            test('it should allow a list action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'))).toBe('/admin/model/user/list');
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'list')).toBe('/admin/model/user/list');
            });

            test('it should allow a create action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'create')).toBe('/admin/model/user/create');
            });

            test('it should return the model listing url', () => {
                expect(linz.api.url.getAdminLink(undefined, 'list')).toBe('/admin/models/list');
            });
        });

        describe('on records', () => {

            test('it should allow an overview action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), undefined, 'id')).toBe('/admin/model/user/id/overview');
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'overview', 'id')).toBe('/admin/model/user/id/overview');
            });

            test('it should allow an edit action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'edit', 'id')).toBe('/admin/model/user/id/edit');
            });

            test('it should allow a save action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'save', 'id')).toBe('/admin/model/user/id/save');
            });

            test('it should allow a delete action', () => {
                expect(linz.api.url.getAdminLink(linz.mongoose.model('user'), 'delete', 'id')).toBe('/admin/model/user/id/delete');
            });

        });

        describe('on configs', () => {

            let config;

            beforeAll(() => {

                config = {
                    schema: new linz.mongoose.Schema({ label: String }),
                    config: { label: ''},
                    modelName: 'config'
                };

            });

            test('it should allow an overview action', () => {
                expect(linz.api.url.getAdminLink(config, undefined, 'id')).toBe('/admin/config/id/overview');
                expect(linz.api.url.getAdminLink(config, 'overview', 'id')).toBe('/admin/config/id/overview');
            });

            test('it should allow an edit action', () => {
                expect(linz.api.url.getAdminLink(config, 'edit', 'id')).toBe('/admin/config/id/edit');
            });

            test('it should allow a save action', () => {
                expect(linz.api.url.getAdminLink(config, 'save', 'id')).toBe('/admin/config/id/save');
            });

            test('it should allow a delete action', () => {
                expect(linz.api.url.getAdminLink(config, 'delete', 'id')).toBe('/admin/config/id/delete');
            });

            test('it should return the config listing url', () => {
                expect(linz.api.url.getAdminLink(config, 'list')).toBe('/admin/configs/list');
            });

        });


	}); // end describe('has a getAdminLink method')

    describe('has a getLink method', () => {

        test('it should default to the admin path', () => {
            expect(linz.api.url.getLink()).toBe('/admin');
        });

        test('it should generate url with one query parameter', () => {
            expect(linz.api.url.getLink('one')).toBe('/admin/one');
        });

        test('it should generate url with multiple query parameters', () => {
            expect(linz.api.url.getLink('one', 'two', 'three')).toBe('/admin/one/two/three');
        });

    });

});
