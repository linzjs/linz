'use strict';

const camelCase = require('camelcase');
const linz = require('../');

// protect routes by requesting permissions for the action
function permissions (permission, context) {

    return function (req, res, next) {

        var perm = permission,
            _context = context;

        // If the context is a model, let's get it.
        // `context` will either be `models`, `model`, `configs`, or `config`.
        if (context === 'model') {
            _context = {
                model: req.linz.model.modelName,
                type: 'model'
            };
        } else if (context === 'config') {
            _context = {
                config: req.linz.config.config._id,
                type: 'config'
            }
        }

        // if we're working with a custom action, let's tweak the permission value
        // send-preview should be canSendPreview, preview should be canPreview
        if (perm === 'action') {
            perm = camelCase('can-' + req.params.action);
        }

        linz.api.permissions.hasPermission(req.user, _context, perm, function (hasPermission) {

            Promise.all([
                linz.api.views.getScripts(req, res, [
                    {
                        src: `${linz.get('admin path')}/public/js/views/forbidden.js`,
                    },
                ]),
                linz.api.views.getStyles(req, res),
            ])
                .then(([scripts, styles]) => {

                    // explicitly, a permission must return false in order to be denied
                    // an undefined permission, or anything other than false will allow the permission
                    // falsy does not apply in this scenario

                    if (hasPermission === false) {
                        return res.status(403).render(linz.api.views.viewPath('forbidden.jade'), {
                            scripts,
                            styles,
                        });
                    }

                    return next();

                })
                .catch(next);

        });

    }

};

module.exports = permissions;
