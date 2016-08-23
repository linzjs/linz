var async = require('async'),
    deep = require('deep-diff'),
    textDiffUtils = require('diff');

function getData (req, cb) {

    var versionsHelpers = require('./_modelVersionsCompare')(req);

    async.series({
        latest: versionsHelpers.getLastest,
        previous: versionsHelpers.getPrevious
    }, cb);

}

module.exports = {

    get: function (req, res, next) {

        var versionsHelpers = require('./_modelVersionsCompare')(req);

        async.waterfall([

            (cb) => getData(req, cb),

            (result, cb) => {

                var diffs = deep.diff(result.previous, result.latest);

                if (!diffs) {
                    // there are no change between the 2 versions, exit
                    return cb(null, undefined);
                }

                // get a list of changed fields and remove duplicates
                var changedFields = diffs.map(diff => diff.path[0])
                .filter((fieldName, index, array) =>  array.indexOf(fieldName) == index);

                // get data ready for comparison
                async.series({
                    latest: done => versionsHelpers.getVersionById(req.params.revisionBId, changedFields.join(' '), true, done),
                    previous: done => versionsHelpers.getVersionById(req.params.revisionAId, changedFields.join(' '), true, done)
                }, cb);

            },

            (result, cb) => {

                if (!result) {
                    return cb();
                }

                var form = req.linz.model.linz.formtools.form,
                    fieldsType = {};

                // populate fieldsType object
                Object.keys(form).forEach(fieldName => fieldsType[form[fieldName].label] = form[fieldName].type);

                req.linz.diffs = deep.diff(result.previous, result.latest);

                if (!req.linz.diffs) {
                    // there are no change between the 2 versions, exit
                    return cb();
                }

                // generate text diff for properties that are text fields
                req.linz.diffs.forEach(diff => {
                    if (diff.kind === 'E' && typeof diff.lhs === 'string' && diff.lhs.length && typeof diff.rhs === 'string' && fieldsType[diff.path[0]] === 'text') {
                        diff.textDiff = textDiffUtils.diffWords(diff.lhs, diff.rhs);
                    }
                });

                req.linz.history = result;

                async.parallel({
                    latest: versionsHelpers.getLatestVersionAdditionalProps,
                    previous: versionsHelpers.getPreviousVersionAdditionalProps
                }, (err, record) => {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.history.latest.author = record.latest.author;
                    req.linz.history.latest.date = record.latest.date;
                    req.linz.history.latest._id = record.latest._id;

                    req.linz.history.previous.author = record.previous.author;
                    req.linz.history.previous.date = record.previous.date;
                    req.linz.history.previous._id = record.previous._id;

                    return cb();

                });

            }

        ], next);

    }

}
