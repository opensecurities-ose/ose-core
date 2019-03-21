#!/usr/bin/env bash
basepath=$(cd `dirname $0`; pwd)
datapath=$basepath/doc/data

if [ ! -d "$basepath/runtime" ]; then
    mkdir "$basepath/runtime"
fi

if [ ! -f "$datapath/config.example.js" ]; then
    echo "Please set config.js first, reference doc/data/config.example.js"
    exit 1
fi

if [ ! -f "$datapath/env.example.sh" ]; then
    echo "Please set env.sh first, reference doc/data/env.example.sh"
    exit 1
fi

npm install --save
