'use strict';

const error = require('linz/lib/api/middleware/error');

test('stores the error on req', () => {

    const err = new Error('Test error');
    const req = {};
    const res = {
        status: jest.fn(code => res),
        send: jest.fn(),
    };

    error(err, req, res);

    expect(req.linz).toBeTruthy();
    expect(req.linz.error.message).toBe(err.message);

});
