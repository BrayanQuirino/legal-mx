/**
 * Catálogo de 14 áreas de atención veterinaria, ordenado alfabéticamente.
 * Denominaciones de servicios: NO implican certificación de especialidad.
 * Se mantienen los IDs legados de los seis grupos existentes para que los
 * perfiles sintéticos sigan funcionando sin inventar nuevas credenciales.
 */
export const specialties=[
 {id:"cardiologia",name:"Cardiología",description:"Evaluación y cuidado del corazón",icon:"heart-pulse"},
 {id:"cirugia",name:"Cirugía veterinaria",description:"Valoración y procedimientos quirúrgicos",icon:"activity"},
 {id:"dermatologia",name:"Dermatología",description:"Piel, alergias, oídos y pelaje",icon:"heart-pulse"},
 {id:"animales_exoticos",name:"Medicina de animales exóticos",description:"Atención a especies no convencionales",icon:"rabbit"},
 {id:"urgencias",name:"Medicina de urgencias y cuidados críticos",description:"Atención inmediata y cuidados intensivos",icon:"siren"},
 {id:"medicina_general",name:"Medicina general",description:"Consulta, chequeos y medicina preventiva",icon:"stethoscope"},
 {id:"medicina_interna",name:"Medicina interna",description:"Diagnóstico de enfermedades sistémicas",icon:"stethoscope"},
 {id:"neurologia",name:"Neurología",description:"Problemas del sistema nervioso",icon:"brain"},
 {id:"nutricion_clinica",name:"Nutrición clínica",description:"Alimentación terapéutica y manejo nutricional",icon:"apple"},
 {id:"odontologia",name:"Odontología",description:"Dientes, encías y salud bucal",icon:"smile"},
 {id:"oftalmologia",name:"Oftalmología",description:"Ojos, visión y sus enfermedades",icon:"eye"},
 {id:"oncologia",name:"Oncología",description:"Diagnóstico y tratamiento del cáncer",icon:"heart-pulse"},
 {id:"reproduccion_obstetricia",name:"Reproducción y obstetricia",description:"Salud reproductiva, gestación y parto",icon:"heart"},
 {id:"traumatologia_ortopedia",name:"Traumatología y ortopedia",description:"Huesos, articulaciones y lesiones",icon:"bone"}
] as const;
