'use strict';

const {
    parseDataAttributes,
    parseScripts,
} = require('../lib/scripts');

test('it does not mutate the original script', () => {

    const doNotMutate = { dataAttributes: { test: 'Should not mutate' } };

    const parsedAttributes = parseDataAttributes(doNotMutate);

    expect(doNotMutate).toEqual({ dataAttributes: { test: 'Should not mutate' } });
    expect(parsedAttributes).toEqual({ dataAttributes: { 'data-test': 'Should not mutate' } });

});

test('it creates data attributes', () => {

    const script = parseDataAttributes({
        dataAttributes: {
            test: 'test',
            test2: 'test2',
        },
    });

    expect(script).toEqual({
        dataAttributes: {
            'data-test': 'test',
            'data-test2': 'test2',
        },
    });

});

test('it parses an array of scripts', () => {

    const script = parseScripts([
        {
            dataAttributes: {
                test: 'test',
                test2: 'test2',
            },
        },
        {
            dataAttributes: {
                test3: 'test3',
                test4: 'test4',
            },
        },
    ]);

    expect(script).toEqual([
        {
            dataAttributes: {
                'data-test': 'test',
                'data-test2': 'test2',
            },
        },
        {
            dataAttributes: {
                'data-test3': 'test3',
                'data-test4': 'test4',
            },
        },
    ]);

});
