// Generated by CoffeeScript 2.3.2
var queryUtil;

queryUtil = require('./queryUtil');

module.exports = async function(code, entity, d) {
  var count, entities, item, op, q, qu;
  if (d.id) {
    op = d.query || {};
    if (d.id !== 'cust') {
      op._id = d.id;
    }
    if (op._attrs) {
      op.projection = queryUtil.attrs(util.d(op, '_attrs'));
    }
    op = queryUtil.queryClean(op);
    item = (await dao.get(code, entity, op));
    return util.r(item, null, entity);
  } else {
    qu = d.query || {
      q: {}
    };
    op = {
      skip: +util.d(qu, 'offset') || 0,
      limit: +util.d(qu, 'max') || 10
    };
    if (qu.p) {
      _.extend(op, qu.p);
    }
    if (qu._attrs) {
      op.projection = queryUtil.attrs(util.d(qu, '_attrs'));
    }
    q = queryUtil.queryClean(qu.q);
    entities = (await dao.find(code, entity, q, op));
    count = (await dao.count(code, entity, q));
    return util.r(entities, count);
  }
};
