const router = require('koa-router')()
var config = require('../config')

router.prefix('/dashboard')

router.get('/', async (ctx, next) => {
    await ctx.render('dashboard', {
        httpProvider: config.httpProvider,
        title: 'Test web3!'
    })
})

module.exports = router
