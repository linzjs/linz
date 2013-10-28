global.should = require('should');
global.mongoURL = 'mongodb://127.0.0.1/mongoose-formtools-test';
global.mongoose = require('mongoose');

mongoose.connect(mongoURL, function (error) {

	if (!error) return;

	console.error(error, 'Please ensure mongodb is started before running tests. Configure the mongodb url in the test-helper.js file as required.');
	process.exit(1);

});