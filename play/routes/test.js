const router = require('koa-router')()
var TestService = require('../services/TestService')
var config = require('../config')

router.prefix('/test')

router.get('/', async (ctx, next) => {
    await ctx.render('test', {
        httpProvider: config.httpProvider,
        title: 'Test web3!'
    })
})

module.exports = router
