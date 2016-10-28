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

    return P.find().cursor().work(function(doc) {
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

    var stream = P.find().cursor().work(
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

    function worker (doc, done) {
      workers.push({done: done});
    }

    var stream = P.find().cursor();
    stream.concurrency(concurrencyLimit).work(worker, {}, testDone);

    function checkWorkers () {
      assert(workers.length <= concurrencyLimit, 'the concurrency limit is never exceeded');

      docCount += 1;
      if(docCount <= concurrencyLimit) {
        assert(stream._readableState.flowing, 'not yet saturated, expect another worker to be started');
      } else if (docCount == concurrencyLimit) {
        assert(!stream._readableState.flowing, 'now we\'re saturated, no more workers');
        workers.pop().done();
        assert(stream._readableState.flowing, 'worker freed up, resume');
      } else {
        // check passed, burn the rest of the stream
        while(workers.length) {
          workers.pop().done();
        }
      }
    }

    stream.on('data', checkWorkers);
  });
});
