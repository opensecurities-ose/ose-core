var abiSTOFactory =[{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_sto","type":"address"},{"indexed":true,"name":"_securityToken","type":"address"}],"name":"CreateSTO","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_oldOwner","type":"address"},{"indexed":true,"name":"_newOwner","type":"address"}],"name":"ChangeOwner","type":"event"},{"constant":false,"inputs":[{"name":"_securityToken","type":"address"},{"name":"_tranche","type":"bytes32"},{"name":"_paused","type":"bool"},{"name":"_addresses","type":"address[]"},{"name":"_values","type":"uint256[]"}],"name":"create","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var STOFactory = function (web3, param) {
    param['abi'] = abiSTOFactory;
    param['gasLimit'] = 2455988;
    var factory = new Web3Helper(web3, param);


factory.owner = function () {
    return factory.callTx('owner', factory.instance.owner.getData());
};

factory.changeOwner = function (_newOwner) {
    let txData = {
        data: factory.instance.changeOwner.getData(_newOwner)
    };
    return factory.sendTx(txData);
};

factory.create = function (_securityToken, _tranche, _paused, _addresses, _values) {
    let txData = {
        data: factory.instance.create.getData(_securityToken, _tranche, _paused, _addresses, _values)
    };
    let len = 1;
    if(_addresses.length > len) len = _addresses.length;
    if(_values.length > len) len = _values.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

    return factory;
};


(function(exports){
    exports.STOFactory = STOFactory;
}(typeof exports === 'undefined' ? this.share = {} : exports));
