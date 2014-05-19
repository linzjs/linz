var expect = require('chai').expect,
    linz = require('../linz');

describe('Linz has an api', function () {

    before(function () {

        // init linz
        linz.init({
            'mongo': 'mongodb://127.0.0.1/mongoose-formtools-test',
            'user model': 'user',
            'load models': false
        });

    });

	describe('has a getAdminLink method', function () {

        it('it should default to the admin path', function () {
            expect(linz.api.getAdminLink()).to.equal('/admin');
        });

        it('it should return the model listing url', function () {
            expect(linz.api.getAdminLink(undefined, 'list')).to.equal('/admin/models/list');
        });

        describe("on models", function () {

            it('it should allow a list action', function () {
                expect(linz.api.getAdminLink('user')).to.equal('/admin/model/user/list');
                expect(linz.api.getAdminLink('user', 'list')).to.equal('/admin/model/user/list');
            });

            it('it should allow a create action', function () {
                expect(linz.api.getAdminLink('user', 'create')).to.equal('/admin/model/user/create');
            });

        });

        describe("on records", function () {

            it('it should allow an overview action', function () {
                expect(linz.api.getAdminLink('user', undefined, 'id')).to.equal('/admin/user/id/overview');
                expect(linz.api.getAdminLink('user', 'overview', 'id')).to.equal('/admin/user/id/overview');
            });

            it('it should allow an edit action', function () {
                expect(linz.api.getAdminLink('user', 'edit', 'id')).to.equal('/admin/user/id/edit');
            });

            it('it should allow a save action', function () {
                expect(linz.api.getAdminLink('user', 'save', 'id')).to.equal('/admin/user/id/save');
            });

            it('it should allow a delete action', function () {
                expect(linz.api.getAdminLink('user', 'delete', 'id')).to.equal('/admin/user/id/delete');
            });

        });

	});

});
