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

Handlers.prototype.createIndexes = function(db, dbname, cb) {
  switch(dbname) {
    case 'stops':
      db.collection(dbname).ensureIndex( { stop_position: '2dsphere', stop_name: 1, stop_id: 1 }, cb);
      break;
    case 'stop_times':
      db.collection(dbname).ensureIndex( { stop_id: 1, arrival_time: 1 }, cb);
      break;
    case 'trips':
      db.collection(dbname).ensureIndex( { trip_id: 1 }, cb);
      break;
    case 'routes':
      db.collection(dbname).ensureIndex( { route_id: 1 }, cb);
      break;
    case 'transfers':
      db.collection(dbname).ensureIndex( { from_stop_id: 1, to_stop_id: 1 }, cb);
      break;
    case 'calendar_dates':
      db.collection(dbname).ensureIndex( { service_id: 1, date: 1 }, cb);
      break;
    case 'calendar':
      db.collection(dbname).ensureIndex( { service_id: 1 }, cb);
      break;
    default:
      // false is required to fake ensureIndex response
      cb(null, false);
  }
};

Handlers.prototype.mapStops = function(db, dbname, rows, cb) {
  async.map(rows, function(row, cb) {
    // mapping in GeoJSON
    cb(null, {
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
    });
  }, cb);
};

Handlers.prototype.readFiles = function(path, prefix, db, cb) {
  var that = this;
  //
  fs.readdir(path, function(err, files) {
    if (err) {
      return cb && cb(err);
    }
    async.eachLimit(files, 2, function(file, cb) {
      var dbname = prefix + '_' + file.split('.txt')[0];
      //
      file = path + '/' + file;
      //
      async.waterfall([
        // read the file asynchronously
        function(cb) {
          fs.readFile(file, 'utf8', cb);
        },
        // CSV file parse with some options..
        function(data, cb) {
          parse(data, { columns: true, quote: '' }, cb);
        },
        // modifiers for geoJSON if stops.txt
        function(rows, cb) {
          if (dbname === DB_STOPS) {
            console.log('Mapping stops!');
            return that.mapStops(db, dbname, rows, cb);
          }
          cb(null, rows);
        },
        // drop/create collection routine
        function(rows, cb) {
          async.waterfall([
            // 1: drop collection, ignore errors (if there are no collections, drop will fail but we don't care)
            function(cb) {
              db.collection(dbname).drop(function(err, res) {
                console.log('Collection %s deleted:', dbname, !!res);
                // skip se ho errori. Se non riesco ad eliminare la collection, pace!
                err && console.error(err);
                cb(null);
              });
            },
            // 2: create collection
            function(cb) {
              db.createCollection(dbname, cb);
            },
            // 3: just for information
            function(junk, cb) {
              console.log('Created collection: %s? -', dbname, !!junk);
              cb(null);
            }
          ], function(err) {
            cb(err, rows);
          });
        },
        // insert routine
        function(rows, cb) {
          async.waterfall([
            // insert rows, this will insert #rows
            function(cb) {
              db.collection(dbname).insert(rows, cb);
            },
            // apply indexes to collections
            function(insertResult, cb) {
              console.log(path, dbname + ':', insertResult.length);
              that.createIndexes(db, dbname, cb);
            }
          ], cb);
        }
      ], cb);
    }.bind(this), function (err) {
      db.close();
      err && console.error(path, err);
      cb && cb(err);
    });
  }.bind(this));
};

Handlers.prototype.extraurbano = function(prefix, db, cb) {
  this.readFiles(this.options.extraurbano, prefix, db, cb);
};

Handlers.prototype.urbano = function(prefix, db, cb) {
  this.readFiles(this.options.urbano, prefix, db, cb);
};

module.exports = Handlers;