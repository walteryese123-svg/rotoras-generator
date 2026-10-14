import {edge,edgeLabel,fmt,keyways,number,resolveLengths,toSectionProject,total,feature,toLegacyProject,type Project} from './model';
export interface DrawingSettings {material?:string;revision?:string;date?:string;paper?:'A4'|'A3';dimensionMode?:'input'|'increment'|'left'|'right';offsets?:Record<string,{x:number;y:number}>}
export function drawingRows(project:Project){const p=toSectionProject(resolveLengths(project));let x=0;const legacy=toLegacyProject(p);return p.sections.map((s,i)=>{const start=x;x+=number(s.length);const notes=(['left','right'] as const).map(side=>{const e=edge(s,side);if(!e.type)return '';let label=edgeLabel(e);if(e.type==='Radius'||e.type==='Chamfer')label=`${e.type==='Radius'?'R':'Binnenafschuining '}${fmt(number(e.radius))}`;if(e.type==='DIN509E'||e.type==='DIN76-1 B'){const j=side==='left'?i-1:i;if(j>=0&&legacy.sections[j+1]){const f=feature(legacy.sections[j],legacy.sections[j+1]);label+=` R${fmt(f.r)} · d${fmt(f.depth)} · f${fmt(f.width)}`;}}return `${side==='left'?'L':'R'}: ${label}`;}).filter(Boolean);if(s.thread)notes.push(`${s.thread.designation}${s.thread.handedness==='left'?' LH':''} · ${s.thread.side==='left'?'vanaf links':'vanaf rechts'} · draadlengte ${fmt(number(s.thread.length)||number(s.length))}`);return {id:s.id,index:i+1,start,end:x,diameter:number(s.diameter),length:number(s.length),fit:s.fit??'',notes};});}
export function drawingDetails(p:Project){const details=keyways(p).map((k,i)=>`Spiebaan ${i+1}: vanaf links ${fmt(number(k.start))} · L${fmt(number(k.length))} × B${fmt(number(k.width))} · bodem Ø${fmt(number(k.bottom))}`);for(const side of ['left','right'] as const){const h=p.endHoles?.[side];if(!h)continue;details.push(`Kop ${side==='left'?'links':'rechts'}: ${h.designation}${h.handedness==='left'?' LH':''} · gatdiepte ${number(h.drillDepth).toFixed(0)} · draaddiepte ${number(h.threadEnd).toFixed(0)} mm vanaf kopvlak · boor Ø${fmt(number(h.drillDiameter))}`);if(number(h.chamberDepth)>0||number(h.chamferLength)>0)details.push(`Kop ${side==='left'?'links':'rechts'}: ${number(h.chamberDepth)>0?`Ø${fmt(number(h.chamberDiameter))}x${fmt(number(h.chamberDepth))}mm `:''}${number(h.chamferLength)>0?`vzv ${fmt(number(h.chamferLength))}x${fmt(number(h.chamferAngle))}°`:''}`);}return details;}
export function drawingScale(p:Project,width:number,height:number){const l=total(p),d=Math.max(...p.sections.map(s=>number(s.diameter)),1);return Math.min(width/Math.max(l,1),height/d);}

// Absolute shoulder positions, split around the widest of the largest sections.
export function absoluteDimensions(p:Project){const rows=drawingRows(p),max=Math.max(...rows.map(r=>r.diameter));const candidates=rows.filter(r=>r.diameter===max),pivot=candidates.reduce((a,b)=>a.length>=b.length?a:b,candidates[0]);if(!pivot)return [];return rows.slice(0,-1).map(r=>({boundary:r.end,side:r.end<=pivot.start?'left' as const:'right' as const,value:r.end<=pivot.start?r.end:total(p)-r.end}));}
export interface LabelBox {x:number;y:number;width:number;height:number}
export function overlap(a:LabelBox,b:LabelBox,gap=1){return Math.abs(a.x-b.x)<(a.width+b.width)/2+gap&&Math.abs(a.y-b.y)<(a.height+b.height)/2+gap;}
// All label boxes occupy real paper millimetres; packing is independent of model scale.
export function placeLabel(wanted:LabelBox,used:LabelBox[],bounds:{left:number;right:number;top:number;bottom:number},direction=1):LabelBox|null{
 const clamp=(x:number)=>Math.max(bounds.left+wanted.width/2,Math.min(bounds.right-wanted.width/2,x));
 const start=direction>0?bounds.top+wanted.height/2:bounds.bottom-wanted.height/2;
 for(let shift=0;shift<17;shift++){
  const delta=shift===0?0:Math.ceil(shift/2)*3*(shift%2?1:-1);
  for(let row=0;row<100;row++){const y=start+direction*row*(wanted.height+2);if(y-wanted.height/2<bounds.top||y+wanted.height/2>bounds.bottom)break;
   const box={...wanted,x:clamp(wanted.x+delta),y};if(box.width>bounds.right-bounds.left)break;if(!used.some(v=>overlap(v,box))){used.push(box);return box;}
  }
 }
 return null;
}

export function keywayDimensions(p:Project){const rows=drawingRows(p);return keyways(p).map(k=>{const start=number(k.start),end=start+number(k.length),owner=rows.find(r=>start>=r.start&&start<r.end)||rows.at(-1);return {id:k.id,start,end,length:number(k.length),width:number(k.width),sectionStart:owner?.start??0,offset:start-(owner?.start??0),depths:rows.filter(r=>end>r.start&&start<r.end).map(r=>({section:r.index,x:(Math.max(start,r.start)+Math.min(end,r.end))/2,outer:r.diameter/2,floor:number(k.bottom)/2,depth:(r.diameter-number(k.bottom))/2}))};});}

export function drawingViewY(paper:'A3'|'A4',height:number,maxRadius:number,keyCount:number,font:number,step:number){const footer=height-30,reserved=keyCount?Math.max(21+2*(font+1)+4,15+(keyCount-1)*step+4):0;return Math.min(height*(paper==='A3'?.75:.68),footer-maxRadius-reserved);}
