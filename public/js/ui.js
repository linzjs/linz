if (!linz) {
    var linz = {};
}

(function  () {

    function setFormDependencies(form, dependeeArr, dependantsObj){

        $(form).find('[data-linz-dependencies]').each( function() {

            var dependencies = $(this).data('linz-dependencies');
            var dependantField = $(this).attr('name');
            var dependeeName;
            var depnedeeIdentifyer;

            if (typeof dependencies === 'object' && !Array.isArray(dependencies)) {

                if (dependencies.field.length) {

                    dependeeName = dependencies.field;
                    depnedeeIdentifyer = '[name="' + dependeeName + '"]';

                    //Add dependee field name selector syntax to dependeeArr only if it does not exist
                    if (dependeeArr.indexOf(depnedeeIdentifyer) === -1) {
                        dependeeArr.push(depnedeeIdentifyer);

                        //Add the dependee filed name key to dependantsObj and assign an empty array to it
                        //will add names of filed which depends on dependee filed in to this empty array
                        dependantsObj[dependeeName] = [];
                    }

                    //Add name of dependant field into array of dependee key of dependantsObj only if it does not exist
                    if (dependantsObj[dependeeName].indexOf(dependantField) === -1) {
                        dependantsObj[dependeeName].push(dependantField);
                    }

                }

            } else if (typeof dependencies === 'object' && Array.isArray(dependencies)) {

                var strDependency = '';

                for (var i = 0; i < dependencies.length; i++) {

                    var v = dependencies[i];

                    if (v instanceof Array) {

                        for (var j = 0; j < v.length; j++) {

                            if (v[j].field.length) {

                                dependeeName = v[j].field;
                                depnedeeIdentifyer = '[name="' + dependeeName.field + '"]';

                                //Add dependee field name selector syntax to dependeeArr only if it does not exist
                                if (dependeeArr.indexOf(depnedeeIdentifyer) === -1) {
                                    dependeeArr.push(depnedeeIdentifyer);

                                    //Add the dependee filed name key to dependantsObj and assign an empty array to it
                                    //will add names of filed which depends on dependee filed in to this empty array
                                    dependantsObj[dependeeName] = [];
                                }

                                //Add name of dependant field into array of dependee key of dependantsObj only if it does not exist
                                if (dependantsObj[dependeeName].indexOf(dependantField) === -1) {
                                    dependantsObj[dependeeName].push(dependantField);
                                }

                            }

                        }

                    } else {

                        if (v.field.length) {

                            dependeeName = v.field;
                            depnedeeIdentifyer = '[name="' + dependeeName + '"]';

                            //Add dependee field name selector syntax to dependeeArr only if it does not exist
                            if (dependeeArr.indexOf(depnedeeIdentifyer) === -1) {
                                dependeeArr.push(depnedeeIdentifyer);

                                //Add the dependee filed name key to dependantsObj and assign an empty array to it
                                //will add names of filed which depends on dependee filed in to this empty array
                                dependantsObj[dependeeName] = [];
                            }

                            //Add name of dependant field into array of dependee key of dependantsObj only if it does not exist
                            if (dependantsObj[dependeeName].indexOf(dependantField) === -1) {
                                dependantsObj[dependeeName].push(dependantField);
                            }

                        }

                    }
                }
            }

        });
    }

    $(document).ready(function () {

        // javascript events for the navigation
        $('[data-linz-nav-toggle]').click(function () {

            // scroll back to the top
            $('body').animate({scrollTop:0}, 200, 'swing', function () {
                // show the navigation
                $('body').toggleClass('show-nav');
            });

        });



        // $('form[data-linz-validation="true"]'). bootstrapValidator({});

        $('form[data-linz-validation="true"]').each( function() {

            var dependeeArr = [];
            var dependantsObj = {};
            var thisFrom = $(this);

            // workout which fields require linz-dependency validation
            setFormDependencies($(this), dependeeArr, dependantsObj);

            // add form validation
            $(this).bootstrapValidator({})
            //bind keyup event on dependee fileds
            .on('keyup', dependeeArr.join(), dependantsObj, function (e) {

                var eventElm = $(this).attr('name');
                var data = e.data;

                //on fire of keyup event on dependee filed, call revalidateField for fields that depends on the depndee fied
                if (data.hasOwnProperty(eventElm)) {

                    for (var i = 0; i < data[eventElm].length; i++) {

                        if (data[eventElm][i].length) {

                            $(thisFrom).bootstrapValidator('revalidateField', data[eventElm][i]);
                        }
                    }
                }

            });

        });


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

    });

    function loadLibraries(path) {

        // resource loader for fallback support
        Modernizr.load([
            {
                test: Modernizr.inputtypes.date,
                nope: [
                    path + '/public/js/bootstrap-datetimepicker.min.js',
                    path + '/public/css/bootstrap-datetimepicker.min.css'
                ],
                complete : function () {
                    loadDatepicker();
                }
            }
        ]);

    }

    function loadDatepicker() {

        if (!Modernizr.inputtypes.date) {

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

    function formDependencyValidation (value, validator, $field) {
        console.log('== form linz-dependency validator');
        // console.log(arguments);
        console.log();

        var dependencies = $field.data('linz-dependencies');

        // check if contains anything

        console.log(validator.$form);

console.log($field.data('linz-dependencies'));


        // what to do if's an Object
        // what to do if's an Array
            // what to do if's an Object
            // what to do if's an Array

        return ($('[name="lastName"]').val() === 'Patel') ? true : (value !== '');
    }


    linz.loadLibraries = loadLibraries;
    linz.loadDatepicker = loadDatepicker;
    linz.isTemplateSupported = isTemplateSupported;
    linz.addDeleteConfirmation = addDeleteConfirmation;
    linz.addDisabledBtnAlert = addDisabledBtnAlert;
    linz.addConfigDefaultConfirmation = addConfigDefaultConfirmation;
    linz.formDependencyValidation = formDependencyValidation;

})();
