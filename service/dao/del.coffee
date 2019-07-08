module.exports = (code, entity, d)->
	if d.id
		await dao.delItem code, entity, _id: oid(d.id)
		if entity is 'user'
			await dao.delItem code, 'membership', uid: oid(d.id)
		msg: 'm_del_ok'
	else if d.body and d.body.q
		q = queryUtil.queryClean(d.body.q)
		await dao.remove code, entity, q
		msg: 'm_del_ok'
