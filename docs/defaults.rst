.. highlight:: javascript

.. _defaults-reference:

*************
Linz defaults
*************

Linz has a bunch of defaults, which can be use to alter Linz and the way it works. The coverage of the defaults and what they actually do, vary from default to default.

This document outlines the defaults and how they can be used to alter Linz.

**Please note:** this document is a work in progress and not all defaults have been documented. For a complete list of customizations you can make, view Linz's defaults_.

.. _defaults: https://github.com/linzjs/linz/blob/master/lib/defaults.js

Setting defaults
================

There are two ways to alter the defaults:

- At init time.
- Any other time using the ``linz.set`` function.

Read about the :ref:`options-object-reference` for more information about how to set the defaults at init time.

Alternatively, you can set a default using the ``linz.set`` function::

  var linz = require('linz');

  linz.on('initialised', require('./app'));

  linz.set('mongo', `mongodb://${process.env.MONGO_HOST}/db`);


The defaults
============

The following lists the defaults that you can use to customise Linz. Please note, not all defaults are detailed. Please `review the code for more information`_.

.. _review the code for more information: https://github.com/linzjs/linz/blob/master/lib/defaults.js

.. _cookie-options-reference:

cookie options
--------------

This is the options object that is passed to the session middleware, and cookie parser middleware. By default the ``HttpOnly`` and ``SameSite`` attributes are enabled. The ``Secure`` attribute is off by default, but it's recommended to turn this on if you're delivering Linz over HTTPS (which we highly encourage).

Review the options for the `session middleware`_ and the `cookie parser middleware`_.

.. _session middleware: https://github.com/expressjs/session#cookie
.. _cookie parser middleware: https://github.com/jshttp/cookie#options

cookie secret
-------------

This is the secret that is used to secure the session cookie used by Linz. You can change this to any string that you'd like. It is passed to the default session middleware and cookie parser middleware.

customAttributes
----------------

The ``customAttributes`` default allows you to customise the HTML attributes applied to the ``body``. This can be useful for a range of things including targeting styles specific to a custom attribute, or supplying information about the user which can be used by JavaScript widgets.

To use ``customAttributes`` define a function with the following signature::

  /**
   * @param {Object} req  A HTTP request object.
   * @return Array
   */
  customAttributes (req)

The function should return an array of objects containing attributes in a name/value pair::

  customAttributes (req) => {

    const attributes = [];

    if (req.user && req.user.group) {
      attributes.push({
        name: 'data-linz-usergroup',
        value: req.user.group
      });
    }

    return attributes;

  }

This will result in a ``body`` tag with custom attributes on all Linz pages::

  <body data-linz-usergroup='20'>

routes
------

The ``routes`` default allows you to define middleware that should be executed during the process of specific Linz routes.

To use ``routes`` create an object, keyed by a HTTP verb (i.e. ``get``), with the value being an object keyed by a Linz route path, and the value being a middleware function. For example::

  const routes = {
    get: {
      '/model/:model/:id/overview': (req, res, next) => {

        // Middleware functionality

        return next();

      },
    },
  };

This would result in the middleware being executed whenever an overview page for any record of any model is viewed.

Importantly, the middleware above is executed after Linz middleware processing and before Linz route processing (i.e. where the view is rendered). This gives you great flexibility and also allows you to benefit from all of the work already completed by Linz. For example, you can inspect the record by referencing ``req.linz.record``.

The following is an object containing an example showing all routes you can hook into::

  const routes = {
    get: {
        '/models/list': (req, res, next) => next(),
        '/model/:model/list': (req, res, next) => next(),
        '/model/:model/new': (req, res, next) => next(),
        '/model/:model/export': (req, res, next) => next(),
        '/model/:model/:id/overview': (req, res, next) => next(),
        '/model/:model/:id/edit': (req, res, next) => next(),
        '/model/:model/:id/delete': (req, res, next) => next(),
        '/model/:model/:id/json': (req, res, next) => next(),
        '/model/:model/:id/action/:action': (req, res, next) => next(),
        '/configs/list': (req, res, next) => next(),
        '/config/:config/overview': (req, res, next) => next(),
        '/config/:config/edit': (req, res, next) => next(),
        '/config/:config/default': (req, res, next) => next(),
        '/config/:config/json': (req, res, next) => next(),
    },
    post: {
        '/model/:model/list': (req, res, next) => next(),
        '/model/:model/create': (req, res, next) => next(),
        '/model/:model/export': (req, res, next) => next(),
        '/model/:model/:id/save': (req, res, next) => next(),
        '/config/:config/save': (req, res, next) => next(),
    },
  };

scripts
-------

The ``scripts`` default allows you to customise the external JavaScripts that are loaded on each page in Linz.

To use ``scripts`` define a function with the following signature::

  /**
   * @param {Object} req A HTTP request object.
   * @param {Object} res A HTTP response object.
   * @return {Promise} Resolves with an array of script objects.
   */
  scripts (req, res)

The function should return an array of objects containing the same HTML attributes as the ``<script>`` tag::

  scripts (req, res) => {

    return Promise.resolve(res.locals.scripts.concat([
      {
        crossorigin: 'anonymous',
        integrity: 'sha256-5YmaxAwMjIpMrVlK84Y/+NjCpKnFYa8bWWBbUHSBGfU=',
        src: '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js',
      },
    ]));

  }

``res.locals.scripts`` contains all the scripts used by Linz, be careful when removing/updating these as it could break functionality within Linz.
You should use the existing array as the array that is resolved with the promise because it will replace ``res.locals.scripts``, not append to it.

The script objects can contain an additional ``inHead`` boolean option to optionally load the script in the head tag.

To create data attributes, you can add a ``dataAttributes`` property with a key that will be prefixed with ``data-`` when output in HTML. For example::

  scripts (req, res) => {

    return Promise.resolve(res.locals.scripts.concat([
      {
        dataAttributes: {
          test: 'test',
        },
      },
    ]));

  }

will create the script::

  <script data-test="test"></script>

You can also supply a ``content`` property, which if provided, will add the value of the ``content`` property within the script open and close tags.

session options
---------------

This is the options object that is passed to the session middleware. The ``cookie`` property is set based on the :ref:`cookie-options-reference` default.

Review the options for the `session middleware`_ and the `cookie parser middleware`_.

.. _session middleware: https://github.com/expressjs/session#cookie
.. _cookie parser middleware: https://github.com/jshttp/cookie#options

styles
-------

The ``styles`` default allows you to customise the external CSS stylesheets that are loaded on each page in Linz.

To use ``styles`` define a function with the following signature::

  /**
   * @param {Object} req A HTTP request object.
   * @param {Object} res A HTTP response object.
   * @return {Promise} Resolves with an array of style objects.
   */
  styles (req, res)

The function should return an array of objects containing the same HTML attributes as the ``<link>`` tag::

  styles (req, res) => {

    return Promise.resolve(res.locals.styles.concat([
      {
        crossorigin: 'anonymous',
        href: '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css',
        integrity: 'sha256-yMjaV542P+q1RnH6XByCPDfUFhmOafWbeLPmqKh11zo=',
        rel: 'stylesheet',
      },
    ]));

  }

``res.locals.styles`` contains all the styles used by Linz, be careful when removing/updating these as it could break functionality within Linz.
You should use the existing array as the array that is resolved with the promise because it will replace ``res.locals.styles``, not append to it.

To create data attributes, you can add a ``dataAttributes`` property with a key that will be prefixed with ``data-`` when output in HTML. For example::

  styles (req, res) => {

    return Promise.resolve(res.locals.styles.concat([
      {
        dataAttributes: {
          test: 'test',
        },
      },
    ]));

  }

will create the script::

  <link data-test="test" />

You can also supply a ``content`` property, which if provided, will add the value of the ``content`` property within a ``style`` open and close tags.

mongoOptions
------------

Mongoose's default connection logic is deprecated as of 4.11.0. ``mongoOptions`` contains the minimum default connection logic required for a connection::

  'mongoOptions': {
    useMongoClient: true
  }

See `Mongoose connections`_. for more details and configurations.

.. _Mongoose connections: http://mongoosejs.com/docs/guide.html

404
---

The `404` default allows you to pass in your own 404 html.

To use ``404`` define a function with the following signature::

  /**
   * @param {Object} req A HTTP request object.
   * @return {Promise} Resolves with the html.
   */
  404 (req) => Promise.resolve(html)

The function should return a Promise that resolves with the html string.
