var abiPolicyRegistry =[{"constant":true,"inputs":[],"name":"racRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractAddresses","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_racRegistry","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_contractAddress","type":"address"}],"name":"AddContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_contractAddress","type":"address"}],"name":"RemoveContract","type":"event"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_contractAddress","type":"address"}],"name":"getContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractAddress","type":"address"}],"name":"checkContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"checkContracts","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddress","type":"address"}],"name":"addContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"batchAddContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddress","type":"address"}],"name":"removeContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"batchRemoveContract","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

var PolicyRegistry = function (web3, param) {
    param['abi'] = abiPolicyRegistry;
    param['gasLimit'] = 120000;
    var factory = new Web3Helper(web3, param);


factory.racRegistry = function () {
    return factory.callTx('racRegistry', factory.instance.racRegistry.getData());
};

factory.contractAddresses = function () {
    return factory.callTx('contractAddresses', factory.instance.contractAddresses.getData());
};

factory.paused = function () {
    return factory.callTx('paused', factory.instance.paused.getData());
};

factory.pause = function () {
    let txData = {
        data: factory.instance.pause.getData()
    };
    return factory.sendTx(txData);
};

factory.unpause = function () {
    let txData = {
        data: factory.instance.unpause.getData()
    };
    return factory.sendTx(txData);
};

factory.getContract = function (_contractAddress) {
    return factory.callTx('getContract', factory.instance.getContract.getData(_contractAddress));
};

factory.checkContract = function (_contractAddress) {
    return factory.callTx('checkContract', factory.instance.checkContract.getData(_contractAddress));
};

factory.checkContracts = function (_contractAddresses) {
    return factory.callTx('checkContracts', factory.instance.checkContracts.getData(_contractAddresses));
};

factory.addContract = function (_contractAddress) {
    let txData = {
        data: factory.instance.addContract.getData(_contractAddress)
    };
    return factory.sendTx(txData);
};

factory.batchAddContract = function (_contractAddresses) {
    let txData = {
        data: factory.instance.batchAddContract.getData(_contractAddresses)
    };
    let len = 1;
    if(_contractAddresses.length > len) len = _contractAddresses.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.removeContract = function (_contractAddress) {
    let txData = {
        data: factory.instance.removeContract.getData(_contractAddress)
    };
    return factory.sendTx(txData);
};

factory.batchRemoveContract = function (_contractAddresses) {
    let txData = {
        data: factory.instance.batchRemoveContract.getData(_contractAddresses)
    };
    let len = 1;
    if(_contractAddresses.length > len) len = _contractAddresses.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

    return factory;
};


(function(exports){
    exports.PolicyRegistry = PolicyRegistry;
}(typeof exports === 'undefined' ? this.share = {} : exports));
