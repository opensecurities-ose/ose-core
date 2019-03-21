var EventHelper = function (web3, uid='', abis={}, configContract=null) {
    var factory = {
        _PREFIX: 'STOEvent'+uid+'-',
        _ContractHelper: new ContractHelper(uid),
        _handleEx: null,
        _isHandle: false,
        etime: 5000,
        abis: abis,
        topics: null,
        configContract: configContract,
        fromBlock: 'latest',
        toBlock: 'latest',
        processCallback: null,
        watchCallback: null
    };

    factory.setUid = function(uid) {
        factory._ContractHelper = new ContractHelper(uid);
    };

    factory.saveEvent = function(_data) {
        // console.log('_data:',_data);
        var _bn = new BigNumber(_data.logIndex);
        var _k = _data.transactionHash+_bn.toString(16);
        localStorage.setItem(factory._PREFIX+_k, JSON.stringify(_data));
        // console.log('get:', localStorage.getItem(factory._PREFIX+_k));
    };

    factory.processOK = function(_data) {
        // console.log('_data:', _data);
        if(typeof _data != 'object') {
            factory._isHandle = false;
            return;
        }
        var _bn = new BigNumber(_data.logIndex);
        var _k = _data.transactionHash+_bn.toString(16);
        // console.log('removeItem:', factory._PREFIX+_k);
        localStorage.removeItem(factory._PREFIX+_k);
        factory._isHandle = false;
    };

    factory.process = function() {
        // console.log('isHandle:', factory._isHandle);
        // console.log('localStorage.length:', localStorage.length);
        if(factory._isHandle) {
            return;
        }
        if(!factory.processCallback) {
            console.error('must be set processCallback function!!!');
            return;
        }
        for(var _i=0; _i<localStorage.length; _i++) {
            if(localStorage.key(_i) === null) {
                continue;
            }
            if(factory._PREFIX == localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                // console.log(localStorage.key(_i), localStorage.getItem(localStorage.key(_i)));
                var _val = localStorage.getItem(localStorage.key(_i));
                try {
                    _val = JSON.parse(_val);
                } catch (e) {

                }
                factory._isHandle = true;
                factory.processCallback(_val);
                break;
            }

        }

        setTimeout(factory.process, factory.etime);
    };

    factory.watch = function(address='', name='') {
        //watch specify
        if(address && name) {
            if(factory._ContractHelper.exists(address)) {
                return;
            }
            factory._ContractHelper.set(address, name);
            factory.watchContract(address, name);
            return;
        }

        //watch storage
        var _contractList = factory._ContractHelper.list();
        // console.log('_contractList:', _contractList);
        if(!_contractList || typeof _contractList != 'object') {
            return;
        }

        for (var addr in _contractList) {
            // console.log(addr, _contractList[addr]);
            factory.watchContract(addr, _contractList[addr]);
        }
    };


    factory.watchContract = function(address, name) {
        if(!address || !name) {
            return;
        }

        var _abi = factory.getAbi(name);
        if(!_abi)  {
            console.error('invalid contract type:', address, name);
            return;
        }

        // console.log('watch Contract:', address, name);

        var _options = {
            fromBlock: factory.fromBlock,
            toBlock: factory.toBlock,
            address: address
        };


        var filter = web3.eth.filter(_options);
        filter.watch(function (error, log) {
            if(error) {
                console.error('error:', error);
            } else {
                // console.log(options.address+':', log);
                // do something, i.e.
                // var _tx = log.transactionHash
                // 1. save
                var _logs =  factory.decodeEventsForContract(_abi, [log]);
                // console.log('decodeEventsForContract:',_logs);
                if(_logs && _logs[0].hasOwnProperty('args')) {
                    factory.saveContract(_logs[0]);
                    factory.watchCallback(_logs[0]);
                } else {
                    console.error('fail to decodeEventsForContract,', log.transactionHash);
                }

            }

        });
    };

    factory.getAbi = function(name) {
        // console.log('name:', name);
        if(!name) {
            return;
        }
        var abi='';
        if(name=='ST') {
            abi = factory.abis['abiSecurityToken'];
        } else if(name=='GP') {
            abi = factory.abis['abiGP'];
        } else if(name=='STO') {
            abi = factory.abis['abiSTO'];
        } else if(name=='STOFactory') {
            abi = factory.abis['abiSTOFactory'];
        } else if(name=='STGFactory') {
            abi = factory.abis['abiSTGFactory'];
        } else if(name=='RAC') {
            abi = factory.abis['abiRAC'];
        } else {
            console.error('not found:', name);
        }
        return abi;
    };

    factory.saveContract = function(alog) {
        if(!alog || !alog.hasOwnProperty('address')|| !alog.hasOwnProperty('event') || !alog.hasOwnProperty('args')) {
            return;
        }
        let name = null;
        if(!factory.configContract) {
            return;
        }
        for(let k in factory.configContract) {
            if(factory.configContract[k].toLowerCase() == alog.address) {
                name = k;
                break;
            }
        }
        if(!name) {
            return;
        }

        if(name == 'STGFactory') {
            if(alog.event == 'CreateSTG') {
                if(alog.args.hasOwnProperty('_securityToken')) {
                     factory._ContractHelper.set(alog.args._securityToken, 'ST');
                }
                if(alog.args.hasOwnProperty('_policy')) {
                    factory._ContractHelper.set(alog.args._policy, 'GP');
                }
            }
        } else if(name == 'STOFactory') {
            if(alog.event == 'CreateSTO') {
                if(alog.args.hasOwnProperty('_sto')) {
                    factory._ContractHelper.set(alog.args._sto, 'STO');

                }
            }
        }

        return;

    };

    factory.decodeEventsForContract = function(abi, logs) {
        if(!abi || !logs) {
            console.error('decodeEventsForContract invalid param');
            return logs;
        }
        var decoders = abi.filter(function (json) {
            return json.type === 'event';
        }).map(function(json) {
            // note first and third params only required only by enocde and execute;
            // so don't call those!
            return new Web3EventCoder(json, null);
        });

        let result = logs.map(function (log) {
            var decoder = decoders.find(function(decoder) {
                return (decoder.signature() == log.topics[0].replace("0x",""));
            })
            if (decoder) {
                // console.log('decoder:',decoder['_params']);
                var types = {};
                for(var i=0; i<decoder['_params'].length; i++) {
                    // console.log('decoder _params:',decoder['_params'][i]);
                    types[decoder['_params'][i]['name']]= decoder['_params'][i]['type'];
                }

                log['types'] = types;
                return decoder.decode(log);
            } else {
                console.warn('un decoder:',log);
                return log;
            }
        }).map(function (log) {
            var abis = abi.find(function(json) {
                return (json.type === 'event' && log.event === json.name);
            });
            if (abis && abis.inputs) {
                abis.inputs.forEach(function (param, i) {
                    // console.log('param.type:',param.type);
                    if (param.type == 'bytes32') {
                        log.args[param.name] = web3.toUtf8(log.args[param.name]);
                    }
                })
            }
            return log;
        });

        // Log.debug(result);
        return result;
    };


    return factory;

};

// dont override global variable
if (typeof window !== 'undefined' && typeof window.EventHelper === 'undefined') {
    window.EventHelper = EventHelper;
}

(function(exports){

    exports.EventHelper = EventHelper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
