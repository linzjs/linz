.. highlight:: javascript

*************************
Models
*************************

One of the primary reasons to use Linz is to ease model development and scaffold highly customizable interfaces for managing these models. Linz provides a simple DSL you can use to describe your model. Using the content of your DSL, Linz will scaffold an index, overview, edit handlers and provide a basic CRUD HTTP API for your model.

All Linz models are bootstrapped with two mandatory properties:

- ``dateCreated`` with a label of *Date created*.
- ``dateModified`` with a label of *Date modified*.

The label used for each record centers around the title field. If your model has a title field, you don't have to do anything. If you model doesn't have a title field, you need to supply a field in your schema that will be used for the value of the title whenever displayed in Linz. The title is the default way to reference a record iwthin Linz.

You create Models in the ``model`` directory, one file per model. The file should have the following basic structure:

**person.js**::

  var linz = require('linz');

  // Create a new mongoose schema.
  var personSchema = new linz.mongoose.Schema({
    name:  String,
    email: String
  });

  // Add the Linz formtools plugin.
  personSchema.plugin(linz.formtools.plugins.document, {
    model: {
      label: 'Person',
      description: 'A person.',
      title: 'name'
    },
    labels: {
      name: 'Name',
      email: 'Email'
    },
    list: {
      fields: {
        name: true,
        email: true
      }
    },
    form: {
      name: {
        fieldset: 'Details',
        helpText: 'The users full name.'
      },
      email: {
        fieldset: 'Details'
      }
    },
    overview: {
      summary: {
        fields: {
          name: {
            renderer: linz.formtools.cellRenderers.defaultRenderer
          },
          email: {
            renderer: linz.formtools.cellRenderers.defaultRenderer
          }
        }
      }
    },
    fields: {
      usePublishingDate: false,
      usePublishingStatus: false
    }
  });

  var person = module.exports = linz.mongoose.model('person', personSchema);

The file is broken down in the following parts:

- You ``require`` Linz, as you'll need to register the model with Linz.
- Create a standard Mongoose schema.
- Use the ``linz.formtools.plugins.document`` Mongoose plugin to register the model with Linz, passing in an object containing Linz's model DSL.
- Create a Mongoose model from the schema, and ``export`` it.

.. _models-mongoose-schemas-reference:

Mongoose schemas
================

Linz works directly with `Mongoose schemas`_. Anything you can do with a Mongoose schema is acceptable to Linz.

.. _Mongoose schemas: http://mongoosejs.com/docs/guide.html

.. _models-model-dsl-reference:

Model DSL
=========

Linz uses a Model DSL, which is an object that can be used to describe your model. Linz will use this information to scaffold user interfaces for you. The Model DSL contains six main parts:

- ``model`` contains basic information such as the ``title`` field, ``label`` and ``description`` of the model.
- ``labels`` contains human friendly versions of your model's properties, keyed by the property name.
- ``list`` contains information used to scaffold the list displaying model records.
- ``form`` contains information used to scaffold the edit handler for a model record.
- ``overview`` contains information used to scaffold the overview for a model record.
- ``fields`` contains directives to enable/disable fields that Linz automatically adds to models.
- ``permissions`` is a function used to limit access to a model.

You supply the DSL to Linz in the form of an object, to the ``linz.formtools.plugins.document`` Mongoose plugin::

  personSchema.plugin(linz.formtools.plugins.document, {
    model: {
      // ...
    },
    labels: {
      // ...
    },
    list: {
      // ...
    },
    form: {
      // ...
    },
    overview: {
      // ...
    },
    fields: {
      // ...
    },
    permissions: function () {
    }
  });

.. _models-model-dsl-summary-reference:

Models model DSL
----------------

``model`` should be an object with three keys:

- ``title`` is required, unless you have a ``title`` field in your schema. The value you supply should be the name of a field in your schema. This field will be used to derive the *title* for the record, and label for the field.
- ``label`` should be a singular noun describing the model.
- ``description`` should be a short sentence describing the noun.

The ``label`` is used in many places and is automatically pluralized based on the usage context. The ``description`` is only used on the Models index within Linz.

For example::

  model: {
    label: 'Person',
    description: 'A person.',
    title: 'name'
  }

.. _models-label-dsl-summary-reference:

Models label DSL
----------------

``labels`` is used to provide a label and description for the model.

``labels`` should be an object, keyed by field names and strings of the human friendly versions of your field names.

For example::

  labels: {
    name: 'Name',
    email: 'Email'
  }

You can customize the labels for the default ``dateModified`` and ``dateCreated`` using this object. You can also supply the key ``title`` with a value that should be used for the label of the record's title.

.. _models-list-dsl-summary-reference:

Models list DSL
---------------

``list`` is used to customize the model index that is generated for each model.

``list`` should be an Object, containing the following top-level keys:

- ``actions``
- ``fields``
- ``sortBy``
- ``toolbarItems``
- ``showSummary``
- ``filters``
- ``paging``
- ``groupActions``
- ``recordActions``
- ``export``

These allow you to describe how the model index should function. The list DSL is discussed in more detail in :ref:`models-list-reference`.

.. _models-form-dsl-summary-reference:

Models form DSL
---------------

``form`` is used to customize the model record create and edit pages.

``form`` should be an Object, keyed by field names of the model, in the order you'd like each field's edit control rendered. For example::

  form: {
    name: {
      fieldset: 'Details',
      helpText: 'The users full name.'
    },
    email: {
      fieldset: 'Details'
    }
  }

This will generate a form with two fields that you can provide data for. Both fields will appear in the *Details* fieldset, in the order ``name`` and then ``email``.

Each field object can contain the following keys:

- ``label``
- ``placeholder``
- ``helpText``
- ``type``
- ``default``
- ``list``
- ``visible``
- ``disabled``
- ``fieldset``
- ``widget``
- ``required``
- ``query``
- ``transform``
- ``transpose``
- ``schema``
- ``relationship``

These allow you to describe how the create and edit forms should function. The form DSL is discussed in more detail in :ref:`models-form-reference`.

Model permissions
-----------------

Model permissions is an in-depth topic and should be considered amongst other permission capabilities. Read more about :ref:`permissions-reference`.

Model statics, virtuals and methods
===================================

When working with models, Linz makes use of specific Mongoose statics, virtuals and methods if they've been provided.

The following documents them, and their functionality.

listQuery static
----------------

You can create a Mongoose static called ``listQuery`` for a model with the following signature::

  function listQuery (query, callback)

If found, Linz will execute this function with a Mongoose query before executing it, when retrieving data for the model list view. This provides an opportunity to customise the query before execution.

For example, if you'd like to return more fields from MongoDB than those listed in ``list.fields`` you can do it here::

  model.static.listQuery = listQuery (query, callback) => callback(null, query.select('anotherField anotherOne'));

canDelete method
----------------

You can create a Mongoose method called ``canDelete`` for a model, with the following signature::

  function canDelete (req, callback)

If found, Linz will execute this function before rendering the Model index page. This provides an opportunity to customise the delete record action. Because it is a Mongoose method, inside the function ``this`` is scoped to the record itself.

The callback has the following signature ``callback (err, isEnabled, message)``. ``isEnabled`` should be a boolean; ``true`` to enable the delete action, ``false`` to disable it. If it is disabled, you can use ``message`` to provide a message that will be displayed to the user if they click on the delete button.

canEdit method
--------------

You can create a Mongoose method called ``canEdit`` for a model, with the following signature::

  function canEdit (req, callback)

If found, Linz will execute this function before rendering the Model index page. This provides an opportunity to customise the edit record action. Because it is a Mongoose method, inside the function ``this`` is scoped to the record itself.

The callback has the following signature ``callback (err, isEnabled, message)``. ``isEnabled`` should be a boolean; ``true`` to enable the edit action, ``false`` to disable it. If it is disabled, you can use ``message`` to provide a message that will be displayed to the user if they click on the edit button.
