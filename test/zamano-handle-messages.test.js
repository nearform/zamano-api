var assert  = require('chai').assert,
		zamano  = require('../')('TEST_CLIENT_ID', 'TEST_PASSWORD'),
		app     = require('express')(),
		request = require('request'),
		http    = require('http')

// Express and http are used to set up a locally run app
// that utilizes the messageHandler middleware.  Request
// is then used to create a mock client (which would be zamano's
// aggregation server in a real case)

describe('zamano-api message receiving', function() {

	// Used to test authetication when object is passed
	app.get('/api/MO', zamano.messageHandler({
			username:'TEST_USERNAME',
			password:'TEST_MO_PASSWORD'
		}), function(req, res, next) {
			// req.mobileMessage is sent back to the client
			// to perform request-specific assertions
			res.send(req.mobileMessage)
	})

	// Used to test the abscence of authentication when
	// no object is passed to the middleware
	app.get('/api/noauth', zamano.messageHandler(), function(req, res, next) {
		res.send(req.mobileMessage)
	})

	// Initiate server to listen on port 3000
	var server = http.createServer(app)
	server.listen(3000)

	var testURL = 'http://localhost:3000'

	it('should add a mobileMessage object to the request', function(done) {
		// Request the server with a mock client with the correct username and password
		request({
			method: 'GET',
			url: testURL + '/api/MO' + '?username=TEST_USERNAME' + '&password=TEST_MO_PASSWORD'
		}, function(err, res, body) {
			assert.isNull(err)
			assert.isString(body)
			var bodyObj = JSON.parse(body)
			// Assert that the request was authenticated and the req.mobileMessage was correct
			assert.deepEqual(bodyObj, {username:'TEST_USERNAME', password:'TEST_MO_PASSWORD'})
			done()
		})
	})


	it('should throw an error when username and password are incorrect', function(done) {
			// Request the server with an incorrect password and username
			request({
				method: 'GET',
				url: testURL + '/api/MO' + '?username=INCORRECT_ID&password=WRONG_PASSWORD'
			}, function(err, res, body) {
				assert.isNotNull(body)
				var bodyObj = JSON.parse(body)
				// Assert that the middleware prevents the request from going through
				// when there is incorrect authentication
				assert.deepEqual(bodyObj, {error: 'Request not Authenticated'})
				done()
			})
	})

	it('should ignore authentication when there is no options object', function(done) {
		request({
			method: 'GET',
			url: testURL + '/api/noauth' + '?username=WRONG_TEST_USERNAME' + '&password=WRONG_TEST_MO_PASSWORD'
		}, function(err, res, body) {
			assert.isNull(err)
			assert.isString(body)
			var bodyObj = JSON.parse(body)
			assert.deepEqual(bodyObj, {username:'WRONG_TEST_USERNAME', password:'WRONG_TEST_MO_PASSWORD'})
			done()
		})
	})
})