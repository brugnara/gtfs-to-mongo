var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

function Handlers(options) {
  if (!options || !options.extraurbano || !options.urbano) {
    throw new Error('Missing params!');
  }
  this.options = options;
  //
}

Handlers.prototype.readFiles = function(path, db, cb) {
  fs.readdir(path, function(err, files) {
    if (err) {
      return cb && cb(err);
    }
    async.eachLimit(files, 2, function(file, cb) {
      var dbname = file.split('.txt')[0];
      //
      file = path + '/' + file;
      //
      async.waterfall([
        function(cb) {
          fs.readFile(file, 'utf8', cb);
        },
        function(data, cb) {
          parse(data, { columns: true, quote: '' }, cb);
        },
        function(rows, cb) {
          db.collection(dbname).insert(rows, cb);
        },
        function(insertResult, cb) {
          console.log(path, dbname + ':', insertResult.length);
          cb(null);
        }
      ], cb);
    }.bind(this), function (err) {
      db.close();
      cb && cb(err);
    });
  }.bind(this));
};

Handlers.prototype.extraurbano = function(err, db, cb) {
  this.readFiles(this.options.extraurbano, db, cb);
};

Handlers.prototype.urbano = function(err, db, cb) {
  this.readFiles(this.options.urbano, db, cb);
};

module.exports = Handlers;