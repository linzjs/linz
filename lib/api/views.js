'use strict';

const linz = require('../../');
const path = require('path');
const utils = require('../utils');
const clone = require('clone');
const namespaceMiddleware = require('../../middleware/linz');
const attributesMiddleware = require('../../middleware/attributes');
const setTemplateScripts = require('../scripts');
const setTemplateStyles = require('../styles');

/**
 * Get the scripts that Linz uses for a route.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param {Function} next The next function.
 * @return {Void} Calls the setTemplateScripts function.
 */
const getScripts = (req, res, scripts = []) => setTemplateScripts(req, res, scripts);

/**
 * Get the styles that Linz uses for a route.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param {Function} next The next function.
 * @return {Void} Calls the setTemplateStyles function.
 */
const getStyles = (req, res, styles = []) => setTemplateStyles(req, res, styles);

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
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param  {Function} callback Optional callback function.
 * @return {String}            Renders and returns the template HTML.
 */
const render = (data, req, res, callback) => {

    // Namespace this request object.
    namespaceMiddleware(req, {}, () => {

        attributesMiddleware(req, {}, () => {

            // Retrieve navigation suitable for the user.
            linz.api.navigation.get(req, (err, navigation) => {

                if (err) {
                    return callback(err);
                }

                Promise.all([
                    getScripts(req, res),
                    getStyles(req, res),
                ])
                    .then(([scripts, styles]) => {

                        const appLocals = {
                            customAttributes: req.locals.customAttributes,
                            linzNavigation: navigation,
                            scripts,
                            styles,
                            template: 'wrapper',
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
                        return res.render(view, locals);

                    })
                    .catch(callback);

            });

        });

    });

};

/**
 * Render a partial.
 * @param  {String}   view     The name of the partial to render.
 * @param  {Object}   locals   The locals for the template.
 * @param  {Function} callback Callback to return the HTML too.
 * @return {Void}
 */
const renderPartial = (view, locals, callback) => {

    return linz.app.render(linz.api.views.viewPath(`partials/${view}.jade`), locals, callback);

}

/**
 * Takes an object, set's some defaults based on the Noty library.
 * @param  {Object} noty Options for the Noty library (http://ned.im/noty/options.html).
 * @return {Object}      An object with added defaults.
 */
const notification = (noty) => {

    const defaults = {
        type: 'info',
        theme: 'sunset',
        layout: 'topCenter',
        timeout: 5000,
        animation: {
            open: 'linz-noty-effects-open',
            close: 'linz-noty-effects-close'
        }
    };

    return Object.assign(defaults, noty);

}

module.exports = {
    getScripts,
    getStyles,
    notification,
    render,
    renderPartial,
    viewPath,
};
