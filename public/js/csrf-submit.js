'use strict';

var insertToken = function () {

    $('form').each(function() {

        var tokenInput = document.createElement('input');

        tokenInput.type = 'hidden';
        tokenInput.name = '_csrf';
        tokenInput.value = $('meta[name=csrf-token]').attr('content');

        if ($(this).find('input[name="_csrf"]').length) {
            $(this).find('input[name="_csrf"]').replaceWith(tokenInput);
        }

        $(this).prepend(tokenInput);

    });

};

linz.addLoadEvent(function () {

    insertToken();

    // Update whenever a new form is loaded
    $('#linzModal, #groupActionModal, #recordActionModal, #exportModal, #documentsModal').on('shown.bs.modal', function (e) {
        insertToken();
    });

});
