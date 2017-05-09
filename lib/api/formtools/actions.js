'use strict';

/**
 * Parse some action disabled properties.
 * @param  {Object} record Mongoose model record.
 * @param  {Array|Object} actions Actions to parse.
 * @return {Array} Parsed actions.
 */
const parseDisabledProperties = (record, actions) => new Promise((resolve, reject) => {

    const parsedActions = [].concat(actions);
    const actionsToBeParsed = [];

    parsedActions.forEach((action) => {

        if (action.disabled) {

            if (typeof action.disabled !== 'function') {
                return reject(new Error('Invalid type for overview.action.disabled. It must be a function.'));
            }

            actionsToBeParsed.push(
                action.disabled(record, (err, isDisabled, message) => {

                    action.isDisabled = isDisabled;

                    if (isDisabled === true) {
                        action.disabledMessage = message;
                    }

                    return action;

                })
            );

        }

    });

    Promise.all(actionsToBeParsed)
        .then(() => resolve(parsedActions))
        .catch(reject);

});

/**
 * Parse some action modals into a format the rendering engine can easily access.
 * @param  {Array|Object} actions Actions to parse.
 * @return {Array} Parsed actions.
 */
const parseModalProperties = (actions) => {

    const parsedActions = [].concat(actions);

    parsedActions.forEach((action) => {

        let modal = { active: false };

        if (typeof action.modal === 'object') {

            modal = action.modal;
            modal.active = modal.active !== false;

        }

        if (typeof action.modal === 'boolean') {
            modal.active = action.modal;
        }

        action.modal = modal;

    });

    return parsedActions;

};

module.exports = { parseDisabledProperties, parseModalProperties };
