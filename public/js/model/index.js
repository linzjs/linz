(function () {

    var filtersAreDirty = false;

    /* FILTERS */

    if ($('.selectedFilters').length && $('.selectedFilters').val().length > 0) {
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

    function renderFilter (filter) {

        var filterText = filter.html(),
            filterVal = filter.attr('data-filter-field'),
            filterFormControl = filter.siblings('.controlField').html(),
            aFilters;

        if (linz.isTemplateSupported()) {

            var content = document.querySelector('#filter').content.cloneNode(true);

            // update template with filter content
            content.querySelector('.filter-name').textContent = filterText;
            content.querySelector('.filter-control').innerHTML = content.querySelector('.filter-control').innerHTML + filterFormControl;
            content.querySelector('.fa-times').setAttribute('data-filter-field', filter.attr('data-filter-field'));
            document.querySelector('.filter-list').appendChild(document.importNode(content, true));

        } else {

            // fallback support for browsers that don't support html5 template tag
            var filterOption = $('#filter').clone();
            filterOption.find('.filter-name').html(filterText);
            filterOption.find('.filter-control').append(filterFormControl);
            filterOption.find('.fa-times').attr('data-filter-field', filter.attr('data-filter-field'));
            $('.filter-list').append(filterOption.html());

        }

        // determine if a multiselect was added to the dom, if so, apply the plugin
        $('.multiselect', $('.filter-list').children().last()).multiselect({
            buttonContainer: '<div class="btn-group btn-group-multiselect" />'
        });

        // hide dropdown for 'Add filter'
        filter.parents('.dropdown').removeClass('open');

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

    }

    function doesFilterExist (name) {

        return $('.filter-list').children().find('input[name^=' + name + ']', 'select[name^=' + name + ']').length > 0;

    }

    $('.control-addFilter').click(function () {

        if ($(this).parent().is('.disabled')) {
            return;
        }

        return renderFilter($(this));

    });

    // Handle once filters.
    (function () {

        var onceFilters = $('a[data-filter-once="true"]');

        onceFilters.on('click', function () {
            return $(this).parent().addClass('disabled');
        });

    })();

    // Render alwaysOn filters.
    (function () {

        var alwaysOnFilters = $('a[data-filter-alwayson="true"]'),
            disabled = [];

        alwaysOnFilters.each(function (index) {

            if ($(this).attr('data-filter-once') === 'true') {

                if (!$('.filter-list [data-filter-field="' + $(this).attr('data-filter-field') + '"]').length) {
                    renderFilter($(this));
                }

                $(this).remove();

                return $('.filter-list [data-filter-field="' + $(this).attr('data-filter-field') + '"]').css('visibility', 'hidden');

            }

            if(!doesFilterExist($(this).attr('data-filter-field'))) {
                renderFilter($(this));
            }

            return $('.filter-list [data-filter-field="' + $(this).attr('data-filter-field') + '"]').slice(0,1).css('visibility', 'hidden');

        });

    })();

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

        $('#groupActionModal').modal().find('.modal-content').load(url, function () {});

       return false;
    });

    // bind record action buttons
    $('[data-linz-control="record-action"]').click(function () {

        var queryObj = $(this),
            url = queryObj.attr('href');

        $('#recordActionModal').modal().find('.modal-content').load(url, function () {});

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
        $(_this).find('form[data-linz-validation="true"]').bootstrapValidator({});

    });

    // bind model save button
    $('#recordActionModal').on('shown.bs.modal', function (e) {

        var _this = this;

        // add form validation
        $(_this).find('form[data-linz-validation="true"]').bootstrapValidator({});

    });

    // bind export button
    $('[data-linz-control="export"]').click(function (event) {

        // stop the href navigation
        event.preventDefault();

        var queryObj = $(this),
            url = queryObj.attr('href'),
            useModal = (queryObj.attr('data-target') === "#exportModal");

        if (useModal) {

            var modal = $('#exportModal');
            modal.attr('data-linz-export-url', url);
            modal.modal();

            return false;

        }

        // retrieve the ids
        var selectedIds = $('input[data-linz-control="checked-record"]:checked').map(function () {
            return $(this).val();
        }).get();

        // construct the form
        var form = document.createElement('form');
        form.method = 'post';
        form.action = url;

        var inputFilters = document.createElement('input');
        inputFilters.type = 'hidden';
        inputFilters.name = 'filters';
        inputFilters.value = $('#modelQuery').html();

        var inputSelectedIds = document.createElement('input')
        inputSelectedIds.type = 'hidden';
        inputSelectedIds.name = 'selectedIds';
        inputSelectedIds.value = selectedIds.join(',');

        var inputModelName = document.createElement('input');
        inputModelName.type = 'hidden';
        inputModelName.name = 'modelName';
        inputModelName.value = $('[data-linz-model]').attr('data-linz-model');

        // append to the form
        form.appendChild(inputFilters);
        form.appendChild(inputSelectedIds);
        form.appendChild(inputModelName);

        // append form to body
        document.body.appendChild(form);

        // submit the form
        form.submit();

        return false;

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

            $('[data-filter-field="' + filteredField + '"]').parent().removeClass('disabled');

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

        // is there a filter submit button?
        // model indexes without filters don't have them
        if ($('.filters').find(':submit').length) {

            // click the button
            $('.filters').find(':submit').click();

            // add spinning icon to Filter dropdown to indicate page is loading
            var icon = $('.addFilterBtn').find('.fa-filter');
            icon.removeClass('fa-filter');
            icon.addClass('fa-spinner fa-spin');

            return;

        }

        // click the button
        $('.filters').submit();

    }

    // add spinning icon when submit button is click
    $('.filters').find(':submit').click(function () {
        // check html5 form validation
        if ($('.filters')[0].checkValidity()) {
            $(this).append(' <i class="fa fa-spinner fa-spin"></i>');
        }
    });

})();
