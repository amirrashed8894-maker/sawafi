/* الصوافي والتكاليف v2.0.0 — الشاشة الرئيسية «قرار شراء الخام» (بحوث العمليات).
   بتقرا مباشرة من قسم الصوافي (safiNetback.v2) وقسم التكاليف (citrusCosts.v2) — نفس الموقع، من غير نسخ ولصق.
   الخانات الرئيسية (الدولار الموحّد، نولون الحاوية، سعر الخام النهارده) بتتكتب في القسم صاحبها فورًا، فالأرقام واحدة في كل مكان.
   إعدادات القرار نفسها في decision.v1 (+ نسخة .mirror + IndexedDB). الحاوية الأساسي والبراد فرعي. */
(function(){'use strict';
const VER2='2.0.2';const K=BE.KEYS;const FXK='fx.v1';
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
function writeSafi(mut){const r=readSafi();mut(r.S);const t=Date.now();const j=JSON.stringify({ver:2,t,S:r.S});const a=lsSet(K.safi,j),b=lsSet(K.safiM,j);idbPut('S',j);
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
let DEC=readDec().S,SAFI=null,COSTS=null,NOTE='';
try{const u=BE.unwrap(lsGet(K.dec));if(u&&u.t)lastT=u.t}catch(e){}
function load(){SAFI=readSafi();COSTS=readCosts();const d=readDec();DEC=d.S}
/* ---------- الواجهة ---------- */
const ERR={};
function fld(key,label,val,unit,hint,cls){return '<div class="f'+(cls?' '+cls:'')+'"><label>'+label+'</label><div class="in'+(ERR[key]?' bad':'')+'"><input inputmode="decimal" data-h="'+key+'" value="'+esc(key in ERR?ERR[key].raw:val)+'" aria-label="'+esc(label)+'"><span class="u">'+unit+'</span></div>'+(ERR[key]?'<div class="emsg">'+esc(ERR[key].msg)+'</div>':'')+(hint?'<div class="hint">'+hint+'</div>':'')+'</div>'}
function renderInputs(){const S=SAFI.S,C=COSTS.S;
 $('#hin').innerHTML='<div class="grid hgrid">'+
  fld('egp','سعر الدولار بالجنيه',S.egp,'ج / $','موحّد للصوافي والتكاليف','big')+
  fld('fC','نولون الحاوية (العدبية ← جدة)',S.fC,'$ / حاوية','بيتسجل في الصوافي','big')+
  fld('raw','سعر الخام النهارده',C.raw,'ج / كجم','واصل المحطة — بيتسجل في التكاليف','big')+
  fld('cap.حاوية','باليتات الحاوية',DEC.cap['حاوية'],'باليت','')+'</div>'+(NOTE?'<div class="notice">'+esc(NOTE)+'</div>':'')}
function vOpts(cur){const G=(window.ALS&&ALS.GROUPS)||{};let o='<option value="">اختار الصنف…</option>';const all=[].concat(...Object.values(G).map(g=>g.vars));
 if(cur&&all.indexOf(cur)<0)o+='<option>'+esc(cur)+'</option>';Object.values(G).forEach(g=>{o+='<optgroup label="'+esc(g.name)+'">'+g.vars.map(v=>'<option>'+esc(v)+'</option>').join('')+'</optgroup>'});return o}
function sizes(it){let L=[];try{const g=ALS.groupOf(it.v);if(g){const r=ALS.sizesFor(g,ALS.packOf(g,it.pk));if(Array.isArray(r))L=r.map(String)}}catch(e){}return L}
function szOpts(it){const L=sizes(it),cur=String(it.sz||'');if(cur&&L.indexOf(cur)<0)L.unshift(cur);return '<option value="">المقاس</option>'+L.map(s=>'<option>'+esc(s)+'</option>').join('')}
function pkOpts(cur){const L=SAFI.S.pk.map(p=>p[0]);(COSTS.S.pk||[]).forEach(p=>{if(L.indexOf(p[0])<0)L.push(p[0])});if(cur&&L.indexOf(cur)<0)L.unshift(cur);return L.map(n=>'<option>'+esc(n)+'</option>').join('')}
function render(){load();renderInputs();const R=DEC;
 const its=R.items.map((it,i)=>'<div class="ln be-it" data-bi="'+i+'"><div class="r1 rv"><select data-hs="items.'+i+'.v" aria-label="الصنف">'+vOpts(it.v)+'</select><select data-hs="items.'+i+'.sz" aria-label="المقاس" class="szs">'+szOpts(it)+'</select><button class="x" data-ha="del:'+i+'" aria-label="حذف">×</button></div>'+
  '<div class="r1"><select data-hs="items.'+i+'.pk" aria-label="العبوة">'+pkOpts(it.pk)+'</select></div>'+
  '<div class="be-g4">'+[['p','سعر البيع','ريال'],['cpp','كراتين/باليت',''],['pal','باليتات '+modeName(R.base),''],['max','حد أقصى','باليت'],['share','نسبة المقاس','% من الفرز']].map(x=>{const key='items.'+i+'.'+x[0];return '<label class="be-c"><span>'+x[1]+(x[2]?' <small>'+x[2]+'</small>':'')+'</span><input class="v'+(ERR[key]?' bad':'')+'" inputmode="decimal" data-h="'+key+'" value="'+esc(key in ERR?ERR[key].raw:(it[x[0]]==null?'':it[x[0]]))+'" placeholder="'+(x[0]=='max'||x[0]=='share'?'اختياري':'')+'"></label>'}).join('')+'</div>'+
  '<div class="be-out" data-bo="'+i+'"></div></div>').join('');
 $('#be').innerHTML='<div class="vars be-modes">'+BE.MODES.map(m=>'<button class="chip sm'+(R.base===m?' on':'')+'" data-ha="base:'+m+'">'+modeName(m)+(m==='حاوية'?' (أساسي)':' (فرعي)')+'</button>').join('')+'</div>'+
  '<div id="beKpi"></div><div id="beWarn" class="hint"></div>'+
  '<div class="be-sub">الأصناف وأسعار البيع في السعودية</div>'+its+
  '<div class="be-btns"><button class="btn ghost" data-ha="add">+ صنف</button><button class="btn ghost" data-ha="fromSales">نسخ من مبيعات الصوافي</button></div>'+
  '<div class="be-sub">أحسن توزيع للباليتات <small>بحوث العمليات — برمجة خطية</small></div><div id="beOpt"></div>'+
  '<div class="be-sub">الحساسية <small>سعر الخام للتعادل لو حاجة اتغيرت</small></div><div id="beSen"></div>'+
  '<div class="be-sub">الأرقام جاية منين</div><div id="beSrc"></div>'+
  '<div class="hint be-how">الحساب: صافي الطن = سعر الكرتونة × (1 − العمولة) × عدد الكراتين في الطن ÷ ريال/$ × ج/$ − نصيب الطن من مصروفات ونولون الشحنة (نفس الصوافي). '+
  'سعر الخام للتعادل = (صافي الطن − العبوات − المستلزمات − الغسيل + الفرزة المباعة محلي) ÷ الكيلوهات الخام اللي بتطلع طن صافي (نفس التكاليف). أحسن توزيع = أعلى سعر خام ممكن (Dinkelbach + Simplex).</div>';
 document.querySelectorAll('select[data-hs]').forEach(s=>{const v=get(s.dataset.hs);s.value=v==null?'':String(v);if(s.value!==String(v==null?'':v))s.selectedIndex=0});
 $('#ver').textContent='· v'+VER2;showSaved();live()}
function get(path){const a=path.split('.');let o=DEC;for(const k of a){if(o==null)return null;o=o[k]}return o}
function set(path,v){const a=path.split('.');let o=DEC;for(let i=0;i<a.length-1;i++)o=o[a[i]];o[a[a.length-1]]=v}
function planFor(mode){const n=DEC.items.map(it=>+it.pal||0);if(mode===DEC.base)return n;const tot=n.reduce((a,b)=>a+b,0),cap=+DEC.cap[mode]||0;return tot?n.map(v=>v*cap/tot):n}
const plTxt=v=>v==null||!isFinite(v)?'—':(v>=0?'ربح ':'خسارة ')+'<span class="num">'+f(Math.abs(v))+'</span>';
function live(){const S=SAFI.S,Cs=COSTS.S,base=DEC.base,oth=OTHER(base);
 const Cb=BE.ctx(S,Cs,DEC,base),Co=BE.ctx(S,Cs,DEC,oth);const nb=planFor(base),no=planFor(oth);const pb=BE.planBE(Cb,DEC.items,nb),po=BE.planBE(Co,DEC.items,no);const raw=+Cs.raw||0;
 const verdict=p=>p.R==null?'':p.R<=0?'<em class="bad2">مفيش سعر خام يعادل — الصافي أقل من التكاليف حتى لو الخام ببلاش</em>':raw<=p.R?'<em class="ok2">✓ الشراء بـ <span class="num">'+f(raw)+'</span> ج مربح — هامش <span class="num">'+f(p.R-raw)+'</span> ج/كجم</em>':'<em class="bad2">✗ سعر النهارده <span class="num">'+f(raw)+'</span> ج أعلى من التعادل بـ <span class="num">'+f(raw-p.R)+'</span> ج/كجم</em>';
 const kp=(p,m,main)=>'<div class="kpi'+(main?' wide be-main':'')+(p.R!=null&&p.R<raw?' neg':'')+'"><span>'+(main?'اشتري الخام لحد — ':'')+modeName(m)+(main?'':' (فرعي)')+'</span><b>'+(p.R==null?'—':'<span class="num">'+f(p.R)+'</span> ج/كجم')+'</b><em>'+(p.R==null?'اكتب الأصناف والباليتات':'= <span class="num">'+f(p.Rton,0)+'</span> ج لطن الخام · <span class="num">'+f(p.T,2)+'</span> طن صافي')+'</em>'+(main?verdict(p):'')+
  (p.R!=null?'<em class="sm2">على خام <span class="num">'+f(raw)+'</span> ج/كجم: '+plTxt(p.profitAt(raw)/p.T)+' ج/طن · الشحنة '+plTxt(p.profitAt(raw))+' ج</em>':'')+'</div>';
 $('#beKpi').innerHTML='<div class="kpis">'+kp(pb,base,true)+kp(po,oth,false)+'<div class="kpi"><span>الفرق '+modeName(base)+' − '+modeName(oth)+'</span><b>'+(pb.R!=null&&po.R!=null?'<span class="num">'+f(pb.R-po.R)+'</span> ج/كجم':'—')+'</b><em>'+(pb.R!=null&&po.R!=null?(pb.R>=po.R?modeName(base)+' أحسن':modeName(oth)+' أحسن'):'')+'</em></div></div>';
 const w=[];const tot=nb.reduce((a,b)=>a+b,0);
 if(Cb.frMissing||Co.frMissing)w.push('⚠ نولون '+[Cb,Co].filter(c=>c.frMissing).map(c=>modeName(c.mode)).join(' و')+' مش متدخل — التعادل محسوب من غير نولون');
 if(tot&&Math.abs(tot-Cb.cap)>1e-9)w.push('الخطة '+f(tot,0)+' باليت من سعة '+modeName(base)+' '+f(Cb.cap,0)+' — المصروفات متوزعة على '+f(tot,0)+' باليت بس');
 if(Cb.noClient)w.push('⚠ العميل «'+S.client+'» مش في جدول العملاء — العمولة صفر');
 const seen={};DEC.items.forEach(it=>{const x=BE.item(Cb,it);if(x.missPk&&it.pk&&!seen['p'+it.pk]){seen['p'+it.pk]=1;w.push('⚠ سعر عبوة «'+it.pk+'» مش في التكاليف — محسوب صفر')}if(x.missWash&&it.v&&!seen['w'+it.v]){seen['w'+it.v]=1;w.push('⚠ غسيل «'+it.v+'» مش في التكاليف — محسوب صفر')}});
 $('#beWarn').innerHTML=w.map(esc).join('<br>');
 DEC.items.forEach((it,i)=>{const o=document.querySelector('[data-bo="'+i+'"]');if(!o)return;const a=BE.itemBE(Cb,it),b=BE.itemBE(Co,it),x=BE.item(Cb,it);
  const per1=x.ok?(1-Cb.comm)*(1000/x.w)/Cb.u*Cb.E/Cb.k:null,pr=BE.priceForRaw(Cb,it,raw);
  o.innerHTML=x.ok?'<div class="be-r"><span>لو مالي '+modeName(base)+' لوحده</span><b class="num">'+fe(a.R)+'</b><span>ج/كجم خام · '+modeName(oth)+' <span class="num">'+fe(b.R)+'</span></span></div>'+
   '<div class="hint">كل 1 ريال في سعر الكرتونة = <span class="num">'+fe(per1,3)+'</span> ج/كجم خام · علشان خام <span class="num">'+f(raw)+'</span> ج تبيع بـ <span class="num">'+fe(pr)+'</span> ريال على الأقل</div>':'<div class="hint">اختار العبوة واكتب كراتين الباليت وسعر البيع</div>'});
 const ob=BE.optimize(Cb,DEC.items),oo=BE.optimize(Co,DEC.items);
 $('#beOpt').innerHTML=ob.status!=='ok'?'<div class="hint">اكتب صنف واحد على الأقل بسعر وكراتين باليت.</div>':'<div class="bk"><table><tr class="h"><td>الصنف</td><td class="vh">خطتك</td><td class="vh">الأحسن</td></tr>'+DEC.items.map((it,i)=>'<tr><td>'+esc([it.v,it.sz,it.pk].filter(Boolean).join(' · '))+'</td><td class="vh num">'+f(nb[i]||0,0)+'</td><td class="vh num"><b>'+f(ob.ni[i],0)+'</b></td></tr>').join('')+
  '<tr class="s"><td>سعر الخام للتعادل — '+modeName(base)+'</td><td class="vh num">'+fe(pb.R)+'</td><td class="vh num"><b>'+fe(ob.Rint)+'</b></td></tr><tr><td>'+modeName(oth)+' (أحسن توزيع)</td><td class="vh num">'+fe(po.R)+'</td><td class="vh num">'+(oo.status==='ok'?fe(oo.Rint):'—')+'</td></tr></table>'+
  '<div class="hint">الأحسن = توزيع '+f(Cb.cap,0)+' باليت في '+modeName(base)+' يدّي أعلى سعر خام، مع الحد الأقصى ونسبة المقاس من الفرز لو مكتوبين.'+(ob.full?'':' ⚠ الحدود القصوى مش مكمّلة السعة.')+'</div><button class="btn ghost wide" data-ha="apply">طبّق الأحسن على الخطة</button></div>';
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
 else{set(key,x);saveDec()}
 if(key==='egp'||key==='fC'||key==='raw'){lastT=Date.now();showSaved()}
 load();live()});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.h!=null&&!ERR[t.dataset.h]&&String(t.value).trim()!==''){const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x);return}
 if(!t.dataset||t.dataset.hs==null)return;set(t.dataset.hs,t.value);const m=t.dataset.hs.match(/^items\.(\d+)\.(v|pk)$/);if(m){const it=DEC.items[+m[1]];if(it&&it.sz){const L=sizes(it);if(L.length&&L.indexOf(String(it.sz))<0)it.sz=''}}saveDec();render()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ha]');if(!b)return;const a=b.dataset.ha;
 if(a.startsWith('base:'))DEC.base=a.slice(5);
 else if(a==='add'){const pv=DEC.items[DEC.items.length-1]||{};DEC.items.push({v:pv.v||'',sz:'',pk:pv.pk||(SAFI.S.pk[0]?SAFI.S.pk[0][0]:''),cpp:pv.cpp||'',p:'',pal:0,max:'',share:''})}
 else if(a.startsWith('del:')){if(!confirm('تحذف الصنف ده من القرار؟'))return;DEC.items.splice(+a.slice(4),1);Object.keys(ERR).forEach(k=>{if(k.startsWith('items.'))delete ERR[k]})}
 else if(a==='fromSales'){const L=SAFI.S.lines.filter(l=>+l[2]);if(!L.length){alert('مفيش سطور بيع فيها كراتين في الصوافي.');return}if(!confirm('تستبدل الأصناف بسطور مبيعات الصوافي ('+L.length+')؟'))return;
  DEC.items=L.map(l=>{const m=l[7]&&typeof l[7]==='object'?l[7]:{};return {v:m.v||String(l[0]||'').replace(/\s*مقاس.*$/,''),sz:m.s||'',pk:l[1],cpp:+l[5]||0,p:+l[3]||0,pal:+l[4]||0,max:'',share:''}});Object.keys(ERR).forEach(k=>{if(k.startsWith('items.'))delete ERR[k]})}
 else if(a==='apply'){const o=BE.optimize(BE.ctx(SAFI.S,COSTS.S,DEC,DEC.base),DEC.items);if(o.status!=='ok')return;o.ni.forEach((v,i)=>DEC.items[i].pal=v)}
 else return;saveDec();render()});
/* لما ترجع من قسم تاني أو التاب يرجع: اقرا الأرقام من جديد */
function refresh(){if(document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.h!=null)return;syncFx();render()}
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
migrateOnce();syncFx();if(readDec().fresh)saveDec();render();restoreIdb();
window.DECAPP={render,live,state:()=>({safi:SAFI.S,costs:COSTS.S,dec:DEC}),BE};
})();
