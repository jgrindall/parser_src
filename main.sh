#!/bin/sh

cd grammar

echo "build parser"

node buildParser

cd ../

echo "build main"

node build

echo "done"

echo "run"

node run
