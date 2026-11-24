/* محلي سوبرماركت v2.2.0: جزء من الفرزة في صندوق بلاستيك بسعر أعلى شامل الصندوق.
   النسبة صفر (أو حفظ قديم من غير sm) = calc() الأصلية بالظبط؛ be-core = costs-core بالظبط؛ المثال المحسوب باليد؛ R* و twoWay متسقين. */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const BE=require('../be-core.js');
const load=(file,extra)=>{const c={module:{exports:{}},console,localStorage:{getItem:()=>null},JSON};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8')+(extra||''),c);return c.module.exports};
const SAW=load('../core.js');const PINNED=load('../core.js',fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8'));
const CIT=load('../costs-core.js');
const close=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,msg+': '+a+' vs '+b);
let n=0;const t=(name,fn)=>{fn();n++;console.log('✓',name)};
const J=o=>JSON.parse(JSON.stringify(o));
const SM={p:0.5,price:12,basis:'kg',box:0,oth:0,sizes:'100، 113',bx:[['صندوق جامبو 15 كجم',18,15,1.2],['صندوق بلاستيك 8 كجم',13.5,7.5,0.8]]};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
function randCosts(){const c=J(CIT.DEF);c.net=5000+Math.round(rnd()*25000);c.raw=+(rnd()*30).toFixed(2);c.cullP=+(rnd()*12).toFixed(2);c.loss=+(rnd()*0.1).toFixed(4);c.cull=+(rnd()*0.5).toFixed(4);c.pw=+(rnd()*0.03).toFixed(4);c.pkg=Math.floor(rnd()*c.pk.length);c.usd=40+rnd()*20;return c}

t('كود السوبرماركت في be-core.js نسخة حرفية من costs-core.js',()=>{const a=fs.readFileSync(path.join(__dirname,'../costs-core.js'),'utf8'),b=fs.readFileSync(path.join(__dirname,'../be-core.js'),'utf8');
 const cut=(s,end)=>{const i=s.indexOf('const SM_DEF=');assert.ok(i>0);return s.slice(i,s.indexOf(end,i)).trim()};assert.strictEqual(cut(b,'/* سياق الحساب'),cut(a,'function calcX('))});
t('calc() الأصلية ما اتغيّرتش (ORIG-BEGIN..END زي orig_core_lines.txt)',()=>{const src=fs.readFileSync(path.join(__dirname,'../costs-core.js'),'utf8');const blk=src.split('/*ORIG-BEGIN*/\n')[1].split('\n/*ORIG-END*/')[0];
 const ref=fs.readFileSync(path.join(__dirname,'costs/orig_core_lines.txt'),'utf8');ref.split('\n').filter(l=>l.trim()&&!/^const DEF=|^pk:|^sup:|^var:/.test(l)).forEach(l=>assert.ok(blk.includes(l.trim()),'سطر ناقص: '+l.slice(0,60)))});
t('حفظ قديم من غير sm / النسبة صفر / sm بايظ = calc() بالظبط (300 حالة)',()=>{for(let i=0;i<300;i++){const c=randCosts();const base=J(CIT.calc(J(c)));
  for(const sm of [undefined,{p:0},J(Object.assign({},SM,{p:0})),'x',null]){const s=J(c);if(sm!==undefined)s.sm=sm;const r=CIT.calcX(s);const rr=J(r);delete rr.sm;assert.deepStrictEqual(rr,base)}}});
t('مثال: 50% من الفرزة، جامبو 15 كجم (18 ج، وزنه 1.2 كجم)، 12 ج/كجم قائم ← 420 ج/طن',()=>{const s=J(CIT.DEF);s.sm=J(SM);const r=CIT.calcX(s),x=r.sm;
 close(x.cullT,1000*0.15/0.85,1e-9,'فرزة/طن');close(x.kgT,88.2352941,1e-6,'كجم سوبرماركت/طن');close(x.perKg,12*16.2/15-18/15,1e-9,'الكيلو بعد الصندوق');close(x.gain,(11.76-7)*88.2352941,1e-5,'الزيادة');close(x.gain,420,1e-9,'420');
 close(r.ton,CIT.calc(J(CIT.DEF)).ton-420,1e-9,'تكلفة الطن');close(r.smKg,2117.647059,1e-5,'كجم/حاوية');close(r.smBoxes,141.1764706,1e-6,'صناديق');close(r.smGross,141.1764706*16.2,1e-5,'قائم');
 close(r.cullLeftKg+r.smKg,r.cullKg,1e-9,'الفرزة كلها');close(r.cont,r.ton*24,1e-6,'حاوية');const c0=CIT.calc(J(CIT.DEF));r.cmp.forEach((c,i)=>{close(c.v,c0.cmp[i].v-420,1e-9,'مقارنة');close(c.d,c0.cmp[i].d,1e-9,'فرق')})});
t('بالصندوق: 180 ج/صندوق (وزن الصندوق مالوش دخل في الإيراد)',()=>{const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{basis:'box',price:180});const x=CIT.calcX(s).sm;close(x.perKg,(180-18)/15,1e-9,'الكيلو');close(x.gain,((180-18)/15-7)*x.kgT,1e-9,'الزيادة');
 s.sm.bx[0][3]=5;close(CIT.calcX(s).sm.gain,x.gain,1e-9,'وزن الصندوق مش مؤثر بالصندوق')});
t('وزن الصندوق في السعر بالكيلو القائم: كل 1 كجم وزن = سعر × عدد الصناديق',()=>{const s=J(CIT.DEF);s.sm=J(SM);const a=CIT.calcX(J(s)).sm;s.sm.bx[0][3]=2.2;const b=CIT.calcX(s).sm;close(b.gain-a.gain,12*a.boxes,1e-9,'فرق الوزن')});
t('مصاريف تانية للصندوق ونوع الصندوق التاني والنسبة 100%',()=>{const s=J(CIT.DEF);s.sm=Object.assign(J(SM),{oth:2,box:1,p:1});const r=CIT.calcX(s),x=r.sm;assert.strictEqual(x.name,'صندوق بلاستيك 8 كجم');
 close(x.perKg,(12*8.3-15.5)/7.5,1e-9,'الكيلو');close(r.cullLeftKg,0,1e-9,'مفيش فرزة باقية');close(r.cullSale,0,1e-9,'قيمة الفرزة الباقية')});
t('sm بايظ أو ناقص: من غير NaN (صندوق مش موجود، bx فاضي، أرقام نص)',()=>{for(const sm of [{p:0.4,box:9},{p:0.4,bx:[]},{p:'0.2',price:'15',bx:[['x','3','10','1']]},{p:0.4,basis:'zz'},{p:0.4,bx:[['x',3,0,1]]},{p:-1},{p:7}]){const s=J(CIT.DEF);s.sm=sm;const r=CIT.calcX(s);
  assert.ok(isFinite(r.ton),JSON.stringify(sm));const b=BE.ctx(J(PINNED),BE.costsFrom(s),BE.decFrom(null),'حاوية');assert.ok(isFinite(b.credit))}});
t('be-core: الخصم = الفرزة + زيادة السوبرماركت = calcX (300 حالة)',()=>{for(let i=0;i<300;i++){const c=randCosts();c.sm=Object.assign(J(SM),{p:+(rnd()).toFixed(3),price:+(rnd()*25).toFixed(2),basis:rnd()<0.5?'kg':'box',box:Math.floor(rnd()*2),oth:+(rnd()*3).toFixed(2)});if(c.sm.basis==='box')c.sm.price*=12;
  const r=CIT.calcX(J(c)),r0=CIT.calc(J(c)),C=BE.ctx(J(PINNED),BE.costsFrom(J(c)),BE.decFrom(null),'حاوية');const T=c.net/1000;
  close(C.cullCredit,r0.cullSale/T,1e-6,'الفرزة');close(C.smGain,r.sm.gain,1e-9,'الزيادة');close(r0.ton-r.ton,C.smGain,1e-6,'التكلفة')}});
for(const mode of BE.MODES)t('R* مع السوبرماركت داخل calcX التكاليف = صافي الطن ('+mode+')',()=>{const S=J(PINNED);S.pk.forEach(p=>{if(/ 7 ك/.test(p[0]))p[1]=7});const cs=BE.costsFrom(null);cs.pw=0;cs.sm=J(SM);const D=BE.decFrom(null);const C=BE.ctx(S,cs,D,mode);
 for(const it of D.items){const p=BE.itemBE(C,it);S.mode=mode;S.lines=[[it.v,it.pk,C.cap*it.cpp,it.p]];const nb=SAW.calc(S).lines[0].nt*S.egp;
  const c2=J(CIT.DEF);c2.net=p.T*1000;c2.raw=p.R;c2.pw=0;c2.pkg=c2.pk.findIndex(z=>z[0]===it.pk);c2.variety='برتقال أبوسرة تلوين';c2.sm=J(SM);close(CIT.calcX(c2).ton,nb,1e-6,'تكلفة الطن عند R*')}});
t('twoWay/scenario: السوبرماركت بيرفع تعادل الخام ويقلل أقل سعر بيع، والسيناريو بيطلع السطرين',()=>{const D=BE.decFrom(null),cs0=BE.costsFrom(null),cs=BE.costsFrom(null);cs.sm=J(SM);
 const a=BE.twoWay(J(PINNED),cs0,D),b=BE.twoWay(J(PINNED),cs,D);a.modes.forEach((M,j)=>{const N=b.modes[j];
  close(N.R-M.R,420/M.C.k,1e-9,'تعادل الخام + 420/k');M.items.forEach((x,i)=>assert.ok(N.items[i].minP<x.minP));const s=N.scen[0];close(s.credit,s.cullCredit+s.smGain,1e-9,'credit');close(s.smGain,420,1e-9,'smGain');close(s.egy,M.scen[0].egy-420,1e-9,'تكاليف مصر');
  assert.strictEqual(M.scen[0].smGain,0)})});
t('مثال أمير الأصلي ما اتغيّرش لما السوبرماركت صفر: 17.08 / 15.77 و 16.07',()=>{const tw=BE.twoWay(J(PINNED),BE.costsFrom(null),BE.decFrom(null));const A=tw.base;
 assert.strictEqual(A.items[0].minP.toFixed(2),'17.08');assert.strictEqual(A.items[1].minP.toFixed(2),'15.77');assert.strictEqual(A.R.toFixed(2),'16.07')});
t('الاستيراد/التصدير: sm بيعدّي من ملف التصدير، والملف القديم من غير sm = صفر',()=>{const s=J(CIT.DEF);s.sm=J(SM);const c=BE.parseCostsImport(JSON.stringify({app:'citrus-costs',ver:2,S:s}));assert.deepStrictEqual(c.sm,s.sm);
 const o=BE.parseCostsImport(JSON.stringify({app:'citrus-costs',ver:2,S:J(CIT.DEF)}));assert.strictEqual(o.sm,undefined);assert.strictEqual(BE.smOf(o).on,false)});
console.log(n+' اختبار عدّوا');
