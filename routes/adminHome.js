var linz = require('linz');

/* GET /admin */
var route = function (req, res) {

	res.redirect(307, linz.get('admin path') + '/models/list');

};

module.exports = route;
