var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validtors,
	widgets = forms.widgets,
	helpers = require('../lib/helpers-form');

/* GET /admin/:model/:id/overview */
var route = function (req, res) {

	helpers.generateFormFromModel(req.linz.model, {}, function (editForm) {

		editForm.handle(req, {
			success: function (form) {

				var m = new req.linz.model(form.data);

				req.linz.model.update({ _id: req.params.id }, { $set: form.data}, function (error, count, raw) {

					if (!error) {
						// return res.redirect(req.linz.options.adminPath + '/model/' + req.linz.model.modelName + '/list');
						return res.redirect(req.linz.options.adminPath + '/' + req.linz.model.modelName + '/' + req.params.id + '/overview');
					} else {
						return res.send('There was an error saving the model. Please use the back button and try again.');
					}

				});

			},
			error: function (form) {
				return res.send('There was an error inspecting the model data. Please try again.');
			},
			empty: function (form) {
				return res.send('No form data was posted. Please try again.');
			}
		});

	});

};

module.exports = route;