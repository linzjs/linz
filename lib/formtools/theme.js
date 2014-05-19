// export modules

module.exports = {
    field: function (label, content, helpText, field) {
        return '<div class="form-group">' + label + content + helpText + '</div>';
    },
    fieldgroup: {
        group: function (label, content, helpText, field) {
            return '<div class="form-group">' + label + content + helpText + '</div>';
        },
        fields: function (content) {
            return '<div class="col-sm-10">' + content + '</div>';
        }
    },
    control: function (content, field) {
        return '<div class="col-sm-10">' + content + '</div>';
    }
}
