mailOpt =
	email: 'postmaster@comunion.io'
	mailHost: 'mail.comunion.io'
	mailPsd: '7Sn7TPoEzePmn7ze'

gStub.comunion =
	sendPsdEmail: (req, item)->
		type = if req.originalUrl.indexOf('resetPsd') > -1
			'resetPsd'
		else
			'newUser'
		opt =
			psd: req.body.password
			type: type
			username: item.username

		sStr = pug.renderFile "#{_path}/view/tmpl/regDone.pug", opt

		sEmail mailOpt,
			to: item.email
			subject: 'Congratulations，registered Comunion successfully'
			html: sStr
			text: 'Comunion'


	afterSaveOrg: (req, item)->
		code = req.c.code
		try
			psd = util.randomChar(5)
			email = item.email
			if u = await dao.get code, 'user', {email}
				username = u.username
				type = 'oldOrgUser'
				$push =
					orgs:
						_id:  item._id
						name: item.name
						role: 'owner'
				await dao.update code, 'user', {_id: u._id}, {$push}
			else
				username = email
				type = 'newOrgUser'
				await dao.save code, 'user',
					email: email
					password: util.sha256(psd)
					orgs: [
						_id:  item._id
						name: item.name
						role: 'owner'
					]

			opt =
				psd: psd
				orgName: item.name
				type: type
				username: username
			sStr = pug.renderFile "#{_path}/view/tmpl/regDone.pug", opt

			sEmail mailOpt,
				to: item.email
				subject: 'Congratulations，registered Comunion successfully'
				html: sStr
				text: 'Comunion'

		catch e
			throw e


