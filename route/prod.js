// Generated by CoffeeScript 2.3.2
(function() {
  var actPre, auth, authStr, data, org, router, tx;

  router = require('express').Router();

  auth = require('../controller/auth');

  data = require('../controller/data');

  org = require('../controller/org');

  tx = require('../controller/tx');

  log(authStr = db + ':test');

  actPre = async function(req, rsp, next) {
    var hd;
    hd = req.headers;
    req.c = {
      code: db
    };
    //		url: 'test'
    // console.log("actPre:", req.cookies)
    if (true || app.env) {
      req.cookies.token && (await cms.get(req, rsp));
      // console.log("session:", req.session)
      next();
      return;
    }
    if (hd.host !== req.c.url) {
      if (!hd.origin || (hd.origin.split('://')[1] !== hd.host)) {
        if (hd.tk === authStr) {
          addCross(rsp);
        } else {
          rsp.end('>_<');
          return;
        }
      }
    }
    req.cookies.token && (await cms.get(req, rsp));
    return next();
  };

  router.all('/a/*', actPre);

  router.all('/r/*', actPre);

  // router.put '/r/*', cms.requiredUser
  router.post('/a/*', function(req, rsp, next) {
    var bo, rs;
    bo = req.body;
    if (bo._cCode) {
      if ((rs = _cache.get(bo._cCode)) && (rs === bo._vCode)) {
        return next();
      } else {
        return rsp.json({
          err: 1,
          msg: 'verifyCodeErr'
        });
      }
    } else {
      return next();
    }
  });

  router.get('/a/auth/check/now', auth.check);

  router.post('/a/auth/login', auth.login);

  router.post('/a/auth/logout', auth.logout);

  router.post('/a/auth/resetPsd', auth.resetPsd);

  router.post('/a/auth/checkPsd', auth.checkPsd);

  router.post('/a/auth/register', auth.register, data.save);

  router.post('/a/verifyCode', auth.verifyCode);

  router.get('/a/org/orgStatus/:id', auth.orgStatus);

  // router.get '/r/comp', data.comp
  router.get('/r/agg/:entity', data.agg);

  // router.get '/r/userRank/:entity/:key/:val/:prop', data.userRank
  router.get('/r/count/:entity', data.count);

  router.get('/r/:entity', data.list);

  router.get('/r/:entity/:id', data.get);

  //router.get '/r/:entity/:q/:qv/:prop', data.getSub
  router.get('/r/:entity/:key/:val', data.getByKey);

  // router.post '/a/update/:entity', data.editSub
  router.put('/r/:entity/:id', data.edit);

  // router.patch '/r/:entity/:id', data.edit
  router.post('/r/:entity', data.save);

  // router.delete '/r/:entity/:id', data.del
  // router.delete '/r/:entity', data.del
  router.get('/r/org/info/members/:id', org.membersInfo);

  router.put('/r/org/finance/:id', org.financeUpdate);

  router.get('/r/tx/receipt/:hash', tx.receipt);

  router.get('/upload', function(req, rsp) {
    return rsp.render('upload.pug');
  });

  //do ->
  //	sStr = pug.renderFile("#{_path}/view/tmpl/regDone.pug", psd: '123')

  //	c =
  //		email: 'service@comunion.io'
  //		mailHost: 'smtp.exmail.qq.com'
  //		mailPsd: 'RjZoofwvjpamFk89'
  //		name: 'Comunion Website'
  //	try
  //		sEmail c,
  //			to: '69692418@qq.com'
  //			subject: 'good one123'
  //			text: 'test done'
  //			html: sStr
  //	catch e
  //		log e
  require('../controller/upload');

  module.exports = router;

}).call(this);
