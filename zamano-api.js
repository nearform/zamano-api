var http        = require('http'),
    parseString = require('xml2js').Parser(
      {explicitArray:false, explicitRoot:false}).parseString,
    querystring = require('querystring')


function sendMessage (opts, cb) {
  // Check for missing required fields
  opts = opts || {}
  var requiredFields = ['destinationMsisdn','messageText']

  // Filter the required fields to determine which fields
  // are missing from the opts object
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
  opts.clientId = opts.clientId || this.clientId
  opts.password = opts.password || this.password

  // Defaults sourceMsisdn to 8060 (the bulk route for Irish mobiles)
  opts.sourceMsisdn = opts.sourceMsisdn || '8060'

  // Defaults operatorId to Vodafone (1)
  opts.operatorId = opts.operatorId || '1'

  var params = querystring.stringify(opts)

  // Make request to zamano server
  http.get(
    'http://mmg.zamano.com' + 
      '/Aggregation/servlet/implementation.listeners.http.SendTextMessage?' + params, 
    handleResponse

  ).on('error', function handleError(err) {
    return cb(err)
  })

  function handleResponse(res) {
    var xmlResponse = ''
    // Collect response into one string
    res.on('data', function aggregateResponse(chunk) {
      xmlResponse += chunk
    })

    res.on('end', function translateXML() {
      // Parse string of XML to object
      parseString(xmlResponse, function useObject(err, result) {
        if (err) { return cb(err) }
        // Only return success if XML says it was successful
        if (result.status === '0') { return cb(null, result) }

        return cb(new Error(result.errorText))
      })
    })
  }
}


function messageHandler (opts) {
  var self = this

  // NOTE: username and password are not the same for handler
  // and client. Thus, global id and password cannot be used as defaults

  return function hook(req, res, next) {
    // Check if the request used the correct ID and password
    if (!opts) {
      req.mobileMessage = req.query
      next()
    }  
    else if (req.query.username === opts.username && 
             req.query.password === opts.password) 
    {
      req.mobileMessage = req.query
      next()
    } 
    else {
      res.status(500)
      res.send({error: 'Request not Authenticated'})
    }
  }
}


exports = module.exports = function zamano (clientId, password) {
  return {
    clientId: clientId,
    password: password,
    sendMessage: sendMessage,
    messageHandler: messageHandler,
  }
}
