var DataConfig = require('./data/config.example')

var config = {
    // httpProvider: 'http://localhost:8545'
    // httpProvider:"https://mainnet.infura.io/v3/4e987044d78c44319523b16c7bf0412c"
    httpProvider: "https://ropsten.infura.io/v3/4e987044d78c44319523b16c7bf0412c"
}

if(DataConfig && typeof(DataConfig)=='object') {
    for(let k in DataConfig) {
        config[k] =DataConfig[k];
    }
}


module.exports = config
