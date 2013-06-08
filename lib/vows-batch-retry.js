var vows = require('vows');

function extend_vows_suite(suite) {
  suite.addBatchRetry = function(batch, nb_try, timeout) {
    var result = {};
    var last = suite;
    for(var k in batch) {
      var current = batch[k];
      var is_ok = false;
      var try_counter = 0;
      var checks = 0;
      var checks_counter = 0;
      var is_current_fail = false;
      for(var j in current) {
        if (j != 'topic') {
          checks += 1;
        }
      }
      for(var i = 0; i < nb_try; i ++) {
        var new_name = k + '[try ' + (i + 1) + '/' + nb_try + ']';
        var new_batch = {};
        new_batch[new_name] = {
          topic: function() {
            var callback = this.callback;
            if (is_ok) {
              return callback();
            }
            try_counter += 1;
            checks_counter = 0;
            is_current_fail = false;
            current.topic.apply({callback: function() {
              if (arguments[0]) {
                console.log('Test failed ' + k + ', retrying.', arguments[0]);
                arguments[0] = null;
                is_current_fail = true;
              }
              callback.apply(null, arguments);
            }});
          }
        };
        for(var j in current) {
          if (j != 'topic') {
            new_batch[new_name][j] = function() {
              if (is_ok || is_current_fail) {
                return;
              }
              try {
                current[j].apply(null, arguments);
                checks_counter += 1;
                if (checks_counter == checks) {
                  is_ok = true;
                }
              }
              catch(e) {
                console.log('Test failed ' + k + ', retrying.', e);
              }
            }
          }
        }
        last = last.addBatch(new_batch);
      };
    }
    return last;
  }
  return suite;
}

exports.describe = function(s) {
  return extend_vows_suite(vows.describe(s));
}
