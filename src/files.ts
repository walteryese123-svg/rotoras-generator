import {isTauri,invoke} from '@tauri-apps/api/core';
import {open,save,confirm} from '@tauri-apps/plugin-dialog';
export const native = isTauri();
export async function confirmAction(message:string) {return native?confirm(message,{title:'Rotoras Generator',kind:'warning'}):window.confirm(message);}
export async function saveText(name:string,text:string,kind:'csv'|'json'|'svg',folder?:string):Promise<string|null> {
  if(native){const path=await save({defaultPath:folder?folder.replace(/[\\/]$/,'')+'\\'+name:name,filters:[{name:kind==='csv'?'Inventor CSV':kind==='svg'?'SVG werktekening':'Rotoras project',extensions:[kind]}]});if(!path)return null;await invoke('write_text',{path,text});return path;}
  const url=URL.createObjectURL(new Blob([text],{type:kind==='csv'?'text/csv;charset=utf-8':kind==='svg'?'image/svg+xml':'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return name;
}
export async function openText():Promise<{name:string;text:string}|null> {
  if(native){const path=await open({multiple:false,filters:[{name:'Rotoras CSV of project',extensions:['csv','json']}]});if(!path||typeof path!=='string')return null;return {name:path.split(/[\\/]/).at(-1)!,text:await invoke<string>('read_text',{path})};}
  return new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.accept='.csv,.json';input.addEventListener('cancel',()=>resolve(null));input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return resolve(null);resolve({name:file.name,text:await file.text()});});input.click();});
}
export async function chooseFolder():Promise<string|null> {if(!native)return null;const path=await open({directory:true,multiple:false,title:'Kies CSV-exportmap'});return typeof path==='string'?path:null;}
