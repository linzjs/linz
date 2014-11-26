(function () {

    // add support for checkboxes add button
    $('.btn[data-linz-control="add-checkbox"]').click(function () {

        var queryObj = $(this),
            checkboxField = queryObj.parents('.input-group').find('template').clone().html(),
            inputValue = queryObj.parents('.input-group').find('input[name="add-checkbox"]').val();

        if (!inputValue) {
            return false;
        }

        // convert this to jquery object to allow dom search below
        checkboxField = $(checkboxField);
        checkboxField.find('input').val(inputValue);
        // enable this field
        checkboxField.find('input').attr('disabled', false);
        checkboxField.find('.checkbox-label').html(inputValue);
        queryObj.parents('.row').before(checkboxField.html());

        // clear input field value after insertion
        queryObj.parents('.input-group').find('input[name="add-checkbox"]').val('');

        return false;
    });

    // add support for the tab save button, to actually post the form
    $('.control-bar-top button[type="submit"]').click(function () {

        // find the form and trigger the submit button
        $('form').first().find('button[type="submit"]').trigger('click');

    });

    $('form').submit(function () {

        var _this = this;
        var formData = $(_this).find(":input").serializeArray();

        $.ajax({
            method: 'post',
            url: '/admin/model/mmsMember/547400a4cceeaa01004f870c/change',
            dataType: 'json',
            data: formData
        })
        .done(function(data, textStatus, jqXHR) {

            if (!data.hasChanged) {
                // TODO: need to enable this
                // since there are no change submit the form and proceed with normal save operation
            //    _this.submit();
            }

            // TODO: need to open the modal to flag that there is a data conflict with instruction on how to resolve them
            // since there is a change, lets load a modal to highlight the changes and provide user with options for the next step
            // $('#linzModal').modal().load('', formData, function () {});

            // TODO: add revisionB data of diff fields to form


            data.diff.forEach(function (diff) {
                var fieldName = diff.path;
                var formField = $('input[name=' + fieldName + ']');

                formField.after("<small>There's a conflict!</small>");
                formField.closest('.form-group').addClass('has-change');
                formField.wrap('<div class="input-group"></div>');
                formField.after(
                    '<div class="input-group-btn">'
                        + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                        + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                        + '<li role="presentation" class="dropdown-header">Your change</li>'
                        + '<li><a href="#">' + data.revisionB[fieldName] + '</a></li>'
                        + '<li role="presentation" class="dropdown-header">' + data.revisionA['modifiedBy'] + "'s change" + '</li>'
                        + '<li><a href="#">' + data.revisionA[fieldName] + '</a></li></ul>'
                    + '</div>'
                );

                // TODO: add js event to update the selected value for each dropdown above
                // TODO: special fields like multi-select box need special handler to ensure value is show correctly

            });

        })
        .fail(function(jqXHR, textStatus, errorThrown ) {
            alert('An error has occured while attempting to check if this record has been editted by other user.');
            return false;
        });

        return false;
    });

})();
