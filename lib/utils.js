
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
