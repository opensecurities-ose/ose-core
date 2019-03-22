const router = require('koa-router')()
var ApiService = require('../services/ApiService')
var config = require('../config')

router.prefix('/api')
router.post('/verifySign', async (ctx, next) => {
    let account = ctx.request.body.account;
    let msg = ctx.request.body.msg;
    let signature = ctx.request.body.signature;
    let data = ApiService.verifySign(account, msg, signature);
    ctx.body = data;
})

router.post('/verifyPersonalSign', async (ctx, next) => {
    let account = ctx.request.body.account;
    let msg = ctx.request.body.msg;
    let signature = ctx.request.body.signature;
    let data = ApiService.verifyPersonalSign(account, msg, signature);
    ctx.body = data;
})

router.post('/verifySignTypedData', async (ctx, next) => {
    let account = ctx.request.body.account;
    let msg = ctx.request.body.msg;
    let signature = ctx.request.body.signature;
    let data = ApiService.verifySignTypedData(account, msg, signature);
    ctx.body = data;
})

router.get('/getTransactionReceiptLogs', async (ctx, next) => {
    let name = ctx.request.query.name;
    let tx = ctx.request.query.tx;
    let data = await ApiService.getTransactionReceiptLogs(name, tx);
    ctx.body = data;
})

router.get('/getTransaction', async (ctx, next) => {
    let name = ctx.request.query.name;
    let tx = ctx.request.query.tx;
    let data = ApiService.getTransaction(name, tx);
    ctx.body = data;
})

module.exports = router
