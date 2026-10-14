import {chamfer,feature,number,resolveLengths,toLegacyProject,type Project} from './model';
export interface Segment { x:number; r:number; arc?:number; sweep?:number }
// Meridian contour in mm. Concave fillets and the two relief profiles follow
// the supplied Inventor rule, including its radius reduction for DIN509-E.
export function contour(p:Project):Segment[] {
  p=toLegacyProject(resolveLengths(p));
  if(!p.sections.length)return [];
  const start=chamfer(p.leftEnd?.length,p.leftEnd?.angle),end=chamfer(p.rightEnd?.length,p.rightEnd?.angle),firstR=number(p.sections[0].diameter)/2;
  const points:Segment[]=[{x:0,r:firstR-(start.length>0?start.drop:0)}];let x=0;
  const line=(x:number,r:number)=>points.push({x,r});
  const arc=(x:number,r:number,rad:number,sweep:number)=>points.push({x,r,arc:rad,sweep});
  if(start.length>0)line(start.length,firstR);
  p.sections.forEach((s,i)=>{
    x+=number(s.length)||0;const next=p.sections[i+1];if(!next){const radius=number(s.diameter)/2;if(end.length>0){line(x-end.length,radius);line(x,radius-end.drop);}else line(x,radius);return;}
    const f=feature(s,next);const {small:a,large:b,r,ascending:up}=f;
    const outside=chamfer(s.outerLength,s.outerAngle);const outer=outside.length>0;
    if(!up){if(outer){line(x-outside.length,b);line(x,b-outside.drop);}else line(x,number(s.diameter)/2);}
    if(!f.type||!Number.isFinite(r)||r<=0){if(up)line(x,number(s.diameter)/2);else line(x,number(next.diameter)/2);}
    else {
    if(f.type==='Radius'||f.type==='Chamfer'){
      if(up){line(x-r,a);if(f.type==='Radius')arc(x,a+r,r,0);else line(x,a+r);}
      else{line(x,a+r);if(f.type==='Radius')arc(x+r,a,r,0);else line(x+r,a);}
    }else{
      const bottom=a-f.depth,w=f.width,slope=f.slope;
      if(up){line(x-w,a);line(x-w+slope,bottom);line(x-r,bottom);arc(x,bottom+r,r,0);}
      else{line(x,bottom+r);arc(x+r,bottom,r,0);line(x+w-slope,bottom);line(x+w,a);}
    }
    }
    if(up){if(outer){line(x,b-outside.drop);line(x+outside.length,b);}else line(x,b);}
  });return points;
}
export function shaftPath(p:Project):string {
  const a=contour(p);if(!a.length)return '';const safe=(n:number)=>Number.isFinite(n)?n:0;
  let d=`M ${safe(a[0].x)} ${-safe(a[0].r)}`;
  for(let i=1;i<a.length;i++){const t=a[i];d+=t.arc?` A ${t.arc} ${t.arc} 0 0 ${t.sweep} ${safe(t.x)} ${-safe(t.r)}`:` L ${safe(t.x)} ${-safe(t.r)}`;}
  d+=` L ${safe(a.at(-1)!.x)} ${safe(a.at(-1)!.r)}`;
  for(let i=a.length-2;i>=0;i--){const t=a[i],edge=a[i+1];d+=edge.arc?` A ${edge.arc} ${edge.arc} 0 0 ${edge.sweep} ${safe(t.x)} ${safe(t.r)}`:` L ${safe(t.x)} ${safe(t.r)}`;}
  return d+' Z';
}
