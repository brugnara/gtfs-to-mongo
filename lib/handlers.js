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
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [row.stop_lon, row.stop_lat]
                },
                properties: {
                  stop_id: row.stop_id,
                  stop_name: row.stop_name,
                  stop_code: row.stop_code,
                  stop_desc: row.stop_desc,
                  zone_id: row.zone_id
                }
              };
            }));
          }
          cb(null, rows);
        },
        function(rows, cb) {
          async.waterfall([
            function(cb) {
              db.collection(dbname, function(err, res) {
                console.log('Collection %s deleted:', dbname, !!res);
                cb(err);
              });
            },
            function(cb) {
              db.createCollection(dbname, cb);
            }
          ], function(err, collection) {
            cb(err, collection, rows);
          });
        },
        function(collection, rows, cb) {
          collection.insert(rows, cb);
        },
        function(insertResult, cb) {
          console.log(path, dbname + ':', insertResult.length);
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