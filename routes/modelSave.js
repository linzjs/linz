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

				m.save(function (err, doc) {

					if (err) {
						return res.send('There was an error saving the model. ' + err + '. Please hit the back button, amend the error and try again.');
					}

					return res.redirect(req.linz.options.adminPath + '/' + req.linz.model.modelName + '/' + doc._id + '/overview');

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