#!/usr/bin/env bash

docker run --rm -v /Users/charlie/OneRoot/Projects/open-securities/ose-core/contracts:/tmp ethereum/solc:0.4.24 \
  --pretty-json \
  --allow-paths /tmp/ \
  --combined-json "devdoc" \
    /tmp/SecurityToken.sol
    /tmp/STGFactory.sol
