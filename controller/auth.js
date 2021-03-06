// Generated by CoffeeScript 2.3.2
var afterAuth, code, errAuth, web3;

code = app.db;

web3 = require('../service/web3');

afterAuth = function(user, req, rsp) {
  return rsp.send({
    user: user,
    msg: 'm_login_s'
  });
};

errAuth = function(req, rsp) {
  return rsp.status(350).send({
    err: 1,
    msg: 'm_login_f',
    toUrl: req.body.toUrl
  });
};

//setTimeout ->
//	log '123'
//	res = await web3.checkTran('0x8c13609f51466873eb283133ac952805155e1947db0a94a0ed7acb65b340c39f')
//	log res
//	log 'zzzzzz'
//, 5000
module.exports = {
  check: function(req, rsp) {
    return rsp.send({
      user: req.session
    });
  },
  login: async function(req, rsp) {
    var bo, opt, user;
    log(bo = req.body);
    opt = bo.email ? {
      email: bo.email
    } : {
      username: bo.username
    };
    if (bo.password && (user = (await dao.get(code, 'user', opt)))) {
      if (bo._en) {
        if (user.password !== bo.password) {
          errAuth(req, rsp);
          return;
        }
      } else {
        if (user.password !== util.sha256(bo.password)) {
          errAuth(req, rsp);
          return;
        }
      }
      delete user.password;
      return afterAuth(user, req, rsp);
    } else {
      errAuth(req, rsp);
    }
  },
  verifyCode: function(req, rsp) {
    var bo, cCode, s, sStr, vCode;
    bo = req.body;
    if (!bo.email) {
      return rsp.json({
        err: 1,
        msg: 'No email'
      });
    } else {
      cCode = util.randomChar(15);
      vCode = util.randomChar(5);
      s = 1000 * 60 * 30;
      _cache.set(cCode, vCode, s);
      sStr = pug.renderFile(`${_path}/view/tmpl/regDone.pug`, {
        username: bo.username,
        type: 'resetPsd',
        psd: vCode
      });
      sEmail(setting.email, {
        to: bo.email,
        subject: 'Verify Code',
        html: sStr,
        text: 'Comunion'
      });
      return rsp.json({cCode});
    }
  },
  logout: function(req, rsp) {
    if (req.cookies._ncs_) {
      cms.del(req, rsp);
    }
    return rsp.send({
      msg: 'm_logout_s'
    });
  },
  register: function(req, rsp, next) {
    var bo;
    bo = req.body;
    if (!bo.email) {
      rsp.send({
        err: 1,
        msg: '数据错误'
      });
      return;
    }
    if (!bo.username) {
      rsp.send({
        err: 1,
        msg: '数据错误'
      });
      return;
    }
    if (!bo.password) {
      rsp.send({
        err: 1,
        msg: '数据错误'
      });
      return;
    }
    req.entity = 'user';
    req.password = bo.password;
    bo.password = util.sha256(bo.password);
    return next();
  },
  resetPsd: async function(req, rsp) {
    var $set, bo, fo, res;
    code = req.c.code;
    bo = req.body;
    fo = bo.phone ? {
      phone: bo.phone
    } : {
      email: bo.email
    };
    $set = {
      password: util.sha256(bo.password)
    };
    if (res = (await dao.findAndUpdate(code, 'user', fo, {$set}))) {
      return rsp.send({
        msg: '修改成功'
      });
    } else {
      rsp.status(390);
      return rsp.send({
        msg: '用户不存在'
      });
    }
  },
  orgStatus: async function(req, rsp) {
    var $set, org, ret, rw;
    code = req.c.code;
    if (org = (await dao.get(code, 'org', {
      _id: oid(req.params.id)
    }))) {
      rw = (await web3.checkTran(org.hash));
      if (rw && rw.blockNumber) {
        $set = {
          status: 2
        };
        dao.findAndUpdate(code, 'org', {
          _id: org._id
        }, {$set});
        ret = {
          status: 2
        };
      } else {
        ret = {
          status: 1
        };
      }
    } else {
      ret = {
        err: 1,
        msg: 'No org'
      };
    }
    return rsp.send(ret);
  },
  checkPsd: async function(req, rsp) {
    var bo, user;
    bo = req.body;
    user = (await dao.get(req.c.code, 'user', {
      _id: bo._id
    }));
    if (user && !user.password && bo.password === 'psd') {
      return rsp.send({
        msg: '验证成功'
      });
    } else if (!user || user.password !== util.sha256(bo.password)) {
      rsp.status(390);
      return rsp.send({
        msg: '密码错误'
      });
    } else {
      return rsp.send({
        msg: '验证成功'
      });
    }
  }
};
