'use strict';

const linz = require('../linz');

/**
 * Render the custom form.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param {Function} next Call the next middleware.
 * @returns {Void} Renders the form.
 */
const renderForm = (req, res, next) => {

    const User = linz.api.model.get('mtUser');
    const { id } = req.params;

    User.findById(id)
        .then((record) => {

            if (!record) {
                return Promise.reject(new Error('User record not found'));
            }

            return linz.api.model.generateFormString(linz.api.model.get('mtUser'), {
                actionUrl: `${linz.get('admin path')}/model/mtUser/${id}/action/edit-custom`,
                cancelUrl: `${linz.get('admin path')}/model/mtUser/list`,
                form: customFormDsl,
                record,
                req,
                type: 'edit',
            });

        })
        .then(body => linz.api.views.render({ body }, req, res))
        .catch(next);

};

/**
 * Parse a form post.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @param {Function} next Call the next middleware.
 * @returns {Void} Renders the parsed form.
 */
const parseForm = (req, res, next) => {

    linz.api.formtools.parseForm(linz.api.model.get('mtUser'), req, customFormDsl)
        .then(record => res.json({ page: record }))
        .catch(next);

};

module.exports = {
    get: renderForm,
    post: parseForm,
};
