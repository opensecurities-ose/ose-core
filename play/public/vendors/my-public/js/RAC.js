var RAC = function (web3, param) {
    var factory = new Web3Helper(web3, param);

    factory.checkRole = function (owner, action) {
        return factory.callTx('checkRole', factory.instance.checkRole.getData(owner, action));
    };

    factory.addRole = function (owner, action) {
        factory.gasLimit = 58611*2;
        let txData = {
            data: factory.instance.addRole.getData(owner, action)
        };
        return factory.sendTx(txData);
    };

    factory.batchAddRole = function (owner, actions) {
        factory.gasLimit = 65896*2 * actions.length;

        let txData = {
            data: factory.instance.batchAddRole.getData(owner, actions)
        };
        return factory.sendTx(txData);
    };

    factory.removeRole = function (owner, action) {
        factory.gasLimit = 58611*2;
        let txData = {
            data: factory.instance.removeRole.getData(owner, action)
        };
        return factory.sendTx(txData);
    };

    factory.batchRemoveRole = function (owner, actions) {
        factory.gasLimit = 65896*2 * actions.length;

        let txData = {
            data: factory.instance.batchRemoveRole.getData(owner, actions)
        };
        return factory.sendTx(txData);
    };

    return factory;

};

(function(exports){

    exports.RAC = RAC;

}(typeof exports === 'undefined' ? this.share = {} : exports));
