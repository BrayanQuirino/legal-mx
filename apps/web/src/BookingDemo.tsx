import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, ShieldAlert, Video, Building2, X } from "lucide-react";
import lawyers from "../../../data/fixtures/lawyers.synthetic.json";
import "./booking-demo.css";

export type DemoLawyer = (typeof lawyers.records)[number];
type Slot = { date: string; day: string; hour: string; key: string };

const fmt = new Intl.DateTimeFormat("es-MX", { timeZone:"America/Mexico_City", year:"numeric",month:"2-digit",day:"2-digit" });
const dayFmt = new Intl.DateTimeFormat("es-MX", { timeZone:"UTC",weekday:"short",day:"numeric",month:"short" });
const parts = fmt.formatToParts(new Date());
const today = [parts.find(x=>x.type==="year")?.value,parts.find(x=>x.type==="month")?.value,parts.find(x=>x.type==="day")?.value].join("-");
/** Fixed future dates relative to Mexico City, never a real availability API. */
export function makeDemoSlots(lawyer: DemoLawyer): Slot[] {
  const schedule = lawyer.demo_schedule;
  if (!schedule || !lawyer.demo_booking_enabled) return [];
  const base = new Date(today + "T12:00:00Z");
  const slots: Slot[] = [];
  for(let offset=1;offset<=12;offset++){
    const day=new Date(base.getTime()+offset*86400000);
    if(!schedule.weekdays.includes(day.getUTCDay()))continue;
    const date=day.toISOString().slice(0,10);
    const label=dayFmt.format(day);
    for(let hour=schedule.start_hour;hour<schedule.end_hour;hour+=2){
      const hourText=String(hour).padStart(2,"0")+":00";
      slots.push({date, day:label, hour:hourText, key:date+"|"+hourText});
    }
  }
  return slots;
}

export function BookingDemo({lawyer, onClose}:{lawyer:DemoLawyer,onClose:()=>void}){
  const slots=useMemo(()=>makeDemoSlots(lawyer),[lawyer]);
  const [modality,setModality]=useState<"online"|"presencial">(lawyer.consultation_modes[0] as "online"|"presencial");
  const [slot,setSlot]=useState("");
  const [confirmed,setConfirmed]=useState(false);
  const selected=slots.find(s=>s.key===slot);
  return <div className="demo-book-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="demo-book-modal" role="dialog" aria-modal="true" aria-labelledby="book-title">
      <button type="button" className="demo-book-close" aria-label="Cerrar agenda" onClick={onClose}><X size={19}/></button>
      <span className="demo-book-kicker">AGENDA DE DEMOSTRACIÓN · SIN RESERVAS REALES</span>
      <h2 id="book-title">Primera consulta con {lawyer.display_name}</h2>
      <p className="demo-book-muted">Selecciona modalidad y horario para ver cómo funcionará una reserva. No se solicitarán datos personales ni se enviará ninguna confirmación.</p>
      <div className="demo-book-warning"><ShieldAlert size={18}/> Aprobado únicamente en una simulación. No se verificó ninguna cédula ante la SEP. Horarios y precios son ficticios.</div>
      {confirmed ? <div className="demo-book-success" role="status"><CheckCircle2 size={31}/><h3>¡Flujo de agenda completado!</h3><p>Solicitud ilustrativa: {selected?.day} a las {selected?.hour}, modalidad {modality==="online"?"videollamada":"presencial"}. No existe una cita real ni un enlace de videollamada.</p><button className="demo-book-primary" onClick={onClose}>Cerrar demostración</button></div> :
      <><div className="demo-book-section"><strong>1. Tipo de consulta</strong><div className="demo-book-modes">
      {lawyer.consultation_modes.map(m=><button type="button" key={m} aria-pressed={modality===m} className={modality===m?"active":""} onClick={()=>setModality(m as "online"|"presencial")}>{m==="online"?<Video size={17}/>:<Building2 size={17}/>} {m==="online"?"Videollamada":"Presencial"}</button>)}</div></div>
      <div className="demo-book-section"><strong>2. Escoge un horario disponible (simulado)</strong><div className="demo-slot-grid">
        {slots.slice(0,16).map(s=><button type="button" key={s.key} aria-pressed={slot===s.key} className={slot===s.key?"active":""} onClick={()=>setSlot(s.key)}><CalendarDays size={14}/>{s.day}<span><Clock3 size={13}/>{s.hour}</span></button>)}
      </div></div>
      <div className="demo-book-summary"><span>Costo ficticio de consulta</span><strong>${lawyer.consultation_price_mxn_demo.toLocaleString("es-MX")} MXN</strong></div>
      <button type="button" className="demo-book-primary" disabled={!slot} onClick={()=>setConfirmed(true)}>Simular solicitud de cita</button>
      </>}
    </section>
  </div>;
}
