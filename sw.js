const C='sawafi-v2.1.0';
const F=['./','./index.html','./safi.html','./costs.html','./nav.js','./nav.js?v=200','./core.js','./pinned.js','./exp-migrate.js','./exp-migrate.js?v=201','./app.js','./app.js?v=200','./sizes.js','./sizes.js?v=2','./be-core.js','./be-core.js?v=200','./be-core.js?v=210','./be-two.js','./be-two.js?v=210','./costs-two.js','./costs-two.js?v=210','./safi-fresh.js','./safi-fresh.js?v=210','./decision.js','./decision.js?v=200','./decision.js?v=210','./decision-report.js','./decision-report.js?v=202','./decision-report.js?v=210','./costs-core.js','./costs-core.js?v=200','./costs-app.js','./costs-app.js?v=200','./costs-io.js','./costs-io.js?v=200','./pdf-share.js','./pdfjs/pdf.min.js?v=3.11.174','./pdfjs/pdf.worker.min.js?v=3.11.174','./style.css','./html2canvas.min.js','./jspdf.umd.min.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./fonts/cairo-arabic.woff2','./fonts/cairo-latin.woff2','./fonts/cairo-latin-ext.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('sawafi-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const q=e.request;if(q.method!=='GET')return;
 let url;try{url=new URL(q.url)}catch(err){return}
 if(url.origin!==location.origin)return;
 if(url.pathname.startsWith('/.netlify/'))return;
 const fromNet=()=>fetch(q).then(x=>{if(x&&x.ok){const cp=x.clone();caches.open(C).then(c=>c.put(q,cp));return x}throw new Error('bad')});
 const cacheFirst=()=>caches.match(q,{ignoreSearch:true}).then(r=>r||fromNet());
 if(q.mode==='navigate'||(q.headers.get('accept')||'').indexOf('text/html')!==-1){
  e.respondWith(cacheFirst().catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
  return;
 }
 e.respondWith(cacheFirst());
});
