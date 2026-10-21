import {fields,fill,defaultValue,matches,setting,userPrompts,favorites,optimize,validateState,choices,displayValue} from './lib/core.js';
import {translator} from './lib/i18n.js';
const $=id=>document.getElementById(id);
let snapshot, categories=[], libraries={}, language='zh',t=translator('zh'),category='all';
let view=null,lastFocus=null,lastPromptId=null,listScroll=0,busy=false;
const drafts=new Map();
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
let iconSymbols;
async function loadIcons() {
  const response=await fetch('icons/icon.svg');if(!response.ok)throw Error('icons');
  iconSymbols=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
}
function svgIcon(name) {
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('ui-icon');
  const symbol=iconSymbols?.getElementById(name);
  if(symbol)for(const child of symbol.children)svg.append(document.importNode(child,true));
  return svg;
}
function decorate(node,name) {node.prepend(svgIcon(name));return node;}
function button(text,action,className='',symbol) {
  const node=el('button',undefined,className);node.type='button';
  const key=symbol||Object.entries({add:'plus',copy:'copy',clearAll:'delete',cancel:'close',export:'download',import:'upload',retry:'refresh',optimize:'edit'}).find(([key])=>text&&text===t(key))?.[1];
  if(key)node.append(svgIcon(key));
  if(text)node.append(el('span',text));
  node.addEventListener('click',()=>Promise.resolve().then(action).catch(()=>status(t('storageFailed'),true)));return node;
}
function icon(name,label,action,pressed) {
  const node=button('',action,'icon',name);node.title=label;node.setAttribute('aria-label',label);
  if(pressed!==undefined)node.setAttribute('aria-pressed',String(pressed));
  return node;
}
async function request(command) {const result=await chrome.runtime.sendMessage(command);if(!result||result.error)throw Error(result?.error||'storage-failed');return result;}
function applySnapshot(next) {
  if(!next?.state)return;
  snapshot=next;language=setting(next.state,'language','zh');t=translator(language);
  document.title=t('title');document.querySelector('header h1').textContent=t('title');
  document.documentElement.lang=language==='zh'?'zh-Hant':'en';
  document.documentElement.dataset.theme=setting(next.state,'theme','system');
  document.querySelectorAll('[data-t]').forEach(node=>node.textContent=t(node.dataset.t));
  $('settings').setAttribute('aria-label',t('settings'));$('settings').title=t('settings');
  $('language').replaceChildren(svgIcon('language'),el('span',language==='zh'?'EN':'中')); $('language').setAttribute('aria-label',t('language'));
  $('search').placeholder=t('searchHint');$('search').setAttribute('aria-label',t('search'));
  $('category').setAttribute('aria-label',t('category'));
  $('library-help').setAttribute('aria-label',t('help'));$('library-help').title=t('help');
  $('help-title').textContent=t('help');$('help-close').setAttribute('aria-label',t('closeHelp'));$('help-close').title=t('closeHelp');
}
async function mutate(command) {const result=await request(command);applySnapshot(result);return result;}
function status(text,error=false,offerCopy=false) {
  $('status').textContent=text;$('status').dataset.error=String(error);
  const feedback=$('feedback');feedback.replaceChildren();feedback.hidden=!error;
  if(error){feedback.append(el('p',text));if(offerCopy&&view?.kind==='prompt')feedback.append(button(t('copy'),()=>copy(rendered(getPrompt(view.id)))));}
}
async function copy(text) {
  try{await navigator.clipboard.writeText(text);status(t('copied'));}
  catch{status(t('copyFailed'),true);const preview=el('textarea');preview.readOnly=true;preview.value=text;preview.setAttribute('aria-label',t('preview'));$('feedback').append(preview);preview.focus();preview.select();}
}
function getPrompt(id) {
  return libraries[language].find(p=>p.id===id)||userPrompts(snapshot.state).find(p=>p.id===id);
}
function descriptors(p) {return p.fields||fields(p.text).map((label,i)=>({id:`f${i+1}`,label}));}
function valuesFor(p) {
  if(drafts.has(p.id))return drafts.get(p.id);
  const stored=snapshot.meta.lastValues?.[p.id]||{},profile=setting(snapshot.state,'profile',{});
  const values=Object.fromEntries(descriptors(p).map(f=>{
    let value=stored[f.id]??defaultValue(f.label,profile);
    if(choices(f.label).length&&value&&!/^option:\d+$/.test(value)){
      const alternatives=[p,...Object.values(libraries).flat().filter(x=>x.id===p.id)];
      const index=alternatives.map(x=>choices(descriptors(x).find(d=>d.id===f.id)?.label||'').indexOf(value)).find(i=>i>=0);
      if(index!==undefined)value=`option:${index}`;
    }
    return [f.id,value];
  }));drafts.set(p.id,values);return values;
}
function rendered(p) {const values=valuesFor(p);return fill(p.text,Object.fromEntries(descriptors(p).map(f=>[f.label,displayValue(f,values[f.id])])));}
function guidance(cat) {
  const box=el('details',undefined,'hint');box.append(el('summary',language==='zh'?'使用方式與注意事項':'How to use this prompt'),el('p',t(`${cat?.tool||'general'}Help`)));
  if(cat){
    box.append(el('p',t('verification'),'muted'));
    const details=el('details'),summary=el('summary',t('source')),links=el('ul',undefined,'source-list');
    for(const url of cat.sources){const item=el('li'),link=el('a',new URL(url).pathname.split('/').filter(Boolean).pop());link.href=url;link.target='_blank';link.rel='noopener noreferrer';item.append(link);links.append(item);}
    details.append(summary,links);box.append(details);
  }
  return box;
}
function openHelp(cat,extra='') {
  const content=guidance(cat);content.open=true;
  if(extra)content.append(el('p',extra));
  $('help-body').replaceChildren(content);$('help-dialog').showModal();$('help-close').focus();
}
$('library-help').addEventListener('click',()=>openHelp(categories.find(c=>c.id===category)));
$('help-close').addEventListener('click',()=>$('help-dialog').close());
function renderLibrary() {
  const select=$('category');select.replaceChildren();
  for(const [id,label] of [['all',language==='zh'?'所有分類':'All categories'],['favorites',t('navFavorites')],['custom',t('navCustom')],...categories.map(c=>[c.id,c.name[language]])]) {
    const option=el('option',label);option.value=id;select.append(option);
  }
  if(!['all','favorites','custom',...categories.map(c=>c.id)].includes(category))category='all';select.value=category;
  const fav=favorites(snapshot.state),query=$('search').value.trim();
  // Search is always global, regardless of the selected category.
  let list=[...libraries[language],...userPrompts(snapshot.state).map(p=>({...p,category:'custom'}))];
  const catName=id=>categories.find(c=>c.id===id)?.name[language]||t('custom');
  if(query)list=list.filter(p=>matches(p,query,catName(p.category)));
  else if(category==='favorites')list=list.filter(p=>fav.has(p.id));
  else if(category!=='all')list=list.filter(p=>p.category===category);
  $('count').textContent=t('count',{n:list.length});
  $('guidance').replaceChildren();
  if(category==='custom'&&!query)$('guidance').append(button(t('add'),()=>openEdit(), 'primary'));
  const results=$('results');results.replaceChildren();
  if(!list.length)results.append(el('p',t(!query&&category==='favorites'?'emptyFavorites':!query&&category==='custom'?'emptyCustom':'empty'),'empty'));
  for(const p of list) {
    const card=el('article',undefined,'prompt-card');card.dataset.promptId=p.id;
    const open=button('',()=>openPrompt(p.id),'prompt-open');open.append(el('span',p.name,'prompt-name'));
    if(p.conflict)open.append(el('span',t('conflict'),'conflict'));
    const actions=el('div',undefined,'actions');
    actions.append(icon('star',t(fav.has(p.id)?'unfavorite':'favorite'),async()=>{await mutate({type:'favorite',id:p.id,value:!favorites(snapshot.state).has(p.id)});renderLibrary();const target=[...results.querySelectorAll('article')].find(x=>x.dataset.promptId===p.id)?.querySelector('.icon');(target||results.querySelector('button')||$('category')).focus();},fav.has(p.id)));
    if(p.category==='custom')actions.append(icon('edit',t('edit'),()=>openEdit(p.id)),icon('delete',t('delete'),async()=>{
      if(!await confirmDialog(t('delete'),t('confirmDelete',{name:p.name}),t('delete')))return;
      await mutate({type:'deletePrompt',id:p.id});drafts.delete(p.id);status(t('deleted'));renderLibrary();
    }));
    card.append(open,actions);results.append(card);
  }
}
function startView(next) {
  $('feedback').hidden=true;
  if(!view){lastFocus=document.activeElement;lastPromptId=lastFocus?.closest('[data-prompt-id]')?.dataset.promptId;listScroll=$('main').scrollTop;}
  view=next;$('library').hidden=true;$('view').hidden=false;$('view').replaceChildren();$('main').scrollTop=0;
  const heading=el('div',undefined,'view-heading'),goBack=icon('back',t('back'),back);goBack.classList.add('back');heading.append(goBack);$('view').append(heading);
}
function viewTitle(text) {$('view').querySelector('.view-heading').append(el('h2',text));}
function back() {
  view=null;$('view').hidden=true;$('view').replaceChildren();$('library').hidden=false;renderLibrary();$('main').scrollTop=listScroll;
  const previousCard=[...$('results').querySelectorAll('[data-prompt-id]')].find(node=>node.dataset.promptId===lastPromptId);
  if(lastFocus?.isConnected)lastFocus.focus();else (previousCard?.querySelector('.prompt-open')||$('search')).focus();
}
function updatePreview() {if(view?.kind!=='prompt')return;const p=getPrompt(view.id);if(p)$('prompt-preview').value=rendered(p);}
function openPrompt(id) {
  const p=getPrompt(id);if(!p){status(t('viewError'),true);return;}
  startView({kind:'prompt',id});const container=$('view');
  viewTitle(p.name);const help=icon('help',t('help'),()=>openHelp(categories.find(c=>c.id===p.category),t('blank')));help.classList.add('help-button');container.querySelector('.view-heading').append(help);
  const stored=snapshot.meta.lastValues?.[id],current=drafts.has(id),values=valuesFor(p);
  if(Object.values(values).some(value=>value?.trim()))container.append(el('p',t(current?'current':stored?'last':'defaults'),'muted'));
  const form=el('form');form.id='fill-form';
  for(const f of descriptors(p)) {
    const label=el('label',undefined,'field');label.append(el('span',f.label));
    let input;
    if(choices(f.label).length) {
      input=el('select');const blank=el('option',t('choose'));blank.value='';input.append(blank);
      for(const [index,choice] of choices(f.label).entries()) {const option=el('option',choice);option.value=`option:${index}`;input.append(option);}
    } else {input=el('textarea');input.rows=2;}
    input.name=f.id;input.value=values[f.id]||'';if(input.tagName==='TEXTAREA')input.maxLength=100000;
    input.addEventListener('input',()=>{values[f.id]=input.value;updatePreview();});
    label.append(input);form.append(label);
  }
  const previewSection=el('details',undefined,'preview-section');previewSection.append(el('summary',t('preview')));const previewLabel=el('label',undefined,'field');previewLabel.append(el('span',t('preview'),'sr-only'));
  const preview=el('textarea',undefined,'preview');preview.id='prompt-preview';preview.readOnly=true;previewLabel.append(preview);
  const controls=el('div',undefined,'view-actions compact-actions');
  controls.append(icon('document',t('raw'),()=>sendPrompt(p.text)),icon('copy',t('copy'),async()=>{await copy(rendered(p));await mutate({type:'lastValues',id:p.id,values:valuesFor(p)});}));
  previewSection.append(previewLabel);form.append(previewSection,controls);
  form.addEventListener('submit',event=>event.preventDefault());
  container.append(form);
  updatePreview();container.querySelector('h2').tabIndex=-1;container.querySelector('h2').focus();
}
function openEdit(id=null,existing=null) {
  const p=existing||(id?getPrompt(id):null);startView({kind:'edit',id});
  const container=$('view');viewTitle(t(id?'edit':'add'));
  const form=el('form');form.id='edit-form';
  const nameLabel=el('label',undefined,'field');nameLabel.append(el('span',t('name')));const name=el('input');name.id='custom-name';name.maxLength=200;name.required=true;name.value=p?.name||'';nameLabel.append(name);
  const textLabel=el('label',undefined,'field');textLabel.append(el('span',t('text')));const text=el('textarea');text.id='custom-text';text.rows=12;text.maxLength=100000;text.required=true;text.value=p?.text||'';textLabel.append(text);
  const actions=el('div',undefined,'view-actions'),save=decorate(el('button',t('save'),'primary'),'check');save.type='submit';actions.append(save,button(t('cancel'),back));
  form.append(nameLabel,textLabel,el('p',t('placeholderHelp'),'muted'),actions);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!name.value.trim()||!text.value.trim()){status(t('required'),true);return;}
    try{await mutate({type:'savePrompt',id,name:name.value,text:text.value});if(id){drafts.delete(id);await mutate({type:'lastValues',id,values:{}});}status(t('saved'));back();}catch{status(t('storageFailed'),true);}
  });
  container.append(form,el('p',t('optimizeHint'),'muted'),button(t('optimize'),()=>{if(!text.value.trim()){status(t('required'),true);return;}return sendPrompt(optimize(text.value,language),true);}));name.focus();
}
function field(container,label,value,name) {const wrapper=el('label',undefined,'field');wrapper.append(el('span',label));const input=el('input');input.name=name;input.value=value||'';input.maxLength=500;wrapper.append(input);container.append(wrapper);return input;}
function settingsDraft() {
  return view?.kind==='settings'?{profile:Object.fromEntries(['grade','subject','school'].map(k=>[k,$('view').querySelector(`input[name="${k}"]`).value])),theme:$('theme').value}:null;
}
function renderSettings(draft=null) {
  startView({kind:'settings'});const container=$('view');viewTitle(t('settingsTitle'));
  const form=el('form'),profile=draft?.profile||setting(snapshot.state,'profile',{}),inputs={};
  for(const key of ['grade','subject','school'])inputs[key]=field(form,t(key),profile[key],key);
  form.append(el('p',t('profileHint'),'muted'));
  const themeLabel=el('label',undefined,'field'),theme=el('select');theme.id='theme';themeLabel.append(el('span',t('theme')));
  for(const key of ['system','light','dark']){const option=el('option',t(key));option.value=key;theme.append(option);}theme.value=draft?.theme||setting(snapshot.state,'theme','system');themeLabel.append(theme);form.append(themeLabel);
  const save=decorate(el('button',t('save'),'primary'),'check');save.type='submit';form.append(save);
  form.addEventListener('submit',async event=>{event.preventDefault();try{await mutate({type:'setting',key:'profile',value:Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,v.value.trim()]))});await mutate({type:'setting',key:'theme',value:theme.value});status(t('saved'));}catch{status(t('storageFailed'),true);}});container.append(form);
  const sync=el('section',undefined,'section');sync.append(el('h3',t('sync')),el('p',t('syncPrivacy'),'muted'));
  const syncState=el('p');syncState.id='sync-state';sync.append(syncState,button(t('retry'),async()=>{applySnapshot(await request({type:'retrySync'}));updateSyncStatus();}));container.append(sync);
  const backup=el('section',undefined,'section');backup.append(el('h3',language==='zh'?'備份與資料':'Backup & data'),el('p',t('backupHint'),'muted'));
  const file=el('input');file.type='file';file.accept='.json,application/json';file.id='backup-file';file.hidden=true;file.setAttribute('aria-label',t('import'));
  file.addEventListener('change',async()=>{
    try {const selected=file.files[0];if(!selected)return;if(selected.size>5_000_000)throw Error('large');const data=validateState(JSON.parse(await selected.text()));const result=await mutate({type:'import',data});status(t('imported',{n:result.added||0}));renderSettings();}
    catch{status(t('invalidBackup'),true);}finally{file.value='';}
  });
  backup.append(button(t('export'),()=>{
    const blob=new Blob([JSON.stringify(snapshot.state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=`chatgpt-edu-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status(t('exported'));
  }),button(t('import'),()=>file.click()),file,el('p',''),button(t('clearAll'),async()=>{if(await confirmDialog(t('clearAll'),t('clearAllConfirm'),t('confirm'))){await mutate({type:'clearLastValues'});drafts.clear();status(t('cleared'));}}));container.append(backup);
  updateSyncStatus();
}
function updateSyncStatus(){const node=$('sync-state');if(node)node.textContent=t(({ok:'syncOk','too-large':'syncLarge',unavailable:'syncUnavailable',incomplete:'syncIncomplete',pending:'syncPending'})[snapshot.syncStatus]||'syncUnavailable');}
function confirmDialog(title,body,label) {
  const dialog=$('confirmation'),previous=document.activeElement;$('confirm-title').textContent=title;$('confirm-body').textContent=body;$('confirm-ok').textContent=label;$('confirm-cancel').textContent=t('cancel');
  return new Promise(resolve=>{
    const done=value=>{dialog.close();$('confirm-ok').onclick=null;$('confirm-cancel').onclick=null;dialog.oncancel=null;previous?.focus();resolve(value);};
    $('confirm-ok').onclick=()=>done(true);$('confirm-cancel').onclick=()=>done(false);dialog.oncancel=event=>{event.preventDefault();done(false);};dialog.showModal();$('confirm-cancel').focus();
  });
}
async function sendPrompt(text,isOptimization=false) {
  if(busy)return;busy=true;document.querySelectorAll('#view .view-actions button').forEach(b=>b.disabled=true);
  try {
    let result=await request({type:'prepareInsert',text});
    if(result.status==='prepared') {
      const proceed=!result.hasDraft||await confirmDialog(t('replaceTitle'),t('replaceBody'),t('replace'));
      if(!proceed){await request({type:'cancelInsert',token:result.token});status(t('cancelled'));return;}
      result=await request({type:'commitInsert',token:result.token});
    }
    const keys={'unsupported':'unsupported','not-ready':'notReady','not-found':'notFound',changed:'changed',expired:'expired',success:isOptimization?'optimizeSent':'inserted'};
    status(t(keys[result.status]||'failed'),result.status!=='success',result.status!=='success');
  } catch {status(t('failed'),true,true);}
  finally{busy=false;document.querySelectorAll('#view .view-actions button').forEach(b=>b.disabled=false);}
}
$('search').addEventListener('input',renderLibrary);
$('category').addEventListener('change',()=>{category=$('category').value;mutate({type:'lastCategory',id:category}).catch(()=>status(t('storageFailed'),true));renderLibrary();});
$('settings').addEventListener('click',()=>{if(!busy)renderSettings();});
$('language').addEventListener('click',async()=>{
  if(busy)return;
  const edit=view?.kind==='edit'?{name:$('custom-name').value,text:$('custom-text').value}:null;
  const settings=settingsDraft();
  try{await mutate({type:'setting',key:'language',value:language==='zh'?'en':'zh'});renderLibrary();if(view?.kind==='prompt')openPrompt(view.id);else if(view?.kind==='edit')openEdit(view.id,edit);else if(view?.kind==='settings')renderSettings(settings);}
  catch{status(t('storageFailed'),true);}
});
chrome.runtime.onMessage.addListener(message=>{
  if(message?.type!=='stateChanged'||!snapshot)return;
  const before=language,settings=settingsDraft();
  const edit=view?.kind==='edit'?{name:$('custom-name').value,text:$('custom-text').value}:null;
  applySnapshot(message.snapshot);
  if(!view)renderLibrary();
  else if(before!==language&&view.kind==='settings')renderSettings(settings);
  else if(before!==language&&view.kind==='edit')openEdit(view.id,edit);
  else if(view.kind==='settings')updateSyncStatus();
  else if(before!==language&&view.kind==='prompt')openPrompt(view.id);
});
(async()=>{
  try {
    status(t('loading'));
    await loadIcons();
    $('settings').replaceChildren(svgIcon('settings'));
    $('search-icon').replaceChildren(svgIcon('search'));
    $('library-help').replaceChildren(svgIcon('help'));$('help-close').replaceChildren(svgIcon('close'));
    const load=async path=>{const response=await fetch(path);if(!response.ok)throw Error('load');return response.json();};
    [categories,libraries.zh,libraries.en]=await Promise.all([load('prompts/categories.json'),load('prompts/zh.json'),load('prompts/en.json')]);
    applySnapshot(await request({type:'getState'}));
    category=snapshot.meta.lastCategory||categories[0]?.id||'all';renderLibrary();
    for(const id of ['language','settings','search','category','library-help'])$(id).disabled=false;
    if(!$('status').dataset.error||$('status').dataset.error==='false')status(userPrompts(snapshot.state).some(p=>p.conflict)?t('syncConflict'):'');
  } catch {status(t('loadFailed'),true);$('library').replaceChildren(el('p',t('loadFailed'),'hint'));$('settings').disabled=true;$('language').disabled=true;}
})();
