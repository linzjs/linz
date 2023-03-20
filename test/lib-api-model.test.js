'use strict';

const linz = require('linz');

beforeAll((done) => {
    linz.init({
        options: {
            'mongo': `${process.env.MONGO_URI}/lib-api-model`,
            'user model': 'user',
            'load models': false,
            'load configs': false,
        },
    });

    linz.once('initialised', () => {
        const userSchema = new linz.mongoose.Schema({ name: String });

        userSchema.plugin(linz.formtools.plugins.document, {
            form: { name: true },
            model: { title: 'name' },
        });

        // Set manually as we're not loading via file.
        linz.set('models', { user: linz.mongoose.model('user', userSchema) });

        // Because we aren't loading the models from file, we have to initialise it ourselves.
        linz.initModels();

        return done();
    });
}, 10000);

afterAll(() => linz.mongoose.disconnect());

test('generates a form object', async () => {
    expect.assertions(9);

    const userModel = linz.api.model.get('user');

    const form = await linz.api.model.generateForm(userModel, {
        form: {
            name: true,
            test: {
                label: 'Custom test',
            },
        },
    });

    expect(form.options).toBeDefined();
    expect(form.attributes).toBeDefined();
    expect(form.elements).toBeDefined();
    expect(form.renderTag).toBeDefined();
    expect(form.constructor.name).toBe('Form');
    expect(form.elements[0].attributes.name).toBe('name');
    expect(form.elements[0].options.label.label).toBe('Name');
    expect(form.elements[1].attributes.name).toBe('test');
    expect(form.elements[1].options.label.label).toBe('Custom test');
});

test('generates form HTML', async () => {
    expect.assertions(2);

    const formString = await linz.api.model.generateFormString(
        linz.api.model.get('user'),
        {
            form: {
                name: true,
                test: {
                    label: 'Test',
                },
            },
        }
    );

    expect(formString).toMatch(/name=\"name\"/);
    expect(formString).toMatch(/name=\"test\"/);
});
