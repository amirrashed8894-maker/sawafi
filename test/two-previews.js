/* JPG-ready PNG previews for v2.1.0: decision top, costs box, scenario box, decision report pages. OUT=dir */
const {chromium,webkit}=require(process.env.PW||'playwright');const OUT=process.env.OUT||'/tmp/';const URL=process.env.URL||'http://localhost:8765/';
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
const noNav=pg=>pg.addStyleTag({content:'.appnav{position:static!important}'});
(async()=>{let b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});let pg=await (await b.newContext({viewport:{width:1100,height:1200},deviceScaleFactor:1.5})).newPage();
 await pg.goto(URL);await pg.waitForSelector('#twoBody #twoSell');await pg.screenshot({path:OUT+'v210-decision-top-desktop.png'});await noNav(pg);await pg.locator('#scen').screenshot({path:OUT+'v210-scenario-box-desktop.png'});
 await pg.click('#bDecReport');await pg.waitForSelector('#pages .page');const L=await pg.$$('#pages .page');for(let i=0;i<L.length;i++){await L[i].evaluate(e=>e.style.transform='none');await L[i].screenshot({path:OUT+'v210-report-p'+(i+1)+'.png'})}await pg.click('#rClose');
 await pg.goto(URL+'costs.html');await pg.waitForSelector('#costsDec #twoSell');await noNav(pg);await pg.locator('#costsDec').screenshot({path:OUT+'v210-costs-box-desktop.png'});await b.close();
 b=await webkit.launch();pg=await (await b.newContext(IPH)).newPage();await pg.goto(URL);await pg.waitForSelector('#twoBody #twoSell');await pg.screenshot({path:OUT+'v210-decision-top-iphone.png'});await noNav(pg);
 await pg.locator('#two').screenshot({path:OUT+'v210-decision-box-iphone.png'});await pg.locator('#scen').screenshot({path:OUT+'v210-scenario-box-iphone.png'});
 await pg.goto(URL+'costs.html');await pg.waitForSelector('#costsDec #twoSell');await noNav(pg);await pg.locator('#costsDec').screenshot({path:OUT+'v210-costs-box-iphone.png'});await b.close();console.log('previews ok')})();
