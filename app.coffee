global.express = require('express')

cookieParser = require('cookie-parser')
bodyParser = require('body-parser')
EventEmitter = require('events').EventEmitter

global._ = require('underscore')
global._path = __dirname
global.util = _.extend(require('./public/ext/common'), require('./public/ext/util'))
global.app = express()
global.app.env = app.get('env') isnt 'production'
global.env = app.get('env')

ddao = require('./service/dao')
moi = require('mongodb').ObjectID
_gs = require('./setting')


_.extend global,
	db: 'comunion'
	favicon: require('serve-favicon')
	async: require('async')
	pug: require('pug')
	fs: require('fs')
	path: require('path')
	cheerio: require('cheerio')
	setting: _.defaults (_gs[env] || {}), _gs.default
	oid: (v) ->
		if !v then new moi() else if v instanceof moi then v else if _.isString(v) and v.length == 24 then new moi(v) else v
	log: (msg, file = __filename)->
		console.log new Date().pattern() + ': ' + file
		console.log msg
	err: (msg)->
		console.log new Date().pattern()
		console.error msg
	dao: new ddao()
	queryUtil: require './service/dao/queryUtil'
	gStub:
		comunion: {}
	sEmail: require './service/email'
	gs: (code, fn) ->
		if gStub[code] and gStub[code][fn]
			gStub[code][fn]
		else
			require _path + '/service/' + fn

	ee: new EventEmitter

	_cache: require("node-smple-cache/Cache").createCache('LRU', 100 * 100)
	_ePool: {}
	_stCache: {}
	_authCtn: {}
	cms: require './service/cmSession'
	fetchFile: require './service/fetchFile'
	checkUrl: require './service/checkUrl'
	request: require 'request-promise-native'
	appCache: {}
	_settingCtn: {}
	_gCache: {}

	tot: (ms)->
		new Promise (resolve) ->
			setTimeout(resolve, ms);

	gEnt: (code, ent) ->
		sub = _gCache["dbCtn"] ?= {}
		unless sub["$#{ent}"]
			Object.defineProperty sub, '$' + ent,
				enumerable: true,
				get: () => dao.nc code, ent
		sub["$#{ent}"]

	gt: (code, key)->
		if @_gCache[code]
			@_gCache[code][key]
		else
			null

	ggc: (code, ent, q)->
		ec = _gCache[code][ent] ?= {}
		id = q.code || q._id || q.key
		unless ec[id]
			if rt = await gEnt(code, ent).findOne(q)
				ec[id] = rt
		ec[id]

	cggc: (code, ent)->
		if _gCache[code]
			_gCache[code][ent] = {}

	sggc: (code, ent, val) ->
		gc = _gCache[code] ?= {}
		gc[ent] = val

_.templateSettings =
	interpolate: /\{\{(.+?)\}\}/g

require './public/ext/string'

# view engine setup
app.set 'view engine', 'pug'
app.set 'views', path.join(_path, "public")
# app.use(favicon(__dirname + '/public/favicon.ico'))

app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()

shouldCompress = (req)->
	if req.headers['x-no-compression']
		false
	else
		true

app.use require('compression')(filter: shouldCompress)
app.use express.static(path.join(__dirname, 'public'))
app.disable('x-powered-by');

app._community = {}

log 'init app'

initDb = ->
	await dao.initDb db, setting
	ido = require './idx'
	for k, v of ido
		for it in v
			dao.index db, k, it.prop, it.opt

initDb()
app.use '/', require('./route/prod')
require './controller/afterSave'

log gStub

module.exports = app