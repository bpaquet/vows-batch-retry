var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

var std_counter = 0;
var callback_counter = 0;
var callback_ep2_counter = 0;
var callback_async_timeout_counter = 0;
var callback_async_exception_counter = 0;
var callback_aysnc_assert_counter = 0;
var callback_aysnc_sync_assert_counter = 0;

vows.describe('vows batch retry').addBatchRetry({
//   'standard test': {
//     topic: function() {
//       return "toto";
//     },
//     my_check: function(t) {
//       assert.equal("toto", t);
//       std_counter += 1;
//       assert.equal(std_counter, 3);
//     }
//   },
// }).addBatchRetry(5, {
  'callback test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback(null, "toto", 43);
      }, 100);
    },
    cb_check: function(t, tt) {
      assert.equal(t, "toto");
      assert.equal(tt, 43);
      callback_counter += 1;
      assert.equal(callback_counter, 3);
    }
  }
}, 5).addBatchRetry({
  'callback ep2 test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback(null, "toto");
      }, 100);
    },
    cb_check: function(t) {
      assert.equal(t, "toto");
      callback_ep2_counter += 1;
      assert.equal(callback_ep2_counter, 7);
    }
  }
}, 10).addBatchRetry({
  'callback async timeout test': {
    topic: function() {
      var callback = this.callback;
      callback_async_timeout_counter += 1;
      var wait = 450 - (50 * callback_async_timeout_counter);
      setTimeout(function() {
        callback(null, "toto");
      }, wait);
    },
    timeout_check: function(t) {
      assert.equal(t, "toto");
    }
  }
}, 10, 200).addBatchRetry({
  'callback async exception test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        var result = "myerror";
        callback_async_exception_counter += 1;
        if (callback_async_exception_counter == 4) {
          result = undefined;
        }
        callback(result, "toto");
      }, 100);
    },
    exception_check: function(t) {
      assert.equal(t, "toto");
      assert.equal(callback_async_exception_counter, 4);
    }
  }
}, 10, 500).addBatchRetry({
  'callback async assert topic test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        callback_aysnc_assert_counter += 1;
        assert.equal(callback_aysnc_assert_counter, 8);
        callback(null, "toto");
      }, 100);
    },
    assert_check: function(t) {
      assert.equal(t, "toto");
    }
  }
}, 10, 500).addBatchRetry({
  'callback async sync assert topic test': {
    topic: function() {
      var callback = this.callback;
      callback_aysnc_sync_assert_counter += 1;
      assert.equal(callback_aysnc_sync_assert_counter, 5);
      setTimeout(function() {
        callback(null, "toto");
      }, 100);
    },
    assert_sync_check: function(t) {
      assert.equal(t, "toto");
    }
  }
}, 10, 200).addBatch({
  'check counters': {
    check_std_counter: function() {
      // assert.equal(std_counter, 3);
    },
    check_callback_counter: function() {
      assert.equal(callback_counter, 3);
    },
    check_callback_ep2_counter: function() {
      assert.equal(callback_ep2_counter, 7);
    },
    check_callback_async_timeout_counter: function() {
      assert.equal(callback_async_timeout_counter, 6);
    },
    check_callback_async_exception_counter: function() {
      assert.equal(callback_async_exception_counter, 4);
    },
    check_callback_async_assert_counter: function() {
      assert.equal(callback_aysnc_assert_counter, 8);
    },
    check_callback_async_sync_assert_counter: function() {
      assert.equal(callback_aysnc_sync_assert_counter, 5);
    },
  }
}).export(module);