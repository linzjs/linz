'use strict';

const linz = require('../linz');
const async = require('async');
const moment = require('moment');

let UserSchema;

beforeAll((done) => {

    // Just in case the database connection takes a while.
    jest.setTimeout(10000);

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://localhost:27777/formtools-test',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', function () {

        // setup a basic user model
        UserSchema = new linz.mongoose.Schema({
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

        return done();

    });

});

afterAll((done) => linz.mongoose.connection.close(done));

describe('formtools', function () {

	var PostSchema,
		PostModel;

	describe('extends the schema', function () {

        beforeAll(function () {
            PostSchema = new linz.mongoose.Schema({ label: String });
        });

        it('should throw when not supplied a title field, or model.title property', function () {

            expect(function () {

                (new linz.mongoose.Schema({ username: String })).plugin(linz.formtools.plugins.document);

            }).toThrowError(/You must either have a title field, or the model\.title key/);

		});

        it('should throw when supplied a title field that doesn\'t exist', function () {

            expect(function () {

                (new linz.mongoose.Schema({ username: String })).plugin(linz.formtools.plugins.document, { model: { title: 'missing' } });

            }).toThrowError(/You must reference a title field that exists in the schema/);

		});

		it('it adds the title virtual when not supplied as field', function () {

			PostSchema.plugin(linz.formtools.plugins.document, { model: { title: 'label' } });

			expect(PostSchema.virtuals).toHaveProperty('title');
			expect(PostSchema.paths).toHaveProperty('label');

		});

        it('it does not add the title virtual when supplied as field', function () {

            var TestPostSchema = new linz.mongoose.Schema({ title: String });

			TestPostSchema.plugin(linz.formtools.plugins.document);

			expect(TestPostSchema.virtuals).not.toHaveProperty('title');
			expect(TestPostSchema.paths).not.toHaveProperty('label');

		});

		it('gracefully handles existing title properties', function () {

			// create the schema
			var TestSchema = new linz.mongoose.Schema({ title: String, label: String, name: String });

			// add the plugin
			TestSchema.plugin(linz.formtools.plugins.document);

			// create the model and a new instance of the model
			var Test = linz.mongoose.model('TestSchema', TestSchema),
				test = new Test();

			// set the title property
			test.title = 'Title value';

			// assert
			expect(TestSchema.virtuals).not.toHaveProperty('title');
			expect(test.title).toBe('Title value');

		});

        it('that will favour the toLabel method over title virtual', function () {

			// create the schema
			var TestToLabelSchema = new linz.mongoose.Schema({ name: String, age: Number });

            TestToLabelSchema.methods.toLabel = function () {
                return `${this.name} (${this.age})`;
            }

			// add the plugin
			TestToLabelSchema.plugin(linz.formtools.plugins.document, { model: { title: 'name' } });

			// create the model and a new instance of the model
			var Test = linz.mongoose.model('TestToLabelSchema', TestToLabelSchema),
				test = new Test();

			// set some properties
            test.name = 'John';
            test.age = 25;

			// assert
			expect(TestToLabelSchema.virtuals).toHaveProperty('title');
			expect(test.title).toBe('John (25)');

		});

	});

    describe('sets model options', function () {

        var postModel,
            postModelOptions,
            CommentSchema,
            commentModel,
            commentModelOptions,
            LocationSchema,
            locationModel,
            locationModelOptions;

        beforeAll(function (done) {

            async.parallel([

                function (cb) {

                    PostSchema = new linz.mongoose.Schema({ label: String, title: String });
                    PostSchema.plugin(linz.formtools.plugins.document);

                    postModel = linz.mongoose.model('postModel', PostSchema);

                    postModel.getModelOptions(function (err, result) {

                        postModelOptions = result;
                        return cb(err);

                    });

                },

                function (cb) {

                    CommentSchema = new linz.mongoose.Schema({ label: String });
                    CommentSchema.plugin(linz.formtools.plugins.document, {
                        model: {
                            hide: true,
                            label: 'Comment',
                            plural: 'Comments',
                            title: 'label',
                            description: 'Responses to blog posts'
                        }
                    });

                    commentModel = linz.mongoose.model('commentModel', CommentSchema);

                    commentModel.getModelOptions(function (err, result) {

                        commentModelOptions = result;
                        return cb(err);

                    });

                },

                function (cb) {

                    LocationSchema = new linz.mongoose.Schema({ label: String });
                    LocationSchema.plugin(linz.formtools.plugins.document, {
                        model: {
                            hide: true,
                            label: 'Location',
                            title: 'label',
                        }
                    });

                    locationModel = linz.mongoose.model('locationModel', LocationSchema);

                    locationModel.getModelOptions(function (err, result) {

                        locationModelOptions = result;
                        return cb(err);

                    });

                }

            ], done);

        });

        describe('defaults', function () {

            it('hide to false', function () {

                expect(postModelOptions).toHaveProperty('hide');
                expect(postModelOptions.hide).toBe(false);

            });

            it('label to an empty string', function () {

                expect(postModelOptions).toHaveProperty('label');
                expect(postModelOptions.label).toBe('');

            });

            it('plural to an empty string', function () {

                expect(postModelOptions).toHaveProperty('plural');
                expect(postModelOptions.plural).toBe('');

            });

            it('plural to a pluralized version of label', function () {

                expect(locationModelOptions).toHaveProperty('plural');
                expect(locationModelOptions.plural).toBe('Locations');

            });

            it('description to an empty string', function () {

                expect(postModelOptions).toHaveProperty('description');
                expect(postModelOptions.description).toBe('');

            });

        });

        describe('overrides', function () {

            it('hide', function () {

                expect(commentModelOptions).toHaveProperty('hide');
                expect(commentModelOptions.hide).toBe(true);

            });

            it('label', function () {

                expect(commentModelOptions).toHaveProperty('label');
                expect(commentModelOptions.label).toBe('Comment');

            });

            it('plural', function () {

                expect(commentModelOptions).toHaveProperty('plural');
                expect(commentModelOptions.plural).toBe('Comments');

            });

            it('description', function () {

                expect(postModelOptions).toHaveProperty('description');
                expect(postModelOptions.description).toBe('');
                expect(commentModelOptions).toHaveProperty('description');
                expect(commentModelOptions.description).toBe('Responses to blog posts');

            });

        });

    });

	describe('scaffolds', function () {

        let OverridesPostSchema;
        let OverridesPostModel;
        let labelsOpts;
        let listOpts;
        let overridesListOpts;
        let formOpts;
        let overviewOpts;
        let overridesFormOpts;
        let overridesOverviewOpts;
        let permissionsOpts;
        let overridesPermissionsOpts;
        let list = [
                { label: 'option 1', value: 'one'},
                { label: 'option 2', value: 'two'},
            ];
        let states = {
                'sa': 'South Australia',
                'qld': 'Queensland',
                'nt': 'Northern Territory'
            };
        let CategoriesSchema;
        let CommentsSchema;

        beforeAll(function (done) {

            CategoriesSchema = new linz.mongoose.Schema({
                label: String,
                alias: String,
                title: String,
            });

            CategoriesSchema.plugin(linz.formtools.plugins.document, {});

            linz.mongoose.model('CategoriesModel', CategoriesSchema);

            CommentsSchema = new linz.mongoose.Schema({
                body: String,
                by: String
            });

			PostSchema = new linz.mongoose.Schema({
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
                    type: linz.mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                secondCategory: {
                    type: linz.mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                comments: [CommentsSchema]
			});

			PostSchema.plugin(linz.formtools.plugins.document, {
                model: {
                    title: 'firstName'
                },
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
                        transform: function (value) {
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

			PostModel = linz.mongoose.model('PostModel', PostSchema);

            OverridesPostSchema = new linz.mongoose.Schema({
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
                    type: linz.mongoose.Schema.Types.ObjectId,
                    ref: 'CategoriesModel'
                },
                code: Number
            });

            OverridesPostSchema.plugin(linz.formtools.plugins.document, {
                labels: {
                    firstName: 'First Name',
                    username: 'Username',
                    password: 'Password',
                    email: 'Email',
                    bActive: 'Is active',
                    groups: 'Groups',
                    sendWelcomeEmail: 'Welcome email'
                },
                list: {
                    fields: {
                        title: 'Label',
                        firstName: {
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.overviewLink
                        },
                        email: true,
                        username: true,
                        bActive: true,
                        groups: true,
                        sendWelcomeEmail: {
                            label: 'Welcome emails',
                            virtual: true,
                            renderer: function sendWelcomeEmailRenderer(record, fieldName, model, callback) {
                               callback(null, 'success');
                            }
                        }
                    },
                    sortBy: ['firstName', 'lastName', 'dateModified'],
                    paging: {
                        active: false,
                        size: 50,
                        sizes: [25, 50, 75, 100]
                    },
                    filters: {
                        firstName: 'First name',
                        lastName: {
                            filter: {
                                renderer: function customFilterRenderer (fieldName, callback) {
                                    callback(null, '<template><input type="text" name="test1"><input type="text" name="test2"></template>');
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
                            filter: linz.formtools.filters.date()
                        },
                        dateModified: {
                            label: 'Date modified',
                            filter: linz.formtools.filters.dateRange()
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
                    },
                    groupActions: [{ label: 'Assign category', action: 'group/category'}],
                    recordActions: [{ label: 'Send welcome email', action: 'send-welcome-email'}],
                    export: {
                        label: 'Custom export',
                        action: 'custom-export-url',
                        enable: true,
                        exclusions: '_id,groups'
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
                        transform: function transformFavourites (value) {
                            return value;
                        },
                        create: {
                            transform: function transformFavouritesCreate (value) {
                                return value;
                            }
                        },
                        edit: {
                            transform: function transformFavouritesEdit(value) {
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
                model: {
                    title: 'username'
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
                    body: function bodyRenderer (record, callback) {
                        return callback('body content');
                    }
                },
                permissions: {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canExport: false,
                    canList: false,
                    canView: false,
                    canViewRaw: false
                }
            });

            OverridesPostModel = linz.mongoose.model('OverridesPostModel', OverridesPostSchema);

            async.parallel([

                function (cb) {
                    PostModel.getLabels(function (err, result) {
                        labelsOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    PostModel.getList({}, function (err, result) {
                        listOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getList({}, function (err, result) {
                        overridesListOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    PostModel.getForm({}, function (err, result) {
                        formOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    PostModel.getPermissions(undefined, function (err, result) {
                        permissionsOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getPermissions(undefined, function (err, result) {
                        overridesPermissionsOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getForm({}, function (err, result) {
                        overridesFormOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    PostModel.getOverview({}, function (err, result) {
                        overviewOpts = result;
                        cb(null);
                    });
                },

                function (cb) {
                    OverridesPostModel.getOverview({}, function (err, result) {
                        overridesOverviewOpts = result;
                        cb(null);
                    });
                }

            ], function () {

                // next middleware
                done();

            });

		}); // end beforeAll() for describe('scaffold')

        describe('labels', function () {

            it('should complete any missing labels with thier field names', function () {

                expect(labelsOpts).toHaveProperty('secondCategory');
                expect(labelsOpts.secondCategory).toBe('secondCategory');

            });

            it('should default date modified', function () {

                expect(labelsOpts).toHaveProperty('dateModified');
                expect(labelsOpts.dateModified).toBe('Date modified');

            });

            it('should default date created', function () {

                expect(labelsOpts).toHaveProperty('dateCreated');
                expect(labelsOpts.dateCreated).toBe('Date created');

            });

        });

        describe('list', function () {

            describe('fields', function () {

                describe('with fields defaults', function () {

                    it('should have a title', function () {
                        expect(listOpts.fields.title).toBeInstanceOf(Object);
                        expect(listOpts.fields.title).toHaveProperty('label', 'Title');
                    });

                    it('should have a overview link renderer for title', function () {
                        expect(listOpts.fields.title).toBeInstanceOf(Object);
                        expect(listOpts.fields.title).toHaveProperty('renderer', linz.formtools.cellRenderers.overviewLink);
                    });

                    it('should have a created date', function () {
                        expect(listOpts.fields.dateCreated).toBeInstanceOf(Object);
                        expect(listOpts.fields.dateCreated).toHaveProperty('label', 'Date created');
                    });

                    it('should have a link renderer for created date', function () {
                        expect(listOpts.fields.dateCreated).toBeInstanceOf(Object);
                        expect(listOpts.fields.dateCreated).toHaveProperty('renderer', linz.formtools.cellRenderers.date);
                    });

                }); // end describe('fields defaults')

                describe('allowing field overrides', function () {

                    it('should set custom fields', function () {
                        expect(overridesListOpts.fields.firstName).toMatchObject({
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.overviewLink
                        });
                    });

                    it('should default to overview link rendered for title, if renderer is not provided', function () {
                        expect(overridesListOpts.fields.title.renderer.name).toBe('overviewLinkRenderer');
                    });

                }); // end describe('field overrides')

                describe('using cell renderer', function () {

                    describe('array', function () {

                        it('format an array of strings', function (done) {

                            linz.formtools.cellRenderers.array(['one', 'two', 'three'], [], 'firstName', PostModel, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe('one, two, three');
                                done();

                            });

                        });

                    });

                    describe('date', function () {

                        it('format a date object', function (done) {

                            const d = new Date(2014, 0, 1, 0, 0, 0);

                            linz.formtools.cellRenderers.date(d, [], 'firstName', PostModel, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe(moment(d).format(linz.get('date format')));
                                done();

                            });

                        });

                    });

                    describe('link', function () {

                        it('format a string with a link to the overview', function (done) {

                            linz.formtools.cellRenderers.overviewLink('label', {_id: '1'}, 'firstName', PostModel, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe(
                                    '<a href="' + linz.get('admin path') + '/model/PostModel/1/overview">label</a>'
                                );
                                done();

                            });

                        });

                    });

                    describe('url', function () {

                        it('format a url string', function (done) {

                            linz.formtools.cellRenderers.url('http://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe(
                                    '<a href="http://www.google.com" target="_blank">http://www.google.com</a>'
                                );
                                done();

                            });

                        });

                    });

                    describe('default', function () {

                        it('format an array of strings', function (done) {

                            linz.formtools.cellRenderers.default(['one', 'two', 'three'], [], 'firstName', PostModel, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe('one, two, three');
                                done();

                            });

                        });

                        it('format a date object', function (done) {

                            const d = new Date(2014, 0, 1, 0, 0, 0);

                            linz.formtools.cellRenderers.default(d, [], 'firstName', PostModel, function (err, result) {

                                expect(err === null).toBeTruthy();
                                expect(result).toBe(moment(d).format(linz.get('date format')));
                                done();

                            });

                        });

                    });

                });

            })// end describe('fields')

            describe('permissions', function () {

                describe('default permissions', function () {

                    it('should override can create', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can edit', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can delete', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can export', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can list', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can view', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0);
                    });

                    it('should override can view raw', function () {
                        expect(Object.keys(permissionsOpts)).toHaveLength(0)
                    });

                }); // end describe('default actions')

                describe('overrides permissions', function () {

                    it('should override can create', function () {
                        expect(overridesPermissionsOpts.canCreate).toBeDefined();
                        expect(overridesPermissionsOpts.canCreate).toBe(false);
                    });

                    it('should override can edit', function () {
                        expect(overridesPermissionsOpts.canEdit).toBeDefined();
                        expect(overridesPermissionsOpts.canEdit).toBe(false);
                    });

                    it('should override can delete', function () {
                        expect(overridesPermissionsOpts.canDelete).toBeDefined();
                        expect(overridesPermissionsOpts.canDelete).toBe(false);
                    });

                    it('should override can export', function () {
                        expect(overridesPermissionsOpts.canExport).toBeDefined();
                        expect(overridesPermissionsOpts.canExport).toBe(false);
                    });

                    it('should override can list', function () {
                        expect(overridesPermissionsOpts.canList).toBeDefined();
                        expect(overridesPermissionsOpts.canList).toBe(false);
                    });

                    it('should override can view', function () {
                        expect(overridesPermissionsOpts.canView).toBeDefined();
                        expect(overridesPermissionsOpts.canView).toBe(false);
                    });

                    it('should override can view raw', function () {
                        expect(overridesPermissionsOpts.canViewRaw).toBeDefined();
                        expect(overridesPermissionsOpts.canViewRaw).toBe(false);
                    });

                }); // end describe('overrides actions')

            }); // end describe('action')

            describe('group actions', function () {

                it('should defaults empty array', function () {
                    expect(listOpts.groupActions).toBeInstanceOf(Array);
                    expect(listOpts.groupActions.length).toBe(0);
                });

                it('should override group actions', function () {
                    expect(overridesListOpts.groupActions).toBeInstanceOf(Array);
                    expect(overridesListOpts.groupActions[0]).toMatchObject({
                        label: 'Assign category',
                        action: 'action/group/category'
                    });
                });

            }); // end describe('group actions')

            describe('record actions', function () {

                it('should defaults empty array', function () {
                    expect(listOpts.recordActions).toBeInstanceOf(Array);
                    expect(listOpts.recordActions.length).toBe(0);
                });

                it('should override record actions', function () {
                    expect(overridesListOpts.recordActions).toBeInstanceOf(Array);
                    expect(overridesListOpts.recordActions[0]).toMatchObject({
                        label: 'Send welcome email',
                        action: 'action/send-welcome-email'
                    });
                });

            }); // end describe('group actions')

            describe('export', function () {

                describe('defaults', function () {

                    it('export object should exist', function () {
                        expect(listOpts.export !== undefined).toBeTruthy();
                        expect(listOpts.export).toBeInstanceOf(Array);
                        expect(listOpts.export).toHaveLength(0);
                        expect(typeof listOpts.export === 'object').toBeTruthy();
                    });

                }); // end describe('defaults')

                describe('overrides', function () {

                    it('export object should exist', function () {

                        expect(overridesListOpts.export !== undefined).toBeTruthy();
                        expect(overridesListOpts.export).toBeInstanceOf(Array);
                        expect(overridesListOpts.export).toHaveLength(1);

                    });

                    it('should overwrite enable', function () {
                        expect(overridesListOpts.export[0]).toHaveProperty('enabled');
                        expect(overridesListOpts.export[0].enabled).toBe(false);
                    });

                    it('should overwrite label', function () {
                        expect(overridesListOpts.export[0]).toHaveProperty('label');
                        expect(overridesListOpts.export[0].label).toBe('Custom export');
                    });

                    it('should overwrite action', function () {
                        expect(overridesListOpts.export[0]).toHaveProperty('action');
                        expect(overridesListOpts.export[0].action).toBe('custom-export-url');
                    });

                    it('should overwrite the exclusions', function () {
                        expect(overridesListOpts.export[0]).toHaveProperty('exclusions');
                        expect(overridesListOpts.export[0].exclusions).toBe('_id,groups');
                    });

                }); // end describe('overrides')

            }); // end describe('group actions')

            describe('paging', function () {

                describe('defaults', function () {

                    it('paging object should exist', function () {
                        expect(listOpts.paging !== undefined).toBeTruthy();
                        expect(typeof listOpts.paging === 'object').toBeTruthy();
                        expect(listOpts.paging).toHaveProperty('active');
                        expect(listOpts.paging).toHaveProperty('size');
                        expect(listOpts.paging).toHaveProperty('sizes');
                    });

                    it('paging should be active', function () {
                        expect(listOpts.paging.active).toBe(true);
                    });

                    it('should have a page size of 20', function () {
                        expect(listOpts.paging.size === 20).toBeTruthy();
                    });

                    it('should have sizes [20,50,100,200]', function () {
                        expect(listOpts.paging.sizes).toEqual([20, 50, 100, 200]);
                    });

                }); // end describe('defaults')

                describe('overrides', function () {

                    it('paging object should exist', function () {
                        expect(overridesListOpts.paging !== undefined).toBeTruthy();
                        expect(typeof overridesListOpts.paging === 'object').toBeTruthy();
                        expect(overridesListOpts.paging).toHaveProperty('active');
                        expect(overridesListOpts.paging).toHaveProperty('size');
                        expect(listOpts.paging).toHaveProperty('sizes');
                    });

                    it('should override active', function () {
                        expect(overridesListOpts.paging.active).toBe(false);
                    });

                    it('should override size', function () {
                        expect(overridesListOpts.paging.size === 50).toBeTruthy();
                    });

                    it('should override sizes [25,50,75,100]', function () {
                        expect(overridesListOpts.paging.sizes).toEqual([25, 50, 75, 100]);
                    });

                }); // end describe('overrides')

            }); // end describe('action')

            describe('sorting', function () {

                describe('default sorting', function () {

                    it('should be sorted by date modified', function () {
                        expect(listOpts.sortBy[0]).toMatchObject({
                            label: 'Date modified',
                            field: 'dateModified'
                        });
                    });

                }); // end describe('default sorting')

                describe('overrides sorting', function () {

                    it('should overrides sorting options', function () {

                        expect(overridesListOpts.sortBy).toEqual([
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

            describe('virtual fields', function () {

                it('should assign custom cell renderer for virtual field', function () {
                    expect(overridesListOpts.fields.sendWelcomeEmail.renderer.name).toBe('sendWelcomeEmailRenderer');
                });

                it('should execute custom cell renderer for virtual field', function (done) {
                    overridesListOpts.fields.sendWelcomeEmail.renderer({}, 'sendWelcomeEmail', 'mmsUser', function (err, value) {

                        if (err) {
                            throw err;
                        }

                        expect(value).toBe('success');

                        done();

                    });
                });

                it('should throw an error if custom renderer is not provided for virtual field', function () {

                    var ErrorVirtualFieldsSchema = new linz.mongoose.Schema({
                        firstName: String,
                        lastName: String,
                        username: String,
                        password: String,
                        bActive: {
                            type: Boolean,
                            default: true
                        },
                        description: String,
                        groups: String,
                        title: String,
                    });

                    try {

                        ErrorVirtualFieldsSchema.plugin(linz.formtools.plugins.document, {
                            list: {
                                fields: {
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
                                sortBy: ['firstName', 'lastName', 'dateModified'],
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

                        expect(e.message).toBe(
                            'Renderer attribute is missing for virtual field options.list.fields.sendWelcomeEmail'
                        );

                    }

                });

            }); // end describe('virtual fields')

            describe('filters', function () {

                describe('setting filters', function () {

                    it('should convert a key name with string value in the filters to an object', function () {
                        expect(overridesListOpts.filters.firstName).toHaveProperty('label', 'First name');
                    });

                    it('should default to key name if a label is not provided in the filters object', function () {
                        expect(overridesListOpts.filters.lastName).toHaveProperty('label', 'lastName');
                    });

                    it('should set default filter if none provided', function () {
                        expect(overridesListOpts.filters.firstName.filter).toBe(linz.formtools.filters.default);
                    });

                    it('should set custom filter, renderer & bind functions if provided', function () {
                        expect(
                            overridesListOpts.filters.lastName.filter.renderer.name === 'customFilterRenderer' && overridesListOpts.filters.lastName.filter.filter.name === 'customFilterFilter' && overridesListOpts.filters.lastName.filter.bind.name === 'customFilterBinder'
                        ).toBe(true);
                    });

                });

                describe('using linz filter', function () {

                    describe('default filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>'
                                );
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>'
                                );
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john', 'jane'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(2);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>'
                                );
                                expect(result[1]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>'
                                );
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john william'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should create filter using regex (OR) matching for multiple filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john', 'jane'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional one between words', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['   john    william   '] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|william/ig});
                           });
                        });

                    });

                    describe('text filter', function () {

                        it('should be the same as default filter', function () {
                            expect(linz.formtools.filters.text === linz.formtools.filters.default).toBe(true);
                        });

                    });

                    describe('date filter', function () {

                        it('should render date input field', function (done) {
                            var fieldName = 'dateCreated';
                            linz.formtools.filters.date().renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required></template>'
                                );
                                done();
                            });

                        });

                        it('should render date input field with form value', function (done) {

                            var fieldName = 'dateCreated';
                            var dateString = '2014-05-16';
                            var isoString = moment(dateString, 'YYYY-MM-DD').toISOString();

                            linz.formtools.filters.date().bind(fieldName, { dateCreated: [dateString] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + isoString + '" required>'
                                );
                                done();
                            });

                        });

                        it('should render date input field with a custom date format', function (done) {

                            var fieldName = 'dateCreated';
                            var dateString = '16.05.2014';
                            var dateFormat = 'DD.MM.YYYY';
                            var isoString = moment(dateString, dateFormat).toISOString();

                            linz.formtools.filters.date(dateFormat).bind(fieldName, { dateCreated: [dateString] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="' + isoString + '" required>'
                                );
                                done();
                            });

                        });

                        it('should render multiple date input fields with form values if there are multiple filters on the same field', function (done) {

                            var fieldName = 'dateCreated';
                            var dateFormat = 'YYYY-MM-DD';
                            var dateFromString = '2014-05-16';
                            var dateToString = '2014-05-17';
                            var dateFromIsoString = moment(dateFromString, dateFormat).toISOString();
                            var dateToIsoString = moment(dateToString, dateFormat).toISOString();

                            linz.formtools.filters.date().bind(fieldName, { dateCreated: [dateFromString, dateToString] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(2);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + dateFromIsoString + '" required>'
                                );
                                expect(result[1]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + dateToIsoString + '" required>'
                                );
                                done();
                            });
                        });

                        it('should return a filter object for a single date input', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16'];
                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                                expect(result).toHaveProperty(fieldName, {
                                    $gte: moment(filterDates[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates[0], 'YYYY-MM-DD').endOf('day').toISOString()
                                });
                            });

                        });

                        it('should return a filter object for multiple date inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16', '2014-05-18', '2014-05-20'];

                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, [
                                        { $gte: moment(filterDates[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates[0], 'YYYY-MM-DD').endOf('day').toISOString() },
                                        { $gte: moment(filterDates[1], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates[1], 'YYYY-MM-DD').endOf('day').toISOString() },
                                        { $gte: moment(filterDates[2], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates[2], 'YYYY-MM-DD').endOf('day').toISOString() }

                                ]);
                            });

                        });

                        it('should throw error if date field is empty', function () {

                            var fieldName = 'dateCreated',
                                filterDates = [];
                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err) {
                                expect(err.message).toBe('Date field is empty');
                            });

                        });

                        it('should throw error if a date in one the multiple date filters is not a valid date', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16', '2014-05-18', 'test date'];

                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err) {
                                expect(err.message).toBe('One of the dates is invalid');
                            });

                        });

                        it('should support a custom date format', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['16.05.2014'];
                            linz.formtools.filters.date('DD.MM.YYYY').filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                                expect(result).toHaveProperty(fieldName, {
                                    $gte: moment(filterDates[0], 'DD.MM.YYYY').startOf('day').toISOString(), $lte: moment(filterDates[0], 'DD.MM.YYYY').endOf('day').toISOString()
                                });
                            });

                        });

                    });

                    describe('dateRange filter', function () {

                        it('should render 2 date input fields', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.dateRange().renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required></template>'
                                );
                                done();
                            });

                        });

                        it('should render date range input fields with form values', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: [moment('2014-05-16', 'YYYY-MM-DD').zone('+0:00').toISOString()], dateTo: [moment('2014-05-17', 'YYYY-MM-DD').endOf('day').zone('+0:00').toISOString()] } };

                            linz.formtools.filters.dateRange().bind(fieldName, filterDates, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + filterDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + filterDates.dateCreated.dateTo[0] + '" required>'
                                );
                            });
                        });

                        it('should render date range input fields with a custom date format', function () {

                            var fieldName = 'dateCreated';
                            var dateFormat = 'DD.MM.YYYY';
                            var filterDates = { dateCreated: { dateFrom: ['16.05.2014'], dateTo: ['15.05.2014'] } };
                            var utcDates = { dateCreated: { dateFrom: [moment('16.05.2014', dateFormat).startOf('day').toISOString()], dateTo: [moment('15.05.2014', dateFormat).endOf('day').toISOString()] } };

                            linz.formtools.filters.dateRange(dateFormat).bind(fieldName, filterDates, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="' + utcDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="2014-05-15T23:59:59.999Z" required>'
                                );
                            });

                        });

                        it('should render multiple date range input fields with form values for multiple filters on the same field', function () {

                            var fieldName = 'dateCreated';
                            var dateFormat = 'YYYY-MM-DD';
                            var filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-18'], dateTo: ['2014-05-17', '2014-05-19'] } };
                            var utcDates = { dateCreated: { dateFrom: [moment('2014-05-16', dateFormat).startOf('day').toISOString(), moment('2014-05-18', dateFormat).startOf('day').toISOString()], dateTo: [moment('2014-05-17', dateFormat).endOf('day').toISOString(), moment('2014-05-19', dateFormat).endOf('day').toISOString()] } };

                            linz.formtools.filters.dateRange().bind(fieldName, filterDates, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(2);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + utcDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="2014-05-17T23:59:59.999Z" required>'
                                );
                                expect(result[1]).toBe(
                                    '<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + utcDates.dateCreated.dateFrom[1] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="2014-05-19T23:59:59.999Z" required>'
                                );
                            });
                        });

                        it('should return a filter object for a date range filter', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: ['2014-05-17'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err, result) {
                               expect(result).toHaveProperty(
                                   fieldName,
                                   { $gte: moment(filterDates.dateCreated.dateFrom[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[0], 'YYYY-MM-DD').endOf('day').toISOString() }
                               );
                            });
                        });

                        it('should return a filter object using OR opertor when filtering on multiple date range inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-18', '2014-05-20'], dateTo: ['2014-05-16', '2014-05-18', '2014-05-20'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err, result) {

                               expect(result).toHaveProperty(fieldName, [
                                        { $gte: moment(filterDates.dateCreated.dateFrom[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[0], 'YYYY-MM-DD').endOf('day').toISOString() },
                                        { $gte: moment(filterDates.dateCreated.dateFrom[1], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[1], 'YYYY-MM-DD').endOf('day').toISOString() },
                                        { $gte: moment(filterDates.dateCreated.dateFrom[2], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[2], 'YYYY-MM-DD').endOf('day').toISOString() }
                                ]);

                            });

                        });

                        it('should throw error if dateTo is missing from the date range filter', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err) {
                                expect(err.message).toBe('One of the date fields is empty');
                            });

                        });

                        it('should throw error if dateTo is empty in the date range filter', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: [] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err) {
                                expect(err.message).toBe('One of the date fields is empty');
                            });

                        });

                        it('should throw error if one of date is invalid in one of multiple date range filters', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-20'], dateTo: ['2014-05-17', 'test date'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err) {
                                expect(err.message).toBe('One of the dates is invalid');
                            });

                        });

                        it('should show work with a custom date format', function () {

                            var fieldName = 'dateCreated',
                            filterDates = { dateCreated: { dateFrom: ['16.05.2014'], dateTo: ['17.05.2014'] } };

                            linz.formtools.filters.dateRange('DD.MM.YYYY').filter(fieldName, filterDates, function (err, result) {
                            expect(result).toHaveProperty(
                                fieldName,
                                { $gte: moment(filterDates.dateCreated.dateFrom[0], 'DD.MM.YYYY').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[0], 'DD.MM.YYYY').endOf('day').toISOString() }
                            );
                            });

                        });

                    });

                    describe('boolean filter', function () {

                        it('should render checkbox input field', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.boolean.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label></template>'
                                );
                                done();
                            });
                        });

                        it('should return a filter object containing a field name and a boolean as the value', function () {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.filter(fieldName, { 'bActive': 'true' }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, true);
                            });
                        });

                        it('should render checkbox input field with form value of true', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'true' }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" checked required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label>'
                                );
                                done();
                            });
                        });

                        it('should render checkbox input field with form value of false', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'false' }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" checked required> No</label>'
                                );
                                done();
                            });
                        });

                    });

                    describe('fulltext filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>'
                                );
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>'
                                );
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john', 'jane'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(2);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>'
                                );
                                expect(result[1]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>'
                                );
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex OR matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john william'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle multiple spaces between search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john    william'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle trim leading and trailing spaces on search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['   john    william   '] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should create filter using regex OR matching for multiple keyword filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john', 'jane'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                    });

                    describe('list filter', function () {

                        it('should render a select field', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><select name="' + fieldName + '[]" class="form-control multiselect"><option value="one">option 1</option><option value="two">option 2</option></select></template>'
                                );
                                done();
                            });
                        });

                        it('should render a select field with multiple selection option attribute', function (done) {
                            var fieldName = 'groups',
                                listFilter = linz.formtools.filters.list(list, true);
                            listFilter.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><select name="' + fieldName + '[]" class="form-control multiselect" multiple><option value="one">option 1</option><option value="two">option 2</option></select></template>'
                                );
                                done();
                            });
                        });

                        it('should handle array of string literals as the options', function (done) {
                            var fieldName = 'groups',
                                listFilter = linz.formtools.filters.list(['one', 'two'], true);
                            listFilter.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><select name="' + fieldName + '[]" class="form-control multiselect" multiple><option value="one">one</option><option value="two">two</option></select></template>'
                                );
                                done();
                            });
                        });

                        it('should throw error is list attribute is missing', function () {
                            try {
                                linz.formtools.filters.list();
                            } catch (e) {
                                expect(e.message).toBe('List paramenter is missing for the list filter');
                            }

                        });

                        it('should return a filter using $in operator for OR matching on the selected values', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.filter(fieldName, { groups: list}, function (err, result) {
                                expect(result).toHaveProperty(fieldName, { $in: list });
                                done();
                            });
                        });

                        it('should render select field with form values selected', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.bind(fieldName, { groups: ['one'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<select name="' + fieldName + '[]" class="form-control multiselect"><option value="one" selected>option 1</option><option value="two">option 2</option></select>'
                                );
                                done();
                            });
                        });

                    });

                    describe('number filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.renderer(fieldName, function (err, result) {
                                expect(result).toBe(
                                    '<template><input type="text" name="' + fieldName + '[]" class="form-control" required pattern="[0-9]*" placeholder="Only digits are allowed."></template>'
                                );
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(1);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>'
                                );
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100', '200'] }, function (err, result) {
                                expect(result).toBeInstanceOf(Array);
                                expect(result).toHaveLength(2);
                                expect(result[0]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>'
                                );
                                expect(result[1]).toBe(
                                    '<input type="text" name="' + fieldName + '[]" class="form-control" value="200" required>'
                                );
                                done();
                            });
                        });

                        it('should create filter to match a "one keyword" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, [100]);
                           });
                        });

                        it('should create filter to match on a "multiple keywords" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100', '200'] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, [100, 200]);
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional found between words', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100', ' 200', '300 ', ' 400 ', '  500  '] }, function (err, result) {
                               expect(result).toHaveProperty(fieldName, [100, 200, 300, 400, 500]);
                           });
                        });

                    });

                });

                describe('custom filter', function () {

                   it('should render custom filter', function (done) {
                        overridesListOpts.filters.lastName.filter.renderer('lastName', function(err, result) {
                            expect(result).toBe(
                                '<template><input type="text" name="test1"><input type="text" name="test2"></template>'
                            );
                            done();
                        });
                   });

                   it('should return custom filter', function (done) {
                        overridesListOpts.filters.lastName.filter.filter('lastName', { test1: 'john', test2: 'jane'}, function(err, result) {
                            expect(result).toMatchObject({
                                firstName: ['john', 'jane'],
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

                        expect(filters).toMatchObject({
                            firstName: ['john']
                        });

                    });

                    it('should handle number filter', function () {

                        var filter = { code: 100 };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        expect(filters).toMatchObject({
                            code: [100]
                        });

                    });

                    it('should handle object filter', function () {

                        var filter = { firstName: { $regex: /john/ig } };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        expect(filters).toMatchObject({
                            firstName: ['john', { $regex: /john/ig }]
                        });

                    });

                    it('should handle array filter', function () {

                        var filter = { dateCreated: [
                            { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                            { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() }
                        ]};

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        expect(filters).toMatchObject({
                            firstName: ['john', { $regex: /john/ig }],
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

                        expect(filters).toMatchObject({
                            firstName: ['john', { $regex: /john/ig }],
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
                            group: ['bdm', 'rm']
                        };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        expect(filters).toMatchObject({
                            firstName: ['john', { $regex: /john/ig }],
                            dateCreated: [
                                { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                { '$gte': moment('2014-06-04', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-06-04', 'YYYY-MM-DD').endOf('day').toDate() }
                            ],
                            bActive: [true],
                            group: ['bdm', 'rm']
                        });

                    });

                    it('should handle custom filter', function () {

                        overridesListOpts.filters.lastName.filter.filter('lastName', {test1: 'john', test2: 'jane'}, function (err, result) {

                            filters = OverridesPostModel.addSearchFilter(filters, result);

                            expect(filters).toMatchObject({
                                firstName: ['john', { $regex: /john/ig }, 'john', 'jane'],
                                dateCreated: [
                                    { '$gte': moment('2014-05-16', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-16', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-20', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-20', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-24', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-05-28', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-05-24', 'YYYY-MM-DD').endOf('day').toDate() },
                                    { '$gte': moment('2014-06-04', 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment('2014-06-04', 'YYYY-MM-DD').endOf('day').toDate() }
                                ],
                                bActive: [true],
                                group: ['bdm', 'rm'],
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

                        expect(result).toMatchObject({
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
                        OverridesPostModel.find(result, function (err) {
                            expect(err === null).toBe(true);
                            done();
                        });
                    });

                });

            }); // end describe('filters')

        }); // end  describe('list')


        describe('form', function () {

            describe('form defaults', function () {
                describe('for each field', function () {

                    it('should set the label, if provided', function () {
                        expect(formOpts.firstName.label).toBe('First Name');
                    });

                    it('should default label to field name, if none provided', function () {
                        expect(formOpts.lastName.label).toBe('lastName');
                    });

                    it('should set visible, if provided', function () {
                        expect(formOpts.password.visible).toBe(false);
                    });

                    it('should default visible to true, if none provided', function () {
                        expect(formOpts.firstName.visible).toBe(true);
                    });

                    it('should set disabled, if provided', function () {
                        expect(formOpts.password.disabled).toBe(true);
                    });

                    it('should default disabled to false, if none provided', function () {
                        expect(formOpts.firstName.disabled).toBe(false);
                    });

                    it('should set helpText, if provided', function () {
                        expect(formOpts.firstName.helpText).toBe('Enter your first name');
                    });

                    it('should default helpText to undefined, if none provided', function () {
                        expect(formOpts.password.helpText === undefined).toBe(true);
                    });

                    it('should set type, if provided', function () {
                        expect(formOpts.description.type).toBe('text');
                    });

                    it('should default type to schema type if none provided', function () {
                        expect(formOpts.firstName.type).toBe('string');
                    });

                    it('should set default value, if provided', function () {
                        expect(formOpts.bActive.default).toBe(true);
                    });

                    it('should set default value to undefined, if none provided', function () {
                        expect(formOpts.description.default === undefined).toBe(true);
                    });

                    it('should set list, if provided', function () {
                        expect(formOpts.groups.list).toEqual(list);
                    });

                    it('should default list to undefined, if none provided', function () {
                        expect(formOpts.description.list === undefined).toBe(true);
                    });

                    it('should default fieldset to undefined, if none provided', function () {
                        expect(formOpts.firstName.fieldset === undefined).toBeTruthy();
                        expect(formOpts.firstName).toHaveProperty('fieldset');
                    });

                    it('should set fieldset, if provided', function () {
                        expect(overridesFormOpts.description.fieldset).toBe('Fieldset');
                    });

                    it('should default widget to undefined, if none provided', function () {
                        expect(formOpts.firstName.widget === undefined).toBeTruthy();
                        expect(formOpts.firstName).toHaveProperty('widget');
                    });

                    it('should set widget, if provided', function () {
                        expect(formOpts.states.widget).toBe('multipleSelect');
                    });

                    it('should set disabled, if provided', function () {
                        expect(formOpts.states.required).toBe(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        expect(formOpts.firstName.required).toBe(true);
                    });

                    it('should set disabled, if provided', function () {
                        expect(formOpts.states.required).toBe(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        expect(formOpts.firstName.required).toBe(true);
                    });

                    it('should set placeholder, if provided', function () {
                        expect(formOpts.firstName.placeholder).toBe('Enter your first name');
                    });

                    it('should default placeholder to undefined, if none provided', function () {
                        expect(formOpts.firstName).toHaveProperty('placeholder');
                    });

                    it('should set query, if provided', function () {
                        expect(formOpts.secondCategory).toHaveProperty('query');
                        expect(formOpts.secondCategory.query).toHaveProperty('filter');
                        expect(formOpts.secondCategory.query.filter).toEqual({alias:'second-value'});
                        expect(formOpts.secondCategory.query).toHaveProperty('sort');
                        expect(formOpts.secondCategory.query.sort).toBe('sort');
                        expect(formOpts.secondCategory.query).toHaveProperty('select');
                        expect(formOpts.secondCategory.query.select).toBe('select');
                        expect(formOpts.secondCategory.query).toHaveProperty('label');
                        expect(typeof formOpts.secondCategory.query.label === 'function').toBe(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        expect(formOpts.username).toHaveProperty('query');
                        expect(formOpts.username.query).toHaveProperty('filter');
                        expect(formOpts.username.query).toHaveProperty('sort');
                        expect(formOpts.username.query).toHaveProperty('select');
                        expect(formOpts.username.query).toHaveProperty('label');
                        expect(formOpts.username.query.filter === undefined).toBe(true);
                        expect(formOpts.username.query.sort === undefined).toBe(true);
                        expect(formOpts.username.query.select === undefined).toBe(true);
                        expect(formOpts.username.query.label === undefined).toBe(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        expect(formOpts.category).toHaveProperty('query');
                        expect(formOpts.category.query).toHaveProperty('filter');
                        expect(formOpts.category.query).toHaveProperty('sort');
                        expect(formOpts.category.query).toHaveProperty('select');
                        expect(formOpts.category.query).toHaveProperty('label');
                        expect(formOpts.category.query.filter).toEqual({alias:'specific-value'});
                        expect(formOpts.category.query.sort === undefined).toBe(true);
                        expect(formOpts.category.query.select === undefined).toBe(true);
                        expect(formOpts.category.query.label === undefined).toBe(true);
                    });

                    it('should set transform if provided', function () {
                        expect(formOpts.favourites).toHaveProperty('transform');
                        expect(typeof formOpts.favourites.transform === 'function').toBe(true);
                    });

                    it('should set transform to undefined, if none provided', function () {
                        expect(formOpts.category).toHaveProperty('transform');
                        expect(formOpts.category.transform === undefined).toBe(true);
                    });

                    it('should set schema to undefined, if none provided', function () {
                        expect(formOpts.username).toHaveProperty('schema');
                        expect(formOpts.username.schema === undefined).toBe(true);
                    });

                    it('should set schema if provided', function () {
                        expect(formOpts.comments).toHaveProperty('schema');
                        expect(typeof formOpts.comments.schema).toBe('object');
                    });

                });
            }); // end describe('form default')

            describe('create form', function () {

                describe('for each field', function () {

                    it('should inherit from visible', function () {
                        expect(formOpts.password.create.visible).toBe(false);
                    });

                    it('should override visible', function () {
                        expect(formOpts.firstName.create.visible).toBe(false);
                    });

                    it('should inherit from disabled', function () {
                        expect(formOpts.password.create.disabled).toBe(true);
                    });

                    it('should override disabled', function () {
                        expect(formOpts.firstName.create.disabled).toBe(true);
                    });

                    it('should inherit from fieldset', function () {
                        expect(formOpts.firstName.create).toHaveProperty('fieldset');
                        expect(formOpts.firstName.create.fieldset === undefined).toBeTruthy();
                    });

                    it('should override from fieldset', function () {
                        expect(overridesFormOpts.description.create).toHaveProperty('fieldset');
                        expect(overridesFormOpts.description.create.fieldset).toBe('Create fieldset');
                    });

                    it('should inherit widget', function () {
                        expect(formOpts.description.create).toHaveProperty('widget');
                        expect(formOpts.description.create.widget === undefined).toBeTruthy();
                    });

                    it('should override widget', function () {
                        expect(overridesFormOpts.states.create).toHaveProperty('widget');
                        expect(overridesFormOpts.states.create.widget).toBe('createWidget');
                    });

                    it('should inherit placeholder', function () {
                        expect(formOpts.firstName.create).toHaveProperty('placeholder');
                        expect(formOpts.firstName.create.placeholder).toBe('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        expect(overridesFormOpts.firstName.create).toHaveProperty('placeholder');
                        expect(overridesFormOpts.firstName.create.placeholder).toBe('Enter your first name (create)');
                    });

                    it('should inherit query, if provided', function () {
                        expect(formOpts.secondCategory.create).toHaveProperty('query');
                        expect(formOpts.secondCategory.create.query).toHaveProperty('filter');
                        expect(formOpts.secondCategory.create.query.filter).toEqual({alias:'second-value'});
                        expect(formOpts.secondCategory.create.query).toHaveProperty('sort');
                        expect(formOpts.secondCategory.create.query.sort).toBe('sort');
                        expect(formOpts.secondCategory.create.query).toHaveProperty('select');
                        expect(formOpts.secondCategory.create.query.select).toBe('select');
                        expect(formOpts.secondCategory.create.query).toHaveProperty('label');
                        expect(typeof formOpts.secondCategory.create.query.label === 'function').toBe(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        expect(formOpts.username.create).toHaveProperty('query');
                        expect(formOpts.username.create.query).toHaveProperty('filter');
                        expect(formOpts.username.create.query).toHaveProperty('sort');
                        expect(formOpts.username.create.query).toHaveProperty('select');
                        expect(formOpts.username.create.query).toHaveProperty('label');
                        expect(formOpts.username.create.query.filter === undefined).toBe(true);
                        expect(formOpts.username.create.query.sort === undefined).toBe(true);
                        expect(formOpts.username.create.query.select === undefined).toBe(true);
                        expect(formOpts.username.create.query.label === undefined).toBe(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        expect(formOpts.category.create).toHaveProperty('query');
                        expect(formOpts.category.create.query).toHaveProperty('filter');
                        expect(formOpts.category.create.query).toHaveProperty('sort');
                        expect(formOpts.category.create.query).toHaveProperty('select');
                        expect(formOpts.category.create.query).toHaveProperty('label');
                        expect(formOpts.category.create.query.filter).toEqual({alias:'specific-value'});
                        expect(formOpts.category.create.query.sort === undefined).toBe(true);
                        expect(formOpts.category.create.query.select === undefined).toBe(true);
                        expect(formOpts.category.create.query.label === undefined).toBe(true);
                    });

                    it('should override query', function () {
                        expect(overridesFormOpts.category.create).toHaveProperty('query');
                        expect(overridesFormOpts.category.create.query.filter).toEqual({alias:'specific-value-create'});
                        expect(formOpts.category.create.query).toHaveProperty('sort');
                        expect(formOpts.category.create.query).toHaveProperty('select');
                        expect(formOpts.category.create.query).toHaveProperty('label');
                        expect(formOpts.category.create.query.sort === undefined).toBe(true);
                        expect(formOpts.category.create.query.select === undefined).toBe(true);
                        expect(formOpts.category.create.query.label === undefined).toBe(true);
                    });

                    it('should inherit transform', function () {
                        expect(formOpts.category.create).toHaveProperty('transform');
                        expect(formOpts.category.create.transform === undefined).toBe(true);
                    });

                    it('should override transform', function () {
                        expect(overridesFormOpts.favourites).toHaveProperty('transform');
                        expect(typeof overridesFormOpts.favourites.transform === 'function').toBe(true);
                        expect(overridesFormOpts.favourites.create).toHaveProperty('transform');
                        expect(typeof overridesFormOpts.favourites.create.transform === 'function').toBe(true);
                        expect(overridesFormOpts.favourites.create.transform.name).toBe('transformFavouritesCreate');
                    });

                });

            }); // end describe('create form')

            describe('edit form', function () {

                describe('for each field', function () {

                    it('should inherit visible', function () {
                        expect(formOpts.firstName.edit.visible).toBe(false);
                    });

                    it('should override visible', function () {
                        expect(formOpts.password.edit.visible).toBe(false);
                    });

                    it('should inherit disabled', function () {
                        expect(formOpts.password.edit.disabled).toBe(true);
                    });

                    it('should override disabled', function () {
                        expect(formOpts.firstName.edit.disabled).toBe(true);
                    });

                    it('should inherit from fieldset', function () {
                        expect(formOpts.firstName.edit).toHaveProperty('fieldset');
                        expect(formOpts.firstName.edit.fieldset === undefined).toBeTruthy();
                    });

                    it('should override from fieldset', function () {
                        expect(overridesFormOpts.description.edit).toHaveProperty('fieldset');
                        expect(overridesFormOpts.description.edit.fieldset).toBe('Edit fieldset');
                    });

                    it('should inherit widget', function () {
                        expect(formOpts.description.edit).toHaveProperty('widget');
                        expect(formOpts.description.edit.widget === undefined).toBeTruthy();
                    });

                    it('should override widget', function () {
                        expect(overridesFormOpts.states.edit).toHaveProperty('widget');
                        expect(overridesFormOpts.states.edit.widget).toBe('editWidget');
                    });

                    it('should inherit placeholder', function () {
                        expect(formOpts.firstName.edit).toHaveProperty('placeholder');
                        expect(formOpts.firstName.edit.placeholder).toBe('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        expect(overridesFormOpts.firstName.edit).toHaveProperty('placeholder');
                        expect(overridesFormOpts.firstName.edit.placeholder).toBe('Enter your first name (edit)');
                    });

                    it('should inherit query, if provided', function () {
                        expect(formOpts.secondCategory.edit).toHaveProperty('query');
                        expect(formOpts.secondCategory.edit.query).toHaveProperty('filter');
                        expect(formOpts.secondCategory.edit.query.filter).toEqual({alias:'second-value'});
                        expect(formOpts.secondCategory.edit.query).toHaveProperty('sort');
                        expect(formOpts.secondCategory.edit.query.sort).toBe('sort');
                        expect(formOpts.secondCategory.edit.query).toHaveProperty('select');
                        expect(formOpts.secondCategory.edit.query.select).toBe('select');
                        expect(formOpts.secondCategory.edit.query).toHaveProperty('label');
                        expect(typeof formOpts.secondCategory.edit.query.label === 'function').toBe(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        expect(formOpts.username.edit).toHaveProperty('query');
                        expect(formOpts.username.edit.query).toHaveProperty('filter');
                        expect(formOpts.username.edit.query).toHaveProperty('sort');
                        expect(formOpts.username.edit.query).toHaveProperty('select');
                        expect(formOpts.username.edit.query).toHaveProperty('label');
                        expect(formOpts.username.edit.query.filter === undefined).toBe(true);
                        expect(formOpts.username.edit.query.sort === undefined).toBe(true);
                        expect(formOpts.username.edit.query.select === undefined).toBe(true);
                        expect(formOpts.username.edit.query.label === undefined).toBe(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        expect(formOpts.category.edit).toHaveProperty('query');
                        expect(formOpts.category.edit.query).toHaveProperty('filter');
                        expect(formOpts.category.edit.query).toHaveProperty('sort');
                        expect(formOpts.category.edit.query).toHaveProperty('select');
                        expect(formOpts.category.edit.query).toHaveProperty('label');
                        expect(formOpts.category.edit.query.filter).toEqual({alias:'specific-value'});
                        expect(formOpts.category.edit.query.sort === undefined).toBe(true);
                        expect(formOpts.category.edit.query.select === undefined).toBe(true);
                        expect(formOpts.category.edit.query.label === undefined).toBe(true);
                    });

                    it('should override query', function () {
                        expect(overridesFormOpts.category.edit).toHaveProperty('query');
                        expect(overridesFormOpts.category.edit.query.filter).toEqual({alias:'specific-value-edit'});
                        expect(overridesFormOpts.category.edit.query).toHaveProperty('sort');
                        expect(overridesFormOpts.category.edit.query).toHaveProperty('select');
                        expect(overridesFormOpts.category.edit.query).toHaveProperty('label');
                        expect(overridesFormOpts.category.edit.query.sort === undefined).toBe(true);
                        expect(overridesFormOpts.category.edit.query.select === undefined).toBe(true);
                        expect(overridesFormOpts.category.edit.query.label === undefined).toBe(true);
                    });

                    it('should inherit transform', function () {
                        expect(formOpts.category.edit).toHaveProperty('transform');
                        expect(formOpts.category.edit.transform === undefined).toBe(true);
                    });

                    it('should override transform', function () {
                        expect(overridesFormOpts.favourites).toHaveProperty('transform');
                        expect(typeof overridesFormOpts.favourites.transform === 'function').toBe(true);
                        expect(overridesFormOpts.favourites.edit).toHaveProperty('transform');
                        expect(typeof overridesFormOpts.favourites.edit.transform === 'function').toBe(true);
                        expect(overridesFormOpts.favourites.edit.transform.name).toBe('transformFavouritesEdit');
                    });

                });

            }); // end describe('edit form')

        }); // end describe('form')

        describe('overview', function () {

            describe('defaults', function () {

                it('actions should default to []', function () {

                    expect(overviewOpts).toBeTruthy();
                    expect(overviewOpts).toHaveProperty('actions');
                    expect(overviewOpts.actions).toEqual([]);

                });


                it('body should default to []', function () {

                    expect(overviewOpts).toBeTruthy();
                    expect(overviewOpts).toHaveProperty('body');
                    expect(overviewOpts.body).toBeInstanceOf(Array);

                    const first = overviewOpts.body[0];

                    expect(first).toHaveProperty('label');
                    expect(first.label).toBe('Summary');

                    expect(first).toHaveProperty('fields');
                    expect(first).toBeInstanceOf(Object);

                });

            }); // end describe('defaults')

            describe('overrides', function () {

                it('should overrides actions', function () {

                    expect(overridesOverviewOpts).toBeTruthy();
                    expect(overridesOverviewOpts).toHaveProperty('actions');
                    expect(overridesOverviewOpts.actions).toBeInstanceOf(Array);
                    expect(overridesOverviewOpts.actions).toHaveLength(1);
                    expect(typeof overridesOverviewOpts.actions[0]).toBe('object');
                    expect(overridesOverviewOpts.actions[0]).toHaveProperty('action');
                    expect(overridesOverviewOpts.actions[0]).toHaveProperty('label');

                });

                it('should overrides canEdit', function () {
                    expect(overridesOverviewOpts.canEdit).toBe(false);
                });

                it('should overrides canDelete', function () {
                    expect(overridesOverviewOpts.canEdit).toBe(false);
                });

                it('should overrides viewAll', function () {
                    expect(overridesOverviewOpts.viewAll).toBe(false);
                });


            }); // end describe('overrides')

        }); // end describe('overview')

	});

});
