import Ajv from 'ajv';
import fs from 'node:fs';
const schema=JSON.parse(fs.readFileSync('node_modules/@tauri-apps/cli/config.schema.json','utf8'));
const ajv=new Ajv({strict:false,allErrors:true,unicodeRegExp:false,logger:false});
const check=ajv.compile(schema);
if(!check(JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8')))){
  console.error(check.errors);process.exit(1);
}
console.log('Tauri configuratie voldoet aan het configuratieschema.');
