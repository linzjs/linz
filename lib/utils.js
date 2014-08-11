
exports.merge = function (a, b){
	if (a && b) {
		for (var key in b) {
			a[key] = b[key];
		}
	}
	return a;
};

exports.clone = function (a) {

	var b = {};

	for (var key in a) {
		b[key] = a[key];
	}

	return b;

};

exports.asBoolean = function (val) {

   if ('true,yes,1'.indexOf(val) >=0 ) {
       return true;
   }

   if ('false,no,0'.indexOf(val) >= 0) {
       return false;
   }

   // truthy or falsy
   return (val) ? true : false;

};

exports.isBoolean = function (val) {

    if (typeof val === 'boolean') {
        return true;
    }

    if ('true,false,yes,no,1,0'.indexOf(val) >=0 ) {
        return true;
    }

    return false;
}

exports.labelValueArray = function (data) {

    if (!Array.isArray(data)) {
        throw new Error('Provided parameter is not of type Array');
    }

    var newArray = [];

    data.forEach(function (obj) {
        newArray.push({
            label: obj.label || obj,
            value: obj.value || obj
        });
    });

    return newArray;

};

exports.json2CSV = function (obj) {

    var data = [];

    Object.keys(obj).forEach(function (fieldName) {

        if (obj[fieldName] === undefined || obj[fieldName] === null) {
            return data.push('');
        }

        return data.push(obj[fieldName].toString().replace(/"/g, '""', 'g'));

    });

    return '"' + data.join('","') + '"\n';

};
