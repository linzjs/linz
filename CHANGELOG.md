# CHANGELOG

## Unreleased

- Add `navigationTransform` property to the Linz initialisation options. This is a function that accepts a navigation and data object parameter `(nav, { user })` and allows customisation of the main navigation menu with additional contexts not available at initialisation.
- Add `customAttributes` property to the Linz initialisation options. This is a function that accepts a `req` object that has gone through all the Linz middleware. i.e. the user is available at this point.
- Allow custom scripts and styles through the `scripts` and `styles` Linz options. These should be functions that take a `req` object and return a promise that resolves with an array of scripts and styles. The array should contain objects with the same properties as the HTML equivalents.
- Now passing `form` and `user` to `transform` function.
- Now passing `record` to `transpose` function.

## v1.0.0-9.0.3 (28 June 2017)

- Add `.linz` class to the Linz navbar.

## v1.0.0-9.0.2 (28 June 2017)

- Fixes an issue with the grid renderer not showing default record actions (edit and delete).

## Unreleased

- Added ability to provide Linz with custom navigation via setting `linz.set('navigation', navigation);`.
- Added ability to display icons (html) in custom navigations by adding an icon property `icon: '<i class="fa fa-home" aria-hidden="true"></i>'`.

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
