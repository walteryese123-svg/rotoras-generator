import catalog from './fits.json';
export function fitLimits(d:number,fit:string):{upper:number;lower:number}|null{const rows=(catalog.fits as Record<string,number[][]>)[fit.trim()];const row=rows?.find(r=>d>r[0]&&d<=r[1]);return row?{upper:row[2]/1000,lower:row[3]/1000}:null;}
export function deviation(v:number){return (v>=0?'+':'−')+Math.abs(v).toFixed(3).replace('.',',');}
