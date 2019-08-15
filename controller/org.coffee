module.exports =
	membersInfo: (req, rsp) ->
		code = req.c.code
		try
			org = await dao.one code, 'org', _id: oid(req.params.id)
			for it,idx in org.members
				u = await dao.one code, 'user', _id: it._id
				if u
					_.extend org.members[idx], u
			rsp.send entities: org.members
		catch e
			log e