nodemailer = require('nodemailer')
smtpTransport = require('nodemailer-smtp-transport')

transPool = (email, host, psd)->
	_ePool[email] ?= nodemailer.createTransport smtpTransport
		host: host
		port: 465
		secureConnection: true
		auth:
			user: email
			pass: psd

module.exports = (c, mo)->
	mo = _.pick mo, 'to', 'subject', 'html', 'text'
	mo.from =
		name: c.name
		address: c.email
	mo.to = mo.to.toString().trim()
	log mo
	transPool(c.email, c.mailHost, c.mailPsd).sendMail mo, (err, info)->
		if err
			log err
		else
			log info