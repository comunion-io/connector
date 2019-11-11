module.exports =
	set: (req, rsp, user, maxAge = Date.day)->
		token = util.randomChar(32)
		user.token = token
		rsp.cookie "token", user._id, maxAge: maxAge
		dao.save req.c.code, 'session:_id', user

	update: (code, id, opt)->
		dao.update code, 'session', {_id: id}, opt

	get: (req, rsp)->
		if ncs = req.cookies.token
			ret = await gEnt(req.c.code, 'session').findOne token: ncs
			if ret
				req.session = ret
			else
				rsp.clearCookie 'token'

	del: (req, rsp)->
		dao.delItem req.c.code, 'session', _id: req.cookies.token
		rsp.clearCookie 'token'

	required: (req, rsp, next)->
		if (s = req.session) and !s.can_verify and !s.need_verify
			next()
		else
			rsp.status(360).json msg: '请先登录', toUrl: '#!/signin'

	requiredRole: (role)->
		(req, rsp, next)->
			if (u = req.session) and u.roles.findBy('title', role)
				next()
			else
				rsp.status(360).json msg: '请重新登录', toUrl: 'signin'

	requiredUser: (req, rsp, next)->
		if (u = req.session) and u.email == req.body.email
				next()
			else
				rsp.status 390
				rsp.send msg: '用户权限错误'
