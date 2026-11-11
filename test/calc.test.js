// يثبت إن الحساب مطابق للبرنامج الأصلي: (1) كود الحساب منسوخ حرفيًا (2) النتائج مطابقة لمجموعات الأرقام المرجعية
const fs=require('fs'),path=require('path');const C=require('../core.js');let ok=true;const log=(p,m)=>{if(!p)ok=false;console.log((p?'PASS ':'FAIL ')+m)};
const src=fs.readFileSync(path.join(__dirname,'../core.js'),'utf8');const blk=src.split('/*ORIG-BEGIN*/\n')[1].split('\n/*ORIG-END*/')[0];
log(blk+'\n'===fs.readFileSync(path.join(__dirname,'orig_core_lines.txt'),'utf8'),'DEF/calc/_ld/f source identical to original');
const base=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline_original.json'),'utf8'));const {sets,DEF}=require('./sets.js');
log(JSON.stringify(DEF)===JSON.stringify(C.DEF),'DEF identical');
for(const [n,S] of sets){const a=JSON.stringify(C.calc(JSON.parse(JSON.stringify(S)))),b=JSON.stringify(base[n].calc);log(a===b,'calc identical (all fields, full precision): '+n)}
const P=C.parseNum;[['٢٨',28],['28,5',28.5],['24,000',24000],['١٠٫٥',10.5],['abc',NaN],['',NaN],['-3',-3],['۳٫۷۵',3.75]].forEach(([i,e])=>log(Object.is(P(i),e),'parse '+JSON.stringify(i)+' -> '+P(i)));
[['0','gt0','x'],['-1','ge0','x'],['100','pct','x'],['6','pct',''],['0','ge0',''],['','ge0','x'],['','ge0','',1],['','gt0','x',1]].forEach(([v,r,e,o])=>log(!!C.checkVal(v,r,o)===!!e,'check '+JSON.stringify(v)+' '+r+(o?' opt':'')));
process.exit(ok?0:1);
