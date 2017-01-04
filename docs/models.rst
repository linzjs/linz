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
    grid: {
      columns: {
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

Mongose schemas
===============

Linz works directly with Mongoose schemas. Anything you can do with a Mongoose schema is acceptable to Linz.

Model DSL
=========

Linz uses a Model DSL, which is an object that can be used to describe your model. Linz will use this information scaffold user interfaces for you. The Model DSL contains six main parts:

- ``model`` contains basic information such as the ``label`` and ``description`` of the model.
- ``labels`` contains human friendly versions of your model's properties, keyed by the property name.
- ``grid`` contains information used to scaffold the table displaying model records.
- ``form`` contains information used to scaffold the edit handler for a model record.
- ``overview`` containers information used to scaffold the overview for a model record.
- ``fields`` contains directives to enable/disable fields that Linz automatically adds to models.

You supply the DSL to Linz in the form of an object, to the ``linz.formtools.plugins.document`` Mongoose plugin::

  personSchema.plugin(linz.formtools.plugins.document, {
    model: {
      // ...
    },
    labels: {
      // ...
    },
    grid: {
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
    }
  });

model
-----

``model`` should be an object with two keys ``label`` and ``description`` The ``label`` should be a singular noun describing the model, and the ``description`` a short sentence describing the noun.

The ``label`` is used in many places and is automatically pluralized based on the usage context. The ``description`` is only used on the Models index within Linz.

For example::

  model: {
    label: 'Person',
    description: 'A person.'
  }

labels
------

``labels`` is used to provide a label and description for the model.

``labels`` should be an object, keyed by field names and strings of the human friendly versions of your field names.

For example::

  labels: {
    name: 'Name',
    email: 'Email'
  }

You can custom the labels for the default ``dateModified`` and ``dateCreated`` using this object.

grid
----

``grid`` is used to customise the model index that is generated for each model.

``grid`` should be an object, containing the following top-level keys:

- ``actions``
- ``columns``
- ``sortBy``
- ``toolbarItems``
- ``showSummary``
- ``filters``
- ``paging``
- ``groupActions``
- ``recordActions``
- ``export``

These allow you to describe how the model index should function. The grid DSL is discussed in more detail in :ref:`models-grid-reference`.
