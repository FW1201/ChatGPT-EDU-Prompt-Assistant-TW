import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fields,fill,choices,displayValue} from '../lib/core.js';
import {translator} from '../lib/i18n.js';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const manifest=JSON.parse(read('manifest.json'));
assert.deepEqual(manifest.permissions,['sidePanel','storage']);
assert.deepEqual(manifest.host_permissions,['https://chatgpt.com/*','https://chat.openai.com/*']);
assert.equal(manifest.manifest_version,3);
const runtime=['background.js','content.js','sidepanel.js','lib/core.js','lib/store.js','lib/i18n.js'];
for(const file of runtime){
 execFileSync(process.execPath,['--check',path.join(root,file)]);
 const source=read(file);
 assert.ok(!/\beval\s*\(|new Function\(|\.innerHTML\s*=|\.insertAdjacentHTML\(/.test(source),file+' unsafe executable/HTML sink');
 assert.ok(!/parseLegacy|function migrate\(|case 'legacy'|migration-list|geminiApiKey|chatgptPromptOutputMode|fallback-preview|requestSubmit/.test(source),file+' obsolete code');
 for(const [,target] of source.matchAll(/(?:from |import\()['"](\.\/[^'"]+)['"]/g))assert.ok(fs.existsSync(path.resolve(path.dirname(path.join(root,file)),target)),file+' missing import '+target);
}
for(const file of [manifest.background.service_worker,manifest.side_panel.default_path,...manifest.content_scripts.flatMap(x=>x.js),...Object.values(manifest.icons)])assert.ok(fs.existsSync(path.join(root,file)),file);
const html=read('sidepanel.html'),source=read('sidepanel.js');
for(const [,id] of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`)||source.includes(`.id='${id}'`),`Missing DOM target ${id}`);
const cats=JSON.parse(read('prompts/categories.json'));assert.equal(cats.length,14);
const libraries=Object.fromEntries(['zh','en'].map(l=>[l,JSON.parse(read(`prompts/${l}.json`))]));
const report=[];
for(const lang of ['zh','en']){
 const ps=libraries[lang],seen=new Set();assert.equal(ps.length,196);
 assert.equal(new Set(ps.map(p=>p.name)).size,196,lang+' duplicate name');
 assert.equal(new Set(ps.map(p=>p.text)).size,196,lang+' duplicate text');
 const t=translator(lang);
 for(const [,key] of source.matchAll(/\bt\('([^']+)'/g))assert.notEqual(t(key),key,lang+' missing translation '+key);
 for(const p of ps){
  assert.ok(!seen.has(p.id),p.id);seen.add(p.id);
  assert.ok(cats.some(c=>c.id===p.category),p.id+' category');
  assert.deepEqual(new Set(fields(p.text)),new Set(p.fields.map(f=>f.label)),p.id+' placeholders');
  assert.equal(new Set(p.fields.map(f=>f.id)).size,p.fields.length,p.id+' field ids');
  assert.ok(p.fields.every(f=>/^f\d+$/.test(f.id)),p.id+' stable IDs');
  const peer=libraries[lang==='zh'?'en':'zh'].find(x=>x.id===p.id);assert.ok(peer,p.id+' bilingual peer');
  assert.equal(peer.category,p.category);assert.deepEqual(p.fields.map(f=>f.id),peer.fields.map(f=>f.id),p.id+' bilingual fields');
  for(const f of p.fields){const other=peer.fields.find(x=>x.id===f.id);assert.equal(choices(f.label).length,choices(other.label).length,p.id+' options');}
  const values=Object.fromEntries(p.fields.map(f=>[f.label,choices(f.label).length?displayValue(f,'option:0'):`測試 <b>文字</b> ${f.id}`]));
  assert.equal(fields(fill(p.text,values)).length,0,p.id+' filled preview');
  assert.ok(/資料界線：|Data boundaries:/.test(p.text),p.id+' source boundaries');
  const scaffold=['learning','study'].includes(p.category)?'adaptive-dialogue':['teaching','mandarin','visual'].includes(p.category)?'instructional-design':'task-workflow';
  if(scaffold==='adaptive-dialogue')assert.ok(/連續兩次|two independent/.test(p.text)&&/新情境|new-context/.test(p.text),p.id+' fading/transfer');
  if(scaffold==='instructional-design')assert.ok(/獨立實作|independent work/.test(p.text),p.id+' independent practice');
  if(['search','data','projects','writing','visual'].includes(p.category))assert.ok(/專用交付與檢核：|Task-specific deliverables and checks:/.test(p.text),p.id+' specialized task');
  report.push({language:lang,id:p.id,name:p.name,category:p.category,fields:p.fields.length,scaffold,structure:'passed',modelOutcome:'not-run'});
 }
 for(const c of cats)assert.equal(ps.filter(p=>p.category===c.id).length,c.count,c.id+' count');
}
const svg=read('icons/icon.svg');
const symbols=[...svg.matchAll(/symbol id="([^"]+)"/g)].map(x=>x[1]);
for(const name of symbols)assert.ok(source.includes(`'${name}'`)||html.includes(name),'Unused SVG '+name);
assert.ok(!/data-t="privacy"|id="quick-nav"|id="migration-list"/.test(html));
assert.match(html,/<footer><div class="credit">/);
for(const file of ['README.md','CHANGELOG.md',...fs.readdirSync(path.join(root,'docs')).filter(f=>f.endsWith('.md')).map(f=>'docs/'+f)]){
 for(const [,target] of read(file).matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(target))continue;
  assert.ok(fs.existsSync(path.resolve(path.dirname(path.join(root,file)),target.split('#')[0])),file+' missing document link '+target);
 }
}
fs.writeFileSync(path.join(root,'docs/prompt-quality.json'),JSON.stringify({date:'2026-10-22',templates:196,localizedTemplates:392,scope:'Structural and editorial safeguards; not an AI-output or classroom efficacy evaluation',results:report},null,2)+'\n');
console.log(`PASS runtime syntax, imports, resources, DOM, translations, permissions, obsolete-code checks; ${report.length} localized templates, bilingual fields/options, fill roundtrips, scaffold coverage.`);
