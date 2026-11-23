/* التقارير التلاتة لوحدهم (Playwright): التكاليف (costs.html) والصوافي (safi.html) وتقرير القرار المدمج (الرئيسية).
   عرض + PDF + طباعة، ومفيش محتوى من قسم تاني، ومفيش أخطاء console. ومقارنة تقرير التكاليف بالبرنامج الأصلي citrus-costs e31397f
   لو ORIG=http://localhost:8766/ (worktree من main بتاع citrus-costs). */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const fs=require('fs');
const URL=process.env.URL||'http://localhost:8765/',ORIG=process.env.ORIG||'';const OUT=process.env.OUT||'/workspace/repos_be/previews/merged/';fs.mkdirSync(OUT,{recursive:true});
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
const launch=bt=>bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
function watch(pg,errs){pg.on('pageerror',e=>errs.push(pg.url()+' '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(pg.url()+' '+m.text())});pg.on('dialog',d=>d.accept())}
const SEC={home:{p:'',open:'#bDecReport',share:'#bDecShare',print:'#bDecPrint',must:['تقرير قرار شراء الخام','الحاوية','البراد','مصروفات الشحنة في السعودية','تكاليف الإنتاج في مصر','أحسن توزيع','الحساسية','الربح على سعر النهارده','RT-20261123-020'],never:['صافي سعر البيع في السعودية راجع لمصر','تكلفة الطن الصافي ظهر الحاوية']},
 safi:{p:'safi.html',open:'#bReport',share:'#bShare',print:'#bPrint',must:['صافي سعر البيع في السعودية راجع لمصر','الملخص'],never:['قرار شراء الخام','تكاليف الموالح','بحوث العمليات']},
 costs:{p:'costs.html',open:'#bReport',share:'#bShare',print:'#bPrint',must:['تكاليف الموالح'],never:['قرار شراء الخام','الصوافي','بحوث العمليات','سعر التعادل للخام']}};
async function run(bt,name,opts,shots){const b=await launch(bt);const ctx=await b.newContext(opts);const pg=await ctx.newPage();const errs=[];watch(pg,errs);
 for(const [k,s] of Object.entries(SEC)){await pg.goto(URL+s.p);await pg.waitForSelector(s.open);
  if(shots&&k==='home'){await pg.locator('.actions').first().screenshot({path:OUT+'buttons-home.png'})}
  if(shots&&k!=='home'){await pg.locator('.actions').first().screenshot({path:OUT+'buttons-'+k+'.png'})}
  assert.strictEqual(await pg.$eval(s.open,e=>e.offsetParent!==null),true,k+' button visible');
  await pg.click(s.open);await pg.waitForSelector('#pages .page');const txt=await pg.$eval('#pages',e=>e.innerText);
  s.must.forEach(m=>assert.ok(txt.includes(m),k+' report must include «'+m+'»'));s.never.forEach(m=>assert.ok(!txt.includes(m),k+' report must NOT include «'+m+'»'));
  const n=await pg.$$eval('#pages .page',L=>L.length);const ft=await pg.$$eval('#pages .pf',L=>L.map(x=>x.innerText));assert.strictEqual(ft.length,n,k+' footer on every page');assert.ok(ft[n-1].includes('صفحة '+n+' من '+n),k+' page numbers '+ft[n-1]);
  const over=await pg.$$eval('#pages .page',L=>L.filter(p=>{const pc=p.querySelector('.pc');const r=pc.getBoundingClientRect(),q=p.getBoundingClientRect();return (r.bottom-q.top)*(1123/q.height)>1123-50}).length);assert.strictEqual(over,0,k+' content overflows page');
  await pg.click('#rClose');
  // PDF (نفس طريقة زرار PDF / واتساب)
  await pg.click(s.share);await pg.waitForFunction(()=>window.__lastPdf&&window.__lastPdf.size>0||document.querySelector('.pdfshare,[data-pdfshare],#pdfShare'),null,{timeout:60000}).catch(()=>{});
  const pdf=await pg.evaluate(()=>window.__lastPdf||null);assert.ok(pdf&&pdf.size>20000,k+' pdf '+JSON.stringify(pdf));
  if(k==='home')assert.ok(/^قرار_شراء_الخام_/.test(pdf.name),pdf.name);
  // الطباعة
  await pg.goto(URL+s.p);await pg.waitForSelector(s.print);await pg.evaluate(()=>{window.__printed=0;window.print=()=>{window.__printed++}});await pg.click(s.print);await pg.waitForTimeout(600);
  assert.strictEqual(await pg.evaluate(()=>window.__printed),1,k+' print called');assert.ok(await pg.$$eval('#pages .page',L=>L.length)>=1);
  if(bt===chromium&&name==='chromium-desktop'){await pg.emulateMedia({media:'print'});const buf=await pg.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});const pages=(buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
   const exp=await pg.$$eval('#pages .page',L=>L.length);assert.strictEqual(pages,exp,k+' printed pages '+pages+' vs '+exp);await pg.emulateMedia({media:'screen'})}
 }
 assert.deepStrictEqual(errs,[],'errors: '+errs.join(' | '));await b.close();console.log('✓ reports',name)}
/* تقرير التكاليف = البرنامج الأصلي: نفس النص ونفس الصورة تقريبًا (نفس البيانات) */
async function sameAsOriginal(bt,name){if(!ORIG)return;const b=await launch(bt);const shots=[];
 for(const [lab,u] of [['merged',URL+'costs.html'],['original',ORIG]]){const ctx=await b.newContext({viewport:{width:1100,height:1400},deviceScaleFactor:1});const pg=await ctx.newPage();pg.on('dialog',d=>d.accept());
  await pg.goto(u);await pg.waitForSelector('#bReport');await pg.evaluate(()=>{localStorage.clear()});await pg.reload();await pg.waitForSelector('#bReport');
  await pg.evaluate(()=>{S.date='2026-11-23';S.usd=53.5;save();renderAll()});
  for(const mode of ['full','m']){await pg.click('#bReport');await pg.waitForSelector('#pages .page');await pg.selectOption('#rMode',mode);await pg.waitForTimeout(300);
   const L=await pg.$$('#pages .page');const txt=[];for(let i=0;i<L.length;i++){await L[i].evaluate(e=>e.style.transform='none');txt.push(await L[i].evaluate(e=>e.innerText.replace(/طُبع \S+/,'')));const f=OUT+'cmp-'+name+'-'+lab+'-'+mode+'-p'+(i+1)+'.png';await L[i].screenshot({path:f});shots.push({lab,mode,i,f})}
   shots.push({lab,mode,txt});await pg.click('#rClose')}
  await ctx.close()}
 for(const mode of ['full','m']){const a=shots.find(x=>x.lab==='merged'&&x.mode===mode&&x.txt),o=shots.find(x=>x.lab==='original'&&x.mode===mode&&x.txt);assert.deepStrictEqual(a.txt,o.txt,'costs report text identical ('+mode+')')}
 fs.writeFileSync(OUT+'cmp-'+name+'.json',JSON.stringify(shots.filter(x=>x.f)));await b.close();console.log('✓ costs report text identical to original citrus-costs',name)}
(async()=>{if(process.env.ONLY!=='cmp'){await run(chromium,'chromium-desktop',{viewport:{width:1100,height:900}},false);await run(chromium,'chromium-mobile',Object.assign({},IPH,{userAgent:undefined}),false);await run(webkit,'webkit-iphone',IPH,true)}
 await sameAsOriginal(chromium,'chromium');await sameAsOriginal(webkit,'webkit');console.log('reports passed')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
