var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

vows.describe('vows batch retry').addBatch({
  'standard test': {
    topic: function() {
      return "toto";
    },
    my_check: function(t) {
      assert.equal("toto", t);
    }
  },
  'callback test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback(null, "toto");
      }, 100);
    },
    cb_check: function(t) {
      assert.equal("toto", t);
    }
  }
}).export(module);