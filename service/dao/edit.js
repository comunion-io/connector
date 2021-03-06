// Generated by CoffeeScript 2.3.2
module.exports = async function(code, entity, d) {
  var _attrs, after, before, bo, e, filter, i, it, item, j, len, len1, ref, ref1, res, ri, rt, unset;
  bo = d.body;
  after = util.del('afterSave', bo);
  before = util.del('beforeSave', bo);
  if (before) {
    rt = [];
    ref = before.split(',');
    for (i = 0, len = ref.length; i < len; i++) {
      it = ref[i];
      res = gs(code, it)(d, bo);
      if (res && res.error) {
        rt.push(res.msg);
      }
    }
    if (rt.length) {
      return util.r({
        err: true
      }, rt.join('\n'));
    }
  }
  if (bo._attrs) {
    _attrs = bo._attrs.split(',');
  }
  if (bo._unset) {
    unset = bo._unset;
  }
  filter = {
    _id: oid(d.id)
  };
  if (d.query.q) {
    _.extend(filter, d.query.q);
  }
  queryUtil.cleanItem(bo);
  if (bo.$set || bo.$push || bo.$pull) {
    if (bo.$set == null) {
      bo.$set = {};
    }
    bo.$set.lastUpdated = util.del('lastUpdated', bo);
  } else {
    bo = {
      $set: bo
    };
  }
  if (unset) {
    bo.$unset = unset;
  }
  try {
    item = (await dao.findAndUpdate(code, entity, filter, bo));
    queryUtil.afterPersist(item, entity);
    if (after) {
      ref1 = after.split(',');
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        it = ref1[j];
        gs(code, it)(d, item);
      }
    }
    ri = _attrs ? (_attrs.push('_id'), _.pick(item, _attrs)) : item;
    return util.r(ri, 'm_update_ok');
  } catch (error) {
    e = error;
    log(e);
    return {
      msg: e.errmsg,
      err: 1
    };
  }
};
