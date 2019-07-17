// Generated by CoffeeScript 2.3.2
module.exports = {
  set: function(req, rsp, user, maxAge = Date.day) {
    rsp.cookie("_ncs_", user._id, {
      maxAge: maxAge
    });
    return dao.save(req.c.code, 'session:_id', user);
  },
  update: function(code, id, opt) {
    return dao.update(code, 'session', {
      _id: id
    }, opt);
  },
  get: async function(req, rsp) {
    var ncs, ret;
    if (ncs = req.cookies._ncs_) {
      ret = (await gEnt(req.c.code, 'session').findOne({
        _id: oid(ncs)
      }));
      if (ret) {
        return req.session = ret;
      } else {
        return rsp.clearCookie('_ncs_');
      }
    }
  },
  del: function(req, rsp) {
    dao.delItem(req.c.code, 'session', {
      _id: req.cookies._ncs_
    });
    return rsp.clearCookie('_ncs_');
  },
  required: function(req, rsp, next) {
    var s;
    if ((s = req.session) && !s.can_verify && !s.need_verify) {
      return next();
    } else {
      return rsp.status(360).json({
        msg: '请先登录',
        toUrl: '#!/signin'
      });
    }
  },
  requiredRole: function(role) {
    return function(req, rsp, next) {
      var u;
      if ((u = req.session) && u.roles.findBy('title', role)) {
        return next();
      } else {
        return rsp.status(360).json({
          msg: '请重新登录',
          toUrl: 'signin'
        });
      }
    };
  }
};
