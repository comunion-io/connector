// Generated by CoffeeScript 2.3.2
module.exports = {
  membersInfo: async function(req, rsp) {
    var code, e, i, idx, it, len, org, ref, u;
    code = req.c.code;
    try {
      org = (await dao.one(code, 'org', {
        _id: oid(req.params.id)
      }));
      ref = org.members;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        it = ref[idx];
        u = (await dao.one(code, 'user', {
          _id: it._id
        }));
        if (u) {
          _.extend(org.members[idx], u);
        }
      }
      return rsp.send({
        entities: org.members
      });
    } catch (error) {
      e = error;
      return log(e);
    }
  }
};
