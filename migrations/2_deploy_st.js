const GenerateCode = require('../utils/GenerateCode')
const Web3Utils = require('../utils/Web3Utils')

const GeneralPolicy = artifacts.require('./policies/GeneralPolicy.sol')
const PolicyRegistry = artifacts.require('./PolicyRegistry.sol')
const RAC = artifacts.require('./RAC.sol')
const SecurityToken = artifacts.require('./SecurityToken.sol')
const GeneralSTO = artifacts.require('./stos/GeneralSTO.sol')
const GeneralSTOFactory = artifacts.require('./stos/GeneralSTOFactory.sol')
const STGFactory = artifacts.require('./STGFactory.sol')
const DExchange = artifacts.require('./dex/ExchangeCore.sol')

var owner;
var iPolicyRegistry;
var iRAC;
var iGeneralPolicy;
var iSecurityToken;
var iGeneralSTO;
var iSTGFactory;
var iGeneralSTOFactory;
var iDExchange;
var address_zero = "0x0000000000000000000000000000000000000000";
var network;

module.exports = async function (_deployer, _network, _accounts) {
    console.log('network:', _network);
    network = _network;
    owner = _accounts[0];
    if (network == 'main') {
        deployProd(_deployer);
    } else {
        deployDev(_deployer);
    }

}

function deployProd(deployer) {
    return _deployRAC(deployer).then(() => {
        return _deployPolicyRegistry(deployer);
    }).then(() => {
        return _deploySTOFactory(deployer);
    }).then(() => {
        return _deploySTGFactory(deployer);
    }).then(() => {

        console.log('\n');
        console.log(`
    ----------------------- Contracts' address: ------------------------------------
    RAC:                                     ${iRAC.address}
    PolicyRegistry:                          ${iPolicyRegistry.address}
    STGFactory:                              ${iSTGFactory.address}
    GeneralSTOFactory:                       ${iGeneralSTOFactory.address}
    ---------------------------------------------------------------------------------
    `);
        console.log('\n');

    });
}

function deployDev(deployer) {
    return _deployRAC(deployer).then(() => {
        return _deployPolicyRegistry(deployer);
    }).then(() => {
        return _deploySTOFactory(deployer);
    }).then(() => {
        return _deploySTGFactory(deployer);
    }).then(() => {
        return _deploySecurityToken(deployer);
    }).then(() => {
        return _deployGeneralPolicy(deployer);
    }).then(() => {
        return _deployGeneralSTO(deployer);
    }).then(() => {
        return _deployDExchange(deployer);
    }).then(() => {

        console.log('\n');
        console.log(`
    ----------------------- Contracts' address: ------------------------------------
    RAC:                                     ${iRAC.address}
    PolicyRegistry:                          ${iPolicyRegistry.address}
    STGFactory:                              ${iSTGFactory.address}
    STOFactory:                              ${iGeneralSTOFactory.address}
    SecurityToken:                           ${iSecurityToken.address}
    GeneralPolicy:                           ${iGeneralPolicy.address}
    GeneralSTO:                              ${iGeneralSTO.address}
    DExchange:                               ${iDExchange.address}
    ---------------------------------------------------------------------------------
    `);
        console.log('\n');


        let contracts = {
            RAC: iRAC.address,
            PolicyRegistry: iPolicyRegistry.address,
            STGFactory: iSTGFactory.address,
            STOFactory: iGeneralSTOFactory.address,
            ST: iSecurityToken.address,
            GP: iGeneralPolicy.address,
            STO: iGeneralSTO.address
        };

        GenerateCode.genAddress(contracts, network);
        GenerateCode.genAbi();
        GenerateCode.genApis();
    });
}

function _deployRAC(deployer) {
    return deployer.deploy(RAC, {from: owner}).then(() => {
        return RAC.deployed();
    }).then((res) => {
        iRAC = res;
        return deployer;
    });
}

function _deployPolicyRegistry(deployer) {
    return deployer.deploy(PolicyRegistry, iRAC.address, {from: owner}).then(() => {
        return PolicyRegistry.deployed();
    }).then((res) => {
        iPolicyRegistry = res;
        return deployer;
    });
}

function _deploySTOFactory(deployer) {
    return deployer.deploy(GeneralSTOFactory, {from: owner}).then(() => {
        return GeneralSTOFactory.deployed();
    }).then((res) => {
        iGeneralSTOFactory = res;
        return deployer;
    });
}

function _deploySTGFactory(deployer) {
    return deployer.deploy(STGFactory, iPolicyRegistry.address, iRAC.address, iGeneralSTOFactory.address, {from: owner}).then(() => {
        return STGFactory.deployed();
    }).then((res) => {
        iSTGFactory = res;
        return deployer;
    });
}

function _deploySecurityToken(deployer) {
    return deployer.deploy(SecurityToken, owner, 'Test Security Token', 'TST', 18, 1, {from: owner}).then(() => {
        return SecurityToken.deployed();
    }).then((res) => {
        iSecurityToken = res;
        return deployer;
    });
}

function _deployGeneralPolicy(deployer) {
    return deployer.deploy(GeneralPolicy, iSecurityToken.address, iPolicyRegistry.address, {from: owner}).then((res) => {
        return GeneralPolicy.deployed();
    }).then((res) => {
        iGeneralPolicy = res;
        return deployer;
    });
}

function _deployGeneralSTO(deployer) {
    let addresses = [address_zero, owner];
    let _startTime = Math.floor(new Date().getTime() / 1000);
    let _endTime = _startTime + 3600 * 24 * 30000;
    let _maxAmount = Web3Utils.setAmount(100000000, 18).toNumber();
    let _rate = 10;
    let _minInvestorAmount = Web3Utils.setAmount(1, 18).toNumber();
    let _maxInvestorAmount = Web3Utils.setAmount(10000, 18).toNumber();
    let _maxInvestors = 200;
    let _lockMonths = 12;
    let values = [_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths];

    return deployer.deploy(GeneralSTO, iSecurityToken.address, '', false, addresses, values, {from: owner}).then((res) => {
        return GeneralSTO.deployed();
    }).then((res) => {
        iGeneralSTO = res;
        return deployer;
    });
}

function _deployDExchange(deployer) {
    return deployer.deploy(DExchange).then((res) => {
        return DExchange.deployed()
    }).then((res => {
        iDExchange = res;
        return deployer;
    }));
}
