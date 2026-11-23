/* يولّد safi-fresh.js: قيم الصوافي الافتراضية (DEF من core.js و PINNED من pinned.js) لصفحة التكاليف،
   لأن core.js و costs-core.js الاتنين فيهم const DEF ومينفعش يتحمّلوا في نفس الصفحة. */
const fs=require('fs'),vm=require('vm'),path=require('path');const d=path.join(__dirname,'..');
const c={module:{exports:{}},console,localStorage:{getItem:()=>null},JSON};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(d,'core.js'),'utf8')+'\n'+fs.readFileSync(path.join(d,'pinned.js'),'utf8')+';module.exports={DEF:JSON.parse(JSON.stringify(DEF)),PINNED:JSON.parse(JSON.stringify(PINNED))}',c);
const out='/* مولّد تلقائي من core.js + pinned.js (tools/gen-safi-fresh.js) — متعدلوش باليد */\nvar SAFI_FRESH='+JSON.stringify(c.module.exports)+';\nif(typeof module!==\'undefined\')module.exports=SAFI_FRESH;\n';
fs.writeFileSync(path.join(d,'safi-fresh.js'),out);console.log('safi-fresh.js',out.length);
