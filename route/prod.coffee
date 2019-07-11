router = require('express').Router()

auth = require '../controller/auth'
data = require '../controller/data'

router.get '/a/auth/check/now', auth.check
router.post '/a/auth/check/now', auth.check
router.post '/a/auth/login', auth.login
router.post '/a/auth/logout', auth.logout
router.post '/a/auth/resetPsd', auth.resetPsd
router.post '/a/auth/checkPsd', auth.checkPsd

router.get '/r/comp', data.comp
router.get '/r/agg/:entity', data.agg
router.get '/r/userRank/:entity/:key/:val/:prop', data.userRank
router.get '/r/count/:entity', data.count
router.get '/r/:entity', data.list
router.get '/r/:entity/:id', data.get
router.get '/r/:entity/:q/:qv/:prop', data.getSub
router.get '/r/:entity/:key/:val', data.getByKey

router.put '/r/:entity/:id', data.edit
router.patch '/r/:entity/:id', data.edit
router.post '/r/:entity', data.save
router.delete '/r/:entity/:id', data.del
router.delete '/r/:entity', data.del


module.exports = router