/** Contratos futuros. No representan registros ni disponibilidad reales. */
export type Jurisdiction = "CDMX" | "EDOMEX";
export interface LegalSource { id: string; title: string; jurisdiction: Jurisdiction; officialUrl: string; verifiedAt: string | null; effectiveFrom?: string; status: "pending" | "verified" | "outdated"; }
export interface LegalAssistantAnswer { answer: string; jurisdiction: Jurisdiction; citations: Array<{ sourceId: string; article?: string; url: string }>; requiresProfessionalReview: boolean; }
export interface LawyerProfile { id: string; fullName: string; professionalLicense: string; specialties: string[]; jurisdiction: Jurisdiction[]; verified: boolean; }
