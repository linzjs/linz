'use strict';

const utils = require('../../utils');

const parseForm = (model, req, formDSL, options = {}) => new Promise((resolve, reject) => {

    model.getForm(req, (err, modelForm) => {

        if (err) {
            return reject(err);
        }

        const form = Object.assign({}, modelForm, formDSL);
        const data = req.body;
        const { formType } = options;

        Object.keys(data).forEach((fieldName) => {

            if (fieldName === '_id' || data[fieldName] === undefined) {
                return;
            }

            const fieldType = (formDSL[fieldName].type && formDSL[fieldName].type.toLowerCase()) || 'string';
            const formItem = Object.assign({}, form[fieldName], form[fieldName][formType]);

            if (fieldType === 'documentarray') {

                try {

                    data[fieldName] = JSON.parse(data[fieldName]);

                } catch (error) {

                    return reject(error);

                }

            }

            if (fieldType === 'array') {
                data[fieldName] = [data[fieldName]];
            }

            if (fieldType === 'boolean') {
                data[fieldName] = utils.asBoolean(data[fieldName]);
            }

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

module.exports = parseForm;
