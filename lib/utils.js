
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