mongoose-querystream-worker [![build status](https://secure.travis-ci.org/goodeggs/mongoose-querystream-worker.png)](http://travis-ci.org/goodeggs/mongoose-querystream-worker)
===========================

DEPRECATED - In light of [Mongoose QueryStreams](http://mongoosejs.com/docs/api.html#query_Query-stream) being deprecated in favor of  [Mongoose QueryCursors](http://mongoosejs.com/docs/api.html#query_Query-cursor), may as well just depend on [stream-worker](https://github.com/goodeggs/stream-worker) directly, rather than maintaining this lightweight syntatic layer.

Execute an async function per document in a streamed query, pausing the stream when a concurrency limit is saturated.  Think [async.queue](https://github.com/caolan/async#queue) but for [Mongoose QueryStreams](http://mongoosejs.com/docs/api.html#query_Query-stream).  Built on top of [stream-worker](https://github.com/goodeggs/stream-worker).

```js
require('mongoose-querystream-worker');

/* Promises: */

Model.find().cursor().concurrency(n).work(function (doc) {
  /* ... work with the doc ... */
  return doc.save(); /* returns a promise */
}, {promises: true})
.then(function() {
  /* ...  all workers have finished ... */
}, function(err) {
  /* ...  something went wrong ... */
});

/* Callbacks: */

Model.find().cursor().concurrency(n).work(
  function (doc, done) {
    /* ... work with the doc ... */
  },
  function (err) {
    /* ...  all workers have finished ... */
  }
);
```
