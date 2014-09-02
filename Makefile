test:
	@./node_modules/.bin/mocha
test-formtools:
	@./node_modules/.bin/mocha test/formtools.js
test-versions:
	@./node_modules/.bin/mocha test/versions.js
test-api:
	@./node_modules/.bin/mocha test/api.js
.PHONY: test
