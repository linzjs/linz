'use strict';

const linz = require('linz');

/**
 * Grid list renderer.
 * @param  {Object}   data     Data passed to the template.
 * @param  {Function} callback Callback function.
 * @return {String}            Rendered HTML content.
 */
function grid (data, callback) {

    linz.app.render(linz.api.views.viewPath('modelIndex/grid.jade'), data, (err, html) => {

        if (err) {
            return callback(err);
        }

        return callback(null, html);

    });

}

/**
 * List list renderer.
 * @param  {Object}   data     Data passed to the template.
 * @param  {Function} callback Callback function.
 * @return {String}            Rendered HTML content.
 */
function list (data, callback) {

    linz.app.render(linz.api.views.viewPath('modelIndex/list.jade'), data, (err, html) => {

        if (err) {
            return callback(err);
        }

        return callback(null, html);

    });

}

module.exports = {

    default: grid,
    grid,
    list

}
