const {chromium}=require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const c=await b.newContext({viewport:{width:1100,height:1400},deviceScaleFactor:1.5});const pg=await c.newPage();
await pg.goto('http://localhost:8765/');await pg.click('#bDecReport');await pg.waitForSelector('#pages .page');const L=await pg.$$('#pages .page');
for(let i=0;i<L.length;i++){await L[i].evaluate(e=>e.style.transform='none');await L[i].screenshot({path:''+(process.env.OUT||'/tmp/')+'rp'+(i+1)+'.png'})}console.log(L.length);
await pg.click('#rClose');await pg.evaluate(()=>scrollTo(0,0));await pg.screenshot({path:''+(process.env.OUT||'/tmp/')+'home-btn.png',clip:{x:0,y:0,width:1100,height:700}});await b.close()})();
