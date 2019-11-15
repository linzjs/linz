'use strict';

const setModelForm = require('linz/lib/api/middleware/set-model-form');

test('it sets the model form', () => {

    const req = {
        linz: {
            model: {
                getForm: (req, callback) => callback(null, true),
            },
        },
    };

    setModelForm()(req, {}, (err) => {

        expect(err).toBeFalsy();
        expect(req.linz.model.form).toBeTruthy();

    });

});
