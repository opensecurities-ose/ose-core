var PolicyRegistry = function (web3, param) {
    var factory = new Web3Helper(web3, param);

    factory.getPolicy = function (_contractAddress, _tranche='') {
        return factory.callTx('getPolicy', factory.instance.getPolicy.getData(_contractAddress, _tranche));
    };

    factory.getContract = function (_contractAddress) {
        return factory.callTx('getContract', factory.instance.getContract.getData(_contractAddress));
    };

    factory.checkContract = function (_contractAddress) {
        return factory.callTx('checkContract', factory.instance.checkContract.getData(_contractAddress));
    };

    factory.addContract = function (_contractAddress) {
        factory.gasLimit = 58611*2;
        let txData = {
            data: factory.instance.addContract.getData(_contractAddress)
        };
        return factory.sendTx(txData);
    };

    factory.removeContract = function (_contractAddress) {
        factory.gasLimit = 58611*2;
        let txData = {
            data: factory.instance.removeContract.getData(_contractAddress)
        };
        return factory.sendTx(txData);
    };

    return factory;

};

(function(exports){

    exports.PolicyRegistry = PolicyRegistry;

}(typeof exports === 'undefined' ? this.share = {} : exports));
