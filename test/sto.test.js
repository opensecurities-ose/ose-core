const DeployContract = require("./common/deployContract");
const Utils = require("./common/utils");
const Web3 = require("web3");
const Web3Utils = require('../utils/Web3Utils');
const Log = require('../utils/LogConsole');
const RAC = artifacts.require('./RAC.sol')
var { catchRevert } = require("./common/exceptions");
const BigNumber = require("bignumber.js");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Hardcoded development port

contract("SecurityToken", accounts => {
    let tx;

    // Accounts Variable declaration
    let owner;
    let investor1;
    let investor2;
    let operator;
    let fundsReceiver;
    let address_zero = "0x0000000000000000000000000000000000000000";


    // Contract Instance Declaration
    let iPolicyRegistry;
    let iSecurityToken;
    let iGeneralPolicy;
    let iGeneralSTO;
    let iRAC;
    let iERC20Token;

    let rate = 10;

    before(async () => {
        // Accounts setup
        owner = accounts[0];
        investor1 = accounts[1];
        investor2 = accounts[2];
        operator = accounts[9];
        fundsReceiver = accounts[8];

        // Step:1 Create the ecosystem contract instances
        let instances = await DeployContract.deploy(owner);
        iPolicyRegistry = instances.iPolicyRegistry;
        iSecurityToken = instances.iSecurityToken;
        iGeneralPolicy = instances.iGeneralPolicy;
        iRAC = instances.iRAC;
        iERC20Token = instances.iERC20Token;


        iGeneralSTO = await DeployContract.deployGeneralSTO(owner, iSecurityToken.address);

        tx = await iPolicyRegistry.addContract(iSecurityToken.address, {from: owner});
        assert.equal(tx.receipt.status, 1, "Failed to enable iSecurityToken.address");
        tx = await iPolicyRegistry.addContract(iGeneralPolicy.address, {from: owner});
        assert.equal(tx.receipt.status, 1, "Failed to enable iGeneralPolicy.address");

        tx = await iSecurityToken.registryPolicy('', iGeneralPolicy.address, {from: owner});
        assert.equal(tx.receipt.status, 1, "Failed to registryPolicy");

        iSecurityToken.addRole(iGeneralSTO.address, 'mint');

    });

    describe("STO for ETH test cases", async () => {

        it("Should successfully to call configure", async () => {
            let _startTime = Web3Utils.latestTime(web3);
            let _endTime = _startTime + Utils.duration.days(30);
            let _maxAmount = Web3Utils.setAmount(100000000, 18).toNumber();
            let _rate = rate;
            let _minInvestorAmount = Web3Utils.setAmount(1, 18).toNumber();
            let _maxInvestorAmount = Web3Utils.setAmount(10000, 18).toNumber();
            let _maxInvestors = 200;
            let _lockMonths = 12;

            Log.trace('params:','', false, [address_zero,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]);
            tx = await iGeneralSTO.configure('', false, [address_zero,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths], {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to configure");

        });

        it("Should successfully to call buy", async () => {
            let now = Web3Utils.latestTime(web3);
            let fromTime = now + Utils.duration.days(-1);
            let toTime = fromTime;
            let expiryTime = now + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iGeneralPolicy.modifyWhitelist(fundsReceiver, fromTime, toTime, expiryTime, true, '', {
                from: owner,
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


    describe("STO For Token test cases", async () => {
        it("Should successfully to call configure", async () => {
            let now = Web3Utils.latestTime(web3);
            let fromTime = now + Utils.duration.days(-1);
            let toTime = fromTime;
            let expiryTime = now + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {
                from: owner,
                gas: 6000000
            });

            let _startTime = Web3Utils.latestTime(web3);
            let _endTime = _startTime + Utils.duration.days(30);
            let _maxAmount = Web3Utils.setAmount(100000000, 18).toNumber();
            let _rate = rate;
            let _minInvestorAmount = Web3Utils.setAmount(1, 18).toNumber();
            let _maxInvestorAmount = Web3Utils.setAmount(10000, 18).toNumber();
            let _maxInvestors = 200;
            let _lockMonths = 12;

            Log.trace('params:','', false, [iERC20Token.address,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]);
            tx = await iGeneralSTO.configure('', false, [iERC20Token.address,fundsReceiver],[_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths], {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to configure");

        });

        it("Should successfully to call buyWithToken", async () => {

            let now = Web3Utils.latestTime(web3);
            let fromTime = now + Utils.duration.days(-1);
            let toTime = fromTime;
            let expiryTime = now + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iGeneralPolicy.modifyWhitelist(fundsReceiver, fromTime, toTime, expiryTime, true, '',  {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, fundsReceiver, "Failed in adding the fundsReceiver in whitelist");


            tx = await iERC20Token.transfer(investor1, Web3Utils.setAmount(1000,18).toString(), {
                from: owner
            });
            assert.equal(tx.receipt.status, 1, "Failed to transfer");

            tx = await iERC20Token.approve(iGeneralSTO.address, Web3Utils.setAmount(1000000,18).toNumber(), { from: investor1 });
            assert.equal(tx.receipt.status, 1, "Failed to approve");

            let amount = 10;
            let beforeBalance = await iSecurityToken.balanceOf(investor1);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);

            let beforeFundsReceiverBalance = await iERC20Token.balanceOf(fundsReceiver);
            beforeFundsReceiverBalance = Web3Utils.getAmount(beforeFundsReceiverBalance,18).toNumber();
            Log.debug('beforeFundsReceiverBalance:', beforeFundsReceiverBalance);

            tx = await iGeneralSTO.buyWithToken(Web3Utils.setAmount(amount,18).toNumber(), {
                from: investor1
            });
            Log.debug('tx', tx.logs[0]);
            assert.equal(tx.receipt.status, 1, "Failed to buy");

            let afterBalance = await iSecurityToken.balanceOf(investor1);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);

            let afterFundsReceiverBalance = await iERC20Token.balanceOf(fundsReceiver);
            afterFundsReceiverBalance = Web3Utils.getAmount(afterFundsReceiverBalance,18).toNumber();
            Log.debug('afterFundsReceiverBalance:', afterFundsReceiverBalance);

            assert.equal(afterBalance-beforeBalance, amount*rate, 'Should be '+amount*rate)
            assert.equal(afterFundsReceiverBalance-beforeFundsReceiverBalance, amount, 'Should be '+amount)

        })
    });
});
