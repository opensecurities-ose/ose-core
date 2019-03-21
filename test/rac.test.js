const RAC = artifacts.require('./RAC.sol')
const Utils = require("./common/utils");
const Web3 = require("web3");
const Web3Utils = require('../utils/Web3Utils');
const Log = require('../utils/LogConsole');
var { catchRevert } = require("./common/exceptions");
const BigNumber = require("bignumber.js");
const roles = require('../doc/public/vendors/my-public/js/role');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Hardcoded development port

contract("RAC", accounts => {
    // temporary Variable declaration
    let tx;
    let res;

    // Accounts Variable declaration
    let owner;
    let operator;

    // Contract Instance Declaration
    let iRAC;

    before(async () => {
        // Accounts setup
        owner = accounts[0];
        operator = accounts[1];

        iRAC = await RAC.new({ from: owner });
        assert.ok(iRAC);

    });

    describe("RAC related test cases", async () => {
        it("Should fail add role if operator no permission", async () => {
            await catchRevert(iRAC.addRole(owner, 'createST', {from: operator}));
        });

        it("Should fail remove role if operator no permission", async () => {
            await catchRevert(iRAC.removeRole(owner, 'createST', {from: operator}));
        });

        it("add role for operator", async () => {
            tx = await iRAC.addRole(operator, 'manageRole', {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to addRole");

        });

        it("add role", async () => {
            tx = await iRAC.addRole(owner, 'createST', {from: operator});
            assert.equal(tx.receipt.status, 1, "Failed to addRole");

        });

        it("check role", async () => {
            tx = await iRAC.checkRole(owner, 'createST');
            assert.equal(tx, true, "Failed to check");

        });

        it("batch add roles", async () => {
            // console.log(owner, roles.roles);
            tx = await iRAC.batchAddRole(owner, roles.RAC_ROLES, {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to batchAddRole");

        });

        it("batch remove roles", async () => {
            // console.log(owner, roles.roles);
            tx = await iRAC.batchRemoveRole(owner, ['createST','createSTO'], {from: owner});
            assert.equal(tx.receipt.status, 1, "Failed to batchRemoveRole");

        });

        it("check role", async () => {
            tx = await iRAC.checkRole(owner, 'createST');
            assert.equal(tx, false, "Failed to check");

        });

    });

});
