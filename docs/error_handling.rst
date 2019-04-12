.. highlight:: javascript

**************
Error handling
**************

Linz consistently manages all errors by passing the error through to `next`. This allows a consistent approach to error handleing and provides a centralised approach to intercept those errors if desired.

Linz provides an error handling middleware at ``linz.api.middleware.error``. You should mount this to your Express app as the last piece of error middleware. It will:

- Log ``err.stack`` to ``console.error``.
- Store the error at ``req.linz.error``.
- Return the error in the context of JSON, or display the error in a view.

Recording errors
----------------

You can use some middleware to trap all errors that happen within Linz. For example::

    module.exports = (req, res, next) => {

        res.on('finish', () => {

            if (req.complete && req.linz && req.linz.error) {
                console.error(req.linz.error);
            }

        });

        return next();

    };

JSON errors
-----------

If an error occurs within Linz, in the context of a JSON request, Linz will decorate the error with two properties:

- `json` will be `true`.
- `statusCode` will be `500`.

If the Linz error handling middleware captures an error with those properties, will return the error via JSON.
