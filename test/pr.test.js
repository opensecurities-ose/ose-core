const DeployContract = require("./common/deployContract");
const Web3 = require("web3");
const Web3Utils = require('../utils/Web3Utils');
const Log = require('../utils/LogConsole');
var { catchRevert } = require("./common/exceptions");
const BigNumber = require("bignumber.js");
const roles = require('../doc/public/vendors/my-public/js/role');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Hardcoded development port

contract("PolicyRegistry", accounts => {
    // temporary Variable declaration
    let tx;
    let res;

    // Accounts Variable declaration
    let owner;
    let operator;

    // Contract Instance Declaration
    let iPolicyRegistry;
    let iSecurityToken;
    let iGeneralPolicy;
    let iRAC;

    before(async () => {
        // Accounts setup
        owner = accounts[0];
        operator = accounts[1];

        let instances = await DeployContract.deploy(owner);
        iPolicyRegistry = instances.iPolicyRegistry;
        iSecurityToken = instances.iSecurityToken;
        iGeneralPolicy = instances.iGeneralPolicy;
        iRAC = instances.iRAC;

    });

    describe("PolicyRegistry paused related test cases", async () => {
        it("Should successfully addContract", async () => {
            tx = await iPolicyRegistry.addContract(iSecurityToken.address, {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to addContract");

            res = await iPolicyRegistry.checkContract(iSecurityToken.address);
            assert.equal(res, true, "Failed to checkContract");
        });

        it("Should successfully paused", async () => {
            tx = await iPolicyRegistry.pause({from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to pause");
        });

        it("Should fail checkContract", async () => {
            res = await iPolicyRegistry.checkContract(iSecurityToken.address);
            assert.equal(res, false, "Failed to checkContract");
        });

        it("Should fail addContract if paused", async () => {
            await catchRevert(iPolicyRegistry.addContract(iSecurityToken.address, {from: owner}));
        });

        it("Should fail removeContract if paused", async () => {
            await catchRevert(iPolicyRegistry.removeContract(iSecurityToken.address, {from: owner}));
        });

    });

    describe("PolicyRegistry unpaused related test cases", async () => {
        it("Should successfully unpaused", async () => {
            tx = await iPolicyRegistry.unpause({from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to unpaused");
        });

        it("remove role for operator", async () => {
            tx = await iRAC.removeRole(operator, 'manageContract', {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to removeRole");
        });

        it("Should fail addContract if operator no permission", async () => {
            await catchRevert(iPolicyRegistry.addContract(iSecurityToken.address, {from: operator}));
        });

        it("Should fail removeContract if operator no permission", async () => {
            await catchRevert(iPolicyRegistry.removeContract(iSecurityToken.address, {from: operator}));
        });

        it("Should fail batchAddContract if operator no permission", async () => {
            await catchRevert(iPolicyRegistry.batchAddContract([iSecurityToken.address, iGeneralPolicy.address], {from: operator}));
        });

        it("Should fail batchRemoveContract if operator no permission", async () => {
            await catchRevert(iPolicyRegistry.batchRemoveContract([iSecurityToken.address, iGeneralPolicy.address], {from: operator}));
        });

        it("add role for operator", async () => {
            tx = await iRAC.addRole(operator, 'manageContract', {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to addRole");

        });

        it("Should successfully addContract", async () => {
            tx = await iPolicyRegistry.addContract(iSecurityToken.address, {from: operator});
            assert.equal(tx.receipt.status, 1, "Failed to addContract");

            res = await iPolicyRegistry.getContract(iSecurityToken.address);
            assert.equal(res, true, "Failed to getContract");

            res = await iPolicyRegistry.checkContract(iSecurityToken.address);
            assert.equal(res, true, "Failed to checkContract");

        });

        it("Should successfully removeContract", async () => {
            tx = await iPolicyRegistry.removeContract(iSecurityToken.address, {from: operator});
            assert.equal(tx.receipt.status, 1, "Failed to addContract");

            res = await iPolicyRegistry.getContract(iSecurityToken.address);
            assert.equal(res, false, "Failed to getContract");
        });

        it("Should successfully batchAddContract", async () => {
            tx = await iPolicyRegistry.batchAddContract([iSecurityToken.address, iGeneralPolicy.address], {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to batchAddContract");
        });

        it("Should successfully batchRemoveContract", async () => {
            tx = await iPolicyRegistry.batchRemoveContract([iSecurityToken.address, iGeneralPolicy.address], {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to batchRemoveContract");
        });

    });

});
