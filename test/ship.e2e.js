/* v2.6.0 — الشحنة واحدة للصوافي والقرار (Chromium + WebKit آيفون):
   ترحيل من بيانات زي لقطة أمير (القرار فيه فريمونت 140/باليت 17 باليت قديمة) ← القرار = سطور الصوافي؛ تعديل في الصوافي ← القرار، تعديل في القرار ← الصوافي؛
   تكلفة كل سطر = الصوافي = التكاليف؛ خام كل صنف؛ «طبّق الأحسن» بيكتب في الصوافي؛ + صنف / حذف؛ صندوق القرار في التكاليف بنفس الأصناف.
   شغّل: python3 -m http.server 8765 ثم node test/ship.e2e.js (URL=… PW=… SHOTS=فولدر) */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const URL=(process.env.URL||'http://localhost:8765/').replace(/\/$/,'')+'/';const SHOTS=process.env.SHOTS||'';
const E=require('../costs-core.js');const CDEF=(()=>{const d=JSON.parse(JSON.stringify(E.DEF));E.ensureCostsCatalog(d);return d})();
const num=s=>parseFloat(String(s).replace(/[^\d.\-]/g,''));const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2};
const ls=(pg,k)=>pg.evaluate(k=>{const p=JSON.parse(localStorage.getItem(k)||'null');return p&&p.S?p.S:p},k);
async function seed(pg){await pg.goto(URL+'manifest.webmanifest');await pg.evaluate(CDEF=>{localStorage.clear();
 const S={date:'2026-11-27',sar:3.7567,egp:53.5,client:'فاكهة الصيف',mode:'حاوية',fB:15000,fC:2800,cost:16960.03,clients:[['حامد الغامدي',0.05],['فاكهة الصيف',0.06],['جبار البيشي',0.06]],
  pk:[['كرتون مقفول 7 ك',7.15],['كرتون أوبن توب 7 ك',7.15],['كرتون مقفول 14 ك',14],['كرتون مقفول 15 ك',15],['صندوق بلاستيك جامبو 15 ك',15],['صندوق بلاستيك 8 ك',7.5],['صندوق بلاستيك 5 ك ملوّن',5,200],['صندوق بلاستيك 2.5 ك ملوّن',2.5,400]],
  exp:[['مصروفات البراد في السعودية (إجمالي)',6500,0],['تخليص ونقل من الميناء',0,6500],['دخولية',0,2000],['مصاريف أخرى',0,0]],expV:2,
  lines:[['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200,null,{v:'يوسفي',s:''},{a:1}],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',1694,18,11,154,null,null,{a:1}]]};
 localStorage.setItem('safiNetback.v2',JSON.stringify({ver:2,t:Date.now(),S}));
 const C=JSON.parse(JSON.stringify(CDEF));C.usd=53.5;C.raw=11.75;C.variety='برتقال أبوسرة تلوين';C.rawBy={'برتقال أبوسرة تلوين':11.75,'يوسفي':9};C.cull=0.25;C.cullP=5;C.date='2026-11-27';
 localStorage.setItem('citrusCosts.v2',JSON.stringify({ver:2,t:Date.now(),S:C}));localStorage.setItem('fx.v1',JSON.stringify({v:53.5,safi:53.5,costs:53.5,t:Date.now()}));localStorage.setItem('decision.migr.fc2800','1');
 /* القرار القديم زي لقطة أمير (v2.3.1 على الموقع): فريمونت / 5 ك ملوّن / 15 ريال / 140 كرتونة / 17 باليت + حد أقصى */
 localStorage.setItem('decision.v1',JSON.stringify({ver:1,t:Date.now(),S:{v:1,base:'حاوية',cap:{'حاوية':21,'براد':23},rawToday:null,items:[{v:'فريمونت',sz:'',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:140,p:15,pal:17,max:20,share:''},{v:'أبو سرة',sz:'',pk:'كرتون أوبن توب 7 ك',cpp:140,p:22,pal:11,max:'',share:''}]}}))},CDEF)}
const its=pg=>pg.evaluate(()=>DECAPP.state().dec.items.map(x=>[x.v,x.pk,x.pal,x.cpp,x.p,x.raw]));
(async()=>{for(const bt of [chromium,webkit]){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});const ctx=await b.newContext(IPH);const errs=[];
 const watch=pg=>{pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/webmanifest|404|favicon/i.test(m.text()))errs.push(m.text())});pg.on('dialog',d=>d.accept())};
 const pg=await ctx.newPage();watch(pg);await seed(pg);await pg.goto(URL+'index.html');await pg.waitForSelector('#quick .qk-r');
 /* 1) الترحيل: القرار = سطور الصوافي، نسخة احتياطية، الحد الأقصى اتنقل لنفس الصنف (فريمونت = صف يوسفي في التكاليف) */
 assert.deepStrictEqual(await its(pg),[['يوسفي','صندوق بلاستيك 5 ك ملوّن',17,200,15,9],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',11,154,18,11.75]]);
 const bk=await pg.evaluate(()=>JSON.parse(localStorage.getItem('decision.v1.backup.v26')).S.items[0]);assert.strictEqual(bk.v,'فريمونت');assert.strictEqual(bk.cpp,140);
 assert.strictEqual(await pg.inputValue('input[data-h="items.0.max"]'),'20');assert.strictEqual(await pg.inputValue('input[data-h="items.0.cpp"]'),'200');assert.strictEqual(await pg.inputValue('input[data-h="items.1.pal"]'),'11');
 assert.strictEqual(await pg.$('[data-ha="fromSales"]'),null,'زرار النسخ اتشال');
 assert.match(await pg.textContent('#beWarn'),/28 باليت = 2 حاوية/);assert.match(await pg.textContent('#beSync'),/28 باليت · 4,'?094|28 باليت/);
 /* 2) تكلفة كل سطر = «تكلفة الطن هنا» في الصوافي (التلقائية) */
 const sl=await ls(pg,'safiNetback.v2');const c0=await pg.textContent('[data-bc="0"] b'),c1=await pg.textContent('[data-bc="1"] b');
 assert.strictEqual(num(c0),+sl.lines[0][6]);assert.strictEqual(num(c1),+sl.lines[1][6]);assert.strictEqual(+sl.lines[0][6],16304.63);assert.strictEqual(+sl.lines[1][6],21380.1);
 /* 3) القرار السريع: نفس الحساب اليدوي (test/be-ship.test.js) */
 const q=await pg.textContent('#quick');assert.match(q,/اشتري لحد 12\.92/);assert.match(q,/متشتريش بـ 11\.75 — التعادل 7\.06/);assert.match(q,/13,075\.44/);assert.match(q,/= 2 حاوية/);   // v2.8.0: النولون والمصروفات × 2 حاوية
 assert.match(q,/النولون 2,800\$ × 2 حاوية \+ المصروفات 8,500 ريال × 2 حاوية = 38,037\.52 ريال/);
 if(SHOTS&&bt===webkit)await shot(pg,'#quick','decision_v26_01_quick');
 /* 4) تعديل في القرار ← الصوافي */
 await pg.fill('input[data-h="items.0.pal"]','15');await pg.waitForTimeout(150);let s2=await ls(pg,'safiNetback.v2');assert.strictEqual(s2.lines[0][4],15);assert.strictEqual(s2.lines[0][2],3000);
 await pg.fill('input[data-h="items.1.p"]','19');await pg.waitForTimeout(150);s2=await ls(pg,'safiNetback.v2');assert.strictEqual(s2.lines[1][3],19);
 /* 5) الصوافي في تاب تاني: بتظهر نفس الأرقام، والتعديل هناك يوصل للقرار المفتوح (storage) */
 const sp=await ctx.newPage();watch(sp);await sp.goto(URL+'safi.html');await sp.waitForSelector('input[data-t="lines:0:4"]');
 assert.strictEqual(await sp.inputValue('input[data-t="lines:0:4"]'),'15');assert.strictEqual(await sp.inputValue('input[data-t="lines:1:3"]'),'19');assert.match(await sp.textContent('#ltTot'),/26 باليت/);assert.match(await sp.textContent('#ltTot'),/2 حاوية/);
 /* v2.8.0: الصوافي بتضرب النولون والمصروفات × 2 حاوية، وربح الشحنة = القرار */
 assert.match(await sp.textContent('#ltTot'),/النولون 2,800\$ × 2 حاوية \+ المصروفات 8,500 ريال × 2 حاوية/);assert.match(await sp.textContent('#expN'),/× 2 حاوية/);
 {const a1=await sp.evaluate(()=>{const r=SFAPP.result();return {pl:r.plShip,fr:r.frV,ex:r.expV,n:SFAPP.contInfo().n}});await pg.bringToFront();await pg.waitForFunction(()=>DECAPP.state().dec.items[0].pal===15,null,{timeout:5000});
  const a2=await pg.evaluate(()=>{const st=DECAPP.state();const A=BESHIP.analyze(BE,BE.ctx(st.safi,st.costs,st.dec,'حاوية'),st.dec.items,st.dec.items.map(x=>x.pal));return {own:A.own,n:A.plan.nC,sh:A.plan.sharedSar}});
  assert.strictEqual(a1.n,2);assert.strictEqual(a2.n,2);assert.ok(Math.abs(-(a1.fr+a1.ex)-a2.sh)<1e-6,'مصروفات '+JSON.stringify([a1,a2]));assert.ok(Math.abs(a1.pl-a2.own)<1,'ربح الصوافي = القرار '+a1.pl+' '+a2.own);await sp.bringToFront()}
 assert.strictEqual(num(await sp.inputValue('input[data-t="lines:0:6"]')),num(c0));
 await sp.fill('input[data-t="lines:1:4"]','6');await sp.waitForTimeout(150);await sp.fill('input[data-t="lines:0:5"]','210');await sp.waitForTimeout(300);
 await pg.waitForFunction(()=>DECAPP.state().dec.items[1].pal===6&&DECAPP.state().dec.items[0].cpp===210,null,{timeout:5000});
 assert.strictEqual(await pg.inputValue('input[data-h="items.1.pal"]'),'6');assert.strictEqual(await pg.inputValue('input[data-h="items.0.cpp"]'),'210');
 assert.match(await pg.textContent('#beSync'),/21 باليت/);assert.doesNotMatch(await pg.textContent('#beWarn'),/2 حاوية/);
 if(SHOTS&&bt===webkit){await shot(sp,'section:has(#lt)','decision_v26_03_safi_rows');await pg.bringToFront();await shot(pg,'#be','decision_v26_04_decision_rows')}
 /* 6) خام يوسفي من القرار ← التكاليف ← تكلفة الصوافي التلقائية = تكلفة القرار */
 await pg.fill('input[data-h="items.0.raw"]','10');await pg.waitForTimeout(150);const cs=await ls(pg,'citrusCosts.v2');assert.strictEqual(cs.rawBy['يوسفي'],10);assert.strictEqual(cs.raw,11.75);
 const c0b=num(await pg.textContent('[data-bc="0"] b'));assert.ok(Math.abs(c0b-(16304.63+1340.03))<0.02,'التكلفة زادت k×1 '+c0b);
 await sp.bringToFront();await sp.reload();await sp.waitForSelector('input[data-t="lines:0:6"]');assert.strictEqual(num(await sp.inputValue('input[data-t="lines:0:6"]')),c0b);
 /* 7) طبّق الأحسن ← باليتات الصوافي */
 await pg.bringToFront();const ob=await pg.evaluate(()=>{const st=DECAPP.state();return BE.optimize(BE.ctx(st.safi,st.costs,st.dec,'حاوية'),st.dec.items).ni});
 await pg.click('[data-ha="apply"]');await pg.waitForTimeout(200);s2=await ls(pg,'safiNetback.v2');assert.deepStrictEqual([s2.lines[0][4],s2.lines[1][4]],ob);assert.match(await pg.textContent('#hin'),/اتطبّق أحسن توزيع — الباليتات اتغيرت في الصوافي/);
 assert.ok(ob[0]<=20,'الحد الأقصى 20 محترم');
 /* 8) + صنف / حذف = سطر في الصوافي */
 await pg.click('[data-ha="add"]');await pg.waitForTimeout(150);s2=await ls(pg,'safiNetback.v2');assert.strictEqual(s2.lines.length,3);assert.strictEqual((await its(pg)).length,3);
 await pg.click('[data-ha="del:2"]');await pg.waitForTimeout(150);s2=await ls(pg,'safiNetback.v2');assert.strictEqual(s2.lines.length,2);
 /* 9) الصنف من القرار ← اسم السطر في الصوافي */
 await pg.selectOption('select[data-hs="items.1.v"]','صيفي');await pg.waitForTimeout(150);s2=await ls(pg,'safiNetback.v2');assert.strictEqual(s2.lines[1][0],'صيفي');assert.strictEqual(s2.lines[1][7].v,'صيفي');
 await pg.selectOption('select[data-hs="items.1.v"]','أبو سرة');await pg.waitForTimeout(150);
 /* 10) صندوق القرار في التكاليف = نفس الأصناف */
 const cp=await ctx.newPage();watch(cp);await cp.goto(URL+'costs.html');await cp.waitForSelector('#costsDec #twoSell');const tx=await cp.textContent('#costsDec #twoSell');assert.match(tx,/يوسفي/);assert.match(tx,/أبو سرة/);assert.doesNotMatch(tx,/فريمونت/);
 if(SHOTS&&bt===webkit){await pg.bringToFront();await pg.reload();await pg.waitForSelector('#quick .qk-r');await shot(pg,'#quick','decision_v26_05_quick_after_best')}
 assert.deepStrictEqual(errs,[],errs.join(' | '));await b.close();console.log('✓ ship',bt.name())}
 console.log('ship passed')})().catch(e=>{console.error('FAIL',e.stack);process.exit(1)});
async function shot(pg,sel,name){const el=await pg.$(sel);await el.evaluate(e=>e.scrollIntoView({block:'start'}));await pg.waitForTimeout(200);const bb=await el.boundingBox();const y0=await pg.evaluate(()=>scrollY);
 const H=900;let i=1;for(let y=bb.y+y0;y<bb.y+y0+bb.height;y+=H){const h=Math.min(H,bb.y+y0+bb.height-y);await pg.screenshot({path:SHOTS+'/'+name+'-'+(i++)+'.png',clip:{x:0,y,width:390,height:h},fullPage:true})}}
