import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, CheckCircle2, Clock3, ShieldAlert, Video, X } from "lucide-react";
import users from "../../../data/fixtures/users.synthetic.json";
import { useDemoStore, type Mode } from "./DemoStore";
import { DAY_HOURS, makeDemoSlots, upcomingWeekStart, weekDates, weekdayUtc, type DemoLawyer } from "./lib/scheduling";
import "./booking-demo.css";

export { makeDemoSlots };
export type { DemoLawyer };

const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const shiftWeek = (date: string, amount: number) =>
  new Date(new Date(date + "T12:00:00Z").getTime() + amount * 7 * 86400000).toISOString().slice(0, 10);
const dayNumber = (date: string) => new Date(date + "T12:00:00Z").getUTCDate();

/** Customer-facing booking: one DAY per column and one HOUR per row.
 * Only lawyer-enabled, genuinely free demo hours are interactive.
 * No client-side access or booking constitutes real authentication.
 */
export function BookingDemo({ lawyer, onClose, initialUserId = "demo-user-026" }: {
  lawyer: DemoLawyer; onClose: () => void; initialUserId?: string;
}) {
  const store = useDemoStore();
  const profile = store.profiles[lawyer.id];
  const [modality, setModality] = useState<Mode>(profile.modes[0]);
  const [userId, setUserId] = useState(initialUserId);
  const [week, setWeek] = useState(upcomingWeekStart);
  const [selected, setSelected] = useState<{ date: string; hour: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const days = useMemo(() => weekDates(week), [week]);

  // Display only hours the professional has explicitly enabled in their settings.
  const workingHours = DAY_HOURS.filter(hour => {
    const h = Number(hour.slice(0, 2));
    return h >= profile.startHour && h < profile.endHour
      && !(store.weeklyBlockedHours[lawyer.id] ?? []).includes(h);
  });
  const hasFree = (date: string, hour: string) => !store.isUnavailable(lawyer.id, date, hour);
  const availableCount = days.reduce((n, date) =>
    n + workingHours.filter(hour => hasFree(date, hour)).length, 0);
  const selectedStillFree = selected !== null && hasFree(selected.date, selected.hour);
  const submit = () => {
    if (!selected || !selectedStillFree || !profile.modes.includes(modality)
      || !store.book(lawyer.id, userId, selected.date, selected.hour, modality)) {
      setError("Ese horario ya no está disponible. Selecciona otro.");
      setSelected(null);
      return;
    }
    setConfirmed(true);
    setError("");
  };
  const changeWeek = (amount: number) => {
    const next = shiftWeek(week, amount);
    if (next < upcomingWeekStart()) return;
    setWeek(next);
    setSelected(null);
    setError("");
  };
  return <div className="demo-book-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="demo-book-modal demo-book-modal-weekly" role="dialog" aria-modal="true" aria-labelledby="book-title">
      <button type="button" className="demo-book-close" aria-label="Cerrar agenda" onClick={onClose}><X size={19} /></button>
      <span className="demo-book-kicker">AGENDA SEMANAL · RESERVA DE DEMOSTRACIÓN</span>
      <h2 id="book-title">Agendar con {lawyer.display_name}</h2>
      <p className="demo-book-muted">Una columna por día y una fila por hora. Solo los horarios libres que el abogado habilitó se pueden seleccionar.</p>
      <div className="demo-book-warning"><ShieldAlert size={18}/> Todos los perfiles, horarios y clientes son ficticios. No se realiza ninguna reserva, pago o verificación profesional real.</div>
      {confirmed ? <div className="demo-book-success" role="status">
        <CheckCircle2 size={32}/><h3>Solicitud guardada en esta sesión de prueba</h3>
        <p>{selected?.date} a las {selected?.hour} · {modality === "online" ? "Videollamada" : "Presencial"}. Quedó como pendiente en el panel del abogado. Se pierde al recargar la página.</p>
        <button className="demo-book-primary" type="button" onClick={onClose}>Cerrar</button>
      </div> : <>
        <div className="demo-book-fields">
          <label className="book-demo-label">Cliente ficticio
            <select value={userId} onChange={e => setUserId(e.target.value)}>
              {users.records.map(u => <option value={u.id} key={u.id}>{u.display_name}</option>)}
            </select>
          </label>
          <div className="demo-book-modality"><strong>Modalidad</strong><div className="demo-book-modes">
            {profile.modes.map(m => <button type="button" key={m} className={modality === m ? "active" : ""} aria-pressed={modality === m} onClick={() => setModality(m)}>
              {m === "online" ? <Video size={16}/> : <Building2 size={16}/>} {m === "online" ? "Videollamada" : "Presencial"}
            </button>)}
          </div></div>
        </div>
        <div className="demo-book-week-nav">
          <div><strong>Selecciona un horario</strong><small>Horario de Ciudad de México · {availableCount} espacios libres esta semana</small></div>
          <div className="demo-book-week-actions">
            <button type="button" aria-label="Semana anterior" disabled={week <= upcomingWeekStart()} onClick={() => changeWeek(-1)}><ArrowLeft size={16}/></button>
            <span>{days[0].slice(5)} — {days[6].slice(5)}</span>
            <button type="button" aria-label="Semana siguiente" onClick={() => changeWeek(1)}><ArrowRight size={16}/></button>
          </div>
        </div>
        <div className="demo-book-calendar-scroll" role="region" aria-label="Calendario semanal de citas" tabIndex={0}>
          <div className="demo-book-calendar">
            <div className="demo-book-calendar-corner">Hora</div>
            {days.map(date => <div className={"demo-book-day-head"+(weekdayUtc(date) === 0 || weekdayUtc(date) === 6 ? " weekend" : "")} key={date}>
              <span>{weekdays[weekdayUtc(date)]}</span><strong>{dayNumber(date)}</strong>
            </div>)}
            {workingHours.map(hour => <div className="demo-book-hour-row" key={hour}>
              <div className="demo-book-hour-label"><Clock3 size={13}/>{hour}</div>
              {days.map(date => {
                const free = hasFree(date, hour);
                const active = selected?.date === date && selected?.hour === hour;
                return <button key={date + hour} type="button" disabled={!free}
                  aria-label={date + " a las " + hour + (free ? " disponible" : " no disponible")}
                  aria-pressed={active} className={"demo-book-hour-cell " + (active ? "selected" : free ? "free" : "unavailable")}
                  onClick={() => { setSelected({date, hour}); setError(""); }}>
                  {active ? <><CheckCircle2 size={15}/><span>Elegido</span></> : free ? "Disponible" : "—"}
                </button>;
              })}
            </div>)}
          </div>
        </div>
        {workingHours.length === 0 ? <p className="demo-book-empty">El abogado no tiene horas habilitadas. Revisa su configuración.</p> :
          availableCount === 0 ? <p className="demo-book-empty">No quedan horarios libres esta semana. Utiliza la flecha para consultar la próxima.</p> : null}
        <div className="demo-book-selected">
          <div>{selected && selectedStillFree ? <><CalendarDays size={18}/><strong>{selected.date} · {selected.hour}</strong></> : <span>Selecciona una celda disponible del calendario</span>}</div>
          <div><small>Consulta ficticia</small><strong>${profile.price.toLocaleString("es-MX")} MXN</strong></div>
        </div>
        {error && <p role="alert" className="demo-book-error">{error}</p>}
        <button type="button" className="demo-book-primary" disabled={!selectedStillFree} onClick={submit}>Solicitar cita ficticia</button>
      </>}
    </section>
  </div>;
}
