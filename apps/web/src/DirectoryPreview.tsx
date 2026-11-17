import { HuellaIcon } from "./HuellaIcon";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { LawyerMap } from "./LawyerMap";
import { BookingDemo } from "./BookingDemo";
import { useDemoStore } from "./DemoStore";
import { ArrowLeft, ArrowRight, Building2, Filter, Stethoscope, MapPin, Search, ShieldAlert, SlidersHorizontal, Video, X, CalendarDays } from "lucide-react";
import sample from "../../../data/fixtures/veterinarians.synthetic.json";
import { specialties } from "./data/specialties";
import { companionAnimalCategories, treatsAnimalCategory } from "./data/animalCategories";
import { matchSpecialties } from "./lib/matchSpecialties";
import { getMexicoNow } from "./lib/scheduling";
import { hasAvailabilityToday } from "./lib/availabilityToday";
import "./directory.css";

type Lawyer = (typeof sample.records)[number];
type Mode = "all" | "online" | "presencial";

/** Only synthetically generated records are shown here.
 * This explorer is never a production directory or a professional verification system.
 */
export function DirectoryPreview({ onClose, initialQuery = "", initialRegion = "" }: { onClose: () => void; initialQuery?: string; initialRegion?: string }) {
  // A colloquial query is mapped to a relevant veterinary service category.
  const matchedSpecialty = matchSpecialties(initialQuery)[0]?.id;
  const initialSpecies = ({perro:"perros",gato:"gatos",conejo:"conejos"} as Record<string,string>)[initialQuery.trim().toLowerCase()];
  const initialIsVetQuery = Boolean(initialQuery && matchedSpecialty);
  const store=useDemoStore();
  const [term, setTerm] = useState(initialIsVetQuery || initialSpecies ? "" : initialQuery);
  const [draftTerm,setDraftTerm] = useState(initialIsVetQuery || initialSpecies ? "" : initialQuery);
  const [specialty, setSpecialty] = useState(initialIsVetQuery ? matchedSpecialty : "all");
  const [region, setRegion] = useState(initialRegion || "all");
  const [mode, setMode] = useState<Mode>("all");
  const [species,setSpecies]=useState(initialSpecies || "all");
  // Values come from the records actually searchable in this prototype.
  // They are real veterinary service/species categories, NOT verified professionals or market prices.
  // All approved categories remain selectable, including categories without demo records.
  const speciesOptions=companionAnimalCategories;
  const specialtyOptions=specialties;
  const prices=Object.values(store.profiles).map(p=>p.price);
  const priceMin=Math.floor(Math.min(...prices)/50)*50;
  const priceMax=Math.ceil(Math.max(...prices)/50)*50;
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const [clock,setClock]=useState(getMexicoNow);
  // Recheck "today" as local hours pass while a visitor keeps the directory open.
  useEffect(()=>{
    const id=window.setInterval(()=>setClock(getMexicoNow()),60000);
    return ()=>window.clearInterval(id);
  },[]);
  const [todayOnly,setTodayOnly]=useState(false);
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [limit, setLimit] = useState(9);
  const [display, setDisplay] = useState<"cards"|"map">("map");
  const [booking,setBooking]=useState<Lawyer|null>(null);

  const filtered = useMemo(() => sample.records.filter(lawyer => {
    const haystack = [lawyer.display_name, lawyer.municipality, ...lawyer.specialties.map(key => specialties.find(s => s.id === key)?.name ?? key)].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    const search = term.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    return (!search || haystack.includes(search))
      && (specialty === "all" || lawyer.specialties.includes(specialty))
      && treatsAnimalCategory(lawyer.species_treated,species)
      && (region === "all" || lawyer.jurisdictions.includes(region))
      && (mode === "all" || store.profiles[lawyer.id]?.modes.includes(mode))
      && (store.profiles[lawyer.id]?.price ?? lawyer.consultation_price_mxn_demo) <= maxPrice
      && (!todayOnly || hasAvailabilityToday({
        profileId:lawyer.id, bookingEnabled:lawyer.demo_booking_enabled,
        schedule:store.profiles[lawyer.id], clock,
        isUnavailable:store.isUnavailable
      }));
  }).sort((a,b)=>Number(b.demo_booking_enabled)-Number(a.demo_booking_enabled)), [term, specialty, species, region, mode, maxPrice, todayOnly, clock, store.profiles, store.appointments, store.blocked, store.enabledSlots, store.leaves, store.daysOff, store.weeklyBlockedHours, store.recurringHours, store.recurringDays, store.recurringCells]);
  const visible = filtered.slice(0, limit);
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next=draftTerm.trim();
    const matched=matchSpecialties(next)[0]?.id;
    setTerm(matched ? "" : next);
    setSpecialty(matched || "all");
    setLimit(9);
    setDisplay("map");
  };
  const reset = () => { setDraftTerm("");setTerm("");setSpecialty("all");setSpecies("all");setRegion("all");setMode("all");setMaxPrice(priceMax);setTodayOnly(false);setLimit(9); };

  return <main className="directory-preview" id="directorio-veterinario">
    <div className="container">
      <button className="directory-back" type="button" onClick={onClose}><ArrowLeft size={17}/> Regresar al inicio</button>
      <div className="directory-intro hv-directory-cover"><div><span className="section-label">UNIVERSO HUELLAVET · EXPLORA Y CONECTA</span><h1>Su próximo gran cuidado <em>comienza aquí.</em></h1><p>Porque cada mascota es única. Descubre profesionales por su experiencia, las especies que atienden y la forma en que trabajan.</p></div><div className="hv-directory-cover-mark"><HuellaIcon size={88} strokeWidth={1.2}/><span>un mundo de cuidados</span></div></div>
      <div className="directory-demo-warning" role="note"><ShieldAlert size={21}/><div><strong>Aviso de pruebas: perfiles ficticios</strong><p>Los médicos, ubicaciones, experiencias y precios son datos sintéticos de prueba. Cinco perfiles cuentan con agenda ficticia. Ningún médico veterinario ha sido verificado ante la SEP y no existen consultas ni clínicas reales.</p></div></div>
      <div className="directory-layout">
        <aside className="directory-filters hv-filter-dock" aria-label="Filtros del directorio">
          <div className="directory-filter-heading"><SlidersHorizontal size={19}/><h2>Filtrar resultados</h2><button type="button" onClick={reset}>Limpiar</button></div>
          <form className="directory-field hv-search-field" role="search" onSubmit={submitSearch}><label htmlFor="directory-search-input">Buscar veterinario o zona</label><div className="directory-search"><Search size={18}/><input id="directory-search-input" value={draftTerm} onChange={e => setDraftTerm(e.target.value)} placeholder="Ej. vacunas, dermatología o Naucalpan" aria-label="Buscar en el directorio"/></div><button type="submit" className="hv-filter-submit"><Search size={17}/> Buscar en el mapa</button></form>
          <label className="directory-field">Área de atención veterinaria<select value={specialty} onChange={e=>{setSpecialty(e.target.value);setLimit(9);}}><option value="all">Todas las áreas de atención</option>{specialtyOptions.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
          <label className="directory-field">Especie atendida<select value={species} onChange={e=>{setSpecies(e.target.value);setLimit(9);}}><option value="all">Todas las mascotas</option>{speciesOptions.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="directory-field">Ubicación<select value={region} onChange={e=>{setRegion(e.target.value);setLimit(9);}}><option value="all">CDMX y Estado de México</option><option value="CDMX">Ciudad de México</option><option value="EDOMEX">Estado de México</option></select></label>
          <fieldset className="directory-field directory-fieldset"><legend>Tipo de consulta</legend>{([["all","Cualquiera"],["online","Videollamada"],["presencial","Presencial"]] as const).map(([key,label])=><label key={key}><input type="radio" name="directory-mode" checked={mode===key} onChange={()=>{setMode(key);setLimit(9);}}/>{label}</label>)}</fieldset>
          <label className="directory-demo-ready"><input type="checkbox" checked={todayOnly} onChange={e=>{setTodayOnly(e.target.checked);setClock(getMexicoNow());setLimit(9);}}/> Con disponibilidad hoy</label>
          <label className="directory-field">Precio máximo de consulta de prueba <strong>${maxPrice.toLocaleString("es-MX")} MXN</strong><input type="range" min={priceMin} max={priceMax} step="50" value={maxPrice} onChange={e=>{setMaxPrice(Number(e.target.value));setLimit(9);}}/></label>
        </aside>
        <section className="directory-results hv-vet-results" aria-label="Médicos veterinarios ficticios">
          <div className="directory-result-header"><div><strong>{filtered.length} perfiles de prueba</strong><p>Coincidencias según los filtros seleccionados{todayOnly ? " · Horarios libres hoy (CDMX, simulados)" : ""}</p></div><div className="directory-view-tools"><span className="directory-tag"><Filter size={15}/> Datos de prueba</span><div className="directory-switch" role="group" aria-label="Visualización de resultados"><button type="button" aria-pressed={display==="map"} className={display==="map"?"active":""} onClick={()=>setDisplay("map")}><MapIcon size={16}/> Mapa</button><button type="button" aria-pressed={display==="cards"} className={display==="cards"?"active":""} onClick={()=>setDisplay("cards")}><LayoutGrid size={16}/> Lista</button></div></div></div>
          {display==="map" ? <LawyerMap profiles={filtered} onSelect={(id)=>setSelected(sample.records.find(x=>x.id===id) ?? null)} /> : filtered.length===0 ? <div className="directory-empty"><Search size={28}/><h3>No hay coincidencias</h3><p>Aún no tenemos perfiles de prueba en esta categoría o con estos filtros. Prueba otra área, especie, ubicación o precio.</p><button onClick={reset} type="button">Restablecer filtros</button></div> :
          <div className="directory-cards hv-vet-cards">{visible.map((lawyer,i)=><article key={lawyer.id} className={"directory-card hv-vet-card hv-vet-card-"+(i%4)}>
            <div className="directory-card-top"><div className="directory-avatar"><HuellaIcon size={32}/></div><div><span className={lawyer.demo_booking_enabled?"directory-small-tag demo-approved-tag":"directory-small-tag"}>{lawyer.demo_booking_enabled?"AGENDA DISPONIBLE · PERFIL FICTICIO":"MÉDICO VETERINARIO · SIN VERIFICAR"}</span><h3>{lawyer.display_name}</h3><p><MapPin size={14}/> {store.profiles[lawyer.id]?.location ?? lawyer.municipality}, {lawyer.jurisdictions[0]==="CDMX"?"CDMX":"Edomex"}</p></div></div>
            <div className="directory-tags">{lawyer.specialties.map(s=><span key={s}>{specialties.find(a=>a.id===s)?.name ?? s}</span>)}</div>
            <p className="vet-species-line"><HuellaIcon size={14}/> Atiende: {lawyer.species_treated.join(", ")}</p>
            <div className="directory-meta"><span><Stethoscope size={15}/> {lawyer.years_experience_demo} años (simulados)</span><span>{store.profiles[lawyer.id]?.modes.includes("online")?<Video size={15}/>:<Building2 size={15}/>} {store.profiles[lawyer.id]?.modes.length===2?"Video y presencial":store.profiles[lawyer.id]?.modes[0]==="online"?"Videollamada":"Presencial"}</span></div>
            <div className="directory-card-foot"><div><small>Consulta de prueba</small><strong>${(store.profiles[lawyer.id]?.price ?? lawyer.consultation_price_mxn_demo).toLocaleString("es-MX")} MXN</strong></div><div className="directory-card-buttons"><button type="button" onClick={()=>setSelected(lawyer)}>Conocer perfil <ArrowRight size={16}/></button>{lawyer.demo_booking_enabled&&<button type="button" className="directory-book-button" onClick={()=>setBooking(lawyer)}>Consultar horarios <CalendarDays size={15}/></button>}</div></div>
          </article>)}</div>}
          {display==="cards"&&filtered.length>limit&&<button className="directory-more" type="button" onClick={()=>setLimit(v=>v+9)}>Mostrar más perfiles ({filtered.length-limit} restantes)</button>}
        </section>
      </div>
    </div>
    {selected&&<div className="directory-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null);}}><section className="directory-modal" role="dialog" aria-modal="true" aria-labelledby="directory-modal-title"><button className="directory-modal-close" type="button" aria-label="Cerrar perfil" onClick={()=>setSelected(null)}><X size={22}/></button><div className="directory-avatar large"><HuellaIcon size={40}/></div><span className="directory-small-tag">{selected.demo_booking_enabled?"AGENDA DE PRUEBA · SIN VERIFICACIÓN SEP":"PERFIL SINTÉTICO · NO ES UN VETERINARIO REAL"}</span><h2 id="directory-modal-title">{selected.display_name}</h2><p><MapPin size={15}/> {selected.municipality}</p><div className="directory-tags">{selected.specialties.map(s=><span key={s}>{specialties.find(a=>a.id===s)?.name ?? s}</span>)}</div><div className="directory-profile-info"><p><strong>Especies:</strong> {selected.species_treated.join(", ")}</p><p><strong>Servicios:</strong> {selected.services.join(", ")}</p><p><strong>Experiencia ficticia:</strong> {selected.years_experience_demo} años</p><p><strong>Atención:</strong> {store.profiles[selected.id]?.modes.join(", ").replace("online","videollamada")}</p><p><strong>Precio de prueba:</strong> ${(store.profiles[selected.id]?.price ?? selected.consultation_price_mxn_demo).toLocaleString("es-MX")} MXN</p><p><strong>Cédula:</strong> no registrada · no verificada</p><p><strong>Expediente:</strong> {selected.demo_booking_enabled?"Revisión superada únicamente en simulación":"Pendiente de simulación"}</p></div><div className="directory-demo-warning"><ShieldAlert size={20}/><span>Las citas y su confirmación se simulan en este prototipo; necesitamos un backend y veterinarios acreditados para ofrecer atención real.</span></div>{selected.demo_booking_enabled&&<button className="directory-modal-done" type="button" onClick={()=>{setBooking(selected);setSelected(null);}}>Consultar disponibilidad</button>}<button className="directory-modal-done directory-modal-secondary" type="button" onClick={()=>setSelected(null)}>Cerrar vista previa</button></section></div>}
    {booking&&<BookingDemo lawyer={booking} onClose={()=>setBooking(null)}/>}
  </main>;
}
