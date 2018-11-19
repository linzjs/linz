'use strict';

const linz = require('linz');

test('converts a boolean into a string', async () => {

    expect.assertions(8);

    const truthy = await linz.api.renderers.booleanRenderer(true);
    expect(truthy).toBe('Yes');

    const truthyCustom = await linz.api.renderers.booleanRenderer('some truthy val');
    expect(truthyCustom).toBe('Yes');

    const falsy = await linz.api.renderers.booleanRenderer(false);
    expect(falsy).toBe('No');

    const falseStr = await linz.api.renderers.booleanRenderer('false');
    expect(falseStr).toBe('No');

    const no = await linz.api.renderers.booleanRenderer('no');
    expect(no).toBe('No');

    const zero = await linz.api.renderers.booleanRenderer('0');
    expect(zero).toBe('No');

    const defaultVal = await linz.api.renderers.booleanRenderer(null, { default: 'Nothing was provided' });
    expect(defaultVal).toBe('Nothing was provided');

    const noVal = await linz.api.renderers.booleanRenderer(null);
    expect(noVal).toBe('No');

});
