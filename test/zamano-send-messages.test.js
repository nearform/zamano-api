var assert = require('chai').assert,
    zamano = require('../')('TEST_CLIENT_ID', 'TEST_PASSWORD'),
    nock   = require('nock'),
    http   = require('http')

var mtPath = '/Aggregation/servlet/implementation.listeners.http.SendTextMessage'

describe('zamano-api message submitting', function() {
	var scope = nock('http://mmg.zamano.com')
		.persist()
		.get(mtPath +
			'?sourceMsisdn=50015' +
			'&destinationMsisdn=3538703454' +
			'&messageText=Hello%20world' +
			'&operatorId=1' +
			'&clientId=TEST_CLIENT_ID' +
			'&password=TEST_PASSWORD')
		.replyWithFile(200, __dirname + '/testXML/success.xml')
		.get(mtPath +
			'?sourceMsisdn=50015' +
			'&destinationMsisdn=3538703454' +
			'&messageText=This%20Causes%20An%20Invalid%20Parameters%20Error' +
			'&operatorId=1' +
			'&clientId=TEST_CLIENT_ID' +
			'&password=TEST_PASSWORD')
		.replyWithFile(200, __dirname + '/testXML/invalid-parameters.xml')

	it('should request the server and call the callback with the parsed response', function(done) {

		zamano.sendMessage({
			sourceMsisdn:'50015',
			destinationMsisdn:'3538703454',
			messageText: 'Hello world',
			operatorId: '1'
		}, function(err, out) {
			assert.isNull(err, 'Error is null')
			assert.isObject(out, 'The output is an object')
			assert.deepEqual(out, { 
				requestId: '12546',
			  status: '0',
			  responseID: '545466' }, 'The output matches the XML document')
			done()
		})

	})

	it('should callback an error when the response has an error', function(done) {
		zamano.sendMessage({
			sourceMsisdn:'50015',
			destinationMsisdn:'3538703454',
			messageText: 'This Causes An Invalid Parameters Error',
			operatorId: '1'
		}, function(err, out) {
			assert.isNotNull(err, 'Error is not null')
			assert.throws(function() {throw err}, /Invalid Parameters/)
			done()
		})
	})

	it('should respond with an error if all fields are missing', function(done) {
		zamano.sendMessage({}, function(err, out) {
			assert.isNotNull(err, 'Error is not null')
			assert.throws(function() {throw err}, /Missing required fields: sourceMsisdn, destinationMsisdn, messageText, operatorId/)
			done()
		})
	})

})