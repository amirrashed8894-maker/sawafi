/* الصوافي v2.0.1 — مصروفات الحاوية داخل السعودية (أمير 23/11/2026):
   «تخليص ونقل من الميناء» 6,500 ريال (متغيرة) + «دخولية» 2,000 ريال = 8,500 ريال، بدل البنود القديمة (13,886 ريال).
   ترحيل مرة واحدة للحفظ الحالي بس لو عمود الحاوية لسه هو البنود القديمة بالظبط (أسماء وقيم). أي رقم معدّل يفضل زي ما هو.
   عمود البراد ما بيتلمسش: البند القديم اللي له قيمة براد بيفضل بقيمة البراد وتتصفّر قيمة الحاوية بس.
   العلامة S.expV=2 بتتحط بعد الفحص، فمش بيتكرر. الأيام المحفوظة والملفات المستوردة بتتفتح زي ما هي (التقارير القديمة ماتتغيرش). */
(function(root){'use strict';
const OLD_C=[['رسوم موقف',2000],['كارت دخول',200],['رسوم إذن استيراد',300],['نقل من الثلاجة للسوق',300],['تخزين (إيجار طبالي بالثلاجة)',2310],['نقل الحاوية من الميناء',3700],['تخليص',5076]];
const NEW_C=[['تخليص ونقل من الميناء',6500],['دخولية',2000]];
function isOldContainer(exp){if(!Array.isArray(exp))return false;const nz=exp.filter(r=>Array.isArray(r)&&+r[2]);
 return nz.length===OLD_C.length&&OLD_C.every(([n,v])=>nz.filter(r=>r[0]===n&&+r[2]===v).length===1)}
function migrateExp(s){if(!s||typeof s!=='object'||!Array.isArray(s.exp))return false;if(+s.expV>=2)return false;const hit=isOldContainer(s.exp);s.expV=2;if(!hit)return false;
 const out=[];let at=-1;s.exp.forEach(r=>{const o=OLD_C.find(x=>x[0]===r[0]);if(!o){out.push(r);return}if(at<0)at=out.length;if(+r[1])out.push([r[0],r[1],0])});
 const add=NEW_C.map(([n,v])=>[n,0,v]);out.splice(at<0?out.length:at,0,...add);s.exp=out;return true}
/* لما الحالة تتفتح كتقرير قديم (يوم محفوظ / ملف / استرجاع): بنعلّمها من غير ما نغيّر أرقامها */
function keepExp(s){if(s&&typeof s==='object'&&s.expV==null)s.expV=2;return s}
const api={OLD_C,NEW_C,isOldContainer,migrateExp,keepExp};root.ExpMig=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
