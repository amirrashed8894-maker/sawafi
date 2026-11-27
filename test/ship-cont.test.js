/* v2.8.0 — النولون والمصروفات لكل حاوية × عدد الحاويات (أمير: «خلي النولون والمصاريف تتضرب في عدد الحاويات تلقائي»). */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const SC=require('../ship-cont.js'),CC=require('../costs-calc.js'),E=require('../costs-core.js'),SA=require('../safi-autocost.js'),BE=require('../be-core.js'),SH=require('../be-ship.js');
const SAW=(()=>{const c={module:{exports:{}},console,JSON,Math};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../core.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8')+';module.exports={calc,DEF,PINNED};',c);return c.module.exports})();
const J=o=>JSON.parse(JSON.stringify(o));let n=0;const t=(m,f)=>{f();n++;console.log('✓',m)};
let seed=9001;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;const pick=a=>a[Math.floor(R()*a.length)];
const close=(a,b,tol,m)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),m+' '+a+' vs '+b);
const wrap=S=>JSON.stringify({ver:2,t:1,S});
const EXTRA=[['صندوق بلاستيك 5 ك ملوّن',5,200]];const NAMES=['برتقال ابوسرة تلوين','يوسفي','صيفي','بلدي','ليمون'];
function rndCosts(){const S=J(E.DEF);E.ensureCostsCatalog(S);S.raw=+(6+R()*10).toFixed(2);S.cull=+(R()*0.3).toFixed(3);S.loss=+(R()*0.03).toFixed(4);S.cullP=+(3+R()*6).toFixed(2);
 S.variety=pick(S.var)[0];S.rawBy={};S.var.forEach(v=>{S.rawBy[v[0]]=+(4+R()*14).toFixed(2)});S.rawBy[S.variety]=S.raw;return SA.loadCosts(wrap(S),null,CC)}
/* شحنة 1–3 حاويات: إجمالي الباليتات من 1 لحد 3 × السعة */
function setup(){const costs=rndCosts(),S=J(SAW.PINNED);EXTRA.forEach(p=>{if(!S.pk.some(x=>x[0]===p[0]))S.pk.push(p.slice())});S.egp=+(48+R()*10).toFixed(2);S.fC=Math.round(2000+R()*1500);S.fB=Math.round(R()*9000);
 S.mode=pick(['حاوية','براد']);S.client=pick(S.clients)[0];if(R()<0.4)S.exp.push(['رسوم إذن استيراد',300,300]);if(R()<0.3)S.exp.push(['بند يدوي ثابت',0,Math.round(R()*900),'once']);
 const cap={'حاوية':pick([20,21,22]),'براد':pick([22,23,24])},target=Math.max(1,Math.round(R()*3*cap[S.mode]));const L=1+Math.floor(R()*4);S.lines=[];let left=target;
 for(let i=0;i<L;i++){const pal=i===L-1?left:Math.floor(R()*left);left-=pal;S.lines.push(SH.newLine({v:pick(NAMES),pk:pick(S.pk)[0],pal,cpp:Math.round(60+R()*300),p:+(8+R()*30).toFixed(2)}))}
 SH.autoCost(S.lines,costs,CC,SA);BE.usePkg(SH.pkgHook(costs,CC,SA));const dec=BE.decFrom(null);dec.base=S.mode;dec.cap=cap;return {costs,safi:S,dec,target}}
function safiProfit(S,cap,costs){const nC=SC.contN(SC.palOf(S),cap);const r=SAW.calc(SC.scale(S,nC));const src=S.lines.filter(l=>+l[2]);let pl=0;r.lines.forEach((x,i)=>{pl+=(x.nt*S.egp-SA.costFor(costs,SA.lineVar(src[i]),src[i][1],CC).exact)*x.t});return {pl,r,nC}}

t('عدد الحاويات = ceil(الباليتات ÷ السعة)، وأقل حاجة 1',()=>{assert.strictEqual(SC.contN(28,21),2);assert.strictEqual(SC.contN(21,21),1);assert.strictEqual(SC.contN(22,21),2);assert.strictEqual(SC.contN(63,21),3);assert.strictEqual(SC.contN(0,21),1);assert.strictEqual(SC.contN(5,0),1);assert.strictEqual(SC.contN(23*21/21,23),1)});
t('التصنيف: النولون والتخليص والنقل والدخولية والتخزين وأي بند مش واضح = لكل حاوية؛ «إذن استيراد» = مرة للشحنة؛ والعلامة اليدوية بتكسب',()=>{
 ['تخليص ونقل من الميناء','دخولية','مصاريف أخرى','رسوم موقف','كارت دخول','نقل من الثلاجة للسوق','تخزين (إيجار طبالي بالثلاجة)','نقل الحاوية من الميناء','تخليص','مصروفات البراد في السعودية (إجمالي)'].forEach(x=>assert.strictEqual(SC.isOnce([x,1,1]),false,x));
 assert.strictEqual(SC.isOnce(['رسوم إذن استيراد',300,300]),true);assert.strictEqual(SC.isOnce(['رسوم إذن استيراد',300,300,'per']),false);assert.strictEqual(SC.isOnce(['دخولية',0,2000,'once']),true)});
t('scale: النسخة بس اللي بتتغير، والعدد 1 = الحالة زي ما هي بالظبط (calc الأصلية متطابقة حرفيًا)',()=>{for(let k=0;k<200;k++){const {safi}=setup();const o=JSON.stringify(safi);const s1=SC.scale(safi,1);assert.strictEqual(JSON.stringify(s1),o);
 assert.strictEqual(JSON.stringify(SAW.calc(s1)),JSON.stringify(SAW.calc(J(safi))));SC.scale(safi,3);assert.strictEqual(JSON.stringify(safi),o)}});
t('1–3 حاويات (600 شحنة عشوائية): مصروفات الشحنة في القرار = مصروفات الصوافي = (النولون + البنود لكل حاوية) × العدد + الثابت مرة واحدة',()=>{const seen={1:0,2:0,3:0};
 for(let k=0;k<600;k++){const {costs,safi,dec,target}=setup();const its=SH.items(safi,null,costs,SA);const C=BE.ctx(safi,costs,dec,safi.mode),A=SH.analyze(BE,C,its,its.map(x=>x.pal));
  const nC=SC.contN(target,dec.cap[safi.mode]);assert.strictEqual(A.plan.nC,nC);seen[nC]=(seen[nC]||0)+1;
  const inf=SC.info(safi,dec);assert.strictEqual(inf.n,nC);const r=SAW.calc(SC.scale(safi,nC));close(-(r.expV+r.frV),inf.totSar,1e-12,'الصوافي');close(A.plan.sharedSar,inf.totSar,1e-12,'القرار');
  close(SC.ofC(C,nC).totSar,inf.totSar,1e-12,'السطر');close(A.plan.shared,inf.totSar/safi.sar*safi.egp,1e-12,'ج')}
 assert.ok(seen[1]>50&&seen[2]>50&&seen[3]>50,JSON.stringify(seen))});
t('ربح الشحنة في القرار = ربح الصوافي (600 شحنة 1–3 حاويات، بخام كل صنف وتكلفته التلقائية)',()=>{let cnt=0;
 for(let k=0;k<600;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);if(its.some(it=>SA.costFor(costs,it.v,it.pk,CC).ton==null))continue;
  const C=BE.ctx(safi,costs,dec,safi.mode),A=SH.analyze(BE,C,its,its.map(x=>x.pal));const {pl,r,nC}=safiProfit(safi,dec.cap[safi.mode],costs);if(!(r.t>0))continue;
  close(A.T,r.t,1e-12,'طن');close(A.own,pl,1e-7,'ربح');assert.strictEqual(A.plan.nC,nC);
  const src=safi.lines.filter(l=>+l[2]),rows=A.rows.filter(x=>x.pal>0);assert.strictEqual(rows.length,r.lines.length);
  r.lines.forEach((x,i)=>{if(rows[i].ok)close(rows[i].profitTon,x.nt*safi.egp-SA.costFor(costs,SA.lineVar(src[i]),src[i][1],CC).exact,1e-7,'ربح/طن سطر')});cnt++}
 assert.ok(cnt>400,'cnt '+cnt)});
t('التعادل يرجع صفر: الخام = R الخطة → ربح الخطة صفر؛ وخام السطر = تعادله → ربح السطر صفر (400 شحنة 1–3 حاويات)',()=>{
 for(let k=0;k<400;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);const C=BE.ctx(safi,costs,dec,dec.base),nn=its.map(x=>x.pal),p=BE.planBE(C,its,nn);if(!(p.T>0)||p.R==null)continue;
  close(p.profitAt(p.R),0,1e-6,'R خطة');const A=SH.analyze(BE,C,its,nn);
  A.rows.forEach((r,j)=>{if(!r.ok)return;const it2=its.map((x,i)=>i===j?Object.assign({},x,{raw:r.Rrow}):x);close(SH.analyze(BE,C,it2,nn).rows[j].profit,0,1e-6,'صفر')});
  /* أقل سعر بيع (①) = حاوية واحدة مالية من الصنف: لو اتباع بيه الربح صفر */
  its.forEach(it=>{const raw=BE.rawOfIt(it,costs),pmin=BE.priceForRaw(C,it,raw);if(pmin==null)return;const q=BE.planBE(C,[Object.assign({},it,{p:pmin,raw})],[C.cap]);assert.strictEqual(q.nC,1);close(q.profitAt(raw),0,1e-6,'①')})}});
t('حاوية واحدة (الباليتات ≤ السعة) = نفس أرقام v2.7.0 بالظبط',()=>{for(let k=0;k<300;k++){const {costs,safi,dec}=setup();const its=SH.items(safi,null,costs,SA);const C=BE.ctx(safi,costs,dec,dec.base),nn=its.map(x=>x.pal);
 const p=BE.planBE(C,its,nn);if(!(p.T>0))continue;if(p.nC!==1)continue;let A=0;p.rows.forEach(x=>{A+=x.t*x.a});assert.strictEqual(p.R,(A-C.sharedE)/(C.k*p.T))}});
t('السطر المكتوب: «النولون 2,800$ × 2 حاوية + المصروفات 8,500 ريال × 2 حاوية = 38,037.52 ريال»',()=>{const S=J(SAW.PINNED);S.fC=2800;S.sar=3.7567;S.mode='حاوية';S.lines=[SH.newLine({v:'يوسفي',pk:S.pk[0][0],pal:17,cpp:200,p:15}),SH.newLine({v:'يوسفي',pk:S.pk[0][0],pal:11,cpp:154,p:18})];
 const i=SC.info(S,null);assert.strictEqual(i.n,2);assert.strictEqual(SC.text(i),'النولون 2,800$ × 2 حاوية + المصروفات 8,500 ريال × 2 حاوية = 38,037.52 ريال');
 S.mode='براد';const b=SC.info(S,{cap:{'براد':23}});assert.strictEqual(b.n,2);assert.ok(SC.text(b).indexOf('× 2 براد')>0)});
BE.usePkg(null);console.log(n+' اختبار عدّوا');
