/* اختبار واجهة (Playwright): شغّل الصوافي على localhost:8765 وتكاليف الموالح على 8766 */
const {chromium,webkit}=require('playwright');const assert=require('assert');
async function run(bt,name,opts){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});const ctx=await b.newContext(opts);
 const errs=[];const c=await ctx.newPage();c.on('pageerror',e=>errs.push(e.message));c.on('dialog',d=>d.accept());
 await c.goto('http://localhost:8766/');await c.waitForSelector('#bToSawafi');
 // غيّر سعر الخام والفرزة في برنامج التكاليف
 await c.fill('input[data-k="raw"]','11.5');await c.fill('input[data-k="cull"]','18');await c.waitForTimeout(100);
 await c.click('#bToSawafi');await c.waitForTimeout(300);const code=await c.evaluate(()=>window.__costsCode);assert.ok(/COSTS1:/.test(code));
 const s=await ctx.newPage();s.on('pageerror',e=>errs.push(e.message));s.on('dialog',d=>d.accept());await s.goto('http://localhost:8765/');await s.waitForSelector('#be .be-main b');
 const before=await s.textContent('#be .be-main b');
 await s.evaluate(()=>{document.querySelector('.be-det').open=true});await s.fill('#bePaste',code);await s.click('[data-ba="paste"]');await s.waitForTimeout(150);
 assert.strictEqual(await s.inputValue('input[data-rb="raw"]'),'11.5');assert.strictEqual(await s.inputValue('input[data-rb="cull"]'),'18');
 const after=await s.textContent('#be .be-main b');assert.notStrictEqual(after,before,'cull change moves BE');
 await s.locator('.be-det').screenshot({path:'/workspace/repos_be/previews/'+name+'-costs.png'});
 await c.locator('.tools').screenshot({path:'/workspace/repos_be/previews/'+name+'-citrus-button.png'});
 assert.deepStrictEqual(errs,[]);await b.close();console.log('✓ link',name,before.trim(),'→',after.trim())}
(async()=>{await run(chromium,'chromium',{viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
 await run(webkit,'webkit',{viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
