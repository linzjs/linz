var linz = require('../');

/* GET /admin/merge-data-conflict-guide */
var route = function (req, res) {

    res.render(linz.api.views.viewPath('merge-data-conflict-guide.jade'), {});

};

module.exports = route;
