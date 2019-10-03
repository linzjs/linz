'use strict';

const middleware = require('linz/lib/api/middleware/original-url');
const defaults = require('linz/lib/defaults');

test('it sets the linzReturnUrl cookie', () => {
    const originalUrl = '/something';
    const req = { isAuthenticated: jest.fn(() => false), originalUrl };
    const res = { cookie: jest.fn() };

    middleware()(req, res, (err) => {
        expect(err).toBeFalsy();
        expect(req.isAuthenticated).toBeCalledTimes(1);
        expect(res.cookie).toBeCalledTimes(1);
        expect(res.cookie).toBeCalledWith(
            'linzReturnUrl',
            originalUrl,
            defaults['cookie options']
        );
    });
});
