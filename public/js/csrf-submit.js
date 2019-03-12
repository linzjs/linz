'use strict';

var insertCSRFToken = function (form) {

    if (!form) {
        return;
    }

    $(form).each(function() {

        // Now enable anything with data-linz-csrf-required, within form

        var tokenInput = document.createElement('input');

        tokenInput.type = 'hidden';
        tokenInput.name = '_csrf';
        tokenInput.value = $('meta[name=csrf-token]').attr('content');

        if ($(this).find('input[name="_csrf"]').length) {
            $(this).find('input[name="_csrf"]').replaceWith(tokenInput);
        }

        $(this).prepend(tokenInput);

        $('[data-linz-csrf-required]', this).removeClass('disabled');
        $('[data-linz-csrf-required]', this).removeAttr('disabled');

    });


};

var findAForm = function (node) {

    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'form') {
        insertCSRFToken(node);
    }

    if (node.children) {

        for (var child of node.children) {
            findAForm(child);
        }

    }

  }

var mutated = function (mutationsList, observer) {

    for (var mutation of mutationsList) {

        if (mutation.type === 'childList' && mutation.addedNodes.length && !mutation.removedNodes.length) {

            for (var node of mutation.addedNodes) {

                findAForm(node);

            }

        }

    }

}

document.addEventListener('DOMContentLoaded', function () {

    var mutationObserver = new MutationObserver(mutated);

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });

    findAForm(document.body);

});
