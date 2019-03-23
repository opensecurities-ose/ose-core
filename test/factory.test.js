const DeployContract = require("./common/deployContract");
const SecurityToken = artifacts.require('./SecurityToken.sol')
const GeneralPolicy = artifacts.require('./GeneralPolicy.sol')
const GeneralSTO = artifacts.require('./stos/GeneralSTO.sol')
const Utils = require("./common/utils");
const Web3 = require("web3");
const Web3Utils = require('../utils/Web3Utils');
const Log = require('../utils/LogConsole');
var { catchRevert } = require("./common/exceptions");
const BigNumber = require("bignumber.js");
const roles = require('../play/public/vendors/my-public/js/role');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Hardcoded development port

contract("Factory", accounts => {
    // temporary Variable declaration
    let tx;
    let res;

    // Accounts Variable declaration
    let owner;
    let investor1;
    let investor2;
    let issuer;
    let operator;
    let fundsReceiver;
    let address_zero = "0x0000000000000000000000000000000000000000";

    let rate = 10;


    // Contract Instance Declaration
    let iPolicyRegistry;
    let iSecurityToken;
    let iGeneralPolicy;
    let iGeneralSTO;
    let iSTGFactory;
    let iSTOFactory;
    let iRAC;

    before(async () => {
        // Accounts setup
        owner = accounts[0];
        investor1 = accounts[1];
        investor2 = accounts[2];
        issuer = accounts[3];
        operator = accounts[9];
        fundsReceiver = accounts[8];

        // Step:1 Create the ecosystem contract instances
        let instances = await DeployContract.deployFactory(owner);
        iPolicyRegistry = instances.iPolicyRegistry;
        iSTGFactory = instances.iSTGFactory;
        iSTOFactory = instances.iSTOFactory;
        iRAC = instances.iRAC;

        res = await iSTGFactory.racRegistry();
        assert.equal(res, iRAC.address, "Failed to iSTGFactory.racRegistry");
        // console.log('roles.RAC_ROLES:', roles.RAC_ROLES);
        tx = await iRAC.batchAddRole(owner, roles.RAC_ROLES, {from: owner});
        assert.equal(tx.receipt.status, 1, "Failed to batchAddRole");
        res = await iRAC.checkRole(owner, 'createST', {from: owner});
        assert.equal(res, true, "Failed to checkRole");

        tx = await iRAC.addRole(iSTGFactory.address, 'manageContract', {from: owner});
        assert.equal(tx.receipt.status, 1, "Failed to addRole");
    });

    describe("Factory related test cases", async () => {

        it("Should create ST ok", async () => {
            tx = await iSTGFactory.create(issuer, 'Create Security Token', 'DST', 18, 1, {from: owner,gas: 6000000});
            console.debug('tx:', tx);
            Log.debug('tx logs args:', tx.logs[0].args);
            assert.equal(tx.receipt.status, 1, "Failed to iSTGFactory.create");

            iSecurityToken = SecurityToken.at(tx.logs[0].args._securityToken);
            res = await iSecurityToken.symbol();
            Log.debug('res:', res);
            assert.equal(res, 'DST', "Failed to iSecurityToken.symbol");

            res = await iSecurityToken.owner();
            Log.debug('res:', res);
            assert.equal(res, issuer, "Failed to iSecurityToken.owner");

            iGeneralPolicy = GeneralPolicy.at(tx.logs[0].args._policy);
            res = await iGeneralPolicy.securityToken();
            Log.debug('res:', res);
            assert.equal(res, tx.logs[0].args._securityToken, "Failed to iGeneralPolicy.securityToken");
        });

        it("Should create STO ok", async () => {

            let _startTime = Web3Utils.latestTime(web3);
            let _endTime = _startTime + Utils.duration.days(30);
            let _maxAmount = Web3Utils.setAmount(10000000, 18).toNumber();
            let _rate = rate;
            let _minInvestorAmount = Web3Utils.setAmount(1, 18).toNumber();
            let _maxInvestorAmount = Web3Utils.setAmount(10000, 18).toNumber();
            let _maxInvestors = 200;
            let _lockMonths = 12;

            Log.trace('params:', iSecurityToken.address,'', false, [address_zero,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]);
            tx = await iSTOFactory.create(iSecurityToken.address,'', false, [address_zero,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths], {from: issuer});
            // console.debug('tx:', tx);
            Log.debug('tx logs args:', tx.logs[0].args);
            assert.equal(tx.receipt.status, 1, "Failed to iSTOFactory.create");
            //
            iGeneralSTO = GeneralSTO.at(tx.logs[0].args._sto);
            res = await iGeneralSTO.name();
            Log.debug('res:', res);
            assert.equal(res, 'GeneralSTO', "Failed to iGeneralSTO.name");
        });


        it("Should successfully to call buy", async () => {
            let now = Web3Utils.latestTime(web3);
            let fromTime = now + Utils.duration.days(-1);
            let toTime = fromTime;
            let expiryTime = now + Utils.duration.days(100);

            let tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {
                from: issuer,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iGeneralPolicy.modifyWhitelist(fundsReceiver, fromTime, toTime, expiryTime, true, '', {
                from: issuer,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, fundsReceiver, "Failed in adding the fundsReceiver in whitelist");


            let amount = 10;
            let beforeBalance = await iSecurityToken.balanceOf(investor1);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);

            let beforeFundsReceiverBalance = await web3.eth.getBalance(fundsReceiver);
            beforeFundsReceiverBalance = Web3Utils.getAmount(beforeFundsReceiverBalance,18).toNumber();
            Log.debug('beforeFundsReceiverBalance:', beforeFundsReceiverBalance);

            tx = await iGeneralSTO.buy({
                value: Web3Utils.setAmount(amount,18).toNumber(),
                from: investor1
            });
            Log.debug('tx', tx.logs[0]);
            assert.equal(tx.receipt.status, 1, "Failed to buy");

            let afterBalance = await iSecurityToken.balanceOf(investor1);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);

            let afterFundsReceiverBalance = await await web3.eth.getBalance(fundsReceiver);
            afterFundsReceiverBalance = Web3Utils.getAmount(afterFundsReceiverBalance,18).toNumber();
            Log.debug('afterFundsReceiverBalance:', afterFundsReceiverBalance);

            assert.equal(afterBalance-beforeBalance, amount*rate, 'Token should be '+amount*rate)
            assert.equal(afterFundsReceiverBalance-beforeFundsReceiverBalance, amount, 'ETH should be '+amount)

        })

    });

});
