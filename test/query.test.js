'use strict';

const linz = require('linz');

let QuerySchema;
let QueryModel;

// Wait for the database
beforeAll((done) => {
    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/query-test',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        },
    });

    linz.once('initialised', () => {
        // Setup a test schema.
        QuerySchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
        });

        QuerySchema.methods.toLabel = () => this.username;

        QuerySchema.virtual('hasAdminAccess').get(() => true);

        // add the plugin
        QuerySchema.plugin(linz.formtools.plugins.document, {
            labels: {
                username: 'Username',
                password: 'Password',
                email: 'Email',
            },
            list: {
                fields: {
                    title: 'Label',
                    email: true,
                    username: true,
                },
                sortBy: ['username', 'email'],
            },
            model: {
                title: 'username',
            },
            form: {
                username: {
                    fieldset: 'Fieldset',
                },
                password: {
                    visible: false,
                    disabled: true,
                },
                email: {
                    fieldset: 'Fieldset',
                },
            },
            overview: {
                canEdit: false,
                canDelete: false,
                viewAll: false,
                body: (record, callback) => callback('body content'),
            },
            permissions: {
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canExport: false,
                canList: false,
                canView: false,
                canViewRaw: false,
            },
        });

        QueryModel = linz.mongoose.model('queryModel', QuerySchema);

        // Set manually as we're not loading via file.
        linz.set('models', {
            queryModel: QueryModel,
        });

        return done();
    });
}, 10000);

afterAll(async () => {
    await linz.mongoose.connection.close();
});

describe('Linz has a query api', () => {
    describe('which has a field function', () => {
        const queryFor = { $in: ['user', 'name'] };

        test('that will throw unless provided a model', () => {
            expect(() => {
                linz.api.query.field();
            }).toThrow('You must pass the modelName argument');
        });

        test('that will throw unless provided a field', () => {
            expect(() => {
                linz.api.query.field('model');
            }).toThrow('You must pass the field argument');
        });

        test('that will throw unless provided a queryFor parameter', () => {
            expect(() => {
                linz.api.query.field('queryModel', 'username');
            }).toThrow('You must pass the queryFor argument');
        });

        test('that will throw unless provided a valid model', () => {
            expect(() => {
                linz.api.query.field('queryModell', 'username', queryFor);
            }).toThrow('The queryModell model could not be found');
        });

        test('that will throw unless provided a valid field', () => {
            expect(() => {
                linz.api.query.field('queryModel', 'usernamee', queryFor);
            }).toThrow('The usernamee field could not be found in queryModel');
        });

        test('that will return a Linz formatted field query', () => {
            expect(
                linz.api.query.field('queryModel', 'username', queryFor)
            ).toEqual({
                $or: [{ username: { $in: ['user', 'name'] } }],
            });
        });
    });

    describe('which has a stringToRegexp function', () => {
        test('will return a regex', () => {
            const re = linz.api.query.stringToRegexp('multiple');

            expect(re).toBeInstanceOf(RegExp);
            expect(re.toString()).toEqual('/multiple/gi');
        });

        test('will return a regex with multiple OR conditions', () => {
            const re = linz.api.query.stringToRegexp('multiple keywords');

            expect(re).toBeInstanceOf(RegExp);
            expect(re.toString()).toEqual('/multiple|keywords/gi');
        });

        test('will escape special characters', () => {
            const re = linz.api.query.stringToRegexp('multiple/ keywords?');

            expect(re).toBeInstanceOf(RegExp);
            expect(re.toString()).toEqual('/multiple\\/|keywords\\?/gi');
        });

        test('will remove non-word characters', () => {
            const re = linz.api.query.stringToRegexp('multiple/ keywords? + .');

            expect(re).toBeInstanceOf(RegExp);
            expect(re.toString()).toEqual('/multiple\\/|keywords\\?/gi');
        });

        test('will allow overriding the regex flags', () => {
            const re = linz.api.query.stringToRegexp('multiple', 'g');

            expect(re).toBeInstanceOf(RegExp);
            expect(re.toString()).toEqual('/multiple/g');
        });
    });

    describe('which has a regexp function', () => {
        test('will return a regex query', () => {
            const re = linz.api.query.regexp('multiple keywords');

            expect(re).toEqual({ $regex: /multiple|keywords/gi });
        });

        test('will allow overriding the regex querflags', () => {
            const re = linz.api.query.regexp('multiple keywords', 'g');

            expect(re).toEqual({ $regex: /multiple|keywords/g });
        });
    });

    describe('which has a fieldRegexp function', () => {
        test('will return a regex query', () => {
            const re = linz.api.query.fieldRegexp(
                'username',
                'multiple keywords'
            );

            expect(re).toEqual({ username: { $regex: /multiple|keywords/gi } });
        });

        test('will allow overriding the regex querflags', () => {
            const re = linz.api.query.fieldRegexp(
                'username',
                'multiple keywords',
                'g'
            );

            expect(re).toEqual({ username: { $regex: /multiple|keywords/g } });
        });
    });

    describe('can use field and fieldRegexp functions together', () => {
        test('will return a regex query', () => {
            const re = linz.api.query.field(
                'queryModel',
                'username',
                linz.api.query.fieldRegexp('username', 'multiple keywords')
            );

            expect(re).toEqual({
                $or: [{ username: { $regex: /multiple|keywords/gi } }],
            });
        });

        test('will allow overriding the regex querflags', () => {
            const re = linz.api.query.field(
                'queryModel',
                'username',
                linz.api.query.fieldRegexp('username', 'multiple keywords', 'g')
            );

            expect(re).toEqual({
                $or: [{ username: { $regex: /multiple|keywords/g } }],
            });
        });
    });
});
