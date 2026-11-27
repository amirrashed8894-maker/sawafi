/* يولّد costs-calc.js: محرك حساب التكاليف (costs-core.js) حرفيًا جوه دالة مقفولة، عشان صفحة الصوافي تحسب تكلفة الطن
   بنفس الكود بالظبط اللي بيعرض الرقم في قسم التكاليف — core.js و costs-core.js الاتنين فيهم const DEF/calc ومينفعش يتحمّلوا مكشوفين في نفس الصفحة. */
const fs=require('fs'),path=require('path');const d=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(d,'costs-core.js'),'utf8');
const out='/* مولّد تلقائي من costs-core.js (tools/gen-costs-calc.js) — متعدلوش باليد */\nvar COSTS_CALC=(function(module){\n'+src+'\nreturn CORE})(undefined);\nif(typeof module!==\'undefined\')module.exports=COSTS_CALC;\n';
fs.writeFileSync(path.join(d,'costs-calc.js'),out);console.log('costs-calc.js',out.length);
