#!/bin/sh

cd grammar

echo "build parser"

node buildParser

sleep 0.5

cd ../

echo "build main"

node build

sleep 0.5

echo "done"

echo "run"

sleep 0.5

node run
