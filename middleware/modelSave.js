var linz = require('../');

module.exports = function () {

	return function (req, res, next) {

        req.linz.model.getForm(function(err,form){

            req.linz.model.form = form;
            next();

        });

	}

}
