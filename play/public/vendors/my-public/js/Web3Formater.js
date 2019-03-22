var Web3Formater = function (web3, abi) {
    var factory = {
        web3: web3,
        abi: abi
    };

    factory.decodeMethodOutput = function(name, data) {
        var _output = factory.filterMethodOutput(name);
        if(_output.length == 0) {
            return data;
        }

        if(!Array.isArray(data)) {
            data = [data];
        }

        factory.outputFormats(_output, data);

        if(_output.length == 1 && _output[0].indexOf('[]') != -1) {
            return data[0];
        }

        return data;
    };

    factory.filterMethodOutput = function(name) {
        if(!name) {
            console.error('filterMethodOutput name is null');
            return null;
        }
        var result = abi.filter(function (json) {
            return (json.type === 'function' && json.name === name );
        }).map(function(json) {
            var _res = [];
            json.outputs.forEach(function (param, i) {
                _res.push(param.type);
            });
            return _res;
        });

        // console.log('filterMethodOutput:', result);

        return result;
    };

    factory.outputFormats = function(types, data) {
        for(let i=0; i< data.length; i++) {
            if(Array.isArray(data[i])) {
                let _types = [];
                for(let j=0; j<data[i].length; j++) {
                    let _param = types[i].replace('[]','');
                    _types.push(_param);
                }
                factory.outputFormats(_types, data[i]);
            } else if(types[i] =='address') {
                data[i] = factory.toAddress(data[i]);
            } else if(types[i] =='bytes32') {
                data[i] = web3.toUtf8(data[i]);
            } else if(types[i] =='string') {
                data[i] = web3.toAscii(data[i]);
            } else if(types[i] =='bool') {
                data[i] = web3.toDecimal(data[i]);
                if(data[i]) {
                    data[i] = true;
                } else {
                    data[i] = false;
                }
            } else if(types[i].substring(0,4)=='uint') {
                data[i] = web3.toBigNumber(data[i]).toString(10);
            }
        }
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

        return '0x'+address.toLocaleString();
    };

    return factory;

};

// dont override global variable
if (typeof window !== 'undefined' && typeof window.Web3Formater === 'undefined') {
    window.Web3Formater = Web3Formater;
}

(function(exports){

    exports.Web3Formater = Web3Formater;

}(typeof exports === 'undefined' ? this.share = {} : exports));
