import {describe,expect,it} from "vitest";
import vets from "../../../../data/fixtures/veterinarians.synthetic.json";
import appointments from "../../../../data/fixtures/vet-appointments.synthetic.json";
import {demoLawyers,makeDemoSlots,calendarCandidates,DAY_HOURS,upcomingWeekStart,nextFutureWeekStart,weekDates,weekdayUtc} from "./scheduling";
describe("veterinary calendar fixtures",()=>{
 it("links five different pets to each of five demo veterinarians",()=>{
  expect(demoLawyers).toHaveLength(5);
  expect(appointments.records).toHaveLength(25);
  for(const vet of demoLawyers){
   const list=appointments.records.filter(a=>a.lawyer_id===vet.id);
   expect(list).toHaveLength(5);
   expect(new Set(list.map(a=>a.pet_id)).size).toBe(5);
   expect(list.every(a=>vet.consultation_modes.includes(a.modality))).toBe(true);
   expect(list.every(a=>makeDemoSlots(vet)[a.slot_index]!==undefined)).toBe(true);
  }
 });
 it("offers 24 hourly rows and 7 day columns",()=>{
  expect(DAY_HOURS).toHaveLength(24);
  expect(calendarCandidates(7)).toHaveLength(168);
  expect(weekDates(upcomingWeekStart())).toHaveLength(7);
  expect(weekdayUtc(weekDates(upcomingWeekStart())[0])).toBe(1);
 });
 it("opens at the next full week and keeps previous dates consultable",()=>{
  expect(nextFutureWeekStart("2026-11-15")).toBe("2026-11-16");
  expect(nextFutureWeekStart("2026-11-16")).toBe("2026-11-23");
 });
 it("never displays real clinical accreditation",()=>{
  expect(demoLawyers.every(v=>v.professional_license===null&&v.verification_status==="synthetic_unverified")).toBe(true);
  expect(vets.synthetic&&appointments.synthetic).toBe(true);
 });
});
