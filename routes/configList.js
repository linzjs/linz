'use strict';

const async = require('async');
const linz = require('../');

/* GET /admin/configs/list */
var route = function (req, res, next) {

    // determine if we need to render the actions field
    async.some(req.linz.records, function (record, cb) {

        // if any of these records can edit or reset, we should show the field
        if (record.permissions.canEdit !== false || record.permissions.canReset !== false) {
            return cb(null, true);
        }

        return cb(null, false);

    }, function (renderActionsField) {

        Promise.all([
            linz.api.views.getScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/config/list.js`,
                },
            ]),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('configList.jade'), {
                    configs: req.linz.configs,
                    list: req.linz.configList,
                    records: req.linz.records,
                    renderActionsField: renderActionsField,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    });

};

module.exports = route;
