var assert = require('chai').assert;
var zamano = require('../')('TEST_CLIENT_ID', 'TEST_PASSWORD');
var nock   = require('nock');
var http   = require('http');

describe('zamano-api message submitting', function() {
	var scope = nock('http://mmg.zamano.com')
		.persist()
		.get('/')
		.replyWithFile(200, __dirname + '/testXML/success.xml')
		.get('/Aggregation/servlet/implementation.listeners.http.SendTextMessage' +
			'?sourceMsisdn=50015' +
			'&destinationMsisdn=3538703454' +
			'&messageText=Hello%20world' +
			'&operatorId=1' +
			'&clientId=TEST_CLIENT_ID' +
			'&password=TEST_PASSWORD')
		.replyWithFile(200, __dirname + '/testXML/invalid-parameters.xml')
		.get('/Aggregation/servlet/implementation.listeners.http.SendTextMessage' +
			'?sourceMsisdn=50015' +
			'&destinationMsisdn=3538703454' +
			'&messageText=Hello%20world' +
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
			  status: '13',
			  responseID: '545466',
			  errorText: 'Invalid Parameters' }, 'The output matches the XML document')
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

});