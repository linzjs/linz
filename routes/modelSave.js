var formist = require('formist'),
	linz = require('../'),
    model = require('../lib/formtools/model');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

    var m = new req.linz.model(model.clean(req.body, req.linz.model));

    m.save(req, function (err, doc) {

        if (err) {
            return res.send('There was an error saving the model. ' + err + '. Please hit the back button, amend the error and try again.');
        }

        return res.redirect(linz.api.getAdminLink(req.linz.model.modelName, 'overview', doc._id));

    });

};

module.exports = route;
