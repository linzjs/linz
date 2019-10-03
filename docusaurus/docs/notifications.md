---
id: notifications
title: Notifications
sidebar_label: Notifications
---

Linz provides the ability to pop up notifications, into a [Noty message](https://ned.im/noty/#/).

It works well when paired with model, group, overview and record actions that perform a task, and then redirect back to the original page.

When using Linz notifications in this manner, you must make use of [connect-flash](https://github.com/jaredhanson/connect-flash) like so:

```javascript
// Perform task.

// Create the notification.
req.flash(
    'linz-notification',
    linz.api.views.notification({
        text: 'Notification message',
        type: 'success',
    })
);

// Redirect the user back.
return res.redirect('back');
```

When the page is rendered, a notification will appear, informing the user that the action they took was successful.

# API

There are two APIs for using notifications:

-   `req.linz.notifications`
-   `req.flash`

# req.linz.notifications

Before rendering a page, at some point in the route execution middlware, you can populate the `req.linz.notifications` array with any Noty objects you'd like to be shown. For example:

```javascript
app.use('/url', (req, res, next) => {
    req.linz.notifications.push(
        linz.api.views.notification({ text: 'A message here.' })
    );

    return next();
});
```

Once the page is rendered, Linz will pick up on this notification and display it for the user.

# req.flash

As described above, using the `req.flash` API for notifications is a handy way to provide the user information about the state of the action they've just performed. However, it should always be used in conjunction with `res.redirect('back')`.

To use this API, use `req.flash` like so:

```javascript
req.flash(
    'linz-notification',
    linz.api.views.notification({ text: 'Message here.' })
);
```

The first parameter passed to `req.flash` must be the string `'linz-notification'`, otherwise Linz will ignore it. The second parameter passed must be a [Noty options object](https://ned.im/noty/#options). Linz provides a [handy API](api#viewsnotificationnoty) defaulting some of the options.
