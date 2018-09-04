'use strict';

/**
 * Parse a form field.
 * @param {Any} field A form field.
 * @param {String} type The name of the type.
 * @returns {Any} The updated field.
 */
const parseField = (field, type = 'string') => {

    let updatedField = field;
    const fieldType = type.toLowerCase();

    if (fieldType === 'array' || fieldType === 'enum') {
        updatedField = [field];
    }

    if (fieldType === 'boolean') {

        let value = false;

        if (field) {
            value = true;
        }

        if (field.toLowerCase() === 'false') {
            value = false;
        }

        updatedField = value;

    }

    if (fieldType === 'date' || fieldType === 'datetime') {
        updatedField = new Date(field);
    }

    if (fieldType === 'number') {
        updatedField = Number(field);
    }

    if (fieldType === 'documentarray') {

        try {

            updatedField = JSON.parse(field);

        } catch (error) {

            throw error;

        }

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
                const formItem = Object.assign({}, form[fieldName], form[fieldName][formType]);

                data[fieldName] = parseField(data[fieldName], fieldType);

                if (formItem.widget && formItem.widget.transform) {
                    data[fieldName] = formItem.widget.transform(fieldName, formItem, data[fieldName]);
                }

                if (formItem.transform) {
                    data[fieldName] = formItem.transform(data[fieldName], 'beforeSave');
                }

            });

        return resolve(data);

    });

});

module.exports = {
    parseField,
    parseForm,
};
