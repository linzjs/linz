'use strict';

const moment = require('moment');

/**
 * Given a date return a date ISO string.
 * @param {String} dateString The date string to format.
 * @param {String} dateFormat The date format.
 * @param {String} offset     A timezone offset.
 * @param {Function} startOf  A function to manipulate the moment object.
 */
const isoString = (dateString, dateFormat = 'YYYY-MM-DD', offset = '+0:00', manipulationFn) => {

    let date = moment(dateString, dateFormat);

    if (manipulationFn) {
        date = manipulationFn(date);
    }

    // Take into consideration the client-side timezone.
    // MongoDB stores dates in UTC.
    date.zone(offset);

    // Add the timezone in minutes to the date.
    const [, plusOrMinus, hours, minutes] = offset.match(/^(\+|-)([0-9]{1,2}):([0-9]{2})$/);
    let total = Number(hours)*60 + Number(minutes);

    // Manage positive/negative offsets
    if (plusOrMinus === '+') {
        total = -(total);
    }

    // Add the value of the offset, back to the time in minutes.
    // This will ensure when an `endOf('day')` date is rendered client side, it will be accurate.
    date.add(total, 'm');

    // Return as an ISOString.
    return date.toISOString();

}

module.exports = {
    isoString,
};
