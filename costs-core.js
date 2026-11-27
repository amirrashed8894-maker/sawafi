/* تكاليف الموالح — محرك الحساب.
   calc و _ld و f منسوخين حرفيًا من البرنامج الأصلي (citrus-costs، 31 أكتوبر 2026) — ممنوع تعديل طريقة الحساب.
   أسعار DEF الافتراضية اتحدثت في v2.0.4 من القيم اللي أكدها صاحب البرنامج؛ الحقول اللي ما ظهرتش في اللقطات فضلت زي ما هي.
   الإضافات تحت (parseNum / checkVal / toStore) بتخص قراءة المدخلات بس، ومش بتلمس طريقة الحساب. */
/*ORIG-BEGIN*/
const DEF={net:24000,usd:52,raw:10,cullP:7,loss:0.005,cull:0.15,pw:0.005,pkg:0,variety:'برتقال أبوسرة تلوين',date:'2026-10-11',sar:3.75,
pk:[['كرتون مقفول 7 ك',23,7],['كرتون أوبن توب 7 ك',32,7],['كرتون مقفول 14 ك',56,14],['كرتون مقفول 15 ك',61,15],['صندوق بلاستيك جامبو 15 ك',18,15],['صندوق بلاستيك 8 ك',13.5,7.5]],
sup:[['باليت',520],['مناديل وبصمة',170],['كود',300],['شنمبر',85],['فحص وعينة وتخليص',293],['زوايا',100],['ستيكر فحص',30],['كمسيونجي',0],['أخرى',0]],
var:[['برتقال أبوسرة تلوين',2500],['برتقال بلدي',1800],['برتقال صيفي',1800],['ليمون',1800],['يوسفي',1800],['جريب فروت',1800]]};
function calc(s){const T=s.net/1000,r={};
r.rawNeed=s.net/((1-s.loss)*(1-s.cull));r.lossKg=r.rawNeed*s.loss;r.cullKg=(r.rawNeed-r.lossKg)*s.cull;r.cullSale=r.cullKg*s.cullP;
r.buy=1000*s.raw;r.lossC=r.lossKg*s.raw/T;r.cullC=r.cullKg*(s.raw-s.cullP)/T;r.rawT=r.buy+r.lossC+r.cullC;
r.supT=s.sup.reduce((a,x)=>a+(+x[1]||0),0);const v=s.var.find(x=>x[0]===s.variety);r.wash=v?+v[1]:0;
const pc=p=>{const packed=Math.ceil(s.net/p[2]),bought=Math.ceil(packed*(1+s.pw));return{packed,bought,cost:bought*p[1]/T}};
const p=s.pk[s.pkg];const q=pc(p);r.packed=q.packed;r.bought=q.bought;r.pkgC=q.cost;r.pkgW=p[2];r.pkgName=p[0];
r.ton=r.rawT+r.pkgC+r.supT+r.wash;r.kg=r.ton/1000;r.perPkg=r.kg*p[2];r.cont=r.ton*T;
r.cmp=s.pk.map(x=>({n:x[0],v:r.rawT+r.supT+r.wash+pc(x).cost}));const mn=Math.min(...r.cmp.map(x=>x.v/s.usd));r.cmp.forEach(x=>x.d=x.v/s.usd-mn);return r}
function _ld(K,OLD){let o=null;try{const raw=localStorage.getItem(K);if(raw){const p=JSON.parse(raw);o=p&&p.S?p.S:p}else if(OLD){const r2=localStorage.getItem(OLD);if(r2)o=JSON.parse(r2)}}catch(e){o=null}
 const d=JSON.parse(JSON.stringify(DEF));if(!o||typeof o!=='object')return d;for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];return d}
const f=(x,d=2)=>Number(x).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
/*ORIG-END*/
/* تحويل المدخل لرقم: يقبل الأرقام العربية (٠-٩ و ۰-۹) والفاصلة العشرية العربية «٫» وفاصل الآلاف «٬»؛
   الفاصلة «,» فاصل آلاف لو بعدها مجموعات من 3 أرقام (24,000)، وغير كده علامة عشرية (10,5 = 10.5). يرجّع NaN لو المدخل مش رقم. */
function parseNum(x){if(typeof x==='number')return isFinite(x)?x:NaN;
  var s=String(x==null?'':x).trim().replace(/[\u0660-\u0669]/g,function(c){return c.charCodeAt(0)-0x660}).replace(/[\u06F0-\u06F9]/g,function(c){return c.charCodeAt(0)-0x6F0})
    .replace(/\u066B/g,'.').replace(/[\u066C\s\u00A0\u202F]/g,'').replace(/[\u2212\u2013]/g,'-');
  if(s==='')return NaN;
  if(/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))s=s.replace(/,/g,'');
  else if(/^[-+]?\d*,\d+$/.test(s))s=s.replace(',','.');
  if(!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;
  return parseFloat(s)}
/* قواعد المدخلات: gt0 = أكبر من صفر، ge0 = صفر أو أكتر، pct = من 0 لأقل من 100 */
var RULES={usd:['سعر الدولار','gt0'],sar:['سعر الدولار بالريال','gt0'],raw:['سعر الخام واصل المحطة','ge0'],cullP:['سعر بيع الفرزة محلي','ge0'],net:['الصافي في الحاوية','gt0'],
  loss:['نسبة الهالك من الخام','pct'],cull:['نسبة الفرزة بعد الهالك','pct'],pw:['هالك العبوات','pct']};
/* رسالة الخطأ أو '' — opt: الخانة الفاضية = صفر (زي البرنامج الأصلي في الجداول) */
function checkVal(raw,rule,opt){var t=String(raw==null?'':raw).trim();if(t==='')return opt&&rule!=='gt0'?'':'فاضي — اكتب رقم';
  var x=parseNum(t);if(!isFinite(x))return 'مكتوب غلط';
  if(rule==='gt0'&&!(x>0))return 'لازم يكون أكبر من صفر';
  if(rule==='ge0'&&x<0)return 'مينفعش يكون بالسالب';
  if(rule==='pct'&&(x<0||x>=100))return 'لازم تكون صفر أو أكتر، وأقل من 100';
  return ''}
/* القيمة اللي بتتخزن في S بنفس شكل البرنامج الأصلي: (+قيمة||0) والنسب ÷ 100 */
function toStore(raw,pct){var t=String(raw==null?'':raw).trim();var x=t===''?0:parseNum(t);return pct?(x||0)/100:(x||0)}
/* ---------- محلي سوبرماركت — فرزة مقاسات 100-113 (v2.2.0، طلب أمير 24/11/2026) ----------
   مخرج مستقل من الخام جنب التصدير والفرزة والهالك: نسبته من الفاكهة بعد الهالك (نفس أساس نسبة الفرزة)، والفرزة بتفضل زي ما هي مكتوبة.
   توزيع الخام: هالك = هالك% · فرزة = (1−هالك)×فرزة% · سوبرماركت = (1−هالك)×سوبرماركت% · تصدير = الباقي = (1−هالك)×(1−فرزة−سوبرماركت) → المجموع 100%.
   فالسوبرماركت بيقلل نصيب التصدير من نفس الخام (الخام المطلوب لطن تصدير بيزيد)، وبيتباع بسعره هو شامل وزن الصندوق.
   calc() الأصلية ما اتلمستش: calcX = calc على فرزة+سوبرماركت (نفس الخام المطلوب والهالك بالظبط) وبعدين جزء السوبرماركت بيتسعّر بسعره بدل سعر الفرزة.
   لو النسبة صفر النتيجة هي calc بالظبط. S.sm = {p: نسبة من الفاكهة بعد الهالك (0..1)، price، basis: 'kg' ج/كجم قائم (فاكهة + وزن الصندوق) أو 'box' ج/صندوق،
   box: رقم نوع الصندوق، bx: [[الاسم، سعر الصندوق ج، صافي الفاكهة كجم، وزن الصندوق فاضي كجم]...]، oth: مصاريف تانية ج/صندوق، sizes: نص للعرض}
   نفس الكود حرفيًا في be-core.js — test/sm.test.js بيطابقهم. */
const SM_DEF={p:0,price:12,basis:'kg',box:0,oth:0,sizes:'100-113',bx:[['صندوق جامبو 15 كجم',18,15,0.65],['صندوق بلاستيك 8 كجم',13.5,7.5,0.8]]};
function smState(s){const d=JSON.parse(JSON.stringify(SM_DEF)),o=s&&s.sm;
 if(o&&typeof o==='object'){for(const k in d)if(o[k]!==undefined&&o[k]!==null&&Array.isArray(d[k])===Array.isArray(o[k]))d[k]=o[k]}
 d.bx=(d.bx||[]).filter(b=>Array.isArray(b));if(!d.bx.length)d.bx=JSON.parse(JSON.stringify(SM_DEF.bx));d.box=Math.floor(+d.box)||0;if(d.box<0||d.box>=d.bx.length)d.box=0;
 if(d.basis!=='box')d.basis='kg';return d}
function smOf(s,loss,cull){const n=x=>{const v=+x;return isFinite(v)?v:0};const m=smState(s);loss=n(loss!=null?loss:s.loss);cull=n(cull!=null?cull:s.cull);
 const b=m.bx[m.box],net=n(b[2]),tare=n(b[3]),cost=n(b[1]),oth=n(m.oth),price=n(m.price),share=Math.min(1,Math.max(0,n(m.p))),exp=1-cull-share;
 const over=share>0&&exp<=1e-9;                                  // الفرزة + السوبرماركت ≥ 100% = مفيش تصدير
 const on=share>0&&net>0&&!over&&loss<1;
 const kgT=on?1000*share/exp:0,boxes=on?kgT/net:0,gross=boxes*(net+tare);   // كجم سوبرماركت لكل طن تصدير صافي
 const rev=m.basis==='box'?boxes*price:gross*price,boxC=boxes*(cost+oth),netRev=rev-boxC,asCull=kgT*n(s.cullP);
 const split={loss:loss,cull:(1-loss)*cull,sm:(1-loss)*share,exp:(1-loss)*Math.max(0,exp)};
 return {on,over,m,name:String(b[0]||''),share,net,tare,cost,oth,price,basis:m.basis,kgT,boxes,gross,rev,boxC,netRev,asCull,gain:on?netRev-asCull:0,
  perKg:kgT>0?netRev/kgT:null,perBox:boxes>0?rev/boxes:null,split}}
function calcX(s){const x=smOf(s);if(!x.on){const r=calc(s);r.sm=x;return r}
 const s2=JSON.parse(JSON.stringify(s));s2.cull=(+s.cull||0)+x.share;const r=calc(s2),T=s.net/1000,raw2=r.rawT;r.sm=x;
 const after=r.rawNeed-r.lossKg;r.cullKg=after*(+s.cull||0);r.smKg=after*x.share;r.cullSale=r.cullKg*s.cullP;r.cullC=r.cullKg*(s.raw-s.cullP)/T;
 r.smBoxes=x.boxes*T;r.smGross=x.gross*T;r.smRev=x.rev*T;r.smBoxC=x.boxC*T;r.smNet=x.netRev*T;r.smC=(r.smKg*s.raw-r.smNet)/T;   // تكلفة السوبرماركت ج/طن = خامه − صافي بيعه بعد الصندوق
 r.smGain=x.gain;r.rawT=r.buy+r.lossC+r.cullC+r.smC;r.ton=r.rawT+r.pkgC+r.supT+r.wash;r.kg=r.ton/1000;r.perPkg=r.kg*r.pkgW;r.cont=r.ton*T;
 const dl=r.rawT-raw2;r.cmp.forEach(c=>c.v+=dl);return r}
/* عبوات وأصناف مضافة في التحديثات من غير تعديل DEF/calc الأصليين.
  ensureCostsCatalog بيلزّقهم في القايمة المحفوظة لو الاسم مش موجود، من غير ما يغيّر أسعار أو أوزان العبوات القديمة. */
var EXTRA_PK=[['صندوق بلاستيك 5 ك ملوّن',13,5,200],['صندوق بلاستيك 2.5 ك ملوّن',11,2.5,400]];
var EXTRA_VAR=[['أفندي',1800]];
/* وزن الصندوق الفاضي لأنواع السوبرماركت الجديدة مش معروف — بيتسجل 0 وقابل للتعديل، من غير اختراع رقم. */
function ensureSmBoxes(s){if(!s||typeof s!=='object')return false;var ch=false;
 if(!s.sm||typeof s.sm!=='object'){s.sm=JSON.parse(JSON.stringify(SM_DEF));ch=true}
 if(!Array.isArray(s.sm.bx)||!s.sm.bx.length){s.sm.bx=JSON.parse(JSON.stringify(SM_DEF.bx));ch=true}
 function has(nm){return s.sm.bx.some(function(b){return b&&b[0]===nm})}
 EXTRA_PK.forEach(function(p){if(!has(p[0])){s.sm.bx.push([p[0],p[1],p[2],0]);ch=true}});
 if(Array.isArray(s.pk))s.pk.forEach(function(p){if(p&&p[0]&&String(p[0]).indexOf('صندوق')>=0&&!has(p[0])&&!DEF.pk.some(function(o){return o[0]===p[0]})){s.sm.bx.push([p[0],+p[1]||0,+p[2]||0,0]);ch=true}});
 return ch}
function ensureCostsCatalog(s){if(!s||typeof s!=='object')return false;var ch=false;
 if(Array.isArray(s.pk))EXTRA_PK.forEach(function(p){if(!s.pk.some(function(x){return x&&x[0]===p[0]})){s.pk.push(p.slice());ch=true}});
 if(Array.isArray(s.var)&&!s.var.some(function(v){return v&&v[0]==='أفندي'})){s.var.push(['أفندي',1800]);ch=true}
 if(ensureSmBoxes(s))ch=true;
 return ch}
/* صافي كجم في الباليت = وزن العبوة × عدد الصناديق في الباليت (لو الاتنين موجودين). */
function palNetKg(p){var w=+p[2]||0,b=+p[3]||0;return w>0&&b>0?w*b:0}
/* حصص الخلطة: [{i, pal, net}] صافي كجم. لو عبوة واحدة أو مفيش mix نرجّع null — الحساب يبقى calc/calcX حرفياً. */
function mixList(s){if(!s||!Array.isArray(s.pk))return null;var m=s.mix;if(!Array.isArray(m)||m.length<2)return null;
 var out=[];m.forEach(function(row){var i=Math.floor(+row.i);if(!(i>=0&&i<s.pk.length))return;var p=s.pk[i];if(!p||!(+p[2]>0))return;
  var pn=palNetKg(p),pal=+row.pal,net=+row.net;if(!(pal>=0))pal=0;if(!(net>0))net=pn>0&&pal>0?pal*pn:0;out.push({i:i,pal:pal,net:net,p:p})});
 return out.length>=2?out:null}
function defaultMix(s,idxs){var n=idxs.length,Tkg=+s.net||0,each=n?Tkg/n:0,used=0,rows=[];
 /* v2.3.1 (مراجعة t198): لو في الخلطة عبوة من غير «صناديق/باليت» هي اللي بتاخد الباقي، عشان الموزّع = صافي الحاوية بالظبط
    (قبل كده العبوة الأخيرة بالباليتات كانت بتتقرّب لأقرب باليت فالموزّع يزيد/يقل عن الحاوية). */
 var free=idxs.filter(function(i){return !(palNetKg(s.pk[i])>0)});
 if(free.length&&free.length<n){var palUsed=0;
  idxs.forEach(function(i){var pn=palNetKg(s.pk[i]);if(pn>0){var pal=Math.max(0,Math.round(each/pn));palUsed+=pal*pn;rows.push({i:i,pal:pal,net:pal*pn})}else rows.push({i:i,pal:0,net:0})});
  var rest=Math.max(0,Tkg-palUsed),k=0;rows.forEach(function(r){if(!(palNetKg(s.pk[r.i])>0)){k++;r.net=k===free.length?Math.max(0,rest-(rest/free.length)*(free.length-1)):rest/free.length}});
  return rows}
 idxs.forEach(function(i,k){var p=s.pk[i],pn=palNetKg(p),rest=k===n-1?Math.max(0,Tkg-used):each,pal=0,net=rest;
  if(pn>0){pal=k===n-1?Math.round(rest/pn):Math.round(each/pn);if(pal<0)pal=0;net=pal*pn}
  if(k!==n-1)used+=net;rows.push({i:i,pal:pal,net:net})});
 if(rows.length&&palNetKg(s.pk[rows[rows.length-1].i])>0){var last=rows[rows.length-1],pn=palNetKg(s.pk[last.i]),sum=rows.reduce(function(a,r,j){return j===rows.length-1?a:a+r.net},0),need=Tkg-sum;
  last.pal=pn>0?Math.max(0,Math.round(need/pn)):last.pal;last.net=last.pal*pn}
 return rows}
function packSlice(s,p,netKg){var T=netKg/1000,packed=Math.ceil(netKg/p[2]),bought=Math.ceil(packed*(1+s.pw));return{packed:packed,bought:bought,pkgC:T>0?bought*p[1]/T:0,pkgW:p[2],pkgName:p[0]}}
/* خلطة عبوات على نفس الصنف: تكلفة كل عبوة لصافي حصتها، والإجمالي مرجّح. عبوة واحدة = calcX بالظبط. calc() نفسها ما اتلمستش. */
function calcMix(s){var r=(typeof calcX==='function'?calcX:calc)(s),mix=mixList(s);
 if(!mix){r.mix=null;return r}
 var T=s.net/1000,rows=[],totNet=0,totCost=0,totPacked=0,totBought=0;
 mix.forEach(function(row){var q=packSlice(s,row.p,row.net),ton=r.rawT+q.pkgC+r.supT+r.wash;
  totNet+=row.net;totCost+=q.pkgC*(row.net/1000);totPacked+=q.packed;totBought+=q.bought;
  rows.push({i:row.i,name:row.p[0],w:row.p[2],price:row.p[1],pal:row.pal,net:row.net,pct:0,packed:q.packed,bought:q.bought,pkgC:q.pkgC,ton:ton,kg:ton/1000,perPkg:ton/1000*row.p[2],cont:ton*(row.net/1000)})});
 var wsum=totNet>0?totNet:1;rows.forEach(function(x){x.pct=x.net/wsum*100});
 /* v2.3.1 (مراجعة t198): «الإجمالي المرجّح» = تكلفة العبوات ÷ الصافي الموزّع فعلاً، فبيساوي متوسط سطور الخلطة المرجّح بالصافي
    حتى لو الموزّع مختلف عن صافي الحاوية (قبل كده كان بيقسم على صافي الحاوية فالإجمالي يطلع غير متوسط السطور). */
 var pkgC=totNet>0?totCost/(totNet/1000):0;
 r.pkgC=pkgC;r.packed=totPacked;r.bought=totBought;r.pkgW=null;
 r.pkgName=rows.map(function(x){return x.name}).join(' + ');
 r.ton=r.rawT+r.pkgC+r.supT+r.wash;r.kg=r.ton/1000;r.perPkg=null;r.cont=r.ton*T;
 r.mix={rows:rows,totNet:totNet,totPal:rows.reduce(function(a,x){return a+(+x.pal||0)},0),pkgC:pkgC};
 return r}
var CORE={DEF:DEF,calc:calc,calcX:calcX,calcMix:calcMix,mixList:mixList,defaultMix:defaultMix,palNetKg:palNetKg,packSlice:packSlice,smOf:smOf,smState:smState,SM_DEF:SM_DEF,_ld:_ld,f:f,parseNum:parseNum,RULES:RULES,checkVal:checkVal,toStore:toStore,ensureCostsCatalog:ensureCostsCatalog,ensureSmBoxes:ensureSmBoxes,EXTRA_PK:EXTRA_PK,EXTRA_VAR:EXTRA_VAR};
if(typeof module!=='undefined')module.exports=CORE;
