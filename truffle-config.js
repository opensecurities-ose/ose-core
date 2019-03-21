const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const wallets = require("./data/wallet.data.json");

const infura_apikey = "4e987044d78c44319523b16c7bf0412c";
var ownerkey = wallets[0]['pk'].toLowerCase();
if(ownerkey.substring(0,2)=='0x') {
    ownerkey = ownerkey.substring(2);
}
var privkey = [];
privkey.push(ownerkey);
console.log('privkey:',privkey);

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gas: 6600000
        },
        main: {
            provider: function() {
                return new HDWalletProvider(privkey, "https://mainnet.infura.io/v3/"+infura_apikey)
            },
            gas: 6600000,
            network_id: 1
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(privkey, "https://ropsten.infura.io/v3/"+infura_apikey)
            },
            gas: 6600000,
            network_id: 3
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(privkey, "https://rinkeby.infura.io/v3/"+infura_apikey)
            },
            gas: 6000000,
            network_id: 4
        },
        kovan: {
            provider: function() {
                return new HDWalletProvider(privkey, "https://kovan.infura.io/v3/"+infura_apikey)
            },
            gas: 6000000,
            network_id: 42
        }

    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        },
    },
};
