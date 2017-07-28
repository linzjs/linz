var linz = require('../'),
    async = require('async');

/* GET /admin/configs/list */
var route = function (req, res) {

    // determine if we need to render the actions field
    async.some(req.linz.records, function (record, cb) {

        // if any of these records can edit or reset, we should show the field
        if (record.permissions.canEdit !== false || record.permissions.canReset !== false) {
            return cb(true);
        }

        return cb(false);

    }, function (renderActionsField) {

        res.render(linz.api.views.viewPath('configList.jade'), {
            configs: req.linz.configs,
            list: req.linz.configList,
            records: req.linz.records,
            renderActionsField: renderActionsField,
            scripts: res.locals.scripts,
            styles: res.locals.styles,
        });

    });

};

module.exports = route;
