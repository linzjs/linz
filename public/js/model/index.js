(function () {

    var filtersAreDirty = false;

    /* FILTERS */

    if ($('.selectedFilters').val().length > 0) {
        toggleFilterBox('show');
    }

    $('[data-sort-field]').click(function () {

        var sort = $('.selectedSort').val(),
            sortField = $(this).attr('data-sort-field');

        if (sort === sortField) {
            sortField = '-' + sortField;
        }

        // update hidden sort field in the filter form
        $('.selectedSort').val(sortField);

        filtersAreDirty = true;

        triggerSubmit();

        return true;

    });

    $('form.filters button[type="submit"]').click(function (event) {

        // reset the pagination if required
        if (filtersAreDirty || event.isTrigger === undefined) {
            $('input.page').val(1);
        }

    });

    $('.control-addFilter').click(function () {

        var filter = $(this),
            filterText = filter.html(),
            filterVal = filter.attr('data-filter-field'),
            filterFormControl = filter.siblings('.controlField').html(),
            aFilters;

        if (linz.isTemplateSupported()) {

            var content = document.querySelector('#filter').content.cloneNode(true);

            // update template with filter content
            content.querySelector('.filter-name').textContent = filterText;
            content.querySelector('.filter-control').innerHTML = content.querySelector('.filter-control').innerHTML + filterFormControl;
            content.querySelector('.fa-times').setAttribute('data-filter-field', $(this).attr('data-filter-field'));
            document.querySelector('.filter-list').appendChild(document.importNode(content, true));

        } else {

            // fallback support for browsers that don't support html5 template tag
            var filterOption = $('#filter').clone();
            filterOption.find('.filter-name').html(filterText);
            filterOption.find('.filter-control').append(filterFormControl);
            filterOption.find('.fa-times').attr('data-filter-field',$(this).attr('data-filter-field'));
            $('.filter-list').append(filterOption.html());

        }

        // determine if a multiselect was added to the dom, if so, apply the plugin
        $('.multiselect', $('.filter-list').children().last()).multiselect({
            buttonContainer: '<div class="btn-group btn-group-multiselect" />',
            onChange: function (element, checked) {
                $(element).parents('form').bootstrapValidator('revalidateField', $(element).parents('select'));
            }
        });

        var formControls = $('.filter-list').children().last().find('.form-control,input[type="checkbox"],input[type="radio"]').not(function (index, element) {
            return $(element).parents('ul.multiselect-container').length > 0;
        });

        // retrieve only the names of the controls to add
        if (formControls.length) {

            var uniqueNames = getUniqueFormControlNames(formControls);

            uniqueNames.forEach(function (val, index, array) {
                $('form.filters').bootstrapValidator('addField', val);
            });

        }

        // hide dropdown for 'Add filter'
        $(this).parents('.dropdown').removeClass('open');

        var selectedFilters = $('.selectedFilters').val();

        if (selectedFilters) {
            aFilters = $('.selectedFilters').val().split();
        } else {
            aFilters = [];
        }

        // only add the filter once
        if (aFilters.indexOf(filterVal) < 0) {
            aFilters.push(filterVal);
        }

        $('.selectedFilters').val(aFilters.join());

        filtersAreDirty = true;

        toggleFilterBox('show');

        assignRemoveButton();
        linz.loadDatepicker();

        return false;

    });

    assignRemoveButton();

    /* PAGINATION */

    $('select.pagination').change(function () {
        $('input.page').val($(this).val());
        triggerSubmit();
    });

    /* PAGE SIZE */

    $('select.pagination-size').change(function () {
        $('input.pageSize').val($(this).val());
        filtersAreDirty = true;
        triggerSubmit();
    });

    /* GROUP ACTIONS */

    $('input[data-linz-control="checked-all"]').click(function () {

        var isChecked = $(this).is(':checked');

        $('input[data-linz-control="checked-record"]').prop('checked',isChecked);

    });

    // bind event for check-all checkbox to show group action buttons
    $('input[data-linz-control="checked-all"]').click(function () {

        if ($(this).is(':checked')) {
            return $('.group-actions').removeClass('hidden');
        }

        $('.group-actions').addClass('hidden');

    });

    // bind event to checkboxes to show group action buttons when checked
    $('input[data-linz-control="checked-record"]').click(function () {

        if ($(this).is(':checked')) {
            return $('.group-actions').removeClass('hidden');
        }

        // check if any of the other checkboxes are checked
        if ($('input[data-linz-control="checked-record"]:checked').length) {
            return;
        }

        // since none are checked, let's close group action buttons
        $('.group-actions').addClass('hidden');

    });

    // bind group action buttons
    $('[data-linz-control="group-action"]').click(function () {

        var queryObj = $(this),
            url = queryObj.attr('href');

        $('#groupActionModal').modal().find('.modal-dialog').load(url, function () {});

       return false;
    });

    // bind model save button and update the selected ids to modal form
    $('#groupActionModal').on('shown.bs.modal', function (e) {

        var selectedIDs = [],
            _this = this;

        $('input[data-linz-control="checked-record"]:checked').each(function () {
            selectedIDs.push($(this).val());
        });

        // add selected IDs to hidden field
        $(_this).find('[data-group-action="ids"]').val(selectedIDs);

        // add form validation
        $(_this).find('form').bootstrapValidator({});

    });

    // bind export button
    $('[data-linz-control="export"]').click(function () {

        var queryObj = $(this),
            url = queryObj.attr('href');

        $('#exportModal').modal().find('.modal-dialog').load(url, function () {});

        return false;

    });

    // bind model save button and update the selected ids to modal form
    $('#exportModal').on('shown.bs.modal', function (e) {

        var selectedIDs = [],
            _this = this;

        $('input[data-linz-control="checked-record"]:checked').each(function () {
            selectedIDs.push($(this).val());
        });

        // add selected IDs to hidden field
        $(_this).find('[data-export="ids"]').val(selectedIDs);

        // add model form post data for filtering purposes
        $(_this).find('[data-export="modelQuery"]').val($('#modelQuery').html());

    });


    function removeFomList (list, value, separator) {
        separator = separator || ",";
        var values = list.split(separator);

        for(var i = 0 ; i < values.length ; i++) {
            if(values[i] === value) {
                values.splice(i, 1);
                return values.join(separator);
            }
        }

        return list;

    }

    function assignRemoveButton (queryObj) {

        // remove all event listener
        $('.fa-times').unbind();

        // re-assign listeners including any new ones added to DOM after page load
        $('.fa-times').click(function () {

            var filteredField = $(this).attr('data-filter-field'),
                selectedFilters = $('.selectedFilters').val(),
                numOfSameFilters = $('.fa-times[data-filter-field=' + filteredField + ']').length;

            filtersAreDirty = true;

            // ensure there are no multiple filters on the same field, before removing it from the list
            if (numOfSameFilters <= 1) {

                selectedFilters = removeFomList(selectedFilters, filteredField)

                $('.selectedFilters').val(selectedFilters);

                if (selectedFilters.length <= 0) {
                    toggleFilterBox();
                    // since there are no filters, let's post the form to clear all filters except the sorting
                    // submit the form and reset the pagination
                    triggerSubmit();
                }

            }

            // remove each .form-control
            $(this).parents('.form-group').find('.form-control').each(function () {
                $('form.filters').bootstrapValidator('removeField', $(this).eq(0));
            });

            var formControls = $(this).parents('.form-group').find('.form-control,input[type="checkbox"],input[type="radio"]').not(function (index, element) {
                // don't include it, if it has an attribute name of multiselect
                return $(element).parents('ul.multiselect-container').length > 0;
            });

            // retrieve only the names of the controls to add
            if (formControls.length) {

                var uniqueIds = getUniqueFormControlNames(formControls);

                uniqueIds.forEach(function (val, index, array) {
                    $('form.filters').bootstrapValidator('removeField', val);
                });

            }

            $(this).parents('.form-group').remove();

        });
    }

    function toggleFilterBox(showOrHide) {
        if (showOrHide) {
            $('.filters').show();
        } else {
            $('.filters').hide();
        }
    }

    // trigger a click of the 'filter' button
    function triggerSubmit () {

        // click the button
        $('.filters').find(':submit').click();

    }

    // given a jquery set, will return an array of unique form control names
    function getUniqueFormControlNames (fc) {

        var uniqueNames = [];

        var names = fc.map(function () {
            return this.name;
        }).get();

        // retrieve only the uniqueNames
        names.forEach(function (val, index, array) {
            if (uniqueNames.indexOf(val) < 0) {
                uniqueNames.push(val);
            }
        });

        return uniqueNames;

    }

})();
