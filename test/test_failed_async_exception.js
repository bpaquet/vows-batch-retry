var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

vows.describe('vows failed').addBatchRetry({
  'async exception test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback("titi", "toto");
      }, 100);
    },
    cb_check: function(t, tt) {
      assert.equal(t, "toto");
    }
  }
}, 5, 100).export(module);