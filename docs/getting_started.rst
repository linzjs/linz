.. highlight:: javascript

*************************
Getting started with Linz
*************************

This will help you create a new Linz-based website. If you'd like to develop Linz itself, see :ref:`contributors-getting-started-reference`.

While we're working on our documentation, you can get started with Linz via our example project, see :ref:`mini-twitter-reference`.

Linz tries to force as little new syntax on you as possible. Of course, this is unavoidable in certain situations, and there are some conventions you'll need to learn. We've tried to keep them as simple as possible.

Linz does make use of many other open source tools, such as Mongoose or Express. Linz tries to keep the usage of these tools as plain and simple as possible. Linz doesn't wrap, customise or prettify syntax for other libraries/tools used within Linz. The three primary opensource tools that Linz relies on are:

- Express
- Mongoose
- Passport

The following will be a general overview of some of the core concepts of Linz.

Singleton
=========

When you require Linz, you're returned a singleton. This has the advantage that no matter where you require Linz, you get the same Linz instance.

Initialization
==============

Linz must be initialized. During initialization, Linz accepts an options object with any of the following optional keys:

- ``express``: An initialized Express intance.
- ``passport``: An initialized Passport instance.
- ``mongoose``: An initialized Mongoose instance.
- ``options``: An options object to customise Linz.

For example::

  var express = require('express'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      linz = require('linz');

  linz.init({
      express: express(),
      mongoose: mongoose
      passport: passport,
      options: {
          'load configs': false
      }
  });

If neither an initialized instance of Express, Passport or Mongoose, nor an options object have been passed, Linz will create them for you::

  // Use anything that has been passed through, or default it as required.
  this.app = opts.express || express();
  this.mongoose = opts.mongoose || require('mongoose');
  this.passport = opts.passport || require('passport');

  // overlay runtime options, these will override linz defaults
  this.options(opts.options || {});

.. _options-object-reference:

Options object
--------------

An object can be used to customize Linz. For example::

  linz.init({
      options: {
          'mongo': `mongodb://${process.env.MONGO_HOST}/db`
      }
  });

You can read more about :ref:`defaults-reference`.

Events
======

The Linz object is an event emitter, and will emit the ``initialized`` event when Linz has finished initializing.

It will also emit an event whenever a configuration is set (i.e. using the `linz.set` method). The name of the event will be the same as the name of the configuration that is set.

A common pattern for setting up Linz, using the event emitter, is as follows:

**server.js**::

  var linz = require('linz');

  linz.on('initialised', require('./app'));

  // Initialize Linz.
  linz.init({
      options: {
          mongo: `mongodb://${process.env.DB_HOST || 'localhost'}/lmt`,
          'user model': 'mtUser'
      }
  });

**app.js**::

  var http = require('http'),
    linz = require('linz'),
    routes = require('./routes'),
    port = process.env.APP_PORT || 4000;

  module.exports = function () {

    // Mount routes on Express.
    linz.app.get('/', routes.home);
    linz.app.get('/bootstrap-users', routes.users);

    // Linz error handling midleware.
    linz.app.use(linz.middleware.error);

    // Start the app.
    http.createServer(linz.app).listen(port, function(){
      console.log('');
      console.log(`mini-twitter app started and running on port ${port}`);
    });

  };


Directory structure
===================

Linz expects a common directory structure. If provided, it will load content from these directories. These directories should live alongside your Node.js entry point file (i.e. ``node server.js``).

- ``models``: a directory of model files.
- ``schemas``: a directory of schemas, which are used as nested schemas within a model.
- ``configs``: a directory of config files.

You can read more about each of the above and what Linz expects in the documentation covering each area.
