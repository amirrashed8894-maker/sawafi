/* الصوافي — محرك الحساب.
   DEF و calc و _ld و f منسوخين حرفيًا من البرنامج الأصلي (صوافي، آخر نسخة نصية 1 نوفمبر 2026) — ممنوع تعديلهم.
   الإضافات تحت (parseNum / checkVal / toStore) بتخص قراءة المدخلات بس، ومش بتلمس طريقة الحساب. */
/*ORIG-BEGIN*/
const DEF={date:'2026-10-11',sar:3.7567,egp:52,client:'فاكهة الصيف',mode:'حاوية',fB:0,fC:0,cost:16960.03,
clients:[['حامد الغامدي',0.05],['فاكهة الصيف',0.06],['جبار البيشي',0.06]],
pk:[['كرتون مقفول 7 ك',7],['كرتون أوبن توب 7 ك',7],['كرتون مقفول 14 ك',14],['كرتون مقفول 15 ك',15],['صندوق بلاستيك جامبو 15 ك',15],['صندوق بلاستيك 8 ك',7.5]],
lines:[['برتقال عصير كبير','صندوق بلاستيك جامبو 15 ك',560,30],['برتقال عصير كبير','صندوق بلاستيك جامبو 15 ك',80,29.5],['برتقال عصير كبير','صندوق بلاستيك جامبو 15 ك',319,29],['برتقال عصير كبير','صندوق بلاستيك جامبو 15 ك',80,28],['برتقال عصير فرش','صندوق بلاستيك جامبو 15 ك',1120,13],['تالف','صندوق بلاستيك جامبو 15 ك',1,0]],
exp:[['رسوم موقف',2000,2000],['كارت دخول',200,200],['رسوم إذن استيراد',300,300],['نقل من الثلاجة للسوق',0,300],['تخزين (إيجار طبالي بالثلاجة)',0,2310],['نقل الحاوية من الميناء',0,3700],['تخليص',0,5076],['مصاريف أخرى',0,0]]};
function calc(s){const r={},u=s.sar,br=s.mode==='براد';
 const c=s.clients.find(x=>x[0]===s.client);r.comm=c?+c[1]:0;r.noClient=!c;
 const w=n=>{const p=s.pk.find(x=>x[0]===n);return p?+p[1]:0};
 r.lines=s.lines.filter(l=>+l[2]).map(l=>({n:l[0],p:l[1],q:+l[2],pr:+l[3],t:+l[2]*w(l[1])/1000,v:+l[2]*+l[3]}));
 r.q=r.lines.reduce((a,x)=>a+x.q,0);r.t=r.lines.reduce((a,x)=>a+x.t,0);r.sales=r.lines.reduce((a,x)=>a+x.v,0);
 r.commV=-r.sales*r.comm;r.expT=s.exp.reduce((a,x)=>a+(+(br?x[1]:x[2])||0),0);r.expV=-r.expT;
 r.frV=-(br?+s.fB||0:(+s.fC||0)*u);r.shared=-(r.expV+r.frV);r.net=r.sales+r.commV+r.expV+r.frV;
 r.lines.forEach(x=>x.nt=x.t?(x.v*(1-r.comm)-r.shared*x.t/r.t)/x.t/u:null);
 r.tonUsd=r.t?r.net/r.t/u:0;r.pkgUsd=r.q?r.net/r.q/u:0;r.tonSar=r.t?r.net/r.t:0;r.pkgSar=r.q?r.net/r.q:0;
 const E=s.egp;r.tonEgp=r.tonUsd*E;r.kgEgp=r.tonEgp/1000;r.pkgEgp=r.pkgUsd*E;r.netEgp=r.net/u*E;
 r.costUsd=s.cost/E;r.plTon=r.tonEgp-s.cost;r.plShip=r.plTon*r.t;
 r.be=r.q?(r.costUsd*r.t*u+r.shared)/(1-r.comm)/r.q:0; // break-even avg SAR/package, same as file's N column
 r.types=s.pk.map(p=>{const L=r.lines.filter(x=>x.p===p[0]);const q=L.reduce((a,x)=>a+x.q,0),t=L.reduce((a,x)=>a+x.t,0),v=L.reduce((a,x)=>a+x.v,0);
  const f=-v*r.comm,g=r.t?-r.shared*t/r.t:0,h=v+f+g;return{n:p[0],q,t,v,avg:q?v/q:null,f,g,h,nt:t?h/t/u:null,np:q?h/q/u:null,be:q?(r.costUsd*t*u-g)/(1-r.comm)/q:null}}).filter(x=>x.q);
 r.warn=r.noClient?'تنبيه: العميل مش موجود في جدول العملاء — العمولة محسوبة صفر':(r.frV===0?'تنبيه: نولون الشحن لل'+s.mode+' غير مدخل — الصافي الحالي قبل خصم النولون':'');
 return r}
function _ld(K,OLD){let o=null;try{const raw=localStorage.getItem(K);if(raw){const p=JSON.parse(raw);o=p&&p.S?p.S:p}else if(OLD){const r2=localStorage.getItem(OLD);if(r2)o=JSON.parse(r2)}}catch(e){o=null}
 const d=JSON.parse(JSON.stringify(DEF));if(!o||typeof o!=='object')return d;for(const k in d){if(o[k]!==undefined&&o[k]!==null&&(Array.isArray(d[k])===Array.isArray(o[k])))d[k]=o[k]}for(const k in o)if(!(k in d))d[k]=o[k];return d}
const f=(x,d=2)=>x==null||isNaN(x)?'—':Number(x+0===0?0:x).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
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
var RULES={sar:['سعر الدولار بالريال','gt0'],egp:['سعر الدولار بالجنيه','gt0'],fC:['نولون الحاوية من مصر','ge0'],fB:['نولون البراد من مصر','ge0'],cost:['تكلفة الطن هنا','ge0']};
/* رسالة الخطأ أو '' — opt: الخانة الفاضية = صفر (زي البرنامج الأصلي) */
function checkVal(raw,rule,opt){var t=String(raw==null?'':raw).trim();if(t==='')return opt&&rule!=='gt0'?'':'فاضي — اكتب رقم';
  var x=parseNum(t);if(!isFinite(x))return 'مكتوب غلط';
  if(rule==='gt0'&&!(x>0))return 'لازم يكون أكبر من صفر';
  if(rule==='ge0'&&x<0)return 'مينفعش يكون بالسالب';
  if(rule==='pct'&&(x<0||x>=100))return 'لازم تكون صفر أو أكتر، وأقل من 100';
  return ''}
/* القيمة اللي بتتخزن في S بنفس شكل البرنامج الأصلي: (+قيمة||0) والعمولة ÷ 100 */
function toStore(raw,pct){var t=String(raw==null?'':raw).trim();var x=t===''?0:parseNum(t);return pct?(x||0)/100:(x||0)}
var CORE={DEF:DEF,calc:calc,_ld:_ld,f:f,parseNum:parseNum,RULES:RULES,checkVal:checkVal,toStore:toStore};
if(typeof module!=='undefined')module.exports=CORE;
