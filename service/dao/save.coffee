queryUtil = require './queryUtil'

module.exports = (code, entity, d, fn)->
	bo = d.body
	if bo
		after = util.del 'afterSave', bo
		before = util.del 'beforeSave', bo

	if before
		rt = []
		for it in before.split(',')
			res = gs(code, it)(d, bo)
			if res and res.error
				rt.push res.msg
		if rt.length
			return util.r {error: true}, rt.join('\n')


	if bo._attrs
		_attrs = bo._attrs.split(',')

	queryUtil.cleanItem(bo, true)

	item = await  dao.save code, entity, bo

	for s in item
		queryUtil.afterPersist(s, entity)
		gs(code, it)(d, s) for it in after.split(',') if after

	if item.length is 1
		item = item[0]
		ri = if _attrs
			_attrs.push('_id')
			_.pick(item, _attrs)
		else
			item
	else
		ri = item

	ri._e = entity unless ri._e

	util.r ri, 'm_create_ok'