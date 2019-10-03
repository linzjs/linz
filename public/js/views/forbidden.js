$(document).ready(function() {
    $('form .btn-primary').on('click', function click(event) {
        event.preventDefault();
        window.history.back();
    });
});
