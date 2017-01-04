.. highlight:: javascript

.. _models-form-reference:

***************
Models form DSL
***************

The Models form DSL is used to customise the create and edit forms that are generated for each model. The form DSL has quite a few options as the model create and edit forms are highly customizable.

``form`` should be an object, containing the following top-level keys:

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
