'use strict';

const linz = require('linz');
const emailSchema = require('../../schemas/emailSchema');

const mtUserSchema = new linz.mongoose.Schema({
    alternativeEmails: [emailSchema],
    bAdmin: {
        default: false,
        type: Boolean,
    },
    birthday: Date,
    createdBy: String,
    customOffset: Date,
    email: String,
    modifiedBy: String,
    name:  String,
    org: {
        ref: 'mtOrg',
        type: linz.mongoose.Schema.Types.ObjectId,
    },
    password: String,
    username: String,
    objectField: linz.mongoose.Schema.Types.Mixed,
});

module.exports = mtUserSchema;
