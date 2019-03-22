var STOFactory = function (web3, param) {
    var factory = new Web3Helper(web3, param);
    factory.gasLimit = 2455988;

    factory.create = function (securityToken, tranche, paused, addresses, values) {
        let txData = {
            data: factory.instance.create.getData(securityToken, tranche, paused, addresses, values)
        };
        return factory.sendTx(txData);
    };


    return factory;

};

(function(exports){

    exports.STOFactory = STOFactory;

}(typeof exports === 'undefined' ? this.share = {} : exports));
