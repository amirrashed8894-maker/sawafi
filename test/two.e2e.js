/* v2.1.0 القرار في الاتجاهين (Playwright): نفس الأرقام في الرئيسية وصندوق التكاليف وتقرير القرار، وبتتحدّث مع الكتابة،
   والصندوق على الشاشة بس (مش في تقرير التكاليف ولا الطباعة). Chromium ديسكتوب وموبايل + WebKit آيفون. */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const fs=require('fs');
const URL=process.env.URL||'http://localhost:8765/';const OUT=process.env.OUT||'';
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
const launch=bt=>bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
const cells=(pg,host)=>pg.$$eval(host+' #twoSell tr[data-two]',L=>L.map(r=>[r.querySelector('.two-a').innerText.trim(),r.querySelector('.two-b').innerText.trim()]));
const bigs=(pg,host)=>pg.$$eval(host+' #twoBuy .two-k b',L=>L.map(b=>b.innerText.replace(/[^\d.,-]/g,'')));
const curRow=(pg,host)=>pg.$eval(host+' .sc-p.on tr.cur',r=>[...r.cells].map(c=>c.innerText.replace(/◀\s*/,'').trim()));
const nRows=(pg,host)=>pg.$$eval(host+' .sc-p.on .sc-t tr:not(.h)',L=>L.length);
const fits=(pg,host)=>pg.$eval(host+' .scen',e=>[...e.querySelectorAll('.sc-p.on table')].every(t=>t.scrollWidth<=t.parentElement.clientWidth+1)&&e.scrollWidth<=e.clientWidth+1);
async function scenCheck(pg,host){assert.strictEqual(await pg.$$eval(host+' .sc-p.on',L=>L.length),1);assert.strictEqual(await nRows(pg,host),15,'15 rows');
 assert.deepStrictEqual(await curRow(pg,host),['22.00','17.80','+9,221','+193,831'],'container open-top current');assert.ok(await fits(pg,host),'scen fits width');
 await pg.click(host+' [data-sc-m="براد"]');assert.deepStrictEqual(await curRow(pg,host),['22.00','17.45','+8,806','+202,750'],'براد open-top');
 await pg.click(host+' [data-sc-i="1"]');assert.deepStrictEqual(await curRow(pg,host),['18.00','13.21','+3,791','+96,018'],'براد closed');
 await pg.click(host+' [data-sc-m="حاوية"]');assert.deepStrictEqual(await curRow(pg,host),['18.00','13.53','+4,168','+96,379'],'container closed');
 const first=await pg.$eval(host+' .sc-p.on .sc-t tr:nth-child(2)',r=>r.cells[0].innerText);assert.ok(first.startsWith('11.00'),'−7 row '+first);
 assert.ok(await fits(pg,host),'fits after toggle');await pg.click(host+' [data-sc-i="0"]')}
async function run(bt,name,opts){const b=await launch(bt);const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('dialog',d=>d.accept());
 await pg.goto(URL);await pg.waitForSelector('#twoBody #twoSell');
 assert.deepStrictEqual(await cells(pg,'#twoBody'),[['17.08','17.30'],['15.77','15.97']],'home ①');assert.deepStrictEqual(await bigs(pg,'#twoBody'),['16.07','15.74'],'home ②');
 // بارز: فوق الأزرار والتفاصيل، وظاهر في أول شاشة على الديسكتوب
 const y=await pg.$eval('#two',e=>e.getBoundingClientRect().top),yb=await pg.$eval('#be',e=>e.getBoundingClientRect().top);assert.ok(y<yb,'two above details');
 if(OUT&&name==='chromium-desktop'){await pg.screenshot({path:OUT+'two-home-top.png'});}
 if(OUT&&name==='webkit-iphone'){await pg.screenshot({path:OUT+'two-home-iphone.png',fullPage:false});await pg.locator('#two').screenshot({path:OUT+'two-home-iphone-box.png'})}
 // نفس الأرقام = KPI الرئيسية
 assert.ok((await pg.textContent('#beKpi')).includes('16.07'));
 await scenCheck(pg,'#twoBody');
 if(OUT&&name==='webkit-iphone'){await pg.locator('#scen').screenshot({path:OUT+'scen-home-iphone.png'})}
 if(OUT&&name==='chromium-desktop'){await pg.locator('#scen').screenshot({path:OUT+'scen-home.png'})}
 // تقرير القرار
 await pg.click('#bDecReport');await pg.waitForSelector('#pages .page');const p1=await pg.$eval('#pages .page',e=>e.innerText);
 const all=await pg.$eval('#pages',e=>e.innerText);['③ التكاليف وأسعار البيع','③ سيناريوهات سعر البيع','193,831','202,750','96,379'].forEach(s=>assert.ok(all.includes(s),'report ③ '+s));
 ['① سعر تعادل البيع','② سعر التعادل لشراء الخام','17.08','15.77','17.30','15.97','16.07','15.74'].forEach(s=>assert.ok(p1.includes(s),'report p1 '+s));
 const over=await pg.$$eval('#pages .page',L=>L.filter(p=>{const pc=p.querySelector('.pc');const r=pc.getBoundingClientRect(),q=p.getBoundingClientRect();return (r.bottom-q.top)*(1123/q.height)>1123-50}).length);assert.strictEqual(over,0,'report overflow');
 if(OUT&&name==='chromium-desktop'){const L=await pg.$$('#pages .page');await L[0].evaluate(e=>e.style.transform='none');await L[0].screenshot({path:OUT+'two-report-p1.png'})}
 await pg.click('#rClose');
 // التكاليف: نفس الأرقام، وبتتغير وإنت بتكتب سعر الخام
 await pg.click('.appnav a[data-nav="costs"]');await pg.waitForSelector('#costsDec #twoSell');
 assert.deepStrictEqual(await cells(pg,'#costsDec'),[['17.08','17.30'],['15.77','15.97']],'costs ①');assert.deepStrictEqual((await bigs(pg,'#costsDec')),['16.07','15.74'],'costs ②');
 await scenCheck(pg,'#costsDec');
 if(OUT&&name==='chromium-desktop'){await pg.locator('#costsDec').screenshot({path:OUT+'two-costs-box.png'})}
 if(OUT&&name==='webkit-iphone'){await pg.locator('#costsDec').screenshot({path:OUT+'two-costs-box-iphone.png'})}
 await pg.fill('input[data-k="raw"]','12');await pg.waitForTimeout(250);const c12=await cells(pg,'#costsDec');assert.ok(+c12[0][0]>17.08&&+c12[1][0]>15.77,'live update '+c12);
 assert.ok((await pg.textContent('#costsDec #twoSell')).includes('12.00'));
 // الرئيسية بنفس الرقم الجديد
 await pg.click('.appnav a[data-nav="home"]');await pg.waitForSelector('#twoBody #twoSell');await pg.waitForTimeout(200);assert.deepStrictEqual(await cells(pg,'#twoBody'),c12,'home = costs after raw change');
 await pg.fill('input[data-h="raw"]','10');await pg.waitForTimeout(150);assert.deepStrictEqual((await cells(pg,'#twoBody'))[0],['17.08','17.30']);
 // سعر بيع من الرئيسية ← ② بيتغير في التكاليف
 await pg.fill('input[data-h="items.0.p"]','23');await pg.waitForTimeout(150);const b23=await bigs(pg,'#twoBody');assert.ok(+b23[0]>16.07);
 await pg.click('.appnav a[data-nav="costs"]');await pg.waitForSelector('#costsDec #twoBuy');assert.deepStrictEqual(await bigs(pg,'#costsDec'),b23,'costs ② = home ②');
 // الصندوق مش في تقرير التكاليف ولا في الطباعة
 await pg.click('#bReport');await pg.waitForSelector('#pages .page');const rt=await pg.$eval('#pages',e=>e.innerText);['سعر تعادل البيع','سعر التعادل لشراء الخام','قرار','سيناريوهات','③'].forEach(s=>assert.ok(!rt.includes(s),'costs report must not include '+s));await pg.click('#rClose');
 await pg.emulateMedia({media:'print'});assert.strictEqual(await pg.$eval('#costsDec',e=>getComputedStyle(e).display),'none','box hidden in print');await pg.emulateMedia({media:'screen'});
 // مفيش بيانات خالص في الصوافي (أول فتح لقسم التكاليف) ← برضه أرقام سليمة
 await pg.evaluate(()=>{['safiNetback.v2','safiNetback.v2.mirror','decision.v1','decision.v1.mirror'].forEach(k=>localStorage.removeItem(k))});await pg.reload();await pg.waitForSelector('#costsDec #twoSell');
 const cf=await cells(pg,'#costsDec');assert.ok(cf.every(r=>r.every(v=>/^\d+\.\d\d$/.test(v))),'fresh '+cf);
 assert.deepStrictEqual(errs,[],'errors: '+errs.join(' | '));await b.close();console.log('✓ two',name)}
(async()=>{await run(chromium,'chromium-desktop',{viewport:{width:1100,height:900}});await run(chromium,'chromium-mobile',Object.assign({},IPH,{userAgent:undefined}));await run(webkit,'webkit-iphone',IPH);console.log('two passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
