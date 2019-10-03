(function detachTemplates(d) {
    var templates = {};

    // loop through and remove template tags from the dom, if they've been marked up with data-linz-template
    $('[data-linz-template]').each(function() {
        var id = $(this).data('linz-template');

        if (id) {
            templates[id] = $(this).detach();
        }
    });

    if (!window.linz) {
        window.linz = {};
    }

    window.linz.templates = templates;
})(document);
