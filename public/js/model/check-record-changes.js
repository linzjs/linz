if (!linz) {
    var linz = {};
}

(function () {

    var resolvedVersionNo;

    $('form').bootstrapValidator({}).on('success.form.bv', function(e) {

        // Prevent form submission
        e.preventDefault();

        // disable submit button
        $(e.target).find('[type="submit"]').attr('disabled','disabled');

    });

    $('form').submit(function () {

        var form = this,
            formValidator = $(form).data('bootstrapValidator'),
            formData = $(form).find(":input").serializeArray(),
            formUrl = $(this).attr('action').replace('save','change');


        if (resolvedVersionNo) {
            formUrl += '/' + resolvedVersionNo;
        }

        if (formValidator.isValid()) {

            // since there are no change, submit the form, proceed with normal save operation
            return form.submit();

        } else {

            return formValidator.validate();

        }

    });

    function standardInputFieldConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var yourChangeLabel = data.yourChange[fieldName],
            theirChangeLabel = data.theirChange[fieldName];

        if (fieldType === 'date') {

            if (yourChangeLabel !== '') {
                try {
                    yourChangeLabel = moment(new Date(yourChangeLabel).toISOString()).format('DD/MM/YYYY');
                } catch (e) {}
            }

            if (theirChangeLabel !== '') {
                try {
                    theirChangeLabel = moment(new Date(theirChangeLabel).toISOString()).format('DD/MM/YYYY');
                } catch (e) {}
            }

        }

        yourChangeLabel = formatTextFieldLabel(yourChangeLabel);
        theirChangeLabel = formatTextFieldLabel(theirChangeLabel);

        if (!formField.parent().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.wrap('<div class="input-group has-conflict has-change"></div>');
            formField.after(template(context));

        } else {

            // highlight conflict
            formField.parent().addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + '\'s change');

        }

        // remove click binding if button has previously been added
        formField.next('.conflict-btn').find('a').off('click');

        // bind click event
        formField.next('.conflict-btn').find('a').on('click',function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.parent().removeClass('has-conflict');
            formField.val($(this).attr('data-conflict-value'));

            enableSubmitBtn(form, formField, formValidator);

        });

    }

    function selectConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var theirChangeLabel = '(none selected)',
            yourChangeLabel = '(none selected)';

        if (data.yourChange[fieldName] !== '') {

            formField.find('option').each(function () {

                if (this.value === data.yourChange[fieldName]) {
                    yourChangeLabel = this.text;
                    //exit the loop
                    return false;
                }
            });
        }

        if (data.theirChange[fieldName] !== '') {

            formField.find('option').each(function () {

                if (this.value === data.theirChange[fieldName]) {
                    theirChangeLabel = this.text;
                    //exit the loop
                    return false;
                }
            });
        }

        if (!formField.parent().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.wrap('<div class="input-group has-conflict has-change"></div>');
            formField.after(template(context));


        } else {

            // highlight conflict
            formField.parent().addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.next('.input-group-btn').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.next('.input-group-btn').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.next('.input-group-btn').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

        // remove click binding if button has previously been added
        formField.next('.conflict-btn').find('a').off('click');

        // bind click event
        formField.next('.conflict-btn').find('a').on('click',function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.parent().removeClass('has-conflict');
            formField.val($(this).attr('data-conflict-value'));

            enableSubmitBtn(form, formField, formValidator);

        });

    }

    function multiSelectConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var theirChangeLabel = [],
            yourChangeLabel = [];

        formField.find('option').each(function () {
            if (data.theirChange[fieldName].indexOf(this.value) > -1) {
                theirChangeLabel.push($(this).text());
            }
            if (data.yourChange[fieldName].indexOf(this.value) > -1) {
                yourChangeLabel.push($(this).text());
            }
        });

        yourChangeLabel = formatNonTextFieldLabel(yourChangeLabel.join(', '));
        theirChangeLabel = formatNonTextFieldLabel(theirChangeLabel.join(', '));

        if (!formField.parent().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.parent().wrapInner('<div class="input-group has-conflict has-change"></div>');
            formField.next('.btn-group-multiselect').after(template(context));

        } else {

            // highlight conflict
            formField.parent().addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.parent().find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.parent().find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.parent().find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

        // remove click binding if button has previously been added
        formField.parent().find('.conflict-btn').find('a').off('click');

        // bind click event
        formField.parent().find('.conflict-btn').find('a').on('click', function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.parent().removeClass('has-conflict');

            updateMultiSelectOptions(formField,$(this).attr('data-conflict-value').split(','));

            enableSubmitBtn(form, formField, formValidator);

        });

    }

    function radiosCheckboxesConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var theirChangeLabel = [],
            yourChangeLabel = [];

        // get label for selected values
        formField.each(function () {
            if (data.theirChange[fieldName].indexOf(this.value) > -1) {
                theirChangeLabel.push($(this).parent().text());
            }
            if (data.yourChange[fieldName].indexOf(this.value) > -1) {
                yourChangeLabel.push($(this).parent().text());
            }
        });

        yourChangeLabel = formatNonTextFieldLabel(yourChangeLabel.join(', '));
        theirChangeLabel = formatNonTextFieldLabel(theirChangeLabel.join(', '));

        if (!formField.first().parents().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.first().parents('.col-sm-10').wrapInner('<div class="input-group has-conflict has-change conflict-none-text-field"></div>');
            formField.first().parents('.col-sm-10').find('.input-group').append(template(context));

        } else {

            // highlight conflict
            formField.first().parents('.col-sm-10').find('.input-group').addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.first().parents('.col-sm-10').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.first().parents('.col-sm-10').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.first().parents('.col-sm-10').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

        // remove click binding if button has previously been added
        formField.first().parents('.col-sm-10').find('.conflict-btn a').off('click');

        // bind click event
        formField.first().parents('.col-sm-10').find('.conflict-btn a').on('click', function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.first().parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

            checkSelectedInputs(formField, $(this).attr('data-conflict-value').split(','));

            enableSubmitBtn(form, formField.first(), formValidator);

        });


    }

    function checkboxesWithAdditionConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var yourChangeLabel = formatNonTextFieldLabel(data.yourChange[fieldName].join(', ')),
            theirChangeLabel = formatNonTextFieldLabel(data.theirChange[fieldName].join(', '));

        if (!formField.first().parents().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.first().parents('.col-sm-10').wrapInner('<div class="input-group has-conflict has-change conflict-none-text-field"></div>');
            formField.first().parents('.col-sm-10').find('.input-group').first().append(template(context));

        } else {

            // highlight conflict
            formField.first().parents('.col-sm-10').find('.input-group').addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.first().parents('.col-sm-10').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.first().parents('.col-sm-10').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.first().parents('.col-sm-10').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

        // remove click binding if button has previously been added
        formField.first().parents('.col-sm-10').find('.conflict-btn a').off('click');

        // bind click event
        formField.first().parents('.col-sm-10').find('.conflict-btn a').click(function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.first().parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

            var selectedValues = $(this).attr('data-conflict-value').split(',');

            // update values for the list of checkboxes
            selectedValues.forEach(function (val, index) {

                var field = $('input:checkbox[name="' + fieldName + '"][value="' + val +'"]');

                if (field.length) {

                    if (field.val === val) {
                        return;
                    }

                    field.val(val);
                    field.siblings('span').html(val);

                } else {

                    var checkbox = formField.first().parents('.checkbox').clone();

                    checkbox.find('input').val(val);
                    checkbox.find('span').html(val);

                    // field doesn't exist, let's add one
                    $('input:checkbox[name="' + fieldName + '"]').last().parents('.checkbox').after(checkbox);

                }

            });

            // remove extra fields
            $('input:checkbox[name="' + fieldName + '"]').each(function (index, element){

                var bRemove = true;

                for (var i=0; i<selectedValues.length; i++){

                    if (element.value === selectedValues[i]) {
                        bRemove = false;
                        break;
                    }
                }

                if (bRemove) {
                    $(element).parents('.checkbox').remove();
                }

            });

            checkSelectedInputs($('input:checkbox[name="' + fieldName + '"]'), $(this).attr('data-conflict-value').split(','));

            enableSubmitBtn(form, formField.first(), formValidator);

        });

    }

    function documentArrayConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var diffResults = renderDocumentArrayDiff(fieldName, data.theirChange[fieldName], data.yourChange[fieldName]);

        if (!formField.parents().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-document-array-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    value: data.yourChange[fieldName],
                    diffs: diffResults.yourChange
                },
                theirChange: {
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy'],
                    diffs: diffResults.theirChange
                }
            };

            formField.parents('.col-sm-10').wrapInner('<div class="input-group has-conflict has-change conflict-none-text-field"></div>');
            formField.parents('.col-sm-10').find('.input-group').append(template(context));

        } else {

            // highlight conflict
            formField.parents('.col-sm-10').find('.input-group').addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.parents('.col-sm-10').find('.table-conflict .conflict-content').remove();

            var html = '';

            diffResults.theirChange.forEach(function (result, index) {
                html += '<tr class="conflict-content">'
                + '<td>' + diffResults.yourChange[index] + '</td>'
                + '<td class="v-divider">&nbsp;</td>'
                + '<td>' + result + '</td>'
                + '</tr>';

            });

            formField.parents('.col-sm-10').find('.table-conflict').append(html);

            // update conflict values
            formField.parents('.col-sm-10').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]);
            formField.parents('.col-sm-10').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]);
            formField.parents('.col-sm-10').find('.their-change a').html(data.theirChange['modifiedBy']);

        }

        // remove click binding if button has previously been added
        formField.parents('.col-sm-10').find('.btn-conflict-selection').off('click');

        // bind click event
        formField.parents('.col-sm-10').find('.btn-conflict-selection').on('click', function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

            formField.val($(this).attr('data-conflict-value'));

            // redraw document
            formField.parents('.col-sm-10').find('[data-document-field-for="' + fieldName + '"]').data('documentarray').redrawDocuments(fieldName);

            enableSubmitBtn(form, formField, formValidator);

        });

    }

    function textareaConflictHandler(fieldName, fieldType, formField, data, form, formValidator) {

        var yourChangeLabel = formatTextFieldLabel(data.yourChange[fieldName]),
            theirChangeLabel = formatTextFieldLabel(data.theirChange[fieldName]);

        if (!formField.parents().hasClass('has-change')) {

            var dropdownHTML = $("#conflict-dropdown-template").html();
            var template = Handlebars.compile(dropdownHTML);
            var context = {
                yourChange: {
                    label: yourChangeLabel,
                    value: data.yourChange[fieldName]
                },
                theirChange: {
                    label: theirChangeLabel,
                    value: data.theirChange[fieldName],
                    author: data.theirChange['modifiedBy']
                }
            };

            formField.parents('.col-sm-10').wrapInner('<div class="input-group has-conflict has-change conflict-long-text"></div>');
            formField.parents('.col-sm-10').find('.input-group').append(template(context));


        } else {

            // highlight conflict
            formField.parents('.col-sm-10').find('.input-group').addClass('has-conflict');

            // since the conflict box is already displayed, simply update the values
            formField.parents('.col-sm-10').find('.their-change a').attr('data-conflict-value',data.theirChange[fieldName]).html(theirChangeLabel);
            formField.parents('.col-sm-10').find('.your-change a').attr('data-conflict-value',data.yourChange[fieldName]).html(yourChangeLabel);
            formField.parents('.col-sm-10').find('.their-change-author').html(data.theirChange['modifiedBy'] + "'s change");

        }

        // remove click binding if button has previously been added
        formField.parents('.col-sm-10').find('.conflict-btn a').off('click');

        // bind click event
        formField.parents('.col-sm-10').find('.conflict-btn a').on('click', function (e) {

            e.preventDefault();

            resolvedVersionNo = data.theirChange.versionNo;

            formField.parents('.col-sm-10').find('.input-group').removeClass('has-conflict');

            formField.val($(this).attr('data-conflict-value'));

            enableSubmitBtn(form, formField, formValidator);

        });

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
            results = { theirChange: [], yourChange: [] },
            prevPos;

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

    function enableSubmitBtn (form, formField, formValidator) {

        // check if form field contains data-bv-* which indicates this field has a form validation
        var bHasValidator = Object.keys(formField.data()).some(function (attrName) {
            return attrName.indexOf('bv') >= 0;
        });

        if (bHasValidator) {

            // revalidate the field to remove any error message displayed prior to the data conflict
            formValidator.updateStatus(formField, 'NOT_VALIDATED').validateField(formField);

            // check if the submit button is enable by the validation above, if yes disable it first, so that it can be enabled after merging conflicts are completed
            if ($(form).find('button[type="submit"]:disabled').length === 0) {
                $(form).find('button[type="submit"]').attr('disabled','disabled');
            }
        }

        if ($('.has-conflict').length === 0 && formValidator.isValid()) {

            // since all conflicts has been resolved and form is validated, let's activate the submit button
            $(form).find('button[type="submit"]').removeAttr('disabled');

        }
    }

    function formatTextFieldLabel (label, formFieldType) {
        return label === '' ? '(empty)' : label;
    }

    function formatNonTextFieldLabel (label, formFieldType) {
        return label === '' ? '(none selected)' : label;
    }

    function setConflictVersionNo (val) {
        resolvedVersionNo = val;
    }

    // define global functions
    linz.textConflictHandler = standardInputFieldConflictHandler;
    linz.dateConflictHandler = standardInputFieldConflictHandler;
    linz.numericConflictHandler = standardInputFieldConflictHandler;
    linz.selectConflictHandler = selectConflictHandler;
    linz.multiSelectConflictHandler = multiSelectConflictHandler;
    linz.radiosConflictHandler = radiosCheckboxesConflictHandler;
    linz.checkboxesConflictHandler = radiosCheckboxesConflictHandler;
    linz.checkboxesWithAdditionConflictHandler = checkboxesWithAdditionConflictHandler;
    linz.documentArrayConflictHandler = documentArrayConflictHandler;
    linz.textareaConflictHandler = textareaConflictHandler;
    linz.enableSubmitBtn = enableSubmitBtn;
    linz.setConflictVersionNo = setConflictVersionNo;

})();
