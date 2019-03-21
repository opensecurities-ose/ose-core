var GP = function (web3, param) {
    var factory = new Web3Helper(web3, param);

    factory.securityToken = function () {
        return factory.callTx('securityToken', factory.instance.securityToken.getData());
    };

    factory.getPolicyDetails = function(_investor, _tranche='') {
        return factory.callTx('getPolicyDetails', factory.instance.getPolicyDetails.getData(_investor, _tranche));
    };

    factory.modifyWhitelist = function (investor, fromTime, toTime, expiryTime, canTransfer=true, tranche='') {
        factory.gasLimit = 68611*2;
        let txData = {
            data: factory.instance.modifyWhitelist.getData(investor, fromTime, toTime, expiryTime, canTransfer, tranche)
        };
        return factory.sendTx(txData);
    };

    factory.batchModifyWhitelist = function (investor, fromTime, toTime, expiryTime, canTransfer=true, tranche='') {
        factory.gasLimit = 68896*2 * investor.length;

        let txData = {
            data: factory.instance.batchModifyWhitelist.getData(investor, fromTime, toTime, expiryTime, canTransfer, tranche)
        };
        return factory.sendTx(txData);
    };

    return factory;

};

(function(exports){

    exports.GP = GP;

}(typeof exports === 'undefined' ? this.share = {} : exports));
