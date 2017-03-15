var expect = require('chai').expect,
    linz = require('../linz'),
    mongoose;

// init linz
linz.init({
    'mongo': 'mongodb://127.0.0.1/mongoose-formtools-test',
    'user model': 'user',
    'load models': false,
    'load configs': false
});

mongoose = linz.mongoose;

describe('Linz has an api', function () {

    var UserSchema = new mongoose.Schema({ label: String }),
        UserModel = mongoose.model('user', UserSchema);


	describe('has a getAdminLink method', function () {

        it('it should default to the admin path', function () {
            expect(linz.api.url.getAdminLink()).to.equal('/admin');
        });

        describe("on models", function () {

            it('it should allow a list action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'))).to.equal('/admin/model/user/list');
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'list')).to.equal('/admin/model/user/list');
            });

            it('it should allow a create action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'create')).to.equal('/admin/model/user/create');
            });

            it('it should return the model listing url', function () {
                expect(linz.api.url.getAdminLink(undefined, 'list')).to.equal('/admin/models/list');
            });
        });

        describe("on records", function () {

            it('it should allow an overview action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'), undefined, 'id')).to.equal('/admin/model/user/id/overview');
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'overview', 'id')).to.equal('/admin/model/user/id/overview');
            });

            it('it should allow an edit action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'edit', 'id')).to.equal('/admin/model/user/id/edit');
            });

            it('it should allow a save action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'save', 'id')).to.equal('/admin/model/user/id/save');
            });

            it('it should allow a delete action', function () {
                expect(linz.api.url.getAdminLink(mongoose.model('user'), 'delete', 'id')).to.equal('/admin/model/user/id/delete');
            });

        });

        describe("on configs", function () {

            var config = {
                    schema: new mongoose.Schema({ label: String }),
                    config: { label: ''},
                    modelName: 'config'
            };

            it('it should allow an overview action', function () {
                expect(linz.api.url.getAdminLink(config, undefined, 'id')).to.equal('/admin/config/id/overview');
                expect(linz.api.url.getAdminLink(config, 'overview', 'id')).to.equal('/admin/config/id/overview');
            });

            it('it should allow an edit action', function () {
                expect(linz.api.url.getAdminLink(config, 'edit', 'id')).to.equal('/admin/config/id/edit');
            });

            it('it should allow a save action', function () {
                expect(linz.api.url.getAdminLink(config, 'save', 'id')).to.equal('/admin/config/id/save');
            });

            it('it should allow a delete action', function () {
                expect(linz.api.url.getAdminLink(config, 'delete', 'id')).to.equal('/admin/config/id/delete');
            });

            it('it should return the config listing url', function () {
                expect(linz.api.url.getAdminLink(config, 'list')).to.equal('/admin/configs/list');
            });

        });


	}); // end describe('has a getAdminLink method')

    describe('has a getLink method', function () {

        it('it should default to the admin path', function () {
            expect(linz.api.url.getLink()).to.equal('/admin');
        });

        it('it should generate url with one query parameter', function () {
            expect(linz.api.url.getLink('one')).to.equal('/admin/one');
        });

        it('it should generate url with multiple query parameters', function () {
            expect(linz.api.url.getLink('one', 'two', 'three')).to.equal('/admin/one/two/three');
        });

    });

});
