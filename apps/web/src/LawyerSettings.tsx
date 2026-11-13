import { Building2, CheckCircle2, Clock3, MapPin, ShieldAlert, Video } from "lucide-react";
import { useDemoStore, type Mode } from "./DemoStore";
const DAYS=[["L",1],["M",2],["X",3],["J",4],["V",5],["S",6],["D",0]] as const;
const PRICE_PRESETS=[350,500,750,1000,1500];
const LOCATIONS=["Ciudad de México","Naucalpan de Juárez","Tlalnepantla de Baz","Coyoacán","Toluca","Ecatepec de Morelos","Metepec","Atizapán de Zaragoza"];
const HOUR_PRESETS=[{label:"Mañanas",start:8,end:14},{label:"Oficina",start:9,end:18},{label:"Tardes",start:12,end:20}];
export function LawyerSettings({lawyerId}:{lawyerId:string}){
 const store=useDemoStore();
 const profile=store.profiles[lawyerId];
 const chooseMode=(next:Mode[])=>store.updateProfile(lawyerId,{modes:next});
 const chooseHours=(startHour:number,endHour:number)=>store.updateProfile(lawyerId,{startHour,endHour});
 return <section className="settings-panel">
   <div className="settings-heading"><span className="section-label">CONFIGURACIÓN DE MI DESPACHO</span><h3>Tu práctica, a tu manera</h3><p>Personaliza tu perfil con controles rápidos, sin llenar formularios largos.</p></div>
   <div className="settings-grid">
    <article className="settings-card"><span className="settings-icon"><Video size={20}/></span><h4>¿Cómo atiendes?</h4><p>Selecciona una modalidad. Se actualiza inmediatamente en la reserva.</p>
     <div className="settings-choice-grid">
      {([{key:"online",title:"En línea",symbol:<Video size={20}/>},{key:"presencial",title:"Presencial",symbol:<Building2 size={20}/>},{key:"both",title:"Ambas",symbol:<CheckCircle2 size={20}/>} ] as const).map(option=>{
       const modes:Mode[]=option.key==="both"?["online","presencial"]:[option.key];
       const active=modes.length===profile.modes.length&&modes.every(m=>profile.modes.includes(m));
       return <button key={option.key} type="button" className={active?"selected":""} aria-pressed={active} onClick={()=>chooseMode(modes)}>{option.symbol}<span>{option.title}</span></button>;
      })}
     </div>
    </article>
    <article className="settings-card"><span className="settings-icon"><Clock3 size={20}/></span><h4>Horario habitual</h4><p>Selecciona un horario rápido o ajústalo con los desplegables.</p>
     <div className="settings-preset-row">{HOUR_PRESETS.map(p=><button key={p.label} type="button" className={profile.startHour===p.start&&profile.endHour===p.end?"selected":""} onClick={()=>chooseHours(p.start,p.end)}>{p.label}<small>{p.start}:00–{p.end}:00</small></button>)}</div>
     <div className="settings-time-range"><label>De <select value={profile.startHour} onChange={e=>chooseHours(Math.min(Number(e.target.value),profile.endHour-1),profile.endHour)}>{Array.from({length:24},(_,i)=><option value={i} key={i}>{String(i).padStart(2,"0")}:00</option>)}</select></label><label>A <select value={profile.endHour} onChange={e=>chooseHours(profile.startHour,Math.max(Number(e.target.value),profile.startHour+1))}>{Array.from({length:24},(_,i)=><option value={i+1} key={i+1}>{String(i+1).padStart(2,"0")}:00</option>)}</select></label></div>
    </article>
    <article className="settings-card"><span className="settings-icon"><CheckCircle2 size={20}/></span><h4>Días de atención</h4><p>Activa los días en los que podrán reservar los clientes.</p>
     <div className="settings-days">{DAYS.map(([label,day])=><button key={day} title={["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][day]} type="button" className={profile.weekdays.includes(day)?"selected":""} aria-pressed={profile.weekdays.includes(day)} onClick={()=>{const weekdays=profile.weekdays.includes(day)?profile.weekdays.filter(d=>d!==day):[...profile.weekdays,day];store.updateProfile(lawyerId,{weekdays});}}>{label}</button>)}</div>
     <button type="button" className="settings-text-action" onClick={()=>store.updateProfile(lawyerId,{weekdays:[1,2,3,4,5]})}>Usar lunes a viernes</button>
    </article>
    <article className="settings-card"><span className="settings-icon"><Clock3 size={20}/></span><h4>Precio por consulta</h4><p>Costo ficticio en pesos mexicanos.</p>
     <div className="settings-price"><button type="button" aria-label="Reducir precio 50 pesos" onClick={()=>store.updateProfile(lawyerId,{price:Math.max(0,profile.price-50)})}>−</button><strong>${profile.price.toLocaleString("es-MX")}</strong><button type="button" aria-label="Aumentar precio 50 pesos" onClick={()=>store.updateProfile(lawyerId,{price:Math.min(10000,profile.price+50)})}>+</button></div>
     <div className="settings-price-presets">{PRICE_PRESETS.map(price=><button type="button" key={price} onClick={()=>store.updateProfile(lawyerId,{price})} className={profile.price===price?"selected":""}>${price}</button>)}</div>
    </article>
    <article className="settings-card"><span className="settings-icon"><MapPin size={20}/></span><h4>Zona donde atiendes</h4><p>Elige una zona de prueba. No es una dirección de despacho real.</p>
     <label className="settings-select-label">Ubicación<select value={LOCATIONS.includes(profile.location)?profile.location:"other"} onChange={e=>{if(e.target.value!=="other")store.updateProfile(lawyerId,{location:e.target.value});}}>{LOCATIONS.map(l=><option value={l} key={l}>{l}</option>)}{!LOCATIONS.includes(profile.location)&&<option value="other">{profile.location}</option>}</select></label>
     <p className="settings-note">En atención exclusivamente virtual puedes indicar tu zona de cobertura, sin publicar domicilio personal.</p>
    </article>
    <article className="settings-card settings-security"><span className="settings-icon"><ShieldAlert size={20}/></span><h4>Estado profesional</h4><p>Perfil aprobado exclusivamente para realizar pruebas de interfaz.</p><div className="settings-safety"><ShieldAlert size={16}/> Sin identidad ni cédula verificadas ante la SEP</div><p className="settings-note">Los cambios solo duran hasta recargar la página. No modifican un perfil jurídico real.</p></article>
   </div>
 </section>;
}
