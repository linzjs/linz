if (!linz) {
    var linz = {};
}

(function  () {

    var adminPath;

    $(document).ready(function () {

        // javascript events for the navigation
        $('[data-linz-nav-toggle]').click(function () {

            // scroll back to the top
            $('body').animate({scrollTop:0}, 200, 'swing', function () {
                // show the navigation
                $('body').toggleClass('show-nav');
            });

        });

        // add form validation
        $('form[data-linz-validation="true"]').bootstrapValidator({});

        // add delete prompt
        $('[data-linz-control="delete"]').click(function () {

            if ($(this).attr('data-linz-disabled')) {
                // no confirmation for disabled button
                return false;
            }

            if (confirm('Are you sure you want to delete this record?')) {
                return true;
            }

            return false;

        });

        // add disabled alert
        $('[data-linz-disabled="true"]').click(function () {

            alert($(this).attr('data-linz-disabled-message'));
            return false;

        });

        // initialize multiselect
        $('.multiselect').not(function (item, el) {
            return ($(el).closest('span.controlField').length === 1) ? true : false;
        }).multiselect({
            buttonContainer: '<div class="btn-group btn-group-multiselect" />'
        });

        // assign ckeditor editor (classic view using iframe)
        $('.ckeditor').each(function () {

            var editorConfig = {
                customConfig: $(this).attr('data-linz-ckeditor-config') || adminPath + '/public/js/ckeditor-config-linz-default.js',
                contentsCss: $(this).attr('data-linz-ckeditor-style') ? $(this).attr('data-linz-ckeditor-style').split(',') : adminPath + '/public/css/ckeditor-linz-default.css'
            };

            // check if there are any widgets to include
            var widgets = $(this).attr('data-linz-ckeditor-widget') ? $(this).attr('data-linz-ckeditor-widget').split(',') : [];

            if (widgets.length !== 0) {

                var plugins = [];

                widgets.forEach(function (widget) {

                    // widget is provided in the format {name}:{path}
                    var widgetProperties = widget.split(':');

                    // loads external plugins
                    CKEDITOR.plugins.addExternal(widgetProperties[0], widgetProperties[1], '');

                    plugins.push(widgetProperties[0]);

                });

                editorConfig.extraPlugins = plugins.join(',');

            }

			CKEDITOR.replace( this, editorConfig);

        });

        // assign ckeditor inline editor
        $('.ckeditor-inline').each(function () {

            var editorConfig = {
                customConfig: $(this).attr('data-linz-ckeditor-config') || adminPath + '/public/js/ckeditor-config-linz-default.js'
            };

            // check if there are any widgets to include
            var widgets = $(this).attr('data-linz-ckeditor-widget') ? $(this).attr('data-linz-ckeditor-widget').split(',') : [];

            if (widgets.length !== 0) {

                var plugins = [];

                widgets.forEach(function (widget) {

                    // widget is provided in the format {name}:{path}
                    var widgetProperties = widget.split(':');

                    // loads external plugins
                    CKEDITOR.plugins.addExternal(widgetProperties[0], widgetProperties[1], '');

                    plugins.push(widgetProperties[0]);

                });

                editorConfig.extraPlugins = plugins.join(',');

            }

			CKEDITOR.inline( this, editorConfig);

        });

        // We know the page has loaded at this point, so we can re-enable the modals.
        $('[data-linz-modal]').removeClass('disabled');

        // Add ability to open model action in a modal.
        $('[data-linz-modal]').click(function (event) {

            event.preventDefault();

            var button = $(this);

            if (button.attr('data-linz-disabled') === 'true') {
                return;
            }

            var url = button[0].nodeName === 'BUTTON' ? button.attr('data-href') : button.attr('href');

            // open modal and load URL
            $('#linzModal').modal().load(url);

            // remove modal shown event
            $('#linzModal').off('shown.bs.modal');

            // re-bind the shown event
            $('#linzModal').on('shown.bs.modal', function (e) {

                // add form validation
                $(this).find('form[data-linz-validation="true"]').bootstrapValidator({});

                if (button.attr('data-linz-modal-callback')) {
                    // run custom function if provided after modal is shown
                    window[button.attr('data-linz-modal-callback')]();
                }

            });

        });

        // convert UTC to local datetime
        $('[data-linz-local-date]').each(function () {

            var dateFormat = $(this).attr('data-linz-date-format') || 'ddd DD/MM/YYYY';
            var localDateTime = moment(new Date($(this).attr('data-linz-utc-date'))).format(dateFormat);

            $(this).html(localDateTime);

        });

        loadDatepicker();

    });

    function setPath(path) {
        adminPath = path;
    }

    function eventPreventDefault (e) {
        e.preventDefault();
    }

    function loadDatepicker() {

        if ($('[data-ui-datepicker]').length) {

            // Set the timezone offset in a hidden input element.
            var timezoneInput = document.createElement('input');
            timezoneInput.setAttribute('type', 'hidden');
            timezoneInput.setAttribute('name', 'linzTimezoneOffset');
            timezoneInput.setAttribute('value', moment().format('Z'));

            $('[data-ui-datepicker]').parents('form').prepend(timezoneInput);

            $('[data-ui-datepicker]').each(function () {

                var field = $(this);

                // Stop processing if the date picker has already been setup.
                if (field.data('DateTimePicker')) {
                    return;
                }

                // Support format and useCurrent customissations via the widget.
                var format = field.attr('data-linz-date-format') || 'YYYY-MM-DD';
                var useCurrent = field.attr('data-linz-date-use-current') === 'true';
                var dateValue = field.attr('data-linz-date-value');
                var sideBySide = field.attr('data-linz-date-side-by-side') === 'true';

                // Setup the datetimepicker plugin.
                field.datetimepicker({
                    format: format,
                    sideBySide: sideBySide,
                    useCurrent: useCurrent,
                });

                if (dateValue) {
                    field.data('DateTimePicker').date(moment(dateValue));
                }

                // Trigger the change event on load for modals.
                field.change();

                // Trigger the change event for the field whenever the datepicker is shown or changed.
                field.on({
                    'dp.change': function() {
                        field.change();
                    },
                    'dp.show': function () {
                        field.change();
                    },
                });

                // Prevent manually editing the date field.
                field.bind('paste', eventPreventDefault);
                field.on('keydown', eventPreventDefault);

            });

        }

    }

    function isTemplateSupported() {
        return 'content' in document.createElement('template');
    }

    function addDeleteConfirmation () {

        $('[data-linz-control="delete"]').click(function () {

            if ($(this).attr('data-linz-disabled')) {
                // no confirmation for disabled button
                return false;
            }

            if (confirm('Are you sure you want to delete this record?')) {
                return true;
            }

            return false;

        });

    }

    function addDisabledBtnAlert () {

        $('[data-linz-disabled="true"]').click(function () {
            alert($(this).attr('data-linz-disabled-message'));
            return false;

        });

    }

    function addConfigDefaultConfirmation () {

        $('[data-linz-control="config-default"]').click(function () {

            if ($(this).attr('data-linz-disabled')) {
                // no confirmation for disabled button
                return false;
            }

            if (confirm('Are you sure you want to reset this config to default?')) {
                return true;
            }
        });
    }

    linz.setPath = setPath;
    linz.loadDatepicker = loadDatepicker;
    linz.isTemplateSupported = isTemplateSupported;
    linz.addDeleteConfirmation = addDeleteConfirmation;
    linz.addDisabledBtnAlert = addDisabledBtnAlert;
    linz.addConfigDefaultConfirmation = addConfigDefaultConfirmation;

})();
