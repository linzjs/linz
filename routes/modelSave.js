var formist = require('formist'),
	linz = require('../');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

    var m = new req.linz.model(req.body);

    m.save(function (err, doc) {

        if (err) {
            return res.send('There was an error saving the model. ' + err + '. Please hit the back button, amend the error and try again.');
        }

        return res.redirect(linz.api.getAdminLink(req.linz.model.modelName, 'overview', doc._id));

    });

};

module.exports = route;
