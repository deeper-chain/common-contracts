const config = require('../config')
module.exports=(c)=>{
  console.log('!!!Write down configs below to `deployed` field of',`${config.configPreset.product}.${config.configPreset.env}.${config.configPreset.deploy}`)
  console.log(c)
}
