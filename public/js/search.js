'use strict';

/* global $ */

$(function ready () {

    var modelSearch = $('.model-search');

    var getActiveFilterValue = function getActiveFilterValue () {
        return modelSearch.find('.active input').val();
    }

    var searchInput = modelSearch.find('.search');
    var form = $('form.filters');
    var searchFilter = form.find('[name="searchfilter"]');
    var searchContent = form.find('[name="searchcontent"]');

    searchInput.on('keypress', function keypress (event) {

        // On 'Enter/return'
        if (event.which === 13) {
            return form.submit();
        }

    });

    form.on('submit', function submit () {

        searchFilter.val(getActiveFilterValue());
        searchContent.val(searchInput.val());

    });

});
