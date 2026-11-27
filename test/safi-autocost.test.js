/* v2.4.0 — تكلفة الطن في الصوافي تلقائي من التكاليف حسب الصنف والعبوة، وقابلة للتعديل. */
const assert=require('assert');const CC=require('../costs-calc.js'),E=require('../costs-core.js'),A=require('../safi-autocost.js'),BE=require('../be-core.js');
const J=o=>JSON.parse(JSON.stringify(o));let n=0;const t=(m,f)=>{f();n++;console.log('✓',m)};
let seed=99;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;const pick=a=>a[Math.floor(R()*a.length)];
const base=J(E.DEF);E.ensureCostsCatalog(base);
const wrap=S=>JSON.stringify({ver:2,t:1,S});
/* اللي قسم التكاليف بيعرضه لصنف+عبوة: نختار الصنف (بسعر خامه) والعبوة في الصفحة → الرقم الكبير (calcMix = CALC في costs-app.js) */
function shown(S,varName,i){const s=J(S);s.variety=varName;s.raw=varName===S.variety?S.raw:S.rawBy[varName];s.pkg=i;s.mix=null;return E.calcMix(s).ton}
t('costs-calc.js = costs-core.js حرفيًا (نفس الكود ونفس النتيجة على 300 حالة عشوائية)',()=>{
 const fs=require('fs');assert.ok(fs.readFileSync(__dirname+'/../costs-calc.js','utf8').includes(fs.readFileSync(__dirname+'/../costs-core.js','utf8')),'generated from current costs-core.js — run python3 build.py');
 for(let k=0;k<300;k++){const s=J(base);s.raw=5+R()*12;s.cull=R()*0.3;s.loss=R()*0.04;s.pkg=Math.floor(R()*s.pk.length);s.variety=pick(s.var)[0];if(k%3==0)s.sm.p=R()*0.2;
  if(k%4==1)s.mix=E.defaultMix(s,[s.pkg,(s.pkg+1)%s.pk.length]);assert.strictEqual(CC.calcMix(J(s)).ton,E.calcMix(J(s)).ton)}});
t('مطابقة الصنف = نفس قاعدة القرار (BE.washOf) لكل الأصناف',()=>{const names=['أبو سرة','برتقال ابوسرة تلوين','صيفي','بلدي','ليمون','كلمنتينا','فريمونت','موركيت كيني','موركيت إسباني','يوسفي','أفندي','جريب فروت','مانجو','',' برتقال صيفي '];
 names.forEach(v=>{const r=A.varRow(base,v);assert.strictEqual(r?+r[1]:null,BE.washOf(base,v),v)})});
t('التكلفة التلقائية = الرقم اللي بيظهر في التكاليف لنفس الصنف والعبوة (500 حالة، صنف التكاليف وأصناف تانية بسعر خامها)',()=>{
 for(let k=0;k<500;k++){const S=J(base);S.raw=+(5+R()*12).toFixed(2);S.cull=+(R()*0.3).toFixed(3);S.loss=+(R()*0.04).toFixed(4);S.pw=pick([0,0.005,0.01]);S.net=pick([24000,23520,21000]);
  S.sup.forEach(x=>x[1]=Math.round(R()*600));S.var.forEach(v=>v[1]=Math.round(1000+R()*2000));if(k%3==0){S.sm.p=+(R()*0.2).toFixed(3);S.sm.price=+(6+R()*8).toFixed(2)}
  S.variety=pick(S.var)[0];S.rawBy={};S.var.forEach(v=>{if(R()<0.6)S.rawBy[v[0]]=+(4+R()*14).toFixed(2)});S.rawBy[S.variety]=S.raw;S.pkg=Math.floor(R()*S.pk.length);
  const C=A.loadCosts(wrap(S),null,CC);const v=pick(S.var)[0],i=Math.floor(R()*S.pk.length),x=A.costFor(C,v,S.pk[i][0],CC);
  if(v!==S.variety&&S.rawBy[v]==null){assert.strictEqual(x.miss,'raw');continue}
  const want=shown(S,v,i);assert.strictEqual(x.exact,want,'k'+k);assert.strictEqual(x.ton,Math.round(want*100)/100);assert.strictEqual(x.ton.toFixed(2),E.f(want).replace(/,/g,''))}});
t('خلطة عبوات في التكاليف: العبوة اللي في الخلطة = سطرها في «تكلفة كل عبوة في الخلطة»، والعبوة اللي برّه = «مقارنة العبوات»',()=>{
 const S=J(base);S.net=23520;S.variety='يوسفي';S.raw=8;const i5=S.pk.findIndex(p=>/5 ك ملوّن/.test(p[0]));S.mix=E.defaultMix(S,[0,i5]);const r=E.calcMix(S);
 const C=A.loadCosts(wrap(S),null,CC);const a=A.costFor(C,'يوسفي','صندوق بلاستيك 5 ك ملوّن',CC),b=A.costFor(C,'يوسفي','كرتون مقفول 14 ك',CC);
 assert.strictEqual(a.src,'mix');assert.strictEqual(a.exact,r.mix.rows.find(x=>x.i===i5).ton);assert.strictEqual(b.src,'cmp');assert.strictEqual(b.exact,r.cmp.find(x=>x.n==='كرتون مقفول 14 ك').v)});
t('مفيش تكاليف محفوظة / صنف مش في الجدول / عبوة مش في الجدول = مفيش تلقائي',()=>{assert.strictEqual(A.costFor(A.loadCosts(null,null,CC),'يوسفي','كرتون مقفول 7 ك',CC).miss,'costs');
 const C=A.loadCosts(wrap(base),null,CC);assert.strictEqual(A.costFor(C,'مانجو','كرتون مقفول 7 ك',CC).miss,'var');assert.strictEqual(A.costFor(C,'أبو سرة','صندوق بلاستيك 7 ك',CC).miss,'pk');
 assert.strictEqual(A.costFor(C,'يوسفي','كرتون مقفول 7 ك',CC).miss,'raw')});
/* سطور الصوافي */
const C0=(()=>{const S=J(base);S.variety='برتقال أبوسرة تلوين';S.raw=10;S.rawBy={'برتقال أبوسرة تلوين':10,'يوسفي':9};return A.loadCosts(wrap(S),null,CC)})();
const get=l=>A.costFor(C0,A.lineVar(l),l[1],CC);
t('سطور أمير (لقطة 27/11): يوسفي 5 ك ملوّن + أبوسرة مقفول 7 ك — التكلفة المكتوبة باليد تفضل يدوي، والسطر الجديد تلقائي',()=>{
 const L=[['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200,20886,{v:'يوسفي',s:''}],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',1694,18,11,154,19628],['أبو سرة مقاس 88','كرتون أوبن توب 7 ك',0,0,0,140,null,{v:'أبو سرة',s:'88'}]];
 assert.strictEqual(A.apply(L,get),true);assert.deepStrictEqual(L.map(l=>l[6]),[20886,19628,get(L[2]).ton]);assert.deepStrictEqual(L.map(l=>A.isAuto(l)),[false,false,true]);
 assert.strictEqual(A.apply(L,get),false,'مفيش تغيير تاني');
 // رجوع للتلقائي
 A.setAuto(L[0]);A.apply(L,get);assert.strictEqual(L[0][6],get(L[0]).ton);A.setAuto(L[1]);A.apply(L,get);assert.strictEqual(L[1][6],get(L[1]).ton);
 // تعديل باليد يكسب ويفضل بعد أي apply
 L[1][6]=21000;A.setManual(L[1]);for(let k=0;k<3;k++)A.apply(L,get);assert.strictEqual(L[1][6],21000);assert.strictEqual(A.isAuto(L[1]),false);
 // التعديل اليدوي بيفضل بعد الحفظ والفتح (JSON)
 const L2=J(L);A.apply(L2,get);assert.strictEqual(L2[1][6],21000);
 // تغيير المقاس مش بيلغي اليدوي (التكاليف مالهاش مقاس)، تغيير العبوة بيرجّع تلقائي
 L[1][0]='برتقال ابوسرة تلوين مقاس 72';A.apply(L,get);assert.strictEqual(L[1][6],21000);
 L[1][1]='كرتون أوبن توب 7 ك';A.apply(L,get);assert.strictEqual(A.isAuto(L[1]),true);assert.strictEqual(L[1][6],get(L[1]).ton);
 // تلقائي بيتحدث لما التكاليف تتغير
 const S2=J(base);S2.variety='يوسفي';S2.raw=11;S2.rawBy={'برتقال أبوسرة تلوين':10,'يوسفي':11};const C2=A.loadCosts(wrap(S2),null,CC);const get2=l=>A.costFor(C2,A.lineVar(l),l[1],CC);
 const before=L[0][6];assert.strictEqual(A.apply(L,get2),true);assert.ok(L[0][6]>before,'خام يوسفي 9→11');assert.strictEqual(L[0][6],get2(L[0]).ton)});
t('صنف مالوش تكلفة في التكاليف: يفضل يدوي زي النهارده (التكلفة اللي اتكتبت ما تتمسحش لما الصنف يتغير)',()=>{
 const L=[['مانجو','كرتون مقفول 7 ك',100,10,1,100,15000,{v:'مانجو',s:''},{m:'x'}]];A.apply(L,get);assert.strictEqual(L[0][6],15000);assert.strictEqual(A.isAuto(L[0]),false);
 const L3=[['مانجو','كرتون مقفول 7 ك',100,10,1,100,null,{v:'مانجو',s:''}]];A.apply(L3,get);assert.strictEqual(L3[0][6],null);
 // تلقائي على صنف اتغير لصنف مالوش تكلفة → الخانة تفضى (أدخل التكلفة) بدل رقم صنف تاني
 const L4=[['أبو سرة','كرتون مقفول 7 ك',100,10,1,100,null,{v:'أبو سرة',s:''}]];A.apply(L4,get);assert.ok(L4[0][6]>0);L4[0][7]={v:'مانجو',s:''};L4[0][0]='مانجو';A.apply(L4,get);assert.strictEqual(L4[0][6],null)});
console.log(n+' اختبار عدّوا');
