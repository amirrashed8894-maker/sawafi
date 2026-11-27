/* v2.5.0 — «اسأل القرار»: سعر التعادل لكل صنف × عبوة، الهدف، الاحتمالات، الحساسية — مطابقة لمحرك القرار وللتكاليف والصوافي. */
const assert=require('assert'),fs=require('fs'),vm=require('vm');const BE=require('../be-core.js'),M=require('../be-mx.js'),SA=require('../safi-autocost.js'),CC=require('../costs-calc.js'),SF=require('../safi-fresh.js');
const SC=(()=>{const c={module:{exports:{}},localStorage:{getItem:()=>null},JSON,Math};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../core.js','utf8')+';module.exports={calc}',c);return c.module.exports})();
const J=o=>JSON.parse(JSON.stringify(o));let n=0;const t=(m,f)=>{f();n++;console.log('✓',m)};const close=(a,b,e,m)=>assert.ok(Math.abs(a-b)<=e,m+': '+a+' vs '+b);
let seed=4242;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;const pick=a=>a[Math.floor(R()*a.length)];
function randState(){const safi=J(SF.PINNED);safi.egp=50+R()*6;safi.sar=3.75+R()*0.01;safi.fC=Math.round(2000+R()*2000);safi.fB=Math.round(10000+R()*8000);safi.exp.forEach(x=>{x[1]=Math.round(R()*7000);x[2]=Math.round(R()*7000)});
 safi.client=pick(safi.clients.map(c=>c[0]));safi.pk.forEach(p=>{if(R()<0.3)p[1]=+(p[1]*(0.95+R()*0.1)).toFixed(2)});
 const costs=BE.costsFrom(null);CC.ensureCostsCatalog(costs);costs.raw=+(5+R()*10).toFixed(2);costs.loss=+(R()*0.03).toFixed(3);costs.cull=+(R()*0.3).toFixed(3);costs.cullP=+(2+R()*6).toFixed(2);costs.pw=pick([0,0.005,0.01]);
 costs.sup.forEach(x=>x[1]=Math.round(R()*600));costs.var.forEach(v=>v[1]=Math.round(1000+R()*2000));if(R()<0.3){costs.sm.p=+(R()*0.2).toFixed(3);costs.sm.price=+(6+R()*8).toFixed(2)}
 const dec=BE.decFrom(null);dec.cap['حاوية']=pick([18,20,21,22]);dec.cap['براد']=pick([20,23,24]);return {safi,costs,dec}}
function randItem(st){const pk=pick(st.costs.pk)[0];return {v:pick(st.costs.var)[0],sz:'',pk,cpp:pick([72,80,140,154,200]),p:+(8+R()*30).toFixed(2)}}
t('أعلى خام = ② «لو الصنف مالي الشحنة لوحده» (BE.itemBE) وأقل سعر بيع = ① (BE.priceForRaw) — 2,000 حالة عشوائية × وسيلتين',()=>{
 for(let k=0;k<1000;k++){const st=randState(),it=randItem(st);for(const m of BE.MODES){const C=BE.ctx(st.safi,st.costs,st.dec,m),L=M.lin(BE,C,it);
  close(M.rawMax(L,it.p),BE.itemBE(C,it).R,1e-9,'R '+k);const r=st.costs.raw;close(M.priceMin(L,r),BE.priceForRaw(C,it,r),1e-9,'minP '+k)}}});
t('سعر الخام للتعادل لو اتحط تاني في الحساب الربح = صفر، وبالتنصيف (bisection) لحد 0.0001 ج نفس الرقم',()=>{
 for(let k=0;k<500;k++){const st=randState(),it=randItem(st),m=pick(BE.MODES),C=BE.ctx(st.safi,st.costs,st.dec,m),L=M.lin(BE,C,it),Rx=M.rawMax(L,it.p);
  const p=BE.planBE(C,[it],[C.cap]);close(p.profitAt(Rx),0,1e-6*Math.max(1,Math.abs(p.profitAt(0))),'profit@R '+k);
  let lo=-1000,hi=1000;for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(p.profitAt(mid)>0)lo=mid;else hi=mid}close((lo+hi)/2,Rx,1e-4,'bisect '+k);
  const P=M.priceMin(L,st.costs.raw);close(BE.planBE(C,[Object.assign({},it,{p:P})],[C.cap]).profitAt(st.costs.raw),0,1e-5*Math.max(1,Math.abs(p.profitAt(0))),'profit@minP '+k)}});
t('الهدف: على «أعلى خام عشان تكسب X» الربح = X ج/طن بالظبط، وبالنسبة % = X% من صافي المبيعات',()=>{
 for(let k=0;k<500;k++){const st=randState(),it=randItem(st),C=BE.ctx(st.safi,st.costs,st.dec,'حاوية'),L=M.lin(BE,C,it),p=BE.planBE(C,[it],[C.cap]);
  const X=Math.round(R()*5000),Rt=M.rawMax(L,it.p,{k:'ton',v:X});close(p.profitAt(Rt)/p.T,X,1e-6,'ton '+k);
  const q=Math.round(R()*30),Rq=M.rawMax(L,it.p,{k:'pct',v:q});close(p.profitAt(Rq)/p.T,L.alpha*it.p*q/100,1e-6,'pct '+k);
  const P=M.priceMin(L,st.costs.raw,{k:'ton',v:X});close(M.profitTon(L,P,st.costs.raw),X,1e-6,'minP ton '+k);
  const Pq=M.priceMin(L,st.costs.raw,{k:'pct',v:q});close(M.profitTon(L,Pq,st.costs.raw),L.alpha*Pq*q/100,1e-6,'minP pct '+k)}});
t('Φ و Φ⁻¹: قيم معروفة',()=>{close(M.Phi(0),0.5,1e-7,'0');close(M.Phi(1.959963984540054),0.975,2e-7,'1.96');close(M.Phi(-1),0.15865525393145707,2e-7,'-1');
 [0.001,0.01,0.1,0.2,0.5,0.8,0.9,0.95,0.999].forEach(p=>close(M.Phi(M.invPhi(p)),p,3e-7,'inv '+p));close(M.invPhi(0.95),1.6448536269514722,1e-6,'z95')});
t('الاحتمالات: المعادلة = محاكاة مونت كارلو (200,000 سعر) على 40 حالة — احتمال المكسب ±0.5 نقطة، الربح المتوقع ±0.5%',()=>{
 for(let k=0;k<40;k++){const st=randState(),it=randItem(st),C=BE.ctx(st.safi,st.costs,st.dec,'حاوية'),L=M.lin(BE,C,it);const D=M.dist(it.p,0.5+R()*4);
  const r=M.priceMin(L,0)>it.p?st.costs.raw:M.rawMax(L,it.p)+(R()-0.5)*3;const x=M.risk(L,r,D,0.8),mc=M.monteCarlo(L,r,D,200000,k+7);
  close(mc.prob,x.prob,0.005,'prob '+k);close(mc.expTon,x.expTon,0.005*Math.max(1000,Math.abs(x.expTon))+0.004*L.alpha*it.p,'exp '+k)}});
t('أعلى خام بثقة c: احتمال المكسب عليه = c بالظبط، والنطاق = 90% من الأسعار',()=>{for(let k=0;k<200;k++){const st=randState(),it=randItem(st),C=BE.ctx(st.safi,st.costs,st.dec,'حاوية'),L=M.lin(BE,C,it),D=M.dist(it.p,0.3+R()*5);
 for(const c of [0.7,0.8,0.9]){const x=M.risk(L,0,D,c);close(M.probAbove(D,M.priceMin(L,x.rConf)),c,1e-6,'conf '+c)}
 close(M.probAbove(D,D.lo)-M.probAbove(D,D.hi),0.9,1e-6,'90%');close(D.lo,it.p*Math.sqrt((D.m-D.d)/(D.m+D.d)),1e-9,'lo')}});
t('الحساسية: نفس سعر التعادل، والسطور مترتبة من الأكتر تأثير، وسعر البيع +1 ريال = α÷k بالظبط',()=>{for(let k=0;k<100;k++){const st=randState(),it=randItem(st),C=BE.ctx(st.safi,st.costs,st.dec,'حاوية'),L=M.lin(BE,C,it);const S=M.sens(BE,st.safi,st.costs,st.dec,'حاوية',it);
 close(S.base,BE.itemBE(C,it).R,1e-9,'base');for(let i=1;i<S.rows.length;i++)assert.ok(S.rows[i-1].span>=S.rows[i].span-1e-12);const sp=S.rows.find(x=>/سعر البيع/.test(x.n));close(sp.up,L.alpha/L.k,1e-9,'dp')}});
t('مطابقة محرك التكاليف (costs-calc = costs-core) ومحرك الصوافي (calc): لو وزن الكرتونة نفسه والصافي = الشحنة، سعر التعادل بالتنصيف على تكلفة التكاليف وصافي الصوافي = نفس الرقم (فرق تقريب الكراتين لأعلى بس) ± 0.01 ج',()=>{
 let worst=0;for(let k=0;k<300;k++){const st=randState();st.costs.sm.p=0;const it=randItem(st);const ci=st.costs.pk.findIndex(p=>p[0]===it.pk);const w=st.costs.pk[ci][2];
  st.safi.pk=st.safi.pk.filter(p=>p[0]!==it.pk);st.safi.pk.push([it.pk,w,it.cpp]);const m=pick(BE.MODES);st.safi.mode=m;const C=BE.ctx(st.safi,st.costs,st.dec,m),Rbe=BE.itemBE(C,it).R;
  const q=C.cap*it.cpp,T=q*w/1000;const sf=J(st.safi);sf.lines=[[it.v,it.pk,q,it.p]];const tonEgp=SC.calc(sf).tonEgp;
  const cs=J(st.costs);cs.net=T*1000;cs.variety=it.v;cs.pkg=ci;cs.mix=null;const cost=r=>{cs.raw=r;return CC.calcX(cs).ton};
  let lo=-200,hi=200;for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(tonEgp-cost(mid)>0)lo=mid;else hi=mid}const d=Math.abs((lo+hi)/2-Rbe);worst=Math.max(worst,d);assert.ok(d<0.01,'k'+k+' '+d)}
 console.log('   أكبر فرق',worst.toFixed(5),'ج/كجم')});
t('كل الأصناف × العبوات: سعر البيع من الصوافي (متوسط مرجّح بالكراتين، الأصناف بعد المطابقة)، اليدوي بيكسب، وخام كل صنف من التكاليف',()=>{
 const st=randState();st.costs.variety='برتقال أبوسرة تلوين';st.costs.raw=11.75;st.costs.rawBy={'يوسفي':9};
 st.safi.lines=[['أبو سرة مقاس 88','كرتون أوبن توب 7 ك',1400,22,10,140,null,{v:'أبو سرة',s:'88'}],['برتقال ابوسرة تلوين','كرتون أوبن توب 7 ك',700,25,5,140],['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200,null,{v:'يوسفي',s:''}],['كلمنتينا','صندوق بلاستيك 5 ك ملوّن',0,13,0,200,null,{v:'كلمنتينا',s:''}]];
 const mx={p:{},cpp:{}};let g=M.grid(BE,SA,st.safi,st.costs,st.dec,mx,null);const V=v=>g.vars.find(x=>x.v===v),cell=(v,pk)=>V(v).cells.find(c=>c.pk===pk);
 close(cell('برتقال أبوسرة تلوين','كرتون أوبن توب 7 ك').price.v,(1400*22+700*25)/2100,1e-9,'weighted');assert.strictEqual(cell('يوسفي','صندوق بلاستيك 5 ك ملوّن').price.v,15);
 assert.strictEqual(cell('يوسفي','صندوق بلاستيك 5 ك ملوّن').cpp.v,200);assert.deepStrictEqual(V('يوسفي').raw,{v:9,src:'var'});assert.deepStrictEqual(V('برتقال أبوسرة تلوين').raw,{v:11.75,src:'today'});assert.strictEqual(V('ليمون').raw.src,'fallback');
 const c=cell('يوسفي','صندوق بلاستيك 5 ك ملوّن'),Cb=g.Cs['حاوية'];close(c.m['حاوية'].R,BE.itemBE(Cb,{v:'يوسفي',pk:c.pk,cpp:200,p:15}).R,1e-12,'cell=itemBE');close(c.m['حاوية'].minP,BE.priceForRaw(Cb,{v:'يوسفي',pk:c.pk,cpp:200,p:15},9),1e-9,'minP on variety raw');
 mx.p['يوسفي|صندوق بلاستيك 5 ك ملوّن']=17;mx.cpp['صندوق بلاستيك 5 ك ملوّن']=180;g=M.grid(BE,SA,st.safi,st.costs,st.dec,mx,null);const c2=g.vars.find(x=>x.v==='يوسفي').cells.find(x=>x.pk==='صندوق بلاستيك 5 ك ملوّن');
 assert.deepStrictEqual([c2.price.v,c2.price.src,c2.price.auto,c2.cpp.v],[17,'man',15,180]);assert.ok(V('برتقال أبوسرة تلوين').best)});
/* لقطة أمير (القرار الحي 27/11): أبو سرة أوبن توب 7 ك، خام 11.75، 1,340.0 كجم خام/طن، فرزة مباعة 1,667، عبوات+مستلزمات+غسيل 8,265، مصروفات 9,000 + 10,519 ريال ÷ 22.05 طن → 34,950، والتعادل حاوية 14.97 */
t('لقطة أمير: الحاوية — أبو سرة أوبن توب 7 ك = 14.97 ج/كجم، إجمالي التكلفة على 11.75 = 34,950 ج/طن',()=>{
 const safi=J(SF.PINNED);safi.egp=53.5;safi.sar=3.7567;safi.fC=2800;safi.client='فاكهة الصيف';safi.exp=[['تخليص ونقل من الميناء',0,6500],['دخولية',0,2000],['أخرى',0,500]];safi.pk=[['كرتون أوبن توب 7 ك',7.5,140]];
 const costs=BE.costsFrom(null);costs.raw=11.75;costs.loss=0.005;costs.cull=0.25;costs.cullP=5;costs.pw=0.005;costs.var=[['برتقال أبوسرة تلوين',2500]];costs.sup=[['كله',1477]];
 const dec=BE.decFrom(null);dec.cap['حاوية']=21;const it={v:'أبو سرة',sz:'',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22};const C=BE.ctx(safi,costs,dec,'حاوية'),L=M.lin(BE,C,it);const sc=BE.scenario(safi,costs,dec,'حاوية',0,{},7);
 dec.items=[it];const s2=BE.scenario(safi,costs,dec,'حاوية',0,{},7);
 assert.strictEqual(L.k.toFixed(1),'1340.0');assert.strictEqual(Math.round(L.credit),1667);assert.strictEqual(Math.round(L.pkg+L.sup+L.wash),8265);assert.strictEqual(L.T.toFixed(2),'22.05');assert.strictEqual(Math.round(L.share),12606);
 assert.strictEqual(Math.round(s2.total),34950);assert.strictEqual(M.rawMax(L,22).toFixed(2),'14.97');assert.strictEqual(BE.itemBE(C,it).R.toFixed(2),'14.97');
 console.log('   α =',L.alpha.toFixed(2),'ج لكل ريال/كرتونة · b =',L.b.toFixed(0),'· R =',M.rawMax(L,22).toFixed(4),'· أقل سعر على 11.75 =',M.priceMin(L,11.75).toFixed(2),'ريال')});
console.log(n+' اختبار عدّوا');
