var vows = require('../lib/vows-batch-retry'),
    assert = require('assert');

var std_counter = 0;
var callback_counter = 0;
var callback_ep2_counter = 0;
var callback_exception_counter = 0;
var callback_topic_counter = 0;

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
  'callback exception test': {
    topic: function() {
      var callback = this.callback;
      setTimeout(function() {
        var result = "myerror";
        callback_exception_counter += 1;
        if (callback_exception_counter == 4) {
          result = null;
        }
        callback(result, "toto");
      }, 100);
    },
    exception_check: function(t) {
      assert.equal(t, "toto");
      assert.equal(callback_exception_counter, 4);
    }
  }
}, 10).addBatchRetry({
//   'callback assert topic test': {
//     topic: function() {
//       var callback = this.callback;
//       setTimeout(function() {
//         callback_topic_counter += 1;
//         assert.equal(callback_topic_counter, 8);
//         callback(null, "toto");
//       }, 100);
//     },
//     exception_check: function(t) {
//       assert.equal(t, "toto");
//     }
//   }
// }, 10).addBatch({
  'check counters': {
    check_std_counters: function() {
      // assert.equal(std_counter, 3);
    },
    check_callback_counters: function() {
      assert.equal(callback_counter, 3);
    },
    check_callback_ep2_counters: function() {
      assert.equal(callback_ep2_counter, 7);
    },
    check_callback_exception_counters: function() {
      assert.equal(callback_exception_counter, 4);
    },
    check_callback_topic_counters: function() {
      assert.equal(callback_topic_counter, 8);
    },
  }
}).export(module);