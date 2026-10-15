import {test} from 'node:test';
import assert from 'node:assert/strict';
import {empty,parseProject,serializeProject,toSectionProject,validate} from '../src/model';

const base=()=>{const p=toSectionProject(empty());p.sections[0].diameter=60;p.sections[0].length=100;p.sections[0].lengthInput=100;return p;};
test('hollow shaft project survives save and reload',()=>{
 const p=base();p.innerSections=[{id:'a',diameter:20,length:40},{id:'b',diameter:30,length:60}];p.bores=[{id:'c',side:'right',diameter:15,depth:25}];
 const q=parseProject(serializeProject(p));
 assert.equal(q.innerSections?.length,2);assert.equal(q.innerSections?.[1].diameter,30);assert.equal(q.bores?.[0].side,'right');assert.equal(validate(q).filter(i=>i.severity==='error').length,0);
});
test('reject bore larger than outside diameter',()=>{
 const p=base();p.bores=[{id:'a',side:'left',diameter:61,depth:20}];assert.ok(validate(p).some(i=>i.text.includes('Binnendiameter')));
});
test('reject bore deeper than shaft',()=>{
 const p=base();p.bores=[{id:'a',side:'right',diameter:20,depth:101}];assert.ok(validate(p).some(i=>i.text.includes('Boring:')));
});
test('reject malformed saved bores',()=>{
 const p=base();p.bores=[{id:'a',side:'center' as 'left',diameter:20,depth:10}];assert.throws(()=>parseProject(serializeProject(p)),/Ongeldige boring/);
});
