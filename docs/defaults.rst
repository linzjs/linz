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
