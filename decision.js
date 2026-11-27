/* الصوافي والتكاليف v2.0.0 — الشاشة الرئيسية «قرار شراء الخام» (بحوث العمليات).
   بتقرا مباشرة من قسم الصوافي (safiNetback.v2) وقسم التكاليف (citrusCosts.v2) — نفس الموقع، من غير نسخ ولصق.
   الخانات الرئيسية (الدولار الموحّد، نولون الحاوية، سعر الخام النهارده) بتتكتب في القسم صاحبها فورًا، فالأرقام واحدة في كل مكان.
   إعدادات القرار نفسها في decision.v1 (+ نسخة .mirror + IndexedDB). الحاوية الأساسي والبراد فرعي. */
(function(){'use strict';
const VER2='2.6.0';const K=BE.KEYS;const FXK='fx.v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fe=(x,d)=>x==null||!isFinite(x)?'—':f(x,d==null?2:d);
const cairoISO=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d||new Date());
const modeName=m=>m==='حاوية'?'الحاوية':'البراد';const OTHER=m=>m==='حاوية'?'براد':'حاوية';
/* ---------- التخزين ---------- */
let LS_OK=true;try{localStorage.setItem('dec.probe','1');localStorage.removeItem('dec.probe')}catch(e){LS_OK=false}
const MEM={};
function lsGet(k){if(LS_OK){try{return localStorage.getItem(k)}catch(e){}}return k in MEM?MEM[k]:null}
function lsSet(k,v){MEM[k]=v;if(!LS_OK)return false;try{localStorage.setItem(k,v);return true}catch(e){return false}}
let idbP=null;
function idb(){if(idbP)return idbP;idbP=new Promise(res=>{try{const op=indexedDB.open('sawafi-store',1);op.onupgradeneeded=()=>{if(!op.result.objectStoreNames.contains('kv'))op.result.createObjectStore('kv')};op.onsuccess=()=>{const db=op.result;db.onversionchange=()=>{try{db.close()}catch(e){}idbP=null};res(db)};op.onerror=op.onblocked=()=>{idbP=null;res(null)}}catch(e){idbP=null;res(null)}});return idbP}
function idbPut(k,v){return idb().then(db=>new Promise(r=>{if(!db)return r(false);try{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>r(true);t.onerror=t.onabort=()=>r(false)}catch(e){idbP=null;r(false)}}))}
function idbGet(k){return idb().then(db=>new Promise(r=>{if(!db)return r(null);try{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result||null);q.onerror=()=>r(null)}catch(e){idbP=null;r(null)}}))}
function safiFromObj(o){const d=JSON.parse(JSON.stringify(DEF));for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];return d}
function okSafi(o){return !!(o&&typeof o==='object'&&Array.isArray(o.lines))}
/* الصوافي: نفس ترتيب القراءة في قسم الصوافي (الأساسي ← النسخة ← القديم ← المدخلات الرئيسية) */
function readSafi(){for(const k of [K.safi,K.safiM]){const u=BE.unwrap(lsGet(k));if(u&&okSafi(u.S)){const s=safiFromObj(u.S);ExpMig.migrateExp(s);return {S:s,t:u.t,src:'saved'}}}
 const old=BE.unwrap(lsGet('safiNetback'));if(old&&okSafi(old.S)){const s=safiFromObj(old.S);ExpMig.migrateExp(s);return {S:s,t:0,src:'old'}}
 let base=PINNED;const up=BE.unwrap(lsGet('safiNetback.v2.userPinned'));if(up&&okSafi(up.S))base=up.S;const s=safiFromObj(JSON.parse(JSON.stringify(base)));ExpMig.migrateExp(s);s.date=cairoISO();return {S:s,t:0,src:'fresh'}}
function readCosts(){for(const k of [K.costs,K.costsOld]){const u=BE.unwrap(lsGet(k));if(u)return {S:BE.costsFrom(u.S),t:u.t,src:k===K.costs?'saved':'old'}}const s=BE.costsFrom(null);s.date=cairoISO();return {S:s,t:0,src:'fresh'}}
function readDec(){for(const k of [K.dec,K.decM]){const u=BE.unwrap(lsGet(k));if(u)return {S:BE.decFrom(u.S),t:u.t}}return {S:BE.decFrom(null),t:0,fresh:true}}
let lastT=null,SAVE_FAIL=false;
function writeSafi(mut){const r=readSafi();mut(r.S);try{BESHIP.autoCost(r.S.lines,costsCat(),COSTS_CALC,SafiAuto)}catch(e){}const t=Date.now();const j=JSON.stringify({ver:2,t,S:r.S});const a=lsSet(K.safi,j),b=lsSet(K.safiM,j);idbPut('S',j);
 try{const p=JSON.parse(lsGet('safiNetback.v2.pending')||'null');if(p&&p.ERR){['k:egp','k:fC'].forEach(x=>{delete p.ERR[x];delete p.DR[x]});lsSet('safiNetback.v2.pending',JSON.stringify(p))}}catch(e){}
 return a||b}
function writeCosts(mut){const r=readCosts();mut(r.S);if(r.src!=='saved'&&!r.S.date)r.S.date=cairoISO();const ok=lsSet(K.costs,JSON.stringify({ver:2,t:Date.now(),S:r.S}));
 try{const p=JSON.parse(lsGet('citrusCosts.v2.pending')||'null');if(p&&p.ERR){['usd','raw'].forEach(x=>{delete p.ERR[x];delete p.DR[x]});lsSet('citrusCosts.v2.pending',JSON.stringify(p))}}catch(e){}return ok}
function saveDec(){lastT=Date.now();const j=JSON.stringify({ver:1,t:lastT,S:DEC});const a=lsSet(K.dec,j),b=lsSet(K.decM,j);idbPut('dec',j);SAVE_FAIL=!(a||b);showSaved()}
function showSaved(){const n=$('#ls');if(!n)return;if(SAVE_FAIL||!LS_OK){n.textContent='⚠ الحفظ مؤقت — الجهاز مانع التخزين';n.classList.add('warn');return}n.classList.remove('warn');if(!lastT)return;const d=new Date(lastT);n.textContent='اتحفظ ✓ الساعة '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
/* الدولار الموحّد: آخر تعديل في أي قسم يكسب، والتاني يتظبط عليه */
function syncFx(){const sf=readSafi(),cs=readCosts();const s=+sf.S.egp,c=+cs.S.usd;let F=null;try{F=JSON.parse(lsGet(FXK)||'null')}catch(e){}
 let canon;if(!F)canon=s>0?s:BE.ASSUME.egp;else{const sCh=s!==F.safi,cCh=c!==F.costs;canon=sCh?s:cCh?c:F.v}
 if(!(canon>0))canon=BE.ASSUME.egp;if(s!==canon)writeSafi(S=>{S.egp=canon});if(c!==canon)writeCosts(S=>{S.usd=canon});lsSet(FXK,JSON.stringify({v:canon,safi:canon,costs:canon,t:Date.now()}));return canon}
function setFx(v){writeSafi(S=>{S.egp=v});writeCosts(S=>{S.usd=v});lsSet(FXK,JSON.stringify({v,safi:v,costs:v,t:Date.now()}))}
/* مرة واحدة: نولون الحاوية في الصوافي كان صفر (مش متدخل) ← 2,800$ من أمير 23/11/2026 */
function migrateOnce(){if(lsGet('decision.migr.fc2800'))return;const sf=readSafi();if(sf.src!=='fresh'&&!(+sf.S.fC>0)){writeSafi(S=>{S.fC=BE.ASSUME.fC});NOTE='نولون الحاوية كان مش متدخل في الصوافي، فاتكتب 2,800$ (رقمك الحالي) — تقدر تغيّره من هنا.'}lsSet('decision.migr.fc2800','1')}
/* v2.1.1: لو الملفات المتخزّنة على الجهاز متلخبطة (نسخة قديمة من be-core.js مع decision.js جديد — من الـ CDN وقت التحديث)
   نمسح الكاش مرة واحدة ونحدّث الـ service worker ونعيد التحميل. البيانات (localStorage/IndexedDB) ما بتتلمسش. */
(function selfHeal(){const ok=typeof BE.twoWay==='function'&&typeof BE.planN==='function'&&BE.VER===VER2&&typeof window.BETwo==='object';if(ok){try{sessionStorage.removeItem('dec.heal')}catch(e){}return}
 let n=0;try{n=+sessionStorage.getItem('dec.heal')||0}catch(e){}if(n>=2)return;try{sessionStorage.setItem('dec.heal',String(n+1))}catch(e){}
 const done=()=>location.reload();const sw=navigator.serviceWorker;
 Promise.resolve().then(()=>window.caches?caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf('sawafi-')===0).map(x=>caches.delete(x)))):0)
  .then(()=>sw&&sw.getRegistration?sw.getRegistration().then(r=>r&&r.update&&r.update().catch(()=>{})):0).catch(()=>{}).then(()=>setTimeout(done,300))})();
let DEC=readDec().S,SAFI=null,COSTS=null,NOTE='';
/* v2.6.0 — الشحنة = سطور الصوافي (be-ship.js). زيادات القرار بس (حد أقصى، نسبة المقاس) في decision.ext.v1 مربوطة بالسطر. */
const EXK='decision.ext.v1';let EXT={list:[]};
function readExt(){try{const o=JSON.parse(lsGet(EXK)||'null');return o&&Array.isArray(o.list)?o:{list:[]}}catch(e){return {list:[]}}}
function saveExt(){const j=JSON.stringify(EXT);lsSet(EXK,j);idbPut('ext',j)}
/* التكاليف بنفس تحميل الصوافي (SafiAuto.loadCosts = _ld + ensureCostsCatalog)، ولو مش محفوظة = الأساسية */
function costsCat(){const c=SafiAuto.loadCosts(lsGet(K.costs),lsGet(K.costsOld),COSTS_CALC);return c}
function migrate26(){if(lsGet('decision.migr.v26'))return;const raw=lsGet(K.dec)||lsGet(K.decM);if(raw)lsSet('decision.v1.backup.v26',raw);
 const sf=readSafi(),cs=costsCat()||COSTS_CALC.DEF;const m=BESHIP.migrate(raw?readDec().S:null,sf.S,sf.src==='fresh',cs,SafiAuto);
 if(m.seed){writeSafi(S=>{S.lines=m.seed});NOTE='الصوافي كانت فاضية، فأصناف القرار اتكتبت فيها — من دلوقتي الأصناف واحدة في الصفحتين.'}
 else if(raw&&m.had)NOTE='من دلوقتي أصناف القرار هي نفس سطور الصوافي (الباليتات والأسعار والعبوات). نسخة من أصنافك القديمة هنا اتحفظت على الجهاز.';
 EXT=m.ext;saveExt();lsSet('decision.migr.v26','1')}
try{const u=BE.unwrap(lsGet(K.dec));if(u&&u.t)lastT=u.t}catch(e){}
function load(){SAFI=readSafi();COSTS=readCosts();const d=readDec();DEC=d.S;EXT=readExt();
 /* «تكلفة الطن هنا» التلقائية في سطور الصوافي بتتحدث هنا كمان (نفس اللي الصوافي بتعمله لما تتفتح) */
 if(SAFI.src!=='fresh'){try{const L=JSON.parse(JSON.stringify(SAFI.S.lines));if(BESHIP.autoCost(L,costsCat(),COSTS_CALC,SafiAuto)){writeSafi(()=>{});SAFI=readSafi()}}catch(e){}}
 try{const cs=JSON.parse(JSON.stringify(COSTS.S));COSTS_CALC.ensureCostsCatalog(cs);COSTS.S=cs;BE.usePkg(BESHIP.pkgHook(cs,COSTS_CALC,SafiAuto))}catch(e){}
 DEC.items=BESHIP.items(SAFI.S,EXT,COSTS.S,SafiAuto)}
/* ---------- الواجهة ---------- */
const ERR={};
function fld(key,label,val,unit,hint,cls){return '<div class="f'+(cls?' '+cls:'')+'"><label>'+label+'</label><div class="in'+(ERR[key]?' bad':'')+'"><input inputmode="decimal" data-h="'+key+'" value="'+esc(key in ERR?ERR[key].raw:val)+'" aria-label="'+esc(label)+'"><span class="u">'+unit+'</span></div>'+(ERR[key]?'<div class="emsg">'+esc(ERR[key].msg)+'</div>':'')+(hint?'<div class="hint">'+hint+'</div>':'')+'</div>'}
function renderInputs(){const S=SAFI.S,C=COSTS.S;
 $('#hin').innerHTML='<div class="grid hgrid">'+
  fld('egp','سعر الدولار بالجنيه',S.egp,'ج / $','موحّد للصوافي والتكاليف','big')+
  fld('fC','نولون الحاوية (العدبية ← جدة)',S.fC,'$ / حاوية','بيتسجل في الصوافي','big')+
  fld('raw','سعر الخام النهارده — '+esc(C.variety||''),C.raw,'ج / كجم','واصل المحطة — بيتسجل في التكاليف. كل صنف تاني خامه في سطره تحت','big')+
  fld('cap.حاوية','باليتات الحاوية',DEC.cap['حاوية'],'باليت','')+'</div>'+(NOTE?'<div class="notice">'+esc(NOTE)+'</div>':'')}
function vOpts(cur){const G=(window.ALS&&ALS.GROUPS)||{};let o='<option value="">اختار الصنف…</option>';const all=[].concat(...Object.values(G).map(g=>g.vars));
 if(cur&&all.indexOf(cur)<0)o+='<option>'+esc(cur)+'</option>';Object.values(G).forEach(g=>{o+='<optgroup label="'+esc(g.name)+'">'+g.vars.map(v=>'<option>'+esc(v)+'</option>').join('')+'</optgroup>'});return o}
function sizes(it){let L=[];try{const g=ALS.groupOf(it.v);if(g){const r=ALS.sizesFor(g,ALS.packOf(g,it.pk));if(Array.isArray(r))L=r.map(String)}}catch(e){}return L}
function szOpts(it){const L=sizes(it),cur=String(it.sz||'');if(cur&&L.indexOf(cur)<0)L.unshift(cur);return '<option value="">المقاس</option>'+L.map(s=>'<option>'+esc(s)+'</option>').join('')}
function pkOpts(cur){const L=SAFI.S.pk.map(p=>p[0]);(COSTS.S.pk||[]).forEach(p=>{if(L.indexOf(p[0])<0)L.push(p[0])});if(cur&&L.indexOf(cur)<0)L.unshift(cur);return L.map(n=>'<option>'+esc(n)+'</option>').join('')}
function render(){load();renderInputs();const R=DEC;
 const its=R.items.map((it,i)=>'<div class="ln be-it" data-bi="'+i+'"><div class="r1 rv"><select data-hs="items.'+i+'.v" aria-label="الصنف">'+vOpts(it.v)+'</select><select data-hs="items.'+i+'.sz" aria-label="المقاس" class="szs">'+szOpts(it)+'</select><button class="x" data-ha="del:'+i+'" aria-label="حذف">×</button></div>'+
  '<div class="r1"><select data-hs="items.'+i+'.pk" aria-label="العبوة">'+pkOpts(it.pk)+'</select></div>'+
  '<div class="be-g4">'+[['p','سعر البيع','ريال'],['cpp','كراتين/باليت',''],['pal','باليتات',''],['max','حد أقصى','باليت'],['share','نسبة المقاس','% من الفرز']].map(x=>{const key='items.'+i+'.'+x[0];return '<label class="be-c"><span>'+x[1]+(x[2]?' <small>'+x[2]+'</small>':'')+'</span><input class="v'+(ERR[key]?' bad':'')+'" inputmode="decimal" data-h="'+key+'" value="'+esc(key in ERR?ERR[key].raw:(it[x[0]]==null?'':it[x[0]]))+'" placeholder="'+(x[0]=='max'||x[0]=='share'?'اختياري':'')+'"></label>'}).join('')+'</div>'+
  '<div class="be-raw">'+(it.rawVar?'<label class="be-c"><span>خام '+esc(it.rawVar)+' <small>ج/كجم'+(it.rawSrc==='today'?' · النهارده':'')+'</small></span><input class="v'+(ERR['items.'+i+'.raw']?' bad':'')+'" inputmode="decimal" data-h="items.'+i+'.raw" value="'+esc('items.'+i+'.raw' in ERR?ERR['items.'+i+'.raw'].raw:it.raw)+'"></label>':'<span class="hint">الصنف مش في جدول التكاليف — محسوب على خام النهارده '+f(it.raw)+'</span>')+'<div class="be-cost" data-bc="'+i+'"></div></div>'+
  '<div class="be-out" data-bo="'+i+'"></div></div>').join('');
 $('#be').innerHTML='<div class="vars be-modes">'+BE.MODES.map(m=>'<button class="chip sm'+(R.base===m?' on':'')+'" data-ha="base:'+m+'">'+modeName(m)+(m==='حاوية'?' (أساسي)':' (فرعي)')+'</button>').join('')+'</div>'+
  '<div id="beKpi"></div><div id="beWarn" class="hint"></div>'+
  '<div class="be-sub">الأصناف وأسعار البيع في السعودية <small>= سطور الصوافي</small></div><div class="hint be-sync" id="beSync"></div>'+its+
  '<div class="be-btns"><button class="btn ghost" data-ha="add">+ صنف</button><a class="btn ghost" href="safi.html">فتح الصوافي ←</a></div>'+
  '<div class="be-sub">أحسن توزيع للباليتات <small>بحوث العمليات — برمجة خطية</small></div><div id="beOpt"></div>'+
  '<div class="be-sub">الحساسية <small>سعر الخام للتعادل لو حاجة اتغيرت</small></div><div id="beSen"></div>'+
  '<div class="be-sub">الأرقام جاية منين</div><div id="beSrc"></div>'+
  '<div class="hint be-how">الحساب: صافي الطن = سعر الكرتونة × (1 − العمولة) × عدد الكراتين في الطن ÷ ريال/$ × ج/$ − نصيب الطن من مصروفات ونولون الشحنة (نفس الصوافي). '+
  'سعر الخام للتعادل = (صافي الطن − العبوات − المستلزمات − الغسيل + الفرزة المباعة محلي) ÷ الكيلوهات الخام اللي بتطلع طن صافي (نفس التكاليف). أحسن توزيع = أعلى سعر خام ممكن (Dinkelbach + Simplex).</div>';
 document.querySelectorAll('select[data-hs]').forEach(s=>{const v=get(s.dataset.hs);s.value=v==null?'':String(v);if(s.value!==String(v==null?'':v))s.selectedIndex=0});
 $('#ver').textContent='· v2.6.0';showSaved();live()}
function get(path){const a=path.split('.');let o=DEC;for(const k of a){if(o==null)return null;o=o[k]}return o}
function set(path,v){const a=path.split('.');let o=DEC;for(let i=0;i<a.length-1;i++)o=o[a[i]];o[a[a.length-1]]=v}
function planFor(mode){if(typeof BE.planN==='function')return BE.planN(DEC,mode);const n=DEC.items.map(it=>+it.pal||0);if(mode===DEC.base)return n;const tot=n.reduce((a,b)=>a+b,0),cap=+DEC.cap[mode]||0;return tot?n.map(v=>v*cap/tot):n}
const plTxt=v=>v==null||!isFinite(v)?'—':(v>=0?'ربح ':'خسارة ')+'<span class="num">'+f(Math.abs(v))+'</span>';
/* v2.6.0 — قرار الشراء السريع (أول الصفحة): لكل صنف في الشحنة خام النهارده مقابل أعلى خام، والحكم */
function mxOpt(){let o=null;try{o=JSON.parse(lsGet('decision.mx.v1')||'null')}catch(e){}const d=o&&isFinite(+o.d)&&o.d!==''?+o.d:2,c=o&&[70,80,90].indexOf(+o.conf)>=0?+o.conf/100:0.8;return {d,conf:c}}
function renderQuick(){const q=$('#quick');if(!q)return;let Q;try{const o=mxOpt();Q=BESHIP.quick(BE,SAFI.S,COSTS.S,DEC,DEC.items,o)}catch(e){q.innerHTML='';return}
 const base=Q.base,oth=Q.oth,bn=m=>m==='حاوية'?'الحاوية':'البراد',pc=x=>x==null?'—':'<span class="num">'+f(x*100,0)+'%</span>';
 const capB=+DEC.cap[base]||0,unit=base==='حاوية'?'حاوية':'براد';
 const head='<div class="qk-h"><b>قرار الشراء السريع</b><span>خام كل صنف من التكاليف · أسعار البيع والباليتات من الصوافي</span></div>';
 if(!Q.vars.length){q.innerHTML=head+'<div class="hint">اكتب الأصناف في الصوافي (الباليتات وكراتين الباليت وسعر البيع).</div>';return}
 const sum='<div class="qk-s'+(Q.own!=null&&Q.own<0?' neg':'')+'"><span>الشحنة <span class="num">'+f(Q.pal,0)+'</span> باليت'+(Q.boxes?' = <span class="num">'+Q.boxes+'</span> '+unit+' (السعة '+f(capB,0)+')':'')+'</span><b>'+(Q.own==null?'—':plTxt(Q.own)+' ج')+'</b><em>'+(Q.delta==null?'':'هامش '+(Q.delta>=0?'+':'−')+'<span class="num">'+f(Math.abs(Q.delta))+'</span> ج/كجم على كل الخامات')+' · '+bn(oth)+': '+(Q.ownOth==null?'—':plTxt(Q.ownOth)+' ج')+'</em></div>';
 const rows=Q.vars.map(g=>{const v=g.verdict,m=g.margin;const best=g.best?'<span class="num">'+f(g.best.R)+'</span>':'<small>مش فيه</small>',ob=g.othBest?'<span class="num">'+f(g.othBest.R)+'</span>':'<small>مش فيه</small>';
  const act=v.k==='buy'?'اشتري لحد <b class="num">'+f(g.R)+'</b> ج/كجم':v.k==='neg'?'فاوض لـ <b class="num">'+f(g.rConf)+'</b> ج/كجم أو أقل':'متشتريش بـ <b class="num">'+f(g.raw)+'</b> — التعادل <b class="num">'+f(g.R)+'</b>';
  return '<div class="qk-r '+v.k+'" data-qk="'+esc(g.k)+'"><div class="qk-t"><i class="qk-v">'+v.t+'</i><b>'+esc(g.v)+'</b><small>'+esc(g.pks.join(' + '))+' · <span class="num">'+f(g.pal,0)+'</span> باليت</small></div>'+
   '<div class="qk-a">'+act+'</div>'+
   '<div class="qk-n"><div><span>النهارده</span><b class="num">'+f(g.raw)+'</b></div><div><span>أعلى خام</span><b class="num">'+f(g.R)+'</b></div><div><span>الهامش</span><b class="num '+(m>=0?'ok2':'bad2')+'">'+(m>=0?'+':'−')+f(Math.abs(m))+'</b></div><div><span>احتمال المكسب</span><b>'+pc(g.prob)+'</b></div></div>'+
   '<table class="qk-g"><tr><td></td><td>خطتك</td><td>أحسن توزيع</td></tr><tr><td>'+bn(base)+'</td><td class="num">'+f(g.R)+'</td><td>'+best+'</td></tr><tr><td>'+bn(oth)+'</td><td class="num">'+(g.oth?f(g.oth.R):'—')+'</td><td>'+ob+'</td></tr></table></div>'}).join('');
 q.innerHTML=head+sum+rows+'<div class="hint">ج/كجم خام. أعلى خام = اللي يخلّي ربح الصنف في الشحنة دي صفر (المصروفات على الوزن زي الصوافي). اشتري = احتمال المكسب '+pc(Q.conf)+' أو أكتر، فاوض = بين 50% و'+pc(Q.conf)+' (السعر اللي يوصلك '+pc(Q.conf)+')، متشتريش = أقل من 50%. سعر البيع ممكن يتحرك ± <span class="num">'+f(Q.d)+'</span> ريال (من ⑤). أحسن توزيع = '+f(capB,0)+' باليت.</div>'}
function live(){const S=SAFI.S,Cs=COSTS.S,base=DEC.base,oth=OTHER(base);
 const Cb=BE.ctx(S,Cs,DEC,base),Co=BE.ctx(S,Cs,DEC,oth);const nb=planFor(base),no=planFor(oth);const pb=BE.planBE(Cb,DEC.items,nb),po=BE.planBE(Co,DEC.items,no);
 /* v2.6.0: كل صنف بخامه هو من التكاليف — الهامش = ربح الشحنة ÷ (k × الطن) = قد إيه كل الخامات تقدر تزيد لحد التعادل */
 const dl=(p,C)=>p.profitOwn==null||!(p.T>0)?null:p.profitOwn/(C.k*p.T);const rawTxt=()=>{const L=[];DEC.items.forEach(it=>{const k2=(it.rawVar||it.v)+' '+f(it.raw);if(it.pal>0&&L.indexOf(k2)<0)L.push(k2)});return L.join(' · ')};
 const verdict=(p,C)=>{const d=dl(p,C);return p.R==null?'':p.R<=0?'<em class="bad2">مفيش سعر خام يعادل — الصافي أقل من التكاليف حتى لو الخام ببلاش</em>':d==null?'':d>=0?'<em class="ok2">✓ على خام كل صنف ('+esc(rawTxt())+') الشحنة مربحة — هامش <span class="num">'+f(d)+'</span> ج/كجم</em>':'<em class="bad2">✗ على خام كل صنف ('+esc(rawTxt())+') الشحنة خسرانة — لازم الخام يقل <span class="num">'+f(-d)+'</span> ج/كجم</em>'};
 const kp=(p,m,main)=>'<div class="kpi'+(main?' wide be-main':'')+(dl(p,m===base?Cb:Co)!=null&&dl(p,m===base?Cb:Co)<0?' neg':'')+'"><span>'+(main?'اشتري الخام لحد — ':'')+modeName(m)+(main?'':' (فرعي)')+'</span><b>'+(p.R==null?'—':'<span class="num">'+f(p.R)+'</span> ج/كجم')+'</b><em>'+(p.R==null?'اكتب الأصناف والباليتات':'= <span class="num">'+f(p.Rton,0)+'</span> ج لطن الخام · <span class="num">'+f(p.T,2)+'</span> طن صافي')+'</em>'+(main?verdict(p,Cb):'')+
  (p.R!=null?'<em class="sm2">على خام كل صنف: '+plTxt(p.profitOwn/p.T)+' ج/طن · الشحنة '+plTxt(p.profitOwn)+' ج</em>':'')+'</div>';
 const tb=$('#twoBody');if(tb){try{tb.innerHTML=BETwo.html(BE.twoWay(S,Cs,DEC))}catch(e){tb.innerHTML='<div class="hint">مش قادر أحسب القرار دلوقتي — راجع الأصناف والأسعار.</div>'}}
 $('#beKpi').innerHTML='<div class="kpis">'+kp(pb,base,true)+kp(po,oth,false)+'<div class="kpi"><span>الفرق '+modeName(base)+' − '+modeName(oth)+'</span><b>'+(pb.R!=null&&po.R!=null?'<span class="num">'+f(pb.R-po.R)+'</span> ج/كجم':'—')+'</b><em>'+(pb.R!=null&&po.R!=null?(pb.R>=po.R?modeName(base)+' أحسن':modeName(oth)+' أحسن'):'')+'</em></div></div>';
 const w=[];const tot=nb.reduce((a,b)=>a+b,0);
 if(Cb.frMissing||Co.frMissing)w.push('⚠ نولون '+[Cb,Co].filter(c=>c.frMissing).map(c=>modeName(c.mode)).join(' و')+' مش متدخل — التعادل محسوب من غير نولون');
 const nbx=Cb.cap>0?Math.ceil(tot/Cb.cap-1e-9):0;if(tot>Cb.cap+1e-9)w.push('⚠ الشحنة '+f(tot,0)+' باليت = '+nbx+' '+(base==='حاوية'?'حاوية':'براد')+' (السعة '+f(Cb.cap,0)+') — النولون والمصروفات محسوبين زي ما هم مكتوبين في الصوافي (مرة واحدة)، لو دول '+nbx+' اكتب إجماليهم في الصوافي');else if(tot&&tot<Cb.cap-1e-9)w.push('الشحنة '+f(tot,0)+' باليت من سعة '+modeName(base)+' '+f(Cb.cap,0)+' — المصروفات متوزعة على '+f(tot,0)+' باليت بس');
 if(Cb.noClient)w.push('⚠ العميل «'+S.client+'» مش في جدول العملاء — العمولة صفر');
 const seen={};DEC.items.forEach(it=>{const x=BE.item(Cb,it);if(x.missPk&&it.pk&&!seen['p'+it.pk]){seen['p'+it.pk]=1;w.push('⚠ سعر عبوة «'+it.pk+'» مش في التكاليف — محسوب صفر')}if(x.missWash&&it.v&&!seen['w'+it.v]){seen['w'+it.v]=1;w.push('⚠ غسيل «'+it.v+'» مش في التكاليف — محسوب صفر')}});
 $('#beWarn').innerHTML=w.map(esc).join('<br>');
 const AN=BESHIP.analyze(BE,Cb,DEC.items,nb);
 DEC.items.forEach((it,i)=>{const c=document.querySelector('[data-bc="'+i+'"]'),r=AN.rows[i];if(c)c.innerHTML=r&&r.cost!=null?'تكلفة الطن <b class="num">'+f(r.cost)+'</b> ج <small>(نفس الصوافي والتكاليف)</small>'+(r.ok?'<br>في الشحنة دي: أعلى خام <b class="num">'+fe(r.Rrow)+'</b> · '+plTxt(r.profitTon)+' ج/طن':''):''});
 const sy=$('#beSync');if(sy){const pal=DEC.items.reduce((a,x)=>a+(+x.pal||0),0),ctn=DEC.items.reduce((a,x)=>a+(+x.pal||0)*(+x.cpp||0),0);sy.innerHTML='نفس سطور البيع في الصوافي — أي تعديل هنا بيتكتب هناك والعكس. الإجمالي <span class="num">'+f(pal,0)+'</span> باليت · <span class="num">'+f(ctn,0)+'</span> كرتونة'+(Cb.cap>0?' = <span class="num">'+Math.ceil(pal/Cb.cap-1e-9)+'</span> '+(base==='حاوية'?'حاوية':'براد')+' (السعة '+f(Cb.cap,0)+')':'')}
 renderQuick();
 DEC.items.forEach((it,i)=>{const o=document.querySelector('[data-bo="'+i+'"]');if(!o)return;const a=BE.itemBE(Cb,it),b=BE.itemBE(Co,it),x=BE.item(Cb,it),raw=BE.rawOfIt(it,Cs);
  const per1=x.ok?(1-Cb.comm)*(1000/x.w)/Cb.u*Cb.E/Cb.k:null,pr=BE.priceForRaw(Cb,it,raw);
  o.innerHTML=x.ok?'<div class="be-r"><span>لو مالي '+modeName(base)+' لوحده</span><b class="num">'+fe(a.R)+'</b><span>ج/كجم خام · '+modeName(oth)+' <span class="num">'+fe(b.R)+'</span></span></div>'+
   '<div class="hint">كل 1 ريال في سعر الكرتونة = <span class="num">'+fe(per1,3)+'</span> ج/كجم خام · علشان خام <span class="num">'+f(raw)+'</span> ج تبيع بـ <span class="num">'+fe(pr)+'</span> ريال على الأقل</div>':'<div class="hint">اختار العبوة واكتب كراتين الباليت وسعر البيع</div>'});
 const ob=BE.optimize(Cb,DEC.items),oo=BE.optimize(Co,DEC.items);
 $('#beOpt').innerHTML=ob.status!=='ok'?'<div class="hint">اكتب صنف واحد على الأقل بسعر وكراتين باليت.</div>':'<div class="bk"><table><tr class="h"><td>الصنف</td><td class="vh">خطتك</td><td class="vh">الأحسن</td></tr>'+DEC.items.map((it,i)=>'<tr><td>'+esc([it.v,it.sz,it.pk].filter(Boolean).join(' · '))+'</td><td class="vh num">'+f(nb[i]||0,0)+'</td><td class="vh num"><b>'+f(ob.ni[i],0)+'</b></td></tr>').join('')+
  '<tr class="s"><td>سعر الخام للتعادل — '+modeName(base)+'</td><td class="vh num">'+fe(pb.R)+'</td><td class="vh num"><b>'+fe(ob.Rint)+'</b></td></tr><tr><td>'+modeName(oth)+' (أحسن توزيع)</td><td class="vh num">'+fe(po.R)+'</td><td class="vh num">'+(oo.status==='ok'?fe(oo.Rint):'—')+'</td></tr></table>'+
  '<div class="hint">الأحسن = توزيع '+f(Cb.cap,0)+' باليت في '+modeName(base)+' يدّي أعلى سعر خام، مع الحد الأقصى ونسبة المقاس من الفرز لو مكتوبين.'+(ob.full?'':' ⚠ الحدود القصوى مش مكمّلة السعة.')+'</div><button class="btn ghost wide" data-ha="apply">طبّق الأحسن — بيغيّر باليتات الصوافي كمان</button></div>';
 const sn=BE.sensitivity(S,Cs,DEC,base,DEC.items,nb);
 $('#beSen').innerHTML=sn.base==null?'':'<div class="bk"><table><tr class="h"><td>لو</td><td class="vh">ج/كجم خام</td><td class="vh">الفرق</td></tr>'+sn.rows.map(r=>'<tr><td>'+esc(r.n)+'</td><td class="vh num">'+fe(r.R)+'</td><td class="vh num">'+(r.d==null?'—':(r.d>=0?'+':'')+f(r.d))+'</td></tr>').join('')+'</table></div>';
 const supT=(Cs.sup||[]).reduce((a,x)=>a+(+x[1]||0),0);
 $('#beSrc').innerHTML='<div class="bk"><table>'+
  '<tr class="g"><td colspan="2">من الصوافي <a href="safi.html" class="lnk">تعديل ←</a></td></tr>'+
  '<tr><td>العميل والعمولة</td><td class="v">'+esc(S.client)+' · <span class="num">'+f(Cb.comm*100,1)+'%</span></td></tr>'+
  '<tr><td>ريال / دولار</td><td class="v num">'+f(S.sar,4)+'</td></tr>'+
  '<tr><td>مصروفات الحاوية في السعودية</td><td class="v"><span class="num">'+f(BE.ctx(S,Cs,DEC,'حاوية').expSar)+'</span> ريال</td></tr>'+
  '<tr><td>مصروفات البراد · نولون البراد</td><td class="v"><span class="num">'+f(BE.ctx(S,Cs,DEC,'براد').expSar)+'</span> · <span class="num">'+f(S.fB)+'</span> ريال</td></tr>'+
  '<tr><td>سعة البراد</td><td class="v"><input class="v sm-in" inputmode="decimal" data-h="cap.براد" value="'+esc(DEC.cap['براد'])+'" aria-label="سعة البراد"> باليت</td></tr>'+
  '<tr class="g"><td colspan="2">من التكاليف <a href="costs.html" class="lnk">تعديل ←</a></td></tr>'+
  '<tr><td>الهالك · الفرزة</td><td class="v"><span class="num">'+f(Cs.loss*100,1)+'%</span> · <span class="num">'+f(Cs.cull*100,1)+'%</span></td></tr>'+
  '<tr><td>سعر بيع الفرزة محلي</td><td class="v"><span class="num">'+f(Cs.cullP)+'</span> ج/كجم</td></tr>'+
  '<tr><td>مستلزمات الإنتاج</td><td class="v"><span class="num">'+f(supT)+'</span> ج/طن</td></tr>'+
  '<tr><td>العبوات</td><td class="v sm">'+(Cs.pk||[]).map(p=>esc(p[0])+' <span class="num">'+f(p[1])+'</span>').join('<br>')+'</td></tr>'+
  '<tr><td>الغسيل</td><td class="v sm">'+(Cs.var||[]).map(p=>esc(p[0])+' <span class="num">'+f(p[1],0)+'</span>').join('<br>')+'</td></tr>'+
  (COSTS.src==='fresh'?'<tr><td colspan="2" class="hint">التكاليف لسه بالأرقام الأساسية — لو عندك أرقام في برنامج التكاليف القديم استوردها من قسم التكاليف.</td></tr>':'')+
  '</table></div>'}
/* ---------- الأحداث ---------- */
const RULE={egp:'gt0',fC:'ge0',raw:'ge0','cap.حاوية':'int1','cap.براد':'int1'};
function check(raw,rule,opt){const t=String(raw==null?'':raw).trim();if(t==='')return opt?'':'فاضي — اكتب رقم';const x=parseNum(t);if(!isFinite(x))return 'مكتوب غلط';if(rule==='gt0'&&!(x>0))return 'لازم يكون أكبر من صفر';if(x<0)return 'مينفعش يكون بالسالب';if(rule==='pct'&&x>=100)return 'لازم تكون أقل من 100';if((rule==='int1'||rule==='int0')&&x!==Math.floor(x))return 'رقم صحيح (باليتات كاملة)';if(rule==='int1'&&x<1)return 'لازم باليت واحد على الأقل';return ''}
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.h==null)return;const key=t.dataset.h,raw=t.value;
 const m=key.match(/^items\.(\d+)\.(\w+)$/);const opt=m&&(m[2]==='max'||m[2]==='share');const rule=m?(m[2]==='share'?'pct':(m[2]==='pal'||m[2]==='max')?'int0':'ge0'):RULE[key];
 const msg=check(raw,rule,opt);const box=t.closest('.in')||t;box.classList.toggle('bad',!!msg);
 const host=t.closest('.f');if(host){host.querySelectorAll('.emsg').forEach(x=>x.remove());if(msg){const d=document.createElement('div');d.className='emsg';d.textContent=msg;(t.closest('.in')||t).insertAdjacentElement('afterend',d)}}
 if(msg){ERR[key]={msg,raw};return}delete ERR[key];const x=String(raw).trim()===''?'':parseNum(raw);
 if(key==='egp'){setFx(x)}else if(key==='fC'){writeSafi(S=>{S.fC=x})}else if(key==='raw'){writeCosts(S=>{S.raw=x})}
 else if(m){editItem(+m[1],m[2],x)}else{set(key,x);saveDec()}
 if(key==='egp'||key==='fC'||key==='raw'){lastT=Date.now();showSaved()}
 load();live()});
/* تعديل صنف من القرار = تعديل سطره في الصوافي (أو التكاليف للخام، أو زيادات القرار) */
function lineKeyAt(li){const S=readSafi().S;return S.lines[li]?SafiAuto.lineKey(S.lines[li]):''}
function editItem(i,f,x){const it=DEC.items[i];if(!it)return;
 if(f==='raw'){if(!it.rawVar)return;writeCosts(S=>{if(!S.rawBy||typeof S.rawBy!=='object'||Array.isArray(S.rawBy))S.rawBy={};S.rawBy[it.rawVar]=x;if(S.variety===it.rawVar)S.raw=x});lastT=Date.now();showSaved();return}
 if(f==='max'||f==='share'){const e=Object.assign({max:'',share:''},EXT.list[it.li]||{});e[f]=x;e.k=lineKeyAt(it.li);EXT.list[it.li]=e;saveExt();lastT=Date.now();showSaved();return}
 const old=lineKeyAt(it.li);writeSafi(S=>{const l=S.lines[it.li];if(!l)return;BESHIP.setField(l,f,x);
  if(f==='v'||f==='pk'){const L=sizes({v:SafiAuto.lineVar(l),pk:l[1]}),sz=BESHIP.szOf(l);if(sz&&L.length&&L.indexOf(sz)<0)BESHIP.setField(l,'sz','')}});
 const e=EXT.list[it.li];if(e&&e.k===old){e.k=lineKeyAt(it.li);saveExt()}lastT=Date.now();showSaved()}
function addLine(o){writeSafi(S=>{S.lines.push(BESHIP.newLine(o))});EXT.list.length=Math.max(EXT.list.length,0);lastT=Date.now()}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.h!=null&&!ERR[t.dataset.h]&&String(t.value).trim()!==''){const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x);return}
 if(!t.dataset||t.dataset.hs==null)return;const m=t.dataset.hs.match(/^items\.(\d+)\.(v|pk|sz)$/);if(m)editItem(+m[1],m[2],t.value);else set(t.dataset.hs,t.value);saveDec();render()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ha]');if(!b)return;const a=b.dataset.ha;
 if(a.startsWith('base:'))DEC.base=a.slice(5);
 else if(a==='add'){const pv=DEC.items[DEC.items.length-1]||{};addLine({v:pv.v||'',sz:'',pk:pv.pk||(SAFI.S.pk[0]?SAFI.S.pk[0][0]:''),cpp:pv.cpp||'',p:'',pal:0})}
 else if(a.startsWith('del:')){const it=DEC.items[+a.slice(4)];if(!it||!confirm('تحذف الصنف ده من الشحنة؟ هيتشال من سطور الصوافي كمان.'))return;writeSafi(S=>{S.lines.splice(it.li,1)});EXT.list.splice(it.li,1);saveExt();Object.keys(ERR).forEach(k=>{if(k.startsWith('items.'))delete ERR[k]})}
 else if(a==='apply'){const o=BE.optimize(BE.ctx(SAFI.S,COSTS.S,DEC,DEC.base),DEC.items);if(o.status!=='ok')return;const tx=DEC.items.map((it,i)=>(it.v||'—')+' '+it.pal+' ← '+o.ni[i]).join('\n');
  if(!confirm('هيتغيّر عدد الباليتات في سطور الصوافي:\n'+tx+'\nموافق؟'))return;const L=DEC.items.map(it=>it.li);writeSafi(S=>{L.forEach((li,i)=>{if(S.lines[li])BESHIP.setField(S.lines[li],'pal',o.ni[i])})});NOTE='اتطبّق أحسن توزيع — الباليتات اتغيرت في الصوافي كمان ('+o.ni.reduce((a,b)=>a+b,0)+' باليت).'}
 else return;saveDec();render()});
/* لما ترجع من قسم تاني أو التاب يرجع: اقرا الأرقام من جديد */
/* v2.6.0: حتى لو فيه خانة عليها الفوكس (رجعت من تاب الصوافي) نقرا الجديد ونرجّع الفوكس لنفس الخانة */
function refresh(){const a=document.activeElement,k=a&&a.dataset?(a.dataset.h!=null?['h',a.dataset.h]:a.dataset.hs!=null?['hs',a.dataset.hs]:null):null;syncFx();render();
 if(k){const n=document.querySelector('[data-'+k[0]+'="'+CSS.escape(k[1])+'"]');if(n){try{n.focus({preventScroll:true});if(n.setSelectionRange)n.setSelectionRange(n.value.length,n.value.length)}catch(e){}}}}
window.addEventListener('pageshow',e=>{if(e.persisted)refresh()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
window.addEventListener('storage',e=>{if(!e.key||/^(safiNetback|citrusCosts|decision|fx)/.test(e.key))refresh()});
['pagehide','beforeunload'].forEach(ev=>window.addEventListener(ev,()=>{if(!Object.keys(ERR).length)saveDec()}));
function keepStore(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}}keepStore();
/* عند الفتح: لو localStorage اتمسح وفيه نسخة IndexedDB نرجّعها */
function restoreIdb(){Promise.all([idbGet('dec'),idbGet('S')]).then(([d,s])=>{let ch=false;
 const ud=BE.unwrap(d),cur=BE.unwrap(lsGet(K.dec));if(ud&&(!cur||(ud.t||0)>(cur.t||0))){lsSet(K.dec,d);lsSet(K.decM,d);ch=true}
 const us=BE.unwrap(s),cs=BE.unwrap(lsGet(K.safi))||BE.unwrap(lsGet(K.safiM));if(us&&okSafi(us.S)&&!cs){lsSet(K.safi,s);lsSet(K.safiM,s);ch=true}
 if(ch){syncFx();render()}})}
migrateOnce();migrate26();syncFx();if(readDec().fresh)saveDec();render();restoreIdb();
window.DECAPP={render,live,planFor,addLine:o=>{addLine(o);render()},state:()=>({safi:SAFI.S,costs:COSTS.S,dec:DEC}),BE};
})();
