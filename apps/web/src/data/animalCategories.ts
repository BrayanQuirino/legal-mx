/**
 * Catálogo progresivo de HuellaVet: 10 categorías preparadas, 8 visibles
 * para animales de compañía. Los IDs de especie de cada perfil NO se infieren:
 * una categoría solo devuelve registros que declaren una especie comprendida.
 * Equinos y animales de granja permanecen preparados para una segunda etapa.
 */
export const animalCategories=[
  {id:"anfibios",name:"Anfibios",visible:true,species:["anfibios","ajolotes","ranas","salamandras"]},
  {id:"animales_granja",name:"Animales de granja",visible:false,species:["bovinos","porcinos","ovinos","caprinos","gallinas_de_granja"]},
  {id:"aves",name:"Aves",visible:true,species:["aves","periquitos","loros","canarios","cacatuas"]},
  {id:"conejos",name:"Conejos",visible:true,species:["conejos"]},
  {id:"equinos",name:"Equinos",visible:false,species:["caballos","burros","ponis"]},
  {id:"gatos",name:"Gatos",visible:true,species:["gatos"]},
  {id:"peces",name:"Peces",visible:true,species:["peces"]},
  {id:"pequenos_mamiferos",name:"Pequeños mamíferos",visible:true,species:["hamsteres","cuyos","cobayas","ratas","ratones","chinchillas","hurones"]},
  {id:"perros",name:"Perros",visible:true,species:["perros"]},
  {id:"reptiles",name:"Reptiles",visible:true,species:["reptiles","tortugas","serpientes","iguanas","geckos","lagartos"]}
] as const;

export const companionAnimalCategories=animalCategories.filter(category=>category.visible);

/** A filter may yield zero matches until real/synthetic profiles explicitly declare the species. */
export function treatsAnimalCategory(declaredSpecies:readonly string[],categoryId:string):boolean {
  if(categoryId==="all")return true;
  const category=animalCategories.find(item=>item.id===categoryId);
  return Boolean(category&&declaredSpecies.some(species=>category.species.some(value=>value===species)));
}
