# CHANGELOG

## Unreleased

## v1.0.0-19.0.1 - 2024-04-17

### Fixed

-   Fixed the paging number.

## v1.0.0-19.0.0 - 2024-02-21

### Changed

-   Node.js v20 compatibility.
-   Mongoose v8 compatibility.
-   MongoDB v7 compatibility.

## v1.0.0-18.9.3 - 2022-03-15

### Fixed

-   Fixed document array errors when viewing model versions.

## v1.0.0-18.9.2 - 2022-01-24

### Added

-   Added the ability to change the location of certain scripts and styles.

## v1.0.0-18.9.1 - 2021-10-14

### Changed

-   Navigation items are now sorted alphabetically.

## v1.0.0-18.9.0 - 2021-06-09

### Fixed

-   Fixed the nav sidebar from preventing scrolling in some instances.

## v1.0.0-18.8.1 - 2020-10-13

### Fixed

-   Fixed default exports not appearing in the selected order.

## v1.0.0-18.8.0 - 2020-06-09

### Added

-   Added the ability to customise the linz authentication strategy through `successful` and `failed` properties. These should be functions that accept the following properties `err`, `failureFlash`, `failureRedirect`, `info`, `next`, `req`, `res`,`successFlash`, `successRedirect` and `user`.

### Fixed

-   Fixed missing dataAttributes causing pages to error.

## v1.0.0-18.7.5 - 2019-12-09

### Fixed

-   Fixed exports with a space in the name.

### Added

-   Added prettier.

### Changed

-   Replaced readthedocs with Docusaurus.

## v1.0.0-18.7.4 - 2019-10-23

### Fixed

-   Fixed binddata not recording date picker changes.
-   Fixed opening a documentArray with a datepicker resetting other date pickers on the main page to the current date.
-   Fixed multiple `linzTimezoneOffset` attributes.
-   Fixed incorrect datepicker dates across multiple timezones.
-   Fixed ckeditor double escaping values.
-   Fixed a XSS vulnerability with the `checkboxesWithAddition` widget.

## v1.0.0-18.7.3 - 2019-10-16

### Fixed

-   Added the ability to define a custom `admin forgot password path`.

## v1.0.0-18.7.2

-   Fixed UI bug preventing export buttons from showing up on smaller devices.

## v1.0.0-18.7.1

-   Fixed an export issue when using filters.

## v1.0.0-18.7.0

-   Added protection to help mitigate XSS attacks.
-   Added protection to help mitigate mass assignment attacks.
-   Added an API to escape data before rendering.
-   Updated formist to the latest version.

## v1.0.0-18.6.0 (29 July 2019)

-   Updated export to support new inclusions property.
-   **Deprecated** the export exclusions property in favour of the inclusions property.
-   Improved development environment.

## v1.0.0-18.5.2 (26 July 2019)

-   Improved client side CSRF code.

## v1.0.0-18.5.1 (4 July 2019)

-   Fixed a validation issue when a form has a remote validator.

## v1.0.0-18.5.0 (27 June 2019)

-   Added a new api `linz.api.formtools.list.getFilters(req)` to get the current list view filters from a post request.

## v1.0.0-18.4.4 (20 June 2019)

-   Fixed a bug preventing invalid date fields from being validated.

## v1.0.0-18.4.3 (3 June 2019)

-   Fixed group actions on the list view.

## v1.0.0-18.4.2 (31 May 2019)

-   Added support for `modal` form to custom exports.

## v1.0.0-18.4.1 (29 May 2019)

-   Stopped empty date fields getting today's date automatically applied.

## v1.0.0-18.4.0 (27 May 2019)

-   Added the ability to split object fields over multiple columns in the default export.
-   Made the export api more generic so you can pass in any stream instead of a query.
-   Fixed the transform function to pass the correct parameters.
-   Fixed listQuery not being applied in the exports.
-   Fixed single field and record exports not showing up correctly.

## v1.0.0-18.3.1 (18 April 2019)

-   Fixed concurrency plugin.

## v1.0.0-18.3.0 (15 April 2019)

-   Added `session options` default object passed to `express-session` middleware.
-   Added `cookie options` default object passed to `cookie-parser` and `express-session` middleware.
-   The `linzReturnUrl` cookie is now signed by default.
-   Through the above, updated Linz's default cookie settings to be more inline with OWASP recommendations.
-   The example app demonstrates how to extend the default session options.
-   Removed the X-Powered-By header.
-   Added the X-XSS-Protection header.

## v1.0.0-18.2.0 (12 April 2019)

-   Linz's error handling middleware will now add the error to `req`.
-   Linz's error handling middleware can now return errors via JSON.
-   Updated error handling for JSON errors.
-   Added `linz.api.error` functions.
-   Added routes to the example app to generate errors for testing purposes.
-   Updated documentation.

## v1.0.0-18.1.0 (13 March 2019)

-   Made the modal selector more generic so it also works with custom modals.
-   Made it much harder to post a form before the CSRF token is added.
-   Added new dataAttributes, nomodule, nonce, and referrerpolicy properties to scripts.
-   Added new dataAttributes to styles.
-   Development app now starts using `start` instead of `dev`.

## v1.0.0-18.0.0 (6 March 2019)

### BREAKING CHANGES

-   The default record delete button now uses a post request.

### IMPROVEMENTS

-   Added csrf protection across all routes. For custom forms, the user will need to add `csrfToken: req.csrfToken()` to the options when using `linz.api.model.generateFormString()`.
-   Csrf protection can be customised by setting the linz option `csrf options`. This takes an object with the same options listed here https://www.npmjs.com/package/csurf.
-   Fixed not being able to return html in an overview section.
-   Export fields are no longer required to be in the formDSL.

## v1.0.0-17.1.1 (1 February 2019)

-   `app` now has it's own `package.json` with linz as a file-based dependency.
-   `app` dependencies have now been removed from Linz's `package.json` `devDependencies`.
-   A dev-only Dockerfile (`Dockerfile.dev`) has now been created for development purposes.
-   `Dockerfile` is now purely focused on building Linz, not running an app using Linz.
-   You can now run `yarn dev` and `yarn test` at the same time.

## v1.0.0-17.1.0 (31 January 2019)

**Rereleased v1.0.0-17.1.0 as v1.0.0-17.1.1.**

-   Added the ability to transform individual export values. `form[field].transpose.export => (val) => Promise.resolve(val)`. This function must return a promise.
-   **Deprecated** the transpose function in favour of the context one. `transpose: (val) => ...` should now be `transpose: { form: (val) => ... }`.
-   Updated the modelExport route to `transpose` fields if a `transpose` or `transpose.export` function is provided in the formDSL. This allows you to completely customise exported fields before displaying them in the exported file.
-   Custom export routes can now take advantage of `linz.api.util.generateExport()` to fully customise what kind of file is generated. For example you can generate `.xls` and `.csv` files and customise the content.
-   Added the ability to provide a custom default renderer for the versions plugin.

## v1.0.0-17.0.0 (21 January 2019)

### BREAKING CHANGES

-   Replaced `linz.publicMiddleware.namespace` with `linz.api.middleware.setLinzNamespace()`.
-   Moved all public middleware to the `linz.api.middleware` namespace.
-   Removed the datetime and datetimelocal field types, the date type should be used instead.

### IMPROVEMENTS

-   Added the ability to create a custom form based on the model schema via `linz.api.model.generateForm()` and `linz.api.model.generateFormString()`.
-   Added the ability to define custom fields in the form DSL. When specifying a custom field you should add a `type` property if you want an input other than `text`.
-   Add the ability to edit `public` and `views` files without restarting the node process.
-   Added persistent storage to the local development environment.
-   Added new formtool apis `namespaceForm`, `namespaceList`, `namespaceOverview`, `parseForm`.
-   Added new middleware apis `setLinzNamespace`, `setModelForm`, `setRecord`.
-   Added the ability to provide custom scripts and styles to linz.api.views.render using `data.scripts` and `data.styles`.
-   Added the ability to manually set a timezone offset using `data-utc-offset` in the date widget. This _must_ be in the ISO offset format and begin with a plus (+) or minus (-) symbol with the hours and minutes having a leading 0 eg `+00:00`
-   Added the ability to provide helpText to a document array field.
-   Turned off autocomplete for some widgets.

### BUG FIXES

-   Fixed the datepicker in documentarray modals.
-   Fixed the datetimepicker on documentarray fields.
-   Fixed model version compare forms being undefined.

## v1.0.0-16.2.1 (18 December 2018)

-   Added support for primary record actions with a modal on the model index.

## v1.0.0-16.2.0 (5 December 2018)

-   Added a new default `routes`, which allows you to define middleware to be executed during the processing of a Linz route.

## v1.0.0-16.1.0 (9 August 2018)

-   Updated the reference renderer to link to the record overview.
-   Added a new `Linz.initModels` method to allow initialising manually set models via `Linz.set('models', {})`.

## v1.0.0-16.0.1 (7 August 2018)

-   Linz will now default labels for all schema fields, using sentence case.

## v1.0.0-16.0.0 (6 August 2018)

## Breaking changes

-   Removed response-time middleware that was causing issues with the builds.

### Improvements

-   Added support for customising the login and logout paths. `login path` and `logout path` defaults must be set when `admin path` has been customised.
-   Merged in the Linz minitwitter basic repo to simplify testing.
-   Fixed a rare case where an empty database with configs would cause an `Unable to write config file %s to database. E11000 duplicate key error` error.
-   Fixed an issue where Linz would try to `.toString()` null values while exporting.

## v1.0.0-15.2.1 (3 August 2018)

-   Re-release of v1.0.0-15.2.0 to include updated changelog.

## v1.0.0-15.2.0 (27 April 2018)

## Improvements

-   You can now supply a `defaultOrder` for `sortBy` property of the List DSL.
-   Ascending/descending options are directly listed in the sorting dropdown for each field in the `sortBy` array.
-   When the model index can't find any records for the current query, the model index now shows the words "No records found", and removes sorting and paging controls.
-   Fix handlebars vulnerability.
-   Added codecov support.
-   Fixed filtering using date ranges.

## v1.0.0-15.1.0 (22 March 2018)

### Bugs

-   Added missing `namespaceForm` middleware to certain routes.
-   Better handling of errors in `modelSave` middleware.
-   Rewrote `modelSave` route removing usage of Async.

### Improvements

-   Added support for a `content` property when supplying `scripts` and `styles` defaults. Supplying `content` for a script will ensure the content is placed within two script tags (i.e. `<script>{{{content}}}</script>`). Supplying `content` for a style will ensure the content is placed within two style tags (as opposed to using a link tag) (i.e. `<style>{{{content}}}</style>`).
-   Added the `linz.formtools.cellRenderers.email` renderer to render an email in an `a` with the `mailto:` protocol.
-   Added the `linz.formtools.cellRenderers.tel` renderer to render a telephone number in an `a` with the `tel:` protocol.
-   Cleaned up the print preview styles.
-   Fixed the `linz.addLoadEvent` method so the onload process doesn't get overridden.
-   Added a new `linz.api.session.getTimezone(req)` function that allows you to get the timezone offset of the current user.
-   Added the ability to transform date fields in the Linz export through `useLocalTime` which converts the time to the local browser time.
-   Added a `dateFormat` option which adds the ability to export the date in a different format (Uses moment datetime formats).
-   Upgraded to Mongoose `v4.13.12`.
-   Migrated unit tests from Mocha to Jest.

## v1.0.0-15.0.0 (24 November 2017)

### BREAKING CHANGES

-   The `linz.formtools.widgets.date` and `linz.formtools.widgets.dateRange` are functions which must be executed. Previously you could simply reference them. However, you can pass in a date format which will be used to customise the display of the date in the UI.

### IMPROVEMENTS

-   Added the ability to set some help text which will appear in a Bootstrap popover, on a model list view.
-   Fixed a race condition where `req.linz.model.linz.formtools.form` would be undefined.
-   Fixed Linz not being able to find labels for embedded documents.
-   Fixed ckeditor for non `/admin` admin paths.
-   Fixed scoping of the multiselect within a documentarray.
-   Update the default for the `linz.formtools.widgets.documents` widget create button to be `Create`, and made it configurable by passing in `buttonLabel: 'New label'` to the widget.
-   Reworked some Linz internals to allow code using `linz.api.views.render` to take advantage of Linz's Notifications API. Also moved the render notifications functionality into the `linz.api.views` namespace and updated all code that rendered notifications to use this API function.
-   Moved Linz's `namespace` middleware into `middleware-public` so that it can be accessed in other applications using `linz.middleware.namespace`.
-   Moved Linz's `notifications` middleware into `middleware-public` so that it can be accessed in other applications using `linz.middleware.notifications`.
-   Add a 404 page for all Linz record routes. You can customise this page by setting the linz option `404` to a function that returns a Promise. This function will be passed the `req` object.
-   Everything that uses `linz.formtools.widgets.date` now uses the Bootstrap DateTime Picker UI client-side.
-   Everything that uses `linz.formtools.filters.date` or `linz.formtools.filters.dateRange` now uses the Bootstrap DateTime Picker UI client-side.
-   Widgets can supply a `transform` function, on the returned widget function, which will be executed when saving data. This provides the ability for a widget to transform values in the form, before saving to the database.

## v1.0.0-14.0.0 (14 November 2017)

### BREAKING CHANGES

-   When rendering the overview, Linz will no longer infer the cell renderer type from the Form DSL type data. If Linz isn't rendering the overview cell with the correct cell renderer, you should supply the renderer (i.e. `{ label: 'x', renderer: linz.formtools.cellRenderers.text }`).
-   When supplying a function for the config form, model list, form and overview DSLs, you no longer get passed `user`, but instead `req` (which obviously has user at `req.user`).

### IMPROVEMENTS

-   Fixes `#169`, an issue in which the actions column wouldn't render when permissions weren't explicitly set.
-   Improved the Express param for model. It no longer process list, overview or form DSL. These are now only processed when required. Improving the efficiency of any route that used `:model`.
-   When supplying functions for config form, model list, form and overview DSLs, you now get `req` rather than just `user`. This provides much more flexibility in what you return, as now it can be based on the record being rendered, not just the user making the request.

## v1.0.0-13.0.2 (9 November 2017)

### IMPROVEMENTS

-   Fixes issues on the model list in IE, due to use of the template tag.

## v1.0.0-13.0.1 (7 November 2017)

### IMPROVEMENTS

-   Fixed a problem with model lists, showing the wrong number of records. This could occur when a `listQuery` static was employed and have an impact on the number of results being returned.
-   Improves usage of the `.reponsive-table` class. Still not perfect, but definitely useable.
-   You can now add `type='primary'` to a record action to have it rendered inline (i.e. not within the dropdown) with the edit and delete buttons on a model list.
-   You can now add `type=primary` to an overview action to have it rendered inline (i.e. not within the actions dropdown).

## v1.0.0-13.0.0 (3 November 2017)

### BREAKING CHANGES

-   `linz.api.views.render` now requires `data, req, res`. `callback` is optional.
-   The `listQuery` static is now passed `req, query, callback` (additional parameter is `req`).
-   When using modal actions, your HTML now has to supply the `<div class="modal-dialog"><div class="modal-content"></div></div>` tags.

### IMPROVEMENTS

-   Now that the `listQuery` static is passed `req`, you have more information (such as `req.user`) which can be used to alter the query that Linz will execute.
-   Fixes a long term (development only) issue `TypeError: filteredNavigation.forEach is not a function`.
-   `utils.js` has been move back into the head. Client-side scripts can now make use of `linz.loadScript` and `linz.addLoadEvent` once again.
-   Added a new default `mongoose options` which can be used to control the options passed to Mongoose when making a connection. Provides support for Mongoose `4.11.x` in which the default connection logic has been removed.
-   By allowing the results of record/overview actions to return the `.modal-dialog` div, you have more flexibility on the size of the modal (i.e. `<div class="modal-dialog modal-lg">` renders a large modal).
-   Removed `.modal-dialog .modal-content` from the modal divs in `layout.pug`. They should now be included in the HTML returned from any record/overview actions that specify the use of a modal.
-   You can now use `req.flash('linz-notification', linz.api.views.notification({ text: 'Hi' }))` to have Linz show a notification for you on redirect.
-   You can now use `req.linz.notifications.push(linz.api.views.notification({ text: 'Hi' }))` to have Linz show a notification for you.
-   Notifications are now shown in models list, model create, model list, record edit and record overview pages.

## v1.0.0-12.0.0 (1 November 2017)

### BREAKING CHANGES

-   All `filters` must now return HTML from the `renderer` function, wrapped in `<template>` tags.
-   All models must either have a `title` field, or supply `model.title` with the value of the schema field that should be used as the title.
-   The `title` virtual, when creating, will no longer use `label`, `name` or `this.toString()` to return a label. It will only ever use `toLabel` method if provided, or the value of the title property.

### IMPROVEMENTS

-   Add `data-linz-view` to Model create and list, and record edit and overview pages. This gives CSS hooks to target CSS to certain views.
-   Added a new search button on the model list that always lives next to the _Add filter_ button. This replaces the _Filter now_ button that used to only be exposed when there were filters.
-   The _Add filter_ and _Search_ buttons are now disabled once the form has been submitted.
-   The new `list.search` defaults to `['title']` and will always be on unless you set `list.search` to `false`.
-   A models title field, is always in the standard list query.
-   A model is now sorted by `dateModifed` in descending order by default.

## v1.0.0-11.0.0 (27 October 2017)

### BREAKING CHANGES

-   All `canDelete` and `canEdit` functions now pass through the request object and call the callback `canDelete(req, callback)`. This allows you to disable records on the index view based on the current logged in user.

### IMPROVEMENTS

-   Add the ability to set an `alwaysOn` property for filters. This should be a boolean and will hide the close button and automatically show the filter.
-   Add the ability to provide a `default` value for `alwaysOn` filters.
-   Add the ability to remove the filter from the dropdown and hide the close button using `once: true`.
-   Fixed the multi-select filter, when using numbers as the value.
-   Integrated the static `getQuery` into the model export process.
-   Pagination is now always present.
-   Fixed buttons that show content in a modal, on slower connections.
-   Fixed typo in password placeholder text.
-   Updated the model export, field selection cookie, to be user specific.
-   Fixed issues with datePicker code on the client-side.
-   Fixed embedded document overview cell renderer.

## v1.0.0-10.0.0 (9 August 2017)

### BREAKING CHANGES

-   Deprecated `adminJSFile` and `adminCSSFile` defaults. Please use `scripts` and `styles` instead.

### IMPROVEMENTS

-   Add `navigationTransform` property to the Linz initialisation options. This is a function that accepts a navigation and data object parameter `(nav, { user })` and allows customisation of the main navigation menu with additional contexts not available at initialisation.
-   Add `customAttributes` property to the Linz initialisation options. This is a function that accepts a `req` object that has gone through all the Linz middleware. i.e. the user is available at this point.
-   Allow custom scripts and styles through the `scripts` and `styles` Linz options. These should be functions that take `req` and `res` objects and return a promise that resolves with an array of scripts and styles. The array should contain objects with the same properties as the HTML equivalents.
-   Now passing `form` and `user` to `transform` function.
-   Now passing `record` to `transpose` function.
-   Expose `linz.api.views.getScripts` and `linz.api.views.getStyles` api.
-   Added ability to provide Linz with custom navigation via setting `linz.set('navigation', navigation);`.
-   Added ability to display icons (html) in custom navigations by adding an icon property `icon: '<i class="fa fa-home" aria-hidden="true"></i>'`.

## v1.0.0-9.0.3 (28 June 2017)

-   Add `.linz` class to the Linz navbar.

## v1.0.0-9.0.2 (28 June 2017)

-   Fixes an issue with the grid renderer not showing default record actions (edit and delete).

## v1.0.0-9.0.1 (14 June 2017)

-   Fixes an issue with the pre-save middleware (when `req` doesn't exist).

## v1.0.0-9.0.0 (13 June 2017)

-   Fixed a bug when trying to wrap the list DSL with a `(user, callback)` function.
-   Fixed the List DSL to support renderers that return HTML.
-   Created record action renderers, which can be used in conjunction with a custom List renderer.
-   All modal containers now contain the `div.modal-dialog > div.modal-content` structure.
-   Record actions now support `modal: true` to have the URL content displayed within a modal.
-   Fixed issue in which action URLs are sometimes updated twice and then no longer function correctly.
-   Rather than supplying Mongoose, Express, Passport and an options object as arguments to Linz's init function (in any order), Linz now expects an object. The object can have `mongoose`, `express`, `passport` and `options` keys as required.
-   Added ability to customise the homepage route by setting `admin home` in the `options` object or using `linz.set('admin home', '/new/path')`.
-   Added the ability to render a view in the context of Linz.
-   The `list.showSummary` boolean now excludes record count and sorting if set to `false`.
-   The list render data now contains the query parameters.
-   Linz filters that render will no longer get stuck.
-   Linz can now show alerts (model list view) to the user by pushing objects (formatted via `linz.api.views.notification`) into the `req.linz.notifications` array. Uses the Noty library.

## v1.0.0-8.0.0 (27 March 2017)

### BREAKING CHANGES

-   Search and replaced `Grid` with `List`. You will need to update all your models to use `list` rather than `grid` now.
-   Search and replaced `Columns` with `Fields`. You will need to update all your models to use `fields` rather than `columns` now.
-   Inline with the above, rename any `gridQuery` statics to `listQuery`.

### IMPROVEMENTS

-   The List DSL now includes a `renderer` property. currently available renderers include `linz.formtools.listRenderers.default` (alias for `grid`), `linz.formtools.listRenderers.grid`, and `linz.formtools.listRenderers.list`.
-   If a `listRenderer` has not been set, the default `linz.formtools.listRenderers.grid` will be used.

## v1.0.0-7.0.0 (3 March 2017)

### BREAKING CHANGES

-   When Linz retrieves data for the list view, it no longer retrieves all fields from the database. It retrieves only fields found in `grid.columns`. This means, your `toLabel` and other Mongoose related functionality may not get a complete model record. You can create a static called `gridQuery` which Linz will execute if found, to customise the query that will be executed by Linz.

-   The `findForReference` static that Linz will execute if found, must now accept either one `id` or an array of `id`s. This is to support `ref` field optimisations.

### IMPROVEMENTS

Focus on this release was optimization of the list view. Making it much more performant.

-   Model counts are now using `model.count` rather than the results of a `model.find`.
-   Record counts are now using `model.count` rather than the results of a `model.find`.
-   Cell renderers for `ref` fields are now provided the value of the reference, not just the ObjectID. This is to reduce the number of necessary requests to the database. Cell renderers for `ref` fields should no longer need to do this now, because the data is provided to them.
-   Previously Linz only supported the type `linz.mongoose.Schema.Types.ObjectId` for `ref` fields. It now supports `linz.mongoose.Schema.Types.Mixed` and can successfully handle ObjectIds, strings and `undefined` values.
-   Linz is now automatically indexing fields which are used in `grid.sortBy` and `grid.filters` to ensure a basic level of indexing support. It also indexes `dateModified` and `dateCreated` by default.
-   Field names included in `model.find` are now sorted alphabetically for the list view query to make it easier to formulate compound index strategies. You can be guaranteed field names will always appear in alphabetical order.
-   You can create a static called `gridQuery` which if found, will be executed by Linz. Linz will provide the function the query it is about to run for the list view, so that you have an opportunity to customise it as required.
-   Only fields found in `grid.column` are included in the `model.find` for the list view query.

## v0.6.0.1 (18 January 2017)

### IMPROVEMENTS

-   Updated `lib.api.url.getAdminPasswordResetLink` to accept an `id` and `hash`. If included, it will add those to the URL it returns.

## v0.6.0.0 (11 January 2017)

### BREAKING CHANGES

-   Linz's Mongoose document plugin no longer recognises the `fields` property (and nested `usePublishingDate` and `usePublishingStatus` properties) from the `options` object.
-   A `publishingDate` property is no longer added to your models.
-   A `status` property is no longer added to your models.

### IMPROVEMENTS

-   Linz's Mongoose document plugin will now automatically update the `labels` property from the `options` object with a label for the mandatory properties `dateCreated` and `dateModified`, unless otherwise provided.
