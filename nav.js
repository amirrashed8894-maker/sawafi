/* الصوافي والتكاليف v2.0.0 — شريط الأقسام (القرار الرئيسي · الصوافي · التكاليف). نفس الموقع، فالبيانات مشتركة مباشرة. */
(function(){'use strict';
/* v2.3.1 (مراجعة t198) — الدولار الموحّد في كل قسم، مش في الرئيسية بس: قبل ما الصفحة تقرا بياناتها، آخر دولار اتعدّل
   (في الصوافي أو التكاليف) بيتكتب في القسم التاني. نفس قاعدة الرئيسية (decision.js syncFx): اللي اتغيّر من آخر مزامنة يكسب.
   بيلمس خانة الدولار بس (egp في الصوافي، usd في التكاليف) ووقت الحفظ t، وباقي البيانات زي ما هي. */
(function fxSync(){try{const ls=window.localStorage;if(!ls)return;
 const rd=k=>{try{const p=JSON.parse(ls.getItem(k)||'null');return p&&p.S&&typeof p.S==='object'?p:null}catch(e){return null}};
 const sp=rd('safiNetback.v2')||rd('safiNetback.v2.mirror'),cp=rd('citrusCosts.v2');
 /* القسم اللي لسه ما اتحفظش بيتحسب بقيمته الافتراضية زي الرئيسية بالظبط: الصوافي = المدخلات الرئيسية (53.5)، التكاليف = DEF (52) */
 const up=rd('safiNetback.v2.userPinned'),freshSafi=up&&+up.S.egp>0?+up.S.egp:53.5,freshCosts=52;
 const s=sp?+sp.S.egp:freshSafi,c=cp?+cp.S.usd:freshCosts;
 let F=null;try{F=JSON.parse(ls.getItem('fx.v1')||'null')}catch(e){}
 let canon;if(!F||!(+F.v>0))canon=sp?s:cp?c:freshSafi;else{const sCh=s!==F.safi,cCh=c!==F.costs;canon=sCh?s:cCh?c:+F.v}
 if(!(canon>0))return;const now=Date.now();
 const unpend=(k,keys)=>{try{const p=JSON.parse(ls.getItem(k)||'null');if(p&&p.ERR){keys.forEach(x=>{delete p.ERR[x];if(p.DR)delete p.DR[x]});ls.setItem(k,JSON.stringify(p))}}catch(e){}};
 if(sp&&s!==canon){sp.S.egp=canon;sp.t=now;const j=JSON.stringify(sp);ls.setItem('safiNetback.v2',j);ls.setItem('safiNetback.v2.mirror',j);unpend('safiNetback.v2.pending',['k:egp'])}
 if(cp&&c!==canon){cp.S.usd=canon;cp.t=now;ls.setItem('citrusCosts.v2',JSON.stringify(cp));unpend('citrusCosts.v2.pending',['usd','k:usd'])}
 /* القسم اللي لسه ما اتحفظش: الدولار بيتظبط أول ما صفحته تفتح (DOMContentLoaded تحت) */
 window.__fxSeed={safi:!sp&&canon!==freshSafi?canon:null,costs:!cp&&canon!==freshCosts?canon:null};
 ls.setItem('fx.v1',JSON.stringify({v:canon,safi:sp?canon:freshSafi,costs:cp?canon:freshCosts,t:now}))}catch(e){}})();
})();
(function(){'use strict';
const P=[['./','القرار','home'],['safi.html','الصوافي','safi'],['costs.html','التكاليف','costs']];
const path=location.pathname.split('/').pop()||'index.html';
const cur=/safi\.html$/.test(path)?'safi':/costs\.html$/.test(path)?'costs':'home';
const css='.appnav{position:sticky;top:0;z-index:10;display:flex;gap:6px;padding:8px 10px calc(8px);margin:-4px -4px 12px;background:#111;border-radius:0 0 14px 14px;padding-top:max(8px,env(safe-area-inset-top))}'+
 '.appnav a{flex:1;text-align:center;color:#ddd;text-decoration:none;font-weight:800;font-size:15px;padding:9px 4px;border-radius:10px;-webkit-tap-highlight-color:transparent}'+
 '.appnav a.on{background:#fff;color:#111}.appnav a:active{opacity:.7}@media print{.appnav{display:none!important}}';
function mount(){if(document.querySelector('.appnav'))return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const n=document.createElement('nav');n.className='appnav';n.setAttribute('aria-label','الأقسام');
 n.innerHTML=P.map(p=>'<a href="'+p[0]+'" data-nav="'+p[2]+'"'+(p[2]===cur?' class="on" aria-current="page"':'')+'>'+p[1]+'</a>').join('');
 const app=document.getElementById('app');if(app)app.insertBefore(n,app.firstChild);else document.body.insertBefore(n,document.body.firstChild)}
if(document.getElementById('app'))mount();else document.addEventListener('DOMContentLoaded',mount);
/* لو القسم مفتوح في تاب تاني أو رجع من ذاكرة المتصفح (bfcache) والبيانات اتغيرت من قسم تاني: نحدّث S في الصفحة
   قبل ما الصفحة تحفظ نسختها القديمة فوق الجديدة. */
const OWN=cur==='safi'?'safiNetback.v2':cur==='costs'?'citrusCosts.v2':null;
function adopt(raw){if(!OWN||!raw)return;try{const p=JSON.parse(raw);const o=p&&p.S?p.S:p;if(!o||typeof o!=='object')return;
 if(typeof S!=='undefined'&&JSON.stringify(S)===JSON.stringify(o))return;
 if(cur==='safi'){if(!Array.isArray(o.lines))return;S=fromObj(o);migrateLines(S.lines)}else{const d=JSON.parse(JSON.stringify(DEF));for(const k in d)if(o[k]!==undefined&&o[k]!==null&&Array.isArray(d[k])===Array.isArray(o[k]))d[k]=o[k];for(const k in o)if(!(k in d))d[k]=o[k];S=d}
 if(p.t)lastT=p.t;renderAll()}catch(e){}}
document.addEventListener('DOMContentLoaded',()=>{const Z=window.__fxSeed||{},v=cur==='safi'?Z.safi:cur==='costs'?Z.costs:null,k=cur==='safi'?'egp':'usd';if(!(v>0))return;
 try{if(typeof S!=='undefined'&&S&&S[k]!==v){S[k]=v;if(typeof save==='function')save();if(typeof renderAll==='function')renderAll()}}catch(e){}});
window.addEventListener('storage',e=>{if(OWN&&e.key===OWN&&e.newValue)adopt(e.newValue)});
window.addEventListener('pageshow',e=>{if(OWN&&e.persisted){try{adopt(localStorage.getItem(OWN))}catch(x){}}});
})();
