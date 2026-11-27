/* الصوافي — الواجهة والتقرير (v1.2.0). الحساب كله من calc() الأصلية في core.js */
const VER='2.3.1';
/* تحميل البيانات المحفوظة — نفس مفتاح وشكل وتحويل البرنامج الأصلي */
const SK='safiNetback.v2';
/* التخزين: localStorage، ولو مش متاح (تصفح خاص/قيود الجهاز) نشتغل في الذاكرة ونظهر تنبيه.
   آخر حالة بتتحفظ مع كل تغيير في SK + نسخة احتياطية SK_M، ومفيش أي رجوع للمدخلات الرئيسية لوحده أبدًا. */
const SK_M='safiNetback.v2.mirror',SK_B='safiNetback.v2.beforeReset',SK_P='safiNetback.v2.userPinned';
const MEM={};let STORE_OK=true;
try{const tk='safiNetback.v2.probe';localStorage.setItem(tk,'1');localStorage.removeItem(tk)}catch(e){STORE_OK=false}
function lsGet(k){if(STORE_OK){try{return localStorage.getItem(k)}catch(e){}}return k in MEM?MEM[k]:null}
function lsSet(k,v){MEM[k]=v;if(!STORE_OK)return false;try{localStorage.setItem(k,v);return true}catch(e){return false}}
function lsDel(k){delete MEM[k];if(STORE_OK){try{localStorage.removeItem(k)}catch(e){}}}
function okState(o){return !!(o&&typeof o==='object'&&Array.isArray(o.lines))}
function readState(k){try{const raw=lsGet(k);if(!raw)return null;const p=JSON.parse(raw);const o=p&&p.S?p.S:p;return okState(o)?{S:o,t:p&&p.t||null}:null}catch(e){return null}}
const EXTRA_SAFI_PK=[['صندوق بلاستيك 5 ك ملوّن',5,200],['صندوق بلاستيك 2.5 ك ملوّن',2.5,400]];
function ensureSafiPacks(s){if(!s||!Array.isArray(s.pk))return s;EXTRA_SAFI_PK.forEach(p=>{if(!s.pk.some(x=>x&&x[0]===p[0]))s.pk.push(p.slice())});return s}
function palOf(name){const p=(S.pk||[]).find(x=>x[0]===name);return p&&+p[2]>0?+p[2]:0}
function fromObj(o){const d=JSON.parse(JSON.stringify(DEF));for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];return ensureSafiPacks(d)}
/* المدخلات الرئيسية: اللي ثبّتها المستخدم على الجهاز ده لو موجودة، وإلا المثبّتة في pinned.js */
function mainInputs(){const u=readState(SK_P);const s=fromObj(JSON.parse(JSON.stringify(u?u.S:PINNED)));migrateLines(s.lines);ExpMig.migrateExp(s);s.date=cairoISO();return s}
let S,FRESH=false,EXPMIG=false;
(function load(){let st=readState(SK);if(!st)st=readState(SK_M);
 if(st){S=fromObj(st.S);if(ExpMig.migrateExp(S))EXPMIG=true}
 else{let old=null;try{const r2=lsGet('safiNetback');if(r2)old=JSON.parse(r2)}catch(e){}
  if(okState(old)){S=fromObj(old);if(ExpMig.migrateExp(S))EXPMIG=true}else{S=mainInputs();FRESH=true}}
 migrateLines(S.lines);if(!parseDateInput(S.date)&&!parseDateInput(D(S.date)))S.date=cairoISO()})();
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const N=x=>'<span class="num">'+x+'</span>';
const P=x=>'<span class="num">'+x+'</span>';
function pl(v){return v>=0?'ربح '+f(v):'خسارة '+f(-v)}            // منسوخة من الأصلي
const plH=v=>pl(v).replace(/([\d,.-]+)/,'<span class="num">$1</span>');
function cairoISO(d){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d||new Date())}
function D(x){const m=String(x||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:x}
function today(){return D(cairoISO())}
function parseDateInput(x){var s=String(x==null?'':x).trim().replace(/[\u0660-\u0669]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[\u06F0-\u06F9]/g,c=>String(c.charCodeAt(0)-0x6F0)).replace(/[\u066B\u066C\u2013\u2014.\-]/g,'/').replace(/\s+/g,'');
 var y,mo,d,m;if((m=s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/))){y=+m[1];mo=+m[2];d=+m[3]}else if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))){d=+m[1];mo=+m[2];y=+m[3]}else return '';
 if(mo<1||mo>12||d<1||d>31||y<1990||y>2100)return '';const dt=new Date(Date.UTC(y,mo-1,d));if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)return '';
 return y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function dateShown(){return 'date' in DR?DR.date:D(S.date)}
function applyFreshDate(){try{if(!localStorage.getItem(SK)&&!localStorage.getItem('safiNetback'))S.date=cairoISO()}catch(e){}if(!parseDateInput(S.date)&&!parseDateInput(D(S.date)))S.date=cairoISO()}
function linePal(l){return +l[4]||0}function lineCpp(l){return +l[5]||0}
function syncQty(l){l[2]=(+l[4]||0)*(+l[5]||0);return l}
function migrateLines(lines){(lines||[]).forEach(l=>{if(l[4]==null||l[5]==null){const q=+l[2]||0;l[4]=q?1:0;l[5]=q}syncQty(l)});return lines}
function palTotals(){let pal=0,ctn=0;S.lines.forEach(l=>{pal+=+l[4]||0;ctn+=+l[2]||0});return{pal,ctn}}
function saleMeta(){const m=[];S.lines.forEach(l=>{if(+l[2])m.push({pal:linePal(l),cpp:lineCpp(l),cost:lineCost(l)})});return m}
function hasCost(l){return l&&l[6]!=null&&l[6]!==''}
function lineCost(l){return hasCost(l)?+l[6]:null}
function costShown(l,i){const key='lines:'+i+':6';return key in DR?DR[key]:(hasCost(l)?l[6]:'')}
function needCost(){return 'أدخل التكلفة'}
/* الربح/الخسارة والتعادل من تكلفة كل صنف (مرجّحة بالطن). الصافي نفسه من calc() من غير تغيير. */
function attachCosts(r){const src=S.lines.filter(l=>+l[2]),u=S.sar,E=S.egp,comm=r.comm;let all=true,costT=0;
 r.lines.forEach((x,i)=>{const c=lineCost(src[i]);x.cost=c;
  if(c==null){all=false;x.plTon=null;x.plShip=null;x.beLine=null}
  else{x.plTon=x.nt*E-c;x.plShip=x.plTon*x.t;const sh=r.t?r.shared*x.t/r.t:0;x.beLine=x.q?(c/E*x.t*u+sh)/(1-comm)/x.q:null;costT+=c*x.t}});
 r.costReady=!!(all&&r.lines.length&&r.t);r.costAvg=r.costReady?costT/r.t:null;
 if(r.costReady){r.plTon=r.tonEgp-r.costAvg;r.plShip=r.plTon*r.t;r.be=r.q?(r.costAvg/E*r.t*u+r.shared)/(1-comm)/r.q:0}
 else{r.plTon=null;r.plShip=null;r.be=null}
 r.types.forEach(tp=>{const L=r.lines.filter(x=>x.p===tp.n);
  if(!L.length||L.some(x=>x.cost==null)){tp.be=null;tp.costAvg=null;tp.plTon=null;return}
  const t=L.reduce((a,x)=>a+x.t,0),avg=t?L.reduce((a,x)=>a+x.cost*x.t,0)/t:null;tp.costAvg=avg;
  const g=r.t?-r.shared*t/r.t:0;tp.be=tp.q?(avg/E*t*u-g)/(1-comm)/tp.q:null;tp.plTon=tp.nt!=null?tp.nt*E-avg:null});
 return r}
function result(){return attachCosts(calc(S))}
const pct=(v,b)=>b?f(v/b*100,1)+'%':'—';
let ERR={},DR={};            // أخطاء المدخلات والنص المكتوب غلط — مفتاح منفصل (S فيها آخر قيمة صحيحة)
const UK='safiNetback.v2.pending';try{const u=JSON.parse(lsGet(UK)||'null');if(u&&u.ERR&&u.DR){ERR=u.ERR;DR=u.DR}}catch(e){}
delete ERR['k:cost'];delete DR['k:cost'];
let lastT=null;
let saveTimer=null;
let SAVE_FAIL=false;
function persist(){lastT=Date.now();const j=JSON.stringify({ver:2,t:lastT,S});const a=lsSet(SK,j),b=lsSet(SK_M,j);
 if(Object.keys(ERR).length)lsSet(UK,JSON.stringify({ERR,DR}));else lsDel(UK);SAVE_FAIL=!(a||b);showSaved()}
/* الحفظ فوري مع كل تغيير (مش بعد مهلة) عشان لو الموبايل اتقفل أو سفاري عمل reload ميضيعش حاجة */
function save(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null}persist()}
function flushSave(){save(true)}
function showSaved(){const n=$('#ls');if(!n)return;if((!STORE_OK||SAVE_FAIL)&&IDB_OK!==true){n.textContent='⚠ الحفظ مؤقت — الجهاز مانع التخزين (تصفح خاص؟)';n.classList.add('warn');return}n.classList.remove('warn');if(!lastT)return;const d=new Date(lastT);n.textContent='اتحفظ ✓ الساعة '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
try{const p=JSON.parse(lsGet(SK)||'null');if(p&&p.t)lastT=p.t}catch(e){}
/* v1.3.0: حفظ لحظي مضاعف — كل تغيير بيتكتب فورًا في localStorage وفي IndexedDB (أثبت على الآيفون لو التاب اتقفل)،
   ونسخة لكل يوم (حسب تاريخ الحساب) بتفضل على الموبايل 60 يوم — «📂 الأيام المحفوظة». */
const IDBN='sawafi-store',SK_D='safiNetback.v2.days',KEEP_DAYS=60;let IDB_OK=null,idbP=null,dayT=null;
function idbOpen(){if(idbP)return idbP;idbP=new Promise(res=>{try{const op=indexedDB.open(IDBN,1);op.onupgradeneeded=()=>{if(!op.result.objectStoreNames.contains('kv'))op.result.createObjectStore('kv')};op.onsuccess=()=>{const db=op.result;db.onversionchange=()=>{try{db.close()}catch(e){}idbP=null};db.onclose=()=>{idbP=null};res(db)};op.onerror=op.onblocked=()=>{idbP=null;res(null)}}catch(e){idbP=null;res(null)}});return idbP}
function idbTx(fn,mode){return idbOpen().then(db=>new Promise(res=>{if(!db)return res({ok:false});let out;try{const t=db.transaction('kv',mode||'readonly');out=fn(t.objectStore('kv'));t.oncomplete=()=>res({ok:true,v:out&&out.result});t.onerror=t.onabort=()=>res({ok:false})}catch(e){idbP=null;res({ok:false,retry:true})}}))}
function idbRun(fn,mode){return idbTx(fn,mode).then(r=>r.retry?idbTx(fn,mode):r)}
function snap(){return JSON.stringify({ver:2,t:lastT||Date.now(),S,pending:Object.keys(ERR).length?{ERR,DR}:undefined})}
function lsDays(){try{return JSON.parse(lsGet(SK_D)||'{}')||{}}catch(e){return {}}}
function archiveDay(){const j=snap(),k=String(S.date||'');if(!k)return;idbRun(o=>{o.put(j,'day:'+k)},'readwrite');
 try{const A=lsDays();A[k]={t:lastT||Date.now(),S};const lim=Date.now()-KEEP_DAYS*864e5;const B={};Object.keys(A).filter(x=>A[x]&&(A[x].t||0)>lim).sort((x,y)=>(A[y].t||0)-(A[x].t||0)).slice(0,KEEP_DAYS).forEach(x=>B[x]=A[x]);lsSet(SK_D,JSON.stringify(B))}catch(e){}}
const _persist0=persist;
let IDB_READY=false;
persist=function(){_persist0();if(!IDB_READY)return;const j=snap();idbRun(o=>{o.put(j,'S')},'readwrite').then(r=>{const was=IDB_OK;IDB_OK=r.ok;if(was!==IDB_OK)showSaved()});clearTimeout(dayT);dayT=setTimeout(archiveDay,1200)};
['pagehide','beforeunload','freeze'].forEach(ev=>window.addEventListener(ev,()=>{try{archiveDay()}catch(e){}}));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')try{archiveDay()}catch(e){}});
/* Safari: اطلب إن التخزين يفضل (ومرة تانية بعد أول لمسة) */
function keepStore(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}}keepStore();document.addEventListener('pointerdown',keepStore,{once:true,capture:true});
async function savedDays(){const m={};const A=lsDays();Object.keys(A).forEach(k=>{if(A[k]&&A[k].S)m[k]={date:k,t:A[k].t||0,S:A[k].S}});
 const r=await idbRun(o=>o.getAllKeys());const keys=(r.ok&&r.v||[]).filter(k=>String(k).startsWith('day:'));
 if(keys.length){const g=await idbRun(o=>{const out={};keys.forEach(k=>{const q=o.get(k);q.onsuccess=()=>{out[k]=q.result}});return {result:out}});const out=(g.ok&&g.v)||{};
  Object.keys(out).forEach(k=>{try{const p=JSON.parse(out[k]);const d=k.slice(4);if(p&&okState(p.S)&&(!m[d]||m[d].t<(p.t||0)))m[d]={date:d,t:p.t||0,S:p.S}}catch(e){}})}
 const lim=Date.now()-KEEP_DAYS*864e5;const stale=keys.filter(k=>{const x=m[k.slice(4)];return x&&x.t<lim});if(stale.length)idbRun(o=>{stale.forEach(k=>o.delete(k))},'readwrite');
 return Object.values(m).filter(x=>x.t>=lim&&x.date!==S.date).sort((a,b)=>b.t-a.t)}
async function paintDays(){const b=$('#bDays');if(!b)return;const L=await savedDays().catch(()=>[]);b.hidden=!L.length;b.textContent='📂 الأيام المحفوظة ('+L.length+')'}
async function openDays(){const L=await savedDays();const w=document.createElement('div');w.id='daysSheet';w.style.cssText='position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:flex-end;justify-content:center';
 const hm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
 w.innerHTML='<div style="background:#fff;color:#111;width:100%;max-width:520px;max-height:80vh;overflow:auto;border-radius:16px 16px 0 0;padding:14px 14px max(14px,env(safe-area-inset-bottom))"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:17px">📂 الأيام المحفوظة</b><button type="button" class="btn ghost" data-dd="x">إغلاق</button></div><div style="font-size:13px;color:#475569;margin-bottom:8px">كل تاريخ حساب محفوظ لوحده على الموبايل ده ('+KEEP_DAYS+' يوم). اللي إنت فيه دلوقتي بيفضل محفوظ برضه.</div>'+
  (L.length?L.map(x=>'<div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b dir="ltr">'+esc(D(x.date))+'</b> · '+esc(x.S.client||'')+' · '+esc(x.S.mode||'')+'<div style="font-size:12px;color:#64748b">آخر حفظ '+new Date(x.t).toLocaleDateString('en-GB')+' '+hm(x.t)+'</div></div><button type="button" class="btn" data-dd="'+esc(x.date)+'">افتح</button></div>').join(''):'<div style="padding:16px;text-align:center;color:#64748b">مفيش أيام تانية محفوظة</div>')+'</div>';
 w.addEventListener('click',e=>{e.stopPropagation();const t=e.target.closest('[data-dd]');if(e.target===w||t&&t.dataset.dd==='x'){w.remove();return}if(!t)return;const x=L.find(y=>y.date===t.dataset.dd);if(!x)return;
  flushSave();archiveDay();S=ExpMig.keepExp(fromObj(JSON.parse(JSON.stringify(x.S))));migrateLines(S.lines);ERR={};DR={};save();renderAll();w.remove();scrollTo(0,0)});
 document.body.appendChild(w)}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#bDays'))openDays()});
/* عند الفتح: لو نسخة IndexedDB أحدث من localStorage (أو localStorage اتمسح) نرجّعها */
function restoreFromIdb(){return idbRun(o=>o.get('S')).then(r=>{IDB_OK=r.ok;let p=null;try{p=r.ok&&r.v?JSON.parse(r.v):null}catch(e){}
 IDB_READY=true;const lsT=(typeof FRESH!=='undefined'&&FRESH)?0:(lastT||0);
 if(p&&okState(p.S)&&(p.t||0)>lsT){S=fromObj(p.S);ExpMig.migrateExp(S);migrateLines(S.lines);if(p.pending&&p.pending.ERR&&p.pending.DR){ERR=p.pending.ERR;DR=p.pending.DR}else{ERR={};DR={}}lastT=p.t;_persist0();renderAll();window.__restoredFromIdb=true}
 else{const j=snap();idbRun(o=>{o.put(j,'S')},'readwrite')}showSaved();paintDays()})}

if(FRESH||EXPMIG)persist();
window.addEventListener('pagehide',flushSave);
window.addEventListener('beforeunload',flushSave);
window.addEventListener('freeze',flushSave);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});

/* ---------- المدخلات ---------- */
const FIELDS=[['sec','أسعار الصرف'],['sar','سعر الدولار بالريال','ريال / $'],['egp','سعر الدولار بالجنيه','ج / $'],
 ['sec','النولون من مصر'],['fC','نولون الحاوية','$','حاوية'],['fB','نولون البراد','ريال','براد']];
function shown(k){const key='k:'+k;if(key in DR)return DR[key];return S[k]}
function renderInputs(){let h='<div class="f full"><label>تاريخ الحساب</label><div class="in'+(ERR.date?' bad':'')+'"><input data-date="1" dir="ltr" inputmode="numeric" autocomplete="off" placeholder="يوم/شهر/سنة" aria-label="تاريخ الحساب يوم/شهر/سنة" value="'+esc(dateShown())+'"></div>'+(ERR.date?'<div class="emsg" data-for="date">'+esc(ERR.date)+'</div>':'')+'<div class="hint">ميلادي — يوم/شهر/سنة</div></div>';
 FIELDS.forEach(x=>{if(x[0]=='sec'){h+='<div class="sec">'+x[1]+'</div>';return}const key='k:'+x[0];
  h+='<div class="f"><label>'+x[1]+'</label><div class="in'+(ERR[key]?' bad':'')+'"><input inputmode="decimal" data-k="'+x[0]+'" value="'+esc(shown(x[0]))+'"><span class="u">'+x[2]+'</span></div>'+
  (ERR[key]?'<div class="emsg" data-for="'+key+'">'+ERR[key]+'</div>':'')+(x[3]?'<div class="hint'+(S.mode==x[3]?' on':'')+'" data-mh="'+x[3]+'">'+(S.mode==x[3]?'محسوب — الشحن '+x[3]:'مش محسوب — الشحن مش '+x[3])+'</div>':'')+'</div>'});
 $('#inputs').innerHTML=h}
function val(key,v){return key in DR?DR[key]:v}
function cell(key,v,cls,ph){const bad=ERR[key];return '<input class="'+(cls||'')+(bad?' bad':'')+'" '+(cls=='v'?'inputmode="decimal" ':'')+(ph?'aria-label="'+ph+'" ':'')+'data-t="'+key+'" value="'+esc(val(key,v))+'">'}
/* v1.4.0 «تعبئة جديدة»: الأصناف والعبوات من برنامج الإنتاج (sizes.js منسوخ زي ما هو من alola-production 65069ec — للقراءة بس).
   سطر البيع زي ما هو: [الصنف، العبوة، الكراتين، السعر، باليتات، كراتين/باليت، تكلفة الطن] + خانة 7 = {v: الصنف، s: المقاس} للاختيار.
   l[0] = الصنف + « مقاس N» — الحساب (calc) ما اتغيرش. */
const ALSX=window.ALS||{GROUPS:{},VARIETIES:[],PACKS:[]};
const PRODPK=(()=>{const out=[],seen={};(ALSX.PACKS||[]).forEach(p=>{if(seen[p.carton])return;seen[p.carton]=1;
  const jumbo=/جامبو/.test(p.carton);const n=jumbo?'صندوق بلاستيك جامبو 15 ك':p.label,kg=jumbo?15:p.kg;
  out.push({n,kg,alias:p.carton})});return out})();
const prodPk=n=>PRODPK.find(p=>p.n===n);
function lineMeta(l){const m=l&&l[7];return m&&typeof m==='object'?m:null}
function nameOf(v,sz){v=String(v||'').trim();sz=String(sz||'').trim();return v+(v&&sz?' مقاس '+sz:'')}
function sizesOf(l){const m=lineMeta(l);if(!m||!m.v||!ALSX.groupOf)return [];const g=ALSX.groupOf(m.v);if(!g)return [];const pk=ALSX.packOf(g,l[1]);const r=ALSX.sizesFor(g,pk);return r===null?null:r}
function varOpts(l){const m=lineMeta(l),cur=m?m.v:'';const known=[].concat(ALSX.VARIETIES||[],S.xv||[]);let o='<option value=""'+(cur||l[0]?'':' selected')+'>اختار الصنف…</option>';
  if(!m&&l[0])o+='<option selected value="__keep">'+esc(l[0])+'</option>';else if(cur&&!known.includes(cur))o+='<option selected>'+esc(cur)+'</option>';
  Object.values(ALSX.GROUPS||{}).forEach(g=>{let vars=g.vars.slice();if(g.name==='أفندي'||g.name==='افندي'){['أفندي','يوسفي'].forEach(v=>{if(!vars.includes(v))vars.push(v)})}o+='<optgroup label="'+esc(g.name)+'">'+vars.map(v=>'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('')+'</optgroup>'});
  if((S.xv||[]).length)o+='<optgroup label="أصناف مضافة">'+S.xv.map(v=>'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('')+'</optgroup>';
  return o+'<option value="__newv">+ صنف جديد…</option>'}
/* v1.4.1: «+ جديد» بخانة كتابة جوه السطر بدل prompt() (آيفون)، وقيمة كل قائمة بتتحط بالـ JS بعد الرسم
   (سفاري/WebKit: option أول disabled + optgroup بيخلي المتصفح يختار آخر اختيار «+ صنف جديد…» مهما كان selected). */
let NEWED=null,PKNEW=false;
function newIn(kind,i,ph,val,num){return '<div class="nwin"><input '+(num?'class="v" inputmode="decimal" ':'')+'data-nw="'+kind+'" data-i="'+i+'" placeholder="'+ph+'" value="'+esc(val||'')+'" enterkeyhint="done"><button class="x ok" data-nwok="'+kind+'" data-i="'+i+'" aria-label="تمام">✓</button></div>'}
function pickVals(l){const m=lineMeta(l);return {pv:!m?(l[0]?'__keep':''):m.v,ps:m?String(m.s||''):'',pk:l[1]}}
function fixSelects(root){(root||document).querySelectorAll('select[data-pv],select[data-ps],select[data-t$=":1"]').forEach(sel=>{if(sel.dataset.t&&!sel.dataset.t.startsWith('lines:'))return;const i=+(sel.dataset.pv!=null?sel.dataset.pv:sel.dataset.ps!=null?sel.dataset.ps:sel.dataset.t.split(':')[1]);const l=S.lines[i];if(!l)return;
  const v=pickVals(l)[sel.dataset.pv!=null?'pv':sel.dataset.ps!=null?'ps':'pk'];const k=[...sel.options].findIndex(x=>x.value===v);sel.selectedIndex=k>=0?k:0})}
function sizeCell(l,i){if(NEWED&&!S.lines[NEWED.i])NEWED=null;if(NEWED&&NEWED.k==='s'&&NEWED.i===i)return newIn('s',i,'المقاس',NEWED.d||'',1);const m=lineMeta(l),cur=m?String(m.s||''):'',L=sizesOf(l);
  if(L===null)return '<input class="v" inputmode="numeric" data-ps="'+i+'" aria-label="المقاس (العدد)" placeholder="المقاس" value="'+esc(cur)+'">';
  const all=L.slice();if(cur&&!all.includes(cur))all.unshift(cur);
  return '<select data-ps="'+i+'" aria-label="المقاس"'+(!m||!m.v?' disabled':'')+'><option value="">'+(m&&m.v?'المقاس —':'المقاس')+'</option>'+all.map(z=>'<option'+(z===cur?' selected':'')+'>'+esc(z)+'</option>').join('')+(m&&m.v?'<option value="__news">+ مقاس تاني…</option>':'')+'</select>'}
function pkOpts(sel){let o=S.pk.map(p=>{const a=prodPk(p[0]);return '<option value="'+esc(p[0])+'"'+(p[0]===sel?' selected':'')+'>'+esc(p[0])+(a&&a.alias&&a.alias.split(/\s+/).some(w=>!p[0].split(/\s+/).includes(w))?' ('+esc(a.alias)+')':'')+'</option>'}).join('');if(!S.pk.some(p=>p[0]===sel))o='<option selected value="'+esc(sel)+'">'+esc(sel)+' (مش في جدول العبوات)</option>'+o;
  const extra=PRODPK.filter(p=>!S.pk.some(q=>q[0]===p.n));if(extra.length)o+='<optgroup label="عبوات برنامج الإنتاج">'+extra.map(p=>'<option value="prod:'+esc(p.n)+'">'+esc(p.n)+' — '+p.kg+' كجم</option>').join('')+'</optgroup>';
  return o+'<option value="__newpk">+ عبوة جديدة…</option>'}
function setPack(row,v){if(v.startsWith('prod:')){const p=prodPk(v.slice(5));if(p&&!S.pk.some(q=>q[0]===p.n))S.pk.push([p.n,p.kg,p.pal||0]);row[1]=p?p.n:row[1];const pal=palOf(row[1]);if(pal){row[5]=pal;syncQty(row)}return true}
  if(v==='__newpk'){NEWED={k:'pk',i:S.lines.indexOf(row)};return true}
  row[1]=v;const pal=palOf(v);if(pal){row[5]=pal;syncQty(row)}return false}
function renderTables(){
 $('#lt').innerHTML='<div class="lhd"><span class="pkg">الصنف · المقاس · العبوة (من برنامج الإنتاج)</span><span>باليتات</span><span>كراتين/باليت</span><span>الكراتين</span><span>السعر ريال</span></div>'+S.lines.map((l,i)=>'<div class="ln'+(!l[0]?' need':'')+'" data-line="'+i+'"><div class="r1 rv">'+(NEWED&&NEWED.k==='v'&&NEWED.i===i?newIn('v',i,'اكتب اسم الصنف',NEWED.d||''):'<select data-pv="'+i+'" aria-label="الصنف">'+varOpts(l)+'</select>')+sizeCell(l,i)+'<button class="x" data-del="lines:'+i+'" aria-label="حذف">×</button></div><div class="r2">'+(NEWED&&NEWED.k==='pk'&&NEWED.i===i?'<div class="nwin pkn"><input data-nw="pkn" data-i="'+i+'" placeholder="اسم العبوة (مثال: صندوق بلاستيك 5 ك ملوّن)"><input class="v" inputmode="decimal" data-nw="pkw" data-i="'+i+'" placeholder="الوزن كجم"><input class="v" inputmode="decimal" data-nw="pkp" data-i="'+i+'" placeholder="صندوق/باليت" enterkeyhint="done"><button class="x ok" data-nwok="pk" data-i="'+i+'" aria-label="تمام">✓</button><button class="x" data-nwx="1" aria-label="إلغاء">↩</button></div>':'<select data-t="lines:'+i+':1" aria-label="نوع العبوة">'+pkOpts(l[1])+'</select>')+cell('lines:'+i+':4',l[4],'v','باليتات')+cell('lines:'+i+':5',l[5],'v','كراتين في الباليت')+'<div class="qauto" data-cartons="'+i+'" title="الكراتين = الباليتات × كراتين الباليت">'+f(+l[2]||0,0)+'</div>'+cell('lines:'+i+':3',l[3],'v','سعر العبوة')+'</div><div class="r2c"><div><label class="clab">تكلفة الطن هنا</label><div class="in'+(ERR['lines:'+i+':6']?' bad':'')+'"><input inputmode="decimal" class="v" data-t="lines:'+i+':6" aria-label="تكلفة الطن بالجنيه" value="'+esc(costShown(l,i))+'" placeholder="أدخل التكلفة"><span class="u">ج / طن</span></div></div><div class="plbox" data-pl="'+i+'"></div></div>'+errMsgs('lines:'+i)+'<div class="lv" data-lv="'+i+'"></div></div>').join('')+
  '<div class="ltot" id="ltTot"></div>';fixSelects($('#lt'));
 const on=j=>((S.mode=='براد')==(j==1))?' class="on"':'';
 const md=j=>((S.mode=='براد')==(j==1))?' on':' off';
 $('#et').innerHTML=S.exp.map((e,i)=>'<div class="ln"><div class="r1">'+cell('exp:'+i+':0',e[0],'txt','البند')+'<button class="x" data-del="exp:'+i+'" aria-label="حذف">×</button></div><div class="r2e"><div class="mi'+md(1)+'"><span>براد</span>'+cell('exp:'+i+':1',e[1],'v','براد')+'</div><div class="mi'+md(2)+'"><span>حاوية</span>'+cell('exp:'+i+':2',e[2],'v','حاوية')+'</div></div>'+errMsgs('exp:'+i)+'</div>').join('')+
  '<div class="r2e tt"><div class="mi'+md(1)+'"><span>إجمالي البراد</span><b id="eB" class="num"></b></div><div class="mi'+md(2)+'"><span>إجمالي الحاوية</span><b id="eC" class="num"></b></div></div>';
 $('#ct').innerHTML='<div class="r3 th"><span>العميل</span><span>العمولة %</span><span></span></div>'+S.clients.map((c,i)=>'<div class="r3">'+cell('clients:'+i+':0',c[0])+cell('clients:'+i+':1',+(c[1]*100).toFixed(4),'v','العمولة %')+'<button class="x" data-del="clients:'+i+'" aria-label="حذف">×</button></div>'+errMsgs('clients:'+i)).join('');
 let pkAdd='';if(PKNEW)pkAdd='<div class="nwin pkn pkadd"><input data-nw="tpkn" placeholder="اسم العبوة"><input class="v" inputmode="decimal" data-nw="tpkw" placeholder="الوزن كجم"><input class="v" inputmode="decimal" data-nw="tpkp" placeholder="صندوق/باليت" enterkeyhint="done"><button class="x ok" id="bTblPkOk" aria-label="تمام">✓</button><button class="x" id="bTblPkX" aria-label="إلغاء">↩</button></div>';
 $('#pt').innerHTML='<div class="r4 th"><span>نوع العبوة</span><span>الوزن كجم</span><span>صندوق/باليت</span><span></span></div>'+pkAdd+S.pk.map((p,i)=>'<div class="r4">'+cell('pk:'+i+':0',p[0])+cell('pk:'+i+':1',p[1],'v','الوزن كجم')+cell('pk:'+i+':2',p[2]||'','v','صناديق في الباليت')+'<button class="x" data-del="pk:'+i+'" aria-label="حذف">×</button></div>'+errMsgs('pk:'+i)).join('')}
function errMsgs(pre){return Object.keys(ERR).filter(k=>k.startsWith(pre+':')).map(k=>'<div class="emsg sm" data-for="'+k+'">'+esc(errName(k))+': '+ERR[k]+'</div>').join('')}
function renderChips(){
 $('#clis').innerHTML=S.clients.map((c,i)=>'<button class="chip'+(c[0]===S.client?' on':'')+'" data-c="'+i+'">'+esc(c[0])+'<span class="pc num">'+f(c[1]*100,1)+'%</span></button>').join('');
 $('#modes').innerHTML=['حاوية','براد'].map(m=>'<button class="chip sm'+(m===S.mode?' on':'')+'" data-m="'+m+'">'+m+'</button>').join('')}
const COLN={lines:{3:'السعر',4:'الباليتات',5:'كراتين الباليت',6:'تكلفة الطن'},exp:{1:'براد',2:'حاوية'},clients:{1:'العمولة'},pk:{1:'الوزن'}};
function errName(k){if(k==='date')return 'تاريخ الحساب';const a=k.split(':');if(a[0]=='k')return RULES[a[1]][0];const row=(S[a[0]]||[])[a[1]]||[''];
 return {lines:'سطر',exp:'بند',clients:'عميل',pk:'عبوة'}[a[0]]+' «'+row[0]+'» — '+COLN[a[0]][a[2]]}
function errList(all){return Object.keys(ERR).filter(k=>all||(k!=='date'&&!/^lines:\d+:6$/.test(k))).map(k=>errName(k)+': '+ERR[k])}

/* ---------- العرض المباشر ---------- */
function chainRows(r){return [['إجمالي المبيعات',r.sales],['العمولة ('+f(r.comm*100,1)+'%)',r.commV],['مصروفات '+S.mode+' في السعودية',r.expV],['نولون الشحن من مصر',r.frV],['الصافي بعد المصاريف',r.net,'t']]}
function renderLive(){const E=errList(),bad=E.length>0;document.body.classList.toggle('invalid',bad);
 $('#net').innerHTML=esc(S.client)+' · '+esc(S.mode);
 document.querySelectorAll('[data-mh]').forEach(h=>{const on=h.dataset.mh==S.mode;h.classList.toggle('on',on);h.textContent=on?'محسوب — الشحن '+h.dataset.mh:'مش محسوب — الشحن مش '+h.dataset.mh});
 if(bad){$('#notice').hidden=true;$('#sum').innerHTML='<div class="lbl">صافي الطن هنا</div><div class="big"><span class="egp num">—</span></div><div class="err"><b>مفيش حساب لحد ما تصحح الخانات المعلّمة:</b><ul>'+E.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul></div>';
  ['#mojmal','#detail'].forEach(s=>$(s).innerHTML='<h2>'+{'#mojmal':'المجمل','#detail':'التفاصيل'}[s]+'</h2><div class="hint">هيظهر بعد تصحيح المدخلات.</div>');['#eB','#eC'].forEach(s=>{const e=$(s);if(e)e.textContent='—'});document.querySelectorAll('[data-lv]').forEach(e=>e.textContent='');return}
 const r=result(),u=S.sar,E2=S.egp;window.__r=r;
 const nv=$('#notice');nv.hidden=!r.warn;nv.textContent=r.warn||'';
 $('#sum').innerHTML='<div class="lbl">صافي الطن هنا — '+esc(S.client)+' · '+esc(S.mode)+'</div><div class="big"><span class="egp num">'+f(r.tonEgp)+'<i>ج</i></span><span class="usd num">$'+f(r.tonUsd)+'</span></div>'+
  '<div class="kpis six">'+
  '<div class="kpi"><span>صافي الكيلو</span><b class="num">'+f(r.kgEgp)+' ج</b><em class="num">$'+f(r.tonUsd/1000,3)+'</em></div>'+
  '<div class="kpi"><span>صافي العبوة (متوسط)</span><b class="num">'+f(r.pkgEgp)+' ج</b><em><span class="num">$'+f(r.pkgUsd)+'</span> · <span class="num">'+f(r.pkgSar)+'</span> ريال</em></div>'+
  '<div class="kpi"><span>صافي الشحنة</span><b class="num">'+f(r.netEgp)+' ج</b><em><span class="num">$'+f(r.net/S.sar)+'</span> · <span class="num">'+f(r.net)+'</span> ريال</em></div>'+
  '<div class="kpi"><span>الكمية المباعة</span><b class="num">'+f(palTotals().ctn,0)+' كرتونة</b><em><span class="num">'+f(palTotals().pal,0)+'</span> باليت · <span class="num">'+f(r.t,3)+'</span> طن</em></div>'+
  '<div class="kpi wide'+(r.costReady&&r.plTon<0?' neg':'')+'"><span>'+(r.costReady?'مقارنة بتكلفة <span class="num">'+f(r.costAvg)+'</span> ج/طن (متوسط مرجّح)':'الربح / الخسارة مقابل التكلفة')+'</span><b>'+(r.costReady?plH(r.plTon)+' ج / طن':needCost())+'</b><em>'+(r.costReady?'الشحنة كلها: '+plH(r.plShip)+' ج':'أدخل تكلفة الطن لكل صنف في المبيعات')+'</em></div>'+
  '<div class="kpi wide"><span>سعر التعادل (متوسط للعبوة)</span><b>'+(r.costReady?'<span class="num">'+f(r.be)+'</span> ريال':needCost())+'</b><em>متوسط البيع الحالي <span class="num">'+f(r.q?r.sales/r.q:0)+'</span> ريال</em></div></div>';
 const sales=r.sales,seg=[[r.net,''],[-r.commV,'ded2'],[-r.expV,'ded'],[-r.frV,'ded3']];
 $('#mojmal').innerHTML='<h2>المجمل <small>من المبيعات للصافي</small></h2>'+(sales>0?'<div class="bar">'+seg.map(s=>s[0]>0?'<i class="'+s[1]+'" style="width:'+Math.min(100,s[0]/sales*100)+'%"></i>':'').join('')+'</div>':'')+
  '<div class="bk"><table><tr class="h"><td>البند</td><td class="vh">ريال</td><td class="vh">ج / طن</td><td class="vh">%</td></tr>'+
  chainRows(r).map((x,i)=>'<tr'+(x[2]?' class="t"':'')+'><td>'+esc(['إجمالي المبيعات','العمولة '+f(r.comm*100,1)+'%','مصروفات السعودية','النولون من مصر','الصافي'][i])+'</td><td class="v">'+f(x[1])+'</td><td class="v">'+(r.t?f(x[1]/r.t/u*E2):'—')+'</td><td class="v">'+pct(x[1],sales)+'</td></tr>').join('')+
  '</table><div class="hint">الصافي = المبيعات − العمولة − مصروفات السعودية − النولون · الجنيه = الدولار × '+N(f(E2))+' · الدولار = '+N(f(u,4))+' ريال</div></div>';
 const V=(l,v)=>'<div><span>'+l+'</span><b class="num">'+v+'</b></div>';
 const meta=saleMeta();
 let d='<h2>التفاصيل <small>حسب سطر البيع</small></h2>'+(r.lines.length?r.lines.map((x,i)=>'<div class="lc"><div class="nm">'+esc(x.n)+'<small>'+esc(x.p)+' · '+N(f(meta[i].pal,0))+' باليت × '+N(f(meta[i].cpp,0))+' = '+N(f(x.q,0))+' كرتونة × '+N(f(x.pr))+' ريال'+(x.cost!=null?' · تكلفة '+N(f(x.cost))+' ج/طن':'')+'</small></div><div class="vals">'+V('طن',f(x.t,3))+V('صافي الطن ج',f(x.nt*S.egp))+V('ربح/خسارة ج/طن',x.plTon==null?needCost():f(x.plTon))+'</div></div>').join(''):'<div class="hint">مفيش سطور بيع فيها عدد.</div>');
 if(r.types.length)d+='<h2 style="margin-top:16px">حسب نوع العبوة</h2>'+r.types.map(x=>'<div class="lc"><div class="nm">'+esc(x.n)+'<small>'+N(f(x.q,0))+' عبوة · متوسط البيع '+N(f(x.avg))+' ريال</small></div><div class="vals">'+V('صافي العبوة $',f(x.np))+V('صافي الطن ج',f(x.nt*S.egp))+V('التعادل ريال/عبوة',x.be==null?needCost():f(x.be))+'</div></div>').join('');
 d+='<div class="hint" style="margin-top:8px">صافي كل سطر = مبيعاته بعد العمولة − نصيبه من المصروفات والنولون حسب الوزن. الربح/الخسارة والتعادل من تكلفة كل صنف (والمتجمع متوسط مرجّح بالطن).</div>';
 $('#detail').innerHTML=d;
 const tB=S.exp.reduce((a,x)=>a+(+x[1]||0),0),tC=S.exp.reduce((a,x)=>a+(+x[2]||0),0);const eb=$('#eB'),ec=$('#eC');if(eb)eb.textContent=f(tB);if(ec)ec.textContent=f(tC);
 document.querySelectorAll('[data-lv]').forEach(e=>{const l=S.lines[+e.dataset.lv];if(!l)return;const q=+l[2]||0,pal=linePal(l),cpp=lineCpp(l);
  e.innerHTML=q?N(f(pal,0))+' باليت × '+N(f(cpp,0))+' = '+N(f(q,0))+' كرتونة · المبيعات '+N(f(q*+l[3]))+' ريال':'الكراتين صفر — السطر مش داخل في الحساب'});
 document.querySelectorAll('[data-cartons]').forEach(e=>{const l=S.lines[+e.dataset.cartons];if(l)e.textContent=f(+l[2]||0,0)});
 document.querySelectorAll('[data-pl]').forEach(e=>{const i=+e.dataset.pl,l=S.lines[i];if(!l)return;
  const x=r.lines.find((z,k)=>S.lines.filter(ll=>+ll[2])[k]===l);
  if(!(+l[2])){e.innerHTML='<span class="clab">ربح / خسارة</span><b class="need">—</b>';return}
  if(!x||x.plTon==null){e.innerHTML='<span class="clab">ربح / خسارة للطن</span><b class="need">'+needCost()+'</b>';return}
  e.innerHTML='<span class="clab">ربح / خسارة للطن</span><b class="'+(x.plTon<0?'neg':'')+'">'+plH(x.plTon)+' ج</b>'});
 const tot=palTotals(),lt=$('#ltTot');if(lt)lt.innerHTML='<span>الإجمالي من كل الأصناف</span><b class="num">'+f(tot.pal,0)+' باليت</b><b class="num">'+f(tot.ctn,0)+' كرتونة</b>'}
function renderAll(){renderChips();renderInputs();renderTables();renderLive();showSaved();renderTools();$('#ver').textContent='· v'+VER}

/* ---------- الأحداث ---------- */
function setErr(key,msg,raw){if(msg){ERR[key]=msg;DR[key]=raw}else{delete ERR[key];delete DR[key]}}
function markBad(el,key){if(el.dataset.k||el.dataset.date){const box=el.parentNode;box.classList.toggle('bad',!!ERR[key]);box.parentNode.querySelectorAll('.emsg[data-for="'+key+'"]').forEach(m=>m.remove());
  if(ERR[key]){const m=document.createElement('div');m.className='emsg';m.dataset.for=key;m.textContent=ERR[key];box.insertAdjacentElement('afterend',m)}return}
 el.classList.toggle('bad',!!ERR[key]);const a=key.split(':'),cont=el.closest('.ln')||el.closest('.r4,.r3');if(!cont)return;
 const host=el.closest('.ln')?cont:cont.parentNode;host.querySelectorAll('.emsg[data-for="'+key+'"]').forEach(m=>m.remove());
 if(ERR[key]){const m=document.createElement('div');m.className='emsg sm';m.dataset.for=key;m.textContent=errName(key)+': '+ERR[key];if(el.closest('.ln'))(cont.querySelector('.r2c')||cont.querySelector('.r2,.r2e')).insertAdjacentElement('afterend',m);else cont.insertAdjacentElement('afterend',m)}}
const NUMRULE={lines:{3:'ge0',4:'ge0',5:'ge0',6:'ge0'},exp:{1:'ge0',2:'ge0'},clients:{1:'pct'},pk:{1:'gt0',2:'ge0'}};
document.addEventListener('input',e=>{const t=e.target;
 if(t.id=='rMode')return;
 if(t.dataset.date){const raw=t.value,iso=parseDateInput(raw);if(!String(raw).trim())setErr('date','فاضي — اكتب التاريخ يوم/شهر/سنة',raw);else if(!iso)setErr('date','اكتبه يوم/شهر/سنة ميلادي، زي 11/11/2026',raw);else{setErr('date','');S.date=iso}markBad(t,'date');save();return}
 if(t.dataset.k){const k=t.dataset.k,key='k:'+k,msg=checkVal(t.value,RULES[k][1]);setErr(key,msg,t.value);if(!msg)S[k]=toStore(t.value);markBad(t,key);save();renderLive();return}
 if(t.dataset.t){const [a,i,j]=t.dataset.t.split(':'),row=S[a][+i];if(!row)return;
  if(t.tagName=='SELECT'){if(a=='lines'&&j=='1'){setPack(row,t.value);save();renderTables();renderLive();focusNew();return}row[+j]=t.value;save();renderLive();return}
  if(j=='0'){const old=row[0];row[0]=t.value;                 // نفس سلوك الأصلي في تغيير الأسماء
   if(a=='clients'&&S.client==old)S.client=t.value;
   if(a=='pk')S.lines.forEach(l=>{if(l[1]==old)l[1]=t.value});
   save();renderLive();return}
  if(a=='lines'&&j=='6'){const raw=t.value;if(!String(raw).trim()){setErr(t.dataset.t,'');row[6]=null;markBad(t,t.dataset.t);save();renderLive();return}
   const msg=checkVal(raw,'ge0');setErr(t.dataset.t,msg,raw);if(!msg)row[6]=toStore(raw);markBad(t,t.dataset.t);save();renderLive();return}
  const msg=checkVal(t.value,NUMRULE[a][j],true);setErr(t.dataset.t,msg,t.value);if(!msg){row[+j]=toStore(t.value,a=='clients');if(a=='lines'&&(j=='4'||j=='5'))syncQty(row)}markBad(t,t.dataset.t);save();renderLive()}});
document.addEventListener('change',e=>{const t=e.target;if(t.id=='rMode'){REPMODE=t.value;buildPages();fit();return}
 if(t.dataset.date){const iso=parseDateInput(t.value);if(iso){S.date=iso;t.value=D(iso);setErr('date','');markBad(t,'date');save()}return}
 if(t.dataset.t&&t.dataset.t.endsWith(':0')){const a=t.dataset.t.split(':')[0];if(a=='clients'||a=='pk'){save();renderChips();renderTables();renderLive()}return}
 const key=t.dataset.k?'k:'+t.dataset.k:t.dataset.t;if(!key||t.tagName=='SELECT'||ERR[key])return;if(String(t.value).trim()==='')return;const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x)});
function onPick(t){const i=t.dataset.pv!=null?+t.dataset.pv:+t.dataset.ps,l=S.lines[i];if(!l)return false;let m=lineMeta(l);
 if(t.dataset.pv!=null){let v=t.value;if(v==='__keep')return true;
  if(v===''){renderTables();return true}
  if(v==='__newv'){NEWED={k:'v',i};renderTables();focusNew();return true}
  m={v,s:m&&m.v===v?m.s||'':''};l[7]=m;l[0]=nameOf(m.v,m.s)}
 else{let z=t.value;if(z==='__news'){NEWED={k:'s',i};renderTables();focusNew();return true}
  if(!m)m=l[7]={v:l[0]||'',s:''};m.s=String(z||'').trim();l[0]=nameOf(m.v,m.s)}
 save();if(t.tagName==='SELECT'||t.dataset.pv!=null)renderTables();renderLive();return true}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&(t.dataset.pv!=null||(t.dataset.ps!=null&&t.tagName==='SELECT')))onPick(t)});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.ps!=null&&t.tagName==='INPUT')onPick(t)});
function focusNew(){if(!NEWED)return;const e=document.querySelector('[data-nw][data-i="'+NEWED.i+'"]');if(e){e.focus();e.scrollIntoView({block:'center'})}}
function commitNew(kind,i){const l=S.lines[i];if(!l||!NEWED){NEWED=null;return}
 if(kind==='v'){const e=document.querySelector('[data-nw="v"][data-i="'+i+'"]'),v=(e?e.value:'').trim();if(v){if(![].concat(ALSX.VARIETIES||[]).includes(v)){S.xv=Array.isArray(S.xv)?S.xv:[];if(!S.xv.includes(v))S.xv.push(v)}const m=lineMeta(l);l[7]={v,s:m&&m.v===v?m.s||'':''};l[0]=nameOf(v,l[7].s)}else if(NEWED.old){l[0]=NEWED.old[0];if(NEWED.old[1])l[7]=NEWED.old[1];else l.length=Math.min(l.length,7)}}
 else if(kind==='s'){const e=document.querySelector('[data-nw="s"][data-i="'+i+'"]');if(e&&!e.value.trim()&&NEWED.old){l[0]=NEWED.old[0];if(NEWED.old[1])l[7]=NEWED.old[1]}}
 else if(kind==='pk'){const n=(document.querySelector('[data-nw="pkn"][data-i="'+i+'"]')||{}).value||'',w=parseNum((document.querySelector('[data-nw="pkw"][data-i="'+i+'"]')||{}).value||''),pal=parseNum((document.querySelector('[data-nw="pkp"][data-i="'+i+'"]')||{}).value||'');const nm=n.trim();
  if(nm){const kg=isFinite(w)&&w>0?w:((ALSX.kgOfText&&ALSX.kgOfText(nm))||10),pp=isFinite(pal)&&pal>0?pal:0;if(!S.pk.some(q=>q[0]===nm))S.pk.push([nm,kg,pp]);l[1]=nm;if(pp){l[5]=pp;syncQty(l)}}}
 NEWED=null;save();renderAll()}
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.nw==null)return;const i=+t.dataset.i,l=S.lines[i];if(!l)return;
 if(t.dataset.nw==='v'){if(!NEWED||NEWED.i!==i)return;if(!NEWED.old)NEWED.old=[l[0],l[7]];NEWED.d=t.value;const v=t.value.trim();const o=NEWED.old[1];l[7]={v,s:o&&o.v===v?o.s||'':''};l[0]=nameOf(v,l[7].s);save()}
 else if(t.dataset.nw==='s'){if(NEWED&&NEWED.i===i&&!NEWED.old)NEWED.old=[l[0],JSON.parse(JSON.stringify(l[7]||null))];if(NEWED)NEWED.d=t.value;const m=lineMeta(l)||(l[7]={v:l[0]||'',s:''});m.s=t.value.trim();l[0]=nameOf(m.v,m.s);save();renderLive()}});
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.dataset&&t.dataset.nw){e.preventDefault();const k=t.dataset.nw;if(k==='tpkn'||k==='tpkw'||k==='tpkp'){commitTblPk();return}commitNew(k==='pkn'||k==='pkw'||k==='pkp'?'pk':k,+t.dataset.i)}});
document.addEventListener('focusout',e=>{const t=e.target;if(!t.dataset||(t.dataset.nw!=='v'&&t.dataset.nw!=='s'))return;setTimeout(()=>{const a=document.activeElement;if(NEWED&&NEWED.k===t.dataset.nw&&!(a&&a.dataset&&(a.dataset.nwok||a.dataset.nw)))commitNew(t.dataset.nw,+t.dataset.i)},0)});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='bTblPkOk'){e.stopPropagation();commitTblPk()}else if(b.id==='bTblPkX'){e.stopPropagation();PKNEW=false;renderTables();renderLive()}else if(b.dataset.nwok){e.stopPropagation();commitNew(b.dataset.nwok,+b.dataset.i)}else if(b.dataset.nwx){e.stopPropagation();NEWED=null;renderTables();renderLive()}},true);

function commitTblPk(){const n=(document.querySelector('[data-nw="tpkn"]')||{}).value||'',w=parseNum((document.querySelector('[data-nw="tpkw"]')||{}).value||''),pal=parseNum((document.querySelector('[data-nw="tpkp"]')||{}).value||'');const nm=n.trim();
 if(!nm){alert('اكتب اسم العبوة');return}
 if(!(w>0)&&!(ALSX.kgOfText&&ALSX.kgOfText(nm))){alert('الوزن لازم يكون أكبر من صفر');return}
 if(S.pk.some(q=>q[0]===nm)){alert('العبوة «'+nm+'» موجودة');return}
 const kg=w>0?w:((ALSX.kgOfText&&ALSX.kgOfText(nm))||10),pp=isFinite(pal)&&pal>0?pal:0;
 S.pk.push([nm,kg,pp]);PKNEW=false;save();renderAll()}

function blocked(){const E=errList(true);if(!E.length)return false;alert('صحّح الخانات دي الأول:\n• '+E.join('\n• '));return true}
function downloadJson(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
function exportData(){flushSave();downloadJson('الصوافي-'+cairoISO()+'.json',{app:'sawafi',ver:2,t:lastT||Date.now(),S,pending:Object.keys(ERR).length?{ERR,DR}:undefined})}
function extractSawafi(o){if(!o||typeof o!=='object')return null;if(o.app&&o.app!=='sawafi'&&o.app!=='safiNetback')return 'wrong-app';if(o.S&&typeof o.S==='object')return o.S;if(o.lines||o.clients||o.exp||o.sar!=null||o.egp!=null)return o;return null}
function importSawafi(o){const raw=extractSawafi(o);if(raw==='wrong-app'){alert('الملف ده مش لبرنامج الصوافي.');return false}if(!raw||!okState(raw)){alert('الملف مش صالح أو فاضي.');return false}if(!confirm('هتستبدل البيانات الحالية بالملف اللي اخترته؟\nالأرقام الحالية هتتحفظ كنسخة «آخر حفظ قبل الرجوع» وتقدر ترجعها.'))return false;
 flushSave();lsSet(SK_B,JSON.stringify({ver:2,t:Date.now(),S,pending:Object.keys(ERR).length?{ERR,DR}:undefined}));
 S=ExpMig.keepExp(fromObj(raw));migrateLines(S.lines);if(!parseDateInput(S.date)&&!parseDateInput(D(S.date)))S.date=cairoISO();ERR={};DR={};if(o.pending&&o.pending.ERR&&o.pending.DR){ERR=o.pending.ERR;DR=o.pending.DR}save();renderAll();return true}
function onImportFile(f){if(!f)return;const r=new FileReader();r.onload=()=>{let o=null;try{o=JSON.parse(r.result)}catch(e){alert('الملف مش JSON صالح.');return}importSawafi(o);const inp=$('#fImport');if(inp)inp.value=''};r.onerror=()=>alert('ماقدرناش نقرأ الملف.');r.readAsText(f)}
function stamp(t){if(!t)return '';const d=new Date(t);return D(cairoISO(d))+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function renderTools(){const u=$('#bUndo'),b=readState(SK_B);if(u){u.hidden=!b;if(b)u.textContent='استرجاع آخر حفظ قبل الرجوع ('+stamp(b.t)+')'}
 const n=$('#pinNote'),p=readState(SK_P);if(n)n.textContent=p?'المدخلات الرئيسية: اللي ثبّتها على الجهاز ده يوم '+stamp(p.t):'المدخلات الرئيسية: تقرير 17/11/2026 (فاكهة الصيف، براد)'}
function clearErrs(a){Object.keys(ERR).filter(k=>k.startsWith(a+':')).forEach(k=>{delete ERR[k];delete DR[k]})}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.c!=null){S.client=S.clients[+t.dataset.c][0];save();renderChips();renderLive()}
 else if(t.dataset.m){S.mode=t.dataset.m;save();renderChips();renderTables();renderLive()}
 else if(t.dataset.add){const a=t.dataset.add;   // نفس قيم الإضافة في البرنامج الأصلي
  if(a=='lines'){const pv=S.lines[S.lines.length-1],pm=pv&&lineMeta(pv),v=pm?pm.v:'';const pk=pv&&pv[1]?pv[1]:(S.pk[0]?S.pk[0][0]:'');
   S.lines.push([nameOf(v,''),pk,0,0,0,pv?+pv[5]||0:0,null,{v,s:''}]);save();renderAll();const el=document.querySelector('[data-line="'+(S.lines.length-1)+'"]');if(el){el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}return}
  if(a=='pk'){PKNEW=true;save();renderAll();const e=document.querySelector('[data-nw="tpkn"]');if(e){e.focus();e.scrollIntoView({block:'center'})}return}
  S[a].push(a=='exp'?['بند جديد',0,0]:['عميل جديد',0.05]);save();renderAll()}
 else if(t.dataset.del){const [a,i]=t.dataset.del.split(':'),row=S[a][+i];if(!row)return;
  if(a=='pk'&&S.lines.some(l=>l[1]===row[0])&&!confirm('العبوة «'+row[0]+'» مستخدمة في سطور بيع، ووزنها هيتحسب صفر لو اتحذفت. تحذفها؟'))return;
  if(a=='clients'&&row[0]===S.client&&!confirm('ده العميل المختار؛ لو اتحذف العمولة هتتحسب صفر لحد ما تختار عميل تاني. تحذفه؟'))return;
  S[a].splice(+i,1);clearErrs(a);save();renderAll()}
 else if(t.id=='bReset'){if(!confirm('ترجع للمدخلات الرئيسية؟\nأرقامك الحالية هتتحفظ كنسخة «آخر حفظ قبل الرجوع» وتقدر ترجعها بزرار الاسترجاع.'))return;
  flushSave();lsSet(SK_B,JSON.stringify({ver:2,t:Date.now(),S,pending:Object.keys(ERR).length?{ERR,DR}:undefined}));
  S=mainInputs();ERR={};DR={};save();renderAll()}
 else if(t.id=='bUndo'){const b=readState(SK_B);if(!b){alert('مفيش نسخة محفوظة قبل الرجوع.');return}
  if(!confirm('ترجّع «آخر حفظ قبل الرجوع» ('+stamp(b.t)+')؟\nالأرقام الحالية هتتحفظ مكانها كنسخة، فمفيش حاجة هتضيع.'))return;
  flushSave();const cur=JSON.stringify({ver:2,t:Date.now(),S,pending:Object.keys(ERR).length?{ERR,DR}:undefined});let pend=null;try{pend=JSON.parse(lsGet(SK_B)).pending||null}catch(e){}
  lsSet(SK_B,cur);S=ExpMig.keepExp(fromObj(b.S));migrateLines(S.lines);ERR={};DR={};if(pend&&pend.ERR&&pend.DR){ERR=pend.ERR;DR=pend.DR}save();renderAll()}
 else if(t.id=='bPin'){if(blocked())return;if(!confirm('تثبّت الأرقام الحالية كمدخلات رئيسية على الجهاز ده؟\nزرار «الرجوع للمدخلات الرئيسية» هيرجع لها بعد كده.'))return;
  flushSave();lsSet(SK_P,JSON.stringify({ver:2,t:Date.now(),S}));renderTools();alert('اتثبتت ✓')}
 else if(t.id=='bReport'){if(blocked())return;openRep()}
 else if(t.id=='bPrint'||t.id=='rPrint'){if(blocked())return;buildPages();$('#rep').hidden=false;fit();setTimeout(()=>window.print(),350)}
 else if(t.id=='bShare'||t.id=='rShare'){if(blocked())return;sharePdf()}
 else if(t.id=='bExport'){exportData()}
 else if(t.id=='bImport'){const inp=$('#fImport');if(inp)inp.click()}
 else if(t.id=='rClose'){$('#rep').hidden=true;document.body.style.overflow=''}});
document.addEventListener('change',e=>{if(e.target&&e.target.id=='fImport'&&e.target.files&&e.target.files[0])onImportFile(e.target.files[0])});

/* ---------- التقرير ---------- */
let REPMODE='full';
function repParts(){const r=result(),u=S.sar,E=S.egp,full=REPMODE=='full';
 const code=full?'RT-20261028-012':'RT-20261028-013';
 const head=t=>'<div class="ph"><div><h1>'+t+'</h1><div class="meta">تاريخ الحساب <span class="ltr">'+esc(D(S.date))+'</span> — العميل '+esc(S.client)+' (عمولة <span class="ltr">'+f(r.comm*100,1)+'%</span>) — الشحن '+esc(S.mode)+' — الدولار <span class="ltr">'+f(S.sar,4)+'</span> ريال — <span class="ltr">'+f(S.egp)+'</span> ج</div></div><span class="tag">الصوافي</span></div>';
 const R=(n,v,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+esc(n)+'</td><td class="n">'+f(v)+'</td><td class="n">'+f(v/u)+'</td><td class="n">'+f(v/u*E)+'</td><td class="n">'+(r.t?f(v/r.t/u*E):'—')+'</td><td class="n">'+pct(v,r.sales)+'</td></tr>';
 const warn=r.warn?'<div class="rwarn">'+esc(r.warn)+'</div>':'';
 const F=(x,d)=>'<span class="ltr">'+f(x,d)+'</span>',F$=(x,d)=>'<span class="ltr">$'+f(x,d)+'</span>';
 const plB=v=>pl(v).replace(/([\d,.-]+)/,'<span class="ltr">$1</span>');
 const p1=head((full?'تقرير مفصل':'تقرير مجمل')+' — صافي سعر البيع في السعودية راجع لمصر')+
 '<h3>الملخص</h3><div class="rsum"><div class="m main"><span>صافي الطن هنا</span><b>'+F(r.tonEgp)+' ج</b><em>'+F$(r.tonUsd)+'</em><small>صافي الشحنة ÷ '+f(r.t,3)+' طن، بالجنيه بسعر '+f(S.egp)+'</small></div>'+
 '<div class="m"><span>صافي الكيلو</span><b>'+F(r.kgEgp,3)+' ج</b><em>'+F$(r.tonUsd/1000,3)+'</em><small>صافي الطن ÷ 1000 كجم</small></div>'+
 '<div class="m"><span>صافي العبوة (متوسط)</span><b>'+F(r.pkgEgp)+' ج</b><em>'+F$(r.pkgUsd)+' — '+F(r.pkgSar)+' ريال</em><small>صافي الشحنة ÷ '+f(r.q,0)+' كرتونة</small></div>'+
 '<div class="m"><span>صافي الشحنة</span><b>'+F(r.netEgp)+' ج</b><em>'+F$(r.net/u)+' — '+F(r.net)+' ريال</em><small>المبيعات بعد العمولة والمصروفات والنولون</small></div></div>'+
 '<div class="rsum3"><div class="m'+(r.costReady&&r.plTon<0?' neg':'')+'"><span>الربح / الخسارة للطن</span><b>'+(r.costReady?plB(r.plTon)+' ج':needCost())+'</b><em>'+(r.costReady?F$(Math.abs(r.plTon/S.egp)):'')+'</em><small>'+(r.costReady?'صافي الطن '+F(r.tonEgp)+' − متوسط التكلفة '+F(r.costAvg)+' ج (مرجّح بالطن)':'أدخل تكلفة الطن لكل صنف')+'</small></div>'+
 '<div class="m'+(r.costReady&&r.plShip<0?' neg':'')+'"><span>الربح / الخسارة للشحنة</span><b>'+(r.costReady?plB(r.plShip)+' ج':needCost())+'</b><em>'+(r.costReady?F$(Math.abs(r.plShip/S.egp)):'')+'</em><small>'+(r.costReady?'الربح/الخسارة للطن × '+f(r.t,3)+' طن':'أدخل تكلفة الطن لكل صنف')+'</small></div>'+
 '<div class="m"><span>سعر التعادل في السعودية</span><b>'+(r.costReady?F(r.be)+' ريال للعبوة':needCost())+'</b><em>المتوسط الحالي '+F(r.q?r.sales/r.q:0)+' ريال</em><small>متوسط سعر البيع اللي يغطي تكلفة كل صنف</small></div></div>'+warn+
 '<h3>المجمل — من المبيعات للصافي</h3><table class="rt"><thead><tr><th>البند (الشحنة كلها)</th><th>ريال</th><th>دولار</th><th>جنيه</th><th>ج / طن</th><th>% من المبيعات</th></tr></thead><tbody>'+
 chainRows(r).map(x=>R(x[0],x[1],x[2]?'gt':'')).join('')+'</tbody></table><div class="note">الصافي = المبيعات − العمولة − مصروفات السعودية − النولون؛ الجنيه = الدولار × '+f(E)+'. الكمية: '+f(palTotals().pal,0)+' باليت — '+f(palTotals().ctn,0)+' كرتونة — '+f(r.t,3)+' طن.</div>';
 const blocks=[];
 if(full){const meta=saleMeta();
  const LH='<thead><tr><th>الصنف</th><th>العبوة</th><th>باليت</th><th>ك/باليت</th><th>الكراتين</th><th>سعر ريال</th><th>طن</th><th>صافي الطن $</th><th>صافي الطن ج</th><th>تكلفة ج/طن</th><th>ربح/خسارة ج/طن</th></tr></thead>';
  const LR=r.lines.map((x,i)=>'<tr><td>'+esc(x.n)+'</td><td>'+esc(x.p)+'</td><td class="n">'+f(meta[i].pal,0)+'</td><td class="n">'+f(meta[i].cpp,0)+'</td><td class="n">'+f(x.q,0)+'</td><td class="n">'+f(x.pr)+'</td><td class="n">'+f(x.t,3)+'</td><td class="n">'+f(x.nt)+'</td><td class="n">'+f(x.nt*S.egp)+'</td><td class="n">'+(x.cost==null?needCost():f(x.cost))+'</td><td class="n">'+(x.plTon==null?needCost():f(x.plTon))+'</td></tr>');
  const tot=palTotals();
  const CH=26;for(let i=0;i<Math.max(1,LR.length);i+=CH)blocks.push('<h3>حسب سطر البيع'+(i?' (تابع)':'')+'</h3><table class="rt sm">'+LH+'<tbody>'+(LR.slice(i,i+CH).join('')||'<tr><td colspan="11">مفيش سطور بيع فيها عدد.</td></tr>')+(i+CH>=LR.length&&LR.length?'<tr class="gt"><td colspan="2">الإجمالي</td><td class="n">'+f(tot.pal,0)+'</td><td class="n"></td><td class="n">'+f(tot.ctn,0)+'</td><td colspan="6"></td></tr>':'')+'</tbody></table>'+(i+CH>=LR.length?'<div class="note">الكراتين = الباليتات × كراتين الباليت، ومجموعها من كل الأصناف. الربح/الخسارة لكل صنف = صافي طنه − تكلفته. الصافي = المبيعات بعد العمولة − نصيبه من المصروفات والنولون حسب الوزن.</div>':''));
  blocks.push('<h3>حسب نوع العبوة</h3><table class="rt sm"><thead><tr><th>العبوة</th><th>الكراتين</th><th>طن</th><th>المبيعات ريال</th><th>متوسط ريال</th><th>العمولة</th><th>نصيبه من المصروفات</th><th>الصافي ريال</th><th>صافي الطن $</th><th>صافي العبوة $</th><th>التعادل ريال/عبوة</th></tr></thead><tbody>'+
   r.types.map(x=>'<tr><td>'+esc(x.n)+'</td><td class="n">'+f(x.q,0)+'</td><td class="n">'+f(x.t,3)+'</td><td class="n">'+f(x.v)+'</td><td class="n">'+f(x.avg)+'</td><td class="n">'+f(x.f)+'</td><td class="n">'+f(x.g)+'</td><td class="n">'+f(x.h)+'</td><td class="n">'+f(x.nt)+'</td><td class="n">'+f(x.np)+'</td><td class="n">'+(x.be==null?needCost():f(x.be))+'</td></tr>').join('')+
   '</tbody></table><div class="note">سعر التعادل = سعر البيع للعبوة اللي يغطي تكلفة الصنف (أو المتوسط المرجّح لو النوع فيه أكتر من تكلفة) بعد العمولة والمصروفات. '+(r.types.some(x=>x.be==null)?'لو التكلفة ناقصة يظهر: '+needCost()+'':'')+'</div>');
  blocks.push('<h3>مصروفات '+esc(S.mode)+' في السعودية (ريال)</h3><table class="rt"><thead><tr><th>البند</th><th>ريال</th></tr></thead><tbody>'+S.exp.map(e=>'<tr><td>'+esc(e[0])+'</td><td class="n">'+f(S.mode=='براد'?e[1]:e[2])+'</td></tr>').join('')+'<tr class="gt"><td>الإجمالي</td><td class="n">'+f(r.expT)+'</td></tr></tbody></table><div class="note">مصروفات مشتركة موزّعة على الأصناف حسب الوزن.</div>');
  blocks.push('<h3>ملاحظات</h3><ul><li>العمولة نسبة من مبيعات كل سطر حسب العميل.</li><li>مصروفات السعودية والنولون موزّعة حسب الوزن (الكراتين × وزن العبوة).</li><li>نولون الحاوية بالدولار والبراد بالريال.</li><li>تكلفة الطن تتكتب لكل صنف؛ الربح/الخسارة والتعادل للمتجمع بالمتوسط المرجّح حسب وزن كل صنف.</li></ul>')}
 return {p1,blocks,head:head('تفاصيل الصوافي — '+esc(S.client)),code}}
const AVAIL=1123-36-62;
/* بيبني الصفحات جوه root (لازم يكون ظاهر عشان القياس) */
function layout(root){const P=repParts();root.innerHTML='';const pages=[];
 const mk=(h,cls)=>{const pg=document.createElement('div');pg.className='page';pg.innerHTML='<div class="pc'+(cls?' '+cls:'')+'">'+h+'</div>';const w=document.createElement('div');w.className='pagewrap';w.appendChild(pg);root.appendChild(w);pages.push(pg);return pg.firstChild};
 mk(P.p1,'p1');let pc=null,n=0;
 P.blocks.forEach(b=>{if(!pc){pc=mk(P.head);n=0}const d=document.createElement('div');d.innerHTML=b;pc.appendChild(d);n++;
  if(pc.offsetHeight>AVAIL&&n>1){d.remove();pc=mk(P.head);pc.appendChild(d);n=1}});
 pages.forEach((pg,i)=>{const ft=document.createElement('div');ft.className='pf';ft.innerHTML='<span class="ltr">'+P.code+'</span><span>صافي البيع في السعودية راجع لمصر · طُبع <span class="ltr">'+today()+'</span></span><span>صفحة '+(i+1)+' من '+pages.length+'</span>';pg.appendChild(ft)});
 shrink(root);return pages}
function shrink(root){root.querySelectorAll('.page').forEach(pg=>{const pc=pg.querySelector('.pc');pc.style.transform='';pc.style.width='';let h=pc.offsetHeight;if(h>AVAIL){let s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';h=pc.offsetHeight;s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';pc.style.transformOrigin='top right';pc.style.transform='scale('+s+')'}})}
function buildPages(){$('#rep').hidden=false;$('#rMode').value=REPMODE;const pg=$('#pages');document.querySelectorAll('.pagewrap .page').forEach(p=>p.style.transform='');layout(pg)}
function fit(){document.querySelectorAll('#pages .pagewrap').forEach(w=>{const pg=w.firstChild,s=Math.min(1,w.clientWidth/794);pg.style.transform='scale('+s+')';w.style.height=(1123*s)+'px'})}
window.addEventListener('resize',()=>{if(!$('#rep').hidden)fit()});
function openRep(){buildPages();$('#rep').hidden=false;$('#rep').scrollTop=0;document.body.style.overflow='hidden';fit()}
let libs=null;function loadLibs(){if(libs)return libs;libs=Promise.all(['html2canvas.min.js','jspdf.umd.min.js'].map(s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=()=>{libs=null;no(new Error('تعذّر تحميل '+s))};document.head.appendChild(e)})));return libs}
function makePdf(){const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:794px';document.body.appendChild(holder);
 return (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{layout(holder);return loadLibs()}).then(()=>{const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),pgs=holder.querySelectorAll('.page');let ch=Promise.resolve();
  pgs.forEach((p,i)=>{ch=ch.then(()=>html2canvas(p,{scale:2,backgroundColor:'#fff',useCORS:true,logging:false}).then(c=>{if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297)}))});
  return ch.then(()=>{holder.remove();return pdf})}).catch(e=>{holder.remove();throw e})}
function fname(){return 'الصوافي_'+(REPMODE=='full'?'مفصل_':'مجمل_')+String(S.client).replace(/\s+/g,'_')+'_'+String(D(S.date)||today()).replace(/\//g,'-')+'.pdf'}
function sharePdf(){/* in-app preview; «إرسال واتساب» inside it shares the file — nothing is downloaded automatically */
 $('#busy').hidden=false;makePdf().then(pdf=>{const blob=pdf.output('blob'),name=fname();window.__lastPdf={size:blob.size,name:name};$('#busy').hidden=true;
  PdfShare.open(blob,name,{title:name.replace('.pdf','').replace(/_/g,' ')})})
 .catch(e=>{$('#busy').hidden=true;alert('ماقدرتش أجهز الـ PDF: '+(e&&e.message||e))})}
window.SFAPP={PRODPK,nameOf,setMode:m=>{REPMODE=m},makePdf,state:()=>S,render:renderAll,calc:()=>calc(S),result,layout,repParts,D,today,cairoISO,parseDateInput,migrateLines,syncQty,palTotals,attachCosts,lineCost,hasCost};
renderAll();
restoreFromIdb();
