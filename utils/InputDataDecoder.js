const ethabi = require('ethereumjs-abi')
const ethers = require('ethers')

class InputDataDecoder {
    constructor(abi) {
        this.abi = abi;
    }

    decodeConstructor(data) {
        if (Buffer.isBuffer(data)) {
            data = data.toString('utf8')
        }

        if (typeof data !== `string`) {
            data = ``
        }

        data = data.trim()

        for (var i = 0; i < this.abi.length; i++) {
            const obj = this.abi[i]
            if (obj.type !== 'constructor') {
                continue
            }

            const name = obj.name || null
            const _types = obj.inputs ? obj.inputs.map(x => x.type) : []
            const params = obj.inputs ? obj.inputs.map(x => x.name) : []

            // take last 32 bytes
            data = data.slice(-256)

            if (data.length !== 256) {
                throw new Error('fail')
            }

            if (data.indexOf(`0x`) !== 0) {
                data = `0x${data}`
            }

            const inputs = ethers.Interface.decodeParams(_types, data)

            let args ={};
            for(let i=0; i<params.length; i++) {
                args[params[i]] = inputs[i];
            }

            let types ={};
            for(let i=0; i<params.length; i++) {
                types[params[i]] = _types[i];
            }
            return {
                name,
                types,
                args
            }
        }

        throw new Error('not found')
    }

    decodeData(data) {
        if (Buffer.isBuffer(data)) {
            data = data.toString('utf8')
        }

        if (typeof data !== `string`) {
            data = ``
        }

        data = data.trim()

        const dataBuf = new Buffer(data.replace(/^0x/, ``), `hex`)
        const methodId = dataBuf.slice(0, 4).toString(`hex`)
        var inputsBuf = dataBuf.slice(4)

        const result = this.abi.reduce((acc, obj) => {
            if (obj.type === 'constructor') return acc
            // console.debug('inputs:',obj.inputs);
            const name = obj.name || null
            const _types = obj.inputs ? obj.inputs.map(x => x.type) : []
            const params = obj.inputs ? obj.inputs.map(x => x.name) : []
            const hash = ethabi.methodID(name, _types).toString(`hex`)

            if (hash === methodId) {
                // https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
                if (methodId === 'a9059cbb') {
                    inputsBuf = Buffer.concat([new Buffer(12), inputsBuf.slice(12,32), inputsBuf.slice(32)])
                }

                const inputs = ethabi.rawDecode(_types, inputsBuf)
                if (inputs) {
                    console.log('inputs:', inputs);
                    this.parseInputs(inputs, _types);
                }

                let args ={};
                for(let i=0; i<params.length; i++) {
                    args[params[i]] = inputs[i];
                }

                let types ={};
                for(let i=0; i<params.length; i++) {
                    types[params[i]] = _types[i];
                }

                return {
                    name,
                    types,
                    args
                }
            }

            return acc
        }, {data})

        if (!result.name) {
            try {
                const decoded = this.decodeConstructor(data)
                if (decoded) {
                    return decoded
                }
            } catch(err) { console.log(err)}
        }

        return result
    }

    parseInputs(inputs, params) {
        for(let i=0; i< inputs.length; i++) {
            if(Array.isArray(inputs[i])) {
                let _params = [];
                for(let j=0; j<inputs[i].length; j++) {
                    let _param = params[i].replace('[]','');
                    _params.push(_param);
                }
                this.parseInputs(inputs[i], _params);
            } else if(params[i] =='address') {
                inputs[i] = '0x' + inputs[i];
            } else if(inputs[i] instanceof Object && Buffer.isBuffer(inputs[i])) {
                inputs[i] = '0x' + inputs[i].toString('hex');
            } else if(inputs[i] instanceof Object && params[i].substring(0,4) =='uint') {
                let bn = new ethers.utils.BigNumber('0x'+ inputs[i].toString('hex'));
                inputs[i] = bn.toString();
            }
        }
    }
}

module.exports = InputDataDecoder
