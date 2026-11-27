/* مراجعة t198 (27/11/2026): الخلطة المرجّحة + توزيع الخلطة الافتراضي + الدولار الموحّد في كل قسم (nav.js). */
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const E=require('../costs-core.js');const J=o=>JSON.parse(JSON.stringify(o));let n=0;const t=(m,f)=>{f();n++;console.log('✓',m)};
const close=(a,b,e,m)=>assert.ok(Math.abs(a-b)<=(e||1e-9),m+': '+a+' vs '+b);
const base=J(E.DEF);E.ensureCostsCatalog(base);const i5=base.pk.findIndex(p=>/5 ك ملوّن/.test(p[0])),i25=base.pk.findIndex(p=>/2\.5 ك ملوّن/.test(p[0]));
const wavg=r=>r.mix.rows.reduce((a,x)=>a+x.ton*x.net,0)/r.mix.totNet;
t('مثال المراجعة: 23,520 كجم، 7 ك + 5 ك ملوّن — الموزّع = الحاوية والإجمالي = متوسط السطور',()=>{const s=J(base);s.net=23520;s.pkg=0;s.mix=E.defaultMix(s,[0,i5]);const r=E.calcMix(s);
 assert.strictEqual(r.mix.totNet,23520);assert.deepStrictEqual(s.mix.map(x=>x.net),[11520,12000]);close(r.ton,wavg(r),1e-9,'مرجّح')});
t('الموزّع مختلف عن الحاوية (المستخدم كتب باليتات): الإجمالي المرجّح = متوسط السطور (كان 17,571.35 والصح 17,541.20)',()=>{const s=J(base);s.net=23520;s.pkg=0;s.mix=[{i:0,pal:0,net:11760},{i:i5,pal:12,net:12000}];const r=E.calcMix(s);
 close(r.ton,wavg(r),1e-9,'مرجّح');assert.strictEqual(r.ton.toFixed(2),'17541.20')});
t('400 خلطة عشوائية: الإجمالي = متوسط السطور المرجّح، وعبوة واحدة = calcX بالظبط',()=>{let seed=7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let k=0;k<400;k++){const s=J(base);s.net=10000+Math.round(R()*16000);s.raw=5+R()*10;s.cull=R()*0.3;s.loss=R()*0.03;if(k%3==0)s.sm.p=R()*0.2;
  const a=Math.floor(R()*s.pk.length),b=(a+1+Math.floor(R()*(s.pk.length-1)))%s.pk.length;s.pkg=a;
  s.mix=k%2?E.defaultMix(s,[a,b]):[{i:a,pal:0,net:Math.round(s.net*R())},{i:b,pal:0,net:Math.round(s.net*R())+1}];const r=E.calcMix(s);if(r.mix)close(r.ton,wavg(r),1e-6,'k'+k);
  const s1=J(s);s1.mix=null;assert.strictEqual(E.calcMix(s1).ton,E.calcX(s1).ton)}});
t('الخلطة الافتراضية: لو فيه عبوة من غير صناديق/باليت الموزّع = الحاوية بالظبط؛ وعبوات كلها بالباليت زي الأول',()=>{for(const net of [24000,23520,21000,12805]){
  const s=J(base);s.net=net;const a=E.defaultMix(s,[0,i5]),b=E.defaultMix(s,[i5,0]),c=E.defaultMix(s,[0,3,i25]);[a,b,c].forEach(m=>close(m.reduce((x,r)=>x+r.net,0),net,1e-6,'موزّع '+net));
  const d=E.defaultMix(s,[i5,i25]);d.forEach(r=>assert.strictEqual(r.net,r.pal*1000))}});
/* ---------- الدولار الموحّد (nav.js) ---------- */
function runNav(store,page){const ls={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)}};const w={localStorage:ls,addEventListener(){}};
 const ctx={window:w,localStorage:ls,document:{getElementById:()=>null,addEventListener(){},querySelector:()=>null},location:{pathname:'/'+page}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../nav.js'),'utf8'),ctx);return {store,seed:w.__fxSeed}}
const sv=(egp)=>JSON.stringify({ver:2,t:1,S:{egp,lines:[]}}),cv=usd=>JSON.stringify({ver:2,t:1,S:{usd,pk:[],sup:[]}});
const egp=st=>JSON.parse(st['safiNetback.v2']).S.egp,usd=st=>JSON.parse(st['citrusCosts.v2']).S.usd;
t('ثوابت nav.js = DEF التكاليف (52) والمدخلات الرئيسية للصوافي (53.5)',()=>{assert.strictEqual(E.DEF.usd,52);const c={module:{exports:{}},JSON};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../core.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../pinned.js'),'utf8'),c);assert.strictEqual(c.module.exports.egp,53.5)});
t('تعديل الدولار في التكاليف بيوصل للصوافي من غير ما تفتح الرئيسية',()=>{const st={'safiNetback.v2':sv(53.5),'citrusCosts.v2':cv(55),'fx.v1':JSON.stringify({v:53.5,safi:53.5,costs:53.5})};runNav(st,'safi.html');
 assert.strictEqual(egp(st),55);assert.strictEqual(JSON.parse(st['safiNetback.v2.mirror']).S.egp,55);assert.strictEqual(usd(st),55);assert.strictEqual(JSON.parse(st['fx.v1']).v,55)});
t('تعديل الدولار في الصوافي بيوصل للتكاليف',()=>{const st={'safiNetback.v2':sv(56),'citrusCosts.v2':cv(55),'fx.v1':JSON.stringify({v:55,safi:55,costs:55})};runNav(st,'costs.html');assert.strictEqual(usd(st),56)});
t('مفيش تغيير = مفيش كتابة (نفس t)',()=>{const st={'safiNetback.v2':sv(55),'citrusCosts.v2':cv(55),'fx.v1':JSON.stringify({v:55,safi:55,costs:55})};const a=st['safiNetback.v2'],b=st['citrusCosts.v2'];runNav(st,'index.html');assert.strictEqual(st['safiNetback.v2'],a);assert.strictEqual(st['citrusCosts.v2'],b)});
t('جهاز جديد: التكاليف لوحدها اتحفظت بـ 54.25 → الصوافي تاخد 54.25 أول ما تفتح، والرئيسية ما ترجعهاش 53.5',()=>{const st={'citrusCosts.v2':cv(54.25)};const r=runNav(st,'safi.html');
 assert.strictEqual(r.seed.safi,54.25);const F=JSON.parse(st['fx.v1']);assert.deepStrictEqual([F.v,F.safi,F.costs],[54.25,53.5,54.25]);
 /* نفس منطق syncFx في decision.js: الصوافي من غير حفظ = 53.5 = F.safi فمش متغيّرة، والتكاليف = F.costs → الدولار يفضل 54.25 */
 const sCh=53.5!==F.safi,cCh=54.25!==F.costs;assert.strictEqual(sCh?53.5:cCh?54.25:F.v,54.25)});
t('جهاز جديد خالص: صفحة التكاليف تفتح على 53.5 مش 52',()=>{const st={};const r=runNav(st,'costs.html');assert.strictEqual(r.seed.costs,53.5);assert.strictEqual(r.seed.safi,null)});
t('بيانات تانية في الحفظ ما بتتلمسش',()=>{const st={'safiNetback.v2':JSON.stringify({ver:2,t:1,S:{egp:53.5,lines:[['a','b',1,2]],x:{y:1}}}),'citrusCosts.v2':cv(57),'fx.v1':JSON.stringify({v:53.5,safi:53.5,costs:53.5})};runNav(st,'safi.html');
 const S=JSON.parse(st['safiNetback.v2']).S;assert.deepStrictEqual(S,{egp:57,lines:[['a','b',1,2]],x:{y:1}})});
console.log(n+' اختبار عدّوا');
