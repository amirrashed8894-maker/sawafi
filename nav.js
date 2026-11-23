/* الصوافي والتكاليف v2.0.0 — شريط الأقسام (القرار الرئيسي · الصوافي · التكاليف). نفس الموقع، فالبيانات مشتركة مباشرة. */
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
window.addEventListener('storage',e=>{if(OWN&&e.key===OWN&&e.newValue)adopt(e.newValue)});
window.addEventListener('pageshow',e=>{if(OWN&&e.persisted){try{adopt(localStorage.getItem(OWN))}catch(x){}}});
})();
