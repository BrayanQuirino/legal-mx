import { useState } from "react";
import { CalendarDays, Clock3, Settings2, ListChecks, ShieldAlert } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { BookingDemo } from "./BookingDemo";
import { useDemoStore } from "./DemoStore";
import { demoLawyers } from "./lib/scheduling";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { LawyerSettings } from "./LawyerSettings";
import "./demo-dashboards.css";
import "./weekly-calendar.css";
const statusLabels={confirmed:"Confirmada",pending:"Por confirmar",cancelled:"Cancelada"};
export function LawyerDashboard(){
 const store=useDemoStore();
 const [lawyerId,setLawyerId]=useState(demoLawyers[0].id);
 const [tab,setTab]=useState<"weekly"|"appointments"|"settings">("weekly");
 const appointments=store.appointments.filter(a=>a.lawyer_id===lawyerId).sort((a,b)=>(a.date+a.hour).localeCompare(b.date+b.hour));
 return <div className="legal-dashboard lawyer-workspace">
   <div className="dash-heading"><div><span className="section-label">CENTRO DE TRABAJO · DEMOSTRACIÓN</span><h3>{tab==="weekly"?"Agenda semanal":tab==="appointments"?"Mis citas":"Configuración del despacho"}</h3><p>Una sección por tarea: agenda visual, citas o ajustes rápidos del perfil.</p></div><span className="dash-notice">POC · Sin sesiones reales</span></div>
   <div className="lawyer-identity-row"><label className="dash-label">Perfil del abogado ficticio<select value={lawyerId} onChange={e=>setLawyerId(e.target.value)}>{demoLawyers.map(l=><option key={l.id} value={l.id}>{l.display_name}</option>)}</select></label><div className="lawyer-quick-stats"><span><CalendarDays size={16}/> {appointments.filter(a=>a.status!=="cancelled").length} citas</span><span><Clock3 size={16}/> {appointments.filter(a=>a.status==="pending").length} pendientes</span></div></div>
   <nav className="lawyer-main-tabs" aria-label="Secciones del abogado">
     <button type="button" className={tab==="weekly"?"active":""} aria-current={tab==="weekly"?"page":undefined} onClick={()=>setTab("weekly")}><CalendarDays size={18}/> Agenda semanal</button>
     <button type="button" className={tab==="appointments"?"active":""} aria-current={tab==="appointments"?"page":undefined} onClick={()=>setTab("appointments")}><ListChecks size={18}/> Mis citas</button>
     <button type="button" className={tab==="settings"?"active":""} aria-current={tab==="settings"?"page":undefined} onClick={()=>setTab("settings")}><Settings2 size={18}/> Configuración</button>
   </nav>
   {tab==="weekly"&&<WeeklyCalendar lawyerId={lawyerId}/>}
   {tab==="settings"&&<LawyerSettings lawyerId={lawyerId}/>}
   {tab==="appointments"&&<div className="appointments-full-panel"><div className="dash-box-header"><h4>Citas y solicitudes del abogado</h4><span>{appointments.length} registros de prueba</span></div><p className="dash-muted">Confirma o cancela una cita. Los horarios reservados se distinguen también en la agenda semanal.</p>
     {appointments.map(a=><div className="dash-appointment" key={a.id}><div><strong>{users.records.find(u=>u.id===a.user_id)?.display_name ?? "Cliente demo"}</strong><small>{a.date} · {a.hour} · {a.modality==="online"?"Videollamada":"Presencial"}</small></div><div className="dash-appointment-actions"><span className={"dash-status status-"+a.status}>{statusLabels[a.status]}</span>{a.status==="pending"&&<button onClick={()=>store.updateStatus(a.id,"confirmed")}>Confirmar</button>}{a.status!=="cancelled"&&<button onClick={()=>store.updateStatus(a.id,"cancelled")}>Cancelar</button>}</div></div>)}
   </div>}
   <p className="lawyer-workspace-footer"><ShieldAlert size={15}/> Toda la administración es ficticia y se restablece al recargar. No hay validación profesional, reservas ni pagos reales.</p>
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
