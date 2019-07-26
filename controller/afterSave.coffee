gStub.comunion =
	afterSaveOrg: (req, item)->
		try
			psd = util.randomChar(5)
			await dao.save req.c.code, 'user',
				email: item.email
				password: util.sha256(psd)
				orgs: [
					_id:  item._id
					name: item.name
				]
			log 'uusss'
			sStr = pug.renderFile("#{_path}/view/tmpl/regDone.pug", {psd})
			c =
				email: 'postmaster@comunion.io'
				mailHost: 'mail.comunion.io'
				mailPsd: '7Sn7TPoEzePmn7ze'
			sEmail c,
				to: item.email
				subject: '恭喜，注册Comunion成功'
				html: sStr
				text: '注册Comunion成功'
		catch e
			throw e


