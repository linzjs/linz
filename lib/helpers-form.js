var mongoose = require.main.require('mongoose'),
	types = mongoose.Schema.Types;

exports.findFieldType = function (field) {

	var type;

	// loop through all of the mongoose Schema Types and find a match for the current field
	// we're going in reverse because mongoose Schema Types are inherited
	// and the inherited ones are on the end of the list, and we want the extended types
	Object.keys(types).reverse().some(function (element, index, array) {

		// if this field matches the mongoose Schema Type
		// stop the loop (by returning true) and set the value of type
		if (field instanceof types[element]) {
			type = element;
			return true;
		}

		return false;

	});

	return type;

}