.. highlight:: javascript

.. _permissions-reference:

***********
Permissions
***********

Linz has a unique permissions model, mostly due to the fact that it assumes nothing (well, nothing that you can't alter anyway) about your user model; only that you have one.

Many frameworks define a user model that you must adhere to. Linz doesn't. This provides an opportunity for a simplified yet highly flexible permissions model.

Permissions can be provided for both models and configs.

There are a few contexts you should be aware of.

The full scope of contexts are:

- In the context of all models:
    - ``models.canList``

- In the context of a particular model:
    - ``model.canCreate``
    - ``model.canDelete``
    - ``model.canEdit``
    - ``model.canList``
    - ``model.canView``

- In the context of all configs:
    - ``configs.canList``

- In the context of a particular config:
    - ``config.canEdit``
    - ``config.canList``
    - ``config.canReset``
    - ``config.canView``
    - ``config.canView``

Linz enforces permissions in two places:

- The UI
- A route execution

Linz will not render buttons, links to or actions for functionality that a user doesn't have access to. Route are completely protected. So even if a route was discovered, a user without permissions would not be able to resolve it.

Default permissions
===================

This is Linz's default permissions implementation::

  function (user, context, permission, callback) {
    return callback(true);
  }

In short, there are no permissions.

Global permissions
==================

Linz implementations can provide a function (in the ``options`` object when initializing Linz) called ``permissions``. It should have the signature::

  function permission (user, context, permission, callback)

This function will be called whenever Linz is evaluating the ``models.canList`` and ``configs.canList``. Most commonly when generating navigation for a user, but also on the models list and configs list pages.

The ``user`` is the user making the request for which permissions are being sought.

The context will be either a string, or an object. If it is a string, it will be either::

  // In the context of all models
  'models'

  // In the context of all configs
  'configs'

  // In the context of a particular model
  {
    'type': 'model',
    'model': 'modelName'
  }

  // In the context of a particular config
  {
    'type': 'config',
    'config': 'configName'
  }

The ``permission`` will be one of the following strings:

- ``canCreate``
- ``canDelete``
- ``canEdit``
- ``canList``
- ``canReset`` (configs only)
- ``canView``

The ``callback`` accepts the following signature::

  function callback (result)

``result`` is a boolean. Please note, this is different from the standard Node.js callback signature of ``function callback (err, result)``. You should design your function so that it returns false in the even of an error and logs the error for a post-mortem.

Throwing errors and failing at the point of checking permissions would not be a good look for anyone, hence the design to not provide this capability. This is something that needs to be handle by a developer.

Model and config permissions function
=====================================

Determining permissions for models and configs is more contextually sensitive. To do this, when defining a model or config, you can also provide a ``permissions`` key.

The key can have a value of either an object or a function. If an object is provided, it is used directly. If a function is provided, you have the benefit of knowing which user the permissions are being requested for. A function should have the following signature::

  function modelPermission (user, callback)

The callback accepts the following signature::

  function callback (err, result)

``err`` should be ``null`` if no error occurred. If an error has occurred, you can return it to the callback which will then default the ``result`` to ``false``. ``result`` should be an object.

The result object should contain optionally the following keys with boolean values:

- ``canEdit``
- ``canDelete``
- ``canList``
- ``canCreate``
- ``canView``

Each key is optional, and defaults to ``true`` if not provided. Linz evaluates the values with the ``===`` operator so an explicit ``false`` must be provided to limit permissions.
