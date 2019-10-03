var templates = require('../lib/versions/templates');

module.exports = {
    get: function(req, res) {
        var locals = {
                label: 'Compare versions',
                latest:
                    req.linz.history && req.linz.history.latest
                        ? req.linz.history.latest
                        : undefined,
                previous:
                    req.linz.history && req.linz.history.previous
                        ? req.linz.history.previous
                        : undefined,
                diffs: req.linz.diffs,
            },
            content = templates.compare(locals);

        res.send(content);
    },
};
