// Generated by CoffeeScript 2.3.2
gStub.comunion = {
  sendPsdEmail: function(req, item) {
    var opt, sStr, type;
    type = req.originalUrl.indexOf('resetPsd') > -1 ? 'resetPsd' : 'newUser';
    opt = {
      psd: req.password,
      type: type,
      username: item.username
    };
    sStr = pug.renderFile(`${_path}/view/tmpl/regDone.pug`, opt);
    return sEmail(setting.email, {
      to: item.email,
      subject: 'Congratulations，registered Comunion successfully',
      html: sStr,
      text: 'Comunion'
    });
  },
  afterSaveOrg: async function(req, item) {
    var $push, code, e, email, opt, psd, sStr, type, u, username;
    code = req.c.code;
    try {
      psd = util.randomChar(5);
      email = item.email;
      if (u = (await dao.get(code, 'user', {email}))) {
        username = u.username;
        type = 'oldOrgUser';
        $push = {
          orgs: {
            _id: item._id,
            name: item.name,
            role: 'owner'
          }
        };
        await dao.update(code, 'user', {
          _id: u._id
        }, {$push});
      } else {
        username = email;
        type = 'newOrgUser';
        await dao.save(code, 'user', {
          email: email,
          password: util.sha256(psd),
          orgs: [
            {
              _id: item._id,
              name: item.name,
              role: 'owner'
            }
          ]
        });
      }
      opt = {
        psd: psd,
        orgName: item.name,
        type: type,
        username: username
      };
      sStr = pug.renderFile(`${_path}/view/tmpl/regDone.pug`, opt);
      return sEmail(mailOpt, {
        to: item.email,
        subject: 'Congratulations，registered Comunion successfully',
        html: sStr,
        text: 'Comunion'
      });
    } catch (error) {
      e = error;
      throw e;
    }
  }
};
