/* الصوافي v1.5.0 (معاينة) — «سعر شراء الخام للتعادل»: ربط تكاليف الموالح بالصوافي (بحوث العمليات).
   الحساب في be-core.js. الإعدادات في S.rb (إضافة جديدة) فبتتحفظ فورًا مع الصوافي (localStorage + IndexedDB + الأيام المحفوظة + التصدير).
   الحاوية هي الأساسي، والبراد مقارنة. */
(function(){'use strict';
let LAST_RB=null;
const fe=(x,d)=>x==null||!isFinite(x)?'—':f(x,d==null?2:d);
const plTxt=v=>v==null?'—':(v>=0?'ربح ':'خسارة ')+'<span class="num">'+f(Math.abs(v))+'</span>';
function rb(){if(!S.rb||typeof S.rb!=='object'){S.rb=LAST_RB?JSON.parse(JSON.stringify(LAST_RB)):BE.rbOf({});setTimeout(save,0)}
 const d=BE.rbOf(S);for(const k in d)if(!(k in S.rb)||JSON.stringify(S.rb[k])===undefined)S.rb[k]=d[k];if(!S.rb.cap)S.rb.cap=d.cap;LAST_RB=S.rb;return S.rb}
const OTHER=m=>m==='حاوية'?'براد':'حاوية';
const modeName=m=>m==='حاوية'?'الحاوية':'البراد';
/* الخطة للوسيلة التانية: نفس نسب الباليتات متقاسة على سعتها */
function planFor(R,mode){const n=R.items.map(it=>+it.pal||0);if(mode===R.base)return n;const tot=n.reduce((a,b)=>a+b,0),cap=+R.cap[mode]||0;return tot?n.map(v=>v*cap/tot):n}
function vOpts(cur){const G=(window.ALS&&ALS.GROUPS)||{};let o='<option value="">اختار الصنف…</option>';const all=[].concat(...Object.values(G).map(g=>g.vars));
 if(cur&&all.indexOf(cur)<0)o+='<option selected>'+esc(cur)+'</option>';
 Object.values(G).forEach(g=>{o+='<optgroup label="'+esc(g.name)+'">'+g.vars.map(v=>'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('')+'</optgroup>'});return o}
function szOpts(it){let L=[];try{const g=ALS.groupOf(it.v);if(g){const pk=ALS.packOf(g,it.pk);const r=ALS.sizesFor(g,pk);if(Array.isArray(r))L=r.map(String)}}catch(e){}
 const cur=String(it.sz||'');if(cur&&L.indexOf(cur)<0)L.unshift(cur);return '<option value="">المقاس</option>'+L.map(s=>'<option'+(s===cur?' selected':'')+'>'+esc(s)+'</option>').join('')}
function pkOpts(cur){let o='';const L=S.pk.map(p=>p[0]);if(cur&&L.indexOf(cur)<0)L.unshift(cur);L.forEach(n=>{o+='<option'+(n===cur?' selected':'')+'>'+esc(n)+'</option>'});return o}
const inp=(path,v,unit,lab,cls)=>'<div class="f'+(cls?' '+cls:'')+'"><label>'+lab+'</label><div class="in"><input inputmode="decimal" data-rb="'+path+'" value="'+esc(v==null?'':v)+'">'+(unit?'<span class="u">'+unit+'</span>':'')+'</div></div>';
function render(){const host=document.getElementById('be');if(!host)return;const R=rb();
 const its=R.items.map((it,i)=>'<div class="ln be-it" data-bi="'+i+'"><div class="r1 rv"><select data-rbs="items.'+i+'.v" aria-label="الصنف">'+vOpts(it.v)+'</select><select data-rbs="items.'+i+'.sz" aria-label="المقاس" class="szs">'+szOpts(it)+'</select><button class="x" data-ba="del:'+i+'" aria-label="حذف">×</button></div>'+
  '<div class="r1"><select data-rbs="items.'+i+'.pk" aria-label="العبوة">'+pkOpts(it.pk)+'</select></div>'+
  '<div class="be-g4">'+[['p','سعر البيع','ريال'],['cpp','كراتين/باليت',''],['pal','باليتات '+modeName(R.base),''],['max','حد أقصى','باليت'],['share','نسبة المقاس','% من الفرز']].map(x=>'<label class="be-c"><span>'+x[1]+(x[2]?' <small>'+x[2]+'</small>':'')+'</span><input class="v" inputmode="decimal" data-rb="items.'+i+'.'+x[0]+'" value="'+esc(it[x[0]]==null?'':it[x[0]])+'" placeholder="'+(x[0]=='max'||x[0]=='share'?'اختياري':'')+'"></label>').join('')+'</div>'+
  '<div class="be-out" data-bo="'+i+'"></div></div>').join('');
 host.innerHTML='<h2>سعر شراء الخام للتعادل <small>اكتب سعر البيع بالريال ← أقصى سعر للخام بالجنيه</small></h2>'+
  '<div class="vars be-modes">'+BE.MODES.map(m=>'<button class="chip sm'+(R.base===m?' on':'')+'" data-ba="base:'+m+'">'+modeName(m)+(m==='حاوية'?' (أساسي)':' (فرعي)')+'</button>').join('')+'</div>'+
  '<div id="beKpi"></div><div id="beWarn" class="hint"></div>'+
  '<div class="be-sub">الأصناف وأسعار البيع</div>'+its+
  '<div class="be-btns"><button class="btn ghost" data-ba="add">+ صنف</button><button class="btn ghost" data-ba="fromSales">نسخ من المبيعات</button></div>'+
  '<div class="be-sub">أحسن توزيع للباليتات <small>بحوث العمليات — برمجة خطية</small></div><div id="beOpt"></div>'+
  '<div class="be-sub">الحساسية <small>سعر الخام للتعادل لو حاجة اتغيرت</small></div><div id="beSen"></div>'+
  '<details class="be-det"'+(R._open?' open':'')+'><summary>التكاليف من برنامج تكاليف الموالح <small>'+esc(R.src||'')+'</small></summary>'+
   '<div class="grid">'+inp('raw',R.raw,'ج/كجم','سعر الخام الحالي (للمقارنة)')+inp('cullP',R.cullP,'ج/كجم','سعر بيع الفرزة محلي')+inp('loss',R.loss,'%','الهالك من الخام')+inp('cull',R.cull,'%','الفرزة بعد الهالك')+inp('pw',R.pw,'%','هالك العبوات')+
   inp('cap.حاوية',R.cap['حاوية'],'باليت','سعة الحاوية')+inp('cap.براد',R.cap['براد'],'باليت','سعة البراد')+'</div>'+
   '<div class="be-sub sm">أسعار العبوات <small>ج / عبوة</small></div><div class="be-tbl">'+R.pkp.map((p,i)=>'<div class="r3"><span>'+esc(p[0])+'</span><input class="v" inputmode="decimal" data-rb="pkp.'+i+'.1" value="'+esc(p[1])+'"><span></span></div>').join('')+'</div>'+
   '<div class="be-sub sm">مستلزمات الإنتاج <small>ج / طن صافي</small></div><div class="be-tbl">'+R.sup.map((p,i)=>'<div class="r3"><span>'+esc(p[0])+'</span><input class="v" inputmode="decimal" data-rb="sup.'+i+'.1" value="'+esc(p[1])+'"><span></span></div>').join('')+'</div>'+
   '<div class="be-sub sm">غسيل المحطة لكل صنف <small>ج / طن</small></div><div class="be-tbl">'+R.wash.map((p,i)=>'<div class="r3"><span>'+esc(p[0])+'</span><input class="v" inputmode="decimal" data-rb="wash.'+i+'.1" value="'+esc(p[1])+'"><span></span></div>').join('')+'</div>'+
   '<div class="be-sub sm">لصق من برنامج التكاليف</div><textarea id="bePaste" rows="2" placeholder="في تكاليف الموالح دوس «نسخ التكاليف للصوافي» والصق هنا"></textarea><button class="btn ghost wide" data-ba="paste">استيراد التكاليف</button>'+
  '</details>'+
  '<div class="hint be-how">الحساب: صافي الطن = سعر الكرتونة × (1 − العمولة) × عدد الكراتين في الطن ÷ ريال/$ × ج/$ − نصيب الطن من مصروفات ونولون الشحنة (نفس الصوافي). '+
  'سعر الخام للتعادل = (صافي الطن − العبوات − المستلزمات − الغسيل + الفرزة المباعة محلي) ÷ الكيلوهات الخام اللي بتطلع طن صافي (نفس تكاليف الموالح). أحسن توزيع = أعلى سعر خام ممكن (Dinkelbach + Simplex).</div>';
 if(window.fixSelects)try{fixSelects(host)}catch(e){}
 host.querySelectorAll('select[data-rbs]').forEach(s=>{const v=get(s.dataset.rbs);s.value=v==null?'':String(v)});
 live()}
function get(path){const a=path.split('.');let o=S.rb;for(const k of a){if(o==null)return null;o=o[k]}return o}
function set(path,v){const a=path.split('.');let o=S.rb;for(let i=0;i<a.length-1;i++){o=o[a[i]]}o[a[a.length-1]]=v}
function live(){const host=document.getElementById('be');if(!host)return;const R=rb(),base=R.base,oth=OTHER(base);
 const Cb=BE.ctx(S,base),Co=BE.ctx(S,oth);const nb=planFor(R,base),no=planFor(R,oth);const pb=BE.planBE(Cb,R.items,nb),po=BE.planBE(Co,R.items,no);
 const raw=+R.raw||0;const k=document.getElementById('beKpi');
 const kp=(p,C,m,main)=>'<div class="kpi'+(main?' wide be-main':'')+(p.R!=null&&p.R<raw?' neg':'')+'"><span>'+(main?'أقصى سعر خام للتعادل — ':'')+modeName(m)+(main?'':' (مقارنة)')+'</span><b>'+(p.R==null?'—':'<span class="num">'+f(p.R)+'</span> ج/كجم')+'</b><em>'+(p.R==null?'اكتب الأصناف والباليتات':'= <span class="num">'+f(p.Rton,0)+'</span> ج لطن الخام · <span class="num">'+f(p.T,2)+'</span> طن صافي')+'</em>'+
  (p.R!=null?'<em class="sm2">على خام <span class="num">'+f(raw)+'</span> ج/كجم: '+plTxt(p.profitAt(raw)/p.T)+' ج/طن · الشحنة '+plTxt(p.profitAt(raw))+' ج</em>':'')+'</div>';
 k.innerHTML='<div class="kpis">'+kp(pb,Cb,base,true)+kp(po,Co,oth,false)+'<div class="kpi"><span>الفرق '+modeName(base)+' − '+modeName(oth)+'</span><b>'+(pb.R!=null&&po.R!=null?'<span class="num">'+f(pb.R-po.R)+'</span> ج/كجم':'—')+'</b><em>'+(pb.R!=null&&po.R!=null?(pb.R>=po.R?modeName(base)+' أحسن':modeName(oth)+' أحسن'):'')+'</em></div></div>';
 const w=[];const tot=nb.reduce((a,b)=>a+b,0);
 if(Cb.frMissing||Co.frMissing)w.push('⚠ نولون '+[Cb,Co].filter(c=>c.frMissing).map(c=>modeName(c.mode)).join(' و')+' مش متدخل في الأساسيات — التعادل محسوب من غير نولون');
 if(tot&&Math.abs(tot-Cb.cap)>1e-9)w.push('الخطة '+f(tot,0)+' باليت من سعة '+modeName(base)+' '+f(Cb.cap,0)+' — المصروفات متوزعة على '+f(tot,0)+' باليت بس');
 if(Cb.noClient)w.push('⚠ العميل مش موجود — العمولة صفر');
 R.items.forEach((it,i)=>{const x=BE.item(Cb,it);if(x.missPk&&it.pk)w.push('⚠ سعر عبوة «'+it.pk+'» مش في جدول التكاليف — محسوب صفر');if(x.missWash&&it.v)w.push('⚠ غسيل «'+it.v+'» مش في الجدول — محسوب صفر')});
 document.getElementById('beWarn').innerHTML=w.map(esc).join('<br>');
 R.items.forEach((it,i)=>{const o=host.querySelector('[data-bo="'+i+'"]');if(!o)return;const a=BE.itemBE(Cb,it),b=BE.itemBE(Co,it);const x=BE.item(Cb,it);
  const per1=x.ok?(1-Cb.comm)*(1000/x.w)/Cb.u*Cb.E/Cb.k:null;const pr=BE.priceForRaw(Cb,it,raw);
  o.innerHTML=x.ok?'<div class="be-r"><span>لو مالي '+modeName(base)+' لوحده</span><b class="num">'+fe(a.R)+'</b><span>ج/كجم خام</span></div><div class="be-r sm"><span>'+modeName(oth)+'</span><b class="num">'+fe(b.R)+'</b><span>ج/كجم</span></div>'+
   '<div class="hint">كل 1 ريال في سعر الكرتونة = <span class="num">'+fe(per1,3)+'</span> ج/كجم خام · علشان خام <span class="num">'+f(raw)+'</span> ج تبيع بـ <span class="num">'+fe(pr)+'</span> ريال على الأقل</div>':'<div class="hint">اختار العبوة واكتب كراتين الباليت</div>'});
 /* بحوث العمليات */
 const ob=BE.optimize(Cb,R.items),oo=BE.optimize(Co,R.items);const op=document.getElementById('beOpt');
 if(ob.status!=='ok'){op.innerHTML='<div class="hint">اكتب صنف واحد على الأقل بسعر وكراتين باليت.</div>'}
 else{op.innerHTML='<div class="bk"><table><tr class="h"><td>الصنف</td><td class="vh">خطتك</td><td class="vh">الأحسن</td></tr>'+R.items.map((it,i)=>'<tr><td>'+esc([it.v,it.sz,it.pk].filter(Boolean).join(' · '))+'</td><td class="vh num">'+f(nb[i]||0,0)+'</td><td class="vh num"><b>'+f(ob.ni[i],0)+'</b></td></tr>').join('')+
  '<tr class="s"><td>سعر الخام للتعادل '+modeName(base)+'</td><td class="vh num">'+fe(pb.R)+'</td><td class="vh num"><b>'+fe(ob.Rint)+'</b></td></tr>'+
  '<tr><td>'+modeName(oth)+' (أحسن توزيع)</td><td class="vh num">'+fe(po.R)+'</td><td class="vh num">'+(oo.status==='ok'?fe(oo.Rint):'—')+'</td></tr></table>'+
  '<div class="hint">الأحسن = توزيع باليتات '+modeName(base)+' ('+f(Cb.cap,0)+' باليت) اللي يدّي أعلى سعر خام، مع الحد الأقصى ونسبة المقاس من الفرز لو مكتوبين.'+(ob.full?'':' ⚠ الحدود القصوى مش مكمّلة السعة.')+'</div>'+
  '<button class="btn ghost wide" data-ba="apply">طبّق الأحسن على الخطة</button></div>'}
 const sn=BE.sensitivity(S,base,R.items,nb);document.getElementById('beSen').innerHTML=sn.base==null?'':'<div class="bk"><table><tr class="h"><td>لو</td><td class="vh">ج/كجم خام</td><td class="vh">الفرق</td></tr>'+sn.rows.map(r=>'<tr><td>'+esc(r.n)+'</td><td class="vh num">'+fe(r.R)+'</td><td class="vh num">'+(r.d==null?'—':(r.d>=0?'+':'')+f(r.d))+'</td></tr>').join('')+'</table></div>'}
function onInput(e){const t=e.target;if(!t.dataset||t.dataset.rb==null)return;rb();const path=t.dataset.rb,raw=t.value,opt=/\.(max|share)$/.test(path);
 if(!String(raw).trim()&&opt){set(path,'');t.classList.remove('bad');save();live();return}
 const x=parseNum(raw);const bad=!isFinite(x)||x<0||(/^(loss|cull|pw)$/.test(path)||/\.share$/.test(path))&&x>=100;t.classList.toggle('bad',bad);if(bad)return;
 set(path,x);if(/^(raw|cullP|loss|cull|pw|pkp|sup|wash)/.test(path))S.rb.src='معدّل يدوي';save();live()}
document.addEventListener('input',onInput);
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||t.dataset.rbs==null)return;rb();set(t.dataset.rbs,t.value);
 const m=t.dataset.rbs.match(/^items\.(\d+)\.(v|pk)$/);if(m){const it=S.rb.items[+m[1]];if(it&&it.sz){const L=[];try{const g=ALS.groupOf(it.v);const r=g&&ALS.sizesFor(g,ALS.packOf(g,it.pk));if(Array.isArray(r))r.forEach(s=>L.push(String(s)))}catch(x){}if(L.length&&L.indexOf(String(it.sz))<0)it.sz=''}}
 save();render()});
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('be-det')){rb();S.rb._open=e.target.open;save()}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ba]');if(!b)return;const R=rb(),a=b.dataset.ba;
 if(a.startsWith('base:')){R.base=a.slice(5)}
 else if(a==='add'){const pv=R.items[R.items.length-1]||{};R.items.push({v:pv.v||'',sz:'',pk:pv.pk||(S.pk[0]?S.pk[0][0]:''),cpp:pv.cpp||'',p:'',pal:0,max:'',share:''})}
 else if(a.startsWith('del:')){const i=+a.slice(4);if(!confirm('تحذف الصنف ده من حساب التعادل؟'))return;R.items.splice(i,1)}
 else if(a==='fromSales'){const L=S.lines.filter(l=>+l[2]);if(!L.length){alert('مفيش سطور بيع فيها كراتين.');return}if(!confirm('تستبدل أصناف التعادل بسطور المبيعات الحالية ('+L.length+')؟'))return;
  R.items=L.map(l=>{const m=l[7]&&typeof l[7]==='object'?l[7]:{};return {v:m.v||String(l[0]||'').replace(/\s*مقاس.*$/,''),sz:m.s||'',pk:l[1],cpp:+l[5]||0,p:+l[3]||0,pal:+l[4]||0,max:'',share:''}})}
 else if(a==='apply'){const o=BE.optimize(BE.ctx(S,R.base),R.items);if(o.status!=='ok')return;o.ni.forEach((v,i)=>R.items[i].pal=v)}
 else if(a==='paste'){const tx=(document.getElementById('bePaste')||{}).value||'';const c=BE.parseCosts(tx);if(!c){alert('النص ده مش من برنامج تكاليف الموالح. دوس هناك «نسخ التكاليف للصوافي» والصقه هنا.');return}
  Object.assign(R,c);R.src='تكاليف الموالح — اتلصق '+today()}
 else return;
 save();render()});
/* ربط بالواجهة الأصلية من غير تغيير الحساب */
const _ra=window.renderAll,_rl=window.renderLive;
window.renderAll=function(){_ra.apply(this,arguments);render()};
window.renderLive=function(){_rl.apply(this,arguments);live()};
window.SFBE={render,live,rb};
render();
})();
