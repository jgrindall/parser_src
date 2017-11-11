#!/bin/sh

cd grammar

echo "build parser"

node buildParser

sleep 1

cd ../

echo "build main"

node build

sleep 1

echo "done"

echo "run"

sleep 1

node run
