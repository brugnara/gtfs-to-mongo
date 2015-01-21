var MongoClient = require('mongodb').MongoClient;

function Mongo(url, cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      return cb && cb(err);
    }
    this.db = db;
    cb && cb(null, db);
  }.bind(this));
}

module.exports = Mongo;