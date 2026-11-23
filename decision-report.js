/* الصوافي والتكاليف v2.1.0 — «تقرير القرار» (المدمج) من الشاشة الرئيسية بس: سعر التعادل للخام حاوية/براد، المدخلات، الربح، أحسن توزيع، الحساسية.
   نفس شكل تقارير الصوافي والتكاليف (A4، RTL، ترويسة، تذييل وأرقام صفحات). مش بيلمس تقرير الصوافي ولا تقرير التكاليف. */
(function(){'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cairoISO=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d||new Date());
const D=x=>{const m=String(x||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:x};
const today=()=>D(cairoISO());
const F=(x,d)=>x==null||!isFinite(x)?'—':'<span class="ltr">'+f(x,d==null?2:d)+'</span>';
const fn=(x,d)=>x==null||!isFinite(x)?'—':f(x,d==null?2:d);
const pl=v=>v==null||!isFinite(v)?'—':(v>=0?'ربح ':'خسارة ')+'<span class="ltr">'+f(Math.abs(v))+'</span>';
const modeName=m=>m==='حاوية'?'الحاوية':'البراد';
const CODE='RT-20261123-021';
function data(){const st=DECAPP.state(),S=st.safi,Cs=st.costs,dec=st.dec,BE=DECAPP.BE;const raw=+Cs.raw||0;
 const plan=m=>BE.planN(dec,m);
 const modes=[dec.base,dec.base==='حاوية'?'براد':'حاوية'].map(m=>{const C=BE.ctx(S,Cs,dec,m),n=plan(m),p=BE.planBE(C,dec.items,n),o=BE.optimize(C,dec.items);return {m,C,n,p,o,sens:BE.sensitivity(S,Cs,dec,m,dec.items,n)}});
 const tw=BE.twoWay(S,Cs,dec);
 return {S,Cs,dec,BE,raw,modes,tw}}
function parts(){const d=data(),S=d.S,Cs=d.Cs,dec=d.dec,raw=d.raw,[A,B]=d.modes,u=S.sar,E=S.egp;
 const head=t=>'<div class="ph"><div><h1>'+t+'</h1><div class="meta">التاريخ <span class="ltr">'+today()+'</span> — العميل '+esc(S.client)+' (عمولة <span class="ltr">'+f(A.C.comm*100,1)+'%</span>) — الأساسي '+modeName(dec.base)+' — الدولار <span class="ltr">'+f(E)+'</span> ج — <span class="ltr">'+f(u,4)+'</span> ريال</div></div><span class="tag">قرار شراء الخام</span></div>';
 const verdict=p=>p.R==null?'—':p.R<=0?'مفيش سعر خام يعادل':raw<=p.R?'الشراء بـ '+F(raw)+' ج مربح — هامش '+F(p.R-raw)+' ج/كجم':'سعر الخام '+F(raw)+' ج أعلى من التعادل بـ '+F(raw-p.R)+' ج/كجم';
 const p1=head('تقرير قرار شراء الخام — سعر التعادل للخام')+
  '<h3>الملخص</h3><div class="rsum"><div class="m main"><span>اشتري الخام لحد — '+modeName(A.m)+'</span><b>'+F(A.p.R)+' ج/كجم</b><em>'+F(A.p.Rton,0)+' ج لطن الخام</em><small>'+verdict(A.p)+'</small></div>'+
  '<div class="m"><span>'+modeName(B.m)+' (فرعي)</span><b>'+F(B.p.R)+' ج/كجم</b><em>'+F(B.p.Rton,0)+' ج لطن الخام</em><small>الفرق '+F(A.p.R!=null&&B.p.R!=null?A.p.R-B.p.R:null)+' ج/كجم</small></div>'+
  '<div class="m"><span>سعر الخام النهارده</span><b>'+F(raw)+' ج/كجم</b><em>واصل المحطة</em><small>من التكاليف</small></div>'+
  '<div class="m'+(A.p.profitAt(raw)<0?' neg':'')+'"><span>الربح على سعر النهارده — '+modeName(A.m)+'</span><b>'+pl(A.p.profitAt(raw))+' ج</b><em>'+pl(A.p.T?A.p.profitAt(raw)/A.p.T:null)+' ج/طن</em><small>'+F(A.p.T,3)+' طن صافي</small></div></div>'+
  (()=>{const tw=d.tw,X=tw.base,Y=tw.sec;
  const r1=X.items.map((x,i)=>{const y=Y.items[i];return '<tr><td>'+esc([x.v,x.sz].filter(Boolean).join(' '))+'</td><td>'+esc(x.pk)+'</td><td class="n">'+fn(x.p)+'</td><td class="n"><b>'+fn(x.minP)+'</b></td><td class="n">'+fn(y.minP)+'</td><td class="n">'+(x.gap==null||!(x.p>0)?'—':(x.gap>=0?'+':'')+fn(x.gap))+'</td></tr>'}).join('')||'<tr><td colspan="6">مفيش أصناف.</td></tr>';
  const r2=[X,Y].map((m,j)=>'<tr'+(j?'':' class="gt"')+'><td>'+modeName(m.m)+(j?' (فرعي)':' (أساسي)')+'</td><td class="n">'+fn(m.R)+'</td><td class="n">'+fn(m.Rton,0)+'</td><td class="n">'+fn(raw)+'</td><td class="n">'+(m.R==null?'—':(m.R-raw>=0?'+':'')+fn(m.R-raw))+'</td><td class="n">'+pl(m.profit)+'</td></tr>').join('');
  return '<h3>① سعر تعادل البيع — أقل سعر بيع للكرتونة بالريال على خام '+fn(raw)+' ج/كجم</h3><table class="rt"><thead><tr><th>الصنف</th><th>العبوة</th><th>سعرك (ريال)</th><th>أقل سعر — '+modeName(X.m)+'</th><th>أقل سعر — '+modeName(Y.m)+'</th><th>الفرق ('+modeName(X.m)+')</th></tr></thead><tbody>'+r1+'</tbody></table>'+
   '<h3>② سعر التعادل لشراء الخام — أعلى سعر ج/كجم على أسعار البيع</h3><table class="rt"><thead><tr><th>الشحنة</th><th>ج/كجم خام</th><th>ج/طن خام</th><th>خام النهارده</th><th>الهامش ج/كجم</th><th>ربح/خسارة الشحنة (ج)</th></tr></thead><tbody>'+r2+'</tbody></table>'+
   '<div class="note">① أقل سعر = سعر الكرتونة اللي يخلّي ربح شحنة مالية من الصنف ده صفر على سعر الخام النهارده. ② سعر الخام للتعادل = أعلى سعر خام ج/كجم واصل المحطة يخلّي ربح الشحنة صفر بأسعار البيع وخطة الباليتات. '+modeName(Y.m)+' محسوب بنفس نسب الأصناف على سعته.</div>'})();
 const CMP='<h3>المقارنة — '+modeName(A.m)+' (أساسي) و'+modeName(B.m)+' (فرعي)</h3><table class="rt"><thead><tr><th>البند</th><th>'+modeName(A.m)+'</th><th>'+modeName(B.m)+'</th></tr></thead><tbody>'+
  [['السعة (باليت)',x=>fn(x.C.cap,0)],['باليتات الخطة',x=>fn(x.n.reduce((a,b)=>a+b,0),2)],['الصافي (طن)',x=>fn(x.p.T,3)],['الكراتين',x=>fn(x.p.Q,0)],['المبيعات (ريال)',x=>fn(x.p.sales)],
   ['مصروفات السعودية (ريال)',x=>fn(x.C.expSar)],['النولون (ريال)',x=>fn(x.C.frSar)],['المصروفات + النولون (ج)',x=>fn(x.C.sharedE,0)],['نصيب الطن الصافي (ج)',x=>fn(x.p.sharedTon)],
   ['سعر الخام للتعادل (ج/كجم)',x=>fn(x.p.R),'gt'],['ربح/خسارة الطن على سعر النهارده (ج)',x=>fn(x.p.T?x.p.profitAt(raw)/x.p.T:null)],['ربح/خسارة الشحنة على سعر النهارده (ج)',x=>fn(x.p.profitAt(raw))],['أحسن توزيع — سعر الخام للتعادل',x=>x.o.status==='ok'?fn(x.o.Rint):'—']]
   .map(r=>'<tr'+(r[2]?' class="gt"':'')+'><td>'+r[0]+'</td><td class="n">'+r[1](A)+'</td><td class="n">'+r[1](B)+'</td></tr>').join('')+'</tbody></table>'+
  '<div class="note">سعر الخام للتعادل = أعلى سعر خام ج/كجم واصل المحطة يخلّي ربح الشحنة صفر. '+modeName(B.m)+' محسوب بنفس نسب الأصناف على سعته.'+(A.C.frMissing?' تنبيه: نولون '+modeName(A.m)+' مش متدخل.':'')+'</div>';
 const blocks=[CMP];
 (()=>{const X=d.tw.base,Y=d.tw.sec;const sg=v=>v==null||!isFinite(v)?'—':(v>=0?'+':'−')+fn(Math.abs(v),0);
  const lab=s=>esc([[s.v,s.sz].filter(Boolean).join(' '),s.pk].filter(Boolean).join(' · '));
  const cols=[];X.scen.forEach((s,i)=>{cols.push([s,modeName(X.m)]);cols.push([Y.scen[i],modeName(Y.m)])});
  const okc=cols.filter(c=>c[0]&&c[0].ok);if(!okc.length)return;
  const R=(n,fx,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+n+'</td>'+okc.map(c=>'<td class="n">'+fx(c[0])+'</td>').join('')+'</tr>';
  blocks.push('<h3>③ التكاليف وأسعار البيع — لكل طن صافي (ج) على خام '+fn(raw)+' ج/كجم</h3><table class="rt sm"><thead><tr><th>البند</th>'+okc.map(c=>'<th>'+lab(c[0])+'<br>'+c[1]+'</th>').join('')+'</tr></thead><tbody>'+
   R('الخام (× k)',s=>fn(s.rawTon,0))+R('الفرزة المباعة',s=>'−'+fn(s.credit,0))+R('العبوات + المستلزمات + الغسيل',s=>fn(s.pkg+s.sup+s.wash,0))+R('تكاليف مصر',s=>fn(s.egy,0),'st')+
   R('مصروفات السعودية + النولون',s=>fn(s.share,0))+R('إجمالي التكلفة',s=>fn(s.total,0),'st')+R('سعر البيع الحالي (ريال/كرتونة)',s=>fn(s.p))+R('إيراد الطن بعد العمولة',s=>fn(s.rev,0))+
   R('الربح/الخسارة على سعر النهارده',s=>sg(s.rev-s.total),'gt')+R('أقل سعر بيع للتعادل (ريال)',s=>fn(s.minP))+'</tbody></table>'+
   '<div class="note">الصنف مالي الشحنة لوحده. مصروفات السعودية والنولون متوزعة على أطنان الشحنة.</div>');
  X.scen.forEach((s,i)=>{const b=Y.scen[i];if(!s||!s.ok)return;const bm=new Map((b&&b.ok?b.rows:[]).map(r=>[r.d,r]));
   blocks.push('<h3>③ سيناريوهات سعر البيع — '+lab(s)+' (كل 1 ريال فوق وتحت لحد 7)</h3><table class="rt sm sc"><thead><tr><th>سعر البيع (ريال)</th><th>تعادل الخام '+modeName(X.m)+'</th><th>ربح/طن '+modeName(X.m)+'</th><th>ربح/'+(X.m==='حاوية'?'حاوية':'براد')+'</th><th>تعادل الخام '+modeName(Y.m)+'</th><th>ربح/طن '+modeName(Y.m)+'</th><th>ربح/'+(Y.m==='حاوية'?'حاوية':'براد')+'</th></tr></thead><tbody>'+
    s.rows.map(r=>{const q=bm.get(r.d);return '<tr'+(r.d===0?' class="gt"':'')+'><td>'+(r.d===0?'الحالي ':'')+fn(r.p)+(r.d?' ('+(r.d>0?'+':'−')+Math.abs(r.d)+')':'')+'</td><td class="n">'+fn(r.R)+'</td><td class="n">'+sg(r.perTon)+'</td><td class="n">'+sg(r.perShip)+'</td><td class="n">'+(q?fn(q.R):'—')+'</td><td class="n">'+(q?sg(q.perTon):'—')+'</td><td class="n">'+(q?sg(q.perShip):'—')+'</td></tr>'}).join('')+'</tbody></table>'+
    '<div class="note">الربح على خام '+fn(raw)+' ج/كجم. '+modeName(X.m)+' '+fn(s.cap,0)+' باليت ('+fn(s.T,2)+' طن)'+(b&&b.ok?' — '+modeName(Y.m)+' '+fn(b.cap,0)+' باليت ('+fn(b.T,2)+' طن)':'')+'. أقل سعر للتعادل '+fn(s.minP)+' / '+fn(b&&b.minP)+' ريال.</div>')})})();const LR=A.p.rows.map((x,i)=>{const it=dec.items[i];const a=d.BE.itemBE(A.C,it),b=d.BE.itemBE(B.C,it),pr=d.BE.priceForRaw(A.C,it,raw);
  return '<tr><td>'+esc([it.v,it.sz].filter(Boolean).join(' '))+'</td><td>'+esc(it.pk)+'</td><td class="n">'+fn(x.cpp,0)+'</td><td class="n">'+fn(x.pal,0)+'</td><td class="n">'+fn(x.p)+'</td><td class="n">'+fn(x.t,3)+'</td><td class="n">'+fn(x.rev,0)+'</td><td class="n">'+fn(x.pkg,0)+'</td><td class="n">'+fn(x.wash,0)+'</td><td class="n">'+(x.ok?fn(a.R):'—')+'</td><td class="n">'+(x.ok?fn(b.R):'—')+'</td><td class="n">'+fn(pr)+'</td></tr>'});
 blocks.push('<h3>الأصناف وأسعار البيع (خطة '+modeName(A.m)+')</h3><table class="rt sm"><thead><tr><th>الصنف</th><th>العبوة</th><th>ك/باليت</th><th>باليت</th><th>ريال/كرتونة</th><th>طن</th><th>الإيراد ج/طن</th><th>عبوات ج/طن</th><th>غسيل ج/طن</th><th>تعادل '+modeName(A.m)+' لوحده</th><th>تعادل '+modeName(B.m)+' لوحده</th><th>أقل سعر لخام '+fn(raw)+' ج</th></tr></thead><tbody>'+(LR.join('')||'<tr><td colspan="12">مفيش أصناف.</td></tr>')+'</tbody></table>'+
  '<div class="note">الإيراد ج/طن = سعر الكرتونة × (1 − العمولة) × كراتين الطن ÷ '+f(u,4)+' × '+f(E)+'. «لوحده» = الصنف مالي الشحنة كلها. أقل سعر = سعر الكرتونة بالريال اللي يعادل خام بسعر النهارده.</div>');
 const expT=(col)=>S.exp.reduce((a,e)=>a+(+e[col]||0),0);
 blocks.push('<h3>مصروفات الشحنة في السعودية (ريال) — من الصوافي</h3><table class="rt"><thead><tr><th>البند</th><th>حاوية</th><th>براد</th></tr></thead><tbody>'+S.exp.filter(e=>+e[1]||+e[2]).map(e=>'<tr><td>'+esc(e[0])+'</td><td class="n">'+fn(+e[2]||0)+'</td><td class="n">'+fn(+e[1]||0)+'</td></tr>').join('')+
  '<tr class="st"><td>إجمالي المصروفات</td><td class="n">'+fn(expT(2))+'</td><td class="n">'+fn(expT(1))+'</td></tr>'+
  '<tr><td>النولون من مصر</td><td class="n">'+fn(+S.fC||0)+' $ = '+fn((+S.fC||0)*u)+'</td><td class="n">'+fn(+S.fB||0)+'</td></tr>'+
  '<tr class="gt"><td>الإجمالي بالريال</td><td class="n">'+fn(expT(2)+(+S.fC||0)*u)+'</td><td class="n">'+fn(expT(1)+(+S.fB||0))+'</td></tr></tbody></table>'+
  '<div class="note">العمولة '+esc(S.client)+' '+f(A.C.comm*100,1)+'% من المبيعات. المصروفات والنولون موزّعين على الأطنان.</div>');
 const supT=(Cs.sup||[]).reduce((a,x)=>a+(+x[1]||0),0);
 blocks.push('<h3>تكاليف الإنتاج في مصر (ج) — من التكاليف</h3><table class="rt q"><tbody>'+
  '<tr class="gh"><td colspan="2">الخام والفرز</td></tr><tr><td>الهالك من الخام</td><td class="n">'+f(Cs.loss*100,1)+'%</td></tr><tr><td>الفرزة بعد الهالك</td><td class="n">'+f(Cs.cull*100,1)+'%</td></tr><tr><td>كجم خام لكل طن صافي (k)</td><td class="n">'+fn(A.C.k)+'</td></tr><tr><td>سعر بيع الفرزة محلي</td><td class="n">'+fn(Cs.cullP)+' ج/كجم</td></tr><tr><td>الفرزة المباعة (خصم من تكلفة الطن)</td><td class="n">'+fn(A.C.credit)+' ج/طن</td></tr>'+
  '<tr class="gh"><td colspan="2">مستلزمات الإنتاج (ج/طن صافي)</td></tr>'+(Cs.sup||[]).filter(x=>+x[1]).map(x=>'<tr><td>'+esc(x[0])+'</td><td class="n">'+fn(+x[1])+'</td></tr>').join('')+'<tr class="st"><td>إجمالي المستلزمات</td><td class="n">'+fn(supT)+'</td></tr>'+
  '<tr class="gh"><td colspan="2">العبوات (ج/عبوة) — هالك '+f(Cs.pw*100,1)+'%</td></tr>'+(Cs.pk||[]).map(p=>'<tr><td>'+esc(p[0])+'</td><td class="n">'+fn(+p[1])+'</td></tr>').join('')+
  '<tr class="gh"><td colspan="2">غسيل المحطة (ج/طن)</td></tr>'+(Cs.var||[]).map(p=>'<tr><td>'+esc(p[0])+'</td><td class="n">'+fn(+p[1],0)+'</td></tr>').join('')+'</tbody></table>');
 const OPT=x=>x.o.status!=='ok'?'<tr><td colspan="3">—</td></tr>':dec.items.map((it,i)=>'<tr><td>'+esc([it.v,it.sz,it.pk].filter(Boolean).join(' · '))+'</td><td class="n">'+fn(x.n[i],1)+'</td><td class="n">'+fn(x.o.ni[i],0)+'</td></tr>').join('')+'<tr class="gt"><td>سعر الخام للتعادل</td><td class="n">'+fn(x.p.R)+'</td><td class="n">'+fn(x.o.Rint)+'</td></tr>';
 blocks.push('<h3>أحسن توزيع للباليتات (بحوث العمليات)</h3><table class="rt"><thead><tr><th>'+modeName(A.m)+' — الصنف</th><th>الخطة</th><th>الأحسن</th></tr></thead><tbody>'+OPT(A)+'</tbody></table>'+
  '<table class="rt" style="margin-top:8px"><thead><tr><th>'+modeName(B.m)+' — الصنف</th><th>الخطة</th><th>الأحسن</th></tr></thead><tbody>'+OPT(B)+'</tbody></table>'+
  '<div class="note">الأحسن = توزيع الباليتات على سعة الشحنة اللي يدّي أعلى سعر خام (برمجة كسرية خطية: Dinkelbach + Simplex) مع الحد الأقصى ونسبة المقاس من الفرز لو مكتوبين.</div>');
 blocks.push('<h3>الحساسية — سعر الخام للتعادل لو حاجة اتغيرت</h3><table class="rt"><thead><tr><th>لو</th><th>'+modeName(A.m)+' ج/كجم</th><th>الفرق</th><th>'+modeName(B.m)+' ج/كجم</th><th>الفرق</th></tr></thead><tbody>'+
  A.sens.rows.map((r,i)=>{const s=B.sens.rows[i];const dd=v=>v==null?'—':(v>=0?'+':'')+f(v);return '<tr><td>'+esc(r.n)+'</td><td class="n">'+fn(r.R)+'</td><td class="n">'+dd(r.d)+'</td><td class="n">'+fn(s.R)+'</td><td class="n">'+dd(s.d)+'</td></tr>'}).join('')+'</tbody></table>'+
  '<div class="note">الأساس: '+modeName(A.m)+' '+fn(A.sens.base)+' — '+modeName(B.m)+' '+fn(B.sens.base)+' ج/كجم.</div>');
 blocks.push('<h3>طريقة الحساب</h3><ul><li>صافي الطن = سعر الكرتونة × (1 − العمولة) × كراتين الطن ÷ ريال/$ × ج/$ − نصيب الطن من مصروفات السعودية والنولون (نفس الصوافي).</li><li>تكلفة الطن الصافي = الخام × k − الفرزة المباعة + العبوات + المستلزمات + الغسيل (نفس التكاليف).</li><li>سعر الخام للتعادل = (صافي الطن − العبوات − المستلزمات − الغسيل + الفرزة المباعة) ÷ k.</li></ul>');
 return {p1,blocks,head:head('تفاصيل قرار شراء الخام'),code:CODE}}
const AVAIL=1123-36-62;
function layout(root){const P=parts();root.innerHTML='';const pages=[];
 const mk=(h,cls)=>{const pg=document.createElement('div');pg.className='page';pg.innerHTML='<div class="pc'+(cls?' '+cls:'')+'">'+h+'</div>';const w=document.createElement('div');w.className='pagewrap';w.appendChild(pg);root.appendChild(w);pages.push(pg);return pg.firstChild};
 mk(P.p1,'p1');let pc=null,n=0;
 P.blocks.forEach(b=>{if(!pc){pc=mk(P.head);n=0}const d=document.createElement('div');d.innerHTML=b;pc.appendChild(d);n++;if(pc.offsetHeight>AVAIL&&n>1){d.remove();pc=mk(P.head);pc.appendChild(d);n=1}});
 pages.forEach((pg,i)=>{const ft=document.createElement('div');ft.className='pf';ft.innerHTML='<span class="ltr">'+P.code+'</span><span>قرار شراء الخام — سعر التعادل · طُبع <span class="ltr">'+today()+'</span></span><span>صفحة '+(i+1)+' من '+pages.length+'</span>';pg.appendChild(ft)});
 shrink(root);return pages}
function shrink(root){root.querySelectorAll('.page').forEach(pg=>{const pc=pg.querySelector('.pc');pc.style.transform='';pc.style.width='';let h=pc.offsetHeight;if(h>AVAIL){let s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';h=pc.offsetHeight;s=Math.max(0.55,AVAIL/h);pc.style.width=(706/s)+'px';pc.style.transformOrigin='top right';pc.style.transform='scale('+s+')'}})}
function fit(){document.querySelectorAll('#pages .pagewrap').forEach(w=>{const pg=w.firstChild,s=Math.min(1,w.clientWidth/794);pg.style.transform='scale('+s+')';w.style.height=(1123*s)+'px'})}
function build(){$('#rep').hidden=false;document.querySelectorAll('.pagewrap .page').forEach(p=>p.style.transform='');layout($('#pages'))}
function openRep(){build();$('#rep').scrollTop=0;document.body.style.overflow='hidden';fit()}
let libs=null;function loadLibs(){if(libs)return libs;libs=Promise.all(['html2canvas.min.js','jspdf.umd.min.js'].map(s=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=()=>{libs=null;no(new Error('تعذّر تحميل '+s))};document.head.appendChild(e)})));return libs}
function makePdf(){const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:794px';document.body.appendChild(holder);
 return (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{layout(holder);return loadLibs()}).then(()=>{const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),pgs=holder.querySelectorAll('.page');let ch=Promise.resolve();
  pgs.forEach((p,i)=>{ch=ch.then(()=>html2canvas(p,{scale:2,backgroundColor:'#fff',useCORS:true,logging:false}).then(c=>{if(i)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297)}))});
  return ch.then(()=>{holder.remove();return pdf})}).catch(e=>{holder.remove();throw e})}
function fname(){return 'قرار_شراء_الخام_'+today().replace(/\//g,'-')+'.pdf'}
function sharePdf(){$('#busy').hidden=false;makePdf().then(pdf=>{const blob=pdf.output('blob'),name=fname();window.__lastPdf={size:blob.size,name};$('#busy').hidden=true;PdfShare.open(blob,name,{title:name.replace('.pdf','').replace(/_/g,' ')})})
 .catch(e=>{$('#busy').hidden=true;alert('ماقدرتش أجهز الـ PDF: '+(e&&e.message||e))})}
function blocked(){const bad=document.querySelector('#app .bad');if(bad){alert('صحّح الخانات اللي باللون الأحمر الأول.');return true}return false}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t)return;
 if(t.id==='bDecReport'){if(!blocked())openRep()}
 else if(t.id==='bDecShare'||t.id==='rShare'){if(!blocked())sharePdf()}
 else if(t.id==='bDecPrint'||t.id==='rPrint'){if(blocked())return;build();$('#rep').hidden=false;fit();setTimeout(()=>window.print(),350)}
 else if(t.id==='rClose'){$('#rep').hidden=true;document.body.style.overflow=''}});
window.addEventListener('resize',()=>{if(!$('#rep').hidden)fit()});
window.DECREP={parts,layout,makePdf,openRep};
})();
