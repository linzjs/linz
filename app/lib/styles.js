'use strict';

/**
 * Set the styles that certain pages load.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @returns {Promise} Resolves with the updated styles.
 */
module.exports = (req, res) => {
    let { styles = [] } = res.locals;

    styles = styles.concat([{ dataAttributes: { test: 'test' } }]);

    return Promise.resolve(styles);
};
