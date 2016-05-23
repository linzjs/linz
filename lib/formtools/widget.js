'use strict';

class Widget {

    /**
     * Get default setting
     * @return {Object} Setting object
     */
    static get default () {

        return {
            attributes: {
                type: 'text',
                class: 'form-control',
                name: undefined,
                'data-linz-conflict-handler': 'textConflictHandler'
            },
            label: {
                label: undefined,
                attributes: {
                    'class': 'col-sm-2 control-label'
                }
            }
        };

    }

}

module.exports = Widget;
