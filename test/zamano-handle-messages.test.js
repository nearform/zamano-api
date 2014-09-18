var assert  = require('chai').assert,
		zamano  = require('../')('TEST_CLIENT_ID', 'TEST_PASSWORD'),
		app     = require('express')(),
		request = require('request'),
		http    = require('http')

describe('zamano-api message receiving', function() {

	app.get('/api/MO', zamano.messageHandler(), function(req, res) {
		res.send(req.mobileMessage)
	})

	app.get('/api/MO/err/', zamano.messageHandler(), function(err, req, res, next) {
		if (err) { res.send(err) }
	})

	var server = http.createServer(app)
	server.listen(3000)

	var testURL = 'http://localhost:3000'
	it('should add a mobileMessage object to the request', function(done) {
		request({
			method: 'GET',
			url: testURL + '/api/MO' + '?username=TEST_CLIENT_ID&password=TEST_PASSWORD'
		}, function(err, res, body) {
			assert.isNull(err)
			assert.isString(body)
			var bodyObj = JSON.parse(body)
			assert.deepEqual(bodyObj, {username:'TEST_CLIENT_ID', password:'TEST_PASSWORD'})
			done()
		})
	})

	it('should throw an error when username and password are incorrect', function(done) {
			request({
				method: 'GET',
				url: testURL + '/api/MO/err' + '?username=INCORRECT_ID&password=WRONG_PASSWORD'
			}, function(err, res, body) {
				assert.isNotNull(body)
				done()
			})
	})
})