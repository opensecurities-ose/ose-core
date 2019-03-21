var abiSecurityToken =[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"checkRole","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"granularity","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"removeRole","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_action","type":"bytes32"}],"name":"addRole","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deployer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_granularity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_operator","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"ApprovalTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"Burnt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_operator","type":"address"},{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"TransferTranche","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_old","type":"uint256"},{"indexed":false,"name":"_new","type":"uint256"}],"name":"ChangeGranularity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"},{"indexed":false,"name":"_old","type":"bytes32"},{"indexed":false,"name":"_new","type":"bytes32"}],"name":"ChangeInvestorDefaultTranche","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_tranche","type":"bytes32"},{"indexed":false,"name":"_policy","type":"address"}],"name":"RegistryPolicy","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_operator","type":"address"},{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_verifyTransfer","type":"bool"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"ForceTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_tranche","type":"bytes32"},{"indexed":true,"name":"_operator","type":"address"},{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_verifyTransfer","type":"bool"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"ForceBurn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"},{"indexed":false,"name":"_from","type":"bytes32"},{"indexed":false,"name":"_to","type":"bytes32"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_data","type":"bytes"}],"name":"ChangeTranche","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"AddRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_operator","type":"address"},{"indexed":false,"name":"_action","type":"bytes32"}],"name":"RemoveRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_oldOwner","type":"address"},{"indexed":true,"name":"_newOwner","type":"address"}],"name":"ChangeOwner","type":"event"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"}],"name":"getPolicy","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"getInvestorDefaultTranche","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"}],"name":"getTrancheTotalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOfAll","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_owner","type":"address"}],"name":"balanceOfTranche","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_start","type":"uint256"},{"name":"_end","type":"uint256"}],"name":"iterateInvestors","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"}],"name":"getInvestorCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tranchesOf","outputs":[{"name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_policy","type":"address"}],"name":"registryPolicy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_granularity","type":"uint256"}],"name":"changeGranularity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_tranche","type":"bytes32"}],"name":"changeInvestorDefaultTranche","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_to","type":"address[]"},{"name":"_values","type":"uint256[]"},{"name":"_data","type":"bytes"}],"name":"batchTransferTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferFromTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_investor","type":"address"},{"name":"_value","type":"uint256"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_investors","type":"address[]"},{"name":"_values","type":"uint256[]"}],"name":"batchMint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_investor","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"mintTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_investors","type":"address[]"},{"name":"_values","type":"uint256[]"},{"name":"_data","type":"bytes"}],"name":"batchMintTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"forceTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_from","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"forceBurn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"bytes32"},{"name":"_to","type":"bytes32"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"changeTranche","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_value","type":"uint256"}],"name":"approveTransfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_operator","type":"address"},{"name":"_value","type":"uint256"}],"name":"approveTransferTranche","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_operator","type":"address"}],"name":"allowanceTransfer","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tranche","type":"bytes32"},{"name":"_owner","type":"address"},{"name":"_operator","type":"address"}],"name":"allowanceTransferTranche","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

var SecurityToken = function (web3, param) {
    param['abi'] = abiSecurityToken;
    param['gasLimit'] = 240000;
    var factory = new Web3Helper(web3, param);


factory.name = function () {
    return factory.callTx('name', factory.instance.name.getData());
};

factory.totalSupply = function () {
    return factory.callTx('totalSupply', factory.instance.totalSupply.getData());
};

factory.checkRole = function (_operator, _action) {
    return factory.callTx('checkRole', factory.instance.checkRole.getData(_operator, _action));
};

factory.decimals = function () {
    return factory.callTx('decimals', factory.instance.decimals.getData());
};

factory.version = function () {
    return factory.callTx('version', factory.instance.version.getData());
};

factory.granularity = function () {
    return factory.callTx('granularity', factory.instance.granularity.getData());
};

factory.removeRole = function (_operator, _action) {
    let txData = {
        data: factory.instance.removeRole.getData(_operator, _action)
    };
    return factory.sendTx(txData);
};

factory.owner = function () {
    return factory.callTx('owner', factory.instance.owner.getData());
};

factory.symbol = function () {
    return factory.callTx('symbol', factory.instance.symbol.getData());
};

factory.changeOwner = function (_newOwner) {
    let txData = {
        data: factory.instance.changeOwner.getData(_newOwner)
    };
    return factory.sendTx(txData);
};

factory.addRole = function (_operator, _action) {
    let txData = {
        data: factory.instance.addRole.getData(_operator, _action)
    };
    return factory.sendTx(txData);
};

factory.deployer = function () {
    return factory.callTx('deployer', factory.instance.deployer.getData());
};

factory.getPolicy = function (_tranche) {
    return factory.callTx('getPolicy', factory.instance.getPolicy.getData(_tranche));
};

factory.getInvestorDefaultTranche = function (_owner) {
    return factory.callTx('getInvestorDefaultTranche', factory.instance.getInvestorDefaultTranche.getData(_owner));
};

factory.getTrancheTotalSupply = function (_tranche) {
    return factory.callTx('getTrancheTotalSupply', factory.instance.getTrancheTotalSupply.getData(_tranche));
};

factory.balanceOf = function (_owner) {
    return factory.callTx('balanceOf', factory.instance.balanceOf.getData(_owner));
};

factory.balanceOfAll = function (_owner) {
    return factory.callTx('balanceOfAll', factory.instance.balanceOfAll.getData(_owner));
};

factory.balanceOfTranche = function (_tranche, _owner) {
    return factory.callTx('balanceOfTranche', factory.instance.balanceOfTranche.getData(_tranche, _owner));
};

factory.iterateInvestors = function (_tranche, _start, _end) {
    return factory.callTx('iterateInvestors', factory.instance.iterateInvestors.getData(_tranche, _start, _end));
};

factory.getInvestorCount = function (_tranche) {
    return factory.callTx('getInvestorCount', factory.instance.getInvestorCount.getData(_tranche));
};

factory.tranchesOf = function (_owner) {
    return factory.callTx('tranchesOf', factory.instance.tranchesOf.getData(_owner));
};

factory.registryPolicy = function (_tranche, _policy) {
    let txData = {
        data: factory.instance.registryPolicy.getData(_tranche, _policy)
    };
    return factory.sendTx(txData);
};

factory.changeGranularity = function (_granularity) {
    let txData = {
        data: factory.instance.changeGranularity.getData(_granularity)
    };
    return factory.sendTx(txData);
};

factory.changeInvestorDefaultTranche = function (_owner, _tranche) {
    let txData = {
        data: factory.instance.changeInvestorDefaultTranche.getData(_owner, _tranche)
    };
    return factory.sendTx(txData);
};

factory.transfer = function (_to, _value) {
    let txData = {
        data: factory.instance.transfer.getData(_to, _value)
    };
    return factory.sendTx(txData);
};

factory.transferTranche = function (_tranche, _to, _value, _data) {
    let txData = {
        data: factory.instance.transferTranche.getData(_tranche, _to, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.batchTransferTranche = function (_tranche, _to, _values, _data) {
    let txData = {
        data: factory.instance.batchTransferTranche.getData(_tranche, _to, _values, _data)
    };
    let len = 1;
    if(_to.length > len) len = _to.length;
    if(_values.length > len) len = _values.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.transferFrom = function (_from, _to, _value) {
    let txData = {
        data: factory.instance.transferFrom.getData(_from, _to, _value)
    };
    return factory.sendTx(txData);
};

factory.transferFromTranche = function (_tranche, _from, _to, _value, _data) {
    let txData = {
        data: factory.instance.transferFromTranche.getData(_tranche, _from, _to, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.mint = function (_investor, _value) {
    let txData = {
        data: factory.instance.mint.getData(_investor, _value)
    };
    return factory.sendTx(txData);
};

factory.batchMint = function (_investors, _values) {
    let txData = {
        data: factory.instance.batchMint.getData(_investors, _values)
    };
    let len = 1;
    if(_investors.length > len) len = _investors.length;
    if(_values.length > len) len = _values.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.mintTranche = function (_tranche, _investor, _value, _data) {
    let txData = {
        data: factory.instance.mintTranche.getData(_tranche, _investor, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.batchMintTranche = function (_tranche, _investors, _values, _data) {
    let txData = {
        data: factory.instance.batchMintTranche.getData(_tranche, _investors, _values, _data)
    };
    let len = 1;
    if(_investors.length > len) len = _investors.length;
    if(_values.length > len) len = _values.length;
    factory.gasLimit = factory.gasLimit * len;
    return factory.sendTx(txData);
};

factory.forceTransfer = function (_tranche, _from, _to, _value, _data) {
    let txData = {
        data: factory.instance.forceTransfer.getData(_tranche, _from, _to, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.forceBurn = function (_tranche, _from, _value, _data) {
    let txData = {
        data: factory.instance.forceBurn.getData(_tranche, _from, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.changeTranche = function (_from, _to, _value, _data) {
    let txData = {
        data: factory.instance.changeTranche.getData(_from, _to, _value, _data)
    };
    return factory.sendTx(txData);
};

factory.approve = function (_spender, _value) {
    let txData = {
        data: factory.instance.approve.getData(_spender, _value)
    };
    return factory.sendTx(txData);
};

factory.allowance = function (_owner, _spender) {
    return factory.callTx('allowance', factory.instance.allowance.getData(_owner, _spender));
};

factory.approveTransfer = function (_operator, _value) {
    let txData = {
        data: factory.instance.approveTransfer.getData(_operator, _value)
    };
    return factory.sendTx(txData);
};

factory.approveTransferTranche = function (_tranche, _operator, _value) {
    let txData = {
        data: factory.instance.approveTransferTranche.getData(_tranche, _operator, _value)
    };
    return factory.sendTx(txData);
};

factory.allowanceTransfer = function (_owner, _operator) {
    return factory.callTx('allowanceTransfer', factory.instance.allowanceTransfer.getData(_owner, _operator));
};

factory.allowanceTransferTranche = function (_tranche, _owner, _operator) {
    return factory.callTx('allowanceTransferTranche', factory.instance.allowanceTransferTranche.getData(_tranche, _owner, _operator));
};

    return factory;
};


(function(exports){
    exports.SecurityToken = SecurityToken;
}(typeof exports === 'undefined' ? this.share = {} : exports));
