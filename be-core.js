/* الصوافي × تكاليف الموالح — سعر التعادل للخام (بحوث العمليات). دوال حسابية بحتة، من غير DOM ولا نت.
   ما بيلمسش calc() الأصلية: بيقرا من S (الصرف، العمولة، المصروفات، النولون، أوزان العبوات) ومن S.rb (التكاليف من برنامج تكاليف الموالح).
   الوحدات: ج = جنيه مصري، ريال = ريال سعودي، الطن = طن صافي مصدّر، الخام بالجنيه/كجم واصل المحطة.
   تكلفة الطن الصافي (نفس معادلة برنامج تكاليف الموالح calc): خام×k − فرزة مباعة محلي + عبوات + مستلزمات + غسيل
     k = 1000 ÷ ((1−هالك)×(1−فرزة)) كجم خام لكل طن صافي، والفرزة المباعة = سعر الفرزة × k×(1−هالك)×فرزة.
   صافي الطن (نفس معادلة الصوافي calc): سعر الكرتونة×(1−عمولة)×(1000÷وزن الكرتونة)÷ريال/$×ج/$ − نصيب الطن من مصروفات ونولون الشحنة.
   سعر التعادل للخام R* = أعلى سعر خام ج/كجم يخلّي الربح = صفر. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BE=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MODES=['حاوية','براد'];            // الحاوية الأساسي، البراد مقارنة
/* القيم الافتراضية من برنامج تكاليف الموالح (DEF v2.0.4 اللي أكدها صاحب البرنامج) + افتراضات معلَّمة as */
const RB_DEF={v:1,base:'حاوية',raw:10,cullP:7,loss:0.5,cull:15,pw:0.5,
 cap:{'حاوية':20,'براد':23},             // باليت في الشحنة — الحاوية 20 افتراضي (ريفر 40 قدم)، البراد 23 من تقرير 17/11 (12+11)
 pkp:[['كرتون مقفول 7 ك',23],['كرتون أوبن توب 7 ك',32],['كرتون مقفول 14 ك',56],['كرتون مقفول 15 ك',61],['صندوق بلاستيك جامبو 15 ك',18],['صندوق بلاستيك 8 ك',13.5]],
 sup:[['باليت',520],['مناديل وبصمة',170],['كود',300],['شنمبر',85],['فحص وعينة وتخليص',293],['زوايا',100],['ستيكر فحص',30],['كمسيونجي',0],['أخرى',0]],
 wash:[['برتقال أبوسرة تلوين',2500],['برتقال بلدي',1800],['برتقال صيفي',1800],['ليمون',1800],['يوسفي',1800],['جريب فروت',1800]],
 items:[{v:'أبو سرة',sz:'',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,pal:12,max:'',share:''},
        {v:'أبو سرة',sz:'',pk:'كرتون مقفول 7 ك',cpp:154,p:18,pal:8,max:'',share:''}],
 src:'تكاليف الموالح v2.0.4 (افتراضي)'};
const num=x=>{const v=+x;return isFinite(v)?v:0};
const isSet=x=>x!==''&&x!=null&&isFinite(+x);
function norm(s){return String(s==null?'':s).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,'')}
function rbOf(S){const d=JSON.parse(JSON.stringify(RB_DEF)),o=S&&S.rb&&typeof S.rb==='object'?S.rb:null;if(!o)return d;
 for(const k in d)if(o[k]!==undefined&&o[k]!==null&&Array.isArray(d[k])===Array.isArray(o[k])&&(typeof d[k]==='object')===(typeof o[k]==='object'))d[k]=o[k];
 d.cap=Object.assign({},RB_DEF.cap,o.cap||{});return d}
/* غسيل المحطة للصنف: الصنف من برنامج الإنتاج ← سطر في جدول تكاليف الموالح */
function washOf(rb,v){const n=norm(v),W=rb.wash||[];const hit=t=>W.find(w=>norm(w[0]).indexOf(norm(t))>=0);
 let w=W.find(x=>norm(x[0])===n)||(/سره/.test(n)?hit('ابوسره'):/صيفي/.test(n)?hit('صيفي'):/بلدي/.test(n)?hit('بلدي'):/ليمون/.test(n)?hit('ليمون'):/جريب/.test(n)?hit('جريب'):/(يوسفي|افندي|كلمنتين|فريمونت|موركيت)/.test(n)?hit('يوسفي'):null)||W.find(x=>n&&norm(x[0]).indexOf(n)>=0);
 return w?num(w[1]):null}
function pkPrice(rb,name){const p=(rb.pkp||[]).find(x=>x[0]===name)||(rb.pkp||[]).find(x=>norm(x[0])===norm(name));return p?num(p[1]):null}
function pkW(S,name){const p=(S.pk||[]).find(x=>x[0]===name);if(p&&+p[1]>0)return +p[1];const m=String(name||'').match(/(\d+(?:\.\d+)?)\s*ك/);return m?+m[1]:0}
/* سياق الحساب لوسيلة نقل معيّنة — كل الأرقام من الصوافي (S) والتكاليف (rb) */
function ctx(S,mode,over){over=over||{};const rb=rbOf(S),u=num(over.sar!=null?over.sar:S.sar),E=num(over.egp!=null?over.egp:S.egp);
 const c=(S.clients||[]).find(x=>x[0]===S.client);const comm=over.comm!=null?over.comm:(c?num(c[1]):0);
 const br=mode==='براد',fr=num(over.frMul!=null?over.frMul:1);
 const expSar=(S.exp||[]).reduce((a,x)=>a+num(br?x[1]:x[2]),0);
 const frSar=(br?num(S.fB):num(S.fC)*u)*fr;
 const loss=num(over.loss!=null?over.loss:rb.loss)/100,cull=num(over.cull!=null?over.cull:rb.cull)/100;
 const k=1000/((1-loss)*(1-cull));const credit=num(rb.cullP)*k*(1-loss)*cull;
 const sup=(rb.sup||[]).reduce((a,x)=>a+num(x[1]),0);
 return {S,rb,mode,u,E,comm,expSar,frSar,sharedSar:expSar+frSar,sharedE:u?(expSar+frSar)/u*E:0,loss,cull,k,credit,sup,pw:num(rb.pw)/100,cap:num(rb.cap[mode]),
  pAdd:num(over.pAdd||0),noClient:!c,frMissing:frSar===0}}
/* بيانات سطر/صنف: طن لكل باليت، الإيراد والتكاليف لكل طن (من غير الخام والمصروفات المشتركة) */
function item(C,it){const w=pkW(C.S,it.pk),cpp=num(it.cpp),p=num(it.p)+C.pAdd,pk=pkPrice(C.rb,it.pk),wash=washOf(C.rb,it.v);
 const ok=w>0&&cpp>0&&C.u>0;const tPal=ok?cpp*w/1000:0;
 const rev=ok?p*(1-C.comm)*(1000/w)/C.u*C.E:0;            // ج لكل طن صافي بعد العمولة
 const pkg=ok?(1000/w)*(1+C.pw)*(pk||0):0;                // عبوات ج/طن (زي تكاليف الموالح من غير التقريب لأعلى)
 const a=rev-pkg-C.sup-(wash||0)+C.credit;                // المتاح للخام والمصروفات المشتركة ج/طن
 return {w,cpp,p,tPal,rev,pkg,wash,sup:C.sup,credit:C.credit,a,ok,missPk:pk==null,missWash:wash==null}}
/* سعر التعادل لخطة: n[i] باليت لكل صنف */
function planBE(C,items,n){let T=0,A=0,Q=0,sales=0;const rows=items.map((it,i)=>{const x=item(C,it),pal=num(n[i]),t=pal*x.tPal;T+=t;A+=t*x.a;Q+=pal*x.cpp;sales+=pal*x.cpp*x.p;return Object.assign(x,{pal,t})});
 const R=T>0?(A-C.sharedE)/(C.k*T):null;            // ج/كجم خام
 const sharedTon=T>0?C.sharedE/T:null;
 return {R,Rton:R==null?null:R*1000,T,Q,sales,rows,sharedTon,
  costTon:R==null?null:null,profitAt:raw=>T>0?(A-C.sharedE)-raw*C.k*T:null}}
/* صنف لوحده مالي الشحنة كلها */
function itemBE(C,it){const p=planBE(C,[it],[C.cap]);return p}
/* سعر البيع (ريال/كرتونة) اللي يعادل خام بسعر raw — للمقارنة العكسية */
function priceForRaw(C,it,raw){const x=item(C,Object.assign({},it,{p:0}));if(!x.ok)return null;const T=C.cap*x.tPal;if(!(T>0))return null;
 const need=raw*C.k+C.sharedE/T-x.a;                 // ج/طن لازم ييجوا من السعر
 return need/((1-C.comm)*(1000/x.w)/C.u*C.E)}
/* ---------- بحوث العمليات: سيمبلكس (أكبر c·x بشرط A·x ≤ b و x ≥ 0 و b ≥ 0) بقاعدة بلاند ---------- */
function simplex(c,A,b){const m=A.length,n=c.length,EPS=1e-9;
 const T=A.map((r,i)=>r.concat(A.map((_,j)=>i===j?1:0),[b[i]]));const z=c.map(v=>-v).concat(new Array(m).fill(0),[0]);
 const basis=A.map((_,i)=>n+i);
 for(let it=0;it<500;it++){let e=-1;for(let j=0;j<n+m;j++)if(z[j]<-EPS){e=j;break}
  if(e<0)break;let l=-1,best=Infinity;for(let i=0;i<m;i++)if(T[i][e]>EPS){const q=T[i][n+m]/T[i][e];if(q<best-EPS||(Math.abs(q-best)<=EPS&&basis[i]<basis[l])){best=q;l=i}}
  if(l<0)return {status:'unbounded'};const pv=T[l][e];T[l]=T[l].map(v=>v/pv);
  for(let i=0;i<m;i++)if(i!==l&&Math.abs(T[i][e])>EPS){const f=T[i][e];T[i]=T[i].map((v,j)=>v-f*T[l][j])}
  const fz=z[e];for(let j=0;j<=n+m;j++)z[j]-=fz*T[l][j];basis[l]=e}
 const x=new Array(n).fill(0);basis.forEach((bv,i)=>{if(bv<n)x[bv]=T[i][n+m]});return {status:'ok',x,z:z[n+m]}}
/* أحسن توزيع للباليتات يعلّي سعر التعادل للخام (برمجة كسرية خطية — Dinkelbach + سيمبلكس):
   أكبر (Σ nᵢ·tᵢ·aᵢ − مصروفات الشحنة) ÷ (k·Σ nᵢ·tᵢ)
   بشرط: Σ nᵢ = سعة الشحنة، nᵢ ≤ حد أقصى (لو متكتب)، ووزن كل مقاس ≤ نسبته من الفرز (لو متكتبة). */
function optimize(C,items){const X=items.map(it=>item(C,it));const idx=X.map((x,i)=>x.ok?i:-1).filter(i=>i>=0);
 if(!idx.length||!(C.cap>0))return {status:'empty'};
 const A=[],b=[];A.push(idx.map(()=>1));b.push(C.cap);
 idx.forEach((i,j)=>{if(isSet(items[i].max)){const r=idx.map(()=>0);r[j]=1;A.push(r);b.push(Math.max(0,+items[i].max))}});
 const groups={};idx.forEach((i,j)=>{const it=items[i];if(isSet(it.share)){const g=norm(it.v)+'|'+String(it.sz||'');(groups[g]=groups[g]||{s:+it.share/100,js:[]}).js.push(j)}});
 Object.values(groups).forEach(g=>{A.push(idx.map((i,j)=>X[i].tPal*((g.js.indexOf(j)>=0?1:0)-g.s)));b.push(0)});
 let lam=0,x=null,res=null;const tP=idx.map(i=>X[i].tPal),aa=idx.map(i=>X[i].a);
 for(let it=0;it<60;it++){const cc=idx.map((i,j)=>tP[j]*(aa[j]-C.k*lam));const M=2*Math.max(1,...cc.map(Math.abs))+1;
  res=simplex(cc.map(v=>v+M),A,b);if(res.status!=='ok')return {status:res.status};x=res.x;
  const T=x.reduce((s,v,j)=>s+v*tP[j],0);if(!(T>0))return {status:'empty'};
  const Nn=x.reduce((s,v,j)=>s+v*tP[j]*aa[j],0)-C.sharedE,Dd=C.k*T,F=Nn-lam*Dd;const nl=Nn/Dd;
  if(Math.abs(F)<1e-7*Math.max(1,Math.abs(Nn))||Math.abs(nl-lam)<1e-9){lam=nl;break}lam=nl}
 const filled=x.reduce((s,v)=>s+v,0);
 const n=new Array(items.length).fill(0);idx.forEach((i,j)=>n[i]=x[j]);
 /* باليتات صحيحة: نقرّب لتحت، والباقي للأعلى عائد مع احترام الحد الأقصى */
 const ni=n.map(v=>Math.floor(v+1e-6));let left=Math.round(filled)-ni.reduce((s,v)=>s+v,0);
 const order=idx.slice().sort((p,q)=>(n[q]-ni[q])-(n[p]-ni[p])||X[q].a-X[p].a);
 for(const i of order){if(left<=0)break;if(n[i]-ni[i]>1e-6&&(!isSet(items[i].max)||ni[i]+1<=+items[i].max)){ni[i]++;left--}}
 return {status:'ok',n,ni,R:lam,Rint:planBE(C,items,ni).R,filled,full:filled>=C.cap-1e-6}}
/* حساسية سعر التعادل لخطة */
function sensitivity(S,mode,items,n){const base=planBE(ctx(S,mode),items,n).R;const rb=rbOf(S);
 const cases=[['سعر الدولار بالجنيه −5%',{egp:S.egp*0.95}],['سعر الدولار بالجنيه +5%',{egp:S.egp*1.05}],
  ['سعر البيع −1 ريال للكرتونة',{pAdd:-1}],['سعر البيع +1 ريال للكرتونة',{pAdd:1}],
  ['النولون +20%',{frMul:1.2}],['النولون −20%',{frMul:0.8}],
  ['الفرزة +5 نقط',{cull:num(rb.cull)+5}],['الفرزة −5 نقط',{cull:Math.max(0,num(rb.cull)-5)}],
  ['العمولة +1 نقطة',{comm:ctx(S,mode).comm+0.01}]];
 return {base,rows:cases.map(c=>{const R=planBE(ctx(S,mode,c[1]),items,n).R;return {n:c[0],R,d:R==null||base==null?null:R-base}})}}
/* بيانات التكاليف المنسوخة من برنامج تكاليف الموالح (نص «COSTS1:» + JSON) */
function parseCosts(txt){const s=String(txt||'').trim();const m=s.match(/COSTS1:([A-Za-z0-9+/=_-]+)/);let o=null;
 try{if(m){const b=m[1].replace(/-/g,'+').replace(/_/g,'/');const bin=typeof atob==='function'?atob(b):Buffer.from(b,'base64').toString('binary');
   const bytes=Uint8Array.from(bin,ch=>ch.charCodeAt(0));o=JSON.parse(new TextDecoder().decode(bytes))}else o=JSON.parse(s)}catch(e){return null}
 if(o&&o.app==='citrus-costs'&&o.S)o=o.S;if(!o||typeof o!=='object'||!Array.isArray(o.pk)||!Array.isArray(o.sup))return null;
 const out={raw:num(o.raw),cullP:num(o.cullP),loss:num(o.loss)*100,cull:num(o.cull)*100,pw:num(o.pw)*100,
  pkp:o.pk.map(p=>[String(p[0]),num(p[1])]),sup:o.sup.map(x=>[String(x[0]),num(x[1])]),wash:(o.var||[]).map(x=>[String(x[0]),num(x[1])])};
 return out}
return {MODES,RB_DEF,rbOf,ctx,item,planBE,itemBE,priceForRaw,simplex,optimize,sensitivity,washOf,pkPrice,pkW,parseCosts,norm}});
