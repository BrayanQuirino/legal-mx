import { specialties } from "../data/specialties";
export function normalizeSearch(value:string):string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9ñ\s]/g," ").replace(/\s+/g," ").trim();
}
const aliases:Record<string,string[]>={
 medicina_general:["vacuna","vacunacion","desparasitacion","chequeo","consulta","cachorro","revision","bienestar","prevencion","veterinario"],
 dermatologia:["comezon","picazon","piel","alergia","pulgas","dermatitis","pelaje","otitis"],
 cirugia:["operacion","esterilizacion","castracion","cirugia","hernia","procedimiento"],
 urgencias:["urgencia","emergencia","accidente","herida","intoxicacion","vomito","diarrea","sangrado","no respira"],
 odontologia:["dientes","dentadura","limpieza dental","mal aliento","encias","colmillos"],
 animales_exoticos:["conejo","ave","loro","cobaya","hamster","reptil","exotico"]
};
export function matchSpecialties(query:string){
 const q=normalizeSearch(query);
 if(!q)return [...specialties];
 const words=q.split(" ").filter(s=>s.length>=3&&!["para","con","que","tengo","quiero","necesito","estoy"].includes(s));
 return specialties.map(item=>{
   const terms=[item.name,item.description,...(aliases[item.id]??[])].map(normalizeSearch);
   const score=terms.some(term=>term.includes(q)||q.includes(term))?10:words.filter(word=>terms.some(term=>term.includes(word))).length;
   return {item,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.item);
}
