/* v2.8.0 — النولون والمصروفات لكل حاوية (أمير 27/11/2026: «خلي النولون والمصاريف تتضرب في عدد الحاويات تلقائي»).
   اللي متكتب في الصوافي = لكل حاوية (أو لكل براد). عدد الحاويات = ceil(إجمالي الباليتات ÷ السعة من القرار، الافتراضي 21 حاوية / 23 براد).
   النولون + كل بند مصروفات بيتضرب في العدد، ما عدا بند ثابت للشحنة كلها (زي «إذن استيراد») — بيتحسب مرة واحدة.
   البند ممكن يتعلّم يدوي: e[3]='once' (مرة للشحنة) أو 'per' (لكل حاوية). calc() الأصلية ما اتلمستش: بنحسب على نسخة متضروبة. */
(function(root){'use strict';
const CAP_DEF={'حاوية':21,'براد':23};
const ONCE_RE=/إذن\s*(ال)?استيراد|تصريح\s*استيراد|رسوم\s*(ال)?شحنة\s*الثابتة/;
const n0=x=>{const v=+x;return isFinite(v)?v:0};
function isOnce(e){if(!Array.isArray(e))return false;if(e[3]==='once')return true;if(e[3]==='per')return false;return ONCE_RE.test(String(e[0]||''))}
function contN(pal,cap){pal=n0(pal);cap=n0(cap);if(!(cap>0)||!(pal>0))return 1;return Math.max(1,Math.ceil(pal/cap-1e-9))}
function capFrom(dec,mode){const c=dec&&dec.cap&&+dec.cap[mode];return c>0?c:CAP_DEF[mode==='براد'?'براد':'حاوية']}
const col=mode=>mode==='براد'?1:2;
/* تقسيم مصروفات وسيلة النقل: per = لكل حاوية، once = مرة للشحنة (ريال) */
function split(exp,mode){const j=col(mode);let per=0,once=0;(exp||[]).forEach(e=>{if(!Array.isArray(e))return;const v=n0(e[j]);if(isOnce(e))once+=v;else per+=v});return {per,once}}
function palOf(s){return (s&&s.lines||[]).reduce((a,l)=>a+n0(l[4]),0)}
/* نسخة من حالة الصوافي فيها النولون والمصروفات (لكل حاوية) مضروبة في عدد الحاويات — للحساب بـ calc() الأصلية */
function scale(s,n){const o=JSON.parse(JSON.stringify(s));n=n>0?n:1;if(n===1)return o;o.fC=n0(o.fC)*n;o.fB=n0(o.fB)*n;
 o.exp=(o.exp||[]).map(e=>{if(!Array.isArray(e)||isOnce(e))return e;const x=e.slice();x[1]=n0(e[1])*n;x[2]=n0(e[2])*n;return x});return o}
/* معلومات الحاويات لحالة الصوافي: dec = إعدادات القرار (للسعة) */
function info(s,dec){const mode=s&&s.mode==='براد'?'براد':'حاوية',cap=capFrom(dec,mode),pal=palOf(s),n=contN(pal,cap),u=n0(s&&s.sar);
 const sp=split(s&&s.exp,mode),fr=mode==='براد'?n0(s&&s.fB):n0(s&&s.fC)*u;
 return {mode,cap,pal,n,frUnit:mode==='براد'?n0(s&&s.fB):n0(s&&s.fC),frCur:mode==='براد'?'ريال':'$',frSar:fr,expPer:sp.per,expOnce:sp.once,
  totSar:n*(fr+sp.per)+sp.once,unitWord:mode==='براد'?'براد':'حاوية'}}
const f2=x=>Number(x).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2});
/* «النولون 2,800$ × 2 حاوية» */
function lbl(name,v,cur,n,word){return name+' '+f2(v)+(cur==='$'?'$':' '+cur)+' × '+n+' '+word}
/* سطر الشرح: «النولون 2,800$ × 2 حاوية + المصروفات 8,500 ريال × 2 حاوية = 38,037.52 ريال» */
function text(x,o){o=o||{};const w=x.unitWord,n=x.n;const P=[lbl('النولون',x.frUnit,x.frCur,n,w),lbl('المصروفات',x.expPer,'ريال',n,w)];
 if(x.expOnce)P.push('ثابت '+f2(x.expOnce)+' ريال مرة واحدة للشحنة');return P.join(' + ')+(o.noTot?'':' = '+f2(x.totSar)+' ريال')}
/* من سياق القرار BE.ctx وعدد الحاويات */
function ofC(C,n){const br=C.mode==='براد',sf=C.safi||{};return {mode:C.mode,n:n||1,unitWord:br?'براد':'حاوية',frUnit:br?n0(sf.fB):n0(sf.fC),frCur:br?'ريال':'$',frSar:C.frSar,
 expPer:C.expPer!=null?C.expPer:C.expSar,expOnce:C.expOnce||0,totSar:(n||1)*(C.frSar+(C.expPer!=null?C.expPer:C.expSar))+(C.expOnce||0)}}
const api={CAP_DEF,ONCE_RE,isOnce,contN,capFrom,split,palOf,scale,info,lbl,text,ofC};root.SHIPC=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
