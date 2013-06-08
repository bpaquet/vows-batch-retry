#!/bin/bash

set -e

cd test

if [ "$TEST" = "" ]; then
  TEST=`ls test*.js`
fi

for test in $TEST; do
  if [[ "$test" =~ "test_ok" ]]; then
    echo "Launching test : $test"
    NODE_PATH=../lib vows $test --spec
  else
    echo "Launching failing test : $test"
    NODE_PATH=../lib vows $test --spec && exit 1
  fi
done
