'use strict';

const linz = require('linz');

module.exports = {
    name: { fieldset: "Details" },
    email: {
        fieldset: "Details",
        helpText: "Provide the organisation's primary email address.",
        widget: linz.formtools.widgets.text({
            "data-bv-remote": true,
            "data-bv-remote-message": "Please enter a valid email address.",
            "data-bv-remote-type": "GET",
            "data-bv-remote-url": `${linz.get("admin path")}/is-email`,
            "data-bv-remote-name": "email"
        })
    }
};
