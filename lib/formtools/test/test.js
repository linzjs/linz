
// setup easy references
var mongoose = linz.mongoose,
	formtools = linz.formtools;

describe('formtools', function () {

	var PostSchema,
		Text;

	beforeEach(function () {
		PostSchema = new mongoose.Schema({ label: String });
	});

	it('adds the title virtual', function () {

		PostSchema.plugin(formtools.plugin);

		PostSchema.virtuals.should.have.property('title');
		PostSchema.paths.should.have.property('label');

	});

	it('gracefully handles existing title properties', function () {

		// create the schema
		var TestSchema = new mongoose.Schema({ title: String, label: String, name: String });

		// add the plugin
		TestSchema.plugin(formtools.plugin);

		// create the model and a new instance of the model
		var Test = mongoose.model('TestSchema', TestSchema),
			test = new Test();

		// set the title property
		test.title = 'Title value';

		// assert
		TestSchema.virtuals.should.not.have.property('title');
		test.title.should.equal('Title value');

	});

	it('virtual title returns label property second', function () {

		// create the schema
		var LabelTestSchema = new mongoose.Schema({ label: String, name: String });

		// add the plugin
		LabelTestSchema.plugin(formtools.plugin);

		// create the model and a new instance of the model
		var LabelTest = mongoose.model('LabelTest', LabelTestSchema),
			labeltest = new LabelTest();

		// set the label property
		labeltest.label = 'Title value';

		// assert
		LabelTestSchema.virtuals.should.have.property('title');
		labeltest.title.should.equal('Title value');

	});

	it('virtual title returns name property second', function () {

		// create the schema
		var NameTestSchema = new mongoose.Schema({ label: String, name: String });

		// add the plugin
		NameTestSchema.plugin(formtools.plugin);

		// create the model and a new instance of the model
		var NameTest = mongoose.model('NameTest', NameTestSchema),
			nametest = new NameTest();

		// set the label property
		nametest.name = 'Title value';

		// assert
		NameTestSchema.virtuals.should.have.property('title');
		nametest.title.should.equal('Title value');

	});

});