var fs = require('fs'),
    path = require('path');

module.exports = function (dir) {

    var exports = {},
    files = fs.readdirSync(dir);

    files.forEach(function (file) {

        var name = path.basename(file, '.js');
        exports[name] = require(path.resolve(dir) + '/' + file);

    });

    return exports;

};
