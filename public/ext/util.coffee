crypto = require('crypto')

checkEt = (it)->
	it.password && delete it.password
	for k, v of it
		if _.isObject(v)
			checkEt(v)
		else
			if v is 'false'
				it[k] = false
			else if v is 'true'
				it[k] = true

module.exports =
	moPath: (code)->
		path = "/public/module/#{code}"
		if app.env
			'.' + path
		else
			_path + path

	sPath: (code)->
		path = "/public/res/upload/#{code}"
		if app.env
			'.' + path
		else
			_path + path

	sha256: (str)->
		crypto.createHash('sha256').update(str).digest('base64')

	d: (it, p)->
		rs = it[p]
		delete it[p]
		rs

	r: (it, extra, e)->
		if _.isArray it
			checkEt t for t in it
			entities: it
			count: extra || it.length
		else if it
			checkEt it
			entity: it
			msg: extra
			_e: e
		else
			_e: e
			msg: 'm_find_no'

	refFile: (ob, key = 'head', idx = 0)->
		rf = ob.refFile
		if rf and rf[key] and rf[key].length
			if idx?
				rf[key][idx]
			else
				rf[key]
		else
			null

	dly: (t = 3) ->
		t *= 1000
		r = parseInt(Math.random() * t / 2)
		if r % 2 is 0
			t += r
		else
			t -= r
		new Promise (resolve) ->
			setTimeout(resolve, t)