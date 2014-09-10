var assert = require('chai').assert;
var zamano = require('../')();
var nock   = require('nock');
var http   = require('http');

describe('zamano-api message submitting', function() {
	var scope = nock('http://mmg.zamano.com')
		.persist()
		.get('/')
		.replyWithFile(200, __dirname + '/testXML/success.xml')
		.get('/Aggregation/servlet/implementation.listeners.http.SendTextMessage' +
			'?clientId=<ClientID>' +
			'&password=<password>' +
			'&sourceMsisdn=<shortcode>' +
			'&operatorId=<OperatorID>' +
			'&destinationMsisdn=<MS-ISDN>' +
			'&messageText=<Text+of+the+Message>' +
			'&requestId=<Message_unique_ID>')
		.replyWithFile(200, __dirname + '/testXML/success.xml')

	it('should request the server and call the callback with the parsed response', function(done) {

		zamano.sendMessage({
			sourceMsisdn:'50015',
			destinationMsisdn:'3538703454',
			messageText: 'Hello world',
			operatorId: '1'
		}, function(err, out) {
			assert.isNull(err, 'Error is null')
			assert.isObject(out, 'The output is an object')
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