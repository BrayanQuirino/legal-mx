import { specialties } from "../data/specialties";

/** Normalize searches without requiring users to know formal legal terminology. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** These aliases are navigation hints, not a legal diagnosis or legal advice. */
const aliases: Record<string, readonly string[]> = {
  familiar: ["divorcio", "separacion", "pension alimenticia", "alimentos", "custodia", "guarda", "hijos", "visitas", "herencia familiar"],
  laboral: ["despido", "me despidieron", "me corrieron", "finiquito", "liquidacion", "salario", "sueldo", "empleo", "jefe", "aguinaldo", "trabajo", "renuncia"],
  civil: ["deuda", "me deben", "contrato", "inquilino", "renta", "arrendamiento", "danos", "responsabilidad civil"],
  penal: ["denuncia", "robo", "fraude", "amenazas", "delito", "carcel", "violencia", "acusacion", "detencion"],
  inmobiliario: ["casa", "terreno", "escritura", "propiedad", "compraventa", "departamento", "predio", "hipoteca"],
  mercantil: ["empresa", "negocio", "sociedad", "factura", "pagare", "cobranza", "comercio", "proveedor"],
};

export function matchSpecialties(query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return [...specialties];
  const stopWords = new Set(["con", "por", "para", "los", "las", "una", "uno", "que", "del", "mis", "tengo", "problemas", "problema", "necesito"]);
  const terms = normalized.split(" ").filter(t => t.length > 2 && !stopWords.has(t));
  return specialties.map((specialty) => {
    const termsToSearch = [specialty.name, specialty.description, ...(aliases[specialty.id] ?? [])].map(normalizeSearch);
    const wholePhrase = termsToSearch.some(t => t.includes(normalized) || normalized.includes(t));
    const matches = terms.filter(term => termsToSearch.some(t => t.split(" ").some(word => word.startsWith(term)) || t.includes(term))).length;
    return { specialty, score: wholePhrase ? matches + 5 : matches };
  }).filter(result => result.score > 0).sort((a,b) => b.score-a.score).map(({ specialty }) => specialty);
}
