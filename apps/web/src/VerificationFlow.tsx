import { useState } from "react";
import { AlertTriangle, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
const steps = [
 {name:"Identidad",hint:"Se requerirá cotejo de identidad con un proveedor KYC autorizado y controles antifraude."},
 {name:"Cédula profesional",hint:"Cotejar nombre, profesión y número de cédula en el Registro Nacional de Profesionistas de la SEP."},
 {name:"Privacidad y autorización",hint:"Aviso de privacidad integral, fines específicos, derechos ARCO, seguridad y minimización de datos."},
 {name:"Revisión humana",hint:"Un revisor autorizado resolverá discrepancias y dejará evidencia auditable antes de aprobar."}
];
/** In-memory workflow. No uploaded files, sensitive identifiers or verified credentials. */
export function VerificationFlow(){
 const [current,setCurrent]=useState(0);
 const [consent,setConsent]=useState(false);
 const [conflict,setConflict]=useState(false);
 const [finished,setFinished]=useState(false);
 const reset=()=>{setCurrent(0);setConsent(false);setConflict(false);setFinished(false);};
 return <div className="poc-verify"><div className="poc-warning"><AlertTriangle size={20}/><p><strong>PROCESO SIMULADO — NO VERIFICADO.</strong> Falta conectar SEP, verificador de identidad, revisión humana, almacenamiento cifrado y auditoría. No escribas ni envíes INE, CURP, cédula ni biométricos.</p></div><h3>Validación profesional · POC</h3><div className="poc-steps">{steps.map((s,i)=><span className={i===current?"active":i<current?"done":""} key={s.name}>{i<current?<CheckCircle2 size={14}/>:i+1}. {s.name}</span>)}</div><div className="poc-stage"><strong>{steps[current].name}</strong><p>{steps[current].hint}</p>{current===1&&<a href="https://www.gob.mx/cedulaprofesional" target="_blank" rel="noopener noreferrer">Consulta oficial SEP <ExternalLink size={13}/></a>}{current===2&&<label className="poc-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> He leído los requisitos de esta simulación (no es consentimiento real).</label>}{current===3&&<label className="poc-check"><input type="checkbox" checked={conflict} onChange={e=>setConflict(e.target.checked)}/> Simular discrepancia y revisión adicional</label>}</div>{finished?<div className="poc-warning">{conflict?"Escenario: se necesita revisión humana.":"Escenario terminado: NO constituye verificación real ni aprobación del perfil."}</div>:<button className="poc-primary" disabled={current===2&&!consent} onClick={()=>current<3?setCurrent(current+1):setFinished(true)}>{current<3?"Siguiente etapa":"Terminar simulación"} <ArrowRight size={16}/></button>}<button className="poc-link" onClick={reset}>Reiniciar flujo</button></div>;
}