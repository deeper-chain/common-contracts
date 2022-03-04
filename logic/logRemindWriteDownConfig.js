const config = require('../config')
module.exports=(c)=>{
  console.log('!!! Remember to write down configs below to `deployed` field of',`${config.configPreset.product}.${config.configPreset.env}.${config.configPreset.deploy}`)
  console.log(c)
}
