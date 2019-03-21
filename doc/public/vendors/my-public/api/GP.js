var abiGP =[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"}],"name":"whitelist","outputs":[{"name":"fromTime","type":"uint256"},{"name":"toTime","type":"uint256"},{"name":"expiryTime","type":"uint256"},{"name":"canTransfer","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"policyRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"securityToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"deployer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_securityToken","type":"address"},{"name":"_policyRegistry","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_tranche","type":"bytes32"},{"indexed":false,"name":"_investor","type":"address"},{"indexed":false,"name":"_fromTime","type":"uint256"},{"indexed":false,"name":"_toTime","type":"uint256"},{"indexed":false,"name":"_expiryTime","type":"uint256"},{"indexed":false,"name":"_canTransfer","type":"bool"},{"indexed":false,"name":"_addedBy","type":"address"}],"name":"ModifyWhitelist","type":"event"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"name":"checkTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_to","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"name":"checkMint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"name":"checkBurn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"","type":"bytes32"},{"name":"_to","type":"bytes32"},{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"name":"checkChangeTranche","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_investor","type":"address"},{"name":"_fromTime","type":"uint256"},{"name":"_toTime","type":"uint256"},{"name":"_expiryTime","type":"uint256"},{"name":"_canTransfer","type":"bool"},{"name":"_tranche","type":"bytes32"}],"name":"modifyWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_investors","type":"address[]"},{"name":"_fromTimes","type":"uint256[]"},{"name":"_toTimes","type":"uint256[]"},{"name":"_expiryTimes","type":"uint256[]"},{"name":"_canTransfer","type":"bool[]"},{"name":"_tranche","type":"bytes32"}],"name":"batchModifyWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_investor","type":"address"},{"name":"_tranche","type":"bytes32"}],"name":"getPolicyDetails","outputs":[{"name":"_fromTime","type":"uint256"},{"name":"_toTime","type":"uint256"},{"name":"_expiryTime","type":"uint256"},{"name":"_canTransfer","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}];

var GP = function (web3, param) {
    param['abi'] = abiGP;
    param['gasLimit'] = 140000;
    var factory = new Web3Helper(web3, param);


factory.name = function () {
    return factory.callTx('name', factory.instance.name.getData());
};

factory.whitelist = function (, ) {
    return factory.callTx('whitelist', factory.instance.whitelist.getData(, ));
};

factory.policyRegistry = function () {
    return factory.callTx('policyRegistry', factory.instance.policyRegistry.getData());
};

factory.version = function () {
    return factory.callTx('version', factory.instance.version.getData());
};

factory.securityToken = function () {
    return factory.callTx('securityToken', factory.instance.securityToken.getData());
};

factory.deployer = function () {
    return factory.callTx('deployer', factory.instance.deployer.getData());
};

factory.checkTransfer = function (_tranche, _from, _to, , ) {
    return factory.callTx('checkTransfer', factory.instance.checkTransfer.getData(_tranche, _from, _to, , ));
};

factory.checkMint = function (_tranche, _to, , ) {
    return factory.callTx('checkMint', factory.instance.checkMint.getData(_tranche, _to, , ));
};

factory.checkBurn = function (, , , ) {
    return factory.callTx('checkBurn', factory.instance.checkBurn.getData(, , , ));
};

factory.checkChangeTranche = function (_owner, , _to, , ) {
    return factory.callTx('checkChangeTranche', factory.instance.checkChangeTranche.getData(_owner, , _to, , ));
};

factory.modifyWhitelist = function (_investor, _fromTime, _toTime, _expiryTime, _canTransfer, _tranche) {
    let txData = {
        data: factory.instance.modifyWhitelist.getData(_investor, _fromTime, _toTime, _expiryTime, _canTransfer, _tranche)
    };
    return factory.sendTx(txData);
};

factory.batchModifyWhitelist = function (_investors, _fromTimes, _toTimes, _expiryTimes, _canTransfer, _tranche) {
    let txData = {
        data: factory.instance.batchModifyWhitelist.getData(_investors, _fromTimes, _toTimes, _expiryTimes, _canTransfer, _tranche)
    };
    let len = 1;
    if(_investors.length > len) len = _investors.length;
    if(_fromTimes.length > len) len = _fromTimes.length;
    if(_toTimes.length > len) len = _toTimes.length;
    if(_expiryTimes.length > len) len = _expiryTimes.length;
    if(_canTransfer.length > len) len = _canTransfer.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.getPolicyDetails = function (_investor, _tranche) {
    return factory.callTx('getPolicyDetails', factory.instance.getPolicyDetails.getData(_investor, _tranche));
};

    return factory;
};


(function(exports){
    exports.GP = GP;
}(typeof exports === 'undefined' ? this.share = {} : exports));
