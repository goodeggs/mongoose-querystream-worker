var QueryCursor = require('mongoose/lib/querycursor'),
    streamWorker = require('stream-worker'),
    DEFAULT_CONCURRENCY_LIMIT = 10;

QueryCursor.prototype.concurrency = function (max) {
  this._concurrency = max;
  return this;
};

QueryCursor.prototype.work = function (worker, options, done) {
  options = options || { };
  if (!options.concurrency) options.concurrency = this._concurrency || DEFAULT_CONCURRENCY_LIMIT;
  return streamWorker(this, worker, options, done);
};
