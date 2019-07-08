module.exports = (code, name)->
	@db = _db[code].collection(name || 'b_cache')

	@db.createIndex({t: 1}, {expireAfterSeconds: 0})

	@set = (k, v, t = 7200)->
		$set =
			v: v
			t: new Date(Date.now() + t * 1000)
		@db.findOneAndUpdate {k}, {$set}, {upsert: true}

	@get = (k)->
		@db.findOne({k}).then (ret)->
			if ret
				ret.v
			else
				null

	@del = (k)->
		@db.findOneAndDelete {k}

	@update = (k, $set)->
		@db.findOneAndUpdate {k}, {$set}

	@