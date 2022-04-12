const axios = require('axios')

const puppeteer = require('puppeteer')
const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

const main = async () => {
  let url = process.argv[2]
  if (!(url && url.startsWith('http'))) {
    throw new Error('url argument required')
  }
  let id = Math.random().toString(16).substring(2, 10)
  console.log(`id:`, id)
  let delay
  if (Math.random() < 0.001) {
    delay = Math.floor(Math.random() * 24 * 1000)
    console.log(`delay:`, delay)
    let resp=await axios.get(url, { params: { program: 'vote', id, delay } })
    if(resp.data.status.ok){
      console.log(`'skip':`, 'ip is used')
      return
    }
  } else {
    console.log(`'skip':`, 'skip')
    await axios.get(url, { params: { program: 'vote', id, skip: 1 } })
    return
  }
  await sleep(delay)
  try {
    
    const browser = await puppeteer.launch({
      executablePath: 'google-chrome-unstable',
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto('https://decoded.polkadot.network/vote/?search=deeper', { waitUntil: 'domcontentloaded' })
    await sleep(5000)
    
    await page.screenshot({ path: '1.png', fullPage: true })
    
    const els = await page.$$('input[type=checkbox]')
    if (els.length !== 2) {
      throw new Error('checkbox')
    }
    
    await Promise.all(els.map(e => e.click()))
    await page.screenshot({ path: '2.png', fullPage: true })
    let btns = await page.$x('//button[contains(., \'Finalize vote\')]')
    if (btns.length !== 1) {
      throw new Error('Finalize vote')
    }
    await btns[0].click()
    
    await sleep(3000)
    await page.screenshot({ path: '3.png', fullPage: true })
    btns = await page.$x('//button[contains(., \'Vote now\')]')
    if (btns.length !== 1) {
      throw new Error('Vote now')
    }
    await btns[0].click()
    
    await sleep(1000)
    await page.screenshot({ path: '4.png', fullPage: true })
    
    btns = await page.$x('//button[contains(., \'Submit\')]')
    if (btns.length !== 1) {
      throw new Error('Submit')
    }
    await btns[0].click()
    
    await sleep(8000)
    await page.screenshot({ path: '5.png', fullPage: true })
    let hints = await page.$x('//h1[text()="Thanks for voting!"]')
    if (hints.length === 0) {
      throw new Error('Thanks for voting')
    }
    console.log('OK')
    browser.close()
    await axios.get(url, { params: { program: 'vote', id, ok: 1 } })
  } catch (e) {
    await axios.get(url, { params: { program: 'vote', id, error: e.message } })
    throw e
  }
}

main()

