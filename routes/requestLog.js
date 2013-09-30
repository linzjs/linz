var path = require('path');

/* GET /logs/request/list */
var route = function (req, res) {

	// update the requestLog data to work with HTML.
	l = req.linz.requestLog.replace(/\n/g, "<br />");

	res.render(req.linz.views + '/requestLog.jade', { logs: l });

};

module.exports = route;