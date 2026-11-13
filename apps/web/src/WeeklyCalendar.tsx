import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Lock, Unlock, Users, CheckSquare, Square, X } from "lucide-react";
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
  const [pendingBulk,setPendingBulk]=useState<{kind:"hour"|"day"|"multi"|"cell";hour?:number;date?:string;hours?:number[];dates?:string[];blocked:boolean}|null>(null);
  const [selectMode,setSelectMode]=useState(false);
  const [selectedHours,setSelectedHours]=useState<number[]>([]);
  const [selectedDates,setSelectedDates]=useState<string[]>([]);
  const [bulkScope,setBulkScope]=useState<"once"|"future">("once");
  const scrollRef=useRef<HTMLDivElement|null>(null);
  const dates=useMemo(()=>weekDates(week),[week]);
  const bookings=store.appointments.filter(a=>a.lawyer_id===lawyerId&&a.status!=="cancelled");
  const profile=store.profiles[lawyerId];
  const [focused,setFocused]=useState<string|null>(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=7*53;},[lawyerId]);
  useEffect(()=>{setSelectedHours([]);setSelectedDates([]);setSelectMode(false);},[lawyerId,week]);
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
  const showBulk=(item:{kind:"hour"|"day"|"multi";hour?:number;date?:string;hours?:number[];dates?:string[];blocked:boolean})=>{
    setBulkScope("once");setPendingBulk(item);
  };
  const toggleHourSelection=(hour:number)=>setSelectedHours(prev=>prev.includes(hour)?prev.filter(x=>x!==hour):[...prev,hour]);
  const toggleDateSelection=(date:string)=>setSelectedDates(prev=>prev.includes(date)?prev.filter(x=>x!==date):[...prev,date]);
  const openMultiDialog=(blocked:boolean)=>{
    if(!selectedHours.length&&!selectedDates.length)return;
    showBulk({kind:"multi",hours:selectedHours,dates:selectedDates,blocked});
  };
  const applyBulk=()=>{
    if(!pendingBulk)return;
    if(pendingBulk.kind==="cell"&&pendingBulk.date&&pendingBulk.hour!==undefined){
      if(bulkScope==="future")store.setCellRepeat(lawyerId,pendingBulk.date,String(pendingBulk.hour).padStart(2,"0")+":00",pendingBulk.blocked);
      else if(store.isWorkingSlot(lawyerId,pendingBulk.date,String(pendingBulk.hour).padStart(2,"0")+":00")===pendingBulk.blocked)store.toggleSlot(lawyerId,pendingBulk.date,String(pendingBulk.hour).padStart(2,"0")+":00");
    }else if(pendingBulk.kind==="multi"){
      // One confirmation applies all selected rows and columns in one action.
      // Rows apply across the whole week; columns apply to their selected dates.
      // Opening rows preserves any previously closed weekday.
      for(const date of pendingBulk.dates??[]){
        store.setDayScope(lawyerId,date,bulkScope,pendingBulk.blocked);
      }
      for(const hour of pendingBulk.hours??[]){
        store.setRowScope(lawyerId,hour,dates,bulkScope==="future"?"future":"week",pendingBulk.blocked);
      }
      setSelectedHours([]);setSelectedDates([]);setSelectMode(false);
    }else if(pendingBulk.kind==="hour"&&pendingBulk.hour!==undefined){
      store.setRowScope(lawyerId,pendingBulk.hour,dates,bulkScope==="future"?"future":"week",pendingBulk.blocked);
    }else if(pendingBulk.date){
      store.setDayScope(lawyerId,pendingBulk.date,bulkScope,pendingBulk.blocked);
    }
    setPendingBulk(null);
  };
  const canEdit=(date:string)=>date>getMexicoToday();
  return <section className="weekly-panel" aria-label="Agenda semanal con siete días">
    <div className="weekly-topbar"><div><span className="section-label">AGENDA SEMANAL · 7 DÍAS</span><h3>Tu semana de un vistazo</h3><p>Todas las horas futuras comienzan libres. Bloquea con un clic y utiliza Repetir para aplicar el bloqueo cada semana.</p></div><div className="weekly-nav"><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,-1))} aria-label="Semana anterior"><ArrowLeft size={17}/></button><span>{dates[0].slice(5)} — {dates[6].slice(5)}<small>CDMX</small></span><button type="button" onClick={()=>setWeek(v=>shiftWeek(v,1))} aria-label="Semana siguiente"><ArrowRight size={17}/></button><button type="button" className="weekly-today" onClick={()=>setWeek(nextFutureWeekStart())}>Próxima semana</button></div></div>
    <div className="weekly-kpis"><span><CalendarDays size={15}/> {bookedCount} citas esta semana</span><span className="weekly-kpi-free"><span/> Horario disponible</span><span className="weekly-kpi-booked"><span/> Reservado</span><span className="weekly-kpi-closed"><span/> Bloqueado</span></div>
    <div className="weekly-multi-toolbar">
      <button className={selectMode?"weekly-select-toggle active":"weekly-select-toggle"} type="button" aria-pressed={selectMode} onClick={()=>{setSelectMode(v=>!v);setSelectedHours([]);setSelectedDates([]);}}>
        {selectMode?<CheckSquare size={17}/>:<Square size={17}/>} Selección múltiple
      </button>
      {selectMode&&<>
        <span className="weekly-selection-count">{selectedHours.length} filas · {selectedDates.length} días</span>
        <button type="button" className="weekly-select-all" onClick={()=>setSelectedHours(DAY_HOURS.map(h=>Number(h.slice(0,2))))}>Todas las horas</button>
        <button type="button" className="weekly-select-all" onClick={()=>setSelectedDates(dates.filter(canEdit))}>Todos los días</button>
        <button type="button" className="weekly-select-clear" onClick={()=>{setSelectedHours([]);setSelectedDates([]);}}><X size={13}/> Limpiar</button>
        <button type="button" className="weekly-bulk-open" disabled={!selectedHours.length&&!selectedDates.length} onClick={()=>openMultiDialog(false)}>Liberar selección</button>
        <button type="button" className="weekly-bulk-close" disabled={!selectedHours.length&&!selectedDates.length} onClick={()=>openMultiDialog(true)}>Bloquear selección</button>
      </>}
    </div>
    <p className="weekly-selection-help">{selectMode?"Marca las horas en la primera columna y los días en la cabecera. Confirma todo con un solo formulario.":"Activa Selección múltiple para editar varios días y horarios de una vez."}</p>
    <div className="weekly-scroll" ref={scrollRef}>
      <div className="weekly-grid" role="grid" aria-label="Disponibilidad del abogado de lunes a domingo">
        <div className="weekly-corner" role="columnheader">Hora <small>{selectMode?"Seleccionar filas":"Bloquear fila"}</small></div>
        {dates.map(date=><div className="weekly-day-head" role="columnheader" key={date}>
          <span>{labels[weekdayUtc(date)]} <strong>{dateLabel(date)}</strong></span>
          {selectMode&&<label className="weekly-header-check" title={"Seleccionar "+date}><input type="checkbox" checked={selectedDates.includes(date)} disabled={!canEdit(date)} onChange={()=>toggleDateSelection(date)}/> Seleccionar</label>}
          <button type="button" title="Activar o quitar descanso completo" aria-label={(hasLeave(date)?"Quitar descanso ":"Marcar descanso ")+date} className={hasLeave(date)?"weekly-day-off active":"weekly-day-off"} disabled={!canEdit(date)} onClick={()=>selectMode?toggleDateSelection(date):showBulk({kind:"day",date,blocked:!hasLeave(date)})}>{hasLeave(date)?<Lock size={12}/>:<Unlock size={12}/>} <span>{hasLeave(date)?"Descanso":"Descansar"}</span></button>
        </div>)}
        {DAY_HOURS.map(hour=>{
          const h=Number(hour.slice(0,2));
          const allBlocked=isHourRecurringBlocked(h) || dates.filter(canEdit).every(date=>store.blocked.some(b=>b.lawyerId===lawyerId&&b.hour===hour&&b.date===date));
          return <div className="weekly-hour-row" role="row" key={hour}>
            <button type="button" className={(allBlocked?"weekly-hour-label all-blocked":"weekly-hour-label")+(selectedHours.includes(h)?" selected-hour":"")} title={(allBlocked?"Desbloquear":"Bloquear")+" esta hora todos los días de la semana"} onClick={()=>selectMode?toggleHourSelection(h):showBulk({kind:"hour",hour:h,blocked:!allBlocked})}>
              <strong>{hour}</strong><small>{selectMode?(selectedHours.includes(h)?"Seleccionada":"Seleccionar fila"):(allBlocked?"Fila bloqueada":"Bloquear fila")}</small>{selectMode?(selectedHours.includes(h)?<CheckSquare size={14}/>:<Square size={14}/>):allBlocked?<Lock size={12}/>:<Unlock size={12}/>}
            </button>
            {dates.map(date=>{
              const existing=isBooked(date,hour);
              const blocked=isManualBlock(date,hour);
              const off=hasLeave(date)||(store.daysOff[lawyerId]??[]).includes(weekdayUtc(date));
              const working=store.isWorkingSlot(lawyerId,date,hour);
              const editable=canEdit(date);
              const state=existing?"booked":!editable?"past":working?"available":"blocked";
              const label=existing?"Cita":!editable?"Pasado":working?"Libre":"Bloqueado";
              const repeating=latestRule(store.recurringCells.filter(rule=>rule.lawyerId===lawyerId&&rule.weekday===weekdayUtc(date)&&rule.hour===h),date)?.blocked===true;
              return <div role="gridcell" key={date+hour} className={"weekly-slot-wrap "+state+(selectedHours.includes(h)||selectedDates.includes(date)?" multi-highlight":"")}>
                <button type="button"
                  disabled={!existing&&!editable}
                  aria-label={date+" "+hour+" "+label}
                  className={"weekly-cell "+state}
                  onClick={()=>existing?setFocused(existing.id):store.toggleSlot(lawyerId,date,hour)}>
                  {existing?<><Users size={12}/><span>Cita</span></>:<span>{!editable?"—":working?"Libre":"✕"}</span>}
                </button>
                {!existing&&editable&&!working&&<button type="button" className="weekly-repeat-chip"
                    aria-label={"Repetir el bloqueo de "+date+" a las "+hour+" cada semana"}
                    onClick={()=>showBulk({kind:"cell",date,hour:h,blocked:true})}>{repeating?"Recurrente":"Repetir"}</button>}
              </div>;
            })}
          </div>;
        })}
      </div>
    </div>
    {pendingBulk&&<div className="weekly-scope-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPendingBulk(null);}}>
      <div role="dialog" aria-modal="true" aria-labelledby="weekly-scope-title" className="weekly-scope-dialog">
        <span className="section-label">ORGANIZAR DISPONIBILIDAD</span>
        <h4 id="weekly-scope-title">{pendingBulk.blocked?"Bloquear":"Habilitar"} {pendingBulk.kind==="cell"?("la hora "+String(pendingBulk.hour).padStart(2,"0")+":00 del "+pendingBulk.date):pendingBulk.kind==="multi"?(pendingBulk.hours?.length??0)+" filas y "+(pendingBulk.dates?.length??0)+" días":pendingBulk.kind==="hour"?"el horario "+String(pendingBulk.hour).padStart(2,"0")+":00":"el día "+pendingBulk.date}</h4>
        <p>¿Aplicar el cambio solo ahora o repetirlo automáticamente en fechas posteriores?</p>
        <div className="weekly-scope-options" role="radiogroup" aria-label="Alcance del cambio">
          <label className={bulkScope==="once"?"selected":""}><input type="radio" name="bulk-scope" checked={bulkScope==="once"} onChange={()=>setBulkScope("once")}/>
            <strong>{pendingBulk.kind==="cell"?"Solo esta vez":pendingBulk.kind==="day"?"Solo esta fecha":"Solo esta semana"}</strong><small>El resto de semanas no cambia.</small></label>
          <label className={bulkScope==="future"?"selected":""}><input type="radio" name="bulk-scope" checked={bulkScope==="future"} onChange={()=>setBulkScope("future")}/>
            <strong>{pendingBulk.kind==="cell"?"Cada semana, misma hora":pendingBulk.kind==="day"?"Este día de la semana, en adelante":"Esta semana y las próximas"}</strong>
            <small>{pendingBulk.kind==="cell"?"Bloquear la misma hora y día de semana en adelante.":pendingBulk.kind==="day"?"Ejemplo: descansar todos los lunes a partir de la fecha elegida.":"Aplicar las filas y días elegidos en semanas futuras."}</small></label>
        </div>
        <p className="weekly-scope-disclaimer">Las citas ya reservadas no se cancelan. Esta recurrencia funciona en la sesión de prueba; todavía requiere backend para guardarse.</p>
        <div className="weekly-scope-actions"><button type="button" onClick={()=>setPendingBulk(null)}>Cancelar</button><button type="button" onClick={applyBulk}>Aplicar cambio</button></div>
      </div>
    </div>}
    <p className="weekly-help"><strong>Verde:</strong> hora habilitada; clic para bloquearla. <strong>✕:</strong> hora bloqueada; clic para liberarla. Usa <strong>Repetir</strong> dentro del recuadro para aplicarlo cada semana. Las citas existentes no se modifican y las horas pasadas no pueden editarse.</p>
    {focusedBooking&&<div className="weekly-scope-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setFocused(null);}}>
      <section role="dialog" aria-modal="true" aria-labelledby="weekly-appointment-title" className="weekly-scope-dialog weekly-appointment-dialog">
        <div className="weekly-appointment-heading"><span className="section-label">DETALLE DE CITA · DATOS FICTICIOS</span>
          <button type="button" aria-label="Cerrar detalle" className="weekly-appointment-x" onClick={()=>setFocused(null)}><X size={19}/></button></div>
        <h4 id="weekly-appointment-title">{users.records.find(u=>u.id===focusedBooking.user_id)?.display_name ?? "Cliente de prueba"}</h4>
        <div className="weekly-appointment-data">
          <p><strong>Fecha:</strong> {focusedBooking.date}</p>
          <p><strong>Hora:</strong> {focusedBooking.hour} (CDMX)</p>
          <p><strong>Modalidad:</strong> {focusedBooking.modality==="online"?"Videollamada":"Presencial"}</p>
          <p><strong>Estado:</strong> {focusedBooking.status==="pending"?"Por confirmar":"Confirmada"}</p>
        </div>
        <p className="weekly-scope-disclaimer">Esta es una cita simulada. Cancelarla solo modifica los datos de la sesión actual.</p>
        <div className="weekly-scope-actions">
          <button type="button" onClick={()=>setFocused(null)}>Cerrar</button>
          {focusedBooking.status==="pending"&&<button type="button" onClick={()=>{store.updateStatus(focusedBooking.id,"confirmed");setFocused(null);}}>Confirmar</button>}
          <button type="button" className="weekly-cancel-appointment" onClick={()=>{store.updateStatus(focusedBooking.id,"cancelled");setFocused(null);}}>Cancelar cita</button>
        </div>
      </section>
    </div>}
    <div className="weekly-summary"><Clock3 size={16}/> Horario habitual: {String(profile.startHour).padStart(2,"0")}:00–{String(profile.endHour).padStart(2,"0")}:00. Puedes modificarlo desde <strong>Configuración</strong>.</div>
  </section>;
}
