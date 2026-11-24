/* v2.2.0 محلي سوبرماركت (Playwright): المدخلات في التكاليف (آيفون)، الحساب بيتحدّث، الحفظ، الأخطاء، أنواع الصناديق،
   تقرير التكاليف (يظهر بس لو مستخدم)، صندوق القرار في التكاليف، الصفحة الرئيسية وتقرير القرار. Chromium موبايل + WebKit آيفون.
   شغّل: python3 -m http.server PORT في فولدر الريبو، URL=http://localhost:PORT/ PW=... OUT=... node test/sm.e2e.js */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');
const URL=process.env.URL||'http://localhost:8765/';const OUT=process.env.OUT||'';
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
const launch=bt=>bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
const close=(a,b,tol,m)=>assert.ok(Math.abs(a-b)<=tol,m+': '+a+' vs '+b);
async function typeIn(pg,sel,v){await pg.fill(sel,'');await pg.type(sel,String(v))}
async function run(bt,name,opts){const b=await launch(bt);const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('dialog',d=>d.accept());
 // حفظ قديم من غير sm (زي أي يوم محفوظ قبل v2.2.0): نفس الأرقام بالظبط
 await pg.goto(URL+'costs.html');await pg.waitForSelector('#smCard h2');
 await pg.evaluate(()=>{const s=JSON.parse(JSON.stringify(DEF));s.raw=11.5;s.cullP=6.5;s.date='2026-11-20';localStorage.setItem('citrusCosts.v2',JSON.stringify({ver:2,t:Date.now(),S:s}))});await pg.reload();await pg.waitForSelector('#smCard h2');
 const old=await pg.evaluate(()=>({ton:CCAPP.calc().ton,ton0:CCAPP.calc0().ton,sm:S.sm===undefined,txt:document.querySelector('#smOut').innerText}));
 assert.strictEqual(old.ton,old.ton0,'old save same as calc');assert.ok(old.sm,'old save untouched');assert.ok(old.txt.includes('مقفول'),'off hint');
 await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForSelector('#smCard h2');
 const base=await pg.evaluate(()=>CCAPP.calc0().ton);const cd0=await pg.$$eval('#costsDec #twoSell tr[data-two] .two-a',L=>L.map(x=>+x.innerText.trim()));
 // المدخلات
 assert.strictEqual(await pg.inputValue('[data-sm="p"]'),'0');assert.strictEqual(await pg.$eval('[data-sm="box"]',s=>s.options[s.selectedIndex].text),'صندوق جامبو 15 كجم');
 await typeIn(pg,'[data-sm="p"]','10');await pg.waitForTimeout(100);
 let r=await pg.evaluate(()=>({ton:__r.ton,g:__r.smGain,kg:__r.smKg,bx:__r.smBoxes,c:__r.cullKg,smC:__r.smC}));close(r.g,576,1e-6,'gain');close(r.ton,17792.376675,1e-5,'ton');close(r.kg,3200,1e-6,'kg');close(r.c,4800,1e-6,'فرزة زي ما هي');close(r.smC,-176,1e-6,'smC');assert.ok(base>r.ton);
 const out=await pg.innerText('#smOut');['3,200.00','213.3','3,338.67','40,064.00','3,840.00','36,224.00','11.32','-176.00','+576.00','تصدير 74.6%','فرزة 14.9%','سوبرماركت 10.0%','هالك 0.5%'].forEach(s=>assert.ok(out.includes(s),'smOut '+s+' | '+out));
 const det=await pg.innerText('#detail');assert.ok(det.includes('محلي سوبرماركت مقاسات 100-113 (خامه − صافي بيعه)')&&det.includes('-176.00'),'detail row');
 assert.ok((await pg.innerText('#sum')).includes((17792.376675).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})),'sum');
 // صندوق القرار في التكاليف
 await pg.waitForTimeout(150);const cd=await pg.innerText('#costsDec');assert.ok(cd.includes('محلي سوبرماركت'),'costsDec row');const cd1=await pg.$$eval('#costsDec #twoSell tr[data-two] .two-a',L=>L.map(x=>+x.innerText.trim()));
 const want=await pg.evaluate(()=>{const tw=BE.twoWay(BETwo.readSafi(SAFI_FRESH.DEF,SAFI_FRESH.PINNED).S,BE.costsFrom(JSON.parse(JSON.stringify(S))),BETwo.readDec(BE),{egp:S.usd});return tw.base.items.map(x=>+x.minP.toFixed(2))});
 assert.deepStrictEqual(cd1,want,'costsDec = twoWay with sm');assert.ok(cd1[0]<cd0[0]&&cd1[1]<cd0[1],'costsDec lower '+cd0+' → '+cd1);
 if(OUT&&name==='webkit-iphone'){await pg.locator('#smCard').screenshot({path:OUT+'sm-inputs-iphone.png'})}
 // بالصندوق
 await pg.selectOption('[data-sm="basis"]','box');await typeIn(pg,'[data-sm="price"]','180');await pg.waitForTimeout(100);
 r=await pg.evaluate(()=>__r.smGain);close(r,((180-18)/15-7)*1000*0.1/0.75,1e-6,'per box');
 await pg.selectOption('[data-sm="basis"]','kg');await typeIn(pg,'[data-sm="price"]','12');
 // نوع صندوق جديد واختياره وتعديله وحذفه
 await pg.click('#smAdd');await typeIn(pg,'[data-smb="2:0"]','صندوق 10 كجم');await pg.dispatchEvent('[data-smb="2:0"]','change');
 await typeIn(pg,'[data-smb="2:1"]','11');await typeIn(pg,'[data-smb="2:2"]','10');await typeIn(pg,'[data-smb="2:3"]','0.9');await pg.selectOption('[data-sm="box"]','2');await pg.waitForTimeout(100);
 r=await pg.evaluate(()=>({n:__r.sm.name,k:__r.sm.perKg}));assert.strictEqual(r.n,'صندوق 10 كجم');close(r.k,(12*10.9-11)/10,1e-9,'new box perKg');
 await pg.selectOption('[data-sm="box"]','0');
 await pg.click('[data-smd="2"]');r=await pg.evaluate(()=>({n:__r.sm.name,len:S.sm.bx.length}));assert.strictEqual(r.n,'صندوق جامبو 15 كجم');assert.strictEqual(r.len,2);
 // خطأ: النسبة 150 ← مفيش حساب والتقرير مقفول
 await typeIn(pg,'[data-sm="p"]','150');assert.ok((await pg.innerText('#sum')).includes('نسبة السوبرماركت'),'error listed');
 let alerted='';pg.removeAllListeners('dialog');pg.on('dialog',d=>{alerted=d.message();d.accept()});await pg.click('#bReport');await pg.waitForTimeout(200);assert.ok(alerted.includes('نسبة السوبرماركت'),'blocked report');
 pg.removeAllListeners('dialog');pg.on('dialog',d=>d.accept());
 // مجموع الفرزة + السوبرماركت ≥ 100%: تحذير ومفيش حساب، وبيرجع لما تصلّح
 await typeIn(pg,'[data-sm="p"]','85');let sm=await pg.innerText('#sum');assert.ok(sm.includes('توزيع الخام'),'sum>100 listed '+sm.slice(0,200));assert.ok((await pg.innerText('#smOut')).length>0);
 await typeIn(pg,'[data-k="cull"]','10');assert.ok(!(await pg.innerText('#sum')).includes('توزيع الخام'),'fixed by lowering cull');await typeIn(pg,'[data-k="cull"]','15');
 await typeIn(pg,'[data-sm="p"]','10');
 // الحفظ بعد إعادة الفتح
 await pg.reload();await pg.waitForSelector('#smCard h2');assert.strictEqual(await pg.inputValue('[data-sm="p"]'),'10');r=await pg.evaluate(()=>__r.smGain);close(r,576,1e-6,'after reload');
 // تقرير التكاليف
 await pg.click('#bReport');await pg.waitForSelector('#pages .page');let rep=await pg.$eval('#pages',e=>e.innerText);
 ['محلي سوبرماركت — مقاسات 100-113','يشمل محلي سوبرماركت مقاسات 100-113','محلي سوبرماركت مقاسات 100-113 (خامه − صافي بيعه)','3,200.00','213.3','40,064.00','36,224.00','4,800.00','− السوبرماركت 10.0%','+576.00'].forEach(s=>assert.ok(rep.includes(s),'costs report '+s));
 const over=await pg.$$eval('#pages .page',L=>L.filter(p=>{const pc=p.querySelector('.pc');const r=pc.getBoundingClientRect(),q=p.getBoundingClientRect();return (r.bottom-q.top)*(1123/q.height)>1123-50}).length);assert.strictEqual(over,0,'costs report overflow');
 if(OUT&&name==='chromium-mobile'){const L=await pg.$$('#pages .page');for(let i=0;i<L.length;i++){await L[i].evaluate(e=>e.style.transform='none');await L[i].screenshot({path:OUT+'sm-costs-report-p'+(i+1)+'.png'})}}
 await pg.selectOption('#rMode','m');await pg.waitForTimeout(200);rep=await pg.$eval('#pages',e=>e.innerText);assert.ok(rep.includes('يشمل محلي سوبرماركت'),'m report note');await pg.click('#rClose');
 // عرض الآيفون: الكارت مش أعرض من الشاشة
 assert.ok(await pg.$eval('#smCard',e=>e.scrollWidth<=e.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1),'iphone fit');
 // الرئيسية (القرار) + تقرير القرار
 await pg.goto(URL);await pg.waitForSelector('#twoBody #twoSell');const big=await pg.$$eval('#twoBody #twoBuy .two-k b',L=>L.map(b=>b.innerText.replace(/[^\d.,-]/g,'')));assert.deepStrictEqual(big,['15.43','15.13'],'home ②');
 const sell=await pg.$$eval('#twoBody #twoSell tr[data-two] .two-a',L=>L.map(x=>x.innerText.trim()));assert.deepStrictEqual(sell,['17.02','15.72'],'home ①');
 assert.ok((await pg.innerText('#twoBody .sc-p.on')).includes('محلي سوبرماركت'),'home ③ row');
 if(OUT&&name==='webkit-iphone'){await pg.locator('#scen').screenshot({path:OUT+'sm-decision-scen-iphone.png'})}
 await pg.click('#bDecReport');await pg.waitForSelector('#pages .page');rep=await pg.$eval('#pages',e=>e.innerText);
 ['محلي سوبرماركت المباع (صافي بعد الصندوق)','محلي سوبرماركت — مقاسات 100-113 (مخرج لوحده)','74.6% / 14.9% / 10.0% / 0.5%','11.32','15.43','17.02','195,881'].forEach(s=>assert.ok(rep.includes(s),'decision report '+s));
 if(OUT&&name==='chromium-mobile'){const L=await pg.$$('#pages .page');for(let i=0;i<L.length;i++){await L[i].evaluate(e=>e.style.transform='none');await L[i].screenshot({path:OUT+'sm-decision-report-p'+(i+1)+'.png'})}}
 await pg.click('#rClose');
 // التصدير فيه sm
 await pg.goto(URL+'costs.html');await pg.waitForSelector('#smCard h2');const exp=await pg.evaluate(()=>JSON.parse(JSON.stringify({app:'citrus-costs',ver:2,S})).S.sm);assert.strictEqual(exp.p,0.1);
 // الرجوع للأرقام الأصلية بيقفله
 await pg.click('#bReset');r=await pg.evaluate(()=>({on:__r.smGain!=null,sm:S.sm}));assert.ok(!r.on&&r.sm===undefined,'reset');
 assert.deepStrictEqual(errs.filter(e=>!/favicon|ERR_ABORTED/.test(e)),[],'console errors');await b.close();console.log('✓ sm',name)}
(async()=>{await run(chromium,'chromium-mobile',Object.assign({},IPH,{userAgent:undefined}));await run(webkit,'webkit-iphone',IPH);console.log('sm passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
