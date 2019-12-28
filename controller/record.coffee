find = require '../service/dao/find'

module.exports =
	get: (req, rsp) ->
		req.id = req.params.id
		req.params.entity = 'record'
		res = await find req.c.code, req.params.entity, req
		unless res.entity
			rsp.status 350
		if res.count?
			for k, v of res.entity
				user = await dao.get(db, "user", {"wallet.address":v.receiver})
				v.receiveUser = user
				res.entity[k] = v
		else
			user = await dao.get(db, "user", {"wallet.address":res.entity.receiver})
			res.entity.receiveUser = user
		rsp.send res