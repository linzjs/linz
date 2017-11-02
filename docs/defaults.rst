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

The following lists the defaults that you can use to customise Linz.

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

mongoOptions
------------

Mongoose's default connection logic is deprecated as of 4.11.0. ``mongoOptions`` contains the minimum default connection logic required for a connection:

  'mongoOptions': {
    useMongoClient: true
  }

See `Mongoose connections`_. for more details and configurations.

.. _Mongoose connections: http://mongoosejs.com/docs/guide.html
