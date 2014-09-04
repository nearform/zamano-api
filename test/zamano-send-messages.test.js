var assert = require('chai').assert;
var zamano = require('../')();
var sinon  = require('sinon');

describe('zamano-api message submitting', function() {
	var server;
	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	it('should request the server and call the callback with the parsed response', function() {
		server.respondWith('HTTP://mmg.zamano.com/Aggregation/servlet/implementation.listeners.http.SendTextMessage', [
			200,
			{ 'Content-Type': 'text/xml' },
			'<?xml version="1.0" encoding="ISO-8859-1" ?> ' +
				'<acknowledgement>' +
					'<requestId>12546</requestId>' +
					'<status>13</status>' +
					'<responseID>545466</responseID>' +
					'<errorText>Invalid Parameters</errorText>' +
				'</acknowledgement>'
		]);

		var callback = sinon.spy()
		zamano.sendMessage({number: 'number', message: 'message'}, callback);
		server.respond();

		sinon.assert.calledWith(callback, { requestId: '12546', status: '13', responseID: '545466' });
	});

});