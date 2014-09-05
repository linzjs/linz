var moment = require('moment');

module.exports = function timestampRenderer (date, record, fieldName, model, callback) {
    return callback(null, moment(date).format('DD/MM/YY, h:mm:ss a'));
};
