'use strict';

/* global $ */

$(function ready () {

    var modelSearch = $('.model-search');
    var searchInput = modelSearch.find('.search');
    var form = $('form.filters');
    var searchFilter = form.find('[name="searchfilter"]');
    var searchContent = form.find('[name="searchcontent"]');

    var getActiveFilterValue = function getActiveFilterValue () {
        return modelSearch.find('.active input').val();
    }

    var getActiveFilterType = function getActiveFilterType () {
        return modelSearch.find('option[value="' + getActiveFilterValue() + '"]').attr('data-filter-type');
    }

    var updateInputType = function updateInputType () {

        if (getActiveFilterType()) {

            searchInput.attr('type', getActiveFilterType());

            return searchInput.hide().show(0);

        }

        searchInput.attr('type', 'text');

        return searchInput.hide().show(0);

    }

    updateInputType();

    modelSearch.find('.multiselect-container').on('change', function change () {
        return updateInputType();
    });

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
