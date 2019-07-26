module.exports = (code, entity, d)->
	bo = d.body

	after = util.del 'afterSave', bo
	before = util.del 'beforeSave', bo

	if before
		rt = []
		for it in before.split(',')
			res = gs(code, it)(d, bo)
			if res and res.error
				rt.push res.msg
		if rt.length
			return util.r {err: true}, rt.join('\n')

	if bo._attrs
		_attrs = bo._attrs.split(',')

	if bo._unset
		unset = bo._unset

	filter =
		_id: oid(d.id)

	if d.query.q
		_.extend filter, d.query.q

	queryUtil.cleanItem(bo)

	if bo.$set or bo.$push or bo.$pull
		bo.$set ?= {}
		bo.$set.lastUpdated = util.del('lastUpdated', bo)
	else
		bo =
			$set: bo
	if unset
		bo.$unset = unset
	try
		item = await dao.findAndUpdate code, entity, filter, bo

		queryUtil.afterPersist(item, entity)

		gs(code, it)(d, item) for it in after.split(',') if after

		ri = if _attrs
			_attrs.push('_id')
			_.pick(item, _attrs)
		else
			item

		util.r ri, 'm_update_ok'
	catch e
		log e
		msg: e.errmsg
		err: 1

