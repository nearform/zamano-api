var assert = require('chai').assert;
var zamano = require('../')();

describe('zamano-api basics', function() {
	it('should have a version number', function() {
		assert.equal(zamano.version, '0.0.0');
	});
});