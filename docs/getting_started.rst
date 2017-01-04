*************************
Getting started with Linz
*************************

This will help you create a new Linz-based website. If you'd like to develop Linz itself, see :ref:`contributors-getting-started-reference`.

While we're working on our documentation, you can get started with Linz via our example project, see :ref:`mini-twitter-reference`.

Linz tries to force as little new syntax on you as possible. Of course, this is unavoidable in certain situations, and there are some conventions you'll need to learn. We've tried to keep them as simple as possible.

Linz does make use of many other open source tools, such as Mongoose or Express. Linz tries to keep the usage of these tools as plain and simple as possible. Linz doesn't wrap, customise or pretify syntax for other libraries/tools used within Linz. The three primary opensource tools that Linz relies on are:

- Express
- Mongoose
- Passport

The following will be a general overview of some of the core concepts of Linz.

Initialization
==============

Linz must be initialized. During initialization, Linz can optionally accept any of the following (in any order):

- An initialized Express intance.
- An initialized Passport instance.
- An initialized Mongoose instance.
- An options object to customise Linz.

For example::

  var express = require('express'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      linz = require('linz');

  linz.init(express(), mongoose, passport, {
    'load configs': false
  });

If neither an initialized instance of Express, Passport or Mongoose have been passed, or an options object, Linz will create it's own::

  // use anything that is passed in
  _app = _app || express();
  _mongoose = _mongoose || require('mongoose');
  _passport = _passport || require('passport');
  _options = _options || {};

Options object
--------------

An object can be used to customize Linz. For example::

  linz.init({
    'mongo': `mongodb://${process.env.MONGO_HOST}/db`
  });

For a complete list of keys you can use to customise Linz, view Linz's defaults_.

.. _defaults: https://github.com/linzjs/linz/blob/master/lib/defaults.js
