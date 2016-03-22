var formist = require('formist'),
	linz = require('../'),
	util = require('util');

/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

	linz.formtools.form.generateFormFromModel(req.linz.model.schema, req.linz.model.linz.formtools.form, req.linz.record, 'edit', function (err, editForm) {

		if (err) {
			return next(err);
		}

		var conflictHandlersJS = '\n\t',
			registeredConflictHandlers = {};

		editForm.elements.forEach(function (element) {

			if (!element.elements) {
				return;
			}

			element.elements.forEach(function (field) {

				if (!field.conflictHandler || registeredConflictHandlers[field.conflictHandler.name]) {
					// do nothing if conflictHandler is undefined or it has been registered
					return;
				}

				conflictHandlersJS += field.conflictHandler.toString() + '\n\t';

				// register function name
				registeredConflictHandlers[field.conflictHandler.name] = 1;

			});

		});

		// make JS function accessible via linz namespace
		Object.keys(registeredConflictHandlers).forEach(function (fnName) {
			conflictHandlersJS += 'linz.' + fnName + ' = ' + fnName + ';\n\t' ;
		});

		// wrap code in self-executable function
		conflictHandlersJS = '\n\t(function () {\n\t' + conflictHandlersJS + '\n\t})();';

		res.render(linz.api.views.viewPath('recordEdit.jade'), {
			model: req.linz.model,
			record: req.linz.record,
			form: editForm.render(),
			conflictHandlersJS: conflictHandlersJS,
            actionUrl: linz.api.url.getAdminLink(req.linz.model, 'save', req.linz.record._id),
			cancelUrl: linz.api.url.getAdminLink(req.linz.model)
		});

	});

};

module.exports = route;
