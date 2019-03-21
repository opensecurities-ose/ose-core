const MultiSigWallet = artifacts.require('./multisig/MultiSigWallet.sol')
const DExchange = artifacts.require('./dex/ExchangeCore.sol')
const Web3Utils = require('../utils/Web3Utils.js')

contract("MultiSigWallet", async (accounts) => {
    let multisigInstance
    let exchangeInstance
    var multisigAccounts = [accounts[1], accounts[2],accounts[5]]
    const requiredConfirmations = 2
    beforeEach(async () => {
        multisigInstance = await MultiSigWallet.new(multisigAccounts, requiredConfirmations)
        assert.ok(multisigInstance)
        exchangeInstance = await DExchange.new({from: accounts[0]})
        await exchangeInstance.changeOwner(multisigInstance.address, {from: accounts[0]})
        let exOwner = await exchangeInstance.owner()
        assert.equal(exOwner, multisigInstance.address, "change owner to MultiSigWallet failed")
    })
    it("setRelayer with multisig", async () => {
        const dataEncoded = exchangeInstance.contract.setRelayer.getData(accounts[3], true);
        console.log(dataEncoded)
        let result = await multisigInstance.submitTransaction(exchangeInstance.address, 0, dataEncoded, {from: multisigAccounts[0]})
        // console.log(result.receipt.logs)
        let tId = getTransactionId("Submission", [{
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "transactionId",
                    "type": "uint256"
                }
            ],
            "name": "Submission",
            "type": "event"
        }], result.receipt.logs)

        let isR = await exchangeInstance.relayers(accounts[3])
        assert.equal(isR, false, "set relayer should not ready before multisig executed.")

        result = await multisigInstance.confirmTransaction(tId, {from: multisigAccounts[1]});
        // console.log(result.receipt.logs)
        let eId = getTransactionId("Execution", [{
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "transactionId",
                    "type": "uint256"
                }
            ],
            "name": "Execution",
            "type": "event"
        }], result.receipt.logs)

        assert.equal(tId, eId, "execute failed.")
        isR = await exchangeInstance.relayers(accounts[3])
        console.log(isR)
        assert.equal(isR, true, "set relayer with multisig failed")
    })
})

function getTransactionId(event, abi, logs) {
    let data = Web3Utils.decodeEventsForContract(abi, logs)
    let ee = data.filter((obj) => {
        return event == obj.event
    }).map((obj) => {
        return obj
    })
    // console.log(ee[0].args.transactionId.valueOf());
    return ee[0].args.transactionId.valueOf()
}
