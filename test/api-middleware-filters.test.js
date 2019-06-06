'use strict';

const { getFilters } = require('linz/lib/api/middleware/filters');

test('getFilters', async () => {

    expect.assertions(1);

    const result = getFilters({
        body: {
            '_csrf': 'jax8OKTT-kXltsUkA1GB6iouHWkeYZacoMGc',
            'filters': '{\'_csrf\':\'hohQlFpz-NlXdO1Cu5i8PV1glaQSCnylgAjI\',\'search\':\'typical\',\'page\':\'1\',\'pageSize\':\'20\',\'selectedFilters\':\'\',\'sort\':\'businessName\'}',
            'selectedFields': '',
            'selectedIds': '',
            'submit': ''
        },
    });

    expect(result).toEqual({});

});
