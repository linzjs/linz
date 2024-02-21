'use strict';

const linz = require('linz');
const mtOrgSchema = require('./schema');

// add the formtools plugin
mtOrgSchema.plugin(linz.formtools.plugins.document, require('./formtools'));

mtOrgSchema.pre('save', function(next) {
    if (this.user) {
        this.modifiedBy = this.user.username;
    }

    return next();
});

module.exports = linz.mongoose.model('mtOrg', mtOrgSchema);
