import {hasThreads,threadRow,validateThreads,type ThreadSpec,type EndHole} from './threads';
import reference from './reference.json';
export const HEADERS = ['Sectie','Diameter','Passing','Lengte','OvergangRechts','Radius','Diepte','Breedte','SpieBegin','SpieLengte','SpieBreedte','SpieDiepte'];
export const CHAMFER_HEADERS = ['BuitenMaat','BuitenHoek','EindLinksMaat','EindLinksHoek','EindRechtsMaat','EindRechtsHoek'];
export const TRANSITIONS = ['', 'Radius', 'Chamfer', 'DIN509E', 'DIN76-1 B'] as const;
export type Transition = typeof TRANSITIONS[number];
export type Value = string | number | null;
export type EdgeType = Transition | 'OuterChamfer';
export interface Edge { type:EdgeType; radius?:Value; depth?:Value; width?:Value; length?:Value; angle?:Value; }
export type Side = 'left'|'right';
export type LengthMode = 'increment'|'left'|'right';
export interface Section { thread?:ThreadSpec; id:string; diameter:Value; fit:string|null; length:Value; transition:Transition; radius:Value; depth:Value; width:Value; keyStart:Value; keyLength:Value; keyWidth:Value; keyBottom:Value; outerLength?:Value; outerAngle?:Value; leftEdge?:Edge; rightEdge?:Edge; lengthMode?:LengthMode; lengthInput?:Value; }
export interface EndChamfer { length?:Value; angle?:Value }
export interface Keyway {id:string; start:Value; length:Value; width:Value; bottom:Value; csvRow?:number}
export interface Project { drawing?:import('./drawing').DrawingSettings; endHoles?:{left?:EndHole;right?:EndHole}; version:1|2; name:string; sections:Section[]; leftEnd?:EndChamfer; rightEnd?:EndChamfer; overallLength?:Value; keyways?:Keyway[] }
export interface Issue { section:number; text:string; severity:'error'|'warning'; keyway?:number }
export interface Feature { type:Transition; r:number; depth:number; width:number; slope:number; small:number; large:number; ascending:boolean; adjusted:boolean; requested:number }
export const DEFAULT_FOLDER = '\\\\ds01\\CadData$\\Inventor\\Klanten\\De bruyn\\CSV';
export const blankSection = ():Section => ({id:crypto.randomUUID(),diameter:30,fit:'',length:50,transition:'',radius:null,depth:null,width:null,keyStart:null,keyLength:null,keyWidth:null,keyBottom:null});
export const example = ():Project => ({version:1,name:reference.example.name,sections:reference.example.sections.map(s=>({...structuredClone(s),transition:s.transition??'',fit:s.fit??''}))}) as Project;
export const empty = ():Project => ({version:1,name:'Rotoras_001',sections:[blankSection()]});
export const present = (v:Value|undefined) => v !== null && v !== undefined && String(v).trim()!=='';
export const edge=(s:Section,side:Side):Edge=>s[side==='left'?'leftEdge':'rightEdge']??{type:''};
export function edgeRole(p:Project,index:number,side:Side):'end'|'inner'|'outer'|'equal' {
  const neighbour=p.sections[index+(side==='left'?-1:1)];if(!neighbour)return 'end';
  const d=number(p.sections[index].diameter),n=number(neighbour.diameter);return d<n?'inner':d>n?'outer':'equal';
}
export function toSectionProject(p:Project):Project {
  if(p.version===2)return separateKeyways(p);
  const q:Project={version:2,name:p.name,drawing:p.drawing,endHoles:p.endHoles,overallLength:p.overallLength,keyways:p.keyways,sections:p.sections.map(s=>({...s,leftEdge:{type:''},rightEdge:{type:''},transition:'',radius:null,depth:null,width:null,outerLength:null,outerAngle:null}))};
  p.sections.forEach((s,i)=>{const next=p.sections[i+1];if(!next)return;const up=number(s.diameter)<number(next.diameter);
    if(s.transition){const target=q.sections[up?i:i+1];target[up?'rightEdge':'leftEdge']={type:s.transition,radius:s.radius,depth:s.depth,width:s.width};}
    if(number(s.outerLength)>0){const target=q.sections[up?i+1:i];target[up?'leftEdge':'rightEdge']={type:'OuterChamfer',length:s.outerLength,angle:s.outerAngle};}
  });
  if(q.sections.length){if(number(p.leftEnd?.length)>0)q.sections[0].leftEdge={type:'OuterChamfer',...p.leftEnd};if(number(p.rightEnd?.length)>0)q.sections.at(-1)!.rightEdge={type:'OuterChamfer',...p.rightEnd};}
  return separateKeyways(q);
}
export function toLegacyProject(p:Project):Project {
  if(p.version===1){if(p.keyways===undefined)return p;const assigned=keywaySlots(p);return {...p,sections:p.sections.map((s,i)=>({...s,keyStart:assigned.rows[i]?.start??null,keyLength:assigned.rows[i]?.length??null,keyWidth:assigned.rows[i]?.width??null,keyBottom:assigned.rows[i]?.bottom??null}))};}
  const q:Project={version:1,name:p.name,drawing:p.drawing,endHoles:p.endHoles,overallLength:p.overallLength,keyways:p.keyways,sections:p.sections.map(s=>({...s,transition:'',radius:null,depth:null,width:null,outerLength:null,outerAngle:null}))};
  p.sections.forEach((s,i)=>{const next=p.sections[i+1];if(!next)return;const up=number(s.diameter)<number(next.diameter);const inner=edge(p.sections[up?i:i+1],up?'right':'left'),outer=edge(p.sections[up?i+1:i],up?'left':'right');
    if(inner.type&&inner.type!=='OuterChamfer')Object.assign(q.sections[i],{transition:inner.type,radius:inner.radius??null,depth:inner.depth??null,width:inner.width??null});
    if(outer.type==='OuterChamfer')Object.assign(q.sections[i],{outerLength:outer.length??null,outerAngle:outer.angle??null});
  });
  if(p.sections.length){const l=edge(p.sections[0],'left'),r=edge(p.sections.at(-1)!,'right');if(l.type==='OuterChamfer')q.leftEnd={length:l.length,angle:l.angle};if(r.type==='OuterChamfer')q.rightEnd={length:r.length,angle:r.angle};}
  if(p.keyways!==undefined){const assigned=keywaySlots(p);q.sections=q.sections.map((s,i)=>({...s,keyStart:assigned.rows[i]?.start??null,keyLength:assigned.rows[i]?.length??null,keyWidth:assigned.rows[i]?.width??null,keyBottom:assigned.rows[i]?.bottom??null}));}
  return q;
}
export function updateEdge(p:Project,index:number,side:Side,change:Partial<Edge>):Project {
  const q=toSectionProject(p),key=side==='left'?'leftEdge':'rightEdge';
  return {...q,sections:q.sections.map((s,i)=>{if(i!==index)return s;const updated={...edge(s,side),...change};if('radius' in change||'type' in change){updated.depth=null;updated.width=null;}return {...s,[key]:updated};})};
}
export function edgeLabel(e:Edge):string {return !e.type?'—':e.type==='OuterChamfer'?`${fmt(number(e.length))}×${fmt(present(e.angle)?number(e.angle):45)}°`:e.type==='Chamfer'?'Binnenafschuining':e.type==='DIN509E'?'DIN509-E':e.type;}
// Arithmetic input replaces Excel expressions, without executing JavaScript.
export function number(v:Value|undefined):number {
  if (!present(v)) return 0;
  const s=String(v).trim().replace(/,/g,'.').replace(/^=/,''); let at=0;
  const ws=()=>{while(/\s/.test(s[at]??'')&&at<s.length)at++;};
  function atom():number { ws(); if(s[at]==='+'){at++;return atom();} if(s[at]==='-'){at++;return -atom();} if(s[at]==='('){at++;const x=sum();ws();if(s[at++]!==')')throw Error('Haakje ontbreekt');return x;} const m=s.slice(at).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Ongeldig getal');at+=m[0].length;return Number(m[0]); }
  function product():number {let x=atom();ws();while(s[at]==='*'||s[at]==='/'){const op=s[at++];const y=atom();x=op==='*'?x*y:x/y;ws();}return x;}
  function sum():number {let x=product();ws();while(s[at]==='+'||s[at]==='-'){const op=s[at++];const y=product();x=op==='+'?x+y:x-y;ws();}return x;}
  try {const x=sum();ws();return at===s.length&&Number.isFinite(x)?x:NaN;} catch{return NaN;}
}
export const fmt = (n:number) => Number.isFinite(n)?Number(n.toFixed(8)).toLocaleString('nl-NL',{maximumFractionDigits:8,useGrouping:false}):'—';
export const total = (p:Project) => p.sections.reduce((t,s)=>t+(number(s.length)||0),0);
export function chamfer(length:Value|undefined,angle:Value|undefined) {const a=number(length),degrees=present(angle)?number(angle):45;return {length:a,angle:degrees,drop:a*Math.tan(degrees*Math.PI/180)};}
export const hasChamfers=(p:Project)=>{const q=toLegacyProject(p);return number(q.leftEnd?.length)>0||number(q.rightEnd?.length)>0||q.sections.some(s=>number(s.outerLength)>0);};
export function din76(d:number) { return reference.din76.find(row=>Math.abs(row[0]-d)<1e-6); }
export function dimensions(s:Section,next?:Section) {
  const d=Math.min(number(s.diameter),next?number(next.diameter):Infinity);
  if(s.transition==='DIN76-1 B') {const row=din76(d);return {radius:s.radius,depth:present(s.depth)?s.depth:row?row[2]/2:null,width:present(s.width)?s.width:row?row[2]/2:null};}
  const row=reference.din509.find(row=>row[0]===number(s.radius));
  return {radius:s.radius,depth:present(s.depth)?s.depth:row?row[1]:null,width:present(s.width)?s.width:row?row[2]:null};
}
export function feature(s:Section,next:Section):Feature {
  const d=number(s.diameter),e=number(next.diameter),small=Math.min(d,e)/2,large=Math.max(d,e)/2;const dims=dimensions(s,next);
  let r=number(dims.radius),depth=number(dims.depth),width=number(dims.width),slope=0,adjusted=false;const requested=r;
  if(s.transition==='DIN509E') {
    if(small-depth+r>=large) {const candidate=[8,7,6,5,4,3.5,3,2.5,2,1.6,1.5,1,.8,.4].find(t=>t<r&&small-depth+t<large);if(candidate){r=candidate;adjusted=true;}}
    slope=depth/Math.tan(Math.PI/12);
  }
  if(s.transition==='DIN76-1 B') {const row=din76(small*2);if(row){r=row[5];depth=row[2]/2;slope=Math.min(row[4]-row[3],depth/Math.tan(Math.PI/6));width=row[3]+slope;}}
  return {type:s.transition,r,depth,width,slope,small,large,ascending:d<e,adjusted,requested};
}
export function validate(p:Project):Issue[] {
  p=resolveLengths(p);
  const lengthIssues:Issue[]=[...validateThreads(p),...(p.keyways!==undefined?validateKeyways(p):[])];
  if(p.keyways!==undefined)p={...p,sections:p.sections.map(s=>({...s,keyStart:null,keyLength:null,keyWidth:null,keyBottom:null}))};
  p.sections.forEach((s,i)=>{if(s.lengthMode&&s.lengthMode!=='increment'&&!(number(s.lengthInput)>=0))lengthIssues.push({section:i+1,severity:'error',text:'De absolute maat moet een getal van 0 of groter zijn.'});});
  if(present(p.overallLength)||p.sections.some(s=>s.lengthMode==='right')){if(!(number(p.overallLength)>0))lengthIssues.push({section:0,severity:'error',text:'Vul bovenaan een positieve totale aslengte in.'});else if(Math.abs(total(p)-number(p.overallLength))>1e-6)lengthIssues.push({section:p.sections.length,severity:'error',text:'De berekende aslengte wijkt af van de vaste totale aslengte. Pas de sectiematen aan; de totale aslengte blijft gelijk.'});}

  if(p.version===2){const placement:Issue[]=[];p.sections.forEach((s,i)=>{for(const side of ['left','right'] as const){const e=edge(s,side),role=edgeRole(p,i,side),prefix=side==='left'?'Linkerrand':'Rechterrand';if(!e.type)continue;
    if(role==='equal'||(role!=='inner'&&e.type!=='OuterChamfer')||(role==='inner'&&e.type==='OuterChamfer'))placement.push({section:i+1,severity:'error',text:`${prefix}: deze bewerking past niet bij de aangrenzende diameter. Pas de randbewerking aan op deze sectie.`});
    if(e.type==='OuterChamfer'&&!(number(e.length)>0))placement.push({section:i+1,severity:'error',text:`${prefix}: vul een afschuiningmaat groter dan 0 in of kies Geen.`});
  }});return [...placement,...validate(toLegacyProject(p))];}
  const issues:Issue[]=[]; const add=(section:number,text:string,severity:Issue['severity']='error')=>issues.push({section,text,severity});
  if(!p.name.trim()||/[<>:"/\\|?*\u0000-\u001f]/.test(p.name)||/[. ]$/.test(p.name)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p.name))add(0,'Gebruik een geldige Windows-bestandsnaam.');
  if(p.sections.length===0)add(0,'Voeg minstens één sectie toe.');
  let pos=0;const ranges=p.sections.map(s=>{const start=pos;pos+=number(s.length)||0;return {start,end:pos,d:number(s.diameter)};});
  p.sections.forEach((s,i)=>{
    const n=i+1,next=p.sections[i+1];
    if(!(number(s.diameter)>0))add(n,'Diameter moet een positief getal zijn.');
    if(!(number(s.length)>0))add(n,'Lengte moet een positief getal zijn.');
    if(/[;\r\n"]/.test(s.fit??''))add(n,'Passing bevat een ongeldig CSV-teken.');
    const numeric=['radius','depth','width','keyStart','keyLength','keyWidth','keyBottom'] as const;
    numeric.forEach(k=>{if(present(s[k])&&(!Number.isFinite(number(s[k]))||number(s[k])<0))add(n,`${k}: gebruik een getal van 0 of groter.`);});
    const innerN=next&&number(s.diameter)>number(next.diameter)?i+2:n;
    if(s.transition) {
      if(!next)add(innerN,'Een overgang rechts vereist een volgende sectie.');
      else if(number(s.diameter)===number(next.diameter))add(innerN,'Deze overgang vereist een diameterstap.');
      else {
        const f=feature(s,next);const smallLength=number(f.ascending?s.length:next.length);
        if(s.transition==='Radius'||s.transition==='Chamfer'){if(!(f.r>0))add(innerN,'Vul een radius/afschuining groter dan 0 in.');if(f.r>f.large-f.small||f.r>=smallLength)add(innerN,'Radius/afschuining past niet binnen de borst of sectielengte.');}
        if(s.transition==='DIN509E'){
          if(!(f.r>0&&f.depth>0&&f.width>0))add(innerN,'DIN509-E vereist radius, diepte en breedte.');
          if(f.small-f.depth<=0||f.small-f.depth+f.r>=f.large)add(innerN,'DIN509-E past niet binnen de borst.');
          if(f.slope+f.r>f.width+1e-4)add(innerN,'DIN509-E breedte is te klein voor de 15°-inloop en radius.');
          if(f.width>=smallLength)add(innerN,'DIN509-E past niet binnen de kleine sectie.');
          if(f.adjusted)add(innerN,`Inventor verkleint R${fmt(f.requested)} naar R${fmt(f.r)}. Preview gebruikt R${fmt(f.r)}; CSV behoudt de invoer.`,'warning');
        }
        if(s.transition==='DIN76-1 B') {const row=din76(f.small*2);if(!row)add(innerN,'Kleine diameter is geen standaard metrische draadmaat (M1–M68-tabel).');else if(f.small-f.depth<=0||row[3]<=f.r||f.width>=smallLength)add(innerN,'DIN76-1 B past niet binnen de draadsectie.');}
      }
    }
    const key=[s.keyStart,s.keyLength,s.keyWidth,s.keyBottom].some(v=>present(v)&&number(v)!==0);
    if(key&&[s.keyStart,s.keyLength,s.keyWidth,s.keyBottom].some(v=>!present(v)))add(n,'Vul alle vier spiebaanvelden in; begin mag 0 zijn.');
    if(key){const start=number(s.keyStart),len=number(s.keyLength),width=number(s.keyWidth),bottom=number(s.keyBottom),end=start+len;
      if(!(start>=0&&len>0&&width>0&&bottom>0))add(n,'Spiebaanwaarden zijn ongeldig.');
      if(len<width)add(n,'Spiebaanlengte moet minstens de breedte zijn.');
      const touched=ranges.filter(r=>end>r.start+1e-4&&start<r.end-1e-4);
      if(!touched.length)add(n,'Spiebaan raakt de as niet.');
      if(touched.some(r=>bottom>=r.d))add(n,'Bodemdiameter moet kleiner zijn dan elke geraakte asdiameter.');
      if(end>pos)add(n,'Spiebaan loopt rechts buiten de as; dit wordt als open sleuf uitgevoerd.','warning');
    }
  });
  function checkChamfer(length:Value|undefined,angle:Value|undefined,n:number,label:string) {
    if(present(length)&&(!Number.isFinite(number(length))||number(length)<0))add(n,`${label}: maat moet 0 of groter zijn.`);
    const c=chamfer(length,angle);if(c.length>0&&!(c.angle>0&&c.angle<90))add(n,`${label}: hoek moet tussen 0° en 90° liggen.`);
    return c;
  }
  const endLeft=checkChamfer(p.leftEnd?.length,p.leftEnd?.angle,1,'Linker uiteinde');
  const endRight=checkChamfer(p.rightEnd?.length,p.rightEnd?.angle,p.sections.length,'Rechter uiteinde');
  if(endLeft.length>0&&endLeft.drop>=number(p.sections[0]?.diameter)/2)add(1,'Linker eindafschuining reikt tot de hartlijn.');
  if(endRight.length>0&&endRight.drop>=number(p.sections.at(-1)?.diameter)/2)add(p.sections.length,'Rechter eindafschuining reikt tot de hartlijn.');
  p.sections.forEach((s,i)=>{
    const c=checkChamfer(s.outerLength,s.outerAngle,i+1,'Buitenafschuining');if(!(c.length>0))return;
    const next=p.sections[i+1];if(!next){add(i+1,'Buitenafschuining vereist een volgende sectie; gebruik voor het uiteinde de eindafschuining.');return;}
    const f=feature(s,next),outerN=f.ascending?i+2:i+1;if(f.small===f.large){add(outerN,'Buitenafschuining vereist een diameterstap.');return;}
    const inside=!f.type?f.small:f.type==='Radius'||f.type==='Chamfer'?f.small+f.r:f.small-f.depth+f.r;
    if(f.large-c.drop<=inside+1e-6)add(outerN,'Buitenafschuining raakt de binnenrand of ondersnijding; verklein de maat of hoek.');
  });
  // Each section may have inner reliefs, outer chamfers or end chamfers at both ends.
  p.sections.forEach((s,i)=>{const left=i?feature(p.sections[i-1],s):null;const right=p.sections[i+1]?feature(s,p.sections[i+1]):null;
    const extent=(f:Feature|null)=>!f||!f.type?0:f.type==='Radius'||f.type==='Chamfer'?f.r:f.width;
    const a=i===0?endLeft.length:left?.ascending?number(p.sections[i-1].outerLength):extent(left);
    const b=i===p.sections.length-1?endRight.length:right?.ascending?extent(right):number(s.outerLength);
    if(a+b>=number(s.length)&&a+b>0)add(i+1,'Overgangen aan beide zijden overlappen binnen deze sectie.');
  });
  return [...lengthIssues,...issues];
}
export function exportCsv(p:Project):string {
  const errors=validate(p).filter(x=>x.severity==='error');if(errors.length)throw Error(errors.map(x=>`${x.section?`Sectie ${x.section}: `:''}${x.text}`).join('\n'));
  p=toLegacyProject(resolveLengths(p));
  const cell=(v:Value|undefined)=>present(v)?fmt(number(v)):'';
  const extra=p.keyways!==undefined?keywaySlots(p).extra:[];
  const extended=hasChamfers(p)||hasThreads(p);const pair=(length:Value|undefined,angle:Value|undefined)=>number(length)>0?[cell(length),cell(present(angle)?angle:45)]:['',''];
  const records:string[]=[];
  const record=(cells:string[])=>records.push([...cells,...Array((extended?18:12)-cells.length).fill('')].join(';'));
  p.sections.forEach((s,i)=>{if(s.thread){const t=s.thread,r=threadRow(t)!;record(['DRAAD',String(i+1),r.type,r.designation,r.externalClass,t.side,cell(t.length),t.handedness==='left'?'LH':'']);}});
  for(const side of ['left','right'] as const){const h=p.endHoles?.[side];if(h){const r=threadRow(h)!;record(['KOP',side,r.type,r.designation,r.internalClass,cell(h.drillDiameter),cell(h.drillDepth),cell(h.threadEnd),cell(h.chamberDiameter),cell(h.chamberDepth),cell(h.chamferLength),cell(h.chamferAngle),h.handedness==='left'?'LH':'']);}}
  return [...HEADERS,...(extended?CHAMFER_HEADERS:[])].join(';')+'\r\n'+p.sections.map((s,i)=>{const dims=dimensions(s,p.sections[i+1]);const cells=[String(i+1),cell(s.diameter),s.fit??'',cell(s.length),s.transition,cell(dims.radius),cell(dims.depth),cell(dims.width),cell(s.keyStart),cell(s.keyLength),cell(s.keyWidth),cell(s.keyBottom)];if(extended)cells.push(...pair(s.outerLength,s.outerAngle),...(i===0?pair(p.leftEnd?.length,p.leftEnd?.angle):['','']),...(i===p.sections.length-1?pair(p.rightEnd?.length,p.rightEnd?.angle):['','']));return cells.join(';');}).concat(extra.map(k=>['SPIE','','','','','','','',cell(k.start),cell(k.length),cell(k.width),cell(k.bottom),...(extended?['','','','','','']:[])].join(';'))).concat(records).join('\r\n')+'\r\n';
}
export function importCsv(text:string,name='Rotoras_import'):Project {
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)throw Error('CSV bevat geen secties.');
  const names=lines[0].split(';').map(x=>x.trim().toLowerCase().replace(/\s/g,''));
  const old=names.length===11&&!names.includes('passing'),extended=names.length===18;const expected=old?HEADERS.filter(x=>x!=='Passing'):extended?[...HEADERS,...CHAMFER_HEADERS]:HEADERS;
  if(names.length!==expected.length||names.some((n,i)=>n!==expected[i].toLowerCase()))throw Error('Onbekende CSV-kolommen. Verwacht het Excel-formaat met 12 kolommen, of het oude formaat zonder Passing.');
  const numeric=(s:string,line:number):Value=>{if(!s.trim())return null;if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s.trim()))throw Error(`Ongeldig getal op CSV-regel ${line}.`);return number(s);};
  let leftEnd:EndChamfer|undefined,rightEnd:EndChamfer|undefined;
  const sectionLines=lines.slice(1).filter(line=>!['SPIE','DRAAD','KOP'].includes(line.split(';')[0].trim().toUpperCase()));
  if(!sectionLines.length)throw Error('CSV bevat geen assecties.');
  const extraKeys:Keyway[]=lines.slice(1).filter(line=>line.split(';')[0].trim().toUpperCase()==='SPIE').map((line,j)=>{const c=line.split(';').map(x=>x.trim());if(c.length!==expected.length||c.slice(1,8).some(Boolean)||c.slice(12).some(Boolean))throw Error('Ongeldige losse spiebaanregel.');return {id:crypto.randomUUID(),start:numeric(c[8],j+2),length:numeric(c[9],j+2),width:numeric(c[10],j+2),bottom:numeric(c[11],j+2)};});
  const sections=sectionLines.map((line,j):Section=>{let c=line.split(';').map(x=>x.trim());if(c.length!==expected.length)throw Error(`Onjuist aantal kolommen op CSV-regel ${j+2}.`);if(old)c.splice(2,0,'');
    const alias:Record<string,Transition>={'':'',radius:'Radius',r:'Radius',chamfer:'Chamfer',c:'Chamfer',afschuining:'Chamfer',din509e:'DIN509E','din509-e':'DIN509E','din76-1 b':'DIN76-1 B',din76b:'DIN76-1 B'};const transition=alias[c[4].toLowerCase()];if(transition===undefined)throw Error(`Onbekende overgang op CSV-regel ${j+2}.`);
    if(extended){const l={length:numeric(c[14],j+2),angle:numeric(c[15],j+2)},r={length:numeric(c[16],j+2),angle:numeric(c[17],j+2)};if(present(l.length)||present(l.angle)){if(j!==0)throw Error('EindLinks hoort alleen op de eerste sectieregel.');leftEnd=l;}if(present(r.length)||present(r.angle)){if(j!==sectionLines.length-1)throw Error('EindRechts hoort alleen op de laatste sectieregel.');rightEnd=r;}}
    return {id:crypto.randomUUID(),diameter:numeric(c[1],j+2),fit:c[2],length:numeric(c[3],j+2),transition,radius:numeric(c[5],j+2),depth:numeric(c[6],j+2),width:numeric(c[7],j+2),keyStart:numeric(c[8],j+2),keyLength:numeric(c[9],j+2),keyWidth:numeric(c[10],j+2),keyBottom:numeric(c[11],j+2),...(extended?{outerLength:numeric(c[12],j+2),outerAngle:numeric(c[13],j+2)}:{})};
  });const endHoles:Project['endHoles']={};
  for(const line of lines.slice(1)){const c=line.split(';').map(x=>x.trim());const tag=c[0].toUpperCase();if(!['DRAAD','KOP'].includes(tag))continue;if(c.length!==expected.length)throw Error('Ongeldig draadrecord.');const r=threadRow({designation:c[3],family:c[2]==='ANSI Unified Screw Threads'?'unc':'metric'});if(!r||r.type!==c[2])throw Error('Onbekende draad in CSV.');if(tag==='DRAAD'){const idx=Number(c[1])-1;if(!Number.isInteger(idx)||!sections[idx]||sections[idx].thread||!['left','right'].includes(c[5])||c[4]!==r.externalClass||!['','LH','RH'].includes(c[7])||c.slice(8).some(Boolean))throw Error('Ongeldige uitwendige draad.');sections[idx].thread={family:r.family as 'metric'|'unc',designation:r.designation,side:c[5] as Side,length:numeric(c[6],0),...(c[7]==='LH'?{handedness:'left' as const}:{})};}else{if(!['left','right'].includes(c[1])||endHoles[c[1] as Side]||c[4]!==r.internalClass||!['','LH','RH'].includes(c[12])||c.slice(13).some(Boolean))throw Error('Ongeldig kopgat.');endHoles[c[1] as Side]={family:r.family as 'metric'|'unc',designation:r.designation,drillDiameter:numeric(c[5],0),drillDepth:numeric(c[6],0),threadEnd:numeric(c[7],0),chamberDiameter:numeric(c[8],0),chamberDepth:numeric(c[9],0),chamferLength:numeric(c[10],0),chamferAngle:numeric(c[11],0),...(c[12]==='LH'?{handedness:'left' as const}:{})};}}
  const result:Project={endHoles,version:1,name:name.replace(/\.csv$/i,''),sections,...(leftEnd?{leftEnd}:{}),...(rightEnd?{rightEnd}:{})};return extraKeys.length?{...separateKeyways(result),keyways:[...keyways(result),...extraKeys]}:result;
}
export function parseProject(text:string):Project {
  const p=JSON.parse(text);if(![1,2].includes(p.version)||typeof p.name!=='string'||!Array.isArray(p.sections)||p.sections.length>1000)throw Error('Dit is geen ondersteund Rotoras-project.');
  for(const s of p.sections){if(!s||!TRANSITIONS.includes(s.transition)||!['string','number'].includes(typeof s.diameter)||!['string','number'].includes(typeof s.length)||(s.fit!==null&&typeof s.fit!=='string'))throw Error('Project bevat ongeldige secties.');for(const k of ['radius','depth','width','keyStart','keyLength','keyWidth','keyBottom'])if(s[k]!==null&&!['string','number'].includes(typeof s[k]))throw Error('Project bevat ongeldige waarden.');s.id=crypto.randomUUID();}
  const valid=(v:unknown)=>v==null||typeof v==='string'||typeof v==='number';for(const s of p.sections)if(!valid(s.outerLength)||!valid(s.outerAngle))throw Error('Ongeldige buitenafschuining.');for(const end of [p.leftEnd,p.rightEnd])if(end!==undefined&&(end===null||typeof end!=='object'||!valid(end.length)||!valid(end.angle)))throw Error('Ongeldige eindafschuining.');
  for(const s of p.sections)for(const e of [s.leftEdge,s.rightEdge])if(e!==undefined){if(!e||typeof e!=='object'||![...TRANSITIONS,'OuterChamfer'].includes(e.type)||!['radius','depth','width','length','angle'].every(k=>valid(e[k])))throw Error('Ongeldige randbewerking in project.');}
  if(p.keyways!==undefined){if(!Array.isArray(p.keyways)||p.keyways.length>1000)throw Error('Ongeldige spiebanen.');for(const k of p.keyways){if(!k||!['start','length','width','bottom'].every(field=>valid(k[field]))||(k.csvRow!==undefined&&(!Number.isInteger(k.csvRow)||k.csvRow<0)))throw Error('Ongeldige spiebaan.');k.id=crypto.randomUUID();}}
  if(!valid(p.overallLength))throw Error('Ongeldige totale aslengte.');
  for(const s of p.sections)if((s.lengthMode!==undefined&&!['increment','left','right'].includes(s.lengthMode))||!valid(s.lengthInput))throw Error('Ongeldige lengte-invoer.');
  for(const section of p.sections)if(section.thread){const t=section.thread;if((t.handedness!==undefined&&!['left','right'].includes(t.handedness))||!threadRow(t)||!['left','right'].includes(t.side)||!valid(t.length))throw Error('Ongeldige draadgegevens.');}
  if(p.endHoles!==undefined){if(!p.endHoles||typeof p.endHoles!=='object')throw Error('Ongeldige kopgaten.');for(const side of ['left','right']){const h=p.endHoles[side];if(h&&((h.handedness!==undefined&&!['left','right'].includes(h.handedness))||!threadRow(h)||!['drillDiameter','drillDepth','threadEnd','chamberDiameter','chamberDepth','chamferLength','chamferAngle'].every(k=>valid(h[k]))))throw Error('Ongeldig kopgat.');}}
  if(p.drawing!==undefined){const d=p.drawing;if(!d||typeof d!=='object'||![undefined,'A4','A3'].includes(d.paper)||![undefined,'input','increment','left','right'].includes(d.dimensionMode)||['material','revision','date'].some(k=>d[k]!==undefined&&typeof d[k]!=='string'))throw Error('Ongeldige werktekeninginstellingen.');if(d.offsets!==undefined&&(!d.offsets||typeof d.offsets!=='object'||Object.values(d.offsets).some((v:any)=>!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))))throw Error('Ongeldige maatplaatsing.');}
  return resolveLengths(p);
}
export function keySuggestion(d:number) {return reference.keys.find(row=>d>Number(row[0])&&d<=Number(row[1]));}

// Absolute inputs locate the right boundary of each section. CSV retains lengths only.
export function serializeProject(p:Project):string {return JSON.stringify(resolveLengths(p),null,2);}

export function resolveLengths(p:Project):Project {
  let start=0;const overall=number(p.overallLength);
  return {...p,sections:p.sections.map(s=>{const mode=s.lengthMode??'increment',input=number(s.lengthInput===undefined?s.length:s.lengthInput);
    const end=!present(s.lengthInput===undefined?s.length:s.lengthInput)?start:mode==='left'?input:mode==='right'?overall-input:start+input;
    const length=end-start;start=end;return {...s,lengthMode:mode,lengthInput:s.lengthInput===undefined?s.length:s.lengthInput,length:Number.isFinite(length)?length:'ongeldig'};
  })};
}
export function setLengthMode(p:Project,index:number,mode:LengthMode):Project {
  const q=resolveLengths(p),overall=p.overallLength;let end=0;
  const sections=q.sections.map((s,i)=>{end+=number(s.length);if(i!==index&&!(mode==='right'&&i>index))return s;
    return {...s,lengthMode:mode,lengthInput:mode==='left'?end:mode==='right'?number(overall)-end:s.length};});
  return resolveLengths({...q,overallLength:p.overallLength,sections});
}
export function setLengthInput(p:Project,index:number,value:Value):Project {
  return resolveLengths({...p,sections:p.sections.map((s,i)=>i===index?{...s,lengthInput:value}:s)});
}

export function addSection(p:Project,index:number):Project {
  const q=resolveLengths(p),mode=q.sections[index].lengthMode??'increment';
  const t:Section={...blankSection(),diameter:'',length:'',lengthInput:'',lengthMode:mode};
  const sections=[...q.sections];sections.splice(index+1,0,t);
  return resolveLengths({...q,sections});
}

export const blankKeyway=():Keyway=>({id:crypto.randomUUID(),start:0,length:null,width:null,bottom:null});
export function keyways(p:Project):Keyway[]{return p.keyways??p.sections.flatMap((s,i)=>[s.keyStart,s.keyLength,s.keyWidth,s.keyBottom].some(v=>present(v)&&number(v)!==0)?[{id:s.id,start:s.keyStart,length:s.keyLength,width:s.keyWidth,bottom:s.keyBottom,csvRow:i}]:[]);}
function separateKeyways(p:Project):Project {if(p.keyways!==undefined)return p;return {...p,keyways:keyways(p),sections:p.sections.map(s=>({...s,keyStart:null,keyLength:null,keyWidth:null,keyBottom:null}))};}
function keywaySlots(p:Project){const rows:(Keyway|undefined)[]=Array(p.sections.length).fill(undefined),extra:Keyway[]=[];const pending:Keyway[]=[];for(const k of keyways(p)){if(k.csvRow!==undefined&&k.csvRow<rows.length&&!rows[k.csvRow])rows[k.csvRow]=k;else pending.push(k);}for(const k of pending){const at=rows.findIndex(v=>!v);if(at<0)extra.push(k);else rows[at]=k;}return {rows,extra};}
function validateKeyways(p:Project):Issue[]{const issues:Issue[]=[];let pos=0;const ranges=p.sections.map(s=>{const start=pos;pos+=number(s.length)||0;return {start,end:pos,d:number(s.diameter)};});keyways(p).forEach((k,i)=>{const add=(text:string,severity:Issue['severity']='error')=>issues.push({section:0,keyway:i+1,text:`Spiebaan ${i+1}: ${text}`,severity});
if([k.start,k.length,k.width,k.bottom].some(v=>!present(v))){add('vul alle vier velden in; begin mag 0 zijn.');return;}
const start=number(k.start),len=number(k.length),width=number(k.width),bottom=number(k.bottom),end=start+len;
if(!(start>=0&&len>0&&width>0&&bottom>0)){add('gebruik geldige maten; begin mag 0 zijn, overige maten moeten positief zijn.');return;}
if(len<width)add('lengte moet minstens de breedte zijn.');const touched=ranges.filter(r=>end>r.start+1e-4&&start<r.end-1e-4);if(!touched.length)add('raakt de as niet.');if(touched.some(r=>bottom>=r.d))add('bodemdiameter moet kleiner zijn dan elke geraakte asdiameter.');if(end>pos)add('loopt rechts buiten de as; dit wordt als open sleuf uitgevoerd.','warning');
});return issues;}
export function updateKeyway(p:Project,index:number,change:Partial<Keyway>):Project{return {...p,keyways:keyways(p).map((k,i)=>i===index?{...k,...change}:k)};}
export const hasExtraKeyways=(p:Project)=>keyways(p).length>p.sections.length;
