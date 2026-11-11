/* الصوافي — الواجهة والتقرير (v1.0.0). الحساب كله من calc() الأصلية في core.js */
const VER='1.0.0';
/* تحميل البيانات المحفوظة — نفس مفتاح وشكل وتحويل البرنامج الأصلي */
const SK='safiNetback.v2';let S=_ld(SK,'safiNetback');
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const N=x=>'<span class="num">'+x+'</span>';
const P=x=>'<span class="num">'+x+'</span>';
function pl(v){return v>=0?'ربح '+f(v):'خسارة '+f(-v)}            // منسوخة من الأصلي
const plH=v=>pl(v).replace(/([\d,.-]+)/,'<span class="num">$1</span>');
function D(x){const m=String(x||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:x}
function today(){const d=new Date();return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()}
const pct=(v,b)=>b?f(v/b*100,1)+'%':'—';
let ERR={},DR={};            // أخطاء المدخلات والنص المكتوب غلط — مفتاح منفصل (S فيها آخر قيمة صحيحة)
const UK='safiNetback.v2.pending';try{const u=JSON.parse(localStorage.getItem(UK)||'null');if(u&&u.ERR&&u.DR){ERR=u.ERR;DR=u.DR}}catch(e){}
let lastT=null;
function save(){try{lastT=Date.now();localStorage.setItem(SK,JSON.stringify({ver:2,t:lastT,S}));if(Object.keys(ERR).length)localStorage.setItem(UK,JSON.stringify({ERR,DR}));else localStorage.removeItem(UK);showSaved()}catch(e){const n=$('#ls');if(n)n.textContent='تعذّر الحفظ على الجهاز (وضع التصفح الخاص؟)'}}
function showSaved(){const n=$('#ls');if(!n||!lastT)return;const d=new Date(lastT);n.textContent='آخر حفظ '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
try{const p=JSON.parse(localStorage.getItem(SK)||'null');if(p&&p.t)lastT=p.t}catch(e){}
window.addEventListener('pagehide',()=>save());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});

/* ---------- المدخلات ---------- */
const FIELDS=[['sec','أسعار الصرف'],['sar','سعر الدولار بالريال','ريال / $'],['egp','سعر الدولار بالجنيه','ج / $'],
 ['sec','النولون من مصر'],['fC','نولون الحاوية','$','حاوية'],['fB','نولون البراد','ريال','براد'],
 ['sec','المقارنة'],['cost','تكلفة الطن هنا (من تكاليف الموالح)','ج / طن']];
function shown(k){const key='k:'+k;if(key in DR)return DR[key];return S[k]}
function renderInputs(){let h='<div class="f full"><label>تاريخ الحساب</label><div class="in"><input type="date" data-date="1" value="'+esc(S.date)+'"></div></div>';
 FIELDS.forEach(x=>{if(x[0]=='sec'){h+='<div class="sec">'+x[1]+'</div>';return}const key='k:'+x[0];
  h+='<div class="f'+(x[0]=='cost'?' full':'')+'"><label>'+x[1]+'</label><div class="in'+(ERR[key]?' bad':'')+'"><input inputmode="decimal" data-k="'+x[0]+'" value="'+esc(shown(x[0]))+'"><span class="u">'+x[2]+'</span></div>'+
  (ERR[key]?'<div class="emsg" data-for="'+key+'">'+ERR[key]+'</div>':'')+(x[3]?'<div class="hint'+(S.mode==x[3]?' on':'')+'" data-mh="'+x[3]+'">'+(S.mode==x[3]?'محسوب — الشحن '+x[3]:'مش محسوب — الشحن مش '+x[3])+'</div>':'')+'</div>'});
 $('#inputs').innerHTML=h}
function val(key,v){return key in DR?DR[key]:v}
function cell(key,v,cls,ph){const bad=ERR[key];return '<input class="'+(cls||'')+(bad?' bad':'')+'" '+(cls=='v'?'inputmode="decimal" ':'')+(ph?'aria-label="'+ph+'" ':'')+'data-t="'+key+'" value="'+esc(val(key,v))+'">'}
function pkOpts(sel){let o=S.pk.map(p=>'<option'+(p[0]===sel?' selected':'')+'>'+esc(p[0])+'</option>').join('');if(!S.pk.some(p=>p[0]===sel))o='<option selected value="'+esc(sel)+'">'+esc(sel)+' (مش في جدول العبوات)</option>'+o;return o}
function renderTables(){
 $('#lt').innerHTML='<div class="lhd"><span>العبوة</span><span>العدد</span><span>السعر ريال</span></div>'+S.lines.map((l,i)=>'<div class="ln"><div class="r1">'+cell('lines:'+i+':0',l[0],'txt','الصنف / المقاس')+'<button class="x" data-del="lines:'+i+'" aria-label="حذف">×</button></div><div class="r2"><select data-t="lines:'+i+':1" aria-label="نوع العبوة">'+pkOpts(l[1])+'</select>'+cell('lines:'+i+':2',l[2],'v','العدد')+cell('lines:'+i+':3',l[3],'v','سعر العبوة')+'</div>'+errMsgs('lines:'+i)+'<div class="lv" data-lv="'+i+'"></div></div>').join('');
 const on=j=>((S.mode=='براد')==(j==1))?' class="on"':'';
 const md=j=>((S.mode=='براد')==(j==1))?' on':' off';
 $('#et').innerHTML=S.exp.map((e,i)=>'<div class="ln"><div class="r1">'+cell('exp:'+i+':0',e[0],'txt','البند')+'<button class="x" data-del="exp:'+i+'" aria-label="حذف">×</button></div><div class="r2e"><div class="mi'+md(1)+'"><span>براد</span>'+cell('exp:'+i+':1',e[1],'v','براد')+'</div><div class="mi'+md(2)+'"><span>حاوية</span>'+cell('exp:'+i+':2',e[2],'v','حاوية')+'</div></div>'+errMsgs('exp:'+i)+'</div>').join('')+
  '<div class="r2e tt"><div class="mi'+md(1)+'"><span>إجمالي البراد</span><b id="eB" class="num"></b></div><div class="mi'+md(2)+'"><span>إجمالي الحاوية</span><b id="eC" class="num"></b></div></div>';
 $('#ct').innerHTML='<div class="r3 th"><span>العميل</span><span>العمولة %</span><span></span></div>'+S.clients.map((c,i)=>'<div class="r3">'+cell('clients:'+i+':0',c[0])+cell('clients:'+i+':1',+(c[1]*100).toFixed(4),'v','العمولة %')+'<button class="x" data-del="clients:'+i+'" aria-label="حذف">×</button></div>'+errMsgs('clients:'+i)).join('');
 $('#pt').innerHTML='<div class="r3 th"><span>نوع العبوة</span><span>الوزن كجم</span><span></span></div>'+S.pk.map((p,i)=>'<div class="r3">'+cell('pk:'+i+':0',p[0])+cell('pk:'+i+':1',p[1],'v','الوزن كجم')+'<button class="x" data-del="pk:'+i+'" aria-label="حذف">×</button></div>'+errMsgs('pk:'+i)).join('')}
function errMsgs(pre){return Object.keys(ERR).filter(k=>k.startsWith(pre+':')).map(k=>'<div class="emsg sm" data-for="'+k+'">'+esc(errName(k))+': '+ERR[k]+'</div>').join('')}
function renderChips(){
 $('#clis').innerHTML=S.clients.map((c,i)=>'<button class="chip'+(c[0]===S.client?' on':'')+'" data-c="'+i+'">'+esc(c[0])+'<span class="pc num">'+f(c[1]*100,1)+'%</span></button>').join('');
 $('#modes').innerHTML=['حاوية','براد'].map(m=>'<button class="chip sm'+(m===S.mode?' on':'')+'" data-m="'+m+'">'+m+'</button>').join('')}
const COLN={lines:{2:'العدد',3:'السعر'},exp:{1:'براد',2:'حاوية'},clients:{1:'العمولة'},pk:{1:'الوزن'}};
function errName(k){const a=k.split(':');if(a[0]=='k')return RULES[a[1]][0];const row=(S[a[0]]||[])[a[1]]||[''];
 return {lines:'سطر',exp:'بند',clients:'عميل',pk:'عبوة'}[a[0]]+' «'+row[0]+'» — '+COLN[a[0]][a[2]]}
function errList(){return Object.keys(ERR).map(k=>errName(k)+': '+ERR[k])}

/* ---------- العرض المباشر ---------- */
function chainRows(r){return [['إجمالي المبيعات',r.sales],['العمولة ('+f(r.comm*100,1)+'%)',r.commV],['مصروفات '+S.mode+' في السعودية',r.expV],['نولون الشحن من مصر',r.frV],['الصافي بعد المصاريف',r.net,'t']]}
function renderLive(){const E=errList(),bad=E.length>0;document.body.classList.toggle('invalid',bad);
 $('#net').innerHTML=esc(S.client)+' · '+esc(S.mode);
 document.querySelectorAll('[data-mh]').forEach(h=>{const on=h.dataset.mh==S.mode;h.classList.toggle('on',on);h.textContent=on?'محسوب — الشحن '+h.dataset.mh:'مش محسوب — الشحن مش '+h.dataset.mh});
 if(bad){$('#notice').hidden=true;$('#sum').innerHTML='<div class="lbl">صافي الطن هنا</div><div class="big"><span class="egp num">—</span></div><div class="err"><b>مفيش حساب لحد ما تصحح الخانات المعلّمة:</b><ul>'+E.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul></div>';
  ['#mojmal','#detail'].forEach(s=>$(s).innerHTML='<h2>'+{'#mojmal':'المجمل','#detail':'التفاصيل'}[s]+'</h2><div class="hint">هيظهر بعد تصحيح المدخلات.</div>');['#eB','#eC'].forEach(s=>{const e=$(s);if(e)e.textContent='—'});document.querySelectorAll('[data-lv]').forEach(e=>e.textContent='');return}
 const r=calc(S),u=S.sar,E2=S.egp;window.__r=r;
 const nv=$('#notice');nv.hidden=!r.warn;nv.textContent=r.warn||'';
 $('#sum').innerHTML='<div class="lbl">صافي الطن هنا — '+esc(S.client)+' · '+esc(S.mode)+'</div><div class="big"><span class="egp num">'+f(r.tonEgp)+'<i>ج</i></span><span class="usd num">$'+f(r.tonUsd)+'</span></div>'+
  '<div class="kpis six">'+
  '<div class="kpi"><span>صافي الكيلو</span><b class="num">'+f(r.kgEgp)+' ج</b><em class="num">$'+f(r.tonUsd/1000,3)+'</em></div>'+
  '<div class="kpi"><span>صافي العبوة (متوسط)</span><b class="num">'+f(r.pkgEgp)+' ج</b><em><span class="num">$'+f(r.pkgUsd)+'</span> · <span class="num">'+f(r.pkgSar)+'</span> ريال</em></div>'+
  '<div class="kpi"><span>صافي الشحنة</span><b class="num">'+f(r.netEgp)+' ج</b><em><span class="num">$'+f(r.net/S.sar)+'</span> · <span class="num">'+f(r.net)+'</span> ريال</em></div>'+
  '<div class="kpi"><span>الكمية المباعة (عبوة)</span><b class="num">'+f(r.q,0)+'</b><em><span class="num">'+f(r.t,3)+'</span> طن</em></div>'+
  '<div class="kpi wide'+(r.plTon<0?' neg':'')+'"><span>مقارنة بتكلفة <span class="num">'+f(S.cost)+'</span> ج/طن</span><b>'+plH(r.plTon)+' ج / طن</b><em>الشحنة كلها: '+plH(r.plShip)+' ج</em></div>'+
  '<div class="kpi wide"><span>سعر التعادل (متوسط للعبوة)</span><b><span class="num">'+f(r.be)+'</span> ريال</b><em>متوسط البيع الحالي <span class="num">'+f(r.q?r.sales/r.q:0)+'</span> ريال</em></div></div>';
 const sales=r.sales,seg=[[r.net,''],[-r.commV,'ded2'],[-r.expV,'ded'],[-r.frV,'ded3']];
 $('#mojmal').innerHTML='<h2>المجمل <small>من المبيعات للصافي</small></h2>'+(sales>0?'<div class="bar">'+seg.map(s=>s[0]>0?'<i class="'+s[1]+'" style="width:'+Math.min(100,s[0]/sales*100)+'%"></i>':'').join('')+'</div>':'')+
  '<div class="bk"><table><tr class="h"><td>البند</td><td class="vh">ريال</td><td class="vh">ج / طن</td><td class="vh">%</td></tr>'+
  chainRows(r).map((x,i)=>'<tr'+(x[2]?' class="t"':'')+'><td>'+esc(['إجمالي المبيعات','العمولة '+f(r.comm*100,1)+'%','مصروفات السعودية','النولون من مصر','الصافي'][i])+'</td><td class="v">'+f(x[1])+'</td><td class="v">'+(r.t?f(x[1]/r.t/u*E2):'—')+'</td><td class="v">'+pct(x[1],sales)+'</td></tr>').join('')+
  '</table><div class="hint">الصافي = المبيعات − العمولة − مصروفات السعودية − النولون · الجنيه = الدولار × '+N(f(E2))+' · الدولار = '+N(f(u,4))+' ريال</div></div>';
 const V=(l,v)=>'<div><span>'+l+'</span><b class="num">'+v+'</b></div>';
 let d='<h2>التفاصيل <small>حسب سطر البيع</small></h2>'+(r.lines.length?r.lines.map(x=>'<div class="lc"><div class="nm">'+esc(x.n)+'<small>'+esc(x.p)+' · '+N(f(x.q,0))+' عبوة × '+N(f(x.pr))+' ريال</small></div><div class="vals">'+V('طن',f(x.t,3))+V('صافي الطن ج',f(x.nt*S.egp))+V('ربح/خسارة ج/طن',f(x.nt*S.egp-S.cost))+'</div></div>').join(''):'<div class="hint">مفيش سطور بيع فيها عدد.</div>');
 if(r.types.length)d+='<h2 style="margin-top:16px">حسب نوع العبوة</h2>'+r.types.map(x=>'<div class="lc"><div class="nm">'+esc(x.n)+'<small>'+N(f(x.q,0))+' عبوة · متوسط البيع '+N(f(x.avg))+' ريال</small></div><div class="vals">'+V('صافي العبوة $',f(x.np))+V('صافي الطن ج',f(x.nt*S.egp))+V('التعادل ريال/عبوة',f(x.be))+'</div></div>').join('');
 d+='<div class="hint" style="margin-top:8px">صافي كل سطر = مبيعاته بعد العمولة − نصيبه من المصروفات والنولون حسب الوزن. التعادل = سعر البيع للعبوة اللي يغطي تكلفة '+N(f(S.cost))+' ج/طن.</div>';
 $('#detail').innerHTML=d;
 const tB=S.exp.reduce((a,x)=>a+(+x[1]||0),0),tC=S.exp.reduce((a,x)=>a+(+x[2]||0),0);const eb=$('#eB'),ec=$('#eC');if(eb)eb.textContent=f(tB);if(ec)ec.textContent=f(tC);
 document.querySelectorAll('[data-lv]').forEach(e=>{const l=S.lines[+e.dataset.lv];if(!l)return;const q=+l[2];e.innerHTML=q?'المبيعات '+N(f(q*+l[3]))+' ريال':'العدد صفر — السطر مش داخل في الحساب'})}
function renderAll(){renderChips();renderInputs();renderTables();renderLive();showSaved();$('#ver').textContent='· v'+VER}

/* ---------- الأحداث ---------- */
function setErr(key,msg,raw){if(msg){ERR[key]=msg;DR[key]=raw}else{delete ERR[key];delete DR[key]}}
function markBad(el,key){if(el.dataset.k){const box=el.parentNode;box.classList.toggle('bad',!!ERR[key]);box.parentNode.querySelectorAll('.emsg[data-for="'+key+'"]').forEach(m=>m.remove());
  if(ERR[key]){const m=document.createElement('div');m.className='emsg';m.dataset.for=key;m.textContent=ERR[key];box.insertAdjacentElement('afterend',m)}return}
 el.classList.toggle('bad',!!ERR[key]);const a=key.split(':'),cont=el.closest('.ln')||el.closest('.r4,.r3');if(!cont)return;
 const host=el.closest('.ln')?cont:cont.parentNode;host.querySelectorAll('.emsg[data-for="'+key+'"]').forEach(m=>m.remove());
 if(ERR[key]){const m=document.createElement('div');m.className='emsg sm';m.dataset.for=key;m.textContent=errName(key)+': '+ERR[key];if(el.closest('.ln'))cont.querySelector('.r2,.r2e').insertAdjacentElement('afterend',m);else cont.insertAdjacentElement('afterend',m)}}
const NUMRULE={lines:{2:'ge0',3:'ge0'},exp:{1:'ge0',2:'ge0'},clients:{1:'pct'},pk:{1:'gt0'}};
document.addEventListener('input',e=>{const t=e.target;
 if(t.id=='rMode')return;
 if(t.dataset.date){S.date=t.value;save();renderLive();return}
 if(t.dataset.k){const k=t.dataset.k,key='k:'+k,msg=checkVal(t.value,RULES[k][1]);setErr(key,msg,t.value);if(!msg)S[k]=toStore(t.value);markBad(t,key);save();renderLive();return}
 if(t.dataset.t){const [a,i,j]=t.dataset.t.split(':'),row=S[a][+i];if(!row)return;
  if(t.tagName=='SELECT'){row[+j]=t.value;save();renderLive();return}
  if(j=='0'){const old=row[0];row[0]=t.value;                 // نفس سلوك الأصلي في تغيير الأسماء
   if(a=='clients'&&S.client==old)S.client=t.value;
   if(a=='pk')S.lines.forEach(l=>{if(l[1]==old)l[1]=t.value});
   save();renderLive();return}
  const msg=checkVal(t.value,NUMRULE[a][j],true);setErr(t.dataset.t,msg,t.value);if(!msg)row[+j]=toStore(t.value,a=='clients');markBad(t,t.dataset.t);save();renderLive()}});
document.addEventListener('change',e=>{const t=e.target;if(t.id=='rMode'){REPMODE=t.value;buildPages();fit();return}
 if(t.dataset.t&&t.dataset.t.endsWith(':0')){const a=t.dataset.t.split(':')[0];if(a=='clients'||a=='pk'){save();renderChips();renderTables();renderLive()}return}
 const key=t.dataset.k?'k:'+t.dataset.k:t.dataset.t;if(!key||t.tagName=='SELECT'||ERR[key])return;if(String(t.value).trim()==='')return;const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x)});
function blocked(){const E=errList();if(!E.length)return false;alert('صحّح الخانات دي الأول:\n• '+E.join('\n• '));return true}
function clearErrs(a){Object.keys(ERR).filter(k=>k.startsWith(a+':')).forEach(k=>{delete ERR[k];delete DR[k]})}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.c!=null){S.client=S.clients[+t.dataset.c][0];save();renderChips();renderLive()}
 else if(t.dataset.m){S.mode=t.dataset.m;save();renderChips();renderTables();renderLive()}
 else if(t.dataset.add){const a=t.dataset.add;   // نفس قيم الإضافة في البرنامج الأصلي
  S[a].push(a=='lines'?['صنف',S.pk[0]?S.pk[0][0]:'',0,0]:a=='exp'?['بند جديد',0,0]:a=='clients'?['عميل جديد',0.05]:['عبوة جديدة',10]);save();renderAll()}
 else if(t.dataset.del){const [a,i]=t.dataset.del.split(':'),row=S[a][+i];if(!row)return;
  if(a=='pk'&&S.lines.some(l=>l[1]===row[0])&&!confirm('العبوة «'+row[0]+'» مستخدمة في سطور بيع، ووزنها هيتحسب صفر لو اتحذفت. تحذفها؟'))return;
  if(a=='clients'&&row[0]===S.client&&!confirm('ده العميل المختار؛ لو اتحذف العمولة هتتحسب صفر لحد ما تختار عميل تاني. تحذفه؟'))return;
  S[a].splice(+i,1);clearErrs(a);save();renderAll()}
 else if(t.id=='bReset'){if(!confirm('ترجع لأرقام الملف الأصلية؟ كل أرقامك هتتمسح.'))return;S=JSON.parse(JSON.stringify(DEF));ERR={};DR={};save();renderAll()}
 else if(t.id=='bReport'){if(blocked())return;openRep()}
 else if(t.id=='bPrint'||t.id=='rPrint'){if(blocked())return;buildPages();$('#rep').hidden=false;fit();setTimeout(()=>window.print(),350)}
 else if(t.id=='bShare'||t.id=='rShare'){if(blocked())return;sharePdf()}
 else if(t.id=='rClose'){$('#rep').hidden=true;document.body.style.overflow=''}});

/* ---------- التقرير ---------- */
let REPMODE='full';
function repParts(){const r=calc(S),u=S.sar,E=S.egp,full=REPMODE=='full';
 const code=full?'RT-20261028-012':'RT-20261028-013';
 const head=t=>'<div class="ph"><div><h1>'+t+'</h1><div class="meta">تاريخ الحساب <span class="ltr">'+esc(D(S.date))+'</span> — العميل '+esc(S.client)+' (عمولة <span class="ltr">'+f(r.comm*100,1)+'%</span>) — الشحن '+esc(S.mode)+' — الدولار <span class="ltr">'+f(S.sar,4)+'</span> ريال — <span class="ltr">'+f(S.egp)+'</span> ج</div></div><span class="tag">الصوافي</span></div>';
 const R=(n,v,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+esc(n)+'</td><td class="n">'+f(v)+'</td><td class="n">'+f(v/u)+'</td><td class="n">'+f(v/u*E)+'</td><td class="n">'+(r.t?f(v/r.t/u*E):'—')+'</td><td class="n">'+pct(v,r.sales)+'</td></tr>';
 const warn=r.warn?'<div class="rwarn">'+esc(r.warn)+'</div>':'';
 const F=(x,d)=>'<span class="ltr">'+f(x,d)+'</span>',F$=(x,d)=>'<span class="ltr">$'+f(x,d)+'</span>';
 const plB=v=>pl(v).replace(/([\d,.-]+)/,'<span class="ltr">$1</span>');
 const p1=head((full?'تقرير مفصل':'تقرير مجمل')+' — صافي سعر البيع في السعودية راجع لمصر')+
 '<h3>الملخص</h3><div class="rsum"><div class="m main"><span>صافي الطن هنا</span><b>'+F(r.tonEgp)+' ج</b><em>'+F$(r.tonUsd)+'</em><small>صافي الشحنة ÷ '+f(r.t,3)+' طن، بالجنيه بسعر '+f(S.egp)+'</small></div>'+
 '<div class="m"><span>صافي الكيلو</span><b>'+F(r.kgEgp,3)+' ج</b><em>'+F$(r.tonUsd/1000,3)+'</em><small>صافي الطن ÷ 1000 كجم</small></div>'+
 '<div class="m"><span>صافي العبوة (متوسط)</span><b>'+F(r.pkgEgp)+' ج</b><em>'+F$(r.pkgUsd)+' — '+F(r.pkgSar)+' ريال</em><small>صافي الشحنة ÷ '+f(r.q,0)+' عبوة</small></div>'+
 '<div class="m"><span>صافي الشحنة</span><b>'+F(r.netEgp)+' ج</b><em>'+F$(r.net/u)+' — '+F(r.net)+' ريال</em><small>المبيعات بعد العمولة والمصروفات والنولون</small></div></div>'+
 '<div class="rsum3"><div class="m'+(r.plTon<0?' neg':'')+'"><span>الربح / الخسارة للطن</span><b>'+plB(r.plTon)+' ج</b><em>'+F$(Math.abs(r.plTon/S.egp))+'</em><small>صافي الطن '+F(r.tonEgp)+' − تكلفة الطن '+F(S.cost)+' ج</small></div>'+
 '<div class="m'+(r.plShip<0?' neg':'')+'"><span>الربح / الخسارة للشحنة</span><b>'+plB(r.plShip)+' ج</b><em>'+F$(Math.abs(r.plShip/S.egp))+'</em><small>الربح/الخسارة للطن × '+f(r.t,3)+' طن</small></div>'+
 '<div class="m"><span>سعر التعادل في السعودية</span><b>'+F(r.be)+' ريال للعبوة</b><em>المتوسط الحالي '+F(r.q?r.sales/r.q:0)+' ريال</em><small>متوسط سعر البيع اللي يغطي التكلفة</small></div></div>'+warn+
 '<h3>المجمل — من المبيعات للصافي</h3><table class="rt"><thead><tr><th>البند (الشحنة كلها)</th><th>ريال</th><th>دولار</th><th>جنيه</th><th>ج / طن</th><th>% من المبيعات</th></tr></thead><tbody>'+
 chainRows(r).map(x=>R(x[0],x[1],x[2]?'gt':'')).join('')+'</tbody></table><div class="note">الصافي = المبيعات − العمولة − مصروفات السعودية − النولون؛ الجنيه = الدولار × '+f(E)+'. الكمية: '+f(r.q,0)+' عبوة — '+f(r.t,3)+' طن.</div>';
 const blocks=[];
 if(full){const LH='<thead><tr><th>الصنف</th><th>العبوة</th><th>العدد</th><th>سعر ريال</th><th>طن</th><th>صافي الطن $</th><th>صافي الطن ج</th><th>ربح/خسارة ج/طن</th></tr></thead>';
  const LR=r.lines.map(x=>'<tr><td>'+esc(x.n)+'</td><td>'+esc(x.p)+'</td><td class="n">'+f(x.q,0)+'</td><td class="n">'+f(x.pr)+'</td><td class="n">'+f(x.t,3)+'</td><td class="n">'+f(x.nt)+'</td><td class="n">'+f(x.nt*S.egp)+'</td><td class="n">'+f(x.nt*S.egp-S.cost)+'</td></tr>');
  const CH=26;for(let i=0;i<Math.max(1,LR.length);i+=CH)blocks.push('<h3>حسب سطر البيع'+(i?' (تابع)':'')+'</h3><table class="rt sm">'+LH+'<tbody>'+(LR.slice(i,i+CH).join('')||'<tr><td colspan="8">مفيش سطور بيع فيها عدد.</td></tr>')+'</tbody></table>'+(i+CH>=LR.length?'<div class="note">صافي كل سطر = مبيعاته بعد العمولة − نصيبه من المصروفات والنولون حسب الوزن.</div>':''));
  blocks.push('<h3>حسب نوع العبوة</h3><table class="rt sm"><thead><tr><th>العبوة</th><th>العدد</th><th>طن</th><th>المبيعات ريال</th><th>متوسط ريال</th><th>العمولة</th><th>نصيبه من المصروفات</th><th>الصافي ريال</th><th>صافي الطن $</th><th>صافي العبوة $</th><th>التعادل ريال/عبوة</th></tr></thead><tbody>'+
   r.types.map(x=>'<tr><td>'+esc(x.n)+'</td><td class="n">'+f(x.q,0)+'</td><td class="n">'+f(x.t,3)+'</td><td class="n">'+f(x.v)+'</td><td class="n">'+f(x.avg)+'</td><td class="n">'+f(x.f)+'</td><td class="n">'+f(x.g)+'</td><td class="n">'+f(x.h)+'</td><td class="n">'+f(x.nt)+'</td><td class="n">'+f(x.np)+'</td><td class="n">'+f(x.be)+'</td></tr>').join('')+
   '</tbody></table><div class="note">سعر التعادل = سعر البيع للعبوة اللي يغطي تكلفة '+f(S.cost)+' ج/طن بعد العمولة والمصروفات.</div>');
  blocks.push('<h3>مصروفات '+esc(S.mode)+' في السعودية (ريال)</h3><table class="rt"><thead><tr><th>البند</th><th>ريال</th></tr></thead><tbody>'+S.exp.map(e=>'<tr><td>'+esc(e[0])+'</td><td class="n">'+f(S.mode=='براد'?e[1]:e[2])+'</td></tr>').join('')+'<tr class="gt"><td>الإجمالي</td><td class="n">'+f(r.expT)+'</td></tr></tbody></table><div class="note">مصروفات مشتركة موزّعة على الأصناف حسب الوزن.</div>');
  blocks.push('<h3>ملاحظات</h3><ul><li>العمولة نسبة من مبيعات كل سطر حسب العميل.</li><li>مصروفات السعودية والنولون موزّعة حسب الوزن (العدد × وزن العبوة).</li><li>نولون الحاوية بالدولار والبراد بالريال.</li><li>تكلفة الطن للمقارنة مدخلة يدويًا (افتراضي من تكاليف الموالح).</li></ul>')}
 return {p1,blocks,head:head('تفاصيل الصوافي — '+esc(S.client)),code}}
const AVAIL=1123-36-62;
/* بيبني الصفحات جوه root (لازم يكون ظاهر عشان القياس) */
function layout(root){const P=repParts();root.innerHTML='';const pages=[];
 const mk=(h,cls)=>{const pg=document.createElement('div');pg.className='page';pg.innerHTML='<div class="pc'+(cls?' '+cls:'')+'">'+h+'</div>';const w=document.createElement('div');w.className='pagewrap';w.appendChild(pg);root.appendChild(w);pages.push(pg);return pg.firstChild};
 mk(P.p1,'p1');let pc=null,n=0;
 P.blocks.forEach(b=>{if(!pc){pc=mk(P.head);n=0}const d=document.createElement('div');d.innerHTML=b;pc.appendChild(d);n++;
  if(pc.offsetHeight>AVAIL&&n>1){d.remove();pc=mk(P.head);pc.appendChild(d);n=1}});
 pages.forEach((pg,i)=>{const ft=document.createElement('div');ft.className='pf';ft.innerHTML='<span class="ltr">'+P.code+'</span><span>صافي البيع في السعودية راجع لمصر · طُبع <span class="ltr">'+today()+'</span></span><span>صفحة '+(i+1)+' من '+pages.length+'</span>';pg.appendChild(ft)});
 shrink(root);return pages}
function shrink(root){root.querySelectorAll('.page').forEach(pg=>{const pc=pg.querySelector('.pc');pc.style.transform='';pc.style.width='';let h=pc.offsetHeight;if(h>AVAIL){let s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';h=pc.offsetHeight;s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';pc.style.transformOrigin='top right';pc.style.transform='scale('+s+')'}})}
function buildPages(){$('#rep').hidden=false;$('#rMode').value=REPMODE;const pg=$('#pages');document.querySelectorAll('.pagewrap .page').forEach(p=>p.style.transform='');layout(pg)}
function fit(){document.querySelectorAll('#pages .pagewrap').forEach(w=>{const pg=w.firstChild,s=Math.min(1,w.clientWidth/794);pg.style.transform='scale('+s+')';w.style.height=(1123*s)+'px'})}
window.addEventListener('resize',()=>{if(!$('#rep').hidden)fit()});
function openRep(){buildPages();$('#rep').hidden=false;$('#rep').scrollTop=0;document.body.style.overflow='hidden';fit()}
let libs=null;function loadLibs(){if(libs)return libs;libs=Promise.all(['html2canvas.min.js','jspdf.umd.min.js'].map(s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=()=>{libs=null;no(new Error('تعذّر تحميل '+s))};document.head.appendChild(e)})));return libs}
function makePdf(){const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:794px';document.body.appendChild(holder);
 return (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{layout(holder);return loadLibs()}).then(()=>{const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),pgs=holder.querySelectorAll('.page');let ch=Promise.resolve();
  pgs.forEach((p,i)=>{ch=ch.then(()=>html2canvas(p,{scale:2,backgroundColor:'#fff',useCORS:true,logging:false}).then(c=>{if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297)}))});
  return ch.then(()=>{holder.remove();return pdf})}).catch(e=>{holder.remove();throw e})}
function fname(){return 'الصوافي_'+(REPMODE=='full'?'مفصل_':'مجمل_')+String(S.client).replace(/\s+/g,'_')+'_'+String(D(S.date)||today()).replace(/\//g,'-')+'.pdf'}
function sharePdf(){$('#busy').hidden=false;makePdf().then(pdf=>{const blob=pdf.output('blob'),name=fname();window.__lastPdf={size:blob.size,name:name};
  let file=null;try{file=new File([blob],name,{type:'application/pdf'})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){$('#busy').hidden=true;return navigator.share({files:[file],title:name.replace('.pdf',''),text:'تقرير '+name.replace(/_/g,' ').replace('.pdf','')}).catch(()=>{})}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);$('#busy').hidden=true})
 .catch(e=>{$('#busy').hidden=true;alert('ماقدرتش أجهز الـ PDF: '+(e&&e.message||e))})}
window.SFAPP={setMode:m=>{REPMODE=m},makePdf,state:()=>S,render:renderAll,calc:()=>calc(S),layout,repParts};
renderAll();
