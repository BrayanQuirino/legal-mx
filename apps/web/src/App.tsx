import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Cat, ChevronDown, Dog, Heart, HeartPulse, MapPin, Menu, MessageCircle, PawPrint, Rabbit, Search, ShieldCheck, Sparkles, Stethoscope, Syringe, X } from "lucide-react";
import { matchSpecialties } from "./lib/matchSpecialties";
import { Portal } from "./Portal";
import { DemoStoreProvider } from "./DemoStore";
import { DirectoryPreview } from "./DirectoryPreview";
type Region="Todas las ubicaciones"|"Ciudad de México"|"Estado de México";
const icons=[Stethoscope,HeartPulse,Syringe,Heart,Cat,Rabbit];
export function App(){
 const [portalOpen,setPortalOpen]=useState(false),[directoryOpen,setDirectoryOpen]=useState(false),[query,setQuery]=useState(""),[region,setRegion]=useState<Region>("Todas las ubicaciones"),[menuOpen,setMenuOpen]=useState(false);
 const matches=useMemo(()=>matchSpecialties(query),[query]);
 const home=()=>{setPortalOpen(false);setDirectoryOpen(false);setMenuOpen(false);};
 const directory=(term="")=>{setQuery(term);setDirectoryOpen(true);setPortalOpen(false);setMenuOpen(false);window.scrollTo({top:0,behavior:"smooth"});};
 const portal=()=>{setPortalOpen(x=>!x);setDirectoryOpen(false);setMenuOpen(false);};
 const search=(e:FormEvent)=>{e.preventDefault();directory(query);};
 return <DemoStoreProvider>
  <header className="site-header"><div className="container nav">
    <a className="brand" href="#inicio" onClick={home} aria-label="HuellaVet, inicio"><span className="brand-mark"><PawPrint size={23}/></span><span>huella<span className="brand-accent">vet</span><small>BIENESTAR PARA CADA HUELLITA</small></span></a>
    <nav className={menuOpen?"nav-links open":"nav-links"} aria-label="Navegación principal">
      <a href="#especialidades" onClick={home}>Especialidades</a><button className="directory-nav-link" type="button" onClick={()=>directory()}>Veterinarios</button>
      <a href="#como-funciona" onClick={home}>Cómo funciona</a><a href="#asistente" onClick={home}>Cuidados</a>
      <button className="mobile-access" type="button" onClick={portal}>{portalOpen?"Cerrar sesión":"Iniciar sesión"}</button>
    </nav>
    <button className="nav-cta" type="button" onClick={portal}>{portalOpen?"Cerrar sesión":"Iniciar sesión"} <ArrowRight size={16}/></button>
    <button className="mobile-menu" type="button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Abrir o cerrar menú">{menuOpen?<X/>:<Menu/>}</button>
  </div></header>
  {portalOpen?<Portal onBack={home}/> : directoryOpen?<DirectoryPreview initialQuery={query} initialRegion={region==="Ciudad de México"?"CDMX":region==="Estado de México"?"EDOMEX":""} onClose={home}/> :
  <main>
    <section id="inicio" className="hero"><div className="container hero-grid">
      <div className="hero-content">
        <div className="eyebrow"><span className="eyebrow-dot"/> UN MUNDO MÁS FELIZ PARA TU MASCOTA</div>
        <h1>Su bienestar merece <em>el mejor cuidado.</em></h1>
        <p className="hero-description">Encuentra médicos veterinarios cerca de ti, conoce sus servicios y elige un horario para cuidar a quien siempre está contigo.</p>
        <form className="search-box" role="search" onSubmit={search}>
          <label className="search-field"><Search size={20}/><span className="sr-only">Qué necesita tu mascota</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Vacunas, piel, chequeo, conejo…"/></label>
          <label className="region-field"><MapPin size={18}/><span className="sr-only">Ubicación</span><select value={region} onChange={e=>setRegion(e.target.value as Region)}><option>Todas las ubicaciones</option><option>Ciudad de México</option><option>Estado de México</option></select><ChevronDown className="select-chevron" size={15}/></label>
          <button type="submit">Encontrar veterinario <ArrowRight size={17}/></button>
        </form>
        <div className="example-searches"><span>Prueba con:</span>{["Vacunas","Mi gato tiene alergia","Revisión general"].map(x=><button type="button" key={x} onClick={()=>directory(x)}>{x}</button>)}</div>
        <div className="hero-footnote"><HeartPulse size={16}/> Salud preventiva <span className="dot-separator">·</span> Citas sencillas <span className="dot-separator">·</span> Atención con cariño</div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="hero-emblem"><div className="pet-emblem-art"><Dog size={127} strokeWidth={1.2}/><Cat size={75} strokeWidth={1.5}/><span className="pet-heart"><Heart size={32} fill="currentColor"/></span></div></div>
        <div className="floating-card one"><span className="card-icon blue"><Stethoscope size={20}/></span><span><strong>Cuidado experto</strong><small>Encuentra su veterinario</small></span></div>
        <div className="floating-card two"><span className="card-icon gold"><CalendarDays size={20}/></span><span><strong>Citas a tu ritmo</strong><small>Elige día y hora</small></span></div>
        <div className="art-star star-one"><PawPrint size={30}/></div><div className="art-star star-two"><Heart size={23}/></div>
      </div>
    </div></section>
    <section className="trust-strip"><div className="container trust-items"><span><PawPrint size={21}/> Perros, gatos y más compañeros</span><span><MapPin size={21}/> CDMX y Estado de México</span><span><CalendarDays size={21}/> Agenda veterinaria sencilla</span></div></section>
    <section className="specialties-section" id="especialidades"><div className="container">
      <div className="section-intro"><span className="section-label">ESPECIALIDADES Y SERVICIOS</span><h2>El cuidado que tu mascota <em>necesita.</em></h2><p>Desde una revisión de rutina hasta una valoración especializada. Explora nuestros perfiles de prueba.</p></div>
      <div className="specialty-grid">{matches.map((item,i)=>{const Icon=icons[i%icons.length];return <article key={item.id} className="specialty-card"><span className="specialty-icon"><Icon size={25}/></span><span className="specialty-number">0{i+1}</span><h3>{item.name}</h3><p>{item.description}</p><button className="directory-specialty-button" type="button" onClick={()=>directory(item.name)}>Ver veterinarios <ArrowRight size={15}/></button></article>})}</div>
    </div></section>
    <section id="como-funciona" className="how-section"><div className="container"><div className="section-intro"><span className="section-label">FÁCIL PARA TI Y TU MASCOTA</span><h2>Su próxima consulta, <em>sin complicaciones.</em></h2></div><div className="steps"><div><span className="step-num">01</span><Search/><h3>Encuentra un veterinario</h3><p>Busca por especialidad, especie o ubicación.</p></div><div><span className="step-num">02</span><PawPrint/><h3>Elige a tu mascota</h3><p>Selecciona su perfil y explica el motivo de la visita.</p></div><div><span className="step-num">03</span><CalendarDays/><h3>Agenda su visita</h3><p>Selecciona un horario y envía la solicitud de cita.</p></div></div></div></section>
    <section id="asistente" className="assistant-section"><div className="container assistant-panel"><div className="assistant-icon"><Sparkles size={28}/></div><div><span className="section-label">PRÓXIMAMENTE</span><h2>Un espacio para cuidarlos mejor.</h2><p>Historial de mascotas, vacunas y recordatorios de seguimiento. Ante una urgencia, busca atención veterinaria presencial inmediata.</p></div><span className="assistant-status"><MessageCircle size={17}/> En desarrollo</span></div></section>
    <div className="vet-demo-disclosure container" role="note"><ShieldCheck size={19}/><span>Vista previa de HuellaVet: los veterinarios, mascotas, clínicas, ubicaciones y citas son ficticios. No hay profesionales verificados ni reservas reales.</span></div>
  </main>}
  <footer><div className="container footer-inner"><span className="footer-brand"><PawPrint size={22}/> huella<span>vet</span></span><p>Plataforma veterinaria en desarrollo. Los datos actuales son sintéticos; no sustituye atención profesional de urgencias.</p><small>© {new Date().getFullYear()} HuellaVet</small></div></footer>
 </DemoStoreProvider>;
}
