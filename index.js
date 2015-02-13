var settings = require('env-settings');
var async = require('async');

var Mongo = require('./lib/mongo');
var Handlers = require('./lib/handlers');
var handlers = new Handlers({
  extraurbano: './gtfs/google_transit_extraurbano_tte/',
  urbano: './gtfs/google_transit_urbano_tte/'
});

var mongo = new Mongo(settings.mongo, function(err, db) {
  async.parallel([
    function(cb) {
      handlers.extraurbano('EXU', db, cb);
    },
    function(cb) {
      handlers.urbano('U', db, cb);
    }
  ], function(err, junk) {
    err && console.error(err);
    !err && console.log('DONE!');
    mongo.db.close();
  })
});
