var mongoose = require.main.require('mongoose'),
	types = mongoose.Schema.Types,
	moment = require('moment'),
	cellrenderers = require('./renderers-cell');

// ensure we have the neccessary defaults
var defaults = function (options) {

	options = options || {};

	// define a default set of columns
	options.columns = columnsDefaults(options.columns) || {
		title: {
			label: 'Label',
			renderer: cellrenderers.linkRenderer
		},
		status: {
			label: 'Status',
			renderer: cellrenderers.stringRenderer
		},
		publishDate: {
			label: 'Publish date',
			renderer: cellrenderers.dateRenderer
		},
		dateCreated: {
			label: 'Date created',
			renderer: cellrenderers.dateRenderer
		}
	};

	// setup modelActions to an emptry array as default
	options.modelActions = options.modelActions || [];

	// determine if we need publishing rules
	options.usePublishingDate = (options.usePublishingDate === undefined) ? true : options.usePublishingDate;

	// determine if we want draft/live rules
	options.usePublishingStatus = (options.usePublishingStatus === undefined) ? true : options.usePublishingStatus;

	return options;

};

// a function ensure the columns object has the properties we're expecting
var columnsDefaults = function (columns) {

	// if it's undefined, don't do anything, return an undefined value
	// and the || operator in defaults will set a value
	if (columns === undefined) return columns;

	// loop through the columns and make sure they have the correct setup, i.e. label & renderer
	Object.keys(columns).forEach(function (column) {

		// match a simple string, i.e. Label
		if (typeof columns[column] === 'string') {

			columns[column] = {
				label: columns[column],
				renderer: cellrenderers.defaultRenderer
			};

		// match an object, without a renderer, i.e. { label: 'Label' }
		} else if (typeof columns[column] === 'object' && !columns[column].renderer) {

			columns[column].renderer = cellrenderers.defaultRenderer;

		}

	});

	return columns;

};

module.exports = function formtoolsPlugin (schema, options) {

	options = defaults(options);

	// if title already exists, don't add a virtual for it
	if (!schema.paths.title) {

		// set a virtual for title
		schema.virtual('title').get(function () {

			if (schema.paths.label && this.label) return this.label;
			if (schema.paths.name && this.name) return this.name;
			if (typeof this.toString === 'function') return this.toString();

		});

	}

	// add the mandatory date created, date modified fields
	schema.add({
		dateModified: {
			type: types.Datetime,
			label: 'Date modified',
			visible: false
		},
		dateCreated: {
			type: Date,
			default: Date.now,
			label: 'Date created',
			visible: false
		}
	});

	// do we need publishing date?
	if (options.usePublishingDate) {
		schema.add({
			publishDate: {
				type: types.Datetime,
				label: 'Publish date'
			}
		});
	}

	// do we need publishing status?
	if (options.usePublishingStatus) {
		schema.add({
			status: {
				type: String,
				enum: ['draft', 'approved']
			}
		});
	}

	schema.pre('save', function (next) {
		this.dateModified = new Date();
		next();
	});

	// setup a method to retrieve the column list
	schema.statics.getColumns = function (cb) {
		cb(null, options.columns);
	};

	// setup a method to retreive the model actions
	schema.statics.getModelActions = function (cb) {
		cb(null, options.modelActions);
	};

	// is there a custom overview?
	if (options.overview) {
		schema.statics.overview = options.overview;
	}

};