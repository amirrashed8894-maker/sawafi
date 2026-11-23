/* قرار شراء الخام: مطابقة calc() الأصلية للصوافي (core.js) وللتكاليف (costs-core.js) بالظبط + بحوث العمليات + الحالات الحدية */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const BE=require('../be-core.js');
const load=(file,extra)=>{const c={module:{exports:{}},console,localStorage:{getItem:()=>null},JSON};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8')+(extra||''),c);return c.module.exports};
const SAW=load('../core.js');const PINNED=load('../core.js',fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8'));
const CIT=load('../costs-core.js');const CDEF=load('../costs-core.js',';module.exports=JSON.parse(JSON.stringify(DEF))');
const close=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,msg+': '+a+' vs '+b);
let n=0;const t=(name,fn)=>{fn();n++;console.log('✓',name)};
const J=o=>JSON.parse(JSON.stringify(o));
function safi(){const S=J(PINNED);S.pk.forEach(p=>{if(/ 7 ك/.test(p[0]))p[1]=7});return S}
function costs(){const c=BE.costsFrom(null);c.pw=0;return c}
const dec=()=>BE.decFrom(null);
t('نسخة DEF التكاليف في be-core = costs-core.js بالظبط',()=>assert.deepStrictEqual(J(BE.COSTS_DEF),J(CDEF)));
t('أرقام أمير: حاوية أساسي، 21 باليت، الدولار 53.5، النولون 2,800$',()=>{assert.strictEqual(PINNED.mode,'حاوية');assert.strictEqual(PINNED.egp,53.5);assert.strictEqual(PINNED.fC,2800);assert.strictEqual(BE.DEC_DEF.cap['حاوية'],21);assert.strictEqual(BE.DEC_DEF.base,'حاوية')});
for(const mode of BE.MODES){
 t('صافي الطن = calc() الصوافي ('+mode+')',()=>{const S=safi();S.mode=mode;const C=BE.ctx(S,costs(),dec(),mode);const it=dec().items[0];const q=C.cap*it.cpp;S.lines=[[it.v,it.pk,q,it.p]];
  const nbSaw=SAW.calc(S).lines[0].nt*S.egp;const x=BE.item(C,it);close(x.rev-C.sharedE/(q*x.w/1000),nbSaw,1e-6,'صافي/طن')});
 t('R* داخل calc() التكاليف = صافي الطن ('+mode+')',()=>{const S=safi();const cs=costs();const C=BE.ctx(S,cs,dec(),mode);
  for(const it of dec().items){const p=BE.itemBE(C,it);S.mode=mode;S.lines=[[it.v,it.pk,C.cap*it.cpp,it.p]];const nb=SAW.calc(S).lines[0].nt*S.egp;
   const c2=J(CIT.DEF);c2.net=p.T*1000;c2.raw=p.R;c2.pw=0;c2.pkg=c2.pk.findIndex(z=>z[0]===it.pk);c2.variety='برتقال أبوسرة تلوين';close(CIT.calc(c2).ton,nb,1e-6,'تكلفة الطن عند R*')}});
}
t('مزيج أصناف = مطابق لمجموع السطور في calc() الصوافي',()=>{const S=safi();const cs=costs();const D=dec();const C=BE.ctx(S,cs,D,'حاوية');const n=[13,8];const p=BE.planBE(C,D.items,n);
 S.mode='حاوية';S.lines=D.items.map((it,i)=>[it.v,it.pk,n[i]*it.cpp,it.p]);const r=SAW.calc(S);const netE=r.netEgp;
 const costAtR=p.rows.reduce((a,x)=>a+x.t*(p.R*C.k-C.credit+x.pkg+C.sup+x.wash),0);close(costAtR,netE,1e-5,'تكلفة الشحنة عند R* = صافي الشحنة')});
t('سعر البيع العكسي',()=>{const C=BE.ctx(safi(),costs(),dec(),'حاوية');const it=dec().items[1];close(BE.priceForRaw(C,it,BE.itemBE(C,it).R),it.p,1e-9,'السعر')});
t('سيمبلكس',()=>{const r=BE.simplex([3,5],[[1,0],[0,2],[3,2]],[4,12,18]);close(r.z,36,1e-9,'z')});
t('الأمثل = أحسن توزيع صحيح (فحص بالقوة)',()=>{const C=BE.ctx(safi(),costs(),dec(),'حاوية');
 const items=[{v:'أبو سرة',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22},{v:'أبو سرة',pk:'كرتون مقفول 7 ك',cpp:154,p:18},{v:'أبو سرة',pk:'كرتون مقفول 15 ك',cpp:72,p:42,max:6}];
 const o=BE.optimize(C,items);let best=-1e9;for(let a=0;a<=21;a++)for(let c=0;c<=6&&a+c<=21;c++)best=Math.max(best,BE.planBE(C,items,[a,21-a-c,c]).R);
 assert.ok(o.R>=best-1e-9);close(o.Rint,best,1e-9,'صحيح');assert.strictEqual(o.ni.reduce((s,v)=>s+v,0),21)});
t('قيد نسبة المقاس',()=>{const C=BE.ctx(safi(),costs(),dec(),'حاوية');const items=[{v:'أبو سرة',sz:'24',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,share:40},{v:'أبو سرة',pk:'كرتون مقفول 7 ك',cpp:154,p:18}];
 const o=BE.optimize(C,items);const a=o.n[0]*0.98,b=o.n[1]*1.078;assert.ok(a<=0.4*(a+b)+1e-6)});
t('حالات حدية: فاضي/صفر/سالب',()=>{const C=BE.ctx(safi(),costs(),dec(),'حاوية');
 assert.strictEqual(BE.planBE(C,[],[]).R,null);assert.strictEqual(BE.item(C,{v:'أبو سرة',pk:'كرتون مقفول 7 ك',cpp:0,p:18}).ok,false);
 assert.strictEqual(BE.optimize(C,[{v:'x',pk:'كرتون مقفول 7 ك',cpp:'',p:''}]).status,'empty');
 const neg=BE.itemBE(C,{v:'أبو سرة',pk:'كرتون مقفول 7 ك',cpp:154,p:2});assert.ok(neg.R<0,'R سالب '+neg.R);
 const S0=safi();S0.sar=0;assert.strictEqual(BE.itemBE(BE.ctx(S0,costs(),dec(),'حاوية'),dec().items[0]).R,null);
 const o=BE.optimize(C,[{v:'أبو سرة',pk:'كرتون مقفول 7 ك',cpp:154,p:2}]);assert.strictEqual(o.status,'ok');assert.ok(o.R<0)});
t('تحميل التكاليف زي costs-app (برتقال ← 3 أصناف، sar افتراضي)',()=>{const c=BE.costsFrom({var:[['برتقال',2000],['ليمون',1500]],raw:12});assert.strictEqual(c.var.length,4);assert.strictEqual(c.var[0][0],'برتقال أبوسرة');assert.strictEqual(c.raw,12);assert.strictEqual(c.sar,3.75);assert.strictEqual(c.pk.length,6)});
t('استيراد التكاليف القديمة: JSON و COSTS1 ورفض الغلط',()=>{const S={raw:11,cullP:6,loss:0.01,cull:0.2,pw:0.005,pk:[['كرتون مقفول 7 ك',25,7]],sup:[['باليت',500]],var:[['ليمون',1700]]};
 assert.strictEqual(BE.parseCostsImport(JSON.stringify({app:'citrus-costs',S})).raw,11);
 assert.strictEqual(BE.parseCostsImport('COSTS1:'+Buffer.from(JSON.stringify({app:'citrus-costs',S}),'utf8').toString('base64')).cull,0.2);
 assert.strictEqual(BE.parseCostsImport(JSON.stringify({app:'sawafi',S})),null);assert.strictEqual(BE.parseCostsImport('كلام'),null)});
t('الغسيل حسب الصنف',()=>{const c=BE.costsFrom(null);assert.strictEqual(BE.washOf(c,'أبو سرة'),2500);assert.strictEqual(BE.washOf(c,'صيفي'),1800);assert.strictEqual(BE.washOf(c,'كلمنتينا'),1800);assert.strictEqual(BE.washOf(c,''),null)});
t('decFrom يقبل حفظ ناقص',()=>{const d=BE.decFrom({cap:{'حاوية':20},items:[]});assert.strictEqual(d.cap['براد'],23);assert.strictEqual(d.cap['حاوية'],20);assert.strictEqual(d.base,'حاوية')});
console.log(n+' اختبار عدّوا');
