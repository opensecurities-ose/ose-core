var utils = require("web3/lib/utils/utils.js");
var SolidityEvent = require("web3/lib/web3/event.js");
///decode events from logs to human readable
module.exports = function EventsDataDecoder(abi, logs) {
    if(!abi || !logs) {
        return logs;
    }
    var decoders = abi.filter(function (json) {
        return json.type === 'event';
    }).map(function(json) {
        // note first and third params only required only by enocde and execute;
        // so don't call those!
        return new SolidityEvent(null, json, null);
    });

    let result = logs.map(function (log) {
        var decoder = decoders.find(function(decoder) {
            return (decoder.signature() == log.topics[0].replace("0x",""));
        })
        if (decoder) {
            // console.log('decoder:',decoder['_params']);
            let types = {};
            for(let i=0; i<decoder['_params'].length; i++) {
                console.log('decoder _params:',decoder['_params'][i]);
                types[decoder['_params'][i]['name']]= decoder['_params'][i]['type'];
            }

            log['types'] = types;
            return decoder.decode(log);
        } else {
            // console.log('un decoder:',log);
            return log;
        }
    }).map(function (log) {
        let abis = abi.find(function(json) {
            return (json.type === 'event' && log.event === json.name);
        });
        if (abis && abis.inputs) {
            abis.inputs.forEach(function (param, i) {
                if (param.type == 'bytes32') {
                    log.args[param.name] = utils.toUtf8(log.args[param.name]);
                }
            })
        }
        return log;
    });

    // Log.debug(result);
    return result;
}
