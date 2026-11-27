/* قسم التكاليف — صندوق «القرار» على الشاشة بس (مش في تقرير التكاليف): نفس الحساب BE.twoWay ونفس العرض BETwo.html.
   بيقرا التكاليف من الصفحة نفسها (S وإنت بتكتب) والصوافي وإعدادات القرار من نفس الموقع. */
(function(){'use strict';
function costsNow(){try{if(typeof S!=='undefined'&&S&&typeof S==='object')return BE.costsFrom(JSON.parse(JSON.stringify(S)))}catch(e){}return BE.costsFrom(null)}
function draw(){const host=document.getElementById('costsDec');if(!host)return;
 try{const sf=BETwo.readSafi(SAFI_FRESH.DEF,SAFI_FRESH.PINNED).S,cs=costsNow(),dec=BETwo.readDec(BE);const usd=+cs.usd;
  /* v2.6.0: الأصناف = سطور الصوافي بخام كل صنف، والعبوات بنفس كود التكاليف (زي صفحة القرار بالظبط) */
  if(window.BESHIP&&window.SafiAuto&&typeof CORE!=='undefined'){CORE.ensureCostsCatalog(cs);let ext=null;try{ext=JSON.parse(localStorage.getItem('decision.ext.v1')||'null')}catch(e){}
   BE.usePkg(BESHIP.pkgHook(cs,CORE,SafiAuto));dec.items=BESHIP.items(sf,ext,cs,SafiAuto)}
  host.innerHTML='<h2>القرار <small>سعر تعادل البيع وسعر تعادل شراء الخام</small></h2>'+BETwo.html(BE.twoWay(sf,cs,dec,usd>0?{egp:usd}:undefined),{compact:true})}
 catch(e){host.innerHTML='<h2>القرار</h2><div class="hint">مش قادر أحسب دلوقتي.</div>'}}
const later=()=>setTimeout(draw,0);
['input','change'].forEach(ev=>document.addEventListener(ev,later));
document.addEventListener('click',()=>setTimeout(draw,60));
window.addEventListener('storage',later);window.addEventListener('pageshow',later);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw()});
draw();window.COSTSDEC={draw};
})();
