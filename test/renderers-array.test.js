'use strict';

const linz = require('linz');

test('converts an array into a single string', async () => {

    expect.assertions(3);

    const strings = await linz.api.renderers.arrayRenderer(['test', 'test', 'test']);
    expect(strings).toBe('test, test, test');

    const numbers = await linz.api.renderers.arrayRenderer([1, 2, 3]);
    expect(numbers).toBe('1, 2, 3');

    const noVal = await linz.api.renderers.arrayRenderer(null, { default: 'Nothing was provided' });
    expect(noVal).toBe('Nothing was provided');

});
