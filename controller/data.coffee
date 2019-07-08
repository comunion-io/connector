async = require('async')
queryUtil = require '../service/dao/queryUtil'

save = require '../service/dao/save'
find = require '../service/dao/find'
edit = require '../service/dao/edit'
del = require '../service/dao/del'

dataController =

	get: (req, rsp) ->
		req.id = req.params.id
		res = await find req.c.code, req.params.entity, req
		unless res.entity
			rsp.status 350
		rsp.send res

	list: (req, rsp) ->
		rsp.send await find(req.c.code, req.params.entity, req)

	agg: (req, rsp)->
		code = req.c.code
		qu = req.query
		ft = []
		if qu.q
			ft.push $match: queryUtil.queryClean(qu.q)
		if qu.g
			ft.push $group: qu.g
		rsp.send await dao.agg(code, req.params.entity, ft).toArray()

	matchDel: (req, rsp) ->
		bo = queryUtil.cleanItem(req.body)
		await dao.remove req.c.code, bo.ent, bo.q
		rsp.send msg: 'm_del_ok'

	del: (req, rsp) ->
		req.id = req.params.id
		res = await del req.c.code, req.params.entity, req
		rsp.send res

	edit: (req, rsp) ->
		req.id = req.params.id
		ret = await edit req.c.code, req.params.entity, req
		if ret.error
			rsp.status 405
		rsp.send ret

	save: (req, rsp) ->
		ret = await save req.c.code, req.params.entity, req
		if ret.error
			rsp.status 405
		rsp.send ret

	comp: (req, rsp) ->
		opt = {}
		code = req.c.code
		for k,v of req.query
			if k.indexOf('_')
				[entity, limit] = k.split('_')
				opt[entity] = do(entity, limit, v)->
					(cb)->
						op =
							skip: 0
							limit: limit
							sort:
								lastUpdated: -1
							projection:
								title: 1
								brief: 1
								lastUpdated: 1
								refFile: 1
								list: 1
						if v.status
							v.status = +v.status
						dao.find code, entity, v, op, (res)->
							cb(null, res)

		async.parallel opt, (err, res)->
			rsp.send res

	inc: (req, rsp)->
		op =
			_id: oid(req.params.id)
		d =
			$inc: {}
		d.$inc[req.params.prop] = 1
		dao.qc req.c.code, req.params.entity, op, d
		rsp.send {}

	getByKey: (req, rsp) ->
		code = req.c.code
		pa = req.params
		filter = {}
		if /^(\d|[a-z]){24}$/.test(pa.val)
			pa.val = oid(pa.val)
		filter[pa.key] = pa.val
		item = await dao.get(code, pa.entity, filter)
		rsp.send util.r(item)

	getSub: (req, rsp)->
		code = req.c.code
		entity = req.params.entity
		prop = req.params.prop
		qo = {}
		qo[req.params.q] = req.params.qv
		dao.get code, entity, qo, (item)->
			po = if prop
				util.r item[prop]
			else
				item
			rsp.send po

	subOp: (req, rsp)->
		code = req.c.code
		entity = req.params.entity
		pEntity = req.params.pEntity
		bo = req.body

		filter = {}

		opt =
			$push:
				entity: obj

		dao.findAndUpdate code, pEntity, filter, opt, (item)->

	cleanCache: (req, rsp)->
		opt =
			k:
				$regex: req.c.url
		dao.delItem req.c.code, 'cache', opt, (res)->
			log 'clean Cache...'
			rsp.send msg: 'm_del_ok'

	editSub: (req, rsp)->
		code = req.c.code
		entity = req.params.entity
		bo = req.body
		if (so = bo.op) and !so.$set
			so =
				$set: so
		dao.update code, entity, queryUtil.queryClean(bo.q), queryUtil.queryClean(so), (d)->
			rsp.send(msg: 'm_update_ok', entity: _.pick(d, '_id', '_e', bo.prop))

	delSub: (req, rsp)->
		code = req.c.code
		entity = req.params.entity
		bo = req.body
		dao.update code, entity, queryUtil.queryClean(bo.q), queryUtil.queryClean(bo.op), (err, res)->
			rsp.send msg: 'm_del_ok'


	saveSub: (req, rsp)->
		code = req.c.code
		pa = req.params
		entity = pa.entity

		qs = {}
		qs[pa.q] = pa.qv
		if qs._id
			qs._id = oid(qs._id)

		bo = req.body

		if bo._str
			bo = bo._str
		else
			if bo._q
				_.extend qs, bo._q
				delete bo._q
			bo = queryUtil.cleanItem bo

		op = {}

		op["$#{pa.type}"] = {}
		if pa.type is 'pull'
			delete bo.lastUpdated
		op["$#{pa.type}"][pa.prop] = bo

		dao.findAndUpdate code, entity, qs, op, (doc)->
			if doc
				rsp.send(msg: 'm_update_ok', entity: _.pick(doc, '_id', '_e', pa.prop))
			else
				rsp.send(msg: 'm_update_ok')

	favorite: (req, rsp)->
		code = req.c.code
		pa = req.params
		entity = pa.entity
		id = pa.id
		uid = pa.uid
		try
			Ent = await gEnt(code, entity)
			q =
				'ref._id': oid(id)
			count = await Ent.countDocuments(q)
			q['user._id'] = oid(uid)
			uCount = await Ent.countDocuments(q)
			rsp.send {count, uCount}
		catch e
			log e

	userRank: (req, rsp)->
		code = req.c.code
		pa = req.params

		ent = pa.entity
		q = {}
		q[pa.key] = pa.val
		dao.get code, ent, q, (res)->
			if res
				qq = {}
				qq[pa.prop] =
					$lt: util.seqProp(res, pa.prop)
				dao.count code, ent, qq, (count)->
					res.rankNum = count
					rsp.send res
			else
				rsp.send msg: 'm_find_no'

	count: (req, rsp)->
		code = req.c.code
		entity = req.params.entity
		q = {}
		qu = req.query
		if qu and qu.q
			q = queryUtil.queryClean(qu.q)
		if q.score and q.score.$gt
			q.score.$gt = +(q.score.$gt)
		rsp.send count: await gEnt(code, entity).countDocuments(q)

module.exports = dataController