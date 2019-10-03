'use strict';

const setLinzNamespace = require('linz/lib/api/middleware/set-linz-namespace');

test('it sets the linz namespace', () => {
    const req = {};

    setLinzNamespace()(req, {}, (err) => {
        expect(err).toBeFalsy();
        expect(req.linz).toBeTruthy();
        expect(req.linz.notifications).toBeTruthy();
        expect(req.linz.cache).toBeTruthy();
        expect(req.linz.cache.navigation).toBeTruthy();
        expect(req.linz.cache.navigation.invalidate).toBe(false);
    });
});
