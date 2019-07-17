// Generated by CoffeeScript 2.3.2
var async, dataController, del, edit, find, queryUtil, save;

async = require('async');

queryUtil = require('../service/dao/queryUtil');

save = require('../service/dao/save');

find = require('../service/dao/find');

edit = require('../service/dao/edit');

del = require('../service/dao/del');

dataController = {
  get: async function(req, rsp) {
    var res;
    req.id = req.params.id;
    res = (await find(req.c.code, req.params.entity, req));
    if (!res.entity) {
      rsp.status(350);
    }
    return rsp.send(res);
  },
  list: async function(req, rsp) {
    return rsp.send((await find(req.c.code, req.params.entity, req)));
  },
  agg: async function(req, rsp) {
    var code, ft, qu;
    code = req.c.code;
    qu = req.query;
    ft = [];
    if (qu.q) {
      ft.push({
        $match: queryUtil.queryClean(qu.q)
      });
    }
    if (qu.g) {
      ft.push({
        $group: qu.g
      });
    }
    return rsp.send((await dao.agg(code, req.params.entity, ft).toArray()));
  },
  matchDel: async function(req, rsp) {
    var bo;
    bo = queryUtil.cleanItem(req.body);
    await dao.remove(req.c.code, bo.ent, bo.q);
    return rsp.send({
      msg: 'm_del_ok'
    });
  },
  del: async function(req, rsp) {
    var res;
    req.id = req.params.id;
    res = (await del(req.c.code, req.params.entity, req));
    return rsp.send(res);
  },
  edit: async function(req, rsp) {
    var ret;
    req.id = req.params.id;
    ret = (await edit(req.c.code, req.params.entity, req));
    if (ret.error) {
      rsp.status(405);
    }
    return rsp.send(ret);
  },
  save: async function(req, rsp) {
    var ret;
    ret = (await save(req.c.code, req.params.entity || req.entity, req));
    if (ret.error) {
      rsp.status(405);
    }
    return rsp.send(ret);
  },
  comp: function(req, rsp) {
    var code, entity, k, limit, opt, ref, v;
    opt = {};
    code = req.c.code;
    ref = req.query;
    for (k in ref) {
      v = ref[k];
      if (k.indexOf('_')) {
        [entity, limit] = k.split('_');
        opt[entity] = (function(entity, limit, v) {
          return function(cb) {
            var op;
            op = {
              skip: 0,
              limit: limit,
              sort: {
                lastUpdated: -1
              },
              projection: {
                title: 1,
                brief: 1,
                lastUpdated: 1,
                refFile: 1,
                list: 1
              }
            };
            if (v.status) {
              v.status = +v.status;
            }
            return dao.find(code, entity, v, op, function(res) {
              return cb(null, res);
            });
          };
        })(entity, limit, v);
      }
    }
    return async.parallel(opt, function(err, res) {
      return rsp.send(res);
    });
  },
  inc: function(req, rsp) {
    var d, op;
    op = {
      _id: oid(req.params.id)
    };
    d = {
      $inc: {}
    };
    d.$inc[req.params.prop] = 1;
    dao.qc(req.c.code, req.params.entity, op, d);
    return rsp.send({});
  },
  getByKey: async function(req, rsp) {
    var code, filter, item, pa;
    code = req.c.code;
    pa = req.params;
    filter = {};
    if (/^(\d|[a-z]){24}$/.test(pa.val)) {
      pa.val = oid(pa.val);
    }
    filter[pa.key] = pa.val;
    item = (await dao.get(code, pa.entity, filter));
    return rsp.send(util.r(item));
  },
  getSub: function(req, rsp) {
    var code, entity, prop, qo;
    code = req.c.code;
    entity = req.params.entity;
    prop = req.params.prop;
    qo = {};
    qo[req.params.q] = req.params.qv;
    return dao.get(code, entity, qo, function(item) {
      var po;
      po = prop ? util.r(item[prop]) : item;
      return rsp.send(po);
    });
  },
  subOp: function(req, rsp) {
    var bo, code, entity, filter, opt, pEntity;
    code = req.c.code;
    entity = req.params.entity;
    pEntity = req.params.pEntity;
    bo = req.body;
    filter = {};
    opt = {
      $push: {
        entity: obj
      }
    };
    return dao.findAndUpdate(code, pEntity, filter, opt, function(item) {});
  },
  cleanCache: function(req, rsp) {
    var opt;
    opt = {
      k: {
        $regex: req.c.url
      }
    };
    return dao.delItem(req.c.code, 'cache', opt, function(res) {
      log('clean Cache...');
      return rsp.send({
        msg: 'm_del_ok'
      });
    });
  },
  editSub: function(req, rsp) {
    var bo, code, entity, so;
    code = req.c.code;
    entity = req.params.entity;
    bo = req.body;
    if ((so = bo.op) && !so.$set) {
      so = {
        $set: so
      };
    }
    return dao.update(code, entity, queryUtil.queryClean(bo.q), queryUtil.queryClean(so), function(d) {
      return rsp.send({
        msg: 'm_update_ok',
        entity: _.pick(d, '_id', '_e', bo.prop)
      });
    });
  },
  delSub: function(req, rsp) {
    var bo, code, entity;
    code = req.c.code;
    entity = req.params.entity;
    bo = req.body;
    return dao.update(code, entity, queryUtil.queryClean(bo.q), queryUtil.queryClean(bo.op), function(err, res) {
      return rsp.send({
        msg: 'm_del_ok'
      });
    });
  },
  saveSub: function(req, rsp) {
    var bo, code, entity, op, pa, qs;
    code = req.c.code;
    pa = req.params;
    entity = pa.entity;
    qs = {};
    qs[pa.q] = pa.qv;
    if (qs._id) {
      qs._id = oid(qs._id);
    }
    bo = req.body;
    if (bo._str) {
      bo = bo._str;
    } else {
      if (bo._q) {
        _.extend(qs, bo._q);
        delete bo._q;
      }
      bo = queryUtil.cleanItem(bo);
    }
    op = {};
    op[`$${pa.type}`] = {};
    if (pa.type === 'pull') {
      delete bo.lastUpdated;
    }
    op[`$${pa.type}`][pa.prop] = bo;
    return dao.findAndUpdate(code, entity, qs, op, function(doc) {
      if (doc) {
        return rsp.send({
          msg: 'm_update_ok',
          entity: _.pick(doc, '_id', '_e', pa.prop)
        });
      } else {
        return rsp.send({
          msg: 'm_update_ok'
        });
      }
    });
  },
  favorite: async function(req, rsp) {
    var Ent, code, count, e, entity, id, pa, q, uCount, uid;
    code = req.c.code;
    pa = req.params;
    entity = pa.entity;
    id = pa.id;
    uid = pa.uid;
    try {
      Ent = (await gEnt(code, entity));
      q = {
        'ref._id': oid(id)
      };
      count = (await Ent.countDocuments(q));
      q['user._id'] = oid(uid);
      uCount = (await Ent.countDocuments(q));
      return rsp.send({count, uCount});
    } catch (error) {
      e = error;
      return log(e);
    }
  },
  userRank: function(req, rsp) {
    var code, ent, pa, q;
    code = req.c.code;
    pa = req.params;
    ent = pa.entity;
    q = {};
    q[pa.key] = pa.val;
    return dao.get(code, ent, q, function(res) {
      var qq;
      if (res) {
        qq = {};
        qq[pa.prop] = {
          $lt: util.seqProp(res, pa.prop)
        };
        return dao.count(code, ent, qq, function(count) {
          res.rankNum = count;
          return rsp.send(res);
        });
      } else {
        return rsp.send({
          msg: 'm_find_no'
        });
      }
    });
  },
  count: async function(req, rsp) {
    var code, entity, q, qu;
    code = req.c.code;
    entity = req.params.entity;
    q = {};
    qu = req.query;
    if (qu && qu.q) {
      q = queryUtil.queryClean(qu.q);
    }
    if (q.score && q.score.$gt) {
      q.score.$gt = +q.score.$gt;
    }
    return rsp.send({
      count: (await gEnt(code, entity).countDocuments(q))
    });
  }
};

module.exports = dataController;
