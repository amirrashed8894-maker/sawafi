/* قسم التكاليف — استيراد مرة واحدة من برنامج تكاليف الموالح القديم (موقع تاني، فالتخزين منفصل) + تصدير.
   بيقبل ملف JSON من «تصدير» أو نص «COSTS1:…». مش بيغيّر الحساب؛ بيكتب نفس مفتاح citrusCosts.v2 وبيعيد التحميل. */
(function(){'use strict';
function apply(txt){const c=BE.parseCostsImport(txt);if(!c){alert('الملف أو النص ده مش من برنامج تكاليف الموالح.');return false}
 if(!confirm('تستبدل أرقام التكاليف الحالية باللي في الملف؟\nالأرقام الحالية هتتحفظ نسخة احتياطية.'))return false;
 /* بنغيّر S اللي في الصفحة نفسها ونحفظ (مش reload) — لأن قسم التكاليف بيحفظ S عند قفل الصفحة وكان هيرجّع الأرقام القديمة */
 try{const old=localStorage.getItem('citrusCosts.v2');if(old)localStorage.setItem('citrusCosts.v2.beforeImport',old)}catch(e){}
 c.date=S.date||cairoISO();if(S.usd>0)c.usd=S.usd;S=c;ERR={};DR={};save();renderAll();
 alert('اتستوردت التكاليف ✓ (الدولار فضل الموحّد '+S.usd+' ج)');return true}
function exportCosts(){const blob=new Blob([JSON.stringify({app:'citrus-costs',ver:2,t:Date.now(),S},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='التكاليف-'+cairoISO()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
 if(t.id==='bCostsImport'){const txt=prompt('الصق نص «COSTS1:…» من برنامج التكاليف القديم، أو سيبها فاضية واختار ملف JSON:','');if(txt&&txt.trim())apply(txt);else if(txt!==null)document.getElementById('fCostsImport').click()}
 else if(t.id==='bCostsExport')exportCosts()});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='fCostsImport'&&e.target.files&&e.target.files[0]){const r=new FileReader();r.onload=()=>{apply(String(r.result));e.target.value=''};r.readAsText(e.target.files[0])}});
window.CostsIO={apply};
})();
