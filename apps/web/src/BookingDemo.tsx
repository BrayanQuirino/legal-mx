import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, ShieldAlert, Video, Building2, X } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { useDemoStore, type Mode } from "./DemoStore";
import { makeDemoSlots, calendarCandidates, type DemoLawyer } from "./lib/scheduling";
import "./booking-demo.css";

export { makeDemoSlots };
export type { DemoLawyer };

export function BookingDemo({lawyer,onClose,initialUserId="demo-user-026"}:{lawyer:DemoLawyer;onClose:()=>void;initialUserId?:string}){
  const store=useDemoStore();
  const profile=store.profiles[lawyer.id];
  const slots=useMemo(()=>calendarCandidates(),[]);
  const [modality,setModality]=useState<Mode>(profile.modes[0]);
  const [userId,setUserId]=useState(initialUserId);
  const [slot,setSlot]=useState("");
  const [confirmed,setConfirmed]=useState(false);
  const [error,setError]=useState("");
  const selected=slots.find(s=>s.key===slot);
  const available=slots.filter(s=>!store.isUnavailable(lawyer.id,s.date,s.hour));
  const submit=()=>{
    if(!selected || !store.book(lawyer.id,userId,selected.date,selected.hour,modality)){
      setError("El horario ya no está disponible. Selecciona otro.");setSlot("");return;
    }
    setConfirmed(true);setError("");
  };
  return <div className="demo-book-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="demo-book-modal" role="dialog" aria-modal="true" aria-labelledby="book-title">
      <button type="button" className="demo-book-close" aria-label="Cerrar agenda" onClick={onClose}><X size={19}/></button>
      <span className="demo-book-kicker">AGENDA POC · DATOS TOTALMENTE FICTICIOS</span>
      <h2 id="book-title">Solicitar cita con {lawyer.display_name}</h2>
      <p className="demo-book-muted">Esta reserva se reflejará en el panel del abogado durante la sesión de prueba. Se pierde al recargar la página.</p>
      <div className="demo-book-warning"><ShieldAlert size={18}/> Abogado, clientes, disponibilidad y citas simulados. Sin SEP real, cobros, mensajes ni videollamadas.</div>
      {confirmed ? <div className="demo-book-success" role="status"><CheckCircle2 size={31}/><h3>Solicitud demo registrada en esta sesión</h3><p>{selected?.day} a las {selected?.hour} · {modality==="online"?"videollamada":"presencial"}. Estado: pendiente de confirmación en panel de abogado. No es cita real.</p><button className="demo-book-primary" onClick={onClose}>Cerrar</button></div> :
      <>
      <div className="demo-book-section"><strong>1. Cliente ficticio</strong><label className="book-demo-label">Seleccionar una cuenta de prueba<select value={userId} onChange={e=>setUserId(e.target.value)}>{users.records.map(u=><option value={u.id} key={u.id}>{u.display_name}</option>)}</select></label></div>
      <div className="demo-book-section"><strong>2. Modalidad</strong><div className="demo-book-modes">{profile.modes.map(m=><button key={m} type="button" aria-pressed={modality===m} className={modality===m?"active":""} onClick={()=>setModality(m)}>{m==="online"?<Video size={17}/>:<Building2 size={17}/>} {m==="online"?"Videollamada":"Presencial"}</button>)}</div></div>
      <div className="demo-book-section"><strong>3. Horarios disponibles</strong><p className="demo-book-muted">Solo aparecen días y horas que el abogado habilitó; las citas, descansos y bloqueos se ocultan automáticamente.</p>
        <div className="demo-slot-grid">{available.slice(0,24).map(s=><button type="button" key={s.key} aria-pressed={slot===s.key} className={slot===s.key?"active":""} onClick={()=>setSlot(s.key)}><CalendarDays size={14}/>{s.day}<span><Clock3 size={13}/>{s.hour}</span></button>)}</div>
        {available.length===0&&<p role="status">Este perfil no tiene horarios disponibles para los próximos días.</p>}
      </div>
      <div className="demo-book-summary"><span>Precio de prueba</span><strong>${profile.price.toLocaleString("es-MX")} MXN</strong></div>
      {error&&<p role="alert">{error}</p>}
      <button type="button" className="demo-book-primary" disabled={!slot} onClick={submit}>Solicitar cita ficticia</button>
      </>}
    </section>
  </div>;
}
