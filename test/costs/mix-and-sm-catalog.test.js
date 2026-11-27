const assert=require('assert');
const E=require('../../costs-core.js');
const close=(a,b,e,m)=>assert.ok(Math.abs(a-b)<(e||1e-9),m+' got '+a+' expected '+b);
let ok=true;const log=(c,m)=>{if(!c){ok=false;console.error('FAIL',m)}else console.log('ok',m)};

const J=x=>JSON.parse(JSON.stringify(x));
const s0=J(E.DEF);
log(s0.pk.length===6,'DEF.pk ما زالت 6');
log(E.SM_DEF.bx.length===2 && E.SM_DEF.bx[0][0]==='صندوق جامبو 15 كجم','SM_DEF نفسها جامبو و8 ك بس');
const ch=E.ensureCostsCatalog(s0);
log(!!ch && s0.pk.length===8,'ensure بيضيف عبوات التكاليف');
const bx=s0.sm&&s0.sm.bx||[];
const b5=bx.find(b=>b[0]==='صندوق بلاستيك 5 ك ملوّن');
const b25=bx.find(b=>b[0]==='صندوق بلاستيك 2.5 ك ملوّن');
log(!!b5 && b5[1]===13 && b5[2]===5 && b5[3]===0,'سوبرماركت 5 ك ملوّن 13ج / 5ك / وزن فاضي 0');
log(!!b25 && b25[1]===11 && b25[2]===2.5 && b25[3]===0,'سوبرماركت 2.5 ك ملوّن 11ج / 2.5ك / وزن فاضي 0');
log(bx.some(b=>b[0]==='صندوق جامبو 15 كجم' && b[1]===18 && b[3]===0.65),'جامبو السوبرماركت ما اتلمسش');
log(bx.some(b=>b[0]==='صندوق بلاستيك 8 كجم' && b[1]===13.5),'بلاستيك 8 ك سوبرماركت ما اتلمسش');
log(E.ensureCostsCatalog(s0)===false,'ensure مش بيكرّر صناديق السوبرماركت');

const saved=J(E.DEF);
saved.pk[0][1]=99;
saved.sm={p:0,price:12,basis:'kg',box:0,oth:0,sizes:'100-113',bx:[['صندوق جامبو 15 كجم',18,15,0.65],['صندوق بلاستيك 8 كجم',13.5,7.5,0.8]]};
E.ensureCostsCatalog(saved);
log(saved.pk[0][1]===99,'سعر كرتون محفوظ ما اتلمسش');
log(saved.sm.bx[0][3]===0.65 && saved.sm.bx.length>=4,'بيانات السوبرماركت المحفوظة فضلت + العبوتين الجديدتين');

// single pack: calcMix === calcX for every pack, with and without leftover sm
E.ensureCostsCatalog(s0);
for(let i=0;i<s0.pk.length;i++){
  const s=J(s0);s.pkg=i;delete s.mix;
  const a=E.calcX(s),b=E.calcMix(s);
  log(a.ton===b.ton && a.pkgC===b.pkgC && a.kg===b.kg && a.cont===b.cont && a.packed===b.packed && a.bought===b.bought && !b.mix,
    'عبوة واحدة idx '+i+' = calcX بالظبط ('+s.pk[i][0]+')');
}

// mix of one row should also be ignored
const s1=J(s0);s1.pkg=0;s1.mix=[{i:0,pal:24,net:24000}];
log(!E.mixList(s1) && E.calcMix(s1).ton===E.calcX(s1).ton,'خلطة صف واحد بتتجاهل وتساوي calcX');

// 12 pal 5ك + 12 pal 2.5ك = 24 طن
const i5=s0.pk.findIndex(p=>p[0]==='صندوق بلاستيك 5 ك ملوّن');
const i25=s0.pk.findIndex(p=>p[0]==='صندوق بلاستيك 2.5 ك ملوّن');
const smx=J(s0);smx.variety='يوسفي';smx.pkg=i5;smx.mix=[{i:i5,pal:12,net:12000},{i:i25,pal:12,net:12000}];
const r=E.calcMix(smx),r5=E.calcX(Object.assign(J(s0),{variety:'يوسفي',pkg:i5})),r25=E.calcX(Object.assign(J(s0),{variety:'يوسفي',pkg:i25}));
log(r.mix && r.mix.rows.length===2 && r.mix.totPal===24 && r.mix.totNet===24000,'الخلطة 12+12 باليت = 24 طن');
close(r.mix.rows[0].pct,50,1e-9,'حصة 50%');
close(r.mix.rows[1].pct,50,1e-9,'حصة 50%');
// slice costs
const sl5=E.packSlice(smx,s0.pk[i5],12000),sl25=E.packSlice(smx,s0.pk[i25],12000);
close(r.mix.rows[0].ton, r5.rawT+sl5.pkgC+r5.supT+r5.wash, 1e-9, 'طن عبوة 5ك من حصتها');
close(r.mix.rows[1].ton, r25.rawT+sl25.pkgC+r25.supT+r25.wash, 1e-9, 'طن عبوة 2.5ك من حصتها');
close(r.pkgC, (sl5.pkgC*12+sl25.pkgC*12)/24, 1e-9, 'عبوة مرجّحة');
close(r.ton, r.rawT+r.pkgC+r.supT+r.wash, 1e-9, 'طن مرجّح = خام+عبوة+مستلزمات+غسيل');
close(r.kg, r.ton/1000, 1e-12, 'كيلو');
close(r.cont, r.ton*24, 1e-9, 'حاوية');
log(r.rawT===r5.rawT && r.supT===r5.supT && r.wash===r5.wash,'الخام والمستلزمات والغسيل زي عبوة واحدة');
log(r.ton!==r5.ton && r.ton!==r25.ton,'الخلطة مختلفة عن كل عبوة لوحدها');

// default mix equal split
const d=E.defaultMix(smx,[i5,i25]);
log(d[0].pal===12 && d[1].pal===12 && d[0].net+d[1].net===24000,'التقسيم الافتراضي 12 و 12 باليت');

// + carton 7ك من غير عدد باليت: حصّة بالطن
const i7=0; // كرتون مقفول 7 ك
const d3=E.defaultMix(smx,[i5,i25,i7]);
log(d3.length===3 && d3[2].i===0,'ثلاث عبوات فيها الكرتون');
const s3=J(smx);s3.mix=d3;
const r3=E.calcMix(s3);
log(r3.mix.rows.length===3 && r3.rawT===r5.rawT,'ثلاث عبوات: الخام ثابت');
close(r3.mix.rows.reduce((a,x)=>a+x.net,0), d3.reduce((a,x)=>a+x.net,0), 1e-6, 'مجموع الحصص');

// leftover saved prices in comparison unchanged
const rOld=E.calc(Object.assign(J(E.DEF),{pkg:0}));
const rNew=E.calc(Object.assign(J(s0),{pkg:0,mix:undefined}));
log(rOld.pkgC===rNew.pkgC && rOld.ton===rNew.ton,'حساب الكرتون 7ك بعد الإضافة زي الأول');

console.log(ok?'ALL PASS':'FAILED');
process.exit(ok?0:1);
