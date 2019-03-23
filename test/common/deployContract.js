const GeneralPolicy = artifacts.require('./policies/GeneralPolicy.sol')
const PolicyRegistry = artifacts.require('./PolicyRegistry.sol')
const RAC = artifacts.require('./RAC.sol')
const SecurityToken = artifacts.require('./SecurityToken.sol')
const GeneralSTO = artifacts.require('./stos/GeneralSTO.sol')
const GeneralSTOFactory = artifacts.require('./stos/GeneralSTOFactory.sol')
const STGFactory = artifacts.require('./STGFactory.sol')

const ERC20Token = artifacts.require('./dummies/ERC20Token.sol')
const DExchange = artifacts.require('./dex/ExchangeCore.sol')

const roles = require('../../play/public/vendors/my-public/js/role')

// Contract Instance Declaration
let iPolicyRegistry;
let iRAC;
let iSecurityToken;
let iGeneralPolicy;
let iSTGFactory;
let iSTOFactory;
let iERC20Token;
let iDExchange;

/// Function use to launch the security token ecossystem.

module.exports.deploy = async function deploy(owner) {
    await _deployRAC(owner);
    await _deployPolicyRegistry(owner);
    await _deploySecurityToken(owner);
    await _deployGeneralPolicy(owner);
    await _deployDExchange(owner);

    await _deployERC20Token(owner);

    await iRAC.batchAddRole(owner, roles.RAC_ROLES, {from: owner});

    // Printing all the contract addresses
    console.log(`
        --------------------- Contracts: ---------------------
        RAC:                   ${iRAC.address}
        PolicyRegistry:        ${iPolicyRegistry.address}
        SecurityToken:         ${iSecurityToken.address}
        GeneralPolicy:         ${iGeneralPolicy.address}
        ERC20Token:            ${iERC20Token.address}
        DExchange:             ${iDExchange.address}
        -----------------------------------------------------------------------------
        `);

    return {
        iRAC: iRAC,
        iPolicyRegistry: iPolicyRegistry,
        iSecurityToken: iSecurityToken,
        iGeneralPolicy: iGeneralPolicy,
        iERC20Token: iERC20Token,
        iDExchange: iDExchange
    }
}

module.exports.deployFactory = async function deploy(owner) {
    await _deployRAC(owner);
    await _deployPolicyRegistry(owner);
    await _deploySTOFactory(owner);
    await _deploySTGFactory(owner);

    // Printing all the contract addresses
    console.log(`
        --------------------- Contracts: ---------------------
        RAC:                   ${iRAC.address}
        PolicyRegistry:        ${iPolicyRegistry.address}
        STOFactory:            ${iSTOFactory.address}
        STGFactory:            ${iSTGFactory.address}
        -----------------------------------------------------------------------------
        `);

    return {
        iRAC: iRAC,
        iPolicyRegistry: iPolicyRegistry,
        iSTGFactory: iSTGFactory,
        iSTOFactory: iSTOFactory
    }
}

module.exports.deploySecurityToken = async function deploySecurityToken(owner, param) {
    return await SecurityToken.new(param.issuer, param.name, param.symbol, param.decimals, param.granularity, {from: owner});
}

module.exports.deployGeneralPolicy = async function deployGeneralPolicy(owner, param) {
    return await GeneralPolicy.new(param.securityToken, {from: owner});
}

module.exports.deployGeneralSTO = async function deployGeneralSTO(owner, securityToken) {
    var _tranche = '';
    var _paused = false;
    var now = Math.floor(new Date().getTime() / 1000);
    var _startTime = now;
    var _endTime = now + 3600 * 24 * 30;
    var _maxAmount = web3.toWei(1000000, 'ether');
    var _rate = 10;
    var _minInvestorAmount = web3.toWei(1, 'ether');
    var _maxInvestorAmount = web3.toWei(1000000, 'ether');
    var _maxInvestors = 200;
    var _lockMonths = 12;
    var _fundRaiseToken = '0x0000000000000000000000000000000000000000';
    var _fundsReceiver = owner;

    var addresses = [_fundRaiseToken, _fundsReceiver];
    var values = [_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]

    return await GeneralSTO.new(securityToken, _tranche, _paused, addresses, values, {from: owner});
}

async function _deployRAC(owner) {
    // Step 1
    iRAC = await RAC.new({from: owner});
}

async function _deployPolicyRegistry(owner) {
    // Step 1
    iPolicyRegistry = await PolicyRegistry.new(iRAC.address, {from: owner});
}

async function _deploySecurityToken(owner) {
    // Step 2
    iSecurityToken = await SecurityToken.new(owner, 'Test Security Token', 'TST', 18, 1, {
        from: owner
    });
}

async function _deployGeneralPolicy(owner) {
    // Step 3
    iGeneralPolicy = await GeneralPolicy.new(iSecurityToken.address, iPolicyRegistry.address, {from: owner});
}

async function _deploySTOFactory(owner) {
    iSTOFactory = await GeneralSTOFactory.new({from: owner});
}

async function _deploySTGFactory(owner) {
    iSTGFactory = await STGFactory.new(iPolicyRegistry.address, iRAC.address, iSTOFactory.address, {from: owner});
}

async function _deploySTGFactory(owner) {
    iSTGFactory = await STGFactory.new(iPolicyRegistry.address, iRAC.address, iSTOFactory.address, {from: owner});
}

async function _deployERC20Token(owner) {
    iERC20Token = await ERC20Token.new({from: owner});
}

async function _deployDExchange(owner) {
    iDExchange = await DExchange.new({from: owner});
}

async function _registry(owner) {
    await iSecurityToken.registryPolicy('', iGeneralPolicy.address, {from: owner});
}
