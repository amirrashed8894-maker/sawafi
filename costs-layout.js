/* التكاليف v2.7.0 — ترتيب الشكل بس (طلب أمير 27/11/2026 «ورتب كمان التكاليف الشكل»). مفيش أي حساب هنا:
   - شريط النتيجة الثابت فوق = نسخة من الرقم الكبير في ⑤ النتيجة (#sum) — بيتحدّث مع كل تغيير.
   - ملخص المستلزمات والغسيل على عنوان الجداول المطوية (نفس الأرقام اللي جوه).
   - الجداول المطوية بتتفتح لوحدها لو فيها خانة غلط أو لما تضغط «+ عبوة جديدة». */
(function(){'use strict';
const $=s=>document.querySelector(s);
function sync(){const st=$('#stick'),sm=$('#sum');if(st&&sm){const l=sm.querySelector('.lbl'),e=sm.querySelector('.egp'),u=sm.querySelector('.usd');
  const v=typeof S!=='undefined'&&S?S.variety:'';const h='<span>'+(l?l.textContent:'تكلفة الطن')+'</span><b>'+(e?e.innerHTML:'—')+'</b>'+(u?'<em>'+u.textContent+'</em>':'');
  if(st.innerHTML!==h)st.innerHTML=h;st.title=v||''}
 const a=$('#supSum'),t=$('#supTot');if(a&&t&&a.textContent!==t.textContent)a.textContent=t.textContent;
 const w=$('#washSum');if(w&&typeof S!=='undefined'&&S&&Array.isArray(S.var)){const r=S.var.find(x=>x[0]===S.variety);const tx=r?(S.variety+' '+Number(r[1]).toLocaleString('en-US')+' ج'):'';if(w.textContent!==tx)w.textContent=tx}
 const ss=$('#smSum');if(ss&&typeof S!=='undefined'&&S){const p=S.sm&&+S.sm.p>0?+S.sm.p:0;const tx=p?'شغّال '+(Math.round(p*1000)/10)+'%':'مقفول';if(ss.textContent!==tx)ss.textContent=tx}
 document.querySelectorAll('details.adv').forEach(d=>{if(!d.open&&d.querySelector('.bad'))d.open=true})}
const host=$('#sum');if(host&&window.MutationObserver)new MutationObserver(sync).observe(host,{childList:true,subtree:true,characterData:true});
document.addEventListener('input',()=>setTimeout(sync,0));
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#addPk,#bAddPk');if(t){const d=$('#advPk');if(d)d.open=true}},true);
const st=$('#stick');if(st){const go=()=>{const g=$('#g5');if(g)g.scrollIntoView({behavior:'smooth',block:'start'})};st.addEventListener('click',go);st.addEventListener('keydown',e=>{if(e.key==='Enter')go()})}
sync();
})();
