var path = require('path');

/* GET /admin */
var route = function (req, res) {

	res.redirect(307, req.linz.get('admin path') + '/models/list');

};

module.exports = route;