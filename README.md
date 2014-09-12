zamano-api
==========

Node.js API for Zamano, a mobile message aggregation service.  Allows servers to send and recieve mobile text and binary messages.

Setup
-----

To install the package, run:

  `npm install zaman-api`
  
Then call `require` with your ID and password provided by Zamano to identify your server.

  ```JavaScript
  var zamano = require('zamano-api')('ZAMANO_ID', 'ZAMANO_PASSWORD')
  ```

Usage
-----

Zamano has API methods for both sending and receiving mobile messages.

### zamano.sendMessage(opts, callback)

Sends a message to a mobile number, returning either a success object or error object with messages from Zamano's service.  Internally, this method sends a request to Zamano's HTTP API and parses the XML response into a JavaScript object.

Params:
  - `opts` (Object) 
    * `
  - `callback` function - 

### zamano.handleMessages(opts)

Express middleware for parsing SMS message requests from Zamano.  Use the function as middleware in a app.get('<URL>') function to authenticate the request from Zamano and add a `mobileMessage` property to the `request` object:

  ```Javascript
  app.get('/api/mo', zamano.mobileMessage(), function(req, res) {
    console.dir(req.mobileMessage)
  })
  ```

The mobileMessage object has the following properties:
  
