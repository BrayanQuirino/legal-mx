import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Lock, Unlock, Users } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { useDemoStore } from "./DemoStore";
import { DAY_HOURS, upcomingWeekStart, weekDates, getMexicoToday, weekdayUtc } from "./lib/scheduling";

const labels=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const dateLabel=(date:string)=>new Date(date+"T12:00:00Z").getUTCDate();
const shiftWeek=(monday:string,delta:number)=>new Date(new Date(monday+"T12:00:00Z").getTime()+delta*7*86400000).toISOString().slice(0,10);

export function WeeklyCalendar({lawyerId}:{lawyerId:string}) {
  const store=useDemoStore();
  const [week,setWeek]=useState(upcomingWeekStart);
  const scrollRef=useRef<HTMLDivElement|null>(null);
  const dates=useMemo(()=>weekDates(week),[week]);
  const bookings=store.appointments.filter(a=>a.lawyer_id===lawyerId&&a.status!=="cancelled");
  const profile=store.profiles[lawyerId];
  const [focused,setFocused]=useState<string|null>(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=7*53;},[lawyerId]);
  const focusedBooking=bookings.find(a=>a.id===focused);
  const bookedCount=bookings.filter(a=>dates.includes(a.date)).length;
  const isBooked=(date:string,hour:string)=>bookings.find(a=>a.date===date&&a.hour===hour);
  const isManualBlock=(date:string,hour:string)=>store.blocked.some(b=>b.lawyerId===lawyerId&&b.date===date&&b.hour===hour);
  const hasLeave=(date:string)=>store.leaves.some(l=>l.lawyerId===lawyerId&&l.date===date);
  return <section className="weekly-panel" aria-label="Agenda semanal con siete días">
    <div className="weekly-topbar"><div><span className="section-label">AGENDA SEMANAL · 7 DÍAS</span><h3>Tu semana de un vistazo</h3><p>Selecciona cualquier hora para bloquearla, o bloquea una fila completa para los siete días.</p></div><div className="weekly-nav"><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,-1))} aria-label="Semana anterior"><ArrowLeft size={17}/></button><span>{dates[0].slice(5)} — {dates[6].slice(5)}<small>CDMX</small></span><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,1))} aria-label="Semana siguiente"><ArrowRight size={17}/></button><button type="button" className="weekly-today" onClick={()=>setWeek(upcomingWeekStart())}>Hoy</button></div></div>
    <div className="weekly-kpis"><span><CalendarDays size={15}/> {bookedCount} citas esta semana</span><span className="weekly-kpi-free"><span/> Horario disponible</span><span className="weekly-kpi-booked"><span/> Reservado</span><span className="weekly-kpi-closed"><span/> Fuera de horario / bloqueado</span></div>
    <div className="weekly-scroll" ref={scrollRef}>
      <div className="weekly-grid" role="grid" aria-label="Disponibilidad del abogado de lunes a domingo">
        <div className="weekly-corner" role="columnheader">Hora <small>Bloquear fila</small></div>
        {dates.map(date=><div className="weekly-day-head" role="columnheader" key={date}>
          <span>{labels[weekdayUtc(date)]} <strong>{dateLabel(date)}</strong></span>
          <button type="button" title="Activar o quitar descanso completo" aria-label={(hasLeave(date)?"Quitar descanso ":"Marcar descanso ")+date} className={hasLeave(date)?"weekly-day-off active":"weekly-day-off"} onClick={()=>store.toggleLeave(lawyerId,date)}>{hasLeave(date)?<Lock size={12}/>:<Unlock size={12}/>} <span>{hasLeave(date)?"Descanso":"Descansar"}</span></button>
        </div>)}
        {DAY_HOURS.map(hour=>{
          const h=Number(hour.slice(0,2));
          const allBlocked=(store.weeklyBlockedHours[lawyerId]??[]).includes(h);
          return <div className="weekly-hour-row" role="row" key={hour}>
            <button type="button" className={allBlocked?"weekly-hour-label all-blocked":"weekly-hour-label"} title={(allBlocked?"Desbloquear":"Bloquear")+" esta hora todos los días de la semana"} onClick={()=>store.toggleWeeklyHour(lawyerId,h)}>
              <strong>{hour}</strong><small>{allBlocked?"Fila bloqueada":"Bloquear fila"}</small>{allBlocked?<Lock size={12}/>:<Unlock size={12}/>}
            </button>
            {dates.map(date=>{
              const existing=isBooked(date,hour);
              const blocked=isManualBlock(date,hour);
              const off=hasLeave(date)||(store.daysOff[lawyerId]??[]).includes(weekdayUtc(date));
              const working=store.isWorkingSlot(lawyerId,date,hour);
              const state=existing?"booked":off?"rest":blocked||allBlocked?"blocked":!working?"closed":"available";
              const label=existing?"Cita":off?"Descanso":blocked||allBlocked?"Bloqueado":working?"Disponible":"No laboral";
              return <button type="button" role="gridcell" key={date+hour}
                disabled={state==="closed"||state==="rest"||state==="blocked"&&allBlocked}
                title={date+" "+hour+" · "+label}
                aria-label={date+" "+hour+" "+label}
                className={"weekly-cell "+state}
                onClick={()=>existing?setFocused(existing.id):store.toggleBlock(lawyerId,date,hour)}>
                {existing?<><Users size={12}/><span>{label}</span></>:<span>{state==="available"?"Libre":state==="blocked"?"✕":"—"}</span>}
              </button>;
            })}
          </div>;
        })}
      </div>
    </div>
    <p className="weekly-help">Haz clic en <strong>Bloquear fila</strong> junto a una hora (por ejemplo, 03:00) para cerrarla en los siete días y futuras semanas. Las reservas existentes no se eliminan automáticamente.</p>
    {focusedBooking&&<div className="weekly-booking-detail" role="region" aria-label="Detalles de la cita seleccionada">
      <div><strong>{users.records.find(u=>u.id===focusedBooking.user_id)?.display_name ?? "Cliente demo"}</strong><p>{focusedBooking.date} · {focusedBooking.hour} · {focusedBooking.modality==="online"?"Videollamada":"Presencial"}</p><small>Estado: {focusedBooking.status==="pending"?"Por confirmar":"Confirmada"}</small></div>
      <div className="weekly-detail-buttons">{focusedBooking.status==="pending"&&<button type="button" onClick={()=>{store.updateStatus(focusedBooking.id,"confirmed");setFocused(null);}}>Confirmar</button>}<button type="button" onClick={()=>{store.updateStatus(focusedBooking.id,"cancelled");setFocused(null);}}>Cancelar cita</button><button type="button" onClick={()=>setFocused(null)}>Cerrar</button></div>
    </div>}
    <div className="weekly-summary"><Clock3 size={16}/> Horario habitual: {String(profile.startHour).padStart(2,"0")}:00–{String(profile.endHour).padStart(2,"0")}:00. Puedes modificarlo desde <strong>Configuración</strong>.</div>
  </section>;
}
