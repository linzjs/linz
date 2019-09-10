'use strict';

const linz = require('linz');
const docSchema = require('../../schemas/docSchema');

const testSchema = new linz.mongoose.Schema({
    boolean: Boolean,
    checkboxes: Array,
    checkboxesWithAddition: Array,
    ckeditor: String,
    date: Date,
    digit: linz.mongoose.Schema.Types.Digit,
    documents: [docSchema],
    email: linz.mongoose.Schema.Types.Email,
    hidden: String,
    multipleSelect: Array,
    number: Number,
    password: linz.mongoose.Schema.Types.Password,
    radios: String,
    select: String,
    tel: linz.mongoose.Schema.Types.Tel,
    textArea: String,
    text: linz.mongoose.Schema.Types.Text,
    title: String,
    url: linz.mongoose.Schema.Types.URL,
});

module.exports = testSchema;
