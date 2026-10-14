import {isTauri,invoke} from '@tauri-apps/api/core';
import {open,save,confirm} from '@tauri-apps/plugin-dialog';
declare global {interface Window {RotorasAndroid?:{request:(json:string)=>void};rotorasAndroidResult?:(result:{id:string;value:unknown;error?:string})=>void}}
export const android=!!window.RotorasAndroid;
const requests=new Map<string,{resolve:(value:any)=>void;reject:(error:Error)=>void}>();let requestId=0;
function androidRequest<T>(action:string,args:Record<string,string>={}):Promise<T>{return new Promise((resolve,reject)=>{const id=String(++requestId);requests.set(id,{resolve,reject});try{window.RotorasAndroid!.request(JSON.stringify({id,action,...args}));}catch(e){requests.delete(id);reject(e);}});}
if(android){
 document.documentElement.classList.add('android-app');
 window.rotorasAndroidResult=result=>{const q=requests.get(result.id);if(!q)return;requests.delete(result.id);if(result.error)q.reject(new Error(result.error));else q.resolve(result.value);};
 window.print=()=>{void androidRequest('print').catch(e=>window.alert(String(e)));};
}
export const native = isTauri();
export async function confirmAction(message:string) {return native?confirm(message,{title:'Rotoras Generator',kind:'warning'}):window.confirm(message);}
export async function saveText(name:string,text:string,kind:'csv'|'json'|'svg',folder?:string):Promise<string|null> {
  if(android)return androidRequest<string|null>('save',{name,text,mime:kind==='csv'?'text/csv':kind==='svg'?'image/svg+xml':'application/json'});
  if(native){const path=await save({defaultPath:folder?folder.replace(/[\\/]$/,'')+'\\'+name:name,filters:[{name:kind==='csv'?'Inventor CSV':kind==='svg'?'SVG werktekening':'Rotoras project',extensions:[kind]}]});if(!path)return null;await invoke('write_text',{path,text});return path;}
  const url=URL.createObjectURL(new Blob([text],{type:kind==='csv'?'text/csv;charset=utf-8':kind==='svg'?'image/svg+xml':'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return name;
}
export async function openText():Promise<{name:string;text:string}|null> {
  if(android)return androidRequest<{name:string;text:string}|null>('open');
  if(native){const path=await open({multiple:false,filters:[{name:'Rotoras CSV of project',extensions:['csv','json']}]});if(!path||typeof path!=='string')return null;return {name:path.split(/[\\/]/).at(-1)!,text:await invoke<string>('read_text',{path})};}
  return new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.accept='.csv,.json';input.addEventListener('cancel',()=>resolve(null));input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return resolve(null);resolve({name:file.name,text:await file.text()});});input.click();});
}
export async function chooseFolder():Promise<string|null> {if(!native)return null;const path=await open({directory:true,multiple:false,title:'Kies CSV-exportmap'});return typeof path==='string'?path:null;}
