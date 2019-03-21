var abiRAC =[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"AddRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"RemoveRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"AddPrivateRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"RemovePrivateRole","type":"event"},{"constant":true,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"checkRole","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"addRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_actions","type":"bytes32[]"}],"name":"batchAddRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"removeRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_actions","type":"bytes32[]"}],"name":"batchRemoveRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_action","type":"bytes32"}],"name":"checkPrivateRole","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_action","type":"bytes32"}],"name":"addPrivateRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_actions","type":"bytes32"}],"name":"batchAddPrivateRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_action","type":"bytes32"}],"name":"removePrivateRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_actions","type":"bytes32"}],"name":"batchRemovePrivateRole","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var RAC = function (web3, param) {
    param['abi'] = abiRAC;
    param['gasLimit'] = 120000;
    var factory = new Web3Helper(web3, param);


factory.checkRole = function (_operator, _action) {
    return factory.callTx('checkRole', factory.instance.checkRole.getData(_operator, _action));
};

factory.addRole = function (_operator, _action) {
    let txData = {
        data: factory.instance.addRole.getData(_operator, _action)
    };
    return factory.sendTx(txData);
};

factory.batchAddRole = function (_operator, _actions) {
    let txData = {
        data: factory.instance.batchAddRole.getData(_operator, _actions)
    };
    let len = 1;
    if(_actions.length > len) len = _actions.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.removeRole = function (_operator, _action) {
    let txData = {
        data: factory.instance.removeRole.getData(_operator, _action)
    };
    return factory.sendTx(txData);
};

factory.batchRemoveRole = function (_operator, _actions) {
    let txData = {
        data: factory.instance.batchRemoveRole.getData(_operator, _actions)
    };
    let len = 1;
    if(_actions.length > len) len = _actions.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.checkPrivateRole = function (_action) {
    return factory.callTx('checkPrivateRole', factory.instance.checkPrivateRole.getData(_action));
};

factory.addPrivateRole = function (_action) {
    let txData = {
        data: factory.instance.addPrivateRole.getData(_action)
    };
    return factory.sendTx(txData);
};

factory.batchAddPrivateRole = function (_actions) {
    let txData = {
        data: factory.instance.batchAddPrivateRole.getData(_actions)
    };
    return factory.sendTx(txData);
};

factory.removePrivateRole = function (_action) {
    let txData = {
        data: factory.instance.removePrivateRole.getData(_action)
    };
    return factory.sendTx(txData);
};

factory.batchRemovePrivateRole = function (_actions) {
    let txData = {
        data: factory.instance.batchRemovePrivateRole.getData(_actions)
    };
    return factory.sendTx(txData);
};

    return factory;
};


(function(exports){
    exports.RAC = RAC;
}(typeof exports === 'undefined' ? this.share = {} : exports));
