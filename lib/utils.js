exports.merge = function(a, b) {
    if (a && b) {
        for (var key in b) {
            a[key] = b[key];
        }
    }
    return a;
};

exports.clone = function(a) {
    var b = {};

    for (var key in a) {
        b[key] = a[key];
    }

    return b;
};

exports.cloneWithout = function(a, without) {
    var b = {};

    for (var key in a) {
        if (without.indexOf(key) < 0) {
            b[key] = a[key];
        }
    }

    return b;
};

exports.asBoolean = function(val) {
    if ('true,yes,1'.indexOf(val) >= 0) {
        return true;
    }

    if ('false,no,0'.indexOf(val) >= 0) {
        return false;
    }

    // truthy or falsy
    return val ? true : false;
};

exports.isBoolean = function(val) {
    if (typeof val === 'boolean') {
        return true;
    }

    if ('true,false,yes,no,1,0'.indexOf(val) >= 0) {
        return true;
    }

    return false;
};

exports.labelValueArray = function(data) {
    if (!Array.isArray(data)) {
        throw new Error('Provided parameter is not of type Array');
    }

    var newArray = [];

    data.forEach(function(obj) {
        newArray.push({
            label: obj.label || obj,
            value: obj.value || obj,
        });
    });

    return newArray;
};

exports.json2CSV = function(obj) {
    var data = [];

    Object.keys(obj).forEach(function(fieldName) {
        if (obj[fieldName] === undefined || obj[fieldName] === null) {
            return data.push('');
        }

        return data.push(obj[fieldName].toString().replace(/"/g, '""', 'g'));
    });

    return '"' + data.join('","') + '"\n';
};

/**
 * Return an array of matching values in the two provided arrays
 * @param {Array} arr1
 * @param {Array} arr2
 */
exports.arrayMatch = function(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        throw new Error('One of the parameters is not of type Array');
    }

    return arr1.filter(function(val) {
        return arr2.indexOf(val) >= 0;
    });
};

/**
 * Return true if provided arrays contains the same values
 * @param {Array} arr1
 * @param {Array} arr2
 */
exports.arrayEquals = function(arr1, arr2) {
    // check that arr2 contains every elements in arr1
    var check1 = arr1.every(function(val) {
        return arr2.indexOf(val) >= 0;
    });

    // check that arr1 contains every elements in arr2
    var check2 = arr2.every(function(val) {
        return arr1.indexOf(val) >= 0;
    });

    // compare the result
    return check1 && check2;
};

/**
 * Escape regex special characters
 * @param {String} str    str with special characters to escape
 * @return {String}
 */
exports.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

/**
 * Return a function that will execute a callback function (either provided to noOp, or provided to the
 * generated function).
 * @param {Function} _cb (optional)
 */
exports.noOp = function(_cb) {
    return function(cb) {
        return (_cb || cb)(null);
    };
};

/**
 * Parse a string value. Used in the filters.
 * @param {String} value String value.
 * @param {Object} options Parser options.
 * @param {Boolean} options.parseNumber Option to parse numbers (Won't work with phone numbers).
 * @return {Any} Null or the original string.
 */
module.exports.parseString = (value, options) => {
    const settings = Object.assign(
        {},
        {
            parseNumber: false,
        },
        options
    );

    if (value === 'null' || value === 'undefined') {
        return null;
    }

    // Use a stricter parse function to prevent parsing ObjectIds.
    if (settings.parseNumber && /^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
        return Number(value);
    }

    return value;
};
