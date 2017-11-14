# CHANGELOG

## Unreleased

### BREAKING CHANGES

- When rendering the overview, Linz will no longer infer the cell renderer type from the Form DSL type data. If Linz isn't rendering the overview cell with the correct cell renderer, you should supply the renderer (i.e. `{ label: 'x', renderer: linz.formtools.cellRenderers.text }`).
- When supplying a function for the config form, model list, form and overview DSLs, you no longer get passed `user`, but instead `req` (which obviously has user at `req.user`).

### IMPROVEMENTS

- Fixes `#169`, an issue in which the actions column wouldn't render when permissions weren't explicitly set.
- Improved the Express param for model. It no longer process list, overview or form DSL. These are now only processed when required. Improving the efficiency of any route that used `:model`.
- When supplying functions for config form, model list, form and overview DSLs, you now get `req` rather than just `user`. This provides much more flexibility in what you return, as now it can be based on the record being rendered, not just the user making the request.

## v1.0.0-13.0.2 (9 November 2017)

### IMPROVEMENTS

- Fixes issues on the model list in IE, due to use of the template tag.

## v1.0.0-13.0.1 (7 November 2017)

### IMPROVEMENTS

- Fixed a problem with model lists, showing the wrong number of records. This could occur when a `listQuery` static was employed and have an impact on the number of results being returned.
- Improves usage of the `.reponsive-table` class. Still not perfect, but definitely useable.
- You can now add `type='primary'` to a record action to have it rendered inline (i.e. not within the dropdown) with the edit and delete buttons on a model list.
- You can now add `type=primary` to an overview action to have it rendered inline (i.e. not within the actions dropdown).

## v1.0.0-13.0.0 (3 November 2017)

### BREAKING CHANGES

- `linz.api.views.render` now requires `data, req, res`. `callback` is optional.
- The `listQuery` static is now passed `req, query, callback` (additional parameter is `req`).
- When using modal actions, your HTML now has to supply the `<div class="modal-dialog"><div class="modal-content"></div></div>` tags.

### IMPROVEMENTS

- Now that the `listQuery` static is passed `req`, you have more information (such as `req.user`) which can be used to alter the query that Linz will execute.
- Fixes a long term (development only) issue `TypeError: filteredNavigation.forEach is not a function`.
- `utils.js` has been move back into the head. Client-side scripts can now make use of `linz.loadScript` and `linz.addLoadEvent` once again.
- Added a new default `mongoose options` which can be used to control the options passed to Mongoose when making a connection. Provides support for Mongoose `4.11.x` in which the default connection logic has been removed.
- By allowing the results of record/overview actions to return the `.modal-dialog` div, you have more flexibility on the size of the modal (i.e. `<div class="modal-dialog modal-lg">` renders a large modal).
- Removed `.modal-dialog .modal-content` from the modal divs in `layout.jade`. They should now be included in the HTML returned from any record/overview actions that specify the use of a modal.
- You can now use `req.flash('linz-notification', linz.api.views.notification({ text: 'Hi' }))` to have Linz show a notification for you on redirect.
- You can now use `req.linz.notifications.push(linz.api.views.notification({ text: 'Hi' }))` to have Linz show a notification for you.
- Notifications are now shown in models list, model create, model list, record edit and record overview pages.

## v1.0.0-12.0.0 (1 November 2017)

### BREAKING CHANGES

- All `filters` must now return HTML from the `renderer` function, wrapped in `<template>` tags.
- All models must either have a `title` field, or supply `model.title` with the value of the schema field that should be used as the title.
- The `title` virtual, when creating, will no longer use `label`, `name` or `this.toString()` to return a label. It will only ever use `toLabel` method if provided, or the value of the title property.

### IMPROVEMENTS

- Add `data-linz-view` to Model create and list, and record edit and overview pages. This gives CSS hooks to target CSS to certain views.
- Added a new search button on the model list that always lives next to the _Add filter_ button. This replaces the _Filter now_ button that used to only be exposed when there were filters.
- The _Add filter_ and _Search_ buttons are now disabled once the form has been submitted.
- The new `list.search` defaults to `['title']` and will always be on unless you set `list.search` to `false`.
- A models title field, is always in the standard list query.
- A model is now sorted by `dateModifed` in descending order by default.

## v1.0.0-11.0.0 (27 October 2017)

### BREAKING CHANGES

- All `canDelete` and `canEdit` functions now pass through the request object and call the callback `canDelete(req, callback)`. This allows you to disable records on the index view based on the current logged in user.

### IMPROVEMENTS

- Add the ability to set an `alwaysOn` property for filters. This should be a boolean and will hide the close button and automatically show the filter.
- Add the ability to provide a `default` value for `alwaysOn` filters.
- Add the ability to remove the filter from the dropdown and hide the close button using `once: true`.
- Fixed the multi-select filter, when using numbers as the value.
- Integrated the static `getQuery` into the model export process.
- Pagination is now always present.
- Fixed buttons that show content in a modal, on slower connections.
- Fixed typo in password placeholder text.
- Updated the model export, field selection cookie, to be user specific.
- Fixed issues with datePicker code on the client-side.
- Fixed embedded document overview cell renderer.

## v1.0.0-10.0.0 (9 August 2017)

### BREAKING CHANGES

- Deprecated `adminJSFile` and `adminCSSFile` defaults. Please use `scripts` and `styles` instead.

### IMPROVEMENTS

- Add `navigationTransform` property to the Linz initialisation options. This is a function that accepts a navigation and data object parameter `(nav, { user })` and allows customisation of the main navigation menu with additional contexts not available at initialisation.
- Add `customAttributes` property to the Linz initialisation options. This is a function that accepts a `req` object that has gone through all the Linz middleware. i.e. the user is available at this point.
- Allow custom scripts and styles through the `scripts` and `styles` Linz options. These should be functions that take `req` and `res` objects and return a promise that resolves with an array of scripts and styles. The array should contain objects with the same properties as the HTML equivalents.
- Now passing `form` and `user` to `transform` function.
- Now passing `record` to `transpose` function.
- Expose `linz.api.views.getScripts` and `linz.api.views.getStyles` api.
- Added ability to provide Linz with custom navigation via setting `linz.set('navigation', navigation);`.
- Added ability to display icons (html) in custom navigations by adding an icon property `icon: '<i class="fa fa-home" aria-hidden="true"></i>'`.

## v1.0.0-9.0.3 (28 June 2017)

- Add `.linz` class to the Linz navbar.

## v1.0.0-9.0.2 (28 June 2017)

- Fixes an issue with the grid renderer not showing default record actions (edit and delete).

## v1.0.0-9.0.1 (14 June 2017)

- Fixes an issue with the pre-save middleware (when `req` doesn't exist).

## v1.0.0-9.0.0 (13 June 2017)

- Fixed a bug when trying to wrap the list DSL with a `(user, callback)` function.
- Fixed the List DSL to support renderers that return HTML.
- Created record action renderers, which can be used in conjunction with a custom List renderer.
- All modal containers now contain the `div.modal-dialog > div.modal-content` structure.
- Record actions now support `modal: true` to have the URL content displayed within a modal.
- Fixed issue in which action URLs are sometimes updated twice and then no longer function correctly.
- Rather than supplying Mongoose, Express, Passport and an options object as arguments to Linz's init function (in any order), Linz now expects an object. The object can have `mongoose`, `express`, `passport` and `options` keys as required.
- Added ability to customise the homepage route by setting `admin home` in the `options` object or using `linz.set('admin home', '/new/path')`.
- Added the ability to render a view in the context of Linz.
- The `list.showSummary` boolean now excludes record count and sorting if set to `false`.
- The list render data now contains the query parameters.
- Linz filters that render will no longer get stuck.
- Linz can now show alerts (model list view) to the user by pushing objects (formatted via `linz.api.views.notification`) into the `req.linz.notifications` array. Uses the Noty library.

## v1.0.0-8.0.0 (27 March 2017)

### BREAKING CHANGES

- Search and replaced `Grid` with `List`. You will need to update all your models to use `list` rather than `grid` now.
- Search and replaced `Columns` with `Fields`. You will need to update all your models to use `fields` rather than `columns` now.
- Inline with the above, rename any `gridQuery` statics to `listQuery`.

### IMPROVEMENTS

- The List DSL now includes a `renderer` property. currently available renderers include `linz.formtools.listRenderers.default` (alias for `grid`), `linz.formtools.listRenderers.grid`, and `linz.formtools.listRenderers.list`.
- If a `listRenderer` has not been set, the default `linz.formtools.listRenderers.grid` will be used.

## v1.0.0-7.0.0 (3 March 2017)

### BREAKING CHANGES

- When Linz retrieves data for the list view, it no longer retrieves all fields from the database. It retrieves only fields found in `grid.columns`. This means, your `toLabel` and other Mongoose related functionality may not get a complete model record. You can create a static called `gridQuery` which Linz will execute if found, to customise the query that will be executed by Linz.

- The `findForReference` static that Linz will execute if found, must now accept either one `id` or an array of `id`s. This is to support `ref` field optimisations.

### IMPROVEMENTS

Focus on this release was optimization of the list view. Making it much more performant.

- Model counts are now using `model.count` rather than the results of a `model.find`.
- Record counts are now using `model.count` rather than the results of a `model.find`.
- Cell renderers for `ref` fields are now provided the value of the reference, not just the ObjectID. This is to reduce the number of necessary requests to the database. Cell renderers for `ref` fields should no longer need to do this now, because the data is provided to them.
- Previously Linz only supported the type `linz.mongoose.Schema.Types.ObjectId` for `ref` fields. It now supports `linz.mongoose.Schema.Types.Mixed` and can successfully handle ObjectIds, strings and `undefined` values.
- Linz is now automatically indexing fields which are used in `grid.sortBy` and `grid.filters` to ensure a basic level of indexing support. It also indexes `dateModified` and `dateCreated` by default.
- Field names included in `model.find` are now sorted alphabetically for the list view query to make it easier to formulate compound index strategies. You can be guaranteed field names will always appear in alphabetical order.
- You can create a static called `gridQuery` which if found, will be executed by Linz. Linz will provide the function the query it is about to run for the list view, so that you have an opportunity to customise it as required.
- Only fields found in `grid.column` are included in the `model.find` for the list view query.

## v0.6.0.1 (18 January 2017)

### IMPROVEMENTS

- Updated `lib.api.url.getAdminPasswordResetLink` to accept an `id` and `hash`. If included, it will add those to the URL it returns.

## v0.6.0.0 (11 January 2017)

### BREAKING CHANGES

- Linz's Mongoose document plugin no longer recognises the `fields` property (and nested `usePublishingDate` and `usePublishingStatus` properties) from the `options` object.
- A `publishingDate` property is no longer added to your models.
- A `status` property is no longer added to your models.

### IMPROVEMENTS

- Linz's Mongoose document plugin will now automatically update the `labels` property from the `options` object with a label for the mandatory properties `dateCreated` and `dateModified`, unless otherwise provided.
