import {describe,expect,it} from "vitest";
import vets from "../../../../data/fixtures/veterinarians.synthetic.json";
import guardians from "../../../../data/fixtures/guardians.synthetic.json";
import pets from "../../../../data/fixtures/pets.synthetic.json";
import appointments from "../../../../data/fixtures/vet-appointments.synthetic.json";
describe("HuellaVet synthetic fixtures",()=>{
 it("includes 40 veterinarians, 100 guardians, 100 pets and 25 appointments",()=>{
  expect(vets.records).toHaveLength(40);
  expect(guardians.records).toHaveLength(100);
  expect(pets.records).toHaveLength(100);
  expect(appointments.records).toHaveLength(25);
 });
 it("keeps IDs unique and linked by correct foreign keys",()=>{
  const ids=[...vets.records,...guardians.records,...pets.records,...appointments.records].map(x=>x.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(pets.records.every(p=>guardians.records.some(g=>g.id===p.guardian_id))).toBe(true);
  expect(appointments.records.every(a=>vets.records.some(v=>v.id===a.lawyer_id) && guardians.records.some(g=>g.id===a.user_id)
   && pets.records.some(p=>p.id===a.pet_id&&p.guardian_id===a.user_id))).toBe(true);
 });
 it("contains no actual verified veterinarians, reviews, personal addresses or patient histories",()=>{
  expect(vets.records.every(v=>v.is_synthetic&&v.professional_license===null&&v.license_verified_at===null&&v.verification_status==="synthetic_unverified"&&v.rating===null&&v.public_profile_enabled===false)).toBe(true);
  expect(vets.records.every(v=>v.geo.synthetic&&v.geo.approximate&&v.geo.address===null)).toBe(true);
  expect(guardians.records.every(g=>g.email.endsWith("@example.test")&&g.phone===null)).toBe(true);
  expect(pets.records.every(p=>p.is_synthetic&&p.medical_history===null)).toBe(true);
 });
 it("only five have simulated booking enabled",()=>{
  const five=vets.records.filter(v=>v.demo_booking_enabled);
  expect(five).toHaveLength(5);
  expect(five.every(v=>v.demo_review.state==="approved_simulation"&&v.demo_review.source_verification_real===false)).toBe(true);
  expect(vets.records.filter(v=>!v.demo_booking_enabled).every(v=>v.demo_review.state==="not_reviewed")).toBe(true);
 });
 it("supports multiple species and six clinical specialties",()=>{
  expect(new Set(vets.records.flatMap(v=>v.specialties)).size).toBe(6);
  expect(new Set(vets.records.flatMap(v=>v.species_treated))).toEqual(new Set(["perros","gatos","aves","conejos"]));
 });
});
