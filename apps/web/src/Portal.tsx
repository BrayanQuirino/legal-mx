import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Gavel, ShieldAlert, ShieldCheck, UserRound, Users, Video } from "lucide-react";
import { VerificationFlow } from "./VerificationFlow";
import { LawyerDashboard, ClientDashboard } from "./DemoDashboards";
import { useDemoStore } from "./DemoStore";
import { demoLawyers } from "./lib/scheduling";
import "./portal.css";

type Role="client"|"lawyer"|"admin";
const labels:Record<Role,string>={client:"Usuarios",lawyer:"Abogados",admin:"Administración"};
const roles:Role[]=["client","lawyer","admin"];
// GitHub Pages testing mode: the interface is public and synthetic; never treat this as RBAC.
const OPEN_POC_VIEWS=true;

export function Portal({onBack}:{onBack:()=>void}){
 const [role,setRole]=useState<Role>("client");
 const [step,setStep]=useState<"welcome"|"access"|"dashboard">(OPEN_POC_VIEWS?"dashboard":"welcome");
 const [register,setRegister]=useState(false);
 const [consent,setConsent]=useState(false);
 const [verify,setVerify]=useState(false);
 const store=useDemoStore();
 return <main className="poc"><div className="container">
  <div className="poc-head"><button onClick={onBack} className="poc-back"><ArrowLeft size={17}/> Volver a Legal MX</button><span className="poc-tag">VISTAS DE PRUEBA · ACCESO DIRECTO</span></div>
  <div className={step==="dashboard"&&role==="lawyer"?"poc-grid poc-grid-wide":"poc-grid"}><aside className="poc-sidebar"><span className="section-label">TRES EXPERIENCIAS</span><h1>Tu espacio <em>legal.</em></h1><p>Elige una vista para explorar cómo funcionará Legal MX.</p>
   <div className="poc-roles">{roles.map(r=><button key={r} type="button" className={r===role?"poc-role active":"poc-role"} onClick={()=>{setRole(r);setStep(OPEN_POC_VIEWS?"dashboard":"welcome");setVerify(false);setConsent(false);}}><span>{r==="client"?<UserRound/>:r==="lawyer"?<Gavel/>:<ShieldCheck/>}</span><strong>{labels[r]}</strong><ArrowRight size={15}/></button>)}</div>
   <div className="poc-alert"><ShieldAlert size={21}/><span>Modo de prueba: las vistas son públicas y los datos son ficticios. Falta conectar autenticación, permisos, SEP y almacenamiento seguro.</span></div>
  </aside>
  <section className="poc-paper" aria-label={"Portal "+labels[role]}>
   {step==="welcome"&&<><span className="section-label">PORTAL DE {labels[role].toUpperCase()}</span><h2>{role==="client"?"Tus citas, a tu manera":role==="lawyer"?"Gestiona tu práctica jurídica":"Supervisa los expedientes"}</h2><p>{role==="client"?"Consulta citas ficticias y solicita nuevas citas con alguno de los cinco perfiles de prueba.":role==="lawyer"?"Revisa 5 clientes ficticios por perfil, bloquea horarios, fija descansos y modifica el precio o la modalidad.":"Consulta el estado simulado de expedientes y la operación de prueba."}</p>
    <div className="poc-metrics"><span><Video/> Videollamadas</span><span><Users/> Usuarios ficticios</span><span><CalendarDays/> Agenda interactiva</span></div>
    <button className="poc-primary" onClick={()=>{setStep("access");setRegister(false);}}>Iniciar sesión <ArrowRight size={17}/></button>
    <button className="poc-outline" onClick={()=>{setStep("access");setRegister(true);}}>Registrarse</button>
   </>}
   {step==="access"&&<><button className="poc-back" onClick={()=>setStep("welcome")}><ArrowLeft size={16}/> Regresar</button><span className="section-label">{register?"REGISTRO":"ACCESO"} · {labels[role].toUpperCase()}</span><h2>{register?"Crear cuenta demo":"Bienvenido de nuevo"}</h2><p>Acceso solo de prueba; no se crean cuentas ni se comprueba la identidad.</p>
    <button className="poc-google" disabled type="button">Continuar con Google · Próximamente</button>
    <form className="poc-form" onSubmit={e=>{e.preventDefault();if(consent)setStep("dashboard");}}>
     {register&&<label>Nombre ficticio<input placeholder="Persona Demo" maxLength={50} required autoComplete="off"/></label>}
     <label>Correo ficticio<input type="email" required pattern="[a-zA-Z0-9._%+-]+@example[.]test" title="Utiliza @example.test" placeholder="demo@example.test" autoComplete="off"/></label>
     <label>Clave de demostración (no contraseña)<input type="text" required pattern="DEMO" placeholder="DEMO" autoComplete="off"/></label>
     <label className="poc-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/> Entiendo que esto es una simulación y no introduciré datos reales.</label>
     <button className="poc-primary" type="submit">Entrar al panel demo <ArrowRight size={16}/></button>
    </form><button className="poc-link" onClick={()=>setRegister(!register)}>{register?"Ya tengo cuenta demo":"Crear cuenta demo"}</button>
   </>}
   {step==="dashboard"&&<><span className="section-label">PANEL {labels[role].toUpperCase()} · DEMO</span><h2>{role==="client"?"Mi espacio de cliente":role==="lawyer"?"Mi despacho digital":"Administración de Legal MX"}</h2>
    <p>Todos los resultados son ficticios y los cambios permanecen únicamente durante esta sesión de navegación.</p>
    {role==="client"&&<ClientDashboard/>}
    {role==="lawyer"&&<LawyerDashboard/>}
    {role==="admin"&&<div className="poc-panel"><h3>Operación y revisión · Demostración</h3><div className="poc-metrics"><span><Users/> 100 clientes demo</span><span><Gavel/> 40 abogados demo</span><span><CalendarDays/> {store.appointments.filter(a=>a.status!=="cancelled").length} citas demo</span></div><p>Cinco expedientes aprobados solo en simulación, 35 pendientes. Ningún profesionista fue comprobado ante la SEP.</p>
     {demoLawyers.map(l=><div className="poc-request" key={l.id}><span>{l.display_name} · {l.demo_review.case_id}</span><span>{store.appointments.filter(a=>a.lawyer_id===l.id&&a.status!=="cancelled").length} citas</span></div>)}
     <button className="poc-outline" type="button" onClick={()=>setVerify(!verify)}>{verify?"Cerrar verificación de prueba":"Explorar verificación de prueba"}</button>{verify&&<VerificationFlow/>}
    </div>}
    {role==="lawyer"&&<><button className="poc-outline" onClick={()=>setVerify(!verify)}>{verify?"Cerrar verificación":"Explorar verificación POC"}</button>{verify&&<VerificationFlow/>}</>}
    <button className="poc-link" onClick={onBack}>Volver al inicio</button>
   </>}
  </section></div></div></main>;
}
