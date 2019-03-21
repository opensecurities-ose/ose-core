var BigNumber = require("bignumber.js");
var InputDataDecoder = require('./InputDataDecoder');
var EventsDataDecoder = require('./EventsDataDecoder');
var Log = require('./LogConsole');

class Web3Utils{

    static decodeEventsForContract(abi, logs) {
        return EventsDataDecoder(abi, logs);
    };

    static decodeInputForContract(abi, data) {
        if(!abi || !data) {
            return data;
        }
        let decoder = new InputDataDecoder(abi);
        let result = decoder.decodeData(data);
        // console.log(result);
        return result;
    }

    static setAmount(amount, precision=18) {
        let bn_precision = new BigNumber(10).pow(precision);
        let bn_amount = new BigNumber(amount);
        bn_amount = bn_amount.times(bn_precision);
        return bn_amount;
    }

    static getAmount(amount, precision=18) {
        let bn_precision = new BigNumber(10).pow(precision);
        let bn_amount = new BigNumber(amount);
        bn_amount = bn_amount.div(bn_precision);
        return bn_amount;
    }

    static latestTime(web3) {
        return web3.eth.getBlock("latest").timestamp;
    }


    static mineBlock(web3, reject, resolve) {
        web3.currentProvider.sendAsync({
            method: "evm_mine",
            jsonrpc: "2.0",
            id: new Date().getTime()
        }, (e) => (e ? reject(e) : resolve()))
    }

    static increaseTimestamp(web3, increase) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.sendAsync({
                method: "evm_increaseTime",
                params: [increase],
                jsonrpc: "2.0",
                id: new Date().getTime()
            }, (e) => (e ? reject(e) : mineBlock(web3, reject, resolve)))
        })
    }

    static balanceOf(web3, account) {
        return new Promise((resolve, reject) => web3.eth.getBalance(account, (e, balance) => (e ? reject(e) : resolve(balance))))
    }

    static async assertThrowsAsynchronously(test, error) {
        try {
            await test();
        } catch(e) {
            if (!error || e instanceof error)
                return "everything is fine";
        }
        throw new Error("Missing rejection" + (error ? " with "+error.name : ""));
    }
}
module.exports = Web3Utils;
