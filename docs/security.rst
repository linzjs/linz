.. highlight:: javascript

.. _security-reference:

********
Security
********

Linz comes with a number of security features out of the box including:

- CSRF Protection

CSRF Protection
----------------

CSRF protection helps prevent unauthorized commands that are transmitted from a user that the web application trusts.

You can read more about CSRF here https://en.wikipedia.org/wiki/Cross-site_request_forgery.

Customising CSRF
================

Linz uses the csurf module to provide CSRF protection. https://github.com/expressjs/csurf

To customise the options you can supply Linz with the option ``'csrf options: {}'``. It accepts an object with the same properties as the csurf module::

    linz.init({
        'options': {
            'csrf options': {},
        },
    });


Custom error handler
====================

CSRF errors throw an error with the code ``err.code === 'EBADCSRFTOKEN'``. You can use this in your error handlers to display a custom message.

Adding CSRF protection to a custom form
============================================

The csurf module exposes the csrf token via ``req.csrfToken()``.

When implementing a custom page with a form, make sure to pass the following hidden input::

    <input type="hidden" name="_csrf" value="{{csrfToken}}">

This is handled automatically for you when using ``linz.api.model.generateFormString()``. Just make sure to add the `csrfToken` option::

    linz.api.model.generateFormString(linz.api.model.get('user'), { csrfToken: req.csrfToken() });
