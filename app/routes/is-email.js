'use strict';

const isEmail = require('is-email');

const checkIsEmail = (req, res, next) => {

    const { email } = req.query;

    return res.json({ valid: isEmail(email) });

};

module.exports = checkIsEmail;
