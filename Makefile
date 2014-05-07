test:
	@./node_modules/.bin/mocha
test-formtools:
	@./node_modules/.bin/mocha \
		test/formtools.js
.PHONY: test
