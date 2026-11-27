/* v2.5.0 — صفحة القرار ④–⑦ (Chromium + WebKit آيفون): نفس أرقام ② والمحرك، سعر البيع من الصوافي + تعديل/رجوع، الهدف، الاحتمالات، خام كل صنف للتكاليف، + للشحنة.
   شغّل: python3 -m http.server 8765 ثم node test/mx.e2e.js (URL=… PW=… SHOTS=فولدر للمعاينة) */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const URL=process.env.URL||'http://localhost:8765/';const SHOTS=process.env.SHOTS||'';
const num=s=>parseFloat(String(s).replace(/[^\d.\-]/g,''));const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2};
async function seed(pg){await pg.evaluate(()=>{localStorage.clear();
 const S=JSON.parse(JSON.stringify(SAFI_PIN));S.egp=53.5;S.sar=3.7567;S.fC=2800;S.date='2026-11-27';
 S.pk=S.pk.concat([['صندوق بلاستيك 5 ك ملوّن',5,200]]);
 S.lines=[['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200,null,{v:'يوسفي',s:''}],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',1694,18,11,154,19628]];
 localStorage.setItem('safiNetback.v2',JSON.stringify({ver:2,t:Date.now(),S}));
 const C=BE.costsFrom(null);C.usd=53.5;C.raw=11.75;C.variety='برتقال أبوسرة تلوين';C.rawBy={'برتقال أبوسرة تلوين':11.75,'يوسفي':9};C.cull=0.25;C.cullP=5;COSTS_CALC.ensureCostsCatalog(C);/* زي ما صفحة التكاليف بتعمل لما تتفتح */
 localStorage.setItem('citrusCosts.v2',JSON.stringify({ver:2,t:Date.now(),S:C}));localStorage.setItem('fx.v1',JSON.stringify({v:53.5,safi:53.5,costs:53.5,t:Date.now()}));localStorage.setItem('decision.migr.fc2800','1')})}
(async()=>{for(const bt of [chromium,webkit]){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});const ctx=await b.newContext(IPH);const errs=[];
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/webmanifest/.test(m.text()))errs.push(m.text())});pg.on('dialog',d=>d.accept());
 await pg.goto(URL);await pg.waitForSelector('#mxAns .two-k');
 await pg.evaluate(()=>{window.SAFI_PIN=PINNED});await seed(pg);await pg.reload();await pg.waitForSelector('#mxAns .two-k');
 /* 1) ② = ⑦ لنفس الصنف والعبوة: أبو سرة مقفول 7 ك، 154 كرتونة/باليت، 18 ريال */
 const two=await pg.$$eval('#twoBuy table.sm tr',R=>R.map(r=>[...r.cells].map(c=>c.textContent.trim())));const row=two.find(r=>/مقفول 7/.test(r[0]));
 await pg.click('[data-mxa^="sel:0"]');const cellR=await pg.$eval('[data-mxo="برتقال أبوسرة تلوين|كرتون مقفول 7 ك"] b',e=>e.textContent);
 assert.strictEqual(num(cellR),num(row[1]),'⑦ = ② حاوية '+cellR+' '+row[1]);
 const inPage=await pg.evaluate(()=>{const st=DECAPP.state();const C=BE.ctx(st.safi,st.costs,st.dec,'حاوية');return BE.itemBE(C,{v:'برتقال أبوسرة تلوين',pk:'كرتون مقفول 7 ك',cpp:154,p:18}).R});assert.strictEqual(num(cellR),+inPage.toFixed(2));
 /* 2) اسأل: يوسفي + صندوق 5 ك ملوّن → سعر 15 من الصوافي، خام يوسفي 9 */
 await pg.selectOption('select[data-mx="v"]','يوسفي');await pg.waitForTimeout(100);await pg.selectOption('select[data-mx="pk"]','صندوق بلاستيك 5 ك ملوّن');await pg.waitForTimeout(100);
 assert.strictEqual(await pg.inputValue('#mx input[data-mxp]'),'15');assert.match(await pg.textContent('#mx [data-mxb]'),/من الصوافي/);
 const want=await pg.evaluate(()=>{const st=DECAPP.state();const C=BE.ctx(st.safi,st.costs,st.dec,'حاوية'),C2=BE.ctx(st.safi,st.costs,st.dec,'براد');const it={v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:200,p:15};
  return {R:BE.itemBE(C,it).R,R2:BE.itemBE(C2,it).R,P:BE.priceForRaw(C,it,9)}});
 const ks=await pg.$$eval('#mxAns .two-k b',L=>L.map(e=>e.textContent));assert.strictEqual(num(ks[0]),+want.R.toFixed(2));assert.strictEqual(num(ks[1]),+want.R2.toFixed(2));
 assert.match(await pg.textContent('#mxAns'),new RegExp('أقل سعر بيع للتعادل '+want.P.toFixed(2)));assert.match(await pg.textContent('#mxAns .two-k.main'),/خام يوسفي 9.00/);
 if(SHOTS&&bt===webkit)await shot(pg,'#mx','decision_v25_02_ask');
 /* 3) تعديل السعر 16 → يدوي، يفضل بعد إعادة الفتح، ↺ يرجّع 15 */
 await pg.fill('#mx input[data-mxp]','16');await pg.waitForTimeout(100);await pg.locator('#mx input[data-mxp]').blur();await pg.waitForTimeout(100);assert.match(await pg.textContent('#mx [data-mxb]'),/↺ الصوافي/);
 await pg.reload();await pg.waitForSelector('#mxAns .two-k');assert.strictEqual(await pg.inputValue('#mx input[data-mxp]'),'16');
 const R16=await pg.evaluate(()=>{const st=DECAPP.state();return BE.itemBE(BE.ctx(st.safi,st.costs,st.dec,'حاوية'),{v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:200,p:16}).R});assert.strictEqual(num((await pg.$$eval('#mxAns .two-k b',L=>L.map(e=>e.textContent)))[0]),+R16.toFixed(2));
 await pg.click('#mx [data-mxa^="reset:"]');await pg.waitForTimeout(100);assert.strictEqual(await pg.inputValue('#mx input[data-mxp]'),'15');
 /* 4) الهدف 2,000 ج/طن: الربح على الرقم ده = 2,000 */
 await pg.click('[data-mxa="tk:ton"]');await pg.fill('input[data-mx="tv"]','2000');await pg.waitForTimeout(100);
 const tg=await pg.evaluate(()=>{const st=DECAPP.state();const C=BE.ctx(st.safi,st.costs,st.dec,'حاوية');const it={v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:200,p:15};const L=BEMX.lin(BE,C,it),R=BEMX.rawMax(L,15,{k:'ton',v:2000});const p=BE.planBE(C,[it],[C.cap]);return {R,pt:p.profitAt(R)/p.T}});
 assert.ok(Math.abs(tg.pt-2000)<1e-6);assert.strictEqual(num((await pg.$$eval('#mxAns .two-k b',L=>L.map(e=>e.textContent)))[0]),+tg.R.toFixed(2));
 /* 5) الاحتمالات ± 3 ريال، ثقة 80% */
 await pg.fill('input[data-mx="d"]','3');await pg.click('[data-mxa="conf:80"]');await pg.waitForTimeout(100);
 const rk=await pg.evaluate(()=>{const st=DECAPP.state();const C=BE.ctx(st.safi,st.costs,st.dec,'حاوية');const L=BEMX.lin(BE,C,{v:'يوسفي',pk:'صندوق بلاستيك 5 ك ملوّن',cpp:200,p:15});const x=BEMX.risk(L,9,BEMX.dist(15,3),0.8,{k:'ton',v:2000});return x});
 const kt=await pg.$$eval('#mxRisk .kpi b',L=>L.map(e=>e.textContent));assert.strictEqual(num(kt[0]),Math.round(rk.prob*100));assert.strictEqual(num(kt[2]),+rk.rConf.toFixed(2));
 if(SHOTS&&bt===webkit){await shot(pg,'#mx','decision_v25_03_ask_target_risk')}
 /* 6) خام يوسفي من ⑦ → بيتسجل في التكاليف */
 const ri=pg.locator('input[data-mxr="يوسفي"]');await ri.fill('10');await pg.waitForTimeout(150);
 const rb=await pg.evaluate(()=>JSON.parse(localStorage.getItem('citrusCosts.v2')).S.rawBy['يوسفي']);assert.strictEqual(rb,10);assert.match(await pg.textContent('#mxAns .two-k.main'),/خام يوسفي 10.00/);
 /* 7) + للشحنة */
 const n0=await pg.evaluate(()=>DECAPP.state().dec.items.length);await pg.click('[data-mxa="sel:4"]');await pg.click('[data-mxa="add:يوسفي|صندوق بلاستيك 5 ك ملوّن"]');await pg.waitForTimeout(150);
 assert.strictEqual(await pg.evaluate(()=>DECAPP.state().dec.items.length),n0+1);
 /* 8) الدولار من فوق → ④ يتحدث */
 const before=num((await pg.$$eval('#mxAns .two-k b',L=>L.map(e=>e.textContent)))[0]);await pg.fill('input[data-h="egp"]','55');await pg.waitForTimeout(200);const after=num((await pg.$$eval('#mxAns .two-k b',L=>L.map(e=>e.textContent)))[0]);assert.ok(after>before,'egp up → R up '+before+' '+after);
 await pg.fill('input[data-h="egp"]','53.5');await pg.waitForTimeout(150);
 if(SHOTS&&bt===webkit){await pg.click('[data-mxa="tk:"]');await pg.selectOption('select[data-mx="v"]','يوسفي');await pg.waitForTimeout(100);await full(pg)}
 assert.deepStrictEqual(errs,[],errs.join(' | '));await b.close();console.log('✓ mx',bt.name(),'يوسفي 5ك @15: حاوية',want.R.toFixed(2),'براد',want.R2.toFixed(2),'أقل سعر على خام 9:',want.P.toFixed(2),'| هدف 2000:',tg.R.toFixed(2),'| احتمال',(rk.prob*100).toFixed(1)+'%','ثقة 80%:',rk.rConf.toFixed(2))}
 console.log('mx passed')})().catch(e=>{console.error('FAIL',e.stack);process.exit(1)});
async function shot(pg,sel,name){const el=await pg.$(sel);await el.evaluate(e=>e.scrollIntoView({block:'start'}));await pg.waitForTimeout(150);const bb=await el.boundingBox();const y0=await pg.evaluate(()=>scrollY);
 const H=900;let i=1;for(let y=bb.y+y0;y<bb.y+y0+bb.height;y+=H){const h=Math.min(H,bb.y+y0+bb.height-y);await pg.screenshot({path:SHOTS+'/'+name+'-'+(i++)+'.png',clip:{x:0,y,width:390,height:h},fullPage:true})}}
async function full(pg){await pg.evaluate(()=>scrollTo(0,0));const H=await pg.evaluate(()=>document.documentElement.scrollHeight);let i=1;for(let y=0;y<H;y+=900){await pg.screenshot({path:SHOTS+'/decision_v25_full-'+String(i++).padStart(2,'0')+'.png',clip:{x:0,y,width:390,height:Math.min(900,H-y)},fullPage:true})}}
