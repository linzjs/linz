
function modelIndex () {

    var query = {
            sort: null
        },
        sortRegex = /sort=(.+)&?/,
        sort = window.location.search.match(sortRegex);

    if (sort) {
        query.sort = sort[1];
    }

    $('[data-sort-field]').click(function () {

        var sortField = $(this).attr('data-sort-field');

        if (query.sort === sortField) {
            sortField = '-' + sortField;
        }

        // update the query object, as that will be used to render the window.location string
        query.sort = sortField;

        // okay, let's update our page location
        updateLocation();

    });

    $('.control-delete').click(function () {

        if (confirm('Are you sure you want to this new record?')) {
            return true;
        }
        return false;

    });

    $('.control-checkAll').click(function () {

        var isChecked = $(this).is(':checked');
        $('.checked-record').prop('checked',isChecked);

    });

    $('.control-addFilter').click(function () {

        var filter = $(this),
            filterText = filter.html(),
            filterVal = filter.attr('data-filter-field'),
            filterFormControl = filter.siblings('.controlField'),
            aFilters;

        if (supportsTemplate) {

            var content = document.querySelector('#filter').content.cloneNode(true);

            // update template with filter content
            content.querySelector('.filterName').textContent = filterText;

            for (var i=0; i < filterFormControl[0].childNodes.length; i++) {

                // clone the child nodes for filter form control to add to the input group
                content.querySelector('.input-group').appendChild(filterFormControl[0].childNodes[i].cloneNode(true));

            }

            document.querySelector('.filter-list').appendChild(document.importNode(content, true));

        } else {

            // fallback support for browsers that don't support html5 template tag
            var filterOption = '<div class="row"><div class="col-md-5 col-xs-12"><div class="input-group"><div class="input-group-btn"><button class="btn btn-default filterName">' + filterText
                                + '<\/button><\/div>' + filterFormControl.html() + '<\/div></div></div>';

            $('.filter-list').append(filterOption);

        }

        // hide dropdown for 'Add filter'
        $(this).parents('li.dropdown').removeClass('open');

        var selectedFilters = $('input.selectedFilters').val();

        if (selectedFilters) {
            aFilters = $('input.selectedFilters').val().split();
        } else {
            aFilters = [];
        }

        aFilters.push(filterVal);

        $('input.selectedFilters').val(aFilters.join());

        return false;

    });

    function supportsTemplate() {
        return 'content' in document.createElement('template');
    }

    function updateLocation () {

        var queryString = '';

        // append sort if there is one
        if (query.sort) {
            queryString = 'sort=' + query.sort;
        }

        // add the required ?
        queryString = '?' + queryString;

        window.location = window.location.origin + window.location.pathname + queryString;

    }

}
