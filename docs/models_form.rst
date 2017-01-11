.. highlight:: javascript

.. _models-form-reference:

***************
Models form DSL
***************

The Models form DSL is used to customise the create and edit forms that are generated for each model. The form DSL has quite a few options as the model create and edit forms are highly customizable.

The form DSL is used to construct create and edit form controls (for example checkboxes, or text inputs) for a model record. Each key in the ``form`` object represents of your model's fields.

The type of form control used for each field can be defined explicitly, or determined by Linz (the default) based on the fields data type, as specificed when defining the field with Mongoose.

Each form control comes in the form of a widget, and can be explicitly altered by providing a different Linz widget, or creating your own widget.

``form`` should be an object. It should contain a key, labelled with the name of the model field you're providing information for.

For example, if you had a model with the fields ``name`` and ``email`` your ``form`` DSL might look like::

  form: {
    name: {
      // configure the edit widget for the name field
    },
    email: {
      // configure the edit widget for the name field
    }
  }

Each field object can contain the following top-level keys:

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

These allow you to describe how the model create and edit forms should function.

Specialized contexts
====================

The area two specialized contexts in which the ``form`` DSL operates:

- When creating a model
- When editing a model

From time to time, you'll want to have different settings for one field, based on the context. Linz supports this through use of ``create`` and ``edit`` keys. Each of the above top-level keys can also be provided as a child of either ``create`` and ``edit``. For example::

  form: {
    username: {
      create: {
        label: 'Create a username',
        helpText: 'You can\'t change this later on, so choose wisely.'
      },
      edit: {
        label: 'The person\'s username',
        disabled: true,
        helpText: 'Once created, you can\'t edit the username.'
      }
    }
  }

You can also use a combination of the default context and the specialized contexts ``create`` and ``edit`` contexts, for example::

  form: {
    username: {
      label: 'The person\'s username',
      edit: {
        label: 'Uneditable username'
      }
    }
  }

On the create form, the label for the ``username`` field will be *The person's username*, but *Uneditable username* on the edit form.

The specialized ``create`` and ``edit`` contexts always supersede the default context.

{field-name}.label
==================

The ``label`` property is optional. If not provided, it takes the label from the :ref:`models-label-dsl-summary-reference`. It a label hasn't been provided for that particular model field, it simply shows the name of the field itself.

The label property gives you an opportunity to customise it explicitly for the create and edit views.

{field-name}.placeholder
========================

When you have a field of an appropriate type (such as text field), you can define the ``placeholder`` which sets the content of the HTML's ``<input>`` tag ``placeholder`` attribute.

{field-name}.helpText
=====================

The ``helpText`` property can be used to supply additional text that sits below the form input control, providing contextual information to the user filling out the form.

{field-name}.type
=================

The ``type`` property is intended to help Linz with two things:

- Manage the data that the field contains in an appropriate manner.
- To determine which widget to use if the ``widget`` property wasn't provided.

``type`` accepts the following strings:

- ``array``
- ``boolean``
- ``date``
- ``datetime``
- ``datetimeLocal``
- ``digit``
- ``documentarray``
- ``documentarray``
- ``email``
- ``enum``
- ``hidden``
- ``number``
- ``password``
- ``tel``
- ``text``
- ``url``
