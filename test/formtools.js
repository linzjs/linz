/* eslint-env mocha */

var linz = require('../linz'),
    moment = require('moment');

// We'll also need `should`.
require('should');

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
		PostModel;

	describe('extends the schema', function () {

        before(function () {
            PostSchema = new mongoose.Schema({ label: String });
        });

        it('should throw when not supplied a title field, or model.title property', function () {

            (function () {

                (new mongoose.Schema({ username: String })).plugin(formtools.plugins.document);

            }).should.throw(/You must either have a title field, or the model\.title key/);

		});

        it('should throw when supplied a title field that doesn\'t exist', function () {

            (function () {

                (new mongoose.Schema({ username: String })).plugin(formtools.plugins.document, { model: { title: 'missing' } });

            }).should.throw(/You must reference a title field that exists in the schema/);

		});

		it('it adds the title virtual when not supplied as field', function () {

			PostSchema.plugin(formtools.plugins.document, { model: { title: 'label' } });

			PostSchema.virtuals.should.have.property('title');
			PostSchema.paths.should.have.property('label');

		});

        it('it does not add the title virtual when supplied as field', function () {

            var TestPostSchema = new mongoose.Schema({ title: String });

			TestPostSchema.plugin(formtools.plugins.document);

			TestPostSchema.virtuals.should.not.have.property('title');
			TestPostSchema.paths.should.not.have.property('label');

		});

		it('gracefully handles existing title properties', function () {

			// create the schema
			var TestSchema = new mongoose.Schema({ title: String, label: String, name: String });

			// add the plugin
			TestSchema.plugin(formtools.plugins.document);

			// create the model and a new instance of the model
			var Test = mongoose.model('TestSchema', TestSchema),
				test = new Test();

			// set the title property
			test.title = 'Title value';

			// assert
			TestSchema.virtuals.should.not.have.property('title');
			test.title.should.equal('Title value');

		});

        it('that will favour the toLabel method over title virtual', function () {

			// create the schema
			var TestToLabelSchema = new mongoose.Schema({ name: String, age: Number });

            TestToLabelSchema.methods.toLabel = function () {
                return `${this.name} (${this.age})`;
            }

			// add the plugin
			TestToLabelSchema.plugin(formtools.plugins.document, { model: { title: 'name' } });

			// create the model and a new instance of the model
			var Test = mongoose.model('TestToLabelSchema', TestToLabelSchema),
				test = new Test();

			// set some properties
            test.name = 'John';
            test.age = 25;

			// assert
			TestToLabelSchema.virtuals.should.have.property('title');
			test.title.should.equal('John (25)');

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

        before(function (done) {

            async.parallel([

                function (cb) {

                    PostSchema = new mongoose.Schema({ label: String, title: String });
                    PostSchema.plugin(formtools.plugins.document);

                    postModel = mongoose.model('postModel', PostSchema);

                    postModel.getModelOptions(function (err, result) {

                        postModelOptions = result;
                        return cb(err);

                    });

                },

                function (cb) {

                    CommentSchema = new mongoose.Schema({ label: String });
                    CommentSchema.plugin(formtools.plugins.document, {
                        model: {
                            hide: true,
                            label: 'Comment',
                            plural: 'Comments',
                            title: 'label',
                            description: 'Responses to blog posts'
                        }
                    });

                    commentModel = mongoose.model('commentModel', CommentSchema);

                    commentModel.getModelOptions(function (err, result) {

                        commentModelOptions = result;
                        return cb(err);

                    });

                },

                function (cb) {

                    LocationSchema = new mongoose.Schema({ label: String });
                    LocationSchema.plugin(formtools.plugins.document, {
                        model: {
                            hide: true,
                            label: 'Location',
                            title: 'label',
                        }
                    });

                    locationModel = mongoose.model('locationModel', LocationSchema);

                    locationModel.getModelOptions(function (err, result) {

                        locationModelOptions = result;
                        return cb(err);

                    });

                }

            ], done);

        });

        describe('defaults', function () {

            it('hide to false', function () {

                postModelOptions.should.have.property('hide');
                postModelOptions.hide.should.equal(false);

            });

            it('label to an empty string', function () {

                postModelOptions.should.have.property('label');
                postModelOptions.label.should.equal('');

            });

            it('plural to an empty string', function () {

                postModelOptions.should.have.property('plural');
                postModelOptions.plural.should.equal('');

            });

            it('plural to a pluralized version of label', function () {

                locationModelOptions.should.have.property('plural');
                locationModelOptions.plural.should.equal('Locations');

            });

            it('description to an empty string', function () {

                postModelOptions.should.have.property('description');
                postModelOptions.description.should.equal('');

            });

        });

        describe('overrides', function () {

            it('hide', function () {

                commentModelOptions.should.have.property('hide');
                commentModelOptions.hide.should.equal(true);

            });

            it('label', function () {

                commentModelOptions.should.have.property('label');
                commentModelOptions.label.should.equal('Comment');

            });

            it('plural', function () {

                commentModelOptions.should.have.property('plural');
                commentModelOptions.plural.should.equal('Comments');

            });

            it('description', function () {

                postModelOptions.should.have.property('description');
                postModelOptions.description.should.equal('');
                commentModelOptions.should.have.property('description');
                commentModelOptions.description.should.equal('Responses to blog posts');

            });

        });

    });

	describe('scaffolds', function () {

        var OverridesPostSchema,
            OverridesPostModel,
            labelsOpts,
            listOpts,
            overridesListOpts,
            formOpts,
            overviewOpts,
            overridesFormOpts,
            overridesOverviewOpts,
            permissionsOpts,
            overridesPermissionsOpts,
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
            CommentsSchema;

        before(function (done) {

            CategoriesSchema = new mongoose.Schema({
                label: String,
                alias: String,
                title: String,
            });

            CategoriesSchema.plugin(formtools.plugins.document, {});

            mongoose.model('CategoriesModel', CategoriesSchema);

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

			PostSchema.plugin(formtools.plugins.document, {
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

            OverridesPostSchema.plugin(formtools.plugins.document, {
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

            OverridesPostModel = mongoose.model('OverridesPostModel', OverridesPostSchema);

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

		}); // end before() for describe('scaffold')

        describe('labels', function () {

            it('should complete any missing labels with thier field names', function () {

                labelsOpts.should.have.property('secondCategory');
                labelsOpts.secondCategory.should.equal('secondCategory');

            });

            it('should default date modified', function () {

                labelsOpts.should.have.property('dateModified');
                labelsOpts.dateModified.should.equal('Date modified');

            });

            it('should default date created', function () {

                labelsOpts.should.have.property('dateCreated');
                labelsOpts.dateCreated.should.equal('Date created');

            });

        });

        describe('list', function () {

            describe('fields', function () {

                describe('with fields defaults', function () {

                    it('should have a title', function () {
                        listOpts.fields.title.should.be.an.instanceOf(Object).and.have.property('label', 'Title');
                    });

                    it('should have a overview link renderer for title', function () {
                        listOpts.fields.title.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.overviewLink);
                    });

                    it('should have a created date', function () {
                        listOpts.fields.dateCreated.should.be.an.instanceOf(Object).and.have.property('label', 'Date created');
                    });

                    it('should have a link renderer for created date', function () {
                        listOpts.fields.dateCreated.should.be.an.instanceOf(Object).and.have.property('renderer', linz.formtools.cellRenderers.date);
                    });

                }); // end describe('fields defaults')

                describe('allowing field overrides', function () {

                    it('should set custom fields', function () {
                        overridesListOpts.fields.firstName.should.have.properties({
                            label: 'Name',
                            renderer: linz.formtools.cellRenderers.overviewLink
                        });
                    });

                    it('should default to overview link rendered for title, if renderer is not provided', function () {
                        overridesListOpts.fields.title.renderer.name.should.equal('overviewLinkRenderer');
                    });

                }); // end describe('field overrides')

                describe('using cell renderer', function () {

                    describe('array', function () {

                        it('format an array of strings', function (done) {

                            linz.formtools.cellRenderers.array(['one', 'two', 'three'], [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('one, two, three');
                                done();

                            });

                        });

                    });

                    describe('date', function () {

                        it('format a date object', function (done) {

                            const d = new Date(2014, 0, 1, 0, 0, 0);

                            linz.formtools.cellRenderers.date(d, [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal(moment(d).format(linz.get('date format')));
                                done();

                            });

                        });

                    });

                    describe('link', function () {

                        it('format a string with a link to the overview', function (done) {

                            linz.formtools.cellRenderers.overviewLink('label', {_id: '1'}, 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="' + linz.get('admin path') + '/model/PostModel/1/overview">label</a>');
                                done();

                            });

                        });

                    });

                    describe('url', function () {

                        it('format a url string', function (done) {

                            linz.formtools.cellRenderers.url('http://www.google.com', {}, 'firstName', PostModel.modelName, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('<a href="http://www.google.com" target="_blank">http://www.google.com</a>');
                                done();

                            });

                        });

                    });

                    describe('default', function () {

                        it('format an array of strings', function (done) {

                            linz.formtools.cellRenderers.default(['one', 'two', 'three'], [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal('one, two, three');
                                done();

                            });

                        });

                        it('format a date object', function (done) {

                            const d = new Date(2014, 0, 1, 0, 0, 0);

                            linz.formtools.cellRenderers.default(d, [], 'firstName', PostModel, function (err, result) {

                                (err === null).should.be.ok;
                                result.should.equal(moment(d).format(linz.get('date format')));
                                done();

                            });

                        });

                    });

                });

            })// end describe('fields')

            describe('permissions', function () {

                describe('default permissions', function () {

                    it('should override can create', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can edit', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can delete', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can export', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can list', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can view', function () {
                        permissionsOpts.should.be.empty;
                    });

                    it('should override can view raw', function () {
                        permissionsOpts.should.be.empty
                    });

                }); // end describe('default actions')

                describe('overrides permissions', function () {

                    it('should override can create', function () {
                        overridesPermissionsOpts.canCreate.should.exist;
                        overridesPermissionsOpts.canCreate.should.be.false;
                    });

                    it('should override can edit', function () {
                        overridesPermissionsOpts.canEdit.should.exist;
                        overridesPermissionsOpts.canEdit.should.be.false;
                    });

                    it('should override can delete', function () {
                        overridesPermissionsOpts.canDelete.should.exist;
                        overridesPermissionsOpts.canDelete.should.be.false;
                    });

                    it('should override can export', function () {
                        overridesPermissionsOpts.canExport.should.exist;
                        overridesPermissionsOpts.canExport.should.be.false;
                    });

                    it('should override can list', function () {
                        overridesPermissionsOpts.canList.should.exist;
                        overridesPermissionsOpts.canList.should.be.false;
                    });

                    it('should override can view', function () {
                        overridesPermissionsOpts.canView.should.exist;
                        overridesPermissionsOpts.canView.should.be.false;
                    });

                    it('should override can view raw', function () {
                        overridesPermissionsOpts.canViewRaw.should.exist;
                        overridesPermissionsOpts.canViewRaw.should.be.false;
                    });

                }); // end describe('overrides actions')

            }); // end describe('action')

            describe('group actions', function () {

                it('should defaults empty array', function () {
                    listOpts.groupActions.should.be.an.instanceof(Array);
                    listOpts.groupActions.length.should.equal(0);
                });

                it('should override group actions', function () {
                    overridesListOpts.groupActions.should.be.an.instanceof(Array);
                    overridesListOpts.groupActions[0].should.have.properties({
                        label: 'Assign category',
                        action: 'action/group/category'
                    });
                });

            }); // end describe('group actions')

            describe('record actions', function () {

                it('should defaults empty array', function () {
                    listOpts.recordActions.should.be.an.instanceof(Array);
                    listOpts.recordActions.length.should.equal(0);
                });

                it('should override record actions', function () {
                    overridesListOpts.recordActions.should.be.an.instanceof(Array);
                    overridesListOpts.recordActions[0].should.have.properties({
                        label: 'Send welcome email',
                        action: 'action/send-welcome-email'
                    });
                });

            }); // end describe('group actions')

            describe('export', function () {

                describe('defaults', function () {

                    it('export object should exist', function () {
                        (listOpts.export !== undefined).should.be.ok;
                        listOpts.export.should.be.an.instanceOf(Array);
                        listOpts.export.should.be.empty;
                        (typeof listOpts.export === 'object').should.be.ok;
                    });

                }); // end describe('defaults')

                describe('overrides', function () {

                    it('export object should exist', function () {

                        (overridesListOpts.export !== undefined).should.be.ok;
                        overridesListOpts.export.should.be.an.instanceOf(Array);
                        overridesListOpts.export.should.have.length(1);

                    });

                    it('should overwrite enable', function () {
                        overridesListOpts.export[0].should.have.property.enabled;
                        overridesListOpts.export[0].enabled.should.be.false;
                    });

                    it('should overwrite label', function () {
                        overridesListOpts.export[0].should.have.property.label;
                        overridesListOpts.export[0].label.should.equal('Custom export');
                    });

                    it('should overwrite action', function () {
                        overridesListOpts.export[0].should.have.property.action;
                        overridesListOpts.export[0].action.should.equal('custom-export-url');
                    });

                    it('should overwrite the exclusions', function () {
                        overridesListOpts.export[0].should.have.property.exclusions;
                        overridesListOpts.export[0].exclusions.should.equal('_id,groups');
                    });

                }); // end describe('overrides')

            }); // end describe('group actions')

            describe('paging', function () {

                describe('defaults', function () {

                    it('paging object should exist', function () {
                        (listOpts.paging !== undefined).should.be.ok;
                        (typeof listOpts.paging === 'object').should.be.ok;
                        listOpts.paging.should.have.property.active;
                        listOpts.paging.should.have.property.size;
                        listOpts.paging.should.have.property.sizes;
                    });

                    it('paging should be active', function () {
                        listOpts.paging.active.should.be.true;
                    });

                    it('should have a page size of 20', function () {
                        (listOpts.paging.size === 20).should.be.ok;
                    });

                    it('should have sizes [20,50,100,200]', function () {
                        listOpts.paging.sizes.should.be.eql([20, 50, 100, 200]);
                    });

                }); // end describe('defaults')

                describe('overrides', function () {

                    it('paging object should exist', function () {
                        (overridesListOpts.paging !== undefined).should.be.ok;
                        (typeof overridesListOpts.paging === 'object').should.be.ok;
                        overridesListOpts.paging.should.have.property.active;
                        overridesListOpts.paging.should.have.property.size;
                        listOpts.paging.should.have.property.sizes;
                    });

                    it('should override active', function () {
                        overridesListOpts.paging.active.should.be.false;
                    });

                    it('should override size', function () {
                        (overridesListOpts.paging.size === 50).should.be.ok;
                    });

                    it('should override sizes [25,50,75,100]', function () {
                        overridesListOpts.paging.sizes.should.be.eql([25, 50, 75, 100]);
                    });

                }); // end describe('overrides')

            }); // end describe('action')

            describe('sorting', function () {

                describe('default sorting', function () {

                    it('should be sorted by date modified', function () {
                        listOpts.sortBy[0].should.have.properties({
                            label: 'Date modified',
                            field: 'dateModified'
                        });
                    });

                }); // end describe('default sorting')

                describe('overrides sorting', function () {

                    it('should overrides sorting options', function () {

                        overridesListOpts.sortBy.should.eql([
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
                    overridesListOpts.fields.sendWelcomeEmail.renderer.name.should.equal('sendWelcomeEmailRenderer');
                });

                it('should execute custom cell renderer for virtual field', function (done) {
                    overridesListOpts.fields.sendWelcomeEmail.renderer({}, 'sendWelcomeEmail', 'mmsUser', function (err, value) {

                        if (err) {
                            throw err;
                        }

                        value.should.equal('success');

                        done();

                    });
                });

                it('should throw an error if custom renderer is not provided for virtual field', function () {

                    var ErrorVirtualFieldsSchema = new mongoose.Schema({
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

                        ErrorVirtualFieldsSchema.plugin(formtools.plugins.document, {
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

                        e.message.should.equal('Renderer attribute is missing for virtual field options.list.fields.sendWelcomeEmail');

                    }

                });

            }); // end describe('virtual fields')

            describe('filters', function () {

                describe('setting filters', function () {

                    it('should convert a key name with string value in the filters to an object', function () {
                        overridesListOpts.filters.firstName.should.have.property('label', 'First name');
                    });

                    it('should default to key name if a label is not provided in the filters object', function () {
                        overridesListOpts.filters.lastName.should.have.property('label', 'lastName');
                    });

                    it('should set default filter if none provided', function () {
                        overridesListOpts.filters.firstName.filter.should.equal(linz.formtools.filters.default);
                    });

                    it('should set custom filter, renderer & bind functions if provided', function () {
                        (overridesListOpts.filters.lastName.filter.renderer.name === 'customFilterRenderer' && overridesListOpts.filters.lastName.filter.filter.name === 'customFilterFilter' && overridesListOpts.filters.lastName.filter.bind.name === 'customFilterBinder').should.be.true;
                    });

                });

                describe('using linz filter', function () {

                    describe('default filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.default.bind(fieldName, { firstName: ['john', 'jane'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>');
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should create filter using regex (OR) matching for multiple filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['john', 'jane'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional one between words', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.default.filter(fieldName, { 'firstName': ['   john    william   '] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
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
                            linz.formtools.filters.date().renderer(fieldName, function (err, result) {
                                result.should.equal('<template><input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required></template>');
                                done();
                            });

                        });

                        it('should render date input field with form value', function (done) {

                            var fieldName = 'dateCreated';
                            var dateString = '2014-05-16';
                            var isoString = moment(dateString, 'YYYY-MM-DD').toISOString();

                            linz.formtools.filters.date().bind(fieldName, { dateCreated: [dateString] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + isoString + '" required>');
                                done();
                            });

                        });

                        it('should render date input field with a custom date format', function (done) {

                            var fieldName = 'dateCreated';
                            var dateString = '16.05.2014';
                            var dateFormat = 'DD.MM.YYYY';
                            var isoString = moment(dateString, dateFormat).toISOString();

                            linz.formtools.filters.date(dateFormat).bind(fieldName, { dateCreated: [dateString] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="' + isoString + '" required>');
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
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + dateFromIsoString + '" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + dateToIsoString + '" required>');
                                done();
                            });
                        });

                        it('should return a filter object for a single date input', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16'];
                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                                result.should.have.property(fieldName, {
                                    $gte: moment(filterDates[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates[0], 'YYYY-MM-DD').endOf('day').toISOString()
                                });
                            });

                        });

                        it('should return a filter object for multiple date inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16', '2014-05-18', '2014-05-20'];

                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                               result.should.have.property(fieldName, [
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
                                err.message.should.equal('Date field is empty');
                            });

                        });

                        it('should throw error if a date in one the multiple date filters is not a valid date', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['2014-05-16', '2014-05-18', 'test date'];

                            linz.formtools.filters.date().filter(fieldName, { 'dateCreated': filterDates }, function (err) {
                                err.message.should.equal('One of the dates is invalid');
                            });

                        });

                        it('should support a custom date format', function () {

                            var fieldName = 'dateCreated',
                                filterDates = ['16.05.2014'];
                            linz.formtools.filters.date('DD.MM.YYYY').filter(fieldName, { 'dateCreated': filterDates }, function (err, result) {
                                result.should.have.property(fieldName, {
                                    $gte: moment(filterDates[0], 'DD.MM.YYYY').startOf('day').toISOString(), $lte: moment(filterDates[0], 'DD.MM.YYYY').endOf('day').toISOString()
                                });
                            });

                        });

                    });

                    describe('dateRange filter', function () {

                        it('should render 2 date input fields', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.dateRange().renderer(fieldName, function (err, result) {
                                result.should.equal('<template><input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" required></template>');
                                done();
                            });

                        });

                        it('should render date range input fields with form values', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: [moment('2014-05-16', 'YYYY-MM-DD').zone('+0:00').toISOString()], dateTo: [moment('2014-05-17', 'YYYY-MM-DD').endOf('day').zone('+0:00').toISOString()] } };

                            linz.formtools.filters.dateRange().bind(fieldName, filterDates, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + filterDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + filterDates.dateCreated.dateTo[0] + '" required>');
                            });
                        });

                        it('should render date range input fields with a custom date format', function () {

                            var fieldName = 'dateCreated';
                            var dateFormat = 'DD.MM.YYYY';
                            var filterDates = { dateCreated: { dateFrom: ['16.05.2014'], dateTo: ['15.05.2014'] } };
                            var utcDates = { dateCreated: { dateFrom: [moment('16.05.2014', dateFormat).startOf('day').toISOString()], dateTo: [moment('15.05.2014', dateFormat).endOf('day').toISOString()] } };

                            linz.formtools.filters.dateRange(dateFormat).bind(fieldName, filterDates, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="' + utcDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="DD.MM.YYYY" data-linz-date-value="2014-05-15T23:59:59.999Z" required>');
                            });

                        });

                        it('should render multiple date range input fields with form values for multiple filters on the same field', function () {

                            var fieldName = 'dateCreated';
                            var dateFormat = 'YYYY-MM-DD';
                            var filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-18'], dateTo: ['2014-05-17', '2014-05-19'] } };
                            var utcDates = { dateCreated: { dateFrom: [moment('2014-05-16', dateFormat).startOf('day').toISOString(), moment('2014-05-18', dateFormat).startOf('day').toISOString()], dateTo: [moment('2014-05-17', dateFormat).endOf('day').toISOString(), moment('2014-05-19', dateFormat).endOf('day').toISOString()] } };

                            linz.formtools.filters.dateRange().bind(fieldName, filterDates, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + utcDates.dateCreated.dateFrom[0] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="2014-05-17T23:59:59.999Z" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="' + utcDates.dateCreated.dateFrom[1] + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="YYYY-MM-DD" data-linz-date-value="2014-05-19T23:59:59.999Z" required>');
                            });
                        });

                        it('should return a filter object for a date range filter', function () {
                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: ['2014-05-17'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err, result) {
                               result.should.have.property(fieldName, { $gte: moment(filterDates.dateCreated.dateFrom[0], 'YYYY-MM-DD').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[0], 'YYYY-MM-DD').endOf('day').toISOString() });
                            });
                        });

                        it('should return a filter object using OR opertor when filtering on multiple date range inputs', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-18', '2014-05-20'], dateTo: ['2014-05-16', '2014-05-18', '2014-05-20'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err, result) {

                               result.should.have.property(fieldName, [
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
                                err.message.should.equal('One of the date fields is empty');
                            });

                        });

                        it('should throw error if dateTo is empty in the date range filter', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16'], dateTo: [] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err) {
                                err.message.should.equal('One of the date fields is empty');
                            });

                        });

                        it('should throw error if one of date is invalid in one of multiple date range filters', function () {

                            var fieldName = 'dateCreated',
                                filterDates = { dateCreated: { dateFrom: ['2014-05-16', '2014-05-20'], dateTo: ['2014-05-17', 'test date'] } };

                            linz.formtools.filters.dateRange().filter(fieldName, filterDates, function (err) {
                                err.message.should.equal('One of the dates is invalid');
                            });

                        });

                        it('should show work with a custom date format', function () {

                            var fieldName = 'dateCreated',
                            filterDates = { dateCreated: { dateFrom: ['16.05.2014'], dateTo: ['17.05.2014'] } };

                            linz.formtools.filters.dateRange('DD.MM.YYYY').filter(fieldName, filterDates, function (err, result) {
                            result.should.have.property(fieldName, { $gte: moment(filterDates.dateCreated.dateFrom[0], 'DD.MM.YYYY').startOf('day').toISOString(), $lte: moment(filterDates.dateCreated.dateTo[0], 'DD.MM.YYYY').endOf('day').toISOString() });
                            });

                        });

                    });

                    describe('boolean filter', function () {

                        it('should render checkbox input field', function (done) {
                            var fieldName = 'dateModified';
                            linz.formtools.filters.boolean.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label></template>');
                                done();
                            });
                        });

                        it('should return a filter object containing a field name and a boolean as the value', function () {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.filter(fieldName, { 'bActive': 'true' }, function (err, result) {
                               result.should.have.property(fieldName, true);
                            });
                        });

                        it('should render checkbox input field with form value of true', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'true' }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" checked required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" required> No</label>');
                                done();
                            });
                        });

                        it('should render checkbox input field with form value of false', function (done) {
                            var fieldName = 'bActive';
                            linz.formtools.filters.boolean.bind(fieldName, { 'bActive': 'false' }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="true" required> Yes</label><label class="checkbox-inline"><input type="radio" name="' + fieldName + '" value="false" checked required> No</label>');
                                done();
                            });
                        });

                    });

                    describe('fulltext filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><input type="text" name="' + fieldName + '[]" class="form-control" required></template>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'firstName';
                            linz.formtools.filters.fulltext.bind(fieldName, { firstName: ['john', 'jane'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="john" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="jane" required>');
                                done();
                            });
                        });

                        it('should create filter using regex matching one keyword search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john/ig});
                           });
                        });

                        it('should create filter using regex OR matching multiple keywords search', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle multiple spaces between search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john    william'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should handle trim leading and trailing spaces on search keywords', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['   john    william   '] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|william/ig});
                           });
                        });

                        it('should create filter using regex OR matching for multiple keyword filters on the same field', function () {
                           var fieldName = 'firstName';
                           linz.formtools.filters.fulltext.filter(fieldName, { 'firstName': ['john', 'jane'] }, function (err, result) {
                               result.should.have.property(fieldName, { $regex: /john|jane/ig});
                           });
                        });

                    });

                    describe('list filter', function () {

                        it('should render a select field', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><select name="' + fieldName + '[]" class="form-control multiselect"><option value="one">option 1</option><option value="two">option 2</option></select></template>');
                                done();
                            });
                        });

                        it('should render a select field with multiple selection option attribute', function (done) {
                            var fieldName = 'groups',
                                listFilter = linz.formtools.filters.list(list, true);
                            listFilter.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><select name="' + fieldName + '[]" class="form-control multiselect" multiple><option value="one">option 1</option><option value="two">option 2</option></select></template>');
                                done();
                            });
                        });

                        it('should handle array of string literals as the options', function (done) {
                            var fieldName = 'groups',
                                listFilter = linz.formtools.filters.list(['one', 'two'], true);
                            listFilter.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><select name="' + fieldName + '[]" class="form-control multiselect" multiple><option value="one">one</option><option value="two">two</option></select></template>');
                                done();
                            });
                        });

                        it('should throw error is list attribute is missing', function () {
                            try {
                                linz.formtools.filters.list();
                            } catch (e) {
                                e.message.should.equal('List paramenter is missing for the list filter');
                            }

                        });

                        it('should return a filter using $in operator for OR matching on the selected values', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.filter(fieldName, { groups: list}, function (err, result) {
                                result.should.have.property(fieldName, { $in: list });
                                done();
                            });
                        });

                        it('should render select field with form values selected', function (done) {
                            var fieldName = 'groups';
                            overridesListOpts.filters.groups.filter.bind(fieldName, { groups: ['one'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<select name="' + fieldName + '[]" class="form-control multiselect"><option value="one" selected>option 1</option><option value="two">option 2</option></select>');
                                done();
                            });
                        });

                    });

                    describe('number filter', function () {

                        it('should render text input field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.renderer(fieldName, function (err, result) {
                                result.should.equal('<template><input type="text" name="' + fieldName + '[]" class="form-control" required pattern="[0-9]*" placeholder="Only digits are allowed."></template>');
                                done();
                            });

                        });

                        it('should render text input field with form value', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(1);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>');
                                done();
                            });
                        });

                        it('should render multiple text input fields with form values if there are multiple filters on the same field', function (done) {
                            var fieldName = 'code';
                            linz.formtools.filters.number.bind(fieldName, { code: ['100', '200'] }, function (err, result) {
                                result.should.be.instanceof(Array).and.have.lengthOf(2);
                                result[0].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="100" required>');
                                result[1].should.equal('<input type="text" name="' + fieldName + '[]" class="form-control" value="200" required>');
                                done();
                            });
                        });

                        it('should create filter to match a "one keyword" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100'] }, function (err, result) {
                               result.should.have.property(fieldName, [100]);
                           });
                        });

                        it('should create filter to match on a "multiple keywords" search', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100', '200'] }, function (err, result) {
                               result.should.have.property(fieldName, [100, 200]);
                           });
                        });

                        it('should trim leading and trailing spaces on search keywords and any additional found between words', function () {
                           var fieldName = 'code';
                           linz.formtools.filters.number.filter(fieldName, { 'code': ['100', ' 200', '300 ', ' 400 ', '  500  '] }, function (err, result) {
                               result.should.have.property(fieldName, [100, 200, 300, 400, 500]);
                           });
                        });

                    });

                });

                describe('custom filter', function () {

                   it('should render custom filter', function (done) {
                        overridesListOpts.filters.lastName.filter.renderer('lastName', function(err, result) {
                            result.should.equal('<template><input type="text" name="test1"><input type="text" name="test2"></template>');
                            done();
                        });
                   });

                   it('should return custom filter', function (done) {
                        overridesListOpts.filters.lastName.filter.filter('lastName', { test1: 'john', test2: 'jane'}, function(err, result) {
                            result.should.have.properties({
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

                        filters.should.have.properties({
                            firstName: ['john']
                        });

                    });

                    it('should handle number filter', function () {

                        var filter = { code: 100 };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
                            code: [100]
                        });

                    });

                    it('should handle object filter', function () {

                        var filter = { firstName: { $regex: /john/ig } };

                        filters = OverridesPostModel.addSearchFilter(filters, filter);

                        filters.should.have.properties({
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

                        filters.should.have.properties({
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

                        filters.should.have.properties({
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

                        filters.should.have.properties({
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

                            filters.should.have.properties({
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
                        return OverridesPostModel.findDocuments({ filter: result });
                    });

                });

            }); // end describe('filters')

        }); // end  describe('list')


        describe('form', function () {

            describe('form defaults', function () {
                describe('for each field', function () {

                    it('should set the label, if provided', function () {
                        formOpts.firstName.label.should.equal('First Name');
                    });

                    it('should default label to field name, if none provided', function () {
                        formOpts.lastName.label.should.equal('lastName');
                    });

                    it('should set visible, if provided', function () {
                        formOpts.password.visible.should.be.false;
                    });

                    it('should default visible to true, if none provided', function () {
                        formOpts.firstName.visible.should.be.true;
                    });

                    it('should set disabled, if provided', function () {
                        formOpts.password.disabled.should.be.true;
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts.firstName.disabled.should.be.false;
                    });

                    it('should set helpText, if provided', function () {
                        formOpts.firstName.helpText.should.equal('Enter your first name');
                    });

                    it('should default helpText to undefined, if none provided', function () {
                        (formOpts.password.helpText === undefined).should.equal.true;
                    });

                    it('should set type, if provided', function () {
                        formOpts.description.type.should.equal('text');
                    });

                    it('should default type to schema type if none provided', function () {
                        formOpts.firstName.type.should.equal('string');
                    });

                    it('should set default value, if provided', function () {
                        formOpts.bActive.default.should.be.true;
                    });

                    it('should set default value to undefined, if none provided', function () {
                        (formOpts.description.default === undefined).should.equal.true;
                    });

                    it('should set list, if provided', function () {
                        formOpts.groups.list.should.eql(list);
                    });

                    it('should default list to undefined, if none provided', function () {
                        (formOpts.description.list === undefined).should.equal.true;
                    });

                    it('should default fieldset to undefined, if none provided', function () {
                        (formOpts.firstName.fieldset === undefined).should.be.ok;
                        formOpts.firstName.should.have.property('fieldset');
                    });

                    it('should set fieldset, if provided', function () {
                        overridesFormOpts.description.fieldset.should.equal('Fieldset');
                    });

                    it('should default widget to undefined, if none provided', function () {
                        (formOpts.firstName.widget === undefined).should.be.ok;
                        formOpts.firstName.should.have.property('widget');
                    });

                    it('should set widget, if provided', function () {
                        formOpts.states.widget.should.equal('multipleSelect');
                    });

                    it('should set disabled, if provided', function () {
                        formOpts.states.required.should.equal(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts.firstName.required.should.equal(true);
                    });

                    it('should set disabled, if provided', function () {
                        formOpts.states.required.should.equal(false);
                    });

                    it('should default disabled to false, if none provided', function () {
                        formOpts.firstName.required.should.equal(true);
                    });

                    it('should set placeholder, if provided', function () {
                        formOpts.firstName.placeholder.should.equal('Enter your first name');
                    });

                    it('should default placeholder to undefined, if none provided', function () {
                        formOpts.firstName.should.have.property('placeholder');
                    });

                    it('should set query, if provided', function () {
                        formOpts.secondCategory.should.have.property('query');
                        formOpts.secondCategory.query.should.have.property('filter');
                        formOpts.secondCategory.query.filter.should.eql({alias:'second-value'});
                        formOpts.secondCategory.query.should.have.property('sort');
                        formOpts.secondCategory.query.sort.should.equal('sort');
                        formOpts.secondCategory.query.should.have.property('select');
                        formOpts.secondCategory.query.select.should.equal('select');
                        formOpts.secondCategory.query.should.have.property('label');
                        (typeof formOpts.secondCategory.query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts.username.should.have.property('query');
                        formOpts.username.query.should.have.property('filter');
                        formOpts.username.query.should.have.property('sort');
                        formOpts.username.query.should.have.property('select');
                        formOpts.username.query.should.have.property('label');
                        (formOpts.username.query.filter === undefined).should.equal(true);
                        (formOpts.username.query.sort === undefined).should.equal(true);
                        (formOpts.username.query.select === undefined).should.equal(true);
                        (formOpts.username.query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts.category.should.have.property('query');
                        formOpts.category.query.should.have.property('filter');
                        formOpts.category.query.should.have.property('sort');
                        formOpts.category.query.should.have.property('select');
                        formOpts.category.query.should.have.property('label');
                        formOpts.category.query.filter.should.eql({alias:'specific-value'});
                        (formOpts.category.query.sort === undefined).should.equal(true);
                        (formOpts.category.query.select === undefined).should.equal(true);
                        (formOpts.category.query.label === undefined).should.equal(true);
                    });

                    it('should set transform if provided', function () {
                        formOpts.favourites.should.have.property('transform');
                        (typeof formOpts.favourites.transform === 'function').should.equal(true);
                    });

                    it('should set transform to undefined, if none provided', function () {
                        formOpts.category.should.have.property('transform');
                        (formOpts.category.transform === undefined).should.equal(true);
                    });

                    it('should set schema to undefined, if none provided', function () {
                        formOpts.username.should.have.property('schema');
                        (formOpts.username.schema === undefined).should.equal(true);
                    });

                    it('should set schema if provided', function () {
                        formOpts.comments.should.have.property('schema');
                        formOpts.comments.schema.should.be.an.Object;
                    });

                });
            }); // end describe('form default')

            describe('create form', function () {

                describe('for each field', function () {

                    it('should inherit from visible', function () {
                        formOpts.password.create.visible.should.be.false;
                    });

                    it('should override visible', function () {
                        formOpts.firstName.create.visible.should.be.false;
                    });

                    it('should inherit from disabled', function () {
                        formOpts.password.create.disabled.should.be.true;
                    });

                    it('should override disabled', function () {
                        formOpts.firstName.create.disabled.should.be.true;
                    });

                    it('should inherit from fieldset', function () {
                        formOpts.firstName.create.should.have.property('fieldset');
                        (formOpts.firstName.create.fieldset === undefined).should.be.ok;
                    });

                    it('should override from fieldset', function () {
                        overridesFormOpts.description.create.should.have.property('fieldset');
                        overridesFormOpts.description.create.fieldset.should.equal('Create fieldset');
                    });

                    it('should inherit widget', function () {
                        formOpts.description.create.should.have.property('widget');
                        (formOpts.description.create.widget === undefined).should.be.ok;
                    });

                    it('should override widget', function () {
                        overridesFormOpts.states.create.should.have.property('widget');
                        overridesFormOpts.states.create.widget.should.equal('createWidget');
                    });

                    it('should inherit placeholder', function () {
                        formOpts.firstName.create.should.have.property('placeholder');
                        formOpts.firstName.create.placeholder.should.equal('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        overridesFormOpts.firstName.create.should.have.property('placeholder');
                        overridesFormOpts.firstName.create.placeholder.should.equal('Enter your first name (create)');
                    });

                    it('should inherit query, if provided', function () {
                        formOpts.secondCategory.create.should.have.property('query');
                        formOpts.secondCategory.create.query.should.have.property('filter');
                        formOpts.secondCategory.create.query.filter.should.eql({alias:'second-value'});
                        formOpts.secondCategory.create.query.should.have.property('sort');
                        formOpts.secondCategory.create.query.sort.should.equal('sort');
                        formOpts.secondCategory.create.query.should.have.property('select');
                        formOpts.secondCategory.create.query.select.should.equal('select');
                        formOpts.secondCategory.create.query.should.have.property('label');
                        (typeof formOpts.secondCategory.create.query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts.username.create.should.have.property('query');
                        formOpts.username.create.query.should.have.property('filter');
                        formOpts.username.create.query.should.have.property('sort');
                        formOpts.username.create.query.should.have.property('select');
                        formOpts.username.create.query.should.have.property('label');
                        (formOpts.username.create.query.filter === undefined).should.equal(true);
                        (formOpts.username.create.query.sort === undefined).should.equal(true);
                        (formOpts.username.create.query.select === undefined).should.equal(true);
                        (formOpts.username.create.query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts.category.create.should.have.property('query');
                        formOpts.category.create.query.should.have.property('filter');
                        formOpts.category.create.query.should.have.property('sort');
                        formOpts.category.create.query.should.have.property('select');
                        formOpts.category.create.query.should.have.property('label');
                        formOpts.category.create.query.filter.should.eql({alias:'specific-value'});
                        (formOpts.category.create.query.sort === undefined).should.equal(true);
                        (formOpts.category.create.query.select === undefined).should.equal(true);
                        (formOpts.category.create.query.label === undefined).should.equal(true);
                    });

                    it('should override query', function () {
                        overridesFormOpts.category.create.should.have.property('query');
                        overridesFormOpts.category.create.query.filter.should.eql({alias:'specific-value-create'});
                        formOpts.category.create.query.should.have.property('sort');
                        formOpts.category.create.query.should.have.property('select');
                        formOpts.category.create.query.should.have.property('label');
                        (formOpts.category.create.query.sort === undefined).should.equal(true);
                        (formOpts.category.create.query.select === undefined).should.equal(true);
                        (formOpts.category.create.query.label === undefined).should.equal(true);
                    });

                    it('should inherit transform', function () {
                        formOpts.category.create.should.have.property('transform');
                        (formOpts.category.create.transform === undefined).should.equal(true);
                    });

                    it('should override transform', function () {
                        overridesFormOpts.favourites.should.have.property('transform');
                        (typeof overridesFormOpts.favourites.transform === 'function').should.equal(true);
                        overridesFormOpts.favourites.create.should.have.property('transform');
                        (typeof overridesFormOpts.favourites.create.transform === 'function').should.equal(true);
                        overridesFormOpts.favourites.create.transform.name.should.equal('transformFavouritesCreate');
                    });

                });

            }); // end describe('create form')

            describe('edit form', function () {

                describe('for each field', function () {

                    it('should inherit visible', function () {
                        formOpts.firstName.edit.visible.should.be.false;
                    });

                    it('should override visible', function () {
                        formOpts.password.edit.visible.should.be.false;
                    });

                    it('should inherit disabled', function () {
                        formOpts.password.edit.disabled.should.be.true;
                    });

                    it('should override disabled', function () {
                        formOpts.firstName.edit.disabled.should.be.true;
                    });

                    it('should inherit from fieldset', function () {
                        formOpts.firstName.edit.should.have.property('fieldset');
                        (formOpts.firstName.edit.fieldset === undefined).should.be.ok;
                    });

                    it('should override from fieldset', function () {
                        overridesFormOpts.description.edit.should.have.property('fieldset');
                        overridesFormOpts.description.edit.fieldset.should.equal('Edit fieldset');
                    });

                    it('should inherit widget', function () {
                        formOpts.description.edit.should.have.property('widget');
                        (formOpts.description.edit.widget === undefined).should.be.ok;
                    });

                    it('should override widget', function () {
                        overridesFormOpts.states.edit.should.have.property('widget');
                        overridesFormOpts.states.edit.widget.should.equal('editWidget');
                    });

                    it('should inherit placeholder', function () {
                        formOpts.firstName.edit.should.have.property('placeholder');
                        formOpts.firstName.edit.placeholder.should.equal('Enter your first name');
                    });

                    it('should override placeholder', function () {
                        overridesFormOpts.firstName.edit.should.have.property('placeholder');
                        overridesFormOpts.firstName.edit.placeholder.should.equal('Enter your first name (edit)');
                    });

                    it('should inherit query, if provided', function () {
                        formOpts.secondCategory.edit.should.have.property('query');
                        formOpts.secondCategory.edit.query.should.have.property('filter');
                        formOpts.secondCategory.edit.query.filter.should.eql({alias:'second-value'});
                        formOpts.secondCategory.edit.query.should.have.property('sort');
                        formOpts.secondCategory.edit.query.sort.should.equal('sort');
                        formOpts.secondCategory.edit.query.should.have.property('select');
                        formOpts.secondCategory.edit.query.select.should.equal('select');
                        formOpts.secondCategory.edit.query.should.have.property('label');
                        (typeof formOpts.secondCategory.edit.query.label === 'function').should.equal(true);
                    });

                    it('should default query to default object, if none provided', function () {
                        formOpts.username.edit.should.have.property('query');
                        formOpts.username.edit.query.should.have.property('filter');
                        formOpts.username.edit.query.should.have.property('sort');
                        formOpts.username.edit.query.should.have.property('select');
                        formOpts.username.edit.query.should.have.property('label');
                        (formOpts.username.edit.query.filter === undefined).should.equal(true);
                        (formOpts.username.edit.query.sort === undefined).should.equal(true);
                        (formOpts.username.edit.query.select === undefined).should.equal(true);
                        (formOpts.username.edit.query.label === undefined).should.equal(true);
                    });

                    it('should set default query properties, if not all provided', function () {
                        formOpts.category.edit.should.have.property('query');
                        formOpts.category.edit.query.should.have.property('filter');
                        formOpts.category.edit.query.should.have.property('sort');
                        formOpts.category.edit.query.should.have.property('select');
                        formOpts.category.edit.query.should.have.property('label');
                        formOpts.category.edit.query.filter.should.eql({alias:'specific-value'});
                        (formOpts.category.edit.query.sort === undefined).should.equal(true);
                        (formOpts.category.edit.query.select === undefined).should.equal(true);
                        (formOpts.category.edit.query.label === undefined).should.equal(true);
                    });

                    it('should override query', function () {
                        overridesFormOpts.category.edit.should.have.property('query');
                        overridesFormOpts.category.edit.query.filter.should.eql({alias:'specific-value-edit'});
                        overridesFormOpts.category.edit.query.should.have.property('sort');
                        overridesFormOpts.category.edit.query.should.have.property('select');
                        overridesFormOpts.category.edit.query.should.have.property('label');
                        (overridesFormOpts.category.edit.query.sort === undefined).should.equal(true);
                        (overridesFormOpts.category.edit.query.select === undefined).should.equal(true);
                        (overridesFormOpts.category.edit.query.label === undefined).should.equal(true);
                    });

                    it('should inherit transform', function () {
                        formOpts.category.edit.should.have.property('transform');
                        (formOpts.category.edit.transform === undefined).should.equal(true);
                    });

                    it('should override transform', function () {
                        overridesFormOpts.favourites.should.have.property('transform');
                        (typeof overridesFormOpts.favourites.transform === 'function').should.equal(true);
                        overridesFormOpts.favourites.edit.should.have.property('transform');
                        (typeof overridesFormOpts.favourites.edit.transform === 'function').should.equal(true);
                        overridesFormOpts.favourites.edit.transform.name.should.equal('transformFavouritesEdit');
                    });

                });

            }); // end describe('edit form')

        }); // end describe('form')

        describe('overview', function () {

            describe('defaults', function () {

                it('actions should default to []', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('actions');
                    overviewOpts.actions.should.eql([]);

                });


                it('body should default to []', function () {

                    (overviewOpts).should.be.ok;
                    overviewOpts.should.have.property('body');
                    overviewOpts.body.should.be.an.instanceOf(Array);

                    const first = overviewOpts.body[0];

                    first.should.have.property('label');
                    first.label.should.equal('Summary');

                    first.should.have.property('fields');
                    first.should.be.an.instanceOf(Object);

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


            }); // end describe('overrides')

        }); // end describe('overview')

	});

});
