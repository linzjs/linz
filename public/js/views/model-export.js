/* global $ */
$(function ready() {
    var modal = $('#exportModal');

    modal.on('show.bs.modal', function() {
        var url = $(this).attr('data-linz-export-url');

        $(this)
            .find('.modal-content')
            .load(url, function() {
                var user = $('body').attr('data-linz-user');

                var fields = JSON.parse(
                        $('.exportForm').attr('data-model-export-fields')
                    ),
                    exportCookieName =
                        user +
                        '_' +
                        $('.exportForm').attr('data-model-name') +
                        '_' +
                        'selectedExportFields',
                    savedFields = mergeFields(
                        getCookie(exportCookieName),
                        fields
                    ),
                    bSelectAll = true;

                var createHiddenInput = function(name, element) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.setAttribute('data-linz-export', element);
                    $('.exportForm').prepend(input);
                };

                if (!$('.exportForm').find('[name="selectedIds"]').length) {
                    createHiddenInput('selectedIds', 'ids');
                }

                if (!$('.exportForm').find('[name="selectedFields"]').length) {
                    createHiddenInput('selectedFields', 'fields');
                }

                if (!$('.exportForm').find('[name="filters"]').length) {
                    createHiddenInput('filters', 'filters');
                }

                drawExportList(savedFields);

                var selectedIDs = [];

                $('input[data-linz-control="checked-record"]:checked').each(
                    function() {
                        selectedIDs.push($(this).val());
                    }
                );

                // add selected IDs to hidden field
                $('[data-linz-export="ids"]', 'form.exportForm').val(
                    selectedIDs
                );

                // add model form post data for filtering purposes
                $('[data-linz-export="filters"]', 'form.exportForm').val(
                    $('#modelQuery').html()
                );

                $('[data-linz-control="checked-all"]', $('.exportForm')).click(
                    function() {
                        $(
                            'input[data-linz-control="export-field"]',
                            $('.exportForm')
                        ).prop('checked', bSelectAll);

                        bSelectAll = !bSelectAll;

                        if (bSelectAll) {
                            $(this)
                                .find('b')
                                .html('all');
                        } else {
                            $(this)
                                .find('b')
                                .html('none');
                        }
                    }
                );

                $('[data-linz-control="reset-export"]', $('.exportForm')).click(
                    function() {
                        var defaultFields = mergeFields('', fields);
                        drawExportList(defaultFields);
                        addExportFieldsToCookies();
                    }
                );

                $('[data-linz-control="export-save"]', $('.exportForm')).click(
                    function() {
                        if (
                            !$(
                                'input[data-linz-control="export-field"]:checked',
                                $('.exportForm')
                            ).length
                        ) {
                            alert(
                                'Please select one or more fields from below to export.'
                            );
                            return false;
                        }

                        // close modal
                        modal.modal('hide');

                        return true;
                    }
                );

                $('.exportFields').sortable({
                    update: function(event, ui) {
                        addExportFieldsToCookies();
                    },
                });

                $('.exportForm').submit(function(event) {
                    $('[data-linz-export="fields"]').val(
                        getSelectedExportFields().join()
                    );
                });

                function drawExportList(list) {
                    var html = '';

                    list.forEach(function(field) {
                        html +=
                            '<li class="list-group-item">' +
                            '<div class="checkbox">' +
                            '<label>' +
                            '<input type="checkbox" value="' +
                            field.value +
                            '" data-linz-control="export-field"' +
                            (field.selected ? ' checked' : '') +
                            '> ' +
                            field.label;
                    });

                    $('.exportFields').html(html);

                    $(
                        'input[data-linz-control="export-field"]',
                        $('.exportForm')
                    ).click(function() {
                        addExportFieldsToCookies();

                        var selectedFields = mergeFields(
                            getCookie(exportCookieName),
                            fields
                        );
                        drawExportList(selectedFields);
                    });
                }

                function getSelectedExportFields() {
                    var selectedFields = [];

                    $(
                        'input[data-linz-control="export-field"]:checked',
                        $('.exportForm')
                    ).each(function() {
                        selectedFields.push($(this).val());
                    });

                    return selectedFields;
                }

                function addExportFieldsToCookies() {
                    setCookie(exportCookieName, getSelectedExportFields(), 30);
                }

                function mergeFields(selections, master) {
                    var mergedFields = [];

                    if (selections.length) {
                        selections = selections.split(',');

                        selections.forEach(function(fieldName) {
                            mergedFields.push({
                                label: master[fieldName] || fieldName,
                                value: fieldName,
                                selected: true,
                            });
                        });
                    }

                    Object.keys(master).forEach(function(fieldName) {
                        if (selections.indexOf(fieldName) >= 0) {
                            // field exists, exit!
                            return;
                        }

                        mergedFields.push({
                            label: master[fieldName] || fieldName,
                            value: fieldName,
                            selected: false,
                        });
                    });

                    return mergedFields;
                }

                function setCookie(cname, cvalue, exdays) {
                    var d = new Date();
                    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
                    var expires = 'expires=' + d.toGMTString();
                    document.cookie = cname + '=' + cvalue + '; ' + expires;
                }

                function getCookie(cname) {
                    var name = cname + '=';
                    var ca = document.cookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') c = c.substring(1);
                        if (c.indexOf(name) != -1)
                            return c.substring(name.length, c.length);
                    }
                    return '';
                }
            });
    });
});
