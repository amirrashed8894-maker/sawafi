/* الصوافي والتكاليف v2.0.0 — محرك «قرار شراء الخام» (بحوث العمليات). دوال حسابية بحتة، من غير DOM ولا نت.
   بيقرا مباشرة من بيانات قسم الصوافي (safiNetback.v2) وقسم التكاليف (citrusCosts.v2) على نفس الموقع، ومن إعدادات القرار (decision.v1).
   ما بيلمسش calc() بتاعة الصوافي ولا بتاعة التكاليف — بيطابقهم بالظبط (test/be.test.js).
   تكلفة الطن الصافي (calc التكاليف): خام×k − فرزة مباعة محلي + عبوات + مستلزمات + غسيل،  k = 1000 ÷ ((1−هالك)×(1−فرزة))
   صافي الطن (calc الصوافي): سعر الكرتونة×(1−عمولة)×(1000÷وزن الكرتونة)÷ريال/$×ج/$ − نصيب الطن من مصروفات ونولون الشحنة
   سعر التعادل للخام R* = أعلى سعر خام ج/كجم يخلّي الربح = صفر. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BE=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MODES=['حاوية','براد'];            // الحاوية الأساسي، البراد فرعي
const KEYS={safi:'safiNetback.v2',safiM:'safiNetback.v2.mirror',costs:'citrusCosts.v2',costsOld:'citrusCosts',dec:'decision.v1',decM:'decision.v1.mirror'};
/* نسخة من DEF برنامج تكاليف الموالح v2.0.4 (القيم اللي أكدها صاحب البرنامج) — الاختبار بيتأكد إنها زي costs-core.js بالظبط */
const COSTS_DEF={net:24000,usd:52,raw:10,cullP:7,loss:0.005,cull:0.15,pw:0.005,pkg:0,variety:'برتقال أبوسرة تلوين',date:'2026-10-11',sar:3.75,
pk:[['كرتون مقفول 7 ك',23,7],['كرتون أوبن توب 7 ك',32,7],['كرتون مقفول 14 ك',56,14],['كرتون مقفول 15 ك',61,15],['صندوق بلاستيك جامبو 15 ك',18,15],['صندوق بلاستيك 8 ك',13.5,7.5]],
sup:[['باليت',520],['مناديل وبصمة',170],['كود',300],['شنمبر',85],['فحص وعينة وتخليص',293],['زوايا',100],['ستيكر فحص',30],['كمسيونجي',0],['أخرى',0]],
var:[['برتقال أبوسرة تلوين',2500],['برتقال بلدي',1800],['برتقال صيفي',1800],['ليمون',1800],['يوسفي',1800],['جريب فروت',1800]]};
/* إعدادات القرار — أرقام أمير (23/11/2026): نولون الحاوية 2,800$، الحاوية 21 باليت، الدولار 53.5 ج، من غير مصاريف إضافية */
const DEC_DEF={v:1,base:'حاوية',cap:{'حاوية':21,'براد':23},rawToday:null,
 items:[{v:'أبو سرة',sz:'',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,pal:13,max:'',share:''},
        {v:'أبو سرة',sz:'',pk:'كرتون مقفول 7 ك',cpp:154,p:18,pal:8,max:'',share:''}]};
const ASSUME={fC:2800,egp:53.5};
const num=x=>{const v=+x;return isFinite(v)?v:0};
const isSet=x=>x!==''&&x!=null&&isFinite(+x);
const clone=o=>JSON.parse(JSON.stringify(o));
function norm(s){return String(s==null?'':s).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,'')}
function unwrap(raw){if(!raw)return null;try{const p=typeof raw==='string'?JSON.parse(raw):raw;const o=p&&p.S?p.S:p;return o&&typeof o==='object'?{S:o,t:p&&p.t||0}:null}catch(e){return null}}
/* تحميل التكاليف بنفس طريقة costs-app.js (_ld + نفس التحويلات) */
function costsFrom(o){const d=clone(COSTS_DEF);if(o&&typeof o==='object'){for(const k in d)if(o[k]!==undefined&&o[k]!==null&&Array.isArray(d[k])===Array.isArray(o[k]))d[k]=o[k];for(const k in o)if(!(k in d))d[k]=o[k]}
 if(d.sar==null)d.sar=3.75;if(d.var&&d.var.some(v=>v[0]=='برتقال'))d.var=d.var.flatMap(v=>v[0]=='برتقال'?[['برتقال أبوسرة',v[1]],['برتقال بلدي',v[1]],['برتقال صيفي',v[1]]]:[v]);return d}
function decFrom(o){const d=clone(DEC_DEF);if(o&&typeof o==='object'){for(const k in d)if(o[k]!==undefined&&o[k]!==null&&Array.isArray(d[k])===Array.isArray(o[k]))d[k]=o[k];d.cap=Object.assign({},DEC_DEF.cap,o.cap||{})}return d}
function washOf(C,v){const n=norm(v),W=C.var||[];const hit=t=>W.find(w=>norm(w[0]).indexOf(norm(t))>=0);
 let w=W.find(x=>norm(x[0])===n)||(/سره/.test(n)?hit('ابوسره'):/صيفي/.test(n)?hit('صيفي'):/بلدي/.test(n)?hit('بلدي'):/ليمون/.test(n)?hit('ليمون'):/جريب/.test(n)?hit('جريب'):/(يوسفي|افندي|كلمنتين|فريمونت|موركيت)/.test(n)?hit('يوسفي'):null)||W.find(x=>n&&norm(x[0]).indexOf(n)>=0);
 return w?num(w[1]):null}
function pkRow(C,name){return (C.pk||[]).find(x=>x[0]===name)||(C.pk||[]).find(x=>norm(x[0])===norm(name))||null}
function pkW(safi,costs,name){const p=(safi.pk||[]).find(x=>x[0]===name);if(p&&+p[1]>0)return +p[1];const c=pkRow(costs,name);if(c&&+c[2]>0)return +c[2];const m=String(name||'').match(/(\d+(?:\.\d+)?)\s*ك/);return m?+m[1]:0}
/* سياق الحساب لوسيلة نقل — safi = بيانات الصوافي، costs = بيانات التكاليف، dec = إعدادات القرار */
function ctx(safi,costs,dec,mode,over){over=over||{};const u=num(over.sar!=null?over.sar:safi.sar),E=num(over.egp!=null?over.egp:safi.egp);
 const c=(safi.clients||[]).find(x=>x[0]===safi.client);const comm=over.comm!=null?over.comm:(c?num(c[1]):0);
 const br=mode==='براد',fr=num(over.frMul!=null?over.frMul:1);
 const expSar=(safi.exp||[]).reduce((a,x)=>a+num(br?x[1]:x[2]),0);
 const frSar=(br?num(safi.fB):num(safi.fC)*u)*fr;
 const loss=num(over.loss!=null?over.loss:costs.loss),cull=num(over.cull!=null?over.cull:costs.cull);
 const k=1000/((1-loss)*(1-cull));const credit=num(costs.cullP)*k*(1-loss)*cull;
 const sup=(costs.sup||[]).reduce((a,x)=>a+num(x[1]),0);
 return {safi,costs,dec,mode,u,E,comm,expSar,frSar,sharedSar:expSar+frSar,sharedE:u?(expSar+frSar)/u*E:0,loss,cull,k,credit,sup,pw:num(costs.pw),cap:num(dec.cap[mode]),
  pAdd:num(over.pAdd||0),noClient:!c,frMissing:frSar===0}}
function item(C,it){const w=pkW(C.safi,C.costs,it.pk),cpp=num(it.cpp),p=num(it.p)+C.pAdd,pr=pkRow(C.costs,it.pk),pk=pr?num(pr[1]):null,wash=washOf(C.costs,it.v);
 const ok=w>0&&cpp>0&&C.u>0;const tPal=ok?cpp*w/1000:0;
 const rev=ok?p*(1-C.comm)*(1000/w)/C.u*C.E:0;            // ج لكل طن صافي بعد العمولة
 const pkg=ok?(1000/w)*(1+C.pw)*(pk||0):0;                // عبوات ج/طن (من غير التقريب لأعلى لكرتونة صحيحة)
 const a=rev-pkg-C.sup-(wash||0)+C.credit;                // المتاح للخام والمصروفات المشتركة ج/طن
 return {w,cpp,p,tPal,rev,pkg,wash,sup:C.sup,credit:C.credit,a,ok,missPk:pk==null,missWash:wash==null}}
function planBE(C,items,n){let T=0,A=0,Q=0,sales=0;const rows=items.map((it,i)=>{const x=item(C,it),pal=num(n[i]),t=pal*x.tPal;T+=t;A+=t*x.a;Q+=pal*x.cpp;sales+=pal*x.cpp*x.p;return Object.assign(x,{pal,t})});
 const R=T>0?(A-C.sharedE)/(C.k*T):null;
 return {R,Rton:R==null?null:R*1000,T,Q,sales,rows,sharedTon:T>0?C.sharedE/T:null,profitAt:raw=>T>0?(A-C.sharedE)-raw*C.k*T:null}}
function itemBE(C,it){return planBE(C,[it],[C.cap])}
function priceForRaw(C,it,raw){const x=item(C,Object.assign({},it,{p:0}));if(!x.ok)return null;const T=C.cap*x.tPal;if(!(T>0))return null;
 return (raw*C.k+C.sharedE/T-x.a)/((1-C.comm)*(1000/x.w)/C.u*C.E)}
/* خطة الباليتات لوسيلة النقل: الأساسي زي ما هو، والتاني نفس نسب الأصناف على سعته */
function planN(dec,mode){const n=(dec.items||[]).map(it=>num(it.pal));if(mode===dec.base)return n;const tot=n.reduce((a,b)=>a+b,0),cap=num(dec.cap[mode]);return tot?n.map(v=>v*cap/tot):n}
/* ③ التكاليف وسيناريوهات سعر البيع لصنف/عبوة: كل ريال فوق وتحت سعر الكرتونة الحالي لحد span ريال (الصنف مالي الشحنة، نفس itemBE و priceForRaw).
   لكل سطر: سعر البيع، سعر الخام للتعادل ج/كجم، الربح/الخسارة على خام النهارده للطن وللشحنة. */
function scenario(safi,costs,dec,mode,i,over,span){span=span==null?7:span;const C=ctx(safi,costs,dec,mode,over),it=(dec.items||[])[i];if(!it)return null;
 const raw=num(costs.raw),x=item(C,it),p0=num(it.p);const base={ok:false,m:mode,i,v:it.v||'',sz:it.sz||'',pk:it.pk||'',p:p0,raw,span};if(!x.ok||!(C.cap>0))return base;
 const T=C.cap*x.tPal,egy=raw*C.k-C.credit+x.pkg+C.sup+(x.wash||0),share=T>0?C.sharedE/T:0;
 const rows=[];for(let d=-span;d<=span;d++){const p=p0+d;if(!(p>0))continue;const q=planBE(C,[Object.assign({},it,{p})],[C.cap]);const pr=q.profitAt(raw);rows.push({d,p,R:q.R,perTon:T>0?pr/T:null,perShip:pr})}
 return Object.assign(base,{ok:true,k:C.k,rawTon:raw*C.k,credit:C.credit,pkg:x.pkg,sup:C.sup,wash:x.wash||0,egy,share,expSar:C.expSar,frSar:C.frSar,comm:C.comm,
  total:egy+share,rev:x.rev,T,cap:C.cap,cartons:C.cap*x.cpp,minP:priceForRaw(C,it,raw),rows})}
/* القرار في الاتجاهين (حساب واحد لكل الصفحات والتقرير):
   ① أقل سعر بيع للكرتونة بالريال لكل صنف/عبوة على سعر الخام النهارده (الصنف مالي الشحنة، نفس priceForRaw)
   ② أعلى سعر لشراء الخام ج/كجم على أسعار البيع (خطة الباليتات، نفس planBE) — الحاوية أساسي والبراد فرعي */
function twoWay(safi,costs,dec,over){const raw=num(costs.raw);
 const b0=MODES.indexOf(dec.base)>=0?dec.base:MODES[0];const modes=[b0].concat(MODES.filter(m=>m!==b0)).map(m=>{const C=ctx(safi,costs,dec,m,over),n=planN(dec,m),p=planBE(C,dec.items||[],n);
  const items=(dec.items||[]).map((it,i)=>{const x=item(C,it);const minP=x.ok?priceForRaw(C,it,raw):null;const Ra=x.ok?itemBE(C,it).R:null;
   return {i,v:it.v||'',sz:it.sz||'',pk:it.pk||'',p:num(it.p),ok:x.ok&&minP!=null&&isFinite(minP),minP:minP!=null&&isFinite(minP)?minP:null,gap:minP!=null&&isFinite(minP)?num(it.p)-minP:null,Ralone:Ra!=null&&isFinite(Ra)?Ra:null}});
  const scen=(dec.items||[]).map((_,i)=>scenario(safi,costs,dec,m,i,over,7));
  return {m,C,n,p,R:p.R!=null&&isFinite(p.R)?p.R:null,Rton:p.Rton,T:p.T,profit:p.R==null?null:p.profitAt(raw),items,scen}});
 return {raw,modes,base:modes[0],sec:modes[1]}}
/* سيمبلكس: أكبر c·x بشرط A·x ≤ b و x ≥ 0 و b ≥ 0 — قاعدة بلاند */
function simplex(c,A,b){const m=A.length,n=c.length,EPS=1e-9;
 const T=A.map((r,i)=>r.concat(A.map((_,j)=>i===j?1:0),[b[i]]));const z=c.map(v=>-v).concat(new Array(m).fill(0),[0]);const basis=A.map((_,i)=>n+i);
 for(let it=0;it<500;it++){let e=-1;for(let j=0;j<n+m;j++)if(z[j]<-EPS){e=j;break}
  if(e<0)break;let l=-1,best=Infinity;for(let i=0;i<m;i++)if(T[i][e]>EPS){const q=T[i][n+m]/T[i][e];if(q<best-EPS||(Math.abs(q-best)<=EPS&&basis[i]<basis[l])){best=q;l=i}}
  if(l<0)return {status:'unbounded'};const pv=T[l][e];T[l]=T[l].map(v=>v/pv);
  for(let i=0;i<m;i++)if(i!==l&&Math.abs(T[i][e])>EPS){const f=T[i][e];T[i]=T[i].map((v,j)=>v-f*T[l][j])}
  const fz=z[e];for(let j=0;j<=n+m;j++)z[j]-=fz*T[l][j];basis[l]=e}
 const x=new Array(n).fill(0);basis.forEach((bv,i)=>{if(bv<n)x[bv]=T[i][n+m]});return {status:'ok',x,z:z[n+m]}}
/* أحسن توزيع باليتات يعلّي سعر التعادل للخام: برمجة كسرية خطية (Dinkelbach + سيمبلكس)
   أكبر (Σ nᵢtᵢaᵢ − مصروفات الشحنة) ÷ (k·Σ nᵢtᵢ) بشرط Σ nᵢ = السعة، nᵢ ≤ الحد الأقصى، وزن المقاس ≤ نسبته من الفرز */
function optimize(C,items){const X=items.map(it=>item(C,it));const idx=X.map((x,i)=>x.ok?i:-1).filter(i=>i>=0);
 if(!idx.length||!(C.cap>0))return {status:'empty'};
 const A=[],b=[];A.push(idx.map(()=>1));b.push(C.cap);
 idx.forEach((i,j)=>{if(isSet(items[i].max)){const r=idx.map(()=>0);r[j]=1;A.push(r);b.push(Math.max(0,+items[i].max))}});
 const groups={};idx.forEach((i,j)=>{const it=items[i];if(isSet(it.share)){const g=norm(it.v)+'|'+String(it.sz||'');(groups[g]=groups[g]||{s:+it.share/100,js:[]}).js.push(j)}});
 Object.values(groups).forEach(g=>{A.push(idx.map((i,j)=>X[i].tPal*((g.js.indexOf(j)>=0?1:0)-g.s)));b.push(0)});
 let lam=0,x=null;const tP=idx.map(i=>X[i].tPal),aa=idx.map(i=>X[i].a);
 for(let it=0;it<60;it++){const cc=idx.map((i,j)=>tP[j]*(aa[j]-C.k*lam));const M=2*Math.max(1,...cc.map(Math.abs))+1;
  const res=simplex(cc.map(v=>v+M),A,b);if(res.status!=='ok')return {status:res.status};x=res.x;
  const T=x.reduce((s,v,j)=>s+v*tP[j],0);if(!(T>0))return {status:'empty'};
  const Nn=x.reduce((s,v,j)=>s+v*tP[j]*aa[j],0)-C.sharedE,Dd=C.k*T,F=Nn-lam*Dd,nl=Nn/Dd;
  if(Math.abs(F)<1e-7*Math.max(1,Math.abs(Nn))||Math.abs(nl-lam)<1e-9){lam=nl;break}lam=nl}
 const filled=x.reduce((s,v)=>s+v,0);const n=new Array(items.length).fill(0);idx.forEach((i,j)=>n[i]=x[j]);
 const ni=n.map(v=>Math.floor(v+1e-6));let left=Math.round(filled)-ni.reduce((s,v)=>s+v,0);
 const order=idx.slice().sort((p,q)=>(n[q]-ni[q])-(n[p]-ni[p])||X[q].a-X[p].a);
 for(const i of order){if(left<=0)break;if(n[i]-ni[i]>1e-6&&(!isSet(items[i].max)||ni[i]+1<=+items[i].max)){ni[i]++;left--}}
 return {status:'ok',n,ni,R:lam,Rint:planBE(C,items,ni).R,filled,full:filled>=C.cap-1e-6}}
function sensitivity(safi,costs,dec,mode,items,n){const C0=ctx(safi,costs,dec,mode);const base=planBE(C0,items,n).R;
 const cases=[['سعر الدولار −1 ج',{egp:C0.E-1}],['سعر الدولار +1 ج',{egp:C0.E+1}],['سعر البيع −1 ريال للكرتونة',{pAdd:-1}],['سعر البيع +1 ريال للكرتونة',{pAdd:1}],
  ['النولون +10%',{frMul:1.1}],['النولون −10%',{frMul:0.9}],['الفرزة +5 نقط',{cull:C0.cull+0.05}],['الفرزة −5 نقط',{cull:Math.max(0,C0.cull-0.05)}],['العمولة +1 نقطة',{comm:C0.comm+0.01}]];
 return {base,rows:cases.map(c=>{const R=planBE(ctx(safi,costs,dec,mode,c[1]),items,n).R;return {n:c[0],R,d:R==null||base==null?null:R-base}})}}
/* الاستيراد مرة واحدة من برنامج التكاليف القديم (موقع تاني): JSON التصدير أو نص «COSTS1:» */
function parseCostsImport(txt){const s=String(txt||'').trim();const m=s.match(/COSTS1:([A-Za-z0-9+/=_-]+)/);let o=null;
 try{if(m){const b=m[1].replace(/-/g,'+').replace(/_/g,'/');const bin=typeof atob==='function'?atob(b):Buffer.from(b,'base64').toString('binary');o=JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,ch=>ch.charCodeAt(0))))}else o=JSON.parse(s)}catch(e){return null}
 if(o&&o.app&&o.app!=='citrus-costs')return null;if(o&&o.S)o=o.S;if(!o||typeof o!=='object'||!Array.isArray(o.pk)||!Array.isArray(o.sup))return null;return costsFrom(o)}
return {MODES,KEYS,COSTS_DEF,DEC_DEF,ASSUME,unwrap,costsFrom,decFrom,ctx,item,planBE,itemBE,priceForRaw,planN,twoWay,scenario,simplex,optimize,sensitivity,washOf,pkW,parseCostsImport,norm}});
