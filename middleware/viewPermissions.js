
var linz = require('../');

// provide a permissions object to a view, so that it can lock out certain functionality as required
function viewPermissions (context) {

    return function (req, res, next) {

        // console.log(req.linz.model.linz.formtools.grid.groupActions);
        // console.log(req.linz.model.linz.formtools.grid.recordActions);

        // permissions to request
        var permissions = req.linz.model.linz.formtools.grid.actions.concat(
                req.linz.model.linz.formtools.grid.recordActions,
                req.linz.model.linz.formtools.grid.groupActions
            )
            .filter(function (action) {
                return Object.keys(action).indexOf('permission') >= 0;
            })
            .map(function (action) {
                return action.permission;
            })
            .concat(['create','export','overview','edit','delete','json']);

        console.log(permissions);

        // mix in grid, group and record actions
            //
            //
            // .concat(
            //
            //     // record actions
            //     // mix in record actions that require a permission request
            //     req.linz.model.linz.formtools.grid.recordActions.filter(function (action) {
            //         return Object.keys(action).indexOf('permission') >= 0;
            //     })
            //     // return an array of the actual permissions
            //     .map(function (action) {
            //         return action.permission;
            //     }),
            //     // group actions
            //     // mix in group actions that require a permission request
            //     req.linz.model.linz.formtools.grid.groupActions.filter(function (action) {
            //         return Object.keys(action).indexOf('permission') >= 0;
            //     })
            //     // return an array of the actual permissions
            //     .map(function (action) {
            //         return action.permission;
            //     }),
            //     // grid actions
            //     req.linz.model.linz.formtools.grid.actions.filter
            // );

        async.seq(

            function (perms, callback) {

                // setup a permissions object to pass to the view
                async.filter(perms, function (permission, cb) {

                    linz.get('permissions')(req.user, permission, {
                        type: 'model',
                        data: req.linz.model
                    }, cb);

                }, function (permissions) {

                    return callback(null, permissions);

                });

            },

            function (perms, callback) {

                var permissionsObj = {};

                permissions.forEach(function (permission) {
                    permissionsObj[permission] = perms.indexOf(permission) >= 0;
                });

                return callback(null, permissionsObj);

            }

        )(permissions, function (err, permissions) {

            if (err) {
                return next(err);
            }

            console.log(permissions);

            res.locals['permissions'] = permissions;

            return next();


        });

    }

};

module.exports = viewPermissions;
