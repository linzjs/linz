'use strict';

const linz = require('linz');
const {
    initModels,
    setModelConcurrencyControlOptions,
    setModelOptions,
    setModelVersionSettings,
} = require('linz/lib/helpers-models');

beforeEach((done) => {
    linz.init({
        options: {
            'mongo': `${process.env.MONGO_URI}/lib-helper-models`,
            'user model': 'user',
            'load models': false,
            'load configs': false,
        },
    });

    linz.once('initialised', () => {
        const userSchema = new linz.mongoose.Schema({ name: String });

        userSchema.plugin(linz.formtools.plugins.document, {
            list: {
                fields: {
                    name: true,
                },
            },
            model: { title: 'name' },
            overview: {
                summary: {
                    fields: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Set manually as we're not loading via file.
        linz.set('models', { user: linz.mongoose.model('user', userSchema) });

        return done();
    });
}, 10000);

test('initialises the model', async () => {
    const model = linz.api.model.get('user');

    expect.assertions(2);

    expect(model.linz).toBeUndefined();

    await linz.initModels();

    expect(model.linz).toEqual({
        formtools: {
            model: {
                description: '',
                hide: false,
                label: '',
                plural: '',
                title: 'name',
            },
        },
    });
});
