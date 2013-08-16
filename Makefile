
TESTS = $(shell find test/ -name '*.test.js')

test:
	@node test/dropdb.js
	@./node_modules/.bin/mocha $(T) --async-only $(TESTS)
	@node test/dropdb.js

.PHONY: test