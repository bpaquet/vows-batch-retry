var vows = require('vows');

var catch_error = false;
var error_catched = [];

process.on('uncaughtException', function(err) {
  if (catch_error) {
    error_catched.push(err);
  }
});

function extend_vows_suite(suite) {
  suite.addBatchRetry = function(batch, nb_try, timeout) {
    if (! timeout) {
      timeout = 2000;
    }
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
            var callback_already_called = false;
            if (is_ok) {
              return callback();
            }
            try_counter += 1;
            checks_counter = 0;
            is_current_fail = false;
            catch_error = true;
            error_catched = [];
            var timer = setTimeout(function() {
              console.log('Test failed \'' + k + '\' with topic timeout, retrying.');
              if (error_catched.length > 0) {
                console.log('Catched errors', error_catched);
              }
              callback_already_called = true;
              is_current_fail = true;
              catch_error = false;
              if (try_counter == nb_try) {
                callback('Too many try, failing');
              }
              else {
                callback();
              }
            }, timeout);
            try {
              var result = current.topic.apply({callback: function() {
                catch_error = false;
                if (timer) {
                  clearTimeout(timer);
                  timer = undefined;
                }
                if (callback_already_called) {
                  return;
                }
                callback_already_called = true;
                if (arguments[0]) {
                  console.log('Test failed \'' + k + '\' with topic exception, retrying.', arguments[0]);
                  is_current_fail = true;
                  if (try_counter == nb_try) {
                    callback('Too many try, failing');
                  }
                  else {
                    callback();
                  }
                }
                else {
                  callback.apply(null, arguments);
                }
              }});
              if (result) {
                if (timer) {
                  clearTimeout(timer);
                  timer = undefined;
                }
                process.nextTick(function() {
                  callback(null, result);
                });
              }
            }
            catch(e) {
              console.log('Test failed \'' + k + '\' with topic exception, retrying.', e);
              if (timer) {
                clearTimeout(timer);
                timer = undefined;
              }
              if (try_counter == nb_try) {
                callback('Too many try, failing');
              }
              else {
                callback();
              }
            }
          }
        };
        for(var j in current) {
          if (j != 'topic') {
            new_batch[new_name][j] = function() {
              if (is_ok || is_current_fail) {
                return;
              }
              checks_counter += 1;
              try {
                current[j].apply(null, arguments);
                if (checks_counter == checks) {
                  is_ok = true;
                }
              }
              catch(e) {
                console.log('Test failed \'' + k + '\' with exception, retrying.', e);
                if (checks_counter == checks && try_counter == nb_try) {
                  throw new Error('Too many try, failing')
                }
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
