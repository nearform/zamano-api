var assert = require('chai').assert;
var zamano = require('../')();

describe('zamano-api basics', function() {
  it('should exist', function() {
    assert.ok(zamano);
  });
});
