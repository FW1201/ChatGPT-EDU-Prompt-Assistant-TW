const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:128,height:128},deviceScaleFactor:1});
 const logo='data:image/png;base64,'+fs.readFileSync(path.join(root,'icons/logo-source.png')).toString('base64');
 // Preserve the supplied artwork. Only rasterize scaled copies on transparent canvases.
 for(const size of [16,32,48,128]){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:transparent}body{display:grid;place-items:center}img{display:block;width:75%;height:75%;object-fit:contain}</style><img src="${logo}" alt="">`);
  await page.locator('img').evaluate(img=>img.decode());
  const output=size===128?'128.png':`icons/icon${size}.png`;
  await page.screenshot({omitBackground:true,path:path.join(root,output)});
 }
 const dir=path.join(root,'docs/store-assets');fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:440,height:280});
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;width:440px;height:280px;background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;gap:24px}img{width:136px;height:136px;object-fit:contain}h1{font-size:25px;line-height:1.3;margin:0}p{font-size:14px;margin:12px 0 0}</style><img src="${logo}" alt=""><div><h1>EDU Prompt<br>教育提示詞</h1><p>數位敘事力期刊</p></div>`);
 await page.locator('img').evaluate(img=>img.decode());
 await page.screenshot({path:path.join(dir,'promo-440x280.png')});console.log('Generated 16/32/48/128 PNG icons (96px artwork + 16px padding at 128px) and 440×280 store tile from the supplied logo.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
