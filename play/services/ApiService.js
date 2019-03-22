var Message = require('../common/Message')
var ethUtils = require("ethereumjs-util")
var sigUtil = require('eth-sig-util')
const ethAbi = require('ethereumjs-abi')
var Web3 = require("web3");
var Log = require('../../utils/LogConsole')
var Web3Utils = require('../../utils/Web3Utils')
var config = require('../config')
var {abiSecurityToken} = require('../public/vendors/my-public/js/abiSecurityToken')
var {abiGP} = require('../public/vendors/my-public/js/abiGP')
var {abiSTO} = require('../public/vendors/my-public/js/abiSTO')
var {abiSTOFactory} = require('../public/vendors/my-public/js/abiSTOFactory')
var {abiSTGFactory} = require('../public/vendors/my-public/js/abiSTGFactory')
var {abiRAC} = require('../public/vendors/my-public/js/abiRAC')

// 创建web3对象
var web3 = new Web3();
Log.debug('web3.version:',web3.version);
// 连接到以太坊节点
Log.debug('chainAddress:'+config.httpProvider);
if(!web3.currentProvider) {
    Log.debug("connect...");
    web3.setProvider(new Web3.providers.HttpProvider(config.httpProvider));
} else {
    Log.debug("already connect!");
}
module.exports= class ApiService {
    static verifySign(account, msg, signature) {
        msg += '';
        // console.debug('account:', account);
        // console.debug('msg:', msg);
        // console.debug('signature:', signature);

        if(signature.toLowerCase().substring(0,2) == '0x') {
            signature = signature.substring(2);
        }
        let r = new Buffer(signature.substring(0, 64), 'hex');
        let s = new Buffer(signature.substring(64, 128), 'hex');
        let v = new Buffer((parseInt(signature.substring(128, 130)) + 27).toString());

        // console.debug('r:',r);
        // console.debug('s:',s);
        // console.debug('v:',v);

        let sha3Mag = ethUtils.keccak256(msg);
        console.debug('sha3Mag:', sha3Mag);
        let pubKey=ethUtils.ecrecover(sha3Mag, v, r, s);
        let pubAddr="0x"+ethUtils.publicToAddress(pubKey).toString("hex");
        // console.debug('pubAddr:', pubAddr);
        if(pubAddr.toLowerCase() == account.toLowerCase()){
            return Message.success();
        }

        return Message.fail(pubAddr);
    }

    static verifyPersonalSign(account, msg, signature) {
        msg += '';
        // console.debug('account:', account);
        // console.debug('msg:', msg);
        // console.debug('signature:', signature);

        if(signature.toLowerCase().substring(0,2) == '0x') {
            signature = signature.substring(2);
        }
        let r = new Buffer(signature.substring(0, 64), 'hex');
        let s = new Buffer(signature.substring(64, 128), 'hex');
        let v = new Buffer((parseInt(signature.substring(128, 130)) + 27).toString());

        // console.debug('r:',r);
        // console.debug('s:',s);
        // console.debug('v:',v);

        // msg = web3.toHex(msg);
        const msgBuffer = ethUtils.toBuffer(msg);
        let sha3Msg = ethUtils.hashPersonalMessage(msgBuffer);
        // console.debug('sha3Msg:', sha3Msg);
        let pubKey=ethUtils.ecrecover(sha3Msg, v, r, s);
        // console.debug('pubKey:', pubKey);
        let pubAddr="0x"+ethUtils.publicToAddress(pubKey).toString("hex");
        // console.debug('pubAddr:', pubAddr);
        if(pubAddr.toLowerCase() == account.toLowerCase()){
            return Message.success(pubAddr);
        }

        return Message.fail();
    }

    static verifySignTypedData(account, msg, signature) {
        // console.debug('account:', account);
        // console.debug('msg:', msg);
        // console.debug('signature:', signature);
        msg = JSON.parse(msg);
        ApiService.typedSignatureHash(msg);
        let recovered = sigUtil.recoverTypedSignatureLegacy({ data: msg, sig: signature });
        console.debug('recovered:', recovered);

        if (ethUtils.toChecksumAddress(recovered) === ethUtils.toChecksumAddress(account)) {
            return Message.success(account);
        }

        return Message.fail();
    }

    static async getTransactionReceiptLogs(name, tx) {
        let receipt = await web3.eth.getTransactionReceipt(tx);
        let abi= ApiService.getAbi(name);

        if(!abi) {
            return Message.fail('abi is null');
        }
        if(receipt && receipt.hasOwnProperty('logs')) {
            try {
                receipt.logs = Web3Utils.decodeEventsForContract(abi, receipt.logs);
                return Message.success(receipt);
            } catch (e) {
                Log.error('fail to decodeEventsForContract:', e);
            }

        }
        Log.error('fail to getTransactionReceiptLogs:'+ tx, receipt);
        return Message.fail(receipt);
    }


    static getTransaction(name, tx) {
        let receipt = web3.eth.getTransaction(tx);
        let abi= ApiService.getAbi(name);

        if(!abi) {
            return Message.fail('abi is null');
        }
        if(receipt && receipt.hasOwnProperty('input')) {
            try {
                receipt.input = Web3Utils.decodeInputForContract(abi, receipt.input);
                return Message.success(receipt);
            } catch (e) {
                Log.error('fail to decodeInputForContract:', e);
            }

        }
        Log.error('fail to getTransaction:'+ tx, receipt);
        return Message.fail(receipt);
    }

    static getAbi(name) {
        let abi='';
        if(name=='ST') {
            abi = abiSecurityToken;
        } else if(name=='GP') {
            abi =  abiGP;
        } else if(name=='STO') {
            abi =  abiSTO;
        } else if(name=='STOFactory') {
            abi =  abiSTOFactory;
        } else if(name=='STGFactory') {
            abi =  abiSTGFactory;
        } else if(name=='RAC') {
            abi =  abiRAC;
        }
        return abi;
    }

    static typedSignatureHash(typedData) {
        const error = new Error('Expect argument to be non-empty array')
        if (typeof typedData !== 'object' || !typedData.length) throw error

        const data = typedData.map(function (e) {
            return e.type === 'bytes' ? ethUtils.toBuffer(e.value) : e.value
        })
        console.log('data:', data);
        const types = typedData.map(function (e) {
            return e.type
        })
        const schema = typedData.map(function (e) {
            if (!e.name) throw error
            return e.type + ' ' + e.name
        })
        console.log('schema:', schema);
        let edata = ethAbi.solidityPack(types, data);
        console.log('edata:', edata);
        // return ethAbi.soliditySHA3(
        //     ['bytes32', 'bytes32'],
        //     [
        //         ethAbi.soliditySHA3(new Array(typedData.length).fill('string'), schema),
        //         ethAbi.soliditySHA3(types, data)
        //     ]
        // )
    }


}
