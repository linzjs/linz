'use strict';

const linz = require('linz');

beforeAll((done) => {

    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/renderers-reference',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        const userSchema = new linz.mongoose.Schema({
            name: String,
            org: {
                ref: 'org',
                type: linz.mongoose.Schema.Types.ObjectId,
            },
        }, { autoIndex: false });

        userSchema.plugin(linz.formtools.plugins.document, {
            form: { name: true },
            model: { title: 'name' },
        });

        const orgSchema = new linz.mongoose.Schema({ name: String }, { autoIndex: false });

        orgSchema.plugin(linz.formtools.plugins.document, {
            form: { name: true },
            model: { title: 'name' },
        });

        // Set manually as we're not loading via file.
        linz.set('models', {
            org: linz.mongoose.model('org', orgSchema),
            user: linz.mongoose.model('user', userSchema),
        });

        // Because we aren't loading the models from file, we have to initialise it ourselves.
        linz.initModels();

        return done();

    });

}, 10000);

afterEach(async () => {

    await linz.api.model.get('org').collection.drop();
    await linz.api.model.get('user').collection.drop();

});

test('converts a reference into an overview link', async () => {

    expect.assertions(3);

    const org = new linz.api.model.get('org')({ name: 'Org' });
    const user = new linz.api.model.get('user')({ name: 'User', org: org._id });

    await org.save();
    await user.save();

    const orgRef = await linz.api.renderers.referenceRenderer(user.org, { model: linz.api.model.get('org') });
    expect(orgRef).toBe(`<a href="/admin/model/org/${org._id.toString()}/overview" title="Org">Org</a>`);

    const orgRefNoLink = await linz.api.renderers.referenceRenderer(user.org, {
        link: false,
        model: linz.api.model.get('org'),
    });
    expect(orgRefNoLink).toBe('Org');

    const noVal = await linz.api.renderers.referenceRenderer(null, { default: 'Nothing was provided' });
    expect(noVal).toBe('Nothing was provided');

});
