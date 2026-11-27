/* الصوافي والتكاليف v2.6.0 — «الشحنة» واحدة للصوافي والقرار (طلب أمير 27/11/2026: «مش نفس الأصناف ولا تكاليفها ولا أعداد الباليتات»).
   المصدر الوحيد = سطور البيع في الصوافي (safiNetback.v2 → S.lines): الصنف، المقاس، العبوة، الباليتات، كراتين/باليت، سعر البيع ريال.
   القرار بيقرا السطور دي مباشرة ويكتب فيها (مفيش نسخة تانية تتلخبط)، وزيادات القرار بس (حد أقصى باليت، نسبة المقاس) في decision.ext.v1 مربوطة بالسطر.
   تكلفة كل سطر من التكاليف بنفس كود الحساب (costs-calc.js = costs-core.js): العبوات pkgC لنفس الصنف والعبوة (خلطة أو مقارنة العبوات زي safi-autocost)،
   والخام = سعر خام الصنف ده في التكاليف (النهارده للصنف المختار هناك، وإلا آخر سعر اتكتب له rawBy). فتكلفة الطن في القرار = «تكلفة الطن هنا» التلقائية في الصوافي = التكاليف.
   دوال بحتة من غير DOM (test/be-ship.test.js). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BESHIP=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VER='2.6.0';
const num=x=>{const v=+x;return isFinite(v)?v:0};
const clone=o=>JSON.parse(JSON.stringify(o));
const isSet=x=>x!==''&&x!=null&&isFinite(+x);
function nameOf(v,sz){v=String(v||'').trim();sz=String(sz||'').trim();return v+(v&&sz?' مقاس '+sz:'')}
function metaOf(l){return l&&l[7]&&typeof l[7]==='object'?l[7]:null}
function szOf(l){const m=metaOf(l);if(m&&m.s!=null)return String(m.s);const x=String(l&&l[0]||'').match(/مقاس\s*(\S+)\s*$/);return x?x[1]:''}
/* سطر فيه حاجة (صنف أو عبوة أو أرقام) = صنف في الشحنة */
function isRow(l){return Array.isArray(l)&&!!(String(l[0]||'').trim()||num(l[4])||num(l[5])||num(l[3])||num(l[2]))}
/* سعر خام الصنف من التكاليف: الصنف المختار هناك = الخام النهارده، غيره = rawBy، ولو مالوش = خام النهارده (رمادي) */
function rawFor(costs,v,SA){const vr=SA.varRow(costs||{},v);if(vr){const r=SA.rawOf(costs,vr[0]);if(r!=null)return {v:r,src:vr[0]===costs.variety?'today':'var',var:vr[0]}}return {v:num(costs&&costs.raw),src:'fallback',var:vr?vr[0]:null}}
function extOf(EXT,l,i,SA){const e=EXT&&Array.isArray(EXT.list)?EXT.list[i]:null;return e&&e.k===SA.lineKey(l)?e:null}
/* أصناف القرار = سطور الصوافي (li = رقم السطر هناك) */
function items(safi,EXT,costs,SA){const out=[];(safi&&safi.lines||[]).forEach((l,i)=>{if(!isRow(l))return;const e=extOf(EXT,l,i,SA)||{},v=SA.lineVar(l),rw=rawFor(costs,v,SA);
 out.push({li:i,v,sz:szOf(l),pk:String(l[1]||''),cpp:num(l[5]),p:l[3]===''||l[3]==null?'':num(l[3]),pal:num(l[4]),max:isSet(e.max)?+e.max:'',share:isSet(e.share)?+e.share:'',
  raw:rw.v,rawSrc:rw.src,rawVar:rw.var,cost:l[6]!=null&&l[6]!==''?+l[6]:null,auto:SA.isAuto(l)})});return out}
/* تعديل من القرار ← سطر الصوافي (نفس شكل السطر هناك: الكراتين = الباليتات × كراتين الباليت) */
function setField(l,f,x){if(f==='p')l[3]=x;else if(f==='cpp')l[5]=x;else if(f==='pal')l[4]=x;else if(f==='pk')l[1]=x;
 else if(f==='v'||f==='sz'){const m=Object.assign({},metaOf(l)||{v:String(l[0]||'').replace(/\s*مقاس\s*\S*\s*$/,'').trim(),s:szOf(l)});if(f==='v')m.v=String(x||'');else m.s=String(x||'');l[7]=m;l[0]=nameOf(m.v,m.s)}
 l[2]=num(l[4])*num(l[5]);return l}
function newLine(o){o=o||{};const pal=num(o.pal),cpp=num(o.cpp);return [nameOf(o.v,o.sz),String(o.pk||''),pal*cpp,o.p===''||o.p==null?'':num(o.p),pal,cpp,null,{v:String(o.v||''),s:String(o.sz||'')},{a:1}]}
/* التكلفة التلقائية لسطور الصوافي (نفس safi-autocost.apply بالظبط) */
function autoCost(lines,costs,CC,SA){if(!costs||!CC||!SA)return false;return SA.apply(lines,l=>SA.costFor(costs,SA.lineVar(l),l[1],CC))}
/* العبوات ج/طن صافي لصنف + عبوة — نفس رقم التكاليف (خلطة الصنف المختار لو العبوة فيها، وإلا مقارنة العبوات: كراتين صحيحة لأعلى + الهالك) */
function pkgHook(costs,CC,SA){const cache={};if(!costs||!CC||!SA)return null;
 return function(v,pk){const key=String(v)+'\u0001'+String(pk);if(key in cache)return cache[key];let out=null;
  try{const i=SA.pkIdx(costs,pk);if(i>=0&&+costs.pk[i][2]>0&&num(costs.net)>0){const vr=SA.varRow(costs,v);const s=clone(costs);if(vr)s.variety=vr[0];
   if(vr&&vr[0]===costs.variety&&typeof CC.mixList==='function'){const m=CC.mixList(costs);if(m&&m.some(r=>r.i===i)){const r=CC.calcMix(s);const row=r.mix&&r.mix.rows.find(x=>x.i===i);if(row)out=row.pkgC}}
   if(out==null){s.pkg=i;s.mix=null;out=CC.calc(s).pkgC}if(!isFinite(out))out=null}}catch(e){out=null}
  return cache[key]=out}}
/* مرة واحدة (v2.6.0): سطور الصوافي هي اللي بتكسب. لو الصوافي فاضية والقرار كان فيه أصناف بباليتات، نكتبهم في الصوافي.
   حد أقصى/نسبة المقاس من القرار القديم بيتنقلوا للسطر اللي نفس الصنف (نفس صف التكاليف) ونفس العبوة. */
function migrate(oldDec,safi,safiFresh,costs,SA){const its=oldDec&&Array.isArray(oldDec.items)?oldDec.items:[];
 const has=!safiFresh&&(safi&&safi.lines||[]).some(l=>isRow(l)&&(num(l[4])||num(l[2])));
 const seed=!has&&its.some(it=>num(it.pal)>0)?its.filter(it=>String(it.v||'').trim()||String(it.pk||'').trim()).map(newLine):null;
 const same=(a,b)=>{const x=SA.varRow(costs||{},a),y=SA.varRow(costs||{},b);return SA.norm(a)===SA.norm(b)||(x&&y&&x[0]===y[0])};
 const lines=seed||(safi&&safi.lines)||[],ext={list:[]};
 lines.forEach((l,i)=>{const v=SA.lineVar(l),m=its.find(it=>same(it.v,v)&&String(it.pk||'')===String(l[1]||'')&&(isSet(it.max)||isSet(it.share)));if(m)ext.list[i]={k:SA.lineKey(l),max:isSet(m.max)?+m.max:'',share:isSet(m.share)?+m.share:''}});
 return {seed,ext,had:its.length}}
/* الشحنة على وسيلة نقل: كل سطر = تعادله وربحه بخامه هو، والمصروفات المشتركة على الوزن (زي الصوافي بالظبط) */
function analyze(BE,C,items,n){const p=BE.planBE(C,items,n),share=p.T>0?C.sharedE/p.T:null;let own=0,okAll=p.T>0;
 const rows=p.rows.map((x,i)=>{const it=items[i],raw=num(it.raw!=null&&it.raw!==''?it.raw:C.costs.raw);const ok=x.ok&&p.T>0&&x.pal>0;
  const Rrow=x.ok&&share!=null?(x.a-share)/C.k:null,pt=ok?x.a-share-C.k*raw:null,ps=ok?pt*x.t:0;if(ok)own+=ps;
  const cost=x.ok?raw*C.k-C.credit+x.pkg+C.sup+(x.wash||0):null;
  return {i,v:it.v,sz:it.sz,pk:it.pk,pal:x.pal,cpp:x.cpp,p:x.p,w:x.w,t:x.t,raw,Rrow,profitTon:pt,profit:ps,cost,rev:x.rev,ok}});
 return {C,items,plan:p,share,T:p.T,R:p.R,rows,own:p.T>0?own:null,delta:p.T>0?own/(C.k*p.T):null,ok:okAll}}
/* سعر البيع مش مضمون: كل الأسعار بتتحرك مع بعض بمعامل X لوغاريتمي-طبيعي وسيطه 1، و± d ريال على متوسط السعر = مدى 90% */
const Z90=1.6448536269514722;
function Phi(x){const z=Math.abs(x)/Math.SQRT2,t=1/(1+0.5*z);const r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));return x>=0?1-r/2:r/2}
/* صنف (ممكن أكتر من سطر/عبوة): أعلى خام في الشحنة دي = متوسط تعادل سطوره مرجّح بالطن، واحتمال المكسب على خامه */
function group(BE,A,keyFn,d){const G={},order=[];A.rows.forEach((r,i)=>{if(!r.ok)return;const k=keyFn(r);if(!G[k]){G[k]={k,v:r.v,rows:[],t:0};order.push(k)}G[k].rows.push(r);G[k].t+=r.t});
 return order.map(k=>{const g=G[k],C=A.C,raw=g.rows[0].raw;let tR=0,tP=0,tA=0,tB=0,sales=0,ctn=0;
  g.rows.forEach(r=>{tR+=r.t*r.Rrow;tP+=r.profit;const x=A.plan.rows[r.i];const al=x.ok?(1-C.comm)*(1000/x.w)/C.u*C.E:0;tA+=r.t*al*r.p;tB+=r.t*(x.a-x.rev-A.share);sales+=r.pal*r.cpp*r.p;ctn+=r.pal*r.cpp});
  const R=g.t>0?tR/g.t:null,pm=ctn>0?sales/ctn:0;let prob=null,rConf=null;
  if(tA>0&&pm>0){const xs=(C.k*raw*g.t-tB)/tA;const dd=Math.min(Math.max(num(d),0),pm*0.95),sig=dd>0?Math.log((pm+dd)/(pm-dd))/(2*Z90):0;
   prob=sig>0?(xs<=0?1:1-Phi(Math.log(xs)/sig)):(xs<=1?1:0);g.sig=sig;g.xs=xs;
   g.rAt=c=>{const X=sig>0?Math.exp(sig*invPhi(1-c)):1;return (tA*X+tB)/(C.k*g.t)}}
  return {k,v:g.v,pks:g.rows.map(r=>r.pk),t:g.t,pal:g.rows.reduce((a,r)=>a+r.pal,0),raw,R,margin:R==null?null:R-raw,profit:tP,profitTon:g.t>0?tP/g.t:null,prob,pm,rAt:g.rAt||null}})}
function invPhi(p){if(p<=0)return -Infinity;if(p>=1)return Infinity;const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],dd=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];const pl=0.02425;let q,r,x;
 if(p<pl){q=Math.sqrt(-2*Math.log(p));x=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((dd[0]*q+dd[1])*q+dd[2])*q+dd[3])*q+1)}else if(p<=1-pl){q=p-0.5;r=q*q;x=(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)}else{q=Math.sqrt(-2*Math.log(1-p));x=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((dd[0]*q+dd[1])*q+dd[2])*q+dd[3])*q+1)}
 for(let k=0;k<2;k++){const e=Phi(x)-p,u=e*Math.sqrt(2*Math.PI)*Math.exp(x*x/2);x=x-u/(1+x*u/2)}return x}
/* القرار السريع: لكل صنف — الخام النهارده مقابل أعلى خام (الحاوية/البراد، خطتك/الأحسن) والحكم اشتري/فاوض/متشتريش */
function verdict(prob,margin,conf){if(prob==null||margin==null)return {k:'na',t:'—'};if(prob>=conf)return {k:'buy',t:'اشتري'};if(prob>=0.5)return {k:'neg',t:'فاوض'};return {k:'no',t:'متشتريش'}}
function quick(BE,safi,costs,dec0,its,o){o=o||{};const dec=Object.assign({},dec0,{items:its});const d=o.d==null?2:o.d,conf=o.conf==null?0.8:o.conf;const base=dec.base,oth=base==='حاوية'?'براد':'حاوية';
 const mk=(m,n)=>{const C=BE.ctx(safi,costs,dec,m);return analyze(BE,C,its,n)};
 const nb=BE.planN(dec,base),no=BE.planN(dec,oth);const Ab=mk(base,nb),Ao=mk(oth,no);
 const ob=BE.optimize(BE.ctx(safi,costs,dec,base),its),oo=BE.optimize(BE.ctx(safi,costs,dec,oth),its);
 const Abest=ob.status==='ok'?mk(base,ob.ni):null,Aobest=oo.status==='ok'?mk(oth,oo.ni):null;
 const key=r=>String(r.v||'—');const gb=group(BE,Ab,key,d),go=group(BE,Ao,key,d),gB=Abest?group(BE,Abest,key,d):[],gO=Aobest?group(BE,Aobest,key,d):[];
 const find=(L,k)=>L.find(x=>x.k===k)||null;
 const vars=gb.map(g=>{const v=verdict(g.prob,g.margin,conf);return Object.assign(g,{verdict:v,oth:find(go,g.k),best:find(gB,g.k),othBest:find(gO,g.k),rConf:g.rAt?g.rAt(conf):null})});
 const tot=nb.reduce((a,b)=>a+b,0),cap=num(dec.cap[base]);
 return {base,oth,conf,d,A:Ab,Ao,Abest,Aobest,ob,oo,vars,pal:tot,cap,boxes:cap>0?Math.ceil(tot/cap-1e-9):null,own:Ab.own,delta:Ab.delta,ownOth:Ao.own,deltaOth:Ao.delta}}
return {VER,migrate,nameOf,szOf,isRow,rawFor,items,setField,newLine,autoCost,pkgHook,analyze,group,quick,verdict,Phi,invPhi}});
