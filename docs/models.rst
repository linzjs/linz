.. highlight:: javascript

*************************
Models
*************************

One of the primary reasons to use Linz is to ease model development and scaffold highly customizable interfaces for managing these models. Linz provides a simple DSL you can use to describe your model. Using the content of your DSL, Linz will scaffold an index, overview, edit handlers and provide a basic CRUD HTTP API for your model.

All Linz models are bootstrapped with two mandatory properties:

- ``dateCreated`` with a label of *Date created*.
- ``dateModified`` with a label of *Date modified*.

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
      description: 'A person.'
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

- ``model`` contains basic information such as the ``label`` and ``description`` of the model.
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

``model`` should be an Object with two keys ``label`` and ``description``. The ``label`` should be a singular noun describing the model, and the ``description`` a short sentence describing the noun.

The ``label`` is used in many places and is automatically pluralized based on the usage context. The ``description`` is only used on the Models index within Linz.

For example::

  model: {
    label: 'Person',
    description: 'A person.'
  }

.. _models-label-dsl-summary-reference:

Models label DSL
----------------

``labels`` is used to provide a label and description for the model.

``labels`` should be an Object, keyed by field names and strings of the human friendly versions of your field names.

For example::

  labels: {
    name: 'Name',
    email: 'Email'
  }

You can customize the labels for the default ``dateModified`` and ``dateCreated`` using this object.

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
