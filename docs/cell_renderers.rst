.. highlight:: javascript

**************
Cell renderers
**************

Linz tries to provide as many customisation options as possible. One of those is in the form of a what we call a cell renderer.

Cell renderers can be used within record overviews and model indexes. They're used to represent data to the user in a human friendly way.

You can do many things with cell renderers that will improve the user experience. For example, you could take latitude and longitude values and render a map, providing visual context about location information specific to the record.

Built-in cell renderers
=======================

There are already `many built-in cell renderers`_. They can all be accessed in the following namespace ``linz.formtools.cellRenderers``.

The following shows how to define a specific cell renderer for a list field::

  list: {
    fields: {
      websiteUrl: {
        label: 'Website url',
        renderer: linz.formtools.cellRenderers.url
      }
    }
  }

The following provides a description of each built-in cell renderer:

- ``date`` used with ``date`` field types to render a date, as per the ``date format`` setting.
- ``datetime`` used with ``datetime`` field types to render a datetime, as per the ``datetime format`` setting.
- ``localDate`` used with ``datetime`` field types to render a ``<time>`` tag as per the ``date format`` setting.
- ``datetimeLocal`` used with ``datetime-local`` field types to render a ``<time>`` tag as per the ``datetime format`` setting.
- ``overviewLink`` can be used to provide a link in the list, to the overview for a particular record.
- ``array`` can be used to format an array in the format ``value 1, value 2, value 3``.
- ``boolean`` can be used to format a boolean in the format ``Yes`` or ``No``.
- ``reference`` can be used to render the title for a ``ref`` field type.
- ``url`` can be used with ``url`` field types to render an ``<a>`` tag linking to the URL stored as the value of the field.
- ``documentarray`` can be used with an embedded document to render a table showing embedded documents.
- ``text`` can be used to render text, or any value as it is.
- ``default`` is used by Linz as the default cell renderer if a specific type can't be matched. It attempts to support arrays, dates, numbers, booleans and url field types.

Custom cell renderers
=====================

You can quite easily create and use your own cell renderer. All cell renderers must have the same signature::

  function renderer (value, record, fieldName, model, callback)

The ``value`` is the value that needs to be rendered. The ``record`` is a copy of the entire record that the ``value`` belongs to. The ``fieldName`` is the name of the field that is being rendered. The ``model`` is a reference to the model that the ``record`` belongs to.

The ``callback`` is a function that accepts the standard Node.js callback signature::

  function callback (err, result)

The ``result`` should be HTML. The HTML will be used directly, without manipulation. As it is HTML, you can provide inline JavaScript and CSS as required to add functionality your cell renderer.

The following is an example of a cell renderer that will look up data for a reference field and render the title::

  function renderReference (val, record, fieldName, model, callback) {

    // Make sure we have the neccessary value, without erroring.
    if (!val || typeof val === 'string' || typeof val === 'number') {
      return callback(null, val);
    }

    // Retrieve the related documents title.
    linz.mongoose.models[val.ref].findById(val._id, (err, doc) => {

      if (err) {
        return callback(err);
      }

      return callback(null, (doc && doc.title) ? doc.title : `${val} (missing)`);

    });

  };

.. _many built-in cell renderers: https://github.com/linzjs/linz/blob/master/lib/formtools/renderers-cell.js
