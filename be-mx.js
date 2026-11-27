/* الصوافي والتكاليف v2.5.0 — «اسأل القرار»: كل صنف × كل عبوة، هامش ربح مستهدف، الاحتمالات والحساسية (طلب أمير 27/11/2026).
   حساب بحت من غير DOM. كل الأرقام من نفس محرك القرار (be-core.js: ctx / item / itemBE / priceForRaw) — فسعر التعادل هنا = جدول ② «لو الصنف مالي الشحنة لوحده» بالظبط.
   الربح للطن الصافي لصنف مالي الشحنة خطّي في سعر البيع p وسعر الخام r:
     ربح/طن = α·p + b − k·r
     α = (1−العمولة) × (1000 ÷ وزن الكرتونة) ÷ ريال/$ × ج/$        (جنيه لكل ريال في سعر الكرتونة)
     b = − العبوات − المستلزمات − الغسيل + الفرزة المباعة − نصيب الطن من مصروفات السعودية والنولون
     k = كجم خام لكل طن صافي = 1000 ÷ ((1−هالك)×(1−فرزة−سوبرماركت))
   ← أعلى خام = (α·p + b − الربح المستهدف) ÷ k ،  أقل سعر بيع = (k·r − b + الربح المستهدف) ÷ α  (قفل رياضي، مش تقريب).
   الاحتمالات: سعر البيع في السعودية مش مضمون → لوغاريتمي طبيعي (lognormal): الوسيط = السعر المتوقع، و90% من المرات بين (السعر − التذبذب) و(السعر + التذبذب).
     احتمال المكسب = P(p > أقل سعر بيع) = 1 − Φ((ln p* − μ)/σ) ، الربح المتوقع = α·e^(μ+σ²/2) + b − k·r ،
     أعلى خام بثقة c = أعلى خام على السعر اللي بيتعدّى في c من المرات = (α·e^(μ+σ·Φ⁻¹(1−c)) + b) ÷ k . */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BEMX=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const Z90=1.6448536269514722;            // Φ⁻¹(0.95): التذبذب = نطاق 90%
const num=x=>{const v=+x;return isFinite(v)?v:0};
/* Φ: دالة التوزيع الطبيعي (erfc بدقة 1.2e-7 — Numerical Recipes) */
function Phi(z){const x=Math.abs(z)/Math.SQRT2,t=1/(1+0.5*x);
 const r=t*Math.exp(-x*x-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));
 return z>=0?1-r/2:r/2}
/* Φ⁻¹ (Acklam) + خطوة نيوتن */
function invPhi(p){if(!(p>0&&p<1))return p<=0?-Infinity:Infinity;
 const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],
  c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416],pl=0.02425;let q,r,x;
 if(p<pl){q=Math.sqrt(-2*Math.log(p));x=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
 else if(p<=1-pl){q=p-0.5;r=q*q;x=(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)}
 else{q=Math.sqrt(-2*Math.log(1-p));x=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
 const e=Phi(x)-p,u=e*Math.sqrt(2*Math.PI)*Math.exp(x*x/2);return x-u/(1+x*u/2)}
/* الشكل الخطّي للربح/طن لصنف مالي وسيلة النقل (C = BE.ctx). null لو الوزن أو الكراتين/باليت ناقصين */
function lin(BE,C,it){const x=BE.item(C,Object.assign({},it,{p:0}));if(!x.ok||!(C.cap>0)||!(C.k>0))return null;
 const T=C.cap*x.tPal,alpha=(1-C.comm)*(1000/x.w)/C.u*C.E,share=C.sharedE/T,b=x.a-C.pAdd*alpha-share;   // x.a فيه pAdd لو موجود — بنشيله، الـ p نفسه بيتحط برّه
 return {alpha,b,k:C.k,T,share,w:x.w,cpp:x.cpp,pkg:x.pkg,sup:x.sup,wash:x.wash||0,credit:x.credit,cartons:C.cap*x.cpp,missPk:x.missPk,missWash:x.missWash}}
/* الربح المستهدف ج/طن صافي: tgt={k:'ton',v} ج/طن أو {k:'pct',v} % من صافي المبيعات (بعد العمولة) */
function piOf(L,p,tgt){if(!tgt||!tgt.k)return 0;if(tgt.k==='ton')return num(tgt.v);if(tgt.k==='pct')return L.alpha*p*num(tgt.v)/100;return 0}
function profitTon(L,p,r){return L.alpha*p+L.b-L.k*r}
function rawMax(L,p,tgt){if(!L||!(p>0))return null;return (L.alpha*p+L.b-piOf(L,p,tgt))/L.k}
function priceMin(L,r,tgt){if(!L)return null;const q=tgt&&tgt.k==='pct'?num(tgt.v)/100:0,pi=tgt&&tgt.k==='ton'?num(tgt.v):0;if(q>=1)return null;return (L.k*r-L.b+pi)/(L.alpha*(1-q))}
/* التوزيع: m = السعر المتوقع (الوسيط)، d = التذبذب ± ريال (نطاق 90%) */
function dist(m,d){m=num(m);d=Math.abs(num(d));if(!(m>0))return null;if(d>=m)d=m*0.95;const sigma=d>0?Math.log((m+d)/(m-d))/(2*Z90):0;const mu=Math.log(m);
 return {m,d,mu,sigma,mean:Math.exp(mu+sigma*sigma/2),q:c=>Math.exp(mu+sigma*invPhi(c)),lo:Math.exp(mu-Z90*sigma),hi:Math.exp(mu+Z90*sigma)}}
function probAbove(D,x){if(!D)return null;if(!(x>0))return 1;if(D.sigma===0)return D.m>=x?1:0;return 1-Phi((Math.log(x)-D.mu)/D.sigma)}
/* الاحتمالات لصنف على خام r: احتمال المكسب، الربح المتوقع، وأعلى خام بثقة conf (0..1) */
function risk(L,r,D,conf,tgt){if(!L||!D)return null;const pStar=priceMin(L,r,null);const prob=probAbove(D,pStar);
 const expTon=L.alpha*D.mean+L.b-L.k*r,pc=D.sigma===0?D.m:D.q(1-conf);
 const pT=tgt&&tgt.k?priceMin(L,r,tgt):null;
 return {pStar,prob,probTgt:pT==null?null:probAbove(D,pT),expTon,expShip:expTon*L.T,conf,pConf:pc,rConf:rawMax(L,pc,null),rConfTgt:tgt&&tgt.k?rawMax(L,pc,tgt):null,
  q10:D.q(0.1),q90:D.q(0.9),p10:profitTon(L,D.q(0.1),r),p90:profitTon(L,D.q(0.9),r)}}
/* محاكاة مونت كارلو (للتأكيد في الاختبارات): نفس التوزيع، n سعر عشوائي */
function monteCarlo(L,r,D,n,seed){let s=seed||12345;const U=()=>{s=(s*16807)%2147483647;return (s-0.5)/2147483646};let win=0,sum=0;
 for(let i=0;i<n;i++){const z=Math.sqrt(-2*Math.log(U()))*Math.cos(2*Math.PI*U());const p=Math.exp(D.mu+D.sigma*z);const pr=profitTon(L,p,r);if(pr>0)win++;sum+=pr}
 return {prob:win/n,expTon:sum/n}}
/* الحساسية: أعلى خام للتعادل لو حاجة واحدة اتغيرت (نفس BE.itemBE)، مترتبة من الأكتر تأثير */
function sens(BE,safi,costs,dec,mode,it){const base=BE.itemBE(BE.ctx(safi,costs,dec,mode),it).R;if(base==null||!isFinite(base))return null;const C0=BE.ctx(safi,costs,dec,mode);
 const R=o=>{const v=BE.itemBE(BE.ctx(safi,costs,dec,mode,o),it).R;return v!=null&&isFinite(v)?v-base:null};
 const rows=[['سعر البيع ± 1 ريال للكرتونة',{pAdd:-1},{pAdd:1}],['الدولار ± 1 ج',{egp:C0.E-1},{egp:C0.E+1}],['النولون ± 10%',{frMul:0.9},{frMul:1.1}],
  ['الفرزة ± 5 نقط',{cull:Math.max(0,C0.cull-0.05)},{cull:C0.cull+0.05}],['الهالك ± 1 نقطة',{loss:Math.max(0,C0.loss-0.01)},{loss:C0.loss+0.01}],['العمولة ± 1 نقطة',{comm:Math.max(0,C0.comm-0.01)},{comm:C0.comm+0.01}]]
  .map(x=>({n:x[0],dn:R(x[1]),up:R(x[2])})).filter(x=>x.dn!=null&&x.up!=null);
 rows.forEach(x=>x.span=Math.abs(x.up-x.dn));rows.sort((a,b)=>b.span-a.span);return {base,rows}}
/* ---------- كل الأصناف × كل العبوات (ربط التكاليف والصوافي) ----------
   الأصناف = جدول الغسيل في التكاليف، والعبوات = جدول عبوات التكاليف. SA = SafiAuto (safi-autocost.js) لمطابقة الأصناف وسعر خام كل صنف.
   mx = إعدادات القرار للجدول: p{صنف|عبوة: سعر يدوي}، cpp{عبوة: كراتين/باليت يدوي}. */
const keyOf=(v,pk)=>v+'|'+pk;
/* سعر البيع من سطور الصوافي لنفس الصنف (بعد المطابقة) ونفس العبوة: متوسط مرجّح بالكراتين */
function safiPrice(SA,safi,costs,v,pk){let q=0,s=0,n=0;(safi.lines||[]).forEach(l=>{if(!Array.isArray(l)||l[1]!==pk||!(+l[3]>0))return;const r=SA.varRow(costs,SA.lineVar(l));if(!r||r[0]!==v)return;const c=+l[2]>0?+l[2]:0;n++;q+=c;s+=c*+l[3];});
 if(!n)return null;if(q>0)return s/q;const L=(safi.lines||[]).filter(l=>Array.isArray(l)&&l[1]===pk&&+l[3]>0&&(SA.varRow(costs,SA.lineVar(l))||[])[0]===v);return L.reduce((a,l)=>a+ +l[3],0)/L.length}
/* كراتين/باليت للعبوة: اليدوي ← سطور الصوافي ← أصناف القرار ← جدول عبوات الصوافي ← جدول عبوات التكاليف */
function cppOf(safi,costs,dec,mx,pk){const m=mx&&mx.cpp&&+mx.cpp[pk];if(m>0)return {v:m,src:'man'};
 const L=(safi.lines||[]).filter(l=>Array.isArray(l)&&l[1]===pk&&+l[5]>0);if(L.length)return {v:+L[L.length-1][5],src:'safi'};
 const I=(dec.items||[]).filter(it=>it.pk===pk&&+it.cpp>0);if(I.length)return {v:+I[0].cpp,src:'dec'};
 const sp=(safi.pk||[]).find(p=>p[0]===pk);if(sp&&+sp[2]>0)return {v:+sp[2],src:'pk'};const cp=(costs.pk||[]).find(p=>p[0]===pk);if(cp&&+cp[3]>0)return {v:+cp[3],src:'pk'};return {v:null,src:''}}
function priceOf(SA,safi,costs,mx,v,pk){const k=keyOf(v,pk),man=mx&&mx.p&&mx.p[k],auto=safiPrice(SA,safi,costs,v,pk);
 if(man!=null&&man!==''&&isFinite(+man)&&+man>0)return {v:+man,src:'man',auto};return {v:auto,src:auto!=null?'safi':'',auto}}
/* خام الصنف النهارده: الصنف المختار في التكاليف = سعر الخام هناك؛ غيره = آخر سعر اتكتب له (rawBy)؛ وإلا سعر الخام النهارده */
function rawOfVar(SA,costs,v){const r=SA.rawOf(costs,v);return r!=null?{v:r,src:v===costs.variety?'today':'var'}:{v:num(costs.raw),src:'fallback'}}
function cell(BE,SA,safi,costs,dec,mx,v,pk,Cs,tgt){const cp=cppOf(safi,costs,dec,mx,pk),pr=priceOf(SA,safi,costs,mx,v,pk),raw=rawOfVar(SA,costs,v);const it={v,sz:'',pk,cpp:cp.v||0,p:pr.v||0};
 const out={v,pk,key:keyOf(v,pk),cpp:cp,price:pr,raw,it,m:{}};
 Object.keys(Cs).forEach(m=>{const L=lin(BE,Cs[m],it);const R=L&&pr.v>0?rawMax(L,pr.v,null):null;
  out.m[m]={L,R,Rt:L&&pr.v>0&&tgt&&tgt.k?rawMax(L,pr.v,tgt):null,minP:L?priceMin(L,raw.v,null):null,minPt:L&&tgt&&tgt.k?priceMin(L,raw.v,tgt):null,profit:L&&pr.v>0?profitTon(L,pr.v,raw.v):null}});return out}
function grid(BE,SA,safi,costs,dec,mx,tgt){const Cs={};BE.MODES.forEach(m=>{Cs[m]=BE.ctx(safi,costs,dec,m)});
 const packs=(costs.pk||[]).map(p=>p[0]).filter(Boolean);
 return {Cs,packs,vars:(costs.var||[]).map(r=>{const v=r[0];const cells=packs.map(pk=>cell(BE,SA,safi,costs,dec,mx,v,pk,Cs,tgt));const base=dec.base||BE.MODES[0];
  const priced=cells.filter(c=>c.m[base].R!=null);const best=priced.length?priced.reduce((a,c)=>c.m[base].R>a.m[base].R?c:a):null;return {v,wash:+r[1]||0,raw:rawOfVar(SA,costs,v),cells,best}})}}
return {VER:'2.5.0',keyOf,safiPrice,cppOf,priceOf,rawOfVar,cell,grid,Z90,Phi,invPhi,lin,piOf,profitTon,rawMax,priceMin,dist,probAbove,risk,monteCarlo,sens}});
