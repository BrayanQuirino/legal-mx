import { describe, expect, it } from "vitest";
import lawyers from "../../../../data/fixtures/lawyers.synthetic.json";
import users from "../../../../data/fixtures/users.synthetic.json";
import appointments from "../../../../data/fixtures/appointments.synthetic.json";
import {demoLawyers,makeDemoSlots,calendarCandidates,DAY_HOURS,upcomingWeekStart,weekDates,weekdayUtc} from "./scheduling";

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
 it("produces a complete seven-day, 24-hour calendar including nonworking hours",()=>{
   expect(DAY_HOURS).toHaveLength(24);
   expect(DAY_HOURS[3]).toBe("03:00");
   expect(weekDates(upcomingWeekStart())).toHaveLength(7);
   expect(weekdayUtc(weekDates(upcomingWeekStart())[0])).toBe(1);
   expect(weekdayUtc(weekDates(upcomingWeekStart())[6])).toBe(0);
   const candidates=calendarCandidates(7);
   expect(candidates).toHaveLength(7*24);
   expect(new Set(candidates.map(c=>c.key)).size).toBe(168);
 });
 it("does not imply verification or real appointments",()=>{
  expect(appointments.synthetic).toBe(true);
  expect(demoLawyers.every(l=>l.verification_status==="synthetic_unverified"&&l.professional_license===null)).toBe(true);
 });
});
