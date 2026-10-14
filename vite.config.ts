import {defineConfig} from 'vite';
export default defineConfig({base:'./',server:{host:'127.0.0.1',port:1420,strictPort:true},build:{target:'es2022',cssCodeSplit:false,minify:true}});
