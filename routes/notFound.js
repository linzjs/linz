'use strict';

const linz = require('../');

/**
 * Render a 404 not found page.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP request object.
 * @param {Object} next Call the next middleware.
 * @return {Void} Renders a 404 error page.
 */
const renderNotFoundPage = (req, res, next) => {

    // Allow passing your own html.
    linz.get('404')(req)
        .then((customContent) => {

            // Redirect back to the referrer or homepage.
            return linz.api.views.render({
                customContent,
                description: 'Oops, we can\'t find what you\'re looking for.',
                template: '404',
                backUrl: req.get('Referrer') || '/',
            }, req, res);

        })
        .catch(next);

};

module.exports = renderNotFoundPage;
