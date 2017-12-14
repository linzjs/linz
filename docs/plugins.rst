.. highlight:: javascript

.. _plugins-reference:

********
Plugins
********

Linz comes with a number of userful mongoose plugins.

model.queryPlugin
=================

The query plugin extends the mongoose ``find`` and ``findOne`` static methods through the methods ``findDocuments`` and ``findOneDocument``.

``findDocuments`` accepts all mongoose query options within a single options object. Note the defaults in the example.

  Model.findDocuments({
      filter: {},
      lean: true,
      limit: 10,
      projection: '',
  })

``findOneDocument`` accepts all mongoose query options within a single options object. Note the defaults in the example.

  Model.findOneDocument({
      filter: {},
      lean: true,
      projection: '',
  })
