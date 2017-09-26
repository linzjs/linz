if (!linz) {
    var linz = {};
}

(function  () {

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
                customConfig: $(this).attr('data-linz-ckeditor-config') || '/admin/public/js/ckeditor-config-linz-default.js',
                contentsCss: $(this).attr('data-linz-ckeditor-style') ? $(this).attr('data-linz-ckeditor-style').split(',') : '/admin/public/css/ckeditor-linz-default.css'
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
                customConfig: $(this).attr('data-linz-ckeditor-config') || '/admin/public/js/ckeditor-config-linz-default.js'
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

        // add ability to open URL in a modal
        $('[data-linz-modal]').click(function (event) {

            event.preventDefault();

            var button = $(this);

            if (button.attr('data-linz-disabled') === 'true') {
                return;
            }

            var url = button[0].nodeName === 'BUTTON' ? button.attr('data-href') : button.attr('href');

            // open modal and load URL
            $('#linzModal').modal().find('.modal-content').load(url);

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

    });

    function loadLibraries(path) {

        // resource loader for fallback support
        Modernizr.load([
            {
                test: Modernizr.inputtypes.date,
                nope: [
                    '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js',
                    '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css',
                ],
                complete : function () {
                    loadDatepicker();
                }
            }
        ]);

    }

    function loadDatepicker() {

        if (!Modernizr.inputtypes.date && $('[data-ui-datepicker]').length) {

            // remove all event listener
            $('[data-ui-datepicker]').parent().unbind();
            $('[data-ui-datepicker]').parent().datetimepicker({
                pickTime: false,
                format: 'YYYY-MM-DD'
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

    linz.loadLibraries = loadLibraries;
    linz.loadDatepicker = loadDatepicker;
    linz.isTemplateSupported = isTemplateSupported;
    linz.addDeleteConfirmation = addDeleteConfirmation;
    linz.addDisabledBtnAlert = addDisabledBtnAlert;
    linz.addConfigDefaultConfirmation = addConfigDefaultConfirmation;

})();
