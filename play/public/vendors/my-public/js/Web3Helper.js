var Web3Helper = function (web3, param) {
    var factory = {
        web3: web3,
        nonce: param['nonce'],
        gasPrice: param['gasPrice']? param['gasPrice'] : web3.toWei("5", "gwei"),
        gasLimit: param['gasLimit']? param['gasLimit'] : 100000,
        address: param['address'],
        abi: param['abi'],
        value: param['value']? param['value'] : '0x00',
        instance: web3.eth.contract(param['abi']).at(param['address']),
        block: param['block']? param['block'] : 'latest',
        sender: param['sender']
    };

    factory.debug = function() {
        console.log('instance:', factory.instance);
    };

    factory.contract = function(abi, address) {
        factory.abi = abi;
        factory.address = address;
        factory.instance = web3.eth.contract(abi).at(address);
    };

    /**
     * web3.eth.sendTransaction, with default values, overwritted by passed params
     **/
    factory.sendTx = function (_txParams=null) {
        let txParams = {
            nonce: web3.toHex(factory.nonce),
            gas: web3.toHex(factory.gasLimit),
            gasPrice: web3.toHex(factory.gasPrice),
            to: factory.address,
            from: factory.sender,
            // 调用合约转账value这里留空
            value: factory.value,
            data: null
        };

        if(_txParams) {
            Object.assign(txParams, _txParams);
        }

        // console.log('txParams:',txParams);
        return new Promise((resolve, reject) => {
            web3.eth.sendTransaction(txParams, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            });
        });
    };

    /**
     * web3.eth.call, with default values, overwritted by passed params
     **/
    factory.callTx = function (method, data) {
        let txParams = {
            to: factory.address,
            from: factory.sender,
            data: data
        };

        return new Promise((resolve, reject) => {
            web3.eth.call(txParams, factory.block, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    result = factory.decodeMethodOutput(method, result);
                    resolve(result);
                }

            });
        });

    };

    factory.setNonce = function (nonce) {
        factory.nonce = nonce;
    };

    factory.setSender = function (address) {
        factory.sender = address;
    };

    factory.startTrans = function (address) {
        return new Promise((resolve, reject) => {
            web3.eth.getTransactionCount(address, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    factory.sender = address;
                    factory.nonce = result;
                    resolve(result);
                }
            });
        });
    };


    factory.decodeMethodOutput = function(name, data) {
        var _output = factory.filterMethodOutput(name);
        if(_output.length == 0) {
            return data;
        }

        if(data===null) {
            return data;
        }

        if(Array.isArray(data)) {
            factory.outputFormatArray(_output, data);
        } else {
            data = factory.outputFormats(_output, data);
        }

        if(Array.isArray(data) &&  data.length==1 && !Array.isArray(data[0])) {
            return data[0];
        }

        return data;
    };

    factory.filterMethodOutput = function(name) {
        if(!name) {
            console.error('filterMethodOutput name is null');
            return null;
        }
        var result = factory.instance.abi.filter(function (json) {
            return (json.type === 'function' && json.name === name );
        }).map(function(json) {
            var _res = [];
            json.outputs.forEach(function (param, i) {
                // console.log('push type:',param.type);
                _res.push(param.type);
            });
            return _res;
        });

        // console.log('filterMethodOutput:', result[0]);

        return result[0];
    };

    factory.outputFormatArray = function(types, data) {
        //todo
        return data;
    };

    factory.outputFormats = function(types, data) {
        // console.log('types:', types);
        // console.log('original data:', data);
        var result = [];
        if(data.substring(0,2)=='0x') {
            data = data.substring(2);
        }
        // console.log('types.length:', types.length);
        for(var i=0; i< types.length; i++) {
            var _data = '0x'+data.substring(0,64);
            if(_data=='0x') {
                _data = '0x0';
            }
            data = data.substring(64);
            var _type = types[i].toString();
            // console.log(_type+':', _data);
            if(_type =='address') {
                result.push(factory.toAddress(_data));
            } else if(_type =='bytes32') {
                result.push(web3.toUtf8(_data));
            } else if(_type =='bool') {
                var _res = web3.toDecimal(_data);
                if(_res) {
                    _res = true;
                } else {
                    _res = false;
                }
                result.push(_res);
            } else if(_type.substring(0,4)=='uint') {
                result.push(web3.toBigNumber(_data).toString(10));
            } else if(_type =='string') {
                _data += data.substring(0,128);
                data = data.substring(128);
                result.push(web3.toAscii(_data));
            } else {
                _data += data.substring(0,128);
                data = data.substring(128);
                result.push(_data);
            }
        }

        // console.log('result:', result);
        return result;
    };

    factory.toAddress = function(address) {
        if(!address) {
            return address;
        }

        if(address.toLowerCase().substring(0,2) == '0x') {
            address = address.substring(2);
        }

        if(address.length == 64) {
            var _taddr = '';
            for(var i=0; i< address.length; i++) {
                if(address[i] == '0') {
                    continue;
                } else if(address[i] != '0') {
                    _taddr = address.substring(i);
                    break;
                }
            }
            address = _taddr;
        }

        if(!address) {
            address = '0000000000000000000000000000000000000000';
        }
        return '0x'+address.toLocaleString();
    };

    return factory;

};

// dont override global variable
if (typeof window !== 'undefined' && typeof window.Web3Helper === 'undefined') {
    window.Web3Helper = Web3Helper;
}

(function(exports){

    exports.Web3Helper = Web3Helper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
