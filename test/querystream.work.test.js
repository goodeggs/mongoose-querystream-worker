/**
 * Test dependencies.
 */
require('..');

var start = require('./common')
  , assert = require('assert')
  , mongoose = start.mongoose
  , utils = require('mongoose/lib/utils')
  , random = utils.random
  , Schema = mongoose.Schema
  , Promise = require('bluebird')

var names = ('Aaden Aaron Adrian Aditya Agustin Jim Bob Jonah Frank Sally Lucy').split(' ');

/**
 * Setup.
 */

var Person = new Schema({
  name: String
});

mongoose.model('PersonForStream', Person);
var collection = 'personforstream_' + random();

describe('query stream worker:', function(){
  before(function (done) {
    var db = start()
      , P = db.model('PersonForStream', collection)

    var people = names.map(function (name) {
      return { name: name };
    });

    P.create(people, function (err) {
      assert.ifError(err);
      db.close();
      done();
    });
  });

  it('invokes a worker (promise-style) for each doc', function(done){
    var db = start()
      , P = db.model('PersonForStream', collection)
      , i = 0

    return P.find().stream().work(function(doc) {
      i++
    }, {promises : true}).then(function() {
      assert.equal(i, names.length);
      done();
    });
  });

  it('invokes a worker (callback-style) for each doc', function(done){
    var db = start()
      , P = db.model('PersonForStream', collection)
      , i = 0

    var stream = P.find().stream().work(
      function(doc, done) {
        i++;
        done();
      },{promises : false},
      function(err) {
        assert.equal(i, names.length);
        done();
      }
    );
  });

  it('limits concurrency', function(testDone){
    var db = start()
      , P = db.model('PersonForStream', collection)
      , workers = []
      , docCount = 0
      , concurrencyLimit = 2
      , i = 0

    function worker (doc, done) {
      workers.push({done: done});
    }

    function workFinished (err) {
      testDone();
    }

    var stream = P.find().stream();
    stream.concurrency(concurrencyLimit).work(worker, {}, testDone);

    function checkWorkers () {
      assert(workers.length <= concurrencyLimit, 'the concurrency limit is never exceeded');

      var oldDocCount = ++docCount;
      if(docCount <= concurrencyLimit) {
        process.nextTick(function () {
          assert(docCount > oldDocCount, 'not yet saturated, expect another worker to be started');
        });
      } else if (docCount == concurrencyLimit) {
        process.nextTick(function () {
          assert(docCount == oldDocCount, 'now we\'re saturated, no more workers');

          // good, now free up a  worker
          workers.pop().done();
        });
      } else {
        // check passed, burn the rest of the stream
        while(workers.length) {
          workers.pop().done();
        }
      }
    }

    stream.on('data', function() {
      // nextTick to make sure worker has started
      process.nextTick(checkWorkers);
    });
  });
});
