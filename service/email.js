// Generated by CoffeeScript 2.3.2
var nodemailer, smtpTransport, transPool;

nodemailer = require('nodemailer');

smtpTransport = require('nodemailer-smtp-transport');

transPool = function(email, host, psd) {
  return _ePool[email] != null ? _ePool[email] : _ePool[email] = nodemailer.createTransport(smtpTransport({
    host: host,
    port: 465,
    secureConnection: true,
    auth: {
      user: email,
      pass: psd
    }
  }));
};

module.exports = function(c, mo) {
  mo = _.pick(mo, 'to', 'subject', 'html', 'text');
  mo.from = {
    name: c.name,
    address: c.email
  };
  mo.to = mo.to.toString().trim();
  log(mo);
  return transPool(c.email, c.mailHost, c.mailPsd).sendMail(mo, function(err, info) {
    if (err) {
      return log(err);
    } else {
      return log(info);
    }
  });
};
