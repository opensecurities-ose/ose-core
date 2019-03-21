var abiSTGFactory =[{"constant":true,"inputs":[],"name":"racRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"policyRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stoFactory","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_policyRegistry","type":"address"},{"name":"_racRegistry","type":"address"},{"name":"_stoFactory","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_securityToken","type":"address"},{"indexed":false,"name":"_symbol","type":"string"},{"indexed":true,"name":"_policy","type":"address"}],"name":"CreateSTG","type":"event"},{"constant":false,"inputs":[{"name":"_issuer","type":"address"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_granularity","type":"uint256"}],"name":"create","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var STGFactory = function (web3, param) {
    param['abi'] = abiSTGFactory;
    param['gasLimit'] = 50000000;
    var factory = new Web3Helper(web3, param);


factory.racRegistry = function () {
    return factory.callTx('racRegistry', factory.instance.racRegistry.getData());
};

factory.policyRegistry = function () {
    return factory.callTx('policyRegistry', factory.instance.policyRegistry.getData());
};

factory.stoFactory = function () {
    return factory.callTx('stoFactory', factory.instance.stoFactory.getData());
};

factory.create = function (_issuer, _name, _symbol, _decimals, _granularity) {
    let txData = {
        data: factory.instance.create.getData(_issuer, _name, _symbol, _decimals, _granularity)
    };
    return factory.sendTx(txData);
};

    return factory;
};


(function(exports){
    exports.STGFactory = STGFactory;
}(typeof exports === 'undefined' ? this.share = {} : exports));
