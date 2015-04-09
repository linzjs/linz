var async = require('async'),
    deep = require('deep-diff'),
    textDiffUtils = require('diff');

module.exports = {

    get: function (req, res, next) {

        var versionsHelpers = require('./_modelVersionsCompare')(req, res, next);

        async.series({

            latest: versionsHelpers.getLastest,
            previous: versionsHelpers.getPrevious

        }, function (err, result) {

            req.linz.model = req.linz.api.model.get(req.params.model);
            req.linz.diffs = deep.diff(result.previous, result.latest);
            req.linz.history = {
                previous: result.previous,
                latest: result.latest
            };

            if (!req.linz.diffs) {
                // there are no change between the 2 versions
                return next(null);
            }

            // generate text diff for text field
            req.linz.diffs.forEach(function (diff) {
                if (diff.kind === 'E' && typeof diff.lhs === 'string' && typeof diff.rhs === 'string') {
                    diff.textDiff = textDiffUtils.diffWords(diff.lhs, diff.rhs);
                }
            });

            async.parallel({

                latest: versionsHelpers.getLatestVersionAdditionalProps,
                previous: versionsHelpers.getPreviousVersionAdditionalProps

            }, function (err, record) {

                if (err) {
                    return next(err);
                }

                req.linz.history.latest.author = record.latest.author;
                req.linz.history.latest.date = record.latest.date;
                req.linz.history.latest._id = record.latest._id;

                req.linz.history.previous.author = record.previous.author;
                req.linz.history.previous.date = record.previous.date;
                req.linz.history.previous._id = record.previous._id;

                return next(null);

            });

        });

    }

}
