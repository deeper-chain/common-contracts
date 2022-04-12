const fs = require('fs')
const logger = require('koa-logger')
const Koa = require('koa')
const app = new Koa
let info = {}
try {
  info = require('./info.json')
} catch (e) {
  console.log(`e:`, e)
}
let needWrite = true
app.use(async (ctx, next) => {
  let ip = ctx.request.header['x-forwarded-for']
  console.log(ctx.url, ctx.request.header['x-forwarded-for'])
  info[ip] = info[ip] || { logs: [] }
  info[ip].logs.push(ctx.url)
  Object.assign(info[ip], ctx.query)
  needWrite = true
  ctx.body = { request: ctx.url,status:info[ip] }
})
app.listen(8080)
setInterval(() => {
  if (needWrite) {
    needWrite = false
    fs.promises.writeFile('info.json', JSON.stringify(info, null, 2))
  }
}, 5000)

async function main () {

}

main().catch(e => {
  console.error(`e:`, e)
})
