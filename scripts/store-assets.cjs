const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:128,height:128},deviceScaleFactor:1});
 await page.setContent('<style>body{margin:0;background:transparent}</style>'+fs.readFileSync(path.join(root,'icons/brand.svg'),'utf8'));await page.screenshot({omitBackground:true,path:path.join(root,'128.png')});
 const dir=path.join(root,'docs/store-assets');fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:440,height:280});
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;width:440px;height:280px;background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;gap:20px}svg{width:112px;height:112px}h1{font-size:25px;line-height:1.3;margin:0}p{font-size:14px;margin:12px 0 0}</style>${fs.readFileSync(path.join(root,'icons/brand.svg'),'utf8')}<div><h1>EDU Prompt<br>教育提示詞</h1><p>數位敘事力期刊</p></div>`);
 await page.screenshot({path:path.join(dir,'promo-440x280.png')});console.log('Generated original educational book icon and 440×280 store tile; no OpenAI logo.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
