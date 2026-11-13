import { describe, expect, it } from "vitest";
import lawyers from "../../../../data/fixtures/lawyers.synthetic.json";
import users from "../../../../data/fixtures/users.synthetic.json";
import appointments from "../../../../data/fixtures/appointments.synthetic.json";
import {demoLawyers,makeDemoSlots} from "./scheduling";

describe("connected synthetic booking fixtures",()=>{
 it("preloads exactly five distinct clients for each of five demo lawyers",()=>{
  expect(appointments.records).toHaveLength(25);
  expect(new Set(appointments.records.map(a=>a.user_id)).size).toBe(25);
  expect(new Set(appointments.records.map(a=>a.id)).size).toBe(25);
  expect(demoLawyers).toHaveLength(5);
  for(const lawyer of demoLawyers){
    const assigned=appointments.records.filter(a=>a.lawyer_id===lawyer.id);
    expect(assigned).toHaveLength(5);
    expect(new Set(assigned.map(a=>a.slot_index)).size).toBe(5);
    expect(assigned.every(a=>lawyer.consultation_modes.includes(a.modality))).toBe(true);
    expect(assigned.every(a=>makeDemoSlots(lawyer)[a.slot_index]!==undefined)).toBe(true);
  }
  expect(appointments.records.every(a=>a.synthetic&&users.records.some(u=>u.id===a.user_id)&&lawyers.records.some(l=>l.id===a.lawyer_id))).toBe(true);
 });
 it("does not imply verification or real appointments",()=>{
  expect(appointments.synthetic).toBe(true);
  expect(demoLawyers.every(l=>l.verification_status==="synthetic_unverified"&&l.professional_license===null)).toBe(true);
 });
});
