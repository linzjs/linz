var templates = require('../lib/versions/templates'),
    linz = require('../');

module.exports = {

    get: function (req, res) {
        var locals = {
                label: 'Rollback to this version',
                rollback: true,
                url: req.originalUrl,
                latest: req.linz.history.latest,
                previous: req.linz.history.previous,
                diffs: req.linz.diffs
            },
            content = templates.compare(locals);

        res.send(content);
    },

    post : function (req, res) {
        return res.redirect(linz.api.getAdminLink(req.linz.model, 'overview', req.params.id) + '#history');
    }
}
