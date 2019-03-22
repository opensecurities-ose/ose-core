if(!checkWeb3Plugin()) {
    alert('Make sure MetaMask ready');
}

var config = {
    contract: contractDev
};

getEthNetWork().then(res=> {
    if(res==1) {
        alert('Main is not supported');
        return;
    } else if(res==3) {
        config.contract = contractRopsten;
        console.log('Ropsten:',config.contract);
    } else if(res==4) {
        alert('Rinkeby is not supported');
        return;
    } else if(res==42) {
        alert('Kovan is not supported');
        return;
    }
}).catch(err=> {
    console.err('getEthNetWork:', err);
});

