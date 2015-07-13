var linz = require('../../'),
    path = require('path');

/**
 * Return the path to Linz's view directory, appending the specific view if passed in.
 * @param {String} view  The view to append to the view directory path (a Linz specific view).
 * @return {String}      A path to a particular view file.
 * @api public
 */
function viewPath (view) {
    return path.resolve(__dirname, '..', '..', 'views', (view || ''));
}

module.exports = {
    viewPath: viewPath
};
