/* اختبار واجهة (Playwright): شغّل الصوافي على localhost:8765 وتكاليف الموالح على 8766 */
const {chromium,webkit}=require('playwright');const assert=require('assert');
const URL='http://localhost:8765/';const OUT='/workspace/repos_be/previews/';
async function run(bt,name,opts){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
 const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 pg.on('dialog',d=>d.accept());
 await pg.goto(URL);await pg.waitForSelector('#be .be-main b');
 const kpi=async()=>(await pg.textContent('#be .be-main b')).trim();
 const k0=await kpi();assert.ok(/ج\/كجم/.test(k0),'kpi '+k0);
 assert.ok((await pg.textContent('#be .be-modes .chip.on')).includes('الحاوية'),'container default');
 // نولون الحاوية 2500$ (افتراض للمثال)
 await pg.fill('input[data-k="fC"]','2500');await pg.waitForTimeout(150);
 const k1=await kpi();assert.notStrictEqual(k1,k0,'freight affects BE');
 // سعر البيع
 await pg.fill('input[data-rb="items.0.p"]','23');await pg.waitForTimeout(150);const k2=await kpi();assert.notStrictEqual(k2,k1);
 // autosave + reload
 await pg.reload();await pg.waitForSelector('#be .be-main b');assert.strictEqual(await pg.inputValue('input[data-rb="items.0.p"]'),'23','persist');assert.strictEqual(await kpi(),k2,'same after reload');
 const idb=await pg.evaluate(()=>new Promise(r=>{const o=indexedDB.open('sawafi-store',1);o.onsuccess=()=>{const q=o.result.transaction('kv').objectStore('kv').get('S');q.onsuccess=()=>r(JSON.parse(q.result).S.rb.items[0].p)}}));assert.strictEqual(idb,23,'idb mirror');
 await pg.fill('input[data-rb="items.0.p"]','22');await pg.waitForTimeout(150);
 // variety picker (WebKit)
 await pg.selectOption('select[data-rbs="items.1.v"]','صيفي');await pg.waitForTimeout(100);assert.strictEqual(await pg.inputValue('select[data-rbs="items.1.v"]'),'صيفي','variety select');
 await pg.selectOption('select[data-rbs="items.1.v"]','أبو سرة');await pg.selectOption('select[data-rbs="items.1.sz"]','36');await pg.waitForTimeout(100);
 assert.strictEqual(await pg.inputValue('select[data-rbs="items.1.sz"]'),'36');
 await pg.screenshot({path:OUT+name+'-be.png',fullPage:false,clip:await pg.$eval('#be',e=>{e.scrollIntoView();const r=e.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:Math.min(r.height,2400)}})}).catch(()=>{});
 await pg.$eval('#be',e=>e.scrollIntoView());
 await pg.locator('#be').screenshot({path:OUT+name+'-be.png'});
 // optimal apply
 await pg.click('[data-ba="apply"]');await pg.waitForTimeout(150);const pals=await pg.$$eval('input[data-rb$=".pal"]',L=>L.map(x=>+x.value));assert.strictEqual(pals.reduce((a,b)=>a+b,0),20,'apply fills container '+pals);
 // براد as base
 await pg.click('[data-ba="base:براد"]');await pg.waitForTimeout(100);assert.ok((await pg.textContent('#be .be-main span')).includes('البراد'));await pg.click('[data-ba="base:حاوية"]');
 // reset keeps break-even settings
 await pg.fill('input[data-rb="items.0.p"]','24');await pg.waitForTimeout(100);await pg.click('#bReset');await pg.waitForTimeout(300);
 assert.strictEqual(await pg.inputValue('input[data-rb="items.0.p"]'),'24','rb kept after reset');
 // paste from costs program
 await pg.evaluate(()=>{document.querySelector('.be-det').open=true});
 const code='COSTS1:'+Buffer.from(JSON.stringify({app:'citrus-costs',S:{raw:11,cullP:7,loss:0.005,cull:0.15,pw:0.005,pk:[['كرتون مقفول 7 ك',23,7],['كرتون أوبن توب 7 ك',32,7]],sup:[['باليت',520]],var:[['برتقال أبوسرة تلوين',2500]]}}),'utf8').toString('base64');
 await pg.fill('#bePaste',code);await pg.click('[data-ba="paste"]');await pg.waitForTimeout(150);assert.ok((await pg.textContent('.be-det summary')).includes('اتلصق'));
 assert.strictEqual(await pg.inputValue('input[data-rb="raw"]'),'11');
 // invalid input
 await pg.fill('input[data-rb="items.0.cpp"]','abc');assert.ok(await pg.$eval('input[data-rb="items.0.cpp"]',e=>e.classList.contains('bad')));
 await pg.fill('input[data-rb="items.0.cpp"]','140');
 await pg.locator('#be').screenshot({path:OUT+name+'-be-after.png'});
 // original numbers untouched
 const net=await pg.evaluate(()=>{const S=SFAPP.state();return typeof calc(S).net});assert.strictEqual(net,'number');
 assert.deepStrictEqual(errs,[],'errors: '+errs.join(' | '));
 await b.close();console.log('✓',name)}
(async()=>{
 await run(chromium,'chromium-desktop',{viewport:{width:1100,height:900}});
 await run(chromium,'chromium-mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await run(webkit,'webkit-iphone',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
 console.log('UI tests passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
