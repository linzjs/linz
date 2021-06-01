---
id: api
title: API
sidebar_label: API
---

Linz contains many useful APIs to simplify development.

At present, we're working on a long term effort to expose all of Linz's functionality via APIs and have Linz use these APIs itself. This will provide the most flexibility to customise Linz, without having to do the heavy lifting yourself when choosing to change something about Linz.

You can access the Linz APIs via `linz.api`.

## error

### model.json(err, statusCode = 500)

Take an Error object and add `err` and `statusCode` properties. If an error is encountered by the Linz error handling middleware with these properties, the error will be returned via JSON, rather than HTML.

### model.store(err, req)

Take an Error object and store it on `req` within the Linz namespace at `req.linz.error`. This becomes useful for logging errors that might be produced by Linz.

## formtools

### list.getFilters(req)

Get the filters for a request. Used when you want to match a query to what is displayed in the list view.

## model

### model.generateForm(model, options)

Generate a form in the context of a Linz model. This is useful if you want to customise the form or to present a Linz form other than the create and edit views. This API is also used by Linz internally.

#### model: object

The mongoose model.

#### options: object

| Property | Type   | Description                                             |
| -------- | ------ | ------------------------------------------------------- |
| `form`   | Object | Provide a custom form dsl for the model.                |
| `record` | Object | Provide a record to prepopulate the form.               |
| `req`    | Object | Provide a req object to customise the form.             |
| `type`   | String | The form type. Can be `edit` or `create` (The default). |

### model.generateFormString(model, options)

Generate form HTML in the context of a Linz model.
This uses model.generateForm to generate the form object and returns the rendered view as a HTML string. Generally, this should be used when you want to render a customised Linz form.

#### model: object

The mongoose model.

#### options: object

In addition to the `generateForm` options, you can also pass in the following options:

| Property    | Type   | Description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `actionUrl` | String | The form post url.                             |
| `cancelUrl` | String | The url to return to upon cancelling the form. |

## Session

The methods exposed via the `linz.api.session` namespace have functionality centered around working with the user session.

### session.getTimezone(req)

Get the timezone offset of the current user.

## Util

The methods exposed via the `linz.api.util` namespace have functionality that are broad and general in nature.

### util.escape(userInputFromDatabase)

Use this method to escape a string before using it in HTML. This method should be used whenever you’re displaying information from an untrusted source (i.e. information from the database supplied by a user).

## Views

The methods exposed via the `linz.api.views` namespace have functionality centered around working with Linz's views.

You can use these methods to render your own content, within a Linz template.

### views.getScripts(req, res, scripts = [])

Get the scripts that Linz uses for a particular route.

### views.getStyles(req, res, scripts = [])

Get the styles that Linz uses for a particular route.

### views.notification(noty)

Takes an object, and applies noty defaults to it, making it easy to create noty objects for notifications. You can ready more about [Noty options](https://ned.im/noty/#/options).

### views.render(options, callback)

Render some HTML, within a Linz template. Useful for developing completely custom page content, without having to provide the Linz basics such as navigation, log out controls, etc.

#### options: object

`options` object is used to pass the HTML that should be rendered within the Linz template. The following table describes the properties of the `options` object.

| Property   | Type   | Description                                                                                                                      |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `header`   | HTML   | HTML This is the header of the page. You'll need to include wrapping div elements in your HTML to make it look like the default. |
| `body`     | HTML   | HTML This is the body of the page. You'll need to include wrapping div elements in your HTML to make it look like the default.   |
| `page`     | HTML   | HTML If provided, header and body are ignored, allowing completely custom content.                                               |
| `script`   | HTML   | HTML This is intended to be `<script>` tags placed at the bottom (just above `</body>`).                                         |
| `template` | String | String Either `wrapper` or `wrapper-preauth`. This is the template to use to wrap the provided HTML. Defaults to `layout`.       |

#### callback

`callback` can be one of two things:

-   A standard callback `function` in the format `callback(err, html)`.
-   An Express response (`res`) object.

If an Express reponse object is provided, Linz will automatically call `res.render` with the rendered HTML.

##### Example

```javaScript
const linz = require('linz');

module.exports = function (req, res, next) {

    const locals = {
        header: '<div class="col-xs-12"><div class="model-title"><h1>Header.</h1></div></div>',
        body: '<div class="container linz-container index"><div class="col-xs-12"><p>Body.</p></div></div>'
    };

    linz.api.views.render(locals, req, res, (err, html) => {

        if (err) {
            return next(err);
        }

        return res.send(html);

    });

};
```

### views.viewPath(view)

Returns the complete path to one of Linz's views.

#### view: string

`view` is a string that is the name of a view found within Linz's views directory.
