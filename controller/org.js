// Generated by CoffeeScript 2.3.2
(function() {
  var OrgToken, comunionDao;

  comunionDao = require('comunion-dao');

  OrgToken = comunionDao.comunionDao;

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
            delete u.password;
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
    },
    tokenDeploy: async function(req, rsp) {
      var bo, code, deployData, e, org;
      code = req.c.code;
      try {
        org = (await dao.one(code, 'org', {
          _id: oid(req.params.id)
        }));
        bo = req.body;
        deployData = OrgToken.genDeployData(org.contract, bo.name, bo.symbol, bo.totalSupply);
        return rsp.send({
          data: deployData
        });
      } catch (error) {
        e = error;
        log(e);
        return rsp.send({
          err: 1,
          msg: '数据错误'
        });
      }
    }
  };

}).call(this);
