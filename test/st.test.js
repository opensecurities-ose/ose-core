const DeployContract = require("./common/deployContract");
const RAC = artifacts.require('./RAC.sol')
const Utils = require("./common/utils");
const Web3 = require("web3");
const Web3Utils = require('../utils/Web3Utils');
const Log = require('../utils/LogConsole');
var { catchRevert } = require("./common/exceptions");
const BigNumber = require("bignumber.js");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Hardcoded development port

contract("SecurityToken", accounts => {
    let tx, res;
    // Accounts Variable declaration
    let owner;
    let investor1;
    let investor2;
    let investor3;
    let manage1;
    let operator;
    let address_zero = "0x0000000000000000000000000000000000000000";


    // Contract Instance Declaration
    let iPolicyRegistry;
    let iSecurityToken;
    let iGeneralPolicy;
    let iRAC;

    before(async () => {
        // Accounts setup
        owner = accounts[0];
        investor1 = accounts[1];
        investor2 = accounts[2];
        investor3 = accounts[3];
        manage1 = accounts[4];
        operator = accounts[9];

        // Step:1 Create the ecosystem contract instances
        let instances = await DeployContract.deploy(owner);
        iPolicyRegistry = instances.iPolicyRegistry;
        iSecurityToken = instances.iSecurityToken;
        iGeneralPolicy = instances.iGeneralPolicy;
        iRAC = instances.iRAC;

        tx = await iPolicyRegistry.addContract(iSecurityToken.address, {from: owner});
        assert.equal(tx.receipt.status, 1, "Fail to enable iSecurityToken.address");
        tx = await iPolicyRegistry.addContract(iGeneralPolicy.address, {from: owner});
        assert.equal(tx.receipt.status, 1, "Fail to enable iGeneralPolicy.address");

    });

    describe("Role related test cases", async () => {
        it("Should return false check role", async () => {
            res = await iSecurityToken.checkRole(operator,'manageRole');
            Log.debug('checkRole:', res);
            assert.equal(res, false, "Fail to checkRole");
        });

        it("Should fail add role if operator no permission", async () => {
            await catchRevert(iSecurityToken.addRole(manage1, 'manageRole', { from: operator }));
        });

        it("Should fail remove role if operator no permission", async () => {
            await catchRevert(iSecurityToken.removeRole(manage1, 'createST', { from: operator }));
        });

        it("Should fail set whitelist if operator no permission", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime + Utils.duration.days(100);
            let expiryTime = fromTime + Utils.duration.days(100);
            await catchRevert(iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {from: operator, gas: 6000000}));
        });

        it("Should successfully addRole", async () => {
            tx = await iSecurityToken.addRole(operator, 'manageRole', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
            tx = await iSecurityToken.addRole(operator, 'modifyWhitelist', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
        });

        it("Should success if operator there is permission", async () => {
            tx = await iSecurityToken.addRole(manage1, 'createST', { from: operator });
            assert.equal(tx.receipt.status, 1, "Fail to addRole");

            res = await iSecurityToken.checkRole(manage1,'createST');
            Log.debug('checkRole:', res);
            assert.equal(res, true, "Fail to checkRole");

            tx = await iSecurityToken.removeRole(manage1, 'createST', { from: operator });
            assert.equal(tx.receipt.status, 1, "Fail to removeRole");

            res = await iSecurityToken.checkRole(manage1,'createST');
            Log.debug('checkRole:', res);
            assert.equal(res, false, "Fail to checkRole");

            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime + Utils.duration.days(100);
            let expiryTime = fromTime + Utils.duration.days(100);
            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {from: operator, gas: 6000000});
            assert.equal(tx.receipt.status, 1, "Fail to modifyWhitelist");

        });
    });

    describe("Configure related test cases", async () => {

        it("Should fail register the policies if operator no permission", async () => {
            await catchRevert(iSecurityToken.registryPolicy('', iGeneralPolicy.address, {from: operator}));
        });

        it("Should fail change granularity if operator no permission", async () => {
            await catchRevert(iSecurityToken.changeGranularity(2, { from: operator }));
        });

        it("Should successfully addRole", async () => {
            tx = await iSecurityToken.addRole(operator, 'configure', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
        });

        it("Should register the policies if operator there is permission", async () => {
            tx = await iSecurityToken.registryPolicy('tmp', iGeneralPolicy.address, {from: operator});
            assert.equal(tx.receipt.status, 1, "Fail to registryPolicy");
        });

        it("Should register the policies", async () => {
            tx = await iSecurityToken.registryPolicy('', iGeneralPolicy.address, {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to registryPolicy");
            assert.equal(tx.logs[0].args._policy, iGeneralPolicy.address, "Fail to registryPolicy, iGeneralPolicy.address should be ", iGeneralPolicy.address);
            res = await iSecurityToken.getPolicy('');
            Log.debug('res:', res);
            assert.equal(res, iGeneralPolicy.address, "Fail to registryPolicy/getPolicy, iGeneralPolicy.address should be ", iGeneralPolicy.address);
        });

        it("Should change granularity if operator there is permission", async () => {
            tx = await iSecurityToken.changeGranularity(2, {from: operator});
            assert.equal(tx.receipt.status, 1, "Fail to changeGranularity");
        });

        it("Should change granularity with owner", async () => {
            res = await iSecurityToken.decimals();
            Log.debug('decimals:', res);

            let _value = Web3Utils.setAmount(1,res);
            _value = _value.toString();
            Log.debug('_value:', _value);

            tx = await iSecurityToken.changeGranularity(_value, {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to changeGranularity");
            assert.equal(tx.logs[0].args._new, _value, "Fail to changeGranularity, it should be ", _value);

            res = await iSecurityToken.granularity();
            Log.debug('granularity:', res);
            assert.equal(res, _value, "Fail to get changed granularity");

        });

    });

    describe("Mint related test cases", async () => {
        it("Should fail mint if whitelist is expired", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime + Utils.duration.days(100);
            let expiryTime = fromTime - Utils.duration.days(100);
            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true, '', {
                from: owner,
                gas: 6000000
            });
            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");
            await catchRevert(iSecurityToken.mint(investor1, Web3Utils.getAmount(100,18).toNumber(), { from: owner }));
        });

        it("Should fail mint if no whitelist", async () => {
            await catchRevert(iSecurityToken.mint(investor2, Web3Utils.getAmount(100,18).toNumber(), { from: owner }));
        });

        it("Should successfully mint", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime;
            let expiryTime = fromTime + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor2, fromTime, toTime, expiryTime, true,'',  {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor2, "Failed in adding the investor in whitelist");

            let beforeBalance = await iSecurityToken.balanceOf(investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);
            tx  = await iSecurityToken.mint(investor2, Web3Utils.setAmount(100,18).toNumber(), { from: owner });
            Log.debug('logs args:', tx.logs[0].args);
            let afterBalance = await iSecurityToken.balanceOf(investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(afterBalance-beforeBalance, 100, 'Should be 100')

        });

        it("Should batchMint", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime;
            let expiryTime = fromTime + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true,'',  {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iSecurityToken.batchMint([investor1, investor2], [Web3Utils.setAmount(100,18).toNumber(),Web3Utils.setAmount(200,18).toNumber()], {
                from: owner,
                gas: 500000
            });

            Log.debug('logs args:', tx.logs[0].args);
        });

        it("Should successfully mintTranche", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime;
            let expiryTime = fromTime + Utils.duration.days(100);

            tx = await iGeneralPolicy.modifyWhitelist(investor2, fromTime, toTime, expiryTime, true,'',  {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor2, "Failed in adding the investor in whitelist");

            let beforeBalance = await iSecurityToken.balanceOf(investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);
            tx  = await iSecurityToken.mintTranche('', investor2, Web3Utils.setAmount(100,18).toNumber(),'', { from: owner });
            Log.debug('logs args:', tx.logs[0].args);
            let afterBalance = await iSecurityToken.balanceOf(investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(afterBalance-beforeBalance, 100, 'Should be 100')

        });


        it("Should batchMintTranche", async () => {
            let fromTime = Web3Utils.latestTime(web3);
            let toTime = fromTime;
            let expiryTime = fromTime + Utils.duration.days(100);

            tx = await iGeneralPolicy.batchModifyWhitelist([investor1], [fromTime], [toTime], [expiryTime], [true],'',  {
                from: owner,
                gas: 6000000
            });

            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iSecurityToken.batchMintTranche('', [investor1, investor2], [Web3Utils.setAmount(100,18).toNumber(),Web3Utils.setAmount(200,18).toNumber()], '', {
                from: owner,
                gas: 500000
            });

            Log.debug('logs args:', tx.logs[0].args);
        });


        it("Should fail mint if operator no permission", async () => {
            await catchRevert(iSecurityToken.mint(investor1, Web3Utils.setAmount(1,18).toNumber(), { from: operator }));
        });

        it("Should mint if operator there is permission", async () => {
            tx = await iSecurityToken.addRole(operator, 'mint', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
            tx = await iSecurityToken.mint(investor1, Web3Utils.setAmount(1,18).toNumber(),  {
                from: operator
            });
            assert.equal(tx.receipt.status, 1, "Fail to mint");
        });

    });

    describe("Transfer related test cases", async () => {
        it("Should make sure there are enough balance", async () => {
            res = await iSecurityToken.balanceOf(investor1);
            Log.debug('balanceOf:', Web3Utils.getAmount(res, 18).toNumber());
            let bnBalance = new BigNumber(res);
            let bnVaule = Web3Utils.setAmount(10,18);
            let _value =  bnBalance.minus(bnVaule);
            _value = _value.toNumber();
            res = false;
            if(_value >=0) {
                res = true;
            }
            assert.equal(res, true, "balance is not enough");

        });

        it("Should fail transfer from one whitelist investor to non whitelist investor", async () => {
            await catchRevert(iSecurityToken.transfer(investor3, Web3Utils.setAmount(1,18).toNumber(), { from: investor1 }));
        });

        it("Should fail transferTranche the token from one whitelist investor to non whitelist investor", async () => {
            await catchRevert(iSecurityToken.transferTranche('', investor3, Web3Utils.setAmount(1,18).toNumber(), '', { from: investor1 }));
        });

        it("Should fail batchTransferTranche the token from one whitelist investor to non whitelist investor", async () => {
            await catchRevert(iSecurityToken.batchTransferTranche('', [investor2], [1], '', { from: investor1 }));
        });

        it("Should fail transfer, quantity must be an integer multiple of the granularity", async () => {
            await catchRevert(iSecurityToken.transfer(investor2, 1, { from: investor1 }));
        });

        it("Should fail transferTranche, quantity must be an integer multiple of the granularity", async () => {
            await catchRevert(iSecurityToken.transferTranche('', investor2, 1, '', { from: investor1 }));
        });

        it("Should successfully set whitelist", async () => {
            let now = Web3Utils.latestTime(web3);
            let fromTime = now + Utils.duration.days(-1);
            let toTime = fromTime;
            let expiryTime = now + Utils.duration.days(100);
            tx = await iGeneralPolicy.modifyWhitelist(investor1, fromTime, toTime, expiryTime, true,'',  {
                from: owner,
                gas: 6000000
            });
            assert.equal(tx.logs[0].args._investor, investor1, "Failed in adding the investor in whitelist");

            tx = await iGeneralPolicy.modifyWhitelist(investor2, fromTime, toTime, expiryTime, true, '', {
                from: owner,
                gas: 6000000
            });
            assert.equal(tx.logs[0].args._investor, investor2, "Failed in adding the investor in whitelist");

        });

        it("Should successfully transfer from policy investor", async () => {
            let beforeBalance = await iSecurityToken.balanceOf(investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);
            tx = await iSecurityToken.transfer(investor2, Web3Utils.setAmount(1,18).toNumber(), { from: investor1, gas: 2500000 });
            assert.equal(tx.logs[0].args._value, Web3Utils.setAmount(1,18).toNumber(), "Fail to transfer");
            let afterBalance = await iSecurityToken.balanceOf(investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(afterBalance-beforeBalance, 1, 'Should be 1');

        });

        it("Should successfully transferTranche", async () => {
            let beforeBalance = await iSecurityToken.balanceOfTranche('',investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('investor2 beforeBalance:', beforeBalance);
            tx = await iSecurityToken.transferTranche('', investor2, Web3Utils.setAmount(1,18).toNumber(),'', { from: investor1, gas: 3500000 });
            assert.equal(tx.logs[0].args._amount, Web3Utils.setAmount(1,18).toNumber(), "Fail to transferTranche");
            let afterBalance = await iSecurityToken.balanceOfTranche('',investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('investor2 afterBalance:', afterBalance);
            assert.equal(afterBalance-beforeBalance, 1, 'Should be 1');
        });

        it("Should successfully batchTransferTranche", async () => {
            let beforeBalance = await iSecurityToken.balanceOfTranche('',investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);
            tx = await iSecurityToken.batchTransferTranche('', [investor2], [Web3Utils.setAmount(1,18).toNumber()],'', { from: investor1, gas: 3500000 });
            assert.equal(tx.receipt.status, 1, "Fail to batchTransferTranche");
            let afterBalance = await iSecurityToken.balanceOfTranche('',investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(afterBalance-beforeBalance, 1, 'Should be 1');
        });

        it("Should fail transferFrom if it is not allowed", async () => {
            await catchRevert(iSecurityToken.transferFrom(investor2, investor1, Web3Utils.setAmount(1,18).toNumber(), { from: operator }));
        });

        it("Should transferFrom from one investor to other", async () => {
            tx = await iSecurityToken.approve(operator, Web3Utils.setAmount(1000000,18).toNumber(), { from: investor2 });
            assert.equal(tx.logs[0].args._value, Web3Utils.setAmount(1000000,18).toNumber(), "Fail to approve");

            res = await iSecurityToken.allowance(investor2, operator);
            Log.debug('allowance:', res);
            assert.equal(res, Web3Utils.setAmount(1000000,18).toNumber(), "Fail to check approve");

            let beforeBalance = await iSecurityToken.balanceOf(investor2);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);
            tx = await iSecurityToken.transferFrom(investor2, investor1, Web3Utils.setAmount(1,18).toNumber(), {
                from: operator
            });
            Log.debug('transferFrom tx:',tx.logs[0].args);
            assert.equal(tx.logs[0].args._value, Web3Utils.setAmount(1,18).toNumber(), "Fail to transferFrom");
            let afterBalance = await iSecurityToken.balanceOf(investor2);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(beforeBalance-afterBalance, 1, 'Should be 1');

        });

        it("Should fail force transfer if operator no permission", async () => {
            await catchRevert(iSecurityToken.forceTransfer('', investor1, investor2, Web3Utils.setAmount(1,18).toNumber(), '', { from: operator }));
        });

        it("Should force transfer from one investor to other if operator there is permission", async () => {
            tx = await iSecurityToken.addRole(operator, 'forceTransfer', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
            tx = await iSecurityToken.forceTransfer('', investor1, investor2, Web3Utils.setAmount(1,18).toNumber(), '', {
                from: operator
            });
            assert.equal(tx.receipt.status, 1, "Fail to forceTransfer");
        });

        it("Should force transfer from one investor to other if operator is owner", async () => {
            let investor1BeforeBalance = await iSecurityToken.balanceOf(investor1);
            investor1BeforeBalance = Web3Utils.getAmount(investor1BeforeBalance,18).toNumber();
            Log.debug('investor1BeforeBalance:', investor1BeforeBalance);

            let investor2BeforeBalance = await iSecurityToken.balanceOf(investor2);
            investor2BeforeBalance = Web3Utils.getAmount(investor2BeforeBalance,18).toNumber();
            Log.debug('investor2BeforeBalance:', investor2BeforeBalance);

            tx = await iSecurityToken.forceTransfer('', investor1, investor2, Web3Utils.setAmount(1,18).toNumber(), '', {
                from: owner
            });
            assert.equal(tx.receipt.status, 1, "Fail to forceTransfer");

            let investor1AfterBalance = await iSecurityToken.balanceOf(investor1);
            investor1AfterBalance = Web3Utils.getAmount(investor1AfterBalance,18).toNumber();
            Log.debug('investor1AfterBalance:', investor1AfterBalance);

            let investor2AfterBalance = await iSecurityToken.balanceOf(investor2);
            investor2AfterBalance = Web3Utils.getAmount(investor2AfterBalance,18).toNumber();
            Log.debug('investor2AfterBalance:', investor2AfterBalance);
            //
            assert.equal(investor1BeforeBalance-investor1AfterBalance, 1, 'investor1BeforeBalance-investor1AfterBalance should be 1');
            assert.equal(investor2AfterBalance-investor2BeforeBalance, 1, 'investor2AfterBalance-investor2BeforeBalance should be 1');

        });

    });

    describe("Burn related test cases", async() => {

        it("Should fail to force burn the tokens if no permission", async() => {
            await catchRevert(iSecurityToken.forceBurn('', investor1, Web3Utils.setAmount(1,18).toNumber(), '', {from: operator}));
        });

        it("Should force burn if operator there is permission", async() => {
            tx = await iSecurityToken.addRole(operator, 'forceBurn', {from: owner});
            assert.equal(tx.receipt.status, 1, "Fail to addRole");
            tx = await iSecurityToken.forceBurn('', investor1, Web3Utils.setAmount(1,18).toNumber(), '', {
                from: operator
            });
            assert.equal(tx.receipt.status, 1, "Fail to forceBurn");
        });

        it("Should force burn if owner", async() => {
            let beforeBalance = await iSecurityToken.balanceOf(investor1);
            beforeBalance = Web3Utils.getAmount(beforeBalance,18).toNumber();
            Log.debug('beforeBalance:', beforeBalance);

            tx = await iSecurityToken.forceBurn('', investor1, Web3Utils.setAmount(1,18).toNumber(), '', {
                from: operator
            });
            assert.equal(tx.receipt.status, 1, "Fail to forceBurn");

            let afterBalance = await iSecurityToken.balanceOf(investor1);
            afterBalance = Web3Utils.getAmount(afterBalance,18).toNumber();
            Log.debug('afterBalance:', afterBalance);
            assert.equal(beforeBalance-afterBalance, 1, 'beforeBalance-afterBalance should be 1');
        });

    })

});
