import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChevronDown, Gavel, MapPin, Menu, MessageCircle, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { matchSpecialties } from "./lib/matchSpecialties";
import { Portal } from "./Portal";
import { DirectoryPreview } from "./DirectoryPreview";

type Region = "Todas las ubicaciones" | "Ciudad de México" | "Estado de México";

export function App() {
  const [portalOpen, setPortalOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("Todas las ubicaciones");
  const [searched, setSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeExample, setActiveExample] = useState("");
  const matches = useMemo(() => matchSpecialties(query), [query]);
  const runSearch = (event: FormEvent) => { event.preventDefault(); setSearched(true); setDirectoryOpen(true); setPortalOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#inicio" onClick={() => {setPortalOpen(false);setDirectoryOpen(false);}} aria-label="Legal MX, inicio"><span className="brand-mark"><Gavel size={22}/></span><span>legal<span className="brand-accent">mx</span><small>JUSTICIA MÁS CERCA</small></span></a>
          <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Navegación principal">
            <a href="#especialidades" onClick={() => {setPortalOpen(false);setDirectoryOpen(false);setMenuOpen(false);}}>Especialidades</a><button type="button" className="directory-nav-link" onClick={()=>{setDirectoryOpen(true);setPortalOpen(false);setMenuOpen(false);}}>Directorio demo</button>
            <a href="#como-funciona" onClick={() => {setPortalOpen(false);setMenuOpen(false);}}>Cómo funciona</a>
            <a href="#asistente" onClick={() => {setPortalOpen(false);setMenuOpen(false);}}>Asistente legal <span className="new-tag">Próximamente</span></a><button type="button" className="mobile-access" onClick={() => {setPortalOpen(true);setDirectoryOpen(false);setMenuOpen(false);}}>Iniciar sesión / Registrarse</button>
          </nav>
          <button className="nav-cta" type="button" onClick={() => {setPortalOpen(true);setMenuOpen(false);}}>Iniciar sesión / Registrarse <ArrowRight size={16}/></button>
          <button className="mobile-menu" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </header>
      {portalOpen ? <Portal onBack={() => {setPortalOpen(false);window.scrollTo({top:0,behavior:"smooth"});}} /> : directoryOpen ? <DirectoryPreview initialQuery={query} initialRegion={region==="Ciudad de México"?"CDMX":region==="Estado de México"?"EDOMEX":""} onClose={()=>{setDirectoryOpen(false);window.scrollTo({top:0,behavior:"smooth"});}} /> : <main>
        <section id="inicio" className="hero"><div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot"/> ORIENTACIÓN LEGAL EN MÉXICO</div>
            <h1>La ayuda legal que necesitas, <em>más cerca de ti.</em></h1>
            <p className="hero-description">Entender tus derechos debería ser sencillo. Encuentra el área legal que necesitas y descubre una forma más clara de recibir orientación.</p>
            <form className="search-box" onSubmit={runSearch} role="search">
              <label className="search-field"><Search size={21}/><span className="sr-only">Especialidad o problema legal</span><input value={query} onChange={e => {setQuery(e.target.value); setActiveExample(""); setSearched(false);}} placeholder="Ej. me despidieron, pensión alimenticia…"/></label>
              <label className="region-field"><MapPin size={19}/><span className="sr-only">Ubicación</span><select value={region} onChange={e => setRegion(e.target.value as Region)}><option>Todas las ubicaciones</option><option>Ciudad de México</option><option>Estado de México</option></select><ChevronDown className="select-chevron" size={15}/></label>
              <button type="submit">Buscar <ArrowRight size={17}/></button>
            </form>
            <div className="example-searches" aria-label="Ejemplos de búsquedas"><span>Prueba con:</span>{["Me despidieron","Pensión alimenticia","Problemas con mi renta"].map(example => <button type="button" key={example} className={activeExample === example ? "example-chip active" : "example-chip"} onClick={() => {setQuery(example);setActiveExample(example);setSearched(true);setDirectoryOpen(true);window.scrollTo({top:0,behavior:"smooth"});}}>{example}</button>)}</div>
            <div className="hero-footnote"><CheckCircle2 size={15}/> Sin complicaciones <span className="dot-separator">·</span> Información clara <span className="dot-separator">·</span> Pensado para ti</div>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-emblem"><Gavel size={110} strokeWidth={1.15}/></div><div className="floating-card one"><span className="card-icon blue"><ShieldCheck size={19}/></span><span><strong>Confianza</strong><small>Información responsable</small></span></div><div className="floating-card two"><span className="card-icon gold"><BookOpen size={19}/></span><span><strong>Claridad</strong><small>Entiende tus opciones</small></span></div><div className="art-star star-one">✧</div><div className="art-star star-two">✦</div></div>
        </div></section>
        <section className="trust-strip"><div className="container trust-items"><span><ShieldCheck size={21}/> Diseñado con responsabilidad</span><span><MapPin size={21}/> CDMX y Estado de México</span><span><Users size={21}/> Centrado en las personas</span></div></section>
        <section className="specialties-section" id="especialidades"><div className="container">
          <div className="section-intro"><span className="section-label">ÁREAS DE PRÁCTICA</span><h2>¿En qué podemos <em>orientarte?</em></h2><p>Elige tu especialidad y explora 40 perfiles ficticios mientras preparamos los registros profesionales reales.</p></div>
          {searched && <div className="search-feedback" role="status">{matches.length ? `Encontramos ${matches.length} área(s) legal(es) relacionada(s) con tu búsqueda. Ubicación seleccionada: ${region}. Explora perfiles exclusivamente ficticios en el directorio de demostración.` : "No encontramos una especialidad con esas palabras. Intenta una búsqueda más general."}</div>}
          <div className="specialty-grid">{matches.map((specialty, index) => <article className="specialty-card" key={specialty.id}><span className="specialty-icon"><Gavel size={23} strokeWidth={1.7}/></span><span className="specialty-number">0{index + 1}</span><h3>{specialty.name}</h3><p>{specialty.description}</p><span className="coming-label"><button className="directory-specialty-button" type="button" onClick={()=>{setQuery("");setDirectoryOpen(true);window.scrollTo({top:0,behavior:"smooth"});}}>Ver perfiles ficticios <ArrowRight size={16}/></button></span></article>)}</div>
        </div></section>
        <section id="como-funciona" className="how-section"><div className="container"><div className="section-intro"><span className="section-label">SIMPLE DESDE EL PRINCIPIO</span><h2>Tu camino, <em>más claro.</em></h2></div><div className="steps"><div><span className="step-num">01</span><Search/><h3>Cuéntanos qué necesitas</h3><p>Busca por tema legal o selecciona una especialidad.</p></div><div><span className="step-num">02</span><BookOpen/><h3>Conoce tus opciones</h3><p>Consulta información comprensible y fuentes verificables cuando estén disponibles.</p></div><div><span className="step-num">03</span><CalendarDays/><h3>Conecta con un profesional</h3><p>Próximamente podrás consultar perfiles y solicitar una cita.</p></div></div></div></section>
        <section id="asistente" className="assistant-section"><div className="container assistant-panel"><div className="assistant-icon"><Sparkles size={28}/></div><div><span className="section-label">PRÓXIMAMENTE</span><h2>Un asistente legal que habla tu idioma.</h2><p>Estamos diseñando un asistente para orientarte sobre la normativa de Ciudad de México y Estado de México, con referencias a fuentes oficiales. Aún no acepta consultas.</p></div><span className="assistant-status"><MessageCircle size={17}/> En desarrollo</span></div></section>
      </main>}
      <footer><div className="container footer-inner"><span className="footer-brand">legal<span>mx</span></span><p>Prototipo en desarrollo. El contenido no constituye asesoría jurídica ni sustituye la consulta con un profesional.</p><small>© {new Date().getFullYear()} Legal MX</small></div></footer>
    </>
  );
}
