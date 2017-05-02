'use strict';

const linz = require('../../');
const path = require('path');

/**
 * Return the path to Linz's view directory, appending the specific view if passed in.
 * @param {String} view  The view to append to the view directory path (a Linz specific view).
 * @return {String}      A path to a particular view file.
 * @api public
 */
const viewPath = view => path.resolve(__dirname, '..', '..', 'views', (view || ''));

/**
 * Render a template in the context of Linz.
 * @param  {[type]}   data                  Data and options to pass to the template.
 * @param  {Function} callback              Optional callback function.
 * @return {String}                         Renders and returns the template HTML.
 */
const render = (data, callback) => {

    const view = viewPath('wrapper.jade');

    // If no callback is provided, use a Promise.
    if (!callback) {

        return new Promise((resolve, reject) => {

            if (!view) {
                return reject(new Error('Could not find template.'));
            }

            linz.app.render(view, data, (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            });

        });

    }

    // If a callback function is provided, render the view and return the results.
    if (typeof callback === 'function') {

        if (!view) {
            return callback(new Error('Could not find template.'));
        }

        linz.app.render(view, data, (err, result) => {

            if (err) {
                return callback(err);
            }

            return callback(null, result);

        });

    }

    // If we get to this point, assume callback is a res object.
    return callback.render(view, data);

};

module.exports = { render, viewPath };
