
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