.. highlight:: javascript

.. _models-grid-reference:

********
Grid DSL
********

The Models grid DSL is used to customise the model index that is generated for each model. The grid DSL has quite a few options, as the model index is highly customizable.

``grid`` should be an object, containing the following top-level keys:

- ``actions``
- ``columns``
- ``sortBy``
- ``toolbarItems``
- ``showSummary``
- ``filters``
- ``paging``
- ``groupActions``
- ``recordActions``
- ``export``

These allow you to describe how the model index should function.

grid.actions
============

``grid.actions`` should be an Array of Objects. Each object describes an action that a user can make, at the model level. Each action should be an Object with the following keys:

- ``label`` is the name of the action.
- ``action`` is the last portion of a URL, which is used to perform the action.

For example::

  actions: [
    {
      label: 'Import people',
      action: 'import-from-csv'
    }
  ]

This will generate a button, on the model index, next to the model label. Multiple actions will produce a button titled *Actions* with a drop-down list attached to it, containing all possible actions.

The evaluated string ``/{linz-admin-path}/model/{model-name}/action/{action.action}`` will be prefixed to the value provided for ``action`` to generate a URL, for example ``/admin/model/person/import-from-csv``. It is the developers responsibility to mount the ``GET`` route using Express, and respond to it accordingly.

The actions will be rendered in the order they're provided.

grid.columns
============

``grid.columns`` is used to customize the columns that appear in the table on the model index.

``grid.columns`` should be an Object, keyed by each field in your model. The value for each key should be ``true`` to include the field or ``false`` to exclude the field. For example::

  columns: {
    name: true,
    username: true
  }

Linz will convert the following into::

  columns: {
    name: {
      label: 'Name',
      renderer: linz.formtools.cellRenderers.default
    },
    username: {
      label: 'Username',
      renderer: linz.formtools.cellRenderers.default
    }
  }

If you like, you can pass an object rather than the boolean. This also allows you to customize the cell renderer used to display the data within the column.

If you provide a ``label``, it will override what is defined in the :ref:`models-label-dsl-summary-reference`.

The columns will be rendered in the order they're provided.

grid.sortBy
===========

``grid.sortBy`` is used to customise the sort field(s) which the data in the model index will be retrieved with.

``grid.sortBy`` should be Array of field names, for example::

  sortBy: ['name', 'username']

This Array will be used to populate a drop-down list on the model index. The user can choose an option from the drop-down to sort the datagrid with.

grid.toolbarItems
=================

``grid.toolbarItems`` can be used to provide completely customised content on the toolbar of a model index. The toolbar on the model index sits directly to the right of the Model label, and includes action buttons and drop-downs.

``grid.toolbarItems`` should be an Array of Objects. Each object should provide a ``render`` key with the value of a Function. The function will be executed to retrieve HTML to be placed within the toolbar. The function will be provided the request `req`, the response object `res` and callback function which should be executed with the HTML. The callback function has the signature ``callback(err, html)`` For example::

  toolbarItems: [
    {
      renderer: function (req, res, cb) {

        let locals = {};
        return cb(null, templates.render('toolbarItems', locals));

      }
    }
  ]

grid.showSummary
================

``grid.showSummary`` can be used to include or exclude the paging controls from a model index.

``grid.showSummary`` expects a boolean. Truthy/falsy values will also be interpreted, for example::

  showSummary: true

grid.filters
============

``grid.filters`` can be used to include filters which will alter the data included in the dataset for a particular model. Filters can contain a custom user interface, but Linz comes with a standard set of filters.

``grid.filters`` should be an Object, keyed by each field in your model. Each Object must contain a filter, which should be an object adhering to the Linz model filter API. For example::

  filters: {
    dateModified: {
      filter: linz.formtools.filters.dateRange
    }
  }

The following will allow your model to be easily filtered by a date range filter, on the ``dateModified`` property. For a complete list of the filters available see https://github.com/linzjs/linz/tree/master/lib/formtools/filters.

grid.paging
===========

``grid.paging`` can be used to customise the paging controls for the model index. Paging controls will only be shown when the number of results for a model index, are greater than the per page total.

``grid.paging`` should be an Object, with the following keys:

- ``active`` is an optional Boolean used to turn paging on or off. It defaults to ``true``.
- ``size`` is the default page size. It defaults to ``20``.
- ``sizes`` is an Array of the page sizes available for a user to choose from on the model index. It defaults to ``[20, 50, 100, 200]``.

For example::

  paging: {
    active: true,
    size: 50,
    sizes: [50, 100, 150, 200]
  }

If you don't provide a paging object it defaults to::

  paging: {
    active: true,
    size: 20,
    sizes: [20, 500, 100, 200]
  }

grid.groupActions
=================

``grid.groupActions`` can be used to define certain actions that are only available once a subset of data has been chosen.

Each record displayed on a model index has a checkbox, checking two or more records creates a group. If ``groupActions`` have been defined for that model, those actions will become chooseable by the user.

``grid.groupActions`` should be an Array of Objects. Each object describes an action that a user can make, and the object takes on the same form as those described in `grid.actions`_.

You're responsible for mounting a ``GET`` route in Express to respond to it.

grid.recordActions
==================

``grid.recordActions`` can be used to customise record specific actions. These are actions that act upon a specific model record. They appear in a drop-down list under the Actions column in a model index table.

``grid.recordActions`` should be an Array of Objects. Each object describes an action that a user can make, specific to the record, and the object takes on the same form as those described in `grid.actions`_.

``grid.recordActions`` can also accept a function, as the value to a ``disabled`` property. If provided, the function will be excuted with the following signature ``disabled (record, callback)``.

The callback has the following signature ``callback (error, isDisabled, message)``. ``isDisabled`` should be a boolean. ``true`` to disable the record action, ``false`` to enable it and you can provide a message if the action is to be disabled.

You're responsible for mounting a ``GET`` route in Express to respond to it.

grid.export
===========

``grid.export`` is used to denote that a particular model is exportable. Linz takes care of the exporting for you, unless you want to provide a custom action to handle it yourself.

When a user clicks on an export, they'll be provided a pop-up modal asking them to choose and order the columns they'd like to export.

``grid.export`` should be an Array of Objects. Each object describes an export option, for example::

  export: [
    {
      label: 'Choose columns to export',
      exclusions: 'dateModified,dateCreated'
    }
  ]

Each object should contain the following keys:

- ``label`` which is the name of the export.
- ``exclusions`` which is a list of fields that can't be exported.

If you'd like to provide your own export route, you can. Replace the ``exclusions`` key with an ``action`` key that works the same as `grid.actions`_. Rather than a modal, a request to that route will be made. You're responsible for mounting a ``GET`` route in Express to respond to it.
