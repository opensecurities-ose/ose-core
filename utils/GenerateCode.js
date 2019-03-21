const FileUtils = require('./FileUtils')
const JsonUtils = require('./JsonUtils')
const Log = require('./LogConsole');

module.exports = class GenerateCode {

    static genAddress(contracts, network='development') {

        if(network == 'ropsten') {
            let configContent =`var contractRopsten = {
        RAC: '${contracts.RAC}',
        PolicyRegistry: '${contracts.PolicyRegistry}',
        STGFactory: '${contracts.STGFactory}',
        STOFactory: '${contracts.STOFactory}',
        ST: '${contracts.ST}',
        GP: '${contracts.GP}',
        STO: '${contracts.STO}'
};
    `;
            FileUtils.writeFile(__dirname + '/../doc/public/js/config/contract.ropsten.js', configContent);
        } else {
            let configContent =`var contractDev = {
        RAC: '${contracts.RAC}',
        PolicyRegistry: '${contracts.PolicyRegistry}',
        STGFactory: '${contracts.STGFactory}',
        STOFactory: '${contracts.STOFactory}',
        ST: '${contracts.ST}',
        GP: '${contracts.GP}',
        STO: '${contracts.STO}'
};
    `;
            FileUtils.writeFile(__dirname + '/../doc/public/js/config/contract.dev.js', configContent);
        }


    }

    static genAbi() {

        let contractJson = require('../build/contracts/SecurityToken');
        let abi = "var abiSecurityToken =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiSecurityToken = abiSecurityToken;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiSecurityToken.js', abi);

        contractJson = require('../build/contracts/GeneralPolicy');
        abi = "var abiGP =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiGP = abiGP;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiGP.js', abi);

        contractJson = require('../build/contracts/STGFactory');
        abi = "var abiSTGFactory =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiSTGFactory = abiSTGFactory;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiSTGFactory.js', abi);

        contractJson = require('../build/contracts/GeneralSTO');
        abi = "var abiSTO =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiSTO = abiSTO;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiSTO.js', abi);

        contractJson = require('../build/contracts/GeneralSTOFactory');
        abi = "var abiSTOFactory =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiSTOFactory = abiSTOFactory;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiSTOFactory.js', abi);

        contractJson = require('../build/contracts/RAC');
        abi = "var abiRAC =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiRAC = abiRAC;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiRAC.js', abi);


        contractJson = require('../build/contracts/PolicyRegistry');
        abi = "var abiPolicyRegistry =" + JsonUtils.stringify(contractJson.abi) + ";";
        abi += "(function(exports){\n";
        abi += "    exports.abiPolicyRegistry = abiPolicyRegistry;\n";
        abi += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";
        FileUtils.writeFile(__dirname + '/../doc/public/vendors/my-public/js/abiPolicyRegistry.js', abi);
    }

    static genApis() {
        GenerateCode.genApi('SecurityToken', 'SecurityToken', 240000);
        GenerateCode.genApi('GeneralPolicy', 'GP', 140000);
        GenerateCode.genApi('STGFactory', 'STGFactory', 50000000);
        GenerateCode.genApi('GeneralSTO', 'STO', 400000);
        GenerateCode.genApi('GeneralSTOFactory', 'STOFactory', 2455988);
        GenerateCode.genApi('RAC', 'RAC', 120000);
        GenerateCode.genApi('PolicyRegistry', 'PolicyRegistry',120000);
    }

    static genApi(contract, name=null, gas=100000) {
        if(!name) {
            name = contract;
        }

        let contractJson = require('../build/contracts/'+contract);
        let code = "var abi"+ name +" =" + JsonUtils.stringify(contractJson.abi) + ";";
        code += "\n\n";
        code += "var "+ name +" = function (web3, param) {\n";
        code += "    param['abi'] = abi"+ name +";\n";
        code += "    param['gasLimit'] = "+ gas +";\n";
        code += "    var factory = new Web3Helper(web3, param);\n";
        for(let func of contractJson.abi) {
            code += GenerateCode.genFunc(func);
        }
        code += "\n\n";
        code += "    return factory;\n";
        code += "};\n";
        code += "\n\n";
        code += "(function(exports){\n";
        code += "    exports."+ name +" = "+ name +";\n";
        code += "}(typeof exports === 'undefined' ? this.share = {} : exports));\n";

        FileUtils.writeFile(__dirname + "/../doc/public/vendors/my-public/api/"+ name +".js", code);
        return code;
    }

    static genFunc(func) {
        if(!func || func.type != 'function') {
            return '';
        }

        let code = "\n\n";
        code += "factory." + func.name + " = function (";
        for(let i=0; i<func.inputs.length; i++) {
            if(i==func.inputs.length-1) {
                code += func.inputs[i].name;
            } else {
                code += func.inputs[i].name + ", ";
            }
        }
        code += ") {\n";
        //send tx
        if(!func.constant) {
            code += "    let txData = {\n";
            code += "        data: factory.instance."+ func.name +".getData(";
            let hasArray = false;
            for(let i=0; i<func.inputs.length; i++) {
                if(func.inputs[i].type.indexOf('[]') > 0) {
                    hasArray = true;
                }
                if(i==func.inputs.length-1) {
                    code += func.inputs[i].name;
                } else {
                    code += func.inputs[i].name + ", ";
                }
            }
            code += ")\n";
            code += "    };\n";

            if(hasArray) {
                code += "    let len = 1;\n";
                for(let i=0; i<func.inputs.length; i++) {
                    if(func.inputs[i].type.indexOf('[]') > 0) {
                        code += "    if("+ func.inputs[i].name +".length > len) len = "+ func.inputs[i].name +".length;\n";
                    }
                }
                code += "    factory.gasLimit = factory.gasLimit * len;\n";
            }

            code += "    return factory.sendTx(txData);\n";
        }
        //call tx
        else {
            code += "    return factory.callTx('"+ func.name +"', factory.instance."+ func.name +".getData(";
            for(let i=0; i<func.inputs.length; i++) {
                if(i==func.inputs.length-1) {
                    code += func.inputs[i].name;
                } else {
                    code += func.inputs[i].name + ", ";
                }
            }
            code += "));\n";
        }

        code += "};";

        return code;
    }
}

