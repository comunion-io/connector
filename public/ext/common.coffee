module.exports =
	rStr: '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM'
	slice: Array::slice
	ro: (ob)->
		str = ''
		if _.isArray ob
			ob.join(',')
		else if _.isObject ob
			for k,v of ob
				str += "#{k}:#{v} \n"
			str
		else
			ob

	isChinese: (text)->
		unless _.isString text
			false
		if text
			txt = text.replaceAll('’', "").replaceAll('–', '')
		if escape(txt).indexOf('%u') < 0
			false
		else
			true
	del: (x, ctx = window)->
		it = ctx[x] #return unless it is undefined
		try
			delete ctx[x]
		catch e
			ctx[x] = undefined
		it

	pureText: (text) ->
		text.replace(/<[^>].*?>/g, "")

	cutText: (text, length = 30) ->
		if text.length < length
			return text
		else
			text.substr(0, length - 3) + '...'

	adjustText: (text, length = 30) ->
		return '' unless text
		text = text.toString().replace(/<[^>].*?>/g, "")
		i = 0
		j = 0
		res = ''
		len = text.length
		while length > i and len > j
			c = text.substr(j++, 1)
			if /^[\u4e00-\u9fa5]+$/.test(c) or /^[A-Z]+$/.test(c) then i += 2 else i++
			res += c
		if len > j
			res += '...'
		res

	opLine: (str, lang = cf.lang, sp = /<br\/?>/)->
		if _.isString str
			lans = str.split sp
			if lang is 'zh'
				lans[1] || lans[0]
			else
				lans[0]
		else
			str

	fileExt: (name) ->
		it = name.split(".")
		it[it.length - 1]

	parseLocalDate: (time) ->
		if time
			time = time.substring(0, 19) if time.length > 19
			new Date((time or "").replace(/-/g, "/").replace(/[TZ]/g, " "))

	parseUrl: (url = location.search)->
		res = {}
		unless url.indexOf("?") is -1
			str = url.substr(1).split("&")
			for it in str
				p = it.split("=")
				res[p[0]] = decodeURIComponent(p[1])
		res

	seqProp: (obj, pStr, dV) ->
		if pStr
			v = obj
			for chain in pStr.trim().split(".")
				v = v[chain]

				break unless v?
			if v?
				v
			else
				dV
		else ''

	setSeqProp: (obj, pStr, v) ->
		pps = pStr.trim().split(".")
		len = pps.length
		for chain, idx in pps
			if chain.indexOf('[') > -1
				k = chain
				chain = k.split('[')[0]
				index = parseInt k.split('[')[1].split(']')[0]
				if _i is (_len - 1)
					d = if chain then obj[chain] else obj
					if v
						d[index] = v
					else
						return d[index]
				else
					obj = if chain then obj[chain][index] else obj[index]
			else if _.isObject(obj[chain])
				obj = obj[chain]
			else
				if idx < len - 1
					obj[chain] ?= {}
					obj = obj[chain]
				else
					obj[chain] = v

	delSeqProp: (obj, pStr) ->
		it = pStr.trim().split(".")
		lk = it.pop()
		if it.length > 0
			for chain in it
				obj = obj[chain]
		if lk.indexOf('[') > 0
			chain = lk.split('[')[0]
			index = parseInt lk.split('[')[1].split(']')[0]
			obj[chain].splice(index, 1)
		else
			delete obj[lk]
	randomInt: (low, high)->
		Math.floor(Math.random() * (high - low + 1) + low)

	randomChar: (len, x = @rStr) ->
		ret = x.charAt(Math.ceil(Math.random() * 10000000) % x.length)
		for n in [1..len]
			ret += x.charAt(Math.ceil(Math.random() * 10000000) % x.length)
		ret

	delProp: (x, ctx = window)->
		it = ctx[x]
		return unless it
		try
			delete ctx[x]
		catch e
			ctx[x] = undefined
		it

	getUrlParams: (url, params) ->
		url + '?' + ("#{k}=#{v}" for k,v of params).join('&')

	setSubItem: (data, prop = 'id') ->
		for it in data
			if it.pid
				p = data.findBy(prop, it.pid)
				if p
					p.children = [] if not p.children
					p.children.push(it)
					data.splice _i--, 1
					_len--

	findByType: (items, type)->
		it for it in items when it instanceof type

	serializeObj: (form)->
		o = {}
		for it in $(form).serializeArray()
			if o[it.name]
				unless o[it.name].push
					o[it.name] = [o[it.name]]
				o[it.name].push it.value
			else o[it.name] = it.value if it.value.length > 0
		o

	now: ->
		new Date().getTime()

	sum: (arr, prop)->
		sum = 0
		if arr
			for it in arr
				sum += +it[prop]
		sum

	sumCost: (costList)->
		income = 0
		cost = 0
		if _.isArray costList
			for it in costList
				if it.cat is 'spend'
					cost += +it.fee
				else
					income += +it.fee
		[cost - income, cost, income]