'use strict';

const linz = require('linz');

beforeAll((done) => {

    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/renderers-overview-link',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        const userSchema = new linz.mongoose.Schema({ name: String }, { autoIndex: false });

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

afterEach(async () => {

    await linz.api.model.get('user').collection.drop();

});

test('converts a record id into an overview link', async () => {

    expect.assertions(2);

    const user = await new linz.api.model.get('user')({ name: 'User' }).save();

    const ref = await linz.api.renderers.overviewLinkRenderer(user._id, { model: linz.api.model.get('user') });
    expect(ref).toBe(`/admin/model/user/${user._id.toString()}/overview`);

    const noVal = await linz.api.renderers.overviewLinkRenderer(null, { default: 'Nothing was provided' });
    expect(noVal).toBe('Nothing was provided');

});
