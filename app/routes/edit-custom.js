'use strict';

const linz = require('linz');
const moment = require('moment');

let docSchema;

/**
 * Get the custom form dsl. (Bypasses the linz circular dependency bug)
 * @returns {Object} Returns the dorm dsl.
 */
const getCustomFormDsl = () => {
    // Only load it once.
    if (!docSchema) {
        docSchema = require('../schemas/docSchema');
    }

    return {
        name: {
            fieldset: 'Original',
        },
        email: {
            fieldset: 'Original',
        },
        alternativeEmails: {
            fieldset: 'Original',
            type: 'documentarray',
            widget: linz.formtools.widgets.documents({
                setLabel: function setLabel(doc) {
                    doc.label = doc.email + ' (' + doc.type + ')';

                    return doc;
                },
            }),
        },
        username: {
            fieldset: 'Original',
        },
        age: {
            fieldset: 'Original',
            type: 'number',
        },
        birthday: {
            label: 'Birthday',
            fieldset: 'Details',
            type: 'date',
        },
        street: {
            label: 'Street',
            fieldset: 'Details',
        },
        docs: {
            label: 'Docs',
            fieldset: 'Details',
            type: 'documentarray',
            schema: docSchema,
            widget: linz.formtools.widgets.documents({
                setLabel: function setLabel(doc) {
                    doc.label =
                        doc.name + ' ' + moment(doc.time).format('hh:mm a');

                    return doc;
                },
            }),
        },
    };
};

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
        .exec()
        .then((record) => {
            if (!record) {
                return Promise.reject(new Error('User record not found'));
            }

            return linz.api.model.generateFormString(
                linz.api.model.get('mtUser'),
                {
                    actionUrl: `${linz.get(
                        'admin path'
                    )}/model/mtUser/${id}/action/edit-custom`,
                    cancelUrl: `${linz.get('admin path')}/model/mtUser/list`,
                    form: getCustomFormDsl(),
                    record,
                    req,
                    type: 'edit',
                }
            );
        })
        .then((html) =>
            res.render(
                'partials/edit-custom-form',
                {
                    html,
                    title: 'Custom edit form',
                },
                (err, page) => {
                    if (err) {
                        return Promise.reject(err);
                    }

                    return linz.api.views.render({ page }, req, res);
                }
            )
        )
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
    linz.api.formtools
        .parseForm(linz.api.model.get('mtUser'), req, getCustomFormDsl())
        .then((data) =>
            res.render(
                'partials/edit-custom-result',
                {
                    backLink: req.get('Referrer'),
                    html: JSON.stringify(data),
                    title: 'Custom edit form result',
                },
                (err, page) => {
                    if (err) {
                        return Promise.reject(err);
                    }

                    return linz.api.views.render({ page }, req, res);
                }
            )
        )
        .catch(next);
};

module.exports = {
    get: renderForm,
    post: parseForm,
};
