(function () {

    var resolvedVersionNo;

    // $('form').bootstrapValidator({}).on('success.form.bv', function(e) {
    //     // Prevent form submission
    //     console.log('prevent default');
    //     e.preventDefault();
    // });

    $('form').submit(function () {

        var form = this,
            formValidator = $(form).data('bootstrapValidator'),
            formData = $(form).find(":input").serializeArray(),
            formUrl = $(this).attr('action').replace('save','change');


        if (resolvedVersionNo) {
            formUrl += '/' + resolvedVersionNo;
        }

        $.ajax({
            method: 'post',
            url: formUrl,
            dataType: 'json',
            data: formData
        })
        .done(function(data, textStatus, jqXHR) {

            if (!data.hasChanged) {

                //TODO: fix double form submission issue

                // since there are no change submit the form, proceed with normal save operation
                return form.submit();

            }

            // TODO: need to open the modal to flag that there is a data conflict with instruction on how to resolve them
            // since there is a change, lets load a modal to highlight the changes and provide user with options for the next step
            // $('#linzModal').modal().load('', formData, function () {});

            data.diff.forEach(function (diff) {

                var fieldName = diff.path[0],
                    formField = $(form).find(':input[name="' + fieldName + '"]');

                if (!formField.length) {
                    // exit if field is not found!
                    return;
                }

                if (formField.length > 1) {

                    // this form field must be a group of radio or checkboxes
                    renderRadioCheckboxInputsConflict(fieldName, formField, data, form, formValidator);
                    return;

                }

                if ($(form).find('[data-document-field-for="' + fieldName + '"]').length > 0) {

                    // this field contains a document array
                    renderDocumentArrayConflicts(fieldName, formField, data, form, formValidator);
                    return;

                }

                switch (formField[0].nodeName.toLowerCase()) {
                    case 'input':
                        renderTextInputConflict(fieldName, formField, data, form, formValidator);
                        break;
                    case 'select':
                        if (formField.hasClass('multiselect')) {
                            renderMultiSelectFieldConflict(fieldName, formField, data, form, formValidator);
                        } else {
                            renderSelectFieldConflict(fieldName, formField, data, form, formValidator);
                        }
                        break;
                    case 'textarea':
                        //TODO: textarea conflict renderer
                        renderTextareaFieldConflict(fieldName, formField, data, form, formValidator);

                        break;
                    default:
                        // default code here
                }

            });

        })
        .fail(function(jqXHR, textStatus, errorThrown ) {
            alert('An error has occured while attempting to check if this record has been editted by other user.');
            return false;
        });

        return false;
    });

    function renderTextInputConflict(fieldName, formField, data, form, formValidator) {

        if (!formField.parent().hasClass('has-conflict')) {

            formField.wrap('<div class="input-group has-conflict"></div>');
            formField.after(
                '<div class="input-group-btn conflict-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '<li role="presentation" class="dropdown-header">Your change</li>'
                + '<li class="your-change"><a href="#" class="conflict-selection">' + data.yourChange[fieldName] + '</a></li>'
                + '<li role="presentation" class="dropdown-header their-change-author">' + data.theirChange['modifiedBy'] + "'s change" + '</li>'
                + '<li class="their-change"><a href="#" class="conflict-selection">' + data.theirChange[fieldName] + '</a></li></ul>'
                + '</div>'
            );

            formField.next('.conflict-btn').find('a').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.parent().removeClass('has-conflict');
                formField.val($(this).html());

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').html(data.theirChange[fieldName]);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");
            formField.next('.input-group-btn').find('.your-change a').html(data.yourChange[fieldName]);

        }

    }

    function renderSelectFieldConflict(fieldName, formField, data, form, formValidator) {

        var theirChangeLabel = data.theirChange[fieldName],
            yourChangeLabel = data.yourChange[fieldName];

        // get label for select values
        formField.find('option').each(function () {

            if (this.value === data.theirChange[fieldName]) {
                theirChangeLabel = this.text;
            }

            if (this.value === data.yourChange[fieldName]) {
                yourChangeLabel = this.text;

            }

        });

        if (!formField.parent().hasClass('has-conflict')) {

            formField.wrap('<div class="input-group has-conflict"></div>');
            formField.after(
                '<div class="input-group-btn conflict-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '<li role="presentation" class="dropdown-header">Your change</li>'
                + '<li class="your-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.yourChange[fieldName] + '">' + yourChangeLabel + '</a></li>'
                + '<li role="presentation" class="dropdown-header their-change-author">' + data.theirChange['modifiedBy'] + "'s change" + '</li>'
                + '<li class="their-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.theirChange[fieldName] + '">' + theirChangeLabel + '</a></li></ul>'
                + '</div>'
            );

            formField.next('.conflict-btn').find('a').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.parent().removeClass('has-conflict');
                formField.val($(this).attr('data-conflict-value'));

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

    }


    function renderMultiSelectFieldConflict(fieldName, formField, data, form, formValidator) {

        var theirChangeLabel = data.theirChange[fieldName],
        yourChangeLabel = data.yourChange[fieldName];

        // get label for select values
        formField.find('option').each(function () {

            if (this.value === data.theirChange[fieldName]) {
                theirChangeLabel = this.text;
            }

            if (this.value === data.yourChange[fieldName]) {
                yourChangeLabel = this.text;

            }

        });

        if (!formField.parent().hasClass('has-conflict')) {

            formField.parent().wrapInner('<div class="input-group has-conflict"></div>');
            formField.next('.btn-group-multiselect').after(
                '<div class="input-group-btn conflict-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '<li role="presentation" class="dropdown-header">Your change</li>'
                + '<li class="your-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.yourChange[fieldName] + '">' + yourChangeLabel + '</a></li>'
                + '<li role="presentation" class="dropdown-header their-change-author">' + data.theirChange['modifiedBy'] + "'s change" + '</li>'
                + '<li class="their-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.theirChange[fieldName] + '">' + theirChangeLabel + '</a></li></ul>'
                + '</div>'
            );

            formField.parent().find('.conflict-btn').find('a').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.parent().removeClass('has-conflict');

                updateMultiSelectOptions(formField,$(this).attr('data-conflict-value').split(','));

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

    }

    function renderRadioCheckboxInputsConflict(fieldName, formField, data, form, formValidator) {

        var theirChangeLabel = [],
            yourChangeLabel = [],
            theirChangeValue = data.theirChange[fieldName].toString().split(','),
            yourChangeValue = data.yourChange[fieldName].toString().split(',');

        // get label for select values
        formField.each(function () {
            if (theirChangeValue.indexOf(this.value) > -1) {
                theirChangeLabel.push($(this).parent().text());
            }
            if (yourChangeValue.indexOf(this.value) > -1) {
                yourChangeLabel.push($(this).parent().text());
            }
        });

        if (!formField.first().parents().hasClass('has-conflict')) {

            formField.first().parents('.col-sm-10').wrapInner('<div class="input-group has-conflict"></div>');
            formField.first().parents('.col-sm-10').find('.input-group').append(
                '<div class="input-group-btn conflict-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '<li role="presentation" class="dropdown-header">Your change</li>'
                + '<li class="your-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.yourChange[fieldName] + '">' + yourChangeLabel + '</a></li>'
                + '<li role="presentation" class="dropdown-header their-change-author">' + data.theirChange['modifiedBy'] + "'s change" + '</li>'
                + '<li class="their-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.theirChange[fieldName] + '">' + theirChangeLabel + '</a></li></ul>'
                + '</div>'
            );

            formField.first().parents('.col-sm-10').find('.conflict-btn').find('a').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.first().parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

                checkSelectedInputs(formField, $(this).attr('data-conflict-value').split(','));

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

    }

    function renderDocumentArrayConflicts(fieldName, formField, data, form, formValidator) {

        var diffResults = renderDocumentArrayDiff(fieldName, data.theirChange[fieldName], data.yourChange[fieldName]);

        if (!formField.parents().hasClass('has-conflict')) {

            formField.parents('.col-sm-10').wrapInner('<div class="input-group has-conflict"></div>');

            var html = '<div class="input-group-btn conflict-btn">'
                        + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                        + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                            + '<li class="conflict-legend"><span class="new"><i class="fa fa-square"></i>New</span><span class="removed"><i class="fa fa-square"></i>Deleted</span><span class="edited"><i class="fa fa-square"></i>Updated</span></li>'
                            + '<li class="table-responsive">'
                                + '<p>Below highlights <span class="conflict-author">' + data.theirChange['modifiedBy'] + '</span>\'s changes in comparison to yours:</p>'
                                + '<table class="table-conflict">'
                                    + '<tr>'
                                        + '<td><h5>Your change<a title="Select this" class="btn btn-default btn-xs btn-conflict-selection" data-conflict-value=\'' + data.yourChange[fieldName] + '\'><i class="fa fa-check"></i></a></h5></td>'
                                        + '<td class="v-divider">&nbsp;</td>'
                                        + '<td><h5><span class="conflict-author">' + data.theirChange['modifiedBy'] + '</span>\'s change<a title="Select this" class="btn btn-default btn-xs btn-conflict-selection" data-conflict-value=\'' + data.theirChange[fieldName] + '\'><i class="fa fa-check"></i></a></h5></td>'
                                    + '</tr>';

            diffResults.theirChange.forEach(function (result, index) {
                html += '<tr class="conflict-content">'
                            + '<td>' + diffResults.yourChange[index] + '</td>'
                            + '<td class="v-divider">&nbsp;</td>'
                            + '<td>' + result + '</td>'
                    + '</tr>';

            });

            html += '</table></li></div>';

            formField.parents('.col-sm-10').find('.input-group').append(html);

            formField.parents('.col-sm-10').find('.btn-conflict-selection').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

                formField.val($(this).attr('data-conflict-value'));

                // redraw document
                formField.parents('.col-sm-10').find('[data-document-field-for="' + fieldName + '"]').data('documentarray').redrawDocuments(fieldName);

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.table-conflict .conflict-content').remove();

            var html = '';

            diffResults.theirChange.forEach(function (result, index) {
                html += '<tr class="conflict-content">'
                + '<td>' + diffResults.yourChange[index] + '</td>'
                + '<td class="v-divider">&nbsp;</td>'
                + '<td>' + result + '</td>'
                + '</tr>';

            });

            formField.next('.input-group-btn').find('.table-conflict').append(html);

            formField.next('.input-group-btn').find('.conflict-author').html(data.theirChange['modifiedBy']);

        }

    }

    function renderTextareaFieldConflict(fieldName, formField, data, form, formValidator) {

        if (!formField.parents().hasClass('has-conflict')) {

            formField.parents('.col-sm-10').wrapInner('<div class="input-group has-conflict"></div>');
            formField.parents('.col-sm-10').find('.input-group').append(
                '<div class="input-group-btn conflict-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '<li role="presentation" class="dropdown-header">Your change</li>'
                + '<li class="your-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.yourChange[fieldName] + '">' + data.yourChange[fieldName] + '</a></li>'
                + '<li role="presentation" class="dropdown-header their-change-author">' + data.theirChange['modifiedBy'] + "'s change" + '</li>'
                + '<li class="their-change"><a href="#" class="conflict-selection" data-conflict-value="' + data.theirChange[fieldName] + '">' + data.theirChange[fieldName] + '</a></li></ul>'
                + '</div>'
            );

            formField.parents('.col-sm-10').find('.conflict-btn').find('a').click(function (e) {

                e.preventDefault();

                resolvedVersionNo = data.theirChange.__v;

                formField.parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

                formField.val($(this).attr('data-conflict-value'));

                enableSubmitBtn(form, formValidator);

            });

        } else {

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(data.theirChange[fieldName]);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(data.yourChange[fieldName]);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

    }

    function checkSelectedInputs(formField, selectedValues) {

        formField.each(function () {
            //reset checked status to unchecked
            $(this).prop('checked', false);

            if (selectedValues.indexOf(this.value) > -1) {
                $(this).prop('checked', true);
            }
        });

    }

    function updateMultiSelectOptions(formField, selectedValues) {

        formField.find('option').each(function () {

            //reset selected status to unselected
            $(this).attr('selected', false);

            if (selectedValues.indexOf(this.value) > -1) {
                $(this).attr('selected', true);
            }
        });

        // update bootstrop-multiselect plugin
        formField.multiselect('refresh');

    }

    function renderDocumentArrayDiff (fieldName, theirChange, yourChange) {

        theirChange = JSON.parse(theirChange);
        yourChange = JSON.parse(yourChange);

        var diffResults = DeepDiff.diff(yourChange, theirChange), // get changes in theirChange
            results = { theirChange: [], yourChange: []};

        //TODO: test in combination of additional properties, new member, edit member and delete member

        var prevPos = undefined;

        // process the changes in the array of records
        diffResults.forEach(function (diff) {

            if (diff.kind === 'A') {

                if (diff.item.kind === 'N') {

                    // a new record has been added, show new record
                    results.theirChange.push(renderRecordData(diff.item.rhs, 'new'));
                    results.yourChange.push('');


                } else if (diff.item.kind === 'D') {

                    // a record has been removed, show deleted record
                    results.yourChange.push(renderRecordData(diff.item.lhs));
                    results.theirChange.push(renderRecordData(diff.item.lhs, 'removed'));

                }

                return;

            }

            // array position of the record that has changed
            var pos = diff.path[0];

            if (pos === prevPos) {
                return;
            }

            // show that properties that has been edited or added
            results.yourChange.push(renderRecordData(yourChange[pos]));
            results.theirChange.push(renderRecordWithUpdates(yourChange[pos], pos, diffResults));
            prevPos = pos;

        });

        return results;

    }

    function renderRecordData (field, className) {

        var html = '',
            value = '';

        Object.keys(field).forEach(function (key) {

            if (key === '_id' || key === 'createdBy' || key === 'dateModified' || key === 'dateCreated') {
                return;
            }

            value = field[key];

            if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
            }

            html +=  '<tr' + (className ? ' class="' + className + '"': '') + '><td>' + key + '</td><td>' + value + '</td></tr>';

        });

        html = '<table class="table table-bordered table-document-conflict">' + html + '</table>';

        return html;
    }


    function renderRecordWithUpdates (field, pos, diffResults) {

        var html = '';

        // show updated record with new and deleted properties highlighted
        Object.keys(field).forEach(function (key) {

            if (key === '_id' || key === 'createdBy' || key === 'dateModified' || key === 'dateCreated') {
                return;
            }

            var className,
                diff,
                value = field[key];

            // loop through diff result to find fields in this object that have changed
            for (var i=0; i < diffResults.length; i++) {

                diff = diffResults[i];

                if (!diff.path) {
                    break;
                }

                if (diff.path[0] === pos && diff.path[1] === key) {

                    switch (diff.kind) {
                        case 'E':
                            className = 'edited';
                            value = diff.rhs;
                            break;
                        case 'D':
                            className = 'removed';
                            value: diff.lhs;
                            break;
                        default:
                            // default code
                    }

                    break;

                }

            }

            if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
            }

            html +=  '<tr' + (className ? ' class="' + className + '"' : '') + '><td>' + key + '</td><td>' + value + '</td></tr>';

        });

        // hightlight new properties
        diffResults.forEach(function (diff) {

            if (diff.path && diff.path[0] === pos && diff.kind === 'N') {
                html +=  '<tr class="new"><td>' + diff.path[1] + '</td><td>' + diff.rhs + '</td></tr>';

            }

        });

        html = '<table class="table table-bordered table-document-conflict">' + html + '</table>';

        return html;
    }

    function enableSubmitBtn (form, formValidator) {
        if ($('.has-conflict').length === 0 && formValidator.isValid()) {

            // since all conflicts has been resolved and form is validated, let's activate the submit button
            $(form).find('button[type="submit"]').removeAttr('disabled');

        }
    }


})();
