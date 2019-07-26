Mongodb = require('mongodb')

global._db = {}

module.exports = ->

	pk = (ob, prop...)->
		if prop and _.isArray prop[0]
			prop = prop[0]

		if prop.length is 1
			"#{prop[0]}": util.seqProp ob, prop[0]

		else if prop.length > 1
			res = {}
			for it in prop
				res[it] = util.seqProp ob, it
			res
		else
			{}

	@initDb = (name, s)->
		new Promise (resolve, reject)->
			Mongodb.MongoClient.connect s.db_url, {useNewUrlParser: true}, (e, client) ->
				if e
					reject e
				else
					resolve _db[name] = client.db(name)

	@agg = (db, entity, filter) ->
		gEnt(db, entity).aggregate filter

	@index = (db, entity, index, opt)->
		gEnt(db, entity).createIndex index, opt

	@get = (db, ent, filter, callback)->
		opt = {}
		if filter.projection
			opt =
				projection: util.d filter, 'projection'
		unless filter.sort
			opt.sort =
				lastUpdated: -1
		filter = @cleanOpt(filter)
		try
			doc = await gEnt(db, ent).findOne filter, opt
			doc._e = ent if doc
			callback?(doc)
			doc
		catch e
			log e

	@find = (db, entity, filter, op = {}, callback)->
		if op.sort
			for k,v of op.sort
				op.sort[k] = +(v)
		else
			op.sort =
				lastUpdated: -1
				row: -1
		try
			docs = await gEnt(db, entity).find(filter, op).toArray()
			for it in docs
				it._e = entity
			callback?(docs)
			docs
		catch e
			log e

	@cleanOpt = (opt) ->
		if opt._id
			if _.isArray opt._id
				opt._id = (oid(it) for it in opt._id)
			else if _.isString(opt._id)
				opt._id = oid(opt._id)
		opt

	@count = (db, entity, opt, callback)->
		try
			count = await gEnt(db, entity).countDocuments opt
			callback?(count)
			count
		catch e
			log e

	@qc = (db, entity, q, op, cb)->
		try
			res = await gEnt(db, entity).findOneAndUpdate q, op, {upsert: true, new: true, returnOriginal: false}
			cb?(res)
			res
		catch e
			log e

	@inc = (db, entity, q, op, cb)->
		op =
			$inc: op
		try
			await @qc db, entity, q, op, cb
		catch e
			log e

	@update = (db, entity, filter, opt, callback)->
		filter = @cleanOpt(filter)
		try
			doc = await gEnt(db, entity).update filter, opt, {upsert: true, new: true, returnOriginal: false}
			callback?(doc?.ops)
			doc?.ops
		catch e
			log e

	@patch = (db, entity, filter, opt)->
		if _.isString filter
			filter =
				_id: filter
		filter = @cleanOpt(filter)
		delete opt._id
		unless opt.$set
			opt =
				$set: opt
		try
			doc = await gEnt(db, entity).findOneAndUpdate filter, opt, {upsert: true, returnOriginal: false}
			doc.value
		catch e
			log e

	@findAndUpdate = (db, entity, filter, opt, callback)->
		filter = @cleanOpt(filter)
		delete opt._id
		try
			doc = await gEnt(db, entity).findOneAndUpdate filter, opt, {upsert: true, returnOriginal: false}
			item = doc.value
			callback?(item)
			item
		catch e
			log e

	@save = (code, entity, items, callback) ->
		[ent, keys] = entity.split(':')
		items = [items] unless _.isArray items
		try
			Ent = gEnt(code, ent)
			if keys
				ret = []
				keys = keys.split(',')
				for it in items
					filter = pk(it, keys)
					filter = @cleanOpt(filter)
					d = await Ent.findOneAndUpdate filter, {$set: it}, {upsert: true, returnOriginal: false}
					ret.push d.value
			else
				ret = (await Ent.insert items, {safe: true}).ops
			callback?(ret)
			ret
		catch e
			throw e

	@del = ()->
		log 'rm'

	@delItem = (db, entity, filter, opt = {w: 1}, callback)->
		if filter._id and !filter._id.$in
			m = 'deleteOne'
		else
			m = 'deleteMany'
		filter = @cleanOpt(filter)
		try
			res = await gEnt(db, entity)[m] filter, opt
			callback?(res)
			res
		catch e
			log e

	@remove = (db, entity, filter, callback)->
		try
			res = await gEnt(db, entity).remove(filter, justOne: 1)
			callback?(res)
		catch e
			log e

	@close = (name)->
		log 'closed ' + name
		_db[name]?.close()
		_db[name] = null

	@nc = (code, name)->
		_db[code].collection(name)

	@setDbList = (code, arr)->
		db = {}
		for cl in arr
			do (cl)->
				Object.defineProperty db, '$' + cl,
					enumerable: true,
					get: () => dao.nc code, cl
		db

	@

#	@get = (db, entity, filter, callback)->
#		opt = {}
#		if filter.projection
#			opt =
#				projection: util.d filter, 'projection'
#		unless filter.sort
#			opt.sort =
#				lastUpdated: -1
#		filter = @cleanOpt(filter)
#		@pick(db, entity).findOne filter, opt, (err, doc)->
#			throw err if err
#			doc._e = entity if doc
#			callback(doc)
#	@save = (db, entity, items, callback)->
#		[entity, keys] = entity.split(':')
#
#		items = [items] unless _.isArray items
#		if keys
#			keys = keys.split(',')
#			for it in items
#				filter = pk(it, keys)
#				filter = @cleanOpt(filter)
#				@pick(db, entity).findOneAndUpdate filter, {$set: it}, {upsert: true, returnOriginal: false}, (err, docs)->
#					throw err if err
#					callback?(docs.value)
#		else
#			@pick(db, entity).insertMany items, {safe: true}, (err, docs)->
#				throw err if err
#				callback?(docs.ops)
#	@find = (db, entity, filter, op = {}, callback)->
#		if op.sort
#			for k,v of op.sort
#				op.sort[k] = +(v)
#		else
#			op.sort =
#				lastUpdated: -1
#				row: -1
#		try
#			@pick(db, entity).find(filter, op).toArray (err, docs)->
#				throw err if err
#				for it in docs
#					it._e = entity
#				callback?(docs)
#		catch e
#			log e

#	@pick = (name, cName)->
#		if cName in ['community']
#			name = _mdb
#		try
#			if (@name is name) and (@cName is cName)
#				@collection
#			else
#				if db = _db[name]
#					@name = name
#					@cName = cName
#					return @collection = db.collection(cName)
#				else
#					log 'no db: ' + name
#		catch e
#			log e