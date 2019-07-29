"use strict";

const linz = require("linz");

const mtOrgSchema = new linz.mongoose.Schema({
    createdBy: String,
    modifiedBy: String,
    name: String,
    email: String
});

module.exports = mtOrgSchema;
