'use strict';

/**
 * Parses a script or style object for data attributes and correctly formats them.
 * @param {Object} obj An object.
 * @returns {Object} The parsed object.
 */
const parseDataAttributes = (obj) => {

    // Don't mutate the original object.
    const newObj = Object.assign({}, obj);

    if (!newObj.dataAttributes) {

        newObj.dataAttributes = {};

        return newObj;

    }

    const dataAttributes = Object.keys(newObj.dataAttributes);
    const parsedAttributes = {};

    dataAttributes.forEach((attribute) => {
        parsedAttributes[`data-${attribute}`] = newObj.dataAttributes[attribute];
    });

    newObj.dataAttributes = parsedAttributes;

    return newObj;

};

/**
 * Parses an array of script or style objects for data attributes and correctly formats them.
 * @param {Array} arr An array of objects.
 * @returns {Array} The parsed objects.
 */
const parseScriptsAndStyles = (arr = []) => arr.map(parseDataAttributes);

module.exports = {
    parseDataAttributes,
    parseScriptsAndStyles,
};
