var http        = require('http'),
		parseString = require('xml2js').Parser({explicitArray:false, explicitRoot:false}).parseString,
		querystring = require('querystring')


function sendMessage (opts, cb) {
	// Check for missing required fields
	opts = opts || {}
	var requiredFields = ['sourceMsisdn','destinationMsisdn','messageText','operatorId']
	var missingFields = requiredFields.filter(function(key) {
		return !opts.hasOwnProperty(key)
	})
	if(missingFields.length) {
		// Return and call the callback with an error asynchronously
		return setImmediate(
			cb.bind(null, 
				new Error('Missing required fields: ' + missingFields.join(', '))
			)
		)
	}
	
	// Defaults ID and password to global parameters
	opts.clientId = opts.clientId || this.zamanoId
	opts.password = opts.password || this.password

	var params = querystring.stringify(opts)

	// Make request to zamano server
	http.get('http://mmg.zamano.com' + 
		'/Aggregation/servlet/implementation.listeners.http.SendTextMessage?' + params, 
		handleResponse)
	.on('error', function handleError(err) {
		return cb(err)
	})

	function handleResponse(res) {
		var xmlResponse = ''
		// Collect response into one string
		res.on('data', function aggregateResponse(chunk) {
			xmlResponse += chunk
		})
		res.on('end', translateXML)

		function translateXML() {
			// Parse string of XML to object
			parseString(xmlResponse, function useObject(err, result) {
				if (err) { return cb(err) }
				// Only return success if XML says it was successful
				if (result.status === '0') { return cb(null, result) }

				return cb(new Error(result.errorText))
			})
		}
	}
}

function messageHandler (opts) {
	var self = this

	return function hook(req, res, next) {
		// Check if the request used the correct ID and password
		if (req.query.username === self.zamanoId && req.query.password === self.password) {
			req.mobileMessage = req.query
			next()
		} else {
			next(new Error('Request not authenticated'))
		}
	}
}


exports = module.exports = function zamano (zamanoId, password) {
	return {
		zamanoId: zamanoId,
		password: password,
		sendMessage: sendMessage,
		messageHandler: messageHandler,

		version: '0.1.0'
	}
}
