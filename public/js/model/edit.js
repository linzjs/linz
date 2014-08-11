(function () {

    // load validation lib
    $('form.model').bootstrapValidator({});

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

})();
