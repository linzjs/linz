---
id: forgot-password-process
title: Forgot password process
sidebar_label: Forgot password process
---

Linz has the capability to support a _forgot password_ process. It can be used to allow the user to reset their password.

If enabled, it will render a _Forgot your password?_ link on the log in page, which will facilitate the ability for a user to reset their password. It uses an email as proof of user record ownership. If the user can access a link sent to an email identified with a user record, then they can reset the password.

To enable this process, you need to:

-   Have a user model that stores an email address.
-   Define a `sendPasswordResetEmail` [Mongoose static](https://mongoosejs.com/docs/guide.html#statics) on your user model.
-   Define a `verifyPasswordResetHash` [Mongoose method](https://mongoosejs.com/docs/guide.html#methods) on your user model.
-   Define an `updatePassword` [Mongoose static](https://mongoosejs.com/docs/guide.html#statics) on your user model.

The process works as follows:

-   User clicks the _Forgot your password?_ link on the log in page.
-   The user is directed to the _Forgot your password_ page, and prompted to enter their email address.
-   The `sendPasswordResetEmail` static is executed with the email address they provided.
-   The `sendPasswordResetEmail` static should generate a unique hash for the user, and send an email to the user containing a link to reset their password.
-   The user will receive the email, and click on the link.
-   The link will be verified by executing the `verifyPasswordResetHash` method.
-   If the password reset hash can be be verified, the user will be provided the opportunity to enter a new password meeting the conditions of the `admin password pattern` setting.
-   The new password will be provided to the `updatePassword` static to store the updated password against the user record.

More succintly:

#. Send a password reset email.
#. Verify ownership of the email.
#. Collect a new password and update their user record.

## Send a password reset email

This part of the process entails:

-   Retreiving a user record based on an email address.
-   Generating a unique hash for the user record.
-   Creating a link for the user to continue the process.
-   Sending an email to the email address provided.

These actions should take place within the `sendPasswordResetEmail` executed by Linz.

### The `sendPasswordResetEmail` static

The `sendPasswordResetEmail` static should have the following signature:

function sendPasswordResetEmail (userEmail, req, res, callback)

It needs to be a [Mongoose static](https://mongoosejs.com/docs/guide.html#statics) on your user model.

`userEmail` is the email address provided by the user who is trying to reset their password, `req` is the current request object, `res` is the current response object and `callback` is the function to execute when you've completed the neccessary steps.

The `callback` accepts the standard Node.js signature:

function callback (err)

If an `Error` is provided, Linz will render the error, otherwise it will consider the process complete.

### Retrieving a user record based on an email address

Use the `userEmail` argument to search your user model for a corresponding record. If a record can't be found, return an `Error` to the `callback`.

Make sure you take into consideration the following scenarios:

-   Multiple user records associated with the same email address.
-   No user record associated with the email address.

### Genearing a unique hash for the user record

Once you have the user record, generate a unique hash for the user record. We recommend including the `username`, `_id`, `email` and `dateModified`.

The hash you generate must be verifyable by generating the same hash, at a later time, with the same information in the database (i.e. `username`, `_id`, `email` and `dateModified`).

A good Node.js package to consider to generate a hash is the [bcrypt.js](https://www.npmjs.com/package/bcryptjs) package.

### Creating a link to verify email address ownership

Once you have the unique hash, and the records `_id` value you can use `linz.api.url.getAdminPasswordResetLink(id, hash)` to generate a url. Pass in the `_id` and hash and Linz will safely add those to the url it returns.

### Send an email

Once you have the link, you simply need to send it to the email address with instructions on what to do next; click on the link.

This is something you'll have to implement yourself. Linz does not provide any capabilities to send emails. Linz is based on Express though, so you have all of it's templating capabilities at hand. See [using template engines with Express](https://expressjs.com/en/guide/using-template-engines.html).

## Verifying ownership of the email address

This part of the process involves verifying ownership of the email address. The user will receive the email, and click on the link. We want to make sure the link hasn't been tampered with and that we can generate the same hash that was provided in the link.

Linz will retrieve the hash from the url and pass it to the `verifyPasswordResetHash` method.

It must be a [Mongoose method](https://mongoosejs.com/docs/guide.html#methods) on your user model.

Your `verifyPasswordResetHash` Mongoose method should have the following signature:

function verifyPasswordResetHash (candidateHash, callback)

The `candidateHash` is the hash value that was retreived from the Url. The `callback` is a standard Node.js callback:

function callback (err, result)

The `result` should be a boolean value.

Your `verifyPasswordResetHash` method should go through the same process to create the hash as it did in the first process. It should then verify that the `candidateHash` is the same as your freshly generated hash using the data from your database.

If the `candidateHash` checks out and you can successfully match it, return `true` to the callback.

## Updating the users password

If the `hash` was verified, the user is provided an opportunity to enter a new password. The new password must meet the requirements of the `admin password` setting.

The new password is provided to the `updatePassword` [Mongoose static](https://mongoosejs.com/docs/guide.html#statics) on your user model. The `updatePassword` static should have the following signature:

function updatePassword (id, newPassword, req, res, callback)

`id` is the `_id` of the user model record. `newPassword` is the new password provided by the user. `req` is the current request object. `res` is the current response object. `callback` is a standard Node.js callback:

function callback (err)

If an `Error` is provided, Linz will render the error, otherwise it will consider the process complete.

The user will be notified that their password has been updated, and prompted to log into Linz again.
