var QueryStream = require('mongoose/lib/querystream'),
    streamWorker = require('stream-worker'),
    DEFAULT_CONCURRENCY_LIMIT = 10;

QueryStream.prototype.concurrency = function (max) {
  this._concurrency = max;
  return this;
};

QueryStream.prototype.work = function (worker, options, done) {
  options = options || { };
  if (!options.concurrency) options.concurrency = this._concurrency || DEFAULT_CONCURRENCY_LIMIT;
  return streamWorker(this, worker, options, done);
};
