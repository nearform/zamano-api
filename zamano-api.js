var http = require('http'),
		parseString = new require('xml2js').Parser({explicitArray:false, explicitRoot:false}).parseString,
		querystring = require('querystring')


function sendMessage (opts, cb) {
	// Set defaults for opts
	opts = opts || {}
	var requiredFields = ['sourceMsisdn','destinationMsisdn','messageText','operatorId']
	var missingFields = requiredFields.filter(function(key) {
		return !opts.hasOwnProperty(key)
	})
	if(missingFields.length) {
		return cb(new Error('Missing required fields: ' + missingFields.join(', ')))
	}
	
	opts.clientId = this.clientId
	opts.password = this.password

	var params = querystring.stringify(opts)

	// Make request to zamano server
	http.get('http://mmg.zamano.com' + 
		'/Aggregation/servlet/implementation.listeners.http.SendTextMessage?' + params, 
		handleResponse)
	.on('error', function(err) {
		return cb(err)
	})

	function handleResponse(res) {
		var xmlResponse = ''
		res.on('data', function(chunk) {
			xmlResponse += chunk
		})
		res.on('end', translateXML)

		function translateXML() {
			parseString(xmlResponse, function(err, result) {
				return cb(null, result)
			})
		}
	}
}


exports = module.exports = function zamano (clientId, password) {
	return {
		clientId: clientId,
		password: password,
		sendMessage: sendMessage,

		sendBulk: function sendBulk(options, cb) {
			// body...
		},

		messageHandler: function messageHandler (options, cb) {
			return function(req, res, next) {
				next();
			}
		},

		setAuth: function(username, password) {
			// body...
			return {
				username: username,
				password: password
			}
		},

		version: '0.0.0'
	}
}