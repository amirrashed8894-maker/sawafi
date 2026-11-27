/* v2.4.0 — «تكلفة الطن هنا» في الصوافي تلقائي من التكاليف حسب الصنف والعبوة + تعديل يدوي + رجوع للتلقائي (Chromium + WebKit آيفون).
   شغّل: python3 -m http.server 8765 ثم node test/autocost.e2e.js  (URL=… لبورت تاني، PW=مسار playwright، SHOTS=فولدر لصور المعاينة) */
const {chromium,webkit}=require(process.env.PW||'playwright');const assert=require('assert');const URL=process.env.URL||'http://localhost:8765/';const SHOTS=process.env.SHOTS||'';
const SC=(()=>{const fs=require('fs'),vm=require('vm');const c={module:{exports:{}},localStorage:{getItem:()=>null},JSON,Math};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../core.js','utf8')+';module.exports={calc}',c);return c.module.exports})();
const num=s=>parseFloat(String(s).replace(/[^\d.\-]/g,''));
const IPH={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2};
const shot=async(pg,name,sel)=>{if(!SHOTS)return;const el=sel?await pg.$(sel):null;if(el)await el.evaluate(e=>e.scrollIntoView({block:'center'}));await pg.waitForTimeout(150);await pg.screenshot({path:SHOTS+'/'+name+'.png',fullPage:false})};
(async()=>{for(const bt of [chromium,webkit]){const b=await bt.launch(bt===chromium?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}:{});
 const ctx=await b.newContext(IPH);const errs=[];
 const open=async p=>{const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(p+' '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(p+' '+m.text())});pg.on('dialog',d=>d.accept());await pg.goto(URL+p);return pg};
 /* 1) التكاليف: يوسفي خام 9 ج/كجم، أبوسرة خام 10 ج/كجم */
 const c=await open('costs.html');await c.waitForSelector('#vars');
 const pickVar=async nm=>{await c.click('#vars [data-v] >> text="'+nm+'"');await c.waitForTimeout(80)};
 const pickPk=async nm=>{await c.click('#pkgs [data-p] >> text="'+nm+'"');await c.waitForTimeout(80)};
 await pickVar('يوسفي');await c.fill('input[data-k="raw"]','9');await pickPk('صندوق بلاستيك 5 ك ملوّن');
 const yShown=num(await c.textContent('#sum .egp'));
 await pickVar('برتقال أبوسرة تلوين');await c.fill('input[data-k="raw"]','10');await pickPk('كرتون مقفول 7 ك');
 const oShown=num(await c.textContent('#sum .egp'));
 const cmpRow=async nm=>num(await c.$$eval('#cmp tr',(R,nm)=>{const r=R.find(x=>x.cells[0]&&x.cells[0].textContent.trim()===nm);return r?r.cells[1].textContent:'NaN'},nm));
 assert.strictEqual(await cmpRow('كرتون مقفول 7 ك'),oShown);
 // الرجوع ليوسفي بيرجّع سعر خامه (9)
 await pickVar('يوسفي');assert.strictEqual(await c.inputValue('input[data-k="raw"]'),'9');await pickPk('صندوق بلاستيك 5 ك ملوّن');assert.strictEqual(num(await c.textContent('#sum .egp')),yShown);
 await shot(c,'01_costs_yousfi_source','#sum');
 await pickVar('برتقال أبوسرة تلوين');assert.strictEqual(await c.inputValue('input[data-k="raw"]'),'10');await pickPk('كرتون مقفول 7 ك');
 /* 2) الصوافي: سطور أمير من غير تكلفة → بتتملى تلقائي */
 await c.evaluate(()=>{const p=JSON.parse(localStorage.getItem('safiNetback.v2')||'null');});
 const s=await open('safi.html');await s.waitForSelector('#lt');
 await s.evaluate(()=>{const S=SFAPP.state();S.lines=[['يوسفي','صندوق بلاستيك 5 ك ملوّن',3400,15,17,200,null,{v:'يوسفي',s:''}],['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',1694,18,11,154,null]];
  if(!S.pk.some(p=>p[0]==='صندوق بلاستيك 5 ك ملوّن'))S.pk.push(['صندوق بلاستيك 5 ك ملوّن',5,200]);SFAPP.render()});
 const costIn=i=>'input[data-t="lines:'+i+':6"]';
 assert.strictEqual(num(await s.inputValue(costIn(0))),yShown,'يوسفي = التكاليف');assert.strictEqual(num(await s.inputValue(costIn(1))),oShown,'أبوسرة = التكاليف');
 assert.match(await s.textContent('[data-achost="0"]'),/تلقائي من التكاليف/);
 // الربح للطن = صافي الطن ج − التكلفة (حساب مستقل بـ calc الأصلية)
 const chk=async()=>{const st=await s.evaluate(()=>JSON.parse(JSON.stringify(SFAPP.state())));const r=SC.calc(st);const src=st.lines.filter(l=>+l[2]);
  for(let i=0;i<2;i++){const want=r.lines[i].nt*st.egp-src[i][6];const txt=await s.textContent('[data-pl="'+i+'"] b');const got=num(txt)*(/خسارة/.test(txt)?-1:1);assert.ok(Math.abs(got-Math.round(want*100)/100)<0.006,'pl '+i+' '+got+' vs '+want)}return st};
 const st1=await chk();
 await shot(s,'02_safi_auto_filled','[data-line="0"]');
 /* 3) تعديل باليد: 21000 → يدوي ويفضل بعد إعادة الفتح */
 await s.fill(costIn(0),'21000');await s.waitForTimeout(80);await s.locator(costIn(0)).blur();
 assert.match(await s.textContent('[data-achost="0"]'),/رجوع للتلقائي/);await chk();
 await s.reload();await s.waitForSelector('#lt');assert.strictEqual(await s.inputValue(costIn(0)),'21000','اليدوي اتحفظ');
 assert.strictEqual(num(await s.inputValue(costIn(1))),oShown);
 await shot(s,'03_safi_manual_override','[data-line="0"]');
 /* 4) التكاليف اتغيرت في تاب تاني: التلقائي بيتحدث، واليدوي لا */
 await c.fill('input[data-k="raw"]','11');await c.waitForTimeout(300);const o11=num(await c.textContent('#sum .egp'));assert.ok(o11>oShown);
 await s.waitForFunction(v=>parseFloat(document.querySelector('input[data-t="lines:1:6"]').value)===v,o11,{timeout:5000});
 assert.strictEqual(await s.inputValue(costIn(0)),'21000');await chk();
 /* 5) رجوع للتلقائي */
 await s.click('[data-acreset="0"]');await s.waitForTimeout(100);assert.strictEqual(num(await s.inputValue(costIn(0))),yShown);assert.match(await s.textContent('[data-achost="0"]'),/تلقائي من التكاليف/);await chk();
 await shot(s,'04_safi_reset_to_auto','[data-line="0"]');
 // مسح الخانة = رجوع للتلقائي برضه
 await s.fill(costIn(1),'19000');await s.locator(costIn(1)).blur();assert.strictEqual(await s.inputValue(costIn(1)),'19000');await s.fill(costIn(1),'');await s.locator(costIn(1)).blur();await s.waitForTimeout(80);assert.strictEqual(num(await s.inputValue(costIn(1))),o11);
 /* 6) تغيير العبوة في سطر تلقائي → التكلفة بتتغير لعبوة التكاليف الجديدة */
 await s.selectOption('select[data-t="lines:1:1"]','كرتون أوبن توب 7 ك');await s.waitForTimeout(100);await pickPk('كرتون أوبن توب 7 ك');const ot=num(await c.textContent('#sum .egp'));
 assert.strictEqual(num(await s.inputValue(costIn(1))),ot,'أوبن توب = التكاليف');
 /* 7) سطر قديم بتكلفة مكتوبة (زي 19628): يفضل يدوي، وزرار الرجوع بيوري الرقم التلقائي */
 await s.evaluate(()=>{const S=SFAPP.state();S.lines.push(['برتقال ابوسرة تلوين','كرتون مقفول 7 ك',1694,18,11,154,19628]);SFAPP.render()});
 assert.strictEqual(await s.inputValue(costIn(2)),'19628');assert.match(await s.textContent('[data-achost="2"]'),/رجوع للتلقائي/);
 /* 8) صنف مالوش تكلفة → يدوي زي النهارده */
 await s.evaluate(()=>{const S=SFAPP.state();S.lines.push(['مانجو','كرتون مقفول 7 ك',100,10,1,100,null,{v:'مانجو',s:''}]);SFAPP.render()});
 assert.strictEqual(await s.inputValue(costIn(3)),'');assert.match(await s.textContent('[data-achost="3"]'),/اكتبها باليد/);
 const dl=await s.evaluate(()=>JSON.parse(localStorage.getItem('safiNetback.v2')).S.lines.map(l=>[l[6],l[8]]));
 assert.deepStrictEqual(dl.map(x=>x[1]&&x[1].a?'a':'m'),['a','a','m','a']);
 await s.close();await c.close();assert.deepStrictEqual(errs,[],errs.join(' | '));await b.close();console.log('✓ autocost',bt.name(),'يوسفي',yShown,'أبوسرة مقفول',oShown,'→ خام 11',o11,'أوبن توب',ot)}
 console.log('autocost passed')})().catch(e=>{console.error('FAIL',e.stack);process.exit(1)});
