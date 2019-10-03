---
id: request-namespace
title: Request Namespace
sidebar_label: Request Namespace
---

Linz adds to the Express `req` object, an object which you can use to access Linz information about the incoming request.

The Linz namespace exists at:

```
req.linz
```

And is a copy of the object you receive when requiring Linz, for example `require('linz')`.

It has the keys:

-   `notifications` which is an array of notifications Linz will display.
-   `cache` which is an internal cache that Linz uses.

Depending on which view is currently being requested, you'll also get extra information.

The Linz namespace can be used whenever Linz passes you `req` and becomes a very handy API to get more information about the request currently being served.

## Model form

The model form, both create and edit views, also recieve:

-   `model` which is a reference to the current model, the basic Mongoose version of the model.
-   `model.linz` which is a reference to the current model, which extra Linz-specific information included.
-   `model.linz.form` which is a reference to the model form DSL.

## Model list

The model list view also receives:

-   `model` which is a reference to the current model, the basic Mongoose version of the model.
-   `model.linz` which is a reference to the current model, which extra Linz-specific information included.
-   `model.linz.list` which is a reference to the model List DSL.

## Model overview

The model overview view also receives:

-   `model` which is a reference to the current model, the basic Mongoose version of the model.
-   `model.linz` which is a reference to the current model, which extra Linz-specific information included.
-   `model.linz.overview` which is a reference to the model overview DSL.
