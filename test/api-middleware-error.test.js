'use strict';

const middleware = require('../lib/api/middleware/error');
const { json } = require('../lib/api/error');
const consoleError = console.error;

beforeAll(() => (console.error = jest.fn()));
afterAll(() => (console.error = consoleError));

test('stores the error on req', () => {
    const err = new Error('Test error');
    const req = {};
    const res = {};
    const next = jest.fn();

    middleware(err, req, res, next);

    expect(req.linz).toBeTruthy();
    expect(req.linz.error.message).toBe(err.message);
    expect(next.mock.calls.length).toBe(0);
});

test('CSRF error message is updated', () => {
    const err = new Error('invalid csrf token');
    const req = { body: {} };
    const res = {};
    const next = jest.fn();

    err.code = 'EBADCSRFTOKEN';

    middleware(err, req, res, next);

    expect(req.linz).toBeTruthy();
    expect(req.linz.error.code).toBe('EBADCSRFTOKEN');
    expect(req.linz.error.message).toBe('No CSRF token was provided.');
    expect(next.mock.calls.length).toBe(0);

    req.body._csrf = 'ASDF';

    middleware(err, req, res, next);

    expect(req.linz).toBeTruthy();
    expect(req.linz.error.code).toBe('EBADCSRFTOKEN');
    expect(req.linz.error.message).toBe('The wrong CSRF token was provided.');
    expect(next.mock.calls.length).toBe(0);
});

test('Returns the error via json', () => {
    const err = json(new Error('JSON error test'));
    const req = {};
    const res = { status: jest.fn(() => res), json: jest.fn(() => res) };
    const next = jest.fn();

    middleware(err, req, res, next);

    expect(res.status).toBeCalled();
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status).toBeCalledWith(500);

    expect(res.json).toBeCalled();
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json).toBeCalledWith({ error: err.message });

    expect(next.mock.calls.length).toBe(0);
});

test('The error is logged to console', () => {
    const err = new Error('JSON error test');
    const req = {};
    const res = {};
    const next = jest.fn();

    console.error = jest.fn();

    middleware(err, req, res, next);

    expect(console.error).toBeCalled();
    expect(console.error.mock.calls.length).toBe(1);

    expect(next.mock.calls.length).toBe(0);
});
