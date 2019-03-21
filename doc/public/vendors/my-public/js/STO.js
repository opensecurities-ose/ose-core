var STO = function (web3, param) {
    var factory = new Web3Helper(web3, param);

    factory.securityToken = function () {
        return factory.callTx('securityToken', factory.instance.securityToken.getData());
    };

    factory.getSTODetails = function () {
        return factory.callTx('getSTODetails', factory.instance.getSTODetails.getData());
    };

    factory.configure = function (tranche, paused, addresses, values) {
        factory.gasLimit = 178176*2;
        let txData = {
            data: factory.instance.configure.getData(tranche, paused, addresses, values)
        };
        return factory.sendTx(txData);
    };

    factory.buy = function (amount) {
        factory.gasLimit = 181928*2;
        let txData = {
            value: amount,
            data: factory.instance.buy.getData()
        };
        return factory.sendTx(txData);
    };

    factory.buyWithToken = function (amount) {
        factory.gasLimit = 181928*2;
        let txData = {
            data: factory.instance.buyWithToken.getData(amount)
        };
        return factory.sendTx(txData);
    };

    return factory;

};

(function(exports){

    exports.STO = STO;

}(typeof exports === 'undefined' ? this.share = {} : exports));
