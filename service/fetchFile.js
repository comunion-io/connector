// Generated by CoffeeScript 2.3.2
var fetch, fs;

fs = require('fs');

fetch = require('node-fetch');

module.exports = async function(url, path) {
  var res;
  res = (await fetch(url));
  return new Promise(function(resolve, reject) {
    var dest;
    dest = fs.createWriteStream(path);
    res.body.pipe(dest);
    res.body.on('err', function(err) {
      return reject(err);
    });
    dest.on('finish', function(err) {
      return resolve();
    });
    return dest.on('err', function(err) {
      return reject(err);
    });
  });
};
