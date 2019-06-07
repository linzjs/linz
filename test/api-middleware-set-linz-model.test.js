'use strict';

jest.mock('linz', () => ({
    api: {
        model: {
            get: () => ({ linz: { formtools: {} } }),
            labels: () => ['label'],
            permissions: (user, model, callback) => callback(null, true),
        },
    },
}));

const {
    getModelFromRequest,
    setLinzModel,
} = require('linz/lib/api/middleware/set-linz-model');

test('getModelFromRequest', () => {

    const paramModel = getModelFromRequest({
        params: {
            config: 'configModel',
            model: 'paramModel',
        },
        path: '/model/pathModel/action/test',
    });

    const configModel = getModelFromRequest({
        params: { config: 'configModel' },
        path: '/model/pathModel/action/test',
    });

    const pathModel = getModelFromRequest({ path: '/model/pathModel/action/test' });

    const nullModel = getModelFromRequest({ path: '/notamodelpath' });
    const nullModel2 = getModelFromRequest({ path: '/models/list' });
    const nullModel3 = getModelFromRequest({ path: '/modeltest' });

    expect(paramModel).toBe('paramModel');
    expect(configModel).toBe('configModel');
    expect(pathModel).toBe('pathModel');
    expect(nullModel).toBeNull();
    expect(nullModel2).toBeNull();
    expect(nullModel3).toBeNull();

});

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
