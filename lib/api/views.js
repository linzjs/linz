'use strict';

const linz = require('../../');
const path = require('path');
const utils = require('../utils');
const clone = require('clone');

/**
 * Return the path to Linz's view directory, appending the specific view if passed in.
 * @param {String} view The view to append to the view directory path (a Linz specific view).
 * @return {String}     A path to a particular view file.
 * @api public
 */
const viewPath = view => path.resolve(__dirname, '..', '..', 'views', (view || ''));

/**
 * Render a template in the context of Linz.
 * @param  {Object}   data     Data and options to pass to the template.
 * @param  {Function} callback Optional callback function.
 * @return {String}            Renders and returns the template HTML.
 */
const render = (data, callback) => {

    const appLocals = {
        linzNavigation: linz.get('navigation'),
        template: 'wrapper'
    };

    const locals = utils.merge(appLocals, clone(data) || {});
    const view = viewPath(locals.template + '.jade');

    if (!view) {
        return callback(new Error('Could not find template.'));
    }

    // If a callback function is provided, render the view and return the results.
    if (typeof callback === 'function') {
        return linz.app.render(view, locals, callback);
    }

    // If we get to this point, assume callback is a res object.
    return callback.render(view, locals);

};

module.exports = { render, viewPath };
