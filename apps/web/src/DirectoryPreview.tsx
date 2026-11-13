import { useMemo, useState } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { LawyerMap } from "./LawyerMap";
import { BookingDemo } from "./BookingDemo";
import { ArrowLeft, ArrowRight, Building2, Filter, Gavel, MapPin, Search, ShieldAlert, SlidersHorizontal, UserRound, Video, X, CalendarDays } from "lucide-react";
import sample from "../../../data/fixtures/lawyers.synthetic.json";
import { specialties } from "./data/specialties";
import { matchSpecialties } from "./lib/matchSpecialties";
import "./directory.css";

type Lawyer = (typeof sample.records)[number];
type Mode = "all" | "online" | "presencial";

/** Only synthetically generated records are shown here.
 * This explorer is never a production directory or a professional verification system.
 */
export function DirectoryPreview({ onClose, initialQuery = "", initialRegion = "" }: { onClose: () => void; initialQuery?: string; initialRegion?: string }) {
  // A colloquial search is translated into its relevant legal area instead of filtering names literally.
  const matchedSpecialty = matchSpecialties(initialQuery)[0]?.id;
  const initialIsLegalQuery = Boolean(initialQuery && matchedSpecialty);
  const [term, setTerm] = useState(initialIsLegalQuery ? "" : initialQuery);
  const [specialty, setSpecialty] = useState(initialIsLegalQuery ? matchedSpecialty : "all");
  const [region, setRegion] = useState(initialRegion || "all");
  const [mode, setMode] = useState<Mode>("all");
  const [maxPrice, setMaxPrice] = useState(1800);
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [limit, setLimit] = useState(9);
  const [display, setDisplay] = useState<"cards"|"map">("cards");
  const [demoReadyOnly,setDemoReadyOnly]=useState(false);
  const [booking,setBooking]=useState<Lawyer|null>(null);

  const filtered = useMemo(() => sample.records.filter(lawyer => {
    const haystack = [lawyer.display_name, lawyer.municipality, ...lawyer.specialties.map(key => specialties.find(s => s.id === key)?.name ?? key)].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    const search = term.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    return (!search || haystack.includes(search))
      && (specialty === "all" || lawyer.specialties.includes(specialty))
      && (region === "all" || lawyer.jurisdictions.includes(region))
      && (mode === "all" || lawyer.consultation_modes.includes(mode))
      && lawyer.consultation_price_mxn_demo <= maxPrice
      && (!demoReadyOnly || lawyer.demo_review.state === "approved_simulation");
  }).sort((a,b)=>Number(b.demo_booking_enabled)-Number(a.demo_booking_enabled)), [term, specialty, region, mode, maxPrice, demoReadyOnly]);
  const visible = filtered.slice(0, limit);
  const reset = () => { setTerm("");setSpecialty("all");setRegion("all");setMode("all");setMaxPrice(1800);setDemoReadyOnly(false);setLimit(9); };

  return <main className="directory-preview" id="directorio-demo">
    <div className="container">
      <button className="directory-back" type="button" onClick={onClose}><ArrowLeft size={17}/> Regresar al inicio</button>
      <div className="directory-intro"><span className="section-label">EXPLORADOR INTERACTIVO · POC</span><h1>Encuentra tu <em>especialista.</em></h1><p>Explora cómo será el directorio de abogados de Legal MX. Filtra por zona, especialidad, modalidad y costo de consulta.</p></div>
      <div className="directory-demo-warning" role="note"><ShieldAlert size={21}/><div><strong>DIRECTORIO DE DEMOSTRACIÓN — 40 PERFILES COMPLETAMENTE FICTICIOS</strong><p>Los perfiles, ubicaciones, años de experiencia y precios son datos sintéticos de prueba. Cinco perfiles tienen una aprobación exclusivamente simulada y una agenda de prueba. Ningún profesional ha sido verificado ante la SEP ni se pueden reservar citas reales.</p></div></div>
      <div className="directory-layout">
        <aside className="directory-filters" aria-label="Filtros del directorio">
          <div className="directory-filter-heading"><SlidersHorizontal size={19}/><h2>Filtrar resultados</h2><button type="button" onClick={reset}>Limpiar</button></div>
          <label className="directory-field">Buscar abogado o zona<div className="directory-search"><Search size={18}/><input value={term} onChange={e => {setTerm(e.target.value);setLimit(9);}} placeholder="Especialidad o municipio" aria-label="Buscar en el directorio"/></div></label>
          <label className="directory-field">Especialidad<select value={specialty} onChange={e=>{setSpecialty(e.target.value);setLimit(9);}}><option value="all">Todas las especialidades</option>{specialties.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
          <label className="directory-field">Ubicación<select value={region} onChange={e=>{setRegion(e.target.value);setLimit(9);}}><option value="all">CDMX y Estado de México</option><option value="CDMX">Ciudad de México</option><option value="EDOMEX">Estado de México</option></select></label>
          <fieldset className="directory-field directory-fieldset"><legend>Tipo de consulta</legend>{([["all","Cualquiera"],["online","Videollamada"],["presencial","Presencial"]] as const).map(([key,label])=><label key={key}><input type="radio" name="directory-mode" checked={mode===key} onChange={()=>{setMode(key);setLimit(9);}}/>{label}</label>)}</fieldset>
          <label className="directory-demo-ready"><input type="checkbox" checked={demoReadyOnly} onChange={e=>{setDemoReadyOnly(e.target.checked);setLimit(9);}}/> Mostrar únicamente los 5 perfiles con agenda demo</label>
          <label className="directory-field">Precio máximo de demostración <strong>${maxPrice.toLocaleString("es-MX")} MXN</strong><input type="range" min="450" max="1800" step="150" value={maxPrice} onChange={e=>{setMaxPrice(Number(e.target.value));setLimit(9);}}/></label>
        </aside>
        <section className="directory-results" aria-label="Abogados ficticios">
          <div className="directory-result-header"><div><strong>{filtered.length} perfiles de prueba</strong><p>Coincidencias según los filtros seleccionados</p></div><div className="directory-view-tools"><span className="directory-tag"><Filter size={15}/> Solo demostración</span><div className="directory-switch" role="group" aria-label="Visualización de resultados"><button type="button" aria-pressed={display==="cards"} className={display==="cards"?"active":""} onClick={()=>setDisplay("cards")}><LayoutGrid size={16}/> Lista</button><button type="button" aria-pressed={display==="map"} className={display==="map"?"active":""} onClick={()=>setDisplay("map")}><MapIcon size={16}/> Mapa</button></div></div></div>
          {display==="map" ? <LawyerMap profiles={filtered} onSelect={(id)=>setSelected(sample.records.find(x=>x.id===id) ?? null)} /> : filtered.length===0 ? <div className="directory-empty"><Search size={28}/><h3>No hay coincidencias</h3><p>Prueba cambiar la especialidad, la ubicación o el precio.</p><button onClick={reset} type="button">Restablecer filtros</button></div> :
          <div className="directory-cards">{visible.map(lawyer=><article key={lawyer.id} className="directory-card">
            <div className="directory-card-top"><div className="directory-avatar"><UserRound size={33}/></div><div><span className={lawyer.demo_booking_enabled?"directory-small-tag demo-approved-tag":"directory-small-tag"}>{lawyer.demo_booking_enabled?"EXPEDIENTE APROBADO EN POC · NO OFICIAL":"PERFIL SINTÉTICO · SIN VERIFICAR"}</span><h3>{lawyer.display_name}</h3><p><MapPin size={14}/> {lawyer.municipality}, {lawyer.jurisdictions[0]==="CDMX"?"CDMX":"Edomex"}</p></div></div>
            <div className="directory-tags">{lawyer.specialties.map(s=><span key={s}>{specialties.find(a=>a.id===s)?.name ?? s}</span>)}</div>
            <div className="directory-meta"><span><Gavel size={15}/> {lawyer.years_experience_demo} años (demo)</span><span>{lawyer.consultation_modes.includes("online")?<Video size={15}/>:<Building2 size={15}/>} {lawyer.consultation_modes.length===2?"Video y presencial":lawyer.consultation_modes[0]==="online"?"Videollamada":"Presencial"}</span></div>
            <div className="directory-card-foot"><div><small>Consulta estimada · demo</small><strong>${lawyer.consultation_price_mxn_demo.toLocaleString("es-MX")} MXN</strong></div><div className="directory-card-buttons"><button type="button" onClick={()=>setSelected(lawyer)}>Ver perfil <ArrowRight size={16}/></button>{lawyer.demo_booking_enabled&&<button type="button" className="directory-book-button" onClick={()=>setBooking(lawyer)}>Agenda demo <CalendarDays size={15}/></button>}</div></div>
          </article>)}</div>}
          {display==="cards"&&filtered.length>limit&&<button className="directory-more" type="button" onClick={()=>setLimit(v=>v+9)}>Mostrar más perfiles ({filtered.length-limit} restantes)</button>}
        </section>
      </div>
    </div>
    {selected&&<div className="directory-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null);}}><section className="directory-modal" role="dialog" aria-modal="true" aria-labelledby="directory-modal-title"><button className="directory-modal-close" type="button" aria-label="Cerrar perfil" onClick={()=>setSelected(null)}><X size={22}/></button><div className="directory-avatar large"><UserRound size={42}/></div><span className="directory-small-tag">{selected.demo_booking_enabled?"VALIDADO SOLAMENTE EN LA POC · SIN ACREDITACIÓN REAL":"FICCIÓN · NO ES UN PROFESIONAL REAL"}</span><h2 id="directory-modal-title">{selected.display_name}</h2><p><MapPin size={15}/> {selected.municipality}</p><div className="directory-tags">{selected.specialties.map(s=><span key={s}>{specialties.find(a=>a.id===s)?.name ?? s}</span>)}</div><div className="directory-profile-info"><p><strong>Experiencia ficticia:</strong> {selected.years_experience_demo} años</p><p><strong>Atención:</strong> {selected.consultation_modes.join(", ").replace("online","videollamada")}</p><p><strong>Consulta simulada:</strong> ${selected.consultation_price_mxn_demo.toLocaleString("es-MX")} MXN</p><p><strong>Cédula:</strong> no registrada · no verificada</p><p><strong>Expediente:</strong> {selected.demo_booking_enabled?"Aprobado únicamente en simulación":"Pendiente de simulación"}</p></div><div className="directory-demo-warning"><ShieldAlert size={20}/><span>La reserva de citas estará disponible cuando incorporemos profesionales reales y un backend seguro.</span></div>{selected.demo_booking_enabled&&<button className="directory-modal-done" type="button" onClick={()=>{setBooking(selected);setSelected(null);}}>Probar agenda de este abogado</button>}<button className="directory-modal-done directory-modal-secondary" type="button" onClick={()=>setSelected(null)}>Cerrar vista previa</button></section></div>}
    {booking&&<BookingDemo lawyer={booking} onClose={()=>setBooking(null)}/>}
  </main>;
}
