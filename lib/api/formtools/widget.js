var linz = require('../../../');

function get (widgetName, attrs) {

    return function (name, field, value, record, formType, embeddedDocumentForm) {

        if (widgetName === 'documents') {
            return linz.formtools.widgets[widgetName].render(name, field, value, record, formType, embeddedDocumentForm, attrs);
        }

        return linz.formtools.widgets[widgetName].render(name, field, value, record, formType, attrs);

    };

}

module.exports = {
    get: get
};
