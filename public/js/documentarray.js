
$(document).ready(function () {

    var editingArray,
        editingObject,
        editingIndex,
        formHtml = {},
        editingFor,
        listTemplate,
        mode;

    var setLabel = function (document) {

        if (!document.label) {

             if (document.title) {
                document.label = document.title
            }

            if (document.firstName) {

                document.label = document.firstName;

                if (document.surname) {
                    document.label += ' ' + document.surname;
                }

                if (document.lastName) {
                    document.label += ' ' + document.lastName;
                }

            }

        }

        return document;

    };

    var drawDocuments = function (documentArrayInstance, documents) {

        // loop through each document and ensure there is a label
        for (var i = 0; i < documents.length; i++) {
            documents[i] = setLabel(documents[i]);
        }

        documents = { documents: documents };

        $('[data-document-field-for="' + documentArrayInstance + '"] .documents').html(listTemplate(documents));

        // now bind the documents, handle the edit button
        $('[data-document-field-for="' + documentArrayInstance + '"]').find('a[data-document-action="edit"]').click(function () {

            mode = 'editing';

            editingFor = documentArrayInstance;

            editingIndex = $(this).parent().attr('data-document-index');

            // now grab the array if there already is one and turn it into a JavaScript object
            editingArray = JSON.parse($('[data-document-field-for="' + documentArrayInstance + '"]').find('input[type="hidden"][name="' + documentArrayInstance + '"]').val());

            editingObject = editingArray[editingIndex];

            editDocument(documentArrayInstance);

        });

        // now bind the documents, handle the delete button
        $('[data-document-field-for="' + documentArrayInstance + '"]').find('a[data-document-action="remove"]').click(function () {

            mode = 'removing';

            editingFor = documentArrayInstance;

            editingIndex = $(this).parent().attr('data-document-index');

            // now grab the array if there already is one and turn it into a JavaScript object
            editingArray = JSON.parse($('[data-document-field-for="' + documentArrayInstance + '"]').find('input[type="hidden"][name="' + documentArrayInstance + '"]').val());

            editingObject = setLabel(editingArray[editingIndex]);

            removeDocument(documentArrayInstance);

        });

    };

    var editDocument = function (editingFor) {

        // apply the form to the modal
        $('#documentsModal .modal-body form').html(retrieveForm(editingFor)).binddata(editingObject);

        // apply the label to the modal
        $('#documentsModal .modal-title').html(retrieveLabel(editingFor));

        // update the form buttons to SAVE/CANCEL
        $('#documentsModal .modal-footer .btn-save').html('Save');
        $('#documentsModal .modal-footer .btn-cancel').html('Cancel');

        // initialize multiselect
        $('.multiselect').multiselect({
            buttonContainer: '<div class="btn-group btn-group-multiselect" />'
        });

        // add an edit class to the model
        $('#documentsModal .modal-dialog').addClass('edit');

        toggleModal();

        // prevent the button from submitting the form
        return false;

    };

    var removeDocument = function (editingFor) {

        $('#documentsModal .modal-body form').html(Handlebars.compile('Are you sure you would like to delete \'{{label}}\'?')(editingObject));

        // apply the label to the modal
        $('#documentsModal .modal-title').html(retrieveLabel(editingFor));

        // update the form buttons to YES/NO
        $('#documentsModal .modal-footer .btn-save').html('Yes');
        $('#documentsModal .modal-footer .btn-cancel').html('No');

        $('#documentsModal .modal-dialog').removeClass('edit');

        toggleModal();

        // prevent the button from submitting the form
        return false;

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

        reset();

        toggleModal();

    };

    var deleteDocument = function () {

        editingArray.splice(editingIndex, 1);

        // now grab the array if there already is one and turn it into a JavaScript object
        $('input[type="hidden"][name="' + editingFor + '"]').val(JSON.stringify(editingArray));

        // now update the view
        drawDocuments(editingFor, editingArray);

        reset();

        toggleModal();

    };

    var saveAction = function () {

        if (mode === 'editing') {
            saveDocument();
        } else {
            deleteDocument();
        }

    };

    var closeAction = function () {

        reset();

        toggleModal();

    };

    var reset = function () {

        editingFor = undefined;
        editingIndex = undefined;
        editingArray = undefined;
        editingObject = undefined;
        mode = undefined;

    };

    var toggleModal = function () {

        // popup the modal
        $('#documentsModal').modal('toggle');

    };

    var retrieveForm = function (editingFor) {

        if (!formHtml[editingFor]) {

            // now grab the form HTML
            formHtml[editingFor] = window.linz.templates['document-' + editingFor].clone().html();

        }

        return formHtml[editingFor];

    };

    var retrieveLabel = function (editingFor) {

        return $('[data-document-field-for="' + editingFor + '"]').attr('data-document-field-label');

    }

    // do we have any documentarrays to take care of?
    var daInstances = $('[data-document-field-for]');

    // if we have a document array, wire-up the close and save buttons
    if (daInstances) {

        $('#documentsModal .btn-save').click(saveAction);
        $('#documentsModal .btn-cancel').click(closeAction);
        $('#documentsModal button.close').click(closeAction);
        $('#documentsModal').on('shown.bs.modal', function (e) {
            $('#documentsModal').animate({ scrollTop: 0 }, 'fast');
        });

        listTemplate = Handlebars.compile($('template.document-array-list').clone().html());

    }

    daInstances.each(function (index, el) {

        var documentArrayInstance = $(el).attr('data-document-field-for');

        // handle the create button
        $('[data-document-field-for="' + documentArrayInstance + '"] [data-document-action="create"]').click(function (event) {

            var parentElem = $(event.target).closest('.documents-container');

            // clear out persitence fields
            editingObject = {};
            editingInstance = undefined;
            mode = 'editing';

            // which field are we editing for?
            editingFor = $(parentElem).attr('data-document-field-for');

            // now grab the array if there already is one and turn it into a JavaScript object
            editingArray = JSON.parse($(parentElem).children('input[type="hidden"][name="' + editingFor + '"]').val());

            // now pop the form
            editDocument(editingFor);

        });

        retrieveForm(documentArrayInstance);

        drawDocuments(documentArrayInstance, JSON.parse($(el).children('input[type="hidden"][name="' + documentArrayInstance + '"]').val()));

    });

});
