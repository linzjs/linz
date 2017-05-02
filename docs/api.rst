.. highlight:: javascript

.. _api-reference:

***********
Developer API
***********

Linz contains many useful APIs to simplify development.

Views
===================

``linz.api.views.render(options, callback)``

Render a template in the context of Linz.

The ``option`` object accepts the following keys:

- ``header`` Provide your own header. (wrapper template only)
- ``body`` Provide the body content.
- ``page`` Provide the page content. (wrapper template only)
- ``script`` Provide additional scripts.
- ``linzNavigation`` Optionally override the navigation.
- ``template`` ('wrapper' or 'wrapper-preauth').

The ``callback`` is a standard Node.js callback function ``(err, result)``

You may also provide a ``res`` object that Linz will call to render a template.
