import {Store} from './lib/store.js';
import {supportedURL} from './lib/core.js';
const store=new Store();
const ready=(async()=>{
  await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  await chrome.storage.sync.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'}).catch(()=>{});
  await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true});
  return store.init();
})();
let queue=Promise.resolve(), timer;
function serial(task) {const result=queue.then(()=>ready).then(task);queue=result.catch(()=>{});return result;}
function notify() {chrome.runtime.sendMessage({type:'stateChanged',snapshot:store.snapshot()}).catch(()=>{});}
function scheduleSync(delay=650) {
  clearTimeout(timer);
  timer=setTimeout(()=>serial(async()=>{await store.pushSync();notify();}).catch(()=>{}),delay);
}
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='sync'&&(changes.eduHead||Object.keys(changes).some(k=>k.startsWith('edu:')))) {
    serial(async()=>{const before=JSON.stringify(store.state);await store.reconcile();notify();if(JSON.stringify(store.state)!==before||store.syncStatus==='incomplete') scheduleSync(1500);}).catch(()=>{});
  }
});
const pending=new Map();
async function relay(request) {
  if(request.type==='prepareInsert') {
    if(typeof request.text!=='string'||!request.text.trim()||request.text.length>150000) return {status:'invalid-prompt'};
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id||!supportedURL(tab.url)) return {status:'unsupported'};
    try {
      const result=await chrome.tabs.sendMessage(tab.id,{type:'prepareInsert',text:request.text});
      if(result?.status==='prepared') {
        for(const [key,value] of pending) if(value.expires<Date.now()) pending.delete(key);
        pending.set(result.token,{tabId:tab.id,url:tab.url,expires:Date.now()+120000});
      }
      return result||{status:'failed'};
    } catch {return {status:'not-ready'};}
  }
  const entry=pending.get(request.token);pending.delete(request.token);
  if(!entry||entry.expires<Date.now()) return {status:'expired'};
  if(request.type==='cancelInsert') {
    await chrome.tabs.sendMessage(entry.tabId,{type:'cancelInsert',token:request.token}).catch(()=>{});
    return {status:'cancelled'};
  }
  const tab=await chrome.tabs.get(entry.tabId).catch(()=>null);
  if(!tab||tab.url!==entry.url||!supportedURL(tab.url)) return {status:'changed'};
  try {return await chrome.tabs.sendMessage(entry.tabId,{type:'commitInsert',token:request.token})||{status:'failed'};}
  catch {return {status:'not-ready'};}
}
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
  if(sender.id!==chrome.runtime.id) return false;
  const fromPanel=sender.url===chrome.runtime.getURL('sidepanel.html');
  if(!fromPanel) return false;
  if(['prepareInsert','commitInsert','cancelInsert'].includes(request?.type)) {
    relay(request).then(sendResponse).catch(()=>sendResponse({status:'failed'}));return true;
  }
  serial(async()=>{
    if(request.type==='getState') return store.snapshot();
    if(request.type==='retrySync') {await store.pushSync();notify();return store.snapshot();}
    const result=await store.mutate(request);scheduleSync();notify();return result;
  }).then(sendResponse).catch(error=>sendResponse({error:error.message||'storage-failed'}));
  return true;
});
