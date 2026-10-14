import reference from './reference.json';
import catalog from './threads.json';
import {number,present,total,type Project,type Value,type Issue,type Side} from './model';
export const THREADS=catalog;
export type ThreadFamily='metric'|'unc';
export interface ThreadSpec {handedness?:Side;designation:string; family:ThreadFamily; side:Side; length:Value}
export interface EndHole {handedness?:Side;designation:string; family:ThreadFamily; drillDiameter:Value; drillDepth:Value; threadEnd:Value; chamberDiameter:Value; chamberDepth:Value; chamferLength:Value; chamferAngle:Value}
export const threadRow=(t:{designation:string;family:ThreadFamily})=>THREADS.find(r=>r.designation===t.designation&&r.family===t.family);
export const hasThreads=(p:Project)=>p.sections.some(s=>s.thread)||!!p.endHoles?.left||!!p.endHoles?.right;
export function validateThreads(p:Project):Issue[]{const issues:Issue[]=[];const add=(section:number,text:string)=>issues.push({section,severity:'error',text});
 p.sections.forEach((s,i)=>{if(!s.thread)return;const r=threadRow(s.thread);if(!r){add(i+1,'Kies een geldige draadmaat.');return;}if(Math.abs(number(s.diameter)-r.diameter)>0.001)add(i+1,`Draad ${r.designation} vereist een nominale diameter van ${Number(r.diameter.toFixed(4))} mm.`);if([s.leftEdge,s.rightEdge].some(e=>e?.type==='DIN76-1 B')&&(r.family!=='metric'||!reference.din76.some(v=>Math.abs(v[0]-r.diameter)<1e-6&&Math.abs(v[1]-r.pitch)<1e-6)))add(i+1,'DIN76-1 B gebruikt de bestaande tabel voor metrische grove draad; deze draad/spoed past daar niet bij.');if(present(s.thread.length)&&(!(number(s.thread.length)>0)||number(s.thread.length)>number(s.length)))add(i+1,'Draadlengte moet positief zijn en binnen de sectie passen.');});
 for(const side of ['left','right'] as const){const h=p.endHoles?.[side];if(!h)continue;const prefix=`Kopgat ${side==='left'?'links':'rechts'}`;const err=(s:string)=>add(0,`${prefix}: ${s}`);const r=threadRow(h);if(!r){err('kies een geldige draadmaat.');continue;}
 const bore=number(h.drillDiameter),depth=number(h.drillDepth),end=number(h.threadEnd),cd=number(h.chamberDiameter),cl=number(h.chamberDepth),c=number(h.chamferLength),a=number(h.chamferAngle);
 if(!(bore>0&&bore<r.diameter))err('boordiameter moet positief en kleiner dan de draadmaat zijn.');
 if(!(depth>0&&depth+bore/2/Math.tan(59*Math.PI/180)<total(p)))err('boordiepte moet positief en kleiner dan de aslengte zijn.');
 if(!(end>Math.max(cl,c)&&end<depth))err('draadeinde moet onder de kamer en vóór het einde van het boorgat liggen.');
 if(!(cl>=0&&cl<end&&Number.isFinite(cl))||!(cd>=0&&Number.isFinite(cd)))err('vul geldige kamerafmetingen in.');
 if(cl>0&&!(cd>=r.diameter))err('kamerdiameter moet minstens de nominale draadmaat zijn.');
 if(!(c>=0&&Number.isFinite(c))||(c>0&&!(a>0&&a<90)))err('vul een geldige afschuining in.');
 if(cl>0&&c>cl)err('afschuining mag niet dieper zijn dan de kamer.');
 let x=0;for(const s of p.sections){const len=number(s.length),start=side==='left'?x:total(p)-x-len,stop=start+len;if(start<depth&&stop>0){const needed=start<cl?Math.max(bore,cd):bore;if(needed>=number(s.diameter))err('gat of kamer raakt de buitenzijde van de as.');if(start<c&&(Math.max(bore,cl>0?cd:0)+2*c*Math.tan(a*Math.PI/180))>=number(s.diameter))err('afschuining raakt de buitenzijde.');}x+=len;}
 }
 if(p.endHoles?.left&&p.endHoles?.right&&number(p.endHoles.left.drillDepth)+number(p.endHoles.left.drillDiameter)/2/Math.tan(59*Math.PI/180)+number(p.endHoles.right.drillDepth)+number(p.endHoles.right.drillDiameter)/2/Math.tan(59*Math.PI/180)>=total(p))add(0,'De kopgaten links en rechts overlappen.');
 return issues;
}
