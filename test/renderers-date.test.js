'use strict';

const linz = require('linz');
const moment = require('moment');

const today = moment();

test('converts a date into a formatted string', async () => {

    expect.assertions(3);

    const todayDate = await linz.api.renderers.dateRenderer();
    expect(todayDate).toBe(moment().format());

    const dayOnly = moment().format('DD');
    const defaultDate = await linz.api.renderers.dateRenderer(null, { default: dayOnly });
    expect(defaultDate).toBe(dayOnly);

    const offset = await linz.api.renderers.dateRenderer(today, { offset: 10 });
    expect(offset).toBe(moment().utcOffset(10).format());

});
