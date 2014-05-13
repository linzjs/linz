var should = require('should'),
    linz = require('../linz');

linz.init({
    'mongo': 'mongodb://127.0.0.1/mongoose-formtools-test',
    'user model': 'user',
    'load models': false
});

// setup a basic user model
var UserSchema = new linz.mongoose.Schema({
    username: String,
    password: String,
    email: String
});

UserSchema.methods.toLabel = function () {
    return this.username;
};

UserSchema.virtual('hasAdminAccess').get(function () {
    return true;
});

var User = linz.mongoose.model('User', UserSchema);

User.label = 'Users';
User.singular = 'User';

// setup easy references
var mongoose = linz.mongoose,
	formtools = linz.formtools,
    async = require('async');

describe('formtools', function () {

	var PostSchema,
		PostModel,
		Text;

	describe('extends the schema', function () {

        before(function () {
            PostSchema = new mongoose.Schema({ label: String });
        });

		it('it adds the title virtual', function () {

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

	describe('scaffolds', function () {

        var OverridesPostSchema,
            OverridesPostModel,
            gridOpts,
            overridesGridOpts,
            formOpts,
            overridesFormOpts,
            list = {
                'one' : 'option 1',
                'two' : 'option 2'
            };

        before(function (done) {

			PostSchema = new mongoose.Schema({
				firstName: String,
                lastName: String,
                username: String,
                password: String,
				bActive: {
                    type: Boolean,
                    default: true
                },
                description: String,
                groups: String
			});

			PostSchema.plugin(formtools.plugin, {
				form: {
					firstName: {
						label: 'First Name',
                        helpText: 'Enter your first name',
                        create: {
                            visible: false,
                            disabled: true
                        },
                        edit: {
                            visible: false,
                            disabled: true
                        }
					},
					password: {
						label: 'Password',
                        visible: false,
                        disabled: true
					},
                    description: {
                        type: 'text'
                    },
					groups: {
                        list: list
                    }
				}
			});

			PostModel = mongoose.model('PostModel', PostSchema);

            OverridesPostSchema = new mongoose.Schema({
                firstName: String,
                lastName: String,
                username: String,
                password: String,
                bActive: {
                    type: Boolean,
                    default: true
                },
                description: String,
                groups: String
            });

            OverridesPostSchema.plugin(formtools.plugin, {
                grid: {
                    columns: {
                        firstName: {
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.linkRenderer
                        },
                        email: 'Email',
                        username: 'Username',
                        bActive: 'Is active',
                        groups: {
                            label: 'Groups'
                        }
                    },
                    sortBy: ['firstName','lastName','dateModified'],
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    showSummary: false
                },
                form: {
                    firstName: {
                        label: 'First Name',
                        helpText: 'Enter your first name',
                        create: {
                            visible: false,
                            disabled: true
                        },
                        edit: {
                            visible: false,
                            disabled: true
                        }
                    },
                    password: {
                        label: 'Password',
                        visible: false,
                        disabled: true
                    },
                    description: {
                        type: 'text'
                    },
                    groups: {
                        list: list
                    },
                    dateModified: {
                        label: 'Date modified'
                    }
                }
            });

            OverridesPostModel = mongoose.model('OverridesPostModel', OverridesPostSchema);

            async.parallel([

                function (cb) {
                    PostModel.getGrid(function (err, result) {
                        gridOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getGrid(function (err, result) {
                        overridesGridOpts = result;
                        cb(null);
                    });
                },

                function (cb) {

                    PostModel.getForm(function (err, result) {
                        formOpts = result;
                        cb(null);
                    });
                }

            ], function () {

                // next middleware
                done();

            });

		}); // end before() for describe('scaffold')

        describe('grid', function () {

            describe('columns', function () {

                describe('columns defaults', function () {

                    it('should have a title', function () {
                        gridOpts.columns.title.should.be.an.instanceOf(Object).and.have.property('label', 'Label');
                    });

                    it('should have a link renderer for title', function () {
                        gridOpts.columns.title.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.linkRenderer);
                    });

                    it('should have a status', function () {
                        gridOpts.columns.status.should.be.an.instanceOf(Object).and.have.property('label', 'Status');
                    });

                    it('should have a string renderer for status', function () {
                        gridOpts.columns.status.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.stringRenderer);
                    });

                    it('should have a published date', function () {
                        gridOpts.columns.publishDate.should.be.an.instanceOf(Object).and.have.property('label', 'Publish date');
                    });

                    it('should have a date renderer for title', function () {
                        gridOpts.columns.publishDate.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.dateRenderer);
                    });

                    it('should have a created date', function () {
                        gridOpts.columns.dateCreated.should.be.an.instanceOf(Object).and.have.property('label', 'Date created');
                    });

                    it('should have a link renderer for created date', function () {
                        gridOpts.columns.dateCreated.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.dateRenderer);
                    });

                }); // end describe('columns defaults')

                describe("column overrides", function () {

                    it('should overrides default column fields', function () {
                        // ensure default column fields are cleared
                        (overridesGridOpts.columns.title === undefined).should.be.true;
                    });

                    it('should set custom fields', function () {
                        overridesGridOpts.columns.firstName.should.have.property({
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.linkRenderer
                        });
                    });

                }); // end describe('column overrides')

            })// end describe('columns')

            describe('actions', function () {

                describe('default actions', function () {

                    it('should be able to create new record', function () {
                        gridOpts.canCreate.should.be.true;
                    });

                    it('should be able to edit a record', function () {
                        gridOpts.canEdit.should.be.true;
                    });

                    it('should be able to delete a record', function () {
                        gridOpts.canDelete.should.be.true;
                    });

                    it('should display a summary', function () {
                        gridOpts.showSummary.should.be.true;
                    });

                }); // end describe('default actions')

                describe('overrides actions', function () {

                    it('should override can create', function () {
                        overridesGridOpts.canCreate.should.be.false;
                    })

                    it('should override can edit', function () {
                        overridesGridOpts.canEdit.should.be.false;
                    })

                    it('should override can delete', function () {
                        overridesGridOpts.canDelete.should.be.false;
                    })

                    it('should override show summary', function () {
                        overridesGridOpts.showSummary.should.be.false;
                    })

                }); // end describe('overrides actions')

            }); // end describe('action')

            describe('sorting', function () {

                describe('default sorting', function () {

                    it('should be sorted by date modified', function () {
                        gridOpts.sortBy[0].should.have.property({
                            label: 'Date modified',
                            field: 'dateModified'
                        });
                    });

                }); // end describe('default sorting')

                describe('overrides sorting', function () {

                    it('should overrides sorting options', function () {

                        overridesGridOpts.sortBy.should.eql([
                            {
                                label: 'First Name',
                                field: 'firstName'
                            },
                            {
                                label: 'lastName',
                                field: 'lastName'
                            },
                            {
                                label: 'Date modified',
                                field: 'dateModified'
                            }
                        ]);
                    });

                }); // end describe('overrides sorting')

            }); // end describe('sorting')

        }); // end  describe('grid')


        describe('form', function () {

            describe('form defaults', function () {
                describe('for each field', function () {

                    it('should set the label, if provided', function () {
                        formOpts['firstName'].label.should.equal('First Name');
                    });

                    it('should default label to field name, if none provided', function () {
                        formOpts['lastName'].label.should.equal('lastName');
                    });

                    it('should set visible, if provided', function () {
                        formOpts['password'].visible.should.be.false;
                    });

                    it('should default visible to true, if none provided', function () {
                        formOpts['firstName'].visible.should.be.true;
                    });

                    it('should set disabled, if provided', function () {
                        formOpts['password'].disabled.should.be.true;
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts['firstName'].disabled.should.be.false;
                    });

                    it('should set helpText, if provided', function () {
                        formOpts['firstName'].helpText.should.equal('Enter your first name');
                    });

                    it('should default helpText to undefined, if none provided', function () {
                        (formOpts['password'].helpText === undefined).should.equal.true;
                    });

                    it('should set type, if provided', function () {
                        formOpts['description'].type.should.equal('text');
                    });

                    it('should default type to schema type if none provided', function () {
                        formOpts['firstName'].type.should.equal('string');
                    });

                    it('should set default value, if provided', function () {
                        formOpts['bActive'].default.should.be.true;
                    });

                    it('should set default value to undefined, if none provided', function () {
                        (formOpts['description'].default === undefined).should.equal.true;
                    });

                    it('should set list, if provided', function () {
                        formOpts['groups'].list.should.equal(list);
                    });

                    it('should default list to undefined, if none provided', function () {
                        (formOpts['description'].list === undefined).should.equal.true;
                    });

                    it('should default fieldset to undefined, if none provided', function () {
                        (formOpts['firstName'].fieldset === undefined).should.be.ok;
                        formOpts['firstName'].should.have.property('fieldset');
                    });

                });
            }); // end describe('form default')

    		describe('create form', function () {

    			describe('for each field', function () {

                    it('should inherit from visible', function () {
                        formOpts['password'].create.visible.should.be.false;
                    });

                    it('should override visible', function () {
                        formOpts['firstName'].create.visible.should.be.false;
                    });

                    it('should inherit from disabled', function () {
                        formOpts['password'].create.disabled.should.be.true;
                    });

                    it('should override disabled', function () {
                        formOpts['firstName'].create.disabled.should.be.true;
                    });

                    it('should inherit from fieldset', function () {
                        formOpts['firstName'].create.should.have.property('fieldset');
                        (formOpts['firstName'].create.fieldset === undefined).should.be.ok;
                    });

    			});

    		}); // end describe('create form')

            describe('edit form', function () {

                describe('for each field', function () {

                    it('should inherit visible', function () {
                        formOpts['firstName'].edit.visible.should.be.false;
                    });

                    it('should override visible', function () {
                        formOpts['password'].edit.visible.should.be.false;;
                    });

                    it('should inherit disabled', function () {
                        formOpts['password'].edit.disabled.should.be.true;
                    });

                    it('should override disabled', function () {
                        formOpts['firstName'].edit.disabled.should.be.true;
                    });

                    it('should inherit from fieldset', function () {
                        formOpts['firstName'].edit.should.have.property('fieldset');
                        (formOpts['firstName'].edit.fieldset === undefined).should.be.ok;
                    });

                });

            }); // end describe('edit form')

        }); // end describe('form')


	});

});
