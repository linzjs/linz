'use strict';

const linz = require('../');

beforeAll((done) => {

    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/lib-api-model',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
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

    expect.assertions(6);

    const form = await linz.api.model.generateForm(linz.api.model.get('user'));

    expect(form.options).toBeDefined();
    expect(form.attributes).toBeDefined();
    expect(form.elements).toBeDefined();
    expect(form.renderTag).toBeDefined();
    expect(form.constructor.name).toBe('Form');
    expect(form.elements[0].attributes.name).toBe('name');

});

test('generates form HTML', async () => {

    expect.assertions(1);

    const formString = await linz.api.model.generateFormString(linz.api.model.get('user'));

    expect(formString).toBe('<form role="form" action="#" method="post" data-linz-validation="true" class="form-horizontal model"><div class="form-group control-bar control-bar-top"><div class="col-sm-12"><button type="submit" class="btn btn-primary">Save</button><a href="/" class="btn btn-link">or cancel</a></div></div><input type="hidden" name="versionNo"/><div class="form-group"><label class="col-sm-2 control-label">Name</label><div class="col-sm-10"><input type="text" class="form-control" name="name" data-linz-conflict-handler="textConflictHandler" /></div></div><div class="form-group control-bar"><div class="col-sm-offset-2 col-sm-10"><button type="submit" class="btn btn-primary">Save</button><a href="/" class="btn btn-link">or cancel</a></div></div></form>');

});
