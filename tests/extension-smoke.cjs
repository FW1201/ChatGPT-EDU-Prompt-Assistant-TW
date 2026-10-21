const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const root=process.env.EXTENSION_ROOT||path.resolve(__dirname,'..');
const executablePath=process.env.EXTENSION_CHROME_PATH||path.join(os.homedir(),'Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'edu-extension-'));
 const context=await chromium.launchPersistentContext(profile,{executablePath,headless:true,args:[`--disable-extensions-except=${root}`,`--load-extension=${root}`]});
 try{
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const id=new URL(worker.url()).host;
  const panel=await context.newPage(),errors=[];panel.on('pageerror',e=>errors.push(e.message));
  await panel.goto(`chrome-extension://${id}/sidepanel.html`);
  await panel.waitForFunction(()=>document.querySelector('#search')&&!document.querySelector('#search').disabled).catch(async e=>{console.log('EXTENSION PAGE',panel.url(),await panel.locator('body').innerText(),errors,await panel.evaluate(()=>chrome.runtime.sendMessage({type:'getState'})));throw e});
  assert.equal(await panel.locator('header h1').textContent(),'ChatGPT EDU Prompt');
  const chat=await context.newPage();
  await context.route('https://chatgpt.com/**',r=>r.fulfill({contentType:'text/html',body:'<main><div data-composer-input><div role="textbox" contenteditable="true" data-composer-markdown><p><br></p></div></div></main>'}));
  await chat.goto('https://chatgpt.com/');await chat.bringToFront();
  // Real MV3 messaging, storage and content-script registration; only host document is synthetic.
  const request=m=>panel.evaluate(m=>chrome.runtime.sendMessage(m),m);
  let prepared=await request({type:'prepareInsert',text:'實際擴充功能訊息\n第二行 <b>純文字</b>'});
  assert.equal(prepared.status,'prepared');
  assert.equal((await request({type:'commitInsert',token:prepared.token})).status,'success');
  assert.match(await chat.locator('[contenteditable]').innerText(),/實際擴充功能訊息/);assert.equal(await chat.locator('b').count(),0);
  prepared=await request({type:'prepareInsert',text:'新內容'});assert.equal(prepared.hasDraft,true);
  await chat.locator('[contenteditable]').fill('保留草稿');
  assert.equal((await request({type:'commitInsert',token:prepared.token})).status,'changed');
  assert.equal(await chat.locator('[contenteditable]').innerText(),'保留草稿');
  await request({type:'savePrompt',name:'實測自訂',text:'說明[概念]'});
  await panel.reload();await panel.waitForFunction(()=>!document.querySelector('#search').disabled);await panel.locator('#category').selectOption('custom');assert.equal(await panel.locator('.prompt-name').textContent(),'實測自訂');
  const state=await worker.evaluate(()=>chrome.storage.local.get(['eduState']));assert.ok(Object.keys(state.eduState.records).some(k=>k.startsWith('custom:')));
  assert.deepEqual(errors,[]);console.log('PASS real unpacked MV3 load, CSP/modules, service worker, local storage reload, content-script registration, panel→worker→composer insertion, draft guard. Synthetic ChatGPT document; no signed-in remote conversation or cross-device sync claim.');
 }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
