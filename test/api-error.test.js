'use strict';

const { json, store } = require('linz/lib/api/error');

test('stores the error on req', () => {

    const err = new Error('Test error');
    const req = {};

    store(err, req);

    expect(req.linz).toBeTruthy();
    expect(req.linz.error.message).toBe(err.message);

});

test('sets json and statusCode properties on an error', () => {

    const err = new Error('Test error');

    json(err);

    expect(err.json).toBeDefined();
    expect(err.json).toBeTruthy();

    expect(err.statusCode).toBeDefined();
    expect(err.statusCode).toBe(500);

});
