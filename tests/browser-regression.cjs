const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const harness=`<script type="module">
import {Store} from '/lib/store.js';
const data={},listeners=[];const area={async get(keys){return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]]));},async set(v){Object.assign(data,structuredClone(v));},async remove(){}};
const store=new Store({storage:{local:area,sync:{async get(){return {};},async set(){},async remove(){}}}});await store.init();
window.fixture={store,insertStatus:'prepared',sent:[],hasDraft:false};
window.chrome={runtime:{onMessage:{addListener(fn){listeners.push(fn);}},async sendMessage(m){
 if(m.type==='getState')return store.snapshot();
 if(m.type==='prepareInsert'){fixture.sent.push(m.text);return {status:fixture.insertStatus,token:'test',hasDraft:fixture.hasDraft};}
 if(m.type==='commitInsert')return {status:'success'};
 if(m.type==='cancelInsert')return {status:'cancelled'};
 if(m.type==='retrySync'){await store.pushSync();return store.snapshot();}
 return store.mutate(m);
}}};
await import('/sidepanel.js');
</script>`;
const server=http.createServer((req,res)=>{try{let f=path.join(root,new URL(req.url,'http://localhost').pathname);let body=fs.readFileSync(f);if(f.endsWith('sidepanel.html'))body=Buffer.from(body.toString().replace('<script type="module" src="sidepanel.js"></script>',harness));res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(body);}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const url=`http://127.0.0.1:${server.address().port}/sidepanel.html`;
try{
await page.goto(url);await page.locator('#search').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('#search').disabled);assert.ok(await page.locator('.prompt-card').count()>0);assert.equal(await page.locator('#quick-nav').count(),0);assert.equal(await page.locator('header h1').innerText(),'ChatGPT EDU Prompt');assert.equal(await page.locator('.credit a').getAttribute('href'),'https://www.facebook.com/Journal.of.Digital.Narrative/');assert.equal(await page.locator('footer>*').count(),1);await page.locator('#library-help').click();await page.locator('#help-dialog').waitFor({state:'visible'});await page.locator('#help-close').click();
await page.locator('#search').fill('課程');assert.ok(await page.locator('.prompt-card').count()>0);await page.locator('#search').fill('');
await page.locator('.prompt-card .icon').first().click();await page.locator('#category').selectOption('favorites');assert.equal(await page.locator('.prompt-card').count(),1);await page.locator('#category').selectOption('all');
async function checkDesign() {
const result=await page.evaluate(()=>{
  const root=getComputedStyle(document.documentElement);
  const luminance=hex=>{const v=hex.trim().replace('#','');const c=(v.length===3?[...v].map(x=>x+x).join(''):v).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const ratio=(a,b)=>{const x=luminance(root.getPropertyValue(a)),y=luminance(root.getPropertyValue(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const palette=['--bg','--text','--line','--button','--button-text','--focus'].map(k=>root.getPropertyValue(k).trim());
  const sizes=[...document.querySelectorAll('.prompt-name,#category,#count,footer small')].map(e=>getComputedStyle(e).fontSize);
  const nav=[...document.querySelectorAll('.filter-row>*')].map(e=>e.getBoundingClientRect());
  const icons=[...document.querySelectorAll('svg.ui-icon')];
  return {palette,sizes,ratios:{text:ratio('--text','--bg'),primary:ratio('--button-text','--button'),border:ratio('--line','--bg')},navAligned:nav.every(r=>r.top===nav[0].top&&r.height>=44),iconsReady:icons.length>3&&icons.every(e=>e.querySelector('path')),smallTargets:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).some(e=>e.getBoundingClientRect().height<44)};
});
assert.ok(result.palette.every(c=>['#000','#fff'].includes(c)),JSON.stringify(result.palette));assert.ok(result.sizes.every(x=>x==='16px'),JSON.stringify(result));assert.ok(result.navAligned);assert.ok(result.iconsReady);assert.equal(result.smallTargets,false);for(const [name,r] of Object.entries(result.ratios))assert.ok(r>=(name==='border'?3:4.5),name+': '+r);console.log('PASS design',JSON.stringify(result.ratios));
}
await checkDesign();
await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/library-light.png')});
await page.locator('.prompt-open').first().click();await page.locator('#fill-form textarea:not([readonly])').first().fill('國中八年級');await page.locator('#fill-form textarea:not([readonly])').first().press('Enter');assert.equal(await page.evaluate(()=>fixture.sent.length),0);assert.match(await page.locator('#prompt-preview').inputValue(),/國中八年級/);
await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/prompt-light.png')});
await page.locator('#fill-form textarea:not([readonly])').first().press('Control+Enter');assert.equal(await page.evaluate(()=>fixture.sent.length),0);assert.match(page.url(),/sidepanel.html$/);
await page.evaluate(()=>{window.savedClipboard=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('denied')};});
await page.getByRole('button',{name:'複製提示詞',exact:true}).click();await page.locator('#feedback textarea').waitFor({state:'visible'});assert.match(await page.locator('#feedback textarea').inputValue(),/國中八年級/);assert.ok(await page.evaluate(()=>Object.values(fixture.store.meta.lastValues||{}).length>0));await page.evaluate(()=>navigator.clipboard.writeText=window.savedClipboard);
assert.equal(await page.locator('.view-actions button').count(),2);assert.equal(await page.getByRole('button',{name:'插入 ChatGPT',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'清除本則填寫紀錄',exact:true}).count(),0);
await page.locator('.view-actions .icon').first().click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已插入'));assert.equal(await page.evaluate(()=>fixture.sent.length),1);
await page.evaluate(()=>fixture.hasDraft=true);await page.locator('.view-actions .icon').first().click();await page.locator('#confirm-cancel').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已取消'));
await page.locator('.view-actions .icon').first().click();await page.locator('#confirm-ok').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已插入'));
await page.evaluate(()=>fixture.insertStatus='not-found');await page.locator('.view-actions .icon').first().click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('找不到可用'));
await page.locator('#language').click();assert.match(await page.locator('#prompt-preview').inputValue(),/國中八年級/);await page.locator('#language').click();
await page.locator('.back').click();await page.locator('#category').selectOption('custom');await page.locator('#guidance button').click();await page.locator('#custom-name').fill('Regression test');await page.locator('#custom-text').fill('請解釋[概念]');await page.locator('#edit-form .primary').click();assert.equal(await page.locator('.prompt-card').count(),1);
await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/custom-light.png')});await page.locator('.prompt-card .actions button').nth(1).click();await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/edit-light.png')});await page.locator('#custom-name').fill('Edited');await page.locator('#edit-form .primary').click();assert.match(await page.locator('.prompt-name').innerText(),/Edited/);
await page.locator('#settings').click();await page.locator('input[name=grade]').fill('八年級');await page.locator('#theme').selectOption('dark');await page.locator('#view form .primary').click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');assert.equal(await page.locator('#theme').inputValue(),'dark');assert.equal(await page.locator('#migration-list').count(),0);assert.ok(await page.locator('#view form .primary').isVisible());await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/settings-dark.png')});
await page.locator('.back').click();await page.locator('#category').selectOption('all');await checkDesign();await page.screenshot({animations:'disabled',path:path.join(root,'docs/screenshots/library-dark.png')});
for(const size of [{width:300,height:700},{width:375,height:812},{width:812,height:375},{width:640,height:900}]){await page.setViewportSize(size);for(const scale of [14,22]){await page.evaluate(s=>document.documentElement.style.fontSize=s+'px',scale);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth),JSON.stringify(size));}}
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#language').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='');
// Exercise backups through the UI without touching any personal browser storage.
await page.locator('#settings').click();
const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'匯出備份',exact:true}).click();const downloaded=await downloadPromise;const backup=JSON.parse(fs.readFileSync(await downloaded.path(),'utf8'));assert.equal(backup.app,'chatgpt-edu-tw');assert.ok(Object.keys(backup.records).some(k=>k.startsWith('custom:')));
await page.locator('#backup-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('匯入完成'));
const beforeInvalid=await page.evaluate(()=>JSON.stringify(fixture.store.state));await page.locator('#backup-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"invalid":true}')});await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('備份無效'));assert.equal(await page.evaluate(()=>JSON.stringify(fixture.store.state)),beforeInvalid);
await page.getByRole('button',{name:'重試同步',exact:true}).click();await page.getByRole('button',{name:'清除所有填寫紀錄',exact:true}).click();await page.locator('#confirm-cancel').click();await page.getByRole('button',{name:'清除所有填寫紀錄',exact:true}).click();await page.locator('#confirm-ok').click();await page.waitForFunction(()=>Object.keys(fixture.store.meta.lastValues||{}).length===0);
await page.locator('.back').click();await page.locator('#category').selectOption('custom');await page.getByRole('button',{name:'刪除',exact:true}).click();await page.locator('#confirm-cancel').click();assert.equal(await page.locator('.prompt-card').count(),1);await page.getByRole('button',{name:'刪除',exact:true}).click();await page.locator('#confirm-ok').click();await page.waitForFunction(()=>document.querySelectorAll('.prompt-card').length===0);
await page.locator('#category').selectOption('all');
console.log('PASS: export, valid/invalid import, retry sync UI, clear entries cancel/confirm, custom delete cancel/confirm in isolated fixture.');
// Render all bilingual forms, checking field/preview wiring and missing resources.
const ids=process.env.QUICK?[]:JSON.parse(fs.readFileSync(path.join(root,'prompts/zh.json'))).map(p=>p.id);for(const lang of ['zh','en']){if(lang==='en')await page.locator('#language').click();for(const id of ids){await page.locator('.back').count().then(async n=>{if(n)await page.locator('.back').click()});await page.locator('#category').selectOption('all');await page.locator('[data-prompt-id="'+id+'"] .prompt-open').click();await page.evaluate(()=>{for(const input of document.querySelectorAll('#fill-form [name]')){input.value=input.tagName==='SELECT'?'option:0':'測試資料 '+input.name;input.dispatchEvent(new Event('input',{bubbles:true}));}});const preview=await page.locator('#prompt-preview').inputValue();assert.ok(preview.length>0);assert.ok(!/\[[^\]\n]+\]/.test(preview),id+' unfilled preview');}}
console.log('PASS: '+(ids.length*2)+' bilingual forms; search, favorites, custom create/edit, draft confirmation/cancel, language preservation, settings, themes, responsive and reduced motion.');
// Store screenshots use the actual UI with fixture data; never use a personal account screenshot.
if(await page.locator('.back').count())await page.locator('.back').click();
if(await page.locator('#language span').textContent()==='中')await page.locator('#language').click();
await page.locator('#settings').click();await page.locator('#theme').selectOption('light');await page.locator('#view form .primary').click();await page.locator('.back').click();
await page.setViewportSize({width:640,height:400});await page.locator('#category').selectOption('teaching');
fs.mkdirSync(path.join(root,'docs/store-assets'),{recursive:true});
await page.screenshot({animations:'disabled',path:path.join(root,'docs/store-assets/screenshot-library-640x400.png')});
await page.locator('#category').selectOption('learning');await page.locator('[data-prompt-id="learning-03"] .prompt-open').click();
await page.locator('#fill-form textarea:not([readonly])').first().fill('校園閱讀環境與自主學習');
await page.screenshot({animations:'disabled',path:path.join(root,'docs/store-assets/screenshot-prompt-640x400.png')});
// Execute production content script against current composer structure and legacy editors.
await page.route('https://chatgpt.com/**',r=>r.fulfill({contentType:'text/html',body:'<main><div data-composer-input><div role="textbox" contenteditable="true" data-composer-markdown><p><br></p></div></div><input id="search"></main>'}));
await page.goto('https://chatgpt.com/');await page.evaluate(()=>{window.chrome={runtime:{id:'test',onMessage:{addListener(fn){window.handler=fn;}},async sendMessage(){return {status:'ignored'};}}};window.message=m=>new Promise(r=>window.handler(m,{id:'test'},r));});await page.addScriptTag({path:path.join(root,'content.js')});
const prepare=()=>page.evaluate(()=>message({type:'prepareInsert',text:'第一行\n第二行 <b>純文字</b>'}));let result=await prepare();assert.equal(result.status,'prepared');let committed=await page.evaluate(token=>message({type:'commitInsert',token}),result.token);if(committed.status!=='success')console.log('COMPOSER DEBUG',await page.locator('[contenteditable]').evaluate(e=>({text:e.innerText,html:e.innerHTML})));assert.equal(committed.status,'success');assert.equal(await page.locator('[contenteditable]').textContent(),'第一行第二行 <b>純文字</b>');assert.equal(await page.locator('b').count(),0);
result=await prepare();await page.locator('[contenteditable]').fill('changed draft');assert.equal((await page.evaluate(token=>message({type:'commitInsert',token}),result.token)).status,'changed');
await page.evaluate(()=>{document.querySelector('[data-composer-input]').setAttribute('role','dialog')});assert.equal((await prepare()).status,'not-found');
await page.evaluate(()=>{document.querySelector('[data-composer-input]').remove();document.body.insertAdjacentHTML('beforeend','<textarea id="prompt-textarea"></textarea>');});result=await prepare();assert.equal(result.status,'prepared');assert.equal((await page.evaluate(token=>message({type:'commitInsert',token}),result.token)).status,'success');
assert.deepEqual(errors,[]);console.log('PASS: production content.js modern composer, multiline plain text, HTML safety, changed-draft guard, dialog exclusion, legacy textarea; zero page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
