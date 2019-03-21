const router = require('koa-router')()
var config = require('../config')
var BaseService = require('../services/BaseService')

let data = {
    httpProvider: config.httpProvider
}

router.all('*', async (ctx, next) => {
    console.log('baseUrl:', ctx.request.url);
    if('/' == ctx.request.url) {
        ctx.redirect('/dashboard');
    }else if('/api/' == ctx.request.url.substring(0,5)) {
        return next();
    } else {
        await ctx.render(ctx.request.url.substring(1), data)
    }
})

module.exports = router
