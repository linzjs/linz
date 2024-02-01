'use strict';

const linz = require('linz');
const mtUserSchema = require('./schema');

// add the formtools plugin
mtUserSchema.plugin(linz.formtools.plugins.document, require('./formtools'));

// Add versions plugin
mtUserSchema.plugin(linz.versions.plugin, require('./versions'));

mtUserSchema.plugin(
    linz.concurrencyControl.plugin,
    require('./concurrency-control')
);

mtUserSchema.virtual('hasAdminAccess').get(function() {
    return this.bAdmin === true;
});

mtUserSchema.methods.verifyPassword = function(candidatePassword, callback) {
    return callback(null, this.password === candidatePassword);
};

mtUserSchema.pre('save', function() {
    if (this.user) {
        this.modifiedBy = this.username;
    }

    this.increment();

    return next();
});

module.exports = linz.mongoose.model('mtUser', mtUserSchema);
