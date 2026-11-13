import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Lock, Unlock, Users } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { latestRule } from "./lib/availabilityPolicy";
import { useDemoStore } from "./DemoStore";
import { DAY_HOURS, nextFutureWeekStart, weekDates, weekdayUtc, getMexicoToday } from "./lib/scheduling";

const labels=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const dateLabel=(date:string)=>new Date(date+"T12:00:00Z").getUTCDate();
const shiftWeek=(monday:string,delta:number)=>new Date(new Date(monday+"T12:00:00Z").getTime()+delta*7*86400000).toISOString().slice(0,10);

export function WeeklyCalendar({lawyerId}:{lawyerId:string}) {
  const store=useDemoStore();
  const [week,setWeek]=useState(nextFutureWeekStart);
  const [pendingBulk,setPendingBulk]=useState<{kind:"hour"|"day";hour?:number;date?:string;blocked:boolean}|null>(null);
  const [bulkScope,setBulkScope]=useState<"once"|"future">("once");
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
  const hasLeave=(date:string)=>{
    const recurring=latestRule(store.recurringDays.filter(rule=>rule.lawyerId===lawyerId&&rule.weekday===weekdayUtc(date)),date);
    return store.leaves.some(l=>l.lawyerId===lawyerId&&l.date===date)
      || (store.daysOff[lawyerId]??[]).includes(weekdayUtc(date))
      || Boolean(recurring?.off);
  };
  const isHourRecurringBlocked=(hour:number)=>{
    const rule=latestRule(store.recurringHours.filter(r=>r.lawyerId===lawyerId&&r.hour===hour),dates[0]);
    return Boolean(rule?.blocked)||(store.weeklyBlockedHours[lawyerId]??[]).includes(hour);
  };
  const showBulk=(item:{kind:"hour"|"day";hour?:number;date?:string;blocked:boolean})=>{
    setBulkScope("once");setPendingBulk(item);
  };
  const applyBulk=()=>{
    if(!pendingBulk)return;
    if(pendingBulk.kind==="hour"&&pendingBulk.hour!==undefined){
      store.setRowScope(lawyerId,pendingBulk.hour,dates,bulkScope==="future"?"future":"week",pendingBulk.blocked);
    }else if(pendingBulk.date){
      store.setDayScope(lawyerId,pendingBulk.date,bulkScope,pendingBulk.blocked);
    }
    setPendingBulk(null);
  };
  const canEdit=(date:string)=>date>getMexicoToday();
  return <section className="weekly-panel" aria-label="Agenda semanal con siete días">
    <div className="weekly-topbar"><div><span className="section-label">AGENDA SEMANAL · 7 DÍAS</span><h3>Tu semana de un vistazo</h3><p>Cada celda se puede abrir o bloquear. Para una fila o un día completo puedes elegir si el cambio aplica una vez o se repite en el futuro.</p></div><div className="weekly-nav"><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,-1))} aria-label="Semana anterior"><ArrowLeft size={17}/></button><span>{dates[0].slice(5)} — {dates[6].slice(5)}<small>CDMX</small></span><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,1))} aria-label="Semana siguiente"><ArrowRight size={17}/></button><button type="button" className="weekly-today" onClick={()=>setWeek(nextFutureWeekStart())}>Próxima semana</button></div></div>
    <div className="weekly-kpis"><span><CalendarDays size={15}/> {bookedCount} citas esta semana</span><span className="weekly-kpi-free"><span/> Horario disponible</span><span className="weekly-kpi-booked"><span/> Reservado</span><span className="weekly-kpi-closed"><span/> Fuera de horario / bloqueado</span></div>
    <div className="weekly-scroll" ref={scrollRef}>
      <div className="weekly-grid" role="grid" aria-label="Disponibilidad del abogado de lunes a domingo">
        <div className="weekly-corner" role="columnheader">Hora <small>Bloquear fila</small></div>
        {dates.map(date=><div className="weekly-day-head" role="columnheader" key={date}>
          <span>{labels[weekdayUtc(date)]} <strong>{dateLabel(date)}</strong></span>
          <button type="button" title="Activar o quitar descanso completo" aria-label={(hasLeave(date)?"Quitar descanso ":"Marcar descanso ")+date} className={hasLeave(date)?"weekly-day-off active":"weekly-day-off"} disabled={!canEdit(date)} onClick={()=>showBulk({kind:"day",date,blocked:!hasLeave(date)})}>{hasLeave(date)?<Lock size={12}/>:<Unlock size={12}/>} <span>{hasLeave(date)?"Descanso":"Descansar"}</span></button>
        </div>)}
        {DAY_HOURS.map(hour=>{
          const h=Number(hour.slice(0,2));
          const allBlocked=isHourRecurringBlocked(h) || dates.filter(canEdit).every(date=>store.blocked.some(b=>b.lawyerId===lawyerId&&b.hour===hour&&b.date===date));
          return <div className="weekly-hour-row" role="row" key={hour}>
            <button type="button" className={allBlocked?"weekly-hour-label all-blocked":"weekly-hour-label"} title={(allBlocked?"Desbloquear":"Bloquear")+" esta hora todos los días de la semana"} onClick={()=>showBulk({kind:"hour",hour:h,blocked:!allBlocked})}>
              <strong>{hour}</strong><small>{allBlocked?"Fila bloqueada":"Bloquear fila"}</small>{allBlocked?<Lock size={12}/>:<Unlock size={12}/>}
            </button>
            {dates.map(date=>{
              const existing=isBooked(date,hour);
              const blocked=isManualBlock(date,hour);
              const off=hasLeave(date)||(store.daysOff[lawyerId]??[]).includes(weekdayUtc(date));
              const working=store.isWorkingSlot(lawyerId,date,hour);
              const editable=canEdit(date);
              const state=existing?"booked":!editable?"past":working?"available":blocked||allBlocked||off?"blocked":"closed";
              const label=existing?"Cita":!editable?"Pasado":working?"Disponible":blocked||allBlocked||off?"Bloqueado":"Sin habilitar";
              return <button type="button" role="gridcell" key={date+hour}
                disabled={!existing&&!editable}
                title={date+" "+hour+" · "+label+(editable&&!existing?" · Clic para cambiar":"")}
                aria-label={date+" "+hour+" "+label+(editable&&!existing?", cambiar disponibilidad":"")}
                className={"weekly-cell "+state}
                onClick={()=>existing?setFocused(existing.id):store.toggleSlot(lawyerId,date,hour)}>
                {existing?<><Users size={12}/><span>Cita</span></>:
                  <span>{working?"Libre":!editable?"—":blocked||allBlocked||off?"✕":"+ Abrir"}</span>}
              </button>;
            })}
          </div>;
        })}
      </div>
    </div>
    {pendingBulk&&<div className="weekly-scope-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPendingBulk(null);}}>
      <div role="dialog" aria-modal="true" aria-labelledby="weekly-scope-title" className="weekly-scope-dialog">
        <span className="section-label">ORGANIZAR DISPONIBILIDAD</span>
        <h4 id="weekly-scope-title">{pendingBulk.blocked?"Bloquear":"Habilitar"} {pendingBulk.kind==="hour"?"el horario "+String(pendingBulk.hour).padStart(2,"0")+":00":"el día "+pendingBulk.date}</h4>
        <p>¿Aplicar el cambio solo ahora o repetirlo automáticamente en fechas posteriores?</p>
        <div className="weekly-scope-options" role="radiogroup" aria-label="Alcance del cambio">
          <label className={bulkScope==="once"?"selected":""}><input type="radio" name="bulk-scope" checked={bulkScope==="once"} onChange={()=>setBulkScope("once")}/>
            <strong>{pendingBulk.kind==="hour"?"Solo esta semana":"Solo esta fecha"}</strong><small>El resto de semanas no cambia.</small></label>
          <label className={bulkScope==="future"?"selected":""}><input type="radio" name="bulk-scope" checked={bulkScope==="future"} onChange={()=>setBulkScope("future")}/>
            <strong>{pendingBulk.kind==="hour"?"Esta semana y las próximas":"Este día de la semana, en adelante"}</strong>
            <small>{pendingBulk.kind==="day"?"Ejemplo: descansar todos los lunes a partir de la fecha elegida.":"Repetir automáticamente esta hora cada semana futura."}</small></label>
        </div>
        <p className="weekly-scope-disclaimer">Las citas ya reservadas no se cancelan. Esta recurrencia funciona en la sesión de prueba; todavía requiere backend para guardarse.</p>
        <div className="weekly-scope-actions"><button type="button" onClick={()=>setPendingBulk(null)}>Cancelar</button><button type="button" onClick={applyBulk}>Aplicar cambio</button></div>
      </div>
    </div>}
    <p className="weekly-help"><strong>Verde:</strong> hora habilitada; clic para bloquearla. <strong>Gris (+ Abrir):</strong> hora sin habilitar; clic para ofrecerla individualmente. <strong>✕:</strong> hora bloqueada; clic para liberarla. Las citas existentes no se modifican y las horas pasadas no pueden editarse.</p>
    {focusedBooking&&<div className="weekly-booking-detail" role="region" aria-label="Detalles de la cita seleccionada">
      <div><strong>{users.records.find(u=>u.id===focusedBooking.user_id)?.display_name ?? "Cliente demo"}</strong><p>{focusedBooking.date} · {focusedBooking.hour} · {focusedBooking.modality==="online"?"Videollamada":"Presencial"}</p><small>Estado: {focusedBooking.status==="pending"?"Por confirmar":"Confirmada"}</small></div>
      <div className="weekly-detail-buttons">{focusedBooking.status==="pending"&&<button type="button" onClick={()=>{store.updateStatus(focusedBooking.id,"confirmed");setFocused(null);}}>Confirmar</button>}<button type="button" onClick={()=>{store.updateStatus(focusedBooking.id,"cancelled");setFocused(null);}}>Cancelar cita</button><button type="button" onClick={()=>setFocused(null)}>Cerrar</button></div>
    </div>}
    <div className="weekly-summary"><Clock3 size={16}/> Horario habitual: {String(profile.startHour).padStart(2,"0")}:00–{String(profile.endHour).padStart(2,"0")}:00. Puedes modificarlo desde <strong>Configuración</strong>.</div>
  </section>;
}
