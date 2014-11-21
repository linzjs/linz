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

    // disable submit button by default
    $('button[type="submit"]').attr('disabled','disabled');

    // set value of form field to data-form-value for checking if there are any changes
    $(':input').each(function () {
        $(this).attr('data-form-value', $(this).val());
    });

    // watch for form field changes to enable/disabled the save button
    $(':input').on("change keyup", function () {

        if (formHasChanged()) {
            return $('button[type="submit"]').removeAttr('disabled');
        }

        return $('button[type="submit"]').attr('disabled','disabled');

    });

    function formHasChanged () {

        var bHasChange = false;

        $(':input').each(function () {

            // return for those input fields that are added after by other libraries
            if ($(this).val() === undefined || $(this).data('form-value') === undefined) {
                return true;
            }

            var val = $(this).val().toString();
            var oldVal = $(this).data('form-value').toString();

            // return if value is array and data field is empty string
            if (val === '[]' && oldVal.length === 0) {
                return true;
            }

            if (val !== oldVal) {

                bHasChange = true;

                return false; // this will break the loop is condition is met

            }

            return true;

        });

        return bHasChange;
    }

})();
