import {useEffect,useRef,type ReactNode} from 'react';
export default function SectionDialog({children,close}:{children:ReactNode;close:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current;if(dialog&&!dialog.open)dialog.showModal();return ()=>{if(dialog?.open)dialog.close();};},[]);
  return <dialog ref={ref} className="editor section-details section-dialog" aria-labelledby="section-dialog-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}><div className="dialog-content">{children}<div className="dialog-actions"><small>Wijzigingen worden direct toegepast.</small><button onClick={close}>Sluiten</button></div></div></dialog>;
}
