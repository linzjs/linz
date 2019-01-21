'use strict';

/**
 * Parse a form field.
 * @param {Any} field A form field.
 * @param {String} [type='string'] The name of the type.
 * @param {Object} options The fields options.
 * @param {String} options.fieldType The field type.
 * @param {Object} options.form The form DSL.
 * @param {String} options.formType The form type (edit, create).
 * @returns {Any} The updated field.
 */
const parseField = (fieldName, data, options = {}) => {

    const field = data[fieldName];

    const {
        fieldType,
        form,
        formType,
    } = options;

    let updatedField = field;
    const type = fieldType.toLowerCase();

    if (type === 'array' || type === 'enum') {
        updatedField = [].concat(field);
    }

    if (type === 'boolean') {

        let value = false;

        if (field) {
            value = true;
        }

        if (field.toLowerCase() === 'false') {
            value = false;
        }

        updatedField = value;

    }

    if (type === 'date') {
        updatedField = new Date(field);
    }

    if (type === 'number') {
        updatedField = Number(field);
    }

    if (type === 'documentarray') {

        try {

            updatedField = JSON.parse(field);

        } catch (error) {

            throw error;

        }

    }

    const formItem = Object.assign({}, form[fieldName], form[fieldName][formType]);

    if (formItem.widget && formItem.widget.transform) {
        updatedField = formItem.widget.transform(fieldName, formItem, field, data);
    }

    if (formItem.transform) {
        updatedField = formItem.transform(field, 'beforeSave');
    }

    return updatedField;

};

/**
 * Parse form post data ready to be used by Linz.
 * @param {Object} model A mongoose model.
 * @param {Object} req The request object.
 * @param {Object} formDSL
 * @param {Object} options The optional options.
 * @param {Object} options.data Override the req.body data.
 * @param {Object} options.formType The form type to use, edit or create.
 * @returns {Promise} Resolves with the parsed data.
 */
const parseForm = (model, req, formDSL, options = {}) => new Promise((resolve, reject) => {

    model.getForm(req, (err, modelForm) => {

        if (err) {
            return reject(err);
        }

        const form = Object.assign({}, modelForm, formDSL);

        // Allow overriding the req.body with a provided data option.
        const {
            data = req.body,
            formType,
        } = options;

        Object.keys(data)
            // We only want keys that are provided in the formDSL.
            .filter(fieldName => Object.keys(form).includes(fieldName))
            .forEach((fieldName) => {

                if (fieldName === '_id' || data[fieldName] === undefined) {
                    return;
                }

                const fieldType = (formDSL[fieldName] && formDSL[fieldName].type && formDSL[fieldName].type.toLowerCase()) || 'string';

                data[fieldName] = parseField(fieldName, data, {
                    fieldType,
                    form,
                    formType,
                });

            });

        return resolve(data);

    });

});

module.exports = {
    parseField,
    parseForm,
};
