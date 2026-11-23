/* الصوافي والتكاليف v2.1.0 — «القرار في الاتجاهين»: عرض واحد مشترك للصفحة الرئيسية وقسم التكاليف (الشاشة بس).
   ① أقل سعر بيع للكرتونة بالريال لكل صنف على سعر الخام النهارده  ② أعلى سعر لشراء الخام ج/كجم على أسعار البيع.
   الحساب كله من BE.twoWay (be-core.js) — نفس الأرقام في كل مكان. */
(function(root){'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(x,d)=>x==null||!isFinite(x)?'—':Number(x).toLocaleString('en-US',{minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d});
const N=(x,d)=>'<span class="num">'+nf(x,d)+'</span>';
const modeName=m=>m==='حاوية'?'الحاوية':'البراد';
const label=it=>[it.v,it.sz].filter(Boolean).join(' ');
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function unwrap(raw){try{if(!raw)return null;const p=JSON.parse(raw);return p&&p.S?{S:p.S,t:p.t||0}:{S:p,t:0}}catch(e){return null}}
function fromObj(tpl,o){const d=JSON.parse(JSON.stringify(tpl));for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];return d}
const okSafi=o=>!!(o&&typeof o==='object'&&Array.isArray(o.lines));
const mig=s=>{try{root.ExpMig&&root.ExpMig.migrateExp(s)}catch(e){}return s};
/* نفس ترتيب القراءة في الصوافي والصفحة الرئيسية: الأساسي ← النسخة ← القديم ← المثبّت على الجهاز ← المثبّت في البرنامج */
function readSafi(tpl,pinned){for(const k of ['safiNetback.v2','safiNetback.v2.mirror','safiNetback']){const u=unwrap(lsGet(k));if(u&&okSafi(u.S))return {S:mig(fromObj(tpl,u.S)),src:k}}
 const up=unwrap(lsGet('safiNetback.v2.userPinned'));return {S:mig(fromObj(tpl,JSON.parse(JSON.stringify(up&&okSafi(up.S)?up.S:pinned)))),src:'fresh'}}
function readDec(BE){for(const k of ['decision.v1','decision.v1.mirror']){const u=unwrap(lsGet(k));if(u&&u.S&&typeof u.S==='object')return BE.decFrom(u.S)}return BE.decFrom(null)}
/* tw = BE.twoWay(...)؛ o.compact = صندوق قسم التكاليف */
function html(tw,o){o=o||{};const A=tw.base,B=tw.sec,raw=tw.raw;const its=A.items;
 const rows=its.map((x,i)=>{const y=B.items[i];const ok=x.ok&&x.p>0;const good=ok&&x.gap>=0;
  return '<tr data-two="'+i+'"><td>'+esc(label(x)||'—')+'<small>'+esc(x.pk)+'</small></td><td class="vh num two-a"><b>'+nf(x.minP)+'</b></td><td class="vh num two-b">'+nf(y.minP)+'</td><td class="vh">'+(ok?'<span class="num">'+nf(x.p)+'</span> <em class="'+(good?'ok2':'bad2')+'">'+(good?'✓ ':'✗ ')+'<span class="num">'+(x.gap>=0?'+':'')+nf(x.gap)+'</span></em>':'—')+'</td></tr>'}).join('');
 const verdict=p=>p.R==null?'<em class="sm2">اكتب الأصناف والباليتات</em>':p.R<=0?'<em class="bad2">مفيش سعر خام يعادل</em>':raw<=p.R?'<em class="ok2">✓ هامش '+N(p.R-raw)+' على خام '+N(raw)+'</em>':'<em class="bad2">✗ خام '+N(raw)+' أعلى بـ '+N(raw-p.R)+'</em>';
 const big=(p,main)=>'<div class="two-k'+(main?' main':'')+'"><span>'+modeName(p.m)+(main?' (أساسي)':' (فرعي)')+'</span><b>'+(p.R==null?'—':N(p.R)+' <i>ج/كجم</i>')+'</b>'+(main||!o.compact?verdict(p):'')+'</div>';
 const alone=o.compact?'':'<table class="two-t sm"><tr class="h"><td>لو الصنف مالي الشحنة لوحده</td><td class="vh">'+modeName(A.m)+'</td><td class="vh">'+modeName(B.m)+'</td></tr>'+its.map((x,i)=>'<tr><td>'+esc(label(x)||'—')+'<small>'+esc(x.pk)+'</small></td><td class="vh num">'+nf(x.Ralone)+'</td><td class="vh num">'+nf(B.items[i].Ralone)+'</td></tr>').join('')+'</table>';
 return '<div class="two'+(o.compact?' compact':'')+'">'+
  '<div class="two-p" id="twoSell"><div class="two-h"><b>① سعر تعادل البيع</b><span>أقل سعر بيع للكرتونة بالريال — على خام النهارده '+N(raw)+' ج/كجم</span></div>'+
   '<table class="two-t"><tr class="h"><td>الصنف · العبوة</td><td class="vh">'+modeName(A.m)+'</td><td class="vh">'+modeName(B.m)+'</td><td class="vh">سعرك</td></tr>'+(rows||'<tr><td colspan="4">مفيش أصناف</td></tr>')+'</table>'+
   '<div class="hint">ريال/كرتونة. أقل سعر = اللي يخلّي ربح شحنة مالية من الصنف ده صفر على سعر الخام ده (بعد العمولة ومصروفات السعودية والنولون وتكاليف مصر).</div></div>'+
  '<div class="two-p" id="twoBuy"><div class="two-h"><b>② سعر التعادل لشراء الخام</b><span>أعلى سعر لشراء الخام ج/كجم واصل المحطة — على أسعار البيع وخطة الباليتات</span></div>'+
   '<div class="two-ks">'+big(A,true)+big(B,false)+'</div>'+alone+'</div>'+
  '<div class="two-sc">'+scenHTML(tw,{compact:o.compact,id:o.compact?'scenCosts':'scen'})+'</div>'+
  (o.compact?'<a class="lnk two-edit" href="index.html">الأسعار والخطة من «القرار» ←</a>':'')+'</div>'}
/* ③ مربع التكاليف وأسعار البيع والسيناريوهات (كل ريال فوق وتحت لحد 7): صنف/عبوة + الحاوية/البراد بأزرار */
const SEL={i:0,m:null};
const sg=v=>v==null||!isFinite(v)?'—':(v>=0?'+':'−')+nf(Math.abs(v),0);
function scenPanel(s,o){if(!s||!s.ok)return '<div class="hint">اكتب العبوة وكراتين الباليت وسعر البيع للصنف ده.</div>';
 const cost='<table class="two-t sc-c"><tr class="h"><td>التكاليف لكل طن صافي</td><td class="vh">ج/طن</td></tr>'+
  '<tr><td>الخام <small>'+nf(s.raw)+' ج/كجم × '+nf(s.k,1)+' كجم</small></td><td class="vh num">'+nf(s.rawTon,0)+'</td></tr>'+
  '<tr><td>الفرزة المباعة</td><td class="vh num">−'+nf(s.credit,0)+'</td></tr>'+
  '<tr><td>العبوات + المستلزمات + الغسيل</td><td class="vh num">'+nf(s.pkg+s.sup+s.wash,0)+'</td></tr>'+
  '<tr class="s"><td>تكاليف مصر</td><td class="vh num">'+nf(s.egy,0)+'</td></tr>'+
  '<tr><td>مصروفات السعودية + النولون <small>'+nf(s.expSar,0)+' + '+nf(s.frSar,0)+' ريال ÷ '+nf(s.T,2)+' طن</small></td><td class="vh num">'+nf(s.share,0)+'</td></tr>'+
  '<tr class="s"><td>إجمالي التكلفة</td><td class="vh num">'+nf(s.total,0)+'</td></tr>'+
  '<tr><td>سعر البيع الحالي <small>'+nf(s.p)+' ريال/كرتونة · عمولة '+nf(s.comm*100,1)+'%</small></td><td class="vh num">'+nf(s.rev,0)+'</td></tr>'+
  '<tr class="s"><td>الربح/الخسارة على سعر النهارده</td><td class="vh num '+(s.rev-s.total>=0?'ok2':'bad2')+'">'+sg(s.rev-s.total)+'</td></tr></table>';
 const rows=s.rows.map(r=>'<tr class="'+(r.d===0?'cur':'')+(r.perShip<0?' neg':'')+'"><td class="num">'+(r.d===0?'◀ ':'')+nf(r.p)+(r.d?' <small>'+(r.d>0?'+':'−')+Math.abs(r.d)+'</small>':'')+'</td><td class="vh num">'+nf(r.R)+'</td><td class="vh num">'+sg(r.perTon)+'</td><td class="vh num">'+sg(r.perShip)+'</td></tr>').join('');
 return cost+'<table class="two-t sc-t"><tr class="h"><td>سعر البيع<br>ريال/كرتونة</td><td class="vh">تعادل الخام<br>ج/كجم</td><td class="vh">ربح/طن<br>ج</td><td class="vh">ربح/'+(s.m==='حاوية'?'حاوية':'براد')+'<br>ج</td></tr>'+rows+'</table>'+
  '<div class="hint">على خام '+nf(s.raw)+' ج/كجم و'+modeName(s.m)+' مالية من الصنف ده ('+nf(s.cap,0)+' باليت · '+nf(s.cartons,0)+' كرتونة · '+nf(s.T,2)+' طن). أقل سعر للتعادل '+nf(s.minP)+' ريال.</div>'}
function scenHTML(tw,o){o=o||{};const ms=tw.modes;if(SEL.m==null||!ms.some(M=>M.m===SEL.m))SEL.m=ms[0].m;const n=ms[0].scen.length;if(SEL.i>=n)SEL.i=0;if(!n)return '';
 const lab=s=>esc([[s.v,s.sz].filter(Boolean).join(' '),s.pk].filter(Boolean).join(' · ')||'—');
 return '<div class="scen'+(o.compact?' compact':'')+'" id="'+(o.id||'scen')+'"><div class="two-h"><b>③ التكاليف وأسعار البيع والسيناريوهات</b><span>كل 1 ريال فوق وتحت سعر الكرتونة لحد 7 ريال — على خام النهارده '+N(tw.raw)+' ج/كجم</span></div>'+
  '<div class="sc-ch">'+ms[0].scen.map((s,i)=>'<button type="button" class="sc-chip'+(i===SEL.i?' on':'')+'" data-sc-i="'+i+'">'+lab(s)+'</button>').join('')+'</div>'+
  '<div class="sc-ch">'+ms.map((M,j)=>'<button type="button" class="sc-chip sm'+(M.m===SEL.m?' on':'')+'" data-sc-m="'+esc(M.m)+'">'+modeName(M.m)+(j?' (فرعي)':' (أساسي)')+'</button>').join('')+'</div>'+
  ms.map(M=>M.scen.map((s,i)=>'<div class="sc-p'+(i===SEL.i&&M.m===SEL.m?' on':'')+'" data-sp="'+i+'|'+esc(M.m)+'">'+scenPanel(s,o)+'</div>').join('')).join('')+'</div>'}
if(typeof document!=='undefined')document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sc-i],[data-sc-m]');if(!b)return;const box=b.closest('.scen');if(!box)return;
 if(b.dataset.scI!=null)SEL.i=+b.dataset.scI;if(b.dataset.scM!=null)SEL.m=b.dataset.scM;
 box.querySelectorAll('[data-sc-i]').forEach(x=>x.classList.toggle('on',+x.dataset.scI===SEL.i));box.querySelectorAll('[data-sc-m]').forEach(x=>x.classList.toggle('on',x.dataset.scM===SEL.m));
 box.querySelectorAll('.sc-p').forEach(x=>x.classList.toggle('on',x.dataset.sp===SEL.i+'|'+SEL.m))});
root.BETwo={readSafi,readDec,html,scenHTML,SEL,nf,fromObj};if(typeof module==='object'&&module.exports)module.exports=root.BETwo;
})(typeof window!=='undefined'?window:globalThis);
