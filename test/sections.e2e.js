/* أقسام الصوافي والتكاليف جوه البرنامج المدموج: التقرير والـ PDF والتصدير وتعدد التابات */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const URL=process.env.URL||'http://localhost:8765/';
(async()=>{for(const bt of [chromium,webkit]){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});const errs=[];
 const open=async p=>{const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(p+' '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(p+' '+m.text())});pg.on('dialog',d=>d.accept());await pg.goto(URL+p);return pg};
 const s=await open('safi.html');await s.waitForSelector('#lt');await s.click('#bReport');await s.waitForSelector('#pages .page');const sp=await s.$$eval('#pages .page',L=>L.length);assert.ok(sp>=1);
 const pdf1=await s.evaluate(()=>SFAPP.makePdf().then(p=>p.output('blob').size));assert.ok(pdf1>20000,'safi pdf '+pdf1);await s.click('#rClose');
 const c=await open('costs.html');await c.waitForSelector('#inputs');await c.click('#bReport');await c.waitForSelector('#pages .page');
 const pdf2=await c.evaluate(()=>typeof makePdf==='function'?makePdf().then(p=>p.output('blob').size):0);assert.ok(pdf2>20000,'costs pdf '+pdf2);await c.click('#rClose');
 // تعدد التابات: الدولار يتغير من القرار والصوافي مفتوح في تاب تاني → الصوافي ياخد الجديد ومايكتبش القديم فوقه
 const h=await open('');await h.waitForSelector('#be .be-main b');await h.fill('input[data-h="egp"]','56');await h.waitForTimeout(300);
 assert.strictEqual(await s.inputValue('input[data-k="egp"]'),'56','safi tab adopted');assert.strictEqual(await c.inputValue('input[data-k="usd"]'),'56','costs tab adopted');
 await s.evaluate(()=>{dispatchEvent(new Event('pagehide'))});await c.evaluate(()=>{dispatchEvent(new Event('pagehide'))});
 const v=await h.evaluate(()=>[JSON.parse(localStorage.getItem('safiNetback.v2')).S.egp,JSON.parse(localStorage.getItem('citrusCosts.v2')).S.usd]);assert.deepStrictEqual(v,[56,56]);
 await h.close();await s.close();await c.close();assert.deepStrictEqual(errs,[],errs.join(' | '));await b.close();console.log('✓ sections',bt.name())}
 console.log('sections passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
