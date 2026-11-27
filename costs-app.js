/* تكاليف الموالح — الواجهة والتقرير (v2.2.0: + محلي سوبرماركت بدل جزء من الفرزة، calcX في costs-core.js). الحساب كله من calc() الأصلية في core.js */
const VER='2.3.0';
/* calcX = calc الأصلية + فرق السوبرماركت (لو النسبة صفر = calc بالظبط). لو ملف قديم في الكاش من غير calcX، نرجع لـ calc */
const CALC=typeof calcMix==='function'?calcMix:(typeof calcX==='function'?calcX:calc);const SMON=()=>typeof smState==='function';
/* تحميل البيانات المحفوظة — نفس مفتاح وشكل وتحويل البرنامج الأصلي (منسوخ حرفيًا) */
const SK='citrusCosts.v2';let S=_ld(SK,'citrusCosts');applyFreshDate();if(S.sar==null)S.sar=3.75;if(S.var&&S.var.some(v=>v[0]=='برتقال')){S.var=S.var.flatMap(v=>v[0]=='برتقال'?[['برتقال أبوسرة',v[1]],['برتقال بلدي',v[1]],['برتقال صيفي',v[1]]]:[v]);}if(S.variety=='برتقال')S.variety='برتقال أبوسرة';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const N=x=>'<span class="num">'+x+'</span>';
const P=x=>'<span class="num">'+f(x,1)+'%</span>';
function cairoISO(d){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d||new Date())}
function D(x){const m=String(x||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:x}
function today(){return D(cairoISO())}
function parseDateInput(x){var s=String(x==null?'':x).trim().replace(/[\u0660-\u0669]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[\u06F0-\u06F9]/g,c=>String(c.charCodeAt(0)-0x6F0)).replace(/[\u066B\u066C\u2013\u2014.\-]/g,'/').replace(/\s+/g,'');
 var y,mo,d,m;if((m=s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/))){y=+m[1];mo=+m[2];d=+m[3]}else if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))){d=+m[1];mo=+m[2];y=+m[3]}else return '';
 if(mo<1||mo>12||d<1||d>31||y<1990||y>2100)return '';const dt=new Date(Date.UTC(y,mo-1,d));if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)return '';
 return y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function dateShown(){return 'date' in DR?DR.date:D(S.date)}
function applyFreshDate(){try{if(!localStorage.getItem(SK)&&!localStorage.getItem('citrusCosts'))S.date=cairoISO()}catch(e){}if(!parseDateInput(S.date)&&!parseDateInput(D(S.date)))S.date=cairoISO()}
let ERR={},DR={};            // أخطاء المدخلات والنص المكتوب غلط — بيتحفظوا في مفتاح منفصل عشان الغلط يفضل ظاهر بعد إعادة الفتح (S نفسها فيها آخر قيمة صحيحة)
const UK='citrusCosts.v2.pending';try{const u=JSON.parse(localStorage.getItem(UK)||'null');if(u&&u.ERR&&u.DR){ERR=u.ERR;DR=u.DR}}catch(e){}
let lastT=null;
function save(){try{lastT=Date.now();localStorage.setItem(SK,JSON.stringify({ver:2,t:lastT,S}));if(Object.keys(ERR).length)localStorage.setItem(UK,JSON.stringify({ERR,DR}));else localStorage.removeItem(UK);showSaved()}catch(e){const n=$('#ls');if(n)n.textContent='تعذّر الحفظ على الجهاز (وضع التصفح الخاص؟)'}}
function showSaved(){const n=$('#ls');if(!n||!lastT)return;const d=new Date(lastT);n.textContent='آخر حفظ '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
try{const p=JSON.parse(localStorage.getItem(SK)||'null');if(p&&p.t)lastT=p.t}catch(e){}
if(typeof ensureCostsCatalog==='function'&&ensureCostsCatalog(S)){try{localStorage.setItem(SK,JSON.stringify({ver:2,t:lastT||Date.now(),S}))}catch(e){}}
window.addEventListener('pagehide',()=>save());
window.addEventListener('beforeunload',()=>save());
window.addEventListener('freeze',()=>save());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}

/* ---------- المدخلات ---------- */
const FIELDS=[['sec','الأسعار'],['usd','سعر الدولار','ج'],['sar','سعر الدولار بالريال','ريال'],['raw','سعر الخام واصل المحطة','ج / كجم'],['cullP','سعر بيع الفرزة محلي','ج / كجم'],
 ['sec','الكمية والنسب'],['net','الصافي في الحاوية','كجم'],['loss','نسبة الهالك من الخام','%',1],['cull','نسبة الفرزة بعد الهالك','%',1],['pw','هالك العبوات','%',1]];
const PCT={loss:1,cull:1,pw:1};
function shown(k){const key='k:'+k;if(key in DR)return DR[key];return PCT[k]?+(S[k]*100).toFixed(4):S[k]}
function renderInputs(){let h='<div class="f full"><label>تاريخ الحساب</label><div class="in'+(ERR.date?' bad':'')+'"><input data-date="1" dir="ltr" inputmode="numeric" autocomplete="off" placeholder="يوم/شهر/سنة" aria-label="تاريخ الحساب يوم/شهر/سنة" value="'+esc(dateShown())+'"></div>'+(ERR.date?'<div class="emsg" data-for="date">'+esc(ERR.date)+'</div>':'')+'<div class="hint">ميلادي — يوم/شهر/سنة</div></div>';
 FIELDS.forEach(x=>{if(x[0]=='sec'){h+='<div class="sec">'+x[1]+'</div>';return}
  h+='<div class="f"><label>'+x[1]+'</label><div class="in'+(ERR['k:'+x[0]]?' bad':'')+'"><input inputmode="decimal" data-k="'+x[0]+'" value="'+esc(shown(x[0]))+'"><span class="u">'+x[2]+'</span></div>'+(ERR['k:'+x[0]]?'<div class="emsg" data-for="k:'+x[0]+'">'+ERR['k:'+x[0]]+'</div>':'')+'</div>'});
 $('#inputs').innerHTML=h}
function cell(key,val,cls){const bad=ERR[key];return '<input class="'+(cls||'')+(bad?' bad':'')+'" '+(cls=='v'?'inputmode="decimal" ':'')+'data-t="'+key+'" value="'+esc(key in DR?DR[key]:val)+'">'}
function renderTables(){
 $('#pkt').innerHTML='<div class="trow th pk4"><span>العبوة</span><span>السعر ج</span><span>الصافي كجم</span><span>صندوق/باليت</span></div>'+S.pk.map((p,i)=>'<div class="trow pk4">'+cell('pk:'+i+':0',p[0])+cell('pk:'+i+':1',p[1],'v')+cell('pk:'+i+':2',p[2],'v')+cell('pk:'+i+':3',p[3]||'','v')+'</div>').join('');
 $('#supt').innerHTML=S.sup.map((p,i)=>'<div class="sup">'+cell('sup:'+i+':0',p[0])+cell('sup:'+i+':1',p[1],'v')+'</div>').join('')+'<div class="suptot"><span>إجمالي المستلزمات</span><span class="num" id="supTot"></span></div>';
 $('#vart').innerHTML=S.var.map((p,i)=>'<div class="sup three">'+cell('var:'+i+':0',p[0])+cell('var:'+i+':1',p[1],'v')+'<button class="x" data-dv="'+i+'" aria-label="حذف">×</button></div>').join('');
 Object.keys(ERR).filter(k=>!k.startsWith('k:')).forEach(k=>{const el=document.querySelector('[data-t="'+k+'"]');if(el)markBad(el,k)})}
function mixIdx(){const m=typeof mixList==='function'?mixList(S):null;return m?m.map(x=>x.i):(S.pkg!=null?[S.pkg]:[])}
function isMix(){return !!(typeof mixList==='function'&&mixList(S))}
function renderChips(){
 $('#vars').innerHTML=S.var.map((v,i)=>'<button class="chip'+(v[0]===S.variety?' on':'')+'" data-v="'+i+'">'+esc(v[0])+'</button>').join('')+'<button class="chip add" id="addVar">+ صنف جديد</button>';
 const on=mixIdx();
 $('#pkgs').innerHTML=S.pk.map((p,i)=>'<button class="chip sm'+(on.indexOf(i)>=0?' on':'')+'" data-p="'+i+'">'+esc(p[0])+'</button>').join('')+'<button class="chip add sm" id="addPk">+ عبوة جديدة</button>';
 renderMix()}
function renderMix(){let host=$('#mix');if(!host){host=document.createElement('section');host.id='mix';host.className='card mixcard';const pkgs=$('#pkgs');if(pkgs&&pkgs.parentNode)pkgs.parentNode.insertBefore(host,pkgs.nextSibling);else return}
 const selected=mixIdx(),mixOn=isMix();
 const others=S.pk.map((p,i)=>({i,p})).filter(x=>selected.indexOf(x.i)<0);
 let h='<div class="mixbar"><span class="mixhint">'+(mixOn?'خلطة عبوات لنفس الصنف — الحصّة بعدد باليتات الحاوية':'عبوة واحدة. تقدر تضيف عبوة كمان لنفس الصنف في الحاوية.')+'</span>';
 if(others.length)h+='<button class="btn ghost" id="bMixAdd" type="button">+ عبوة كمان في نفس الحاوية</button>';
 h+='</div>';
 if($('#mixPick')){}
 if(mixOn){const r=CALC(S),u=S.usd,rows=(r.mix&&r.mix.rows)||[];
  h+='<div class="mixt"><div class="mixh"><span>العبوة</span><span>باليت</span><span>صافي</span><span>%</span></div>';
  rows.forEach(x=>{const pn=typeof palNetKg==='function'?palNetKg(S.pk[x.i]||[]):0;
   h+='<div class="mixr"><div class="mixn">'+esc(x.name)+'</div><div class="mixf">';
   if(pn>0)h+='<label>باليتات<input class="v" inputmode="decimal" data-mixpal="'+x.i+'" value="'+esc(x.pal||'')+'"></label>';
   else h+='<label>صناديق/باليت<input class="v" inputmode="decimal" data-mixbpp="'+x.i+'" placeholder="اكتب العدد" value=""></label><label>طن صافي<input class="v" inputmode="decimal" data-mixnet="'+x.i+'" value="'+esc(+(x.net/1000).toFixed(3))+'"></label>';
   h+='</div><div class="mixq"><span class="num">'+f(x.net/1000,2)+' طن</span><span class="num">'+f(x.pct,1)+'%</span></div><button class="x" data-mixdel="'+x.i+'" aria-label="شيل من الخلطة">×</button></div>'});
  const gap=Math.abs((r.mix.totNet||0)-S.net);
  h+='<div class="mixsum">الموزّع '+N(f((r.mix.totNet||0)/1000,2))+' طن من الحاوية '+N(f(S.net/1000,1))+' طن';
  if(r.mix.totPal)h+=' · '+N(f(r.mix.totPal,0))+' باليت';
  if(gap>1)h+=' <em>قرّب التوزيع من صافي الحاوية</em>';
  h+='</div></div>'}
 host.innerHTML=h;
 const pick=$('#mixPick');if(pick)pick.hidden=true}
function errList(all){const L=[];Object.keys(ERR).forEach(k=>{if(!all&&k==='date')return;const a=k.split(':');let nm;
  if(k==='date')nm='تاريخ الحساب';else if(a[0]=='k')nm=RULES[a[1]][0];else if(a[0]=='pk')nm=(a[2]=='1'?'سعر ':a[2]=='3'?'صناديق الباليت لـ ':'وزن ')+'«'+(S.pk[a[1]]||[''])[0]+'»';else if(a[0]=='sup')nm='بند «'+(S.sup[a[1]]||[''])[0]+'»';else if(a[0]=='sm')nm={p:'نسبة السوبرماركت من الفرزة',price:'سعر بيع السوبرماركت',oth:'مصاريف تانية للصندوق'}[a[1]]||'السوبرماركت';else if(a[0]=='smb'){const b=(SMON()?smState(S).bx[a[1]]:null)||[''];nm=(a[2]=='1'?'سعر ':a[2]=='2'?'صافي فاكهة ':'وزن ')+'«'+b[0]+'»'}else nm='غسيل «'+(S.var[a[1]]||[''])[0]+'»';
  L.push(nm+': '+ERR[k])});if(SMON()){const x=smOf(S);if(x.over)L.push('توزيع الخام: الفرزة '+f(S.cull*100,1)+'% + السوبرماركت '+f(x.share*100,1)+'% لازم أقل من 100% (وإلا مفيش تصدير)')}return L}

/* ---------- العرض المباشر ---------- */
function groups(r){return [[r.smC!=null?'الخام (شامل الهالك والفرزة والسوبرماركت)':'الخام (شامل الهالك والفرزة)',r.rawT],['العبوة',r.pkgC],['مستلزمات الإنتاج',r.supT],['تكلفة المحطة (غسيل)',r.wash]]}
function rows(r){return [['g','1) الخام'],['شراء الخام (1 طن)',r.buy],['تكلفة الهالك (فقد الوزن)',r.lossC],['تكلفة الفرزة (فرق السعر)',r.cullC],...(r.smC!=null?[['محلي سوبرماركت'+(r.sm.m.sizes?' مقاسات '+r.sm.m.sizes:'')+' (خامه − صافي بيعه)',r.smC]]:[]),['s','إجمالي الخام',r.rawT],['g','2) العبوة'],[r.pkgName+' (شاملة هالك العبوات)',r.pkgC],['s','إجمالي العبوة',r.pkgC],['g','3) مستلزمات الإنتاج'],...S.sup.map(x=>[x[0],+x[1]]),['s','إجمالي المستلزمات',r.supT],['g','4) تكلفة المحطة'],['غسيل '+S.variety,r.wash],['s','إجمالي المحطة',r.wash]]}
function renderLive(){const E=errList(),bad=E.length>0;document.body.classList.toggle('invalid',bad);
 $('#net').innerHTML=N(f(S.net/1000,1))+' طن · الدولار '+N(f(S.usd));
 const nv=$('#notice');const vOk=S.var.some(v=>v[0]===S.variety);nv.hidden=vOk;if(!vOk)nv.innerHTML='الصنف «'+esc(S.variety)+'» مش موجود في جدول الغسيل، فالغسيل محسوب صفر. اختار صنف من فوق.';
 if(bad){$('#sum').innerHTML='<div class="lbl">تكلفة الطن الصافي ظهر الحاوية</div><div class="big"><span class="egp num">—</span></div><div class="err"><b>مفيش حساب لحد ما تصحح الخانات المعلّمة:</b><ul>'+E.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul></div>';
  ['#mojmal','#cmp','#detail'].forEach(s=>$(s).innerHTML='<h2>'+{'#mojmal':'المجمل','#cmp':'مقارنة العبوات','#detail':'التفاصيل'}[s]+'</h2><div class="hint">هيظهر بعد تصحيح المدخلات.</div>');const st=$('#supTot');if(st)st.textContent='—';const so=$('#smOut');if(so){const sx=SMON()?smOf(S):null;if(sx&&sx.over)renderSMOut({sm:sx});else so.innerHTML='<div class="hint">هيظهر بعد تصحيح المدخلات.</div>'}return}
 const r=CALC(S),u=S.usd,T=S.net/1000;window.__r=r;renderSMOut(r);
 const mix=r.mix&&r.mix.rows;
 const lbl='تكلفة الطن الصافي ظهر الحاوية — '+esc(S.variety)+' · '+(mix?'خلطة: '+esc(mix.map(x=>x.name+' ('+f(x.pct,0)+'%)').join(' + ')):esc(r.pkgName));
 let kpis='<div class="kpi"><span>الكيلو</span><b class="num">'+f(r.kg)+' ج</b><em class="num">$'+f(r.kg/u,3)+'</em></div>';
 if(!mix)kpis+='<div class="kpi"><span>العبوة معبأة ('+f(r.pkgW,1)+' ك)</span><b class="num">'+f(r.perPkg)+' ج</b><em class="num">$'+f(r.perPkg/u,3)+'</em></div>';
 kpis+='<div class="kpi"><span>الحاوية ('+f(T,1)+' طن)</span><b class="num">'+f(r.cont)+' ج</b><em class="num">$'+f(r.cont/u)+'</em></div>';
 if(!mix)kpis+='<div class="kpi"><span>الكرتونة بالريال أرض المحطة</span><b class="num">'+f(r.perPkg/u*S.sar)+' ريال</b><em class="num">'+f(r.ton/u*S.sar)+' ريال / طن</em></div>';
 else kpis+='<div class="kpi"><span>المتوسط المرجّح بالريال / طن</span><b class="num">'+f(r.ton/u*S.sar)+' ريال</b><em>حسب حصص الباليت</em></div>';
 let packRows='';
 if(mix)packRows='<div class="mixcosts"><div class="mixcosts-h">تكلفة كل عبوة في الخلطة <small>ج / طن صافي</small></div>'+mix.map(x=>'<div class="mixc"><b>'+esc(x.name)+'</b><span>'+f(x.pct,1)+'% · '+f(x.net/1000,2)+' طن'+(x.pal?' · '+f(x.pal,0)+' باليت':'')+'</span><strong class="num">'+f(x.ton)+' ج</strong><em class="num">$'+f(x.ton/u)+'</em></div>').join('')+'<div class="mixc tot"><b>الإجمالي المرجّح</b><span>للحاوية كلها</span><strong class="num">'+f(r.ton)+' ج</strong><em class="num">$'+f(r.ton/u)+'</em></div></div>';
 $('#sum').innerHTML='<div class="lbl">'+lbl+'</div><div class="big"><span class="egp num">'+f(r.ton)+'<i>ج</i></span><span class="usd num">$'+f(r.ton/u)+'</span></div>'+
  '<div class="kpis">'+kpis+'</div>'+packRows;
 const G=groups(r);
 $('#mojmal').innerHTML='<h2>المجمل <small>ج / طن صافي</small></h2><div class="bar">'+G.map(g=>'<i style="width:'+(r.ton?g[1]/r.ton*100:0)+'%"></i>').join('')+'</div><div class="bk"><table>'+
  G.map((g,i)=>'<tr><td><span class="sw s'+i+'"></span>'+g[0]+'</td><td class="v">'+f(g[1])+'</td><td class="v">'+P(r.ton?g[1]/r.ton*100:0)+'</td></tr>').join('')+
  '<tr class="t"><td>الإجمالي</td><td class="v">'+f(r.ton)+'</td><td class="v">$'+f(r.ton/u)+'</td></tr></table></div>';
 $('#cmp').innerHTML='<h2>مقارنة العبوات <small>تكلفة الطن الصافي</small></h2><div class="bk"><table><tr class="h"><td>العبوة</td><td class="vh">ج / طن</td><td class="vh">$ / طن</td><td class="vh">الفرق $</td></tr>'+
  r.cmp.map((x,i)=>'<tr'+((mix?mix.some(m=>m.name===x.n):x.n==r.pkgName)?' class="sel"':'')+'><td>'+esc(x.n)+'</td><td class="v">'+f(x.v)+'</td><td class="v">'+f(x.v/u)+'</td><td class="v">'+(x.d<1e-9?'الأرخص':'+'+f(x.d))+'</td></tr>').join('')+'</table></div>';
 let b='<h2>التفاصيل <small>لكل طن صافي</small></h2><div class="bk"><table><tr class="h"><td>البند</td><td class="vh">ج / طن</td><td class="vh">$ / طن</td><td class="vh">%</td></tr>';
 rows(r).forEach(x=>{if(x[0]=='g')b+='<tr class="g"><td colspan="4">'+esc(x[1])+'</td></tr>';else{const s=x[0]=='s',n=s?x[1]:x[0],v=s?x[2]:x[1];b+='<tr'+(s?' class="s"':'')+'><td>'+esc(n)+'</td><td class="v">'+f(v)+'</td><td class="v">'+f(v/u)+'</td><td class="v">'+P(v/r.ton*100)+'</td></tr>'}});
 b+='<tr class="t"><td>إجمالي تكلفة الطن الصافي</td><td class="v">'+f(r.ton)+'</td><td class="v">'+f(r.ton/u)+'</td><td class="v">100%</td></tr></table>'+
  '<div class="hint">الخام المطلوب للحاوية '+N(f(r.rawNeed))+' كجم · هالك '+N(f(r.lossKg))+' كجم · فرزة '+N(f(r.cullKg))+' كجم'+(r.smC!=null?' · سوبرماركت '+N(f(r.smKg))+' كجم ≈ '+N(f(Math.ceil(r.smBoxes-1e-9),0))+' صندوق':'')+' · عبوات معبأة '+N(f(r.packed,0))+' · مشتراة '+N(f(r.bought,0))+'</div></div>';
 $('#detail').innerHTML=b;const st=$('#supTot');if(st)st.textContent=f(r.supT)+' ج';
 refreshMixNums(r);renderDecBlend(r)}
function refreshMixNums(r){const host=$('#mix');if(!host||!r||!r.mix)return;
 host.querySelectorAll('.mixr').forEach(row=>{const inp=row.querySelector('[data-mixpal],[data-mixnet]');if(!inp)return;const i=+(inp.dataset.mixpal||inp.dataset.mixnet);const x=r.mix.rows.find(z=>z.i===i);if(!x)return;
  const q=row.querySelector('.mixq');if(q)q.innerHTML='<span class="num">'+f(x.net/1000,2)+' طن</span><span class="num">'+f(x.pct,1)+'%</span>'});
 const s=host.querySelector('.mixsum');if(s){const gap=Math.abs((r.mix.totNet||0)-S.net);s.innerHTML='الموزّع '+N(f((r.mix.totNet||0)/1000,2))+' طن من الحاوية '+N(f(S.net/1000,1))+' طن'+(r.mix.totPal?' · '+N(f(r.mix.totPal,0))+' باليت':'')+(gap>1?' <em>قرّب التوزيع من صافي الحاوية</em>':'')}}
function renderDecBlend(r){let n=$('#decBlend');const host=$('#costsDec');
 if(!(r&&r.mix)){if(n)n.remove();return}
 if(!n){n=document.createElement('div');n.id='decBlend';n.className='decblend';if(host)host.parentNode.insertBefore(n,host);else return}
 const u=S.usd;
 n.innerHTML='<b>القرار على تكلفة الخلطة المرجّحة</b> — طن '+N(f(r.ton))+' ج / $'+N(f(r.ton/u))+' · كيلو '+N(f(r.kg))+' ج · الحاوية '+N(f(r.cont))+' ج. أرقام «القرار» تحت لكل صنف وعبوة في خطة الباليتات؛ استخدم الرقم المرجّح ده كتكلفة الصنف في الحاوية.'}
function renderAll(){renderChips();renderInputs();renderTables();renderSM();renderLive();showSaved();$('#ver').textContent='· v'+VER}

/* ---------- محلي سوبرماركت (v2.2.0) — فرزة مقاسات 100-113: مخرج لوحده من الخام، في صندوق بلاستيك، بسعر شامل وزن الصندوق ---------- */
const SMB=v=>v==='box'?'ج / صندوق':'ج / كجم قائم';
const BD=x=>'<bdi dir="ltr">'+x+'</bdi>';
function smShown(k,v){const key='sm:'+k;return key in DR?DR[key]:v}
function renderSM(){const host=$('#smCard');if(!host)return;if(!SMON()){host.hidden=true;return}const m=smState(S);
 const fld=(k,lab,val,u,cls,hint)=>'<div class="f'+(cls||'')+'"><label>'+lab+'</label><div class="in'+(ERR['sm:'+k]?' bad':'')+'"><input '+(k==='sizes'?'class="txt" ':'inputmode="decimal" ')+'data-sm="'+k+'" value="'+esc(smShown(k,val))+'">'+(u?'<span class="u">'+u+'</span>':'')+'</div>'+(ERR['sm:'+k]?'<div class="emsg" data-for="sm:'+k+'">'+esc(ERR['sm:'+k])+'</div>':'')+(hint?'<div class="hint">'+hint+'</div>':'')+'</div>';
 let h='<h2>محلي سوبرماركت <small>فرزة مقاسات صغيرة في صندوق</small></h2><div class="grid">'+
  fld('p','نسبة السوبرماركت',+(m.p*100).toFixed(4),'%','','من الفاكهة بعد الهالك — زي الفرزة · صفر = مقفول')+fld('sizes','المقاسات',m.sizes,'','','للعرض في التقرير')+
  '<div class="f full"><label>نوع الصندوق</label><div class="in"><select class="smsel" data-sm="box">'+m.bx.map((b,i)=>'<option value="'+i+'"'+(i===m.box?' selected':'')+'>'+esc(b[0])+'</option>').join('')+'</select></div></div>'+
  fld('price','سعر البيع للسوبرماركت (شامل الصندوق)',m.price,'<select class="smu" data-sm="basis" aria-label="وحدة السعر"><option value="kg"'+(m.basis!=='box'?' selected':'')+'>ج / كجم قائم</option><option value="box"'+(m.basis==='box'?' selected':'')+'>ج / صندوق</option></select>',' full',m.basis==='box'?'سعر الصندوق كله بالفاكهة':'الكيلو القائم = فاكهة + وزن الصندوق الفاضي')+
  fld('oth','مصاريف تانية للصندوق',m.oth,'ج / صندوق',' full','نقل للسوبرماركت أو تعبئة أو ستيكر — لو مفيش سيبها صفر')+'</div>'+
  '<div id="smOut" class="smout"></div>'+
  '<h3 class="smh">أنواع الصناديق</h3><div class="trow sm4 th"><span>السعر ج</span><span>صافي فاكهة كجم</span><span>وزن الصندوق كجم</span><span></span></div>'+
  m.bx.map((b,i)=>'<div class="smrow"><input class="nm'+(ERR['smb:'+i+':0']?' bad':'')+'" data-smb="'+i+':0" value="'+esc('smb:'+i+':0' in DR?DR['smb:'+i+':0']:b[0])+'"><div class="trow sm4">'+[1,2,3].map(j=>{const k='smb:'+i+':'+j;return '<input class="v'+(ERR[k]?' bad':'')+'" inputmode="decimal" data-smb="'+i+':'+j+'" value="'+esc(k in DR?DR[k]:b[j])+'">'}).join('')+'<button class="x" data-smd="'+i+'" aria-label="حذف"'+(m.bx.length<2?' disabled':'')+'>×</button></div></div>').join('')+
  '<button class="btn ghost wide" id="smAdd">+ نوع صندوق</button>';
 host.hidden=false;host.innerHTML=h;Object.keys(ERR).filter(k=>k.startsWith('smb:')).forEach(k=>{const el=host.querySelector('[data-smb="'+k.slice(4)+'"]');if(el)markBad(el,k)});
 if(window.__r)renderSMOut(window.__r)}
function smSplit(x){const P=v=>BD(f(v*100,1)+'%');return '<div class="smsplit"><span>توزيع الخام:</span> تصدير '+P(x.split.exp)+' · فرزة '+P(x.split.cull)+' · سوبرماركت '+P(x.split.sm)+' · هالك '+P(x.split.loss)+' = '+BD('100%')+'</div>'}
function renderSMOut(r){const o=$('#smOut');if(!o||!SMON())return;const x=r.sm||smOf(S),T=S.net/1000;
 if(x.over){o.innerHTML='<div class="emsg">الفرزة '+BD(f(S.cull*100,1)+'%')+' + السوبرماركت '+BD(f(x.share*100,1)+'%')+' لازم أقل من 100% — وإلا مفيش تصدير.</div>';return}
 if(!x.on){o.innerHTML='<div class="hint">مقفول — النسبة صفر: الخام بيتوزع تصدير وفرزة وهالك بس. اكتب النسبة عشان تشغّله.</div>';return}
 const low=x.perKg!=null&&x.perKg<+S.cullP;
 o.innerHTML=smSplit(x)+'<div class="smk"><span>صافي كيلو السوبرماركت بعد الصندوق</span><b>'+BD(f(x.perKg))+' ج / كجم</b><em>الفرزة '+BD(f(S.cullP))+' ج · الخام '+BD(f(S.raw))+' ج</em></div>'+
  '<table class="smt"><tr><td>كمية السوبرماركت للحاوية</td><td class="sv">'+BD(f(r.smKg))+' كجم</td></tr><tr><td>عدد الصناديق «'+esc(x.name)+'»</td><td class="sv">'+BD(f(r.smBoxes,1))+'</td></tr>'+
  '<tr><td>الوزن القائم (فاكهة + صندوق '+BD(f(x.tare,2))+' كجم)</td><td class="sv">'+BD(f(r.smGross))+' كجم</td></tr><tr><td>إيراد السوبرماركت</td><td class="sv">'+BD(f(r.smRev))+' ج</td></tr>'+
  '<tr><td>الصناديق والمصاريف</td><td class="sv">'+BD('−'+f(r.smBoxC))+' ج</td></tr><tr class="s"><td>صافي بيع السوبرماركت</td><td class="sv">'+BD(f(r.smNet))+' ج</td></tr>'+
  '<tr><td>تكلفة السوبرماركت في الطن <small>خامه − صافي بيعه</small></td><td class="sv">'+BD(f(r.smC))+' ج / طن</td></tr>'+
  '<tr><td>الفرق عن بيعه فرزة</td><td class="sv">'+BD((x.gain>=0?'+':'−')+f(Math.abs(x.gain)))+' ج / طن <small>'+(x.gain>=0?'السوبرماركت أحسن':'الفرزة أحسن')+'</small></td></tr></table>'+
  (low?'<div class="emsg">صافي الكيلو بعد الصندوق أقل من سعر الفرزة — بيعه فرزة أحسن.</div>':'')}
function smRep(r,T){if(r.smC==null)return '';const x=r.sm;const L=v=>'<span class="ltr">'+v+'</span>';
 return '<h3>محلي سوبرماركت'+(x.m.sizes?' — مقاسات '+esc(x.m.sizes):'')+'</h3><table class="rt q"><tbody>'+
  '<tr><td>النسبة من الفاكهة بعد الهالك</td><td class="q2">'+L(f(x.share*100,1)+'%')+'</td><td>توزيع الخام</td><td class="q2">تصدير '+L(f(x.split.exp*100,1)+'%')+' · فرزة '+L(f(x.split.cull*100,1)+'%')+' · سوبرماركت '+L(f(x.split.sm*100,1)+'%')+' · هالك '+L(f(x.split.loss*100,1)+'%')+'</td></tr>'+
  '<tr><td>الكمية</td><td class="q2">'+L(f(r.smKg))+' كجم</td><td>الصندوق</td><td class="q2">'+esc(x.name)+' — '+L(f(x.cost))+' ج</td></tr>'+
  '<tr><td>عدد الصناديق</td><td class="q2">'+L(f(r.smBoxes,1))+'</td><td>صافي / وزن الصندوق</td><td class="q2">'+L(f(x.net,1))+' / '+L(f(x.tare,2))+' كجم</td></tr>'+
  '<tr><td>الوزن القائم</td><td class="q2">'+L(f(r.smGross))+' كجم</td><td>سعر البيع</td><td class="q2">'+L(f(x.price))+' '+SMB(x.basis)+'</td></tr>'+
  '<tr><td>إيراد السوبرماركت</td><td class="q2">'+L(f(r.smRev))+' ج</td><td>الصناديق والمصاريف</td><td class="q2">'+L(f(r.smBoxC))+' ج</td></tr>'+
  '<tr><td>صافي بيع السوبرماركت</td><td class="q2">'+L(f(r.smNet))+' ج — '+L(f(x.perKg))+' ج/كجم</td><td>تكلفته في الطن</td><td class="q2">'+L(f(r.smC))+' ج/طن</td></tr>'+
  '<tr><td>مقارنة ببيعه فرزة</td><td class="q2" colspan="3">'+L((x.gain>=0?'+':'−')+f(Math.abs(x.gain)))+' ج/طن — '+L((x.gain>=0?'+':'−')+f(Math.abs(x.gain*T)))+' ج/حاوية '+(x.gain>=0?'لصالح السوبرماركت':'لصالح الفرزة')+'</td></tr></tbody></table>'}
function smSet(fn){if(!SMON())return;const m=smState(S);fn(m);S.sm=m}
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||!SMON())return;
 if(t.dataset.sm&&t.tagName==='INPUT'){const k=t.dataset.sm,key='sm:'+k;
  if(k==='sizes'){smSet(m=>m.sizes=t.value);save();renderLive();return}
  let msg=checkVal(t.value,'ge0');if(!msg&&k==='p'&&parseNum(t.value)>100)msg='لازم تكون من 0 لـ 100';
  setErr(key,msg,t.value);if(!msg)smSet(m=>m[k]=toStore(t.value,k==='p'));markBad(t,key);save();renderLive();return}
 if(t.dataset.smb){const [i,j]=t.dataset.smb.split(':').map(Number),key='smb:'+i+':'+j;
  if(j===0){smSet(m=>{if(m.bx[i])m.bx[i][0]=t.value});save();renderLive();return}
  const msg=checkVal(t.value,j===2?'gt0':'ge0',true);setErr(key,msg,t.value);if(!msg)smSet(m=>{if(m.bx[i])m.bx[i][j]=toStore(t.value)});markBad(t,key);save();renderLive()}});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!SMON())return;
 if(t.dataset.sm==='box'){smSet(m=>m.box=+t.value);save();renderLive();return}
 if(t.dataset.sm==='basis'){smSet(m=>m.basis=t.value==='box'?'box':'kg');save();renderSM();renderLive();return}
 if(t.dataset.smb&&t.dataset.smb.endsWith(':0')){renderSM();return}
 const key=t.dataset.sm?'sm:'+t.dataset.sm:t.dataset.smb?'smb:'+t.dataset.smb:null;if(!key||t.dataset.sm==='sizes'||ERR[key]||String(t.value).trim()==='')return;const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x)});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t||!SMON())return;
 if(t.id==='smAdd'){smSet(m=>m.bx.push(['صندوق جديد',0,15,1]));save();renderSM();renderLive()}
 else if(t.dataset.smd!=null){const i=+t.dataset.smd,m0=smState(S);if(m0.bx.length<2)return;if(!confirm('حذف «'+m0.bx[i][0]+'» من أنواع الصناديق؟'))return;
  smSet(m=>{m.bx.splice(i,1);if(m.box===i)m.box=0;else if(m.box>i)m.box--});Object.keys(ERR).filter(k=>k.startsWith('smb:')).forEach(k=>{delete ERR[k];delete DR[k]});save();renderSM();renderLive()}});

/* ---------- الأحداث ---------- */
function setErr(key,msg,raw){if(msg){ERR[key]=msg;DR[key]=raw}else{delete ERR[key];delete DR[key]}}
function markBad(el,key){const isK=!!(el.dataset.k||el.dataset.date||el.dataset.sm),box=isK?el.parentNode:el,anchor=isK?box:el.parentNode,scope=isK?box.parentNode:anchor.parentNode;
 box.classList.toggle('bad',!!ERR[key]);scope.querySelectorAll('.emsg[data-for="'+key+'"]').forEach(m=>m.remove());
 if(ERR[key]){const m=document.createElement('div');m.className='emsg';m.dataset.for=key;m.textContent=ERR[key];anchor.insertAdjacentElement('afterend',m)}}
document.addEventListener('input',e=>{const t=e.target;
 if(t.dataset.date){const raw=t.value,iso=parseDateInput(raw);if(!String(raw).trim())setErr('date','فاضي — اكتب التاريخ يوم/شهر/سنة',raw);else if(!iso)setErr('date','اكتبه يوم/شهر/سنة ميلادي، زي 11/11/2026',raw);else{setErr('date','');S.date=iso}markBad(t,'date');save();return}
 if(t.dataset.k){const k=t.dataset.k,key='k:'+k,msg=checkVal(t.value,RULES[k][1]);setErr(key,msg,t.value);if(!msg)S[k]=toStore(t.value,PCT[k]);markBad(t,key);save();renderLive();return}
 if(t.dataset.mixpal!=null||t.dataset.mixnet!=null){const i=+(t.dataset.mixpal!=null?t.dataset.mixpal:t.dataset.mixnet);const key=t.dataset.mixpal!=null?'mixpal:'+i:'mixnet:'+i;
  const msg=checkVal(t.value,'ge0',true);setErr(key,msg,t.value);if(!msg && Array.isArray(S.mix)){S.mix=S.mix.map(r=>{if(+r.i!==i)return r;const p=S.pk[i],pn=typeof palNetKg==='function'?palNetKg(p):0;
   if(t.dataset.mixpal!=null){const pal=toStore(t.value);return {i:i,pal:pal,net:pn>0?pal*pn:+r.net||0}}
   const net=toStore(t.value)*1000;return {i:i,pal:+r.pal||0,net:net}});}markBad(t,key);save();renderLive();return}
 if(t.dataset.mixbpp!=null){const i=+t.dataset.mixbpp,key='mixbpp:'+i,msg=checkVal(t.value,'gt0',true);setErr(key,msg,t.value);
  if(!msg&&S.pk[i]){S.pk[i][3]=toStore(t.value);if(Array.isArray(S.mix))S.mix=S.mix.map(r=>{if(+r.i!==i)return r;const pn=palNetKg(S.pk[i]);const pal=+r.pal||(pn>0?Math.round((+r.net||0)/pn):0);return {i:i,pal:pal,net:pn>0?pal*pn:+r.net||0}})}
  markBad(t,key);save();renderChips();renderLive();return}
 if(t.dataset.t){const [a,i,j]=t.dataset.t.split(':'),row=S[a][+i];if(!row)return;
  if(j=='0'){const old=row[0];row[0]=t.value;if(a=='var'&&S.variety==old)S.variety=t.value;save();renderLive();return}
  const rule=(a=='pk'&&j=='2')?'gt0':'ge0',msg=checkVal(t.value,rule,true);setErr(t.dataset.t,msg,t.value);if(!msg)row[+j]=toStore(t.value);if(a=='pk'&&j=='3'&&Array.isArray(S.mix)){S.mix=S.mix.map(r=>{if(+r.i!==+i)return r;const pn=typeof palNetKg==='function'?palNetKg(row):0;const pal=+r.pal||0;return {i:+i,pal:pal,net:pn>0?pal*pn:+r.net||0}})}markBad(t,t.dataset.t);save();if(a=='pk'&&(j=='2'||j=='3'))renderChips();renderLive()}});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.date){const iso=parseDateInput(t.value);if(iso){S.date=iso;t.value=D(iso);setErr('date','');markBad(t,'date');save()}return}
 if(t.dataset.t&&t.dataset.t.endsWith(':0')){renderChips();return}
 const key=t.dataset.k?'k:'+t.dataset.k:t.dataset.t;if(!key||ERR[key])return;if(String(t.value).trim()==='')return;const x=parseNum(t.value);if(isFinite(x)&&String(x)!==t.value.trim())t.value=String(x)});
function blocked(){const E=errList(true);if(!E.length)return false;alert('صحّح الخانات دي الأول:\n• '+E.join('\n• '));return true}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.v!=null){S.variety=S.var[+t.dataset.v][0];save();renderChips();renderLive()}
 else if(t.dataset.p!=null){S.pkg=+t.dataset.p;S.mix=null;save();renderChips();renderLive()}
 else if(t.id=='bMixAdd'){const host=$('#mix');if(!host)return;const selected=mixIdx();const opts=S.pk.map((p,i)=>selected.indexOf(i)<0?'<button class="chip sm" type="button" data-mixadd="'+i+'">'+esc(p[0])+'</button>':'').join('');
  let box=$('#mixPick');if(!box){box=document.createElement('div');box.id='mixPick';box.className='mixpick';host.appendChild(box)}
  box.hidden=false;box.innerHTML='<div class="mixpick-h">اختار عبوة تتضاف للحاوية</div><div class="mixpick-l">'+opts+'</div>'}
 else if(t.dataset.mixadd!=null){const i=+t.dataset.mixadd,cur=mixIdx().slice();if(cur.indexOf(i)<0)cur.push(i);if(cur.indexOf(S.pkg)<0)cur.unshift(S.pkg);
  S.mix=typeof defaultMix==='function'?defaultMix(S,cur):cur.map(ix=>({i:ix,pal:0,net:S.net/cur.length}));S.pkg=cur[0];save();renderChips();renderLive()}
 else if(t.dataset.mixdel!=null){const i=+t.dataset.mixdel;let cur=mixIdx().filter(x=>x!==i);if(cur.length<2){S.mix=null;if(cur.length)S.pkg=cur[0];save();renderChips();renderLive();return}
  const keep=(S.mix||[]).filter(r=>+r.i!==i);S.mix=keep;S.pkg=cur[0];save();renderChips();renderLive()}
 else if(t.id=='addVar'||t.id=='bAddVar'){const nm=(prompt('اسم الصنف الجديد:','صنف جديد')||'').trim();if(!nm)return;S.var.push([nm,1800]);S.variety=nm;save();renderAll()}
 else if(t.id=='addPk'||t.id=='bAddPk'){const box=$('#pkAdd');if(box){box.hidden=false;const i=box.querySelector('[data-npk=\'n\']');if(i){i.focus();box.scrollIntoView({block:'center'})}}return}
 else if(t.id=='bPkCancel'){const box=$('#pkAdd');if(box){box.hidden=true;box.querySelectorAll('input').forEach(i=>i.value='')}return}
 else if(t.id=='bPkOk'){const box=$('#pkAdd');if(!box)return;const g=k=>(box.querySelector('[data-npk=\''+k+'\']')||{}).value||'';
  const nm=g('n').trim(),kg=parseNum(g('w')),pr=parseNum(g('p')),pal=parseNum(g('b'));
  if(!nm){alert('اكتب اسم العبوة');return}
  if(!(kg>0)){alert('الصافي لازم يكون أكبر من صفر');return}
  if(S.pk.some(x=>x[0]===nm)){alert('العبوة «'+nm+'» موجودة');return}
  if(g('p').trim()&&!(pr>=0)){alert('سعر العبوة مكتوب غلط');return}
  if(g('b').trim()&&!(pal>=0)){alert('عدد الصناديق في الباليت مكتوب غلط');return}
  S.pk.push([nm,g('p').trim()?pr:0,kg,g('b').trim()?pal:0]);S.pkg=S.pk.length-1;if(typeof ensureCostsCatalog==='function')ensureCostsCatalog(S);box.hidden=true;box.querySelectorAll('input').forEach(i=>i.value='');save();renderAll()}
 else if(t.dataset.dv!=null){const i=+t.dataset.dv,nm=S.var[i][0];if(!confirm('حذف صنف «'+nm+'» من جدول الغسيل؟'))return;S.var.splice(i,1);
  Object.keys(ERR).filter(k=>k.startsWith('var:')).forEach(k=>{delete ERR[k];delete DR[k]});if(S.variety==nm&&S.var.length)S.variety=S.var[0][0];save();renderAll()}
 else if(t.id=='bReset'){if(!confirm('ترجع للأرقام الأصلية؟ كل أرقامك هتتمسح.'))return;S=JSON.parse(JSON.stringify(DEF));if(typeof ensureCostsCatalog==='function')ensureCostsCatalog(S);ERR={};DR={};save();renderAll()}
 else if(t.id=='bReport'){if(blocked())return;openRep()}
 else if(t.id=='bPrint'||t.id=='rPrint'){if(blocked())return;buildPages();$('#rep').hidden=false;fit();setTimeout(()=>window.print(),350)}
 else if(t.id=='bShare'||t.id=='rShare'){if(blocked())return;sharePdf()}
 else if(t.id=='rClose'){$('#rep').hidden=true;document.body.style.overflow=''}});
document.addEventListener('change',e=>{if(e.target.id=='rMode'){REPMODE=e.target.value;buildPages();fit()}});

/* ---------- التقرير ---------- */
let REPMODE='full';
function reportHtml(){const r=CALC(S),u=S.usd,T=S.net/1000,G=groups(r),pages=REPMODE=='full'?2:1;
 const mix=r.mix&&r.mix.rows, packLbl=mix?('خلطة: '+mix.map(x=>x.name+' ('+f(x.pct,0)+'%)').join(' + ')):r.pkgName;
 const head=t=>'<div class="ph"><div><h1>'+t+'</h1><div class="meta">تاريخ الحساب <span class="ltr">'+esc(D(S.date))+'</span> — '+esc(S.variety)+' — '+esc(packLbl)+' — الحاوية <span class="ltr">'+f(T,1)+'</span> طن صافي — الدولار <span class="ltr">'+f(S.usd)+'</span> ج — <span class="ltr">'+f(S.sar)+'</span> ريال</div></div><span class="tag">تكاليف الموالح</span></div>';
 const code=REPMODE=='full'?'RT-20261028-010':'RT-20261028-011';const foot=p=>'<div class="pf"><span class="ltr">'+code+'</span><span>التكلفة للمنتج محمّلًا على الحاوية في المحطة، بدون نقل للميناء أو شحن. طُبع <span class="ltr">'+today()+'</span></span><span>صفحة '+p+' من '+pages+'</span></div>';
 const R6=(n,v,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+esc(n)+'</td><td class="n">'+f(v)+'</td><td class="n">'+f(v/u)+'</td><td class="n">'+f(v*T)+'</td><td class="n">'+f(v*T/u)+'</td><td class="n">'+f(v/r.ton*100,1)+'%</td></tr>';
 const p1='<div class="page"><div class="pc p1">'+head('تكلفة طن '+esc(S.variety)+' الصافي ظهر الحاوية')+
 '<h3>الملخص</h3><div class="rsum"><div class="m main"><span>تكلفة الطن الصافي</span><b>'+f(r.ton)+' ج</b><em>$'+f(r.ton/u)+'</em><small>الخام + العبوة + المستلزمات + الغسيل ÷ الطن الصافي</small></div>'+
 '<div class="m"><span>الكيلو</span><b>'+f(r.kg)+' ج</b><em>$'+f(r.kg/u,3)+'</em><small>تكلفة الطن ÷ 1000 كجم</small></div>'+
 (mix?'':('<div class="m"><span>العبوة معبأة ('+f(r.pkgW,1)+' ك)</span><b>'+f(r.perPkg)+' ج</b><em>$'+f(r.perPkg/u)+'</em><small>الكيلو × '+f(r.pkgW,1)+' كجم</small></div>'))+
 '<div class="m"><span>الحاوية ('+f(T,1)+' طن)</span><b>'+f(r.cont)+' ج</b><em>$'+f(r.cont/u)+'</em><small>الطن × '+f(T,1)+' طن صافي</small></div></div>'+
 (mix?('<h3>خلطة العبوات في الحاوية</h3><table class="rt"><thead><tr><th>العبوة</th><th>باليت</th><th>صافي طن</th><th>%</th><th>ج / طن</th><th>$ / طن</th></tr></thead><tbody>'+
  mix.map(x=>'<tr><td>'+esc(x.name)+'</td><td class="n">'+f(x.pal,0)+'</td><td class="n">'+f(x.net/1000,2)+'</td><td class="n">'+f(x.pct,1)+'%</td><td class="n">'+f(x.ton)+'</td><td class="n">'+f(x.ton/u)+'</td></tr>').join('')+
  '<tr class="gt"><td>الإجمالي المرجّح</td><td class="n">'+f(r.mix.totPal,0)+'</td><td class="n">'+f(r.mix.totNet/1000,2)+'</td><td class="n">100%</td><td class="n">'+f(r.ton)+'</td><td class="n">'+f(r.ton/u)+'</td></tr></tbody></table><div class="note">الحصّة بعدد باليتات كل عبوة (صناديق الباليت × وزن العبوة). الإجمالي مرجّح حسب الصافي، وده الرقم المستخدم في الملخص والقرار.</div>'):
  ('<div class="rsar"><span>تكلفة الكرتونة بالريال أرض المحطة</span><b>'+f(r.perPkg/u*S.sar)+' ريال</b><span class="sep">|</span><b>'+f(r.ton/u*S.sar)+' ريال / طن</b><em>= تكلفة العبوة ($'+f(r.perPkg/u,3)+') × '+f(S.sar)+' ريال للدولار</em></div>'))+
 '<h3>المجمل</h3><table class="rt"><thead><tr><th>المجموعة</th><th>ج / طن</th><th>$ / طن</th><th>ج / حاوية</th><th>$ / حاوية</th><th>%</th></tr></thead><tbody>'+
 G.map(g=>R6(g[0],g[1])).join('')+R6('الإجمالي',r.ton,'gt')+'</tbody></table><div class="note">الأربع مجموعات مجموعها = تكلفة الطن الصافي ظهر الحاوية.</div>'+
 '<h3>مقارنة العبوات — تكلفة الطن الصافي</h3><table class="rt"><thead><tr><th>العبوة</th><th>ج / طن</th><th>$ / طن</th><th>ريال / عبوة</th><th>الفرق عن الأرخص $</th></tr></thead><tbody>'+
 r.cmp.map((x,i)=>'<tr'+((mix?mix.some(z=>z.name===x.n):x.n==r.pkgName)?' class="sel"':'')+'><td>'+esc(x.n)+'</td><td class="n">'+f(x.v)+'</td><td class="n">'+f(x.v/u)+'</td><td class="n">'+f(x.v/1000*S.pk[i][2]/u*S.sar)+'</td><td class="n">'+(x.d<1e-9?'الأرخص':'+'+f(x.d))+'</td></tr>').join('')+
 '</tbody></table><div class="note">الفرق محسوب بالدولار للطن مقارنة بأرخص عبوة؛ كل العبوات بنفس الخام والمستلزمات والغسيل.'+(pages>1?' التفاصيل في الصفحة التالية.':'')+'</div>'+(r.smC!=null?'<div class="note">يشمل محلي سوبرماركت'+(r.sm.m.sizes?' مقاسات '+esc(r.sm.m.sizes):'')+': '+f(r.sm.share*100,1)+'% من الفاكهة بعد الهالك في «'+esc(r.sm.name)+'» بسعر '+f(r.sm.price)+' '+SMB(r.sm.basis)+' — التصدير '+f(r.sm.split.exp*100,1)+'% من الخام. التفاصيل في الصفحة التالية.</div>':'')+'</div>'+foot(1)+'</div>';
 if(pages==1)return [p1];
 let d='';rows(r).forEach(x=>{if(x[0]=='g')d+='<tr class="gh"><td colspan="6">'+esc(x[1])+'</td></tr>';else{const s=x[0]=='s';d+=R6(s?x[1]:x[0],s?x[2]:x[1],s?'st':'')}});
 const p2='<div class="page"><div class="pc">'+head('تفاصيل تكلفة طن '+esc(S.variety)+' والحاوية')+
 '<h3>التفاصيل</h3><table class="rt"><thead><tr><th>البند</th><th>ج / طن</th><th>$ / طن</th><th>ج / حاوية</th><th>$ / حاوية</th><th>%</th></tr></thead><tbody>'+d+
 '<tr class="gt"><td>إجمالي تكلفة الطن الصافي</td><td class="n">'+f(r.ton)+'</td><td class="n">'+f(r.ton/u)+'</td><td class="n">'+f(r.cont)+'</td><td class="n">'+f(r.cont/u)+'</td><td class="n">100%</td></tr></tbody></table>'+
 '<div class="note">الإجمالي = الخام + العبوة + المستلزمات + غسيل المحطة، لكل طن صافي داخل العبوات؛ الحاوية = الطن × '+f(T,1)+' طن.</div>'+
 '<h3>الكميات للحاوية</h3><table class="rt q"><tbody><tr><td>الصافي في العبوات</td><td class="q2"><span class="ltr">'+f(S.net,0)+'</span> كجم</td><td>الخام المطلوب</td><td class="q2"><span class="ltr">'+f(r.rawNeed)+'</span> كجم</td></tr><tr><td>الهالك</td><td class="q2"><span class="ltr">'+f(r.lossKg)+'</span> كجم</td><td>الفرزة للمحلي</td><td class="q2"><span class="ltr">'+f(r.cullKg)+'</span> كجم</td></tr><tr><td>قيمة بيع الفرزة</td><td class="q2"><span class="ltr">'+f(r.cullSale)+'</span> ج</td><td>'+(mix?'صافي الخلطة':'وزن العبوة')+'</td><td class="q2"><span class="ltr">'+(mix?f(r.mix.totNet/1000,2)+'</span> طن':f(r.pkgW,1)+'</span> كجم')+'</td></tr><tr><td>العبوات المعبأة</td><td class="q2"><span class="ltr">'+f(r.packed,0)+'</span></td><td>العبوات المطلوب شراؤها</td><td class="q2"><span class="ltr">'+f(r.bought,0)+'</span></td></tr></tbody></table>'+
 smRep(r,T)+'<div class="note">العبوات المعبأة = الصافي ÷ وزن العبوة مقرّب لأعلى؛ المشتراة = المعبأة × (1 + <span class="ltr">'+f(S.pw*100,1)+'%</span>) مقرّب لأعلى.</div>'+
 '<h3>طريقة الحساب</h3><ul><li>الخام المطلوب = الصافي ÷ ((1 − الهالك <span class="ltr">'+f(S.loss*100,1)+'%</span>) × (1 − الفرزة <span class="ltr">'+f(S.cull*100,1)+'%</span>'+(r.smC!=null?' − السوبرماركت <span class="ltr">'+f(r.sm.share*100,1)+'%</span>':'')+')).</li><li>تكلفة الفرزة = وزنها × (سعر الخام '+f(S.raw)+' − سعر بيعها '+f(S.cullP)+').</li>'+(r.smC!=null?'<li>محلي سوبرماركت = '+f(r.sm.share*100,1)+'% من الفاكهة بعد الهالك (مخرج لوحده، الفرزة زي ما هي)؛ إيراده = '+(r.sm.basis==='box'?'عدد الصناديق × سعر الصندوق':'الوزن القائم (فاكهة + وزن الصندوق) × السعر')+'؛ تكلفته = خامه بسعر الخام − (إيراده − الصناديق والمصاريف).</li>':'')+'<li>سعر الخام واصل المحطة، فلا يوجد بند نقل خام.</li><li>التكلفة للمنتج محمّلًا على الحاوية في المحطة، بدون نقل للميناء أو شحن.</li></ul></div>'+foot(2)+'</div>';
 return [p1,p2]}
function shrink(root){root.querySelectorAll('.page').forEach(pg=>{const pc=pg.querySelector('.pc');pc.style.transform='';pc.style.width='';const avail=1123-36-62;let h=pc.offsetHeight;if(h>avail){let s=Math.max(0.55,avail/h);pc.style.width=(706/s)+'px';h=pc.offsetHeight;s=Math.max(0.55,avail/h);pc.style.width=(706/s)+'px';pc.style.transformOrigin='top right';pc.style.transform='scale('+s+')'}})}
function buildPages(){$('#rep').hidden=false;$('#pages').innerHTML=reportHtml().map(p=>'<div class="pagewrap">'+p+'</div>').join('');shrink($('#pages'))}
function fit(){document.querySelectorAll('.pagewrap').forEach(w=>{const pg=w.firstChild,s=Math.min(1,w.clientWidth/794);pg.style.transform='scale('+s+')';w.style.height=(1123*s)+'px'})}
window.addEventListener('resize',()=>{if(!$('#rep').hidden)fit()});
function openRep(){buildPages();$('#rep').hidden=false;$('#rep').scrollTop=0;document.body.style.overflow='hidden';fit()}
let libs=null;function loadLibs(){if(libs)return libs;libs=Promise.all(['html2canvas.min.js','jspdf.umd.min.js'].map(s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=no;document.head.appendChild(e)})));return libs}
function makePdf(){const wasHidden=$('#rep').hidden;
 const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:794px';holder.innerHTML=reportHtml().join('');document.body.appendChild(holder);shrink(holder);
 return loadLibs().then(()=>document.fonts?document.fonts.ready:null).then(()=>{const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),pgs=holder.querySelectorAll('.page');let ch=Promise.resolve();
  pgs.forEach((p,i)=>{ch=ch.then(()=>html2canvas(p,{scale:2,backgroundColor:'#fff',useCORS:true,logging:false}).then(c=>{if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297)}))});
  return ch.then(()=>{holder.remove();if(wasHidden)$('#rep').hidden=true;return pdf})}).catch(e=>{holder.remove();throw e})}
function fname(){return 'تكاليف_الموالح_'+String(S.variety).replace(/\s+/g,'_')+'_'+String(D(S.date)||today()).replace(/\//g,'-')+'.pdf'}
function sharePdf(){/* in-app preview; «إرسال واتساب» inside it shares the file — nothing is downloaded automatically */
 $('#busy').hidden=false;makePdf().then(pdf=>{const blob=pdf.output('blob'),name=fname();window.__lastPdf={size:blob.size,name:name};$('#busy').hidden=true;
  PdfShare.open(blob,name,{title:name.replace('.pdf','').replace(/_/g,' ')})})
 .catch(e=>{$('#busy').hidden=true;alert('ماقدرتش أجهز الـ PDF: '+e)})}
window.CCAPP={setMode:m=>{REPMODE=m},makePdf,state:()=>S,render:renderAll,calc:()=>CALC(S),calc0:()=>calc(S),reportHtml,D,today,cairoISO,parseDateInput};
renderAll();
