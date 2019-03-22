var abiSTO =[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lockMonths","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"holdTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fundsReceiver","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fundRaiseToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalTokensSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tranche","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minInvestorAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxInvestorAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"fundsRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pausedTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"securityToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxInvestors","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"deployer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"investorCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_securityToken","type":"address"},{"name":"_tranche","type":"bytes32"},{"name":"_paused","type":"bool"},{"name":"_addresses","type":"address[]"},{"name":"_values","type":"uint256[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_investor","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"},{"indexed":false,"name":"_tokens","type":"uint256"}],"name":"Buy","type":"event"},{"anonymous":false,"inputs":[],"name":"ConfigureSTO","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_timestammp","type":"uint256"}],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_timestamp","type":"uint256"}],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_oldOwner","type":"address"},{"indexed":true,"name":"_newOwner","type":"address"}],"name":"ChangeOwner","type":"event"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_paused","type":"bool"},{"name":"_addresses","type":"address[]"},{"name":"_values","type":"uint256[]"}],"name":"configure","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_token","type":"address"}],"name":"getRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buy","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"buyWithToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxAmountReached","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTokensSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getSTODetails","outputs":[{"name":"_tranche","type":"bytes32"},{"name":"_startTime","type":"uint256"},{"name":"_endTime","type":"uint256"},{"name":"_maxAmount","type":"uint256"},{"name":"_rate","type":"uint256"},{"name":"_investorCount","type":"uint256"},{"name":"_totalTokensSold","type":"uint256"},{"name":"_fundRaiseToken","type":"address"},{"name":"_fundsReceiver","type":"address"},{"name":"_minInvestorAmount","type":"uint256"},{"name":"_maxInvestorAmount","type":"uint256"},{"name":"_maxInvestors","type":"uint256"},{"name":"_lockMonths","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

var STO = function (web3, param) {
    param['abi'] = abiSTO;
    param['gasLimit'] = 400000;
    var factory = new Web3Helper(web3, param);


factory.name = function () {
    return factory.callTx('name', factory.instance.name.getData());
};

factory.lockMonths = function () {
    return factory.callTx('lockMonths', factory.instance.lockMonths.getData());
};

factory.holdTokens = function () {
    return factory.callTx('holdTokens', factory.instance.holdTokens.getData());
};

factory.fundsReceiver = function () {
    return factory.callTx('fundsReceiver', factory.instance.fundsReceiver.getData());
};

factory.rate = function () {
    return factory.callTx('rate', factory.instance.rate.getData());
};

factory.fundRaiseToken = function () {
    return factory.callTx('fundRaiseToken', factory.instance.fundRaiseToken.getData());
};

factory.endTime = function () {
    return factory.callTx('endTime', factory.instance.endTime.getData());
};

factory.unpause = function () {
    let txData = {
        data: factory.instance.unpause.getData()
    };
    return factory.sendTx(txData);
};

factory.version = function () {
    return factory.callTx('version', factory.instance.version.getData());
};

factory.paused = function () {
    return factory.callTx('paused', factory.instance.paused.getData());
};

factory.maxAmount = function () {
    return factory.callTx('maxAmount', factory.instance.maxAmount.getData());
};

factory.totalTokensSold = function () {
    return factory.callTx('totalTokensSold', factory.instance.totalTokensSold.getData());
};

factory.tranche = function () {
    return factory.callTx('tranche', factory.instance.tranche.getData());
};

factory.minInvestorAmount = function () {
    return factory.callTx('minInvestorAmount', factory.instance.minInvestorAmount.getData());
};

factory.startTime = function () {
    return factory.callTx('startTime', factory.instance.startTime.getData());
};

factory.pause = function () {
    let txData = {
        data: factory.instance.pause.getData()
    };
    return factory.sendTx(txData);
};

factory.maxInvestorAmount = function () {
    return factory.callTx('maxInvestorAmount', factory.instance.maxInvestorAmount.getData());
};

factory.owner = function () {
    return factory.callTx('owner', factory.instance.owner.getData());
};

factory.fundsRaised = function () {
    return factory.callTx('fundsRaised', factory.instance.fundsRaised.getData());
};

factory.changeOwner = function (_newOwner) {
    let txData = {
        data: factory.instance.changeOwner.getData(_newOwner)
    };
    return factory.sendTx(txData);
};

factory.pausedTime = function () {
    return factory.callTx('pausedTime', factory.instance.pausedTime.getData());
};

factory.securityToken = function () {
    return factory.callTx('securityToken', factory.instance.securityToken.getData());
};

factory.maxInvestors = function () {
    return factory.callTx('maxInvestors', factory.instance.maxInvestors.getData());
};

factory.deployer = function () {
    return factory.callTx('deployer', factory.instance.deployer.getData());
};

factory.investorCount = function () {
    return factory.callTx('investorCount', factory.instance.investorCount.getData());
};

factory.configure = function (_tranche, _paused, _addresses, _values) {
    let txData = {
        data: factory.instance.configure.getData(_tranche, _paused, _addresses, _values)
    };
    let len = 1;
    if(_addresses.length > len) len = _addresses.length;
    if(_values.length > len) len = _values.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.getRaised = function (_token) {
    return factory.callTx('getRaised', factory.instance.getRaised.getData(_token));
};

factory.buy = function () {
    let txData = {
        data: factory.instance.buy.getData()
    };
    return factory.sendTx(txData);
};

factory.buyWithToken = function (_amount) {
    let txData = {
        data: factory.instance.buyWithToken.getData(_amount)
    };
    return factory.sendTx(txData);
};

factory.maxAmountReached = function () {
    return factory.callTx('maxAmountReached', factory.instance.maxAmountReached.getData());
};

factory.getTokensSold = function () {
    return factory.callTx('getTokensSold', factory.instance.getTokensSold.getData());
};

factory.getSTODetails = function () {
    return factory.callTx('getSTODetails', factory.instance.getSTODetails.getData());
};

    return factory;
};


(function(exports){
    exports.STO = STO;
}(typeof exports === 'undefined' ? this.share = {} : exports));
