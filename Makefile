test:
	@./node_modules/.bin/mocha
test-formtools:
	@./node_modules/.bin/mocha test/formtools.js
test-api:
	@./node_modules/.bin/mocha test/api.js
.PHONY: test
