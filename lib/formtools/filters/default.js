module.exports = {

    renderer: function defaultFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="text" name="' + fieldName + '[]" class="form-control">');
    },

    filter: function defaultFilterFilter (fieldName, form, callback) {

        var obj = {};

        // regex match using OR condition. Regex search is case-insensitive and global
        obj[fieldName] = { $regex: new RegExp(form[fieldName].join('|'), 'ig') };

        return callback(null, obj);

    }

};
