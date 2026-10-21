import {emptyState,validateState,mergeStates,mergeBackup,setting,packSync,unpackSync,bytes} from './core.js';
export class Store {
  constructor(chromeApi=chrome) { this.api=chromeApi; this.state=emptyState(); this.meta={}; this.syncStatus='pending'; this.device=''; }
  async init() {
    const data=await this.api.storage.local.get(['eduState','eduMeta','eduDevice']);
    this.state=data.eduState ? validateState(data.eduState) : emptyState();
    this.meta=data.eduMeta||{};
    this.device=data.eduDevice||crypto.randomUUID();
    await this.api.storage.local.set({eduDevice:this.device});
    await this.reconcile();
    return this;
  }
  snapshot() {return {state:this.state,meta:this.meta,syncStatus:this.syncStatus};}
  record(id,kind,value,deleted=false) {
    const previous=this.state.records[id], clock={...(previous?.clock||{})};
    clock[this.device]=(clock[this.device]||0)+1;
    this.state.records[id]={kind,value,deleted,clock,rev:crypto.randomUUID(),updatedAt:Date.now()};
  }
  async save() {
    validateState(this.state);
    await this.api.storage.local.set({eduState:this.state,eduMeta:this.meta});
  }
  async mutate(command) {
    const before=structuredClone(this.state), oldMeta=structuredClone(this.meta);
    let added;
    try {
      switch(command.type) {
        case 'savePrompt': {
          if(typeof command.name!=='string'||!command.name.trim()||command.name.length>200||typeof command.text!=='string'||!command.text.trim()||command.text.length>100000) throw Error('invalid-prompt');
          const id=command.id||`custom:${crypto.randomUUID()}`;
          if (command.id && this.state.records[id]?.kind!=='prompt') throw Error('invalid-prompt');
          this.record(id,'prompt',{name:command.name.trim(),text:command.text.trim()});break;
        }
        case 'deletePrompt': {
          const r=this.state.records[command.id];if(!r||r.kind!=='prompt') throw Error('invalid-prompt');
          this.record(command.id,'prompt',r.value,true);break;
        }
        case 'favorite':
          if(typeof command.id!=='string'||!/^[\w:~.-]{1,180}$/.test(command.id)) throw Error('invalid-prompt');
          this.record(`favorite:${command.id}`,'favorite',Boolean(command.value));break;
        case 'setting':
          this.record(`setting:${command.key}`,'setting',command.value);break;
        case 'lastValues': {
          if(typeof command.id!=='string'||typeof command.values!=='object'||!command.values||Object.values(command.values).some(v=>typeof v!=='string'||v.length>100000)||bytes(command.values)>500000) throw Error('invalid-values');
          this.meta.lastValues ||= {};
          if(Object.keys(command.values).length) this.meta.lastValues[command.id]=command.values;
          else delete this.meta.lastValues[command.id];
          break;
        }
        case 'clearLastValues': this.meta.lastValues={};break;
        case 'lastCategory': this.meta.lastCategory=String(command.id).slice(0,100);break;
        case 'import': {
          const result=mergeBackup(this.state,command.data);this.state=result.state;
          if(JSON.stringify(result.profile)!==JSON.stringify(setting(this.state,'profile',{grade:'',subject:'',school:''}))) this.record('setting:profile','setting',result.profile);
          added=result.added;break;
        }
        default: throw Error('unknown-command');
      }
      await this.save();
    } catch(error) {this.state=before;this.meta=oldMeta;throw error;}
    return {...this.snapshot(),...(added===undefined?{}:{added})};
  }
  async reconcile() {
    try {
      const remote=await unpackSync(await this.api.storage.sync.get(null));
      if(remote) this.state=mergeStates(this.state,remote);
      await this.save();this.syncStatus='ok';
    } catch(error) {this.syncStatus=error.message==='incomplete-sync'?'incomplete':'unavailable';}
    return this.snapshot();
  }
  async pushSync() {
    try {
      const all=await this.api.storage.sync.get(null);
      const remote=await unpackSync(all);
      if(remote) this.state=mergeStates(this.state,remote);
      await this.save();
      const packed=await packSync(this.state);
      const future={...all,...packed};
      const api=this.api.storage.sync;
      if(Object.keys(future).length>(api.MAX_ITEMS||512)||bytes(future)>(api.QUOTA_BYTES||102400)||Object.entries(packed).some(([key,value])=>bytes({[key]:value})>(api.QUOTA_BYTES_PER_ITEM||8192))) {this.syncStatus='too-large';return this.snapshot();}
      // Write complete generation before changing the pointer. Old generation remains recoverable.
      const {eduHead,...chunks}=packed;
      if(all.eduHead?.hash!==eduHead.hash) {
        await api.set(chunks);
        await api.set({eduHead});
      }
      const oldHash=all.eduHead?.hash;
      // Never delete another device's in-flight generation.
      const stale=oldHash&&oldHash!==eduHead.hash?Object.keys(all).filter(key=>key.startsWith(`edu:${oldHash}:`)):[];
      if(stale.length) await api.remove(stale);
      this.syncStatus='ok';
    } catch(error) {this.syncStatus=/quota/i.test(String(error))?'too-large':error.message==='incomplete-sync'?'incomplete':'unavailable';}
    return this.snapshot();
  }
}
