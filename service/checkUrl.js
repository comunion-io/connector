// Generated by CoffeeScript 2.3.2
var http, url;

http = require('http');

url = require('url');

module.exports = function(path) {
  return new Promise(function(resolve, reject) {
    var e, options, req;
    try {
      options = {
        method: 'HEAD',
        host: url.parse(path).host,
        port: 80,
        path: url.parse(path).pathname
      };
      req = http.request(options, function(r) {
        return resolve(r.statusCode === 200);
      });
      return req.end();
    } catch (error) {
      e = error;
      return reject(e);
    }
  });
};
