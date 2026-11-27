/* v2.6.0 — الشحنة واحدة للصوافي والقرار: نفس السطور والباليتات والكراتين، وتكلفة كل سطر = تكلفة الصوافي التلقائية = التكاليف، والربح بخام كل صنف = ربح الصوافي. */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const SHIPC=require('../ship-cont.js'),CC=require('../costs-calc.js'),E=require('../costs-core.js'),SA=require('../safi-autocost.js'),BE=require('../be-core.js'),SH=require('../be-ship.js');
const SAW=(()=>{const c={module:{exports:{}},console,JSON,Math};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../core.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8')+';module.exports={calc,DEF,PINNED};',c);return c.module.exports})();
const J=o=>JSON.parse(JSON.stringify(o));let n=0;const t=(m,f)=>{f();n++;console.log('✓',m)};
let seed=4242;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;const pick=a=>a[Math.floor(R()*a.length)];
const close=(a,b,tol,m)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),m+' '+a+' vs '+b);
const wrap=S=>JSON.stringify({ver:2,t:1,S});
const EXTRA=[['صندوق بلاستيك 5 ك ملوّن',5,200],['صندوق بلاستيك 2.5 ك ملوّن',2.5,400]];
const NAMES=['أبو سرة','برتقال ابوسرة تلوين','فريمونت','يوسفي','كلمنتينا','صيفي','بلدي','ليمون','جريب فروت','موركيت'];
function rndCosts(){const S=J(E.DEF);E.ensureCostsCatalog(S);S.raw=+(6+R()*10).toFixed(2);S.cull=+(R()*0.3).toFixed(3);S.loss=+(R()*0.03).toFixed(4);S.pw=pick([0,0.005,0.01]);S.net=pick([24000,23520,21000]);S.cullP=+(3+R()*6).toFixed(2);
 S.sup.forEach(x=>x[1]=Math.round(R()*600));S.var.forEach(v=>v[1]=Math.round(1000+R()*2000));if(R()<0.3){S.sm.p=+(R()*0.15).toFixed(3);S.sm.price=+(6+R()*8).toFixed(2)}
 S.variety=pick(S.var)[0];S.rawBy={};S.var.forEach(v=>{S.rawBy[v[0]]=+(4+R()*14).toFixed(2)});S.rawBy[S.variety]=S.raw;
 if(R()<0.3){const a=Math.floor(R()*S.pk.length);S.mix=E.defaultMix(S,[a,(a+1)%S.pk.length])}return SA.loadCosts(wrap(S),null,CC)}
function rndSafi(costs){const S=J(SAW.PINNED);EXTRA.forEach(p=>{if(!S.pk.some(x=>x[0]===p[0]))S.pk.push(p.slice())});S.egp=+(48+R()*10).toFixed(2);S.fC=Math.round(2000+R()*1500);S.mode=pick(['حاوية','براد']);S.client=pick(S.clients)[0];
 const L=1+Math.floor(R()*5);S.lines=[];for(let i=0;i<L;i++){const v=pick(NAMES),sz=R()<0.4?pick(['36','42','48','56']):'',pk=pick(S.pk)[0],pal=Math.floor(R()*15),cpp=Math.round(60+R()*300),p=+(8+R()*30).toFixed(2);
  const l=SH.newLine({v,sz,pk,pal,cpp,p});if(R()<0.3){l[7]=undefined;l.length=7}S.lines.push(l)}
 if(R()<0.2)S.lines.push(['','',0,'',0,0]);return S}
function setup(){const costs=rndCosts(),safi=rndSafi(costs);SH.autoCost(safi.lines,costs,CC,SA);BE.usePkg(SH.pkgHook(costs,CC,SA));const dec=BE.decFrom(null);dec.base=safi.mode;dec.cap={'حاوية':21,'براد':23};return {costs,safi,dec}}
/* ربح الصوافي بتكلفة كل سطر (attachCosts في app.js بالحرف) */
/* v2.8.0: الصوافي بتحسب على نسخة النولون والمصروفات فيها × عدد الحاويات (ceil(الباليتات ÷ السعة)) */
function safiProfit(S,cost,cap){const nC=SHIPC.contN(SHIPC.palOf(S),cap||SHIPC.capFrom(null,S.mode));const r=SAW.calc(SHIPC.scale(S,nC)),E_=S.egp;const src=S.lines.filter(l=>+l[2]);let pl=0;r.lines.forEach((x,i)=>{pl+=(x.nt*E_-cost(src[i]))*x.t});return {pl,r}}

t('القرار = سطور الصوافي بالظبط (500 شحنة عشوائية): الصنف، المقاس، العبوة، الباليتات، كراتين/باليت، الكراتين، سعر البيع، وإجمالي الباليتات',()=>{
 for(let k=0;k<500;k++){const {costs,safi}=setup();const its=SH.items(safi,null,costs,SA);const L=safi.lines.filter(SH.isRow);assert.strictEqual(its.length,L.length);
  its.forEach((it,j)=>{const l=safi.lines[it.li];assert.strictEqual(it.pk,l[1]);assert.strictEqual(it.pal,+l[4]);assert.strictEqual(it.cpp,+l[5]);assert.strictEqual(it.p,+l[3]);assert.strictEqual(it.pal*it.cpp,+l[2]);
   assert.strictEqual(it.v,SA.lineVar(l));assert.strictEqual(SH.nameOf(it.v,it.sz),l[0])});
  assert.strictEqual(its.reduce((a,x)=>a+x.pal,0),safi.lines.reduce((a,l)=>a+(+l[4]||0),0))}});
t('تكلفة الطن لكل سطر في القرار = «تكلفة الطن هنا» التلقائية في الصوافي = رقم التكاليف لنفس الصنف والعبوة وبخام الصنف ده (500 شحنة)',()=>{let cnt=0,worst=0;
 for(let k=0;k<500;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);const C=BE.ctx(safi,costs,dec,dec.base);const A=SH.analyze(BE,C,its,its.map(x=>x.pal));
  A.rows.forEach((r,j)=>{const it=its[j],l=safi.lines[it.li],x=SA.costFor(costs,it.v,it.pk,CC);if(x.ton==null||r.cost==null)return;
   assert.strictEqual(it.raw,x.raw,'خام الصنف');worst=Math.max(worst,Math.abs(r.cost-x.exact));close(r.cost,x.exact,1e-9,'cost');assert.strictEqual(+l[6],x.ton,'الصوافي');cnt++})}
 assert.ok(cnt>800,'cnt '+cnt);console.log('   ',cnt,'سطر، أكبر فرق',worst.toExponential(2),'ج/طن')});
t('ربح الشحنة في القرار بخام كل صنف = ربح/خسارة الشحنة في الصوافي (calc الأصلية + التكلفة التلقائية) — 500 شحنة',()=>{let cnt=0;
 for(let k=0;k<500;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);if(its.some(it=>SA.costFor(costs,it.v,it.pk,CC).ton==null))continue;
  const C=BE.ctx(safi,costs,dec,safi.mode),A=SH.analyze(BE,C,its,its.map(x=>x.pal));const {pl,r}=safiProfit(safi,l=>SA.costFor(costs,SA.lineVar(l),l[1],CC).exact,dec.cap[safi.mode]);if(!(r.t>0))continue;
  close(A.T,r.t,1e-12,'طن');close(A.own,pl,1e-7,'ربح');const p2=BE.planBE(C,its,its.map(x=>x.pal));close(p2.profitOwn,pl,1e-7,'profitOwn');cnt++}
 assert.ok(cnt>300,'cnt '+cnt)});
t('تعادل كل سطر: الخام = تعادله → ربح السطر صفر؛ ومتوسط تعادل السطور المرجّح بالطن = سعر التعادل للخطة (②)',()=>{
 for(let k=0;k<300;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);const C=BE.ctx(safi,costs,dec,dec.base),n=its.map(x=>x.pal),A=SH.analyze(BE,C,its,n);if(!(A.T>0))continue;
  let tR=0;A.rows.forEach((r,j)=>{if(!r.ok)return;tR+=r.t*r.Rrow;const it2=its.map((x,i)=>i===j?Object.assign({},x,{raw:r.Rrow}):x);const B=SH.analyze(BE,C,it2,n);close(B.rows[j].profit,0,1e-6,'صفر')});
  close(tR/A.T,A.R,1e-9,'R');close(A.own,A.delta*C.k*A.T,1e-9,'delta')}});
t('التعديل من القرار بيتكتب في سطر الصوافي (والكراتين = باليتات × كراتين/باليت) والصنف/المقاس في اسم السطر',()=>{const l=SH.newLine({v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',pal:17,cpp:200,p:15});
 assert.deepStrictEqual(l.slice(0,6),['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200]);SH.setField(l,'pal',10);assert.strictEqual(l[2],2000);SH.setField(l,'cpp',140);assert.strictEqual(l[2],1400);
 SH.setField(l,'sz','42');assert.strictEqual(l[0],'يوسفي مقاس 42');assert.strictEqual(SA.lineVar(l),'يوسفي');SH.setField(l,'v','فريمونت');assert.strictEqual(l[0],'فريمونت مقاس 42');SH.setField(l,'p',16.5);assert.strictEqual(l[3],16.5)});
t('الترحيل مرة واحدة: الصوافي بتكسب، والحد الأقصى/نسبة المقاس بيتنقلوا؛ ولو الصوافي فاضية سطور القرار بتتكتب فيها',()=>{const costs=SA.loadCosts(wrap((()=>{const S=J(E.DEF);E.ensureCostsCatalog(S);return S})()),null,CC);
 const safi=J(SAW.PINNED);safi.lines=[SH.newLine({v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',pal:17,cpp:200,p:15}),SH.newLine({v:'برتقال ابوسرة تلوين',pk:'كرتون مقفول 7 ك',pal:11,cpp:154,p:18})];
 const old={items:[{v:'فريمونت',sz:'',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:140,p:15,pal:17,max:5,share:''},{v:'أبو سرة',sz:'',pk:'كرتون مقفول 7 ك',cpp:154,p:18,pal:8,max:'',share:30}]};
 const m=SH.migrate(old,safi,false,costs,SA);assert.strictEqual(m.seed,null);assert.strictEqual(m.ext.list[1].share,30);assert.strictEqual(m.ext.list[1].k,SA.lineKey(safi.lines[1]));
 assert.strictEqual(m.ext.list[0].max,5,'فريمونت = نفس صف يوسفي في التكاليف');
 const its=SH.items(safi,m.ext,costs,SA);assert.strictEqual(its[1].share,30);assert.strictEqual(its[0].cpp,200);assert.strictEqual(its[0].v,'يوسفي');
 const e=J(SAW.PINNED);e.lines=[];const m2=SH.migrate(old,e,false,costs,SA);assert.strictEqual(m2.seed.length,2);assert.deepStrictEqual(m2.seed[0].slice(0,6),['فريمونت','صندوق بلاستيك 5 ك ملوّن',2380,15,17,140]);
 const m3=SH.migrate(old,safi,true,costs,SA);assert.strictEqual(m3.seed.length,2,'الصوافي لسه بالمدخلات الرئيسية = القرار القديم يتكتب')});
t('القرار السريع: الاحتمال = Monte Carlo، وعند الثقة المطلوبة الاحتمال = الثقة؛ اشتري ≥ الثقة، فاوض ≥ 50%، غير كده متشتريش',()=>{let cnt=0;
 for(let k=0;k<60;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);const Q=SH.quick(BE,safi,costs,dec,its,{d:2+R()*3,conf:0.8});
  Q.vars.forEach(g=>{if(g.prob==null||!g.rAt)return;const v=g.verdict.k;assert.strictEqual(v,g.prob>=0.8?'buy':g.prob>=0.5?'neg':'no');
   /* MC: X lognormal، الربح خطي في X */
   const A=Q.A,C=A.C;let win=0,N=20000,s2=9;const rnd=()=>(s2=(s2*16807)%2147483647)/2147483647;const rows=g.k&&A.rows.filter(r=>r.ok&&String(r.v||'—')===g.k);
   for(let i=0;i<N;i++){const u1=rnd(),u2=rnd(),z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2),X=Math.exp(g.sig*z)||1;let pr=0;rows.forEach(r=>{const x=A.plan.rows[r.i];const al=(1-C.comm)*(1000/x.w)/C.u*C.E;pr+=r.t*(al*r.p*(X-1)+x.a-A.share-C.k*r.raw)});if(pr>0)win++}
   if(g.sig>0)assert.ok(Math.abs(win/N-g.prob)<0.015,'MC '+win/N+' '+g.prob);
   const r80=g.rAt(0.8);const gg=SH.group(BE,SH.analyze(BE,C,its.map(it=>String(it.v||'—')===g.k?Object.assign({},it,{raw:r80}):it),A.plan.rows.map(x=>x.pal)),r=>String(r.v||'—'),Q.d).find(x=>x.k===g.k);
   if(g.sig>0)close(gg.prob,0.8,1e-6,'ثقة');cnt++})}
 assert.ok(cnt>50)});
t('حساب يدوي — شحنة أمير: يوسفي 17 × 200 صندوق 5ك @15، أبوسرة 11 × 154 مقفول 7ك @18؛ خام يوسفي 9، أبوسرة 11.75',()=>{
 const S0=J(E.DEF);E.ensureCostsCatalog(S0);S0.usd=53.5;S0.variety='برتقال أبوسرة تلوين';S0.raw=11.75;S0.rawBy={'برتقال أبوسرة تلوين':11.75,'يوسفي':9};S0.cull=0.25;S0.cullP=5;const costs=SA.loadCosts(wrap(S0),null,CC);
 const safi=J(SAW.PINNED);EXTRA.forEach(p=>{if(!safi.pk.some(x=>x[0]===p[0]))safi.pk.push(p.slice())});safi.lines=[SH.newLine({v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',pal:17,cpp:200,p:15}),SH.newLine({v:'برتقال ابوسرة تلوين',pk:'كرتون مقفول 7 ك',pal:11,cpp:154,p:18})];
 SH.autoCost(safi.lines,costs,CC,SA);BE.usePkg(SH.pkgHook(costs,CC,SA));const dec=BE.decFrom(null);const its=SH.items(safi,null,costs,SA);
 assert.deepStrictEqual(its.map(x=>[x.v,x.pk,x.pal,x.cpp,x.p,x.raw]),[['يوسفي','صندوق بلاستيك 5 ك ملوّن',17,200,15,9],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',11,154,18,11.75]]);
 const C=BE.ctx(safi,costs,dec,'حاوية'),A=SH.analyze(BE,C,its,[17,11]);
 /* يدوي */
 const k=1000/((1-0.005)*(1-0.25)),credit=5*k*(1-0.005)*0.25,sup=costs.sup.reduce((a,x)=>a+x[1],0);
 const T=17*200*5/1000+11*154*7.15/1000,share=2*(8500+2800*3.7567)/3.7567*53.5/T;   // v2.8.0: 28 باليت ÷ 21 = 2 حاوية → النولون والمصروفات × 2
 const pk5=Math.ceil(Math.ceil(24000/5)*1.005)*costs.pk.find(p=>p[0]==='صندوق بلاستيك 5 ك ملوّن')[1]/24,pk7=Math.ceil(Math.ceil(24000/7)*1.005)*23/24;
 const c1=9*k-credit+pk5+sup+1800,c2=11.75*k-credit+pk7+sup+2500;
 close(A.rows[0].cost,c1,1e-12,'تكلفة يوسفي');close(A.rows[1].cost,c2,1e-12,'تكلفة أبوسرة');assert.strictEqual(+safi.lines[0][6],Math.round(c1*100)/100);assert.strictEqual(+safi.lines[1][6],Math.round(c2*100)/100);
 const rv1=15*0.94*200/3.7567*53.5,rv2=18*0.94*(1000/7.15)/3.7567*53.5;
 close(A.rows[0].Rrow,(rv1-(pk5+sup+1800-credit)-share)/k,1e-12,'R يوسفي');close(A.rows[1].Rrow,(rv2-(pk7+sup+2500-credit)-share)/k,1e-12,'R أبوسرة');
 const own=(rv1-share-c1)*17+(rv2-share-c2)*11*154*7.15/1000;close(A.own,own,1e-9,'الشحنة');
 const Q=SH.quick(BE,safi,costs,dec,its,{d:2,conf:0.8});assert.strictEqual(Q.pal,28);assert.strictEqual(Q.boxes,2);assert.strictEqual(A.plan.nC,2);
 const {pl}=safiProfit(safi,l=>SA.costFor(costs,SA.lineVar(l),l[1],CC).exact,21);close(A.own,pl,1e-9,'الصوافي = القرار');
 const dec1=BE.decFrom(null);dec1.cap={'حاوية':100,'براد':100};const A1=SH.analyze(BE,BE.ctx(safi,costs,dec1,'حاوية'),its,[17,11]);   // قبل v2.8.0 = مرة واحدة
 console.log('    قبل (مرة واحدة):',A1.rows.map(r=>r.v+' أعلى خام '+r.Rrow.toFixed(2)+' ربح/طن '+r.profitTon.toFixed(2)).join(' · '),'| الشحنة',A1.own.toFixed(2),'هامش',A1.delta.toFixed(3));
 console.log('    T',T.toFixed(3),'طن · مصروفات/طن',share.toFixed(2),'· k',k.toFixed(2),'· فرزة',credit.toFixed(2));
 A.rows.forEach(r=>console.log('   ',r.v,r.pk,'| تكلفة',r.cost.toFixed(2),'ج/طن | أعلى خام',r.Rrow.toFixed(2),'| خامه',r.raw,'| ربح/طن',r.profitTon.toFixed(2),'| الشحنة',r.profit.toFixed(2)));
 console.log('    الشحنة: ',A.own.toFixed(2),'ج · هامش',A.delta.toFixed(3),'ج/كجم · R خطة',A.R.toFixed(2));
 Q.vars.forEach(g=>console.log('   ',g.v,g.verdict.t,'| أعلى خام',g.R.toFixed(2),'| هامش',g.margin.toFixed(2),'| احتمال',(g.prob*100).toFixed(1)+'%','| براد',g.oth&&g.oth.R.toFixed(2),'| الأحسن',g.best?g.best.R.toFixed(2):'—'));
 console.log('    الأحسن:',Q.ob.ni.join('/'),'R',Q.ob.Rint&&Q.ob.Rint.toFixed(2))});
BE.usePkg(null);console.log(n+' اختبار عدّوا');
