const puppeteer = require('C:/Users/Dell/Documents/temp-video-builder/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/Dell/Documents/clearsky-ai/reel_shots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 540 x 960 with scale 2 = 1080 x 1920 exact 9:16 Instagram Reel resolution!
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
  
  console.log('Loading ClearSky AI...');
  await page.goto('https://clearsky-ai-theta.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Dashboard top
  await page.screenshot({ path: path.join(outDir, '01_dashboard_top.png') });
  console.log('Saved 01_dashboard_top.png');

  // 1b. Dashboard scroll down
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '02_dashboard_pollutants.png') });
  console.log('Saved 02_dashboard_pollutants.png');

  // Reset scroll
  await page.evaluate(() => window.scrollTo(0, 0));

  // 2. Click Reels tab
  console.log('Navigating to Reels...');
  const clickedReels = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const btn = buttons.find(b => b.textContent.includes('Reels'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked Reels button:', clickedReels);
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '03_reels_view.png') });
  console.log('Saved 03_reels_view.png');

  // 3. Click AI Chat
  console.log('Navigating to AI Chat...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const btn = buttons.find(b => b.textContent.includes('AI Chat'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '04_ai_assistant.png') });
  console.log('Saved 04_ai_assistant.png');

  // 4. Click Indoor
  console.log('Navigating to Indoor...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const btn = buttons.find(b => b.textContent.includes('Indoor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '05_indoor_purifiers.png') });
  console.log('Saved 05_indoor_purifiers.png');

  // 5. Click Map
  console.log('Navigating to Map...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const btn = buttons.find(b => b.textContent.includes('Map'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '06_map_view.png') });
  console.log('Saved 06_map_view.png');

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch(e => {
  console.error('Capture failed:', e);
  process.exit(1);
});
