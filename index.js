var settings = require('env-settings');
var async = require('async');

var Mongo = require('./lib/mongo');
var Handlers = require('./lib/handlers');
var handlers = new Handlers({
  extraurbano: './gtfs/googletransitextraurbano/',
  urbano: './gtfs/googletransiturbano/'
});

// new Mongo(settings.mongo + 'tt_exu', handlers.extraurbano.bind(handlers));
// new Mongo(settings.mongo + 'tt_u', handlers.urbano.bind(handlers));
new Mongo(settings.mongo, function(err, db) {
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
  })
});