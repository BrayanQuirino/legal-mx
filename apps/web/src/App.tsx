import { useState, type FormEvent } from "react";
import { ArrowRight, Activity, BadgeCheck, CalendarDays, Cat, CircleCheck, Dog, ChevronDown, Heart, HeartPulse, MapPin, Menu, MessageCircle, PawPrint, Rabbit, Search, ShieldCheck, Sparkles, Stethoscope, Syringe, X, Video, Star } from "lucide-react";
import { Portal } from "./Portal";
import { DemoStoreProvider } from "./DemoStore";
import { DirectoryPreview } from "./DirectoryPreview";
type Region="Todas las ubicaciones"|"Ciudad de México"|"Estado de México";
const services=[
 {id:"consultas",name:"Consulta veterinaria",description:"Atención profesional, cercana y con cariño.",search:"consulta",Icon:Stethoscope},
 {id:"urgencias",name:"Emergencias",description:"Encuentra apoyo cuando más lo necesitan.",search:"urgencias",Icon:HeartPulse},
 {id:"vacunas",name:"Vacunación",description:"Prevención para una vida llena de aventuras.",search:"vacuna",Icon:Syringe},
 {id:"especialistas",name:"Especialistas",description:"Cuidados específicos para cada etapa.",search:"dermatologia",Icon:Heart},
 {id:"online",name:"Consultas en línea",description:"Orientación veterinaria desde donde estés.",search:"consulta",Icon:Video},
 {id:"bienestar",name:"Bienestar y prevención",description:"Hábitos y cuidados para vivir mejor.",search:"bienestar",Icon:Sparkles}
];
export function App(){
 const [portalOpen,setPortalOpen]=useState(false),[directoryOpen,setDirectoryOpen]=useState(false),[query,setQuery]=useState(""),[region,setRegion]=useState<Region>("Todas las ubicaciones"),[menuOpen,setMenuOpen]=useState(false);
 const home=()=>{setPortalOpen(false);setDirectoryOpen(false);setMenuOpen(false);};
 const directory=(term="")=>{setQuery(term);setDirectoryOpen(true);setPortalOpen(false);setMenuOpen(false);window.scrollTo({top:0,behavior:"smooth"});};
 const portal=()=>{setPortalOpen(x=>!x);setDirectoryOpen(false);setMenuOpen(false);window.scrollTo({top:0,behavior:"smooth"});};
 const search=(e:FormEvent)=>{e.preventDefault();directory(query);};
 return <DemoStoreProvider>
  <header className="site-header"><div className="container nav">
    <a className="brand" href="#inicio" onClick={home} aria-label="HuellaVet, inicio"><span className="brand-mark"><PawPrint size={23}/></span><span>Huella<span className="brand-accent">Vet</span></span></a>
    <nav className={menuOpen?"nav-links open":"nav-links"} aria-label="Navegación principal">
      <a href="#inicio" onClick={home}>Inicio</a><button className="directory-nav-link" type="button" onClick={()=>directory()}>Encontrar veterinarios</button>
      <a href="#especialidades" onClick={home}>Servicios</a><a href="#para-veterinarios" onClick={home}>Para veterinarios</a>
      <button className="mobile-access" type="button" onClick={portal}>{portalOpen?"Volver al inicio":"Acceso a mi cuenta"}</button>
    </nav>
    <button className="nav-cta" type="button" onClick={portal}>{portalOpen?"Cerrar sesión":"Iniciar sesión"} <ArrowRight size={16}/></button>
    <button className="mobile-menu" type="button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Abrir o cerrar menú">{menuOpen?<X/>:<Menu/>}</button>
  </div></header>
  {portalOpen?<Portal onBack={home}/> : directoryOpen?<DirectoryPreview initialQuery={query} initialRegion={region==="Ciudad de México"?"CDMX":region==="Estado de México"?"EDOMEX":""} onClose={home}/> :
  <main className="hv-home">
    <section id="inicio" className="hero"><div className="container hero-grid">
      <div className="hero-content">
        <div className="eyebrow"><span className="eyebrow-dot"/> BIENVENIDO A UN MUNDO MÁS FELIZ <span className="hv-eyebrow-star">✦</span></div>
        <h1>Su mundo es más feliz <em>contigo.</em> El tuyo, <em>con ellos.</em></h1>
        <p className="hero-description">Encuentra veterinarios, cuida su salud y acompaña cada etapa de su vida. Todo en un solo lugar.</p>
        <div className="hv-hero-actions"><button type="button" className="hv-primary-action" onClick={()=>directory()}><PawPrint size={19}/> Encontrar veterinario <ArrowRight size={18}/></button><button type="button" className="hv-secondary-action" onClick={()=>document.getElementById("especialidades")?.scrollIntoView({behavior:"smooth"})}>Explorar HuellaVet <ArrowRight size={17}/></button></div>
        <div className="hv-discovery-card">
          <div className="hv-discovery-top"><span><PawPrint size={17}/> Empecemos con tu mascota</span><span className="hv-discovery-label">ENCUENTRA SU CUIDADO</span></div>
          <div className="hv-species-picker" role="group" aria-label="Selecciona el tipo de mascota">
            <button type="button" onClick={()=>directory("perro")}><Dog size={22}/><span>Perros</span><ArrowRight size={14}/></button>
            <button type="button" onClick={()=>directory("gato")}><Cat size={22}/><span>Gatos</span><ArrowRight size={14}/></button>
            <button type="button" onClick={()=>directory("conejo")}><Rabbit size={22}/><span>Otros</span><ArrowRight size={14}/></button>
          </div>
          <form className="hv-discovery-form" role="search" onSubmit={search}>
            <label className="hv-discovery-input"><Search size={20}/><span className="sr-only">Qué necesita tu mascota</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="¿Qué necesita tu compañero?"/></label>
            <label className="hv-discovery-region"><MapPin size={18}/><span className="sr-only">Ubicación</span><select value={region} onChange={e=>setRegion(e.target.value as Region)}><option>Todas las ubicaciones</option><option>Ciudad de México</option><option>Estado de México</option></select><ChevronDown className="select-chevron" size={14}/></label>
            <button type="submit" className="hv-discovery-submit"><ArrowRight size={20}/><span className="sr-only">Encontrar veterinarios</span></button>
          </form>
        </div>
        <div className="example-searches"><span>Prueba con:</span>{["Vacunas","Mi gato tiene alergia","Revisión general"].map(x=><button type="button" key={x} onClick={()=>directory(x)}>{x}</button>)}</div>
        <div className="hero-footnote"><span className="hero-proof-icon"><BadgeCheck size={17}/></span> Una experiencia diseñada para cuidarlos <span className="dot-separator">✦</span> Desde tu celular o computadora</div>
      </div>
      <div className="hero-art hv-hero-stage" aria-label="Un perrito alegre y una interfaz moderna de cuidado de mascotas">
        <div className="hv-stage-glow"/>
        <div className="hv-stage-grid"/>
        <div className="hv-stage-round"/>
        <div className="hv-stage-dog">
          <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1100&q=85" alt="Perro de pelaje claro, alegre y cariñoso" loading="eager" fetchPriority="high"/>
        </div>
        <div className="hv-stage-tag hv-stage-tag-upper"><span className="hv-stage-tag-icon"><Heart size={17} fill="currentColor"/></span><strong>Bienestar en cada etapa</strong></div>
        <div className="hv-pet-id-card"><div className="hv-pet-id-top"><span><PawPrint size={16}/> MI COMPAÑERO</span><span className="hv-pet-id-verified"><CircleCheck size={14}/> Perfil</span></div><div className="hv-pet-id-main"><div className="hv-pet-id-avatar"><Dog size={25}/></div><div><strong>Mi mejor amigo</strong><small>Su salud, todo en un lugar</small></div></div><div className="hv-pet-id-progress"><span/><span/><span/><span/></div></div>
        <div className="hv-stage-orbit-star a">✦</div><div className="hv-stage-orbit-star b">✧</div>
      </div>
    </div></section>
    <section className="hv-product-strip"><div className="container hv-product-strip-inner">
      <div><span className="hv-strip-icon"><HeartPulse size={22}/></span><strong>Cuidar es amar</strong><small>Atención enfocada en su bienestar</small></div>
      <div><span className="hv-strip-icon"><CalendarDays size={22}/></span><strong>Agenda sin estrés</strong><small>Tu tiempo y el suyo importan</small></div>
      <div><span className="hv-strip-icon"><Activity size={22}/></span><strong>Todo en un lugar</strong><small>Sus visitas, más organizadas</small></div>
    </div></section>
    <section className="hv-explore" id="especialidades"><div className="container">
      <div className="hv-explore-intro"><div><span className="section-label">UN UNIVERSO DE CUIDADOS</span><h2>Todo su bienestar, <em>en un solo lugar.</em></h2><p>Descubre servicios para acompañarlos en cada momento, desde su primera vacuna hasta los cuidados de cada día.</p></div><button type="button" className="hv-view-all" onClick={()=>directory()}><span>Explorar todos los veterinarios</span><ArrowRight size={18}/></button></div>
      <div className="hv-service-bento">
        {services.map(({id,name,description,search:serviceQuery,Icon},i)=><button key={id} type="button" className={"hv-service-tile hv-service-"+i} onClick={()=>directory(serviceQuery)}>
          <span className="hv-service-tile-top"><span className="hv-service-icon"><Icon size={i===0?33:24} strokeWidth={1.8}/></span><span className="hv-service-index">0{i+1}</span></span>
          <span className="hv-service-copy"><strong>{name}</strong><small>{description}</small></span><span className="hv-service-arrow"><ArrowRight size={19}/></span>
        </button>)}
      </div>
    </div></section>
    <section className="hv-people" id="profesionales"><div className="container"><div className="hv-people-heading"><span className="section-label">PERSONAS QUE AMAN LO QUE HACEN</span><h2>Grandes personas para <em>pequeños grandes amores.</em></h2><p>Conoce el tipo de profesionales y cuidados que podrás encontrar en HuellaVet.</p></div><div className="hv-people-grid">
      <article className="hv-person-card"><div className="hv-person-image"><img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=85" alt="Profesional de la salud sonriendo" loading="lazy"/></div><div className="hv-person-details"><span><Stethoscope size={14}/> Medicina general</span><h3>Atención que inspira confianza</h3><p><MapPin size={14}/> Busca cerca de ti</p><button type="button" onClick={()=>directory("consulta")}>Explorar perfiles <ArrowRight size={16}/></button></div></article>
      <article className="hv-person-card"><div className="hv-person-image"><img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85" alt="Profesional de la salud en consulta" loading="lazy"/></div><div className="hv-person-details"><span><HeartPulse size={14}/> Especialidades</span><h3>El cuidado que necesitan</h3><p><MapPin size={14}/> CDMX y Estado de México</p><button type="button" onClick={()=>directory("dermatologia")}>Explorar perfiles <ArrowRight size={16}/></button></div></article>
      <article className="hv-person-card"><div className="hv-person-image"><img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=85" alt="Profesional de la salud atendiendo una consulta" loading="lazy"/></div><div className="hv-person-details"><span><Video size={14}/> Atención flexible</span><h3>Más formas de acompañarlos</h3><p><Star size={14}/> Encuentra su cuidado ideal</p><button type="button" onClick={()=>directory()}>Ver opciones <ArrowRight size={16}/></button></div></article>
    </div><p className="hv-people-note"><ShieldCheck size={15}/> Fotografías ilustrativas. Los perfiles actuales son de demostración y no cuentan con calificaciones verificadas.</p></div></section>
    <section className="hv-family"><div className="container hv-family-grid"><div className="hv-family-photo"><img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85" alt="Perro descansando feliz en un momento cotidiano" loading="lazy"/><span className="hv-family-heart"><Heart size={35}/></span></div><div className="hv-family-copy"><span className="section-label">MUCHO MÁS QUE MASCOTAS</span><h2>Porque ellos <em>son familia.</em></h2><p>Están en nuestros mejores momentos, nos hacen reír y nos acompañan sin pedir nada a cambio. Merecen cuidados llenos de cariño, atención y confianza.</p><button className="hv-primary-action" type="button" onClick={()=>directory()}>Cuidar su bienestar <ArrowRight size={17}/></button></div></div></section>
    <section id="como-funciona" className="how-section hv-how-section"><div className="container"><div className="section-intro"><span className="section-label">FÁCIL PARA TI Y TU MASCOTA</span><h2>Su próxima consulta, <em>sin complicaciones.</em></h2></div><div className="steps"><div><span className="step-num">01</span><Search/><h3>Encuentra un veterinario</h3><p>Busca por especialidad, especie o ubicación.</p></div><div><span className="step-num">02</span><PawPrint/><h3>Elige a tu mascota</h3><p>Selecciona su perfil y explica el motivo de la visita.</p></div><div><span className="step-num">03</span><CalendarDays/><h3>Agenda su visita</h3><p>Selecciona un horario y envía la solicitud de cita.</p></div></div></div></section>
    <section id="para-veterinarios" className="hv-vet-invite"><div className="container hv-vet-invite-inner"><div><span className="section-label">PARA PROFESIONALES</span><h2>El mejor cuidado empieza contigo.</h2><p>Conoce la experiencia de HuellaVet para profesionales veterinarios.</p></div><button type="button" className="hv-secondary-action" onClick={portal}>Explorar espacio veterinario <ArrowRight size={17}/></button></div></section>
    <section id="asistente" className="assistant-section"><div className="container assistant-panel"><div className="assistant-icon"><Sparkles size={28}/></div><div><span className="section-label">PRÓXIMAMENTE</span><h2>Toda su salud en un solo lugar.</h2><p>Un futuro con perfiles de mascotas, recordatorios de vacunas y seguimientos más fáciles. Ante una urgencia, busca atención veterinaria presencial inmediata.</p></div><span className="assistant-status"><MessageCircle size={17}/> En desarrollo</span></div></section>
    <div className="vet-demo-disclosure container" role="note"><ShieldCheck size={19}/><span>Vista previa de HuellaVet: los veterinarios, mascotas, clínicas, ubicaciones y citas son ficticios. No hay profesionales verificados ni reservas reales.</span></div>
  </main>}
  <footer><div className="container footer-inner"><span className="footer-brand"><PawPrint size={22}/> huella<span>vet</span></span><p>Plataforma veterinaria en desarrollo. Los datos actuales son sintéticos; no sustituye atención profesional de urgencias.</p><small>© {new Date().getFullYear()} HuellaVet</small></div></footer>
 </DemoStoreProvider>;
}
