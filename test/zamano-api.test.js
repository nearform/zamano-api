var assert = require('chai').assert;
var zamano = require('../')();

describe('zamano-api basics', function() {
	it('should have a version number', function() {
		assert.equal(zamano.version, '0.0.0');
	});

	it.skip('should be configurable with different passwords and usernames', function() {
		// more tests ...
	});

	it.skip('should throw an error if username and password are not set', function() {
		// authentication tests ...
	});
});