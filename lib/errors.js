'use strict';

var printf = require('printf'),
    chalk = require('chalk'),
    linz = require('../');

exports.log = function(s) {
    var lOutput = s,
        args = [],
        logger = linz.get('error log');

    if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        lOutput = printf.apply(null, args);
    }

    if (typeof logger === 'function') {
        return logger('\n' + chalk.bold.red('linz error: ') + lOutput);
    }
};
