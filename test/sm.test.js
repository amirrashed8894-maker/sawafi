/* محلي سوبرماركت v2.2.0 (فرزة مقاسات 100-113): مخرج مستقل نسبته من الفاكهة بعد الهالك، والفرزة زي ما هي.
   النسبة صفر (أو حفظ قديم من غير sm) = calc() الأصلية بالظبط؛ be-core = costs-core بالظبط؛ المثال المحسوب باليد؛ التوزيع 100%؛ R* و twoWay متسقين. */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const BE=require('../be-core.js');
const load=(file,extra)=>{const c={module:{exports:{}},console,localStorage:{getItem:()=>null},JSON};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8')+(extra||''),c);return c.module.exports};
const SAW=load('../core.js');const PINNED=load('../core.js',fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8'));
const CIT=load('../costs-core.js');
const close=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,msg+': '+a+' vs '+b);
let n=0;const t=(name,fn)=>{fn();n++;console.log('✓',name)};
const J=o=>JSON.parse(JSON.stringify(o));
const SM={p:0.1,price:12,basis:'kg',box:0,oth:0,sizes:'100-113',bx:[['صندوق جامبو 15 كجم',18,15,0.65],['صندوق بلاستيك 8 كجم',13.5,7.5,0.8]]};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
function randCosts(){const c=J(CIT.DEF);c.net=5000+Math.round(rnd()*25000);c.raw=+(rnd()*30).toFixed(2);c.cullP=+(rnd()*12).toFixed(2);c.loss=+(rnd()*0.1).toFixed(4);c.cull=+(rnd()*0.5).toFixed(4);c.pw=+(rnd()*0.03).toFixed(4);c.pkg=Math.floor(rnd()*c.pk.length);c.usd=40+rnd()*20;return c}

t('كود السوبرماركت في be-core.js نسخة حرفية من costs-core.js',()=>{const a=fs.readFileSync(path.join(__dirname,'../costs-core.js'),'utf8'),b=fs.readFileSync(path.join(__dirname,'../be-core.js'),'utf8');
 const cut=(s,end)=>{const i=s.indexOf('const SM_DEF=');assert.ok(i>0);return s.slice(i,s.indexOf(end,i)).trim()};assert.strictEqual(cut(b,'/* سياق الحساب'),cut(a,'function calcX('))});
t('calc() الأصلية ما اتغيّرتش (ORIG-BEGIN..END زي orig_core_lines.txt)',()=>{const src=fs.readFileSync(path.join(__dirname,'../costs-core.js'),'utf8');const blk=src.split('/*ORIG-BEGIN*/\n')[1].split('\n/*ORIG-END*/')[0];
 const ref=fs.readFileSync(path.join(__dirname,'costs/orig_core_lines.txt'),'utf8');ref.split('\n').filter(l=>l.trim()&&!/^const DEF=|^pk:|^sup:|^var:/.test(l)).forEach(l=>assert.ok(blk.includes(l.trim()),'سطر ناقص: '+l.slice(0,60)))});
t('حفظ قديم من غير sm / النسبة صفر / sm بايظ = calc() بالظبط (300 حالة)',()=>{for(let i=0;i<300;i++){const c=randCosts();const base=J(CIT.calc(J(c)));
  for(const sm of [undefined,{p:0},J(Object.assign({},SM,{p:0})),'x',null]){const s=J(c);if(sm!==undefined)s.sm=sm;const rr=J(CIT.calcX(s));delete rr.sm;assert.deepStrictEqual(rr,base)}}});
t('الافتراضي: صندوق جامبو 15 كجم وزنه 0.65 كجم وسعره 18 ج، والنسبة صفر',()=>{assert.deepStrictEqual(J(CIT.SM_DEF.bx[0]),['صندوق جامبو 15 كجم',18,15,0.65]);assert.strictEqual(CIT.SM_DEF.p,0);assert.strictEqual(CIT.SM_DEF.basis,'kg')});
t('مثال باليد: فرزة 15% زي ما هي + سوبرماركت 10%، هالك 0.5%، 24 طن تصدير، 12 ج/كجم قائم، جامبو',()=>{const s=J(CIT.DEF);s.sm=J(SM);const r=CIT.calcX(s),x=r.sm,T=24;
 // الكميات للحاوية
 close(r.rawNeed,24000/(0.995*0.75),1e-9,'الخام');close(r.lossKg,24000/0.75*0.005/0.995,1e-9,'الهالك');close(r.rawNeed-r.lossKg,32000,1e-9,'بعد الهالك');
 close(r.cullKg,4800,1e-9,'الفرزة 15% بالظبط');close(r.smKg,3200,1e-9,'السوبرماركت 10%');close(r.rawNeed-r.lossKg-r.cullKg-r.smKg,24000,1e-9,'التصدير');
 close(x.split.exp+x.split.cull+x.split.sm+x.split.loss,1,1e-12,'التوزيع 100%');close(x.split.exp,0.74625,1e-12,'تصدير % من الخام');
 close(r.smBoxes,3200/15,1e-9,'صناديق');close(r.smGross,3200/15*15.65,1e-9,'قائم');close(r.smRev,3200/15*15.65*12,1e-6,'إيراد 40,064');close(r.smRev,40064,1e-6,'40064');
 close(r.smBoxC,3200/15*18,1e-9,'صناديق 3,840');close(r.smNet,36224,1e-6,'صافي');close(x.perKg,11.32,1e-12,'صافي الكيلو');
 // التكلفة لكل طن
 close(r.cullC,4800*3/24,1e-9,'تكلفة الفرزة 600');close(r.smC,(3200*10-36224)/24,1e-9,'تكلفة السوبرماركت −176');
 close(r.rawT,10000+r.lossKg*10/24+600-176,1e-9,'الخام');close(r.ton,r.rawT+3447*23/24+1498+2500,1e-9,'الطن');close(r.ton,17792.376675,1e-5,'17,792.38');
 close(r.perPkg,r.ton/1000*7,1e-12,'الكرتونة');close(r.cont,r.ton*24,1e-9,'الحاوية');close(x.gain,1000*0.1/0.75*(11.32-7),1e-9,'مقارنة بالفرزة 576');close(x.gain,576,1e-9,'576')});
t('اتجاه الأثر: بيع المقاسات دي سوبرماركت بدل فرزة = أرخص بالظبط بـ gain، وكل ما السعر يزيد التكلفة تقل',()=>{const s=J(CIT.DEF);s.sm=J(SM);const r=CIT.calcX(s);
 const asCull=J(CIT.DEF);asCull.cull=0.25;close(CIT.calc(asCull).ton-r.ton,r.sm.gain,1e-9,'فرزة 25% − (فرزة 15% + سوبرماركت 10%) = gain');
 let prev=Infinity;for(const p of [5,7,9,12,15]){const q=J(s);q.sm.price=p;const t=CIT.calcX(q).ton;assert.ok(t<prev,'السعر '+p);prev=t}
 const w=J(s);w.sm.bx[0][3]=1.65;close(r.ton-CIT.calcX(w).ton,3200/15*12/24,1e-9,'كل كجم وزن صندوق زيادة = سعر × صناديق');
 const q=J(s);q.sm.bx[0][1]=28;close(CIT.calcX(q).ton-r.ton,3200/15*10/24,1e-9,'سعر الصندوق +10 ج');
 const z=J(s);z.sm.price=7*15/15.65+18/15.65;close(CIT.calcX(z).sm.gain,0,1e-9,'سعر = سعر الفرزة بعد الصندوق → مفيش فرق')});
t('سعر أقل من الفرزة: gain سالب والتكلفة أعلى من بيعه فرزة',()=>{const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{price:6});const r=CIT.calcX(s);assert.ok(r.sm.gain<0&&r.sm.perKg<7);const a=J(CIT.DEF);a.cull=0.25;assert.ok(r.ton>CIT.calc(a).ton)});
t('بالصندوق: 180 ج/صندوق (وزن الصندوق مالوش دخل)',()=>{const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{basis:'box',price:180});const x=CIT.calcX(s).sm;close(x.perKg,(180-18)/15,1e-9,'الكيلو');close(x.rev,1000*0.1/0.75/15*180,1e-9,'الإيراد');
 s.sm.bx[0][3]=5;close(CIT.calcX(s).sm.gain,x.gain,1e-9,'وزن الصندوق مش مؤثر بالصندوق')});
t('مصاريف تانية ونوع الصندوق التاني',()=>{const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{oth:2,box:1});const x=CIT.calcX(s).sm;assert.strictEqual(x.name,'صندوق بلاستيك 8 كجم');close(x.perKg,(12*8.3-15.5)/7.5,1e-9,'الكيلو')});
t('الفرزة + السوبرماركت ≥ 100%: مقفول (over) ومن غير NaN، و 99% شغال',()=>{for(const [c,p] of [[0.15,0.85],[0.15,0.9],[0,1],[0.5,0.6]]){const s=J(CIT.DEF);s.cull=c;s.sm=Object.assign(J(SM),{p});const r=CIT.calcX(s);assert.ok(r.sm.over&&!r.sm.on);assert.ok(isFinite(r.ton));
  const b=BE.ctx(J(PINNED),BE.costsFrom(s),BE.decFrom(null),'حاوية');assert.ok(isFinite(b.k)&&isFinite(b.credit))}
 const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{p:0.84});const r=CIT.calcX(s);assert.ok(r.sm.on);close(r.rawNeed-r.lossKg-r.cullKg-r.smKg,24000,1e-6,'تصدير')});
t('sm بايظ أو ناقص: من غير NaN',()=>{for(const sm of [{p:0.4,box:9},{p:0.4,bx:[]},{p:'0.2',price:'15',bx:[['x','3','10','1']]},{p:0.4,basis:'zz'},{p:0.4,bx:[['x',3,0,1]]},{p:-1},{p:7}]){const s=J(CIT.DEF);s.sm=sm;const r=CIT.calcX(s);
  assert.ok(isFinite(r.ton),JSON.stringify(sm));const b=BE.ctx(J(PINNED),BE.costsFrom(s),BE.decFrom(null),'حاوية');assert.ok(isFinite(b.credit))}});
t('be-core: k والخصم = calcX (300 حالة): تكلفة مصر في BE = calcX.ton لما العبوات من غير تقريب',()=>{for(let i=0;i<300;i++){const c=randCosts();c.sm=Object.assign(J(SM),{p:+(rnd()*0.4).toFixed(3),price:+(rnd()*25).toFixed(2),basis:rnd()<0.5?'kg':'box',box:Math.floor(rnd()*2),oth:+(rnd()*3).toFixed(2)});if(c.sm.basis==='box')c.sm.price*=12;
  const r=CIT.calcX(J(c)),C=BE.ctx(J(PINNED),BE.costsFrom(J(c)),BE.decFrom(null),'حاوية');if(!r.sm.on)continue;const T=c.net/1000;
  close(C.k,r.rawNeed/T,1e-6,'k');close(C.cullCredit,r.cullSale/T,1e-6,'الفرزة');close(C.smCredit,r.smNet/T,1e-6,'السوبرماركت');
close(c.raw*C.k-C.credit,r.rawT,1e-6,'الخام في BE = rawT')}});
for(const mode of BE.MODES)t('R* مع السوبرماركت داخل calcX التكاليف = صافي الطن ('+mode+')',()=>{const S=J(PINNED);S.pk.forEach(p=>{if(/ 7 ك/.test(p[0]))p[1]=7});const cs=BE.costsFrom(null);cs.pw=0;cs.sm=J(SM);const D=BE.decFrom(null);const C=BE.ctx(S,cs,D,mode);
 for(const it of D.items){const p=BE.itemBE(C,it);S.mode=mode;S.lines=[[it.v,it.pk,C.cap*it.cpp,it.p]];const nb=SAW.calc(S).lines[0].nt*S.egp;
  const c2=J(CIT.DEF);c2.net=p.T*1000;c2.raw=p.R;c2.pw=0;c2.pkg=c2.pk.findIndex(z=>z[0]===it.pk);c2.variety='برتقال أبوسرة تلوين';c2.sm=J(SM);close(CIT.calcX(c2).ton,nb,1e-6,'تكلفة الطن عند R*')}});
t('twoWay/scenario: أقل سعر بيع والربح عند أقل سعر = صفر، والسيناريو فيه سطرين الفرزة والسوبرماركت',()=>{const D=BE.decFrom(null),cs=BE.costsFrom(null);cs.sm=J(SM);const tw=BE.twoWay(J(PINNED),cs,D);
 tw.modes.forEach(M=>{M.scen.forEach((s,i)=>{close(s.credit,s.cullCredit+s.smCredit,1e-9,'credit');close(s.egy,s.raw*s.k-s.credit+s.pkg+s.sup+s.wash,1e-9,'egy');assert.strictEqual(s.rows.length,15);
  const C=M.C,it=D.items[i];const q=BE.planBE(C,[Object.assign({},it,{p:s.minP})],[C.cap]);close(q.profitAt(s.raw),0,1e-6,'ربح صفر عند أقل سعر');
  s.rows.forEach(r=>{const q2=BE.planBE(C,[Object.assign({},it,{p:r.p})],[C.cap]);close(r.perShip,q2.profitAt(s.raw),1e-6,'±');close(r.perShip/(s.T),r.perTon,1e-6,'طن')})})})});
t('تحقق مستقل (من غير be-core): أقل سعر بيع وتعادل الخام و±7 من calc() الصوافي الأصلية + calcX التكاليف بالـ bisection',()=>{
 const D=BE.decFrom(null);const S0=J(PINNED);const cs=BE.costsFrom(null);cs.sm=J(SM);const tw=BE.twoWay(J(PINNED),cs,D);
 for(const M of tw.modes){D.items.forEach((it,i)=>{const C=M.C,x=BE.item(C,it),cartons=C.cap*it.cpp,T=cartons*x.w/1000;
  const nb=p=>{const S=J(S0);S.mode=M.m;S.lines=[[it.v,it.pk,cartons,p]];return SAW.calc(S).lines[0].nt*S.egp};      // صافي طن التصدير ج من الصوافي
  const cost=raw=>{const c=J(cs);c.net=T*1000;c.raw=raw;c.pkg=c.pk.findIndex(z=>z[0]===it.pk);c.pk[c.pkg][2]=x.w;c.variety='برتقال أبوسرة تلوين';c.usd=S0.egp;return CIT.calcX(c).ton};
  const bis=(f,a,b)=>{for(let k=0;k<200;k++){const m=(a+b)/2;if(f(a)*f(m)<=0)b=m;else a=m}return (a+b)/2};
  const minP=bis(p=>nb(p)-cost(10),1,80),R=bis(r=>nb(it.p)-cost(r),0,80);
  close(M.items[i].minP,minP,0.02,'أقل سعر '+M.m+' '+it.pk);close(M.scen[i].rows.find(r=>r.d===0).R,R,0.02,'تعادل الخام '+M.m+' '+it.pk);
  M.scen[i].rows.forEach(r=>close(r.perShip,(nb(r.p)-cost(10))*T,0.002*T*1000,'سيناريو '+r.d))})}});
t('مثال أمير الأصلي ما اتغيّرش لما السوبرماركت صفر: 17.08 / 15.77 و 16.07',()=>{const tw=BE.twoWay(J(PINNED),BE.costsFrom(null),BE.decFrom(null));const A=tw.base;
 assert.strictEqual(A.items[0].minP.toFixed(2),'17.08');assert.strictEqual(A.items[1].minP.toFixed(2),'15.77');assert.strictEqual(A.R.toFixed(2),'16.07')});
t('الاستيراد/التصدير: sm بيعدّي من ملف التصدير، والملف القديم من غير sm = صفر',()=>{const s=J(CIT.DEF);s.sm=J(SM);const c=BE.parseCostsImport(JSON.stringify({app:'citrus-costs',ver:2,S:s}));assert.deepStrictEqual(c.sm,s.sm);
 const o=BE.parseCostsImport(JSON.stringify({app:'citrus-costs',ver:2,S:J(CIT.DEF)}));assert.strictEqual(o.sm,undefined);assert.strictEqual(BE.smOf(o).on,false)});
console.log(n+' اختبار عدّوا');
