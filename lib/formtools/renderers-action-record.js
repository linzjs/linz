'use strict';

const linz = require('../../');

/**
 * Default record action renderer.
 * @param  {Object}   data     Data passed to the template.
 * @param  {Function} callback Callback function.
 * @return {String}            Rendered HTML content.
 */
function defaultRenderer (data, callback) {

    linz.app.render(linz.api.views.viewPath('partials/action-record.jade'), data, (err, html) => {

        if (err) {
            return callback(err);
        }

        return callback(null, html);

    });

}

module.exports = { defaultRenderer };
