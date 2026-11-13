import { useMemo, useState } from "react";
import { Building2, CalendarDays, CheckCircle2, Clock3, MapPin, ShieldAlert, Video, X } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { BookingDemo } from "./BookingDemo";
import { useDemoStore, type Mode } from "./DemoStore";
import { demoLawyers, makeDemoSlots } from "./lib/scheduling";
import "./demo-dashboards.css";

const weekdayNames=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const statusLabels={confirmed:"Confirmada",pending:"Por confirmar",cancelled:"Cancelada"};

export function LawyerDashboard(){
  const store=useDemoStore();
  const [lawyerId,setLawyerId]=useState(demoLawyers[0].id);
  const [tab,setTab]=useState<"calendar"|"profile">("calendar");
  const [day,setDay]=useState("");
  const [showBooking,setShowBooking]=useState(false);
  const lawyer=demoLawyers.find(l=>l.id===lawyerId) ?? demoLawyers[0];
  const profile=store.profiles[lawyer.id];
  const myAppointments=store.appointments.filter(a=>a.lawyer_id===lawyerId).sort((a,b)=>(a.date+a.hour).localeCompare(b.date+b.hour));
  const slots=useMemo(()=>makeDemoSlots(lawyer),[lawyer]);
  const uniqueDays=[...new Set(slots.map(s=>s.date))];
  const selectedDay=day&&uniqueDays.includes(day)?day:uniqueDays[0];
  const shownSlots=slots.filter(s=>s.date===selectedDay);
  const blockedSlots=store.blocked.filter(b=>b.lawyerId===lawyerId).length;
  const leaveDays=store.leaves.filter(l=>l.lawyerId===lawyerId).length;
  return <div className="legal-dashboard">
    <div className="dash-heading"><div><span className="section-label">CENTRO DE TRABAJO DEL ABOGADO · DEMO</span><h3>Mi despacho y agenda</h3><p>Un solo panel para consultas, disponibilidad y configuración profesional.</p></div><span className="dash-notice">POC · Sin cuentas reales</span></div>
    <label className="dash-label">Seleccionar abogado ficticio<select value={lawyerId} onChange={e=>{setLawyerId(e.target.value);setDay("");}}>{demoLawyers.map(l=><option key={l.id} value={l.id}>{l.display_name}</option>)}</select></label>
    <div className="dash-stats"><div><CalendarDays/><strong>{myAppointments.filter(a=>a.status!=="cancelled").length}</strong><small>Citas demo</small></div><div><Clock3/><strong>{myAppointments.filter(a=>a.status==="pending").length}</strong><small>Por confirmar</small></div><div><X/><strong>{blockedSlots+leaveDays}</strong><small>Bloqueos/descansos</small></div></div>
    <div className="dash-tabs" role="group" aria-label="Sección del abogado"><button className={tab==="calendar"?"active":""} aria-pressed={tab==="calendar"} onClick={()=>setTab("calendar")}>Agenda y horarios</button><button className={tab==="profile"?"active":""} aria-pressed={tab==="profile"} onClick={()=>setTab("profile")}>Editar mi perfil</button></div>
    {tab==="calendar"?<>
      <section className="dash-box"><div className="dash-box-header"><h4>Citas agendadas</h4><span>{myAppointments.length} simulaciones</span></div>
      <div className="dash-appointments">{myAppointments.map(a=>{
        const client=users.records.find(u=>u.id===a.user_id);
        return <div className="dash-appointment" key={a.id}><div><strong>{client?.display_name ?? "Cliente ficticio"}</strong><small>{a.date} · {a.hour} · {a.modality==="online"?"Videollamada":"Presencial"}</small></div><div className="dash-appointment-actions"><span className={"dash-status status-"+a.status}>{statusLabels[a.status]}</span>{a.status==="pending"&&<button onClick={()=>store.updateStatus(a.id,"confirmed")}>Confirmar</button>}{a.status!=="cancelled"&&<button onClick={()=>store.updateStatus(a.id,"cancelled")}>Cancelar</button>}</div></div>;
      })}</div></section>
      <section className="dash-box"><div className="dash-box-header"><h4>Administrar disponibilidad</h4><span>Hora de CDMX</span></div>
        <label className="dash-label">Día de la agenda<select value={selectedDay} onChange={e=>setDay(e.target.value)}>{uniqueDays.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <button className="dash-leave-button" type="button" onClick={()=>store.toggleLeave(lawyer.id,selectedDay)}>{store.leaves.some(l=>l.lawyerId===lawyer.id&&l.date===selectedDay)?"Quitar día de descanso":"Marcar este día como descanso"}</button>
        <p className="dash-muted">Toca un horario libre para bloquearlo; toca un bloqueo manual para liberarlo. Una cita existente debe cancelarse antes de bloquear su horario.</p>
        <div className="dash-slots">{shownSlots.map(s=>{
          const appointment=myAppointments.find(a=>a.date===s.date&&a.hour===s.hour&&a.status!=="cancelled");
          const blocked=store.blocked.some(b=>b.lawyerId===lawyer.id&&b.date===s.date&&b.hour===s.hour);
          const off=store.leaves.some(l=>l.lawyerId===lawyer.id&&l.date===s.date)||(store.daysOff[lawyer.id]??[]).includes(new Date(s.date+"T12:00:00Z").getUTCDay());
          const label=appointment?"Ocupado":off?"Descanso":blocked?"Bloqueado":"Disponible";
          return <button key={s.key} type="button" disabled={Boolean(appointment)||off} className={appointment?"taken":off?"off":blocked?"blocked":"free"} onClick={()=>store.toggleBlock(lawyer.id,s.date,s.hour)}><strong>{s.hour}</strong><small>{label}</small></button>;
        })}</div>
      </section>
      <section className="dash-box"><h4>Días de descanso recurrentes</h4><p className="dash-muted">No se ofrecerán nuevos horarios en estos días de la semana. Las citas ya existentes permanecen visibles para revisión.</p><div className="dash-weekdays">{weekdayNames.map((name,i)=><button key={i} type="button" aria-pressed={(store.daysOff[lawyer.id]??[]).includes(i)} className={(store.daysOff[lawyer.id]??[]).includes(i)?"active":""} onClick={()=>store.toggleWeekdayOff(lawyer.id,i)}>{name}</button>)}</div></section>
      <button className="dash-primary" onClick={()=>setShowBooking(true)}>Simular una nueva cita <CalendarDays size={16}/></button>
    </>:<section className="dash-box"><h4>Mi información profesional</h4><div className="dash-warning"><ShieldAlert size={18}/> Solo cambia la información ficticia dentro de esta sesión. Las credenciales continúan sin verificación oficial.</div>
      <label className="dash-label">Nombre del perfil<input value={lawyer.display_name} disabled title="Nombre definido por fixture, aún no editable"/></label>
      <div className="dash-label">Modalidad de atención<div className="dash-modality">{(["online","presencial"] as Mode[]).map(m=><label key={m}><input type="checkbox" checked={profile.modes.includes(m)} onChange={e=>{const next=e.target.checked?[...profile.modes,m]:profile.modes.filter(value=>value!==m);if(next.length)store.updateProfile(lawyer.id,{modes:next});}}/>{m==="online"?<Video size={15}/>:<Building2 size={15}/>} {m==="online"?"Videollamada":"Presencial"}</label>)}</div></div>
      <label className="dash-label">Costo de consulta ficticio (MXN)<input type="number" min={0} max={10000} step={50} value={profile.price} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>=0&&v<=10000)store.updateProfile(lawyer.id,{price:v});}}/></label>
      <label className="dash-label">Ubicación / zona de atención (ficticia)<input value={profile.location} maxLength={80} onChange={e=>store.updateProfile(lawyer.id,{location:e.target.value})} placeholder="Ej. Naucalpan, Estado de México"/></label>
      <p className="dash-muted"><MapPin size={15}/> Los cambios solo afectan esta demostración. No actualizan coordenadas del mapa ni un domicilio real. Si atiendes únicamente en línea, no necesitas agregar un despacho público.</p>
      <div className="dash-success"><CheckCircle2 size={18}/> Perfil de demostración editable. Los cambios se reflejan en el flujo de reservas.</div>
    </section>}
    {showBooking&&<BookingDemo lawyer={lawyer} onClose={()=>setShowBooking(false)}/>}
  </div>;
}

export function ClientDashboard(){
  const store=useDemoStore();
  const [userId,setUserId]=useState("demo-user-001");
  const [chosen,setChosen]=useState<(typeof demoLawyers)[number]|null>(null);
  const mine=store.appointments.filter(a=>a.user_id===userId).sort((a,b)=>(a.date+a.hour).localeCompare(b.date+b.hour));
  return <div className="legal-dashboard">
    <div className="dash-heading"><div><span className="section-label">MI ESPACIO · CLIENTE FICTICIO</span><h3>Mis citas y nuevas consultas</h3><p>Selecciona una de las 100 personas de prueba y explora sus citas.</p></div><span className="dash-notice">Solo simulación</span></div>
    <label className="dash-label">Cuenta ficticia<select value={userId} onChange={e=>setUserId(e.target.value)}>{users.records.map(u=><option value={u.id} key={u.id}>{u.display_name}</option>)}</select></label>
    <section className="dash-box"><div className="dash-box-header"><h4>Mis citas</h4><span>{mine.length} registros</span></div>
      {mine.length===0&&<p className="dash-muted">Todavía no tienes citas de demostración.</p>}
      {mine.map(a=><div className="dash-appointment" key={a.id}><div><strong>{demoLawyers.find(l=>l.id===a.lawyer_id)?.display_name}</strong><small>{a.date} · {a.hour} · {a.modality==="online"?"Videollamada":"Presencial"}</small></div><span className={"dash-status status-"+a.status}>{statusLabels[a.status]}</span></div>)}
    </section>
    <section className="dash-box"><h4>Solicitar una nueva consulta</h4><p className="dash-muted">Los cinco abogados de esta sección cuentan con agenda de prueba, no con acreditación profesional real.</p>
      <div className="dash-lawyer-choices">{demoLawyers.map(l=><div className="dash-lawyer-item" key={l.id}><div><strong>{l.display_name}</strong><small>{store.profiles[l.id]?.location} · ${store.profiles[l.id]?.price.toLocaleString("es-MX")} MXN (demo)</small></div><button onClick={()=>setChosen(l)}>Agendar <CalendarDays size={14}/></button></div>)}</div>
    </section>
    {chosen&&<BookingDemo lawyer={chosen} initialUserId={userId} onClose={()=>setChosen(null)}/>}
  </div>;
}
