const { google } = require('googleapis');
const path = require('path');
const fs = require('fs')
const { authenticate } = require('@google-cloud/local-auth');

// initialize the Youtube API library
const youtube = google.youtube('v3');

// a very simple example of searching for youtube videos
async function runSample () {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, './oauth2.keys.json'),
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });
  let {token}=await auth.getAccessToken()
  await fs.promises.writeFile(path.join(__dirname, './tokens.json'), JSON.stringify(auth.credentials))
  google.options({ auth });
  
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud',
  });
  console.log(res.data);
}

if (module === require.main) {
  runSample().catch(console.error);
}
module.exports = runSample;
