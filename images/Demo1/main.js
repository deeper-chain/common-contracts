const axios = require('axios')
const ip = require('ip')
async function main () {
  console.log(`!!!new version!!!`)
  
  console.log(`process.argv:`, process.argv)
  let url = process.argv[2]
  if (!url?.startsWith('http')) {
    throw new Error('url argument required')
  }
  let resp = await axios.get(url, { params: { test: 2,ip:ip.address() } })
  console.log(`resp.data:`, resp.data)
}


main().catch(e => {
  console.error(`e:`, e)
  process.exit(1)
})
