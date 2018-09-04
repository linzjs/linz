'use strict';

jest.mock('/app/linz.js', () => ({
    api: {
        model: {
            get: () => ({ linz: { formtools: {} } }),
            labels: () => ['label'],
            permissions: (user, model, callback) => callback(null, true),
        },
    },
}));

const setLinzModel = require('../lib/api/middleware/set-linz-model');

test('it sets the linz model', () => {

    const req = {
        linz: {},
        params: { model: {} },
    };

    setLinzModel()(req, {}, (err) => {

        expect(err).toBeFalsy();
        expect(req.linz.model).toBeTruthy();
        expect(req.linz.model.linz.formtools.labels).toBeTruthy();
        expect(req.linz.model.linz.formtools.permissions).toBeTruthy();

    });

});
