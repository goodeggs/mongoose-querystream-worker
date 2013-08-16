mongoose-querystream-worker [![build status](https://secure.travis-ci.org/goodeggs/mongoose-querystream-worker.png)](http://travis-ci.org/goodeggs/mongoose-querystream-worker)
===========================

Execute an async function per document in a streamed query, pausing the stream when a concurrency limit is saturated.  Think [async.queue](https://github.com/caolan/async#queue) but for [Mongoose QueryStreams](http://mongoosejs.com/docs/api.html#query_Query-stream).  Built on top of [stream-worker](https://github.com/goodeggs/stream-worker).

```js
require('mongoose-querystream-worker');

Model.find().stream().concurrency(n).work(
  function (doc, done) {
   /* ... work with the doc ... */ 
  }, 
  function (err) {
   /* ...  all workers have finished ... */
  }
});
```
