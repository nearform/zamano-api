exports = module.exports = function zamano (username, password, options, cb) {
	var messageClient = {
		sendMessage = function sendMessage (argument) {
			// body...
		}
	}

	return messageClient;
}

exports.messageHandler = function(req, res, next) {
	next();
}

exports.version = '0.0.0';