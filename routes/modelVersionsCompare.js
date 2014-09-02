var linz = require('../'),
    templates = require('../lib/versions/templates');

module.exports = {

    get: function (req, res) {

        var locals = {
                latest: req.linz.history.latest,
                previous: req.linz.history.previous,
                diffs: req.linz.diffs
            },
            content = templates.compare(locals);

        res.send(content);
    }
}
