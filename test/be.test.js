/* اختبار سعر التعادل للخام: مطابقة معادلات برنامج تكاليف الموالح (calc) والصوافي (calc) الأصلية بالظبط */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const BE=require('../be-core.js');
const load=(file,extra)=>{const c={module:{exports:{}},console,localStorage:{getItem:()=>null}};vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8')+(extra||''),c);return c.module.exports};
const SAW=load(path.join(__dirname,'../core.js'));
const CIT_PATH=process.env.CITRUS||path.join(__dirname,'../../citrus-costs/core.js');
const CIT=fs.existsSync(CIT_PATH)?load(CIT_PATH):null;
const close=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,msg+': '+a+' vs '+b);
let n=0;const t=(name,fn)=>{fn();n++;console.log('✓',name)};
function baseS(){const S=JSON.parse(JSON.stringify(SAW.DEF));S.sar=3.7567;S.egp=53;S.client='فاكهة الصيف';S.fB=15000;S.fC=2500;
 S.pk.forEach(p=>{if(/ 7 ك/.test(p[0]))p[1]=7});
 S.exp=[['مصروفات البراد في السعودية (إجمالي)',6500,0]].concat(S.exp.map(e=>[e[0],0,e[2]]));
 S.rb=JSON.parse(JSON.stringify(BE.RB_DEF));S.rb.pw=0;return S}
for(const mode of BE.MODES){
 t('netback = calc() الصوافي ('+mode+')',()=>{const S=baseS();S.mode=mode;const C=BE.ctx(S,mode);const it=S.rb.items[0];
  const q=C.cap*it.cpp;S.lines=[[it.v,it.pk,q,it.p]];const r=SAW.calc(S);const nbSaw=r.lines[0].nt*S.egp;
  const x=BE.item(C,it),T=q*x.w/1000;const nbMine=x.rev-C.sharedE/T;close(nbMine,nbSaw,1e-6,'netback/طن')});
 if(CIT)t('R* داخل calc() تكاليف الموالح = صافي الطن ('+mode+')',()=>{const S=baseS();const C=BE.ctx(S,mode);const it=S.rb.items[0];
  const p=BE.itemBE(C,it);const T=p.T;S.lines=[[it.v,it.pk,C.cap*it.cpp,it.p]];S.mode=mode;const nb=SAW.calc(S).lines[0].nt*S.egp;
  const cs=JSON.parse(JSON.stringify(CIT.DEF));cs.net=T*1000;cs.raw=p.R;cs.cullP=S.rb.cullP;cs.loss=S.rb.loss/100;cs.cull=S.rb.cull/100;cs.pw=0;
  cs.pkg=cs.pk.findIndex(z=>z[0]===it.pk);cs.variety='برتقال أبوسرة تلوين';const cr=CIT.calc(cs);
  close(cr.ton,nb,1e-6,'تكلفة الطن عند R* = صافي الطن');assert.ok(p.R>0)});
}
t('الحاوية أساسي والبراد مقارنة في الافتراضي',()=>{assert.strictEqual(BE.RB_DEF.base,'حاوية');assert.strictEqual(BE.MODES[0],'حاوية')});
t('سعر البيع العكسي يرجّع نفس الخام',()=>{const S=baseS();const C=BE.ctx(S,'حاوية');const it=S.rb.items[1];const R=BE.itemBE(C,it).R;close(BE.priceForRaw(C,it,R),it.p,1e-9,'السعر')});
t('سيمبلكس: مسألة معروفة',()=>{const r=BE.simplex([3,5],[[1,0],[0,2],[3,2]],[4,12,18]);close(r.x[0],2,1e-9,'x1');close(r.x[1],6,1e-9,'x2');close(r.z,36,1e-9,'z')});
t('الأمثل ≥ أي خطة (فحص بالقوة على كل التوزيعات الصحيحة)',()=>{const S=baseS();const C=BE.ctx(S,'حاوية');
 const items=[{v:'أبو سرة',sz:'72',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,max:''},{v:'أبو سرة',sz:'48',pk:'كرتون مقفول 7 ك',cpp:154,p:18,max:''},{v:'أبو سرة',sz:'56',pk:'كرتون مقفول 15 ك',cpp:72,p:42,max:6}];
 const o=BE.optimize(C,items);assert.strictEqual(o.status,'ok');let best=-1e9;
 for(let a=0;a<=20;a++)for(let c=0;c<=6&&a+c<=20;c++){const R=BE.planBE(C,items,[a,20-a-c,c]).R;if(R>best)best=R}
 assert.ok(o.R>=best-1e-9,'LP '+o.R+' best '+best);close(o.Rint,best,1e-9,'التقريب الصحيح');assert.ok(o.ni.reduce((s,v)=>s+v,0)===20)});
t('قيد نسبة المقاس من الفرز',()=>{const S=baseS();const C=BE.ctx(S,'حاوية');
 const items=[{v:'أبو سرة',sz:'72',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,share:40},{v:'أبو سرة',sz:'48',pk:'كرتون مقفول 7 ك',cpp:154,p:18}];
 const o=BE.optimize(C,items);const t0=o.n[0]*140*7/1000,t1=o.n[1]*154*7/1000;assert.ok(t0<=0.4*(t0+t1)+1e-6,'نسبة '+t0/(t0+t1))});
t('لصق التكاليف COSTS1 من برنامج التكاليف',()=>{const o={app:'citrus-costs',S:{raw:11,cullP:6,loss:0.01,cull:0.2,pw:0.005,pk:[['كرتون مقفول 7 ك',25,7]],sup:[['باليت',500]],var:[['ليمون',1700]]}};
 const b64=Buffer.from(JSON.stringify(o),'utf8').toString('base64');const r=BE.parseCosts('من برنامج التكاليف\nCOSTS1:'+b64);
 assert.strictEqual(r.cull,20);assert.strictEqual(r.pkp[0][1],25);assert.strictEqual(r.wash[0][0],'ليمون');assert.strictEqual(BE.parseCosts('كلام'),null)});
t('الغسيل حسب الصنف',()=>{const rb=BE.RB_DEF;assert.strictEqual(BE.washOf(rb,'أبو سرة'),2500);assert.strictEqual(BE.washOf(rb,'صيفي'),1800);assert.strictEqual(BE.washOf(rb,'كلمنتينا'),1800)});
t('calc() الأصلية ما اتغيرتش مع S.rb',()=>{const S=baseS();const a=JSON.stringify(SAW.calc(S));delete S.rb;assert.strictEqual(JSON.stringify(SAW.calc(S)),a)});
console.log(n+' اختبار عدّوا'+(CIT?'':' (من غير مطابقة تكاليف الموالح — core.js مش موجود)'));
