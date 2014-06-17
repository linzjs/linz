var should = require('should'),
    linz = require('../linz'),
    moment = require('moment');

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
            list = [
                { label: 'option 1', value: 'one'},
                { label: 'option 2', value: 'two'},
            ],
            states = {
                'sa': 'South Australia',
                'qld': 'Queensland',
                'nt': 'Northern Territory'
            },
            CategoriesSchema,
            CategoriesModel,
            CommentsSchema;

        before(function (done) {

            CategoriesSchema = new mongoose.Schema({
                label: String,
                alias: String
            });

            CategoriesSchema.plugin(formtools.plugin, {});

            CategoriesModel = mongoose.model('CategoriesModel', CategoriesSchema);

            CommentsSchema = new mongoose.Schema({
                body: String,
                by: String
            });

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
                favourites: Array,
                groups: String,
                states: Array,
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                secondCategory: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                comments: [CommentsSchema]
			});

			PostSchema.plugin(formtools.plugin, {
				form: {
					firstName: {
						label: 'First Name',
                        placeholder: 'Enter your first name',
                        helpText: 'Enter your first name',
                        required: true,
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
                    favourites: {
                        transform: function (value, mode) {
                            return value;
                        }
                    },
					groups: {
                        list: list
                    },
                    states: {
                        list: states,
                        widget: 'multipleSelect'
                    },
                    category: {
                        query: {
                            filter: {
                                alias: 'specific-value'
                            }
                        }
                    },
                    secondCategory: {
                        query: {
                            filter: {
                                alias: 'second-value'
                            },
                            sort: 'sort',
                            select: 'select',
                            label: function () {

                            }
                        }
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
                favourites: Array,
                groups: String,
                states: Array,
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                code: Number
            });

            OverridesPostSchema.plugin(formtools.plugin, {
                grid: {
                    columns: {
                        title: 'Label',
                        firstName: {
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.overviewLink
                        },
                        email: 'Email',
                        username: 'Username',
                        bActive: 'Is active',
                        groups: {
                            label: 'Groups'
                        },
                        sendWelcomeEmail: {
                            label: 'Welcome email',
                            virtual: true,
                            renderer: function sendWelcomeEmailRenderer(record, fieldName, model, callback) {
                               callback(null,'success');
                            }
                        }
                    },
                    sortBy: ['firstName','lastName','dateModified'],
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    showSummary: false,
                    filters: {
                        firstName: 'First name',
                        lastName: {
                            filter: {
                                renderer: function customFilterRenderer (fieldName, callback) {
                                    callback(null, '<input type="text" name="test1"><input type="text" name="test2">');
                                },
                                filter: function customFilterFilter (fieldName, form, callback) {
                                    callback(null, { firstName: [form.test1, form.test2], lastName: 'doyle' });
                                },
                                bind:  function customFilterBinder (fieldName, form, callback) {
                                    callback(null, ['<input type="text" name="test1" value="' + form.test1 + '"><input type="text" name="test2" value="' + form.test2 + '">']);
                                }
                            }
                        },
                        dateCreated: {
                            label: 'Date created',
                            filter: linz.formtools.filters.date
                        },
                        dateModified: {
                            label: 'Date modified',
                            filter: linz.formtools.filters.dateRange
                        },
                        bActive: {
                            label: 'Is Active?',
                            filter: linz.formtools.filters.checkbox
                        },
                        groups: {
                            label: 'Groups',
                            filter: linz.formtools.filters.list(list)
                        },
                        code: {
                            label: 'Code',
                            filter: linz.formtools.filters.number
                        }
                    }
                },
                form: {
                    firstName: {
                        label: 'First Name',
                        placeholder: 'Enter your first name',
                        helpText: 'Enter your first name',
                        create: {
                            visible: false,
                            disabled: true,
                            placeholder: 'Enter your first name (create)'
                        },
                        edit: {
                            visible: false,
                            disabled: true,
                            placeholder: 'Enter your first name (edit)'
                        }
                    },
                    password: {
                        label: 'Password',
                        visible: false,
                        disabled: true
                    },
                    description: {
                        type: 'text',
                        fieldset: 'Fieldset',
                        create: {
                            fieldset: 'Create fieldset'
                        },
                        edit: {
                            fieldset: 'Edit fieldset'
                        }
                    },
                    favourites: {
                        transform: function transformFavourites (value, mode) {
                            return value;
                        },
                        create: {
                            transform: function transformFavouritesCreate (value, mode) {
                                return value;
                            }
                        },
                        edit: {
                            transform: function transformFavouritesEdit(value, mode) {
                                return value;
                            }
                        }
                    },
                    groups: {
                        list: list
                    },
                    dateModified: {
                        label: 'Date modified'
                    },
                    states: {
                        create: {
                            widget: 'createWidget'
                        },
                        edit: {
                            widget: 'editWidget'
                        }
                    },
                    category: {
                        query: {
                            filter: {
                                alias: 'specific-value'
                            }
                        },
                        create: {
                            query: {
                                filter: {
                                    alias: 'specific-value-create'
                                }
                            }
                        },
                        edit: {
                            query: {
                                filter: {
                                    alias: 'specific-value-edit'
                                }
                            }
                        }
                    }
                },
                overview: {
                    canEdit: false,
                    canDelete: false,
                    viewAll: false,
                    actions: [
                        {
                            action: 'url/slug',
                            label: 'Custom action'
                        }
                    ],
                    summary: {
                        label: 'Quick overview',
                        fields: {
                            dateCreated: {
                                label: 'Date created',
                                renderer: function customCellRenderer (val, record, fieldName, model, callback) {
                                    return callback(null);
                                }
                            },
                            dateModified: {
                                label: 'Date modified'
                            },
                            firstName: {
                                label: 'First name'
                            }
                        }
                    },
                    body: function bodyRenderer (record, callback) {
                        return callback('body content');
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
                },

                function (cb) {

                    OverridesPostModel.getForm(function (err, result) {
                        overridesFormOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    PostModel.getOverview(function (err, result) {
                        overviewOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getOverview(function (err, result) {
                        overridesOverviewOpts = result;
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

                describe('with columns defaults', function () {

                    it('should have a title', function () {
                        gridOpts.columns.title.should.be.an.instanceOf(Object).and.have.property('label', 'Label');
                    });

                    it('should have a overview link renderer for title', function () {
                        gridOpts.columns.title.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.overviewLink);
                    });

                    it('should have a status', function () {
                        gridOpts.columns.status.should.be.an.instanceOf(Object).and.have.property('label', 'Status');
                    });

                    it('should have a published date', function () {
                        gridOpts.columns.publishDate.should.be.an.instanceOf(Object).and.have.property('label', 'Publish date');
                    });

                    it('should have a date renderer for title', function () {
                        gridOpts.columns.publishDate.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.date);
                    });

                    it('should have a created date', function () {
                        gridOpts.columns.dateCreated.should.be.an.instanceOf(Object).and.have.property('label', 'Date created');
                    });

                    it('should have a link renderer for created date', function () {
                        gridOpts.columns.dateCreated.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.date);
                    });

                }); // end describe('columns defaults')

                describe("allowing column overrides", function () {

                    it('should overrides default column fields', function () {
                        // ensure default column fields are cleared
                        (overridesGridOpts.columns.status === undefined).should.be.true;
                    });

                    it('should set custom fields', function () {
                        overridesGridOpts.columns.firstName.should.have.property({
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.overviewLink
                        });
                    });

                    it('should default to overview link rendered for title, if renderer is not provided', function () {
                        overridesGridOpts.columns.title.renderer.name.should.equal('overviewLinkRenderer');
                    });

                }); // end describe('column overrides')

                describe("using cell renderer", function () {

                    describe("array", function () {

                        it("format an array of strings", function (done) {

                            linz.formtools.cellRenderers.array(['one','two','three'], [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('one,<br>two,<br>three');
                                done();

                            });

                        });

                    });

                    describe("date", function () {

                        it("format a date object", function (done) {

                            linz.formtools.cellRenderers.date(new Date(2014,0,1,0,0,0), [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('Wed 01/01/2014');
                                done();

                            });

                        });

                    });

                    describe("link", function () {

                        it("format a string with a link to the overview", function (done) {

                            linz.formtools.cellRenderers.overviewLink('label', {_id: '1'}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="' + linz.get('admin path') + '/PostModel/1/overview">label</a>');
                                done();

                            });

                        });

                    });

                    describe("url", function () {

                        it("format a url starting with http", function (done) {

                            linz.formtools.cellRenderers.url('http://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="http://www.google.com" target="_blank">http://www.google.com</a>');
                                done();

                            });

                        });

                        it("format a url starting with https", function (done) {

                            linz.formtools.cellRenderers.url('https://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="https://www.google.com" target="_blank">https://www.google.com</a>');
                                done();

                            });

                        });

                        it("format a url starting with ftp", function (done) {

                            linz.formtools.cellRenderers.url('ftp://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="ftp://www.google.com" target="_blank">ftp://www.google.com</a>');
                                done();

                            });

                        });

                        it("format a url starting with mailto", function (done) {

                            linz.formtools.cellRenderers.url('mailto:test@example.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="mailto:test@example.com" target="_blank">mailto:test@example.com</a>');
                                done();

                            });

                        });

                        it("format a url starting with ftps", function (done) {

                            linz.formtools.cellRenderers.url('ftps://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="ftps://www.google.com" target="_blank">ftps://www.google.com</a>');
                                done();

                            });

                        });

                        it("format a url string without http", function (done) {

                            linz.formtools.cellRenderers.url('www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="http://www.google.com" target="_blank">www.google.com</a>');
                                done();

                            });

                        });

                    });

                    describe("default", function () {

                        it("format an array of strings", function (done) {

                            linz.formtools.cellRenderers.default(['one','two','three'], [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('one,<br>two,<br>three');
                                done();

                            });

                        });

                        it("format a date object", function (done) {

                            linz.formtools.cellRenderers.default(new Date(2014,0,1,0,0,0), [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('Wed 01/01/2014');
                                done();

                            });

                        });

                    });

                });

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

            describe('virtual columns',function () {

                it('should assign custom cell renderer for virtual column', function () {
                    overridesGridOpts.columns.sendWelcomeEmail.renderer.name.should.equal('sendWelcomeEmailRenderer');
                });

                it('should execute custom cell renderer for virtual column', function (done) {
                    overridesGridOpts.columns.sendWelcomeEmail.renderer({}, 'sendWelcomeEmail', 'mmsUser', function (err, value) {

                        if (err) {
                            throw err;
                        }

                        value.should.equal('success');

                        done();

                    });
                });

                it('should throw an error if custom renderer is not provided for virtual column', function () {

                    var ErrorVirtualColumnsSchema,
                        ErrorVirtualColumnsModel;

                    ErrorVirtualColumnsSchema = new mongoose.Schema({
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

                    try {

                        ErrorVirtualColumnsSchema.plugin(formtools.plugin, {
                            grid: {
                                columns: {
                                    title: 'Label',
                                    firstName: {
                                        label: 'Name',
                                        renderer: linz.formtools.cellRenderers.overviewLink
                                    },
                                    email: 'Email',
                                    username: 'Username',
                                    bActive: 'Is active',
                                    groups: {
                                        label: 'Groups'
                                    },
                                    sendWelcomeEmail: {
                                        label: 'Welcome email',
                                        virtual: true
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

                    } catch (e) {

                        e.message.should.equal('Renderer attribute is missing for virtual column options.grid.columns.sendWelcomeEmail');

                    }

                });

            }); // end describe('virtual columns')

            describe('filters', function () {

                describe('setting filters', function () {

                    it('should convert a key name with string value in the filters to an object', function () {
                        overridesGridOpts.filters.firstName.should.have.property('label', 'First name');
                    });

                    it('should default to key name if a label is not provided in the filters object', function () {
                        overridesGridOpts.filters.lastName.should.have.property('label', 'lastName');
                    });

                    it('should set default filter if none provided', function () {
                        overridesGridOpts.filters.firstName.filter.should.equal(linz.formtools.filters.default);
                    });

                    it('should set custom filter, renderer & bind functions if provided', function () {
                        (overridesGridOpts.filters.lastName.filter.renderer.name === 'customFilterRenderer' && overridesGridOpts.filters.lastName.filter.filter.name === 'customFilterFilter' && overridesGridOpts.filters.lastName.filter.bind.name === 'customFilterBinder').should.be.true;
                    });

                });

                describe('using linz filter', function () {

                    describe('default filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.renderer(fieldName,function (err, result) {
                                result.should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" required>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john','jane'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>');
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName,{ 'firstName': ['john'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName,{ 'firstName': ['john william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john william/ig});
                           });
                        });

                        it('should create filter using regex (OR) matching for multiple filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName,{ 'firstName': ['john','jane'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional one between words', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName,{ 'firstName': ['   john    william   '] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john william/ig});
                           });
                        });

                    });

                    describe('text filter', function () {

                        it('should be the same as default filter', function () {
                            (linz.formtools.filters.text === linz.formtools.filters.default).should.be.true;
                        });

                    });

                    describe('date filter', function () {

                        it('should render date input field', function (done) {
                            var fieldName = 'dateCreated';
                            linz.formtools.filters.date.renderer(fieldName,function (err, result) {
                                result.should.equal('<input type="date" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" required>');
                                done();
                            });

                        });

                        it('should render date input field with form value', function (done) {
                            var fieldName = 'dateCreated';
                            linz.formtools.filters.date.bind(fieldName, { dateCreated: ['2014-05-16'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="date" name="' + fieldName + '[]" class="form-control" value="2014-05-16" data-ui-datepicker="true" required>');
                                done();
                            });

                        });

                        it('should render multiple date input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'dateCreated';
                            linz.formtools.filters.date.bind(fieldName, { dateCreated: ['2014-05-16','2014-05-17'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="date" name="' + fieldName + '[]" class="form-control" value="2014-05-16" data-ui-datepicker="true" required>');
                                result[1].should.equal('<input type="date" name="' + fieldName + '[]" class="form-control" value="2014-05-17" data-ui-datepicker="true" required>');
                                done();
                            });
                        });

                        it('should return a filter object for a single date input', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16'];
                            linz.formtools.filters.date.filter(fieldName,{ 'dateCreated': filterDates }, function (err, result) {
                                result.should.have.property(fieldName, {
                                    $gte: moment(filterDates[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates[0], 'YYYY-MM-DD').endOf('day').toDate()
                                });
                            });

                        });

                        it('should return a filter object for multiple date inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16','2014-05-18','2014-05-20'];

                            linz.formtools.filters.date.filter(fieldName,{ 'dateCreated': filterDates }, function (err, result) {
                               result.should.have.property(fieldName, [
                                        { $gte: moment(filterDates[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates[0], 'YYYY-MM-DD').endOf('day').toDate() },
                                        { $gte: moment(filterDates[1], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates[1], 'YYYY-MM-DD').endOf('day').toDate() },
                                        { $gte: moment(filterDates[2], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates[2], 'YYYY-MM-DD').endOf('day').toDate() }

                                ]);
                            });

                        });

                        it('should throw error if date field is empty', function () {

                            var fieldName = 'dateCreated',
                                filterDates = [];
                            linz.formtools.filters.date.filter(fieldName,{ 'dateCreated': filterDates }, function (err, result) {
                                err.message.should.equal('Date field is empty');
                            });

                        });

                        it('should throw error if a date in one the multiple date filters is not a valid date', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16','2014-05-18','test date'];

                            linz.formtools.filters.date.filter(fieldName,{ 'dateCreated': filterDates }, function (err, result) {
                                err.message.should.equal('One of the dates is invalid');
                            });

                        });

                    });

                    describe('dateRange filter', function () {

                        it('should render 2 date input fields', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.dateRange.renderer(fieldName,function (err, result) {
                                result.should.equal('<span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" data-ui-datepicker="true" required></span>');
                                done();
                            });

                        });

                        it('should render date range input fields with form values', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: ['2014-05-17'] } };

                            linz.formtools.filters.dateRange.bind(fieldName, filterDates, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateFrom[0] + '" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateTo[0] + '" data-ui-datepicker="true" required></span>');
                            });
                        });

                        it('should render multiple date range input fields with form values for multiple filters on the same field', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16','2014-05-18'], dateTo: ['2014-05-17','2014-05-19'] } };

                            linz.formtools.filters.dateRange.bind(fieldName, filterDates, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateFrom[0] + '" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateTo[0] + '" data-ui-datepicker="true" required></span>');
                                result[1].should.equal('<span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateFrom[1] + '" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" value="' + filterDates.dateCreated.dateTo[1] + '" data-ui-datepicker="true" required></span>');
                            });
                        });

                        it('should return a filter object for a date range filter', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: ['2014-05-17'] } };

                            linz.formtools.filters.dateRange.filter(fieldName, filterDates, function (err, result) {
                               result.should.have.property(fieldName, { $gte: moment(filterDates.dateCreated.dateFrom[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates.dateCreated.dateTo[0], 'YYYY-MM-DD').endOf('day').toDate() });
                            });
                        });

                        it('should return a filter object using OR opertor when filtering on multiple date range inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16','2014-05-18','2014-05-20'], dateTo: ['2014-05-16','2014-05-18','2014-05-20'] } };

                            linz.formtools.filters.dateRange.filter(fieldName, filterDates, function (err, result) {

                               result.should.have.property(fieldName, [
                                        { $gte: moment(filterDates.dateCreated.dateFrom[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates.dateCreated.dateTo[0], 'YYYY-MM-DD').endOf('day').toDate() },
                                        { $gte: moment(filterDates.dateCreated.dateFrom[1], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates.dateCreated.dateTo[1], 'YYYY-MM-DD').endOf('day').toDate() },
                                        { $gte: moment(filterDates.dateCreated.dateFrom[2], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(filterDates.dateCreated.dateTo[2], 'YYYY-MM-DD').endOf('day').toDate() }
                                ]);

                            });

                        });

                        it('should throw error if dateTo is missing from the date range filter', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'] } };

                            linz.formtools.filters.dateRange.filter(fieldName, filterDates, function (err, result) {
                                err.message.should.equal('One of the date fields is empty');
                            });

                        });

                        it('should throw error if dateTo is empty in the date range filter', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: [] } };

                            linz.formtools.filters.dateRange.filter(fieldName, filterDates, function (err, result) {
                                err.message.should.equal('One of the date fields is empty');
                            });

                        });

                        it('should throw error if one of date is invalid in one of multiple date range filters', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16','2014-05-20'], dateTo: ['2014-05-17','test date'] } };

                            linz.formtools.filters.dateRange.filter(fieldName, filterDates, function (err, result) {
                                err.message.should.equal('One of the dates is invalid');
                            });

                        });

                    });

                    describe('boolean filter', function () {

                        it('should render checkbox input field', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.boolean.renderer(fieldName,function (err, result) {
                                result.should.equal('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label>');
                                done();
                            });
                        });

                        it('should return a filter object containing a field name and a boolean as the value', function () {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.filter(fieldName,{ 'bActive': 'true' }, function (err, result) {
                               result.should.have.property(fieldName, true);
                            });
                        });

                        it('should render checkbox input field with form value of true', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'true' },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" checked required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label>');
                                done();
                            });
                        });

                        it('should render checkbox input field with form value of false', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'false' },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" checked required> No</label>');
                                done();
                            });
                        });

                    });

                    describe('fulltext filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.renderer(fieldName,function (err, result) {
                                result.should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" required>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john','jane'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>');
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName,{ 'firstName': ['john'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex OR matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName,{ 'firstName': ['john william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle multiple spaces between search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName,{ 'firstName': ['john    william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle trim leading and trailing spaces on search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName,{ 'firstName': ['   john    william   '] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should create filter using regex OR matching for multiple keyword filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName,{ 'firstName': ['john','jane'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                    });

                    describe('list filter', function () {

                        it('should render a select field', function (done) {
                            var fieldName = 'groups';
                            overridesGridOpts.filters.groups.filter.renderer(fieldName,function (err, result) {
                                result.should.equal('<select name="' + fieldName + '[]" class="form-control multiselect"><option value="one">option 1</option><option value="two">option 2</option></select>');
                                done();
                            });
                        });

                        it('should render a select field with multiple selection option attribute', function (done) {
                            var fieldName = 'groups',
                                listFilter = linz.formtools.filters.list(list,true);
                            listFilter.renderer(fieldName,function (err, result) {
                                result.should.equal('<select name="' + fieldName + '[]" class="form-control multiselect" multiple><option value="one">option 1</option><option value="two">option 2</option></select>');
                                done();
                            });
                        });

                        it('should throw error is list attribute is missing', function () {
                            try {
                                var listFilter = linz.formtools.filters.list();
                            } catch (e) {
                                e.message.should.equal('List paramenter is missing for the list filter');
                            }

                        });

                        it('should return a filter using $in operator for OR matching on the selected values', function (done) {
                            var fieldName = 'groups';
                            overridesGridOpts.filters.groups.filter.filter(fieldName, { groups: list}, function (err, result) {
                                result.should.have.property(fieldName, { $in: list });
                                done();
                            });
                        });

                        it('should render select field with form values selected', function (done) {
                            var fieldName = 'groups';
                            overridesGridOpts.filters.groups.filter.bind(fieldName,{ groups: ['one'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<select name="' + fieldName + '[]" class="form-control multiselect"><option value="one" selected>option 1</option><option value="two">option 2</option></select>');
                                done();
                            });
                        });

                    });

                    describe('number filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.renderer(fieldName,function (err, result) {
                                result.should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" required>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100','200'] },function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="200" required>');
                                done();
                            });
                        });

                        it('should create filter to match a "one keyword" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName,{ 'code': ['100'] }, function (err, result) {
                               result.should.have.property(fieldName, [100]);
                           });
                        });

                        it('should create filter to match on a "multiple keywords" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName,{ 'code': ['100','200'] }, function (err, result) {
                               result.should.have.property(fieldName, [100,200]);
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional found between words', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName,{ 'code': ['100',' 200','300 ', ' 400 ', '  500  '] }, function (err, result) {
                               result.should.have.property(fieldName, [100,200,300,400,500]);
                           });
                        });

                    });

                });

                describe('custom filter', function () {

                   it('should render custom filter', function (done) {
                        overridesGridOpts.filters.lastName.filter.renderer('lastName', function(err, result) {
                            result.should.equal('<input type="text" name="test1"><input type="text" name="test2">');
                            done();
                        });
                   });

                   it('should return custom filter', function (done) {
                        overridesGridOpts.filters.lastName.filter.filter('lastName', { test1: 'john', test2: 'jane'}, function(err, result) {
                            result.should.have.properties({
                                firstName: ['john','jane'],
                                lastName: 'doyle'
                            });
                            done();
                        });
                   });

                });

                describe('add search filter', function () {

                    var filters = [];

                    it('should handle string filter', function () {

                        var filter = { firstName: 'john' };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            firstName: ['john']
                        });

                    });

                    it('should handle number filter', function () {

                        var filter = { code: '100' };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            code: [100]
                        });

                    });

                    it('should handle object filter', function () {

                        var filter = { firstName: { $regex: /john/ig } };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            firstName: ['john',{ $regex: /john/ig }]
                        });

                    });

                    it('should handle array filter', function () {

                        var filter = { dateCreated: [
                            { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                        ]};

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            firstName: ['john',{ $regex: /john/ig }],
                            dateCreated: [
                                { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                            ]
                        });

                    });

                    it('should append value to existing filters if already defined', function () {

                        var filter = { dateCreated: [
                            { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                        ]};

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            firstName: ['john',{ $regex: /john/ig }],
                            dateCreated: [
                                { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                            ]
                        });

                    });

                    it('should handle multiple fields in filter', function () {

                        var filter = {
                            dateCreated: [
                                { '$gte': moment('2014-06-04', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-06-04', 'YYYY-MM-DD').endOf('day').toDate() }
                            ],
                            bActive: true,
                            group: ['bdm','rm']
                        };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            firstName: ['john',{ $regex: /john/ig }],
                            dateCreated: [
                                { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-06-04', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-06-04', 'YYYY-MM-DD').endOf('day').toDate() }
                            ],
                            bActive: [true],
                            group: ['bdm','rm']
                        });

                    });

                    it('should handle custom filter', function () {

                        overridesGridOpts.filters.lastName.filter.filter('lastName',{test1: 'john', test2: 'jane'}, function (err, result) {

                            filters = OverridesPostModel.addSearchFilter(filters, result);

                            filters.should.have.properties({
                                firstName: ['john',{ $regex: /john/ig },'john','jane'],
                                dateCreated: [
                                    { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-06-04', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-06-04', 'YYYY-MM-DD').endOf('day').toDate() }
                                ],
                                bActive: [true],
                                group: ['bdm','rm'],
                                lastName: ['doyle']
                            });

                        });

                    });

                });

                describe('set filters as query', function () {

                    var filters = {
                        firstName: 'john',
                        lastName: ['smith', { $regex: /doyle|johnson/ig }],
                        dateCreated: [
                            { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                        ]
                    };
                    var result = {};

                    it('should convert filters to query', function () {

                        result = OverridesPostModel.setFiltersAsQuery(filters);

                        result.should.have.properties({
                            firstName: 'john',
                            $and: [
                                {
                                    $or: [
                                            { lastName: 'smith'},
                                            { lastName: { $regex: /doyle|johnson/ig } }
                                    ]
                                },
                                {
                                    $or: [
                                            { dateCreated: { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() } },
                                            { dateCreated: { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() } },
                                            { dateCreated: { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() } }
                                    ]
                                }
                            ]
                        });

                    });

                    it('should execute the query in mongoose find() with no error', function (done) {
                        OverridesPostModel.find(result, function (err, result) {
                            (err === null).should.be.true;
                            done();
                        });
                    });

                });

            }); // end describe('filters')

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

                    it('should set fieldset, if provided', function () {
                        overridesFormOpts['description'].fieldset.should.equal('Fieldset');
                    });

                    it('should default widget to undefined, if none provided', function () {
                        (formOpts['firstName'].widget === undefined).should.be.ok;
                        formOpts['firstName'].should.have.property('widget');
                    });

                    it('should set widget, if provided', function () {
                        formOpts['states'].widget.should.equal('multipleSelect');
                    });

                    it('should set disabled, if provided', function () {
                        formOpts['states'].required.should.equal(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts['firstName'].required.should.equal(true);
                    });

                    it('should set disabled, if provided', function () {
                        formOpts['states'].required.should.equal(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts['firstName'].required.should.equal(true);
                    });

                    it('should set placeholder, if provided', function () {
                        formOpts['firstName'].placeholder.should.equal('Enter your first name');
                    });

                    it('should default placeholder to undefined, if none provided', function () {
                        formOpts['firstName'].should.have.property('placeholder');
                    });

                    it('should set query, if provided', function () {
                        formOpts['secondCategory'].should.have.property('query');
                        formOpts['secondCategory'].query.should.have.property('filter');
                        formOpts['secondCategory'].query.filter.should.eql({alias:'second-value'});
                        formOpts['secondCategory'].query.should.have.property('sort');
                        formOpts['secondCategory'].query.sort.should.equal('sort');
                        formOpts['secondCategory'].query.should.have.property('select');
                        formOpts['secondCategory'].query.select.should.equal('select');
                        formOpts['secondCategory'].query.should.have.property('label');
                        (typeof formOpts['secondCategory'].query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts['username'].should.have.property('query');
                        formOpts['username'].query.should.have.property('filter');
                        formOpts['username'].query.should.have.property('sort');
                        formOpts['username'].query.should.have.property('select');
                        formOpts['username'].query.should.have.property('label');
                        (formOpts['username'].query.filter === undefined).should.equal(true);
                        (formOpts['username'].query.sort === undefined).should.equal(true);
                        (formOpts['username'].query.select === undefined).should.equal(true);
                        (formOpts['username'].query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts['category'].should.have.property('query');
                        formOpts['category'].query.should.have.property('filter');
                        formOpts['category'].query.should.have.property('sort');
                        formOpts['category'].query.should.have.property('select');
                        formOpts['category'].query.should.have.property('label');
                        formOpts['category'].query.filter.should.eql({alias:'specific-value'});
                        (formOpts['category'].query.sort === undefined).should.equal(true);
                        (formOpts['category'].query.select === undefined).should.equal(true);
                        (formOpts['category'].query.label === undefined).should.equal(true);
                    });

                    it('should set transform if provided', function () {
                        formOpts['favourites'].should.have.property('transform');
                        (typeof formOpts['favourites'].transform === 'function').should.equal(true);
                    });

                    it('should set transform to undefined, if none provided', function () {
                        formOpts['category'].should.have.property('transform');
                        (formOpts['category'].transform === undefined).should.equal(true);
                    });

                    it('should set schema to undefined, if none provided', function () {
                        formOpts['username'].should.have.property('schema');
                        (formOpts['username'].schema === undefined).should.equal(true);
                    });

                    it('should set schema if provided', function () {
                        formOpts['comments'].should.have.property('schema');
                        formOpts['comments'].schema.should.be.an.Object;
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

                    it('should override from fieldset', function () {
                        overridesFormOpts['description'].create.should.have.property('fieldset');
                        overridesFormOpts['description'].create.fieldset.should.equal('Create fieldset');
                    });

                    it('should inherit widget', function () {
                        formOpts['description'].create.should.have.property('widget');
                        (formOpts['description'].create.widget === undefined).should.be.ok;
                    });

                    it('should override widget', function () {
                        overridesFormOpts['states'].create.should.have.property('widget');
                        overridesFormOpts['states'].create.widget.should.equal('createWidget');
                    });

                    it('should inherit placeholder', function () {
                        formOpts['firstName'].create.should.have.property('placeholder');
                        formOpts['firstName'].create.placeholder.should.equal('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        overridesFormOpts['firstName'].create.should.have.property('placeholder');
                        overridesFormOpts['firstName'].create.placeholder.should.equal('Enter your first name (create)');
                    });

                    it('should inherit query, if provided', function () {
                        formOpts['secondCategory'].create.should.have.property('query');
                        formOpts['secondCategory'].create.query.should.have.property('filter');
                        formOpts['secondCategory'].create.query.filter.should.eql({alias:'second-value'});
                        formOpts['secondCategory'].create.query.should.have.property('sort');
                        formOpts['secondCategory'].create.query.sort.should.equal('sort');
                        formOpts['secondCategory'].create.query.should.have.property('select');
                        formOpts['secondCategory'].create.query.select.should.equal('select');
                        formOpts['secondCategory'].create.query.should.have.property('label');
                        (typeof formOpts['secondCategory'].create.query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts['username'].create.should.have.property('query');
                        formOpts['username'].create.query.should.have.property('filter');
                        formOpts['username'].create.query.should.have.property('sort');
                        formOpts['username'].create.query.should.have.property('select');
                        formOpts['username'].create.query.should.have.property('label');
                        (formOpts['username'].create.query.filter === undefined).should.equal(true);
                        (formOpts['username'].create.query.sort === undefined).should.equal(true);
                        (formOpts['username'].create.query.select === undefined).should.equal(true);
                        (formOpts['username'].create.query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts['category'].create.should.have.property('query');
                        formOpts['category'].create.query.should.have.property('filter');
                        formOpts['category'].create.query.should.have.property('sort');
                        formOpts['category'].create.query.should.have.property('select');
                        formOpts['category'].create.query.should.have.property('label');
                        formOpts['category'].create.query.filter.should.eql({alias:'specific-value'});
                        (formOpts['category'].create.query.sort === undefined).should.equal(true);
                        (formOpts['category'].create.query.select === undefined).should.equal(true);
                        (formOpts['category'].create.query.label === undefined).should.equal(true);
                    });

                    it('should override query', function () {
                        overridesFormOpts['category'].create.should.have.property('query');
                        overridesFormOpts['category'].create.query.filter.should.eql({alias:'specific-value-create'});
                        formOpts['category'].create.query.should.have.property('sort');
                        formOpts['category'].create.query.should.have.property('select');
                        formOpts['category'].create.query.should.have.property('label');
                        (formOpts['category'].create.query.sort === undefined).should.equal(true);
                        (formOpts['category'].create.query.select === undefined).should.equal(true);
                        (formOpts['category'].create.query.label === undefined).should.equal(true);
                    });

                    it('should inherit transform', function () {
                        formOpts['category'].create.should.have.property('transform');
                        (formOpts['category'].create.transform === undefined).should.equal(true);
                    });

                    it('should override transform', function () {
                        overridesFormOpts['favourites'].should.have.property('transform');
                        (typeof overridesFormOpts['favourites'].transform === 'function').should.equal(true);
                        overridesFormOpts['favourites'].create.should.have.property('transform');
                        (typeof overridesFormOpts['favourites'].create.transform === 'function').should.equal(true);
                        overridesFormOpts['favourites'].create.transform.name.should.equal('transformFavouritesCreate');
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

                    it('should override from fieldset', function () {
                        overridesFormOpts['description'].edit.should.have.property('fieldset');
                        overridesFormOpts['description'].edit.fieldset.should.equal('Edit fieldset');
                    });

                    it('should inherit widget', function () {
                        formOpts['description'].edit.should.have.property('widget');
                        (formOpts['description'].edit.widget === undefined).should.be.ok;
                    });

                    it('should override widget', function () {
                        overridesFormOpts['states'].edit.should.have.property('widget');
                        overridesFormOpts['states'].edit.widget.should.equal('editWidget');
                    });

                    it('should inherit placeholder', function () {
                        formOpts['firstName'].edit.should.have.property('placeholder');
                        formOpts['firstName'].edit.placeholder.should.equal('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        overridesFormOpts['firstName'].edit.should.have.property('placeholder');
                        overridesFormOpts['firstName'].edit.placeholder.should.equal('Enter your first name (edit)');
                    });

                    it('should inherit query, if provided', function () {
                        formOpts['secondCategory'].edit.should.have.property('query');
                        formOpts['secondCategory'].edit.query.should.have.property('filter');
                        formOpts['secondCategory'].edit.query.filter.should.eql({alias:'second-value'});
                        formOpts['secondCategory'].edit.query.should.have.property('sort');
                        formOpts['secondCategory'].edit.query.sort.should.equal('sort');
                        formOpts['secondCategory'].edit.query.should.have.property('select');
                        formOpts['secondCategory'].edit.query.select.should.equal('select');
                        formOpts['secondCategory'].edit.query.should.have.property('label');
                        (typeof formOpts['secondCategory'].edit.query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts['username'].edit.should.have.property('query');
                        formOpts['username'].edit.query.should.have.property('filter');
                        formOpts['username'].edit.query.should.have.property('sort');
                        formOpts['username'].edit.query.should.have.property('select');
                        formOpts['username'].edit.query.should.have.property('label');
                        (formOpts['username'].edit.query.filter === undefined).should.equal(true);
                        (formOpts['username'].edit.query.sort === undefined).should.equal(true);
                        (formOpts['username'].edit.query.select === undefined).should.equal(true);
                        (formOpts['username'].edit.query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts['category'].edit.should.have.property('query');
                        formOpts['category'].edit.query.should.have.property('filter');
                        formOpts['category'].edit.query.should.have.property('sort');
                        formOpts['category'].edit.query.should.have.property('select');
                        formOpts['category'].edit.query.should.have.property('label');
                        formOpts['category'].edit.query.filter.should.eql({alias:'specific-value'});
                        (formOpts['category'].edit.query.sort === undefined).should.equal(true);
                        (formOpts['category'].edit.query.select === undefined).should.equal(true);
                        (formOpts['category'].edit.query.label === undefined).should.equal(true);
                    });

                    it('should override query', function () {
                        overridesFormOpts['category'].edit.should.have.property('query');
                        overridesFormOpts['category'].edit.query.filter.should.eql({alias:'specific-value-edit'});
                        overridesFormOpts['category'].edit.query.should.have.property('sort');
                        overridesFormOpts['category'].edit.query.should.have.property('select');
                        overridesFormOpts['category'].edit.query.should.have.property('label');
                        (overridesFormOpts['category'].edit.query.sort === undefined).should.equal(true);
                        (overridesFormOpts['category'].edit.query.select === undefined).should.equal(true);
                        (overridesFormOpts['category'].edit.query.label === undefined).should.equal(true);
                    });

                    it('should inherit transform', function () {
                        formOpts['category'].edit.should.have.property('transform');
                        (formOpts['category'].edit.transform === undefined).should.equal(true);
                    });

                    it('should override transform', function () {
                        overridesFormOpts['favourites'].should.have.property('transform');
                        (typeof overridesFormOpts['favourites'].transform === 'function').should.equal(true);
                        overridesFormOpts['favourites'].edit.should.have.property('transform');
                        (typeof overridesFormOpts['favourites'].edit.transform === 'function').should.equal(true);
                        overridesFormOpts['favourites'].edit.transform.name.should.equal('transformFavouritesEdit');
                    });

                });

            }); // end describe('edit form')

        }); // end describe('form')

        describe('overview', function () {

            describe('defaults',function () {

                it('actions should default to []', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('actions');
                    overviewOpts.actions.should.eql([]);

                });

                it('canEdit should default to true', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('canEdit');
                    overviewOpts.canEdit.should.eql(true);

                });

                it('canDelete should default to true', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('canDelete');
                    overviewOpts.canDelete.should.eql(true);

                });

                it('viewAll should default to true', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('viewAll');
                    overviewOpts.canDelete.should.eql(true);

                });

                describe('summary', function () {

                    it('should have a label that defaults to "Summary"', function () {
                        (overviewOpts).should.be.ok;
                        overviewOpts.should.have.property('summary');
                        overviewOpts.summary.should.have.property('label');
                        overviewOpts.summary.label.should.be.equal('Summary');
                    });

                    it('should contain a fields object {dateModified, dateCreated} and a renderer function', function () {

                        overviewOpts.summary.should.have.property('fields');
                        overviewOpts.summary.fields.should.have.properties({
                            dateCreated: {
                                label: 'Date created',
                                renderer: linz.formtools.cellRenderers.date
                            },
                            dateModified: {
                                label: 'Date modified',
                                renderer: linz.formtools.cellRenderers.date
                            }
                        });
                        overviewOpts.summary.should.have.property('renderer');
                        overviewOpts.summary.renderer.should.be.type('function');
                        overviewOpts.summary.renderer.name.should.equal('defaultSummaryRenderer');

                    });

                });


                it('body should default to undefined', function () {

                    (overviewOpts).should.be.ok;
                    (overviewOpts.body === undefined).should.be.true;

                });

            }); // end describe('defaults')

            describe('overrides', function () {

                it('should overrides actions', function () {

                    (overridesOverviewOpts).should.be.ok;
                    overridesOverviewOpts.should.have.property('actions');
                    overridesOverviewOpts.actions.should.be.an.instanceOf(Array);
                    overridesOverviewOpts.actions.should.have.length(1);
                    overridesOverviewOpts.actions[0].should.be.an.Object;
                    overridesOverviewOpts.actions[0].should.have.property('action');
                    overridesOverviewOpts.actions[0].should.have.property('label');

                });

                it('should overrides canEdit', function () {
                    overridesOverviewOpts.canEdit.should.equal(false);
                });

                it('should overrides canDelete', function () {
                    overridesOverviewOpts.canEdit.should.equal(false);
                });

                it('should overrides viewAll', function () {
                    overridesOverviewOpts.viewAll.should.equal(false);
                });

                describe('summary', function () {

                    it('should overrides label', function () {
                        overridesOverviewOpts.summary.label.should.equal('Quick overview');
                    });

                    it('should overrides summary fields and define a default renderer for fields and summary', function () {

                        overridesOverviewOpts.summary.fields.dateCreated.should.have.property('label','Date created');
                        overridesOverviewOpts.summary.fields.dateCreated.should.have.property('renderer');
                        overridesOverviewOpts.summary.fields.dateCreated.renderer.should.be.type('function');
                        overridesOverviewOpts.summary.fields.dateCreated.renderer.name.should.equal('customCellRenderer');

                        overridesOverviewOpts.summary.fields.dateModified.should.have.property('label','Date modified');
                        overridesOverviewOpts.summary.fields.dateModified.should.have.property('renderer');
                        overridesOverviewOpts.summary.fields.dateModified.renderer.should.be.type('function');
                        overridesOverviewOpts.summary.fields.dateModified.renderer.name.should.equal('dateRenderer');

                        overridesOverviewOpts.summary.fields.firstName.should.have.property('label','First name');
                        overridesOverviewOpts.summary.fields.firstName.should.have.property('renderer');
                        overridesOverviewOpts.summary.fields.firstName.renderer.should.be.type('function');
                        overridesOverviewOpts.summary.fields.firstName.renderer.name.should.equal('defaultRenderer');

                        overridesOverviewOpts.summary.should.have.property('renderer');
                        overridesOverviewOpts.summary.renderer.should.be.type('function');
                        overridesOverviewOpts.summary.renderer.name.should.equal('defaultSummaryRenderer')

                    });

                    it('should overrides summary renderer', function (done) {

                        OverridesOverviewSummarySchema = new mongoose.Schema({ label: String });
                        OverridesOverviewSummarySchema.plugin(formtools.plugin, {
                            overview: {
                                summary: {
                                    renderer: function customSummaryRenderer (model, record, callback) {
                                        return callback(null);
                                    }
                                }
                            }
                        });

                        OverridesOverviewSummarySchema = mongoose.model('OverridesOverviewSummary', OverridesOverviewSummarySchema);

                        OverridesOverviewSummarySchema.getOverview(function (err, result) {

                            if (err) {
                                return done(err);
                            }

                            result.summary.should.have.property('renderer');
                            result.summary.renderer.should.be.type('function');
                            result.summary.renderer.name.should.equal('customSummaryRenderer');

                            return done();
                        });

                    });

                }); // describe('summary')


                describe('errors', function () {

                    it('should throw error renderer or fields is not provided in the summary', function () {

                        OverridesOverviewSummarySchema1 = new mongoose.Schema({ label: String });

                        should(function () {
                            OverridesOverviewSummarySchema1.plugin(formtools.plugin, {
                              overview: {
                                  summary: {
                                      something: ''
                                  }
                              }
                            });
                        }).throw('overview.summary.renderer is required if overview.summary.fields is not defined');

                    });

                });



            }); // end describe('overrides')

            describe('renderers', function () {

                it('should have a default summary renderer', function () {

                });

            });

        }); // end describe('overview')

	});

});
