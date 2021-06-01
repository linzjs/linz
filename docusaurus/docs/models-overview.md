---
id: models-overview
title: Overview DSL
sidebar_label: Overview DSL
---

The Models overview DSL is used to customise the record overview that is generated for each record.
It is highly customizable and allows you to display sections, tabs, or something completely custom.

`overview` should be an object, containing a `body` array and an optional `actions` array.

## Body

Inside of the body array you can have:

-   An object to display a section.
-   An array of objects to display a section in tabs.
-   A function to display custom HTML.

```javascript
  overview: {
    body: [
      {...},
      [...],
      () => {...},
    ],
  },
```

### Object

To display a normal section, you can use an object with the keys `fields` and `label`:

```javascript
  overview: {
    body: [
      {
        fields: [
          'nameOfField1',
          {
            fieldName: 'nameOfField2',
            renderer: somecellrenderer,
          },
        ],
        label: 'Section heading',
      },
    ],
  },
```

`fields` is an array that accepts field names as strings which will auto format the fields for you or objects where you have to provide the `fieldName` and `renderer`.

`label` is the section heading string.

### Tabs

To display a section as tabs, use an array of objects.

Each object will have an identical syntax to a normal section.:

```javascript
  overview: {
    body: [
      [
        {
          fields: [
            'nameOfField1',
            {
              fieldName: 'nameOfField2',
              renderer: somecellrenderer,
            },
          ],
          label: 'Section heading 1',
        },
        {
          fields: [
            'nameOfField3',
            {
              fieldName: 'nameOfField4',
              renderer: somecellrenderer,
            },
          ],
          label: 'Section heading 2',
        },
      ],
    ],
  },
```

### Custom HTML

You can also render some custom HTML in a section.

To do this, pass a function that accepts the following parameters:

-   req - The HTTP request object.
-   res - The HTTP response object.
-   record - The overview record.
-   model - The record model.
-   cb - A standard callback function.

```javascript
  overview: {
    body: [
      (req, res, record, model, cb) => cb(null, 'Custom HTML section'),
    ],
  },
```

## Actions

`actions` is an array of objects that take the same syntax as record actions. It can contain the following keys:

-   `label` is the name of the action.
-   `action` is the last portion of a URL, which is used to perform the action.
-   `modal` optionally render the results in a modal view.

For example:

```javascript
  overview: {
    actions: [
      {
        label: 'Import people',
        action: 'import-from-csv',
        modal: true,
      },
    ],
  }
```
