!function($) {

    function DocumentArray() {

        this.editingArray = undefined;
        this.editingObject = undefined;
        this.editingIndex = undefined;
        this.formHtml = {};
        this.editingFor = undefined;
        this.listTemplate = undefined;

    }

    DocumentArray.prototype.setLabel = function (document) {

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

    DocumentArray.prototype.drawDocuments = function (documentArrayInstance, documents) {

        var da = this,
            setLabel = this.setLabel;

        // check if there is a custom setLabel for this documentarray
        if ($('[data-document-field-for="' + documentArrayInstance + '"]').attr('data-document-set-label') !== undefined) {
            setLabel = linz.documents[documentArrayInstance + 'SetLabel'];
        }

        // loop through each document and ensure there is a label
        for (var i = 0; i < documents.length; i++) {
            documents[i] = setLabel(documents[i]);
        }

        documents = { documents: documents };

        $('[data-document-field-for="' + documentArrayInstance + '"] .documents').html(this.listTemplate(documents));

        if (da.canEdit) {

            // now bind the documents, handle the edit button
            $('[data-document-field-for="' + documentArrayInstance + '"]').find('a[data-document-action="edit"]').click(function () {

                $('#documentsModal .edit-actions .btn-save').unbind('click');
                $('#documentsModal .edit-actions .btn-cancel').unbind('click');
                $('#documentsModal .delete-actions .btn-save').unbind('click');
                $('#documentsModal .delete-actions .btn-cancel').unbind('click');
                $('#documentsModal button.close').unbind('click');

                $('#documentsModal .edit-actions .btn-save').click(function () {  da.saveAction(); });
                $('#documentsModal .edit-actions .btn-cancel').click(function () { da.closeAction(); });
                $('#documentsModal .delete-actions .btn-save').click(function () {  da.deleteAction(); });
                $('#documentsModal .delete-actions .btn-cancel').click(function () { da.closeAction(); });
                $('#documentsModal button.close').click(function () { da.closeAction(); });

                da.editingFor = documentArrayInstance;

                da.editingIndex = $(this).parent().attr('data-document-index');

                // now grab the array if there already is one and turn it into a JavaScript object
                da.editingArray = JSON.parse($('[data-document-field-for="' + documentArrayInstance + '"]').find('input[type="hidden"][name="' + documentArrayInstance + '"]').val());

                da.editingObject = da.editingArray[da.editingIndex];

                da.editDocument(documentArrayInstance);

            });

        }

        if (da.canDelete) {

            // now bind the documents, handle the delete button
            $('[data-document-field-for="' + documentArrayInstance + '"]').find('a[data-document-action="remove"]').click(function () {

                $('#documentsModal .edit-actions .btn-save').unbind('click');
                $('#documentsModal .edit-actions .btn-cancel').unbind('click');
                $('#documentsModal .delete-actions .btn-save').unbind('click');
                $('#documentsModal .delete-actions .btn-cancel').unbind('click');
                $('#documentsModal button.close').unbind('click');

                $('#documentsModal .edit-actions .btn-save').click(function () {  da.saveAction(); });
                $('#documentsModal .edit-actions .btn-cancel').click(function () { da.closeAction(); });
                $('#documentsModal .delete-actions .btn-save').click(function () {  da.deleteAction(); });
                $('#documentsModal .delete-actions .btn-cancel').click(function () { da.closeAction(); });
                $('#documentsModal button.close').click(function () { da.closeAction(); });

                da.editingFor = documentArrayInstance;

                da.editingIndex = $(this).parent().attr('data-document-index');

                // now grab the array if there already is one and turn it into a JavaScript object
                da.editingArray = JSON.parse($('[data-document-field-for="' + documentArrayInstance + '"]').find('input[type="hidden"][name="' + documentArrayInstance + '"]').val());

                da.editingObject = da.setLabel(da.editingArray[da.editingIndex]);

                da.removeDocument(documentArrayInstance);

            });

        }

    };

    DocumentArray.prototype.redrawDocuments = function (editingFor) {

        this.drawDocuments(editingFor, JSON.parse($('input[type="hidden"][name="' + editingFor + '"]').val()));

    };

    DocumentArray.prototype.editDocument = function (editingFor) {

        // apply the form to the modal
        $('#documentsModal .modal-body form').html(this.retrieveForm(editingFor)).binddata(this.editingObject);

        // apply the label to the modal
        $('#documentsModal .modal-title').html(this.retrieveLabel(editingFor));

        // initialize multiselect
        $('#documentsModal .multiselect').multiselect({
            buttonContainer: '<div class="btn-group btn-group-multiselect" />'
        });

        // Switch the footer buttons considering the context.
        $('#documentsModal .modal-footer .edit-actions').show();
        $('#documentsModal .modal-footer .delete-actions').hide();

        // add an edit class to the model
        $('#documentsModal .modal-dialog').addClass('edit');

        this.toggleModal();

        // prevent the button from submitting the form
        return false;

    };

    DocumentArray.prototype.removeDocument = function (editingFor) {

        $('#documentsModal .modal-body form').html(Handlebars.compile('Are you sure you would like to delete \'{{label}}\'?')(this.editingObject));

        // apply the label to the modal
        $('#documentsModal .modal-title').html(this.retrieveLabel(editingFor));

        // Switch the footer buttons considering the context.
        $('#documentsModal .modal-footer .edit-actions').hide();
        $('#documentsModal .modal-footer .delete-actions').show();

        $('#documentsModal .modal-dialog').removeClass('edit');

        this.toggleModal();

        // prevent the button from submitting the form
        return false;

    };

    DocumentArray.prototype.saveDocument = function () {

        if (this.editingIndex === undefined) {
            this.editingArray.push(this.editingObject);
        } else {
            this.editingArray[this.editingIndex] = this.editingObject;
        }

        // now grab the array if there already is one and turn it into a JavaScript object
        $('input[type="hidden"][name="' + this.editingFor + '"]').val(JSON.stringify(this.editingArray));

        // now update the view
        this.drawDocuments(this.editingFor, this.editingArray);

        this.reset();

        this.toggleModal();

    };

    DocumentArray.prototype.deleteDocument = function () {

        this.editingArray.splice(this.editingIndex, 1);

        // now grab the array if there already is one and turn it into a JavaScript object
        $('input[type="hidden"][name="' + this.editingFor + '"]').val(JSON.stringify(this.editingArray));

        // now update the view
        this.drawDocuments(this.editingFor, this.editingArray);

        this.reset();

        this.toggleModal();

    };

    DocumentArray.prototype.saveAction = function () {

        var validator = $('#documentsModal .modal-body form').data('bootstrapValidator');

        // Validate the form.
        validator.validate();

        // // Check that everything is valid before saving.
        if (validator.isValid()) {
            this.saveDocument();
        }

    };

    DocumentArray.prototype.deleteAction = function () {

        this.deleteDocument();

    };

    DocumentArray.prototype.closeAction = function () {

        this.reset();

        this.toggleModal();

    };

    DocumentArray.prototype.reset = function () {

        this.editingFor = undefined;
        this.editingIndex = undefined;
        this.editingArray = undefined;
        this.editingObject = undefined;

    };

    DocumentArray.prototype.toggleModal = function () {

        // popup the modal
        $('#documentsModal').modal('toggle');

    };

    DocumentArray.prototype.retrieveForm = function (editingFor) {

        if (!this.formHtml[editingFor]) {

            // now grab the form HTML
            this.formHtml[editingFor] = window.linz.templates['document-' + editingFor].clone().html();

        }

        return this.formHtml[editingFor];

    };

    DocumentArray.prototype.retrieveLabel = function (editingFor) {

        return $('[data-document-field-for="' + editingFor + '"]').attr('data-document-field-label');

    }


    $.fn.documentarray = function(option, parameter, extraOptions) {

        return this.each(function(index, el) {

            var data = $(this).data('documentarray'),
                isModalWired = false;

            // initialize the documentarray.
            if (!data) {
                data = new DocumentArray();
                $(this).data('documentarray', data);
            }

            // determine the actions for this documentarray
            data.canCreate = $(el).attr('data-document-can-create') !== undefined ? true : false,
            data.canEdit = $(el).attr('data-document-can-edit') !== undefined ? true : false,
            data.canDelete = $(el).attr('data-document-can-delete') !== undefined ? true : false;

            if (!isModalWired) {

                $('#documentsModal').on('shown.bs.modal', function (e) {

                    // Enable form validation.
                    var validator = $('#documentsModal .modal-body form').data('bootstrapValidator');

                    // The validator might alread exist, if so, remove it so we can start fresh.
                    if (validator) {

                        validator.destroy();
                        $('#documentsModal .modal-body form').data('bootstrapValidator', null);

                    }

                    // Freshly start the validator every time the modal is shown.
                    $('#documentsModal .modal-body form').bootstrapValidator();

                    $('#documentsModal').animate({ scrollTop: 0 }, 'fast');
                });

                var template = $('template.document-array-list').clone().html();

                if (!data.canEdit) {
                    // remove edit button from template
                    template = $(template).find('[data-document-action="edit"]').remove().end()[0].outerHTML;
                }

                if (!data.canDelete) {
                    // remove delete button from template
                    template = $(template).find('[data-document-action="remove"]').remove().end()[0].outerHTML;
                }

                data.listTemplate = Handlebars.compile(template);

                // activate switch to make sure the above if statement is executed just once!
                isModalWired = true;

            }

            var documentArrayInstance = $(el).attr('data-document-field-for');

            if (data.canCreate) {

                // handle the create button
                $('[data-document-field-for="' + documentArrayInstance + '"] [data-document-action="create"]').click(function (event) {

                    var parentElem = $(event.target).closest('.documents-container');

                    // unbind click events before we can bind new ones
                    $('#documentsModal .edit-actions .btn-save').unbind('click');
                    $('#documentsModal .edit-actions .btn-cancel').unbind('click');
                    $('#documentsModal .delete-actions .btn-save').unbind('click');
                    $('#documentsModal .delete-actions .btn-cancel').unbind('click');
                    $('#documentsModal button.close').unbind('click');

                    $('#documentsModal .edit-actions .btn-save').click(function () {  data.saveAction(); });
                    $('#documentsModal .edit-actions .btn-cancel').click(function () { data.closeAction(); });
                    $('#documentsModal .delete-actions .btn-save').click(function () {  data.deleteAction(); });
                    $('#documentsModal .delete-actions .btn-cancel').click(function () { data.closeAction(); });
                    $('#documentsModal button.close').click(function () { data.closeAction(); });

                    // clear out persitence fields
                    data.editingObject = {};
                    data.editingInstance = undefined;

                    // which field are we editing for?
                    data.editingFor = $(parentElem).attr('data-document-field-for');

                    // now grab the array if there already is one and turn it into a JavaScript object
                    data.editingArray = JSON.parse($(parentElem).children('input[type="hidden"][name="' + data.editingFor + '"]').val());

                    // now pop the form
                    data.editDocument(data.editingFor);

                });

            }

            data.retrieveForm(documentArrayInstance);

            data.drawDocuments(documentArrayInstance, JSON.parse($(el).children('input[type="hidden"][name="' + documentArrayInstance + '"]').val()));

            // Call sandyle method.
            if (typeof option === 'string') {
                data[option](parameter, extraOptions);
            }

        });

    };

    $.fn.documentarray.Constructor = DocumentArray;

    $(function() {

        $('[data-document-field-for]').documentarray();

    });

}(window.jQuery);
