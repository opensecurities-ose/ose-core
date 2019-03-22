var SecurityToken = function (web3, param) {
    var factory = new Web3Helper(web3, param);

    factory.symbol = function () {
        return factory.callTx('symbol', factory.instance.symbol.getData());
    };

    factory.name = function () {
        return factory.callTx('name', factory.instance.name.getData());
    };

    factory.totalSupply = function () {
        return factory.callTx('totalSupply', factory.instance.totalSupply.getData());
    };

    factory.granularity = function () {
        return factory.callTx('granularity', factory.instance.granularity.getData());
    };

    factory.decimals = function () {
        return factory.callTx('decimals', factory.instance.decimals.getData());
    };

    factory.owner = function () {
        return factory.callTx('owner', factory.instance.owner.getData());
    };

    factory.getTrancheTotalSupply = function (tranche) {
        return factory.callTx('getTrancheTotalSupply', factory.instance.getTrancheTotalSupply.getData(tranche));
    };

    factory.balanceOf = function (owner) {
        return factory.callTx('balanceOf', factory.instance.balanceOf.getData(owner));
    };

    factory.balanceOfTranche = function (tranche, owner) {
        return factory.callTx('balanceOfTranche', factory.instance.balanceOfTranche.getData(tranche, owner));
    };

    factory.getPolicy = function (tranche='') {
        return factory.callTx('getPolicy', factory.instance.getPolicy.getData(tranche));
    };

    factory.checkRole = function (owner, action) {
        return factory.callTx('checkRole', factory.instance.checkRole.getData(owner, action));
    };

    factory.registryPolicy = function (tranche, policy) {
        factory.gasLimit = 49284*2;
        let txData = {
            data: factory.instance.registryPolicy.getData(tranche, policy)
        };
        return factory.sendTx(txData);
    };

    factory.mint = function (investor, amount) {
        factory.gasLimit = 60000*4;
        let txData = {
            data: factory.instance.mint.getData(investor, amount)
        };
        return factory.sendTx(txData);
    };

    factory.batchMint = function (investors, amounts) {
        factory.gasLimit = 60000*4 * investors.length;
        let txData = {
            data: factory.instance.batchMint.getData(investors, amounts)
        };
        return factory.sendTx(txData);
    };

    factory.mintTranche = function (tranche, investor, amount) {
        factory.gasLimit = 60000*4;
        let txData = {
            data: factory.instance.mintTranche.getData(tranche, investor, amount, '')
        };
        return factory.sendTx(txData);
    };

    factory.batchMintTranche = function (tranche, investors, amounts) {
        factory.gasLimit = 60000*4 * investors.length;
        let txData = {
            data: factory.instance.batchMintTranche.getData(tranche, investors, amounts, '')
        };
        return factory.sendTx(txData);
    };


    factory.approve = function (operator, value=1) {
        factory.gasLimit = 55183*2;
        let txData = {
            data: factory.instance.approve.getData(operator, value)
        };
        return factory.sendTx(txData);
    };

    factory.addRole = function (owner, action) {
        factory.gasLimit = 58611*2;
        let txData = {
            data: factory.instance.addRole.getData(owner, action)
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


    return factory;

};


(function(exports){

    exports.SecurityToken = SecurityToken;

}(typeof exports === 'undefined' ? this.share = {} : exports));
