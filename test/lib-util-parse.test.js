'use strict';

const {
    parseDataAttributes,
    parseScriptsAndStyles,
} = require('../lib/util');

test('it does not mutate the original script', () => {

    const doNotMutate = { dataAttributes: { test: 'Should not mutate' } };
    const emptyObj = { dataAttributes: {} };

    const parsedAttributes = parseDataAttributes(doNotMutate);

    // Double check we aren't mutating the original object.
    expect(parseDataAttributes(emptyObj)).not.toBe(emptyObj);
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

test('it parses an array of scripts and styles', () => {

    const script = parseScriptsAndStyles([
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
