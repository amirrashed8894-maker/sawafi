/* الصوافي v2.4.0 — «تكلفة الطن هنا» بتتسجل تلقائي من قسم التكاليف حسب الصنف والعبوة، وتفضل قابلة للتعديل (طلب أمير 27/11/2026).
   المصدر: نفس بيانات قسم التكاليف (citrusCosts.v2) ونفس كود الحساب حرفيًا (costs-calc.js = costs-core.js جوه دالة مقفولة)،
   فالرقم = «تكلفة الطن الصافي ظهر الحاوية» اللي بتظهر في التكاليف لنفس الصنف والعبوة (ج/طن صافي — نفس أساس «ربح/خسارة للطن» في الصوافي).
   - الصنف: بيتطابق مع جدول الغسيل في التكاليف بنفس قاعدة القرار (BE.washOf) — مثلاً «أبو سرة» = «برتقال أبوسرة تلوين»، «كلمنتينا» = «يوسفي».
   - سعر الخام: الصنف المختار في التكاليف = سعر الخام المكتوب هناك؛ أي صنف تاني = آخر سعر خام اتكتب له في التكاليف (rawBy). لو الصنف عمره ما اتحسب هناك = مفيش تلقائي.
   - العبوة: من جدول عبوات التكاليف بالاسم. لو العبوة داخلة في خلطة الصنف المختار هناك، الرقم = سطرها في «تكلفة كل عبوة في الخلطة»، وإلا = «مقارنة العبوات».
   سطر البيع: l[6] = التكلفة (زي ما هي، كل الحسابات والتقارير بتقراها)، l[8] = {a:1} تلقائي أو {m:مفتاح} يدوي للصنف|العبوة اللي اتكتبت لهم.
   التعديل باليد بيكسب ويتحفظ؛ لو الصنف أو العبوة اتغيروا والتلقائي موجود يرجع تلقائي؛ «↺ تلقائي» أو مسح الخانة بيرجّعه تلقائي. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SafiAuto=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=o=>JSON.parse(JSON.stringify(o));
const num=x=>{const v=+x;return isFinite(v)?v:0};
function norm(s){return String(s==null?'':s).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,'')}
/* تحميل بيانات التكاليف بنفس طريقة costs-app.js (_ld + نفس التحويلات + ensureCostsCatalog). null = التكاليف عمرها ما اتحفظت على الجهاز. */
function loadCosts(rawV2,rawOld,CC){let o=null;try{if(rawV2){const p=JSON.parse(rawV2);o=p&&p.S?p.S:p}else if(rawOld)o=JSON.parse(rawOld)}catch(e){o=null}
 if(!o||typeof o!=='object')return null;const d=clone(CC.DEF);
 for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];
 if(d.sar==null)d.sar=3.75;if(d.var&&d.var.some(v=>v[0]=='برتقال'))d.var=d.var.flatMap(v=>v[0]=='برتقال'?[['برتقال أبوسرة',v[1]],['برتقال بلدي',v[1]],['برتقال صيفي',v[1]]]:[v]);if(d.variety=='برتقال')d.variety='برتقال أبوسرة';
 if(typeof CC.ensureCostsCatalog==='function')CC.ensureCostsCatalog(d);return d}
/* صف جدول الغسيل للصنف — نفس قاعدة BE.washOf في be-core.js بالظبط (test/safi-autocost.test.js بيطابقهم) */
function varRow(C,v){const n=norm(v),W=C.var||[];const hit=t=>W.find(w=>norm(w[0]).indexOf(norm(t))>=0);
 return W.find(x=>norm(x[0])===n)||(/سره/.test(n)?hit('ابوسره'):/صيفي/.test(n)?hit('صيفي'):/بلدي/.test(n)?hit('بلدي'):/ليمون/.test(n)?hit('ليمون'):/جريب/.test(n)?hit('جريب'):/(يوسفي|افندي|كلمنتين|فريمونت|موركيت)/.test(n)?hit('يوسفي'):null)||W.find(x=>n&&norm(x[0]).indexOf(n)>=0)||null}
function pkIdx(C,name){const P=C.pk||[];let i=P.findIndex(x=>x&&x[0]===name);if(i<0)i=P.findIndex(x=>x&&norm(x[0])===norm(name));return i}
function rawOf(C,name){if(name===C.variety)return isFinite(+C.raw)?+C.raw:null;const m=C.rawBy;if(m&&typeof m==='object'&&m[name]!=null&&m[name]!==''&&isFinite(+m[name])&&+m[name]>=0)return +m[name];return null}
/* تكلفة الطن ج لصنف + عبوة من بيانات التكاليف، أو {miss: السبب} */
function costFor(C,v,pack,CC){if(!C)return {miss:'costs'};if(!String(v||'').trim())return {miss:'var'};
 const vr=varRow(C,v);if(!vr)return {miss:'var'};const name=vr[0],raw=rawOf(C,name);if(raw==null)return {miss:'raw',var:name};
 const i=pkIdx(C,pack);if(i<0||!(+C.pk[i][2]>0))return {miss:'pk',var:name};
 const s=clone(C);s.variety=name;s.raw=raw;
 if(typeof CC.smOf==='function'){const x=CC.smOf(s);if(x.over)return {miss:'sm',var:name}}
 let ton=null,src='cmp';
 if(name===C.variety&&typeof CC.mixList==='function'){const m=CC.mixList(C);if(m&&m.some(r=>r.i===i)){const r=CC.calcMix(s);const row=r.mix&&r.mix.rows.find(x=>x.i===i);if(row){ton=row.ton;src='mix'}}}
 if(ton==null){s.pkg=i;s.mix=null;ton=(CC.calcX||CC.calc)(s).ton}
 if(!isFinite(ton)||!(ton>0))return {miss:'calc',var:name};
 return {ton:Math.round(ton*100)/100,exact:ton,var:name,raw,pk:C.pk[i][0],src,cur:name===C.variety}}
function lineVar(l){const m=l&&l[7];if(m&&typeof m==='object'&&m.v!=null)return String(m.v);return String(l&&l[0]||'').replace(/\s*مقاس\s*\S*\s*$/,'').trim()}
function lineKey(l){return norm(lineVar(l))+'|'+String(l&&l[1]||'')}
function hasCost(l){return l&&l[6]!=null&&l[6]!==''}
function isAuto(l){return !!(l&&l[8]&&typeof l[8]==='object'&&l[8].a)}
/* يطبّق التلقائي على كل السطور. get(l) = costFor للسطر. يرجّع true لو حاجة اتغيرت (عشان الحفظ). */
function apply(lines,get){let ch=false;(lines||[]).forEach(l=>{if(!Array.isArray(l))return;const key=lineKey(l),st=l[8];let info=null;const I=()=>info||(info=get(l)||{miss:'x'});
 if(!st||typeof st!=='object'){l[8]=hasCost(l)?{m:key}:{a:1};ch=true}                       // سطور قديمة: التكلفة المكتوبة باليد تفضل يدوي
 else if(!st.a&&st.m!==key){if(I().ton!=null){l[8]={a:1}}else{l[8]={m:key}}ch=true}        // الصنف/العبوة اتغيروا: التعديل اليدوي كان لصنف تاني
 if(isAuto(l)){const v=I().ton!=null?info.ton:null;if(l[6]!==v){l[6]=v;ch=true}}});
 return ch}
function setManual(l){l[8]={m:lineKey(l)}}
function setAuto(l){l[8]={a:1}}
return {VER:'2.4.0',norm,loadCosts,varRow,pkIdx,rawOf,costFor,lineVar,lineKey,apply,setManual,setAuto,isAuto}});
