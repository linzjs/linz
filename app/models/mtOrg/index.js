"use strict";

const linz = require("linz");
const mtOrgSchema = require('./schema');

// add the formtools plugin
mtOrgSchema.plugin(linz.formtools.plugins.document, require('./formtools'));

mtOrgSchema.pre("save", function(next, callback, req) {
    if (req && req.user) {
        this.modifiedBy = req.user.username;
    }

    return next(callback, req);
});

module.exports = linz.mongoose.model("mtOrg", mtOrgSchema);
