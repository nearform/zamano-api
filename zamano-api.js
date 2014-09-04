exports = module.exports = function zamano (username, password) {
	var messageClient = {
		sendMessage: function sendMessage (options, cb) {
			// body...
		},
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

	return messageClient;
}