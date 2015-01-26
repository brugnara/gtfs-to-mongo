var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var DB_STOPS = 'stops';

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
        // modifiers for geoJSON if stops.txt
        function(rows, cb) {
          if (dbname === DB_STOPS) {
            console.log('Mapping stops!');
            return cb(null, rows.map(function(row) {
              // mapping in GeoJSON
              return {
                stop_position: {
                  type: 'Point',
                  coordinates: [
                    parseFloat(row.stop_lon),
                    parseFloat(row.stop_lat)
                  ]
                },
                stop_id: row.stop_id,
                stop_name: row.stop_name,
                stop_code: row.stop_code,
                stop_desc: row.stop_desc,
                zone_id: row.zone_id
              };
            }));
          }
          cb(null, rows);
        },
        function(rows, cb) {
          async.waterfall([
            function(cb) {
              db.collection(dbname).drop(function(err, res) {
                console.log('Collection %s deleted:', dbname, !!res);
                // skip se ho errori. Se non riesco ad eliminare la collection, pace!
                err && console.error(err);
                cb(null);
              });
            },
            function(cb) {
              db.createCollection(dbname, cb);
            },
            function(junk, cb) {
              console.log('Created collection: %s? -', dbname, !!junk);
              cb(null);
            }
          ], function(err) {
            cb(err, rows);
          });
        },
        function(rows, cb) {
          async.waterfall([
            function(cb) {
              db.collection(dbname).insert(rows, cb);
            },
            function(insertResult, cb) {
              console.log(path, dbname + ':', insertResult.length);
              db.collection(dbname).ensureIndex( { stop_position: '2dsphere', stop_name: 1, stop_id: 1 }, cb);
            }
          ], cb);
        },
        function(insertResult, cb) {
          cb(null);
        }
      ], cb);
    }.bind(this), function (err) {
      db.close();
      err && console.error(path, err);
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