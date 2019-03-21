const DeployContract = require("./common/deployContract");
const Log = require('../utils/LogConsole');
const ETH_ADDR = 0x0;
contract('Contract ExchangeCore:', async (accounts) => {
    var owner = accounts[0];
    var relayer = accounts[1];

    var maker = accounts[2];
    var taker = accounts[3];
    var Exchange, ERC20;

    before(async () => {
        let instances = await DeployContract.deploy(owner);
        Exchange = instances.iDExchange;
        ERC20 = instances.iERC20Token;

        let balance = await ERC20.balanceOf.call(owner);
        Log.info("owner balance:", web3.fromWei(balance.valueOf()));

        //set relayer
        let result = await Exchange.setRelayer(relayer, true, {from: owner})
        assert.equal(result.receipt.status, 1, " setRelayer failed!")
        Log.info("set relayer success.")

    });

    var makerETH = 10, takerToken = 10000, makerToken = 0, takerETH = 0;

    function printBalance() {
        Log.info({makerETH: makerETH, makerToken: makerToken, takerETH: takerETH, takerToken: takerToken})
    }

    it("deposit eth", async () => {
        await Exchange.depositETH({value: web3.toWei(makerETH, "ether"), from: maker})
        let balance = await Exchange.userTokens(maker, 0)
        assert.equal(web3.fromWei(balance.valueOf()), makerETH, "maker deposit " + makerETH + " ether failed!")
    })
    it("deposit token", async () => {
        await ERC20.transfer(taker, web3.toWei(takerToken, "ether"), {from: owner})
        await ERC20.approve(Exchange.address, web3.toWei(1000000000000, "ether"), {from: taker})

        let balance = await ERC20.allowance(taker, Exchange.address)
        assert.equal(web3.fromWei(balance.valueOf()), 1000000000000, "approve failed")

        await Exchange.depositToken(ERC20.address, web3.toWei(takerToken, "ether"), {from: taker});
        balance = await Exchange.userTokens(taker, ERC20.address);
        assert.equal(web3.fromWei(balance.valueOf()), takerToken, "taker deposit " + takerToken + " token failed!")
        printBalance();
    })
    it("withdraw ETH", async () => {
        let withdrawAmount = 0.1;
        let result = await Exchange.withdraw(ETH_ADDR, web3.toWei(withdrawAmount), {from: maker});
        assert.equal(result.receipt.status, 1, "send first withdraw failed!");
        let allowed = await Exchange.withdrawAllowed(maker, ETH_ADDR);
        assert.equal(web3.fromWei(allowed.valueOf()), withdrawAmount, "withdraw not allowed.");
        //set wait block=1
        result = await Exchange.modifyWithdrawBlock(1, {from: owner});
        assert.equal(result.receipt.status, 1, "modify with block failed!");
        //withdraw again
        result = await Exchange.withdraw(ETH_ADDR, web3.toWei(withdrawAmount), {from: maker});
        assert.equal(result.receipt.status, 1, "send second withdraw failed!");
        balance = await Exchange.userTokens(maker, ETH_ADDR);
        makerETH = makerETH - withdrawAmount;
        assert.equal(web3.fromWei(balance.valueOf()), makerETH, "withdraw balance error.");
        printBalance();
    })

    it("withdraw Token", async () => {
        let withdrawAmount = 1;
        let result = await Exchange.withdraw(ERC20.address, web3.toWei(withdrawAmount), {from: taker});
        assert.equal(result.receipt.status, 1, "send first withdraw failed!");
        let allowed = await Exchange.withdrawAllowed(taker, ERC20.address);
        assert.equal(web3.fromWei(allowed.valueOf()), withdrawAmount, "withdraw not allowed.");
        //set wait block=1
        result = await Exchange.modifyWithdrawBlock(1, {from: owner});
        assert.equal(result.receipt.status, 1, "modify with block failed!");
        //withdraw again
        result = await Exchange.withdraw(ERC20.address, web3.toWei(withdrawAmount), {from: taker});
        assert.equal(result.receipt.status, 1, "send second withdraw failed!");
        balance = await Exchange.userTokens(taker, ERC20.address);
        takerToken = takerToken - withdrawAmount;
        assert.equal(web3.fromWei(balance.valueOf()), takerToken, "withdraw balance error.");
        printBalance()
    })
    it("set relayer", async () => {
        let result = await Exchange.setRelayer(relayer, true, {from: owner});
        assert.equal(result.receipt.status, 1, "call setRelayer failed!");
        let isRelayer = await Exchange.relayers(relayer);
        assert.equal(isRelayer, true, "set relayer failed.")

    })
    it("register token", async () => {
        let result = await Exchange.registerToken(ETH_ADDR, ERC20.address, {from: owner});
        assert.equal(result.receipt.status, 1, "call registerToken failed.");
        let isReg = await Exchange.tokenRegistered(ETH_ADDR, ERC20.address);
        assert.equal(isReg, true, "register token failed.")
    })


    describe("test match orders", () => {
        it("match equal", async () => {
            var sellToken = 1, buyETH = 0.1
            //maker buy 1 token ,sell 0.1 eth
            var makerOrder = await buildOrder(ERC20.address, web3.toWei(sellToken), ETH_ADDR, web3.toWei(buyETH), maker, ETH_ADDR, 0, Date.now(), Exchange);
            //taker buy 0.1eth,sell 1 token
            var takerOrder = await buildOrder(ETH_ADDR, web3.toWei(buyETH), ERC20.address, web3.toWei(sellToken), taker, ETH_ADDR, 0, Date.now(), Exchange);
            var tradeA = web3.toWei("1");
            // Log.info(makerOrder, takerOrder, tradeA);

            var params = toParams(makerOrder, takerOrder, tradeA)
            let result = await Exchange.settleOrder(params[0], params[1], params[2], params[3], {from: relayer});
            assert.equal(result.receipt.status, 1, "fillOrder failed!");

            //adjust balance
            makerETH = makerETH - buyETH;
            takerETH = takerETH + buyETH;
            makerToken = makerToken + sellToken;
            takerToken = takerToken - sellToken;

            let me = await Exchange.userTokens(maker, ETH_ADDR);
            assert.equal(web3.fromWei(me.valueOf()), makerETH, "balance:makerETH error");
            let te = await Exchange.userTokens(taker, ETH_ADDR);
            assert.equal(web3.fromWei(te.valueOf()), takerETH, "balance:takerETH error");
            let mt = await Exchange.userTokens(maker, ERC20.address);
            assert.equal(web3.fromWei(mt.valueOf()), makerToken, "balance:makerToken error");
            let tt = await Exchange.userTokens(taker, ERC20.address);
            assert.equal(web3.fromWei(tt.valueOf()), takerToken, "balance:takerToken error");
            printBalance();
        })

    })

})

async function buildOrder(tokenGet, amountGet, tokenGive, amountGive, user, base, fee, salt, Exchange) {
    var order = {
        tokenGet: tokenGet,
        tokenGive: tokenGive,
        amountGet: amountGet,
        amountGive: amountGive,
        user: user,
        base: base,
        fee: fee,
        salt: salt,
        orderId: 0,
        v: 0,
        r: 0,
        s: 0
    }
    let orderId = await Exchange.generateOrderId(tokenGet, amountGet, tokenGive, amountGive, base, salt);
    var signed = web3.eth.sign(user, orderId);
    // orderSigned = signed.substring(2, signed.length);
    // order.r = "0x" + orderSigned.slice(0, 64);
    // order.s = "0x" + orderSigned.slice(64, 128);
    // order.v = web3.toDecimal(orderSigned.slice(128, 130)) + 27;
    order.orderId = orderId;
    order.sig = signed;
    return order;
}

function toParams(maker, taker, tradeA) {
    var addresses = [
        maker.tokenGet,
        taker.tokenGet,
        maker.tokenGive,
        taker.tokenGive,
        maker.user,
        taker.user,
        maker.base,
        taker.base
    ];
    var values = [
        maker.amountGet,
        taker.amountGet,
        maker.amountGive,
        taker.amountGive,
        maker.fee,
        taker.fee,
        maker.salt,
        taker.salt,
        tradeA
    ];
    var v = [maker.v, taker.v]
    var r = [maker.r, taker.r]
    var s = [maker.s, taker.s]

    // var sigs=[maker.sig,taker.sig]
    // console.log(maker.sig,taker.sig)
    return [addresses, values, maker.sig, taker.sig]
}
