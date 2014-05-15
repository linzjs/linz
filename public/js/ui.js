
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

        var selectedTxt = $(this).html(),
            selectedVal = $(this).attr('data-filter-field'),
            selectOptions = $(this).parents('ul').html();

        var filterOption = '<div class="input-group"><div class="input-group-btn"><button class="btn btn-default">' + selectedTxt
                            + '</button><button data-toggle="dropdown" class="btn btn-default dropdown-toggle"><span class="caret"></span></button>'
                            + '<ul role="menu" class="dropdown-menu">'
                            + selectOptions
                            + '</ul></div><input type="text" class="form-control"></div>';

        return false;

    })

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
