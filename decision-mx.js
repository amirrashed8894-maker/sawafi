/* الصوافي والتكاليف v2.5.0 — صفحة القرار: ④ اسأل القرار · ⑤ الاحتمالات · ⑥ الحساسية · ⑦ كل الأصناف × كل العبوات.
   الحساب كله في be-mx.js فوق محرك القرار be-core.js (نفس أرقام ② بالظبط)، والأصناف/العبوات وأسعار الخام من التكاليف، وأسعار البيع من سطور الصوافي.
   إعدادات الجزء ده في decision.mx.v1 (+ .mirror). سعر البيع: من الصوافي تلقائي، وتعديله باليد بيكسب (↺ يرجّعه). سعر خام الصنف بيتكتب في التكاليف (rawBy). */
(function(){'use strict';
if(typeof BEMX==='undefined'||typeof SafiAuto==='undefined'||!window.DECAPP)return;
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const N=(x,d)=>'<span class="num">'+(x==null||!isFinite(x)?'—':f(x,d==null?2:d))+'</span>';
const modeName=m=>m==='حاوية'?'الحاوية':'البراد';
const MK='decision.mx.v1',MKM='decision.mx.v1.mirror';
const DEF={v:'',pk:'',tk:'',tv:'',d:2,conf:80,p:{},cpp:{},sel:''};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function readMx(){for(const k of [MK,MKM]){try{const p=JSON.parse(lsGet(k)||'null');const o=p&&p.S;if(o&&typeof o==='object'){const d=JSON.parse(JSON.stringify(DEF));for(const x in d)if(o[x]!=null&&typeof o[x]===typeof d[x])d[x]=o[x];return d}}catch(e){}}return JSON.parse(JSON.stringify(DEF))}
let MX=readMx();
function saveMx(){const j=JSON.stringify({ver:1,t:Date.now(),S:MX});lsSet(MK,j);lsSet(MKM,j)}
/* البيانات: نفس اللي القرار بيحسب بيه (DECAPP.state بعد load)، والتكاليف بنفس كتالوج العبوات/الأصناف اللي قسم التكاليف بيكمّله */
function data(){const s=DECAPP.state();const costs=JSON.parse(JSON.stringify(s.costs));if(typeof COSTS_CALC!=='undefined'&&COSTS_CALC.ensureCostsCatalog)COSTS_CALC.ensureCostsCatalog(costs);return {safi:s.safi,costs,dec:s.dec}}
function tgt(){const v=parseNum(MX.tv);return MX.tk&&isFinite(v)&&v>0?{k:MX.tk,v}:null}
function fix(D){const vars=(D.costs.var||[]).map(r=>r[0]),packs=(D.costs.pk||[]).map(p=>p[0]);
 if(vars.indexOf(MX.v)<0){const L=(D.safi.lines||[]).find(l=>+l[2]&&SafiAuto.varRow(D.costs,SafiAuto.lineVar(l)));MX.v=L?SafiAuto.varRow(D.costs,SafiAuto.lineVar(L))[0]:(vars.indexOf(D.costs.variety)>=0?D.costs.variety:vars[0]||'')}
 if(packs.indexOf(MX.pk)<0){const L=(D.safi.lines||[]).find(l=>+l[2]&&packs.indexOf(l[1])>=0);MX.pk=L?L[1]:packs[0]||''}
 if(vars.indexOf(MX.sel)<0)MX.sel=MX.v;if([70,80,90].indexOf(+MX.conf)<0)MX.conf=80}
/* خانة سعر البيع: تلقائي من الصوافي (رمادي) أو يدوي مع ↺ */
function priceIn(c,cls){const man=c.price.src==='man';return '<input class="v mxin'+(c.price.src==='safi'?' auto':'')+(cls?' '+cls:'')+'" inputmode="decimal" data-mxp="'+esc(c.key)+'" value="'+(c.price.v!=null?esc(+c.price.v.toFixed(4)):'')+'" placeholder="ريال" aria-label="سعر البيع ريال للكرتونة">'}
function priceBadge(c){if(c.price.src==='safi')return '<span class="acb on">✓ من الصوافي</span>';if(c.price.src==='man'&&c.price.auto!=null)return '<button type="button" class="acb re" data-mxa="reset:'+esc(c.key)+'">↺ الصوافي '+N(c.price.auto)+'</button>';if(c.price.src==='man')return '<span class="acb">يدوي</span>';return '<span class="acb off">مش في الصوافي — اكتبه</span>'}
function cppIn(c){return '<input class="v mxin'+(c.cpp.src&&c.cpp.src!=='man'?' auto':'')+'" inputmode="decimal" data-mxc="'+esc(c.pk)+'" value="'+(c.cpp.v!=null?esc(c.cpp.v):'')+'" placeholder="العدد" aria-label="كراتين في الباليت">'}
/* ---------- الرسم ---------- */
function render(){const host=$('#mx');if(!host)return;const D=data();fix(D);const T=tgt();const G=BEMX.grid(BE,SafiAuto,D.safi,D.costs,D.dec,MX,T);
 const c=BEMX.cell(BE,SafiAuto,D.safi,D.costs,D.dec,MX,MX.v,MX.pk,G.Cs,T);
 host.innerHTML='<h2>④ اسأل القرار <small>لو بعت الصنف ده بالسعر ده في السعودية، أشتري الخام بكام؟</small></h2>'+
  '<div class="mx-pick"><label class="mx-f"><span>الصنف <small>من التكاليف</small></span><select data-mx="v" aria-label="الصنف">'+G.vars.map(V=>'<option'+(V.v===MX.v?' selected':'')+'>'+esc(V.v)+'</option>').join('')+'</select></label>'+
  '<label class="mx-f"><span>العبوة</span><select data-mx="pk" aria-label="العبوة">'+G.packs.map(p=>'<option'+(p===MX.pk?' selected':'')+'>'+esc(p)+'</option>').join('')+'</select></label>'+
  '<label class="mx-f"><span>سعر البيع <small>ريال/كرتونة</small></span>'+priceIn(c,'big')+'<span data-mxb="'+esc(c.key)+'">'+priceBadge(c)+'</span></label>'+
  '<label class="mx-f"><span>كراتين/باليت</span>'+cppIn(c)+'<span class="acb">'+(c.cpp.src==='safi'?'من الصوافي':c.cpp.src==='dec'?'من أصناف القرار':c.cpp.src==='pk'?'من جدول العبوات':c.cpp.src==='man'?'يدوي':'')+'</span></label></div>'+
  '<div class="mx-tg"><span>الهدف:</span>'+[['','تعادل (ربح صفر)'],['ton','ربح ج/طن'],['pct','ربح % من المبيعات']].map(x=>'<button type="button" class="sc-chip sm'+(MX.tk===x[0]?' on':'')+'" data-mxa="tk:'+x[0]+'">'+x[1]+'</button>').join('')+
  (MX.tk?'<input class="v mxin tv" inputmode="decimal" data-mx="tv" value="'+esc(MX.tv)+'" placeholder="'+(MX.tk==='ton'?'ج / طن':'%')+'" aria-label="الربح المستهدف">':'')+'</div>'+
  '<div id="mxAns"></div>'+
  '<h2 class="mx-h2">⑤ الاحتمالات <small>سعر البيع في السعودية مش مضمون</small></h2>'+
  '<div class="mx-pick two"><label class="mx-f"><span>التذبذب في سعر البيع <small>± ريال</small></span><input class="v mxin" inputmode="decimal" data-mx="d" value="'+esc(MX.d)+'" aria-label="التذبذب ± ريال"></label>'+
  '<div class="mx-f"><span>الثقة المطلوبة</span><div class="mx-ch">'+[70,80,90].map(x=>'<button type="button" class="sc-chip sm'+(+MX.conf===x?' on':'')+'" data-mxa="conf:'+x+'">'+x+'%</button>').join('')+'</div></div></div>'+
  '<div id="mxRisk"></div>'+
  '<h2 class="mx-h2">⑥ الحساسية <small>إيه أكتر حاجة بتحرّك سعر الخام للتعادل</small></h2><div id="mxSens"></div>';
 const all=$('#mxAll');if(all){const si=G.vars.findIndex(V=>V.v===MX.sel);
  all.innerHTML='<h2>⑦ كل الأصناف × كل العبوات <small>أعلى سعر خام للتعادل ج/كجم — الصنف مالي '+modeName(D.dec.base)+' لوحده</small></h2>'+
   '<table class="two-t mx-ov"><tr class="h"><td>الصنف</td><td class="vh">خام النهارده<br>ج/كجم</td><td class="vh">أحسن عبوة</td></tr>'+
   G.vars.map(V=>'<tr><td>'+esc(V.v)+'</td><td class="vh"><input class="v mxin raw'+(V.raw.src==='fallback'?' auto':'')+'" inputmode="decimal" data-mxr="'+esc(V.v)+'" value="'+esc(V.raw.v)+'" aria-label="خام '+esc(V.v)+' النهارده"></td><td class="vh" data-mxov="'+esc(V.v)+'"></td></tr>').join('')+'</table>'+
   '<div class="hint">خام الصنف بيتسجل في التكاليف (كل صنف بيفتكر سعره). الرمادي = الصنف مالوش سعر خاص، فمحسوب على سعر الخام النهارده.</div>'+
   '<div class="sc-ch mx-vars">'+G.vars.map((V,i)=>'<button type="button" class="sc-chip'+(i===si?' on':'')+'" data-mxa="sel:'+i+'">'+esc(V.v)+'</button>').join('')+'</div>'+
   '<div class="mx-rows">'+(G.vars[si]?rowsHtml(G.vars[si].cells):'')+'</div>'}
 out()}
function rowsHtml(cells){const row=c=>'<div class="mx-row" data-mxrow="'+esc(c.key)+'"><div class="mx-rh"><b>'+esc(c.pk)+'</b><span><button type="button" class="sc-chip sm" data-mxa="add:'+esc(c.key)+'">+ للشحنة</button> <button type="button" class="sc-chip sm" data-mxa="ask:'+esc(c.pk)+'">اسأل ←</button></span></div>'+
    '<div class="mx-ri"><label><span>سعر البيع ريال</span>'+priceIn(c)+'<span data-mxb="'+esc(c.key)+'">'+priceBadge(c)+'</span></label><label><span>كراتين/باليت</span>'+cppIn(c)+'</label></div><div class="mx-ro" data-mxo="'+esc(c.key)+'"></div></div>';const A=cells.filter(c=>c.price.v>0||c.cpp.v>0),B=cells.filter(c=>!(c.price.v>0||c.cpp.v>0));
 return A.map(row).join('')+(B.length?'<details class="mx-more"'+(A.length?'':' open')+'><summary>عبوات تانية مالهاش سعر بيع ('+B.length+')</summary>'+B.map(row).join('')+'</details>':'')}
/* المخرجات بس (الخانات ما بتترسمش من جديد وإنت بتكتب) */
function out(){const D=data();fix(D);const T=tgt();const G=BEMX.grid(BE,SafiAuto,D.safi,D.costs,D.dec,MX,T);const base=D.dec.base||BE.MODES[0],oth=BE.MODES.find(m=>m!==base);
 const c=BEMX.cell(BE,SafiAuto,D.safi,D.costs,D.dec,MX,MX.v,MX.pk,G.Cs,T);const r=c.raw.v,mb=c.m[base],mo=c.m[oth];
 const rawLbl='خام '+esc(c.v)+(c.raw.src==='fallback'?' (سعر النهارده)':'')+' '+N(r);
 const verdict=R=>R==null?'':R<=0?'<em class="bad2">مفيش سعر خام يعادل</em>':r<=R?'<em class="ok2">✓ '+rawLbl+' — هامش '+N(R-r)+' ج/كجم</em>':'<em class="bad2">✗ '+rawLbl+' أعلى بـ '+N(r-R)+' ج/كجم</em>';
 const tgtTxt=T?(T.k==='ton'?'عشان تكسب '+N(T.v,0)+' ج/طن':'عشان تكسب '+N(T.v,1)+'% من المبيعات'):'';
 const need=!mb.L?'اكتب كراتين/باليت':!(c.price.v>0)?'اكتب سعر البيع':'';
 const box=(m,x,main)=>'<div class="two-k'+(main?' main':'')+'"><span>'+(main?'اشتري الخام لحد — ':'')+modeName(m)+(main?' (أساسي)':' (فرعي)')+'</span><b>'+(need?'<i>'+need+'</i>':N(T?x.Rt:x.R)+' <i>ج/كجم</i>')+'</b>'+(need?'':(T?'<em class="sm2">'+tgtTxt+' · للتعادل '+N(x.R)+'</em>':'')+verdict(T?x.Rt:x.R))+'</div>';
 const ans=$('#mxAns');if(ans){ans.innerHTML='<div class="two"><div class="two-p"><div class="two-ks">'+box(base,mb,true)+box(oth,mo,false)+'</div>'+
  '<div class="mx-rev">على '+rawLbl+' ج/كجم: <b>أقل سعر بيع للتعادل '+N(mb.minP)+' ريال</b> للكرتونة في '+modeName(base)+' · '+N(mo.minP)+' في '+modeName(oth)+(T?'<br>'+tgtTxt+': '+N(mb.minPt)+' ريال ('+modeName(base)+') · '+N(mo.minPt)+' ('+modeName(oth)+')':'')+'</div>'+
  (mb.L&&c.price.v>0?'<div class="mx-rev sm">على سعرك '+N(c.price.v)+' ريال و'+rawLbl+': '+(mb.profit>=0?'ربح ':'خسارة ')+N(Math.abs(mb.profit))+' ج/طن · الشحنة '+N(Math.abs(mb.profit*mb.L.T),0)+' ج ('+N(mb.L.cartons,0)+' كرتونة · '+N(mb.L.T,2)+' طن صافي · '+N(D.dec.cap[base],0)+' باليت)</div>':'')+
  (mb.L&&(mb.L.missPk||mb.L.missWash)?'<div class="hint">'+(mb.L.missPk?'العبوة مالهاش سعر في التكاليف (محسوبة صفر). ':'')+(mb.L.missWash?'الصنف مالوش غسيل في التكاليف. ':'')+'</div>':'')+
  '<div class="hint">نفس حساب ② («لو الصنف مالي الشحنة لوحده»): أعلى خام = (صافي الطن − العبوات − المستلزمات − الغسيل + الفرزة المباعة − نصيب الطن من مصروفات السعودية والنولون'+(T?' − الربح المستهدف':'')+') ÷ '+N(mb.L?mb.L.k:null,1)+' كجم خام لكل طن صافي.</div></div></div>'}
 /* ⑤ */
 const rk=$('#mxRisk');if(rk){const Dd=BEMX.dist(c.price.v,parseNum(MX.d));const L=mb.L,cf=(+MX.conf||80)/100;
  if(!L||!Dd){rk.innerHTML='<div class="hint">'+(need||'اكتب سعر البيع')+' عشان نحسب الاحتمالات.</div>'}
  else{const R=BEMX.risk(L,r,Dd,cf,T);const pc=v=>'<span class="num">'+f(v*100,0)+'%</span>';
   const steps=[];for(let k=-4;k<=4;k++){const x=Math.round((r+k*0.5)*100)/100;if(x>=0)steps.push(x)}
   rk.innerHTML='<div class="kpis mx-k"><div class="kpi'+(R.prob<0.5?' neg':'')+'"><span>احتمال المكسب على '+rawLbl+'</span><b>'+pc(R.prob)+'</b><em>'+(T?'احتمال تحقيق الهدف '+pc(R.probTgt):'الخسارة '+pc(1-R.prob))+'</em></div>'+
    '<div class="kpi"><span>الربح المتوقع</span><b>'+N(R.expTon,0)+' ج/طن</b><em>الشحنة '+N(R.expShip,0)+' ج</em></div>'+
    '<div class="kpi wide be-main"><span>أعلى سعر خام بثقة '+N(cf*100,0)+'% إنك ما تخسرش</span><b>'+N(R.rConf)+' ج/كجم</b><em>'+(T?tgtTxt+' بنفس الثقة: '+N(R.rConfTgt)+' ج/كجم · ':'')+'يعني السعر في السعودية هيبقى '+N(R.pConf)+' ريال أو أكتر في '+N(cf*100,0)+'% من المرات</em></div></div>'+
    '<div class="mx-rev sm">90% من المرات سعر الكرتونة بين '+N(Dd.lo)+' و'+N(Dd.hi)+' ريال (المتوقع '+N(Dd.m)+'، المتوسط '+N(Dd.mean)+'). أسوأ 10%: '+N(R.q10)+' ريال ← '+(R.p10>=0?'ربح ':'خسارة ')+N(Math.abs(R.p10),0)+' ج/طن · أحسن 10%: '+N(R.q90)+' ريال ← ربح '+N(R.p90,0)+' ج/طن</div>'+
    '<table class="two-t mx-pt"><tr class="h"><td>سعر الخام ج/كجم</td><td class="vh">احتمال المكسب</td><td class="vh">الربح المتوقع ج/طن</td></tr>'+steps.map(x=>{const p=BEMX.probAbove(Dd,BEMX.priceMin(L,x,null)),e=L.alpha*Dd.mean+L.b-L.k*x;
     return '<tr class="'+(Math.abs(x-r)<1e-9?'cur':'')+(p<0.5?' neg':'')+'"><td>'+N(x)+(Math.abs(x-r)<1e-9?' <small>النهارده</small>':'')+'</td><td class="vh"><span class="mx-bar"><i style="width:'+Math.round(p*100)+'%"></i></span>'+pc(p)+'</td><td class="vh">'+N(e,0)+'</td></tr>'}).join('')+'</table>'+
    '<div class="hint">ازاي: سعر البيع بيتحرك حوالين '+N(Dd.m)+' ريال (توزيع لوغاريتمي — الأسعار ما بتنزلش تحت الصفر، والطلعة ممكن تبقى أكبر من النزلة). المكسب لو السعر طلع فوق '+N(R.pStar)+' ريال (سعر التعادل على الخام ده). الأرقام محسوبة بالمعادلة بالظبط ومتأكَّد منها بمحاكاة 200,000 سعر عشوائي في الاختبارات.</div>'}}
 /* ⑥ */
 const sn=$('#mxSens');if(sn){const S=mb.L&&c.price.v>0?BEMX.sens(BE,D.safi,D.costs,D.dec,base,c.it):null;
  if(!S){sn.innerHTML='<div class="hint">'+(need||'—')+'</div>'}else{const mx=Math.max(...S.rows.map(x=>Math.max(Math.abs(x.dn),Math.abs(x.up))),1e-9);
   sn.innerHTML='<div class="mx-rev sm">أعلى خام للتعادل دلوقتي '+N(S.base)+' ج/كجم ('+modeName(base)+'). لو حاجة واحدة اتغيرت:</div><table class="two-t mx-sn"><tr class="h"><td>لو اتغير</td><td class="vh">لو قلّ</td><td class="vh">لو زاد</td></tr>'+
    S.rows.map(x=>'<tr><td>'+esc(x.n)+'<span class="mx-tor"><i class="dn '+(x.dn>=0?'pos':'neg')+'" style="width:'+Math.round(Math.abs(x.dn)/mx*50)+'%"></i><i class="up '+(x.up>=0?'pos':'neg')+'" style="width:'+Math.round(Math.abs(x.up)/mx*50)+'%"></i></span></td><td class="vh">'+(x.dn>=0?'+':'−')+N(Math.abs(x.dn))+'</td><td class="vh">'+(x.up>=0?'+':'−')+N(Math.abs(x.up))+'</td></tr>').join('')+'</table>'+
    '<div class="hint">ج/كجم خام (أخضر = سعر الخام المسموح بيزيد، أحمر = بيقل). أول سطر هو أكتر حاجة لازم تتابعها قبل ما تشتري.</div>'}}
 /* ⑦ */
 G.vars.forEach(V=>{const e=document.querySelector('[data-mxov="'+CSS.escape(V.v)+'"]');if(!e)return;const b=V.best;
  e.innerHTML=b?'<b>'+N(b.m[base].R)+'</b><small>'+esc(b.pk)+'</small>'+(V.raw.v<=b.m[base].R?'<em class="ok2">✓ +'+N(b.m[base].R-V.raw.v)+'</em>':'<em class="bad2">✗ −'+N(V.raw.v-b.m[base].R)+'</em>'):'<small>مفيش سعر بيع في الصوافي — اكتبه تحت</small>'});
 G.vars.forEach(V=>V.cells.forEach(c=>{const e=document.querySelector('[data-mxo="'+CSS.escape(c.key)+'"]');if(!e)return;const a=c.m[base],o=c.m[oth];
  if(!a.L){e.innerHTML='<span class="sm2">اكتب كراتين/باليت</span>';return}
  e.innerHTML='<div><span>أعلى خام '+modeName(base)+'</span><b>'+(a.R!=null?N(T?a.Rt:a.R):'—')+'</b></div><div><span>'+modeName(oth)+'</span><b>'+(o.R!=null?N(T?o.Rt:o.R):'—')+'</b></div><div><span>أقل سعر بيع</span><b>'+N(T?a.minPt:a.minP)+'</b></div>'+
   (a.R!=null?'<em class="'+(V.raw.v<=(T?a.Rt:a.R)?'ok2':'bad2')+'">'+(V.raw.v<=(T?a.Rt:a.R)?'✓ مربح على خام '+N(V.raw.v):'✗ خسارة على خام '+N(V.raw.v))+'</em>':'')}));
 /* الخانات اللي مش بتكتب فيها: نفس القيمة في كل مكان */
 document.querySelectorAll('[data-mxp]').forEach(inp=>{const [v,pk]=inp.dataset.mxp.split('|');const p=BEMX.priceOf(SafiAuto,D.safi,D.costs,MX,v,pk);if(document.activeElement!==inp){inp.value=p.v!=null?String(+p.v.toFixed(4)):''}inp.classList.toggle('auto',p.src==='safi');
  const b=inp.parentNode.querySelector('[data-mxb]');if(b){const h=priceBadge({key:inp.dataset.mxp,price:p});if(b.innerHTML!==h)b.innerHTML=h}});
 document.querySelectorAll('[data-mxc]').forEach(inp=>{const cp=BEMX.cppOf(D.safi,D.costs,D.dec,MX,inp.dataset.mxc);if(document.activeElement!==inp)inp.value=cp.v!=null?String(cp.v):'';inp.classList.toggle('auto',!!cp.src&&cp.src!=='man')});
 window.__mx={G,c}}
/* ---------- الأحداث ---------- */
function bad(t,on){t.classList.toggle('bad',!!on)}
function writeRaw(v,x){let p=null;try{p=JSON.parse(lsGet('citrusCosts.v2')||'null')}catch(e){}const S=p&&p.S?p.S:JSON.parse(JSON.stringify(DECAPP.state().costs));
 if(!S.rawBy||typeof S.rawBy!=='object'||Array.isArray(S.rawBy))S.rawBy={};S.rawBy[v]=x;if(S.variety===v)S.raw=x;lsSet('citrusCosts.v2',JSON.stringify({ver:2,t:Date.now(),S}))}
/* v2.6.0: «+ للشحنة» = سطر جديد في الصوافي (الشحنة واحدة) */
function addItem(v,pk){const D=data();const c=BEMX.cell(BE,SafiAuto,D.safi,D.costs,D.dec,MX,v,pk,{},null);DECAPP.addLine({v,sz:'',pk,cpp:c.cpp.v||'',p:c.price.v||'',pal:0})}
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset)return;
 if(t.dataset.mxp!=null){const raw=String(t.value).trim();if(raw===''){delete MX.p[t.dataset.mxp];bad(t,0)}else{const x=parseNum(raw);if(!(x>0)){bad(t,1);return}bad(t,0);MX.p[t.dataset.mxp]=x}saveMx();out();return}
 if(t.dataset.mxc!=null){const raw=String(t.value).trim();if(raw===''){delete MX.cpp[t.dataset.mxc];bad(t,0)}else{const x=parseNum(raw);if(!(x>0)){bad(t,1);return}bad(t,0);MX.cpp[t.dataset.mxc]=x}saveMx();out();return}
 if(t.dataset.mxr!=null){const x=parseNum(t.value);if(!(x>=0)||String(t.value).trim()===''){bad(t,1);return}bad(t,0);writeRaw(t.dataset.mxr,x);DECAPP.render();out();return}
 if(t.dataset.mx==='d'||t.dataset.mx==='tv'){const x=parseNum(t.value);if(String(t.value).trim()!==''&&!(x>=0)){bad(t,1);return}bad(t,0);MX[t.dataset.mx]=String(t.value).trim()===''?'':x;saveMx();out();return}
 /* أي خانة تانية في الصفحة (الدولار، النولون، الخام، الأصناف): القرار بيحدّث نفسه الأول وبعدين احنا */
 if(t.dataset.h!=null)setTimeout(out,0)});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if(t.dataset.mx==='v'||t.dataset.mx==='pk'){MX[t.dataset.mx]=t.value;if(t.dataset.mx==='v')MX.sel=t.value;saveMx();render();return}
 if(t.dataset.hs!=null)setTimeout(out,0);if(t.dataset.mxp!=null||t.dataset.mxc!=null)out()});
document.addEventListener('focusout',e=>{const t=e.target;if(t&&t.dataset&&(t.dataset.mxp!=null||t.dataset.mxc!=null))setTimeout(out,0)});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mxa],[data-ha]');if(!b)return;if(b.dataset.ha!=null){setTimeout(out,0);return}const a=b.dataset.mxa,i=a.indexOf(':'),k=a.slice(0,i),v=a.slice(i+1);
 if(k==='tk'){MX.tk=v;if(v&&!(parseNum(MX.tv)>0))MX.tv=v==='ton'?1000:10}else if(k==='conf')MX.conf=+v;else if(k==='reset')delete MX.p[v];
 else if(k==='sel'){const D=data();MX.sel=(D.costs.var[+v]||[''])[0]}
 else if(k==='ask'){MX.v=MX.sel;MX.pk=v;saveMx();render();const h=$('#mx');if(h)h.scrollIntoView({block:'start'});return}
 else if(k==='add'){const [vv,pk]=v.split('|');addItem(vv,pk)}
 saveMx();render()});
function refresh(){if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#mx,#mxAll'))return;MX=readMx();render()}
window.addEventListener('storage',e=>{if(!e.key||/^(safiNetback|citrusCosts|decision|fx)/.test(e.key))setTimeout(refresh,0)});
window.addEventListener('pageshow',e=>{if(e.persisted)refresh()});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(refresh,0)});
render();window.MXAPP={render,out,state:()=>MX,data};
})();
