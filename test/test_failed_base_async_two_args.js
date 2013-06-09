var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

vows.describe('vows batch retry').addBatch({
  'callback two args test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback("toto");
      }, 100);
    },
    cb_check: function(err, t) {
      assert.ifError(err);
    }
  }
}).export(module);