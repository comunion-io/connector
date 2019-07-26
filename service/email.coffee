nodemailer = require('nodemailer')
smtpTransport = require('nodemailer-smtp-transport')

transPool = (email, host, psd)->
	_ePool[email] ?= nodemailer.createTransport smtpTransport
		host: host
		port: 465
#		port: 587
		secureConnection: true
		auth:
			user: email
			pass: psd

module.exports = (c, mo)->
	mo = _.pick mo, 'to', 'subject', 'html', 'text'
	mo.from =
		name: c.name
		address: c.email
	log mo
	log c
	transPool(c.email, c.mailHost, c.mailPsd).sendMail mo, (err, info)->
		log 'after email...'
		if err
			log err
		else
			log info