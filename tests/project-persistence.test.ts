import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankSection,serializeProject,parseProject,toSectionProject,resolveLengths,type Project} from '../src/model';
test('Project restores exact input expressions, total length, modes and all feature settings',()=>{
 const p:Project={version:2,name:'Invoer test',overallLength:'100+50',sections:[
 {...blankSection(),diameter:'12,00',length:'',lengthMode:'left',lengthInput:'10+5',fit:'h6',leftEdge:{type:'OuterChamfer',length:'1+1',angle:'30'},rightEdge:{type:''}},
 {...blankSection(),diameter:'20+5',length:'',lengthMode:'increment',lengthInput:'30-5',leftEdge:{type:''},rightEdge:{type:'DIN509E',radius:'0,8'}},
 {...blankSection(),diameter:'30',length:'',lengthMode:'right',lengthInput:'50+10',leftEdge:{type:''},rightEdge:{type:''}},
 {...blankSection(),diameter:'25',length:'',lengthMode:'right',lengthInput:'0',leftEdge:{type:''},rightEdge:{type:''}}],
 keyways:[{id:'key',start:'15+2',length:'20+5',width:'6',bottom:'18,5'}],drawing:{material:'42CrMo4',revision:'B',paper:'A4',offsets:{'diam-1':{x:3,y:7}}}};
 const expected=resolveLengths(p),loaded=toSectionProject(parseProject(serializeProject(p)));
 const withoutIds=(q:Project)=>JSON.parse(JSON.stringify(q), (k,v)=>k==='id'?undefined:v);
 assert.deepEqual(withoutIds(loaded),withoutIds(expected));
 assert.deepEqual(loaded.sections.map(s=>s.length),[15,25,50,60]);
});
test('Old project retains a per-section expression when its length is calculated',()=>{
 const p:Project={version:1,name:'Oud',sections:[{...blankSection(),diameter:'25',length:'20+5'}]};
 const q=parseProject(serializeProject(resolveLengths(p)));
 assert.equal(q.sections[0].lengthInput,'20+5');assert.equal(q.sections[0].lengthMode,'increment');assert.equal(q.sections[0].length,25);
});
