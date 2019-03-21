#!/bin/bash
basepath=$(cd `dirname $0`; pwd)
parse_pk() {
    grep '"pk"' "${basepath}/data/wallet.data.json" | while read line
    do
        pk=`echo $line | sed s/[[:space:]]//g  | sed 's/"pk":"\(.*\)"/\1/g'`
        #echo $pk
        echo  --account="${pk},10000000000000000000000"
    done
}

params=`parse_pk`

echo ganache-cli $params

ganache-cli $params
