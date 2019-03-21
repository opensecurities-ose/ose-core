function checkWeb3Plugin() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log("Use Mist/MetaMask's provider");
        web3 = new Web3(web3.currentProvider);
        return web3.currentProvider.isMetaMask;
    } else {
        console.log('No web3? Please install MetaMask first!');
        return false;
    }
}

function checkWeb3Account() {
    var account = web3.eth.accounts[0];
    console.log('account:', account);
    return account;
}

async function getWeb3Nonce(owner) {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getTransactionCount(owner, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}


async function getGasPrice() {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getGasPrice((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });

}

async function ethSign(owner, value) {
    value += '';
    console.log('value:',value);
    var _sha3Msg = web3.sha3(value);
    console.log('_sha3Msg:',_sha3Msg);
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.sign(owner, _sha3Msg, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}


async function ethPersonalSign(owner, value) {
    value += '';
    console.log('value:',value);
    var _encodeMsg = web3.fromUtf8(value);
    console.log('_encodeMsg:',_encodeMsg);
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.personal.sign(_encodeMsg, owner, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}

async function ethSignTypedData(owner, value) {
    console.log(owner, ' value:',value);
    return new Promise((resolve, reject) => {
        if(!web3) {
            console.error('web3 is not ready');
            reject(false);
        } else {
            var params = [value, owner];
            var method = 'eth_signTypedData';

            web3.currentProvider.sendAsync({
                method,
                params,
                owner,
            }, function (err, result) {
                if (err) {
                    console.error('err:',err);
                    reject(err);
                } else if (result.error) {
                    console.error('result.error:',result.error);
                    reject(result.error);
                } else {
                    console.log('PERSONAL SIGNED:' + result.result);
                    resolve(result.result);
                }
            })
        }

    });
}

function getWeb3Account() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log("Use Mist/MetaMask's provider, version:", web3.version);
        web3 = new Web3(web3.currentProvider);
        if(!web3.currentProvider.isMetaMask) {
            return {
                code: 10,
                msg: 'Please wait a moment,try again',
                data: ''
            }
        }
    } else {
        console.log('No web3? Please install MetaMask first!');
        return {
            code: 11,
            msg: 'No web3? Please install MetaMask first!',
            data: ''
        }
    }

    var account = web3.eth.accounts[0];
    console.log('account:', account);
    if(!account) {
        return {
            code: 12,
            msg: 'No wallet, Please login MetaMask first; and make sure you have at least one wallet!',
            data: ''
        }
    }

    return {
        code: 0,
        msg: 'success',
        data: account
    }

}

async function getEthNetWork() {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.version.getNetwork((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });

}

async function getTransactionReceipt(tx) {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getTransactionReceipt(tx, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}

async function getTransaction(tx) {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getTransaction(tx, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}

async function getBlock(block) {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getBlock(block, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}

async function getBlockNumber() {
    return new Promise((resolve, reject) => {
        if(!web3) {
            reject(false);
        } else {
            web3.eth.getBlockNumber((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }

    });
}

function decodeEventsForContract(abi, logs) {
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
                console.log('decoder _params:',decoder['_params'][i]);
                types[decoder['_params'][i]['name']]= decoder['_params'][i]['type'];
            }

            log['types'] = types;
            var _topics = log.topics;
            var _data = log.data;
            var res = decoder.decode(log);
            res['topics'] = _topics;
            res['data'] = _data;
            return res;
        } else {
            console.log('un decoder:',log);
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
}

function InputDataDecoder(abi, input) {
    var _decoder = new Web3InputCoder(abi, null);
    let res = _decoder.decode(input);
    return res;
}

function jsonMerge(json1, json2) {
    if(!json1 ) {
        return json2;
    }
    if(!json2 ) {
        return json1;
    }

    var res = {};
    for(var k in json1) {
        res[k] =json1[k];
    }
    for(var k in json2) {
        res[k] =json2[k];
    }
    return res;
}
