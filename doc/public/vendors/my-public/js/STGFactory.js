var STGFactory = function (web3, param) {
    var factory = new Web3Helper(web3, param);
    factory.gasLimit = 4890858;


    factory.policyRegistry = function () {
        return factory.callTx('policyRegistry', factory.instance.policyRegistry.getData());
    };

    factory.stoFactory = function () {
        return factory.callTx('stoFactory', factory.instance.stoFactory.getData());
    };

    factory.racRegistry = function () {
        return factory.callTx('racRegistry', factory.instance.racRegistry.getData());
    };

    factory.create = function (issuer, name, symbol, decimals, granularity) {
        let txData = {
            data: factory.instance.create.getData(issuer, name, symbol, decimals, granularity)
        };
        return factory.sendTx(txData);
    };

    return factory;

};


(function(exports){

    exports.STGFactory = STGFactory;

}(typeof exports === 'undefined' ? this.share = {} : exports));
