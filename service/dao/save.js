// Generated by CoffeeScript 2.3.2
var queryUtil;

queryUtil = require('./queryUtil');

module.exports = async function(code, entity, reg) {
  var _attrs, after, before, bo, e, func, i, it, item, j, k, len, len1, len2, ref, ref1, res, ri, rt, s;
  bo = reg.body;
  if (bo) {
    after = util.del('afterSave', bo);
    before = util.del('beforeSave', bo);
  }
  if (before) {
    rt = [];
    ref = before.split(',');
    for (i = 0, len = ref.length; i < len; i++) {
      it = ref[i];
      res = gs(code, it)(reg, bo);
      if (res && res.error) {
        rt.push(res.msg);
      }
    }
    if (rt.length) {
      return util.r({
        error: true
      }, rt.join('\n'));
    }
  }
  if (bo._attrs) {
    _attrs = bo._attrs.split(',');
  }
  queryUtil.cleanItem(bo, true);
  try {
    item = (await dao.save(code, entity, bo));
    for (j = 0, len1 = item.length; j < len1; j++) {
      s = item[j];
      queryUtil.afterPersist(s, entity);
      if (after) {
        ref1 = after.split(',');
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          it = ref1[k];
          func = gs(code, it);
          await func(reg, s);
        }
      }
    }
    if (item.length === 1) {
      item = item[0];
      ri = _attrs ? (_attrs.push('_id'), _.pick(item, _attrs)) : item;
    } else {
      ri = item;
    }
    if (!ri._e) {
      ri._e = entity;
    }
    return util.r(ri, 'm_create_ok');
  } catch (error) {
    e = error;
    log(e);
    return {
      msg: e.errmsg,
      err: 1
    };
  }
};
