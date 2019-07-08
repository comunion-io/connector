fs = require('fs')

fetch = require 'node-fetch'

module.exports = (url, path)->
    res = await fetch(url)
    new Promise (resolve, reject)->
        dest = fs.createWriteStream(path)
        res.body.pipe(dest)
        res.body.on 'err', (err)->
            reject err
        dest.on 'finish', (err)->
            resolve()
        dest.on 'err', (err)->
            reject err