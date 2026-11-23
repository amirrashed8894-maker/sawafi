/* اختبار المتصفح للبرنامج المدموج (Playwright): Chromium + WebKit آيفون. شغّل: python3 -m http.server 8765 في فولدر الريبو ثم node test/merged.e2e.js
   PW=مسار playwright لو مش متسطب هنا. */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const BE=require('../be-core.js');
const URL='http://localhost:8765/';const OUT=process.env.OUT||'/workspace/repos_be/previews/merged/';require('fs').mkdirSync(OUT,{recursive:true});
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
async function launch(bt){return bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{})}
function watch(pg,errs){pg.on('pageerror',e=>errs.push(pg.url()+' '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/\.webmanifest$/.test(pg.url()))errs.push(pg.url()+' '+m.text())});pg.on('dialog',d=>d.accept(d.type()==='prompt'?(pg.__prompt||''):undefined))}
const ls=(pg,k)=>pg.evaluate(k=>{const r=localStorage.getItem(k);if(!r)return null;const p=JSON.parse(r);return p&&p.S?p.S:p},k);
const kpi=async pg=>(await pg.textContent('#be .be-main b')).trim();
const num=s=>parseFloat(String(s).replace(/,/g,''));
async function fresh(bt,name,opts,shots){const b=await launch(bt);const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];watch(pg,errs);
 await pg.goto(URL);await pg.waitForSelector('#be .be-main b');
 assert.strictEqual(await pg.$$eval('.appnav a',L=>L.length),3,'nav');assert.ok((await pg.textContent('.appnav a.on')).includes('القرار'));
 assert.ok((await pg.textContent('#be .be-modes .chip.on')).includes('الحاوية'),'container default');
 assert.strictEqual(await pg.inputValue('input[data-h="egp"]'),'53.5');assert.strictEqual(await pg.inputValue('input[data-h="fC"]'),'2800');assert.strictEqual(await pg.inputValue('input[data-h="cap.حاوية"]'),'21');
 // الرقم في الشاشة = الحساب في المحرك
 const st=await pg.evaluate(()=>DECAPP.state());const C=BE.ctx(st.safi,st.costs,st.dec,'حاوية');const exp=BE.planBE(C,st.dec.items,st.dec.items.map(i=>i.pal)).R;
 assert.strictEqual(num(await kpi(pg)).toFixed(2),exp.toFixed(2),'kpi = engine');
 assert.strictEqual((await ls(pg,'citrusCosts.v2')).usd,53.5,'costs FX synced');
 if(shots){await pg.screenshot({path:OUT+name+'-home-top.png'});await pg.locator('#app').screenshot({path:OUT+name+'-home-full.png'})}
 // الدولار بأرقام عربية
 await pg.fill('input[data-h="egp"]','٥٤٫٢');await pg.waitForTimeout(120);assert.strictEqual((await ls(pg,'safiNetback.v2')).egp,54.2);assert.strictEqual((await ls(pg,'citrusCosts.v2')).usd,54.2);
 // مدخل غلط مايتسجلش
 await pg.fill('input[data-h="egp"]','-3');await pg.waitForTimeout(80);assert.strictEqual((await ls(pg,'safiNetback.v2')).egp,54.2);assert.ok(await pg.$eval('input[data-h="egp"]',e=>e.closest('.in').classList.contains('bad')));
 await pg.fill('input[data-h="egp"]','53.5');await pg.waitForTimeout(80);
 await pg.fill('input[data-h="egp"]','');await pg.waitForTimeout(80);assert.strictEqual((await ls(pg,'safiNetback.v2')).egp,53.5,'empty not saved');await pg.fill('input[data-h="egp"]','53.5');
 // باليتات لازم صحيحة
 await pg.fill('input[data-h="cap.حاوية"]','21.5');await pg.waitForTimeout(80);assert.ok(await pg.$eval('input[data-h="cap.حاوية"]',e=>e.closest('.in').classList.contains('bad')));assert.strictEqual((await ls(pg,'decision.v1')).cap['حاوية'],21);await pg.fill('input[data-h="cap.حاوية"]','21');
 // سعر صنف فاضي وصفر
 await pg.fill('input[data-h="items.0.p"]','');await pg.waitForTimeout(80);assert.ok(await pg.$eval('input[data-h="items.0.p"]',e=>e.classList.contains('bad')));await pg.fill('input[data-h="items.0.p"]','22');
 await pg.fill('input[data-h="items.1.p"]','1');await pg.waitForTimeout(80);await pg.fill('input[data-h="items.0.p"]','1');await pg.waitForTimeout(80);
 assert.ok((await pg.textContent('#beKpi')).includes('مفيش سعر خام يعادل'),'negative BE message');
 await pg.fill('input[data-h="items.0.p"]','22');await pg.fill('input[data-h="items.1.p"]','18');await pg.waitForTimeout(80);
 // الصوافي: نفس الدولار، الحاوية، تعديل النولون
 await pg.click('.appnav a[data-nav="safi"]');await pg.waitForSelector('input[data-k="egp"]');
 assert.strictEqual(await pg.inputValue('input[data-k="egp"]'),'53.5');assert.ok((await pg.textContent('#modes .chip.on')).includes('حاوية'));
 await pg.fill('input[data-k="fC"]','3000');await pg.waitForTimeout(150);
 if(shots)await pg.screenshot({path:OUT+name+'-safi-top.png'});
 // التكاليف: الدولار الموحّد + سعر الخام
 await pg.click('.appnav a[data-nav="costs"]');await pg.waitForSelector('input[data-k="raw"]');
 assert.strictEqual(await pg.inputValue('input[data-k="usd"]'),'53.5');await pg.fill('input[data-k="raw"]','11');await pg.fill('input[data-k="cull"]','16');await pg.waitForTimeout(150);
 if(shots)await pg.screenshot({path:OUT+name+'-costs-top.png'});
 // رجوع للقرار: الأرقام اتحدثت
 await pg.click('.appnav a[data-nav="home"]');await pg.waitForSelector('#be .be-main b');
 assert.strictEqual(await pg.inputValue('input[data-h="fC"]'),'3000');assert.strictEqual(await pg.inputValue('input[data-h="raw"]'),'11');
 assert.ok((await pg.textContent('#beSrc')).includes('16.0%'),'cull from costs');
 // تعديل الدولار في التكاليف يكسب (آخر تعديل)
 await pg.goto(URL+'costs.html');await pg.fill('input[data-k="usd"]','55');await pg.waitForTimeout(100);await pg.goto(URL);await pg.waitForSelector('#be .be-main b');
 assert.strictEqual(await pg.inputValue('input[data-h="egp"]'),'55');assert.strictEqual((await ls(pg,'safiNetback.v2')).egp,55,'fx from costs synced to safi');
 await pg.fill('input[data-h="egp"]','53.5');await pg.fill('input[data-h="fC"]','2800');await pg.fill('input[data-h="raw"]','10');await pg.waitForTimeout(100);
 // أحسن توزيع + البراد
 await pg.click('[data-ha="apply"]');await pg.waitForTimeout(100);const pals=await pg.$$eval('input[data-h$=".pal"]',L=>L.map(x=>+x.value));assert.strictEqual(pals.reduce((a,b)=>a+b,0),21);
 await pg.click('[data-ha="base:براد"]');assert.ok((await pg.textContent('#be .be-main span')).includes('البراد'));await pg.click('[data-ha="base:حاوية"]');
 // اختيار الصنف/المقاس (WebKit)
 await pg.selectOption('select[data-hs="items.1.v"]','صيفي');await pg.waitForTimeout(80);assert.strictEqual(await pg.inputValue('select[data-hs="items.1.v"]'),'صيفي');
 await pg.selectOption('select[data-hs="items.1.sz"]','42');await pg.waitForTimeout(80);assert.strictEqual(await pg.inputValue('select[data-hs="items.1.sz"]'),'42');
 // الحفظ بعد إعادة التحميل + IndexedDB
 await pg.reload();await pg.waitForSelector('#be .be-main b');assert.strictEqual(await pg.inputValue('select[data-hs="items.1.v"]'),'صيفي');
 const idb=await pg.evaluate(()=>new Promise(r=>{const o=indexedDB.open('sawafi-store',1);o.onsuccess=()=>{const q=o.result.transaction('kv').objectStore('kv').get('dec');q.onsuccess=()=>r(q.result?JSON.parse(q.result).S.items[1].v:null)}}));assert.strictEqual(idb,'صيفي');
 // localStorage اتمسح → يرجع من IndexedDB
 await pg.evaluate(()=>{localStorage.removeItem('decision.v1');localStorage.removeItem('decision.v1.mirror')});await pg.reload();await pg.waitForTimeout(600);assert.strictEqual(await pg.inputValue('select[data-hs="items.1.v"]'),'صيفي','restored from idb');
 if(shots){await pg.click('.appnav a[data-nav="safi"]');await pg.waitForSelector('#lt');await pg.locator('#app').screenshot({path:OUT+name+'-safi-full.png'});
  await pg.click('.appnav a[data-nav="costs"]');await pg.waitForSelector('#inputs');await pg.locator('#app').screenshot({path:OUT+name+'-costs-full.png'});await pg.goto(URL);await pg.waitForSelector('#be .be-main b')}
 // أوفلاين بعد تسطيب الـ service worker
 await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.reload();await pg.waitForTimeout(500);await ctx.setOffline(true);
 for(const p of ['','safi.html','costs.html']){await pg.goto(URL+p);await pg.waitForSelector('.appnav');}
 await pg.goto(URL);await pg.waitForSelector('#be .be-main b');assert.ok(num(await kpi(pg))>0,'offline calc');await ctx.setOffline(false);
 /* أوفلاين: فحص تحديث sw.js بيفشل (طبيعي في أي متصفح من غير نت) — مش خطأ في البرنامج */
 for(let i=errs.length-1;i>=0;i--)if(/sw\.js load failed|WebKit encountered an internal error|Failed to load resource: net::ERR_INTERNET_DISCONNECTED/.test(errs[i]))errs.splice(i,1);
 assert.deepStrictEqual(errs,[],'errors: '+errs.join(' | '));await b.close();console.log('✓ fresh',name)}
async function migration(bt,name,opts){const b=await launch(bt);const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];watch(pg,errs);
 await pg.goto(URL+'manifest.webmanifest');
 // حفظ قديم من الصوافي v1.4.1: براد، الدولار 53، نولون الحاوية صفر، سطرين بيع
 await pg.evaluate(()=>{const S={date:'2026-11-17',sar:3.7567,egp:53,client:'فاكهة الصيف',mode:'براد',fB:15000,fC:0,cost:16960.03,clients:[['حامد الغامدي',0.05],['فاكهة الصيف',0.06],['جبار البيشي',0.06]],
  pk:[['كرتون مقفول 7 ك',7.15],['كرتون أوبن توب 7 ك',7.15]],lines:[['أبو سرة مقاس 24','كرتون أوبن توب 7 ك',1680,22,12,140,20886,{v:'أبو سرة',s:'24'}],['أبو سرة','كرتون مقفول 7 ك',1694,18,11,154,19628,{v:'أبو سرة',s:''}]],
  exp:[['مصروفات البراد',6500,0],['تخليص',0,5076]]};const j=JSON.stringify({ver:2,t:Date.now()-86400000,S});localStorage.setItem('safiNetback.v2',j);localStorage.setItem('safiNetback.v2.mirror',j)});errs.length=0; // favicon 404 على صفحة الـ manifest
 await pg.goto(URL);await pg.waitForSelector('#be .be-main b');const s=await ls(pg,'safiNetback.v2');
 assert.strictEqual(s.mode,'براد','saved mode kept');assert.strictEqual(s.egp,53,'saved FX kept');assert.strictEqual(s.fC,2800,'freight filled once');assert.strictEqual(s.lines.length,2);assert.strictEqual(s.lines[0][6],20886);
 assert.strictEqual((await ls(pg,'citrusCosts.v2')).usd,53);assert.ok((await pg.textContent('#hin')).includes('2,800$'),'notice');
 await pg.click('[data-ha="fromSales"]');await pg.waitForTimeout(100);assert.strictEqual(await pg.inputValue('input[data-h="items.0.pal"]'),'12');assert.strictEqual(await pg.inputValue('select[data-hs="items.0.sz"]'),'24');
 await pg.fill('input[data-h="fC"]','0');await pg.reload();await pg.waitForSelector('#be .be-main b');assert.strictEqual(await pg.inputValue('input[data-h="fC"]'),'0','migration only once');
 assert.ok((await pg.textContent('#beWarn')).includes('نولون الحاوية مش متدخل'));
 await pg.goto(URL+'safi.html');await pg.waitForSelector('#lt');assert.ok((await pg.textContent('#modes .chip.on')).includes('براد'));assert.strictEqual(await pg.$$eval('#lt .ln',L=>L.length),2);
 // استيراد التكاليف من البرنامج القديم
 await pg.goto(URL+'costs.html');await pg.waitForSelector('#bCostsImport');
 pg.__prompt='COSTS1:'+Buffer.from(JSON.stringify({app:'citrus-costs',S:{raw:12.5,cullP:6,loss:0.01,cull:0.18,pw:0.005,usd:52,pk:[['كرتون مقفول 7 ك',24,7],['كرتون أوبن توب 7 ك',33,7]],sup:[['باليت',530]],var:[['برتقال أبوسرة تلوين',2600]]}}),'utf8').toString('base64');
 await pg.click('#bCostsImport');await pg.waitForTimeout(300);await pg.reload();await pg.waitForSelector('input[data-k="raw"]');assert.strictEqual(await pg.inputValue('input[data-k="raw"]'),'12.5');
 await pg.goto(URL);await pg.waitForSelector('#be .be-main b');assert.strictEqual(await pg.inputValue('input[data-h="raw"]'),'12.5');assert.ok((await pg.textContent('#beSrc')).includes('530'));
 assert.strictEqual(await pg.inputValue('input[data-h="egp"]'),'53','FX canon kept over imported usd');
 assert.deepStrictEqual(errs,[],'errors: '+errs.join(' | '));await b.close();console.log('✓ migration',name)}
(async()=>{for(const [bt,name,o,sh] of [[chromium,'chromium-desktop',{viewport:{width:1100,height:900}},false],[chromium,'chromium-mobile',Object.assign({},IPH,{userAgent:undefined}),false],[webkit,'webkit-iphone',IPH,true]]){await fresh(bt,name,o,sh);await migration(bt,name,o)}
 console.log('E2E passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
