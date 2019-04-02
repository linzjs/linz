---
id: security
title: Security
sidebar_label: Security
---

Linz comes with a number of security features out of the box including:

- CSRF Protection

## CSRF Protection

CSRF protection helps prevent unauthorized commands that are transmitted from a user that the web application trusts.

You can read more about [CSRF on OWASP](<https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)>).

### Customising CSRF

Linz uses the [csurf module](https://github.com/expressjs/csurf) to provide CSRF protection.

To customise the options you can supply Linz with the option `'csrf options: {}'`. It accepts an object with the same properties as the csurf module:

```javascript
linz.init({
  options: {
    'csrf options': {},
  },
});
```

### Custom error handler

CSRF errors throw an error with the code `err.code === 'EBADCSRFTOKEN'`. You can use this in your error handlers to display a custom message.

For example, here is a snippet from the linz error middleware:

```javascript
module.exports = function (err, req, res, next) {

    if (err.code === 'EBADCSRFTOKEN') {
        err.message = (!req.body._csrf || req.body._csrf === 'undefined') ? 'No CSRF token was provided.' : 'The wrong CSRF token was provided.';
    }

    ...

}
```

### Adding CSRF protection to a custom form

The csurf module exposes the csrf token via `req.csrfToken()`.

When implementing a custom page with a form, make sure to pass the following hidden input:

```html
<input type="hidden" name="_csrf" value="{{csrfToken}}" />
```

This is handled automatically for you when using `linz.api.model.generateFormString()`. Just make sure to add the `csrfToken` option:

```javascript
linz.api.model.generateFormString(linz.api.model.get('user'), {
  csrfToken: req.csrfToken(),
});
```
