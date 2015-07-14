var linz = require('../'),
    utils = require('../lib/utils'),
    async = require('async');

function navigation (req, res, next) {

        // skip this extra processing if the permissions function is the default
        if (linz.get('permissions').name === 'defaultPermissions') {
            res.locals['linzNavigation'] = linz.get('navigation');
            return next(null);
        }

        // cache the flat navigation process, we don't need to run it multiple times
        var flatNavigation = linz.get('flat navigation') || (function (nestedNavigation) {

            linz.set('flat navigation', flattenNavigation(nestedNavigation, false));

            return linz.get('flat navigation');

        })(linz.get('navigation'));

        // now that we have a flat navigation structure, asynchronously loop through each and
        // request the permissions of each navigation item

        async.seq(

            function (fn, callback) {

                async.filter(fn, function (navigationItem, cb) {

                    linz.get('permissions')(req.user, 'list', {
                        type: 'navigation',
                        placement: 'navigation',
                        data: navigationItem
                    }, cb);

                }, function (results) {
                    return callback(null, results);
                });

            },

            function (filteredNavigation, callback) {

                var nestedNavigation = [];

                // loop through each item, and push it back into a nested navigation structure
                filteredNavigation.forEach(function (navigationItem) {

                    var parent = {};

                    // if there is a parent, find it
                    if (navigationItem.parent) {

                        // try and find the parent
                        parent = findOrCreateParent(nestedNavigation, navigationItem.parent);
                        parent.children = parent.children || [];

                    }

                    // insert into the child array, or the top-level of the navigation
                    (parent.children || nestedNavigation).push({
                        href: navigationItem.href,
                        name: navigationItem.name
                    });

                });

                return callback(null, nestedNavigation);

            }

        )(flatNavigation, function (err, nestedNavigation) {

            res.locals['linzNavigation'] = nestedNavigation;

            return next();

        });

}

// This function will take a nested tree structure, and flatten it.
// Each item in the array, will contain a reference to its parent (from the nested tree structure).
function flattenNavigation (nav, hasParent, flattened) {

    flattened = flattened || [];

    // loop through each navigation item
    for (var i = 0; i < nav.length; i++) {

        var _nav = utils.cloneWithout(nav[i], 'children');

        if (hasParent) {
            _nav.parent = hasParent;
        }

        flattened.push(_nav);

        if (nav[i].children) {
            flattened = flattenNavigation(nav[i].children, _nav, flattened);
        }

    }

    return flattened;

}

function findOrCreateParent (tree, parent) {

    // try and find the parent within the tree
    for (var i = 0; i < tree.length; i++) {

        if (tree[i].name === parent.name && tree[i].href === parent.href) {
            return tree[i];
        }

    }

    // if it wasn't found, add it in
    tree.push(parent);

    return parent;

}

module.exports = navigation;
