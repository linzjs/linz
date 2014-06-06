
$(document).ready(function () {

    var editingArray,
        editingObject,
        editingIndex,
        formHtml = {},
        editingFor,
        listTemplate;

    var drawDocuments = function (documentArrayInstance, documents) {

        // loop through each document and ensure there is a label
        for (var i = 0; i < documents.length; i++) {

            var d = documents[i];

            if (!d.label) {

                 if (d.title) {
                    d.label = d.title
                }

                if (d.firstName) {

                    d.label = d.firstName;

                    if (d.surname) {
                        d.label += ' ' + d.surname;
                    }

                    if (d.lastName) {
                        d.label += ' ' + d.lastName;
                    }

                }

            }

        }

        documents = { documents: documents };

        $('[data-document-field-for="' + documentArrayInstance + '"] .documents').html(listTemplate(documents));

    };

    var editDocument = function (editingForm) {

        $('#documentsModal .modal-body form').html(formHtml[editingFor]).binddata(editingObject);

        toggleModal();

        // prevent the button from submitting the form
        return false;

    };

    var closeDocument = function () {

        toggleModal();

    };

    var saveDocument = function () {

        if (editingIndex === undefined) {
            editingArray.push(editingObject);
        } else {
            editingArray[editingIndex] = editingObject;
        }

        // now grab the array if there already is one and turn it into a JavaScript object
        $('input[type="hidden"][name="' + editingFor + '"]').val(JSON.stringify(editingArray));

        // now update the view
        drawDocuments(editingFor, editingArray);

        toggleModal();

    };

    var toggleModal = function () {

        // popup the modal
        $('#documentsModal').modal('toggle');

    };

    // do we have any documentarrays to take care of?
    var daInstances = $('[data-document-field-for]');

    // if we have a document array, wire-up the close and save buttons
    if (daInstances) {

        $('#documentsModal .btn-save').click(saveDocument);
        $('#documentsModal .btn-cancel').click(closeDocument);

        listTemplate = Handlebars.compile($('template.document-array-list').clone().html());

    }

    daInstances.each(function (index, el) {

        var documentArrayInstance = $(el).attr('data-document-field-for');

        // handle the create button
        $(el, '[data-document-action="create"]').click(function () {

            // clear out persitence fields
            editingObject = {};
            editingInstance = undefined;

            // which field are we editing for?
            editingFor = $(this).attr('data-document-field-for');

            // now grab the array if there already is one and turn it into a JavaScript object
            editingArray = JSON.parse($(this).children('input[type="hidden"][name="' + editingFor + '"]').val());

            // now grab the form HTML
            formHtml[editingFor] = $(this).children('template').clone().html();

            // now pop the form
            editDocument(editingFor);

        });

        drawDocuments(documentArrayInstance, JSON.parse($(el).children('input[type="hidden"][name="' + documentArrayInstance + '"]').val()));

    });

});
