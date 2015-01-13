(function () {

    var resolvedVersionNo = null;

    $('form').submit(function () {

        console.log('=== submit form');

        var _this = this;
        var formData = $(_this).find(":input").serializeArray();
        var formUrl = $(this).attr('action').replace('save','change');

        console.log(resolvedVersionNo);

        if (resolvedVersionNo !== null) {
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
                // TODO: need to enable this
                // since there are no change submit the form and proceed with normal save operation
                return _this.submit();
            }

            // TODO: need to open the modal to flag that there is a data conflict with instruction on how to resolve them
            // since there is a change, lets load a modal to highlight the changes and provide user with options for the next step
            // $('#linzModal').modal().load('', formData, function () {});

            // TODO: add revisionB data of diff fields to form

            data.diff.forEach(function (diff) {

                var fieldName = diff.path;
                var formField = $('input[name=' + fieldName + ']');

                if (!formField.parent().next().is('small.conflictMsg')) {

                    formField.after("<small class='conflictMsg'>There's a conflict!</small>");
                    formField.closest('.form-group').addClass('has-change');
                    formField.wrap('<div class="input-group"></div>');
                    formField.after(
                        '<div class="input-group-btn conflict-btn">'
                        + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-exclamation-sign"></span></button>'
                        + '<ul class="dropdown-menu dropdown-menu-right" role="menu">'
                        + '<li role="presentation" class="dropdown-header">Your change</li>'
                        + '<li class="revisionA"><a href="#">' + data.revisionB[fieldName] + '</a></li>'
                        + '<li role="presentation" class="dropdown-header revisionB-author">' + data.revisionA['modifiedBy'] + "'s change" + '</li>'
                        + '<li class="revisionB"><a href="#">' + data.revisionA[fieldName] + '</a></li></ul>'
                        + '</div>'
                    );

                    $('.conflict-btn a').click(function () {
                        console.log('set resolvedVersionNo');
                        resolvedVersionNo = data.revisionA.__v;
                        console.log('== ' +resolvedVersionNo);
                    });

                } else {

                    // since the conflict box is already displayed, simply update the values
                    formField.next('.input-group-btn').find('.revisionA a').html(data.revisionB[fieldName]);
                    formField.next('.input-group-btn').find('.revisionB-author').html(data.revisionA['modifiedBy'] + "'s change");
                    formField.next('.input-group-btn').find('.revisionB a').html(data.revisionA[fieldName]);

                }

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
