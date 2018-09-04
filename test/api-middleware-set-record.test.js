'use strict';

const setRecord = require('../lib/api/middleware/set-record');

test('it sets the record', () => {

    const req = {
        linz: {
            model: {
                getObject: (id, callback) => callback(null, true),
            },
        },
        params: { id: '' },
    };

    setRecord()(req, {}, (err) => {

        expect(err).toBeFalsy();
        expect(req.linz.record).toBeTruthy();

    });

});
