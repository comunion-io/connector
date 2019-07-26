// Generated by CoffeeScript 2.3.2
var Mongodb;

Mongodb = require('mongodb');

global._db = {};

module.exports = function() {
  var pk;
  pk = function(ob, ...prop) {
    var i, it, len, res;
    if (prop && _.isArray(prop[0])) {
      prop = prop[0];
    }
    if (prop.length === 1) {
      return {
        [`${prop[0]}`]: util.seqProp(ob, prop[0])
      };
    } else if (prop.length > 1) {
      res = {};
      for (i = 0, len = prop.length; i < len; i++) {
        it = prop[i];
        res[it] = util.seqProp(ob, it);
      }
      return res;
    } else {
      return {};
    }
  };
  this.initDb = function(name, s) {
    return new Promise(function(resolve, reject) {
      return Mongodb.MongoClient.connect(s.db_url, {
        useNewUrlParser: true
      }, function(e, client) {
        if (e) {
          return reject(e);
        } else {
          return resolve(_db[name] = client.db(name));
        }
      });
    });
  };
  this.agg = function(db, entity, filter) {
    return gEnt(db, entity).aggregate(filter);
  };
  this.index = function(db, entity, index, opt) {
    return gEnt(db, entity).createIndex(index, opt);
  };
  this.get = async function(db, ent, filter, callback) {
    var doc, e, opt;
    opt = {};
    if (filter.projection) {
      opt = {
        projection: util.d(filter, 'projection')
      };
    }
    if (!filter.sort) {
      opt.sort = {
        lastUpdated: -1
      };
    }
    filter = this.cleanOpt(filter);
    try {
      doc = (await gEnt(db, ent).findOne(filter, opt));
      if (doc) {
        doc._e = ent;
      }
      if (typeof callback === "function") {
        callback(doc);
      }
      return doc;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.find = async function(db, entity, filter, op = {}, callback) {
    var docs, e, i, it, k, len, ref, v;
    if (op.sort) {
      ref = op.sort;
      for (k in ref) {
        v = ref[k];
        op.sort[k] = +v;
      }
    } else {
      op.sort = {
        lastUpdated: -1,
        row: -1
      };
    }
    try {
      docs = (await gEnt(db, entity).find(filter, op).toArray());
      for (i = 0, len = docs.length; i < len; i++) {
        it = docs[i];
        it._e = entity;
      }
      if (typeof callback === "function") {
        callback(docs);
      }
      return docs;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.cleanOpt = function(opt) {
    var it;
    if (opt._id) {
      if (_.isArray(opt._id)) {
        opt._id = (function() {
          var i, len, ref, results;
          ref = opt._id;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            it = ref[i];
            results.push(oid(it));
          }
          return results;
        })();
      } else if (_.isString(opt._id)) {
        opt._id = oid(opt._id);
      }
    }
    return opt;
  };
  this.count = async function(db, entity, opt, callback) {
    var count, e;
    try {
      count = (await gEnt(db, entity).countDocuments(opt));
      if (typeof callback === "function") {
        callback(count);
      }
      return count;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.qc = async function(db, entity, q, op, cb) {
    var e, res;
    try {
      res = (await gEnt(db, entity).findOneAndUpdate(q, op, {
        upsert: true,
        new: true,
        returnOriginal: false
      }));
      if (typeof cb === "function") {
        cb(res);
      }
      return res;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.inc = async function(db, entity, q, op, cb) {
    var e;
    op = {
      $inc: op
    };
    try {
      return (await this.qc(db, entity, q, op, cb));
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.update = async function(db, entity, filter, opt, callback) {
    var doc, e;
    filter = this.cleanOpt(filter);
    try {
      doc = (await gEnt(db, entity).update(filter, opt, {
        upsert: true,
        new: true,
        returnOriginal: false
      }));
      if (typeof callback === "function") {
        callback(doc != null ? doc.ops : void 0);
      }
      return doc != null ? doc.ops : void 0;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.patch = async function(db, entity, filter, opt) {
    var doc, e;
    if (_.isString(filter)) {
      filter = {
        _id: filter
      };
    }
    filter = this.cleanOpt(filter);
    delete opt._id;
    if (!opt.$set) {
      opt = {
        $set: opt
      };
    }
    try {
      doc = (await gEnt(db, entity).findOneAndUpdate(filter, opt, {
        upsert: true,
        returnOriginal: false
      }));
      return doc.value;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.findAndUpdate = async function(db, entity, filter, opt, callback) {
    var doc, e, item;
    filter = this.cleanOpt(filter);
    delete opt._id;
    try {
      doc = (await gEnt(db, entity).findOneAndUpdate(filter, opt, {
        upsert: true,
        returnOriginal: false
      }));
      item = doc.value;
      if (typeof callback === "function") {
        callback(item);
      }
      return item;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.save = async function(code, entity, items, callback) {
    var Ent, d, e, ent, filter, i, it, keys, len, ret;
    [ent, keys] = entity.split(':');
    if (!_.isArray(items)) {
      items = [items];
    }
    try {
      Ent = gEnt(code, ent);
      if (keys) {
        ret = [];
        keys = keys.split(',');
        for (i = 0, len = items.length; i < len; i++) {
          it = items[i];
          filter = pk(it, keys);
          filter = this.cleanOpt(filter);
          d = (await Ent.findOneAndUpdate(filter, {
            $set: it
          }, {
            upsert: true,
            returnOriginal: false
          }));
          ret.push(d.value);
        }
      } else {
        ret = ((await Ent.insert(items, {
          safe: true
        }))).ops;
      }
      if (typeof callback === "function") {
        callback(ret);
      }
      return ret;
    } catch (error) {
      e = error;
      throw e;
    }
  };
  this.del = function() {
    return log('rm');
  };
  this.delItem = async function(db, entity, filter, opt = {
      w: 1
    }, callback) {
    var e, m, res;
    if (filter._id && !filter._id.$in) {
      m = 'deleteOne';
    } else {
      m = 'deleteMany';
    }
    filter = this.cleanOpt(filter);
    try {
      res = (await gEnt(db, entity)[m](filter, opt));
      if (typeof callback === "function") {
        callback(res);
      }
      return res;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.remove = async function(db, entity, filter, callback) {
    var e, res;
    try {
      res = (await gEnt(db, entity).remove(filter, {
        justOne: 1
      }));
      return typeof callback === "function" ? callback(res) : void 0;
    } catch (error) {
      e = error;
      return log(e);
    }
  };
  this.close = function(name) {
    var ref;
    log('closed ' + name);
    if ((ref = _db[name]) != null) {
      ref.close();
    }
    return _db[name] = null;
  };
  this.nc = function(code, name) {
    return _db[code].collection(name);
  };
  this.setDbList = function(code, arr) {
    var cl, db, i, len;
    db = {};
    for (i = 0, len = arr.length; i < len; i++) {
      cl = arr[i];
      (function(cl) {
        return Object.defineProperty(db, '$' + cl, {
          enumerable: true,
          get: () => {
            return dao.nc(code, cl);
          }
        });
      })(cl);
    }
    return db;
  };
  return this;
};

//	@get = (db, entity, filter, callback)->
//		opt = {}
//		if filter.projection
//			opt =
//				projection: util.d filter, 'projection'
//		unless filter.sort
//			opt.sort =
//				lastUpdated: -1
//		filter = @cleanOpt(filter)
//		@pick(db, entity).findOne filter, opt, (err, doc)->
//			throw err if err
//			doc._e = entity if doc
//			callback(doc)
//	@save = (db, entity, items, callback)->
//		[entity, keys] = entity.split(':')

//		items = [items] unless _.isArray items
//		if keys
//			keys = keys.split(',')
//			for it in items
//				filter = pk(it, keys)
//				filter = @cleanOpt(filter)
//				@pick(db, entity).findOneAndUpdate filter, {$set: it}, {upsert: true, returnOriginal: false}, (err, docs)->
//					throw err if err
//					callback?(docs.value)
//		else
//			@pick(db, entity).insertMany items, {safe: true}, (err, docs)->
//				throw err if err
//				callback?(docs.ops)
//	@find = (db, entity, filter, op = {}, callback)->
//		if op.sort
//			for k,v of op.sort
//				op.sort[k] = +(v)
//		else
//			op.sort =
//				lastUpdated: -1
//				row: -1
//		try
//			@pick(db, entity).find(filter, op).toArray (err, docs)->
//				throw err if err
//				for it in docs
//					it._e = entity
//				callback?(docs)
//		catch e
//			log e

//	@pick = (name, cName)->
//		if cName in ['community']
//			name = _mdb
//		try
//			if (@name is name) and (@cName is cName)
//				@collection
//			else
//				if db = _db[name]
//					@name = name
//					@cName = cName
//					return @collection = db.collection(cName)
//				else
//					log 'no db: ' + name
//		catch e
//			log e
