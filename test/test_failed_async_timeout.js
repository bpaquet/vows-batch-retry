var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

vows.describe('vows failed').addBatchRetry({
  'async assert test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
      }, 100);
    },
    cb_check: function(err, tt) {
      assert.ifError(err);
      assert.equal(t, "toto");
    }
  }
}, 5, 100).export(module);