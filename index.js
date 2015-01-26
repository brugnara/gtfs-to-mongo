var settings = require('env-settings');
var fs = require('fs');

var Mongo = require('./lib/mongo');
var Handlers = require('./lib/handlers');
var handlers = new Handlers({
  extraurbano: './gtfs/googletransitextraurbano/',
  urbano: './gtfs/googletransiturbano/'
});

new Mongo(settings.mongo + 'tt_exu', handlers.extraurbano.bind(handlers));
// new Mongo(settings.mongo + 'tt_u', handlers.urbano.bind(handlers));
