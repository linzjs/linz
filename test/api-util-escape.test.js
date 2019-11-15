'use strict';

const { escape } = require('../lib/api/util/escape');
const consoleError = console.error;

beforeAll(() => (console.error = jest.fn()));
afterAll(() => (console.error = consoleError));

test('escapes double quotes', () => {

    expect(escape('A double quote "')).toBe('A double quote &quot;');

});

test('escapes single quotes', () => {

    expect(escape("A single quote '")).toBe('A single quote &#39;');

});

test('escapes less than', () => {

    expect(escape('Less than <')).toBe('Less than &lt;');

});

test('escapes greater than', () => {

    expect(escape('Greater than >')).toBe('Greater than &gt;');

});

test('escapes ampersand than', () => {

    expect(escape('Ampersand &')).toBe('Ampersand &amp;');

});

test('escapes all characters at the same time', () => {

    expect(escape('&<>"')).toBe('&amp;&lt;&gt;&quot;');

});
