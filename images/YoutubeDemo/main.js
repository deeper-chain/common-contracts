const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')
// initialize the Youtube API library
const youtube = google.youtube('v3')

// a very simple example of searching for youtube videos
async function runSample () {
  let oauth2Keys = JSON.parse(await fs.promises.readFile(path.join(__dirname, './oauth2.keys.json')))
  let { web } = oauth2Keys
  const auth = new google.auth.OAuth2({
    clientId: web.client_id,
    clientSecret: web.client_secret,
    redirectUri: web.redirect_uris[0]
  })
  let credentials = JSON.parse(await fs.promises.readFile(path.join(__dirname, './tokens.json')))
  auth.setCredentials(credentials)
  google.options({ auth })
  
  const res = await youtube.videos.rate({
    "id": "V2yyW_4G7Y8",
    "rating": "dislike"
  })
  console.log(res.status,res.data)
}

if (module === require.main) {
  runSample().catch(console.error)
}
module.exports = runSample
