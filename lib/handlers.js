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

Handlers.prototype.readFiles = function(path, cb) {
  fs.readdir(path, function(err, files) {
    if (err) {
      return cb && cb(err);
    }
    async.eachLimit(files, 2, function(file, cb) {
      file = path + '/' + file;
      console.log('EXU', file);
      //
      async.waterfall([
        function(cb) {
          fs.readFile(file, 'utf8', cb);
        },
        function(data, cb) {
          parse(data, { quote: '' }, cb);
        },
        function(parsed, cb) {
          console.log(parsed[0]);
          cb(null);
        }
      ], cb);
    }.bind(this));
    cb && cb(null);
  }.bind(this));
};

Handlers.prototype.extraurbano = function(err, db, cb) {
  this.readFiles(this.options.extraurbano, cb);
};

Handlers.prototype.urbano = function(err, db, cb) {
  this.readFiles(this.options.urbano, cb);
};

module.exports = Handlers;