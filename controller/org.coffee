comunionDao = require 'comunion-dao'
OrgToken = comunionDao.comunionDao

module.exports =
	membersInfo: (req, rsp) ->
		code = req.c.code
		try
			org = await dao.one code, 'org', _id: oid(req.params.id)
			for it,idx in org.members
				u = await dao.one code, 'user', _id: it._id
				if u
					delete u.password
					_.extend org.members[idx], u
			rsp.send entities: org.members
		catch e
			log e
	
	financeUpdate: (req, rsp) ->
		code = req.c.code
		try
			org = await dao.one code, 'org', _id: oid(req.params.id)
			finance = org.finance || []
			bo = req.body
			finance.push bo
			await dao.findAndUpdate code, 'org', _id: oid(req.params.id), {$set: {finance: finance}}
			rsp.send msg: 'm_ok'
		catch e
			log e
			rsp.send
				err: 1
				msg: '数据错误'