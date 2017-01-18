# v0.6.0.1 (18 January 2017)

## IMPROVEMENTS

- Updated `lib.api.url.getAdminPasswordResetLink` to accept an `id` and `hash`. If included, it will add those to the URL it returns.

# v0.6.0.0 (11 January 2017)

## BREAKING CHANGES

- Linz's Mongoose document plugin no longer recognises the `fields` property (and nested `usePublishingDate` and `usePublishingStatus` properties) from the `options` object.
- A `publishingDate` property is no longer added to your models.
- A `status` property is no longer added to your models.

## IMPROVEMENTS

- Linz's Mongoose document plugin will now automatically update the `labels` property from the `options` object with a label for the mandatory properties `dateCreated` and `dateModified`, unless otherwise provided.
