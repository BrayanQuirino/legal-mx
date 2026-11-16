/** Categorías de atención veterinaria para explorar la POC; no equivalen a certificaciones clínicas. */
export const specialties=[
 {id:"medicina_general",name:"Medicina general",description:"Chequeos, bienestar y atención preventiva",icon:"stethoscope"},
 {id:"dermatologia",name:"Dermatología",description:"Piel, alergias y problemas de pelaje",icon:"heart-pulse"},
 {id:"cirugia",name:"Cirugía y procedimientos",description:"Valoración, procedimientos y recuperación",icon:"activity"},
 {id:"urgencias",name:"Urgencias veterinarias",description:"Orientación para atención veterinaria oportuna",icon:"siren"},
 {id:"odontologia",name:"Salud dental",description:"Revisión bucal y cuidado de dientes",icon:"smile"},
 {id:"animales_exoticos",name:"Animales no convencionales",description:"Atención a conejos, aves y pequeños animales",icon:"rabbit"}
] as const;
