http = require('http')
url = require('url')

module.exports = (path)->
	new Promise (resolve, reject) ->
		try
			options =
				method: 'HEAD'
				host: url.parse(path).host
				port: 80
				path: url.parse(path).pathname

			req = http.request options, (r)->
				resolve r.statusCode is 200
			req.end()
		catch e
			reject e

