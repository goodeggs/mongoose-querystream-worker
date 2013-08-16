// Lifted from https://raw.github.com/LearnBoost/mongoose/master/test/dropdb.js

var start = require('./common');
var db = start();
db.once('open', function () {
  // drop the default test database
  db.db.dropDatabase(function () {
    db.close();
  });
});