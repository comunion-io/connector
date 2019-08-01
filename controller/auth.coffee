code = app.db

afterAuth = (user, req, rsp)->
	rsp.send
		user: user
		msg: 'm_login_s'

errAuth = (req, rsp)->
	rsp.status(350).send
		err: 1
		msg: 'm_login_f'
		toUrl: req.body.toUrl

module.exports =

	check: (req, rsp) ->
		rsp.send user: req.session

	login: (req, rsp) ->
		bo = req.body
		opt = if bo.email
			email: bo.email
		else
			username: bo.username
		if user = await dao.get(code, 'user', opt)
			if bo._en
				if user.password isnt bo.password
					errAuth req, rsp
					return
			else
				if user.password isnt util.sha256(bo.password)
					errAuth req, rsp
					return
			delete user.password
			afterAuth user, req, rsp
		else
			errAuth req, rsp
			return


	logout: (req, rsp) ->
		if req.cookies._ncs_
			cms.del req, rsp
		rsp.send msg: 'm_logout_s'

	register: (req, rsp, next) ->
		bo = req.body
		unless bo.username
			rsp.send
				err: 1
				msg: '数据错误'
		unless bo.password
			rsp.send
				err: 1
				msg: '数据错误'

		req.entity = 'user'
		req.password = bo.password
		bo.password = util.sha256(bo.password)
		next()

	resetPsd: (req, rsp) ->
		bo = req.body
		code = req.c.code

		res = gs(null, 'verifyCode')(req, bo)
		if res.error
			rsp.status 390
			rsp.send msg: '验证码错误'
			return

		bo = req.body
		fo = if bo.phone
			phone: bo.phone
		else
			email: bo.email

		$set =
			password: util.sha256(bo.password)

		if res = await dao.findAndUpdate code, 'user', fo, {$set}
			rsp.send msg: '修改成功'
		else
			rsp.status 390
			rsp.send msg: '用户不存在'

	orgStatus: (req, rsp) ->
		org = await dao.get req.c.code, 'org', _id: oid(req.params.id)
		ret = if org
			status: org.status
		else
			err: 1
			msg: 'No org'
		rsp.send ret

	checkPsd: (req, rsp) ->
		bo = req.body

		user = await dao.get req.c.code, 'user',
			_id: bo._id

		if user and !user.password and bo.password is 'psd'
			rsp.send
				msg: '验证成功'
		else if !user or user.password isnt util.sha256(bo.password)
			rsp.status 390
			rsp.send msg: '密码错误'
		else
			rsp.send
				msg: '验证成功'