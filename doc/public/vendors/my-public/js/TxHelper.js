var TxHelper = function (web3, _prefix='') {
    var factory = new StorageHelper('STOTX'+_prefix+'-');
    factory._isHandle = false;
    factory.etime = 30000;
    factory.processCallback = null;

    factory.setUid = function(uid) {
        factory._PREFIX = 'STOTX'+uid+'-';
    };

    factory.processOK = function(_data) {
        // console.log('processOK:', _data);
        if(! _data) {
            factory._isHandle = false;
            return;
        }

        factory.remove(_data.transactionHash);
        factory._isHandle = false;
    };

    factory.process = function() {
        if(factory._isHandle) {
            return;
        }
        if(!factory.processCallback) {
            console.error('must be set processCallback function!!!');
            return;
        }


        var _tx = null;
        for(var _i=0; _i<localStorage.length; _i++) {
            if(localStorage.key(_i) === null) {
                continue;
            }
            if(factory._PREFIX == localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                _tx = localStorage.key(_i).substring(factory._PREFIX.length);
                factory._isHandle = true;
                // console.log('watch tx:', _tx);
                factory.getTransactionReceipt(_tx);
                break;
            }

        }

        setTimeout(factory.process, factory.etime);
    };


    factory.getTransactionReceipt = function(tx) {
        web3.eth.getTransactionReceipt(tx, function(error, result) {
            if (error) {
                //nothing
            } else {
                // console.log('Receipt:', result);
                if(result && result.hasOwnProperty('status')) {
                    var _bn = new BigNumber(result.status);
                    result.status = _bn.toNumber();
                    let res = {
                        transactionHash: result.transactionHash,
                        status: result.status,
                        from: result.from,
                        to: result.to
                    };

                    factory.processCallback(res);
                }

            }
            factory._isHandle = false;
        });
    };

    return factory;

};
// dont override global variable
if (typeof window !== 'undefined' && typeof window.TxHelper === 'undefined') {
    window.TxHelper = TxHelper;
}
(function(exports){

    exports.TxHelper = TxHelper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
