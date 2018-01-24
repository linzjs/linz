var linz = require('../../'),
    utils = require('../utils'),
    async = require('async'),
	debugCache = require('debug')('linz:cache');

function get (req, cb) {

    if (!linz.get('disable navigation cache') && !req.linz.cache.navigation.invalidate && req.session.navigation) {
        return cb(null, req.session.navigation);
    }

    debugCache('Priming navigation cache');

    // cache the flat navigation process, we don't need to run it multiple times
    var flatNavigation = linz.get('flat navigation') || (function (nestedNavigation) {

        linz.set('flat navigation', flattenNavigation(nestedNavigation, false));

        return linz.get('flat navigation');

    })(linz.get('navigation'));

    // now that we have a flat navigation structure, asynchronously loop through each and
    // request the permissions of each navigation item

    async.seq(

        function (fn, callback) {

            async.filter(fn, function (navigationItem, filterCb) {

                // Not all userland navigation items will have a permission function
                // if it does, use it, otherwise, assume its use is for everyone.
                if (typeof navigationItem.permission === 'function') {

                    return navigationItem.permission(req.user, function (result) {

                        // explicitly, a permission must return false in order to be denied
                        // an undefined permission, or anything other than false will allow the permission
                        // falsy does not apply in this scenario
                        return filterCb(null, result !== false);

                    });

                }

                return filterCb(null, true);

            }, callback);

        },

        function (filteredNavigation, callback) {

            var nestedNavigation = [];

            // loop through each item, and push it back into a nested navigation structure
            filteredNavigation.forEach(function (navigationItem) {

                var parent = {};

                // if there is a parent, find it
                if (navigationItem.parent) {

                    // try and find the parent
                    parent = findParent(nestedNavigation, navigationItem.parent);

                    // if the parent couldn't be found, don't add this navigation item
                    // it means that they don't have access to it, and therefore, neither its children
                    if (parent === false) {
                        return;
                    }

                    parent.children = parent.children || [];

                }

                const navItem = {
                    href: navigationItem.href,
                    icon: navigationItem.icon,
                    name: navigationItem.name,
                };

                if (navigationItem.target) {
                    navItem.target = navigationItem.target;
                }

                if (navigationItem.permission) {
                    navItem.permission = navigationItem.permission
                }

                // insert into the child array, or the top-level of the navigation
                (parent.children || nestedNavigation).push(navItem);

            });

            Promise.resolve(linz.get('navigationTransform')(nestedNavigation, { user: req.user }))
                .then((navigation) => {

                    nestedNavigation = navigation;

                    req.session.navigation = navigation;

                    return callback(null, nestedNavigation);

                });

        }

    )(flatNavigation, cb);

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

function findParent (tree, parent) {

    // try and find the parent within the tree
    for (var i = 0; i < tree.length; i++) {

        if (tree[i].name === parent.name && tree[i].href === parent.href) {
            return tree[i];
        }

    }

    // if it wasn't found, return false
    return false;

}

module.exports = {
    get: get
};
