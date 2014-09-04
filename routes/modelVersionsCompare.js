var templates = require('../lib/versions/templates');

module.exports = {

    get: function (req, res) {

        var locals = {
                label: 'Compare versions',
                latest: req.linz.history.latest,
                previous: req.linz.history.previous,
                diffs: req.linz.diffs
            },
            content = templates.compare(locals);

        res.send(content);
    }
}
