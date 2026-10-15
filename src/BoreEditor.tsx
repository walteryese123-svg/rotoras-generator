import {number,total,type Project,type Value} from './model';
const val=(v:Value|undefined)=>String(v??'');
const num=(v:Value|undefined)=>number(v);
export default function BoreEditor({project:p,change}:{project:Project;change:(p:Project)=>void}){
 const inner=p.innerSections??[],bores=p.bores??[];
 const setInner=(i:number,key:'diameter'|'length',value:string)=>change({...p,innerSections:inner.map((s,j)=>j===i?{...s,[key]:value}:s)});
 const setBore=(i:number,key:'side'|'diameter'|'depth',value:string)=>change({...p,bores:bores.map((s,j)=>j===i?{...s,[key]:value}:s)});
 return <section className="shaft-panel"><div className="panel-head"><div><span className="eyebrow">HOLLE ASSEN</span><h2>Binnencontour</h2></div></div>
 <p className="table-hint">Binnensecties volgen elkaar vanaf links op. Boringen beginnen aan de gekozen kopzijde. Alle maten in mm.</p>
 <h3>Doorlopende / getrapte binnencontour</h3>
 {inner.map((s,i)=><div className="form-grid" key={s.id}><label className="field">Ø binnen<input inputMode="decimal" value={val(s.diameter)} onChange={e=>setInner(i,'diameter',e.target.value)}/></label><label className="field">Lengte<input inputMode="decimal" value={val(s.length)} onChange={e=>setInner(i,'length',e.target.value)}/></label><button onClick={()=>change({...p,innerSections:inner.filter((_,j)=>i!==j)})}>Verwijder</button></div>)}
 <div className="list-actions"><button onClick={()=>change({...p,innerSections:[...inner,{id:crypto.randomUUID(),diameter:'20',length:String(Math.max(0,total(p)-inner.reduce((a,s)=>a+num(s.length),0)))}]})}>+ Binnensectie</button></div>
 <h3>Blinde / afzonderlijke boringen</h3>
 {bores.map((s,i)=><div className="form-grid" key={s.id}><label className="field">Vanaf<select value={s.side} onChange={e=>setBore(i,'side',e.target.value)}><option value="left">Links</option><option value="right">Rechts</option></select></label><label className="field">Ø boring<input inputMode="decimal" value={val(s.diameter)} onChange={e=>setBore(i,'diameter',e.target.value)}/></label><label className="field">Diepte<input inputMode="decimal" value={val(s.depth)} onChange={e=>setBore(i,'depth',e.target.value)}/></label><button onClick={()=>change({...p,bores:bores.filter((_,j)=>i!==j)})}>Verwijder</button></div>)}
 <div className="list-actions"><button onClick={()=>change({...p,bores:[...bores,{id:crypto.randomUUID(),side:'left',diameter:'15',depth:'30'}]})}>+ Boring</button></div>
 <p className="table-hint">Let op: Inventor CSV-export voor holle assen volgt later. Bewaar je volledige project als .rotoras.json.</p>
 </section>;
}
