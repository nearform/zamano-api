var http        = require('http'),
		parseString = require('xml2js').Parser({explicitArray:false, explicitRoot:false}).parseString,
		querystring = require('querystring')


function sendMessage (opts, cb) {
	// Set defaults for opts
	opts = opts || {}
	var requiredFields = ['sourceMsisdn','destinationMsisdn','messageText','operatorId']
	var missingFields = requiredFields.filter(function(key) {
		return !opts.hasOwnProperty(key)
	})
	if(missingFields.length) {
		return setImmediate(function() {
			return cb(new Error('Missing required fields: ' + missingFields.join(', ')))
		})
	}
	
	opts.clientId = opts.clientId || this.zamanoId
	opts.password = opts.password || this.password

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
				if (err) { return cb(err) }
				if (result.status === '0') { return cb(null, result) }

				return cb(new Error(result.errorText))
			})
		}
	}
}

function messageHandler (opts) {
	var self = this

	return function hook(req, res, next) {
		if (req.query.username === self.zamanoId && req.query.password === self.password) {
			req.mobileMessage = req.query
			next()
		} else {
			next('Request not authenticated')
		}
	}
}


exports = module.exports = function zamano (zamanoId, password) {
	return {
		zamanoId: zamanoId,
		password: password,
		sendMessage: sendMessage,
		messageHandler: messageHandler,

		version: '0.0.0'
	}
}